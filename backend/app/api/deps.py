from typing import Generator
from app.db.session import SessionLocal
from app.db.mongo_session import get_mongo_db as get_mongo_manager # Import the mongo dependency

def get_db() -> Generator:
    """
    Dependency to get a SQL database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Re-export the mongo dependency so it can be imported from deps
get_mongo_db = get_mongo_manager
