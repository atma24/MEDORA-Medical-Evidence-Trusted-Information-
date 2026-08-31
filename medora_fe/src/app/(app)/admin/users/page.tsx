'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { q: q || undefined, role: role || undefined, status: status || undefined, page: p, per_page: 15 } });
      setUsers(res.data.data ?? res.data);
      setMeta(res.data.meta ?? null);
      setPage(p);
    } catch (e:any) { setMsg(e?.response?.data?.message || 'Gagal memuat pengguna'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchUsers(1); }, []);

  const handleDelete = async (id:number) => {
    if (!confirm(`Hapus pengguna #${id} permanen? Klaim miliknya ikut terhapus.`)) return;
    try { await api.delete(`/admin/users/${id}`); setMsg('Pengguna dihapus'); fetchUsers(page); }
    catch(e:any){ setMsg(e?.response?.data?.message || 'Gagal menghapus'); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#253E6B]">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-500">Kelola role, status, dan hapus pengguna (hard-delete).</p>
        </div>
        <Link href="/admin/reviewers" className="text-sm font-bold text-blue-700 hover:underline">Persetujuan Reviewer ›</Link>
      </div>

      {msg && <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-xl">{msg}</div>}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama/email..." className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3A8A]" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Semua Role</option><option value="USER">USER</option><option value="REVIEWER">REVIEWER</option><option value="ADMIN">ADMIN</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Semua Status</option><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option>
        </select>
        <button onClick={()=>fetchUsers(1)} className="px-5 py-2 bg-[#0A1B3F] text-white rounded-lg text-sm font-bold hover:bg-[#152a5a]">Cari</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] border-b text-xs font-bold text-slate-600">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Spesialisasi</th><th className="px-4 py-3 text-center">Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="py-10 text-center text-gray-400">Memuat...</td></tr> : users.length===0 ? <tr><td colSpan={7} className="py-10 text-center text-gray-400">Tidak ada data</td></tr> : users.map((u:any)=>(
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">#{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${u.role==='ADMIN'?'bg-purple-50 text-purple-700 border-purple-200':u.role==='REVIEWER'?'bg-blue-50 text-blue-700 border-blue-200':'bg-gray-50 text-gray-700 border-gray-200'}`}>{u.role}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status==='PENDING'?'bg-amber-100 text-amber-700':u.status==='APPROVED'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-xs">{u.speciality?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-center flex gap-1 justify-center">
                    <Link href={`/admin/users/${u.id}`} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50">Kelola</Link>
                    <button onClick={()=>handleDelete(u.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="flex justify-between items-center p-4 border-t bg-[#F8FAFC] text-xs">
            <span className="text-gray-500">Hal {meta.current_page} dari {meta.last_page} • {meta.total} data</span>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={()=>fetchUsers(page-1)} className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-40">Prev</button>
              <button disabled={meta.current_page>=meta.last_page} onClick={()=>fetchUsers(page+1)} className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
