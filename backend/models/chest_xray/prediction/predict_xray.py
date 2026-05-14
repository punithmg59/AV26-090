import os
import json
import numpy as np
import tensorflow as tf
from .preprocess_xray import preprocess_image, decode_prediction

class XrayPredictor:
    def __init__(self, model_dir):
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'xray_model.h5')
        self.labels_path = os.path.join(model_dir, 'labels.json')
        self.model = None
        self.labels = {0: "NORMAL", 1: "PNEUMONIA"}
        self._load_model()
        
    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                print("Chest X-ray model loaded successfully.")
            else:
                print(f"Warning: Model not found at {self.model_path}")
                
            if os.path.exists(self.labels_path):
                with open(self.labels_path, 'r') as f:
                    loaded_labels = json.load(f)
                    # Convert keys to int
                    self.labels = {int(k): v for k, v in loaded_labels.items()}
        except Exception as e:
            print(f"Error loading Chest X-ray model: {e}")
            
    def predict(self, image_bytes):
        if self.model is None:
            # Fallback for development if model is not trained yet
            return {"class_name": "PNEUMONIA", "confidence": 95.5, "mock": True}
            
        try:
            # Preprocess
            img_array = preprocess_image(image_bytes)
            
            # Predict
            prediction = self.model.predict(img_array)
            
            # Decode
            result = decode_prediction(prediction, self.labels)
            return result
        except Exception as e:
            print(f"Prediction error: {e}")
            raise e
            
    def get_model(self):
        return self.model
