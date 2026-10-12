"""Application exceptions and error formatting."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import Request, status
from fastapi.responses import JSONResponse


class DevAgentException(Exception):
    """Base exception for all DevAgent AI domain errors."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class PathSecurityException(DevAgentException):
    """Raised when an operation attempts to violate path boundaries or security policies."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="SECURITY_PATH_VIOLATION",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )


class ResourceNotFoundException(DevAgentException):
    """Raised when an entity (project, file, task, patch) is not found."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class ValidationException(DevAgentException):
    """Raised when input validation fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class ProviderException(DevAgentException):
    """Raised when an LLM provider fails or is misconfigured."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="PROVIDER_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
        )


def format_error_response(
    request: Optional[Request],
    code: str,
    message: str,
    details: Any = None,
    status_code: int = 500,
) -> JSONResponse:
    """Format a consistent JSON error response."""
    request_id = getattr(request.state, "request_id", None) if request and hasattr(request, "state") else str(uuid.uuid4())
    payload = {
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    }
    return JSONResponse(status_code=status_code, content=payload)
