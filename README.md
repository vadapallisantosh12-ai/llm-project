# DevAgent AI — Intelligent AI Software Development Platform

DevAgent AI is a controlled, context-aware AI software development platform built natively for Windows. It provides intelligent codebase comprehension, safe patch generation with diff reviews, controlled test execution, and multi-step development workflows without relying on Docker.

---

## 1. What DevAgent AI Is

DevAgent AI is an extensible developer tool that inspects existing local projects, understands code structures, diagnoses errors, proposes traceable modifications, generates tests, and assists developers through controlled workflows.

Unlike generic chatbot interfaces that generate disconnected snippets, DevAgent AI indexes your actual repository, retrieves relevant context, proposes reviewable patches, and requires human approval before applying consequential changes.

## 2. Problems It Solves

- **Unfamiliar Codebases**: Quick architectural comprehension and symbol navigation in large repositories.
- **Error Investigation**: Grounded root-cause analysis of tracebacks without manually pasting multiple files into an LLM.
- **Unchecked AI Modifications**: Elimination of silent file corruptions through reviewable diffs and rollback mechanisms.
- **Security & Privacy Risks**: Native execution on Windows without Docker, with support for local models via Ollama to keep source code on-premises.

## 3. Technology Stack

- **Backend**: Python 3.12+ (tested on Python 3.14), FastAPI, Uvicorn, Pydantic v2, Pydantic Settings, SQLAlchemy 2.0, Alembic, HTTPX.
- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, dark developer design system.
- **Database**: SQLite (isolated in `./app_data/database/devagent.db`).
- **AI Integration**: Provider-agnostic engine supporting local models (Ollama) and optional hosted providers (OpenAI, Anthropic).
- **Environment**: Native Windows PowerShell, Python `.venv`, Node.js & npm. **Strictly zero Docker dependency.**

## 4. Project Directory Structure

```
DevAgent-AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Health, projects, assistant, debug, patches, tests, reviews, tasks
│   │   ├── core/           # Config, logging with secret redaction, exceptions, lifecycle
│   │   ├── db/             # SQLAlchemy engine, session maker, Alembic migrations
│   │   ├── models/         # Project, AuditLog models
│   │   ├── schemas/        # Pydantic v2 request/response schemas
│   │   ├── security/       # Canonical path resolution, traversal guard, secret redaction
│   │   └── main.py         # FastAPI application entry point
│   ├── tests/
│   │   ├── unit/           # Config, path security, exception tests
│   │   ├── integration/    # Health, project registration tests
│   │   └── security/       # Traversal attacks, secret redaction tests
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Typed API client
│   │   ├── app/            # Main React App & layout shell
│   │   ├── components/     # Header, Sidebar, StatusBadge
│   │   ├── pages/          # Dashboard, Projects, Settings, Feature Stage Previews
│   │   └── types/          # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── app_data/               # Isolated storage for SQLite DB, logs, backups, temp files
├── scripts/                # PowerShell automation scripts (setup, start, diagnostics)
├── docs/                   # Architecture, security, API, development, and roadmap specs
├── .cursor/rules/          # Persistent engineering guidelines for Cursor
├── pyproject.toml          # Pytest and Ruff configuration
├── .gitignore
├── .env.example
└── README.md
```

---

## 5. Quick Start on Windows

### Prerequisites
- Windows 10/11
- PowerShell 5.1+ or PowerShell 7
- Python 3.12+ (tested with Python 3.14)
- Node.js 18+ and npm
- Git for Windows

Run the automated environment check:
```powershell
.\scripts\check-environment.ps1
```

### Automated Setup
To create the virtual environment, install backend dependencies, and install frontend packages in one command:
```powershell
.\scripts\setup.ps1
```

### Manual Setup (Step-by-Step)

1. **Create and Activate Python Virtual Environment**:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install Backend Dependencies**:
   ```powershell
   .\.venv\Scripts\pip.exe install -r backend\requirements.txt
   ```

3. **Install Frontend Dependencies**:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

4. **Initialize Environment Configuration**:
   ```powershell
   Copy-Item .env.example .env
   ```

---

## 6. Running DevAgent AI

DevAgent AI runs using two independent PowerShell terminals:

### Terminal 1: Backend Server (FastAPI)
```powershell
.\scripts\start-backend.ps1
```
- Server URL: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Frontend Server (React + Vite)
```powershell
.\scripts\start-frontend.ps1
```
- Web Application: `http://127.0.0.1:5173`

---

## 7. Running Automated Tests

Run backend unit, integration, and security tests:
```powershell
.\.venv\Scripts\pytest.exe
```

Run code formatting and lint checks:
```powershell
.\.venv\Scripts\ruff.exe check backend
```

Run frontend TypeScript verification and production build:
```powershell
cd frontend
npm run lint
npm run build
cd ..
```

---

## 8. Database & Storage Configuration

DevAgent AI uses SQLite via SQLAlchemy. The database file is located at:
`./app_data/database/devagent.db`

All application logs, backups, and temporary files are isolated in `./app_data/` and never written into user code repositories.

---

## 9. LLM Provider Configuration

Configure your AI provider in `.env`:

### Local LLM (Ollama - Recommended for Privacy)
```env
DEFAULT_LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_DEFAULT_MODEL=qwen2.5-coder:7b
```

### Hosted LLM (Optional)
```env
DEFAULT_LLM_PROVIDER=hosted
HOSTED_LLM_PROVIDER=openai
HOSTED_LLM_BASE_URL=https://api.openai.com/v1
HOSTED_LLM_API_KEY=your-api-key-here
```

### Deterministic / Mock Mode (For Offline Development & CI)
```env
DEFAULT_LLM_PROVIDER=mock
```

---

## 10. Security Model & Limitations

- **Canonical Path Resolution**: Directory traversal attacks (`..`), symlink escapes, and attempts to target directories outside the registered project root are blocked.
- **Sensitive File Exclusion**: `.env`, credentials, private keys, `.git`, `.venv`, and `node_modules` are excluded by default.
- **Secret Redaction**: High-entropy API keys and passwords are automatically redacted in logs and outputs.
- **Subprocess Security Limitation**: Normal Windows subprocesses inherit the running user's account permissions. DevAgent AI uses command allowlists and timeouts, but untrusted code execution should be audited before running.

---

## 11. Feature Implementation Status

| Feature / Phase | Status | Details |
| :--- | :--- | :--- |
| **Phase 1: Project Foundation** | **Completed** | Windows-native setup, FastAPI, React TS, SQLite, Health API, Security Guards, Tests |
| **Phase 2: Workspace Manager** | Next | Safe directory browsing, syntax viewer, and file search |
| **Phase 3: Codebase Indexing** | Scheduled | AST parsing, code chunking, and keyword retrieval |
| **Phase 4: LLM Integration** | Scheduled | Ollama local model and hosted provider integration |
| **Phase 5: Debugging Assistant** | Scheduled | Traceback parsing and root-cause analysis |
| **Phase 6: Safe Patch Review** | Scheduled | Diff viewer, transactional patch application |
| **Phase 7: Test Generation** | Scheduled | Pytest generation and controlled execution |
| **Phase 8: Code Review** | Scheduled | Git diff analysis and static analysis findings |
| **Phase 9: Multi-Step Agent** | Scheduled | Bounded multi-step workflows with human approval |
| **Phase 10-12: Launch & Hardening** | Scheduled | Polished UI integration, penetration review, and commercial release |
