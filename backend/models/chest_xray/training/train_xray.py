import os
import sys
from pathlib import Path
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

def get_compiled_model(input_shape=(224, 224, 3), num_classes=2):
    base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=input_shape)
    
    # Freeze the base model for initial training
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    
    if num_classes == 2:
        predictions = Dense(1, activation='sigmoid')(x)
        loss = 'binary_crossentropy'
    else:
        predictions = Dense(num_classes, activation='softmax')(x)
        loss = 'categorical_crossentropy'
        
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                  loss=loss,
                  metrics=['accuracy'])
    return model

def validate_dataset(data_dir):
    data_path = Path(data_dir)
    print(f"Dataset path: {data_path}")
    
    if not data_path.exists():
        print(f"Error: Dataset directory does not exist at {data_path}")
        return False
        
    required_dirs = ['train', 'val', 'test']
    required_classes = ['NORMAL', 'PNEUMONIA']
    
    for split in required_dirs:
        split_path = data_path / split
        if not split_path.exists():
            print(f"Error: Missing split directory '{split}' at: {split_path}")
            return False
            
        for cls in required_classes:
            cls_path = split_path / cls
            if not cls_path.exists():
                print(f"Error: Missing class directory '{cls}' at: {cls_path}")
                return False
                
            if not any(cls_path.iterdir()):
                print(f"Error: Empty class directory: {cls_path}")
                return False
                
    print("Dataset validation passed successfully.")
    return True

def train_model(data_dir, output_dir, epochs=20, batch_size=32):
    if not validate_dataset(data_dir):
        print("Dataset validation failed. Aborting training.")
        return None
        
    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'val')
        
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='binary'
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode='binary'
    )
    
    model = get_compiled_model()
    
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'xray_model.h5')
    
    callbacks = [
        ModelCheckpoint(model_path, monitor='val_accuracy', save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_loss', patience=5, verbose=1, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, verbose=1)
    ]
    
    print("Starting training phase 1 (Top layers only)...")
    history = model.fit(
        train_generator,
        epochs=10,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    # Fine-tuning
    print("Starting fine-tuning phase (Unfreezing base model)...")
    base_model = model.layers[0]
    base_model.trainable = True
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
                  loss='binary_crossentropy',
                  metrics=['accuracy'])
                  
    history_fine = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    import json
    class_indices = train_generator.class_indices
    labels = {v: k for k, v in class_indices.items()}
    with open(os.path.join(output_dir, 'labels.json'), 'w') as f:
        json.dump(labels, f)
        
    print(f"Training completed. Model saved to {model_path}")
    return model

if __name__ == '__main__':
    # Proper BASE_DIR resolution
    BASE_DIR = Path(__file__).resolve().parents[3]
    DATASET_DIR = BASE_DIR / "datasets" / "chest_xray"
    OUTPUT_DIR = Path(__file__).resolve().parents[1] / "saved"
    
    train_model(str(DATASET_DIR), str(OUTPUT_DIR))
