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

    # Kata fungsi tambahan yang sering bocor ke query
    'tepat', 'dicampur', 'campur', 'menumpuk', 'menjadi', 'sehingga',
    'membekukan', 'beku', 'memadatkan', 'padat', 'baru', 'saja', 'barusan',
    'secara', 'langsung', 'sepenuhnya', 'menjalani', 'beredar', 'peredaran',
    'forum', 'pesan', 'berantai', 'mengklaim', 'mengunyah', 'mensterilkan',
    'masuk', 'sebelum', 'kemudian', 'hari', 'perlu', 'tanpa', 'berhenti',
    'setelah', 'melalui', 'lewat', 'antara', 'hingga', 'sampai', 'yakni',
    'yaitu', 'ialah', 'tersebut', 'berikut', 'seputar', 'katanya', 'konon',
    'kabarnya', 'infonya', 'titik', 'saraf', 'sesi', 'kronis', 'akut',
    'alternatif', 'pengobatan', 'terapi', 'obat-obatan', 'pernapasan',
    'pernafasan', 'memperlambat', 'proses', 'tumpukan', 'menyebutkan',
    'menyebut', 'artikel', 'menunjukkan', 'menjelaskan', 'di kemudian',
    'kemudian', 'berhubungan', 'peningkatan', 'perkembangan', 'pemberian',
    'dunia', 'seluruh', 'resistensi', 'bertanggung', 'jawab',
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
    'akupunktur': 'acupuncture',
    'akupuntur': 'acupuncture',
    'inhaler': 'inhaler',
    'kortikosteroid': 'corticosteroid',
    'asma': 'asthma',

    # Istilah yang sering muncul pada hoaks/mitos kesehatan
    'sikat gigi': 'toothbrush',
    'gigi': 'tooth',
    'usus': 'intestine',
    'usus besar': 'large intestine',
    'dinding usus': 'intestinal wall',
    'chip': 'microchip',
    'microchip': 'microchip',
    'cip': 'microchip',
    '5g': '5G',
    'sinyal': 'signal',
    'radiasi': 'radiation',
    'melacak': 'tracking',
    'sabun': 'soap',
    'cuci tangan': 'handwashing',
    'mencuci tangan': 'handwashing',
    'air mengalir': 'running water',
    'diare': 'diarrhea',
    'saluran pernapasan': 'respiratory tract',
    'pernapasan': 'respiratory',
    'autisme': 'autism',
    'autis': 'autism',
    'klorit': 'chlorite',
    'natrium klorit': 'sodium chlorite',
    'asam sitrat': 'citric acid',
    'kopi': 'coffee',
    'umur': 'lifespan',
    'harapan hidup': 'life expectancy',
    'panjang umur': 'longevity',
    'hujan': 'rain',
    'air hujan': 'rainwater',
    'flu': 'influenza',
    'influenza': 'influenza',
    'basa': 'alkaline',
    'asam': 'acid',
    'lemak': 'fat',
    'minyak': 'oil',
    'perut': 'stomach',
    'lambung': 'stomach',
    'membekukan': 'freezing',
    'beku': 'frozen',
    'es': 'ice',
    'air es': 'ice water',
    'air dingin': 'cold water',
    'kanker usus': 'colorectal cancer',
    'racun': 'toxin',
    'detoks': 'detox',
    'detoksifikasi': 'detoxification',
    'tenggorokan': 'throat',
    'paru-paru': 'lung',
    'paruparu': 'lung',
    'menelan': 'swallowing',
    'mengikis': 'scraping',
    'plak': 'plaque',
    'suntikan': 'injection',
    'suntik': 'injection',
    'dikendalikan': 'controlled',
    'pemerintah': 'government',
    'konspirasi': 'conspiracy',
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

    # Kata non-terjemahan yang bocor: drop jika tidak ada di kamus medis
    # (kata Indonesia mentah di query PubMed hampir pasti merusak hasil).
    NON_TERJEMAHAN_DROP = set()
    istilah_final = []
    for t in istilah:
        # Hasil terjemahan kamus selalu dipertahankan
        if t in KAMUS_MEDIS.values():
            istilah_final.append(t)
            continue
        # Heuristik akhiran Indonesia
        if _terlihat_indonesia(t):
            continue
        # Kata mentah Indonesia (bukan hasil terjemahan): hanya lolos jika
        # tampak seperti istilah medis internasional (mengandung karakter
        # khas istilah latin/medis) — selain itu di-drop.
        if re.search(r'(itis|osis|emia|ology|virus|vaccine|cancer|diabetes|asthma|covid|hpv|hiv)', t):
            istilah_final.append(t)
            continue
        # Jika kata asli Indonesia-nya ada di teks dan tidak diterjemahkan,
        # berarti bukan istilah medis -> drop.
        # Pengecualian: kata serapan/istilah asing yang dipakai apa adanya
        # dalam bahasa Indonesia (akupunktur, kortikosteroid, inhaler,
        # kanker, serviks, vaksin, dsb.) tetap valid untuk query PubMed.
        LOANWORD_ALLOW = re.compile(
            r'(punktur|steroid|inhal|kanker|serviks|vaksin|virus|bakteri|'
            r'hormon|kolesterol|diabetes|asma|alergi|kortiko|imunisasi|'
            r'antibiotik|vitamin|mineral|protein|lemak|kanker|tumor|kista)'
        )
        if t.lower() in teks_klaim.lower() and t not in KAMUS_MEDIS.values():
            if LOANWORD_ALLOW.search(t.lower()):
                istilah_final.append(t)
            continue
        istilah_final.append(t)

    if not istilah_final:
        if istilah:
            # Fallback: pakai hasil terjemahan kamus saja, atau kata pertama
            terjemahan = [t for t in istilah if t in KAMUS_MEDIS.values()]
            return ' AND '.join((terjemahan or istilah)[:max_terms])
        fallback = re.sub(r'[^a-z\s]', '', teks_klaim.lower()).strip()
        return fallback or 'health'

    return ' AND '.join(istilah_final[:max_terms])


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
    hasil = []
    for t in istilah:
        if t in KAMUS_MEDIS.values():
            hasil.append(t)
        elif _terlihat_indonesia(t):
            continue
        elif t.lower() in teks_klaim.lower():
            # kata mentah Indonesia yang tidak diterjemahkan -> skip
            continue
        else:
            hasil.append(t)
    return hasil[:max_terms]