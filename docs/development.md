# DevAgent AI — Development Guide

## Windows Development Setup

DevAgent AI is developed natively on Windows with Python 3.12+ (or 3.14) and Node.js 18+.

### 1. Prerequisites Check
Run the automated environment check in PowerShell:
```powershell
.\scripts\check-environment.ps1
```

### 2. Complete Automated Setup
Run the setup script:
```powershell
.\scripts\setup.ps1
```

### 3. Running Services

Open two PowerShell terminals:

**Terminal 1 (Backend Server):**
```powershell
.\scripts\start-backend.ps1
```
The FastAPI server will be available at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

**Terminal 2 (Frontend Server):**
```powershell
.\scripts\start-frontend.ps1
```
The React development server will be available at `http://127.0.0.1:5173`.

### 4. Running Backend Tests & Linter
```powershell
.\.venv\Scripts\pytest.exe
.\.venv\Scripts\ruff.exe check backend
```

### 5. Running Frontend Checks
```powershell
cd frontend
npm run lint
npm run build
```
