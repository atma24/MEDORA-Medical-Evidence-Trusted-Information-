import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// ENDPOINT:
// GET /api/claims  (history claims user)
export default function History() {
    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Klaim" />
        </AuthenticatedLayout>
    );
}