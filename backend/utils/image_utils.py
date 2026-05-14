import io
from PIL import Image

def validate_image_format(image_bytes):
    """
    Checks if the provided bytes represent a valid image.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True, img.format
    except Exception:
        return False, None
