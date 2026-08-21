"""
train_ml1.py
============
Training ML#1 — Claim Analyzer (LogisticRegression + TF-IDF).

Pipeline:
  1. Load ml1_dataset.csv
  2. Preprocessing text (cleaning, casefold, stopwords)
  3. Target 1: is_claim (binary)   -> LogReg + TF-IDF, StratifiedKFold CV
  4. Target 2: category (multi)    -> LogReg (multinomial) + TF-IDF, CV
  5. Evaluasi: accuracy, classification_report, confusion_matrix
  6. Simpan model ke models/*.joblib

Cara pakai:
  python train_ml1.py
  python train_ml1.py --csv models/ml1_dataset.csv
"""

import argparse
import os
import re
import warnings

warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import StratifiedKFold

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
MODELS_DIR = "models"
PATH_ISCLAIM_MODEL = os.path.join(MODELS_DIR, "medora_model_logreg_ultimate.joblib")
PATH_ISCLAIM_TFIDF = os.path.join(MODELS_DIR, "medora_tfidf_ultimate.joblib")
PATH_CATEGORY_MODEL = os.path.join(MODELS_DIR, "medora_category_model.joblib")
PATH_CATEGORY_TFIDF = os.path.join(MODELS_DIR, "medora_category_tfidf.joblib")

STOPWORDS_EN = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "can",
    "could", "shall", "should", "may", "might", "must", "need", "dare",
    "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
    "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "just", "because", "but", "and", "or", "if", "which", "who", "whom",
    "what", "this", "that", "these", "those", "it", "its", "also",
}
STOPWORDS_ID = {
    "yang", "di", "ke", "dari", "dan", "atau", "dengan", "bahwa", "untuk",
    "pada", "adalah", "ini", "itu", "dalam", "sebuah", "oleh", "akan", "tidak",
    "juga", "dapat", "bisa", "harus", "mungkin", "apakah", "bagi", "sebagai",
    "saat", "setelah", "sebelum", "karena", "sangat", "lebih", "kurang",
    "adanya", "banyak", "tentang", "terhadap", "menurut", "para", "kita",
    "kami", "mereka", "anda", "saya", "menyatakan", "seperti", "saya",
    "ada", "telah", "sudah", "belum", "ya", "tak", "hal",
}
STOPWORDS = STOPWORDS_EN | STOPWORDS_ID


def bersihin_teks(teks: str) -> str:
    """Bersihkan teks untuk TF-IDF."""
    if not isinstance(teks, str):
        return ""
    teks = re.sub(r"http\S+", "", teks)         # URL
    teks = re.sub(r"@\w+", "", teks)              # mentions
    teks = re.sub(r"#\w+", "", teks)              # hashtags
    teks = re.sub(r"[^a-zA-Z0-9\s]", " ", teks)  # punctuation -> spasi
    teks = re.sub(r"\s+", " ", teks).strip()
    teks = teks.lower()
    # Tokenize & hapus stopwords
    tokens = [t for t in teks.split() if t not in STOPWORDS and len(t) > 1]
    return " ".join(tokens)


def train_binary(X_text, y):
    """Train binary classifier (is_claim) with StratifiedKFold CV."""
    print(f"\n{'='*60}")
    print("TRAIN: is_claim (binary)")
    print(f"{'='*60}")
    print(f"Samples: {len(y)} | True: {sum(y)} | False: {len(y) - sum(y)}")

    tfidf = TfidfVectorizer(
        max_features=8000,
        ngram_range=(1, 3),
        sublinear_tf=True,
        analyzer="word",
    )
    X = tfidf.fit_transform(X_text)

    model = LogisticRegression(
        C=1.0,
        class_weight="balanced",
        max_iter=2000,
        solver="liblinear",
        random_state=42,
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    accs, f1s = [], []
    for fold, (train_idx, val_idx) in enumerate(cv.split(X, y), 1):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        model.fit(X_train, y_train)
        preds = model.predict(X_val)

        acc = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds)
        accs.append(acc)
        f1s.append(f1)
        print(f"  Fold {fold}: acc={acc:.4f}  f1={f1:.4f}")

    print(f"\n  CV Mean: acc={np.mean(accs):.4f} (±{np.std(accs):.4f})  f1={np.mean(f1s):.4f}")

    # Re-train full data
    model.fit(X, y)
    preds_full = model.predict(X)
    print(f"\n  Full train: acc={accuracy_score(y, preds_full):.4f}")
    print(f"  Confusion matrix:\n{confusion_matrix(y, preds_full)}")

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, PATH_ISCLAIM_MODEL)
    joblib.dump(tfidf, PATH_ISCLAIM_TFIDF)
    print(f"\n  Model saved: {PATH_ISCLAIM_MODEL}")
    print(f"  TF-IDF saved: {PATH_ISCLAIM_TFIDF}")

    return model, tfidf


