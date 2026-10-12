"""Application lifecycle event handlers (startup & shutdown)."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.app.core.config import settings
from backend.app.core.logging import setup_logging
from backend.app.db.base import Base
from backend.app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for FastAPI application."""
    # Ensure all required directories exist
    app_data_path = settings.APP_DATA_DIR
    (app_data_path / "database").mkdir(parents=True, exist_ok=True)
    (app_data_path / "logs").mkdir(parents=True, exist_ok=True)
    (app_data_path / "backups").mkdir(parents=True, exist_ok=True)
    (app_data_path / "temporary").mkdir(parents=True, exist_ok=True)

    # Initialize logging
    logger = setup_logging(
        log_dir=app_data_path / "logs",
        log_level=settings.LOG_LEVEL,
    )
    logger.info("Starting DevAgent AI v%s in %s mode", settings.APP_VERSION, settings.ENVIRONMENT)

    # Initialize database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas verified at %s", settings.DATABASE_URL)
    except Exception as e:
        logger.error("Failed to initialize database schemas: %s", e)
        raise

    yield

    logger.info("DevAgent AI shutting down gracefully.")
