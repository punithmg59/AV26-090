"""
Brain Tumor MRI Predictor.
Singleton class that loads the model once and reuses for all predictions.
"""
import os
import numpy as np
import logging
import traceback

from .preprocess_mri import preprocess_mri_bytes
from .labels_mri import BRAIN_TUMOR_LABELS, get_display_name

logger = logging.getLogger(__name__)


class BrainTumorPredictor:
    """Singleton predictor - loads model once, reuses for all requests."""
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(BrainTumorPredictor, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_dir=None):
        if self._model is not None:
            return

        if model_dir is None:
            model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'saved_models'))

        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'brain_tumor_model.h5')
        self.labels = BRAIN_TUMOR_LABELS
        self._load_model()

    def _load_model(self):
        """Load the trained H5 model from disk."""
        import tensorflow as tf
        try:
            if os.path.exists(self.model_path):
                logger.info(f"[MRI MODEL] Loading brain tumor model from {self.model_path}...")
                self._model = tf.keras.models.load_model(self.model_path)
                logger.info(f"[MRI MODEL] Model loaded successfully.")
                logger.info(f"[MRI MODEL] Input shape: {self._model.input_shape}")
                logger.info(f"[MRI MODEL] Output shape: {self._model.output_shape}")
            else:
                logger.error(f"[MRI MODEL] Model file NOT FOUND at {self.model_path}")
        except Exception as e:
            logger.error(f"[MRI MODEL] Critical error loading model: {e}")
            logger.error(traceback.format_exc())

    def predict(self, image_bytes):
        """
        Run inference on raw image bytes.
        Returns dict with prediction, confidence, and all class probabilities.
        """
        if self._model is None:
            logger.error("[MRI MODEL] Model not loaded - cannot predict")
            raise RuntimeError("Brain tumor model is not loaded. Please ensure brain_tumor_model.h5 exists in saved_models/")

        try:
            # 1. Preprocess
            img_array = preprocess_mri_bytes(image_bytes)
            logger.info(f"[MRI PREDICT] Preprocessed image shape: {img_array.shape}")

            # 2. Inference
            logger.info("[MRI PREDICT] Running model.predict()...")
            raw_prediction = self._model.predict(img_array, verbose=0)
            logger.info(f"[MRI PREDICT] Raw output: {raw_prediction}")

            # 3. Decode
            probs = raw_prediction[0]
            class_idx = int(np.argmax(probs))
            confidence = float(probs[class_idx]) * 100.0
            class_name = self.labels.get(class_idx, "UNKNOWN")
            display_name = get_display_name(class_name)

            # All class probabilities for transparency
            all_probs = {self.labels[i]: round(float(probs[i]) * 100.0, 2) for i in range(len(probs))}

            result = {
                "class_id": class_idx,
                "class_name": class_name,
                "display_name": display_name,
                "confidence": round(confidence, 2),
                "all_probabilities": all_probs
            }

            logger.info(f"[MRI PREDICT] Result: {class_name} ({confidence:.2f}%)")
            return result

        except Exception as e:
            logger.error(f"[MRI PREDICT] Prediction failed: {e}")
            logger.error(traceback.format_exc())
            raise e

    def get_model(self):
        """Return the loaded Keras model (e.g. for Grad-CAM)."""
        return self._model

    def is_loaded(self):
        """Check if the model is loaded."""
        return self._model is not None
