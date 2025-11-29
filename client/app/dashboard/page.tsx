'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
    TextField, IconButton, Fab, Tabs, Tab, Box, Paper, Menu, MenuItem,
    CircularProgress, Divider, Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Description as DescriptionIcon,
    Image as ImageIcon,
    TextFields as TextFieldsIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    Send as SendIcon,
    AccountCircle
} from '@mui/icons-material';

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
    const [tabValue, setTabValue] = useState(0);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f0ebf8', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <DescriptionIcon sx={{ color: '#673ab7', mr: 2, fontSize: 40 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#5f6368' }}>
                        Forms
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            placeholder="Search"
                            variant="outlined"
                            size="small"
                            sx={{ bgcolor: '#f1f3f4', borderRadius: 2, '& fieldset': { border: 'none' }, width: 300, display: { xs: 'none', md: 'block' } }}
                        />
                        <IconButton onClick={handleLogout}>
                            <AccountCircle fontSize="large" sx={{ color: '#5f6368' }} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Generator Section */}
            <Box sx={{ bgcolor: 'white', py: 3, mb: 4 }}>
                <Container maxWidth="lg">
                    <Typography variant="body1" sx={{ mb: 2, color: '#202124', fontWeight: 500 }}>
                        Start a new form with AI
                    </Typography>
                    <Box component="form" onSubmit={handleGenerate} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            placeholder="Describe your form (e.g. 'RSVP for a wedding')..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={generating}
                            sx={{ bgcolor: '#f8f9fa' }}
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={generating}
                            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                            sx={{ height: 56, px: 4, bgcolor: '#673ab7', '&:hover': { bgcolor: '#5e35b1' } }}
                        >
                            Create
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Recent Forms */}
            <Container maxWidth="lg">
                <Typography variant="body1" sx={{ mb: 2, color: '#202124', fontWeight: 500 }}>
                    Recent forms
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                    {forms.map((form) => (
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                '&:hover': { border: '1px solid #673ab7' }
                            }}
                            onClick={() => router.push(`/dashboard/forms/${form._id}`)}
                        >
                            <Box sx={{ height: 150, bgcolor: '#f0ebf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <DescriptionIcon sx={{ fontSize: 60, color: '#673ab7', opacity: 0.5 }} />
                            </Box>
                            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                <Typography gutterBottom variant="body1" component="div" sx={{ fontWeight: 500 }}>
                                    {form.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <DescriptionIcon sx={{ fontSize: 16, color: '#673ab7', mr: 1 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Opened {new Date(form.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
