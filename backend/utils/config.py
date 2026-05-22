"""
Application configuration via environment variables.
Uses pydantic-settings for type-safe config with .env file support.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──
    DATABASE_URL: str = "sqlite:///./hireme_dev.db"

    # ── JWT ──
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 1440  # 24 hours

    # ── AI ──
    GEMINI_API_KEY: str = ""

    # ── Judge0 ──
    JUDGE0_API_URL: str = "https://judge0-ce.p.rapidapi.com"
    JUDGE0_API_KEY: str = ""

    # ── App ──
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
