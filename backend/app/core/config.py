"""
Application Configuration Settings
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import os
from pydantic_settings import BaseSettings

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Students Performance Estimation System Using AI"
    PROJECT_OWNER: str = "Nithyasri S"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-nithyasri-mca-project-2026-secure-jwt-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'student_performance.db'))}"
    )

    # MongoDB Atlas Configuration
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb+srv://arshatestid_db:Abc123.%40@arshatest.exg6eut.mongodb.net/?appName=arshatest"
    )
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "student_performance_ai")
    
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
