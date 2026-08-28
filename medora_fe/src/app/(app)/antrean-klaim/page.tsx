'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IconTinjauanStatus } from '@/components/Icons';

// --- DATA DUMMY 12 KLAIM ---
const dummyKlaim = [
  { id: '#CLM-8921', tanggal: '26 Agu 2026', topik: 'Rebusan daun salam untuk diabetes' },
  { id: '#CLM-8920', tanggal: '26 Agu 2026', topik: 'Vaksin mRNA mengubah DNA manusia' },
  { id: '#CLM-8919', tanggal: '25 Agu 2026', topik: 'Bawang putih menyembuhkan flu' },
  { id: '#CLM-8918', tanggal: '25 Agu 2026', topik: 'Mandi malam menyebabkan rematik' },
  { id: '#CLM-8917', tanggal: '24 Agu 2026', topik: 'Berkumur air garam cegah COVID-19' },
  { id: '#CLM-8916', tanggal: '23 Agu 2026', topik: 'Kopi memicu penyakit jantung koroner' },
  { id: '#CLM-8915', tanggal: '22 Agu 2026', topik: 'Menelan permen karet bikin usus lengket' },
  { id: '#CLM-8914', tanggal: '21 Agu 2026', topik: 'MSG dalam mie instan merusak otak' },
  { id: '#CLM-8913', tanggal: '20 Agu 2026', topik: 'Makan bayam mentah sebabkan batu ginjal' },
  { id: '#CLM-8912', tanggal: '19 Agu 2026', topik: 'Minum air es bekukan lemak darah' },
  { id: '#CLM-8911', tanggal: '18 Agu 2026', topik: 'Terlalu sering USG memicu kanker' },
  { id: '#CLM-8910', tanggal: '17 Agu 2026', topik: 'Pasta gigi sembuhkan luka bakar ringan' },
];

export default function AntreanKlaimPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Terbaru');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalItems = dummyKlaim.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const sortedData = sortOption === 'Terbaru' ? dummyKlaim : [...dummyKlaim].reverse();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setCurrentPage(1); 
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">
          Antrean Klaim
        </h1>
        <p className="text-gray-500 text-[15px]">
          Daftar pengajuan klaim yang menunggu tinjauan dan verifikasi Anda.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="p-5 border-b border-gray-200 flex justify-between items-center relative">
          <div className="flex items-center space-x-2.5 bg-[#EEF2FF] px-4 py-2.5 rounded-lg">
            <span className="font-extrabold text-[#1E3A8A] text-[14px]">Menunggu Tinjauan</span>
            <span className="bg-[#1E3A8A] text-white text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-bold">
              {totalItems}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 border border-gray-300 px-4 py-2.5 rounded-lg text-[13px] text-slate-700 font-medium hover:bg-gray-50 transition shadow-sm"
            >
              <span>{sortOption}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => handleSortChange('Terbaru')} className={`w-full text-left px-4 py-2.5 text-[13px] transition ${sortOption === 'Terbaru' ? 'bg-[#EEF2FF] text-[#1E3A8A] font-bold' : 'text-slate-600 hover:bg-gray-50 font-medium'}`}>Terbaru</button>
                <button onClick={() => handleSortChange('Terlama')} className={`w-full text-left px-4 py-2.5 text-[13px] transition ${sortOption === 'Terlama' ? 'bg-[#EEF2FF] text-[#1E3A8A] font-bold' : 'text-slate-600 hover:bg-gray-50 font-medium'}`}>Terlama</button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-[#FAFBFC]">
                <th className="px-6 py-4">ID KLAIM</th>
                <th className="px-6 py-4">TANGGAL MASUK</th>
                <th className="px-6 py-4">TOPIK KLAIM</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-slate-700">
              {currentData.map((klaim) => (
                <tr key={klaim.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                  <td className="px-6 py-5 font-bold text-[#253E6B]">{klaim.id}</td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{klaim.tanggal}</td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800 mb-1.5">{klaim.topik}</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] text-[#D97706] rounded-md text-[11px] font-bold">
                      <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {/* BAGIAN INI YANG NGASIH ID KE URL */}
                    <Link 
                      href={`/reviewer/verifikasi/${klaim.id.replace('#', '')}`}
                      className="inline-block px-6 py-2 bg-[#0A1B3F] text-white rounded-lg text-xs font-bold hover:bg-[#152a5a] transition shadow-sm"
                    >
                      Tinjau
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-500 font-medium bg-[#FAFBFC]">
          <div>
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} klaim
          </div>
          <div className="flex space-x-1.5 items-center">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`px-3.5 py-2 border rounded-lg transition ${currentPage === 1 ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-[#0A1B3F] font-bold bg-white hover:bg-gray-50 shadow-sm'}`}>Sebelumnya</button>
            {[1, 2, 3].map((num) => (
              <button key={num} onClick={() => goToPage(num)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition ${currentPage === num ? 'bg-[#0A1B3F] text-white shadow-sm' : 'text-slate-600 hover:bg-gray-200'}`}>{num}</button>
            ))}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3.5 py-2 border rounded-lg transition ${currentPage === totalPages ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-[#0A1B3F] font-bold bg-white hover:bg-gray-50 shadow-sm'}`}>Selanjutnya</button>
          </div>
        </div>

      </div>
    </div>
  );
}