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
}

export default function RiwayatKlaimPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Semua Klaim');
  const [errorMsg, setErrorMsg] = useState('');

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

                <div className="shrink-0 w-full md:w-auto flex justify-end">
                  <Link 
                    href={`/riwayat-klaim/${klaim.id}`}
                    className="px-5 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-sm font-semibold hover:border-[#253E6B] hover:text-[#253E6B] hover:bg-blue-50/30 transition flex items-center space-x-2"
                  >
                    <span>Lihat Detail</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}