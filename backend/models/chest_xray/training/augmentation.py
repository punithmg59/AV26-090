from tensorflow.keras.preprocessing.image import ImageDataGenerator

def get_train_augmentation():
    """
    Returns configured ImageDataGenerator for training with augmentations.
    """
    return ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        fill_mode='nearest'
    )

def get_val_augmentation():
    """
    Returns configured ImageDataGenerator for validation (only rescaling).
    """
    return ImageDataGenerator(rescale=1./255)
