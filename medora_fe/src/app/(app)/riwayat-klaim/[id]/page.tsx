import React from 'react';
import Link from 'next/link';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

// --- DATA DUMMY LENGKAP UNTUK 6 KLAIM ---
const dummyKlaimData: Record<string, any> = {
  'CLM-8901': {
    topik: 'Meminum rebusan daun sirsak setiap hari dapat menyembuhkan kanker total dan menggantikan kemoterapi.',
    kutipan: '"Stop kemo! Daun sirsak terbukti ampuh bunuh sel kanker 10.000 kali lebih kuat dari kemoterapi."',
    sumber: 'Grup Facebook & Pesan Berantai WhatsApp',
    tanggal: '25 Jul 2026',
    statusBadge: 'Keliru', 
    alert: {
      title: 'KELIRU (DISINFORMASI BERBAHAYA)',
      desc: <>Klaim ini <strong>keliru dan berisiko tinggi</strong>. Meski uji laboratorium awal menunjukkan potensi, <strong>belum ada uji klinis pada manusia</strong> yang membuktikan daun sirsak dapat menyembuhkan kanker atau menggantikan kemoterapi medis.</>,
      bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-500', textTitle: 'text-red-800', textDesc: 'text-red-700'
    },
    penjelasan: [
      'Secara medis, mempromosikan daun sirsak sebagai pengganti kemoterapi adalah informasi yang sangat berbahaya. Meskipun ekstrak daun sirsak (Graviola) mengandung senyawa annonaceous acetogenins yang menunjukkan sifat antikanker di laboratorium (in vitro), efek ini belum terbukti efektif dan aman pada tubuh manusia (in vivo) melalui uji klinis standar.',
      'Menghentikan perawatan medis standar seperti kemoterapi dan pembedahan lalu hanya mengandalkan rebusan daun sirsak dapat memperburuk kondisi pasien, memungkinkan kanker menyebar tanpa kendali.',
      'Selain itu, konsumsi daun sirsak dalam dosis tinggi atau jangka panjang secara terus-menerus telah dikaitkan dengan toksisitas saraf (neurotoksisitas) yang berisiko memicu gangguan saraf menyerupai penyakit Parkinson.'
    ],
    reviewer: {
      nama: 'Dr. dr. Handoko Gunawan, Sp.PD-KHOM',
      spesialis: 'Spesialis Penyakit Dalam (Konsultan Hematologi Onkologi)',
      tgl: '28 Jul 2026',
      avatar: 'https://ui-avatars.com/api/?name=Handoko+Gunawan&background=f1f5f9&color=0f172a&rounded=true&bold=true'
    },
    jurnal: [
      {
        judul: 'Journal of Traditional and Complementary Medicine',
        desc: 'Graviola: A systematic review on its anticancer properties and neurotoxicity.'
      },
      {
        judul: 'The Oncologist Journal',
        desc: 'The Danger of Alternative Cancer Treatments and Delayed Standard Care in Oncology Patients.'
      }
    ]
  },
  'CLM-8902': {
    topik: 'Rutin berolahraga minimal 30 menit sehari dapat menurunkan risiko penyakit jantung.',
    kutipan: '"Olahraga 30 menit sehari turunkan risiko sakit jantung"',
    sumber: 'Artikel Kesehatan Online',
    tanggal: '30 Jul 2026',
    statusBadge: 'Tervalidasi',
    alert: {
      title: 'TERVALIDASI SEPENUHNYA',
      desc: <>Aktivitas fisik moderat selama 30 menit setiap hari terbukti secara klinis <strong>memperkuat otot jantung, menurunkan tekanan darah, dan melancarkan sirkulasi darah.</strong></>,
      bg: 'bg-[#ecfdf5]', border: 'border-[#a7f3d0]', iconBg: 'bg-emerald-500', textTitle: 'text-emerald-800', textDesc: 'text-emerald-700'
    },
    penjelasan: [
      'Klaim ini terbukti benar dan didukung oleh berbagai pedoman kesehatan global. Berolahraga secara rutin adalah salah satu cara paling efektif untuk mencegah penyakit kardiovaskular.',
      'American Heart Association (AHA) secara konsisten merekomendasikan setidaknya 150 menit aktivitas aerobik intensitas sedang per minggu.'
    ],
    reviewer: {
      nama: 'Dr. dr. Budi Santoso, Sp.JP',
      spesialis: 'Spesialis Jantung & Pembuluh Darah',
      tgl: '31 Jul 2026',
      avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=f1f5f9&color=0f172a&rounded=true&bold=true'
    },
    jurnal: [
      { judul: 'American Heart Association Guidelines', desc: 'Physical activity recommendations for cardiovascular health and disease prevention.' }
    ]
  },
  'CLM-8903': {
    topik: 'Penggunaan ponsel dalam gelap menyebabkan kebutaan permanen.',
    kutipan: '"Main HP di tempat gelap bisa bikin buta permanen"',
    sumber: 'Grup Facebook Keluarga',
    tanggal: '01 Ags 2026',
    statusBadge: 'Keliru',
    alert: {
      title: 'KELIRU (DISINFORMASI)',
      desc: <>Klaim ini <strong>tidak terbukti secara klinis</strong>. Menatap layar ponsel dalam gelap memang memicu kelelahan mata, tetapi <strong>tidak</strong> menyebabkan kebutaan permanen.</>,
      bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-500', textTitle: 'text-red-800', textDesc: 'text-red-700'
    },
    penjelasan: [
      'Miskonsepsi ini sering muncul akibat fenomena "Transient Smartphone Blindness", yaitu hilangnya penglihatan sementara karena mata beradaptasi dengan cahaya layar dan bantal yang gelap. Ini tidak berbahaya.',
      'Tidak ada literatur medis oftalmologi yang membuktikan bahwa paparan cahaya layar dalam kondisi gelap bisa merusak retina secara permanen.'
    ],
    reviewer: {
      nama: 'Dr. dr. Hendra Setiawan, Sp.M',
      spesialis: 'Spesialis Mata (Oftalmologi)',
      tgl: '02 Ags 2026',
      avatar: 'https://ui-avatars.com/api/?name=Hendra+Setiawan&background=f1f5f9&color=0f172a&rounded=true&bold=true'
    },
    jurnal: [
      { judul: 'New England Journal of Medicine (NEJM)', desc: 'Transient Smartphone "Blindness" - Case studies on temporary vision loss.' }
    ]
  },
  'CLM-8904': {
    topik: 'Diet rendah garam (natrium) sangat efektif menurunkan tekanan darah pada penderita hipertensi.',
    kutipan: '"Kurangi makan garam biar darah tinggi cepat turun"',
    sumber: 'Forum Komunitas Jantung',
    tanggal: '15 Ags 2026',
    statusBadge: 'Tervalidasi',
    alert: {
      title: 'TERVALIDASI SEPENUHNYA',
      desc: <>Pembatasan asupan natrium (garam) terbukti secara medis <strong>menurunkan tekanan darah secara signifikan</strong> pada pasien hipertensi karena mengurangi retensi cairan dalam tubuh.</>,
      bg: 'bg-[#ecfdf5]', border: 'border-[#a7f3d0]', iconBg: 'bg-emerald-500', textTitle: 'text-emerald-800', textDesc: 'text-emerald-700'
    },
    penjelasan: [
      'Garam mengandung natrium, yang sifatnya mengikat air. Jika konsumsi natrium berlebihan, tubuh akan menahan lebih banyak air. Volume darah yang meningkat ini akan memberikan tekanan ekstra pada dinding pembuluh darah, menyebabkan tekanan darah tinggi.',
      'Berbagai studi klinis dan pedoman WHO merekomendasikan asupan garam harian kurang dari 5 gram untuk orang dewasa.'
    ],
    reviewer: {
      nama: 'Dr. dr. Hasan Basri, Sp.PD-KGH',
      spesialis: 'Konsultan Ginjal Hipertensi',
      tgl: '16 Ags 2026',
      avatar: 'https://ui-avatars.com/api/?name=Hasan+Basri&background=f1f5f9&color=0f172a&rounded=true&bold=true'
    },
    jurnal: [
      { judul: 'WHO Guidelines', desc: 'Guideline: Sodium intake for adults and children.' }
    ]
  },
  'CLM-8905': {
    topik: 'Vaksin mRNA jenis baru dilaporkan memodifikasi DNA manusia dan memicu penyakit autoimun.',
    kutipan: '"Vaksin mRNA genetik bisa mengubah DNA asli manusia"',
    sumber: 'Forward Telegram',
    tanggal: '20 Ags 2026',
    statusBadge: 'Menunggu Tinjauan',
    alert: {
      title: 'MENUNGGU TINJAUAN PAKAR',
      desc: <>Sistem deteksi awal kami menunjukkan vaksin mRNA tidak dapat menembus inti sel tempat DNA berada. Namun, karena ini klaim kompleks terkait genetika, <strong>klaim ini harus ditinjau manual oleh pakar imunologi.</strong></>,
      bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500', textTitle: 'text-amber-800', textDesc: 'text-amber-700'
    },
    penjelasan: [],
    reviewer: {
      nama: 'Menunggu Penugasan',
      spesialis: 'Tim Dokter Spesialis Imunologi',
      tgl: 'Dalam Antrean',
      avatar: 'https://ui-avatars.com/api/?name=MEDORA&background=f8fafc&color=64748b&rounded=true&bold=true'
    },
    jurnal: [
      { judul: 'Database Jurnal Medis (Proses AI)', desc: 'Sistem RAG sedang mengekstrak literatur terkait uji klinis mRNA...' }
    ]
  },
  'CLM-8906': {
    topik: 'Konsumsi rutin suplemen glutathione dosis tinggi dapat menyembuhkan vitiligo secara total.',
    kutipan: '"Pil glutathione dosis tinggi bisa hilangkan bercak vitiligo permanen"',
    sumber: 'Iklan Suplemen TikTok',
    tanggal: '25 Ags 2026',
    statusBadge: 'Menunggu Tinjauan',
    alert: {
      title: 'MENUNGGU TINJAUAN PAKAR',
      desc: <>Klaim ini menyangkut klaim terapi pengobatan berisiko. Sistem telah meneruskan klaim ini untuk <strong>dievaluasi efikasinya oleh dokter spesialis kulit (Dermatovenerologi).</strong></>,
      bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500', textTitle: 'text-amber-800', textDesc: 'text-amber-700'
    },
    penjelasan: [],
    reviewer: {
      nama: 'Menunggu Penugasan',
      spesialis: 'Tim Dokter Spesialis Kulit & Kelamin',
      tgl: 'Dalam Antrean',
      avatar: 'https://ui-avatars.com/api/?name=MEDORA&background=f8fafc&color=64748b&rounded=true&bold=true'
    },
    jurnal: [
      { judul: 'Database Jurnal Dermatologi (Proses AI)', desc: 'Meninjau efikasi antioksidan oral terhadap repigmentasi vitiligo...' }
    ]
  }
};


