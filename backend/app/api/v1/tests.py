"""Tests API endpoints router."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/tests", tags=["Tests"])


@router.post("/generate", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def generate_tests_endpoint():
    """Generate tests for project (scheduled for Phase 7)."""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Test generation will be implemented in Phase 7"},
    )
