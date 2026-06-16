import json

exercises = {
    # STRENGTHENING
    "ex-01": {"name": "Squats", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop", "steps": ["Stand with feet shoulder-width apart.", "Bend knees and lower hips.", "Keep back straight.", "Return to standing."], "mistakes": []},
    "ex-02": {"name": "Lunges", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=600&auto=format&fit=crop", "steps": ["Step forward with one leg.", "Lower hips until both knees are bent at 90 degrees.", "Push back to start."], "mistakes": []},
    "ex-03": {"name": "Calf Raises", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Stand straight.", "Push up onto toes.", "Hold briefly.", "Lower heels slowly."], "mistakes": []},
    "ex-04": {"name": "Glute Bridges", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on back, knees bent.", "Lift hips off the floor.", "Squeeze glutes.", "Lower hips."], "mistakes": []},
    "ex-05": {"name": "Plank", "muscle": "Strengthening", "level": "Beginner", "default_reps": 1, "default_sets": 3, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=600&auto=format&fit=crop", "steps": ["Rest on forearms and toes.", "Keep body in a straight line.", "Engage core.", "Hold position."], "mistakes": []},
    "ex-06": {"name": "Side Plank", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 1, "default_sets": 3, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on side.", "Prop up on one elbow.", "Lift hips to form a straight line.", "Hold."], "mistakes": []},
    "ex-07": {"name": "Wall Sit", "muscle": "Strengthening", "level": "Beginner", "default_reps": 1, "default_sets": 3, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Lean back against a wall.", "Slide down until knees are at 90 degrees.", "Hold position."], "mistakes": []},
    "ex-08": {"name": "Push-ups", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop", "steps": ["Start in plank position on hands.", "Lower body until chest is near floor.", "Push back up."], "mistakes": []},
    "ex-09": {"name": "Bird-Dog", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Start on hands and knees.", "Extend opposite arm and leg.", "Hold.", "Return and switch sides."], "mistakes": []},
    "ex-10": {"name": "Deadbug", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on back, arms up, knees at 90 degrees.", "Lower opposite arm and leg to floor.", "Return to start."], "mistakes": []},
    "ex-11": {"name": "Clamshells", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on side, knees bent.", "Keep feet together and lift top knee.", "Lower slowly."], "mistakes": []},
    "ex-12": {"name": "Step-ups", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop", "steps": ["Stand in front of a step.", "Step up with one foot.", "Bring other foot up.", "Step down."], "mistakes": []},
    "ex-13": {"name": "Russian Twists", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop", "steps": ["Sit with knees bent, lean back slightly.", "Twist torso side to side.", "Keep core engaged."], "mistakes": []},
    "ex-14": {"name": "Superman", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on stomach.", "Lift arms and legs off the floor simultaneously.", "Hold briefly.", "Lower."], "mistakes": []},
    "ex-15": {"name": "Hip Thrusts", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop", "steps": ["Rest upper back on a bench.", "Place weight on hips.", "Drive hips upward.", "Lower slowly."], "mistakes": []},
    "ex-16": {"name": "Heel Drops", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Stand on edge of a step.", "Drop heels below the step level slowly.", "Push back up."], "mistakes": []},
    "ex-17": {"name": "Toe Taps", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on back, legs in tabletop position.", "Tap one toe to floor.", "Return to tabletop."], "mistakes": []},
    "ex-18": {"name": "Resistance Band Rows", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop", "steps": ["Secure band around a post.", "Pull handles toward chest.", "Squeeze shoulder blades together."], "mistakes": []},
    "ex-19": {"name": "Lateral Raises", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Hold light weights.", "Lift arms out to the sides to shoulder height.", "Lower slowly."], "mistakes": []},
    "ex-20": {"name": "Bicep Curls", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Hold weights at sides.", "Bend elbows to lift weights to shoulders."], "mistakes": []},
    "ex-21": {"name": "Tricep Extensions", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Hold weight overhead.", "Bend elbows to lower weight behind head."], "mistakes": []},
    "ex-22": {"name": "Hamstring Curls", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop", "steps": ["Stand or lie face down.", "Bend knee to bring heel toward glutes."], "mistakes": []},
    "ex-23": {"name": "Leg Extensions", "muscle": "Strengthening", "level": "Beginner", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop", "steps": ["Sit on chair/machine.", "Straighten knee to lift foot.", "Lower slowly."], "mistakes": []},
    "ex-24": {"name": "Overhead Press", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 15, "default_sets": 3, "default_time": "02:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Hold weights at shoulder height.", "Press weights directly overhead."], "mistakes": []},
    "ex-25": {"name": "Farmer's Walk", "muscle": "Strengthening", "level": "Intermediate", "default_reps": 1, "default_sets": 3, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", "steps": ["Hold heavy weights in each hand.", "Walk forward with good posture."], "mistakes": []},

    # STRETCHING
    "ex-26": {"name": "Hamstring Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Sit on floor, one leg straight.", "Reach toward toes.", "Hold."], "mistakes": []},
    "ex-27": {"name": "Quad Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Stand holding a wall.", "Grab ankle and pull heel to glute.", "Hold."], "mistakes": []},
    "ex-28": {"name": "Calf Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Stand facing wall.", "Step one foot back, keep heel down.", "Lean into wall."], "mistakes": []},
    "ex-29": {"name": "Chest Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Stand in doorway.", "Place forearms on frame.", "Lean forward."], "mistakes": []},
    "ex-30": {"name": "Triceps Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Reach one arm overhead and bend elbow.", "Gently pull elbow with other hand."], "mistakes": []},
    "ex-31": {"name": "Shoulder Cross-arm", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Bring one arm across chest.", "Use other arm to pull it closer."], "mistakes": []},
    "ex-32": {"name": "Neck Tilt", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Sit straight.", "Tilt ear toward shoulder.", "Apply gentle pressure."], "mistakes": []},
    "ex-33": {"name": "Neck Rotation", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Sit straight.", "Turn head to look over shoulder.", "Hold.", "Repeat on other side."], "mistakes": []},
    "ex-34": {"name": "Cat-Cow", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Start on hands and knees.", "Arch back up (Cat).", "Let belly drop (Cow)."], "mistakes": []},
    "ex-35": {"name": "Child's Pose", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Kneel on floor.", "Sit back on heels.", "Reach arms forward on floor."], "mistakes": []},
    "ex-36": {"name": "Cobra Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on stomach.", "Push up on hands, keeping hips on floor.", "Look up."], "mistakes": []},
    "ex-37": {"name": "Seated Twist", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Sit on floor.", "Cross one leg over the other.", "Twist torso toward bent knee."], "mistakes": []},
    "ex-38": {"name": "Butterfly Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Sit on floor.", "Bring soles of feet together.", "Gently press knees down."], "mistakes": []},
    "ex-39": {"name": "Figure 4 Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on back.", "Cross one ankle over opposite knee.", "Pull bottom leg toward chest."], "mistakes": []},
    "ex-40": {"name": "Knee to Chest", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Lie on back.", "Pull one knee into chest with hands.", "Hold."], "mistakes": []},
    "ex-41": {"name": "Hip Flexor Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Kneel on one knee.", "Push hips forward gently.", "Keep back straight."], "mistakes": []},
    "ex-42": {"name": "IT Band Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Stand, cross one leg behind the other.", "Lean away from the back leg."], "mistakes": []},
    "ex-43": {"name": "Wrist Flexor Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Extend arm, palm up.", "Gently pull fingers down with other hand."], "mistakes": []},
    "ex-44": {"name": "Wrist Extensor Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Extend arm, palm down.", "Gently pull fingers down with other hand."], "mistakes": []},
    "ex-45": {"name": "Ankle Circles", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Sit or stand.", "Lift one foot.", "Rotate ankle in circles clockwise and counterclockwise."], "mistakes": []},
    "ex-46": {"name": "Torso Twist", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Stand with feet wide.", "Twist torso side to side, letting arms swing naturally."], "mistakes": []},
    "ex-47": {"name": "Latissimus Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Reach arms overhead.", "Grab one wrist and lean to the opposite side."], "mistakes": []},
    "ex-48": {"name": "Thread the Needle", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Start on hands and knees.", "Slide one arm under the other.", "Rest shoulder on floor."], "mistakes": []},
    "ex-49": {"name": "Downward Dog", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Start in plank.", "Push hips up and back.", "Try to press heels to the floor."], "mistakes": []},
    "ex-50": {"name": "Pectoral Corner Stretch", "muscle": "Stretching", "level": "Beginner", "default_reps": 1, "default_sets": 1, "default_time": "01:00", "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop", "steps": ["Stand facing a corner.", "Place hands on walls.", "Lean chest forward into the corner."], "mistakes": []},
}

for i in range(51, 76):
    ex_id = f"ex-{i:02d}"
    exercises[ex_id] = {
        "name": f"Balance Exercise {i-50}",
        "muscle": "Balance",
        "level": "Intermediate",
        "default_reps": 1,
        "default_sets": 3,
        "default_time": "01:00",
        "image_url": get_category_image("Balance"),
        "steps": ["Maintain balance position.", "Stay focused and steady."],
        "mistakes": []
    }

for i in range(76, 101):
    ex_id = f"ex-{i:02d}"
    exercises[ex_id] = {
        "name": f"Endurance Exercise {i-75}",
        "muscle": "Endurance",
        "level": "Intermediate",
        "default_reps": 1,
        "default_sets": 1,
        "default_time": "05:00",
        "image_url": get_category_image("Endurance"),
        "steps": ["Maintain continuous movement.", "Breathe steadily."],
        "mistakes": []
    }

# Inject the exact balance and endurance names from the transcription
balance_names = [
    "Single-Leg Stand", "Tandem Stance", "Tandem Walking", "Heel Walking", "Toe Walking",
    "Grapevine (Carioca)", "Balance Board Stand", "Single-Leg Deadlift", "Y-Balance Reach",
    "Clock Reach", "Bosu Ball Squats", "Swiss Ball Sitting", "Marching with Eyes Closed",
    "Star Excursion", "Throw and Catch (One Leg)", "Figure-8 Walking", "Tai Chi Weight Shifts",
    "Step Over Obstacles", "Backward Walking", "Bouncing Ball Walk", "Single-Leg Hops",
    "Cross-Body Touches", "Wobble Board Tilts", "Heel-to-Toe Backward Walk", "Stand on Uneven Surface"
]

endurance_names = [
    "Brisk Walking", "Jogging", "Stationary Cycling", "Swimming (Freestyle)", "Water Aerobics",
    "Rowing Machine", "Elliptical Trainer", "Stair Climbing", "Jump Rope", "Jumping Jacks",
    "High Knees", "Burpees", "Mountain Climbers", "Cross-country Skiing", "Aerobic Dance (Zumba)",
    "Shadow Boxing", "Treadmill Incline Walk", "Arm Ergometer", "Outdoor Cycling", "Speed Walking",
    "Heavy Bag Boxing", "Swimming (Breaststroke)", "Step Aerobics", "Circuit Training", "Agility Ladder Drills"
]

for i in range(51, 76):
    exercises[f"ex-{i:02d}"]["name"] = balance_names[i-51]
    
for i in range(76, 101):
    exercises[f"ex-{i:02d}"]["name"] = endurance_names[i-76]

with open("d:/Application-1-master/Application-1-master/exercises_db.json", "w") as f:
    json.dump(exercises, f, indent=4)
