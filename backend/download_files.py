import os
import gdown
import time

# Always resolve relative to this file's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(BASE_DIR, "model")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

files = {
    # MODEL
    os.path.join(MODEL_DIR, "disease_model.pkl"): "1rhTF1QEo0n_aDIcy-rH8_OsHlFqNVTq2",
    os.path.join(MODEL_DIR, "encoder.pkl"):       "1LTeIo5g48x1WBK7Dy87hs4cJ0gVmuJCt",
    os.path.join(MODEL_DIR, "columns.pkl"):       "1S2yXHZ77jwmx_34KwdqLcgD3JSVstHxT",

    # DATASET
    os.path.join(DATASET_DIR, "description.csv"): "1rw_r5CgG61hpRaKgN3-BnuemiG_ryTHl",
    os.path.join(DATASET_DIR, "diets.csv"):       "19Q8OahVbzhIss54a8hnkAOM-f4tqmQho",
    os.path.join(DATASET_DIR, "medications.csv"): "1lATXKGMn3fmRcAwHG_BqorSRFQ0TpXYV",
    os.path.join(DATASET_DIR, "precautions.csv"): "1ATyCHnhfMpIVwtBh4i6oBWSAKEWnhFRf",
    os.path.join(DATASET_DIR, "workout.csv"):     "1F0RKMg9mp1wuPteG3wg_xVM8UOC7UOuo",
}


def download(file_id, path):
    """Download a file from Google Drive if not already present."""
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        print(f"✅ Already exists: {path}")
        return

    url = f"https://drive.google.com/uc?id={file_id}"

    for attempt in range(1, 4):  # retry up to 3 times
        try:
            print(f"⬇️  Downloading ({attempt}/3): {path}")
            gdown.download(url, path, quiet=False, fuzzy=True)

            if os.path.exists(path) and os.path.getsize(path) > 1000:
                print(f"✅ Downloaded: {path}")
                return
            else:
                print(f"⚠️  File too small or missing, retrying...")
        except Exception as e:
            print(f"⚠️  Attempt {attempt} failed: {e}")

        time.sleep(3)

    raise RuntimeError(f"❌ Failed to download after 3 attempts: {path}")


def ensure_all_files():
    """Download all required files. Called explicitly from app startup."""
    print(f"📁 MODEL_DIR:   {MODEL_DIR}")
    print(f"📁 DATASET_DIR: {DATASET_DIR}")

    for path, file_id in files.items():
        download(file_id, path)

    print("✅ All files ready")


# Only run automatically if executed directly (not when imported)
if __name__ == "__main__":
    ensure_all_files()