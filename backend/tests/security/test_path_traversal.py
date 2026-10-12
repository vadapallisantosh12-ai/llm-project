"""Security regression tests for path traversal, escape attempts, and secret exposure."""

from pathlib import Path

import pytest

from backend.app.core.exceptions import PathSecurityException
from backend.app.security.paths import is_excluded_path, validate_path_within_root
from backend.app.security.secrets import contains_obvious_secret, redact_secrets


def test_path_traversal_attack_vectors(temp_project_dir: Path):
    """Test various directory traversal attack patterns."""
    attacks = [
        "../Windows/System32",
        "..\\..\\Windows\\System32",
        "src/../../outside_secret.txt",
        "src/../../../etc/passwd",
        "nested/../../../../Users",
    ]
    for vector in attacks:
        with pytest.raises(PathSecurityException) as exc:
            validate_path_within_root(vector, temp_project_dir)
        assert "resolves outside project root" in str(exc.value)


def test_secret_redaction():
    """Verify that sensitive patterns are redacted properly."""
    raw_text = (
        "Authorization: Bearer my-secret-jwt-token-abcdef123456\n"
        "api_key = 'sk-proj123456789012345678901234567890'\n"
        "password = 'mySuperSecretPassword123'\n"
    )

    assert contains_obvious_secret(raw_text) is True

    redacted = redact_secrets(raw_text)
    assert "sk-proj123456789012345678901234567890" not in redacted
    assert "[REDACTED" in redacted
    assert "my-secret-jwt-token-abcdef123456" not in redacted


def test_excluded_security_files():
    """Ensure security-critical files are always flagged as excluded."""
    assert is_excluded_path(Path("c:/project/.env")) is True
    assert is_excluded_path(Path("c:/project/.env.local")) is True
    assert is_excluded_path(Path("c:/project/keys/id_rsa")) is True
    assert is_excluded_path(Path("c:/project/keys/id_ed25519")) is True
    assert is_excluded_path(Path("c:/project/certs/server.pem")) is True
