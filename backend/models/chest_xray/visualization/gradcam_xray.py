import numpy as np
import cv2
import tensorflow as tf
from models.chest_xray.prediction.preprocess_xray import preprocess_image

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    """
    Generate Grad-CAM heatmap for a given image array and model.
    """
    if model is None:
        return None
        
    try:
        grad_model = tf.keras.models.Model(
            [model.inputs], 
            [model.get_layer(last_conv_layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            last_conv_layer_output, preds = grad_model(img_array)
            if pred_index is None:
                # Binary classification (sigmoid)
                if preds.shape[1] == 1:
                    class_channel = preds[:, 0]
                else:
                    pred_index = tf.argmax(preds[0])
                    class_channel = preds[:, pred_index]
            else:
                class_channel = preds[:, pred_index]

        grads = tape.gradient(class_channel, last_conv_layer_output)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        last_conv_layer_output = last_conv_layer_output[0]
        heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        return heatmap.numpy()
    except Exception as e:
        print(f"Error generating heatmap: {e}")
        return None

def save_and_display_gradcam(image_bytes, heatmap, output_path, alpha=0.4):
    """
    Superimpose heatmap onto original image and save.
    """
    if heatmap is None:
        return False
        
    try:
        # Load original image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Rescale heatmap
        heatmap = np.uint8(255 * heatmap)
        
        # Resize heatmap to match image
        heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
        
        # Apply colormap
        heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Superimpose
        superimposed_img = cv2.addWeighted(heatmap_colored, alpha, img, 1 - alpha, 0)
        
        # Save
        cv2.imwrite(output_path, superimposed_img)
        return True
    except Exception as e:
        print(f"Error saving heatmap: {e}")
        return False

def generate_heatmap(image_bytes, model, output_path):
    """
    End-to-end heatmap generation function.
    """
    if model is None:
        return False
        
    # Find last conv layer
    # For EfficientNetB0, 'top_conv' or 'top_activation' are usually the last spatial layers
    last_conv_layer_name = None
    for layer in reversed(model.layers):
        if len(layer.output_shape) == 4:
            last_conv_layer_name = layer.name
            break
            
    if last_conv_layer_name is None:
        print("Could not find a convolutional layer for Grad-CAM.")
        return False
        
    img_array = preprocess_image(image_bytes)
    heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name)
    
    return save_and_display_gradcam(image_bytes, heatmap, output_path)
