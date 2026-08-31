"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email:'', password:'', confirm:'' });
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const e = searchParams.get('email') || '';
    const t = searchParams.get('token') || '';
    // Laravel reset link format: /reset-password?token=xxx&email=yyy
    if (e) setEmail(decodeURIComponent(e));
    if (t) setToken(decodeURIComponent(t));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError('');
    const errs = { email:'', password:'', confirm:'' };
    let valid = true;
    if (!email.trim()) { errs.email='Email harap diisi.'; valid=false; }
    if (!token.trim()) { setBackendError('Token reset tidak ditemukan. Buka link dari email.'); return; }
    if (!password.trim()) { errs.password='Kata sandi harap diisi.'; valid=false; }
    else if (password.length<8) { errs.password='Minimal 8 karakter.'; valid=false; }
    else {
      const hasLetter=/[a-zA-Z]/.test(password), hasNumber=/\d/.test(password), hasSymbol=/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
      if (!hasLetter||!hasNumber||!hasSymbol) { errs.password='Harus huruf, angka & simbol.'; valid=false; }
    }
    if (!passwordConfirm.trim()) { errs.confirm='Konfirmasi harap diisi.'; valid=false; }
    else if (password!==passwordConfirm) { errs.confirm='Kata sandi tidak cocok.'; valid=false; }
    setFieldErrors(errs);
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/reset-password', { email, token, password, password_confirmation: passwordConfirm });
      // sukses
      alert(res.data.message || 'Password berhasil direset. Silakan login.');
      router.push('/auth/login');
    } catch (err:any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0] as string[];
        setBackendError(first[0]);
      } else if (err.response?.data?.message) setBackendError(err.response.data.message);
      else setBackendError('Gagal reset. Coba lagi.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={`flex h-screen items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#f4f7ff] ${plusJakarta.className}`}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-sky-300/15 rounded-full blur-[150px]"></div>
      </div>

      <div className="flex w-full max-w-[900px] h-full max-h-[620px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden relative z-10 border border-white/50">
        <div className="hidden lg:flex w-[45%] bg-[#f5f8fc] flex-col pt-14 xl:pt-16 px-10 xl:px-12 border-r border-gray-100 relative">
          <img src="/images/logobiru.png" alt="Medora Logo" className="w-44 mb-4 relative z-10" />
          <p className="text-[12.5px] xl:text-[13px] text-gray-500 mb-6 font-medium relative z-10 leading-relaxed pr-4">
            From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information.
          </p>
          <h3 className="text-[17px] xl:text-[18px] font-bold text-[#0a1b3f] mb-5 xl:mb-6 relative z-10">Atur Ulang Kata Sandi 🔑</h3>
          <div className="space-y-5 xl:space-y-6 relative z-10">
            <div className="flex gap-4"><div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div><div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Password Kuat</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Minimal 8 karakter, kombinasi huruf, angka & simbol.</p></div></div>
            <div className="flex gap-4"><div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Verifikasi Token</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Token dari email berlaku 60 menit.</p></div></div>
            <div className="flex gap-4"><div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div><div><h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Langsung Masuk</h4><p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Setelah sukses, login dengan password baru.</p></div></div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-10 h-full overflow-y-auto">
          <div className="w-full max-w-[360px] my-auto">
            <h2 className="text-[22px] font-bold text-[#0a1b3f] mb-1.5">Atur Password Baru</h2>
            <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">Masukkan email, token dari email, dan password baru.</p>

            {backendError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[11.5px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{backendError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Email</label>
                <input type="email" placeholder="nama@email.com" className={`pl-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] bg-white text-slate-800 placeholder:text-gray-400 transition ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`} style={{paddingLeft:'2.5rem'}} value={email} onChange={e=>setEmail(e.target.value)} disabled={isSubmitting} autoComplete="email" />
                {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Token Reset</label>
                <input type="text" placeholder="token dari email" className="w-full border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 text-[12.5px] bg-white text-slate-800 placeholder:text-gray-400 border-gray-300 focus:ring-[#1c2d5a] transition" value={token} onChange={e=>setToken(e.target.value)} disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Kata Sandi Baru</label>
                <div className="relative">
                  <input type={showPass ? "text":"password"} placeholder="••••••••" className={`pl-9 pr-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] bg-white text-slate-800 placeholder:text-gray-400 transition ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`} value={password} onChange={e=>setPassword(e.target.value)} disabled={isSubmitting} autoComplete="new-password" />
                  <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showPass ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showPass ? "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : ""} /></svg></button>
                </div>
                {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Konfirmasi Sandi</label>
                <input type={showConfirm ? "text":"password"} placeholder="••••••••" className={`pl-9 pr-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] bg-white text-slate-800 placeholder:text-gray-400 transition ${fieldErrors.confirm ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`} value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} disabled={isSubmitting} autoComplete="new-password" />
                {fieldErrors.confirm && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.confirm}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 mt-2 transition shadow-md text-[13.5px] ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1b3f] hover:bg-[#152a5a]'}`}>
                {isSubmitting ? 'Memproses...' : 'Reset Password'}
                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </form>

            <div className="text-center mt-7">
              <p className="text-[12.5px] text-gray-600"><Link href="/auth/login" className="font-bold text-[#1c2d5a] hover:underline">Kembali ke Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage(){
  return <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-500">Memuat...</div>}><ResetPasswordInner/></Suspense>;
}
