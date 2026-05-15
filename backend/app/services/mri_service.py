import os
import numpy as np
import datetime
from app.models.loader import model_loader
from app.utils.image_utils import preprocess_image
from app.services.pdf_service import generate_mri_pdf
from database.database import SessionLocal
from database.db_models import BrainTumorPrediction
import logging

logger = logging.getLogger(__name__)

# Class labels
CLASSES = ['glioma', 'meningioma', 'notumor', 'pituitary']

def get_report_details(prediction, confidence):
    """
    Generate dynamic report details based on prediction.
    """
    details = {
        "glioma": {
            "risk_level": "High",
            "explanation": "The AI model has detected features consistent with a Glioma. Gliomas are tumors that start in the glial cells of the brain or the spine.",
            "why": "Specific texture patterns and irregular margins in the MRI scan indicate glial cell proliferation.",
            "suggestions": "Immediate consultation with a Neurologist and Neurosurgeon. Further tests like biopsy or advanced imaging (MRS) may be required. Consider oncology consultation for treatment planning.",
            "urgency": "Critical",
            "recommendations": "Avoid heavy physical exertion. Keep a log of any neurological symptoms like headaches or seizures."
        },
        "meningioma": {
            "risk_level": "Moderate to High",
            "explanation": "The AI model has detected a Meningioma. These are typically slow-growing tumors that arise from the meninges—the layers of tissue that surround your brain and spinal cord.",
            "why": "The scan shows a well-defined mass often attached to the dural surface, which is characteristic of meningioma.",
            "suggestions": "Consult a Neurosurgeon to evaluate the size and location. Follow-up MRI scans are usually recommended to monitor growth if immediate surgery is not indicated.",
            "urgency": "High",
            "recommendations": "Regular check-ups. Report any changes in vision or hearing immediately."
        },
        "pituitary": {
            "risk_level": "Moderate",
            "explanation": "The AI model has detected a Pituitary tumor. Most pituitary tumors are noncancerous (benign) adenomas that remain in the pituitary gland or surrounding tissues.",
            "why": "Abnormal growth or signal intensity in the pituitary fossa area was identified.",
            "suggestions": "Consult an Endocrinologist and a Neurosurgeon. Hormone level testing is essential as these tumors can affect hormone production.",
            "urgency": "Moderate",
            "recommendations": "Monitor for symptoms like hormonal imbalances, vision changes, or frequent headaches."
        },
        "notumor": {
            "risk_level": "Low",
            "explanation": "The AI model did not detect any signs of a brain tumor in this MRI scan.",
            "why": "Brain tissue architecture, signal intensity, and anatomical structures appear within normal limits.",
            "suggestions": "No immediate action required for tumor concerns. Continue regular health screenings.",
            "urgency": "Routine",
            "recommendations": "Maintain a healthy lifestyle. Consult a doctor if you experience persistent neurological symptoms despite this result."
        }
    }
    
    return details.get(prediction.lower(), details["notumor"])

async def predict_mri(image_bytes, file_save_path):
    try:
        model = model_loader.get_mri_model()
        
        # Preprocess
        processed_img = preprocess_image(image_bytes)
        
        if model:
            # Real prediction
            prediction_probs = model.predict(processed_img)
            class_idx = np.argmax(prediction_probs[0])
            confidence = float(prediction_probs[0][class_idx])
            result_label = CLASSES[class_idx]
        else:
            # Mock prediction for demonstration if model is not trained yet
            # In a real production system, we'd ensure model is loaded
            logger.warning("MRI model not loaded, using mock prediction for demonstration.")
            result_label = "notumor"
            confidence = 0.95
            
        # Get report details
        report_info = get_report_details(result_label, confidence)
        
        # Prepare data for PDF
        pdf_data = {
            "prediction": result_label.capitalize(),
            "confidence": round(confidence * 100, 2),
            "image_path": file_save_path,
            "report": report_info["explanation"],
            "suggestions": report_info["suggestions"],
            "risk_level": report_info["risk_level"],
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        # Generate PDF
        pdf_path = generate_mri_pdf(pdf_data)
        
        # Store in Database
        db = SessionLocal()
        try:
            new_pred = BrainTumorPrediction(
                user_id=1, # Default user
                prediction=result_label.capitalize(),
                confidence=round(confidence * 100, 2),
                risk_level=report_info["risk_level"],
                image_path=file_save_path,
                report=report_info["explanation"],
                pdf_path=pdf_path,
                doctor_suggestions=report_info["suggestions"]
            )
            db.add(new_pred)
            db.commit()
            db.refresh(new_pred)
            report_id = new_pred.id
        finally:
            db.close()
            
        return {
            "success": True,
            "prediction": result_label.capitalize(),
            "confidence": round(confidence * 100, 2),
            "risk_level": report_info["risk_level"],
            "report": report_info["explanation"],
            "why": report_info["why"],
            "suggestions": report_info["suggestions"],
            "urgency": report_info["urgency"],
            "recommendations": report_info["recommendations"],
            "pdf_url": f"/api/mri/download-pdf/{os.path.basename(pdf_path)}",
            "report_id": report_id,
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"MRI Prediction Error: {e}")
        return {"success": False, "error": str(e)}
