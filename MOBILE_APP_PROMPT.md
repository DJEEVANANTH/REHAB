# PDD AI GYM — Mobile Android App Specification & Implementation Prompt

Use the following detailed prompt to generate the exact frontend and backend of the **PDD AI GYM** mobile Android app. This prompt is structured to guide an AI developer in building a robust React Native (Expo) app with on-device pose detection and a scalable backend.

---

## Copy & Paste Prompt for Mobile App Generation

```markdown
You are an expert mobile developer specializing in React Native, Expo, and on-device AI computer vision.
You are tasked with building the mobile Android application for "PDD AI GYM" (both frontend and backend) based on the existing web codebase.

### 1. High-Level Architecture
- **Frontend**: React Native + Expo (with TypeScript, NativeWind for Tailwind styling, Expo Router for navigation, and Expo Image).
- **On-Device AI Tracking**: Run MediaPipe Pose Detection natively on the phone. Do NOT stream video to a backend server. Instead, use React Native's Camera (Expo Camera or React Native Vision Camera) and process frames locally at 30-60 FPS using MediaPipe Tasks Vision SDK (`@mediapipe/tasks-vision` or the native Android SDK wrapper via JSI/Native Module).
- **Backend**: Node.js Express Auth Server (with JWT session control, Google OAuth, Nodemailer SMTP OTP validation, and MongoDB database storage with local JSON DB fallback).
- **Cloud DB (Sync)**: Supabase PostgreSQL database schemas (`profiles` and `workout_sessions` tables) for remote synchronization.

---

### 2. Frontend Mobile Screens (React Native)
Implement the following screens exactly mirroring the design system of the PDD AI GYM website (curated vibrant color accents, premium dark-mode styling, smooth animations, and robust stat indicators):

1. **Login Screen (`/login`)**:
   - Single-use OTP login/signup. Form fields for entering email, sending code, and verifying code.
   - Google Sign-In button integrating native Google Sign-in API.
   - Account existence validation (throw a detailed notice to Sign Up if no profile exists for Login mode, or to Log In if account already exists for Signup mode).

2. **Dashboard / Home Screen (`/home`)**:
   - A hero header overlay (playing a local MP4 loop as visual background).
   - Animated visual counters showing total stats fetched from user history: Calories Burned (Red), Workouts Done (Blue), Avg Accuracy (Green), and Day Streak (Purple).
   - Live Feedback overlay displaying details of the latest workout session.
   - List of Cutting-Edge Features card layout (Real-time Pose Detection, Performance Tracking, Posture Correction, Workout Plans, Progress Analytics, Secure & Private).

3. **Workouts Selection Screen (`/workouts`)**:
   - Grid cards of the 10 available exercise engines: Push-Up, Squat, Lunge, Plank, Bicep Curl, Shoulder Press, Bench Press, Lat Pulldown, Deadlift, Mountain Climber.
   - Display muscle group, difficulty rank (Normal, Medium, High), and default reps/sets count.
   - Launch detection button for each exercise.

4. **Active Workout / Tracking Screen (`/active-workout/[id]`)**:
   - **Camera Stream HUD**: Left overlay showing live camera view with a processed skeleton. Highlight joints in glowing green when posture is correct and glowing red when incorrect.
   - **Real-Time HUD Stats**: Live grids displaying Form Score (%), Calories Burned (kcal), Sets Done (current / target), Reps Progress (reps / target), and Duration Timer.
   - **Control Panel**: Floating buttons for Start, Stop, and Reset.
   - **Reference Slideshow Panel**: Floating overlay displaying step-by-step form illustrations and labels. Loop through steps every 2 seconds. Throw visible alerts when warning steps are active.
   - **Audio Coach**: Use `expo-speech` to provide real-time audio announcements (counts, alerts to keep back straight, congrats on sets, and final summary voiceover).
   - **YouTube Guide**: Button to launch external YouTube tutorial or embed video guide directly.

5. **Progress Screen (`/progress`)**:
   - Longitudinal charts (e.g., using `react-native-chart-kit`) plotting calories burned, reps volume, and form accuracy over time.
   - History logs listing past workout sessions in reverse chronological order.

6. **Profile / Settings Screen (`/profile`)**:
   - Display avatar, name, and joined date.
   - Interactive fields: Age, Weight (kg), Height (cm), Body Fat (%), and Fitness Goals.
   - Database server setup settings (toggle between local fallback storage and remote database sync).

---

### 3. Pose Detection Trigonometry & Logic
Translate the Python MediaPipe logic from the original website's detection server into React Native TypeScript (running on-device via Frame Processors or custom canvas drawing).
Calculate joint angles dynamically using three landmarks `A(x,y)`, `B(x,y)`, and `C(x,y)`:

```typescript
function calculateAngle(a: [number, number], b: [number, number], c: [number, number]): number {
  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}
