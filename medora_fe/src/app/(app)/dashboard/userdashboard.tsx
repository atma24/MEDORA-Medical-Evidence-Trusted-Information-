'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  IconTotalKlaim, IconVerifikasi, IconTinjauan,
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

export default function UserDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('medora_user') || sessionStorage.getItem('medora_user');
    if (userStr) setUserData(JSON.parse(userStr));

    const fetchClaims = async () => {
      try {
        const response = await api.get('/claims');
        setClaims(response.data);
      } catch (error) {
        console.error("Gagal mengambil data klaim:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const isTervalidasi = (c: Claim) => (c.status === 'REVIEWED' && c.review_verdict === 'FACT') || c.status === 'ANALYZED';
  const totalKlaim = claims.length;
  const klaimTerverifikasi = claims.filter(c => isTervalidasi(c)).length;
  const klaimMenunggu = claims.filter(c => ['PENDING', 'REVIEW_NEEDED'].includes(c.status)).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderStatusBadge = (claim: Claim) => {
    if (claim.status === 'REVIEWED' && claim.review_verdict === 'FACT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6F7F1] text-[#008053] rounded-full text-[11px] font-semibold">
          <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
        </span>
      );
    }
    if (claim.status === 'REVIEWED' && claim.review_verdict === 'HOAX') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDECEA] text-[#D32F2F] rounded-full text-[11px] font-semibold">
          <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
        </span>
      );
    }
    if (claim.status === 'ANALYZED') {
      const assessment = (claim as any).trust_assessment?.assessment ?? (claim as any).trustAssessment?.assessment;
      if (assessment === 'Misinformasi') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDECEA] text-[#D32F2F] rounded-full text-[11px] font-semibold">
            <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6F7F1] text-[#008053] rounded-full text-[11px] font-semibold">
          <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFBEB] text-[#D97706] rounded-full text-[11px] font-semibold">
        <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
      </span>
    );
  };

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'User';

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-2 tracking-tight">Halo, {firstName} 👋</h2>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed">
            Dapatkan jawaban berbasis jurnal klinis untuk setiap informasi medis yang Anda terima melalui pengajuan klaim.
          </p>
        </div>
        <Link href="/klaim-baru" className="bg-[#0B1E46] text-white px-5 py-2.5 rounded-lg font-semibold flex items-center text-sm hover:bg-[#152a5a] transition">
          <span className="text-lg mr-2 font-light leading-none">+</span> Ajukan Klaim
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-gray-500">Total Klaim Diajukan</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <IconTotalKlaim className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : totalKlaim}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-gray-500">Klaim Terverifikasi</p>
            <div className="w-8 h-8 rounded-full bg-[#E6F7F1] text-[#008053] flex items-center justify-center">
              <IconVerifikasi className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : klaimTerverifikasi}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-gray-500">Menunggu Tinjauan</p>
            <div className="w-8 h-8 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <IconTinjauan className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : klaimMenunggu}</h3>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#F8FAFC] px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <h3 className="font-semibold text-slate-800 text-sm">Riwayat Klaim Terbaru</h3>
          <Link href="/riwayat-klaim" className="text-[13px] text-blue-600 font-semibold hover:underline">Lihat Semua ›</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-white">
                <th className="px-6 py-4">ID KLAIM</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4 w-1/3">TOPIK</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat data klaim...</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada riwayat klaim.</td>
                </tr>
              ) : (
                claims.slice(0, 5).map((claim) => (
                  <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                    <td className="px-6 py-5 font-semibold text-slate-800">#CLM-{claim.id}</td>
                    <td className="px-6 py-5 text-gray-500">{formatDate(claim.created_at)}</td>
                    <td className="px-6 py-5 text-slate-800 truncate max-w-xs">{claim.text}</td>
                    <td className="px-6 py-5 text-center">
                      {renderStatusBadge(claim)}
                    </td>
                    <td className="px-6 py-5 text-center flex justify-center">
                      <Link href={`/riwayat-klaim/${claim.id}`}>
                        <button className="px-4 py-1.5 bg-white border border-[#0B1E46] text-[#0B1E46] rounded-md text-xs font-semibold hover:bg-slate-50 transition">
                          Lihat Detail
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