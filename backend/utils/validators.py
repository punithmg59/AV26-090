import os

def validate_chest_xray_dataset(data_dir):
    """
    Validates the directory structure of the Chest X-ray dataset.
    """
    required_dirs = ['train', 'val', 'test']
    required_classes = ['NORMAL', 'PNEUMONIA']
    
    issues = []
    
    for split in required_dirs:
        split_path = os.path.join(data_dir, split)
        if not os.path.exists(split_path):
            issues.append(f"Missing directory: {split_path}")
            continue
            
        for cls in required_classes:
            cls_path = os.path.join(split_path, cls)
            if not os.path.exists(cls_path):
                issues.append(f"Missing class directory: {cls_path}")
            else:
                files = os.listdir(cls_path)
                if len(files) == 0:
                    issues.append(f"Empty class directory: {cls_path}")
                    
    return len(issues) == 0, issues
