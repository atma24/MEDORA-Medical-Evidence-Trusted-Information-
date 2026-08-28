'use client';

import React, { useState } from 'react';

// Ikon Clipboard Jam khusus untuk Card "Antrean Aktif"
const IconTinjauanCardReviewer = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.33333 14C8.41111 14 7.625 13.675 6.975 13.025C6.325 12.375 6 11.5889 6 10.6667C6 9.74444 6.325 8.95833 6.975 8.30833C7.625 7.65833 8.41111 7.33333 9.33333 7.33333C10.2556 7.33333 11.0417 7.65833 11.6917 8.30833C12.3417 8.95833 12.6667 9.74444 12.6667 10.6667C12.6667 11.5889 12.3417 12.375 11.6917 13.025C11.0417 13.675 10.2556 14 9.33333 14ZM10.45 12.25L10.9167 11.7833L9.66667 10.5333V8.66667H9V10.8L10.45 12.25ZM1.33333 13.3333C0.966667 13.3333 0.652778 13.2028 0.391667 12.9417C0.130556 12.6806 0 12.3667 0 12V2.66667C0 2.3 0.130556 1.98611 0.391667 1.725C0.652778 1.46389 0.966667 1.33333 1.33333 1.33333H4.11667C4.23889 0.944444 4.47778 0.625 4.83333 0.375C5.18889 0.125 5.57778 0 6 0C6.44444 0 6.84167 0.125 7.19167 0.375C7.54167 0.625 7.77778 0.944444 7.9 1.33333H10.6667C11.0333 1.33333 11.3472 1.46389 11.6083 1.725C11.8694 1.98611 12 2.3 12 2.66667V6.83333C11.8 6.68889 11.5889 6.56667 11.3667 6.46667C11.1444 6.36667 10.9111 6.27778 10.6667 6.2V2.66667H9.33333V4.66667H2.66667V2.66667H1.33333V12H4.86667C4.94444 12.2444 5.03333 12.4778 5.13333 12.7C5.23333 12.9222 5.35556 13.1333 5.5 13.3333H1.33333ZM6 2.66667C6.18889 2.66667 6.34722 2.60278 6.475 2.475C6.60278 2.34722 6.66667 2.18889 6.66667 2C6.66667 1.81111 6.60278 1.65278 6.475 1.525C6.34722 1.39722 6.18889 1.33333 6 1.33333C5.81111 1.33333 5.65278 1.39722 5.525 1.525C5.39722 1.65278 5.33333 1.81111 5.33333 2C5.33333 2.18889 5.39722 2.34722 5.525 2.475C5.65278 2.60278 5.81111 2.66667 6 2.66667Z" fill="currentColor"/>
  </svg>
);

