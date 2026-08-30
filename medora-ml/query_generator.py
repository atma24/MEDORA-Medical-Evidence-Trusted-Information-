import re

STOPWORDS_INDO = {
    # Kata fungsi umum
    'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan', 'bahwa', 'untuk', 'pada',
    'adalah', 'ini', 'itu', 'dalam', 'sebuah', 'oleh', 'akan', 'tidak', 'juga',
    'dapat', 'bisa', 'harus', 'mungkin', 'apakah', 'bagi', 'sebagai', 'saat',
    'setelah', 'sebelum', 'karena', 'sangat', 'lebih', 'kurang', 'adanya', 'banyak',
    'tentang', 'terhadap', 'menurut', 'para', 'kita', 'kami', 'mereka',
    'anda', 'saya', 'menyatakan', 'seperti', 'mencoba', 'coba', 'ingin', 'mau',
    'para', 'menyatakan', 'bahwa', 'seperti', 'pada', 'ke',

    # Kata waktu/frekuensi (penyebab utama query kotor: "pagi", "mentah")
    'pagi', 'siang', 'sore', 'malam', 'hari', 'setiap', 'selalu', 'sering',
    'jarang', 'terus', 'terusmenerus', 'terus-menerus', 'rutin', 'harian',
    'jam', 'menit', 'detik', 'minggu', 'bulan', 'tahun', 'sehari', 

    # Keadaan fisik / benda umum
    'mentah', 'matang', 'mati', 'hidup', 'panas', 'dingin', 'basah', 'kering',
    'cepat', 'lambat', 'besar', 'kecil', 'tinggi', 'rendah', 'berat', 'ringan',
    'semua', 'sebagian', 'beberapa', 'kebanyakan', 'mayoritas', 'minoritas',

    # Benda organ tubuh & anatomi (bukan istilah medis formal)
    'tulang', 'sendi', 'otot', 'perut', 'usus', 'ginjal', 'paru-paru', 'paru',
    'tenggorokan', 'tenggorok', 'kepala', 'leher', 'bahu', 'punggung', 'pinggang',
    'lengan', 'tangan', 'jari', 'paha', 'lutut', 'kaki', 'tumit',

    # Verba Indonesia yang sering jadi query kotor
    'membunuh', 'mematikan', 'menewaskan', 'menyembuhkan', 'mengobati', 'mengatasi',
    'mencegah', 'memicu', 'menimbulkan', 'menyebabkan', 'mengakibatkan',
    'menggunakan', 'konsumsi', 'mengonsumsi', 'minum', 'meminum', 'makan', 'memakan',
    'butuh', 'perlunya', 'diperlukan', 'dibutuhkan', 'memerlukan', 'mengandung',
    'menghasilkan', 'mampu', 'berhasil', 'gagal', 'sukses',
}

