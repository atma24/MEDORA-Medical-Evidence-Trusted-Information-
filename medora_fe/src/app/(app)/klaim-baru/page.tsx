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
      await api.post('/claims', {
        text: topik,
        detail: detail
      });

      router.push('/dashboard');
      
    } catch (error: any) {
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
        <h2 className="text-[32px] font-bold text-[#1E293B] mb-3 tracking-tight">
          Ajukan Klaim Baru
        </h2>
        <p className="text-gray-500 text-[15px] max-w-3xl leading-relaxed">
          Klaim Anda akan diproses awal oleh sistem cerdas kami yang membandingkannya dengan
          ribuan literatur medis terpercaya, sebelum divalidasi akhir oleh tim pakar.
        </p>
      </div>

      {/* Form Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10">
        <h3 className="text-[22px] font-bold text-[#1E293B] mb-6 pb-4 border-b border-gray-200">
          Formulir Pengajuan Klaim
        </h3>

        {/* Alert Error */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-md mb-6 font-medium flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Topik / Judul Klaim */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Topik / Judul Klaim <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Cth: Daun kelor sembuhkan diabetes total..." 
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0B1E46] focus:ring-1 focus:ring-[#0B1E46] transition disabled:opacity-50"
            />
          </div>

          {/* Detail / Isi Pesan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Detail / Isi Pesan <span className="text-red-500">*</span>
            </label>
            <textarea 
              rows={7}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Tempelkan (copy-paste) isi pesan berantai atau tuliskan detail informasi yang ingin dicek di sini..." 
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0B1E46] focus:ring-1 focus:ring-[#0B1E46] transition resize-y disabled:opacity-50"
            ></textarea>
          </div>

          {/* Action Buttons (Footer Form) */}
          <div className="flex items-center justify-end space-x-4 pt-6 mt-8 border-t border-gray-200">
            <Link 
              href="/dashboard" 
              className="px-6 py-2.5 border border-gray-300 text-slate-700 bg-white rounded-md text-sm font-semibold hover:bg-gray-50 transition"
            >
              Batal
            </Link>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#0B1E46] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#152a5a] transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  {/* Ikon panah/kirim yang menyerupai di desain */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
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