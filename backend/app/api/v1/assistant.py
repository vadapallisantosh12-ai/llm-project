"""Assistant API endpoints router."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.post("/chat", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def chat_endpoint():
    """Submit a project-aware assistant request (scheduled for Phase 4)."""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Assistant module will be implemented in Phase 4"},
    )
