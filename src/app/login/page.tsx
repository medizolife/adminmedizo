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
import { adminApi } from '@/services/adminApi';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@medizo.life');
  const [password, setPassword] = useState('password123');
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
        bgcolor: '#0B1315',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(0, 200, 150, 0.12) 0%, transparent 60%)',
        p: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 440,
          width: '100%',
          borderRadius: '24px',
          bgcolor: 'rgba(19, 31, 34, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 200, 150, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ m: 1, bgcolor: '#00C896', color: '#0B1315', width: 56, height: 56, boxShadow: '0 0 20px rgba(0,200,150,0.5)' }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#EBF5F3', mt: 1 }}>
            Medizo <span style={{ color: '#00C896' }}>Admin Portal</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5, textAlign: 'center' }}>
            System-wide management for Doctors, Patients & Pharmacists
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5' }}>
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
                color: '#EBF5F3',
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: '#00C896' },
                '&.Mui-focused fieldset': { borderColor: '#00C896' }
              },
              '& .MuiInputLabel-root': { color: '#94A8A3' }
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
                color: '#EBF5F3',
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: '#00C896' },
                '&.Mui-focused fieldset': { borderColor: '#00C896' }
              },
              '& .MuiInputLabel-root': { color: '#94A8A3' }
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
              bgcolor: '#00C896',
              color: '#0B1315',
              boxShadow: '0 8px 24px rgba(0, 200, 150, 0.3)',
              '&:hover': { bgcolor: '#33D3AA' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Access Admin Dashboard'}
          </Button>
        </form>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94A8A3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <VerifiedUserIcon sx={{ fontSize: 14, color: '#00C896' }} /> Connected to Shared Live MongoDB Cluster
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
