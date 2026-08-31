'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

interface Claim {
  id: number;
  created_at: string;
  text: string;
  detail: string;
  status: string;
  review_verdict: string | null;
  trust_assessment?: { assessment: string; trust_score: number } | null;
  trustAssessment?: { assessment: string; trust_score: number } | null;
}

export default function RiwayatKlaimPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Semua Klaim');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get('/claims');
        setClaims(response.data);
      } catch (error) {
        console.error("Gagal memuat riwayat klaim:", error);
        setErrorMsg("Gagal memuat riwayat klaim. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const getFrontendStatus = (claim: Claim) => {
    if (claim.status === 'REVIEWED' && claim.review_verdict === 'FACT') {
      return 'Tervalidasi';
    }
    if (claim.status === 'REVIEWED' && claim.review_verdict === 'HOAX') {
      return 'Keliru';
    }
    if (claim.status === 'ANALYZED') {
      const assessment = claim.trust_assessment?.assessment ?? claim.trustAssessment?.assessment;
      if (assessment === 'Misinformasi') return 'Keliru';
      return 'Tervalidasi';
    }
    return 'Menunggu Tinjauan';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredKlaim = claims.filter((claim) => {
    if (filter === 'Semua Klaim') return true;
    return getFrontendStatus(claim) === filter;
  });

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setErrorMsg('');
    try {
      await api.delete(`/claims/${id}`);
      setClaims((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal menghapus klaim. Silakan coba lagi.';
      setErrorMsg(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Header Page */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2 tracking-tight">
          Riwayat Klaim Saya
        </h2>
        <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
          Klaim Anda akan diproses awal oleh sistem cerdas kami yang membandingkannya dengan ribuan literatur medis terpercaya, sebelum divalidasi akhir oleh tim pakar.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        {['Semua Klaim', 'Tervalidasi', 'Menunggu Tinjauan'].map((tab) => (
          <button
            key={tab}
            disabled={isLoading}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-xs transition-all ${
              filter === tab
                ? 'bg-white text-[#1E3A8A] border-2 border-[#1E3A8A] font-bold shadow-sm'
                : 'bg-gray-100 text-gray-500 border border-transparent font-medium hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daftar Klaim */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-medium text-sm">Memuat riwayat klaim...</div>
        ) : filteredKlaim.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-gray-400 text-sm font-medium">Tidak ada riwayat klaim untuk kategori ini.</p>
          </div>
        ) : (
          filteredKlaim.map((klaim) => {
            const frontendStatus = getFrontendStatus(klaim);

            return (
              <div 
                key={klaim.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-gray-400">
                    <span>#CLM-{klaim.id}</span>
                    <span>•</span>
                    <span>{formatDate(klaim.created_at)}</span>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-bold text-[#1E293B] mb-3 leading-snug">
                    {klaim.text}
                  </h3>

                  <div>
                    {frontendStatus === 'Tervalidasi' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6F4EA] text-[#137333] rounded-full text-xs font-semibold">
                        <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
                      </span>
                    )}
                    {frontendStatus === 'Keliru' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FCE8E6] text-[#C5221F] rounded-full text-xs font-semibold">
                        <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
                      </span>
                    )}
                    {frontendStatus === 'Menunggu Tinjauan' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF7E0] text-[#B06000] rounded-full text-xs font-semibold">
                        <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 justify-end self-start sm:self-center">
                  <Link 
                    href={`/riwayat-klaim/${klaim.id}`}
                    className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-xl text-xs font-bold hover:bg-blue-50 transition inline-flex items-center gap-1.5"
                  >
                    <span>Lihat Detail</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <button
                    onClick={() => setConfirmDeleteId(klaim.id)}
                    disabled={deletingId === klaim.id}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    title="Hapus klaim"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] text-center mb-2">Hapus Klaim?</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
              Klaim <span className="font-bold text-gray-700">#CLM-{confirmDeleteId}</span> akan dihapus permanen beserta data analisisnya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDeleteId ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}