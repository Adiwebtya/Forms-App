'use client';

import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#673ab7', // Google Forms Purple
            light: '#9a67ea',
            dark: '#320b86',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#2e7d32', // Google Forms Green (for success/sheets)
        },
        background: {
            default: '#f0ebf8', // Light purple/gray background for editor
            paper: '#ffffff',
        },
        text: {
            primary: '#202124',
            secondary: '#5f6368',
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: {
            fontSize: '24px',
            fontWeight: 400,
            lineHeight: '32px',
        },
        h2: {
            fontSize: '20px',
            fontWeight: 500,
        },
        body1: {
            fontSize: '14px',
            lineHeight: '20px',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                    borderTop: '8px solid transparent', // Placeholder for top accent
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'filled',
                size: 'small',
            },
            styleOverrides: {
                root: {
                    backgroundColor: '#f8f9fa',
                },
            },
        },
    },
});

export default theme;
