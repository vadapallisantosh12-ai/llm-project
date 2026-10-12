"""Debugging assistant API endpoints router."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/debug", tags=["Debugging"])


@router.post("/analyze", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def analyze_error_endpoint():
    """Analyze a submitted error with relevant project context (scheduled for Phase 5)."""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Debugging assistant will be implemented in Phase 5"},
    )
