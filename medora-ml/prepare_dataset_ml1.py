"""
prepare_dataset_ml1.py
======================
Persiapan dataset untuk training ML#1 (Claim Analyzer).

Menggabungkan beberapa sumber:
  1. SciFact (klaim medis ilmiah)      -> is_claim = true
  2. CoAID Claim (klaim COVID)         -> is_claim = true
  3. CoAID News  (berita COVID)        -> is_claim = false (bukan klaim, tapi teks medis)
  4. dataset_medora_final_balanced.csv -> is_claim = true (klaim kesehatan Indonesia)

Output: models/ml1_dataset.csv
  Kolom: teks_klaim, is_claim, category, source

Category di-auto-label via leksikon keyword (rule-based):
  PREVENTION, TREATMENT, NUTRITION, RISK, CAUSE, MYTH, DIAGNOSIS, OTHER

Cara pakai:
  python prepare_dataset_ml1.py
  python prepare_dataset_ml1.py --coaid-dir "path/CoAID-master" --scifact-dir "path/data"
"""

import argparse
import json
import os

import pandas as pd

OUTPUT_CSV = os.path.join("models", "ml1_dataset.csv")


# ---------------------------------------------------------------------------
# Leksikon kategori (rule-based auto-labeling)
# ---------------------------------------------------------------------------
CATEGORY_KEYWORDS = {
    "PREVENTION": [
        "prevent", "prevention", "avoid", "protect", "protection", "reduce risk",
        "lower the risk", "decrease the risk", "vaccin", "immun", "reduce the risk",
        "protective", "cegah", "mencegah", "pencegahan", "vaksin", "proteksi", "melindungi",
    ],
    "TREATMENT": [
        "treat", "treatment", "cure", "therapy", "therapeutic", "medication", "drug",
        "heal", "recovery", "clinical", "efficacy", "effective for", "remedy",
        "obat", "pengobatan", "mengobati", "terapi", "menyembuhkan", "kesembuhan",
    ],
    "NUTRITION": [
        "vitamin", "nutrition", "nutrient", "diet", "food", "dietary", "supplement",
        "eat", "eating", "consumption", "fruit", "vegetable", "mineral", "protein",
        "nutrisi", "gizi", "makanan", "makan", "diet", "vitamin", "konsumsi", "sayur", "buah",
    ],
    "RISK": [
        "risk", "risky", "increase the risk", "higher risk", "associated with",
        "resiko", "risiko", "meningkatkan risiko", "berisiko",
    ],
    "CAUSE": [
        "cause", "caused by", "lead to", "result in", "linked to", "trigger",
        "menyebabkan", "disebabkan", "memicu", "mengakibatkan",
    ],
    "MYTH": [
        "myth", "hoax", "false belief", "misinformation", "fake", "untrue",
        "mitos", "hoaks", "bohong", "tidak benar", "fakta salah", "disinformasi",
    ],
    "DIAGNOSIS": [
        "diagnos", "symptom", "sign", "detect", "test", "screening", "biomarker",
        "diagnosa", "gejala", "deteksi", "pemeriksaan", "disease", "condition",
        "disorder", "syndrome", "infection", "virus", "bacteria", "illness",
        "penyakit", "infeksi", "virus", "bakteri", "sakit", "kelainan", "gangguan",
    ],
    "MATERNAL_CHILD": [
        "pregnancy", "pregnant", "baby", "infant", "child", "breastfeed", "maternal",
        "fetus", "newborn", "hamil", "kehamilan", "bayi", "anak", "balita", "menyusui",
    ],
    "MENTAL_HEALTH": [
        "mental health", "depression", "anxiety", "stress", "psychological", "psychiatric",
        "mood", "sleep", "insomnia", "kesehatan mental", "depresi", "cemas", "stres", "tidur",
    ],
    "LIFESTYLE": [
        "exercise", "physical activity", "smoking", "alcohol", "sleep", "lifestyle",
        "obesitas", "exercise", "olahraga", "aktivitas fisik", "merokok", "alkohol",
        "gaya hidup", "kebiasaan",
    ],
}


def auto_label_category(teks: str) -> str:
    """Label otomatis kategori dari teks klaim via leksikon keyword."""
    teks_lower = (teks or "").lower()
    skor = {}
    for kategori, keywords in CATEGORY_KEYWORDS.items():
        skor[kategori] = sum(1 for kw in keywords if kw in teks_lower)
    # Pertimbangkan teks yang menyebut kondisi medis sebagai DIAGNOSIS ringan
    if skor["DIAGNOSIS"] > 0 and not any(v > skor["DIAGNOSIS"] for k, v in skor.items() if k != "DIAGNOSIS"):
        return "DIAGNOSIS"
    if not any(skor.values()):
        return "OTHER"
    return max(skor, key=skor.get)


