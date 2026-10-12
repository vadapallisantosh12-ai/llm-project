"""Health check response schemas."""

from datetime import datetime, timezone
from typing import Any, Dict

from pydantic import BaseModel, Field


class HealthData(BaseModel):
    """Health status details."""

    status: str = "healthy"
    app_name: str
    version: str
    environment: str
    database: str
    active_llm_provider: str
    system_info: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HealthResponse(BaseModel):
    """Health check response envelope."""

    status: str
    data: HealthData
