"""
claim_structure.py
==================
Ekstraksi struktur klaim (rule-based) untuk ML#1 — Claim Analyzer.

Mengubah teks klaim menjadi:
  {
    "subject":  entitas utama (mis. "vitamin C"),
    "object":   target/objek dari klaim (mis. "common cold"),
    "relation": kata kerja hubungan (mis. "prevent", "treat", "cause"),
  }

Pendekatan:
  - Relation: mapping keyword kata kerja (EN + ID) -> label relasi standar.
  - Subject/Object: urutan istilah medis (EN + ID) dalam kalimat; istilah
    pertama (paling awal) dianggap subjek, istilah terakhir dianggap objek.
    Kata kerja relasi dipakai sebagai pemisah jika tersedia.
  - Menggunakan KAMUS_MEDIS dari query_generator untuk normalisasi istilah.

Ini bukan model ML — ini aturan (rule-based) yang ringan & lokal, konsisten
dengan prinsip MEDORA (tanpa API AI berbayar).
"""

import re

from query_generator import KAMUS_MEDIS

# ---------------------------------------------------------------------------
# Leksikon entitas medis bahasa Inggris (untuk deteksi subjek/objek)
# ---------------------------------------------------------------------------
KAMUS_ENTITAS_EN = {
    "common cold", "heart disease", "lung cancer", "breast cancer", "prostate cancer",
    "colon cancer", "colorectal cancer", "cervical cancer", "skin cancer", "cancer",
    "type 2 diabetes", "type 1 diabetes", "diabetes mellitus", "diabetes",
    "high blood pressure", "blood pressure", "hypertension", "heart attack",
    "myocardial infarction", "cardiovascular disease", "stroke", "asthma",
    "alzheimer's disease", "alzheimer", "parkinson's disease", "parkinson",
    "rheumatoid arthritis", "osteoarthritis", "arthritis", "depression",
    "anxiety disorder", "anxiety", "chronic obstructive pulmonary disease",
    "immune system", "immune response", "infectious disease", "vitamin c",
    "vitamin d", "vitamin e", "vitamin b12", "vitamin a", "folic acid",
    "omega-3", "omega 3", "green tea", "olive oil", "garlic", "ginger",
    "sleep quality", "mental health", "physical activity", "weight loss",
    "blood sugar", "cholesterol", "acne", "migraine", "headache", "obesity",
    "eye health", "bone health", "gut health", "digestive health", "immune health",
    "side effect", "side effects", "efek samping", "immune system", "immune response",
    "respiratory infection", "urinary tract infection", "covid-19", "coronavirus",
    "covid 19", "covid", "sars-cov-2", "influenza", "flu", "pneumonia",
    "tuberculosis", "malaria", "dengue", "hiv", "aids", "hepatitis",
    "kidney disease", "liver disease", "thyroid", "osteoporosis", "anemia",
    "allergy", "eczema", "psoriasis", "cataract", "glaucoma", "ulcer",
    "gastritis", "constipation", "diarrhea", "nausea", "dizziness", "fatigue",
    "insomnia", "sleep disorder", "autism", "adhd", "dementia",
    "sakit kepala", "sakit jantung", "penyakit jantung", "kanker paru-paru",
    "kanker payudara", "kanker usus besar", "kanker serviks", "kanker kulit",
    "kanker prostat", "kanker", "diabetes tipe 2", "diabetes tipe 1", "diabetes",
    "darah tinggi", "tekanan darah", "hipertensi", "serangan jantung",
    "penyakit kardiovaskular", "asma", "alzheimer", "parkinson",
    "radang sendi", "artritis", "depresi", "gangguan kecemasan", "kecemasan",
    "sistem imun", "penyakit menular", "vitamin c", "vitamin d", "vitamin e",
    "vitamin b12", "vitamin a", "asam folat", "teh hijau", "minyak zaitun",
    "bawang putih", "jahe", "kualitas tidur", "kesehatan mental",
    "aktivitas fisik", "penurunan berat badan", "gula darah", "kolesterol",
    "jerawat", "migrain", "sakit kepala", "obesitas", "kesehatan mata",
    "kesehatan tulang", "kesehatan usus", "kesehatan pencernaan",
    "infeksi saluran pernapasan", "infeksi saluran kemih", "covid-19",
    "virus corona", "influenza", "flu", "pneumonia", "tuberkulosis", "malaria",
    "demam berdarah", "hiv", "aids", "hepatitis", "penyakit ginjal",
    "penyakit hati", "tiroid", "osteoporosis", "anemia", "alergi", "eksim",
    "psoriasis", "katarak", "glaukoma", "maag", "gastritis", "sembelit",
    "diare", "mual", "pusing", "kelelahan", "insomnia", "gangguan tidur",
    "autisme", "demensia",
}

