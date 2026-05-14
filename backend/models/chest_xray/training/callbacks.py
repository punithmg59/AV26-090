from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
import os

def get_callbacks(output_dir):
    """
    Generate a list of standard callbacks for production training.
    """
    model_path = os.path.join(output_dir, 'best_model.h5')
    log_dir = os.path.join(output_dir, 'logs')
    
    os.makedirs(log_dir, exist_ok=True)
    
    checkpoint = ModelCheckpoint(
        filepath=model_path,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1,
        mode='max'
    )
    
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=8,
        verbose=1,
        restore_best_weights=True,
        mode='min'
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        verbose=1,
        min_lr=1e-6,
        mode='min'
    )
    
    tensorboard = TensorBoard(
        log_dir=log_dir,
        histogram_freq=1,
        write_graph=True,
        update_freq='epoch'
    )
    
    return [checkpoint, early_stop, reduce_lr, tensorboard]
