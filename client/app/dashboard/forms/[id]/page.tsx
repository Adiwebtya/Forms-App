'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import {
    AppBar, Toolbar, Typography, IconButton, Tabs, Tab, Box, Container,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Button
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    Send as SendIcon,
    ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

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
    const [tabValue, setTabValue] = useState(1);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
        } else if (id) {
            fetchData();
        }
    }, [id, router]);

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

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

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
        </Box>
    );

    if (!form) return <Typography>Form not found</Typography>;

    const publicLink = `${origin}/form/${form._id}`;

    return (
        <Box sx={{ bgcolor: '#f0ebf8', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => router.push('/dashboard')} sx={{ mr: 2 }}>
                        <ArrowBackIcon sx={{ color: '#5f6368' }} />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, color: '#202124' }}>
                        {form.title}
                    </Typography>

                    <IconButton onClick={() => window.open(publicLink, '_blank')}>
                        <VisibilityIcon sx={{ color: '#5f6368' }} />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        sx={{ ml: 2, bgcolor: '#673ab7', '&:hover': { bgcolor: '#5e35b1' } }}
                        onClick={() => {
                            navigator.clipboard.writeText(publicLink);
                            alert('Link copied to clipboard!');
                        }}
                    >
                        Send
                    </Button>
                    <IconButton sx={{ ml: 1 }}>
                        <MoreVertIcon sx={{ color: '#5f6368' }} />
                    </IconButton>
                </Toolbar>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    centered
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 } }}
                >
                    <Tab label="Questions" disabled />
                    <Tab label="Responses" />
                    <Tab label="Settings" disabled />
                </Tabs>
            </AppBar>

            {/* Content */}
            <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>{submissions.length} responses</Typography>
                    <Typography variant="body2" color="text.secondary">Summary of all responses</Typography>
                </Paper>

                {submissions.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="body1" color="text.secondary">Waiting for responses...</Typography>
                    </Paper>
                ) : (
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Response Data</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissions.map((sub) => (
                                        <TableRow key={sub._id} hover>
                                            <TableCell sx={{ verticalAlign: 'top', width: 180, color: '#5f6368' }}>
                                                {new Date(sub.submittedAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    {Object.entries(sub.content).map(([key, value]) => (
                                                        <Box key={key}>
                                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                                {key}
                                                            </Typography>
                                                            {typeof value === 'string' && value.startsWith('http') && value.includes('cloudinary') ? (
                                                                <Box sx={{ mt: 1 }}>
                                                                    <img src={value} alt="Uploaded" style={{ maxHeight: 100, borderRadius: 4, border: '1px solid #e0e0e0' }} />
                                                                    <Button
                                                                        size="small"
                                                                        href={value}
                                                                        target="_blank"
                                                                        startIcon={<VisibilityIcon />}
                                                                        sx={{ display: 'block', mt: 0.5, textTransform: 'none' }}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="body2" color="text.primary">
                                                                    {String(value)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
