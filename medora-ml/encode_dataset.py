import argparse
import os
import time
import warnings

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from fastembed import TextEmbedding

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CACHE_DIR = os.path.join("models", "fastembed")

OUTPUT_DIR = os.path.join("models", "embedded")
X_CLAIM_PATH = os.path.join(OUTPUT_DIR, "X_claim.npy")
X_EVIDENCE_PATH = os.path.join(OUTPUT_DIR, "X_evidence.npy")
Y_PATH = os.path.join(OUTPUT_DIR, "y.npy")
LABELS_PATH = os.path.join(OUTPUT_DIR, "labels.json")


def encode_dataset(csv_path: str, batch_size: int = 256):
    """Encode dataset (claim + evidence) menjadi vektor numpy, simpan ke models/embedded/."""
    df = pd.read_csv(csv_path)

    required = {"claim", "evidence", "label"}
    if not required.issubset(df.columns):
        raise ValueError(f"CSV harus punya kolom {required}. Ditemukan: {list(df.columns)}")

    df = df.dropna(subset=["claim", "evidence", "label"]).drop_duplicates()
    labels = sorted(df["label"].unique())
    y = np.array([labels.index(l) for l in df["label"]], dtype=np.int32)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Dataset: {len(df)} baris | Label: {labels}")
    print("Memuat embedding model...")
    emb = TextEmbedding(model_name=MODEL_NAME, cache_dir=CACHE_DIR)

    texts_claim = df["claim"].astype(str).tolist()
    texts_evidence = df["evidence"].astype(str).tolist()

    def encode_in_chunks(texts, path):
        if os.path.exists(path):
            print(f"  [SKIP] {path} sudah ada.")
            return
        vecs = []
        t0 = time.time()
        for i in range(0, len(texts), batch_size):
            chunk = texts[i : i + batch_size]
            vecs.extend(emb.embed(chunk))
            done = min(i + batch_size, len(texts))
            elapsed = time.time() - t0
            rate = elapsed / done
            eta = rate * (len(texts) - done)
            print(f"  {done}/{len(texts)} ({done/len(texts)*100:.0f}%) "
                  f"| {elapsed:.0f}s | ETA {eta/60:.1f} menit")
        arr = np.array(vecs, dtype=np.float32)
        np.save(path, arr)
        print(f"  [OK] {path} ({arr.shape})")

    print("Encode claim...")
    encode_in_chunks(texts_claim, X_CLAIM_PATH)

    print("Encode evidence...")
    encode_in_chunks(texts_evidence, X_EVIDENCE_PATH)

    np.save(Y_PATH, y)
    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        import json
        json.dump(labels, f)

    print("\nSelesai! File tersimpan di:", OUTPUT_DIR)
    print(f"  X_claim:    {np.load(X_CLAIM_PATH, mmap_mode='r').shape}")
    print(f"  X_evidence: {np.load(X_EVIDENCE_PATH, mmap_mode='r').shape}")
    print(f"  y:          {np.load(Y_PATH).shape}")
    print(f"  labels:     {labels}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Encode dataset ML2 -> numpy")
    parser.add_argument("--csv", default="models/dataset_gabungan_indo_final.csv")
    parser.add_argument("--batch", type=int, default=256)
    args = parser.parse_args()
    encode_dataset(args.csv, args.batch)