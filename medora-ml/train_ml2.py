import argparse
import json
import os
import warnings

warnings.filterwarnings("ignore")

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

OUTPUT_DIR = os.path.join("models", "embedded")
X_CLAIM_PATH = os.path.join(OUTPUT_DIR, "X_claim.npy")
X_EVIDENCE_PATH = os.path.join(OUTPUT_DIR, "X_evidence.npy")
Y_PATH = os.path.join(OUTPUT_DIR, "y.npy")
LABELS_PATH = os.path.join(OUTPUT_DIR, "labels.json")

MODEL_OUT = os.path.join("models", "ml2_embedding.joblib")


def build_features(X_claim, X_evidence):
    """Fitur: concat(claim, evidence, |claim-evidence|, claim+evidence)."""
    return np.concatenate([
        X_claim,
        X_evidence,
        np.abs(X_claim - X_evidence),
        X_claim + X_evidence,
    ], axis=1)


def train(csv_validation: str | None = None, cv_folds: int = 5):
    if not all(os.path.exists(p) for p in [X_CLAIM_PATH, X_EVIDENCE_PATH, Y_PATH, LABELS_PATH]):
        raise FileNotFoundError(
            "Embedding belum ada. Jalankan dulu: python encode_dataset.py --csv <dataset.csv>"
        )

    X_claim = np.load(X_CLAIM_PATH)
    X_evidence = np.load(X_EVIDENCE_PATH)
    y = np.load(Y_PATH)
    with open(LABELS_PATH, encoding="utf-8") as f:
        labels = json.load(f)

    print(f"X_claim: {X_claim.shape} | X_evidence: {X_evidence.shape} | y: {y.shape}")
    print(f"Label: {labels} | Distribusi: {dict(zip(labels, np.bincount(y).tolist()))}")

    X = build_features(X_claim, X_evidence)
    print(f"Fitur: {X.shape}")

    clf = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=2000, class_weight="balanced", C=1.0),
    )

    print(f"\nCross-validation ({cv_folds}-fold)...")
    skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    all_pred = np.zeros_like(y)
    for tr, te in skf.split(X, y):
        clf.fit(X[tr], y[tr])
        all_pred[te] = clf.predict(X[te])

    acc = accuracy_score(y, all_pred)
    print(f"\nAkurasi CV: {acc*100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y, all_pred, target_names=labels, zero_division=0))
    print("Confusion Matrix (rows=actual):")
    print(confusion_matrix(y, all_pred))

    # Latih ulang pada semua data (model final)
    print("\nLatih model final pada semua data...")
    clf.fit(X, y)

    joblib.dump({
        "model": clf,
        "labels": labels,
        "feature_schema": "claim|evidence|diff|sum",
    }, MODEL_OUT)
    print(f"Model tersimpan: {MODEL_OUT}")

    if csv_validation:
        validate(clf, labels, csv_validation)

    return acc


def validate(clf, labels, csv_path):
    import pandas as pd
    from fastembed import TextEmbedding

    df = pd.read_csv(csv_path).dropna().drop_duplicates()
    emb = TextEmbedding(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        cache_dir=os.path.join("models", "fastembed"),
    )

    v_claims = np.array(list(emb.embed(df["claim"].astype(str).tolist())))
    v_evs = np.array(list(emb.embed(df["evidence"].astype(str).tolist())))
    X = build_features(v_claims, v_evs)

    preds = clf.predict(X)
    y_true = np.array([labels.index(l) for l in df["label"]])
    acc = accuracy_score(y_true, preds)
    print(f"\nAkurasi pada validasi {csv_path}: {acc*100:.2f}%")
    print(classification_report(y_true, preds, target_names=labels, zero_division=0))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ML2 embedding classifier")
    parser.add_argument("--csv", default=None, help="CSV validasi terpisah (opsional)")
    parser.add_argument("--cv", type=int, default=5)
    args = parser.parse_args()
    train(csv_validation=args.csv, cv_folds=args.cv)