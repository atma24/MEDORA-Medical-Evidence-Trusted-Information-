'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

// Komponen Toggle/Switch (Reusable & Interaktif)
const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
  <label className={`relative inline-flex items-center shrink-0 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#253E6B]"></div>
  </label>
);

// Komponen Ikon Mata (Show/Hide Password)
const EyeIcon = ({ isOpen }: { isOpen: boolean }) => (
  isOpen ? (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
  ) : (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
  )
);

export default function UserPengaturanAkunPage() {
  const [activeTab, setActiveTab] = useState('pribadi');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Perubahan Anda telah diperbarui.');
  const [errorMsg, setErrorMsg] = useState('');

  // Status Loading & Saving
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States Keamanan (Mata & 2FA)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // States Toggle Notifikasi (Interaktif)
  const [notifKlaim, setNotifKlaim] = useState(true);
  const [notifUpdate, setNotifUpdate] = useState(true);
  const [notifPesan, setNotifPesan] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // State Form Pribadi (User Umum)
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    bio: '',
  });

  // Fetch Data User dari Backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/me'); // PERUBAHAN: '/user' menjadi '/me'
        const user = response.data;
        
        setFormData({
          nama: user.name || '',
          email: user.email || '',
          telepon: user.phone || '',
          bio: user.bio || '',
        });
      } catch (error) {
        console.error("Gagal mengambil profil user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const triggerSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Handler Simpan Data Pribadi
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      await api.put('/profile', { // PERUBAHAN: '/user/profile' menjadi '/profile'
        name: formData.nama,
        email: formData.email,
        phone: formData.telepon,
        bio: formData.bio
      });

      triggerSuccessToast('Data pribadi berhasil diperbarui!');
      
      // Update session/local storage agar nama di navbar langsung ikut ter-update
      const savedUser = JSON.parse(localStorage.getItem('medora_user') || '{}');
      localStorage.setItem('medora_user', JSON.stringify({ ...savedUser, name: formData.nama }));

    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        setErrorMsg(firstError[0]);
      } else {
        setErrorMsg(error.response?.data?.message || 'Gagal menyimpan perubahan.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Ubah Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      await api.put('/password', { // PERUBAHAN: '/user/password' menjadi '/password'
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      triggerSuccessToast('Kata sandi berhasil diperbarui!');
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

  // Handler Simpan Notifikasi
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerSuccessToast('Preferensi notifikasi berhasil disimpan!');
    }, 600);
  };

  // Role untuk label (pakai tabel users yang sama — ADMIN juga pakai endpoint /profile yang sama)
  const [roleLabel, setRoleLabel] = useState('Pengguna Umum');
  useEffect(() => {
    const r = (localStorage.getItem('medora_role') || sessionStorage.getItem('medora_role') || 'USER').toUpperCase();
    if (r === 'ADMIN') setRoleLabel('Administrator');
    else if (r === 'REVIEWER') setRoleLabel('Reviewer');
    else setRoleLabel('Pengguna Umum');
  }, []);
  // Inisial untuk Avatar Visual
  const initial = formData.nama ? formData.nama.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-5xl mx-auto py-2 relative">
      
      {/* Toast Notifikasi Sukses Modern */}
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
        <p className="text-gray-500 text-[15px]">Kelola informasi pribadi dan preferensi keamanan Anda.</p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8">
        {['pribadi', 'keamanan', 'notifikasi'].map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setErrorMsg(''); }} className={`pb-4 text-[14.5px] font-bold transition relative capitalize ${activeTab === tab ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-slate-800'}`}>
            {tab === 'pribadi' ? 'Informasi Pribadi' : tab === 'keamanan' ? 'Keamanan & Password' : 'Notifikasi'}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#1E3A8A] rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {/* Alert Error */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* KOLOM KIRI (Profil Info) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col items-center text-center sticky top-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[40px] font-extrabold shadow-sm border-4 border-[#EEF2FF]">
                {initial}
              </div>
            </div>
            <h3 className="text-[20px] font-extrabold text-slate-800 mb-2">
              {isLoading ? 'Memuat...' : formData.nama}
            </h3>
            <span className="inline-flex px-4 py-1.5 bg-[#EEF2FF] text-[#1E3A8A] rounded-full text-[12px] font-bold mb-5">{roleLabel}</span>
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
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Nama Lengkap</label>
                    <input type="text" disabled={isLoading || isSaving} value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none transition disabled:opacity-60" required />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Alamat Email</label>
                    <input type="email" disabled={isLoading || isSaving} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none transition disabled:opacity-60" required />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Nomor Telepon</label>
                    <input type="text" disabled={isLoading || isSaving} value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none transition disabled:opacity-60" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Pekerjaan / Bio Singkat</label>
                    <input type="text" disabled={isLoading || isSaving} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-slate-800 focus:bg-white focus:border-[#253E6B] outline-none transition disabled:opacity-60" />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving || isLoading} className="px-6 py-2.5 bg-[#0A1B3F] text-white rounded-lg text-[13px] font-bold hover:bg-[#152a5a] shadow-sm disabled:opacity-60">
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
                      <p className="text-[12px] text-gray-500 mt-1">Tingkatkan keamanan akun dengan verifikasi dua langkah.</p>
                    </div>
                    <ToggleSwitch checked={is2FAEnabled} disabled={isSaving} onChange={() => setIs2FAEnabled(!is2FAEnabled)} />
                  </div>
                  
                  {is2FAEnabled && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[13px] font-bold text-slate-700">Pilih Metode 2FA:</p>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="radio" name="2fa_method" defaultChecked className="w-4 h-4 text-[#1E3A8A] border-gray-300 focus:ring-[#1E3A8A]" />
                        <span className="text-[13.5px] text-slate-700 font-medium group-hover:text-[#1E3A8A]">Kirim kode OTP via SMS ke {formData.telepon || 'Nomor HP'}</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="radio" name="2fa_method" className="w-4 h-4 text-[#1E3A8A] border-gray-300 focus:ring-[#1E3A8A]" />
                        <span className="text-[13.5px] text-slate-700 font-medium group-hover:text-[#1E3A8A]">Aplikasi Authenticator (Google Auth / Authy)</span>
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
                        <p className="text-[14px] font-medium text-slate-700">Pemberitahuan Klaim Selesai</p>
                        <ToggleSwitch disabled={isSaving} checked={notifKlaim} onChange={() => setNotifKlaim(!notifKlaim)} />
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Update Status Klaim</p>
                        <ToggleSwitch disabled={isSaving} checked={notifUpdate} onChange={() => setNotifUpdate(!notifUpdate)} />
                      </div>
                    </div>
                  </div>

                  {/* Bagian Notifikasi Aplikasi */}
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-800 mb-4 uppercase tracking-wider">NOTIFIKASI APLIKASI</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Notifikasi Pesan & Balasan</p>
                        <ToggleSwitch disabled={isSaving} checked={notifPesan} onChange={() => setNotifPesan(!notifPesan)} />
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <p className="text-[14px] font-medium text-slate-700">Promo & Artikel Kesehatan Baru</p>
                        <ToggleSwitch disabled={isSaving} checked={notifPromo} onChange={() => setNotifPromo(!notifPromo)} />
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