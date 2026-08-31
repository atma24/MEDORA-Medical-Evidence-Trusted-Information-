'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ReviewerDashboard from './reviewerdashboard';
import UserDashboard from './userdashboard';
const AdminDashboard = dynamic(() => import('./admindashboard'), { ssr: false });

export default function DashboardSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Robust role detection: prioritaskan storage yang punya token aktif, fallback ke medora_user
    const tokenLocal = localStorage.getItem('medora_token');
    const tokenSession = sessionStorage.getItem('medora_token');
    const roleLocal = localStorage.getItem('medora_role');
    const roleSession = sessionStorage.getItem('medora_role');
    let savedRole: string | null = null;
    if (tokenLocal && roleLocal) savedRole = roleLocal;
    else if (tokenSession && roleSession) savedRole = roleSession;
    else if (roleLocal) savedRole = roleLocal;
    else if (roleSession) savedRole = roleSession;

    if (!savedRole) {
      const userStr = localStorage.getItem('medora_user') || sessionStorage.getItem('medora_user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          savedRole = userData?.role ?? null;
        } catch { /* ignore */ }
      }
    }
    // Normalisasi: enum di BE uppercase, tapi FE simpan bisa lowercase
    if (savedRole) savedRole = savedRole.toUpperCase();
    setRole(savedRole);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-medium">Memuat Dashboard...</div>;
  }

  if (role?.toUpperCase() === 'ADMIN') {
    return <AdminDashboard />;
  }
  if (role?.toUpperCase() === 'REVIEWER') {
    return <ReviewerDashboard />;
  }
  return <UserDashboard />;
}