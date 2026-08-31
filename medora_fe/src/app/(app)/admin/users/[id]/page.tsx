'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function AdminUserDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [specialities, setSpecialities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get(`/admin/users/${id}`);
        const userData = userRes.data.data ?? userRes.data;
        setUser(userData);
        setForm({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'USER',
          status: userData.status || 'PENDING',
          speciality_id: userData.speciality_id ?? userData.speciality?.id ?? '',
          str_number: userData.str_number ?? '',
        });
      } catch (e: any) {
        setMsg(e?.response?.data?.message || 'Gagal memuat data pengguna');
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
      try {
        const specRes = await api.get('/admin/specialities');
        setSpecialities(specRes.data.data ?? specRes.data);
      } catch {
        try {
          const specResAlt = await api.get('/specialities');
          setSpecialities(specResAlt.data.data ?? specResAlt.data);
        } catch { setSpecialities([]); }
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      // FE only: hanya kirim status (admin cuma bisa approve/reject)
      const payload: any = { status: form.status };
      const res = await api.put(`/admin/users/${id}`, payload);
      const updated = res.data.user ?? res.data.data ?? res.data;
      setUser(updated); setIsSuccess(true); setMsg('Status pengguna berhasil diperbarui.');
    } catch (e: any) {
      setIsSuccess(false);
      setMsg(e?.response?.data?.message || (typeof e?.response?.data?.errors === 'object' ? Object.values(e.response.data.errors).flat().join(', ') : 'Gagal menyimpan perubahan.'));
    } finally { setSaving(false); }
  };

  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    try { await api.delete(`/admin/users/${id}`); router.push('/admin/users'); }
    catch (e: any) { setIsSuccess(false); setMsg(e?.response?.data?.message || 'Gagal menghapus pengguna.'); setShowDeleteModal(false); }
    finally { setIsDeleting(false); }
  };

  if (loading) return <div className="max-w-3xl mx-auto py-16 text-center text-slate-400 font-medium">Memuat detail pengguna...</div>;
  if (!user) return <div className="max-w-3xl mx-auto py-12 text-center"><p className="text-slate-600 mb-4">{msg || 'Pengguna tidak ditemukan.'}</p><Link href="/admin/users" className="text-xs font-bold text-[#1E3A8A] hover:underline">← Kembali ke Daftar Pengguna</Link></div>;

  return (
    <div className="max-w-3xl mx-auto py-2">
      <div className="mb-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0F172A] transition mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Manajemen Pengguna
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">Kelola Pengguna #{user.id}</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">{user.email} • <span className="font-semibold text-slate-700">{user.claims_count ?? 0} Klaim</span> terkait</p>
          </div>
        </div>
      </div>
      {msg && <div className={`mb-5 p-4 rounded-xl text-xs md:text-sm font-medium flex items-center justify-between shadow-sm border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}><span>{msg}</span><button onClick={() => setMsg('')} className="font-bold opacity-60 hover:opacity-100">✕</button></div>}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Admin hanya dapat mengubah <b>Status</b> (Approve/Reject). Data lain terkunci.</span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div><label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label><input type="text" value={form.name} disabled title="Hanya status yang dapat diubah admin" className="w-full px-4 py-2.5 bg-gray-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed" required /></div>
          <div><label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Alamat Email</label><input type="email" value={form.email} disabled title="Hanya status yang dapat diubah admin" className="w-full px-4 py-2.5 bg-gray-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed" required /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Role Akses</label><select value={form.role} disabled title="Hanya status yang dapat diubah admin" className="w-full px-3.5 py-2.5 bg-gray-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"><option value="USER">USER</option><option value="REVIEWER">REVIEWER</option><option value="ADMIN">ADMIN</option></select></div>
            <div><label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Status Akun</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition shadow-sm"><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option></select></div>
          </div>
          <div><label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Spesialisasi Medis (Jika Reviewer)</label><select value={form.speciality_id} disabled title="Hanya status yang dapat diubah admin" className="w-full px-3.5 py-2.5 bg-gray-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"><option value="">— Tidak Ada —</option>{specialities.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}</select></div>
          <div><label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Nomor Surat Tanda Registrasi (STR)</label><input type="text" value={form.str_number} disabled title="Hanya status yang dapat diubah admin" placeholder="Masukkan No. STR dokter..." className="w-full px-4 py-2.5 bg-gray-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed" /></div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
            <button type="submit" disabled={saving || form.status === user.status} className="w-full sm:flex-1 py-2.5 px-5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Memproses...' : 'Simpan Status'}</button>
            <button type="button" onClick={() => setShowDeleteModal(true)} className="w-full sm:w-auto py-2.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 font-bold rounded-xl text-xs transition">Hapus Permanen</button>
          </div>
        </form>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => { if (!isDeleting) setShowDeleteModal(false); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 md:p-8 text-center z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2">Hapus Pengguna?</h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6">Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">{user.name}</span> secara permanen? Seluruh riwayat klaim terkait pengguna ini akan ikut terhapus.</p>
            <div className="flex items-center gap-3">
              <button type="button" disabled={isDeleting} onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition disabled:opacity-50">Batal</button>
              <button type="button" disabled={isDeleting} onClick={handleExecuteDelete} className="flex-1 py-2.5 px-4 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50">{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
