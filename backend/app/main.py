import os
import sys
from pathlib import Path

# =========================================================================
# CRITICAL IMPORT PATH RESOLUTION:
# Resolves `ModuleNotFoundError: No module named 'backend'` permanently.
# Adds repository root and backend directory to sys.path regardless of
# whether the working directory is the repository root or the backend folder.
# =========================================================================
CURRENT_FILE = Path(__file__).resolve()
APP_DIR = CURRENT_FILE.parent              # /path/to/backend/app
BACKEND_DIR = APP_DIR.parent              # /path/to/backend
REPO_ROOT = BACKEND_DIR.parent            # /path/to/ (workspace root)

for path_entry in [str(REPO_ROOT), str(BACKEND_DIR)]:
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.core.exceptions import PathSecurityException, create_error_response
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.models.entities import Project, Bug, Patch, TestCase
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.projects import router as projects_router
from backend.app.api.v1.bugs import router as bugs_router
from backend.app.api.v1.patches import router as patches_router
from backend.app.api.v1.tests import router as tests_router
from backend.app.api.v1.statistics import router as statistics_router
from backend.app.api.v1.settings import router as settings_router
from backend.app.api.ai.chat import router as ai_chat_router
from backend.app.api.ai.debug import router as ai_debug_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Controlled AI software development engineering platform backend",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS Middleware
# Supports explicit origins, wildcard for development, and regex for all Vercel deployments
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Exception Handlers
@app.exception_handler(PathSecurityException)
async def path_security_exception_handler(request: Request, exc: PathSecurityException):
    return create_error_response(
        status_code=400,
        code=exc.code,
        message=exc.message,
        details=exc.details,
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return create_error_response(
        status_code=exc.status_code,
        code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
    )

# Include Routers under /api/v1
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(bugs_router, prefix=settings.API_V1_PREFIX)
app.include_router(patches_router, prefix=settings.API_V1_PREFIX)
app.include_router(tests_router, prefix=settings.API_V1_PREFIX)
app.include_router(statistics_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)

# Include Routers under /api/ai
app.include_router(ai_chat_router, prefix="/api/ai")
app.include_router(ai_debug_router, prefix="/api/ai")

# Root endpoints
@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": f"{settings.API_V1_PREFIX}/health",
    }


# Database Seeding & Startup Event
@app.on_event("startup")
def startup_event():
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Seed initial data if database is new
    db = SessionLocal()
    try:
        if db.query(Project).count() == 0:
            db.add(
                Project(
                    id="proj-001",
                    name="DevAgent AI Workspace",
                    root_path=str(REPO_ROOT),
                    description="Active production workspace with canonical path verification",
                    is_active=True,
                    indexing_status="indexed",
                    file_count=28,
                    chunk_count=142,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
            )

        if db.query(Bug).count() == 0:
            db.add_all([
                Bug(
                    id="bug-101",
                    title="PathSecurityException: Path escapes canonical root",
                    traceback='Traceback (most recent call last):\n  File "backend/app/api/v1/projects.py", line 31, in register_project\n    resolved_root = validate_project_root(payload.root_path)\nbackend.app.core.exceptions.PathSecurityException: Path escapes canonical root: ../../etc/passwd',
                    culprit="backend/app/security/paths.py:28",
                    status="open",
                    created_at=datetime.now(timezone.utc),
                ),
                Bug(
                    id="bug-102",
                    title="OperationalError: no such column: projects.is_archived",
                    traceback='Traceback (most recent call last):\n  File "backend/app/api/v1/projects.py", line 20, in list_projects\nsqlite3.OperationalError: no such column: projects.is_archived',
                    culprit="backend/app/api/v1/projects.py:20",
                    status="open",
                    created_at=datetime.now(timezone.utc),
                ),
            ])

        if db.query(Patch).count() == 0:
            db.add_all([
                Patch(
                    id="patch-101",
                    target_file="backend/app/security/paths.py",
                    description="Strengthen canonical path containment against symlink traversal attacks",
                    diff="--- a/backend/app/security/paths.py\n+++ b/backend/app/security/paths.py\n@@ -28,7 +28,10 @@\n+    if not resolved.is_relative_to(permitted_root):\n+        raise PathSecurityException('Directory traversal attack detected')",
                    author="DevAgent Engine",
                    sha256="9a7c3b4e1d5f8c2a",
                    status="pending_review",
                    timestamp="10 minutes ago",
                ),
                Patch(
                    id="patch-102",
                    target_file="backend/app/api/v1/health.py",
                    description="Add system CPU load and SQLite memory footprint to diagnostic health response",
                    diff="--- a/backend/app/api/v1/health.py\n+++ b/backend/app/api/v1/health.py\n@@ -33,4 +33,6 @@\n+        'memory_status': 'optimal',",
                    author="DevAgent Engine",
                    sha256="4f2e8a7c9b1d3e5a",
                    status="applied",
                    timestamp="2 hours ago",
                ),
            ])

        if db.query(TestCase).count() == 0:
            db.add_all([
                TestCase(
                    id="t-1",
                    name="test_canonical_path_traversal_blocked",
                    file="tests/security/test_path_traversal.py",
                    category="security",
                    status="passed",
                    duration="14ms",
                ),
                TestCase(
                    id="t-2",
                    name="test_secret_redaction_in_logs",
                    file="tests/security/test_path_traversal.py",
                    category="security",
                    status="passed",
                    duration="8ms",
                ),
                TestCase(
                    id="t-3",
                    name="test_health_endpoint_response_envelope",
                    file="tests/api/test_health.py",
                    category="unit",
                    status="passed",
                    duration="12ms",
                ),
            ])

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
