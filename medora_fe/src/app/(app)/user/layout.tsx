'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path || pathname.includes(path);

  const getMenuClass = (path: string) => {
    const baseClass = `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition group`;
    const activeClass = `bg-[#1E3A8A] text-white shadow-sm`;
    const inactiveClass = `text-gray-600 hover:bg-gray-50 hover:text-[#1E3A8A]`;
    const collapseClass = !isSidebarOpen ? 'justify-center px-2' : '';
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass} ${collapseClass}`;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden relative">
      
      {/* ================= SIDEBAR USER ================= */}
      <aside 
        className={`bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 z-20 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div>
          <div 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`h-24 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
              isSidebarOpen ? 'justify-start pl-6' : 'justify-center px-2'
            }`}
            title="Klik logo untuk buka/tutup menu"
          >
            <img 
              src="/images/logobiru.png" 
              alt="Medora Logo" 
              className={`object-contain transition-all duration-300 ${isSidebarOpen ? 'h-10 w-auto' : 'h-7 w-auto'}`} 
            />
          </div>

          <div className="px-3 py-6">
            {isSidebarOpen && <p className="text-xs font-bold text-gray-400 mb-4 px-4 tracking-wider">MENU UTAMA</p>}
            <nav className="space-y-1.5">
              
              <Link href="/user/dashboard" className={getMenuClass('/user/dashboard')}>
                <svg className={`w-5 h-5 shrink-0 ${isActive('/user/dashboard') ? 'text-white' : 'text-[#243C62]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>

              {/* INI MENU KLAIM BARU YANG HILANG */}
              <Link href="/user/klaim-baru" className={getMenuClass('/user/klaim-baru')}>
                <svg className={`w-5 h-5 shrink-0 ${isActive('/user/klaim-baru') ? 'text-white' : 'text-[#243C62]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {isSidebarOpen && <span className="ml-3">Klaim Baru</span>}
              </Link>
              
              <Link href="/user/riwayat-klaim" className={getMenuClass('/user/riwayat-klaim')}>
                <svg className={`w-5 h-5 shrink-0 ${isActive('/user/riwayat-klaim') ? 'text-white' : 'text-[#243C62]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {isSidebarOpen && <span className="ml-3">Riwayat Klaim</span>}
              </Link>
              
            </nav>
          </div>
        </div>

        <div>
          <div className="px-3 mb-6">
            {isSidebarOpen && <p className="text-xs font-bold text-gray-400 mb-4 px-4 tracking-wider">AKUN</p>}
            <nav className="space-y-1.5">
              <Link href="/user/pengaturan-akun" className={getMenuClass('/user/pengaturan-akun')}>
                <svg className={`w-5 h-5 shrink-0 ${isActive('/user/pengaturan-akun') ? 'text-white' : 'text-[#243C62]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {isSidebarOpen && <span className="ml-3">Pengaturan</span>}
              </Link>
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition ${!isSidebarOpen && 'justify-center px-2'}`}
              >
                <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {isSidebarOpen && <span className="ml-3">Keluar</span>}
              </button>
            </nav>
          </div>

          {isSidebarOpen && (
            <div className="p-6 text-xs text-gray-400 border-t border-gray-100">
              <p>© 2026 MEDORA by Nexora Team.</p>
              <p>Seluruh Hak Cipta Dilindungi.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header / Topbar */}
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-11 pr-4 py-2.5 bg-[#F1F4F9] border border-gray-200 rounded-full text-sm focus:outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition"
            />
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-[#1E3A8A] relative transition">
              <svg className="w-6 h-6 text-[#243C62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 text-right">
              <div>
                <p className="text-sm font-bold text-gray-800">Ceca</p>
                <p className="text-xs text-gray-500">ceca@gmail.com</p>
              </div>
              <div className="w-10 h-10 bg-[#1E3A8A] text-white font-bold rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                 C
              </div>
            </div>
          </div>
        </header>

        {/* AREA DINAMIS */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>

      {/* ================= MODAL KONFIRMASI KELUAR ================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-[400px] shadow-2xl flex flex-col items-center text-center mx-4">
            <div className="w-[60px] h-[60px] bg-[#FFE5E5] text-red-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-7 h-7 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-[20px] font-extrabold text-slate-800 mb-3 tracking-tight">Konfirmasi Keluar</h3>
            <p className="text-[14.5px] text-gray-500 mb-8 px-2 leading-relaxed">Apakah Anda yakin ingin keluar dari akun MEDORA Anda?</p>
            <div className="flex w-full space-x-3">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm">Batal</button>
              <button onClick={() => { setIsLogoutModalOpen(false); router.push('/login'); }} className="flex-1 py-3 bg-[#FFE5E5] text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition shadow-sm">Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}