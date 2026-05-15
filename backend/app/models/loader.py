import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self):
        self.xray_model = None
        self.ct_model = None
        self.mri_model = None
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "saved_models")

    def load_models(self):
        """Deprecated: Models are now lazy-loaded on demand to optimize startup time."""
        logger.info("🚀 Lazy loading enabled. Models will load on first prediction request.")
        pass

    def get_xray_model(self):
        if self.xray_model is None:
            import tensorflow as tf
            path = os.path.join(self.models_dir, "xray_model.h5")
            if os.path.exists(path):
                try:
                    logger.info(f"⏳ Loading X-ray model from {path}...")
                    self.xray_model = tf.keras.models.load_model(path)
                    logger.info("✅ X-ray model loaded.")
                except Exception as e:
                    logger.error(f"❌ Error loading X-ray model: {e}")
            else:
                logger.warning("⚠️ X-ray model file missing. Returns None.")
        return self.xray_model

    def get_ct_model(self):
        if self.ct_model is None:
            import tensorflow as tf
            path = os.path.join(self.models_dir, "ct_model.h5")
            if os.path.exists(path):
                try:
                    logger.info(f"⏳ Loading CT model from {path}...")
                    self.ct_model = tf.keras.models.load_model(path)
                    logger.info("✅ CT model loaded.")
                except Exception as e:
                    logger.error(f"❌ Error loading CT model: {e}")
            else:
                logger.warning("⚠️ CT model file missing. Returns None.")
        return self.ct_model

    def get_mri_model(self):
        if self.mri_model is None:
            import tensorflow as tf
            path = os.path.join(self.models_dir, "brain_tumor_model.h5")
            if os.path.exists(path):
                try:
                    logger.info(f"⏳ Loading MRI model from {path}...")
                    self.mri_model = tf.keras.models.load_model(path)
                    logger.info("✅ MRI model loaded.")
                except Exception as e:
                    logger.error(f"❌ Error loading MRI model: {e}")
            else:
                logger.warning("⚠️ MRI model file missing. Returns None.")
        return self.mri_model

# Singleton instance
model_loader = ModelLoader()
