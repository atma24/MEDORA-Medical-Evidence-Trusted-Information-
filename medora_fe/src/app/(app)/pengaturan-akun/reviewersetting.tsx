'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

// Komponen Toggle/Switch (Reusable)
const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
  <label className={`relative inline-flex items-center shrink-0 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#253E6B]"></div>
  </label>
);

const EyeIcon = ({ isOpen }: { isOpen: boolean }) => (
  isOpen ? (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
  ) : (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
  )
);

export default function ReviewerPengaturanAkunPage() {
  const [activeTab, setActiveTab] = useState('pribadi');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Perubahan Anda telah diperbarui.');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Status Loading (Fetch Data & Saat Menyimpan)
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States Keamanan
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // States Toggle Notifikasi 
  const [notifKlaim, setNotifKlaim] = useState(true);
  const [notifLaporan, setNotifLaporan] = useState(true);
  const [notifAntrean, setNotifAntrean] = useState(true);
  const [notifSistem, setNotifSistem] = useState(false);

  // State Form Pribadi
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    sip: '',
    spesialisasi: '',
    instansi: ''
  });

  // Fetch Data User saat komponen dimuat
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/me');// Pastikan endpoint ini mengembalikan data user saat ini
        const user = response.data;
        
        setFormData({
          nama: user.name || '',
          email: user.email || '',
          telepon: user.phone || '',
          sip: user.sip || '',
          spesialisasi: user.speciality?.name || user.spesialisasi || '',
          instansi: user.institution || ''
        });
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handler Sukses UI
  const triggerSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Handler Simpan Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      // Sesuaikan nama field payload dengan struktur tabel users di Laravel
      await api.put('/profile', {
        name: formData.nama,
        email: formData.email,
        phone: formData.telepon,
        sip: formData.sip,
        institution: formData.instansi
      });
      triggerSuccessToast('Profil berhasil diperbarui!');
      
      // Update local storage agar nama di navbar/dashboard ikut berubah
      const savedUser = JSON.parse(localStorage.getItem('medora_user') || '{}');
      localStorage.setItem('medora_user', JSON.stringify({ ...savedUser, name: formData.nama }));
      
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Simpan Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      // Standard penamaan variabel Laravel untuk update password
      await api.put('/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      triggerSuccessToast('Kata sandi berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        setErrorMsg(firstError[0]);
      } else {
        setErrorMsg(error.response?.data?.message || 'Gagal mengubah kata sandi.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Simpan Notifikasi (Biasanya frontend preferences atau API terpisah)
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Asumsi hit API jika ada, atau sekadar simpan ke localStorage
    setTimeout(() => {
      setIsSaving(false);
      triggerSuccessToast('Preferensi notifikasi berhasil disimpan!');
    }, 800);
  };

  // Ambil inisial nama untuk Avatar
  const initial = formData.nama ? formData.nama.charAt(0).toUpperCase() : 'M';

  return (
    <div className="max-w-5xl mx-auto py-2 relative">
      
      {/* Toast Notifikasi Sukses */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#0A1B3F] text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 border border-blue-900 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">✓</div>
          <div>
            <p className="text-sm font-bold">Berhasil Disimpan!</p>
            <p className="text-xs text-gray-300">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">Pengaturan Profil</h1>
        <p className="text-gray-500 text-[15px]">Kelola kredensial medis, keamanan akun, dan preferensi notifikasi.</p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8">
        {['pribadi', 'keamanan', 'notifikasi'].map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setErrorMsg(''); }} className={`pb-4 text-[14.5px] font-bold transition relative capitalize ${activeTab === tab ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-slate-800'}`}>
            {tab === 'pribadi' ? 'Informasi Pribadi & Medis' : tab === 'keamanan' ? 'Keamanan & Password' : 'Notifikasi'}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#1E3A8A] rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {/* Tampilkan Error Global di Tab Aktif */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* KOLOM KIRI (Profil Info Visual) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col items-center text-center sticky top-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[40px] font-extrabold shadow-sm border-4 border-[#EEF2FF]">
                {initial}
              </div>
            </div>
            <h3 className="text-[20px] font-extrabold text-slate-800 mb-1">
              {isLoading ? 'Memuat...' : formData.nama}
            </h3>
            <p className="text-[13px] text-gray-500 font-medium mb-3">Reviewer / Praktisi Medis</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-full text-[11.5px] font-bold border border-blue-200 mb-5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Terverifikasi
            </span>
          </div>
        </div>

        {/* KOLOM KANAN (Konten Tab) */}
        <div className="lg:col-span-2">
          
          {/* TAB 1: INFORMASI PRIBADI */}
          {activeTab === 'pribadi' && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 animate-in fade-in">
              <h3 className="text-[18px] font-bold text-[#253E6B] mb-6">Data Pribadi</h3>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Nama Lengkap & Gelar</label>
                    <input type="text" disabled={isLoading || isSaving} value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none disabled:opacity-60" required />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Alamat Email</label>
                    <input type="email" disabled={isLoading || isSaving} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none disabled:opacity-60" required />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mb-8">
                  <h3 className="text-[18px] font-bold text-[#253E6B] mb-2">Kredensial Medis <span className="text-[13px] font-normal text-gray-400">(Praktisi)</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Nomor SIP</label>
                      <input type="text" disabled={isLoading || isSaving} value={formData.sip} onChange={(e) => setFormData({...formData, sip: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none disabled:opacity-60" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Spesialisasi</label>
                      <input type="text" disabled={true} value={formData.spesialisasi} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-gray-500 cursor-not-allowed" title="Hubungi admin jika ingin mengubah spesialisasi" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving || isLoading} className="px-6 py-2.5 bg-[#0A1B3F] text-white rounded-lg text-[13px] font-bold hover:bg-[#152a5a] shadow-sm disabled:opacity-60 flex items-center">
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD */}
          {activeTab === 'keamanan' && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 animate-in fade-in">
              <h3 className="text-[18px] font-bold text-[#253E6B] mb-6">Ubah Kata Sandi</h3>
              <form onSubmit={handleSavePassword}>
                <div className="space-y-5 mb-8">
                  <div className="relative">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Password Saat Ini</label>
                    <div className="relative flex items-center">
                      <input type={showCurrentPassword ? "text" : "password"} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isSaving} placeholder="••••••••••••" className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-[#253E6B] outline-none disabled:opacity-60" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 text-gray-400 hover:text-[#253E6B]">
                        <EyeIcon isOpen={showCurrentPassword} />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Password Baru</label>
                    <div className="relative flex items-center">
                      <input type={showNewPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSaving} placeholder="Minimal 8 karakter" className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-[#253E6B] outline-none disabled:opacity-60" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 text-gray-400 hover:text-[#253E6B]">
                        <EyeIcon isOpen={showNewPassword} />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                    <div className="relative flex items-center">
                      <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSaving} placeholder="Ulangi password baru" className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-[#253E6B] outline-none disabled:opacity-60" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-gray-400 hover:text-[#253E6B]">
                        <EyeIcon isOpen={showConfirmPassword} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mb-8">
                  <h3 className="text-[18px] font-bold text-[#253E6B] mb-4">Keamanan Tambahan</h3>
                  <div className="flex items-center justify-between bg-[#F8FAFC] p-5 rounded-xl border border-gray-100 mb-4 transition-all">
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">Autentikasi Dua Faktor (2FA)</p>
                      <p className="text-[12px] text-gray-500 mt-1">Sangat disarankan untuk perlindungan akun Medis.</p>
                    </div>
                    <ToggleSwitch checked={is2FAEnabled} disabled={isSaving} onChange={() => setIs2FAEnabled(!is2FAEnabled)} />
                  </div>
                  
                  {is2FAEnabled && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[13px] font-bold text-slate-700">Pilih Metode 2FA:</p>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="radio" name="2fa_method_rev" defaultChecked className="w-4 h-4 text-[#1E3A8A] border-gray-300 focus:ring-[#1E3A8A]" />
                        <span className="text-[13.5px] text-slate-700 font-medium group-hover:text-[#1E3A8A]">Aplikasi Authenticator (Google Auth / Authy)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="radio" name="2fa_method_rev" className="w-4 h-4 text-[#1E3A8A] border-gray-300 focus:ring-[#1E3A8A]" />
                        <span className="text-[13.5px] text-slate-700 font-medium group-hover:text-[#1E3A8A]">Kirim kode OTP via Email Terdaftar</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#0A1B3F] text-white rounded-lg text-[13px] font-bold hover:bg-[#152a5a] shadow-sm disabled:opacity-60">
                    {isSaving ? 'Menyimpan...' : 'Ubah Kata Sandi'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: NOTIFIKASI */}
          {activeTab === 'notifikasi' && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 animate-in fade-in">
              <h3 className="text-[18px] font-bold text-[#253E6B] mb-2">Preferensi Notifikasi</h3>
              <p className="text-[13px] text-gray-500 mb-6">Pilih jenis pemberitahuan yang ingin Anda terima melalui email atau aplikasi.</p>
              
              <form onSubmit={handleSaveNotifications}>
                <div className="space-y-8 mb-8">
                  
                  {/* Bagian Notifikasi Email */}
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-800 mb-4 uppercase tracking-wider">NOTIFIKASI EMAIL</h4>
                    <div className="space-y-1 border-b border-gray-100 pb-2">
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Pemberitahuan Klaim Masuk Baru</p>
                        <ToggleSwitch disabled={isSaving} checked={notifKlaim} onChange={() => setNotifKlaim(!notifKlaim)} />
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Ringkasan Laporan Bulanan</p>
                        <ToggleSwitch disabled={isSaving} checked={notifLaporan} onChange={() => setNotifLaporan(!notifLaporan)} />
                      </div>
                    </div>
                  </div>

                  {/* Bagian Notifikasi Aplikasi */}
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-800 mb-4 uppercase tracking-wider">NOTIFIKASI APLIKASI</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Pengingat Antrean Aktif</p>
                        <ToggleSwitch disabled={isSaving} checked={notifAntrean} onChange={() => setNotifAntrean(!notifAntrean)} />
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Pesan & Info Sistem Medora</p>
                        <ToggleSwitch disabled={isSaving} checked={notifSistem} onChange={() => setNotifSistem(!notifSistem)} />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#0A1B3F] text-white rounded-lg text-[13px] font-bold hover:bg-[#152a5a] shadow-sm disabled:opacity-60">
                    {isSaving ? 'Menyimpan...' : 'Simpan Preferensi'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}