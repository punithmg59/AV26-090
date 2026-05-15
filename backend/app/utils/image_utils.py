import cv2
import numpy as np
from PIL import Image
import io

def preprocess_image(image_bytes, target_size=(224, 224)):
    """
    Standard preprocessing for medical AI models.
    """
    # Load image from bytes
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Resize
    image = image.resize(target_size)
    
    # Convert to array
    img_array = np.array(image)
    
    # Normalize (0-1)
    img_array = img_array.astype('float32') / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array
