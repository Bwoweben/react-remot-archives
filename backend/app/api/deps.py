# app/api/deps.py
from typing import Generator
from app.db.session import SessionLocal

def get_db() -> Generator:
    """
    Dependency to get a database session.
    Yields a session and ensures it's closed afterward.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()