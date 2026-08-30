"use client";
import React, { useState } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function RegisterUI() {
    const router = useRouter();

    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_reviewer: false,
        str_number: '',
        speciality_id: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        str_number: '' 
    });

    const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [backendError, setBackendError] = useState('');

    // =========================================
    // REAL-TIME VALIDATION HANDLERS
    // =========================================
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData({ ...data, name: val });
        setBackendError('');
        
        if (!val.trim()) {
            setFieldErrors(prev => ({ ...prev, name: 'Nama Lengkap harap diisi.' }));
        } else {
            setFieldErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData({ ...data, email: val });
        setBackendError('');
        
        if (!val.trim()) {
            setFieldErrors(prev => ({ ...prev, email: 'Email harap diisi.' }));
        } else {
            const emailParts = val.split('@');
            if (emailParts.length !== 2 || emailParts[0].length < 1 || emailParts[0].length > 64) {
                setFieldErrors(prev => ({ ...prev, email: 'Format tidak valid. Gunakan @ dengan username (maks 64 karakter).' }));
            } else {
                setFieldErrors(prev => ({ ...prev, email: '' }));
            }
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData({ ...data, password: val });
        
        if (!val.trim()) {
            setFieldErrors(prev => ({ ...prev, password: 'Kata sandi harap diisi.' }));
        } else if (val.length < 8) {
            setFieldErrors(prev => ({ ...prev, password: 'Kata sandi minimal 8 karakter.' }));
        } else {
            const hasLetter = /[a-zA-Z]/.test(val);
            const hasNumber = /\d/.test(val);
            const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(val);

            if (!hasLetter || !hasNumber || !hasSymbol) {
                setFieldErrors(prev => ({ ...prev, password: 'Harus mengandung kombinasi huruf, angka, dan simbol khusus.' }));
            } else {
                setFieldErrors(prev => ({ ...prev, password: '' })); 
            }
        }

        if (data.password_confirmation.trim()) {
            if (val !== data.password_confirmation) {
                setFieldErrors(prev => ({ ...prev, password_confirmation: 'Kata sandi tidak cocok.' }));
            } else {
                setFieldErrors(prev => ({ ...prev, password_confirmation: '' }));
            }
        }
    };

    const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData({ ...data, password_confirmation: val });
        
        if (!val.trim()) {
            setFieldErrors(prev => ({ ...prev, password_confirmation: 'Konfirmasi kata sandi harap diisi.' }));
        } else if (val !== data.password) {
            setFieldErrors(prev => ({ ...prev, password_confirmation: 'Kata sandi tidak cocok.' }));
        } else {
            setFieldErrors(prev => ({ ...prev, password_confirmation: '' }));
        }
    };

    const handleStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); 
        setData({ ...data, str_number: val });

        if (!val) {
            setFieldErrors(prev => ({ ...prev, str_number: 'Nomor STR wajib diisi.' }));
        } else if (val.length !== 16) {
            setFieldErrors(prev => ({ ...prev, str_number: 'Nomor STR wajib 16 digit angka.' }));
        } else {
            setFieldErrors(prev => ({ ...prev, str_number: '' }));
        }
    };

    const validateAllFields = () => {
        let errors = { name: '', email: '', password: '', password_confirmation: '', str_number: fieldErrors.str_number };
        let isValid = true;

        if (!data.name.trim()) { errors.name = 'Nama Lengkap harap diisi.'; isValid = false; }
        if (!data.email.trim()) { errors.email = 'Email harap diisi.'; isValid = false; }
        else {
            const emailParts = data.email.split('@');
            if (emailParts.length !== 2 || emailParts[0].length < 1 || emailParts[0].length > 64) {
                errors.email = 'Format tidak valid. Gunakan @ dengan username (maks 64 karakter).';
                isValid = false;
            }
        }
        if (!data.password.trim()) { errors.password = 'Kata sandi harap diisi.'; isValid = false; }
        else if (data.password.length < 8) { errors.password = 'Kata sandi minimal 8 karakter.'; isValid = false; }
        else {
            const hasLetter = /[a-zA-Z]/.test(data.password);
            const hasNumber = /\d/.test(data.password);
            const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(data.password);
            if (!hasLetter || !hasNumber || !hasSymbol) {
                errors.password = 'Harus mengandung kombinasi huruf, angka, dan simbol khusus.'; isValid = false;
            }
        }
        if (!data.password_confirmation.trim()) { errors.password_confirmation = 'Konfirmasi kata sandi harap diisi.'; isValid = false; }
        else if (data.password !== data.password_confirmation) { errors.password_confirmation = 'Kata sandi tidak cocok.'; isValid = false; }

        return { errors, isValid };
    };

    // =========================================
    // ACTION HANDLERS DENGAN AXIOS KE LARAVEL
    // =========================================
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const { errors, isValid } = validateAllFields();
            if (!isValid) {
                setFieldErrors(errors);
                setIsErrorModalOpen(true); 
                setData({...data, is_reviewer: false}); 
                return;
            }
            setData({...data, is_reviewer: true});
            setIsReviewerModalOpen(true);
        } else {
            setData({...data, is_reviewer: false});
            setIsReviewerModalOpen(false);
        }
    };

    const handleMainSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { errors, isValid } = validateAllFields();
        if (!isValid) {
            setFieldErrors(errors);
            return; 
        }

        if (data.is_reviewer) {
             setIsReviewerModalOpen(true);
        } else {
            setIsSubmitting(true);
            setBackendError('');

            try {
                const response = await api.post('/register', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                    role: 'USER'
                });
                
                router.push('/auth/login');

            } catch (error: any) {
                if (error.response && error.response.data && error.response.data.errors) {
                    const firstError = Object.values(error.response.data.errors)[0] as string[];
                    setBackendError(firstError[0]);
                } else if (error.response && error.response.data && error.response.data.message) {
                    setBackendError(error.response.data.message);
                } else {
                    setBackendError("Terjadi kesalahan pada server backend. Coba lagi nanti.");
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const response = await api.get('/auth/google');
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            setBackendError('Gagal menghubungkan dengan Google. Coba lagi nanti.');
        }
    };

    const handleReviewerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.str_number.length !== 16) {
            setFieldErrors(prev => ({ ...prev, str_number: 'Nomor STR wajib 16 digit angka.' }));
            return;
        }

        setIsSubmitting(true);
        setBackendError('');

        try {
            const response = await api.post('/register', {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
                role: 'REVIEWER',
                str_number: data.str_number,
                speciality_id: Number(data.speciality_id)
            });
            
            setIsReviewerModalOpen(false);
            setIsSuccessModalOpen(true);

        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const firstError = Object.values(error.response.data.errors)[0] as string[];
                setBackendError(firstError[0]);
            } else if (error.response && error.response.data && error.response.data.message) {
                setBackendError(error.response.data.message);
            } else {
                setBackendError("Terjadi kesalahan saat mendaftar Reviewer.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`flex h-screen items-center justify-center p-4 lg:p-8 relative overflow-hidden ${plusJakarta.className}`}>
            
            {/* =========================================
                BACKGROUND BLUR EFFECTS (Cahaya Biru)
            ========================================= */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#f4f7ff]">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-sky-300/15 rounded-full blur-[150px]"></div>
            </div>

            {/* =========================================
                CARD CONTAINER (Tengah Layar)
            ========================================= */}
            {/* max-h dinaikkan sedikit ke 650px agar form lebih lega */}
            <div className="flex w-full max-w-[900px] h-full max-h-[650px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden relative z-10 border border-white/50">
                
                {/* KOLOM KIRI (PROMOSI MEDORA) */}
                <div className="hidden lg:flex w-[45%] bg-[#f5f8fc] flex-col pt-14 xl:pt-16 px-10 xl:px-12 border-r border-gray-100 relative">
                    
                    <img src="/images/logobiru.png" alt="Medora Logo" className="w-44 mb-4 relative z-10" />
                    
                    <p className="text-[12.5px] xl:text-[13px] text-gray-500 mb-6 font-medium relative z-10 leading-relaxed pr-4">
                        From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information.
                    </p>

                    <h3 className="text-[17px] xl:text-[18px] font-bold text-[#0a1b3f] mb-5 xl:mb-6 relative z-10">Why Join Medora?</h3>

                    <div className="space-y-5 xl:space-y-6 relative z-10">
                        {/* Point 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Verifikasi Fakta Medis</h4>
                                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Akses database informasi kesehatan yang divalidasi oleh ahli.</p>
                            </div>
                        </div>

                        {/* Point 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-1.998A11.954 11.954 0 0110 1.944z" clipRule="evenodd"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Lindungi Komunitas</h4>
                                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Bantu hentikan penyebaran hoaks kesehatan berbahaya.</p>
                            </div>
                        </div>

                        {/* Point 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#1c2d5a]">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"></path></svg>
                            </div>
                            <div>
                                <h4 className="text-[12.5px] font-bold text-[#1c2d5a]">Literasi Kesehatan</h4>
                                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">Tingkatkan pemahaman publik tentang isu kesehatan terkini.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN (FORM UTAMA) */}
                <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-10 h-full overflow-y-auto">
                    <div className="w-full max-w-[360px] my-auto">
                        
                        <h2 className="text-[22px] font-bold text-[#0a1b3f] mb-1.5">Buat Akun Baru</h2>
                        <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
                            Masukkan detail Anda untuk mendaftar.
                        </p>

                        <button 
                            type="button"
                            onClick={handleGoogleAuth}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition mb-5 shadow-sm text-[12.5px]"
                        >
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
                            <span className="text-[11px] text-gray-400">Atau daftar dengan email</span>
                            <hr className="flex-1 border-gray-200" />
                        </div>

                        {/* Munculin alert error dari backend */}
                        {backendError && !isReviewerModalOpen && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-[11.5px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{backendError}</span>
                            </div>
                        )}

                        {/* Jarak antar form diganti jadi space-y-4 agar lebih lega */}
                        <form onSubmit={handleMainSubmit} className="space-y-4">
                            
                            {/* Input Nama */}
                            <div>
                                <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Nama Lengkap</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none w-10">
                                        <svg className={`w-4 h-4 ${fieldErrors.name ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="nama lengkap anda" 
                                        className={`pl-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] transition ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                                        value={data.name}
                                        onChange={handleNameChange} 
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1 pl-1 font-medium">{fieldErrors.name}</p>}
                            </div>

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

                            <div className="grid grid-cols-2 gap-4">
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
                                            className={`pl-9 pr-8 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] transition ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                                            value={data.password}
                                            onChange={handlePasswordChange} 
                                            disabled={isSubmitting}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={isSubmitting}>
                                                {showPassword ? (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Konfirmasi Kata Sandi */}
                                <div>
                                    <label className="block text-[11.5px] font-semibold text-[#1c2d5a] mb-1.5">Konfirmasi Sandi</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10">
                                            <svg className={`w-4 h-4 ${fieldErrors.password_confirmation ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <input 
                                            type={showPasswordConfirm ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            className={`pl-9 pr-8 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[12.5px] transition ${fieldErrors.password_confirmation ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                                            value={data.password_confirmation}
                                            onChange={handlePasswordConfirmChange} 
                                            disabled={isSubmitting}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="text-gray-400 hover:text-gray-600 focus:outline-none" disabled={isSubmitting}>
                                                {showPasswordConfirm ? (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {(fieldErrors.password || fieldErrors.password_confirmation) && (
                                <div className="flex flex-col gap-1 pl-1">
                                    {fieldErrors.password && <p className="text-red-500 text-[10px] font-medium leading-tight">{fieldErrors.password}</p>}
                                    {fieldErrors.password_confirmation && <p className="text-red-500 text-[10px] font-medium leading-tight">{fieldErrors.password_confirmation}</p>}
                                </div>
                            )}

                            {/* Checkbox Reviewer */}
                            <div className="bg-[#f8faff] p-3 rounded-xl mt-2 flex items-start gap-3 border border-transparent hover:border-gray-200 transition">
                                <input 
                                    type="checkbox" 
                                    id="reviewer" 
                                    className="mt-1 h-3.5 w-3.5 text-[#1c2d5a] bg-white border-gray-300 rounded focus:ring-[#1c2d5a] cursor-pointer"
                                    checked={data.is_reviewer}
                                    onChange={handleCheckboxChange} 
                                    disabled={isSubmitting}
                                />
                                <div>
                                    <label htmlFor="reviewer" className="block text-[11.5px] font-bold text-[#1c2d5a] cursor-pointer">Ajukan sebagai Reviewer Medis</label>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Memerlukan verifikasi khusus untuk mendaftar sebagai tenaga ahli</p>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className={`w-full text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 mt-4 transition duration-200 shadow-md text-[13px] ${(data.is_reviewer || isSubmitting) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1b3f] hover:bg-[#152a5a]'}`}
                                disabled={data.is_reviewer || isSubmitting} 
                            >
                                {isSubmitting ? 'Memproses...' : 'Buat Akun'}
                                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                            </button>
                        </form>

                        <div className="text-center mt-7">
                            <p className="text-[12.5px] text-gray-600">
                                Sudah punya akun? <a href="/auth/login" className="font-bold text-[#1c2d5a] hover:underline">Masuk</a>
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* =========================================
                POPUP 1: FORM REVIEWER
            ========================================= */}
            {isReviewerModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[20px] p-8 w-full max-w-[420px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        
                        <button 
                            type="button"
                            onClick={() => {
                                setIsReviewerModalOpen(false);
                                setData({...data, is_reviewer: false}); 
                                setBackendError('');
                            }} 
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                            disabled={isSubmitting}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-[20px] font-bold text-[#1c2d5a] text-center mb-6">Ajukan sebagai Reviewer Medis</h3>

                        {/* Munculin alert error backend di dalam modal */}
                        {backendError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{backendError}</span>
                            </div>
                        )}

                        <form onSubmit={handleReviewerSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11.5px] font-bold text-[#0a1b3f] mb-1.5">Nomor STR / Kredensial Profesi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none w-10">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={16}
                                        placeholder="Masukkan nomor registrasi medis Anda"
                                        className={`pl-10 w-full border rounded-xl py-2.5 focus:outline-none focus:ring-2 text-[13px] transition ${fieldErrors.str_number ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#1c2d5a]'}`}
                                        value={data.str_number}
                                        onChange={handleStrChange}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                                {fieldErrors.str_number && <p className="text-red-500 text-[10.5px] mt-1.5 pl-1 font-medium">{fieldErrors.str_number}</p>}
                            </div>

                            <div>
                                <label className="block text-[11.5px] font-bold text-[#0a1b3f] mb-1.5">Bidang Keahlian</label>
                                <div className="relative">
                                    <select
                                        className={`w-full border border-gray-300 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#1c2d5a] text-[13px] appearance-none bg-white ${data.speciality_id ? 'text-gray-800' : 'text-gray-400'}`}
                                        value={data.speciality_id}
                                        onChange={e => setData({...data, speciality_id: e.target.value})}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <option value="" disabled>Pilih Bidang Keahlian</option>
                                        <option value="1">Kedokteran Umum</option>
                                        <option value="2">Penyakit Dalam</option>
                                        <option value="3">Bedah</option>
                                        <option value="4">Pediatri (Spesialis Anak)</option>
                                        <option value="5">Obstetri & Ginekologi (Obgyn)</option>
                                        <option value="6">Kedokteran Gigi</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 mt-2 transition duration-200 shadow-md text-[13.5px] ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1b3f] hover:bg-[#152a5a]'}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Memproses...' : 'Buat Akun'}
                                {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================
                POPUP 2: MODAL SUKSES
            ========================================= */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[20px] p-8 md:p-10 w-full max-w-[420px] shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                        
                        <div className="w-16 h-16 mb-5">
                            <img src="/images/sukses-icon.jpeg" alt="Sukses Icon" className="w-full h-full object-contain" />
                        </div>
                        
                        <h3 className="text-[20px] font-bold text-[#1c2d5a] mb-3">Pengajuan Akun Sedang Diproses</h3>

                        <p className="text-[12.5px] text-gray-500 leading-relaxed mb-8 px-4">
                            Pendaftaran berhasil! Admin sedang memverifikasi STR Anda (maks. 1x24 jam).<br/><br/>
                            Silakan cek email Anda secara berkala untuk info persetujuan.
                        </p>

                        <button
                            onClick={() => {
                                setIsSuccessModalOpen(false);
                                router.push('/auth/login');
                            }}
                            className="w-full bg-[#0a1b3f] hover:bg-[#152a5a] text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md text-[13.5px]"
                        >
                            Kembali ke Halaman Login
                        </button>
                    </div>
                </div>
            )}

            {/* =========================================
                POPUP 3: MODAL ERROR
            ========================================= */}
            {isErrorModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[20px] p-8 md:p-10 w-full max-w-[400px] shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-200">
                        
                        <button 
                            type="button"
                            onClick={() => setIsErrorModalOpen(false)} 
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 17h.01" />
                            </svg>
                        </div>

                        <h3 className="text-[18px] font-bold text-[#1c2d5a] mb-3">Form Belum Lengkap</h3>
                        <p className="text-[13px] text-gray-500 leading-relaxed mb-8">
                            Mohon isi form (Nama Lengkap, Email, Kata Sandi, dan Konfirmasinya) dengan format yang sesuai terlebih dahulu sebelum mengajukan diri sebagai Reviewer.
                        </p>

                        <button
                            onClick={() => setIsErrorModalOpen(false)}
                            className="w-full bg-[#0a1b3f] hover:bg-[#152a5a] text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md text-[13.5px]"
                        >
                            Oke, Mengerti
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}