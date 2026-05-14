from sklearn.metrics import classification_report
import json
import os

def generate_classification_report(y_true, y_pred, class_names, output_path):
    """
    Generates and saves a full classification report.
    """
    report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=4)
        
    return report
