'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AjukanKlaimPage() {
  const [topik, setTopik] = useState('');
  const [detail, setDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      // Hit API Laravel dengan payload yang sudah dipisah sesuai backend baru
      await api.post('/claims', {
        text: topik,
        detail: detail
      });

      // Redirect ke dashboard setelah berhasil
      router.push('/dashboard');
      
    } catch (error: any) {
      // Handle pesan error dari Laravel (ValidationException dll)
      if (error.response && error.response.data && error.response.data.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        setErrorMsg(firstError[0]);
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan pada server saat mengirim klaim.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      
      {/* Title & Description */}
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold text-[#253E6B] mb-3 tracking-tight">
          Ajukan Klaim Baru
        </h2>
        <p className="text-gray-600 text-[15px] max-w-3xl leading-relaxed">
          Klaim Anda akan diproses awal oleh sistem cerdas kami yang membandingkannya dengan ribuan literatur medis terpercaya, sebelum divalidasi akhir oleh tim pakar.
        </p>
      </div>

      {/* Form Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 md:p-10">
        <h3 className="text-lg font-bold text-[#253E6B] mb-6 pb-4 border-b border-gray-100">
          Formulir Pengajuan Klaim
        </h3>

        {/* Alert Error */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Topik / Judul Klaim */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Topik / Judul Klaim <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Cth: Daun kelor sembuhkan diabetes total..." 
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#253E6B] focus:ring-1 focus:ring-[#253E6B] transition disabled:opacity-50"
            />
          </div>

          {/* Detail / Isi Pesan */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Detail / Isi Pesan <span className="text-red-500">*</span>
            </label>
            <textarea 
              rows={6}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Tempelkan (copy-paste) isi pesan berantai atau tuliskan detail informasi yang ingin dicek di sini..." 
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#253E6B] focus:ring-1 focus:ring-[#253E6B] transition resize-y disabled:opacity-50"
            ></textarea>
            <p className="text-[11px] text-gray-400 mt-2">Maksimal 5000 karakter.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
            <Link 
              href="/dashboard" 
              className="px-6 py-2.5 border border-gray-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Batal
            </Link>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#0A1B3F] text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#152a5a] transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memproses Analisis...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Kirim Klaim</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}