# ---------------------------------------------------------------------------
# Loader per sumber
# ---------------------------------------------------------------------------
def load_scifact(scifact_dir: str) -> pd.DataFrame:
    """SciFact: klaim medis ilmiah (is_claim = true)."""
    rows = []
    for split in ("train", "dev"):
        path = os.path.join(scifact_dir, f"claims_{split}.jsonl")
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as f:
            for line in f:
                o = json.loads(line)
                teks = (o.get("claim") or "").strip()
                if teks:
                    rows.append({"teks_klaim": teks, "is_claim": "true", "source": "scifact"})
    return pd.DataFrame(rows)


def load_coaid(coaid_dir: str) -> pd.DataFrame:
    """CoAID: Claim -> is_claim true; News -> is_claim false."""
    rows = []
    if not os.path.isdir(coaid_dir):
        return pd.DataFrame(rows)
    for folder in os.listdir(coaid_dir):
        base = os.path.join(coaid_dir, folder)
        if not os.path.isdir(base):
            continue
        for fname in os.listdir(base):
            path = os.path.join(base, fname)
            if fname.startswith("Claim") and fname.endswith(".csv"):
                try:
                    df = pd.read_csv(path, engine="python", on_bad_lines="skip")
                    col = "title" if "title" in df.columns else ("text" if "text" in df.columns else None)
                    if col:
                        for t in df[col].dropna().astype(str):
                            if t.strip():
                                rows.append({"teks_klaim": t.strip(), "is_claim": "true", "source": "coaid_claim"})
                except Exception:
                    continue
            elif fname.startswith("News") and fname.endswith(".csv"):
                try:
                    df = pd.read_csv(path, engine="python", on_bad_lines="skip")
                    col = "title" if "title" in df.columns else ("content" if "content" in df.columns else None)
                    if col:
                        for t in df[col].dropna().astype(str):
                            if t.strip():
                                rows.append({"teks_klaim": t.strip(), "is_claim": "false", "source": "coaid_news"})
                except Exception:
                    continue
    return pd.DataFrame(rows)


def load_medora_balanced(path: str) -> pd.DataFrame:
    """dataset_medora_final_balanced.csv -> klaim kesehatan Indonesia (is_claim = true)."""
    if not os.path.isfile(path):
        return pd.DataFrame()
    df = pd.read_csv(path)
    out = []
    for _, r in df.iterrows():
        teks = str(r.get("teks_klaim", "")).strip()
        if teks:
            out.append({"teks_klaim": teks, "is_claim": "true", "source": "medora"})
    return pd.DataFrame(out)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Siapkan dataset training ML#1.")
    parser.add_argument("--scifact-dir", default=os.path.join("datasets", "scifact_data"))
    parser.add_argument("--coaid-dir", default=os.path.join("datasets", "CoAID-master"))
    parser.add_argument("--medora-csv", default=os.path.join("models", "dataset_medora_final_balanced.csv"))
    parser.add_argument("--output", default=OUTPUT_CSV)
    parser.add_argument("--balance", action="store_true", help="Balance is_claim true/false")
    args = parser.parse_args()

    frames = []

    df_sci = load_scifact(args.scifact_dir)
    print(f"SciFact : {len(df_sci)} claims")
    frames.append(df_sci)

    df_coaid = load_coaid(args.coaid_dir)
    print(f"CoAID   : {len(df_coaid)} rows")
    frames.append(df_coaid)

    df_med = load_medora_balanced(args.medora_csv)
    print(f"MEDORA  : {len(df_med)} claims")
    frames.append(df_med)

    df = pd.concat(frames, ignore_index=True).drop_duplicates(subset=["teks_klaim"])
    df = df.dropna(subset=["teks_klaim"])
    df["teks_klaim"] = df["teks_klaim"].astype(str).str.strip()
    df = df[df["teks_klaim"].str.len() >= 5]
    df = df.reset_index(drop=True)

    # Auto-label kategori
    df["category"] = df["teks_klaim"].apply(auto_label_category)

    if args.balance:
        min_count = df["is_claim"].value_counts().min()
        df = df.groupby("is_claim", group_keys=False).apply(
            lambda x: x.sample(n=min_count, random_state=42)
        ).reset_index(drop=True)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    df.to_csv(args.output, index=False, encoding="utf-8")

    print(f"\n=== DATASET SAVED: {args.output} ===")
    print(f"Total rows : {len(df)}")
    print(f"Is_claim   : {df['is_claim'].value_counts().to_dict()}")
    print(f"Category   : {df['category'].value_counts().to_dict()}")
    print(f"Sources    : {df['source'].value_counts().to_dict()}")


if __name__ == "__main__":
    main()
