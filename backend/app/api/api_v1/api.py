# app/api/api_v1/api.py
from fastapi import APIRouter

# Import your individual endpoint routers
from .endpoints import stats, meters, auth # Add others as you create them

# This is the main router that will be imported by main.py
api_router = APIRouter()

# Include the individual routers, adding prefixes and tags for organization
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(meters.router, prefix="/meters", tags=["meters"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])