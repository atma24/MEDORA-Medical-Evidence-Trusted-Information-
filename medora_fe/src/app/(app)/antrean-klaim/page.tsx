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

  const [activeTab, setActiveTab] = useState('Menunggu Tinjauan');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Terbaru');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 1. Mengambil data antrean dari backend
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

  // 2. Logika Sorting
  const sortedData = sortOption === 'Terbaru' ? [...claims] : [...claims].reverse();

  // 3. Logika Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setCurrentPage(1); 
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate nomor halaman dinamis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2 tracking-tight">
          Antrean Klaim
        </h1>
        <p className="text-gray-500 text-[15px]">
          Daftar artikel kesehatan dan fakta medis pilihan Anda.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Kontainer Utama Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Navigasi Tab & Filter Sorting */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
          
          {/* Tabs */}
          <div className="flex items-center space-x-6 text-[14px]">
            <button 
              onClick={() => setActiveTab('Semua')}
              className={`font-medium transition-colors ${activeTab === 'Semua' ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setActiveTab('Menunggu Tinjauan')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'Menunggu Tinjauan' ? 'bg-[#EEF2FF] text-[#1E3A8A] font-bold' : 'text-gray-500 hover:text-gray-800 font-medium'}`}
            >
              <span>Menunggu Tinjauan</span>
              <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold ${activeTab === 'Menunggu Tinjauan' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-200 text-gray-600'}`}>
                {isLoading ? '-' : totalItems}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('Selesai')}
              className={`font-medium transition-colors ${activeTab === 'Selesai' ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Selesai
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className="flex items-center justify-between w-32 bg-white border border-gray-300 px-4 py-2 rounded-lg text-[13px] text-slate-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              <span>{sortOption}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
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
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                <th className="px-6 py-4">ID KLAIM</th>
                <th className="px-6 py-4">TANGGAL MASUK</th>
                <th className="px-6 py-4">TOPIK KLAIM</th>
                <th className="px-6 py-4 text-right pr-10">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-700">
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
                  <tr key={klaim.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-6 font-bold text-[#0B1E46]">#CLM-{klaim.id}</td>
                    <td className="px-6 py-6 text-gray-500 font-medium">{formatDate(klaim.created_at)}</td>
                    <td className="px-6 py-6">
                      <p className="font-semibold text-[#1E293B] mb-2 line-clamp-1">{klaim.text}</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] text-[#D97706] rounded-md text-[11px] font-semibold">
                        <IconTinjauanStatus className="w-3.5 h-3.5" /> Menunggu Tinjauan
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right pr-6">
                      <Link 
                        href={`/verifikasi/${klaim.id}`}
                        className="inline-block px-5 py-2 bg-[#0B1E46] text-white rounded-md text-xs font-semibold hover:bg-[#152a5a] transition"
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
        <div className="p-5 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-500 bg-white">
          <div className="font-medium">
            Menampilkan {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} klaim
          </div>
          
          <div className="flex space-x-2 items-center">
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1 || isLoading} 
              className={`px-4 py-2 border rounded-md transition font-medium ${currentPage === 1 || isLoading ? 'border-gray-200 text-gray-300 bg-white cursor-not-allowed' : 'border-gray-300 text-slate-700 bg-white hover:bg-gray-50'}`}
            >
              Sebelumnya
            </button>
            
            {pageNumbers.map((num) => (
              <button 
                key={num} 
                onClick={() => goToPage(num)} 
                disabled={isLoading}
                className={`w-9 h-9 flex items-center justify-center rounded-md font-semibold transition ${currentPage === num ? 'bg-[#0B1E46] text-white' : 'text-slate-600 hover:bg-gray-100 bg-white'}`}
              >
                {num}
              </button>
            ))}
            
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages || isLoading} 
              className={`px-4 py-2 border rounded-md transition font-medium ${currentPage === totalPages || isLoading ? 'border-gray-200 text-gray-300 bg-white cursor-not-allowed' : 'border-gray-300 text-[#0B1E46] bg-white hover:bg-gray-50'}`}
            >
              Selanjutnya
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}