KAMUS_MEDIS = {
    # Kata kunci Indonesia -> English (untuk pencarian PubMed)
    'pilek': 'common cold',
    'demam': 'fever',
    'batuk': 'cough',
    'flu': 'influenza',
    'sakit': 'pain',
    'nyeri': 'pain',
    'kepala': 'headache',
    'sakit kepala': 'headache',
    'migrain': 'migraine',
    'jantung': 'heart',
    'serangan jantung': 'myocardial infarction',
    'stroke': 'stroke',
    'darah': 'blood',
    'darah tinggi': 'hypertension',
    'hipertensi': 'hypertension',
    'tekanan darah': 'blood pressure',
    'kolesterol': 'cholesterol',
    'diabetes': 'diabetes',
    'gula darah': 'blood glucose',
    'kanker': 'cancer',
    'tumor': 'tumor',
    'paru': 'lung',
    'asthma': 'asthma',
    'asma': 'asthma',
    'alergi': 'allergy',
    'obat': 'drug',
    'vaksin': 'vaccine',
    'imunisasi': 'vaccination',
    'vitamin c': 'vitamin C',
    'vitamin c': 'ascorbic acid',
    'vitamin d': 'vitamin D',
    'vitamin e': 'vitamin E',
    'kalsium': 'calcium',
    'zat besi': 'iron',
    'magnesium': 'magnesium',
    'omega': 'omega-3',
    'probiotik': 'probiotics',
    'antibiotik': 'antibiotics',
    'ginjal': 'kidney',
    'hati': 'liver',
    'lambung': 'stomach',
    'usus': 'intestine',
    'pencernaan': 'digestion',
    'kolesterol tinggi': 'hypercholesterolemia',
    'obesitas': 'obesity',
    'gemuk': 'obesity',
    'kurus': 'underweight',
    'puasa': 'fasting',
    'olahraga': 'exercise',
    'tidur': 'sleep',
    'insomnia': 'insomnia',
    'stres': 'stress',
    'depresi': 'depression',
    'cemas': 'anxiety',
    'kecemasan': 'anxiety',
    'hamil': 'pregnancy',
    'kehamilan': 'pregnancy',
    'menyusui': 'breastfeeding',
    'bayi': 'infant',
    'anak': 'child',
    'remaja': 'adolescent',
    'lansia': 'elderly',
    'kelebihan berat': 'overweight',
    'kurus': 'underweight',
    'sehat': 'healthy',
    'penyakit': 'disease',
    'infeksi': 'infection',
    'virus': 'virus',
    'bakteri': 'bacteria',
    'radang': 'inflammation',
    'peradangan': 'inflammation',
    'luka': 'wound',
    'patah tulang': 'bone fracture',
    'tulang': 'bone',
    'sendi': 'joint',
    'arthritis': 'arthritis',
    'mata': 'eye',
    'penglihatan': 'vision',
    'kulit': 'skin',
    'rambut': 'hair',
    'gigi': 'tooth',
    'gusi': 'gum',
    'telinga': 'ear',
    'hidung': 'nose',
    'tenggorokan': 'throat',
    'malaria': 'malaria',
    'dengue': 'dengue',
    'dbd': 'dengue',
    'tbc': 'tuberculosis',
    'tuberkulosis': 'tuberculosis',
    'hiv': 'HIV',
    'aids': 'AIDS',
    'covid': 'COVID-19',
    'corona': 'coronavirus',
    'alkohol': 'alcohol',
    'merokok': 'smoking',
    'rokok': 'cigarette',
    'kopi': 'coffee',
    'teh': 'tea',
    'gula': 'sugar',
    'garam': 'salt',
    'garam berlebih': 'sodium',
    'air': 'water',
    'serat': 'fiber',
    'protein': 'protein',
    'lemak': 'fat',
    'kalori': 'calorie',
    'vitamin': 'vitamin',
    'mineral': 'mineral',
    'suplemen': 'supplement',
    'herbal': 'herbal',
    'jahe': 'ginger',
    'kuning telur': 'egg yolk',
    'telur': 'egg',
    'susu': 'milk',
    'keju': 'cheese',
    'daging': 'meat',
    'ikan': 'fish',
    'buah': 'fruit',
    'sayur': 'vegetable',
    'kacang': 'nut',
    'madu': 'honey',
    'bawang': 'garlic',
    'bawang putih': 'garlic',
    'bawang merah': 'onion',
    'kunyit': 'turmeric',
    'temulawak': 'curcuma',
    'daun': 'leaf',
    'kolesterol jahat': 'LDL cholesterol',
    'kolesterol baik': 'HDL cholesterol',
    'kesehatan mental': 'mental health',
    'pencernaan': 'gastrointestinal',
    'asam lambung': 'acid reflux',
    'maag': 'gastritis',
    'magh': 'gastritis',
    'ulcer': 'ulcer',
    'sembelit': 'constipation',
    'diare': 'diarrhea',
    'mual': 'nausea',
    'muntah': 'vomiting',
    'pusing': 'dizziness',
    'lelah': 'fatigue',
    'kelelahan': 'fatigue',
    'kram': 'cramp',
    'otot': 'muscle',
    'menurunkan berat': 'weight loss',
    'menaikkan berat': 'weight gain',
    'menambah berat': 'weight gain',
    'detoks': 'detox',
    'penuaan': 'aging',
    'antioksidan': 'antioxidant',
    'imun': 'immune',
    'kekebalan': 'immunity',
    'daya tahan': 'immunity',
    'metabolisme': 'metabolism',
    'hormon': 'hormone',
    'insulin': 'insulin',
    'tiroid': 'thyroid',
    'kolagen': 'collagen',
    'glukosa': 'glucose',
    'karbohidrat': 'carbohydrate',
    'protein whey': 'whey protein',
    'elektrolit': 'electrolyte',
    'dehidrasi': 'dehydration',
    'hidrasi': 'hydration',
    'autisme': 'autism',
    'autis': 'autism',
    'autisme pada anak': 'autism children',
    'asd': 'autism spectrum disorder',
    'adhd': 'ADHD',
    'gangguan perkembangan': 'developmental disorder',
    'kelainan': 'disorder',
    'kelainan bawaan': 'congenital disorder',
    'cacat': 'disability',
    'keterlambatan bicara': 'speech delay',
    'speech delay': 'speech delay',
    'tumbuh kembang': 'growth development',
    'stunting': 'stunting',
    'gizi buruk': 'malnutrition',
    'kurang gizi': 'malnutrition',
    'kekurangan gizi': 'malnutrition',
    'kebutaan': 'blindness',
    'buta': 'blindness',
    'sinar matahari': 'sunlight',
    'matahari': 'sun',
    'kekurangan': 'deficiency',
    'kekurangan vitamin': 'vitamin deficiency',
    'kelebihan': 'excess',
    'keracunan': 'poisoning',
    'racun': 'poison',
    'ibu hamil': 'pregnant women',
    'ibu': 'mother',
    'ayah': 'father',
    'wanita': 'women',
    'pria': 'men',
    'laki laki': 'men',
    'perempuan': 'women',
    'bayi lahir': 'newborn',
    'persalinan': 'childbirth',
    'persalinan': 'delivery',
    'menstruasi': 'menstruation',
    'haid': 'menstruation',
    'jantung koroner': 'coronary heart disease',
    'koroner': 'coronary',
    'pembuluh darah': 'blood vessel',
    'arteri': 'artery',
    'aterosklerosis': 'atherosclerosis',
    'stroke iskemik': 'ischemic stroke',
    'gumpalan darah': 'blood clot',
    'trombosis': 'thrombosis',
    'emboli': 'embolism',
    'kanker paru': 'lung cancer',
    'kanker payudara': 'breast cancer',
    'kanker kulit': 'skin cancer',
    'kanker serviks': 'cervical cancer',
    'serviks': 'cervix',
    'leher rahim': 'cervix',
    'tumor ganas': 'malignant tumor',
    'tumor jinak': 'benign tumor',
    'kemoterapi': 'chemotherapy',
    'radioterapi': 'radiotherapy',
    'imunoterapi': 'immunotherapy',
    'organ': 'organ',
    'transplantasi': 'transplantation',
    'donor': 'donation',
    'darah donor': 'blood donation',
}

