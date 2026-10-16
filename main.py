"""
DevAgent AI — Root FastAPI Entry Point
Enables seamless execution via `fastapi run`, `fastapi deploy`, or `uvicorn main:app`.
"""
import sys
from pathlib import Path

# Ensure root and backend directories are in sys.path
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"

for p in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
