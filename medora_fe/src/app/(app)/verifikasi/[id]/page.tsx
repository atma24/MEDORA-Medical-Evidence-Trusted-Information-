'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  IconPetir, IconDokumenInfo, IconFormulir, 
  IconCeklisBesar, IconInfoBesar, IconSilangBesar, IconUpload 
} from '@/components/Icons';

// === DATA DUMMY (Supaya dinamis mengikuti ID URL) ===
const dummyData: Record<string, any> = {
  'CLM-8921': { 
    topik: 'Rebusan daun sirsak sembuhkan kanker payudara stadium akhir.', 
    tgl: '20 Ags 2026',
    pesan: '“Dok, benarkah rebusan daun sirsak 3 gelas sehari bisa menyembuhkan kanker payudara stadium akhir dan mengalahkan kemoterapi? Tolong validasi medisnya ya Dok, karena ada keluarga saya yang terpengaruh info ini dan berencana menghentikan jadwal kemoterapinya. Mohon pencerahannya.”'
  },
  'CLM-8920': { 
    topik: 'Vaksin mRNA mengubah DNA manusia secara permanen.', 
    tgl: '26 Agu 2026',
    pesan: '“Apakah benar vaksin jenis baru ini bisa mengubah genetika kita, Dok?”'
  },
  'CLM-8919': { 
    topik: 'Bawang putih menyembuhkan flu.', 
    tgl: '25 Agu 2026',
    pesan: '“Dok, saya dengar bawang putih mentah bisa membunuh virus flu dalam sehari, apa benar?”'
  },
  'CLM-8918': { 
    topik: 'Mandi malam menyebabkan rematik.', 
    tgl: '25 Agu 2026',
    pesan: '“Orang tua saya sering melarang mandi malam karena katanya bikin tulang rematik pas tua nanti. Mohon penjelasannya Dok.”'
  }
};

