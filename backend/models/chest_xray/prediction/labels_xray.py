import json
import os

DEFAULT_LABELS = {0: "NORMAL", 1: "PNEUMONIA"}

def load_labels(labels_path):
    """
    Load class labels from a JSON file.
    """
    if os.path.exists(labels_path):
        with open(labels_path, 'r') as f:
            loaded_labels = json.load(f)
            # Ensure keys are integers
            return {int(k): v for k, v in loaded_labels.items()}
    return DEFAULT_LABELS
