"""
Brain Tumor MRI Prediction Service.
Orchestrates: upload -> predict -> report -> database -> response.
"""
import os
import uuid
import json
import logging
import traceback
import numpy as np
from fastapi import UploadFile

from database.database import SessionLocal
from database.db_models import BrainTumorPrediction
from models.brain_tumor.prediction.predict_mri import BrainTumorPredictor
from responses.groq_service import generate_medical_report, generate_fallback_report
from responses.report_validator import sanitize_report

logger = logging.getLogger(__name__)

# Initialize predictor singleton (model loaded once at import time)
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'saved_models'))
predictor = BrainTumorPredictor(MODEL_DIR)

# Directories
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'mri')
UPLOADS_DIR = os.path.abspath(UPLOADS_DIR)
os.makedirs(UPLOADS_DIR, exist_ok=True)


def _determine_risk_level(prediction, confidence):
    """Determine clinical risk level from prediction and confidence."""
    if prediction == "notumor":
        return "LOW RISK"
    # Tumor detected
    if confidence > 85:
        return "HIGH RISK"
    elif confidence > 60:
        return "MODERATE RISK"
    else:
        return "LOW RISK"


def _determine_urgency(risk_level):
    """Map risk level to urgency."""
    mapping = {
        "HIGH RISK": "Urgent",
        "MODERATE RISK": "Moderate",
        "LOW RISK": "Routine"
    }
    return mapping.get(risk_level, "Routine")


async def process_brain_mri(file: UploadFile):
    """
    Full production pipeline for Brain Tumor MRI analysis.
    
    Flow: Upload -> Preprocess -> Predict -> Report -> DB -> Response
    """
    unique_id = str(uuid.uuid4())
    image_path = None

    try:
        logger.info(f"[BRAIN SERVICE] Processing upload: {file.filename}")

        # ============================
        # 1. Read & Save uploaded file
        # ============================
        file_bytes = await file.read()
        logger.info(f"[BRAIN SERVICE] Image received: {len(file_bytes)} bytes")

        file_ext = os.path.splitext(file.filename)[1] or '.png'
        image_filename = f"{unique_id}{file_ext}"
        image_path = os.path.join(UPLOADS_DIR, image_filename)

        with open(image_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"[BRAIN SERVICE] Saved to: {image_path}")

        # ============================
        # 2. Run AI Prediction
        # ============================
        prediction_result = predictor.predict(file_bytes)
        pred_class = prediction_result.get("class_name", "UNKNOWN")
        display_name = prediction_result.get("display_name", pred_class)
        confidence = prediction_result.get("confidence", 0.0)
        all_probs = prediction_result.get("all_probabilities", {})

        logger.info(f"[BRAIN SERVICE] Prediction: {pred_class} ({confidence:.1f}%)")

        # ============================
        # 3. Determine Risk Level
        # ============================
        risk_level = _determine_risk_level(pred_class, confidence)
        urgency = _determine_urgency(risk_level)

        # ============================
        # 4. Generate Medical Report via Groq
        # ============================
        report_json = None
        try:
            report_input = {
                "disease_type": "Brain Tumor MRI Analysis",
                "prediction": display_name,
                "confidence": confidence,
                "risk_level": risk_level,
                "scan_type": "MRI (Magnetic Resonance Imaging)",
                "all_probabilities": all_probs,
                "findings": (
                    f"Automated AI scan of brain MRI detected features consistent with '{display_name}' "
                    f"with {confidence:.1f}% confidence. "
                    f"Risk level is classified as {risk_level}. "
                    f"Class probabilities: {json.dumps(all_probs)}."
                )
            }
            raw_report = generate_medical_report(report_input)
            report_json = sanitize_report(raw_report, report_input)
            logger.info(f"[BRAIN SERVICE] Report generated successfully")
        except Exception as re:
            logger.error(f"[BRAIN SERVICE] Report generation failed, using fallback: {re}")
            report_json = generate_fallback_report(report_input)

        # ============================
        # 5. Save to Database
        # ============================
        db = SessionLocal()
        record_id = None
        try:
            db_record = BrainTumorPrediction(
                prediction=pred_class,
                confidence=confidence,
                risk_level=risk_level,
                image_path=image_path,
                report=json.dumps(report_json) if isinstance(report_json, dict) else str(report_json),
                doctor_suggestions=json.dumps(report_json.get("recommendations", [])) if isinstance(report_json, dict) else "[]"
            )
            db.add(db_record)
            db.commit()
            db.refresh(db_record)
            record_id = db_record.id
            logger.info(f"[BRAIN SERVICE] Saved to DB with id={record_id}")
        except Exception as dbe:
            db.rollback()
            logger.error(f"[BRAIN SERVICE] Database save failed: {dbe}")
        finally:
            db.close()

        # ============================
        # 6. Build Response
        # ============================
        return {
            "success": True,
            "id": record_id,
            "prediction": display_name,
            "prediction_class": pred_class,
            "confidence": round(confidence, 1),
            "risk_level": risk_level,
            "urgency": urgency,
            "all_probabilities": all_probs,
            "image_path": f"/uploads/mri/{image_filename}",
            "report": report_json.get("what_happened", "") if isinstance(report_json, dict) else str(report_json),
            "why_happened": report_json.get("why_happened", "") if isinstance(report_json, dict) else "",
            "suggestions": report_json.get("recommendations", []) if isinstance(report_json, dict) else [],
            "recommendations": report_json.get("recommendations", []) if isinstance(report_json, dict) else [],
            "urgency_level": report_json.get("urgency_level", urgency) if isinstance(report_json, dict) else urgency,
            "full_report": report_json
        }

    except Exception as e:
        logger.error(f"[BRAIN SERVICE] Critical pipeline error: {str(e)}")
        logger.error(traceback.format_exc())
        # Cleanup uploaded file on failure
        if image_path and os.path.exists(image_path):
            try:
                os.remove(image_path)
            except:
                pass
        raise e