```

Implement specific workout triggers:
- **Push-Up**:
  - Arm angle = `calculateAngle(shoulder, elbow, wrist)`
  - Body alignment angle = `calculateAngle(shoulder, hip, knee)`
  - Correct posture when body alignment > 155°. Track arm bending down under 90° and fully extending back up past 160° to increment repetition.
- **Squat**:
  - Knee flex angle = `calculateAngle(hip, knee, ankle)`
  - Back posture angle = `calculateAngle(shoulder, hip, knee)`
  - Correct posture when back angle > 45°. Increment rep when knee flex drops below 100° and ascends back past 165°.
- **Lunge**:
  - Knee flex angle = `calculateAngle(hip, knee, ankle)`
  - Rep triggers when knee angle bends below 100° and returns to straight.
- **Plank**:
  - Body alignment angle = `calculateAngle(shoulder, hip, ankle)`
  - Correct posture when angle is strictly between 160° and 180°. Maintain timer ticking only when posture remains correct.
- **Bicep Curl**:
  - Elbow angle = `calculateAngle(shoulder, elbow, wrist)`
  - Increment rep when arm extends past 160° and curls up below 40°.
- **Shoulder Press**:
  - Arm angle = `calculateAngle(shoulder, elbow, wrist)`
  - Rep triggers when wrist y-coordinate is above shoulder y-coordinate, arm bends below 100°, and pushes straight up past 150°.
- **Bench Press**:
  - Elbow angle = `calculateAngle(shoulder, elbow, wrist)`
  - Rep increments when elbow bends below 95° and pushes to straight past 155°.
- **Lat Pulldown**:
  - Arm angle = `calculateAngle(shoulder, elbow, wrist)`
  - Rep increments when bar pulls down below 85° and releases past 150°.
- **Deadlift**:
  - Hip hinge angle = `calculateAngle(shoulder, hip, knee)`
  - Rep increments when spine hinges forward under 120° and locks hips back straight past 165°.
- **Mountain Climber**:
  - Knee y-coordinates compared to hip y-coordinates.
  - Rep increments as knees are driven forward alternatively.

---

### 4. Backend Express API & Database
Create a Node.js Express server to handle mobile API endpoints:
- **Authentication Routes**:
  - `/api/auth/otp/send`: Receives email. Generates and stores secure 6-digit OTP (5-minute expiry). Sends email using Nodemailer (Gmail SMTP) or falls back to dev terminal output. Validates against duplication in signup and absence in login.
  - `/api/auth/otp/verify`: Validates OTP code, consumes it immediately (single-use), auto-creates user profile (if signup), and returns a JWT session token.
  - `/api/auth/google`: Verifies native client credentials payload (Google OAuth) and registers/logs in the user.
  - `/api/auth/logout`: Revokes active sessions.
  - `/api/auth/session`: Checks active JWT status.
- **Database Schema (Supabase/Postgres Migration)**:
  - `profiles`: user id, full_name, email, age, weight, height, body_fat, fitness_goal, joined_date.
  - `workout_sessions`: session id, user_id, exercise_id, reps, sets, calories, duration_seconds, accuracy, created_at.
- **Dual Storage Engine**:
  - Ensure the backend tries to connect to MongoDB, but gracefully falls back to a localized `fallback_database.json` database on connection timeouts, maintaining 100% operational functionality.

---

### 5. Implementation Steps
1. **Setup Expo Project**: Initialize a standard Expo app with TypeScript and Expo Router. Install `expo-camera`, `@mediapipe/tasks-vision` (or React Native Vision Camera + custom frames plugin), `expo-speech`, `expo-secure-store`, and Chart components.
2. **Translate UI Components**: Port pages from the web React project (`Home.tsx`, `ActiveWorkout.tsx`, `Login.tsx`, etc.) to React Native view structures (`View`, `Text`, `ScrollView`, `TouchableOpacity`) styling them with Tailwind CSS/NativeWind.
3. **Build Frame Processor**: Setup camera handler to retrieve frame landmarks. Implement keypoint tracking and trigonometric angles logic. Draw skeletons dynamically onto overlay canvases.
4. **Deploy Express Backend**: Structure backend endpoints, configure environment variables (`JWT_SECRET`, `SMTP_USER`, `MONGODB_URI`), and verify database operations.
5. **Testing**: Run on an Android Emulator or physical device using Expo Go, verifying real-time angle analysis, speech feedback, and database sync.
```
