# DevAgent AI — Start Frontend Dev Server (Windows PowerShell)
# Usage: .\scripts\start-frontend.ps1

Write-Host "Starting DevAgent AI React Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Cyan

Push-Location frontend
try {
    npm run dev
} finally {
    Pop-Location
}
