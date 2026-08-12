'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
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

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RefreshIcon from '@mui/icons-material/Refresh';

import AdminLayout from '@/components/AdminLayout';
import { adminExtraApi } from '@/services/adminExtraApi';

export default function ReferralsOversight() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminExtraApi.getReferralsOverview();
      if (res.success) {
        setReferrals(res.referrals || []);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      pending: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
      accepted: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)' },
      completed: { color: '#4CAF50', bg: 'rgba(76,175,80,0.15)' },
      rejected: { color: '#F44336', bg: 'rgba(244,67,54,0.15)' },
      cancelled: { color: '#94A8A3', bg: 'rgba(255,255,255,0.05)' }
    };
    const s = map[status] || { color: '#94A8A3', bg: 'rgba(255,255,255,0.05)' };
    return (
      <Chip
        label={status.toUpperCase()}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, fontWeight: 800 }}
      />
    );
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SwapHorizIcon sx={{ color: '#00C896', fontSize: '2rem' }} />
              Doctor Network & Referrals Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Auditable patient referrals pushed between platform doctors.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={fetchData}
            startIcon={<RefreshIcon />}
            sx={{ color: '#94A8A3', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>

        <Paper sx={{ bgcolor: '#131F22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#00C896' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#0B1315' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Referral #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Referring Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Referred Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Clinical Reason</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Priority</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No doctor referrals recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((r) => (
                      <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                          {r.referralNumber}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                          Dr. {r.referringDoctorFirstName} {r.referringDoctorLastName}
                        </TableCell>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700 }}>
                          Dr. {r.referredDoctorFirstName} {r.referredDoctorLastName}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3' }}>
                          {r.patientFirstName} {r.patientLastName}
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3', maxWidth: 260 }}>
                          <Typography variant="body2" noWrap sx={{ color: '#EBF5F3', fontWeight: 600 }}>
                            {r.reason}
                          </Typography>
                          {r.clinicalSummary && (
                            <Typography variant="caption" noWrap sx={{ color: '#94A8A3', display: 'block' }}>
                              {r.clinicalSummary}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.priority?.toUpperCase() || 'ROUTINE'}
                            size="small"
                            sx={{
                              bgcolor: r.priority === 'urgent' ? 'rgba(244,67,54,0.15)' : 'rgba(255,255,255,0.05)',
                              color: r.priority === 'urgent' ? '#F44336' : '#94A8A3',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          />
                        </TableCell>
                        <TableCell>{getStatusChip(r.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </AdminLayout>
  );
}
