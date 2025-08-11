# app/core/config.py
import os
from pydantic_settings import BaseSettings
from typing import List

# Settings class loads environment variables and centralizes app configuration
class Settings(BaseSettings):
    # --- Google Cloud SQL Credentials ---
    PASSWORD: str                # Database password
    PUBLIC_IP_ADDRESS: str       # Public IP for Cloud SQL instance
    DBNAME: str                  # Database name
    PROJECT_ID: str              # GCP project ID
    INSTANCE_NAME: str           # Cloud SQL instance name
    USERNAME: str                # Database username
    
    # --- SQLAlchemy Database URI (Computed Property) ---
    # Builds the DB connection string for SQLAlchemy using MySQL Connector
    # This URI is used to connect to the database from your app
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"mysql+mysqlconnector://{self.USERNAME}:{self.PASSWORD}"
            f"@{self.PUBLIC_IP_ADDRESS}/{self.DBNAME}"
        )

    # --- Security & App Metadata ---
    SECRET_KEY: str = "yoursecretkey"   # Secret key for signing tokens (JWT, sessions)

    # --- API & CORS Settings ---
    API_V1_STR: str = "/api/v1"         # Prefix for versioned API routes
    BACKEND_CORS_ORIGINS: List[str] = [ # Allowed origins for frontend apps (React dev servers, etc.)
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    MONGO_CONNECTION_STRING: str

    # --- Pydantic Settings Config ---
    # Reads environment variables from .env file
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

# Create a single, globally importable settings object
settings = Settings()
