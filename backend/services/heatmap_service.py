import os
from models.chest_xray.visualization.gradcam_xray import generate_heatmap

def process_and_save_heatmap(image_bytes, model, unique_id, heatmaps_dir):
    """
    Coordinates heatmap generation and saving to the correct directory.
    """
    os.makedirs(heatmaps_dir, exist_ok=True)
    
    heatmap_filename = f"heatmap_{unique_id}.jpg"
    heatmap_path = os.path.join(heatmaps_dir, heatmap_filename)
    
    success = generate_heatmap(image_bytes, model, heatmap_path)
    
    return heatmap_path if success else None
