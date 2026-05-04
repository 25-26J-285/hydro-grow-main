import os
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import router as auth_router
from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.routers import esp32_gateway, sensors, actuators, camera, ml_inference
from app.services.discovery import run_discovery_service

os.makedirs(settings.IMAGES_DIR, exist_ok=True)

app = FastAPI(
    title="Hydro Grow API",
    description="Backend for Smart Hydroponic System",
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start UDP discovery service in background
threading.Thread(target=run_discovery_service, daemon=True).start()

# Register routers
app.include_router(auth_router)
app.include_router(esp32_gateway.router)
app.include_router(sensors.router)
app.include_router(actuators.router)
app.include_router(camera.router)
app.include_router(ml_inference.router)


@app.get("/healthz")
async def healthz():
    """Health check endpoint"""
    return {"status": "ok", "service": "Hydro Grow API"}
