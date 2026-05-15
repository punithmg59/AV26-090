import os
import json
import numpy as np
import tensorflow as tf
import logging
from .preprocess_xray import preprocess_image, decode_prediction

logger = logging.getLogger(__name__)

class XrayPredictor:
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(XrayPredictor, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_dir):
        # Only initialize once
        if self._model is not None:
            return
            
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'xray_model.h5')
        self.labels_path = os.path.join(model_dir, 'labels.json')
        self.labels = {0: "NORMAL", 1: "PNEUMONIA"}
        self._load_model()
        
    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                logger.info(f"🔍 DEBUG: Loading X-ray model from {self.model_path}...")
                self._model = tf.keras.models.load_model(self.model_path)
                logger.info("✅ DEBUG: Model loaded successfully.")
                # Log model architecture info
                logger.info(f"🔍 DEBUG: Model Input Shape: {self._model.input_shape}")
                logger.info(f"🔍 DEBUG: Model Output Shape: {self._model.output_shape}")
            else:
                logger.error(f"❌ DEBUG: Model file NOT FOUND at {self.model_path}")
                
            if os.path.exists(self.labels_path):
                with open(self.labels_path, 'r') as f:
                    loaded_labels = json.load(f)
                    self.labels = {int(k): v for k, v in loaded_labels.items()}
                    logger.info(f"🔍 DEBUG: Loaded labels: {self.labels}")
        except Exception as e:
            logger.error(f"❌ DEBUG: Critical error loading X-ray model: {e}")

    def predict(self, image_bytes):
        """
        Main inference entry point with deep debugging.
        """
        import hashlib
        img_hash = hashlib.md5(image_bytes).hexdigest()
        logger.info(f"🚀 DEBUG: Starting prediction for image hash: {img_hash}")

        if self._model is None:
            logger.warning("⚠️ DEBUG: MOCK PREDICTION TRIGGERED - Model is None")
            return {"class_name": "NORMAL", "confidence": 98.2, "is_mock": True}
            
        try:
            # 1. Preprocess
            img_array = preprocess_image(image_bytes)
            logger.info(f"🔍 DEBUG: Preprocessed image shape: {img_array.shape}")
            logger.info(f"🔍 DEBUG: Image Stats - Mean: {np.mean(img_array):.4f}, Max: {np.max(img_array):.4f}, Min: {np.min(img_array):.4f}")
            
            # 2. Inference
            logger.info("🧠 DEBUG: Executing model.predict()...")
            raw_prediction = self._model.predict(img_array, verbose=0)
            logger.info(f"📊 DEBUG: RAW MODEL OUTPUT (Tensor): {raw_prediction}")
            
            # 3. Decode result
            result = decode_prediction(raw_prediction, self.labels)
            logger.info(f"✅ DEBUG: Final prediction: {result['class_name']} ({result['confidence']:.2f}%)")
            
            # Add debugging metadata to result
            result["debug_info"] = {
                "hash": img_hash,
                "raw_output": raw_prediction.tolist(),
                "mean": float(np.mean(img_array))
            }
            return result
        except Exception as e:
            logger.error(f"❌ DEBUG: Prediction failed: {e}")
            logger.error(traceback.format_exc())
            raise e
            
    def get_model(self):
        return self._model
