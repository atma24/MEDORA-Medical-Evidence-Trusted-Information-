import re

from sklearn.feature_extraction.text import TfidfVectorizer

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


def _bersihkan(teks: str) -> str:
    teks = str(teks).lower()
    teks = re.sub(r'[^a-z\s]', ' ', teks)
    kata = [k for k in teks.split() if k not in STOPWORDS_ID and len(k) > 2]
    return ' '.join(kata)


def rank_evidences(teks_klaim: str, evidences: list[dict], istilah_en: list[str] | None = None) -> list[dict]:
    """Beri skor relevansi (TF-IDF cosine similarity) claim vs tiap evidence, urutkan descending.

    teks_klaim dipakai sebagai dasar, tetapi istilah_en (terjemahan ke bahasa Inggris)
    membuat dokumen klaim sebanding dengan evidence berbahasa Inggris.
    """
    if not evidences:
        return []

    # Dokumen klaim: gabungan teks asli (Indonesia) + istilah medis terjemahan (Inggris)
    klaim_bersih = _bersihkan(teks_klaim)
    if istilah_en:
        klaim_bersih += ' ' + _bersihkan(' '.join(istilah_en))
    klaim_bersih = klaim_bersih.strip()

    # Gabungkan title + abstract untuk setiap evidence
    dokumen = []
    for ev in evidences:
        teks_ev = f"{ev.get('title', '')} {ev.get('abstract', '')}"
        dokumen.append(_bersihkan(teks_ev))

    korpus = [klaim_bersih] + dokumen

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        matriks = vectorizer.fit_transform(korpus)
        v_klaim = matriks[0]
        # cosine similarity = dot product matriks ternormalisasi TF-IDF
        skor = (matriks @ v_klaim.T).toarray().ravel()[1:]
    except Exception:
        skor = [0.0] * len(evidences)

    hasil = []
    for ev, sk in zip(evidences, skor):
        item = dict(ev)
        item["relevance_score"] = round(float(sk), 4)
        hasil.append(item)

    hasil.sort(key=lambda x: x["relevance_score"], reverse=True)
    return hasil