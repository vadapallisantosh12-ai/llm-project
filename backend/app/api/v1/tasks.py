"""Agent tasks API endpoints router."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/tasks", tags=["Agent Tasks"])


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def create_task_endpoint():
    """Create a development agent task (scheduled for Phase 9)."""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Multi-step development agent will be implemented in Phase 9"},
    )
