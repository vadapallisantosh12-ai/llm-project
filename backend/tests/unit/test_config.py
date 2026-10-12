"""Unit tests for configuration loading and validation."""

from pathlib import Path

from backend.app.core.config import Settings


def test_default_settings():
    """Verify default settings values."""
    s = Settings()
    assert s.APP_NAME == "DevAgent AI"
    assert s.PORT == 8000
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert s.DEFAULT_LLM_PROVIDER in ["mock", "ollama", "hosted"]
    assert s.COMMAND_TIMEOUT_SECONDS > 0
    assert s.MAX_FILE_SIZE_BYTES > 0


def test_cors_origins_parsing():
    """Verify comma-separated and JSON list CORS origin parsing."""
    s = Settings(CORS_ORIGINS="http://test.local:5000,http://app.local:3000")
    assert "http://test.local:5000" in s.CORS_ORIGINS
    assert "http://app.local:3000" in s.CORS_ORIGINS

    s2 = Settings(CORS_ORIGINS='["http://example.com"]')
    assert s2.CORS_ORIGINS == ["http://example.com"]


def test_resolve_paths(tmp_path: Path):
    """Verify path resolution for database URL."""
    s = Settings(APP_DATA_DIR=tmp_path, DATABASE_URL="")
    s.resolve_paths()
    assert "sqlite:///" in s.DATABASE_URL
    assert "devagent.db" in s.DATABASE_URL
