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

  // Render halaman sesuai Role
  if (role === 'reviewer') {
    return <ReviewerSetting />;
  }

  // Jika bukan reviewer (user awam), tampilkan ini
  return <UserSetting />;
}