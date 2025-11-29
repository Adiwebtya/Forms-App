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

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormValues) => {
        try {
            setError(null);
            const response = await api.post('/auth/signup', {
                email: data.email,
                password: data.password,
            });
            localStorage.setItem('token', response.data.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
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
                        Create your account
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

                        <TextField
                            {...register('confirmPassword')}
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
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
                            {isSubmitting ? 'Signing up...' : 'Sign up'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                                <Typography sx={{ color: '#673ab7', '&:hover': { textDecoration: 'underline' } }}>
                                    Already have an account? Log in
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
