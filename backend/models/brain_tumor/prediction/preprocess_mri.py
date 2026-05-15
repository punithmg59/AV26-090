"""
MRI Image Preprocessor for Brain Tumor Detection.
Matches the exact preprocessing used during training (train_mri.py).
"""
import numpy as np
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

IMG_SIZE = (224, 224)

def preprocess_mri_bytes(image_bytes, target_size=IMG_SIZE):
    """
    Preprocess raw image bytes into a model-ready tensor.
    Matches training: rescale=1./255, resize to 224x224, RGB.
    
    Returns: numpy array of shape (1, 224, 224, 3)
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        logger.info(f"[MRI PREPROCESS] Loaded image: format={img.format}, size={img.size}, mode={img.mode}")

        # Convert to RGB (MRI scans may be grayscale/L mode)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            logger.info("[MRI PREPROCESS] Converted to RGB")

        # Resize with high-quality resampling
        img = img.resize(target_size, Image.Resampling.LANCZOS)

        # Convert to float32 numpy array
        img_array = np.array(img).astype('float32')

        # Normalize to [0, 1] — matches training ImageDataGenerator(rescale=1./255)
        img_array = img_array / 255.0

        # Add batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)

        logger.info(f"[MRI PREPROCESS] Final tensor: shape={img_array.shape}, "
                     f"mean={np.mean(img_array):.4f}, min={np.min(img_array):.4f}, max={np.max(img_array):.4f}")
        return img_array

    except Exception as e:
        logger.error(f"[MRI PREPROCESS] Failed: {e}")
        raise ValueError(f"Invalid image format or processing error: {str(e)}")
