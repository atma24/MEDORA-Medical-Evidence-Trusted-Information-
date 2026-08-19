from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import re
import os

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

PATH_ML2_MODEL = os.path.join("models", "medora_model_ml2_v2.joblib")
PATH_ML2_TFIDF = os.path.join("models", "medora_tfidf_ml2_v2.joblib")

print("Memuat mesin ML ke dalam server...")
try:
    
    model_ml1 = joblib.load(PATH_ML1_MODEL)
    tfidf_ml1 = joblib.load(PATH_ML1_TFIDF)
   
    model_ml2 = joblib.load(PATH_ML2_MODEL)
    tfidf_ml2 = joblib.load(PATH_ML2_TFIDF)
    print("dua ml berhasil dimuat")
except Exception as e:
    print(f"Error loading models: {e}")
    model_ml1, tfidf_ml1, model_ml2, tfidf_ml2 = None, None, None, None

stopwords_indo = ['yang', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan', 'bahwa', 'untuk', 'pada', 'adalah', 'ini', 'itu', 'dalam', 'sebuah', 'oleh', 'akan']

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
    
    prediksi = model_ml1.predict(vektor_teks)[0]
    confidence = max(model_ml1.predict_proba(vektor_teks)[0]) * 100

    return {
        "teks_asli": request.teks_klaim,
        "prediksi": prediksi,
        "confidence": round(confidence, 2)
    }

@app.post("/api/check-evidence")
async def check_evidence(request: EvidenceRequest):
    if not model_ml2 or not tfidf_ml2:
        raise HTTPException(status_code=500, detail="Model ML #2 belum siap.")

    claim_bersih = bersihin_teks(request.teks_klaim)
    evidence_bersih = bersihin_teks(request.teks_evidence)

    teks_gabungan = f"klaim {claim_bersih} bukti {evidence_bersih}"
    
    vektor_teks = tfidf_ml2.transform([teks_gabungan])

    prediksi_label = model_ml2.predict(vektor_teks)[0]
    
    return {
        "claim": request.teks_klaim,
        "evidence": request.teks_evidence,
        "hubungan": prediksi_label
    }

@app.get("/")
async def root():
    return {"message": "MEDORA is online"}