'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams } from 'next/navigation';
import {
    Container, Paper, Typography, TextField, Button, Radio, RadioGroup,
    FormControlLabel, FormControl, FormLabel, Checkbox, Select, MenuItem,
    Box, CircularProgress, LinearProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

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
    const [uploading, setUploading] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(fieldName);
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await axios.post('https://forms-app-sbtq.onrender.com/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setValue(fieldName, res.data.url);
            } catch (err) {
                alert('Upload failed');
            } finally {
                setUploading(null);
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
            const res = await axios.get(`https://forms-app-sbtq.onrender.com/api/forms/${id}`);
            setFormSchema(res.data.content);
        } catch (err) {
            setError('Failed to load form. It may not exist.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await axios.post(`https://forms-app-sbtq.onrender.com/api/forms/${id}/submit`, data);
            setSubmitted(true);
        } catch (err) {
            alert('Failed to submit form');
        }
    };

    if (loading) return <LinearProgress sx={{ bgcolor: '#e1bee7', '& .MuiLinearProgress-bar': { bgcolor: '#673ab7' } }} />;

    if (error) return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, borderTop: '8px solid #d32f2f' }}>
                <Typography variant="h5" color="error">{error}</Typography>
            </Paper>
        </Container>
    );

    if (submitted) return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4, borderTop: '8px solid #673ab7', borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>{formSchema?.title}</Typography>
                <Typography variant="body1" paragraph>Your response has been recorded.</Typography>
                <Button variant="text" sx={{ color: '#1a73e8', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }} onClick={() => window.location.reload()}>
                    Submit another response
                </Button>
            </Paper>
        </Container>
    );

    return (
        <Box sx={{ bgcolor: '#f0ebf8', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="md">
                {/* Title Card */}
                <Paper sx={{ p: 4, mb: 2, borderTop: '10px solid #673ab7', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ mb: 1, color: '#202124' }}>{formSchema?.title}</Typography>
                    <Typography variant="body1" sx={{ color: '#202124' }}>{formSchema?.description}</Typography>
                    <Typography variant="caption" sx={{ color: '#d93025', display: 'block', mt: 2 }}>
                        * Indicates required question
                    </Typography>
                </Paper>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {formSchema?.fields.map((field) => (
                        <Paper key={field.name} sx={{ p: 4, mb: 2, borderRadius: 2, borderLeft: errors[field.name] ? '4px solid #d93025' : 'none' }}>
                            <Typography variant="body1" sx={{ mb: 2, fontSize: '16px', fontWeight: 400 }}>
                                {field.label} {field.required && <span style={{ color: '#d93025' }}>*</span>}
                            </Typography>

                            {field.type === 'textarea' ? (
                                <TextField
                                    {...register(field.name, { required: field.required })}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="standard"
                                    placeholder="Your answer"
                                    error={!!errors[field.name]}
                                    helperText={errors[field.name] ? "This is a required question" : ""}
                                />
                            ) : field.type === 'select' ? (
                                <FormControl fullWidth error={!!errors[field.name]} variant="standard">
                                    <Select
                                        {...register(field.name, { required: field.required })}
                                        defaultValue=""
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Choose</MenuItem>
                                        {field.options?.map((opt) => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {errors[field.name] && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>This is a required question</Typography>}
                                </FormControl>
                            ) : field.type === 'checkbox' ? (
                                <FormControl error={!!errors[field.name]}>
                                    <FormControlLabel
                                        control={<Checkbox {...register(field.name, { required: field.required })} sx={{ color: '#5f6368', '&.Mui-checked': { color: '#673ab7' } }} />}
                                        label="Yes"
                                    />
                                    {errors[field.name] && <Typography variant="caption" color="error">This is a required question</Typography>}
                                </FormControl>
                            ) : field.type === 'file' ? (
                                <Box>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={uploading === field.name ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                        sx={{ color: '#1a73e8', borderColor: '#dadce0', textTransform: 'none', '&:hover': { bgcolor: '#f1f3f4', borderColor: '#dadce0' } }}
                                    >
                                        {uploading === field.name ? 'Uploading...' : 'Add file'}
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) => handleFileUpload(e, field.name)}
                                        />
                                    </Button>
                                    {errors[field.name] && <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>This is a required question</Typography>}
                                </Box>
                            ) : (
                                <TextField
                                    {...register(field.name, { required: field.required })}
                                    fullWidth
                                    variant="standard"
                                    placeholder="Your answer"
                                    error={!!errors[field.name]}
                                    helperText={errors[field.name] ? "This is a required question" : ""}
                                />
                            )}
                        </Paper>
                    ))}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ bgcolor: '#673ab7', px: 4, py: 1, '&:hover': { bgcolor: '#5e35b1' } }}
                        >
                            Submit
                        </Button>
                        <Button
                            variant="text"
                            sx={{ color: '#673ab7', textTransform: 'none' }}
                            onClick={() => setValue('reset', true)} // Dummy reset
                        >
                            Clear form
                        </Button>
                    </Box>
                </form>
            </Container>
        </Box>
    );
}
