import tensorflow as tf
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
        # Load X-ray Model
        xray_path = os.path.join(self.models_dir, "xray_model.h5")
        if os.path.exists(xray_path):
            try:
                self.xray_model = tf.keras.models.load_model(xray_path)
                logger.info(f"✅ X-ray model loaded from {xray_path}")
            except Exception as e:
                logger.error(f"❌ Error loading X-ray model: {e}")
        else:
            logger.warning(f"⚠️ X-ray model not found at {xray_path}. Using mock predictions.")

        # Load CT Model
        ct_path = os.path.join(self.models_dir, "ct_model.h5")
        if os.path.exists(ct_path):
            try:
                self.ct_model = tf.keras.models.load_model(ct_path)
                logger.info(f"✅ CT model loaded from {ct_path}")
            except Exception as e:
                logger.error(f"❌ Error loading CT model: {e}")
        else:
            logger.warning(f"⚠️ CT model not found at {ct_path}. Using mock predictions.")

        # Load MRI Model
        mri_path = os.path.join(self.models_dir, "brain_tumor_model.h5")
        if os.path.exists(mri_path):
            try:
                self.mri_model = tf.keras.models.load_model(mri_path)
                logger.info(f"✅ MRI model loaded from {mri_path}")
            except Exception as e:
                logger.error(f"❌ Error loading MRI model: {e}")
        else:
            logger.warning(f"⚠️ MRI model not found at {mri_path}. Using mock predictions.")

    def get_xray_model(self):
        return self.xray_model

    def get_ct_model(self):
        return self.ct_model

    def get_mri_model(self):
        return self.mri_model

# Singleton instance
model_loader = ModelLoader()
