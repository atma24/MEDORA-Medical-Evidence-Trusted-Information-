"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

function TwoFAInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get('method') || 'email';
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setTempToken(sessionStorage.getItem('medora_2fa_temp') || '');
    setEmail(sessionStorage.getItem('medora_2fa_email') || '');
    if (!sessionStorage.getItem('medora_2fa_temp')) {
      // tidak ada sesi 2FA, kembali login
      // router.push('/auth/login');
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || code.length !== 6) { setError('Kode harus 6 digit.'); return; }
    if (!tempToken) { setError('Sesi 2FA kadaluarsa, silakan login ulang.'); return; }
    setIsSubmitting(true);
    try {
      const res = await api.post('/2fa/verify', { temp_token: tempToken, code });
      const { token, user } = res.data;
      const remember = sessionStorage.getItem('medora_2fa_remember') === '1';
      if (remember) {
        localStorage.setItem('medora_token', token);
        localStorage.setItem('medora_user', JSON.stringify(user));
        localStorage.setItem('medora_role', user.role);
        sessionStorage.removeItem('medora_token');
        sessionStorage.removeItem('medora_user');
        sessionStorage.removeItem('medora_role');
      } else {
        sessionStorage.setItem('medora_token', token);
        sessionStorage.setItem('medora_user', JSON.stringify(user));
        sessionStorage.setItem('medora_role', user.role);
        localStorage.removeItem('medora_token');
        localStorage.removeItem('medora_user');
        localStorage.removeItem('medora_role');
      }
      sessionStorage.removeItem('medora_2fa_temp');
      sessionStorage.removeItem('medora_2fa_email');
      sessionStorage.removeItem('medora_2fa_remember');
      router.push('/dashboard');
    } catch (err:any) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Kode salah atau kadaluarsa.');
    } finally { setIsSubmitting(false); }
  };

  const handleResend = async () => {
    setError('');
    setIsResending(true);
    try {
      // resend via login ulang? Untuk MVP, user bisa kembali login untuk kirim ulang.
      // Kita coba pakai endpoint setup tidak ada auth, jadi fallback: arahkan login ulang.
      setError('Silakan kembali ke login dan masukkan password lagi untuk kirim ulang OTP.');
    } finally { setIsResending(false); }
  };

  return (
    <div className={`flex h-screen items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#f4f7ff] ${plusJakarta.className}`}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-sky-300/15 rounded-full blur-[150px]"></div>
      </div>

      <div className="flex w-full max-w-[900px] h-full max-h-[580px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden relative z-10 border border-white/50">
        <div className="hidden lg:flex w-[45%] bg-[#f5f8fc] flex-col pt-14 xl:pt-16 px-10 xl:px-12 border-r border-gray-100 relative">
          <img src="/images/logobiru.png" alt="Medora Logo" className="w-44 mb-4 relative z-10" />
          <p className="text-[12.5px] xl:text-[13px] text-gray-500 mb-6 font-medium relative z-10 leading-relaxed pr-4">
            From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information.
          </p>
          <h3 className="text-[17px] xl:text-[18px] font-bold text-[#0a1b3f] mb-5 xl:mb-6 relative z-10">Verifikasi 2 Langkah 🔐</h3>
          <div className="space-y-5 xl:space-y-6 relative z-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
              <div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Cek Email</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Kode 6-digit dikirim ke {email || 'email Anda'} (berlaku 10 menit).</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
              <div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Tanpa Tabel</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">OTP disimpan di Cache (10 menit), tanpa migrasi DB.</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Aman</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Jangan bagikan kode. Cek folder Spam jika tidak masuk.</p></div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-10 h-full overflow-y-auto">
          <div className="w-full max-w-[360px] my-auto">
            <h2 className="text-[22px] font-bold text-[#0a1b3f] mb-1.5">Masukkan Kode OTP</h2>
            <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
              Kode dikirim via Email ({method}) ke <span className="font-bold text-[#1c2d5a]">{email || 'email Anda'}</span>. Berlaku 10 menit.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[11.5px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Kode 6-digit</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  className="w-full border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 text-[15px] tracking-[0.4em] text-center font-bold bg-white text-slate-800 placeholder:text-gray-300 border-gray-300 focus:ring-[#1c2d5a] transition"
                  value={code}
                  onChange={e=>setCode(e.target.value.replace(/\D/g,''))}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <button type="submit" disabled={isSubmitting || code.length!==6} className={`w-full text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 mt-2 transition shadow-md text-[13.5px] ${isSubmitting || code.length!==6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1b3f] hover:bg-[#152a5a]'}`}>
                {isSubmitting ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <button onClick={handleResend} disabled={isResending} className="text-[12px] font-bold text-[#1c2d5a] hover:underline disabled:opacity-60">Kirim ulang? Kembali login</button>
              <p className="text-[12px] text-gray-500"><Link href="/auth/login" className="font-bold text-[#1c2d5a] hover:underline">Kembali ke Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TwoFAPage(){
  return <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-500">Memuat...</div>}><TwoFAInner/></Suspense>;
}