# Frasa multi-kata yang harus dicek sebelum kata tunggal
_FRASA_MULTI = sorted(
    [f for f in KAMUS_MEDIS if len(f.split()) > 1],
    key=lambda x: len(x.split()),
    reverse=True,
)

GENERIC_TERMS = {
    'klaim', 'claim', 'medis', 'kesehatan', 'kata', 'kutipan', 'informasi', 'fakta',
    'pernyataan', 'gejala', 'penyakit', 'efek', 'samping', 'bahaya', 'manfaat',
    'kasus', 'laporan', 'penelitian', 'studi', 'artikel', 'mengatakan', 'mengklaim',
    'disebutkan', 'dilaporkan', 'disebut', 'teks', 'tidak', 'ini', 'itu', 'tersebut',
    'bahwa', 'dengan', 'untuk', 'pada', 'yang',
    # Kata kerja & kata sifat generik (bukan istilah medis)
    'mencegah', 'mengobati', 'menyebabkan', 'menimbulkan', 'memperbaiki',
    'meningkatkan', 'menurunkan', 'mengurangi', 'membantu', 'bisa', 'dapat', 'boleh',
    'harus', 'baik', 'buruk', 'aman', 'berbahaya', 'efektif', 'manjur', 'memicu',
    'terjadi', 'disebabkan', 'orang', 'dewasa', 'anak', 'bayi', 'pasien',
    'karena', 'agar', 'supaya', 'membuat', 'menggunakan', 'gunakan',
    'konsumsi', 'mengonsumsi', 'minum', 'meminum', 'makan', 'memakan',
    'berlebihan', 'berlebih', 'tinggi', 'rendah', 'banyak', 'sedikit', 'rutin',
    'secara', 'teratur', 'langsung', 'karena', 'akibat', 'sering', 'jarang',
    'anda', 'semua', 'setiap', 'selalu', 'selama', 'ketika', 'jika', 'maka',
    'tubuh', 'badan', 'risiko', 'resiko', 'berat', 'berupa', 'mempengaruhi',
    'berdampak', 'berpengaruh', 'berhubungan', 'berkaitan', 'berkualitas',
    'terbukti', 'tepat', 'sesuai', 'benar', 'valid', 'otentik',
    'asli', 'segar', 'dingin', 'air es', 'air dingin', 'es',
}


