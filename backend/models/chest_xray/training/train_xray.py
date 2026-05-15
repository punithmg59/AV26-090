import os
import sys
import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import tensorflow as tf
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix

# Optimized Hyperparameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 30
LEARNING_RATE = 1e-4

def get_compiled_model(input_shape=(224, 224, 3)):
    """
    Creates an optimized DenseNet121 model for Chest X-Ray classification.
    """
    print(f"INFO: Building DenseNet121 Model...")
    base_model = DenseNet121(weights='imagenet', include_top=False, input_shape=input_shape)
    
    # Freeze the base model initially
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    
    # Dense block with Dropout for regularization
    x = Dense(512, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.5)(x)
    
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    
    # Binary classification output
    predictions = Dense(1, activation='sigmoid')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
            tf.keras.metrics.AUC(name='auc')
        ]
    )
    return model

def validate_dataset(data_dir):
    data_path = Path(data_dir)
    print(f"\n[VALIDATION] Validating Dataset at: {data_path.absolute()}")
    
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset root not found: {data_path}")
        
    for split in ['train', 'val', 'test']:
        split_path = data_path / split
        if not split_path.exists():
            raise FileNotFoundError(f"Missing split folder: {split}")
            
        for cls in ['NORMAL', 'PNEUMONIA']:
            cls_path = split_path / cls
            if not cls_path.exists():
                raise FileNotFoundError(f"Missing class folder: {split}/{cls}")
            
            files = list(cls_path.glob('*'))
            if len(files) == 0:
                raise ValueError(f"Empty class folder: {split}/{cls}")
                
    print("SUCCESS: Dataset structure validated successfully.")
    return True

def plot_history(history, output_dir):
    """
    Generates training visualization graphs.
    """
    metrics = ['accuracy', 'loss', 'auc']
    plt.figure(figsize=(18, 5))
    
    for i, metric in enumerate(metrics):
        if metric in history.history:
            plt.subplot(1, 3, i+1)
            plt.plot(history.history[metric], label=f'Train {metric}')
            if f'val_{metric}' in history.history:
                plt.plot(history.history[f'val_{metric}'], label=f'Val {metric}')
            plt.title(f'Model {metric.capitalize()}')
            plt.xlabel('Epoch')
            plt.ylabel(metric.capitalize())
            plt.legend()
            plt.grid(True)
        
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'training_history.png'))
    print(f"PLOT: Training history plot saved to {output_dir}")

def train_model(data_dir, output_dir):
    validate_dataset(data_dir)
    
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'xray_model.h5')

    # 1. Data Generators with Strong Augmentation
    print("AUGMENT: Setting up Data Augmentation...")
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,
        zoom_range=0.15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    
    # Val/Test only rescale
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_gen = train_datagen.flow_from_directory(
        os.path.join(data_dir, 'train'),
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=True
    )
    
    val_gen = val_datagen.flow_from_directory(
        os.path.join(data_dir, 'val'),
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary'
    )

    test_gen = val_datagen.flow_from_directory(
        os.path.join(data_dir, 'test'),
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )

    # 2. Calculate Class Weights for Imbalance
    classes = train_gen.classes
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(classes),
        y=classes
    )
    weight_dict = dict(enumerate(class_weights))
    print(f"WEIGHTS: Calculated Class Weights: {weight_dict}")

    # 3. Model Setup
    model = get_compiled_model()
    
    callbacks = [
        ModelCheckpoint(model_path, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1),
        EarlyStopping(monitor='val_loss', patience=7, verbose=1, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-7, verbose=1)
    ]

    # 4. Phase 1: Training top layers
    print("\nSTAGE 1: Starting Phase 1: Training Top Layers...")
    history = model.fit(
        train_gen,
        epochs=5,  # Fewer epochs for top layers
        validation_data=val_gen,
        class_weight=weight_dict,
        callbacks=callbacks
    )

    # 5. Phase 2: Fine-tuning DenseNet
    print("\nSTAGE 2: Starting Phase 2: Fine-Tuning Last 30 Layers...")
    base_model = model.layers[0] # Get the DenseNet base
    base_model.trainable = True
    
    # Freeze everything except last 30 layers
    for layer in base_model.layers[:-30]:
        layer.trainable = False
            
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(name='precision'), tf.keras.metrics.Recall(name='recall'), tf.keras.metrics.AUC(name='auc')]
    )

    history_fine = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=val_gen,
        class_weight=weight_dict,
        callbacks=callbacks
    )

    # 6. Final Evaluation
    print("\nEVAL: Evaluating on Test Set...")
    model.load_weights(model_path)
    eval_results = model.evaluate(test_gen)
    print(f"Test Metrics: {list(zip(model.metrics_names, eval_results))}")

    # 7. Metrics & Visualization
    plot_history(history_fine, output_dir)
    
    # Save Labels
    labels = {v: k for k, v in train_gen.class_indices.items()}
    with open(os.path.join(output_dir, 'labels.json'), 'w') as f:
        json.dump(labels, f)

    print(f"\nDONE: Optimization Complete. Model saved to: {model_path}")
    return model

if __name__ == '__main__':
    # Professional path resolution using pathlib
    BASE_DIR = Path(__file__).resolve().parents[3]
    DATASET_DIR = BASE_DIR / "datasets" / "chest_xray"
    OUTPUT_DIR = Path(__file__).resolve().parents[1] / "saved"
    
    print(f"Debug: BASE_DIR = {BASE_DIR}")
    print(f"Debug: DATASET_DIR = {DATASET_DIR}")
    
    try:
        train_model(str(DATASET_DIR), str(OUTPUT_DIR))
    except Exception as e:
        print(f"Error: Training Failed: {str(e)}")
