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

import HomeWorkIcon from '@mui/icons-material/HomeWork';
import RefreshIcon from '@mui/icons-material/Refresh';

import AdminLayout from '@/components/AdminLayout';
import { adminExtraApi } from '@/services/adminExtraApi';

export default function HomeCareOversight() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminExtraApi.getHomeCareOverview();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Error fetching home care:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      requested: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
      approved: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)' },
      assigned: { color: '#9C27B0', bg: 'rgba(156,39,176,0.15)' },
      in_progress: { color: '#00BCD4', bg: 'rgba(0,188,212,0.15)' },
      completed: { color: '#4CAF50', bg: 'rgba(76,175,80,0.15)' },
      cancelled: { color: '#F44336', bg: 'rgba(244,67,54,0.15)' }
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
              <HomeWorkIcon sx={{ color: '#00C896', fontSize: '2rem' }} />
              Home Care & Checkup Requests Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Patient requests, doctor advisories, and nurse dispatch status.
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
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Request #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Service Type & Urgency</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Requested By</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Assigned Nurse</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Preferred Time</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No home care requests recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((r) => (
                      <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                          {r.requestNumber}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                            {r.patientFirstName} {r.patientLastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            {r.contactPhone || r.patientPhone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#EBF5F3', fontWeight: 600 }}>
                            {r.serviceType?.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Chip
                            label={r.urgency?.toUpperCase() || 'ROUTINE'}
                            size="small"
                            sx={{
                              bgcolor: r.urgency === 'urgent' ? 'rgba(244,67,54,0.15)' : 'rgba(255,255,255,0.05)',
                              color: r.urgency === 'urgent' ? '#F44336' : '#94A8A3',
                              fontSize: '0.65rem',
                              height: 18
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3' }}>
                          {r.requestedByRole === 'doctor' ? (r.doctorFirstName ? `Dr. ${r.doctorFirstName} ${r.doctorLastName}` : 'Doctor') : 'Self (Patient)'}
                        </TableCell>
                        <TableCell>
                          {r.nurseFirstName ? (
                            <Typography sx={{ color: '#00C896', fontWeight: 700 }}>
                              {r.nurseFirstName} {r.nurseLastName}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
                              Unassigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3' }}>
                          {r.preferredDate || 'ASAP'} ({r.preferredTimeSlot || 'Morning'})
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
