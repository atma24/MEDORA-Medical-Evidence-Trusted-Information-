"use client";
import React, { useState } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import api from '@/lib/api';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(''); setSuccessMsg(''); setFieldError('');
    if (!email.trim()) { setFieldError('Email harap diisi.'); return; }
    const parts = email.split('@');
    if (parts.length !== 2 || parts[0].length < 1) { setFieldError('Format email tidak valid.'); return; }

    setIsSubmitting(true);
    try {
      const res = await api.post('/forgot-password', { email });
      setSuccessMsg(res.data.message || 'Link reset telah dikirim ke email Anda. Silakan cek inbox/spam.');
      setEmail('');
    } catch (err: any) {
      if (err.response?.data?.errors?.email) setBackendError(err.response.data.errors.email[0]);
      else if (err.response?.data?.message) setBackendError(err.response.data.message);
      else setBackendError('Gagal mengirim link. Coba lagi nanti.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={`flex h-screen items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#f4f7ff] ${plusJakarta.className}`}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-sky-300/15 rounded-full blur-[150px]"></div>
      </div>

      <div className="flex w-full max-w-[900px] h-full max-h-[580px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden relative z-10 border border-white/50">
        {/* KOLOM KIRI — sama 100% dengan login */}
        <div className="hidden lg:flex w-[45%] bg-[#f5f8fc] flex-col pt-14 xl:pt-16 px-10 xl:px-12 border-r border-gray-100 relative">
          <img src="/images/logobiru.png" alt="Medora Logo" className="w-44 mb-4 relative z-10" />
          <p className="text-[12.5px] xl:text-[13px] text-gray-500 mb-6 font-medium relative z-10 leading-relaxed pr-4">
            From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information.
          </p>
          <h3 className="text-[17px] xl:text-[18px] font-bold text-[#0a1b3f] mb-5 xl:mb-6 relative z-10">Lupa Kata Sandi? 🔐</h3>
          <div className="space-y-5 xl:space-y-6 relative z-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
              <div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Cek Email Anda</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Kami akan kirim link reset ke email terdaftar.</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
              <div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Aman & Terenkripsi</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Link hanya berlaku 60 menit dan sekali pakai.</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
              <div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Akses Cepat</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Setelah reset, langsung masuk ke dashboard MEDORA.</p></div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN — FORM */}
        <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-10 h-full overflow-y-auto">
          <div className="w-full max-w-[360px] my-auto">
            <h2 className="text-[22px] font-bold text-[#0a1b3f] mb-1.5">Lupa Kata Sandi</h2>
            <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">Masukkan email terdaftar, kami akan kirim tautan untuk mereset kata sandi.</p>

            {backendError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[11.5px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{backendError}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11.5px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none w-10">
                    <svg className={`w-4 h-4 ${fieldError ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className={`pl-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] bg-white text-slate-800 placeholder:text-gray-400 transition ${fieldError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldError(''); setBackendError(''); setSuccessMsg(''); }}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {fieldError && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{fieldError}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 mt-2 transition duration-200 shadow-md text-[13.5px] ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1b3f] hover:bg-[#152a5a]'}`}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </form>

            <div className="text-center mt-7 space-y-2">
              <p className="text-[12.5px] text-gray-600">Sudah ingat kata sandi? <Link href="/auth/login" className="font-bold text-[#1c2d5a] hover:underline">Masuk</Link></p>
              <p className="text-[12.5px] text-gray-600">Belum punya akun? <Link href="/auth/register" className="font-bold text-[#1c2d5a] hover:underline">Daftar</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
