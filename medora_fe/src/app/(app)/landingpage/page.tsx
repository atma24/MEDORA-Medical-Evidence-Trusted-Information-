"use client";
import React, { useState, useEffect } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 90;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`min-h-screen bg-white text-slate-800 ${plusJakarta.className}`}>
            
            {/* =========================================
                NAVBAR (Ditambah menu Artikel Medis)
            ========================================= */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                    <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className="flex items-center gap-2 cursor-pointer">
                        <img src="/images/logobiru.png" alt="Medora Logo" className="h-8 md:h-9 w-auto" />
                    </a>

                    <div className="hidden lg:flex items-center gap-8 text-[14px] font-bold text-[#1c2d5a] tracking-wide">
                        <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className="hover:text-[#4285F4] transition cursor-pointer">Tentang Kami</a>
                        <a href="#cara-kerja" onClick={(e) => scrollToSection(e, 'cara-kerja')} className="hover:text-[#4285F4] transition cursor-pointer">Cara Kerja</a>
                        <a href="#populer" onClick={(e) => scrollToSection(e, 'populer')} className="hover:text-[#4285F4] transition cursor-pointer">Klaim Terpopuler</a>
                        <a href="#artikel" onClick={(e) => scrollToSection(e, 'artikel')} className="hover:text-[#4285F4] transition cursor-pointer">Artikel Medis</a>
                        <a href="#mitra" onClick={(e) => scrollToSection(e, 'mitra')} className="hover:text-[#4285F4] transition cursor-pointer">Mitra Ahli</a>
                    </div>

                    <div className="hidden md:flex items-center gap-5 tracking-wide">
                        <Link href="/auth/login" className="text-[14px] font-bold text-[#1c2d5a] hover:text-[#4285F4] transition">
                            Masuk
                        </Link>
                        <Link href="/auth/register" className="text-[14px] font-bold text-[#0a1b3f] border-2 border-[#0a1b3f] px-7 py-2.5 rounded-full hover:bg-[#0a1b3f] hover:text-white transition-all duration-300">
                            Daftar
                        </Link>
                    </div>
                </div>
            </nav>

            {/* =========================================
                HERO SECTION
            ========================================= */}
            <section id="tentang" className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-[#f4f7ff] flex items-center justify-center">
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-sky-300/15 rounded-full blur-[150px]"></div>
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 w-full">
                    <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] py-14 px-8 md:px-16 text-center">
                        <div className="inline-block bg-blue-50 text-[#1c2d5a] font-bold px-4 py-1.5 rounded-full text-[11.5px] uppercase tracking-widest mb-6">
                            Platform Pendeteksi Misinformasi Kesehatan
                        </div>
                        <h1 className="text-[32px] md:text-[44px] lg:text-[50px] font-extrabold text-[#0a1b3f] leading-[1.2] mb-6 tracking-tight">
                            Buktikan Kebenaran Klaim<br className="hidden md:block" /> Kesehatan dengan Cepat
                        </h1>
                        <p className="text-[15px] md:text-[17px] text-gray-600 mb-10 max-w-[720px] mx-auto leading-relaxed tracking-wide">
                            Lawan misinformasi dengan bukti nyata. Ketik klaim medis yang ingin Anda cek, dan biarkan algoritma kami mencocokkannya langsung dengan basis data publikasi klinis dan jurnal kesehatan global.
                        </p>

                        <div className="relative max-w-2xl mx-auto group mb-8">
                            <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60"></div>
                            <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl p-2.5 shadow-md">
                                <div className="pl-4 text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input type="text" placeholder="Ketik klaim kesehatan disini..." className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-[15px] text-gray-700 outline-none tracking-wide" />
                                <button className="bg-[#0a1b3f] hover:bg-[#152a5a] text-white px-9 py-3.5 rounded-xl text-[14.5px] font-bold tracking-wide transition-all duration-200 shadow-md">
                                    Verifikasi
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-[13px] text-gray-500 font-medium tracking-wide">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Divalidasi 10k+ Tenaga Ahli
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Didukung Teknologi AI
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
                CARA KERJA SECTION
            ========================================= */}
            <section id="cara-kerja" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-[32px] md:text-[36px] font-extrabold text-[#0a1b3f] mb-5 tracking-tight">Cara Kerja Sistem Medora</h2>
                    <p className="text-[16px] text-gray-600 mb-16 tracking-wide">
                        Mewujudkan visi <span className="font-bold text-[#1c2d5a]">"From Claims to Evidence"</span> lewat 3 tahapan sederhana.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-white border border-gray-100 p-10 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-[#1c2d5a] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-[19px] font-bold text-[#0a1b3f] mb-4 tracking-wide">1. Masukkan Klaim Medis</h3>
                            <p className="text-[14.5px] text-gray-500 leading-relaxed tracking-wide">Ketik atau salin informasi kesehatan yang ingin Anda periksa ke dalam kolom pencarian.</p>
                        </div>
                        <div className="bg-white border border-gray-100 p-10 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-[#1c2d5a] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-[19px] font-bold text-[#0a1b3f] mb-4 tracking-wide">2. Analisis Machine Learning</h3>
                            <p className="text-[14.5px] text-gray-500 leading-relaxed tracking-wide">Model ML kami bekerja menelusuri basis data publikasi kesehatan untuk menemukan bukti yang relevan secara instan.</p>
                        </div>
                        <div className="bg-white border border-gray-100 p-10 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-[#1c2d5a] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-[19px] font-bold text-[#0a1b3f] mb-4 tracking-wide">3. Dapatkan Hasil Valid</h3>
                            <p className="text-[14.5px] text-gray-500 leading-relaxed tracking-wide">Dapatkan kesimpulan berbasis bukti ilmiah yang telah divalidasi oleh ahlinya.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
                KLAIM TERPOPULER SECTION
            ========================================= */}
            <section id="populer" className="py-20 bg-[#f8faff]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <h2 className="text-[32px] font-extrabold text-[#0a1b3f] tracking-tight">Klaim Medis Terpopuler</h2>
                        <Link href="#" className="text-[14.5px] font-bold text-[#1c2d5a] hover:text-[#4285F4] flex items-center gap-2 transition tracking-wide group">
                            Lihat Semua Klaim <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* KARTU Keliru */}
                        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 border-l-[4px] border-l-red-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative cursor-pointer group">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-blue-50 text-[#1c2d5a] text-[11px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest">Nutrisi</span>
                                <span className="bg-red-50 text-red-500 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-100 tracking-wide">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Keliru
                                </span>
                            </div>
                            <h3 className="text-[20px] font-bold text-[#0a1b3f] mb-4 leading-snug tracking-wide">"Air alkali dapat menyembuhkan kanker dengan mengubah pH tubuh".</h3>
                            <p className="text-[14.5px] text-gray-500 mb-10 leading-relaxed tracking-wide">Berbagai studi onkologi mengonfirmasi bahwa asupan makanan dan minuman tidak dapat secara signifikan mengubah pH darah sistemik.</p>
                            <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                                <span className="text-[12.5px] text-gray-400 font-semibold tracking-wide">Dari 12 Sumber Primer</span>
                                <span className="text-[13.5px] font-bold text-[#1c2d5a] group-hover:text-[#4285F4] flex items-center gap-1.5 tracking-wide transition-colors">
                                    Baca Laporan <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                        </div>

                        {/* KARTU FAKTA */}
                        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 border-l-[4px] border-l-emerald-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative cursor-pointer group">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-blue-50 text-[#1c2d5a] text-[11px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest">Imunologi</span>
                                <span className="bg-emerald-50 text-emerald-600 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 tracking-wide">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Fakta
                                </span>
                            </div>
                            <h3 className="text-[20px] font-bold text-[#0a1b3f] mb-4 leading-snug tracking-wide">"Vaksin mRNA tidak mengubah susunan DNA manusia".</h3>
                            <p className="text-[14.5px] text-gray-500 mb-10 leading-relaxed tracking-wide">Data klinis ekstensif dan bukti mekanistik menunjukkan bahwa partikel mRNA tidak pernah memasuki inti sel tubuh manusia.</p>
                            <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                                <span className="text-[12.5px] text-gray-400 font-semibold tracking-wide">Dari 28 Sumber Primer</span>
                                <span className="text-[13.5px] font-bold text-[#1c2d5a] group-hover:text-[#4285F4] flex items-center gap-1.5 tracking-wide transition-colors">
                                    Baca Laporan <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
                ARTIKEL MEDIS SECTION (FITUR BARU)
            ========================================= */}
            <section id="artikel" className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <span className="text-blue-500 font-bold tracking-widest text-[12px] uppercase mb-2 block">Pusat Edukasi</span>
                            <h2 className="text-[32px] font-extrabold text-[#0a1b3f] tracking-tight">Artikel Literasi Medis</h2>
                        </div>
                        <Link href="#" className="text-[14.5px] font-bold text-[#1c2d5a] hover:text-[#4285F4] flex items-center gap-2 transition tracking-wide group">
                            Lihat Semua Artikel <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Artikel 1 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col">
                            {/* Placeholder Image (Bisa diganti foto asli nanti) */}
                            <div className="h-48 bg-[#eef2fb] relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#1c2d5a]/5 group-hover:bg-transparent transition-colors z-10"></div>
                                <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            </div>
                            <div className="p-7 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Edukasi Publik</span>
                                </div>
                                <h3 className="text-[18px] font-bold text-[#0a1b3f] mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                                    Bahaya Self-Diagnosis Melalui Gejala di Internet
                                </h3>
                                <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed flex-grow">
                                    Mendiagnosis diri sendiri bermodal artikel internet seringkali berujung pada kecemasan berlebih (cyberchondria) dan penanganan yang salah.
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-[12px] text-gray-400 font-medium">12 Mei 2026</span>
                                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Artikel 2 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col">
                            <div className="h-48 bg-[#eef2fb] relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#1c2d5a]/5 group-hover:bg-transparent transition-colors z-10"></div>
                                <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            </div>
                            <div className="p-7 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Penelitian</span>
                                </div>
                                <h3 className="text-[18px] font-bold text-[#0a1b3f] mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                                    Mitos Skincare dan Kesehatan Kulit di Media Sosial
                                </h3>
                                <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed flex-grow">
                                    Banyak beredar tips perawatan kulit yang justru merusak *skin barrier*. Ketahui fakta medis di balik tren viral yang belum terbukti klinis.
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-[12px] text-gray-400 font-medium">08 Mei 2026</span>
                                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Artikel 3 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col">
                            <div className="h-48 bg-[#eef2fb] relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#1c2d5a]/5 group-hover:bg-transparent transition-colors z-10"></div>
                                <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            </div>
                            <div className="p-7 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">Pencegahan</span>
                                </div>
                                <h3 className="text-[18px] font-bold text-[#0a1b3f] mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                                    Pentingnya Membaca Label Obat dan Interaksinya
                                </h3>
                                <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed flex-grow">
                                    Menggabungkan sembarang obat bebas dengan suplemen herbal tanpa anjuran resep dapat menimbulkan komplikasi hati yang serius.
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-[12px] text-gray-400 font-medium">02 Mei 2026</span>
                                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
                CTA REVIEWER SECTION
            ========================================= */}
            <section id="mitra" className="py-32 bg-[#f8faff]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <svg className="w-7 h-7 text-[#0a1b3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <h2 className="text-[30px] md:text-[38px] font-extrabold text-[#0a1b3f] mb-6 tracking-tight">Anda Seorang Dokter atau Tenaga Ahli Medis?</h2>
                    <p className="text-[16px] text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed tracking-wide">
                        Mari bergabung bersama 10,000+ spesialis lainnya untuk menjadi Reviewer dan bantu kami memberantas misinformasi kesehatan di Indonesia.
                    </p>
                    <Link href="/auth/register" className="inline-block bg-white border-2 border-[#0a1b3f] text-[#0a1b3f] font-bold px-10 py-4 rounded-xl hover:bg-[#0a1b3f] hover:text-white transition-all duration-300 text-[15px] tracking-wide">
                        Ajukan Akun Reviewer Sekarang
                    </Link>
                </div>
            </section>

            {/* =========================================
                FOOTER
            ========================================= */}
            <footer className="bg-[#263140] text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24">
                        <div className="lg:w-5/12 flex flex-col justify-between">
                            <div>
                                <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className="cursor-pointer inline-block mb-8">
                                    <img src="/images/logobiru.png" alt="Medora Logo" className="h-8 md:h-9 w-auto brightness-0 invert" />
                                </a>
                                <p className="text-[14px] text-gray-300 leading-loose tracking-wide max-w-sm mb-12 lg:mb-20">
                                    From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information.
                                </p>
                            </div>
                            <p className="text-[12.5px] text-gray-500 tracking-wide">
                                © 2026 MEDORA by Nexora Team. Seluruh Hak Cipta Dilindungi.
                            </p>
                        </div>

                        <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-8">
                            <div>
                                <h4 className="text-[13.5px] font-semibold tracking-widest mb-8 text-gray-100">NAVIGASI</h4>
                                <ul className="space-y-5 text-[14px] font-medium text-gray-400 tracking-wide">
                                    <li><a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className="hover:text-white transition cursor-pointer">Tentang Kami</a></li>
                                    <li><a href="#cara-kerja" onClick={(e) => scrollToSection(e, 'cara-kerja')} className="hover:text-white transition cursor-pointer">Cara Kerja</a></li>
                                    <li><a href="#populer" onClick={(e) => scrollToSection(e, 'populer')} className="hover:text-white transition cursor-pointer">Klaim Terpopuler</a></li>
                                    <li><a href="#mitra" onClick={(e) => scrollToSection(e, 'mitra')} className="hover:text-white transition cursor-pointer">Mitra Ahli</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[13.5px] font-semibold tracking-widest mb-8 text-gray-100">LEGAL</h4>
                                <ul className="space-y-5 text-[14px] font-medium text-gray-400 tracking-wide">
                                    <li><Link href="#" className="hover:text-white transition">Syarat & Ketentuan</Link></li>
                                    <li><Link href="#" className="hover:text-white transition">Kebijakan Privasi</Link></li>
                                    <li><Link href="#" className="hover:text-white transition">Panduan Komunitas</Link></li>
                                    <li><Link href="#" className="hover:text-white transition">Sanggahan Medis</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[13.5px] font-semibold tracking-widest mb-8 text-gray-100">KONTAK & KEMITRAAN</h4>
                                <ul className="space-y-5 text-[14px] font-medium text-gray-400 tracking-wide">
                                    <li className="hover:text-white transition cursor-pointer">Snowfreze@gmail.com</li>
                                    <li className="hover:text-white transition cursor-pointer">Chesyak88@gmail.com</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}