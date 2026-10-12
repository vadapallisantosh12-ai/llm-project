"""Unit tests for exception handling and error envelope formatting."""

from backend.app.core.exceptions import (
    PathSecurityException,
    ResourceNotFoundException,
    ValidationException,
    format_error_response,
)


def test_exception_classes():
    """Verify default error codes and HTTP status codes."""
    exc1 = PathSecurityException("Access denied")
    assert exc1.code == "SECURITY_PATH_VIOLATION"
    assert exc1.status_code == 403

    exc2 = ResourceNotFoundException("Not found")
    assert exc2.code == "RESOURCE_NOT_FOUND"
    assert exc2.status_code == 404

    exc3 = ValidationException("Invalid input")
    assert exc3.code == "VALIDATION_ERROR"
    assert exc3.status_code == 422


def test_format_error_response():
    """Verify standardized error envelope schema."""
    resp = format_error_response(
        request=None,
        code="TEST_ERROR",
        message="Test failure",
        details={"field": "test"},
        status_code=400,
    )
    assert resp.status_code == 400
    import json
    data = json.loads(resp.body.decode())
    assert "error" in data
    assert data["error"]["code"] == "TEST_ERROR"
    assert data["error"]["message"] == "Test failure"
    assert data["error"]["details"] == {"field": "test"}
    assert "timestamp" in data["error"]
    assert "request_id" in data["error"]
