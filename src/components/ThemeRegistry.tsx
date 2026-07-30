'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00C896', // Emerald Teal
      light: '#33D3AA',
      dark: '#009A73'
    },
    secondary: {
      main: '#7C4DFF',
      light: '#B388FF',
      dark: '#651FFF'
    },
    background: {
      default: '#0B1315',
      paper: '#131F22'
    },
    text: {
      primary: '#EBF5F3',
      secondary: '#94A8A3'
    },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#3B82F6' }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }
      }
    }
  }
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <style jsx global>{`
        :root {
          --color-teal: #00C896;
          --color-mint: #33D3AA;
          --color-dark-bg: #0B1315;
          --color-panel-bg: #131F22;
          --glass-border: rgba(255, 255, 255, 0.08);
        }
        body {
          background-color: #0B1315;
          color: #EBF5F3;
          font-family: "Inter", sans-serif;
          margin: 0;
          padding: 0;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0B1315;
        }
        ::-webkit-scrollbar-thumb {
          background: #1C2D31;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00C896;
        }
      `}</style>
      {children}
    </ThemeProvider>
  );
}
