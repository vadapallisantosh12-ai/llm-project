"""Code reviews API endpoints router."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def create_review_endpoint():
    """Create a code review (scheduled for Phase 8)."""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Code reviews will be implemented in Phase 8"},
    )
