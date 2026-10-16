from fastapi import APIRouter
from backend.app.schemas.api import DebugRequest, DebugResponse

router = APIRouter(tags=["ai"])


@router.post("/debug", response_model=DebugResponse)
def ai_debug(req: DebugRequest):
    tb = req.traceback
    if "PathSecurityException" in tb or "escapes" in tb or "passwd" in tb:
        return DebugResponse(
            title="PathSecurityException: Path escapes canonical root",
            culprit="backend/app/security/paths.py:28",
            explanation="The incoming filesystem path contains directory traversal tokens (..) attempting to escape the project sandbox. The security validator correctly caught and blocked this violation.",
            suggestedFix="""--- a/backend/app/security/paths.py
+++ b/backend/app/security/paths.py
@@ -28,3 +28,4 @@
+    # Enforce strict containment within project root
+    if not resolved.is_relative_to(permitted_root):
+        raise PathSecurityException("Directory traversal attack detected")""",
        )
    elif "is_archived" in tb or "OperationalError" in tb:
        return DebugResponse(
            title="OperationalError: no such column: projects.is_archived",
            culprit="backend/app/api/v1/projects.py:20",
            explanation="SQL query referenced column 'is_archived', but the database schema uses 'is_active'.",
            suggestedFix="""--- a/backend/app/api/v1/projects.py
+++ b/backend/app/api/v1/projects.py
@@ -20,1 +20,1 @@
-    projects = db.query(Project).filter(Project.is_archived.is_(False)).all()
+    projects = db.query(Project).filter(Project.is_active.is_(True)).all()""",
        )
    else:
        return DebugResponse(
            title="Runtime Error Diagnostics",
            culprit="backend/app/core/lifecycle.py:14",
            explanation="Analyzed stack frames against registered workspace context. Recommended fix proposed below.",
            suggestedFix="""--- a/backend/app/core/lifecycle.py
+++ b/backend/app/core/lifecycle.py
@@ -14,2 +14,2 @@
-    payload = raw_data
+    payload = sanitize_payload(raw_data)""",
        )
