import platform
import sys
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.schemas.api import HealthResponse, HealthData, HealthSystemInfo

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "degraded"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        data=HealthData(
            status="healthy" if db_status == "connected" else "degraded",
            app_name=settings.APP_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            database=db_status,
            active_llm_provider=settings.DEFAULT_LLM_PROVIDER,
            system_info=HealthSystemInfo(
                platform=platform.platform(),
                python_version=sys.version.split()[0],
                os=platform.system(),
            ),
            timestamp=datetime.now(timezone.utc).isoformat(),
        ),
    )
