"""Health and operational diagnostic endpoint."""

import platform
import sys

from fastapi import APIRouter, status

from backend.app.core.config import settings
from backend.app.db.session import check_db_connection
from backend.app.schemas.health import HealthData, HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, status_code=status.HTTP_200_OK)
def get_health() -> HealthResponse:
    """Return live application health status, database connectivity, and environment metadata."""
    db_connected = check_db_connection()
    db_status = "connected" if db_connected else "disconnected"
    overall_status = "healthy" if db_connected else "degraded"

    data = HealthData(
        status=overall_status,
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        database=db_status,
        active_llm_provider=settings.DEFAULT_LLM_PROVIDER,
        system_info={
            "platform": platform.platform(),
            "python_version": sys.version.split()[0],
            "os": platform.system(),
        },
    )

    return HealthResponse(
        status=overall_status,
        data=data,
    )