# ---------------------------------------------------------------------------
# Relasi standar + keyword pencetus
# ---------------------------------------------------------------------------
RELATIONS = {
    "PREVENT": [
        "prevent", "prevents", "preventing", "prevention", "reduce", "reduces",
        "reduce risk", "lower", "protect", "protects", "avoid", "avoids",
        "mencegah", "cegah", "pencegahan", "melindungi", "proteksi",
        "menurunkan risiko", "mengurangi risiko", "mengurangi",
    ],
    "TREAT": [
        "treat", "treats", "treatment", "treating", "cure", "cures", "heal",
        "heals", "therapy", "therapeutic", "effective", "efficacy", "remedy",
        "manage", "relieve", "relieves", "mengobati", "mengatasi", "menyembuhkan",
        "terapi", "pengobatan", "mengurangi gejala",
    ],
    "CAUSE": [
        "cause", "causes", "caused", "causing", "lead to", "leads to", "result in",
        "results in", "trigger", "triggers", "induce", "induces", "menyebabkan",
        "disebabkan", "memicu", "mengakibatkan", "menimbulkan",
    ],
    "INCREASE": [
        "increase", "increases", "increased", "boost", "boosts", "improve",
        "improves", "raise", "raises", "enhance", "enhances", "meningkatkan",
        "memperbaiki", "mendorong", "memperkuat", "menguatkan", "membantu",
        "strengthen", "strengthens", "strengthening", "supports", "support",
        "boost immune", "boost immunity",
    ],
    "DECREASE": [
        "decrease", "decreases", "decreased", "reduce", "reduces", "lower",
        "lowers", "diminish", "menurunkan", "mengurangi",
    ],
    "ASSOCIATE": [
        "associate", "associated with", "linked to", "correlate", "correlates",
        "berhubungan", "terkait dengan", "berkaitan", "berasosiasi",
    ],
}

# Kata kerja yang dipakai sebagai pemisah subjek/objek (urutan preferensi)
RELATION_KEYWORDS = []
for label, kws in RELATIONS.items():
    for kw in kws:
        if len(kw) > 2:
            RELATION_KEYWORDS.append(kw)
RELATION_KEYWORDS.sort(key=len, reverse=True)  # frasa panjang dulu


# ---------------------------------------------------------------------------
# Normalisasi / tokenisasi istilah
# ---------------------------------------------------------------------------
def _normalisasi_istilah(istilah: str) -> str:
    """Normalisasi istilah: lowercase, hapus stopword tipis, trim."""
    istilah = re.sub(r"[^a-zA-Z0-9\s]", " ", istilah)
    istilah = re.sub(r"\s+", " ", istilah).strip().lower()
    return istilah


def _ke_kamus(istilah: str) -> str:
    """Terjemahkan istilah Indonesia -> English bila ada di KAMUS_MEDIS."""
    bersih = _normalisasi_istilah(istilah)
    if bersih in KAMUS_MEDIS:
        return KAMUS_MEDIS[bersih]
    # Cek multiword
    if bersih in KAMUS_MEDIS:
        return KAMUS_MEDIS[bersih]
    return istilah.strip()


# ---------------------------------------------------------------------------
# Ekstraksi relasi
# ---------------------------------------------------------------------------
def extract_relation(teks: str) -> str:
    """Cari label relasi dari keyword kata kerja dalam teks."""
    teks_lower = (teks or "").lower()
    # Skor tiap label: label dengan keyword paling awal & paling banyak menang
    posisi = {}
    for label, kws in RELATIONS.items():
        best = None
        for kw in kws:
            idx = teks_lower.find(kw.lower())
            if idx != -1 and (best is None or idx < best):
                best = idx
        if best is not None:
            posisi[label] = best
    if not posisi:
        return "UNKNOWN"
    # Label yang muncul paling awal dalam kalimat
    return min(posisi, key=posisi.get)


