"""DevAgent AI Configuration System."""

from pathlib import Path
from typing import List, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Core App
    APP_NAME: str = "DevAgent AI"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Directories & Database
    APP_DATA_DIR: Path = Field(default_factory=lambda: Path("app_data").resolve())
    DATABASE_URL: str = ""

    # LLM Settings
    DEFAULT_LLM_PROVIDER: str = "mock"  # "mock", "ollama", "hosted"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_DEFAULT_MODEL: str = "qwen2.5-coder:7b"

    HOSTED_LLM_PROVIDER: str = "openai"
    HOSTED_LLM_BASE_URL: str = "https://api.openai.com/v1"
    HOSTED_LLM_API_KEY: str = ""

    # Execution limits & security
    COMMAND_TIMEOUT_SECONDS: int = 30
    MAX_FILE_SIZE_BYTES: int = 1048576  # 1MB
    MAX_OUTPUT_CHARS: int = 100000

    # Logging
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    def resolve_paths(self) -> None:
        """Resolve app data directory and default database path relative to project."""
        if not self.APP_DATA_DIR.is_absolute():
            self.APP_DATA_DIR = Path(self.APP_DATA_DIR).resolve()

        if not self.DATABASE_URL:
            db_dir = self.APP_DATA_DIR / "database"
            db_path = db_dir / "devagent.db"
            self.DATABASE_URL = f"sqlite:///{db_path.as_posix()}"


settings = Settings()
settings.resolve_paths()
