import os
import sys
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt
from pathlib import Path
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class XRayPredictor:
    def __init__(self, model_path):
        """
        Initialize the predictor and load the model.
        """
        self.model_path = Path(model_path)
        self.model = None
        self.labels = {0: "Normal", 1: "Pneumonia"}
        self.load_xray_model()

    def load_xray_model(self):
        try:
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            
            logger.info(f"Loading model from {self.model_path}...")
            self.model = load_model(str(self.model_path))
            logger.info("✅ Model loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            sys.exit(1)

    def preprocess_image(self, img_path):
        """
        Prepare the image for model inference.
        """
        try:
            if not os.path.exists(img_path):
                raise FileNotFoundError(f"Image not found: {img_path}")
            
            # Load image
            img = cv2.imread(img_path)
            if img is None:
                raise ValueError("Could not read image. Format might be unsupported or file is corrupted.")
            
            # Convert to RGB (OpenCV uses BGR)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize to 224x224 (DenseNet121 standard)
            img_resized = cv2.resize(img, (224, 224))
            
            # Normalize pixel values (0-1)
            img_normalized = img_resized.astype('float32') / 255.0
            
            # Add batch dimension
            img_batch = np.expand_dims(img_normalized, axis=0)
            
            logger.info(f"Image {img_path} preprocessed successfully.")
            return img_batch, img
        except Exception as e:
            logger.error(f"❌ Preprocessing Error: {e}")
            return None, None

    def get_risk_level(self, confidence):
        if confidence > 85:
            return "High"
        elif confidence > 60:
            return "Medium"
        else:
            return "Low"

    def predict(self, img_path, show_preview=True):
        """
        Run inference and display results.
        """
        img_batch, original_img = self.preprocess_image(img_path)
        
        if img_batch is None:
            return
        
        # Prediction
        logger.info("Running inference...")
        preds = self.model.predict(img_batch, verbose=0)
        
        # Handling Binary Classification (Sigmoid Output)
        confidence_score = float(preds[0][0])
        
        if confidence_score > 0.5:
            result = "Pneumonia"
            confidence = confidence_score * 100
        else:
            result = "Normal"
            confidence = (1 - confidence_score) * 100
            
        risk = self.get_risk_level(confidence)

        # Terminal Output
        print("\n" + "="*40)
        print("         X-RAY ANALYSIS RESULT")
        print("="*40)
        print(f"Prediction : {result}")
        print(f"Confidence : {confidence:.2f}%")
        print(f"Risk Level : {risk}")
        print("="*40 + "\n")

        # Optional Visualization
        if show_preview:
            plt.figure(figsize=(8, 6))
            plt.imshow(original_img)
            plt.title(f"Result: {result} ({confidence:.1f}%)", fontsize=14, color='red' if result == "Pneumonia" else 'green')
            plt.axis('off')
            plt.show()

if __name__ == "__main__":
    # Path Setup
    BASE_DIR = Path(__file__).resolve().parent
    MODEL_PATH = BASE_DIR / "saved" / "xray_model.h5"
    TEST_DIR = BASE_DIR / "test_images"

    predictor = XRayPredictor(MODEL_PATH)

    # Test samples
    test_files = list(TEST_DIR.glob('*.jpg')) + list(TEST_DIR.glob('*.png')) + list(TEST_DIR.glob('*.jpeg'))
    
    if not test_files:
        print(f"No test images found in {TEST_DIR}. Please add some images.")
    else:
        print(f"Found {len(test_files)} test images. Starting batch test...\n")
        for img_file in test_files:
            print(f"Testing: {img_file.name}")
            predictor.predict(str(img_file), show_preview=False) # Keep False for batch script
