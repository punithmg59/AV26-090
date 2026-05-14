import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from ..training.metrics import get_metrics

def evaluate_model(model_path, test_data_dir, batch_size=32):
    """
    Evaluate a saved model on a test dataset.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
        
    model = tf.keras.models.load_model(model_path, compile=False)
    model.compile(loss='binary_crossentropy', metrics=get_metrics())
    
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    test_generator = test_datagen.flow_from_directory(
        test_data_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='binary',
        shuffle=False
    )
    
    results = model.evaluate(test_generator)
    
    metrics_dict = {
        name: value for name, value in zip(model.metrics_names, results)
    }
    
    return metrics_dict
