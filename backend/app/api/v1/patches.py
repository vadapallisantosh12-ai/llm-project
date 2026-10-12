"""Patches API endpoints router."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/patches", tags=["Patches"])


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def create_patch_endpoint():
    """Create a proposed patch (scheduled for Phase 6)."""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Patch generation will be implemented in Phase 6"},
    )
