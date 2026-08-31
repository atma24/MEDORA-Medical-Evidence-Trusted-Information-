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
    let savedRole = localStorage.getItem('medora_role') || sessionStorage.getItem('medora_role');
    if (!savedRole) {
      const userStr = localStorage.getItem('medora_user') || sessionStorage.getItem('medora_user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          savedRole = userData?.role ?? null;
        } catch { /* ignore */ }
      }
    }
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