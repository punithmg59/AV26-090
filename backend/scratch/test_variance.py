import os
import sys
import numpy as np
from PIL import Image
import io

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from models.chest_xray.prediction.predict_xray import XrayPredictor

def test_inference_variance():
    model_dir = os.path.join(os.getcwd(), 'saved_models')
    predictor = XrayPredictor(model_dir)
    print("MODEL SUMMARY:")
    predictor.get_model().summary()
    
    # 1. Test with Black image
    black_img = Image.new('RGB', (224, 224), color=(0, 0, 0))
    buf = io.BytesIO()
    black_img.save(buf, format='JPEG')
    res1 = predictor.predict(buf.getvalue())
    print(f"BLACK IMAGE: {res1['class_name']} ({res1['confidence']:.2f}%) - Raw: {res1['debug_info']['raw_output']}")
    
    # 2. Test with White image
    white_img = Image.new('RGB', (224, 224), color=(255, 255, 255))
    buf = io.BytesIO()
    white_img.save(buf, format='JPEG')
    res2 = predictor.predict(buf.getvalue())
    print(f"WHITE IMAGE: {res2['class_name']} ({res2['confidence']:.2f}%) - Raw: {res2['debug_info']['raw_output']}")
    
    # 3. Test with Random Noise
    noise_data = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    noise_img = Image.fromarray(noise_data)
    buf = io.BytesIO()
    noise_img.save(buf, format='JPEG')
    res3 = predictor.predict(buf.getvalue())
    print(f"NOISE IMAGE: {res3['class_name']} ({res3['confidence']:.2f}%) - Raw: {res3['debug_info']['raw_output']}")

if __name__ == "__main__":
    test_inference_variance()
