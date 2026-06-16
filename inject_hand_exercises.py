import json
import os

db_path = "d:/Application-1-master/Application-1-master/exercises_db.json"

hand_exercises = [
    "Finger Open and Close",
    "Finger Stretch",
    "Finger Spreading",
    "Finger Tapping",
    "Thumb Touch Each Finger",
    "Finger Lifts",
    "Finger Walking",
    "Finger Pinch",
    "Finger Squeezing",
    "Finger Curl",
    "Thumb Flexion",
    "Thumb Extension",
    "Wrist Rotations"
]

def generate_logo_url(name):
    # Dynamic avatar logo API based on exercise name
    formatted = name.replace(' ', '+')
    return f"https://ui-avatars.com/api/?name={formatted}&background=random&color=fff&size=512&font-size=0.33&bold=true&rounded=true"

def inject():
    if not os.path.exists(db_path):
        print("exercises_db.json not found")
        return
        
    with open(db_path, "r") as f:
        old_db = json.load(f)
        
    new_db = {}
    
    # Insert hand exercises (1 to 13)
    for i, name in enumerate(hand_exercises):
        ex_id = f"ex-{i+1:02d}"
        new_db[ex_id] = {
            "name": name,
            "muscle": "Hand & Wrist",
            "level": "Beginner",
            "default_reps": 10,
            "default_sets": 3,
            "default_time": "01:00",
            "image_url": generate_logo_url(name),
            "steps": [
                f"Prepare for {name}.",
                "Keep your hand clearly in the camera frame.",
                "Perform rhythmic movements.",
                "Rest briefly if needed."
            ],
            "mistakes": []
        }
        
    # Shift old exercises (starting from 14)
    # The old DB had 100 items (ex-01 to ex-100)
    # We will sort by integer ID to keep order
    sorted_old_keys = sorted(old_db.keys(), key=lambda x: int(x.split('-')[1]))
    
    current_index = 14
    for old_key in sorted_old_keys:
        old_item = old_db[old_key]
        new_id = f"ex-{current_index:02d}"
        
        # Update image to use dynamic logo
        old_item["image_url"] = generate_logo_url(old_item.get("name", "Exercise"))
        
        new_db[new_id] = old_item
        current_index += 1
        
    with open(db_path, "w") as f:
        json.dump(new_db, f, indent=4)
        
    print(f"Successfully injected 13 hand exercises and updated {len(old_db)} existing exercises. Total: {len(new_db)}")

if __name__ == "__main__":
    inject()
