import React from 'react';
import Link from 'next/link';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

export default function ReviewerDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-2">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center mb-8">
        <h2 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">
          Halo, Dr. Reviewer 🩺
        </h2>
        <p className="text-gray-500 text-[15px] max-w-xl leading-relaxed">
          Tinjau dan verifikasi pengajuan klaim dari pengguna untuk memastikan keakuratan informasi medis.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Menunggu Tinjauan (Menggunakan SVG Asli Figma Reviewer) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Menunggu Tinjauan</p>
            <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center text-amber-600 shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.33333 14C8.41111 14 7.625 13.675 6.975 13.025C6.325 12.375 6 11.5889 6 10.6667C6 9.74444 6.325 8.95833 6.975 8.30833C7.625 7.65833 8.41111 7.33333 9.33333 7.33333C10.2556 7.33333 11.0417 7.65833 11.6917 8.30833C12.3417 8.95833 12.6667 9.74444 12.6667 10.6667C12.6667 11.5889 12.3417 12.375 11.6917 13.025C11.0417 13.675 10.2556 14 9.33333 14ZM10.45 12.25L10.9167 11.7833L9.66667 10.5333V8.66667H9V10.8L10.45 12.25ZM1.33333 13.3333C0.966667 13.3333 0.652778 13.2028 0.391667 12.9417C0.130556 12.6806 0 12.3667 0 12V2.66667C0 2.3 0.130556 1.98611 0.391667 1.725C0.652778 1.46389 0.966667 1.33333 1.33333 1.33333H4.11667C4.23889 0.944444 4.47778 0.625 4.83333 0.375C5.18889 0.125 5.57778 0 6 0C6.44444 0 6.84167 0.125 7.19167 0.375C7.54167 0.625 7.77778 0.944444 7.9 1.33333H10.6667C11.0333 1.33333 11.3472 1.46389 11.6083 1.725C11.8694 1.98611 12 2.3 12 2.66667V6.83333C11.8 6.68889 11.5889 6.56667 11.3667 6.46667C11.1444 6.36667 10.9111 6.27778 10.6667 6.2V2.66667H9.33333V4.66667H2.66667V2.66667H1.33333V12H4.86667C4.94444 12.2444 5.03333 12.4778 5.13333 12.7C5.23333 12.9222 5.35556 13.1333 5.5 13.3333H1.33333ZM6 2.66667C6.18889 2.66667 6.34722 2.60278 6.475 2.475C6.60278 2.34722 6.66667 2.18889 6.66667 2C6.66667 1.81111 6.60278 1.65278 6.475 1.525C6.34722 1.39722 6.18889 1.33333 6 1.33333C5.81111 1.33333 5.65278 1.39722 5.525 1.525C5.39722 1.65278 5.33333 1.81111 5.33333 2C5.33333 2.18889 5.39722 2.34722 5.525 2.475C5.65278 2.60278 5.81111 2.66667 6 2.66667Z" fill="#D97706"/>
              </svg>
            </div>
          </div>
          <h3 className="text-[40px] font-extrabold text-slate-800 leading-none">12</h3>
        </div>
        
        {/* Card 2: Klaim Terverifikasi */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Klaim Terverifikasi</p>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-[40px] font-extrabold text-slate-800 leading-none">8</h3>
        </div>
        
        {/* Card 3: Klaim Tidak Terbukti */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Klaim Tidak Terbukti</p>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-[40px] font-extrabold text-slate-800 leading-none">3</h3>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#F1F4F9] px-6 py-5 flex justify-between items-center border-b border-gray-200">
          <h3 className="font-bold text-[#253E6B] text-[15px]">Antrean Klaim Terbaru</h3>
          <Link href="/reviewer/antrean-klaim" className="text-[13px] text-[#253E6B] font-bold hover:underline">Lihat Semua ›</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-[#FAFBFC]">
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
                <td className="px-6 py-5 text-slate-800 font-medium max-w-xs truncate">Rebusan daun salam sembuhkan diabetes total</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
                    <IconTinjauanStatus className="w-4 h-4" /> Menunggu Tinjauan
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-6 py-2 bg-[#0A1B3F] text-white rounded-lg text-xs font-bold hover:bg-[#152a5a] transition shadow-sm">Tinjau</button>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                <td className="px-6 py-5 font-bold text-slate-900">#CLM-8915</td>
                <td className="px-6 py-5 text-slate-600 font-medium">05 Ags 2026</td>
                <td className="px-6 py-5 text-slate-800 font-medium max-w-xs truncate">Kopi mempercepat penyerapan paracetamol</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
                    <IconTinjauanStatus className="w-4 h-4" /> Menunggu Tinjauan
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-6 py-2 bg-[#0A1B3F] text-white rounded-lg text-xs font-bold hover:bg-[#152a5a] transition shadow-sm">Tinjau</button>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                <td className="px-6 py-5 font-bold text-slate-900">#CLM-8902</td>
                <td className="px-6 py-5 text-slate-600 font-medium">28 Jul 2026</td>
                <td className="px-6 py-5 text-slate-800 font-medium max-w-xs truncate">Madu efektif meredakan batuk pada balita</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">
                    <IconTervalidasiStatus className="w-4 h-4" /> Tervalidasi
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-4 py-2 border border-[#253E6B] text-[#253E6B] rounded-lg text-xs font-bold hover:bg-gray-50 transition shadow-sm">Lihat Detail</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="px-6 py-5 font-bold text-slate-900">#CLM-8889</td>
                <td className="px-6 py-5 text-slate-600 font-medium">15 Jul 2026</td>
                <td className="px-6 py-5 text-slate-800 font-medium max-w-xs truncate">Minum air es saat haid memicu timbulnya kista rahim</td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-700 rounded-full text-[11px] font-bold border border-red-200">
                    <IconKeliruStatus className="w-4 h-4" /> Keliru
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="px-4 py-2 border border-[#253E6B] text-[#253E6B] rounded-lg text-xs font-bold hover:bg-gray-50 transition shadow-sm">Lihat Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}