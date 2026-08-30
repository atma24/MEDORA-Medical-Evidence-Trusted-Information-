'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  IconTervalidasiStatus, IconKeliruStatus, IconTinjauanStatus 
} from '@/components/Icons';

export default function DetailKlaimPage() {
  const params = useParams();
  const id = params.id; // Mendapatkan id dinamis dari URL [id]

  const [claim, setClaim] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchDetailClaim = async () => {
      try {
        // Memanggil endpoint GET /claims/{claim} dari ClaimController@show
        const response = await api.get(`/claims/${id}`);
        setClaim(response.data);
      } catch (error) {
        console.error("Gagal memuat detail klaim:", error);
        setErrorMsg("Gagal memuat detail klaim atau data tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailClaim();
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Memuat detail klaim dari database...</div>;
  }

  if (errorMsg || !claim) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
          <p className="font-bold mb-2">Terjadi Kesalahan</p>
          <p className="text-sm mb-4">{errorMsg || "Klaim tidak ditemukan."}</p>
          <Link href="/riwayat-klaim" className="text-xs font-bold underline">Kembali ke Riwayat Klaim</Link>
        </div>
      </div>
    );
  }

  // --- LOGIKA MENENTUKAN STATUS & TAMPILAN DARI BACKEND ---
  const isReviewed = claim.status === 'REVIEWED';
  const verdict = claim.review_verdict; // 'FACT' atau 'HOAX'

  // Badge Status
  const renderBadge = () => {
    if (isReviewed && verdict === 'FACT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200 shadow-sm">
          <IconTervalidasiStatus className="w-4 h-4" /> Tervalidasi
        </span>
      );
    } else if (isReviewed && verdict === 'HOAX') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold border border-red-200 shadow-sm">
          <IconKeliruStatus className="w-4 h-4" /> Keliru
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-200 shadow-sm">
          <IconTinjauanStatus className="w-4 h-4" /> Menunggu Tinjauan
        </span>
      );
    }
  };

  // Konfigurasi Alert Berdasarkan Status
  const getAlertConfig = () => {
    if (isReviewed && verdict === 'FACT') {
      return {
        title: 'TERVALIDASI SEPENUHNYA',
        desc: 'Klaim ini telah ditinjau dan divalidasi oleh pakar medis berdasarkan bukti literatur klinis yang valid.',
        bg: 'bg-[#ecfdf5]', border: 'border-[#a7f3d0]', iconBg: 'bg-emerald-500', textTitle: 'text-emerald-800', textDesc: 'text-emerald-700',
        iconType: 'fact'
      };
    } else if (isReviewed && verdict === 'HOAX') {
      return {
        title: 'KELIRU (DISINFORMASI MEDIS)',
        desc: 'Klaim ini dinilai keliru atau tidak terbukti secara medis oleh tim pakar kami.',
        bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-500', textTitle: 'text-red-800', textDesc: 'text-red-700',
        iconType: 'hoax'
      };
    } else {
      return {
        title: 'MENUNGGU TINJAUAN PAKAR',
        desc: 'Klaim Anda sedang dalam antrean atau proses analisis sistem dan memerlukan verifikasi manual dari dokter spesialis.',
        bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500', textTitle: 'text-amber-800', textDesc: 'text-amber-700',
        iconType: 'pending'
      };
    }
  };

  const alertCfg = getAlertConfig();

  // Format Tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto py-2">
      
      <Link 
        href="/riwayat-klaim" 
        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#253E6B] transition mb-6"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Riwayat Klaim
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#253E6B] mb-2 tracking-tight">Detail Hasil Klaim</h1>
          <div className="flex items-center text-[13.5px] text-gray-500 font-medium tracking-wide">
            <span>ID Klaim #CLM-{claim.id}</span>
            <span className="mx-2.5">•</span>
            <span>Diajukan pada {formatDate(claim.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-[#253E6B] rounded-lg text-[13px] font-bold hover:bg-gray-50 transition flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            Simpan Artikel
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-[#253E6B] rounded-lg text-[13px] font-bold hover:bg-gray-50 transition flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Unduh PDF
          </button>
          <button className="px-5 py-2 bg-[#0A1B3F] border border-[#0A1B3F] text-white rounded-lg text-[13px] font-bold hover:bg-[#152a5a] transition flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Bagikan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KONTEN KIRI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Kotak Topik & Detail Klaim */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">TOPIK / KLAIM DIAJUKAN</p>
              {renderBadge()}
            </div>
            <h2 className="text-[20px] font-bold text-slate-800 mb-3 leading-relaxed">
              {claim.text}
            </h2>
            {claim.detail && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">DETAIL TAMBAHAN</p>
                <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line">{claim.detail}</p>
              </div>
            )}
          </div>

          {/* Kotak Alert Hasil */}
          <div className={`${alertCfg.bg} rounded-xl border ${alertCfg.border} p-6 flex items-start space-x-4 shadow-sm`}>
            <div className="mt-1 shrink-0">
              <div className={`w-6 h-6 ${alertCfg.iconBg} rounded-full flex items-center justify-center text-white shadow-sm`}>
                {alertCfg.iconType === 'pending' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : alertCfg.iconType === 'hoax' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
            </div>
            <div>
              <h3 className={`text-[15px] font-extrabold ${alertCfg.textTitle} mb-2 uppercase tracking-wide`}>{alertCfg.title}</h3>
              <p className={`text-[14px] ${alertCfg.textDesc} leading-relaxed font-medium`}>
                {alertCfg.desc}
              </p>
            </div>
          </div>

          {/* Penjelasan Pakar (Review Note) jika sudah direview */}
          {isReviewed && claim.review_note && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 pb-5 border-b border-gray-100">
                <svg className="w-5 h-5 text-[#253E6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <h3 className="text-[18px] font-bold text-[#253E6B]">Penjelasan Lengkap Pakar Medis</h3>
              </div>
              <div className="text-[14.5px] text-slate-600 leading-loose whitespace-pre-line">
                {claim.review_note}
              </div>
            </div>
          )}
        </div>

        {/* KONTEN KANAN (Reviewer & Bukti/Evidence dari Database) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Info Reviewer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">DIVALIDASI OLEH</p>
            <div className="flex items-start space-x-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center font-bold text-[#253E6B]">
                {claim.reviewer ? claim.reviewer.name.charAt(0) : 'M'}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#0A1B3F] mb-1">
                  {claim.reviewer ? claim.reviewer.name : 'Menunggu Penugasan'}
                </h4>
                <p className="text-[12px] text-gray-500 mb-2">
                  {claim.reviewer?.speciality ? claim.reviewer.speciality.name : 'Tim Pakar Medis Medora'}
                </p>
                {isReviewed && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10.5px] font-bold border border-emerald-100">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Verified Reviewer
                  </span>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[12px] text-gray-500 font-medium">Status Review: <span className="text-slate-800 font-bold ml-1">{claim.status}</span></p>
            </div>
          </div>

          {/* Bukti Jurnal Ilmiah (Evidences dari relasi claimEvidences) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">REFERENSI & BUKTI JURNAL</p>
            <div className="space-y-4">
              {!claim.claim_evidences || claim.claim_evidences.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada referensi jurnal terkait atau sistem sedang menganalisis.</p>
              ) : (
                claim.claim_evidences.map((ce: any, idx: number) => (
                  <div key={idx} className={`flex items-start space-x-3 ${idx !== 0 ? 'pt-4 border-t border-gray-100' : ''}`}>
                    <svg className="w-5 h-5 text-[#253E6B] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <div>
                      <h5 className="text-[12.5px] font-bold text-[#0A1B3F] mb-1.5 leading-snug">
                        {ce.evidence?.title || 'Jurnal Medis Terkait'}
                      </h5>
                      <p className="text-[11.5px] text-gray-500 leading-relaxed line-clamp-2">
                        {ce.evidence?.abstract || ce.relationship}
                      </p>
                      {ce.evidence?.url && (
                        <a href={ce.evidence.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline mt-1 inline-block">
                          Lihat Sumber ›
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}