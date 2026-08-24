"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token) {
            localStorage.setItem('medora_token', token);
            if (userStr) {
                try {
                    localStorage.setItem('medora_user', userStr);
                } catch (e) {
                    console.error("Gagal menyimpan data user Google", e);
                }
            }
            router.push('/dashboard');
        } else {
            router.push('/auth/login');
        }
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#1c2d5a] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-semibold text-sm">Memproses autentikasi Google...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Suspense fallback={
                <p className="text-gray-600 font-medium">Memuat...</p>
            }>
                <CallbackHandler />
            </Suspense>
        </div>
    );
}
