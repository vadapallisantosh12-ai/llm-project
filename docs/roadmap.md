# DevAgent AI — Product Roadmap

DevAgent AI follows an incremental, 12-phase development roadmap.

## Phase 1: Project Foundation (Completed)
- [x] Windows-first architecture without Docker.
- [x] FastAPI modular backend with Pydantic Settings, Request-ID, and CORS.
- [x] React + TypeScript + Vite frontend with dark developer theme.
- [x] SQLite database schema and Alembic migrations.
- [x] Health check endpoint (`GET /api/v1/health`) and basic project management (`/api/v1/projects`).
- [x] Canonical filesystem path security and path traversal defense.
- [x] Secret redaction filter in structured logging.
- [x] Comprehensive pytest test suite (18 unit, integration, and security tests).
- [x] PowerShell automation scripts (`setup.ps1`, `start-backend.ps1`, `start-frontend.ps1`, `check-environment.ps1`).

## Phase 2: Workspace Manager (Next)
- [ ] Safe file tree explorer and file viewer with syntax highlighting.
- [ ] In-workspace filename and content search.
- [ ] Configurable exclusion patterns and project discovery metadata.

## Phase 3: Codebase Indexing Engine
- [ ] Python AST parsing (functions, classes, imports, docstrings).
- [ ] Content hashing and chunking preserving line ranges and symbols.
- [ ] Keyword and structural retrieval engine.

## Phase 4: LLM Integration
- [ ] Provider abstraction interface.
- [ ] Local Ollama integration and optional hosted LLM provider.
- [ ] Context-size budgeting and prompt security.

## Phase 5: Debugging Assistant
- [ ] Traceback parsing and source locator.
- [ ] Root cause analysis and evidence generation.

## Phase 6: Safe Patch Generation & Review
- [ ] Side-by-side diff viewer.
- [ ] Pre-flight file hash checks and atomic application with rollback.

## Phase 7: Test Generation & Execution
- [ ] Pytest generation and controlled subprocess execution with allowlists and timeouts.

## Phase 8: Code Review Engine
- [ ] Git diff analysis and structured findings.

## Phase 9: Multi-Step Development Agent
- [ ] Autonomous task execution with strict human approval gates.

## Phase 10: Complete Frontend Integration
- [ ] Unified developer experience across all tools.

## Phase 11: Security & Reliability Hardening
- [ ] Penetration testing, prompt injection fuzzing, and reliability verification.

## Phase 12: Product Readiness & Commercial Launch
- [ ] Enterprise packaging, documentation, and operational readiness.
