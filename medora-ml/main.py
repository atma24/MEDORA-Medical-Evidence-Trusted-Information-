from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import re
import os

from query_generator import generate_query, istilah_untuk_ranking
from evidence_retriever import retrieve
from evidence_ranking import rank_evidences
from trust_engine import hitung_assessment, _map_ml2_label
from claim_structure import extract_structure

app = FastAPI(title="MEDORA ML API", description="API untuk Claim Analyzer & Evidence Classifier", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PATH_ML1_MODEL = os.path.join("models", "medora_model_logreg_ultimate.joblib")
PATH_ML1_TFIDF = os.path.join("models", "medora_tfidf_ultimate.joblib")

PATH_CATEGORY_MODEL = os.path.join("models", "medora_category_model.joblib")
PATH_CATEGORY_TFIDF = os.path.join("models", "medora_category_tfidf.joblib")

PATH_ML2_MODEL = os.path.join("models", "medora_model_ml2_serving_format_classifier.joblib")
PATH_ML2_TFIDF = os.path.join("models", "medora_model_ml2_serving_format_tfidf.joblib")

# ML2 embedding (fastembed + LogisticRegression)
PATH_ML2_EMBEDDING = os.path.join("models", "ml2_embedding.joblib")
PATH_FASTEMBED_CACHE = os.path.join("models", "fastembed")

print("Memuat mesin ML ke dalam server...")
model_ml1, tfidf_ml1 = None, None
model_category, tfidf_category = None, None
model_ml2, tfidf_ml2 = None, None
model_ml2_emb, labels_ml2_emb, embedder = None, None, None

try:
    model_ml1 = joblib.load(PATH_ML1_MODEL)
    tfidf_ml1 = joblib.load(PATH_ML1_TFIDF)
    print("ML1 (Claim Analyzer) dimuat.")
except Exception as e:
    print(f"Error loading ML1: {e}")

try:
    model_category = joblib.load(PATH_CATEGORY_MODEL)
    tfidf_category = joblib.load(PATH_CATEGORY_TFIDF)
    print("ML1-Category dimuat.")
except Exception as e:
    print(f"Error loading ML1-Category: {e}")

try:
    model_ml2 = joblib.load(PATH_ML2_MODEL)
    tfidf_ml2 = joblib.load(PATH_ML2_TFIDF)
    print("ML2 (TF-IDF fallback) dimuat.")
except Exception as e:
    print(f"Error loading ML2 TF-IDF: {e}")

try:
    from fastembed import TextEmbedding
    import numpy as np

    embedder = TextEmbedding(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        cache_dir=PATH_FASTEMBED_CACHE,
    )
    data_emb = joblib.load(PATH_ML2_EMBEDDING)
    model_ml2_emb = data_emb["model"]
    labels_ml2_emb = data_emb["labels"]
    print("ML2 (Embedding fastembed) dimuat.")
except FileNotFoundError:
    print("ML2 embedding belum dilatih. Gunakan fallback TF-IDF.")
except Exception as e:
    print(f"Error loading ML2 embedding: {e}")

stopwords_indo = ['yang', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan', 'bahwa', 'untuk', 'pada', 'adalah', 'ini', 'itu', 'dalam', 'sebuah', 'oleh', 'akan']

def _ml2_confidence(model, vektor_teks):
    """Estimasi confidence untuk model tanpa predict_proba (mis. LinearSVC) via softmax decision_function."""
    try:
        import numpy as np
        skor = model.decision_function(vektor_teks)
        if skor.ndim == 1:
            skor = skor.reshape(1, -1)
        exp_skor = np.exp(skor - np.max(skor, axis=1, keepdims=True))
        proba = exp_skor / np.sum(exp_skor, axis=1, keepdims=True)
        return round(float(np.max(proba) * 100), 2)
    except Exception:
        return None

def _fitur_embedding(vektor_claim, vektor_evidence):
    """Bangun fitur 1536-d: concat(claim, evidence, |claim-evidence|, claim+evidence)."""
    import numpy as np
    return np.concatenate([
        vektor_claim,
        vektor_evidence,
        np.abs(vektor_claim - vektor_evidence),
        vektor_claim + vektor_evidence,
    ], axis=1)

def _ml2_predict_embedding(teks_klaim, teks_evidence):
    """Prediksi ML2 via fastembed + LogisticRegression. Return (label, confidence)."""
    import numpy as np

    v_claim = np.array(list(embedder.embed([teks_klaim])), dtype=np.float32)
    v_ev = np.array(list(embedder.embed([teks_evidence])), dtype=np.float32)
    X = _fitur_embedding(v_claim, v_ev)

    proba = model_ml2_emb.predict_proba(X)[0]
    idx = int(np.argmax(proba))
    return labels_ml2_emb[idx], round(float(proba[idx] * 100), 2)

def _ml2_predict_tfidf(teks_klaim, teks_evidence):
    """Prediksi ML2 via TF-IDF (fallback). Return (label, confidence)."""
    gabungan = f"klaim {bersihin_teks(teks_klaim)} bukti {bersihin_teks(teks_evidence)}"
    vektor_teks = tfidf_ml2.transform([gabungan])
    label_ml2 = model_ml2.predict(vektor_teks)[0]
    return _map_ml2_label(label_ml2), _ml2_confidence(model_ml2, vektor_teks)

def _ml2_predict(teks_klaim, teks_evidence):
    """Prioritas: TF-IDF (baru dilatih), fallback ke embedding."""
    # Prioritas TF-IDF (model baru hasil retraining, 75% CV accuracy)
    if model_ml2 is not None and tfidf_ml2 is not None:
        try:
            return _ml2_predict_tfidf(teks_klaim, teks_evidence)
        except Exception as e:
            print(f"TF-IDF ML2 error, fallback embedding: {e}")
    if model_ml2_emb is not None and embedder is not None:
        try:
            return _ml2_predict_embedding(teks_klaim, teks_evidence)
        except Exception as e:
            print(f"Embedding ML2 error: {e}")
    return None, None

def bersihin_teks(teks: str) -> str:
    teks = str(teks).lower()
    teks = re.sub(r'[^a-z\s]', '', teks)
    kata_bersih = [k for k in teks.split() if k not in stopwords_indo]
    return ' '.join(kata_bersih)

class ClaimRequest(BaseModel):
    teks_klaim: str

class EvidenceRequest(BaseModel):
    teks_klaim: str
    teks_evidence: str

@app.post("/api/predict")
async def predict_claim(request: ClaimRequest):
    if not model_ml1 or not tfidf_ml1:
        raise HTTPException(status_code=500, detail="Model ML #1 belum siap.")
    
    teks_bersih = bersihin_teks(request.teks_klaim)
    vektor_teks = tfidf_ml1.transform([teks_bersih])
    
    prediksi = int(model_ml1.predict(vektor_teks)[0])  # 0=not_claim, 1=claim
    confidence = float(max(model_ml1.predict_proba(vektor_teks)[0]) * 100)
    is_claim = bool(prediksi)

    category = "OTHER"
    if model_category is not None and tfidf_category is not None:
        vektor_cat = tfidf_category.transform([teks_bersih])
        category = str(model_category.predict(vektor_cat)[0])

    struktur = extract_structure(request.teks_klaim)

    return {
        "teks_asli": request.teks_klaim,
        "prediksi": prediksi,
        "is_claim": is_claim,
        "category": category,
        "subject": struktur["subject"],
        "object": struktur["object"],
        "relation": struktur["relation"],
        "confidence": round(confidence, 2)
    }

@app.post("/api/check-evidence")
async def check_evidence(request: EvidenceRequest):
    if not (model_ml2_emb or (model_ml2 and tfidf_ml2)):
        raise HTTPException(status_code=500, detail="Model ML #2 belum siap.")

    label, confidence = _ml2_predict(request.teks_klaim, request.teks_evidence)

    return {
        "claim": request.teks_klaim,
        "evidence": request.teks_evidence,
        "hubungan": label,
        "confidence": confidence
    }

@app.post("/api/analyze-claim")
async def analyze_claim(request: ClaimRequest):
    """Pipeline lengkap: ML1 -> query gen -> retrieve PubMed -> ranking -> ML2 -> trust engine."""
    if not model_ml1 or not tfidf_ml1:
        raise HTTPException(status_code=500, detail="Model ML #1 belum siap.")
    if not (model_ml2_emb or (model_ml2 and tfidf_ml2)):
        raise HTTPException(status_code=500, detail="Model ML #2 belum siap.")

    teks = request.teks_klaim

    # --- Langkah 1: ML1 (Claim Analyzer) ---
    teks_bersih = bersihin_teks(teks)
    vektor_ml1 = tfidf_ml1.transform([teks_bersih])
    prediksi_ml1 = int(model_ml1.predict(vektor_ml1)[0])
    confidence_ml1 = float(max(model_ml1.predict_proba(vektor_ml1)[0]) * 100)
    is_claim = bool(prediksi_ml1)

    # Kategori via model category (bila tersedia)
    category = "OTHER"
    if model_category is not None and tfidf_category is not None:
        vektor_cat = tfidf_category.transform([teks_bersih])
        category = str(model_category.predict(vektor_cat)[0])

    # Struktur klaim (rule-based)
    struktur = extract_structure(teks)

    analysis = {
        "teks_asli": teks,
        "is_claim": is_claim,
        "category": category,
        "subject": struktur["subject"],
        "object": struktur["object"],
        "relation": struktur["relation"],
        "confidence": round(confidence_ml1, 2),
    }

    # --- Langkah 2: Query Generator ---
    query = generate_query(teks, max_terms=8)

    # --- Langkah 3: Evidence Retriever (PubMed) ---
    try:
        retrieved = retrieve(query, max_results=10)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    source = retrieved["source"]
    evidences = retrieved["evidences"]

    if not evidences:
        return {
            "analysis": analysis,
            "query": query,
            "source": source,
            "evidences": [],
            "assessment": hitung_assessment(analysis, []),
        }

    # --- Langkah 4: Evidence Ranking ---
    istilah_ranking = istilah_untuk_ranking(teks)
    ranked = rank_evidences(teks, evidences, istilah_ranking)[:5]

    # --- Langkah 5: ML2 (Evidence Classifier) per evidence ---
    for ev in ranked:
        teks_ev = (ev.get('title') or '') + ' ' + (ev.get('abstract') or '')
        label_ml2, conf_ml2 = _ml2_predict(teks, teks_ev)
        ev["relationship"] = label_ml2
        ev["confidence"] = conf_ml2
        ev["source"] = source

    # --- Langkah 6: Trust Engine ---
    assessment = hitung_assessment(analysis, ranked)

    return {
        "analysis": analysis,
        "query": query,
        "source": source,
        "evidences": ranked,
        "assessment": assessment,
    }

@app.get("/")
async def root():
    return {"message": "MEDORA is online"}