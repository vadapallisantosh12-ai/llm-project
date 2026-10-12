"""Main FastAPI application entry point for DevAgent AI."""

import logging
import time
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.api.v1 import api_v1_router
from backend.app.core.config import settings
from backend.app.core.exceptions import DevAgentException, format_error_response
from backend.app.core.lifecycle import lifespan

logger = logging.getLogger("devagent.main")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Middleware attaching unique request IDs and measuring latency."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        start_time = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
        return response


def create_app() -> FastAPI:
    """Application factory for DevAgent AI."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="DevAgent AI — An Intelligent AI Software Development Platform",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # 1. Attach Request Context Middleware
    app.add_middleware(RequestContextMiddleware)

    # 2. CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Custom Exception Handlers for consistent API error responses
    @app.exception_handler(DevAgentException)
    async def devagent_exception_handler(request: Request, exc: DevAgentException):
        logger.warning("Domain exception [%s]: %s (details: %s)", exc.code, exc.message, exc.details)
        return format_error_response(
            request=request,
            code=exc.code,
            message=exc.message,
            details=exc.details,
            status_code=exc.status_code,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning("Validation failure: %s", exc.errors())
        # Clean errors for JSON serialization
        cleaned_errors = []
        for err in exc.errors():
            cleaned_errors.append({
                "loc": [str(x) for x in err.get("loc", [])],
                "msg": err.get("msg", ""),
                "type": err.get("type", ""),
            })
        return format_error_response(
            request=request,
            code="VALIDATION_ERROR",
            message="Invalid request payload format",
            details={"errors": cleaned_errors},
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled server exception: %s", exc)
        return format_error_response(
            request=request,
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred",
            details={"exception": str(exc)} if settings.DEBUG else {},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # 4. Root Welcome Route
    @app.get("/", tags=["Root"])
    def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "operational",
            "api_v1_docs": "/docs",
            "health_check": f"{settings.API_V1_PREFIX}/health",
        }

    # 5. Include API v1 routes
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()