export default async function DetailKlaimPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id.toUpperCase();
  const claimId = `#${rawId}`;
  
  const data = dummyKlaimData[rawId] || dummyKlaimData['CLM-8901'];

  const renderBadge = () => {
    if (data.statusBadge.includes('Tervalidasi')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200 shadow-sm">
          <IconTervalidasiStatus className="w-4 h-4" /> {data.statusBadge}
        </span>
      );
    } else if (data.statusBadge === 'Keliru') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold border border-red-200 shadow-sm">
          <IconKeliruStatus className="w-4 h-4" /> Keliru
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-200 shadow-sm">
          <IconTinjauanStatus className="w-4 h-4" /> Menunggu Tinjauan
        </span>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      <Link 
        href="/user/riwayat-klaim" 
        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#253E6B] transition mb-6"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Riwayat Klaim
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">Detail Hasil Klaim</h1>
          <div className="flex items-center text-[13.5px] text-gray-500 font-medium tracking-wide">
            <span>ID Klaim {claimId}</span>
            <span className="mx-2.5">•</span>
            <span>Diajukan pada {data.tanggal}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-[#253E6B] rounded-lg text-[13px] font-bold hover:bg-gray-50 transition flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            Simpan Artikel
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-[#253E6B] rounded-lg text-[13px] font-bold hover:bg-gray-50 transition flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Unduh PDF
          </button>
          <button className="px-5 py-2 bg-[#0A1B3F] border border-[#0A1B3F] text-white rounded-lg text-[13px] font-bold hover:bg-[#152a5a] transition flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Bagikan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KONTEN KIRI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">KUTIPAN KLAIM</p>
              {renderBadge()}
            </div>
            <h2 className="text-[20px] font-bold text-slate-800 italic mb-4 leading-relaxed">
              {data.kutipan}
            </h2>
            <p className="text-[13px] text-gray-500 font-medium">Sumber: {data.sumber}</p>
          </div>

          <div className={`${data.alert.bg} rounded-xl border ${data.alert.border} p-6 flex items-start space-x-4 shadow-sm`}>
            <div className="mt-1 shrink-0">
              <div className={`w-6 h-6 ${data.alert.iconBg} rounded-full flex items-center justify-center text-white shadow-sm`}>
                {data.statusBadge === 'Menunggu Tinjauan' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : data.statusBadge === 'Keliru' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
            </div>
            <div>
              <h3 className={`text-[15px] font-extrabold ${data.alert.textTitle} mb-2 uppercase tracking-wide`}>{data.alert.title}</h3>
              <p className={`text-[14px] ${data.alert.textDesc} leading-relaxed font-medium`}>
                {data.alert.desc}
              </p>
            </div>
          </div>

          {data.statusBadge !== 'Menunggu Tinjauan' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 pb-5 border-b border-gray-100">
                <svg className="w-5 h-5 text-[#253E6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <h3 className="text-[18px] font-bold text-[#253E6B]">Penjelasan Lengkap Pakar Medis</h3>
              </div>
              
              <div className="space-y-5 text-[14.5px] text-slate-600 leading-loose">
                {data.penjelasan.map((paragraf: string, i: number) => (
                  <p key={i}>{paragraf}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KONTEN KANAN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">DIVALIDASI OLEH</p>
            <div className="flex items-start space-x-4 mb-5">
              <div className="w-[50px] h-[50px] rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                <img src={data.reviewer.avatar} alt="Doctor Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#0A1B3F] mb-1">{data.reviewer.nama}</h4>
                <p className="text-[12px] text-gray-500 mb-2">{data.reviewer.spesialis}</p>
                {data.statusBadge !== 'Menunggu Tinjauan' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10.5px] font-bold border border-emerald-100">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Verified Reviewer
                  </span>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[12px] text-gray-500 font-medium">Tgl Verifikasi: <span className="text-slate-800 font-bold ml-1">{data.reviewer.tgl}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">REFERENSI & JURNAL TERKAIT</p>
            <div className="space-y-4">
              {data.jurnal.map((jrn: any, idx: number) => (
                <div key={idx} className={`flex items-start space-x-3 ${idx !== 0 ? 'pt-4 border-t border-gray-100' : ''}`}>
                  <svg className="w-5 h-5 text-[#253E6B] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <div>
                    <h5 className="text-[12.5px] font-bold text-[#0A1B3F] mb-1.5 leading-snug">{jrn.judul}</h5>
                    <p className="text-[11.5px] text-gray-500 leading-relaxed">{jrn.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}