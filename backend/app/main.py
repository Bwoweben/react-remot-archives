# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the main API router and settings
# Correct import
from app.api.api_v1.api import api_router
from app.core.config import settings

# Create the FastAPI application instance
app = FastAPI(
    title="IoT Meter API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- Set up CORS (Cross-Origin Resource Sharing) Middleware ---
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# --- Include the API Router ---
# This line incorporates all the endpoints defined in the /api/api_v1/endpoints/ directory.
app.include_router(api_router, prefix=settings.API_V1_STR)

# You can also add a simple root endpoint for health checks
@app.get("/")
def read_root():
    return {"message": "Welcome to the IoT Meter API"}