import os
import uuid

def save_uploaded_file(file_bytes, filename, upload_dir):
    """
    Saves an uploaded file to the specified directory with a unique UUID.
    """
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = os.path.splitext(filename)[1]
    unique_id = str(uuid.uuid4())
    new_filename = f"{unique_id}{file_ext}"
    file_path = os.path.join(upload_dir, new_filename)
    
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    return file_path, unique_id
