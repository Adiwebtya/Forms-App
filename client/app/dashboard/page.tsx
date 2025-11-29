'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-4">Welcome to your dashboard!</p>
            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    router.push('/auth/login');
                }}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Sign Out
            </button>
        </div>
    );
}
