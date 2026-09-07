import re
from collections import Counter

from sklearn.feature_extraction.text import TfidfVectorizer

# ---------------------------------------------------------------------------
# Stopwords (ID + EN)
# ---------------------------------------------------------------------------
STOPWORDS_ID = {
    'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan', 'bahwa', 'untuk', 'pada',
    'adalah', 'ini', 'itu', 'dalam', 'sebuah', 'oleh', 'akan', 'tidak', 'juga',
    'dapat', 'bisa', 'harus', 'mungkin', 'apakah', 'bagi', 'sebagai', 'saat',
    'setelah', 'sebelum', 'karena', 'sangat', 'lebih', 'kurang', 'adanya', 'banyak',
    'tentang', 'terhadap', 'menurut', 'kita', 'kami', 'mereka', 'anda', 'saya',
    'dan', 'the', 'of', 'and', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'is',
    'are', 'was', 'were', 'be', 'been', 'as', 'or', 'but', 'not', 'that', 'this',
    'these', 'those', 'it', 'its', 'from', 'about', 'study', 'results', 'result',
}

# Pola suffix medis internasional (untuk bridge terms)
_MEDICAL_SUFFIX = re.compile(
    r'(itis|osis|emia|emia|ology|tion|ment|ase|ine|ide|ol|al|ic|sis|gen|ly|ty|ry|cy)$'
)

# ---------------------------------------------------------------------------
# Embedding model (lazy load)
# ---------------------------------------------------------------------------
_embedding_model = None


def _load_embedding_model():
    """Load model embedding multilingual (1x saja saat pertama dipanggil)."""
    global _embedding_model
    if _embedding_model is None:
        try:
            from fastembed import TextEmbedding
            _embedding_model = TextEmbedding("paraphrase-multilingual-MiniLM-L12-v2")
        except Exception:
            pass  # nanti fallback ke TF-IDF
    return _embedding_model


# ---------------------------------------------------------------------------
# Text cleaning
# ---------------------------------------------------------------------------
def _bersihkan(teks: str) -> str:
    teks = str(teks).lower()
    teks = re.sub(r'[^a-z\s]', ' ', teks)
    kata = [k for k in teks.split() if k not in STOPWORDS_ID and len(k) > 2]
    return ' '.join(kata)


# ---------------------------------------------------------------------------
# Bridge terms: ekstrak kata medis dari abstrak evidence
# ---------------------------------------------------------------------------
def _ekstrak_bridge_terms(dokumen_evidence: list[str], max_terms: int = 15) -> str:
    """Ekstrak kata kunci medis dari abstrak evidence untuk menjembatani
    perbedaan bahasa (klaim ID vs evidence EN).

    Bridge terms ini ditambahkan ke dokumen klaim agar TF-IDF maupun
    embedding punya lebih banyak overlap vocabulary.
    """
    semua_kata = []
    for doc in dokumen_evidence:
        semua_kata.extend(doc.split())

    counter = Counter(semua_kata)
    bridge = []

    for kata, count in counter.most_common(60):
        if len(bridge) >= max_terms:
            break
        if len(kata) <= 3:
            continue
        # Kata yang muncul >= 2x atau punya suffix medis
        if count >= 3 or (count >= 2 and _MEDICAL_SUFFIX.search(kata)):
            bridge.append(kata)

    return ' '.join(bridge)


# ---------------------------------------------------------------------------
# Utama: rank_evidences
# ---------------------------------------------------------------------------
def rank_evidences(teks_klaim: str, evidences: list[dict], istilah_en: list[str] | None = None) -> list[dict]:
    """Beri skor relevansi claim vs tiap evidence, urutkan descending.

    Strategi:
      1. Primary: multilingual embedding cosine similarity (lintas bahasa)
      2. Fallback: TF-IDF cosine similarity

    Dokumen klaim diperkaya dengan:
      - istilah_en (terjemahan medis ID→EN)
      - bridge terms (kata medis yang diekstrak dari abstrak evidence)
    """
    if not evidences:
        return []

    # --- Bangun dokumen klaim (diperkaya) ---
    klaim_bersih = _bersihkan(teks_klaim)
    if istilah_en:
        klaim_bersih += ' ' + _bersihkan(' '.join(istilah_en))

    # --- Bangun dokumen evidence ---
    dokumen = []
    for ev in evidences:
        teks_ev = f"{ev.get('title', '')} {ev.get('abstract', '')}"
        dokumen.append(_bersihkan(teks_ev))

    # --- Tambah bridge terms dari abstrak evidence ---
    bridge = _ekstrak_bridge_terms(dokumen)
    if bridge:
        klaim_bersih = (klaim_bersih + ' ' + bridge).strip()

    # --- Primary: Multilingual Embeddings ---
    skor = None
    model = _load_embedding_model()
    if model is not None:
        try:
            semua_teks = [klaim_bersih] + dokumen
            embeddings = list(model.embed(semua_teks))
            v_klaim = embeddings[0]
            # Cosine similarity: dot product (fastembed sudah normalized)
            skor = [float(sum(a * b for a, b in zip(v_klaim, ve))) for ve in embeddings[1:]]
        except Exception:
            skor = None

    # --- Fallback: TF-IDF ---
    if skor is None:
        try:
            korpus = [klaim_bersih] + dokumen
            vectorizer = TfidfVectorizer(stop_words='english')
            matriks = vectorizer.fit_transform(korpus)
            skor = (matriks @ matriks[0].T).toarray().ravel()[1:]
        except Exception:
            skor = [0.0] * len(evidences)

    # --- Susun hasil ---
    hasil = []
    for ev, sk in zip(evidences, skor):
        item = dict(ev)
        item["relevance_score"] = round(max(0.0, min(1.0, float(sk))), 4)
        hasil.append(item)

    hasil.sort(key=lambda x: x["relevance_score"], reverse=True)
    return hasil