export default function LaporanAnalitikPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOption, setFilterOption] = useState('Bulan Ini');

  const trendData = [
    { x: 0, y: 120, day: 1, value: 42 },
    { x: 83.3, y: 115, day: 5, value: 58 },
    { x: 166.6, y: 105, day: 10, value: 74 },
    { x: 250, y: 60, day: 15, value: 115 },
    { x: 333.3, y: 45, day: 20, value: 130 },
    { x: 416.6, y: 100, day: 25, value: 85 },
    { x: 500, y: 40, day: 30, value: 142 },
  ];

  const [activePoint, setActivePoint] = useState(trendData[6]);

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">
            Laporan dan Analitik
          </h1>
          <p className="text-gray-500 text-[15px]">
            Ringkasan performa peninjauan dan tren klaim kesehatan.
          </p>
        </div>
        
        {/* Dropdown Filter Kalender */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 border border-gray-300 px-4 py-2.5 rounded-lg text-[13px] text-slate-700 font-bold hover:bg-gray-50 transition shadow-sm bg-white"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{filterOption}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
              {['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'].map((opt) => (
                <button 
                  key={opt}
                  onClick={() => {
                    setFilterOption(opt);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition ${filterOption === opt ? 'bg-[#EEF2FF] text-[#1E3A8A] font-bold' : 'text-slate-600 hover:bg-gray-50 font-medium'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid 4 Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[13px] font-semibold text-gray-500">Total Klaim Masuk</p>
            <div className="text-[#253E6B]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <div className="flex items-end space-x-3">
            <h3 className="text-[32px] font-extrabold text-slate-800 leading-none">1,240</h3>
            <span className="bg-[#EEF2FF] text-[#1E3A8A] text-[11px] font-bold px-2 py-0.5 rounded mb-1">+12%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[13px] font-semibold text-gray-500">Klaim Selesai</p>
            <div className="text-emerald-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="flex items-end space-x-3">
            <h3 className="text-[32px] font-extrabold text-slate-800 leading-none">1,102</h3>
            <span className="bg-[#EEF2FF] text-[#1E3A8A] text-[11px] font-bold px-2 py-0.5 rounded mb-1">+8%</span>
          </div>
        </div>

        {/* Card 3 (Diberi Kotak Bulat Kuning agar Icon Makin Bagus & Jelas) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[13px] font-semibold text-gray-500">Antrean Aktif</p>
            <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center text-amber-600 shadow-2xs">
              <IconTinjauanCardReviewer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end space-x-3">
            <h3 className="text-[32px] font-extrabold text-slate-800 leading-none">138</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[13px] font-semibold text-gray-500">Rata-rata Respon</p>
            <div className="text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="flex items-end space-x-3">
            <h3 className="text-[32px] font-extrabold text-slate-800 leading-none">1.5 <span className="text-[18px] font-bold text-gray-500">Jam</span></h3>
          </div>
        </div>

      </div>

      {/* Grid 2 Kolom Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Kiri: Tren Klaim Harian */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col relative">
          <h3 className="text-[16px] font-bold text-slate-800 mb-6">Tren Klaim Harian</h3>
          
          <div className="relative flex-1 w-full h-[220px]">
            <div 
              className="absolute bg-[#001D5C] text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center space-x-2 transition-all duration-300 ease-out pointer-events-none z-10 shadow-md"
              style={{
                left: `${(activePoint.x / 500) * 100}%`,
                top: `${(activePoint.y / 150) * 100}%`,
                transform: `translate(${activePoint.x > 400 ? '-100%' : activePoint.x < 100 ? '0%' : '-50%'}, -150%)`,
                marginTop: '-8px'
              }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>{activePoint.day === 30 ? 'Hari Ini' : `Hari ${activePoint.day}`}: {activePoint.value}</span>
            </div>
            
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradientLine" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              
              <path d="M 0,120 C 50,110 100,120 150,110 C 200,100 250,60 300,50 C 350,40 400,90 450,110 C 480,120 490,70 500,40 L 500,150 L 0,150 Z" fill="url(#gradientLine)" />
              <path d="M 0,120 C 50,110 100,120 150,110 C 200,100 250,60 300,50 C 350,40 400,90 450,110 C 480,120 490,70 500,40" fill="none" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" />
              
              {trendData.map((pt, i) => (
                <g key={i} onMouseEnter={() => setActivePoint(pt)} className="cursor-pointer">
                  <circle cx={pt.x} cy={pt.y} r="25" fill="transparent" />
                  <circle cx={pt.x} cy={pt.y} r={activePoint.day === pt.day ? 4 : 2} fill={activePoint.day === pt.day ? "#1E3A8A" : "#94A3B8"} className="transition-all duration-300" />
                  {activePoint.day === pt.day && (
                    <circle cx={pt.x} cy={pt.y} r="10" fill="#1E3A8A" fillOpacity="0.2" className="animate-pulse" />
                  )}
                </g>
              ))}
            </svg>
            
            <div className="absolute bottom-0 w-full flex justify-between text-[11px] font-semibold text-gray-400 px-1 select-none">
              <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
            </div>
          </div>
        </div>

        {/* Kanan: Distribusi Status */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-[16px] font-bold text-slate-800 mb-6">Distribusi Status</h3>
          
          <div className="bg-[#F8FAFC] rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#BA1A1A" strokeWidth="14" strokeDasharray="37.7 251.3" strokeDashoffset="-213.6" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#BFDBFE" strokeWidth="14" strokeDasharray="62.8 251.3" strokeDashoffset="-150.8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#00236F" strokeWidth="14" strokeDasharray="150.8 251.3" strokeDashoffset="0" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[22px] font-extrabold text-slate-800 leading-none">100%</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-1">Total</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-[12px] font-semibold">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00236F]"></div>
                  <span className="text-slate-700">Tervalidasi</span>
                </div>
                <span className="text-slate-800 font-extrabold">60%</span>
              </div>
              <div className="flex justify-between items-center text-[12px] font-semibold">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#BFDBFE]"></div>
                  <span className="text-slate-700">Tervalidasi dgn Catatan</span>
                </div>
                <span className="text-slate-800 font-extrabold">25%</span>
              </div>
              <div className="flex justify-between items-center text-[12px] font-semibold">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]"></div>
                  <span className="text-slate-700">Keliru</span>
                </div>
                <span className="text-slate-800 font-extrabold">15%</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tabel Bawah */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[16px] font-bold text-slate-800">Topik Paling Sering Diajukan</h3>
          <button className="flex items-center space-x-2 bg-[#253E6B] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-[#152a5a] transition shadow-sm">
            <span>Export</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white">
                <th className="px-6 py-4">TOPIK KLAIM</th>
                <th className="px-6 py-4">JUMLAH KLAIM</th>
                <th className="px-6 py-4">TREN</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] text-slate-700">
              <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                <td className="px-6 py-5 font-bold text-slate-800">Air Lemon Hangat</td>
                <td className="px-6 py-5 text-gray-500 font-medium">142 klaim</td>
                <td className="px-6 py-5">
                  <span className="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-md">+20%</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                <td className="px-6 py-5 font-bold text-slate-800">Rebusan Daun Salam</td>
                <td className="px-6 py-5 text-gray-500 font-medium">98 klaim</td>
                <td className="px-6 py-5">
                  <span className="bg-[#EEF2FF] text-[#1E3A8A] text-[11px] font-extrabold px-2.5 py-1 rounded-md">-5%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-5 font-bold text-slate-800">Vaksin & Autisme</td>
                <td className="px-6 py-5 text-gray-500 font-medium">76 klaim</td>
                <td className="px-6 py-5">
                  <span className="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-md">+50%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}