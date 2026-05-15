from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.models.loader import model_loader
from app.routes import predict_routes, health_routes
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models once at startup
    model_loader.load_models()
    yield
    # Clean up if needed

from fastapi.staticfiles import StaticFiles
import os

# Create directories if they don't exist
os.makedirs("backend/uploads", exist_ok=True)
os.makedirs("backend/outputs/pdfs", exist_ok=True)

app = FastAPI(
    title="AI Healthcare Platform API",
    description="Production-ready API for X-ray, CT Scan and MRI analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Static Files
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")
app.mount("/reports", StaticFiles(directory="backend/outputs/pdfs"), name="reports")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(predict_routes.router)
app.include_router(health_routes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AI Healthcare API", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
