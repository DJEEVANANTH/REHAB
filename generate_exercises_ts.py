import json

with open("d:/Application-1-master/Application-1-master/exercises_db.json", "r") as f:
    exercises = json.load(f)

# Generate TS format
ts_lines = ["import { ExerciseData } from '../types';\n\nexport const EXERCISES: ExerciseData[] = ["]
for ex_id, data in exercises.items():
    ts_lines.append("  {")
    ts_lines.append(f'    "id": "{ex_id}",')
    ts_lines.append(f'    "title": "{data["name"]}",')
    ts_lines.append(f'    "muscle": "{data["muscle"]}",')
    ts_lines.append(f'    "image": "{data["image_url"]}",')
    ts_lines.append('    "steps": [')
    for i, step in enumerate(data["steps"]):
        ts_lines.append('      {')
        ts_lines.append(f'        "title": "Step {i+1}",')
        ts_lines.append(f'        "desc": "{step}"')
        ts_lines.append('      }' + (',' if i < len(data["steps"]) - 1 else ''))
    ts_lines.append('    ],')
    ts_lines.append('    "mistakes": [')
    for i, mistake in enumerate(data["mistakes"]):
        ts_lines.append(f'      "{mistake}"' + (',' if i < len(data["mistakes"]) - 1 else ''))
    ts_lines.append('    ]')
    ts_lines.append("  },")
ts_lines.append("];")

with open("d:/Application-1-master/Application-1-master/mobile-app/data/exercises.ts", "w") as f:
    f.write("\n".join(ts_lines))
