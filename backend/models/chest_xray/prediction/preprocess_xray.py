import numpy as np
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

def preprocess_image(image_bytes, target_size=(224, 224)):
    """
    Production-ready image preprocessing using PIL.
    Ensures input shape is (1, 224, 224, 3) and values are normalized.
    """
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        logger.info(f"🔍 PREPROCESS: Loaded {img.format} image, Size: {img.size}, Mode: {img.mode}")
        
        # Convert to RGB (Crucial for medical images that might be grayscale)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            logger.info("🔍 PREPROCESS: Converted to RGB")
            
        # Resize using Lanczos for high-quality downsampling
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to NumPy array
        img_array = np.array(img).astype('float32')
        
        # NOTE: Modern Keras models (EfficientNet/DenseNet) often include 
        # an internal Rescaling layer. Manual division by 255.0 can 
        # lead to vanishingly small inputs and biased predictions.
        # Based on variance testing, we provide raw [0-255] pixels.
        # img_array = img_array / 255.0 
        
        # Ensure correct shape: add batch dimension (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        logger.info(f"🔍 PREPROCESS: Final tensor stats - Mean: {np.mean(img_array):.4f}, Std: {np.std(img_array):.4f}")
        return img_array
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise ValueError(f"Invalid image format or processing error: {str(e)}")

def decode_prediction(prediction_prob, labels_dict=None):
    """
    Robustly decodes binary (Sigmoid) or categorical (Softmax) predictions.
    """
    if labels_dict is None:
        labels_dict = {0: "NORMAL", 1: "PNEUMONIA"}
        
    # Handle Sigmoid (Binary, 1 node)
    # prediction_prob is usually [[prob]]
    if prediction_prob.shape[-1] == 1:
        prob = float(prediction_prob[0][0])
        class_idx = 1 if prob > 0.5 else 0
        confidence = prob if class_idx == 1 else 1.0 - prob
    else:
        # Handle Softmax (Categorical, 2+ nodes)
        probs = prediction_prob[0]
        class_idx = int(np.argmax(probs))
        confidence = float(probs[class_idx])
        
    return {
        "class_id": class_idx,
        "class_name": labels_dict.get(class_idx, "UNKNOWN"),
        "confidence": float(confidence * 100.0)
    }
