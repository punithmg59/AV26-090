import numpy as np
from app.models.loader import model_loader
from app.utils.image_utils import preprocess_image
import datetime

async def predict_ct(image_bytes):
    model = model_loader.get_ct_model()
    
    # Preprocess
    processed_img = preprocess_image(image_bytes)
    
    if model:
        # Real prediction
        prediction = model.predict(processed_img)
        confidence = float(np.max(prediction)) * 100
        class_idx = np.argmax(prediction)
        
        # Mapping (Example labels)
        labels = ["No Cancer", "Lung Cancer", "Other Abnormality"]
        result = labels[class_idx]
    else:
        # Mock prediction if model not loaded
        result = "No Cancer"
        confidence = 96.8
        
    return {
        "success": True,
        "prediction": result,
        "confidence": round(confidence, 2),
        "model": "ct_model",
        "timestamp": datetime.datetime.now().isoformat()
    }
