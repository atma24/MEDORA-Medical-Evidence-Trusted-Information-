"use client";
import React, { useState } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function LoginUI() {
    const router = useRouter();

    const [data, setData] = useState({
        email: '',
        password: '',
        remember_me: false,
    });

    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [backendError, setBackendError] = useState('');

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData({ ...data, email: val });
        setBackendError('');
        setFieldErrors(prev => ({ ...prev, email: val.trim() ? '' : 'Email harap diisi.' }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData({ ...data, password: val });
        setBackendError('');
        setFieldErrors(prev => ({ ...prev, password: val.trim() ? '' : 'Kata sandi harap diisi.' }));
    };

    const validateAllFields = () => {
        let errors = { email: '', password: '' };
        let isValid = true;

        if (!data.email.trim()) { errors.email = 'Email harap diisi.'; isValid = false; }
        if (!data.password.trim()) { errors.password = 'Kata sandi harap diisi.'; isValid = false; }

        return { errors, isValid };
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { errors, isValid } = validateAllFields();
        if (!isValid) {
            setFieldErrors(errors);
            return; 
        }

        setIsSubmitting(true);
        setBackendError('');

        try {
            // Hit API Login Laravel
            const response = await api.post('/login', {
                email: data.email,
                password: data.password,
            });
            
            const { token, user } = response.data;

            // Logika Remember Me
            if (data.remember_me) {
                localStorage.setItem('medora_token', token);
                localStorage.setItem('medora_user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('medora_token', token);
                sessionStorage.setItem('medora_user', JSON.stringify(user));
            }

            // Redirect ke Dashboard setelah sukses
            router.push('/dashboard');

        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const firstError = Object.values(error.response.data.errors)[0] as string[];
                setBackendError(firstError[0]);
            } else if (error.response && error.response.data && error.response.data.message) {
                setBackendError(error.response.data.message);
            } else {
                setBackendError("Terjadi kesalahan pada server. Coba lagi nanti.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`flex h-screen items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#f4f7ff] ${plusJakarta.className}`}>
            
            {/* =========================================
                BACKGROUND BLUR EFFECTS
            ========================================= */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-sky-300/15 rounded-full blur-[150px]"></div>
            </div>

            {/* =========================================
                CARD CONTAINER (Tinggi disesuaikan karena isinya lebih sedikit)
            ========================================= */}
            <div className="flex w-full max-w-[900px] h-full max-h-[580px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden relative z-10 border border-white/50">
                
                {/* KOLOM KIRI (WELCOME BACK) */}
                <div className="hidden lg:flex w-[45%] bg-[#f5f8fc] flex-col pt-14 xl:pt-16 px-10 xl:px-12 border-r border-gray-100 relative">
                    
                    <img src="/images/logobiru.png" alt="Medora Logo" className="w-44 mb-4 relative z-10" />
                    
                    <p className="text-[12.5px] xl:text-[13px] text-gray-500 mb-6 font-medium relative z-10 leading-relaxed pr-4">
                        From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information.
                    </p>

                    <h3 className="text-[17px] xl:text-[18px] font-bold text-[#0a1b3f] mb-5 xl:mb-6 relative z-10">Selamat Datang Kembali! 👋</h3>

                    <div className="space-y-5 xl:space-y-6 relative z-10">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Lanjutkan Verifikasi</h4>
                                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Cek kebenaran klaim kesehatan terbaru di dashboard Anda.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div>
                                <h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Pantau Riwayat</h4>
                                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Akses kembali daftar klaim medis yang pernah Anda ajukan.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Aman & Terlindungi</h4>
                                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Sistem Medora mengamankan data dan aktivitas akun Anda.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN (FORM LOGIN) */}
                <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-10 h-full overflow-y-auto">
                    <div className="w-full max-w-[360px] my-auto">
                        
                        <h2 className="text-[22px] font-bold text-[#0a1b3f] mb-1.5">Masuk ke Akun Anda</h2>
                        <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
                            Masukkan email dan kata sandi yang terdaftar.
                        </p>

                        <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition mb-5 shadow-sm text-[12.5px]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Lanjutkan dengan Google
                        </button>

                        <div className="flex items-center gap-4 mb-5">
                            <hr className="flex-1 border-gray-200" />
                            <span className="text-[11px] text-gray-400">Atau masuk dengan email</span>
                            <hr className="flex-1 border-gray-200" />
                        </div>

                        {backendError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-[11.5px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{backendError}</span>
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            
                            {/* Input Email */}
                            <div>
                                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none w-10">
                                        <svg className={`w-4 h-4 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="nama@email.com" 
                                        className={`pl-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] transition ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                                        value={data.email}
                                        onChange={handleEmailChange} 
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{fieldErrors.email}</p>}
                            </div>

                            {/* Input Kata Sandi */}
                            <div>
                                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Kata Sandi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10">
                                        <svg className={`w-4 h-4 ${fieldErrors.password ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        className={`pl-9 pr-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] transition ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                                        value={data.password}
                                        onChange={handlePasswordChange} 
                                        disabled={isSubmitting}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={isSubmitting}>
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{fieldErrors.password}</p>}
                            </div>

                            {/* Opsi Tambahan: Remember Me & Lupa Sandi */}
                            <div className="flex items-center justify-between mt-2 mb-1 px-1">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="remember" 
                                        className="h-3.5 w-3.5 text-[#1c2d5a] border-gray-300 rounded focus:ring-[#1c2d5a] cursor-pointer"
                                        checked={data.remember_me}
                                        onChange={(e) => setData({...data, remember_me: e.target.checked})}
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="remember" className="text-[11.5px] text-gray-600 cursor-pointer select-none">
                                        Ingat saya
                                    </label>
                                </div>
                                <Link href="#" className="text-[11.5px] font-bold text-[#1c2d5a] hover:underline">
                                    Lupa Kata Sandi?
                                </Link>
                            </div>

                            <button 
                                type="submit" 
                                className={`w-full text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 mt-4 transition duration-200 shadow-md text-[13.5px] ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1b3f] hover:bg-[#152a5a]'}`}
                                disabled={isSubmitting} 
                            >
                                {isSubmitting ? 'Memproses...' : 'Masuk Akun'}
                                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                            </button>
                        </form>

                        <div className="text-center mt-7">
                            <p className="text-[12.5px] text-gray-600">
                                Belum punya akun? <Link href="/auth/register" className="font-bold text-[#1c2d5a] hover:underline">Daftar</Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}