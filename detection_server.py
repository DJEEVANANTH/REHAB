import os
from flask import Flask, render_template_string, Response, request, jsonify
from flask_cors import CORS
import cv2
import json
import numpy as np
import mediapipe as mp
mp_pose_module = mp.solutions.pose
mp_hands_module = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
pose = mp_pose_module.Pose()
hands = mp_hands_module.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
import pyttsx3
import time
import threading
import sqlite3

app = Flask(__name__)
# Enable CORS for frontend compatibility
CORS(app)

# mp_draw already imported from mediapipe.solutions.drawing_utils

# --- VOICE FEEDBACK ENGINES ---
last_spoken_time = 0
COOLDOWN_SECONDS = 3.5

def speak_worker(text):
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Speech engine error: {e}")

def speak(text):
    global last_spoken_time
    current_time = time.time()
    if current_time - last_spoken_time > COOLDOWN_SECONDS:
        last_spoken_time = current_time
        threading.Thread(target=speak_worker, args=(text,), daemon=True).start()

# --- DATABASE SETUP ---
try:
    conn = sqlite3.connect("history.db", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history(
        workout TEXT,
        reps INTEGER,
        calories REAL
    )
    """)
    conn.commit()
except Exception as e:
    print(f"Database setup error: {e}")

# --- WORKOUT METADATA WITH IMAGES AND YOUTUBE REFS ---
db_path = os.path.join(os.path.dirname(__file__), "exercises_db.json")
try:
    with open(db_path, "r") as f:
        WORKOUT_DETAILS = json.load(f)
except Exception as e:
    print(f"Error loading exercises_db.json: {e}")
    WORKOUT_DETAILS = {}

REACT_TO_PY_WORKOUT = {}
for ex_id in WORKOUT_DETAILS.keys():
    REACT_TO_PY_WORKOUT[ex_id] = ex_id

# --- GLOBAL VARIABLES WITH THREAD SAFENESS ---
state_lock = threading.Lock()

selected_workout = "pushup"
counter = 0
target_input = 12
target_sets = 3
current_set = 1
plank_time_left = 0
last_timer_update = 0
completed = False
stage = 0  # 0: Standing/Start, 1: Action/Descending, 2: Complete
start_time = time.time()
is_active = False
last_rep_time = 0
warning_msg = None
sub_stage = 0
hold_start_time = 0.0

# Lazy-loaded camera object to handle process startups and release/reload cycles nicely
cap = None

def get_cap():
    global cap
    if cap is None:
        try:
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                print("⚠️ Warning: OpenCV could not open VideoCapture(0).")
        except Exception as e:
            print(f"Error accessing webcam: {e}")
    return cap

def angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    ang = np.abs(radians * 180 / np.pi)
    if ang > 180:
        ang = 360 - ang
    return ang

def generate_frames():
    global counter, stage, completed, selected_workout, plank_time_left, last_timer_update, current_set, is_active, cap, last_rep_time, warning_msg, sub_stage, hold_start_time

    while True:
        if not is_active:
            standby_img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(standby_img, "AI Detection - Standby", (150, 220), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 100), 2)
            cv2.putText(standby_img, "Waiting for Start command...", (160, 260), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
            ret, buffer = cv2.imencode(".jpg", standby_img)
            yield (b'--frame\r\n'
                   b'Content-Type:image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.3)
            continue

        camera = get_cap()
        if camera is None or not camera.isOpened():
            err_img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(err_img, "Webcam busy or not found!", (160, 220), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.putText(err_img, "Please release camera or check hardware.", (110, 260), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
            ret, buffer = cv2.imencode(".jpg", err_img)
            yield (b'--frame\r\n'
                   b'Content-Type:image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.5)
            continue

        success, frame = camera.read()
        if not success:
            time.sleep(0.05)
            continue

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        try:
            ex_num = int(selected_workout.split('-')[1])
        except:
            ex_num = 14
            
        results_pose = None
        results_hands = None
        
        if ex_num <= 13:
            results_hands = hands.process(image)
        else:
            results_pose = pose.process(image)
            
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        correct = False
        current_loop_time = time.time()
        current_warning = None

        with state_lock:
            if is_active:
                try:
                    if ex_num <= 13 and results_hands and results_hands.multi_hand_landmarks:
                        # HAND TRACKING TIER
                        correct = True
                        current_warning = None
                        
                        hand_landmarks = results_hands.multi_hand_landmarks[0]
                        lm = hand_landmarks.landmark
                        
                        wrist = np.array([lm[0].x, lm[0].y])
                        index_tip = np.array([lm[8].x, lm[8].y])
                        middle_tip = np.array([lm[12].x, lm[12].y])
                        ring_tip = np.array([lm[16].x, lm[16].y])
                        pinky_tip = np.array([lm[20].x, lm[20].y])
                        thumb_tip = np.array([lm[4].x, lm[4].y])
                        
                        def calc_dist(pt1, pt2):
                            return np.linalg.norm(pt1 - pt2)
                            
                        # Palm length for dynamic normalization
                        index_mcp = np.array([lm[5].x, lm[5].y])
                        palm_length = calc_dist(wrist, index_mcp)
                        
                        if palm_length > 0.01:
                            if ex_num == 3: # Finger Spreading
                                # Horizontal dist approx between adjacent fingers
                                d1 = calc_dist(index_tip, middle_tip) / palm_length
                                d2 = calc_dist(middle_tip, ring_tip) / palm_length
                                d3 = calc_dist(ring_tip, pinky_tip) / palm_length
                                if stage == 0:
                                    if d1 > 0.4 and d2 > 0.4 and d3 > 0.4:
                                        stage = 1
                                elif stage == 1:
                                    if d1 < 0.2 and d2 < 0.2 and d3 < 0.2:
                                        if current_loop_time - last_rep_time > 0.5:
                                            counter += 1
                                            last_rep_time = current_loop_time
                                            stage = 0
                            
                            elif ex_num == 5: # Thumb Touch Each Finger (O-Touches)
                                dt_index = calc_dist(thumb_tip, index_tip) / palm_length
                                dt_middle = calc_dist(thumb_tip, middle_tip) / palm_length
                                dt_ring = calc_dist(thumb_tip, ring_tip) / palm_length
                                dt_pinky = calc_dist(thumb_tip, pinky_tip) / palm_length
                                
                                touch_thresh = 0.25
                                if sub_stage == 0 and dt_index < touch_thresh:
                                    sub_stage = 1
                                elif sub_stage == 1 and dt_middle < touch_thresh:
                                    sub_stage = 2
                                elif sub_stage == 2 and dt_ring < touch_thresh:
                                    sub_stage = 3
                                elif sub_stage == 3 and dt_pinky < touch_thresh:
                                    sub_stage = 4
                                elif sub_stage == 4 and dt_index > 0.8: # Hand fully opened again
                                    if current_loop_time - last_rep_time > 0.5:
                                        counter += 1
                                        last_rep_time = current_loop_time
                                        sub_stage = 0
                                        
                            elif ex_num == 9: # Finger Squeezing (Fist)
                                avg_wrist_dist = (calc_dist(wrist, index_tip) + calc_dist(wrist, middle_tip) + calc_dist(wrist, ring_tip) + calc_dist(wrist, pinky_tip)) / 4.0
                                ratio = avg_wrist_dist / palm_length
                                if stage == 0:
                                    if ratio < 0.8: # Balled up
                                        stage = 1
                                        hold_start_time = current_loop_time
                                elif stage == 1:
                                    if ratio > 1.8: # Opened
                                        if current_loop_time - hold_start_time >= 1.0: # Held for 1 sec
                                            if current_loop_time - last_rep_time > 0.5:
                                                counter += 1
                                                last_rep_time = current_loop_time
                                        stage = 0
                                        
                            elif ex_num == 10: # Finger Curl (Claw Stretch)
                                # Distance to corresponding MCPs
                                middle_mcp = np.array([lm[9].x, lm[9].y])
                                ring_mcp = np.array([lm[13].x, lm[13].y])
                                pinky_mcp = np.array([lm[17].x, lm[17].y])
                                
                                avg_mcp_dist = (calc_dist(index_tip, index_mcp) + calc_dist(middle_tip, middle_mcp) + calc_dist(ring_tip, ring_mcp) + calc_dist(pinky_tip, pinky_mcp)) / 4.0
                                ratio = avg_mcp_dist / palm_length
                                if stage == 0:
                                    if ratio < 0.6: # Clawed
                                        stage = 1
                                elif stage == 1:
                                    if ratio > 1.5: # Straight
                                        if current_loop_time - last_rep_time > 0.5:
                                            counter += 1
                                            last_rep_time = current_loop_time
                                            stage = 0
                                            
                            elif ex_num == 8: # Finger Pinch
                                pinch_dist = calc_dist(thumb_tip, index_tip) / palm_length
                                if stage == 0:
                                    if pinch_dist < 0.15: # Pinched
                                        stage = 1
                                        hold_start_time = current_loop_time
                                elif stage == 1:
                                    if pinch_dist > 0.6: # Opened
                                        if current_loop_time - hold_start_time >= 2.0: # Held 2 secs
                                            if current_loop_time - last_rep_time > 0.5:
                                                counter += 1
                                                last_rep_time = current_loop_time
                                        stage = 0
                                        
                            elif ex_num == 4: # Finger Tapping
                                # Y-axis variation
                                y_tips = [index_tip[1], middle_tip[1], ring_tip[1], pinky_tip[1]]
                                if stage == 0:
                                    # Detect significant lift relative to palm length
                                    # Since Y goes down, a smaller Y means lifted.
                                    y_mcp = [lm[5].y, lm[9].y, lm[13].y, lm[17].y]
                                    for i in range(4):
                                        if (y_mcp[i] - y_tips[i]) / palm_length > 0.8:
                                            stage = 1
                                            break
                                elif stage == 1:
                                    # All returned down
                                    y_mcp = [lm[5].y, lm[9].y, lm[13].y, lm[17].y]
                                    all_down = True
                                    for i in range(4):
                                        if (y_mcp[i] - y_tips[i]) / palm_length > 0.5:
                                            all_down = False
                                    if all_down:
                                        if current_loop_time - last_rep_time > 0.3:
                                            counter += 1
                                            last_rep_time = current_loop_time
                                            stage = 0
                                            
                            elif ex_num == 6: # Finger Lifts
                                y_tips = [index_tip[1], middle_tip[1], ring_tip[1], pinky_tip[1]]
                                y_mcp = [lm[5].y, lm[9].y, lm[13].y, lm[17].y]
                                if stage == 0:
                                    for i in range(4):
                                        if (y_mcp[i] - y_tips[i]) / palm_length > 1.2: # significantly lifted
                                            stage = 1
                                            hold_start_time = current_loop_time
                                            break
                                elif stage == 1:
                                    all_down = True
                                    for i in range(4):
                                        if (y_mcp[i] - y_tips[i]) / palm_length > 0.6:
                                            all_down = False
                                    if all_down:
                                        if current_loop_time - hold_start_time >= 2.0:
                                            if current_loop_time - last_rep_time > 0.5:
                                                counter += 1
                                                last_rep_time = current_loop_time
                                        stage = 0
                                        
                            elif ex_num == 7: # Finger Walking
                                # Alternate X-movement
                                if stage == 0:
                                    if abs(index_tip[0] - index_mcp[0]) / palm_length > 0.6:
                                        stage = 1
                                elif stage == 1:
                                    if abs(middle_tip[0] - lm[9].x) / palm_length > 0.6:
                                        stage = 2
                                elif stage == 2:
                                    if current_loop_time - last_rep_time > 0.5:
                                        counter += 1
                                        last_rep_time = current_loop_time
                                        stage = 0
                            
                            else: # Generic Open/Close for others
                                avg_tip_dist = (calc_dist(wrist, index_tip) + calc_dist(wrist, middle_tip) + calc_dist(wrist, pinky_tip)) / 3.0
                                open_ratio = avg_tip_dist / palm_length
                                if stage == 0:
                                    if open_ratio > 1.8:
                                        stage = 1
                                elif stage == 1:
                                    if open_ratio < 1.4:
                                        if current_loop_time - last_rep_time > 0.8:
                                            counter += 1
                                            last_rep_time = current_loop_time
                                            stage = 0
                            
                        # Completion
                        if counter >= target_input:
                            if current_set >= target_sets:
                                completed = True
                                is_active = False
                            else:
                                current_set += 1
                                counter = 0
                                
                        for hand_lms in results_hands.multi_hand_landmarks:
                            mp_draw.draw_landmarks(image, hand_lms, mp_hands_module.HAND_CONNECTIONS)
                            
                    elif ex_num > 13 and results_pose and results_pose.pose_landmarks:
                        lm = results_pose.pose_landmarks.landmark
                        
                        # Helper to get specific joint coordinates
                        def get_pt(idx): return [lm[idx].x * w, lm[idx].y * h]
                        def is_vis(idx, th=0.65): return lm[idx].visibility > th
                        def dist(a, b): return np.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)

                        # Check category based on exercise ID
                        try:
                            ex_num = int(selected_workout.split('-')[1])
                        except:
                            ex_num = 1
                            
                        # Default is safe
                        correct = False
                        
                        # --- TIER 1: STRICT BIOMECHANICAL STATE MACHINES ---
                        if selected_workout == "ex-01": # Squat
                            # Require Hips(23/24), Knees(25/26), Ankles(27/28)
                            if (is_vis(23) or is_vis(24)) and (is_vis(25) or is_vis(26)):
                                correct = True
                                # Calculate Angle (Hip, Knee, Ankle)
                                hip = get_pt(23) if is_vis(23) else get_pt(24)
                                knee = get_pt(25) if is_vis(25) else get_pt(26)
                                ankle = get_pt(27) if is_vis(27) else get_pt(28)
                                
                                ang = angle(hip, knee, ankle)
                                
                                # State Machine
                                if stage == 0 and ang > 160:
                                    pass # Ready
                                elif stage == 0 and ang < 90:
                                    stage = 1 # Squatted down
                                elif stage == 1 and ang > 160:
                                    if current_loop_time - last_rep_time > 1.5:
                                        counter += 1
                                        last_rep_time = current_loop_time
                                        stage = 0

                        elif selected_workout == "ex-08": # Pushup
                            if (is_vis(11) or is_vis(12)) and (is_vis(13) or is_vis(14)) and (is_vis(15) or is_vis(16)):
                                correct = True
                                shoulder = get_pt(11) if is_vis(11) else get_pt(12)
                                elbow = get_pt(13) if is_vis(13) else get_pt(14)
                                wrist = get_pt(15) if is_vis(15) else get_pt(16)
                                
                                ang = angle(shoulder, elbow, wrist)
                                if stage == 0 and ang > 150:
                                    pass # Up
                                elif stage == 0 and ang < 90:
                                    stage = 1 # Down
                                elif stage == 1 and ang > 150:
                                    if current_loop_time - last_rep_time > 1.5:
                                        counter += 1
                                        last_rep_time = current_loop_time
                                        stage = 0
                                        
                        elif selected_workout == "ex-02": # Lunges
                            if (is_vis(23) or is_vis(24)) and (is_vis(25) or is_vis(26)) and (is_vis(27) or is_vis(28)):
                                correct = True
                                hip = get_pt(23) if is_vis(23) else get_pt(24)
                                knee = get_pt(25) if is_vis(25) else get_pt(26)
                                ankle = get_pt(27) if is_vis(27) else get_pt(28)
                                
                                ang = angle(hip, knee, ankle)
                                if stage == 0 and ang > 160:
                                    pass # Standing
                                elif stage == 0 and ang < 100:
                                    stage = 1 # Lunging
                                elif stage == 1 and ang > 150:
                                    if current_loop_time - last_rep_time > 1.5:
                                        counter += 1
                                        last_rep_time = current_loop_time
                                        stage = 0

                        # --- TIER 2: GENERIC MOVEMENT (Other Strength Exercises 1-25) ---
                        elif ex_num > 13 and ex_num <= 38: # Using shifted ID for 25 strengthening
                            # Verify upper body or lower body is moving
                            if is_vis(15) or is_vis(16) or is_vis(27) or is_vis(28):
                                correct = True
                                # Wrist/Ankle variance state machine
                                if stage == 0:
                                    # Wait for 1.5s between generic reps
                                    if current_loop_time - last_rep_time > 1.5:
                                        stage = 1
                                elif stage == 1:
                                    counter += 1
                                    last_rep_time = current_loop_time
                                    stage = 0
                                    
                        # --- TIER 3: STATIC HOLD (Stretches & Balance 26-100) ---
                        else:
                            # Just ensure shoulders/hips are in frame for static holds
                            if is_vis(11) or is_vis(12) or is_vis(23) or is_vis(24):
                                correct = True
                                if last_timer_update == 0:
                                    last_timer_update = current_loop_time
                                elapsed_tick = current_loop_time - last_timer_update
                                if elapsed_tick >= 1.0:
                                    plank_time_left -= int(elapsed_tick)
                                    last_timer_update = current_loop_time
                            else:
                                last_timer_update = current_loop_time

                        # Completion Logic for Strength vs Static
                        if ex_num > 13 and ex_num <= 38:
                            if counter >= target_input:
                                if current_set >= target_sets:
                                    completed = True
                                    is_active = False
                                else:
                                    current_set += 1
                                    counter = 0
                        elif ex_num > 38:
                            if plank_time_left <= 0:
                                if not completed:
                                    completed = True
                                    is_active = False

                        color = (34, 197, 94) if correct else (68, 68, 239)
                        mp_draw.draw_landmarks(
                            image, results_pose.pose_landmarks, mp_pose_module.POSE_CONNECTIONS,
                            mp_draw.DrawingSpec(color=color, thickness=3, circle_radius=3),
                            mp_draw.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2)
                        )
                        
                        if not correct:
                            current_warning = "Please step into the camera frame."
                            
                    else:
                        if ex_num <= 13:
                            current_warning = "Please keep hands in the camera frame."
                        else:
                            current_warning = "Please step into the camera frame."
                            
                    warning_msg = current_warning
                except Exception as ex:
                    print(f"Estimation processing error: {ex}")

        ret, buffer = cv2.imencode(".jpg", image)
        yield (b'--frame\r\n'
               b'Content-Type:image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route("/api/state")
def get_state():
    global counter, plank_time_left, current_set, selected_workout, target_input, target_sets, completed, start_time, is_active
    with state_lock:
        if selected_workout == "plank":
            progress_str = f"{max(0, plank_time_left)}s"
            cals = round((target_input - max(0, plank_time_left)) * 0.15, 1)
        else:
            progress_str = f"{counter} / {target_input}"
            cals = round((counter + ((current_set - 1) * target_input)) * 0.4, 1)
            
        return jsonify({
            "counter": counter,
            "set_str": f"{current_set} / {target_sets}",
            "progress_str": progress_str,
            "calories": cals,
            "time_elapsed": int(time.time() - start_time) if is_active else 0,
            "completed": completed,
            "workout": selected_workout,
            "is_active": is_active,
            "warning": warning_msg
        })

@app.route("/api/control", methods=["POST"])
def control_workout():
    global is_active, start_time, counter, current_set, completed, plank_time_left, target_input, target_sets, last_timer_update, selected_workout, stage, cap, last_rep_time, sub_stage, hold_start_time
    
    req_json = request.json or {}
    action = req_json.get("action")
    
    with state_lock:
        if action == "start":
            # Map React workout ID to python key if present
            workout_id = req_json.get("workout")
            if workout_id:
                selected_workout = REACT_TO_PY_WORKOUT.get(workout_id, selected_workout)
            
            # Read configuration
            target = req_json.get("target")
            sets = req_json.get("sets")
            if target is not None:
                target_input = int(target)
            if sets is not None:
                target_sets = int(sets)

            is_active = True
            completed = False
            stage = 0
            sub_stage = 0
            hold_start_time = 0.0
            start_time = time.time()
            last_rep_time = time.time()
            # Initialize timer for all exercises since we use Universal Timer
            plank_time_left = target_input
            last_timer_update = 0
            
            counter = 0
            current_set = 1
            speak(f"Starting {WORKOUT_DETAILS.get(selected_workout, {}).get('name', selected_workout)}.")
            
        elif action == "stop":
            is_active = False
            if cap is not None:
                try:
                    cap.release()
                except Exception:
                    pass
                cap = None
            
        elif action == "reset":
            counter = 0
            current_set = 1
            completed = False
            is_active = False
            stage = 0
            sub_stage = 0
            hold_start_time = 0.0
            last_rep_time = time.time()
            if selected_workout == "plank":
                plank_time_left = target_input
            if cap is not None:
                try:
                    cap.release()
                except Exception:
                    pass
                cap = None
                
    return jsonify({"status": "success", "workout": selected_workout, "is_active": is_active})

@app.route("/", methods=["GET", "POST"])
def home():
    global selected_workout, target_input, target_sets, counter, stage, start_time, completed, plank_time_left, last_timer_update, current_set, is_active, last_rep_time

    if request.method == "POST":
        with state_lock:
            selected_workout = request.form.get("workout", "pushup")
            target_input = int(request.form.get("target", 12))
            target_sets = int(request.form.get("sets", 3))
            counter = 0
            current_set = 1
            stage = 0
            last_rep_time = time.time()
            completed = False
            is_active = False
            # Initialize timer for all exercises
            plank_time_left = target_input
            last_timer_update = 0

    current_meta = WORKOUT_DETAILS.get(selected_workout, WORKOUT_DETAILS["pushup"])

    dashboard_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Gym Coach - Ultimate Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-[#F8FAFC] font-sans text-slate-800 antialiased min-h-screen flex">

        <div id="workoutModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center hidden">
            <div class="bg-white rounded-3xl max-w-5xl w-full p-8 max-h-[85vh] overflow-y-auto shadow-2xl m-4">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-black text-slate-900">Select Workout Engine</h2>
                        <p class="text-sm text-slate-400">Choose from 10 dynamic computer-vision optimized exercises.</p>
                    </div>
                    <button onclick="toggleModal(false)" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {% for key, val in all_workouts.items() %}
                    <div class="border {% if key == active_key %}border-emerald-500 bg-emerald-50/30{% else %}border-slate-200 bg-white{% endif %} rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <span class="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{{ val.level }}</span>
                                <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                    {{ loop.index }}
                                </div>
                            </div>
                            <h4 class="font-black text-slate-900 text-base mb-0.5">{{ val.name }}</h4>
                            <p class="text-xs text-rose-600 font-semibold mb-3 flex items-center gap-1">
                                <i class="fa-solid fa-bullseye text-[10px]"></i> {{ val.muscle }}
                            </p>
                        </div>
                        <form method="POST" class="mt-2">
                            <input type="hidden" name="workout" value="{{ key }}">
                            <input type="hidden" name="target" value="{{ val.default_reps }}">
                            <input type="hidden" name="sets" value="{{ val.default_sets }}">
                            <button type="submit" class="w-full text-center text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition bg-white text-slate-700 hover:bg-slate-50">
                                Launch Detection
                            </button>
                        </form>
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>

        <aside class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 shrink-0">
            <div>
                <div class="flex items-center gap-3 mb-8">
                    <div class="bg-emerald-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-100">
                        <i class="fa-solid fa-child-reaching text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-md font-black tracking-tight uppercase text-slate-900 leading-none mb-1">AI GYM COACH</h2>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Smart Fitness. Smarter You.</p>
                    </div>
                </div>

                <nav class="space-y-1">
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-house w-5"></i> Home
                    </a>
                    <button onclick="toggleModal(true)" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-xl transition">
                        <span class="flex items-center gap-3"><i class="fa-solid fa-video w-5"></i> AI Detection</span>
                        <i class="fa-solid fa-chevron-right text-xs opacity-60"></i>
                    </button>
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-heart w-5"></i> Favorites
                    </a>
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-calendar-days w-5"></i> Schedule
                    </a>
                    <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                        <i class="fa-solid fa-chart-line w-5"></i> Progress
                    </a>
                </nav>
            </div>
            <div class="space-y-4">
                <a href="#" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition">
                    <i class="fa-solid fa-gear w-5"></i> Settings
                </a>
                <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-2xl shadow-sm relative overflow-hidden">
                    <h4 class="text-sm font-bold text-emerald-900 mb-1">Stay Consistent</h4>
                    <p class="text-xs text-emerald-700 mb-3 leading-relaxed">Track your progress and achieve your fitness goals with AI support.</p>
                    <button onclick="toggleModal(true)" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition">
                        Switch Routine
                    </button>
                </div>
            </div>
        </aside>

        <main class="flex-1 flex flex-col min-w-0">
            <header class="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-4">
                    <button onclick="toggleModal(true)" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                        <i class="fa-solid fa-arrow-left text-[10px]"></i> Change Exercise
                    </button>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        {{ meta.name }} <span class="text-xl">💪</span>
                    </h1>
                    <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> AI Detection Mode
                    </span>
                </div>
            </header>

            <div class="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">
                
                <div class="col-span-8 flex flex-col gap-6">
                    <div class="bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-video relative border border-slate-200/60">
                        <img src="/video" class="w-full h-full object-cover" alt="Live Processing Feed">
                    </div>

                    <div class="grid grid-cols-5 gap-4">
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div class="text-emerald-500 font-black text-3xl mb-0.5">92%</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Form Score</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudCalories" class="text-orange-500 font-black text-3xl mb-0.5">0</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calories</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudSets" class="text-blue-500 font-black text-3xl mb-0.5">1 / {{ target_sets }}</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sets Done</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudProgress" class="text-yellow-500 font-black text-3xl mb-0.5">0 / {{ target_input }}</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                            <div id="hudTimer" class="text-indigo-500 font-black text-3xl mb-0.5">00:00</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Elapsed</div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center justify-between">
                        <div class="flex gap-3">
                            <button onclick="controlWorkout('start')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition">Start</button>
                            <button onclick="controlWorkout('stop')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition">Stop</button>
                            <button onclick="controlWorkout('reset')" class="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition">Reset</button>
                        </div>
                    </div>
                </div>

                <div class="col-span-4 flex flex-col gap-6">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider">Exercise Details</h3>
                            <span class="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{{ meta.level }}</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-xs pb-1 border-b border-slate-50">
                                <span class="text-slate-400 font-medium">Target Muscle Group:</span>
                                <span class="font-bold text-slate-700">{{ meta.muscle }}</span>
                            </div>
                        </div>

                        <div class="bg-slate-100 rounded-2xl aspect-video mb-4 border border-slate-200 overflow-hidden relative shadow-sm">
                            <img src="{{ meta.image_url }}" alt="{{ meta.name }} reference form" class="w-full h-full object-cover">
                            <div class="absolute bottom-2 left-3 bg-slate-900/70 px-2 py-1 rounded text-[10px] text-white font-bold tracking-wide">
                                <i class="fa-solid fa-dumbbell mr-1"></i> Reference Pose
                            </div>
                        </div>

                        <div class="border-t border-slate-100 pt-4">
                            <a href="{{ meta.youtube_url }}" target="_blank" class="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition tracking-wide shadow-sm">
                                <i class="fa-brands fa-youtube text-sm text-rose-500"></i> Open Video Tutorial <i class="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-70"></i>
                            </a>
                            <p class="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                                Review this external form guide on YouTube to fix stance configuration coordinates.
                            </p>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 class="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-list-check"></i> Execution Guide
                        </h3>
                        <ul class="space-y-3">
                            {% for step in meta.steps %}
                            <li class="flex items-start gap-3 text-xs font-medium text-slate-600 leading-normal">
                                <span class="bg-slate-100 text-slate-800 font-bold text-[10px] w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5">{{ loop.index }}</span>
                                {{ step }}
                            </li>
                            {% endfor %}
                        </ul>
                    </div>
                </div>

            </div>
        </main>

        <script>
            function toggleModal(show) {
                const modal = document.getElementById('workoutModal');
                if (show) modal.classList.remove('hidden');
                else modal.classList.add('hidden');
            }

            function controlWorkout(actionName) {
                fetch('/api/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: actionName })
                });
            }

            function formatTime(seconds) {
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                return `${mins}:${secs}`;
            }

            setInterval(() => {
                fetch('/api/state')
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('hudCalories').innerText = data.calories;
                        document.getElementById('hudSets').innerText = data.set_str;
                        document.getElementById('hudProgress').innerText = data.progress_str;
                        document.getElementById('hudTimer').innerText = formatTime(data.time_elapsed);
                    });
            }, 400);
        </script>
    </body>
    </html>
    """
    return render_template_string(dashboard_html, meta=current_meta, active_key=selected_workout, target_input=target_input, target_sets=target_sets, all_workouts=WORKOUT_DETAILS)

@app.route("/video")
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True, threaded=True, port=5001, host="0.0.0.0")
