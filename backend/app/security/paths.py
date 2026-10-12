"""Filesystem path security and validation for DevAgent AI.

Provides canonical path resolution, path traversal prevention, symlink/junction escape
detection, and sensible default exclusions for Windows and cross-platform environments.
"""

from pathlib import Path
from typing import Optional, Set

from backend.app.core.exceptions import PathSecurityException

DEFAULT_EXCLUDED_DIRS: Set[str] = {
    ".git",
    ".venv",
    "venv",
    "env",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    "dist",
    "build",
    ".next",
    ".nuxt",
    ".idea",
    ".vscode",
}

DEFAULT_EXCLUDED_FILES: Set[str] = {
    ".env",
    ".env.local",
    ".env.production",
    "id_rsa",
    "id_ed25519",
}

DEFAULT_EXCLUDED_EXTENSIONS: Set[str] = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".iso",
    ".bin",
    ".zip",
    ".tar",
    ".gz",
    ".7z",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".pdf",
    ".pem",
    ".key",
    ".cert",
}


def canonical_resolve(path_str: str | Path) -> Path:
    """Resolve a path to its canonical, absolute representation."""
    try:
        p = Path(path_str)
        return p.resolve(strict=False)
    except Exception as e:
        raise PathSecurityException(f"Invalid path format: {e}")


def validate_project_root(root_path: str | Path) -> Path:
    """Validate that a registered project root exists, is a directory, and is accessible."""
    resolved = canonical_resolve(root_path)
    if not resolved.exists():
        raise PathSecurityException(f"Project path does not exist: {resolved}")
    if not resolved.is_dir():
        raise PathSecurityException(f"Project path is not a directory: {resolved}")
    return resolved


def validate_path_within_root(
    relative_or_abs_path: str | Path,
    root_path: str | Path,
    must_exist: bool = False,
) -> Path:
    """Ensure that the target path resolves strictly inside the registered project root.

    Protects against:
    - '..' directory traversal
    - Absolute path override targeting different drives or system folders
    - Symlinks / junctions resolving outside root
    - Windows case-sensitivity quirks
    """
    resolved_root = canonical_resolve(root_path)

    # If input is relative, join with root
    p = Path(relative_or_abs_path)
    if not p.is_absolute():
        target = resolved_root / p
    else:
        target = p

    resolved_target = canonical_resolve(target)

    # Check for drive letter mismatch on Windows
    if resolved_root.drive.lower() != resolved_target.drive.lower():
        raise PathSecurityException(
            f"Cross-drive access rejected: '{resolved_target}' is outside root '{resolved_root}'"
        )

    # Use resolved case normalization for Windows
    try:
        # relative_to will succeed if target is within root
        resolved_target.relative_to(resolved_root)
    except ValueError:
        # Try case-insensitive check for Windows
        norm_target = str(resolved_target).lower()
        norm_root = str(resolved_root).lower().rstrip("\\/") + "\\"
        if not norm_target.startswith(norm_root) and norm_target != str(resolved_root).lower():
            raise PathSecurityException(
                f"Path traversal detected: '{relative_or_abs_path}' resolves outside project root '{resolved_root}'"
            )

    if must_exist and not resolved_target.exists():
        raise PathSecurityException(f"Target file does not exist: {resolved_target}")

    return resolved_target


def is_excluded_path(
    path: Path,
    custom_excluded_dirs: Optional[Set[str]] = None,
    custom_excluded_files: Optional[Set[str]] = None,
) -> bool:
    """Check whether a path matches default or configured exclusion policies."""
    excluded_dirs = DEFAULT_EXCLUDED_DIRS | (custom_excluded_dirs or set())
    excluded_files = DEFAULT_EXCLUDED_FILES | (custom_excluded_files or set())

    # Check any parent parts
    parts = set(p.lower() for p in path.parts)
    if any(part in {d.lower() for d in excluded_dirs} for part in parts):
        return True

    # Check file name
    if path.name.lower() in {f.lower() for f in excluded_files}:
        return True

    # Check extension
    if path.suffix.lower() in DEFAULT_EXCLUDED_EXTENSIONS:
        return True

    return False
