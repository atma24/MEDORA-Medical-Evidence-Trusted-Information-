'use client';

import React, { useEffect, useState } from 'react';
import ReviewerDashboard from './reviewerdashboard';
import UserDashboard from './userdashboard';

export default function DashboardSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil role dari localStorage yang disimpan saat login
    const savedRole = localStorage.getItem('medora_role') || sessionStorage.getItem('medora_role');
    setRole(savedRole);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-medium">Memuat Dashboard...</div>;
  }

  // Render halaman sesuai Role
  if (role === 'reviewer') {
    return <ReviewerDashboard />;
  }

  // Jika bukan reviewer (user awam), tampilkan ini
  return <UserDashboard />;
}