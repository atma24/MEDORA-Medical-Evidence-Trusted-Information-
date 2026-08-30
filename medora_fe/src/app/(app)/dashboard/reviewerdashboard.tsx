'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

// Interface disesuaikan dengan penambahan kolom 'detail' di backend
interface Claim {
  id: number;
  created_at: string;
  text: string;   // Ini menyimpan Topik
  detail: string; // Ini menyimpan Detail
  status: string;
}

export default function ReviewerDashboard() {
  const [claimsQueue, setClaimsQueue] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('medora_user') || sessionStorage.getItem('medora_user');
    if (userStr) setUserData(JSON.parse(userStr));

    const fetchQueue = async () => {
      try {
        const response = await api.get('/review/claims');
        setClaimsQueue(response.data);
      } catch (error) {
        console.error("Gagal mengambil antrean klaim:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueue();
  }, []);

  const totalMenunggu = claimsQueue.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const reviewerName = userData?.name ? `Dr. ${userData.name.split(' ')[0]}` : 'Reviewer';

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center mb-8">
        <h2 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">
          Halo, {reviewerName} 🩺
        </h2>
        <p className="text-gray-500 text-[15px] max-w-xl leading-relaxed">
          Tinjau dan verifikasi pengajuan klaim dari pengguna untuk memastikan keakuratan informasi medis.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Menunggu Tinjauan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Menunggu Tinjauan</p>
            <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center text-amber-600 shadow-2xs">
               <IconTinjauanStatus className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[40px] font-extrabold text-slate-800 leading-none">{isLoading ? '...' : totalMenunggu}</h3>
        </div>
        
        {/* Card 2: Klaim Terverifikasi (Placeholder - Butuh API Riwayat dari Backend) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between opacity-70">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Riwayat Selesai</p>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-2xs">
              <IconTervalidasiStatus className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-[40px] font-extrabold text-slate-800 leading-none">-</h3>
        </div>
        
        {/* Card 3: Klaim Tidak Terbukti (Placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between opacity-70">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kontribusi</p>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#243C62] shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <h3 className="text-[40px] font-extrabold text-slate-800 leading-none">-</h3>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#F1F4F9] px-6 py-5 flex justify-between items-center border-b border-gray-200">
          <h3 className="font-bold text-[#253E6B] text-[15px]">Antrean Klaim Terbaru</h3>
          <Link href="/antrean-klaim" className="text-[13px] text-[#253E6B] font-bold hover:underline">Lihat Semua ›</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-[#FAFBFC]">
                <th className="px-6 py-4">ID KLAIM</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4 w-1/3">TOPIK / KLAIM</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat antrean...</td>
                </tr>
              ) : claimsQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada antrean klaim untuk ditinjau.</td>
                </tr>
              ) : (
                claimsQueue.slice(0, 5).map((claim) => (
                  <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                    <td className="px-6 py-5 font-bold text-slate-900">#CLM-{claim.id}</td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{formatDate(claim.created_at)}</td>
                    <td className="px-6 py-5 text-slate-800 font-medium truncate max-w-xs">{claim.text}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
                        <IconTinjauanStatus className="w-4 h-4" /> Menunggu Tinjauan
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link href={`/verifikasi/${claim.id}`}>
                        <button className="px-6 py-2 bg-[#0A1B3F] text-white rounded-lg text-xs font-bold hover:bg-[#152a5a] transition shadow-sm">
                          Tinjau
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}