def _bersihkan_kata(kata: str) -> str:
    kata = re.sub(r'[^a-z]', '', kata.lower())
    return kata


def _ekstrak_istilah(teks: str) -> list[str]:
    """Ekstrak istilah medis (terjemahan ID->EN) dari teks klaim."""
    istilah = []
    sisa = teks.lower()

    # Cek frasa multi-kata dulu (terpanjang)
    for frasa in _FRASA_MULTI:
        if frasa in sisa:
            istilah.append(KAMUS_MEDIS[frasa])
            sisa = sisa.replace(frasa, ' ')

    # Lalu kata tunggal
    for kata in sisa.split():
        bersih = _bersihkan_kata(kata)
        if not bersih or len(bersih) < 3:
            continue
        if bersih in STOPWORDS_INDO or bersih in GENERIC_TERMS:
            continue
        terjemahan = KAMUS_MEDIS.get(bersih, bersih)
        if terjemahan not in istilah:
            istilah.append(terjemahan)

    return istilah


def generate_query(teks_klaim: str, max_terms: int = 8) -> str:
    """Ubah teks klaim menjadi query pencarian PubMed (istilah medis EN gabungan AND)."""
    istilah = _ekstrak_istilah(teks_klaim)

    # PubMed adalah database berbahasa Inggris: pakai istilah terjemahan saja
    istilah_en = [t for t in istilah if not _terlihat_indonesia(t)]

    if not istilah_en:
        if istilah:
            return ' AND '.join(istilah[:max_terms])
        fallback = re.sub(r'[^a-z\s]', '', teks_klaim.lower()).strip()
        return fallback or 'health'

    return ' AND '.join(istilah_en[:max_terms])


def generate_query_or(teks_klaim: str, max_terms: int = 8) -> str:
    """Varian query dengan operator OR untuk recall lebih luas."""
    istilah = _ekstrak_istilah(teks_klaim)

    if not istilah:
        fallback = re.sub(r'[^a-z\s]', '', teks_klaim.lower()).strip()
        return fallback or 'health'

    return ' OR '.join(istilah[:max_terms])


def _terlihat_indonesia(istilah: str) -> bool:
    """Heuristik kasar: istilah Indonesia umumnya tidak ada di kamus EN dan bukan term medis."""
    # Kata yang bukan hasil terjemahan kamus (berakhiran pola bahasa Indonesia)
    if istilah.endswith('kan') or istilah.endswith('nya') or istilah.endswith('an'):
        return True
    if istilah in {'koroner', 'menyebabkan', 'mengobati', 'mencegah', 'berlebihan'}:
        return True
    return False


def istilah_untuk_ranking(teks_klaim: str, max_terms: int = 8) -> list[str]:
    """Kembalikan daftar istilah medis (terjemahan EN) untuk keperluan ranking relevansi."""
    istilah = _ekstrak_istilah(teks_klaim)
    istilah_en = [t for t in istilah if not _terlihat_indonesia(t)]
    return istilah_en[:max_terms]