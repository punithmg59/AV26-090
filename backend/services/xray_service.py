import os
import json
import uuid
import logging
import traceback
import numpy as np
from fastapi import UploadFile
from database.database import SessionLocal
from database.db_models import ChestXrayPrediction
from models.chest_xray.prediction.predict_xray import XrayPredictor
from models.chest_xray.visualization.gradcam_xray import generate_heatmap
from responses.groq_service import generate_medical_report, generate_fallback_report
from responses.report_validator import sanitize_report

# Configure logger
logger = logging.getLogger(__name__)

# Initialize Predictor (Centralized models folder)
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../saved_models'))
predictor = XrayPredictor(MODEL_DIR)

# Directories
UPLOADS_DIR = "uploads/xray"
HEATMAPS_DIR = "outputs/heatmaps"
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(HEATMAPS_DIR, exist_ok=True)

async def process_chest_xray(file: UploadFile):
    """
    Optimized Production Pipeline for Chest X-ray analysis.
    """
    unique_id = str(uuid.uuid4())
    image_path = None
    
    try:
        logger.info(f"Processing upload: {file.filename}")
        
        # 1. Read & Save File
        file_bytes = await file.read()
        
        # Log image stats
        nparr = np.frombuffer(file_bytes, np.uint8)
        logger.info(f"Image received: {len(file_bytes)} bytes, shape/size analysis: {nparr.shape}")
        
        file_ext = os.path.splitext(file.filename)[1]
        image_filename = f"{unique_id}{file_ext}"
        image_path = os.path.join(UPLOADS_DIR, image_filename)
        
        with open(image_path, "wb") as f:
            f.write(file_bytes)
        
        # 2. Predict (High priority)
        prediction_result = predictor.predict(file_bytes)
        pred_class = prediction_result.get("class_name", "UNKNOWN")
        confidence = prediction_result.get("confidence", 0.0)
        
        # 3. Determine Risk
        risk_level = "LOW RISK"
        if pred_class == "PNEUMONIA":
            risk_level = "HIGH RISK" if confidence > 80 else "MODERATE RISK"
            
        # 4. Generate Heatmap (Visual Insight)
        heatmap_filename = f"heatmap_{unique_id}.jpg"
        heatmap_path = os.path.join(HEATMAPS_DIR, heatmap_filename)
        
        final_heatmap_path = None
        try:
            model = predictor.get_model()
            if model:
                success = generate_heatmap(file_bytes, model, heatmap_path)
                if success:
                    final_heatmap_path = heatmap_path
        except Exception as he:
            logger.error(f"Heatmap generation skipped: {he}")

        # 5. Generate Medical Report
        report_json = None
        try:
            report_input = {
                "disease_type": "Chest X-Ray Analysis",
                "prediction": pred_class,
                "confidence": confidence,
                "risk_level": risk_level,
                "scan_type": "Radiography",
                "findings": (
                    f"Automated AI scan detected features consistent with {pred_class} with {confidence:.1f}% confidence. "
                    f"Risk level is classified as {risk_level}. "
                    f"Diagnostic focus was guided by Grad-CAM heatmap analysis (Available: {final_heatmap_path is not None})."
                )
            }
            raw_report = generate_medical_report(report_input)
            report_json = sanitize_report(raw_report, report_input)
        except Exception as re:
            logger.error(f"Report generation failed, using fallback: {re}")
            report_json = generate_fallback_report(report_input)

        # 6. Save to Database
        db = SessionLocal()
        record_id = None
        try:
            db_record = ChestXrayPrediction(
                prediction=pred_class,
                confidence=confidence,
                risk_level=risk_level,
                image_path=image_path,
                heatmap_path=final_heatmap_path,
                report=json.dumps(report_json) if report_json else "{}"
            )
            db.add(db_record)
            db.commit()
            db.refresh(db_record)
            record_id = db_record.id
        except Exception as dbe:
            db.rollback()
            logger.error(f"Database save failed: {dbe}")
        finally:
            db.close()

        return {
            "success": True,
            "id": record_id,
            "prediction": pred_class,
            "confidence": round(confidence, 1),
            "risk_level": risk_level,
            "image_path": image_path,
            "heatmap_path": final_heatmap_path,
            "report": report_json
        }

    except Exception as e:
        logger.error(f"Critical error in X-ray pipeline: {str(e)}")
        logger.error(traceback.format_exc())
        # Cleanup file if failed
        if image_path and os.path.exists(image_path):
            try: os.remove(image_path)
            except: pass
        raise e
