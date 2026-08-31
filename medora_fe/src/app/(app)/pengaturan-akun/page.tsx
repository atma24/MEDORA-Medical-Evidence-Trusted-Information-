'use client';

import React, { useEffect, useState } from 'react';
// Import disesuaikan dengan nama file kamu yang huruf kecil semua
import ReviewerSetting from './reviewersetting';
import UserSetting from './usersetting';

export default function PengaturanAkunSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil role dari storage yang disimpan saat login
    const savedRole = localStorage.getItem('medora_role') || sessionStorage.getItem('medora_role');
    setRole(savedRole);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-medium">Memuat Pengaturan...</div>;
  }

  // Render halaman sesuai Role — tabel users yang sama dipakai untuk semua role (USER/REVIEWER/ADMIN)
  if (role === 'REVIEWER') {
    return <ReviewerSetting />;
  }

  // ADMIN dan USER sama-sama pakai UserSetting (kolom phone/bio/institution sudah ada di tabel users)
  // UserSetting akan deteksi role dari localStorage untuk label badge Administrator vs Pengguna Umum
  return <UserSetting />;
}