# DevAgent AI — Environment Setup Script for Windows PowerShell
# Usage: .\scripts\setup.ps1

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   DevAgent AI — Automated Setup (Windows Native)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Check Python
Write-Host "`n[1/5] Verifying Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python is not found in PATH. Please install Python 3.12+ from python.org"
    exit 1
}
Write-Host "Found: $pythonVersion" -ForegroundColor Green

# 2. Check Node & npm
Write-Host "`n[2/5] Verifying Node.js and npm..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js/npm not found. Please install Node.js 18+ from nodejs.org"
    exit 1
}
Write-Host "Found Node: $nodeVersion, npm: $npmVersion" -ForegroundColor Green

# 3. Create or verify Python venv
Write-Host "`n[3/5] Setting up Python virtual environment (.venv)..." -ForegroundColor Yellow
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Created virtual environment at .venv" -ForegroundColor Green
} else {
    Write-Host "Existing .venv found." -ForegroundColor Green
}

# 4. Install backend dependencies
Write-Host "`n[4/5] Installing backend Python packages..." -ForegroundColor Yellow
.\.venv\Scripts\pip.exe install -r backend\requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend dependencies."
    exit 1
}
Write-Host "Backend dependencies installed successfully." -ForegroundColor Green

# 5. Install frontend dependencies
Write-Host "`n[5/5] Installing frontend Node packages..." -ForegroundColor Yellow
Push-Location frontend
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies."
        exit 1
    }
    Write-Host "Frontend dependencies installed successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

# 6. Verify .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "`nCreated .env file from .env.example" -ForegroundColor Green
}

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "   DevAgent AI Setup Complete!" -ForegroundColor Green
Write-Host "   Run .\scripts\start-backend.ps1 in Terminal 1" -ForegroundColor Cyan
Write-Host "   Run .\scripts\start-frontend.ps1 in Terminal 2" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Green
