"""API Schemas package."""

from backend.app.schemas.common import ErrorDetail, ErrorResponse, SuccessResponse
from backend.app.schemas.health import HealthData, HealthResponse
from backend.app.schemas.project import ProjectCreateRequest, ProjectResponse

__all__ = [
    "ErrorDetail",
    "ErrorResponse",
    "SuccessResponse",
    "HealthData",
    "HealthResponse",
    "ProjectCreateRequest",
    "ProjectResponse",
]