# ---------------------------------------------------------------------------
# Ekstraksi istilah (subject/object)
# ---------------------------------------------------------------------------
# Stopword untuk menyaring entitas (bukan subjek/objek)
_ENTITY_STOP = {
    "the", "a", "an", "of", "in", "on", "at", "to", "for", "with", "by",
    "from", "as", "that", "this", "these", "those", "and", "or", "is", "are",
    "was", "were", "be", "been", "can", "could", "will", "would", "may",
    "might", "should", "people", "patients", "persons", "women", "men",
    "children", "child", "adults", "yang", "di", "ke", "dari", "dengan",
    "pada", "untuk", "adalah", "ini", "itu", "dalam", "sebuah", "oleh",
    "akan", "tidak", "juga", "dapat", "bisa", "harus", "mungkin",
    # Kata kerja/kata non-entitas yang sering salah jadi subjek/objek
    "minum", "drink", "drinking", "eating", "eat", "consume", "consuming",
    "makan", "mengonsumsi", "efek", "effect", "effects", "samping", "side",
    "mengurangi", "menurunkan", "meningkatkan", "mencegah", "mengobati",
    "risiko", "risk", "resiko", "setiap", "hari", "day", "dapat", "bisa",
    "menyebabkan", "caused", "berbagai", "beberapa", "semua", "banyak",
    "memperkuat", "menguatkan", "membantu", "terkena", "apakah", "adalah",
    "mengurangi", "menyembuhkan", "mengatasi", "merupakan", "penelitian",
    "studi", "menurut", "disebutkan", "menyebutkan", "terbukti", "mengklaim",
}


def _ekstrak_entitas(teks: str) -> list[str]:
    """
    Ekstrak kandidat entitas (subjek/objek) dari teks.
    Prioritas: KAMUS_ENTITAS_EN (EN multiword), KAMUS_MEDIS (ID->EN), lalu token biasa.
    """
    teks_lower = teks.lower()
    ditemukan = []
    # Track indeks untuk urutan kemunculan
    indeks_entitas = []

    def _tambah(entitas: str, idx: int):
        """Tambah entitas jika belum ada & simpan indeks."""
        if entitas not in ditemukan:
            ditemukan.append(entitas)
            indeks_entitas.append(idx)

    # 0. Hapus relasi keyword dari teks agar tidak jadi entitas
    for kw in sorted(RELATION_KEYWORDS, key=len, reverse=True):
        teks_lower = teks_lower.replace(kw.lower(), " ")

    # 1. Frasa multiword dari KAMUS_ENTITAS_EN (prioritas tertinggi)
    frasa_en = sorted(KAMUS_ENTITAS_EN, key=len, reverse=True)
    for frasa in frasa_en:
        # Cari match seluruh kata
        pattern = r"\b" + re.escape(frasa) + r"\b"
        m = re.search(pattern, teks_lower)
        if m:
            _tambah(frasa, m.start())
            teks_lower = re.sub(pattern, " ", teks_lower)

    # 2. Frasa multiword dari KAMUS_MEDIS (ID -> EN)
    frasa_kamus = [k for k in KAMUS_MEDIS if len(k.split()) > 1]
    frasa_kamus.sort(key=len, reverse=True)
    for frasa in frasa_kamus:
        pattern = r"\b" + re.escape(frasa) + r"\b"
        m = re.search(pattern, teks_lower)
        if m:
            _tambah(KAMUS_MEDIS[frasa], m.start())
            teks_lower = re.sub(pattern, " ", teks_lower)

    # 3. Token tunggal dari KAMUS_ENTITAS_EN
    token_en = sorted(KAMUS_ENTITAS_EN, key=len, reverse=True)
    for token in token_en:
        if " " in token:
            continue  # sudah diproses di langkah 1
        pattern = r"\b" + re.escape(token) + r"\b"
        m = re.search(pattern, teks_lower)
        if m:
            _tambah(token, m.start())
            teks_lower = re.sub(pattern, " ", teks_lower)

    # 4. Token tunggal dari KAMUS_MEDIS (ID -> EN)
    token_kamus = [k for k in KAMUS_MEDIS if len(k.split()) == 1]
    for token in token_kamus:
        pattern = r"\b" + re.escape(token) + r"\b"
        m = re.search(pattern, teks_lower)
        if m:
            terjemahan = KAMUS_MEDIS[token]
            _tambah(terjemahan, m.start())
            teks_lower = re.sub(pattern, " ", teks_lower)

    # 5. Sisa token bermakna (fallback)
    sisa_kata = re.findall(r"[a-zA-Z]{4,}", teks_lower)
    for s in sisa_kata:
        if s.lower() not in _ENTITY_STOP:
            cari = re.search(r"\b" + re.escape(s) + r"\b", teks_lower)
            _tambah(s, cari.start() if cari else 9999)

    # Urutkan berdasarkan indeks kemunculan
    hasil = [ditemukan[i] for i in sorted(range(len(ditemukan)), key=lambda i: indeks_entitas[i])]

    # Normalisasi: map ID -> EN
    hasil_norm = []
    for h in hasil:
        if h in KAMUS_MEDIS:
            hasil_norm.append(KAMUS_MEDIS[h])
        else:
            hasil_norm.append(h)

    return hasil_norm


