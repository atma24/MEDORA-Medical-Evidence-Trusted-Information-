import React from 'react';
import Link from 'next/link';
import { 
  IconKlaimBaru, IconTotalKlaim, IconVerifikasi, IconTinjauan,
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus
} from '@/components/Icons';

export default function UserDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-[#253E6B] mb-2">Halo, Chesya 👋</h2>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed">
            Dapatkan jawaban berbasis jurnal klinis untuk setiap informasi medis yang Anda terima melalui pengajuan klaim.
          </p>
        </div>
        <Link href="/user/klaim-baru" className="bg-[#0A1B3F] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center text-[15px] hover:bg-[#152a5a] transition shadow-md shadow-blue-900/10">
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
          <h3 className="text-4xl font-bold text-gray-800">12</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-gray-500">Klaim Terverifikasi</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><IconVerifikasi className="w-4 h-4" /></div>
          </div>
          <h3 className="text-4xl font-bold text-gray-800">8</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-gray-500">Menunggu Tinjauan</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><IconTinjauan className="w-4 h-4" /></div>
          </div>
          <h3 className="text-4xl font-bold text-gray-800">3</h3>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#F1F4F9] px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <h3 className="font-bold text-[#253E6B]">Riwayat Klaim Terbaru</h3>
          <Link href="/user/riwayat-klaim" className="text-sm text-[#253E6B] font-bold hover:underline">Lihat Semua ›</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-slate-600 tracking-wider bg-[#FAFBFC]">
                <th className="px-6 py-4">ID KLAIM</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4">TOPIK</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                <td className="px-6 py-5 font-bold text-slate-900">#CLM-8921</td>
                <td className="px-6 py-5 text-slate-600 font-medium">26 Ags 2026</td>
                <td className="px-6 py-5 text-slate-800 font-medium">Khasiat Jahe untuk Asam Lambung</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                    <IconTervalidasiStatus className="w-3.5 h-3.5" /> Tervalidasi
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-4 py-2 border border-[#253E6B] text-[#253E6B] rounded-lg text-xs font-bold hover:bg-[#253E6B] hover:text-white transition shadow-sm">Lihat Detail</button>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                <td className="px-6 py-5 font-bold text-slate-900">#CLM-8915</td>
                <td className="px-6 py-5 text-slate-600 font-medium">05 Ags 2026</td>
                <td className="px-6 py-5 text-slate-800 font-medium">Vaksin Baru Menyebabkan Magnetisme</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                    <IconKeliruStatus className="w-3.5 h-3.5" /> Keliru
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-4 py-2 border border-[#253E6B] text-[#253E6B] rounded-lg text-xs font-bold hover:bg-[#253E6B] hover:text-white transition shadow-sm">Lihat Detail</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="px-6 py-5 font-bold text-slate-900">#CLM-8902</td>
                <td className="px-6 py-5 text-slate-600 font-medium">28 Jul 2026</td>
                <td className="px-6 py-5 text-slate-800 font-medium">Air Lemon Hangat Pagi Hari</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                    <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-4 py-2 border border-[#253E6B] text-[#253E6B] rounded-lg text-xs font-bold hover:bg-[#253E6B] hover:text-white transition shadow-sm">Lihat Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}