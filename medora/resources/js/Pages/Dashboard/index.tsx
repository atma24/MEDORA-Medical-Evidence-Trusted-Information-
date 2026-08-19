import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// ENDPOINT:
// POST /api/claims  (input claims user)
export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
        </AuthenticatedLayout>
    );
}