'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { IconTinjauanStatus } from '@/components/Icons';

// Definisi tipe data berdasarkan struktur Claim dari backend
interface Claim {
  id: number;
  created_at: string;
  text: string;
  status: string;
}

export default function AntreanKlaimPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Terbaru');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 1. Mengambil data antrean dari backend (ReviewController@claims)
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get('/review/claims');
        setClaims(response.data);
      } catch (error) {
        console.error("Gagal mengambil data antrean:", error);
        setErrorMsg("Gagal memuat antrean klaim. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // 2. Logika Sorting (Backend sudah mengirim format Terbaru/Desc by default)
  const sortedData = sortOption === 'Terbaru' ? [...claims] : [...claims].reverse();

  // 3. Logika Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1; // Minimal 1 halaman
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setCurrentPage(1); 
  };

  // Helper Format Tanggal (cth: "26 Agu 2026")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate nomor halaman dinamis untuk pagination
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header Table / Filters */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center relative">
          <div className="flex items-center space-x-2.5 bg-[#EEF2FF] px-4 py-2.5 rounded-lg">
            <span className="font-extrabold text-[#1E3A8A] text-[14px]">Menunggu Tinjauan</span>
            <span className="bg-[#1E3A8A] text-white text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-bold">
              {isLoading ? '...' : totalItems}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className="flex items-center space-x-3 border border-gray-300 px-4 py-2.5 rounded-lg text-[13px] text-slate-700 font-medium hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
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

        {/* Tabel Data */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Memuat data antrean klaim...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Tidak ada antrean klaim yang perlu ditinjau.
                  </td>
                </tr>
              ) : (
                currentData.map((klaim) => (
                  <tr key={klaim.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition">
                    <td className="px-6 py-5 font-bold text-[#253E6B]">#CLM-{klaim.id}</td>
                    <td className="px-6 py-5 text-gray-500 font-medium">{formatDate(klaim.created_at)}</td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800 mb-1.5 line-clamp-1">{klaim.text}</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] text-[#D97706] rounded-md text-[11px] font-bold">
                        <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link 
                        href={`/verifikasi/${klaim.id}`}
                        className="inline-block px-6 py-2 bg-[#0A1B3F] text-white rounded-lg text-xs font-bold hover:bg-[#152a5a] transition shadow-sm"
                      >
                        Tinjau
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-5 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-500 font-medium bg-[#FAFBFC]">
          <div>
            Menampilkan {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} klaim
          </div>
          
          <div className="flex space-x-1.5 items-center">
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1 || isLoading} 
              className={`px-3.5 py-2 border rounded-lg transition ${currentPage === 1 || isLoading ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-[#0A1B3F] font-bold bg-white hover:bg-gray-50 shadow-sm'}`}
            >
              Sebelumnya
            </button>
            
            {pageNumbers.map((num) => (
              <button 
                key={num} 
                onClick={() => goToPage(num)} 
                disabled={isLoading}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition ${currentPage === num ? 'bg-[#0A1B3F] text-white shadow-sm' : 'text-slate-600 hover:bg-gray-200'}`}
              >
                {num}
              </button>
            ))}
            
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages || isLoading} 
              className={`px-3.5 py-2 border rounded-lg transition ${currentPage === totalPages || isLoading ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-[#0A1B3F] font-bold bg-white hover:bg-gray-50 shadow-sm'}`}
            >
              Selanjutnya
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}