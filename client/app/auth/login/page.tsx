'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Box, Container, Paper, Typography, TextField, Button, Alert
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password,
            });
            localStorage.setItem('token', response.data.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0ebf8' }}>
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderTop: '8px solid #673ab7' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                        <DescriptionIcon sx={{ fontSize: 40, color: '#673ab7', mr: 1 }} />
                        <Typography variant="h4" sx={{ color: '#202124', fontWeight: 500 }}>
                            Forms
                        </Typography>
                    </Box>

                    <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3, color: '#202124' }}>
                        Sign in to your account
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                        <TextField
                            {...register('email')}
                            fullWidth
                            label="Email address"
                            type="email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            {...register('password')}
                            fullWidth
                            label="Password"
                            type="password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ mb: 2 }}
                        />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                py: 1.5,
                                bgcolor: '#673ab7',
                                '&:hover': { bgcolor: '#5e35b1' },
                                mb: 2
                            }}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                                <Typography sx={{ color: '#673ab7', '&:hover': { textDecoration: 'underline' } }}>
                                    Don't have an account? Sign up
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
