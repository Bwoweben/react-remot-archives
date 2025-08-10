# app/core/config.py
import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # --- Google Cloud SQL Credentials ---
    PASSWORD: str
    PUBLIC_IP_ADDRESS: str
    DBNAME: str
    PROJECT_ID: str
    INSTANCE_NAME: str
    USERNAME: str
    
    # --- SQLAlchemy Database URI (Computed Property) ---
    # This is for connecting from your local machine
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"mysql+mysqlconnector://{self.USERNAME}:{self.PASSWORD}"
            f"@{self.PUBLIC_IP_ADDRESS}/{self.DBNAME}"
        )

    # --- Other App Settings ---
    SECRET_KEY: str = "yoursecretkey"

    # --- ADD THESE TWO SETTINGS ---
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

# Create a single, importable instance of the settings
settings = Settings()