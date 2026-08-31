'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  IconKlaimBaru, IconTotalKlaim, IconVerifikasi, IconTinjauan,
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus
} from '@/components/Icons';

// Tipe data disesuaikan dengan penambahan kolom 'detail' di backend
interface Claim {
  id: number;
  created_at: string;
  text: string;   // Ini menampung Topik
  detail: string; // Ini menampung Detail
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
    // Ambil data user dari storage untuk sapaan nama
    const userStr = localStorage.getItem('medora_user') || sessionStorage.getItem('medora_user');
    if (userStr) setUserData(JSON.parse(userStr));

    // Fetch data klaim user
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

  // Hitung Statistik Dinamis
  const isTervalidasi = (c: Claim) => (c.status === 'REVIEWED' && c.review_verdict === 'FACT') || c.status === 'ANALYZED';
  const isKeliru = (c: Claim) => c.status === 'REVIEWED' && c.review_verdict === 'HOAX';
  const totalKlaim = claims.length;
  const klaimTerverifikasi = claims.filter(c => isTervalidasi(c)).length;
  const klaimMenunggu = claims.filter(c => ['PENDING', 'REVIEW_NEEDED'].includes(c.status)).length;
  const klaimKeliru = claims.filter(c => isKeliru(c)).length; // Opsional jika ingin ditampilkan

  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper untuk render Status Badge
  const renderStatusBadge = (claim: Claim) => {
    if (claim.status === 'REVIEWED' && claim.review_verdict === 'FACT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
        </span>
      );
    }
    if (claim.status === 'REVIEWED' && claim.review_verdict === 'HOAX') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
          <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
        </span>
      );
    }
    if (claim.status === 'ANALYZED') {
      const assessment = (claim as any).trust_assessment?.assessment ?? (claim as any).trustAssessment?.assessment;
      if (assessment === 'Misinformasi') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
            <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
        <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
      </span>
    );
  };

  // Ambil nama depan saja
  const firstName = userData?.name ? userData.name.split(' ')[0] : 'User';

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-[#253E6B] mb-2">Halo, {firstName} 👋</h2>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed">
            Dapatkan jawaban berbasis jurnal klinis untuk setiap informasi medis yang Anda terima melalui pengajuan klaim.
          </p>
        </div>
        <Link href="/klaim-baru" className="bg-[#0A1B3F] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center text-[15px] hover:bg-[#152a5a] transition shadow-md shadow-blue-900/10">
          <IconKlaimBaru className="w-6 h-6 mr-2.5 text-white" /> Ajukan Klaim
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-gray-500">Total Klaim Diajukan</p>
            <div className="p-2 bg-blue-50 text-[#243C62] rounded-lg"><IconTotalKlaim className="w-4 h-4" /></div>
          </div>
          <h3 className="text-4xl font-bold text-gray-800">{isLoading ? '...' : totalKlaim}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-gray-500">Klaim Terverifikasi</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><IconVerifikasi className="w-4 h-4" /></div>
          </div>
          <h3 className="text-4xl font-bold text-gray-800">{isLoading ? '...' : klaimTerverifikasi}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-gray-500">Menunggu Tinjauan</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><IconTinjauan className="w-4 h-4" /></div>
          </div>
          <h3 className="text-4xl font-bold text-gray-800">{isLoading ? '...' : klaimMenunggu}</h3>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#F1F4F9] px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <h3 className="font-bold text-[#253E6B]">Riwayat Klaim Terbaru</h3>
          <Link href="/riwayat-klaim" className="text-sm text-[#253E6B] font-bold hover:underline">Lihat Semua ›</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-slate-600 tracking-wider bg-[#FAFBFC]">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat data klaim...</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada riwayat klaim.</td>
                </tr>
              ) : (
                // Hanya tampilkan 5 klaim terbaru di dashboard
                claims.slice(0, 5).map((claim) => (
                  <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                    <td className="px-6 py-5 font-bold text-slate-900">#CLM-{claim.id}</td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{formatDate(claim.created_at)}</td>
                    <td className="px-6 py-5 text-slate-800 font-medium truncate max-w-xs">{claim.text}</td>
                    <td className="px-6 py-5 text-center">
                      {renderStatusBadge(claim)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link href={`/riwayat-klaim/${claim.id}`}>
                        <button className="px-4 py-2 border border-[#253E6B] text-[#253E6B] rounded-lg text-xs font-bold hover:bg-[#253E6B] hover:text-white transition shadow-sm">
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