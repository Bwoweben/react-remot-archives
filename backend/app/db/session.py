from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import the settings instance from your config file
from app.core.config import settings

# Create the SQLAlchemy engine using the database URI from settings
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True # Helps manage connections that may have timed out
)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)