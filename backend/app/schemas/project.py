"""Project schemas for DevAgent AI."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreateRequest(BaseModel):
    """Payload to register a local directory as a project."""

    name: str = Field(..., min_length=1, max_length=255, description="Human readable project name")
    root_path: str = Field(..., min_length=1, description="Absolute or resolvable directory path on Windows")
    description: Optional[str] = Field(default="", description="Optional project description")


class ProjectResponse(BaseModel):
    """Project representation returned by API."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    root_path: str
    description: Optional[str] = ""
    is_active: bool
    indexing_status: str
    file_count: int
    chunk_count: int
    created_at: datetime
    updated_at: datetime
