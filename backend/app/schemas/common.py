"""Common schemas and response envelopes."""

from datetime import datetime, timezone
from typing import Any, Dict, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ErrorDetail(BaseModel):
    """Structured error payload format."""

    code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ErrorResponse(BaseModel):
    """Standardized error envelope."""

    error: ErrorDetail


class SuccessResponse(BaseModel, Generic[DataT]):
    """Standardized success envelope."""

    success: bool = True
    data: DataT
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
