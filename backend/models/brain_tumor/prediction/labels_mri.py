"""
Brain Tumor MRI class labels and mapping.
Must match training data class order exactly.
"""

# Label indices match the alphabetical order of training subdirectories
# (which is how Keras ImageDataGenerator assigns class indices)
BRAIN_TUMOR_LABELS = {
    0: "glioma",
    1: "meningioma",
    2: "notumor",
    3: "pituitary"
}

# Human-readable display names
BRAIN_TUMOR_DISPLAY = {
    "glioma": "Glioma Tumor",
    "meningioma": "Meningioma Tumor",
    "notumor": "No Tumor Detected",
    "pituitary": "Pituitary Tumor"
}

def get_label(class_idx):
    """Get label string from class index."""
    return BRAIN_TUMOR_LABELS.get(class_idx, "UNKNOWN")

def get_display_name(label):
    """Get human-readable display name from label."""
    return BRAIN_TUMOR_DISPLAY.get(label, label)
