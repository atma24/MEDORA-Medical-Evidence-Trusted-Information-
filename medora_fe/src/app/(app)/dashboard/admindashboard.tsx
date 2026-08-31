'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  IconProfil, IconTotalKlaim, IconTinjauan, IconVerifikasi 
} from '@/components/Icons';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-500">Memuat statistik admin...</div>;
  if (!stats) return <div className="text-center py-16 text-red-500">Gagal memuat stats.</div>;

  const cards = [
    { label: 'Total Pengguna', value: stats.total_users, bg: 'bg-blue-50 text-blue-600', icon: IconProfil, href: '/admin/users' },
    { label: 'Total Klaim', value: stats.total_claims, bg: 'bg-slate-50 text-slate-600', icon: IconTotalKlaim, href: '/admin/users' },
    { label: 'Pending Review', value: stats.pending_claims, bg: 'bg-[#FFFBEB] text-[#D97706]', icon: IconTinjauan, href: '/antrean-klaim' },
    { label: 'Klaim Hari Ini', value: stats.claims_today, bg: 'bg-[#E6F7F1] text-[#008053]', icon: IconVerifikasi, href: '/admin/users' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Banner Ringkas */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1E293B] mb-2">Dashboard Admin</h2>
        <p className="text-gray-500 text-sm">Kelola pengguna, tim reviewer, dan monitoring klaim harian.</p>
      </div>

      {/* Stats Cards (disesuaikan dengan desain UI yang sama) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-gray-500 max-w-[70%] leading-snug">{c.label}</p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${c.bg}`}>
                <c.icon className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{c.value}</h3>
          </Link>
        ))}
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 text-sm">Ringkasan Reviewer</h3>
            <Link href="/admin/reviewers" className="text-[13px] font-semibold text-blue-600 hover:underline">Kelola Reviewer ›</Link>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-amber-50 px-4 py-3 rounded-lg border border-amber-100">
              <span className="text-sm font-semibold text-amber-800">Menunggu Persetujuan</span>
              <span className="text-lg font-bold text-amber-700">{stats.pending_reviewers}</span>
            </div>
            <Link href="/admin/users" className="text-center px-4 py-2.5 bg-[#0B1E46] text-white rounded-md text-sm font-semibold hover:bg-[#152a5a] transition">
              Buka Manajemen Pengguna
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 text-sm mb-6">Klaim 7 Hari Terakhir</h3>
          <div className="flex items-end gap-2 h-32 flex-grow">
            {(stats.per_day?.values ?? []).map((v: number, i: number) => {
              const max = Math.max(1, ...stats.per_day.values);
              const h = Math.round((v / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-xs font-bold text-slate-600">{v}</span>
                  <div className="w-full bg-blue-50 rounded-t-lg relative" style={{ height: `${h}%`, minHeight: v ? '8px' : '2px' }}>
                    <div className="absolute bottom-0 w-full bg-[#0B1E46] rounded-t-lg" style={{ height: '100%' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{stats.per_day.labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}