def _extract_core(teks: str) -> dict:
    """
    Inti logika: tentukan relation, lalu subject/object dengan memakai posisi
    kata kerja relasi sebagai pemisah.
    """
    relation = extract_relation(teks)

    # Cari posisi keyword relasi dalam teks
    teks_lower = (teks or "").lower()
    posisi_rel = None
    kw_relasi = None
    for kw in RELATION_KEYWORDS:
        idx = teks_lower.find(kw)
        if idx != -1 and (posisi_rel is None or idx < posisi_rel):
            posisi_rel = idx
            kw_relasi = kw

    # Bagian sebelum / sesudah kata kerja relasi
    if posisi_rel is not None and posisi_rel > 0:
        bagian_kiri = teks[:posisi_rel]
        bagian_kanan = teks[posisi_rel + len(kw_relasi):]
    else:
        # Tanpa kata kerja jelas: separuh kalimat sebagai fallback
        tengah = len(teks) // 2
        bagian_kiri = teks[:tengah]
        bagian_kanan = teks[tengah:]

    entitas_kiri = _ekstrak_entitas(bagian_kiri)
    entitas_kanan = _ekstrak_entitas(bagian_kanan)

    subject = entitas_kiri[0] if entitas_kiri else (entitas_kanan[0] if entitas_kanan else "")
    object_ = entitas_kanan[0] if entitas_kanan else (entitas_kiri[1] if len(entitas_kiri) > 1 else "")

    return {
        "subject": _ke_kamus(subject) if subject else "",
        "object": _ke_kamus(object_) if object_ else "",
        "relation": relation,
    }


def extract_structure(teks: str) -> dict:
    """
    API publik: ekstrak struktur klaim.
    Input  : teks klaim (EN/ID).
    Output : {"subject": str, "object": str, "relation": str}
    """
    if not teks or not isinstance(teks, str):
        return {"subject": "", "object": "", "relation": "UNKNOWN"}

    hasil = _extract_core(teks.strip())

    # Fallback bila subject kosong: entitas pertama dari seluruh teks
    if not hasil["subject"]:
        entitas = _ekstrak_entitas(teks)
        if entitas:
            hasil["subject"] = _ke_kamus(entitas[0])
    if not hasil["object"] and hasil["subject"]:
        entitas = _ekstrak_entitas(teks)
        if len(entitas) > 1:
            hasil["object"] = _ke_kamus(entitas[1])

    # Pastikan subject != object (bila sama, kosongkan object)
    if hasil["subject"] and hasil["subject"].lower() == hasil["object"].lower():
        hasil["object"] = ""

    return hasil


# ---------------------------------------------------------------------------
# Test cepat
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    CONTOH = [
        "Minum vitamin C setiap hari dapat mencegah flu.",
        "Vitamin C prevents the common cold.",
        "Eating fruits reduces the risk of heart disease.",
        "Vaksin COVID-19 menyebabkan efek samping ringan.",
        "Olahraga meningkatkan kualitas tidur.",
        "Merokok menyebabkan kanker paru-paru.",
        "Kopi mengurangi risiko diabetes tipe 2.",
    ]
    for c in CONTOH:
        print(f"\nINPUT : {c}")
        print(f"OUTPUT: {extract_structure(c)}")
