'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import IconButton from '@mui/material/IconButton';

import { adminApi } from '@/services/adminApi';
import { useAppTheme } from '@/context/ThemeContext';

export default function AdminLogin() {
  const router = useRouter();
  const { mode, toggleColorMode, isLight, themeColors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminApi.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: themeColors.bgDefault,
        backgroundImage: isLight
          ? 'radial-gradient(circle at 50% 30%, rgba(0, 143, 104, 0.08) 0%, transparent 60%)'
          : 'radial-gradient(circle at 50% 30%, rgba(0, 200, 150, 0.12) 0%, transparent 60%)',
        p: 2,
        position: 'relative'
      }}
    >
      {/* Top right theme switch */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <IconButton
          onClick={toggleColorMode}
          sx={{
            bgcolor: themeColors.bgPaper,
            border: `1px solid ${themeColors.border}`,
            color: themeColors.textPrimary,
            p: 1.2
          }}
        >
          {isLight ? <DarkModeIcon fontSize="small" sx={{ color: '#D97706' }} /> : <LightModeIcon fontSize="small" sx={{ color: '#FBBF24' }} />}
        </IconButton>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 440,
          width: '100%',
          borderRadius: '24px',
          bgcolor: themeColors.bgPaper,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${themeColors.border}`,
          boxShadow: isLight ? '0 20px 50px rgba(0, 0, 0, 0.06)' : '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ m: 1, bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', width: 56, height: 56, boxShadow: isLight ? '0 0 20px rgba(0,143,104,0.3)' : '0 0 20px rgba(0,200,150,0.5)' }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900, color: themeColors.textPrimary, mt: 1 }}>
            Medizo <span style={{ color: themeColors.accentPrimary }}>Admin Portal</span>
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5, textAlign: 'center' }}>
            System-wide management for Doctors, Patients &amp; Pharmacists
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Admin Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: themeColors.textPrimary,
                bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                '& fieldset': { borderColor: isLight ? 'rgba(45, 80, 60, 0.18)' : 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: themeColors.accentPrimary },
                '&.Mui-focused fieldset': { borderColor: themeColors.accentPrimary }
              },
              '& .MuiInputLabel-root': { color: themeColors.textSecondary }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Admin Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: themeColors.textPrimary,
                bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                '& fieldset': { borderColor: isLight ? 'rgba(45, 80, 60, 0.18)' : 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: themeColors.accentPrimary },
                '&.Mui-focused fieldset': { borderColor: themeColors.accentPrimary }
              },
              '& .MuiInputLabel-root': { color: themeColors.textSecondary }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              bgcolor: themeColors.accentPrimary,
              color: isLight ? '#FFFFFF' : '#0B1315',
              boxShadow: isLight ? '0 8px 24px rgba(0, 143, 104, 0.25)' : '0 8px 24px rgba(0, 200, 150, 0.3)',
              '&:hover': { bgcolor: isLight ? '#007A5A' : '#33D3AA' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Access Admin Dashboard'}
          </Button>
        </form>

        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${themeColors.border}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
            <VerifiedUserIcon sx={{ fontSize: 14, color: themeColors.accentPrimary }} /> Connected to Live Cloudflare D1 Database
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
