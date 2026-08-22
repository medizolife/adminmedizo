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
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HealingIcon from '@mui/icons-material/Healing';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function DashboardOverview() {
  const router = useRouter();
  const { stats, transactions, isPreloaded, isSyncing, preloadAll } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const recentTransactions = (transactions || []).slice(0, 5);
  const loading = !isPreloaded && !stats;

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
            System Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
            Real-time analytics and roster management across Medizo system
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => preloadAll(true)}
          startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
          sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.3)', color: themeColors.accentPrimary, fontWeight: 700 }}
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
                  bgcolor: themeColors.bgPaper,
                  border: isLight ? '1px solid rgba(0, 143, 104, 0.25)' : '1px solid rgba(0, 200, 150, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: themeColors.accentPrimary, boxShadow: isLight ? '0 12px 30px rgba(0,143,104,0.1)' : '0 12px 30px rgba(0,200,150,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: isLight ? 'rgba(0, 143, 104, 0.12)' : 'rgba(0, 200, 150, 0.15)', color: themeColors.accentPrimary }}>
                    <MedicalServicesIcon fontSize="medium" />
                  </Box>
                  <Chip label="Doctors Roster" size="small" sx={{ bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)', color: themeColors.textSecondary, fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  {stats?.doctors?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#10B981', fontWeight: 800 }}>
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
                  bgcolor: themeColors.bgPaper,
                  border: isLight ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(59, 130, 246, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: themeColors.accentSecondary, boxShadow: isLight ? '0 12px 30px rgba(2,132,199,0.1)' : '0 12px 30px rgba(59,130,246,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(59, 130, 246, 0.15)', color: themeColors.accentSecondary }}>
                    <PeopleIcon fontSize="medium" />
                  </Box>
                  <Chip label="Patients Roster" size="small" sx={{ bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)', color: themeColors.textSecondary, fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  {stats?.patients?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#10B981', fontWeight: 800 }}>
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
                  bgcolor: themeColors.bgPaper,
                  border: isLight ? '1px solid rgba(217, 119, 6, 0.25)' : '1px solid rgba(245, 158, 11, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: themeColors.accentWarning, boxShadow: isLight ? '0 12px 30px rgba(217,119,6,0.1)' : '0 12px 30px rgba(245,158,11,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.15)', color: themeColors.accentWarning }}>
                    <LocalPharmacyIcon fontSize="medium" />
                  </Box>
                  <Chip label="Pharmacies" size="small" sx={{ bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)', color: themeColors.textSecondary, fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  {stats?.pharmacists?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#10B981', fontWeight: 800 }}>
                    ● {stats?.pharmacists?.active || 0} Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800 }}>
                    ● {stats?.pharmacists?.deactivated || 0} Inactive
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Prescriptions & Encounters Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => router.push('/transactions')}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  bgcolor: themeColors.bgPaper,
                  border: isLight ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid rgba(192, 132, 252, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', borderColor: themeColors.accentTertiary, boxShadow: isLight ? '0 12px 30px rgba(124,58,237,0.1)' : '0 12px 30px rgba(192,132,252,0.15)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: isLight ? 'rgba(124, 58, 237, 0.12)' : 'rgba(192, 132, 252, 0.15)', color: themeColors.accentTertiary }}>
                    <ReceiptLongIcon fontSize="medium" />
                  </Box>
                  <Chip label="Prescription Rx" size="small" sx={{ bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)', color: themeColors.textSecondary, fontWeight: 700 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  {stats?.prescriptions?.total || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#10B981', fontWeight: 800 }}>
                    ● Real-time Logs
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* New Analytics & Clinical Intelligence Banner */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '20px',
              bgcolor: isLight ? 'rgba(0, 143, 104, 0.06)' : 'rgba(0, 200, 150, 0.08)',
              border: isLight ? '1.5px solid rgba(0, 143, 104, 0.35)' : '1.5px solid rgba(0, 200, 150, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              boxShadow: isLight ? '0 8px 30px rgba(0, 143, 104, 0.06)' : '0 8px 30px rgba(0, 200, 150, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.8, borderRadius: '16px', bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', display: 'flex' }}>
                <InsightsIcon fontSize="large" />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                    Cross-Platform Clinical &amp; Operational Intelligence Hub
                  </Typography>
                  <Chip label="NEW" size="small" sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 900, height: 20, fontSize: '0.65rem' }} />
                </Box>
                <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.3 }}>
                  Epidemiological disease surveillance, revenue cycle analytics, patient retention funnels &amp; inventory expiry forecasting
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              onClick={() => router.push('/analytics')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, borderRadius: '12px', px: 3, '&:hover': { bgcolor: isLight ? '#007A5A' : '#00A87E' } }}
            >
              Open Analytics Hub
            </Button>
          </Paper>

          {/* DigiLocker & Security Highlights Banner */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '20px',
              bgcolor: isLight ? 'rgba(0, 143, 104, 0.03)' : 'rgba(0, 200, 150, 0.04)',
              border: isLight ? '1px solid rgba(0, 143, 104, 0.2)' : '1px solid rgba(0, 200, 150, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.8, borderRadius: '16px', bgcolor: isLight ? 'rgba(0, 143, 104, 0.15)' : 'rgba(0, 200, 150, 0.2)', color: themeColors.accentPrimary }}>
                <VerifiedUserIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  DigiLocker Identity Verification Stats
                </Typography>
                <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                  {stats?.doctors?.digilockerVerified || 0} Doctor(s) verified via Govt DigiLocker OAuth2 Integration
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              onClick={() => router.push('/doctors')}
              endIcon={<ArrowForwardIcon />}
              sx={{ borderColor: themeColors.accentPrimary, color: themeColors.accentPrimary, fontWeight: 800, borderRadius: '12px' }}
            >
              Manage Verified Doctors
            </Button>
          </Paper>

          {/* Recent Prescription Transactions Table */}
          <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.textPrimary }}>
                Recent Prescription Transactions
              </Typography>
              <Button
                variant="text"
                onClick={() => router.push('/transactions')}
                endIcon={<ArrowForwardIcon />}
                sx={{ color: themeColors.accentPrimary, fontWeight: 700 }}
              >
                View All Transactions
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { borderColor: themeColors.border, color: themeColors.textSecondary, fontWeight: 700, bgcolor: isLight ? '#EBE5D8' : '#0E1719' } }}>
                    <TableCell>Date &amp; Time</TableCell>
                    <TableCell>Created By (Doctor)</TableCell>
                    <TableCell>Created For (Patient)</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: themeColors.textSecondary }}>
                        No recent transactions recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow key={tx.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.doctor?.name || 'Unknown Doctor'}
                            size="small"
                            onClick={() => setSelectedUser({ id: tx.doctor?.id, firstName: tx.doctor?.name, role: 'doctor', email: tx.doctor?.email })}
                            sx={{
                              bgcolor: isLight ? 'rgba(0, 143, 104, 0.12)' : 'rgba(0, 200, 150, 0.15)',
                              color: themeColors.accentPrimary,
                              fontWeight: 800,
                              cursor: 'pointer',
                              border: isLight ? '1px solid rgba(0, 143, 104, 0.3)' : '1px solid rgba(0, 200, 150, 0.3)',
                              '&:hover': { bgcolor: isLight ? 'rgba(0, 143, 104, 0.2)' : 'rgba(0, 200, 150, 0.3)' }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.patient?.name || 'Unknown Patient'}
                            size="small"
                            onClick={() => setSelectedUser({ id: tx.patient?.id, firstName: tx.patient?.name, role: 'patient', email: tx.patient?.email })}
                            sx={{
                              bgcolor: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(59, 130, 246, 0.15)',
                              color: themeColors.accentSecondary,
                              fontWeight: 800,
                              cursor: 'pointer',
                              border: isLight ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                              '&:hover': { bgcolor: isLight ? 'rgba(2, 132, 199, 0.2)' : 'rgba(59, 130, 246, 0.3)' }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {Array.isArray(tx.provisionalDiagnosis) ? tx.provisionalDiagnosis.join(', ') : (tx.medication || 'General')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.status || 'active'}
                            size="small"
                            sx={{
                              bgcolor: tx.status === 'completed' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(59, 130, 246, 0.15)') : 'rgba(16, 185, 129, 0.15)',
                              color: tx.status === 'completed' ? themeColors.accentSecondary : (isLight ? '#059669' : '#34D399'),
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

      {/* User 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        userId={selectedUser?.id || selectedUser?._id || selectedUser?.email}
        initialUserData={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={() => preloadAll(true)}
      />
    </AdminLayout>
  );
}
