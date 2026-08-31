'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DetailKlaimPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [claim, setClaim] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetailClaim = async () => {
      try {
        const response = await api.get(`/claims/${id}`);
        setClaim(response.data);
      } catch (error) {
        console.error("Gagal memuat detail klaim:", error);
        setErrorMsg("Gagal memuat detail klaim atau data tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailClaim();
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400 font-medium text-sm">Memuat detail klaim...</div>;
  }

  if (errorMsg || !claim) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
          <p className="font-bold mb-2 text-sm">Terjadi Kesalahan</p>
          <p className="text-xs mb-4">{errorMsg || "Klaim tidak ditemukan."}</p>
          <Link href="/riwayat-klaim" className="text-xs font-bold underline">Kembali ke Riwayat Klaim</Link>
        </div>
      </div>
    );
  }

  // --- LOGIKA MENENTUKAN STATUS DARI BACKEND ---
  const isReviewed = claim.status === 'REVIEWED';
  const isAnalyzed = claim.status === 'ANALYZED';
  const verdict = claim.review_verdict;
  const trustAssessment = claim.trust_assessment ?? claim.trustAssessment;
  const isAutoTervalidasi = isAnalyzed && (trustAssessment?.assessment === 'Terverifikasi' || (trustAssessment?.trust_score ?? 0) > 75);
  const isAutoKeliru = isAnalyzed && trustAssessment?.assessment === 'Misinformasi';

  // Penentuan Banner Alert berdasarkan Data API
  const getAlertConfig = () => {
    const summaryText = trustAssessment?.summary || claim.review_summary || claim.review_note || '';

    if ((isReviewed && verdict === 'FACT') || isAutoTervalidasi) {
      const title = trustAssessment?.assessment === 'Tervalidasi dengan Catatan'
        ? 'TERVALIDASI DENGAN CATATAN'
        : (isAutoTervalidasi ? 'TERVALIDASI OTOMATIS OLEH SISTEM' : 'TERVALIDASI SEPENUHNYA');

      return {
        title,
        desc: summaryText || (isAutoTervalidasi
          ? `Klaim ini tervalidasi otomatis oleh sistem MEDORA dengan trust score ${trustAssessment?.trust_score?.toFixed(0) ?? ''}% berdasarkan bukti jurnal terpercaya.`
          : 'Klaim ini telah ditinjau dan divalidasi oleh pakar medis berdasarkan bukti literatur klinis yang valid.'),
        bg: 'bg-[#E6F4EA]',
        textTitle: 'text-[#137333]',
        textDesc: 'text-[#1E4620]',
        iconBg: 'bg-[#137333]',
        iconType: 'fact'
      };
    } else if ((isReviewed && verdict === 'HOAX') || isAutoKeliru) {
      return {
        title: 'KELIRU (DISINFORMASI MEDIS)',
        desc: summaryText || 'Klaim ini dinilai keliru atau tidak terbukti secara medis berdasarkan peninjauan literatur klinis dan analisis pakar.',
        bg: 'bg-[#FCE8E6]',
        textTitle: 'text-[#C5221F]',
        textDesc: 'text-[#5C1D1B]',
        iconBg: 'bg-[#C5221F]',
        iconType: 'hoax'
      };
    } else {
      return {
        title: 'MENUNGGU TINJAUAN PAKAR',
        desc: summaryText || 'Klaim Anda sedang dalam proses analisis dan menunggu verifikasi manual dari tim dokter spesialis.',
        bg: 'bg-[#FEF7E0]',
        textTitle: 'text-[#B06000]',
        textDesc: 'text-[#5F3B00]',
        iconBg: 'bg-[#B06000]',
        iconType: 'pending'
      };
    }
  };

  const alertCfg = getAlertConfig();

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/claims/${id}`);
      router.push('/riwayat-klaim');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal menghapus klaim.';
      setErrorMsg(msg);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Tombol Kembali */}
      <Link 
        href="/riwayat-klaim" 
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#1E3A8A] transition mb-5"
      >
        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Riwayat Klaim
      </Link>

      {/* Header Info & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-1.5 tracking-tight">Detail Hasil Klaim</h1>
          <div className="flex items-center text-xs text-gray-400 font-medium space-x-2">
            <span>ID Klaim #CLM-{claim.id}</span>
            <span>•</span>
            <span>Diajukan pada {formatDate(claim.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Simpan Artikel
          </button>

          <button className="px-3.5 py-2 bg-white border border-gray-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Unduh PDF
          </button>

          <button className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Bagikan
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
            title="Hapus Klaim"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-5">
          {/* Kutipan Klaim */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              KUTIPAN KLAIM
            </p>
            <h2 className="text-lg md:text-xl font-bold text-[#1E293B] italic mb-3 leading-snug">
              "{claim.text}"
            </h2>
            {claim.detail && (
              <p className="text-xs text-gray-400">
                Sumber: {claim.detail}
              </p>
            )}
          </div>

          {/* Banner Status Hasil (Dynamic) */}
          <div className={`${alertCfg.bg} rounded-2xl p-6 flex items-start gap-4 shadow-sm`}>
            <div className={`w-7 h-7 ${alertCfg.iconBg} rounded-full flex items-center justify-center text-white shrink-0 mt-0.5`}>
              {alertCfg.iconType === 'hoax' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : alertCfg.iconType === 'pending' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
            <div>
              <h3 className={`text-sm font-extrabold ${alertCfg.textTitle} mb-1.5 uppercase tracking-wide`}>
                {alertCfg.title}
              </h3>
              <p className={`text-xs md:text-sm ${alertCfg.textDesc} leading-relaxed font-medium`}>
                {alertCfg.desc}
              </p>
            </div>
          </div>

          {/* Penjelasan Lengkap Pakar Medis (Dynamic jika ada) */}
          {claim.review_note && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="text-base font-bold text-[#1E293B]">Penjelasan Lengkap Pakar Medis</h3>
              </div>
              <div className="text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {claim.review_note}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan */}
        <div className="lg:col-span-1 space-y-5">
          {/* Info Reviewer (Dynamic) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              DIVERIFIKASI OLEH
            </p>
            {isAutoTervalidasi || isAutoKeliru ? (
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 shrink-0 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B] mb-0.5">Sistem MEDORA</h4>
                    <p className="text-xs text-gray-400">Trust Score: {trustAssessment?.trust_score?.toFixed(0) ?? '-'}%</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#E6F4EA] text-[#137333] rounded-full text-[10px] font-bold">
                  ✓ Validasi Otomatis
                </span>
              </div>
            ) : claim.reviewer ? (
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center font-bold text-[#1E3A8A]">
                    {claim.reviewer.avatar ? (
                      <img src={claim.reviewer.avatar} alt={claim.reviewer.name} className="w-full h-full object-cover" />
                    ) : (
                      claim.reviewer.name?.charAt(0) || 'D'
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B] mb-0.5 leading-snug">
                      {claim.reviewer.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {claim.reviewer.speciality?.name || claim.reviewer.speciality || 'Tim Pakar Medis'}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#E6F4EA] text-[#137333] rounded-full text-[10px] font-bold">
                      ✓ Verified Reviewer
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 text-xs text-gray-400">
                  Tgl Verifikasi: {formatDate(claim.updated_at || claim.created_at)}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Menunggu penugasan pakar medis.</p>
            )}
          </div>

          {/* Referensi & Jurnal Terkait (Dynamic) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                REFERENSI & JURNAL TERKAIT
              </p>
            </div>

            <div className="space-y-4">
              {!claim.claim_evidences || claim.claim_evidences.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada referensi jurnal terkait.</p>
              ) : (
                claim.claim_evidences.map((ce: any, idx: number) => (
                  <div key={idx} className={`flex items-start gap-3 ${idx !== 0 ? 'pt-3 border-t border-gray-100' : ''}`}>
                    <svg className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <h5 className="text-xs font-bold text-[#1E293B] mb-1 leading-snug">
                        {ce.evidence?.title || 'Jurnal Medis Terkait'}
                      </h5>
                      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                        {ce.evidence?.abstract || ce.relationship || ''}
                      </p>
                      {ce.evidence?.url && (
                        <a href={ce.evidence.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline mt-1 inline-block">
                          Lihat Sumber ›
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] text-center mb-2">Hapus Klaim?</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
              Klaim <span className="font-bold text-gray-700">#CLM-{claim.id}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}