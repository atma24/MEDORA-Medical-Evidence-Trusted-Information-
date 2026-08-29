'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  IconPetir, IconDokumenInfo, IconFormulir, 
  IconCeklisBesar, IconInfoBesar, IconSilangBesar, IconUpload 
} from '@/components/Icons';

export default function RuangVerifikasiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  // State untuk Data Klaim dari Backend
  const [claim, setClaim] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State untuk Form Penilaian
  const [keputusan, setKeputusan] = useState<string | null>(null);
  const [penjelasan, setPenjelasan] = useState('');
  
  // State untuk Multi-Referensi
  const [referensiList, setReferensiList] = useState<string[]>([]);
  const [inputRef, setInputRef] = useState('');

  // 1. Fetch Detail Klaim Berdasarkan ID
  useEffect(() => {
    const fetchClaimDetail = async () => {
      try {
        const response = await api.get(`/claims/${id}`); 
        setClaim(response.data);
      } catch (error) {
        console.error("Gagal mengambil detail klaim:", error);
        setErrorMsg("Gagal memuat data klaim atau Anda tidak memiliki akses.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchClaimDetail();
  }, [id]);

  // 2. Fungsi Tambah & Hapus Referensi
  const handleAddRef = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.trim() !== '') {
      setReferensiList([...referensiList, inputRef.trim()]);
      setInputRef('');
    }
  };

  const handleHapusRef = (index: number) => {
    setReferensiList(referensiList.filter((_, i) => i !== index));
  };

  // 3. Fungsi Submit Penilaian ke Backend
  const handleSimpanPublikasi = async () => {
    if (!keputusan) return alert("Pilih Keputusan Akhir terlebih dahulu!");
    if (!penjelasan.trim()) return alert("Penjelasan Medis tidak boleh kosong!");

    setIsSaving(true);
    try {
      // Mapping keputusan frontend ke Enum backend (HOAX / FACT)
      const mappedVerdict = keputusan === 'Keliru' ? 'HOAX' : 'FACT';

      // Gabungkan referensi ke dalam note karena backend belum memiliki field khusus array referensi
      const finalNote = referensiList.length > 0 
        ? `${penjelasan}\n\nReferensi Tambahan:\n${referensiList.map(ref => `- ${ref}`).join('\n')}`
        : penjelasan;

      await api.post(`/claims/${id}/review`, {
        verdict: mappedVerdict,
        note: finalNote,
      });
      
      alert("Tinjauan berhasil dipublikasikan!");
      router.push('/antrean-klaim');
    } catch (error: any) {
      console.error("Gagal menyimpan:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan tinjauan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center text-slate-500 font-medium tracking-wide">Memuat data klaim...</div>;
  }

  if (errorMsg) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl font-bold shadow-sm">
          {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      {/* Tombol Kembali */}
      <Link 
        href="/antrean-klaim" 
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
          Ruang Verifikasi Klaim (#CLM-{claim?.id})
        </h1>
        <div className="text-[13px] text-gray-500 font-medium tracking-wide">
          <span>ID Klaim #CLM-{claim?.id}</span>
          <span className="mx-2.5">•</span>
          <span>Diajukan pada {formatDate(claim?.created_at)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (Info & AI) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Hasil Analisis AI */}
          <div className="bg-[#E6EDF8] rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2.5 mb-5 text-[#00236F]">
              <IconPetir className="w-4 h-5" />
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest">
                HASIL ANALISIS SISTEM AI <br/>(REFERENSI AWAL)
              </h3>
            </div>
            
            <div className="mb-4">
              <p className="text-[12px] text-[#475569] font-semibold mb-2">Tingkat Kemungkinan:</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[11.5px] font-bold border border-gray-200">
                Menunggu Analisis
              </span>
            </div>

            <div>
              <p className="text-[12px] text-[#475569] font-semibold mb-1">Ekstraksi Jurnal:</p>
              <p className="text-[13.5px] text-[#334155] leading-relaxed">
                Sistem AI sedang memproses referensi terkait klaim ini.
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
              <p className="text-[12px] text-gray-500 font-semibold mb-1">Topik/Klaim Utama:</p>
              <p className="text-[15px] font-bold text-slate-800 leading-snug">
                {claim?.text || 'Topik tidak ditemukan'} 
              </p>
            </div>

            <div>
              <p className="text-[12px] text-gray-500 font-semibold mb-2">Deskripsi/Pesan:</p>
              <div className="bg-[#F4F6F9] p-4 rounded-xl">
                <p className="text-[13px] text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                  {claim?.detail || 'Tidak ada deskripsi tambahan.'}
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
                <div onClick={() => setKeputusan('Tervalidasi')} className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${keputusan === 'Tervalidasi' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-[#059669] mb-3"><IconCeklisBesar className="w-7 h-7" /></div>
                  <span className={`text-[13px] font-bold ${keputusan === 'Tervalidasi' ? 'text-emerald-700' : 'text-slate-700'}`}>Tervalidasi (Fakta)</span>
                </div>
                <div onClick={() => setKeputusan('Catatan')} className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${keputusan === 'Catatan' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-[#D97706] mb-3"><IconInfoBesar className="w-7 h-7" /></div>
                  <span className={`text-[13px] font-bold ${keputusan === 'Catatan' ? 'text-amber-700' : 'text-slate-700'}`}>Tervalidasi dengan<br/>Catatan</span>
                </div>
                <div onClick={() => setKeputusan('Keliru')} className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${keputusan === 'Keliru' ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-[#BA1A1A] mb-3"><IconSilangBesar className="w-7 h-7" /></div>
                  <span className={`text-[13px] font-bold ${keputusan === 'Keliru' ? 'text-red-700' : 'text-slate-700'}`}>Keliru (Hoaks)</span>
                </div>
              </div>
            </div>

            {/* Bagian 2: Penjelasan Medis */}
            <div className="mb-8">
              <p className="text-[13.5px] font-bold text-slate-800 mb-3">Penjelasan Medis:</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#253E6B] transition-colors">
                <div className="bg-[#F4F6F9] border-b border-gray-200 px-4 py-3 flex items-center space-x-4 text-slate-600">
                  <button className="font-bold text-[14px] hover:text-[#00236F]">B</button>
                  <button className="italic font-serif text-[14px] hover:text-[#00236F]">I</button>
                  <button className="underline underline-offset-2 text-[14px] hover:text-[#00236F]">U</button>
                </div>
                <textarea 
                  value={penjelasan}
                  onChange={(e) => setPenjelasan(e.target.value)}
                  className="w-full h-44 p-4 text-[14px] text-slate-700 outline-none resize-none placeholder-gray-400"
                  placeholder="Tulis penjelasan ilmiah di sini..."
                ></textarea>
              </div>
            </div>

            {/* Bagian 3: Tautan Referensi Dinamis */}
            <div className="mb-10">
              <p className="text-[13.5px] font-bold text-slate-800 mb-3">Tambahkan Tautan Referensi (Jurnal/Buku):</p>
              
              <form onSubmit={handleAddRef} className="flex space-x-3 mb-4">
                <input 
                  type="text" 
                  value={inputRef}
                  onChange={(e) => setInputRef(e.target.value)}
                  placeholder="https://doi.org/... atau Nama Jurnal"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#253E6B] transition"
                />
                <button type="submit" className="px-5 py-2.5 border-2 border-[#253E6B] text-[#253E6B] font-bold text-[13px] rounded-lg hover:bg-blue-50 transition flex items-center shrink-0">
                  <span className="text-lg mr-1.5 font-normal leading-none">+</span> Tambah
                </button>
              </form>

              {/* List Referensi yang sudah ditambahkan */}
              {referensiList.length > 0 && (
                <ul className="space-y-2">
                  {referensiList.map((ref, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-[#F8FAFC] px-4 py-2.5 rounded-lg border border-gray-100">
                      <span className="text-[13px] text-slate-600 truncate mr-4">{ref}</span>
                      <button type="button" onClick={() => handleHapusRef(idx)} className="text-red-500 hover:text-red-700 font-bold text-sm p-1">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
              <Link 
                href="/antrean-klaim"
                className="px-6 py-3 border border-gray-300 text-slate-700 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center"
              >
                Batal
              </Link>
              <button 
                onClick={handleSimpanPublikasi}
                disabled={isSaving}
                className="px-6 py-3 bg-[#0A1B3F] text-white font-bold text-[13px] rounded-xl hover:bg-[#152a5a] transition shadow-sm flex items-center disabled:opacity-70"
              >
                {isSaving ? 'Menyimpan...' : (
                  <><IconUpload className="w-3.5 h-3.5 mr-2" /> Simpan & Publikasikan</>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}