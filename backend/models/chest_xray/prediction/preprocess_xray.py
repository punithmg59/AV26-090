import numpy as np
import cv2
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import io

def preprocess_image(image_bytes, target_size=(224, 224)):
    """
    Preprocess image bytes for EfficientNetB0 prediction.
    """
    # Load image from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if grayscale
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    # Resize
    img = img.resize(target_size)
    
    # Convert to array
    img_array = img_to_array(img)
    
    # Rescale (EfficientNet expects 0-255 or 0-1 depending on configuration, 
    # but since we used 1./255 in ImageDataGenerator, we must do it here too)
    img_array = img_array / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def decode_prediction(prediction_prob, labels_dict=None):
    """
    Decode binary prediction probability.
    """
    if labels_dict is None:
        labels_dict = {0: "NORMAL", 1: "PNEUMONIA"}
        
    # Assuming sigmoid output (1 node)
    if isinstance(prediction_prob, (list, np.ndarray)) and len(prediction_prob.shape) > 1 and prediction_prob.shape[1] == 1:
        prob = float(prediction_prob[0][0])
        class_idx = 1 if prob > 0.5 else 0
        confidence = prob if class_idx == 1 else 1.0 - prob
    else:
        # Categorical
        probs = prediction_prob[0]
        class_idx = np.argmax(probs)
        confidence = float(probs[class_idx])
        
    return {
        "class_id": class_idx,
        "class_name": labels_dict.get(class_idx, str(class_idx)),
        "confidence": confidence * 100.0
    }
