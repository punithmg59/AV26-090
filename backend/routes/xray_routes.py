from fastapi import APIRouter, HTTPException, UploadFile, File
from services.xray_service import process_chest_xray

router = APIRouter(prefix="/api/xray", tags=["Chest X-ray"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".dcm"}

@router.post("/predict")
async def predict_chest_xray(file: UploadFile = File(...)):
    """
    Upload a chest X-ray image for AI disease prediction.
    Generates a prediction, confidence score, Grad-CAM heatmap, and medical report.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    import os
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
        
    try:
        result = await process_chest_xray(file)
        return result
    except Exception as e:
        print(f"X-ray processing error: {e}")
        raise HTTPException(status_code=500, detail="Error processing X-ray image")

@router.get("/health")
def health_check():
    """
    Check if the Chest X-ray module is active.
    """
    return {"status": "ok", "module": "Chest X-ray"}
