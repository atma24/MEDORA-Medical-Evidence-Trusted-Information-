from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import re
import os

app = FastAPI(title="MEDORA ML API", description="API untuk deteksi klaim kesehatan", version="1.0")

# Setup CORS biar frontend React (Vite) bisa nembak API ini tanpa diblokir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Saat production, ganti dengan URL frontend lu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. LOAD MODEL & TF-IDF
# Pastikan path-nya sesuai dengan letak folder models lu
MODEL_PATH = os.path.join("models", "medora_model_logreg_ultimate.joblib")
TFIDF_PATH = os.path.join("models", "medora_tfidf_ultimate.joblib")

try:
    print("Loading models...")
    model = joblib.load(MODEL_PATH)
    tfidf = joblib.load(TFIDF_PATH)
    print("Models loaded successfully! 🚀")
except Exception as e:
    print(f"Error loading models: {e}")
    model = None
    tfidf = None

# 2. FUNGSI PEMBERSIH TEKS (Wajib sama persis dengan yang di Colab!)
stopwords_indo = ['yang', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan', 'bahwa', 'untuk', 'pada', 'adalah', 'ini', 'itu', 'dalam', 'sebuah', 'oleh', 'akan']

def bersihin_teks(teks: str) -> str:
    teks = str(teks).lower()
    teks = re.sub(r'[^a-z\s]', '', teks)
    kata_bersih = [k for k in teks.split() if k not in stopwords_indo]
    return ' '.join(kata_bersih)

# 3. SCHEMA REQUEST DARI FRONTEND
class ClaimRequest(BaseModel):
    teks_klaim: str

# 4. ENDPOINT PREDIKSI
@app.post("/api/predict")
async def predict_claim(request: ClaimRequest):
    if model is None or tfidf is None:
        raise HTTPException(status_code=500, detail="Model ML belum siap di server.")
    
    if not request.teks_klaim.strip():
        raise HTTPException(status_code=400, detail="Teks klaim tidak boleh kosong.")

    # Bersihkan teks input user
    teks_bersih = bersihin_teks(request.teks_klaim)
    
    # Ubah ke bentuk TF-IDF
    vektor_teks = tfidf.transform([teks_bersih])
    
    # Lakukan prediksi (true / false)
    prediksi = model.predict(vektor_teks)[0]
    
    # Hitung seberapa yakin modelnya (Confidence / Probability)
    probabilitas = model.predict_proba(vektor_teks)[0]
    confidence = max(probabilitas) * 100

    return {
        "teks_asli": request.teks_klaim,
        "teks_bersih": teks_bersih,
        "prediksi": prediksi, # Output: 'true' atau 'false'
        "confidence": round(confidence, 2) # Contoh: 80.66
    }

# Endpoint buat ngecek API nyala atau mati
@app.get("/")
async def root():
    return {"message": "MEDORA ML Engine is running! ⚡"}