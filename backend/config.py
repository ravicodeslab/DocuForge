"""
Application configuration — reads from .env via pydantic-settings.
"""
from pydantic_settings import BaseSettings
from typing import List


from pydantic import validator


class Settings(BaseSettings):
    MAX_FILE_SIZE_MB: int = 50
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "outputs"
    CLEANUP_INTERVAL_SECONDS: int = 3600
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @validator("CORS_ORIGINS", pre=True)
    def split_cors_origins(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
