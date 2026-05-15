from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.xray_predict import predict_xray
from app.services.ct_predict import predict_ct
from app.services.mri_service import predict_mri
from fastapi.responses import FileResponse
import logging
import os
import uuid

router = APIRouter(prefix="/predict", tags=["AI Predictions"])
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file(file: UploadFile):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG allowed.")
    
    # Check size (FastAPI doesn't provide size directly, need to read or check spool)
    # This is a basic check.
    return True

@router.post("/xray")
async def xray_endpoint(file: UploadFile = File(...)):
    validate_file(file)
    try:
        content = await file.read()
        result = await predict_xray(content)
        return result
    except Exception as e:
        logger.error(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ctscan")
async def ct_endpoint(file: UploadFile = File(...)):
    validate_file(file)
    try:
        content = await file.read()
        result = await predict_ct(content)
        return result
    except Exception as e:
        logger.error(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mri")
async def mri_endpoint(file: UploadFile = File(...)):
    # Validate extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "dcm"]:
        raise HTTPException(status_code=400, detail="Invalid file type. JPG, PNG, DICOM allowed.")
    
    try:
        # Save file
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        save_path = os.path.join("backend/uploads", filename)
        
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
            
        # Predict
        result = await predict_mri(content, save_path)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Prediction failed"))
            
        return result
    except Exception as e:
        logger.error(f"MRI Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download-pdf/{filename}")
async def download_pdf(filename: str):
    file_path = os.path.join("backend/outputs/pdfs", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf', filename=filename)
    raise HTTPException(status_code=404, detail="PDF not found")

@router.get("/mri-history")
async def mri_history():
    from database.database import SessionLocal
    from database.db_models import BrainTumorPrediction
    db = SessionLocal()
    try:
        history = db.query(BrainTumorPrediction).order_by(BrainTumorPrediction.created_at.desc()).all()
        return history
    except Exception as e:
        logger.error(f"History Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
