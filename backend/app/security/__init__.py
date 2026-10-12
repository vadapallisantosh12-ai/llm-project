"""Security module for DevAgent AI."""

from backend.app.security.paths import (
    canonical_resolve,
    is_excluded_path,
    validate_path_within_root,
    validate_project_root,
)
from backend.app.security.secrets import contains_obvious_secret, redact_secrets

__all__ = [
    "canonical_resolve",
    "validate_project_root",
    "validate_path_within_root",
    "is_excluded_path",
    "redact_secrets",
    "contains_obvious_secret",
]