export default function RuangVerifikasiPage() {
  const params = useParams();
  
  // Ambil ID dari URL (misal dari /verifikasi/clm-8921)
  const rawId = (params?.id as string)?.toUpperCase() || 'CLM-8921';
  const claimId = `#${rawId}`;
  
  // Ambil data sesuai ID, kalau nggak ada di dummy, pakai default CLM-8921
  const data = dummyData[rawId] || dummyData['CLM-8921'];

  // State untuk interaksi kotak Keputusan Akhir
  const [keputusan, setKeputusan] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      {/* Tombol Kembali */}
      <Link 
        href="/reviewer/antrean-klaim" 
        className="inline-flex items-center text-[13.5px] font-semibold text-gray-500 hover:text-[#253E6B] transition mb-5"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Antrean Klaim
      </Link>

      {/* Header Info Dinamis */}
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">
          Ruang Verifikasi Klaim ({claimId})
        </h1>
        <div className="text-[13px] text-gray-500 font-medium tracking-wide">
          <span>ID Klaim {claimId}</span>
          <span className="mx-2.5">•</span>
          <span>Diajukan pada {data.tgl}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (Info & AI) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Hasil Analisis Sistem AI */}
          <div className="bg-[#E6EDF8] rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2.5 mb-5 text-[#00236F]">
              <IconPetir className="w-4 h-5" />
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest">
                HASIL ANALISIS SISTEM AI <br/>(REFERENSI AWAL)
              </h3>
            </div>
            
            <div className="mb-4">
              <p className="text-[12px] text-[#475569] font-semibold mb-2">Tingkat Kemungkinan:</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11.5px] font-bold border border-emerald-200">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Tervalidasi
              </span>
            </div>

            <div>
              <p className="text-[12px] text-[#475569] font-semibold mb-1">Ekstraksi Jurnal:</p>
              <p className="text-[13.5px] text-[#334155] leading-relaxed">
                Aktivitas fisik teratur efektif memperbaiki profil lipid dan menekan risiko kardiovaskular.
              </p>
            </div>
          </div>

          {/* Card 2: Informasi Klaim Dinamis */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2.5 mb-5 text-[#5A5F62]">
              <IconDokumenInfo className="w-4 h-5" />
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#5A5F62]">
                INFORMASI KLAIM DARI <br/>PENGGUNA
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-[12px] text-gray-500 font-semibold mb-1">Topik:</p>
              <p className="text-[15px] font-bold text-slate-800 leading-snug">
                {data.topik}
              </p>
            </div>

            <div>
              <p className="text-[12px] text-gray-500 font-semibold mb-2">Pesan:</p>
              <div className="bg-[#F4F6F9] p-4 rounded-xl">
                <p className="text-[13px] text-slate-600 italic leading-relaxed">
                  {data.pesan}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (Formulir Penilaian) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 h-full">
            
            <div className="flex items-center space-x-2.5 mb-8 pb-4 border-b border-gray-100 text-[#00236F]">
              <IconFormulir className="w-5 h-5" />
              <h3 className="text-[13px] font-extrabold uppercase tracking-widest">
                FORMULIR PENILAIAN MEDIS
              </h3>
            </div>

            {/* Bagian 1: Keputusan Akhir */}
            <div className="mb-8">
              <p className="text-[13.5px] font-bold text-slate-800 mb-4">Keputusan Akhir:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Opsi Tervalidasi */}
                <div 
                  onClick={() => setKeputusan('Tervalidasi')}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                    keputusan === 'Tervalidasi' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-[#059669] mb-3">
                    <IconCeklisBesar className="w-7 h-7" />
                  </div>
                  <span className={`text-[13px] font-bold ${keputusan === 'Tervalidasi' ? 'text-emerald-700' : 'text-slate-700'}`}>Tervalidasi</span>
                </div>

                {/* Opsi Tervalidasi dengan Catatan */}
                <div 
                  onClick={() => setKeputusan('Catatan')}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                    keputusan === 'Catatan' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-[#D97706] mb-3">
                    <IconInfoBesar className="w-7 h-7" />
                  </div>
                  <span className={`text-[13px] font-bold ${keputusan === 'Catatan' ? 'text-amber-700' : 'text-slate-700'}`}>Tervalidasi dengan<br/>Catatan</span>
                </div>

                {/* Opsi Keliru */}
                <div 
                  onClick={() => setKeputusan('Keliru')}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                    keputusan === 'Keliru' ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-[#BA1A1A] mb-3">
                    <IconSilangBesar className="w-7 h-7" />
                  </div>
                  <span className={`text-[13px] font-bold ${keputusan === 'Keliru' ? 'text-red-700' : 'text-slate-700'}`}>Keliru</span>
                </div>

              </div>
            </div>

            {/* Bagian 2: Penjelasan Medis */}
            <div className="mb-8">
              <p className="text-[13.5px] font-bold text-slate-800 mb-3">Penjelasan Medis:</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-[#F4F6F9] border-b border-gray-200 px-4 py-3 flex items-center space-x-4 text-slate-600">
                  <button className="font-bold text-[14px] hover:text-[#00236F]">B</button>
                  <button className="italic font-serif text-[14px] hover:text-[#00236F]">I</button>
                  <button className="underline underline-offset-2 text-[14px] hover:text-[#00236F]">U</button>
                  <span className="text-gray-300">|</span>
                  <button className="hover:text-[#00236F]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </button>
                </div>
                <textarea 
                  className="w-full h-44 p-4 text-[14px] text-slate-700 outline-none resize-none placeholder-gray-400"
                  placeholder="Tulis penjelasan ilmiah di sini..."
                ></textarea>
              </div>
            </div>

            {/* Bagian 3: Tautan Referensi */}
            <div className="mb-10">
              <p className="text-[13.5px] font-bold text-slate-800 mb-3">Tambahkan Tautan Referensi (Jurnal/Buku):</p>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="https://doi.org/..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#253E6B] transition"
                />
                <button className="px-5 py-2.5 border-2 border-[#253E6B] text-[#253E6B] font-bold text-[13px] rounded-lg hover:bg-blue-50 transition flex items-center shrink-0">
                  <span className="text-lg mr-1.5 font-normal leading-none">+</span> Tambah
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
              <Link 
                href="/reviewer/antrean-klaim"
                className="px-6 py-3 border border-gray-300 text-slate-700 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center"
              >
                Batal
              </Link>
              <button className="px-6 py-3 bg-[#0A1B3F] text-white font-bold text-[13px] rounded-xl hover:bg-[#152a5a] transition shadow-sm flex items-center">
                <IconUpload className="w-3.5 h-3.5 mr-2" />
                Simpan & Publikasikan
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}