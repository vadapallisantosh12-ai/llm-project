"""Unit tests for path validation and security controls."""

from pathlib import Path

import pytest

from backend.app.core.exceptions import PathSecurityException
from backend.app.security.paths import (
    is_excluded_path,
    validate_path_within_root,
    validate_project_root,
)


def test_validate_project_root_valid(tmp_path: Path):
    """Test validating an existing directory as project root."""
    resolved = validate_project_root(tmp_path)
    assert resolved == tmp_path.resolve()


def test_validate_project_root_nonexistent(tmp_path: Path):
    """Test that a nonexistent path raises PathSecurityException."""
    fake_path = tmp_path / "does_not_exist_folder"
    with pytest.raises(PathSecurityException) as exc:
        validate_project_root(fake_path)
    assert "does not exist" in str(exc.value)


def test_validate_project_root_file_not_dir(tmp_path: Path):
    """Test that pointing to a regular file instead of a folder raises PathSecurityException."""
    file_path = tmp_path / "file.txt"
    file_path.write_text("hello", encoding="utf-8")
    with pytest.raises(PathSecurityException) as exc:
        validate_project_root(file_path)
    assert "not a directory" in str(exc.value)


def test_validate_path_within_root_safe(tmp_path: Path):
    """Test accessing a valid file inside the project root."""
    sub_file = tmp_path / "src" / "index.ts"
    sub_file.parent.mkdir()
    sub_file.write_text("export const x = 1;", encoding="utf-8")

    # Relative path
    validated = validate_path_within_root("src/index.ts", tmp_path, must_exist=True)
    assert validated == sub_file.resolve()

    # Absolute path within root
    validated_abs = validate_path_within_root(sub_file, tmp_path, must_exist=True)
    assert validated_abs == sub_file.resolve()


def test_validate_path_within_root_traversal_blocked(tmp_path: Path):
    """Test that traversal attempts using '..' are blocked."""
    with pytest.raises(PathSecurityException) as exc:
        validate_path_within_root("../outside.txt", tmp_path)
    assert "resolves outside" in str(exc.value)

    with pytest.raises(PathSecurityException) as exc:
        validate_path_within_root("src/../../outside.txt", tmp_path)
    assert "resolves outside" in str(exc.value)


def test_is_excluded_path():
    """Test default exclusion filtering."""
    assert is_excluded_path(Path("c:/project/.git/config")) is True
    assert is_excluded_path(Path("c:/project/.venv/Scripts/python.exe")) is True
    assert is_excluded_path(Path("c:/project/node_modules/package.json")) is True
    assert is_excluded_path(Path("c:/project/__pycache__/module.pyc")) is True
    assert is_excluded_path(Path("c:/project/.env")) is True
    assert is_excluded_path(Path("c:/project/secrets/id_rsa")) is True
    assert is_excluded_path(Path("c:/project/binary.exe")) is True

    # Safe allowed files
    assert is_excluded_path(Path("c:/project/src/main.py")) is False
    assert is_excluded_path(Path("c:/project/package.json")) is False
    assert is_excluded_path(Path("c:/project/README.md")) is False
