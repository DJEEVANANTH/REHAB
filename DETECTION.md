# Detection Server — Run & Integration

## Quick start (Windows PowerShell)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python detection_server.py
```

Or (cmd.exe):

```cmd
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python detection_server.py
```

Open http://localhost:5000 in your browser. The live MJPEG stream is available at `/video` and the API endpoints are under `/api`.

## Integrating with the existing React/Vite frontend

Recommended (dev): configure a Vite proxy so the browser forwards `/video` and `/api` to the Flask server. Add or update the `server.proxy` section in `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/video': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

After adding the proxy, your React code can keep using `fetch('/api/...')` and `<img src="/video">` without CORS issues.

## If you prefer to keep servers separate (CORS)

Install `flask-cors` (already included in `requirements.txt`) and enable it in `detection_server.py`:

```py
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

This allows direct cross-origin requests from your frontend origin.

## Notes & troubleshooting

- The server requires a working webcam and permission to access it. Ensure no other process is using the camera.
- Mediapipe installation may be platform-sensitive; if `pip install mediapipe` fails on Windows, check the official Mediapipe docs for platform-specific wheels.
- Voice (`pyttsx3`) uses the OS speech engine (SAPI5 on Windows). If running on a headless server, consider disabling voice feedback.

## Next steps I can take for you

- Add CORS to `detection_server.py` and commit the change.
- Update `vite.config.ts` in-place to include the proxy.
- Run the server here to verify the feed (I can attempt this if you want).

Tell me which of the above you'd like me to do next.