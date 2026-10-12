"""Secrets redaction and detection utility."""

import re
from typing import List, Pattern, Tuple

SECRET_RULES: List[Tuple[str, Pattern[str]]] = [
    ("OPENAI_KEY", re.compile(r"sk-[a-zA-Z0-9]{20,}")),
    ("GENERIC_API_KEY", re.compile(r"(?i)(api[_-]?key[\s:=]+)['\"]?([a-zA-Z0-9_\-\.]{15,})['\"]?")),
    ("BEARER_TOKEN", re.compile(r"(?i)(bearer\s+)[a-zA-Z0-9_\-\.]{15,}")),
    ("PRIVATE_KEY", re.compile(r"-----BEGIN [A-Z ]+PRIVATE KEY-----[^-]+-----END [A-Z ]+PRIVATE KEY-----", re.DOTALL)),
    ("PASSWORD_ASSIGN", re.compile(r"(?i)(password[\s:=]+)['\"]?([^'\"\s]{6,})['\"]?")),
]


def redact_secrets(text: str) -> str:
    """Scan and redact known secret formats from code chunks or user logs."""
    if not text:
        return text

    redacted = text
    for name, pattern in SECRET_RULES:
        if name == "OPENAI_KEY":
            redacted = pattern.sub("[REDACTED_API_KEY]", redacted)
        elif name == "PRIVATE_KEY":
            redacted = pattern.sub("[REDACTED_PRIVATE_KEY]", redacted)
        elif name in ("GENERIC_API_KEY", "PASSWORD_ASSIGN", "BEARER_TOKEN"):
            redacted = pattern.sub(r"\1[REDACTED]", redacted)

    return redacted


def contains_obvious_secret(text: str) -> bool:
    """Return True if obvious high-entropy secret patterns are detected."""
    for _, pattern in SECRET_RULES:
        if pattern.search(text):
            return True
    return False
