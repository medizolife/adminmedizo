'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PeopleIcon from '@mui/icons-material/People';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';

import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/services/adminApi';

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminApi.getStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      const txRes = await adminApi.getPrescriptionTransactions();
      if (txRes.success) {
        setRecentTransactions((txRes.transactions || []).slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
            System Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
            Real-time analytics and roster management across Medizo system
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchDashboardData}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: '12px', borderColor: 'rgba(0, 200, 150, 0.3)', color: '#00C896', fontWeight: 700 }}
        >
          Refresh Data
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : (
        <>
          {/* Top Metric Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Doctors Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => router.push('/doctors')}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  bgcolor: '#131F22',
                  border: '1px solid rgba(0, 200, 150, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: '#00C896', boxShadow: '0 12px 30px rgba(0,200,150,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(0, 200, 150, 0.15)', color: '#00C896' }}>
                    <MedicalServicesIcon fontSize="medium" />
                  </Box>
                  <Chip label="Doctors Roster" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A8A3', fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  {stats?.doctors?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                    ● {stats?.doctors?.active || 0} Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800 }}>
                    ● {stats?.doctors?.deactivated || 0} Inactive
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Patients Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => router.push('/patients')}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  bgcolor: '#131F22',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: '#3B82F6', boxShadow: '0 12px 30px rgba(59,130,246,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                    <PeopleIcon fontSize="medium" />
                  </Box>
                  <Chip label="Patients Roster" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A8A3', fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  {stats?.patients?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                    ● {stats?.patients?.active || 0} Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800 }}>
                    ● {stats?.patients?.deactivated || 0} Inactive
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Pharmacists Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => router.push('/pharmacists')}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  bgcolor: '#131F22',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: '#F59E0B', boxShadow: '0 12px 30px rgba(245,158,11,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                    <LocalPharmacyIcon fontSize="medium" />
                  </Box>
                  <Chip label="Pharmacists" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A8A3', fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  {stats?.pharmacists?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                    ● {stats?.pharmacists?.active || 0} Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800 }}>
                    ● {stats?.pharmacists?.deactivated || 0} Inactive
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Prescriptions Transactions Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => router.push('/transactions')}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  bgcolor: '#131F22',
                  border: '1px solid rgba(124, 77, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: '#7C4DFF', boxShadow: '0 12px 30px rgba(124,77,255,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(124, 77, 255, 0.15)', color: '#7C4DFF' }}>
                    <ReceiptLongIcon fontSize="medium" />
                  </Box>
                  <Chip label="Prescriptions" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A8A3', fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  {stats?.prescriptions?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                    ● {stats?.prescriptions?.active || 0} Active Rx
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* DigiLocker & Security Highlights Banner */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '20px',
              bgcolor: 'rgba(0, 200, 150, 0.05)',
              border: '1px solid rgba(0, 200, 150, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.8, borderRadius: '16px', bgcolor: '#00C896', color: '#0B1315' }}>
                <VerifiedUserIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  DigiLocker Identity Verification Stats
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                  {stats?.doctors?.digilockerVerified || 0} Doctor(s) verified via Govt DigiLocker OAuth2 Integration
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              onClick={() => router.push('/doctors')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, borderRadius: '12px' }}
            >
              Manage Verified Doctors
            </Button>
          </Paper>

          {/* Recent Prescription Transactions Table */}
          <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: '#131F22' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#EBF5F3' }}>
                Recent Prescription Transactions
              </Typography>
              <Button
                variant="text"
                onClick={() => router.push('/transactions')}
                endIcon={<ArrowForwardIcon />}
                sx={{ color: '#00C896', fontWeight: 700 }}
              >
                View All Transactions
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 700 } }}>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Created By (Doctor)</TableCell>
                    <TableCell>Created For (Patient)</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#94A8A3' }}>
                        No recent transactions recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow key={tx.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: '#EBF5F3' } }}>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#33D3AA' }}>
                          {tx.doctor?.name || 'Unknown Doctor'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {tx.patient?.name || 'Unknown Patient'}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(tx.provisionalDiagnosis) ? tx.provisionalDiagnosis.join(', ') : (tx.medication || 'General')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.status || 'active'}
                            size="small"
                            sx={{
                              bgcolor: tx.status === 'completed' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: tx.status === 'completed' ? '#60A5FA' : '#34D399',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </AdminLayout>
  );
}
