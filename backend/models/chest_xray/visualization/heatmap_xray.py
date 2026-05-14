# Wrapper to expose gradcam functionality under the heatmap_xray naming convention
from .gradcam_xray import generate_heatmap, make_gradcam_heatmap, save_and_display_gradcam

__all__ = [
    'generate_heatmap',
    'make_gradcam_heatmap',
    'save_and_display_gradcam'
]
