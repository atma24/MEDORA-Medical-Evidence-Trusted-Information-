'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminReviewersPage() {
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviewers', { params: { status: tab, per_page: 50 } });
      setUsers(res.data.data ?? res.data);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Gagal memuat data reviewer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tab]);

  const handleExecuteAction = async () => {
    if (!selectedUser || !actionType) return;
    setIsSubmitting(true);
    try {
      await api.post(`/admin/reviewers/${selectedUser.id}/${actionType}`);
      setMsg(`Reviewer ${selectedUser.name} berhasil di-${actionType === 'approve' ? 'setujui' : 'tolak'}.`);
      setSelectedUser(null);
      setActionType(null);
      fetchUsers();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Terjadi kesalahan saat memproses aksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Menunggu Tinjauan
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Disetujui
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">Persetujuan Reviewer</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Verifikasi kelayakan STR & spesialisasi dokter calon reviewer.</p>
        </div>
        <Link 
          href="/admin/users?role=REVIEWER" 
          className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
        >
          Lihat Semua Pengguna
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Alert Banner */}
      {msg && (
        <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl text-xs md:text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-blue-500 hover:text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === t
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'PENDING' ? 'Menunggu' : t === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">ID REVIEWER</th>
                <th className="py-4 px-6">NAMA & EMAIL</th>
                <th className="py-4 px-6">NO. STR</th>
                <th className="py-4 px-6">SPESIALISASI</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Memuat data reviewer...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada permohonan reviewer dengan status <span className="font-bold">{tab}</span>.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#0F172A]">#{u.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0F172A] text-sm mb-0.5">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-slate-600">
                      {u.str_number ?? '-'}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {u.speciality?.name ?? u.speciality ?? '-'}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(u.status)}</td>
                    <td className="py-4 px-6 text-center">
                      {u.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActionType('approve');
                            }}
                            className="px-4 py-2 bg-[#0F172A] text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition shadow-sm"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActionType('reject');
                            }}
                            className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-block px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition"
                        >
                          Kelola
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Persetujuan / Penolakan (Sesuai Desain Gambar 2) */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              if (!isSubmitting) {
                setSelectedUser(null);
                setActionType(null);
              }
            }} 
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 md:p-8 text-center z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Icon Bubble */}
            <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
              actionType === 'approve' ? 'bg-emerald-100/70 text-emerald-600' : 'bg-red-100 text-red-500'
            }`}>
              {actionType === 'approve' ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </div>

            {/* Modal Title */}
            <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2">
              {actionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
            </h3>

            {/* Modal Subtitle / Description */}
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6">
              {actionType === 'approve' ? (
                <>Apakah Anda yakin ingin menyetujui akun reviewer <span className="font-bold text-slate-800">{selectedUser.name}</span>?</>
              ) : (
                <>Apakah Anda yakin ingin menolak permohonan reviewer dari <span className="font-bold text-slate-800">{selectedUser.name}</span>?</>
              )}
            </p>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecuteAction}
                className={`flex-1 py-2.5 px-4 font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
              >
                {isSubmitting ? 'Memproses...' : actionType === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}