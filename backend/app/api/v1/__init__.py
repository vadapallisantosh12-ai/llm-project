"""API v1 Router aggregation."""

from fastapi import APIRouter

from backend.app.api.v1.assistant import router as assistant_router
from backend.app.api.v1.debugging import router as debugging_router
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.patches import router as patches_router
from backend.app.api.v1.projects import router as projects_router
from backend.app.api.v1.reviews import router as reviews_router
from backend.app.api.v1.tasks import router as tasks_router
from backend.app.api.v1.tests import router as tests_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(assistant_router)
api_v1_router.include_router(debugging_router)
api_v1_router.include_router(patches_router)
api_v1_router.include_router(tests_router)
api_v1_router.include_router(reviews_router)
api_v1_router.include_router(tasks_router)

__all__ = ["api_v1_router"]
