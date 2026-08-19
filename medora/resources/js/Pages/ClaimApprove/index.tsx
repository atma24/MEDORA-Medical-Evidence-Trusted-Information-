import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// ENDPOINT:
// GET  /api/claims/review-queue     (list claims siap direview)
// POST /api/claims/{claim}/review   (approve/reject claim reviewer)
export default function ClaimApprove() {
    return (
        <AuthenticatedLayout>
            <Head title="Approval Klaim" />
        </AuthenticatedLayout>
    );
}