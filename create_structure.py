import os
from pathlib import Path

base_dir = Path(r"d:\healthcare\backend")

directories = [
    "datasets/heart",
    "datasets/diabetes",
    "datasets/skin/acne",
    "datasets/skin/eczema",
    "datasets/skin/fungal",
    "datasets/skin/allergy",
    "datasets/eye/cataract",
    "datasets/eye/redness",
    "datasets/eye/normal",
    "models/heart",
    "models/diabetes",
    "models/skin",
    "models/eye",
    "routes",
    "services",
    "utils",
    "uploads/reports",
    "uploads/skin_images",
    "uploads/eye_images",
    "responses"
]

files = [
    "app.py",
    "requirements.txt",
    "config.py",
    "datasets/heart/heart.csv",
    "datasets/diabetes/diabetes.csv",
    "models/heart/heart_model.pkl",
    "models/heart/train_heart.py",
    "models/heart/predict_heart.py",
    "models/heart/preprocess_heart.py",
    "models/heart/risk_engine.py",
    "models/diabetes/diabetes_model.pkl",
    "models/diabetes/train_diabetes.py",
    "models/diabetes/predict_diabetes.py",
    "models/diabetes/preprocess_diabetes.py",
    "models/skin/skin_model.h5",
    "models/skin/train_skin.py",
    "models/skin/predict_skin.py",
    "models/skin/preprocess_skin.py",
    "models/skin/labels.txt",
    "models/eye/eye_model.h5",
    "models/eye/train_eye.py",
    "models/eye/predict_eye.py",
    "models/eye/preprocess_eye.py",
    "models/eye/labels.txt",
    "routes/heart_routes.py",
    "routes/diabetes_routes.py",
    "routes/skin_routes.py",
    "routes/eye_routes.py",
    "routes/emergency_routes.py",
    "routes/doctor_routes.py",
    "services/gemini_service.py",
    "services/ocr_service.py",
    "services/voice_service.py",
    "services/map_service.py",
    "services/emergency_service.py",
    "services/report_service.py",
    "services/explanation_service.py",
    "utils/image_utils.py",
    "utils/validation.py",
    "utils/feature_engineering.py",
    "utils/body_pain_mapper.py",
    "utils/risk_calculator.py",
    "responses/heart_response.py",
    "responses/diabetes_response.py",
    "responses/skin_response.py",
    "responses/eye_response.py"
]

for d in directories:
    (base_dir / d).mkdir(parents=True, exist_ok=True)

for f in files:
    file_path = base_dir / f
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.touch()

print("Structure created successfully.")
