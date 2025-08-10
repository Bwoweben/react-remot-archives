# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import API router (contains all endpoint routes) and app settings
from app.api.api_v1.api import api_router
from app.core.config import settings

# Create the FastAPI app instance with title and OpenAPI documentation URL
app = FastAPI(
    title="IoT Meter API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- Configure CORS Middleware ---
# Allows requests from specified frontend origins (e.g., React dashboard) to access the API
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],  # Allowed origins list
        allow_credentials=True,   # Allows cookies/credentials
        allow_methods=["*"],       # Allow all HTTP methods (GET, POST, etc.)
        allow_headers=["*"],       # Allow all headers
    )

# --- Register API Routes ---
# Mounts all versioned API endpoints under the prefix (e.g., "/api/v1")
app.include_router(api_router, prefix=settings.API_V1_STR)

# --- Health Check / Root Endpoint ---
# Simple GET endpoint to verify the API is running
@app.get("/")
def read_root():
    return {"message": "Welcome to the IoT Meter API"}
