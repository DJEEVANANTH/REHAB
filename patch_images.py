import json
import os

db_path = "d:/Application-1-master/Application-1-master/exercises_db.json"
with open(db_path, "r") as f:
    db = json.load(f)

images = {
    "Strengthening": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop", # Gym/Weights
    "Stretching": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop", # Yoga stretch
    "Balance": "https://images.unsplash.com/photo-1552196563-55259259a589?q=80&w=600&auto=format&fit=crop", # Balance pose
    "Endurance": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600&auto=format&fit=crop" # Running/Cardio
}

for key, val in db.items():
    category = val.get("muscle", "Strengthening")
    val["image_url"] = images.get(category, images["Strengthening"])

with open(db_path, "w") as f:
    json.dump(db, f, indent=4)

print("Patched image URLs successfully.")
