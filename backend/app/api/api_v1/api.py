from fastapi import APIRouter

# 1. Import your new devices endpoint router
from .endpoints import stats, meters, auth, co2, devices

api_router = APIRouter()

# 2. Include the new router with its own prefix
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(meters.router, prefix="/meters", tags=["meters"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(co2.router, prefix="/co2", tags=["co2"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])