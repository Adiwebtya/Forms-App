'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface FormField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
}

interface FormSchema {
    title: string;
    description: string;
    fields: FormField[];
}

export default function PublicFormPage() {
    const params = useParams();
    const id = params?.id as string;
    const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await axios.post('http://localhost:5000/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setValue(fieldName, res.data.url);
            } catch (err) {
                alert('Upload failed');
            }
        }
    };

    useEffect(() => {
        if (id) {
            fetchForm();
        }
    }, [id]);

    const fetchForm = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
            setFormSchema(res.data.content);
        } catch (err) {
            setError('Failed to load form. It may not exist.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await axios.post(`http://localhost:5000/api/forms/${id}/submit`, data);
            setSubmitted(true);
        } catch (err) {
            alert('Failed to submit form');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading form...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
                <p>Your response has been recorded.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{formSchema?.title}</h1>
                <p className="text-gray-600 mb-8">{formSchema?.description}</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {formSchema?.fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {field.type === 'textarea' ? (
                                <textarea
                                    {...register(field.name, { required: field.required })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    {...register(field.name, { required: field.required })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                    ))}

                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Submit Response
                                    </button>
                                </form>
            </div>
        </div>
            );
}
