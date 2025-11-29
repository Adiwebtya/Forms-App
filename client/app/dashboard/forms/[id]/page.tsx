'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Submission {
    _id: string;
    content: any;
    submittedAt: string;
}

interface Form {
    _id: string;
    title: string;
    content: {
        description: string;
        fields: any[];
    };
}

export default function FormDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [form, setForm] = useState<Form | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
        } else if (id) {
            fetchData();
        }
    }, [id, router]);

    const fetchData = async () => {
        try {
            const [formRes, subRes] = await Promise.all([
                api.get(`/forms/${id}`),
                api.get(`/forms/${id}/submissions`)
            ]);
            setForm(formRes.data);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!form) return <div className="p-8 text-center text-red-500">Form not found</div>;

    const publicLink = `http://localhost:3000/form/${form._id}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button onClick={() => router.push('/dashboard')} className="mr-4 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">{form.title}</h1>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Info Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <p className="text-gray-600 mb-4">{form.content.description}</p>
                    <div className="flex items-center text-sm text-blue-600">
                        <span className="font-medium mr-2">Public Link:</span>
                        <a href={publicLink} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                            {publicLink}
                            <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Submissions ({submissions.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((sub) => (
                                    <tr key={sub._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sub.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="grid grid-cols-1 gap-2">
                                                {Object.entries(sub.content).map(([key, value]) => (
                                                    <div key={key} className="flex flex-col">
                                                        <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                                        {typeof value === 'string' && value.startsWith('http') && value.includes('cloudinary') ? (
                                                            <img src={value} alt="Uploaded content" className="mt-1 h-24 w-auto object-cover rounded border" />
                                                        ) : (
                                                            <span className="text-gray-600">{String(value)}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                            No submissions yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
