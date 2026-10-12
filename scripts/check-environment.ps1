# DevAgent AI - Environment Diagnostics Script (Windows PowerShell)
# Usage: .\scripts\check-environment.ps1

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   DevAgent AI - Windows Environment Inspection" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

function Test-Executable($name, $cmd) {
    try {
        $out = Invoke-Expression $cmd 2>&1
        if ($out) {
            Write-Host "[OK] $name : $out" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "[X]  $name : NOT FOUND" -ForegroundColor Red
        return $false
    }
    Write-Host "[X]  $name : NOT FOUND" -ForegroundColor Red
    return $false
}

Test-Executable "Python" "python --version"
Test-Executable "pip" "python -m pip --version"
Test-Executable "Node.js" "node --version"
Test-Executable "npm" "npm --version"
Test-Executable "Git" "git --version"

Write-Host ""
Write-Host "Checking Optional Components:" -ForegroundColor Yellow
try {
    $ollama = ollama --version 2>&1
    Write-Host "[OK]   Ollama : $ollama" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Ollama : Not installed (Optional - mock or hosted provider active)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Checking Network Ports:" -ForegroundColor Yellow
$p8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($p8000) {
    Write-Host "[WARN] Port 8000 : IN USE by PID $($p8000.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "[OK]   Port 8000 : Available (FastAPI Backend)" -ForegroundColor Green
}

$p5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($p5173) {
    Write-Host "[WARN] Port 5173 : IN USE by PID $($p5173.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "[OK]   Port 5173 : Available (Vite Frontend)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking Project Components:" -ForegroundColor Yellow
if (Test-Path ".venv") {
    Write-Host "[OK]   Backend venv (.venv)       : Present" -ForegroundColor Green
} else {
    Write-Host "[WARN] Backend venv (.venv)       : Missing" -ForegroundColor Yellow
}

if (Test-Path "frontend\node_modules") {
    Write-Host "[OK]   Frontend node_modules      : Present" -ForegroundColor Green
} else {
    Write-Host "[WARN] Frontend node_modules      : Missing" -ForegroundColor Yellow
}

if (Test-Path ".env") {
    Write-Host "[OK]   Environment file (.env)    : Present" -ForegroundColor Green
} else {
    Write-Host "[WARN] Environment file (.env)    : Missing (copy from .env.example)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Diagnostics Complete." -ForegroundColor Cyan
