from fastapi import APIRouter, HTTPException, UploadFile, File
from services.xray_service import process_chest_xray
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/xray", tags=["Chest X-ray"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

@router.post("/predict")
async def predict_chest_xray(file: UploadFile = File(...)):
    """
    Production Endpoint: Upload Chest X-ray for AI Prediction.
    Accepts: JPG, JPEG, PNG
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    import os
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{ext}'. Use: JPG, JPEG, or PNG."
        )
        
    try:
        logger.info(f"API Request: /predict/xray - File: {file.filename}")
        result = await process_chest_xray(file)
        return result
    except Exception as e:
        logger.error(f"Endpoint Error: {str(e)}")
        # Provide more detail to the user during debugging
        raise HTTPException(
            status_code=500, 
            detail=f"AI Prediction Pipeline Error: {str(e)}"
        )

@router.get("/history")
async def get_xray_history():
    """
    Fetch all chest X-ray analysis history.
    """
    from database.database import SessionLocal
    from database.db_models import ChestXrayPrediction
    
    db = SessionLocal()
    try:
        records = db.query(ChestXrayPrediction).order_by(ChestXrayPrediction.created_at.desc()).all()
        return records
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()

@router.get("/report/{report_id}")
async def get_xray_report(report_id: int):
    """
    Fetch a single X-ray report by ID.
    """
    from database.database import SessionLocal
    from database.db_models import ChestXrayPrediction
    
    db = SessionLocal()
    try:
        record = db.query(ChestXrayPrediction).filter(ChestXrayPrediction.id == report_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Report not found")
        return record
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching report: {e}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()

@router.get("/health")
def health_check():
    return {"status": "ok", "module": "Chest X-ray AI Core"}
