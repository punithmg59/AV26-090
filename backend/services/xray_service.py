import os
import uuid
from fastapi import UploadFile
from database.database import SessionLocal
from database.db_models import ChestXrayPrediction
from models.chest_xray.prediction.predict_xray import XrayPredictor
from models.chest_xray.visualization.gradcam_xray import generate_heatmap
from responses.groq_service import generate_medical_report

# Initialize Predictor
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../models/chest_xray/saved'))
predictor = XrayPredictor(MODEL_DIR)

# Directories
UPLOADS_DIR = "uploads/xray"
HEATMAPS_DIR = "outputs/heatmaps"
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(HEATMAPS_DIR, exist_ok=True)

async def process_chest_xray(file: UploadFile):
    """
    Full pipeline for processing Chest X-ray images.
    """
    # 1. Read & Save File
    file_bytes = await file.read()
    file_ext = os.path.splitext(file.filename)[1]
    unique_id = str(uuid.uuid4())
    
    image_filename = f"{unique_id}{file_ext}"
    image_path = os.path.join(UPLOADS_DIR, image_filename)
    
    with open(image_path, "wb") as f:
        f.write(file_bytes)
        
    # 2. Predict
    prediction_result = predictor.predict(file_bytes)
    pred_class = prediction_result.get("class_name", "UNKNOWN")
    confidence = prediction_result.get("confidence", 0.0)
    
    # 3. Risk Level
    if pred_class == "PNEUMONIA":
        risk_level = "HIGH RISK" if confidence > 80 else "MODERATE RISK"
    else:
        risk_level = "LOW RISK"
        
    # 4. Generate Heatmap
    heatmap_filename = f"heatmap_{unique_id}.jpg"
    heatmap_path = os.path.join(HEATMAPS_DIR, heatmap_filename)
    
    heatmap_success = generate_heatmap(file_bytes, predictor.get_model(), heatmap_path)
    final_heatmap_path = heatmap_path if heatmap_success else None
    
    # 5. Generate AI Report (Using Groq)
    report_input = {
        "disease_type": "Chest X-Ray Analysis",
        "prediction": pred_class,
        "confidence": confidence,
        "risk_level": risk_level,
        "scan_type": "Radiography",
        "findings": f"Model detected features consistent with {pred_class}."
    }
    
    from responses.report_validator import sanitize_report
    # Customize groq service or use a specific prompt if needed
    raw_report_json = generate_medical_report(report_input) 
    report_json = sanitize_report(raw_report_json, report_input)
    
    # 6. Save to Database
    db = SessionLocal()
    try:
        db_record = ChestXrayPrediction(
            prediction=pred_class,
            confidence=confidence,
            risk_level=risk_level,
            image_path=image_path,
            heatmap_path=final_heatmap_path,
            report=str(report_json) # Store as string or adjust db model for JSON
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        record_id = db_record.id
    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")
        record_id = None
    finally:
        db.close()
        
    # 7. Return Result
    return {
        "id": record_id,
        "prediction": pred_class,
        "confidence": round(confidence, 1),
        "risk_level": risk_level,
        "image_path": image_path,
        "heatmap_path": final_heatmap_path,
        "report": report_json
    }
