'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

// Interface disesuaikan dengan response Backend
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

  // Mengambil seluruh data klaim milik user dari backend
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

  // Helper untuk menentukan status UI berdasarkan kombinasi status backend
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

  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Logika Filter Data
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
      
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold text-[#253E6B] mb-3 tracking-tight">
          Riwayat Klaim Saya
        </h2>
        <p className="text-gray-600 text-[15px] max-w-3xl leading-relaxed">
          Klaim Anda akan diproses awal oleh sistem cerdas kami yang membandingkannya dengan ribuan literatur medis terpercaya, sebelum divalidasi akhir oleh tim pakar.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Filter Kategori */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {['Semua Klaim', 'Tervalidasi', 'Keliru', 'Menunggu Tinjauan'].map((tab) => (
          <button
            key={tab}
            disabled={isLoading}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition border ${
              filter === tab
                ? 'bg-[#0A1B3F] text-white border-[#0A1B3F] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daftar Klaim */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Memuat riwayat klaim...</div>
        ) : filteredKlaim.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
            <p className="text-gray-500 font-medium">Tidak ada riwayat klaim untuk kategori ini.</p>
          </div>
        ) : (
          filteredKlaim.map((klaim) => {
            const frontendStatus = getFrontendStatus(klaim);

            return (
              <div 
                key={klaim.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2 text-xs font-semibold text-gray-400">
                    <span>#CLM-{klaim.id}</span>
                    <span>•</span>
                    <span>{formatDate(klaim.created_at)}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#253E6B] mb-4 leading-snug">
                    {klaim.text}
                  </h3>

                  <div>
                    {frontendStatus === 'Tervalidasi' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                        <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
                      </span>
                    )}
                    {frontendStatus === 'Keliru' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                        <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
                      </span>
                    )}
                    {frontendStatus === 'Menunggu Tinjauan' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                        <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto flex justify-end items-center gap-2">
                  <Link 
                    href={`/riwayat-klaim/${klaim.id}`}
                    className="px-5 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-sm font-semibold hover:border-[#253E6B] hover:text-[#253E6B] hover:bg-blue-50/30 transition flex items-center space-x-2"
                  >
                    <span>Lihat Detail</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(klaim.id)}
                    disabled={deletingId === klaim.id}
                    className="p-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-7">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#0A1B3F] text-center mb-2">Hapus Klaim?</h3>
            <p className="text-[14px] text-gray-500 text-center leading-relaxed mb-6">
              Klaim <span className="font-bold text-gray-700">#CLM-{confirmDeleteId}</span> akan dihapus permanen beserta data analisisnya. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId !== null}
                className="flex-1 px-5 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId !== null}
                className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDeleteId ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}