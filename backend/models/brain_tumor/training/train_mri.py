import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils import class_weight

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Navigate up to the 'backend' directory (3 levels up from models/brain_tumor/training)
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))

DATASET_DIR = os.path.join(BACKEND_DIR, "datasets")
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VALID_DIR = os.path.join(DATASET_DIR, "valid")
TEST_DIR = os.path.join(DATASET_DIR, "test")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
MODEL_SAVE_PATH = os.path.join(BACKEND_DIR, "saved_models", "brain_tumor_model.h5")
PLOTS_DIR = os.path.join(BACKEND_DIR, "outputs", "plots")

def validate_dataset():
    print("Validating dataset structure...")
    for d in [TRAIN_DIR, VALID_DIR, TEST_DIR]:
        if not os.path.exists(d):
            print(f"ERROR: {d} does not exist!")
            return False
        classes = os.listdir(d)
        print(f"Classes in {os.path.basename(d)}: {classes}")
        count = sum([len(os.listdir(os.path.join(d, c))) for c in classes if os.path.isdir(os.path.join(d, c))])
        print(f"Total images in {os.path.basename(d)}: {count}")
    return True

def get_data_generators():
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        zoom_range=0.2,
        width_shift_range=0.2,
        height_shift_range=0.2,
        brightness_range=[0.8, 1.2],
        horizontal_flip=True,
        fill_mode='nearest'
    )

    valid_test_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )

    valid_generator = valid_test_datagen.flow_from_directory(
        VALID_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )

    test_generator = valid_test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )

    return train_generator, valid_generator, test_generator

def build_model(num_classes):
    base_model = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze the base model
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    
    return model

def train():
    if not validate_dataset():
        return

    train_gen, valid_gen, test_gen = get_data_generators()
    num_classes = len(train_gen.class_indices)
    classes = list(train_gen.class_indices.keys())
    print(f"Detected classes: {classes}")

    # Build model using defined function
    model = build_model(num_classes)


    # Callbacks
    checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
    early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True, verbose=1)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=1e-6, verbose=1)

    # Calculate class weights
    labels = train_gen.classes
    class_weights = class_weight.compute_class_weight(
        class_weight='balanced',
        classes=np.unique(labels),
        y=labels
    )
    class_weight_dict = dict(enumerate(class_weights))

    # Train
    print("Starting training...")
    history = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=valid_gen,
        callbacks=[checkpoint, early_stop, reduce_lr],
        class_weight=class_weight_dict
    )

    # Plot results
    plot_history(history)

    # Evaluate
    evaluate_model(model, test_gen, classes)

def plot_history(history):
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    epochs_range = range(len(acc))

    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy')
    plt.plot(epochs_range, val_acc, label='Validation Accuracy')
    plt.title('Training and Validation Accuracy')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss')
    plt.plot(epochs_range, val_loss, label='Validation Loss')
    plt.title('Training and Validation Loss')
    plt.legend()
    
    os.makedirs(PLOTS_DIR, exist_ok=True)
    plt.savefig(os.path.join(PLOTS_DIR, "mri_training_history.png"))
    plt.show()

def evaluate_model(model, test_gen, classes):
    print("Evaluating on test set...")
    results = model.evaluate(test_gen)
    print(f"Test Accuracy: {results[1]*100:.2f}%")

    Y_pred = model.predict(test_gen)
    y_pred = np.argmax(Y_pred, axis=1)

    print('Confusion Matrix')
    cm = confusion_matrix(test_gen.classes, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=classes, yticklabels=classes, cmap='Blues')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.savefig(os.path.join(PLOTS_DIR, "mri_confusion_matrix.png"))
    plt.show()

    print('Classification Report')
    print(classification_report(test_gen.classes, y_pred, target_names=classes))

if __name__ == "__main__":
    train()
