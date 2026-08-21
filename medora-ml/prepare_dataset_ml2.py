"""
Gabungkan dataset training ML2: data Indonesia (claim-evidence Indonesia)
+ SciFact asli (claim-evidence Inggris, ambil kalimat yang benar-benar dirujuk).

Output: models/ml2_dataset_combined.csv (kolom: claim, evidence, label)

Cara pakai:
    python prepare_dataset_ml2.py --scifact-dir "C:/.../data"
"""

import argparse
import json
import os

import pandas as pd

LABEL_MAP = {"SUPPORT": "SUPPORT", "CONTRADICT": "CONTRADICT", "NEUTRAL": "NEUTRAL"}


def load_scifact_pairs(scifact_dir: str, splits=("train", "dev")) -> list[dict]:
    """Baca SciFact claims + corpus, hasilkan pasangan claim-evidence berlabel.

    Hanya mengambil kalimat abstract yang benar-benar dirujuk oleh evidence,
    sehingga evidence pendek & presisi (bukan seluruh abstract).
    """
    # corpus: doc_id -> {title, abstract: [kalimat]}
    corpus = {}
    with open(os.path.join(scifact_dir, "corpus.jsonl"), encoding="utf-8") as f:
        for line in f:
            o = json.loads(line)
            corpus[str(o["doc_id"])] = o

    pasangan = []
    for split in splits:
        path = os.path.join(scifact_dir, f"claims_{split}.jsonl")
        with open(path, encoding="utf-8") as f:
            for line in f:
                o = json.loads(line)
                for doc_id, ev_list in o.get("evidence", {}).items():
                    doc = corpus.get(str(doc_id))
                    if not doc:
                        continue
                    abstract = doc.get("abstract", [])
                    for ev in ev_list:
                        label = str(ev.get("label", "")).upper()
                        if label not in LABEL_MAP:
                            continue
                        idxs = [i for i in ev.get("sentences", []) if isinstance(i, int) and 0 <= i < len(abstract)]
                        if not idxs:
                            continue
                        evidence = " ".join(abstract[i] for i in idxs)
                        pasangan.append({
                            "claim": o["claim"],
                            "evidence": evidence,
                            "label": LABEL_MAP[label],
                        })
    return pasangan


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scifact-dir", default=os.path.join("datasets", "scifact_data"))
    parser.add_argument("--indo", default="models/dataset_gabungan_indo_final.csv")
    parser.add_argument("--output", default="models/ml2_dataset_combined.csv")
    parser.add_argument("--sci-splits", default="train",
                        help="Split SciFact untuk training (default train).")
    args = parser.parse_args()

    # 1) Data Indonesia (claim-evidence berbahasa Indonesia)
    df_indo = pd.read_csv(args.indo)
    print(f"Indonesia : {len(df_indo)} pasangan  label={df_indo['label'].value_counts().to_dict()}")

    # 2) Data SciFact (claim-evidence berbahasa Inggris asli)
    sci_splits = [s.strip() for s in args.sci_splits.split(",") if s.strip()]
    sci = load_scifact_pairs(args.scifact_dir, splits=sci_splits)
    df_sci = pd.DataFrame(sci, columns=["claim", "evidence", "label"])
    print(f"SciFact   : {len(df_sci)} pasangan  label={df_sci['label'].value_counts().to_dict()}")

    # 3) Gabung & simpan
    df = pd.concat([df_indo, df_sci], ignore_index=True)
    df.to_csv(args.output, index=False, encoding="utf-8")
    print(f"Total     : {len(df)} pasangan -> {args.output}")


if __name__ == "__main__":
    main()
