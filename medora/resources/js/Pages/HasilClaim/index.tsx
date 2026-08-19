import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// ENDPOINT:
// GET /api/claims/{claim}  (hasil/detail claim)
export default function HasilClaim() {
    return (
        <AuthenticatedLayout>
            <Head title="Hasil Klaim" />
        </AuthenticatedLayout>
    );
}