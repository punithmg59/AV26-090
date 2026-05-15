import os
import subprocess
import sys

def install_deps():
    print("Installing dependencies...")
    deps = ["tensorflow", "pandas", "matplotlib", "seaborn", "fpdf", "scikit-learn"]
    subprocess.check_call([sys.executable, "-m", "pip", "install"] + deps)

def create_dirs():
    print("Creating necessary directories...")
    dirs = [
        "backend/saved_models",
        "backend/outputs/plots",
        "backend/outputs/pdfs",
        "backend/uploads"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"Created {d}")

def create_dummy_model():
    # Only if model doesn't exist
    model_path = "backend/saved_models/brain_tumor_model.h5"
    if not os.path.exists(model_path):
        print("Creating a dummy model for testing...")
        import tensorflow as tf
        from tensorflow.keras import layers, models
        
        model = models.Sequential([
            layers.Input(shape=(224, 224, 3)),
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.Flatten(),
            layers.Dense(4, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        model.save(model_path)
        print(f"Dummy model saved to {model_path}")
    else:
        print("Model already exists, skipping dummy creation.")

if __name__ == "__main__":
    create_dirs()
    # install_deps() # Uncomment if needed
    create_dummy_model()
    print("Setup complete!")
