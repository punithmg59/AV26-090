import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

# Constants
MODEL_PATH = "backend/saved_models/brain_tumor_model.h5"
IMG_SIZE = (224, 224)
CLASSES = ['glioma', 'meningioma', 'notumor', 'pituitary']

def load_brain_tumor_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please train the model first.")
    return load_model(MODEL_PATH)

def preprocess_image(img_path):
    # Support for various formats
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

def predict_mri(img_path):
    try:
        model = load_brain_tumor_model()
        processed_img = preprocess_image(img_path)
        
        predictions = model.predict(processed_img)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        prediction_label = CLASSES[class_idx]
        
        return {
            "prediction": prediction_label,
            "confidence": confidence,
            "all_predictions": {CLASSES[i]: float(predictions[0][i]) for i in range(len(CLASSES))}
        }
    except Exception as e:
        print(f"Error during prediction: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Test prediction
    # test_img = "path/to/test/image.jpg"
    # print(predict_mri(test_img))
    pass
