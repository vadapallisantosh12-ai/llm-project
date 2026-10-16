from pathlib import Path
from backend.app.core.exceptions import PathSecurityException


def validate_project_root(raw_path: str, permitted_root: Path | None = None) -> Path:
    """
    Validates and resolves a directory path to prevent directory traversal attacks.
    Ensures that relative components (like '..') or canonical paths do not escape allowed locations.
    """
    cleaned = raw_path.strip()
    if not cleaned:
        raise PathSecurityException("Project path cannot be empty.")

    # Guard against obvious traversal patterns
    if ".." in cleaned or "/etc" in cleaned or "\\windows\\system32" in cleaned.lower():
        raise PathSecurityException(f"Path traversal pattern detected: '{raw_path}'")

    try:
        resolved = Path(cleaned).resolve()
    except Exception as exc:
        raise PathSecurityException(f"Invalid filesystem path: {str(exc)}")

    if permitted_root is not None:
        try:
            # Check relative containment
            resolved.relative_to(permitted_root.resolve())
        except ValueError:
            raise PathSecurityException(f"Path escapes canonical root: {raw_path}")

    return resolved
