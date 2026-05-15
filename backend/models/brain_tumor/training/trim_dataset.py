"""
Trim dataset to exact target sizes by DELETING extra images.
Target: 1500 train / 500 valid / 500 test
With 4 classes: 375 train / 125 valid / 125 test per class.

This script is DESTRUCTIVE - it permanently deletes files.
"""
import os
import random

random.seed(42)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
DATASET_DIR = os.path.join(BACKEND_DIR, "datasets")

TARGETS = {
    "train": 375,   # per class (375 x 4 = 1500)
    "valid": 125,   # per class (125 x 4 = 500)
    "test": 125,    # per class (125 x 4 = 500)
}

def trim():
    total_deleted = 0

    for split_name, target_per_class in TARGETS.items():
        split_dir = os.path.join(DATASET_DIR, split_name)
        if not os.path.exists(split_dir):
            print(f"[SKIP] {split_name} directory does not exist")
            continue

        classes = sorted([d for d in os.listdir(split_dir)
                          if os.path.isdir(os.path.join(split_dir, d))])

        print(f"\n--- {split_name} (target: {target_per_class} per class) ---")

        for cls in classes:
            cls_dir = os.path.join(split_dir, cls)
            images = sorted([f for f in os.listdir(cls_dir)
                             if os.path.isfile(os.path.join(cls_dir, f))])
            current = len(images)

            if current <= target_per_class:
                print(f"  {cls}: {current} images (already at or below target, no change)")
                continue

            # Shuffle and pick which ones to DELETE
            random.shuffle(images)
            to_delete = images[target_per_class:]

            for img in to_delete:
                os.remove(os.path.join(cls_dir, img))

            deleted = len(to_delete)
            total_deleted += deleted
            print(f"  {cls}: {current} -> {target_per_class} (deleted {deleted} images)")

    print(f"\nTotal images deleted: {total_deleted}")

    # Final summary
    print("\n=== Final Dataset Summary ===")
    grand_total = 0
    for split_name in TARGETS:
        split_dir = os.path.join(DATASET_DIR, split_name)
        if not os.path.exists(split_dir):
            continue
        classes = sorted([d for d in os.listdir(split_dir)
                          if os.path.isdir(os.path.join(split_dir, d))])
        split_total = 0
        for cls in classes:
            cls_dir = os.path.join(split_dir, cls)
            count = len([f for f in os.listdir(cls_dir)
                         if os.path.isfile(os.path.join(cls_dir, f))])
            split_total += count
            print(f"  {split_name}/{cls}: {count}")
        print(f"  >> {split_name} total: {split_total}")
        grand_total += split_total
    print(f"\nGrand total: {grand_total} images")

if __name__ == "__main__":
    trim()
