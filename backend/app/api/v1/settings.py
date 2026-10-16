from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.config import settings as app_cfg
from backend.app.db.session import get_db
from backend.app.models.entities import Setting
from backend.app.schemas.api import AppSettingsSchema

router = APIRouter(tags=["settings"])


@router.get("/settings", response_model=AppSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    return AppSettingsSchema(
        active_llm_provider=app_cfg.DEFAULT_LLM_PROVIDER,
        ollama_base_url=app_cfg.OLLAMA_BASE_URL,
        ollama_default_model=app_cfg.OLLAMA_DEFAULT_MODEL,
        command_timeout_seconds=app_cfg.COMMAND_TIMEOUT_SECONDS,
        max_file_size_mb=max(1, app_cfg.MAX_FILE_SIZE_BYTES // (1024 * 1024)),
        db_status="connected",
    )


@router.put("/settings", response_model=AppSettingsSchema)
def update_settings(payload: AppSettingsSchema, db: Session = Depends(get_db)):
    # Save overrides to DB
    for k, v in payload.model_dump().items():
        existing = db.query(Setting).filter(Setting.key == k).first()
        if existing:
            existing.value = str(v)
        else:
            db.add(Setting(key=k, value=str(v)))
    db.commit()
    return payload