def train_multiclass(X_text, y):
    """Train multi-class classifier (category) with CV."""
    print(f"\n{'='*60}")
    print("TRAIN: category (multi-class)")
    print(f"{'='*60}")
    labels = sorted(y.unique())
    print(f"Classes ({len(labels)}): {labels}")
    print(f"Samples: {len(y)}")

    # Filter classes with very few samples
    value_counts = y.value_counts()
    MIN_SAMPLES = 20
    rare_classes = value_counts[value_counts < MIN_SAMPLES].index.tolist()
    if rare_classes:
        print(f"  Classes with <{MIN_SAMPLES} samples -> merged to OTHER: {rare_classes}")
        y = y.copy()
        y[y.isin(rare_classes)] = "OTHER"
        labels = sorted(y.unique())
        print(f"  After merge: {len(labels)} classes: {labels}")

    tfidf = TfidfVectorizer(
        max_features=8000,
        ngram_range=(1, 3),
        sublinear_tf=True,
    )
    X = tfidf.fit_transform(X_text)

    model = LogisticRegression(
        C=1.5,
        solver="lbfgs",
        max_iter=3000,
        class_weight="balanced",
        random_state=42,
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    accs, f1s_macro = [], []
    for fold, (train_idx, val_idx) in enumerate(cv.split(X, y), 1):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        model.fit(X_train, y_train)
        preds = model.predict(X_val)

        acc = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds, average="macro")
        accs.append(acc)
        f1s_macro.append(f1)
        print(f"  Fold {fold}: acc={acc:.4f}  macro_f1={f1:.4f}")

    print(f"\n  CV Mean: acc={np.mean(accs):.4f} (±{np.std(accs):.4f})  macro_f1={np.mean(f1s_macro):.4f}")

    # Re-train full data
    model.fit(X, y)
    preds_full = model.predict(X)
    print(f"\n  Full train: acc={accuracy_score(y, preds_full):.4f}")
    print(f"  Classification report:\n{classification_report(y, preds_full, zero_division=0)}")

    joblib.dump(model, PATH_CATEGORY_MODEL)
    joblib.dump(tfidf, PATH_CATEGORY_TFIDF)
    print(f"  Model saved: {PATH_CATEGORY_MODEL}")
    print(f"  TF-IDF saved: {PATH_CATEGORY_TFIDF}")

    return model, tfidf


def main():
    parser = argparse.ArgumentParser(description="Train ML#1 - Claim Analyzer")
    parser.add_argument("--csv", default="models/ml1_dataset.csv")
    parser.add_argument("--balance", action="store_true", help="Balance is_claim true/false sebelum training")
    args = parser.parse_args()

    print(f"Loading dataset: {args.csv}")
    df = pd.read_csv(args.csv)
    print(f"Total: {len(df)} | is_claim: {dict(df['is_claim'].value_counts())}")

    if args.balance:
        min_c = df["is_claim"].value_counts().min()
        df = df.groupby("is_claim", group_keys=False).apply(
            lambda x: x.sample(n=min_c, random_state=42)
        ).reset_index(drop=True)
        print(f"After balance: {len(df)}")

    # Preprocess
    print("Preprocessing text...")
    teks_bersih = df["teks_klaim"].apply(bersihin_teks)

    # ---- Target 1: is_claim ----
    # Handle both string and bool columns
    if df["is_claim"].dtype == bool:
        y_isclaim = df["is_claim"].astype(int).values
    else:
        y_isclaim = (df["is_claim"].astype(str).str.lower() == "true").astype(int).values
    train_binary(teks_bersih, y_isclaim)

    # ---- Target 2: category ----
    y_cat = df["category"].values
    train_multiclass(teks_bersih, y_cat)

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()