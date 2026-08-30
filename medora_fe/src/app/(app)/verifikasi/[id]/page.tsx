'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { 
  IconPetir, IconDokumenInfo, IconFormulir, 
  IconCeklisBesar, IconInfoBesar, IconSilangBesar, IconUpload 
} from '@/components/Icons';

// Types
interface ClaimData {
  id: number;
  user_id: number;
  text: string;
  detail: string;
  is_claim: boolean;
  category?: string | null;
  subject?: string | null;
  relation?: string | null;
  object?: string | null;
  ml_confidence?: number | null;
  status: string;
  reviewed_by?: number | null;
  review_note?: string | null;
  review_verdict?: string | null;
  created_at: string;
  updated_at: string;
  trust_assessment?: {
    evidence_strength: number;
    trust_score: number;
    supporting_count: number;
    contradicting_count: number;
    neutral_count: number;
    insufficient_count: number;
    assessment: string;
  };
  claim_evidences: {
    id: number;
    relationship: string;
    relevance_score: number | null;
    confidence: number | null;
    evidence: {
      id: number;
      pmid?: string;
      doi?: string;
      title: string;
      abstract?: string;
      authors?: string;
      publication_year?: number;
      url?: string;
      evidence_level?: string;
      source: {
        name: string;
        year?: number;
        volume?: string;
        issue?: string;
        pages?: string;
      };
    };
    review_status?: string;
  }[];
}

