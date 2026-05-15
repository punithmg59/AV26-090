from fastapi import APIRouter
from app.models.loader import model_loader

router = APIRouter(tags=["System"])

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/models/status")
async def model_status():
    return {
        "xray_model_loaded": model_loader.get_xray_model() is not None,
        "ct_model_loaded": model_loader.get_ct_model() is not None,
        "backend_status": "ready"
    }
