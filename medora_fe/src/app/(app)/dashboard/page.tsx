'use client';

import React, { useEffect, useState } from 'react';
import ReviewerDashboard from './reviewerdashboard';
import UserDashboard from './userdashboard';

export default function DashboardSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil role dari localStorage/sessionStorage dengan fallback ke medora_user JSON
    let savedRole = localStorage.getItem('medora_role') || sessionStorage.getItem('medora_role');
    
    // Fallback: parse role dari medora_user jika tidak ada di storage terpisah
    if (!savedRole) {
      const userStr = localStorage.getItem('medora_user') || sessionStorage.getItem('medora_user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          savedRole = userData?.role ?? null;
        } catch { /* ignore parsing error */ }
      }
    }
    
    setRole(savedRole);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-medium">Memuat Dashboard...</div>;
  }

  // Render halaman sesuai Role (case-insensitive comparison)
  if (role?.toUpperCase() === 'REVIEWER') {
    return <ReviewerDashboard />;
  }

  // Jika bukan reviewer (user awam), tampilkan ini
  return <UserDashboard />;
}