# DevAgent AI — Start Backend Server (Windows PowerShell)
# Usage: .\scripts\start-backend.ps1

Write-Host "Starting DevAgent AI FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Error "Virtual environment not found. Please run .\scripts\setup.ps1 first."
    exit 1
}

$env:PYTHONPATH = "."
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
