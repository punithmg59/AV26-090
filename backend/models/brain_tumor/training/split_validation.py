"""
Split 15% of training data into a validation set.
Moves files (not copies) to keep disk usage lean.
Run this ONCE before training.
"""
import os
import shutil
import random

random.seed(42)  # Reproducible split

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
TRAIN_DIR = os.path.join(BACKEND_DIR, "datasets", "train")
VALID_DIR = os.path.join(BACKEND_DIR, "datasets", "valid")
SPLIT_RATIO = 0.15  # 15% for validation

def split():
    classes = [d for d in os.listdir(TRAIN_DIR) if os.path.isdir(os.path.join(TRAIN_DIR, d))]
    print(f"Classes found: {classes}")

    total_moved = 0
    for cls in classes:
        src_dir = os.path.join(TRAIN_DIR, cls)
        dst_dir = os.path.join(VALID_DIR, cls)
        os.makedirs(dst_dir, exist_ok=True)

        # Skip if validation already has images for this class
        if len(os.listdir(dst_dir)) > 0:
            print(f"  [SKIP] {cls}: validation folder already has {len(os.listdir(dst_dir))} images, skipping.")
            continue

        images = [f for f in os.listdir(src_dir) if os.path.isfile(os.path.join(src_dir, f))]
        random.shuffle(images)
        n_val = int(len(images) * SPLIT_RATIO)
        val_images = images[:n_val]

        for img in val_images:
            shutil.move(os.path.join(src_dir, img), os.path.join(dst_dir, img))

        total_moved += n_val
        print(f"  [OK] {cls}: moved {n_val} / {len(images)} images to validation")

    print(f"\nDone! Total images moved to validation: {total_moved}")

    # Print final counts
    print("\n--- Final Dataset Summary ---")
    for split_name, split_dir in [("train", TRAIN_DIR), ("valid", VALID_DIR)]:
        for cls in classes:
            d = os.path.join(split_dir, cls)
            count = len(os.listdir(d)) if os.path.exists(d) else 0
            print(f"  {split_name}/{cls}: {count} images")

if __name__ == "__main__":
    split()
