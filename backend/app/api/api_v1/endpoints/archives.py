# app/api/api_v1/endpoints/archives.py
from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.db.mongo_session import get_mongo_db, MongoManager

router = APIRouter()

@router.get("/", response_model=List[Dict[Any, Any]])
def get_archives_data(mongo: MongoManager = Depends(get_mongo_db)):
    """
    Fetches the first 10 documents from the 'archives' collection.
    """
    # Use the shortcut to access the collection
    # Note: MongoDB IDs are not directly JSON serializable, so we must exclude them
    # or convert them to strings for a real application.
    documents = list(mongo.archives.find({}, {'_id': 0}).limit(10))
    return documents