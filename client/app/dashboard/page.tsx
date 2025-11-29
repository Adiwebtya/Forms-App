'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LogOut, Plus, Loader2 } from 'lucide-react';

interface Form {
    _id: string;
    title: string;
    content: {
        description: string;
    };
    createdAt: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
        } else {
            fetchForms();
        }
    }, [router]);

    const fetchForms = async () => {
        try {
            const res = await api.get('/forms');
            setForms(res.data);
        } catch (error) {
            console.error('Failed to fetch forms', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setGenerating(true);
        try {
            await api.post('/forms/generate', { prompt });
            setPrompt('');
            fetchForms();
        } catch (error) {
            alert('Failed to generate form');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">AI Form Builder</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Generator Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Form</h2>
                    <form onSubmit={handleGenerate} className="flex gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your form (e.g., 'A registration form for a coding workshop with name, email, and experience level')"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={generating}
                        />
                        <button
                            type="submit"
                            disabled={generating}
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Generate
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Forms List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {forms.map((form) => (
                            <li key={form._id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition cursor-pointer" onClick={() => router.push(`/dashboard/forms/${form._id}`)}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600 truncate">{form.title}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {form.content.description}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                Created on <time dateTime={form.createdAt}>{new Date(form.createdAt).toLocaleDateString()}</time>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {forms.length === 0 && (
                            <li className="px-4 py-8 text-center text-gray-500">
                                No forms yet. Create one above!
                            </li>
                        )}
                    </ul>
                </div>
            </main>
        </div>
    );
}
