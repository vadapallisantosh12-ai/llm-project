import os
import sys
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

# Automatically inject project root and backend dir to sys.path to guarantee imports resolve
CURRENT_FILE = Path(__file__).resolve()
APP_DIR = CURRENT_FILE.parent.parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)


class Settings(BaseSettings):
    API_V1_PREFIX: str = "/api/v1"
    APP_NAME: str = "DevAgent AI"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # CORS configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ]

    # Database & Storage
    APP_DATA_DIR: str = str(PROJECT_ROOT / "app_data")
    DATABASE_URL: str = f"sqlite:///{PROJECT_ROOT}/app_data/database/devagent.db"

    # Security & limits
    COMMAND_TIMEOUT_SECONDS: int = 30
    MAX_FILE_SIZE_BYTES: int = 1048576
    MAX_OUTPUT_CHARS: int = 10000

    # AI Provider Settings
    DEFAULT_LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    HOSTED_LLM_PROVIDER: str = ""
    HOSTED_LLM_BASE_URL: str = ""
    HOSTED_LLM_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_DEFAULT_MODEL: str = "qwen2.5-coder:7b"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
