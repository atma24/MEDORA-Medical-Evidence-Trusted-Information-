'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

// Data Dummy - Diurutkan dari yang TERBARU ke yang PALING LAMA
const daftarKlaim = [
  {
    id: '#CLM-8906',
    tanggal: '25 Ags 2026',
    topik: 'Konsumsi rutin suplemen glutathione dosis tinggi dapat menyembuhkan vitiligo secara total.',
    status: 'Menunggu Tinjauan',
  },
  {
    id: '#CLM-8905',
    tanggal: '20 Ags 2026',
    topik: 'Vaksin mRNA jenis baru dilaporkan memodifikasi DNA manusia dan memicu penyakit autoimun.',
    status: 'Menunggu Tinjauan',
  },
  {
    id: '#CLM-8904',
    tanggal: '15 Ags 2026',
    topik: 'Diet rendah garam (natrium) sangat efektif menurunkan tekanan darah pada penderita hipertensi.',
    status: 'Tervalidasi',
  },
  {
    id: '#CLM-8903',
    tanggal: '01 Ags 2026',
    topik: 'Penggunaan ponsel dalam gelap menyebabkan kebutaan permanen.',
    status: 'Keliru',
  },
  {
    id: '#CLM-8902',
    tanggal: '30 Jul 2026',
    topik: 'Rutin berolahraga minimal 30 menit sehari dapat menurunkan risiko penyakit jantung.',
    status: 'Tervalidasi',
  },
  {
    id: '#CLM-8901',
    tanggal: '25 Jul 2026',
    topik: 'Meminum rebusan daun sirsak setiap hari dapat menyembuhkan kanker total dan menggantikan kemoterapi.',
    status: 'Keliru', // Pengganti Air Lemon
  },
];

export default function RiwayatKlaimPage() {
  const [filter, setFilter] = useState('Semua Klaim');

  const filteredKlaim = daftarKlaim.filter((item) => {
    if (filter === 'Semua Klaim') return true;
    if (filter === 'Tervalidasi') return item.status === 'Tervalidasi';
    if (filter === 'Menunggu Tinjauan') return item.status === 'Menunggu Tinjauan';
    return true;
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

      {/* Filter Kategori */}
      <div className="flex items-center space-x-3 mb-8">
        {['Semua Klaim', 'Tervalidasi', 'Menunggu Tinjauan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition border ${
              filter === tab
                ? 'bg-[#0A1B3F] text-white border-[#0A1B3F] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daftar Klaim */}
      <div className="space-y-5">
        {filteredKlaim.map((klaim) => (
          <div 
            key={klaim.id}
            className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2 text-xs font-semibold text-gray-400">
                <span>{klaim.id}</span>
                <span>•</span>
                <span>{klaim.tanggal}</span>
              </div>
              
              <h3 className="text-lg font-bold text-[#253E6B] mb-4 leading-snug">
                {klaim.topik}
              </h3>

              <div>
                {klaim.status === 'Tervalidasi' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                    <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
                  </span>
                )}
                {klaim.status === 'Keliru' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                    <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
                  </span>
                )}
                {klaim.status === 'Menunggu Tinjauan' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                    <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex justify-end">
              <Link 
                href={`/user/riwayat-klaim/${klaim.id.toLowerCase().replace('#', '')}`}
                className="px-5 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-sm font-semibold hover:border-[#253E6B] hover:text-[#253E6B] hover:bg-blue-50/30 transition flex items-center space-x-2"
              >
                <span>Lihat Detail</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}