export default function RuangVerifikasiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  // State untuk Data Klaim dari Backend
  const [claim, setClaim] = useState<ClaimData | null>(null);
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
        
        // Pre-fill form dengan review note jika sudah ada
        if (response.data.review_note) {
          setPenjelasan(response.data.review_note);
        }
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
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError?.response?.data?.message || "Terjadi kesalahan saat menyimpan tinjauan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper: Badge status sesuai enum
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'gray', label: 'Menunggu Analisis', class: 'bg-gray-100 text-gray-600 border-gray-200' };
      case 'ANALYZED':
        return { color: 'blue', label: 'Analisis Selesai', class: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'REVIEW_NEEDED':
        return { color: 'amber', label: 'Menunggu Review Ahli', class: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'REVIEWED':
        const verdict = claim?.review_verdict === 'FACT' ? 'Tervalidasi' : 'Keliru';
        const vClass = claim?.review_verdict === 'FACT' 
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
          : 'bg-red-100 text-red-700 border-red-200';
        return { color: 'emerald/red', label: verdict, class: vClass };
      case 'FAILED':
        return { color: 'red', label: 'Analisis Gagal', class: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { color: 'gray', label: status, class: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  // Helper: Display result based on trust assessment analysis
  const getAnalysisResult = (status: string): string => {
    if (status === 'PENDING') {
      return 'Sistem AI sedang menganalisis klaim ini.';
    }
    
    if (status === 'FAILED') {
      return 'Proses analisis gagal. Silakan coba lagi.';
    }
    
    // Untuk ANALYZED dan REVIEW_NEEDED
    const assessment = claim?.trust_assessment?.assessment;
    if (!assessment) {
      return 'Tidak ada hasil analisis tersedia.';
    }
    
    // Map assessment ke bahasa Indonesia yang lebih friendly
    switch (assessment.toLowerCase()) {
      case 'fact':
      case 'supported':
        return 'Klaim didukung oleh literatur medis yang relevan dan terpercaya.';
      case 'hoax':
      case 'contradicted':
        return 'Klaim bertentangan dengan bukti-bukti medis yang tersedia.';
      case 'neutral':
      case 'mixed':
        return 'Hasil analisis beragam — beberapa mendukung, beberapa tidak.';
      default:
        return assessment;
    }
  };

  // Helper: Average relevance & confidence dari semua evidences (nilai ML = 0-1 untuk relevance, 0-100 untuk confidence)
  const getAvgScores = () => {
    if (!claim?.claim_evidences || claim.claim_evidences.length === 0) {
      return { relevance: 0, confidence: 0 };
    }
    
    const relevances = claim.claim_evidences.map(e => e.relevance_score ?? 0);
    const confidences = claim.claim_evidences.map(e => e.confidence ?? 0);
    
    // Normalize to 0-100 based on detected ranges
    const avgRel = relevances.length > 0 
      ? (relevances.reduce((a, b) => a + b, 0) / relevances.length * 100)
      : 0;
    const avgConf = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
    
    // Round and return as numbers for type safety
    return { 
      relevance: Math.round(avgRel), 
      confidence: Math.round(avgConf >= 1 && avgConf <= 100 ? avgConf : avgConf * 100)
    };
  };

  // Derivations
  const statusBadge = getStatusBadge(claim?.status ?? '');
  const analysisResult = getAnalysisResult(claim?.status ?? 'PENDING');
  const extractedEntities = claim?.category && claim?.subject && claim?.relation && claim?.object;
  const { relevance, confidence } = getAvgScores();
  const ta = claim?.trust_assessment;
  const totalEvidence = claim?.claim_evidences?.length ?? 0;

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

  if (!claim) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl font-bold shadow-sm">
          Klaim tidak ditemukan (#CLM-{id})
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
          
          {/* Card 1: Hasil Analisis AI (DINAMIS) */}
          <div className="bg-[#E6EDF8] rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2.5 mb-5 text-[#00236F]">
              <IconPetir className="w-4 h-5" />
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest">
                HASIL ANALISIS SISTEM AI <br/>(REFERENSI AWAL)
              </h3>
            </div>
            
            {/* Status Klaim */}
            <div className="mb-4">
              <p className="text-[12px] text-[#475569] font-semibold mb-2">Tingkat Kemungkinan:</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold border ${statusBadge.class}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* Hasil Assessment AI */}
            <div className="mb-4">
              <p className="text-[12px] text-[#475569] font-semibold mb-1">Analisis Sistem:</p>
              <p className="text-[13.5px] text-[#334155] leading-relaxed">
                {analysisResult}
              </p>
            </div>

            {/* Confidence Scores */}
            <div className="mb-4">
              <p className="text-[12px] text-[#475569] font-semibold mb-2">Skor Kepercayaan:</p>
              <div className="space-y-2.5">
                {ta && (
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Trust Score</span>
                      <span className="font-bold">{ta.trust_score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${ta.trust_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {totalEvidence > 0 && (
                  <>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Relevansi Rata-Rata</span>
                        <span className="font-bold">{relevance}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
                          style={{ width: `${relevance}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Konfidensi Model</span>
                        <span className="font-bold">{confidence}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500 ease-out"
                          style={{ width: `${confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Evidence Counts dari TrustAssessment */}
            {ta && (ta.supporting_count > 0 || ta.contradicting_count > 0 || ta.neutral_count > 0 || ta.insufficient_count > 0) && (
              <div>
                <p className="text-[12px] text-[#475569] font-semibold mb-2">Rincian Bukti:</p>
                <div className="grid grid-cols-2 gap-2">
                  {ta.supporting_count > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                      <span className="text-[11px] text-emerald-700 font-bold block mb-1">Supporting</span>
                      <span className="text-[15px] font-extrabold text-emerald-800">{ta.supporting_count}</span>
                    </div>
                  )}
                  {ta.contradicting_count > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                      <span className="text-[11px] text-red-700 font-bold block mb-1">Contradicting</span>
                      <span className="text-[15px] font-extrabold text-red-800">{ta.contradicting_count}</span>
                    </div>
                  )}
                  {ta.neutral_count > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <span className="text-[11px] text-amber-700 font-bold block mb-1">Neutral</span>
                      <span className="text-[15px] font-extrabold text-amber-800">{ta.neutral_count}</span>
                    </div>
                  )}
                  {ta.insufficient_count > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                      <span className="text-[11px] text-gray-700 font-bold block mb-1">Insufficient</span>
                      <span className="text-[15px] font-extrabold text-gray-800">{ta.insufficient_count}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jika ekstraksi entities ada */}
            {extractedEntities && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-[12px] text-[#475569] font-semibold mb-2">Entity Ekstraksi:</p>
                <div className="space-y-1 text-xs text-slate-600">
                  {claim.category && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-bold">Category:</span>
                      <span className="font-semibold text-slate-700">{claim.category}</span>
                    </div>
                  )}
                  {claim.subject && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-bold">Subject:</span>
                      <span className="font-semibold text-slate-700">{claim.subject}</span>
                    </div>
                  )}
                  {claim.relation && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-bold">Relation:</span>
                      <span className="font-semibold text-slate-700">{claim.relation}</span>
                    </div>
                  )}
                  {claim.object && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-bold">Object:</span>
                      <span className="font-semibold text-slate-700">{claim.object}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evidence list summary */}
            {totalEvidence > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-[12px] text-[#475569] font-semibold mb-2">Jurnal Terpilih ({totalEvidence}):</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {claim.claim_evidences.slice(0, 3).map((ce: ClaimData['claim_evidences'][number]) => (
                    <div key={ce.id} className="text-[11px] text-slate-600 pl-2 border-l-2 border-blue-300">
                      <div className="font-semibold text-slate-700 line-clamp-2">
                        {ce.evidence.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {ce.evidence.source.name}, {ce.evidence.publication_year} • Relevance: {Math.round((ce.relevance_score ?? 0) * 100)}%, Conf: {Math.round(ce.confidence ?? 0)}%
                      </div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                        {ce.relationship}: {ce.evidence.abstract?.substring(0, 80)}...
                      </div>
                    </div>
                  ))}
                  {totalEvidence > 3 && (
                    <div className="text-[10px] text-blue-600 font-semibold pt-1.5">
                      +{totalEvidence - 3} jurnal lain...
                    </div>
                  )}
                </div>
              </div>
            )}

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
