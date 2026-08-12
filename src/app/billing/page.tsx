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

import PaymentsIcon from '@mui/icons-material/Payments';
import RefreshIcon from '@mui/icons-material/Refresh';

import AdminLayout from '@/components/AdminLayout';
import { adminExtraApi } from '@/services/adminExtraApi';

export default function BillingOversight() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminExtraApi.getBillingOverview();
      if (res.success) {
        setBills(res.bills || []);
      }
    } catch (err) {
      console.error('Error fetching billing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      draft: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
      issued: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)' },
      paid: { color: '#4CAF50', bg: 'rgba(76,175,80,0.15)' },
      cancelled: { color: '#F44336', bg: 'rgba(244,67,54,0.15)' },
      refunded: { color: '#9C27B0', bg: 'rgba(156,39,176,0.15)' }
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
              <PaymentsIcon sx={{ color: '#00C896', fontSize: '2rem' }} />
              Prescription Billing & Revenue Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Medical patient bills, consultation fees, and payment tracking audit log.
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
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Invoice #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Attending Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Items Breakdown</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Amount (INR)</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Payment Method / Ref</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No invoices generated yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bills.map((b) => (
                      <TableRow key={b.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                          {b.billNumber}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                          {b.doctorName}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3' }}>
                          {b.patientName}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 600 }}>
                            {(b.items || []).length} Line Items
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            Subtotal: ₹{b.subtotal} {b.tax > 0 && `• Tax: ₹${b.tax}`}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#00C896', fontWeight: 900, fontSize: '1.05rem' }}>
                          ₹{b.totalAmount}
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3' }}>
                          {b.paymentMethod ? (
                            <Box>
                              <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 600, textTransform: 'uppercase' }}>
                                {b.paymentMethod}
                              </Typography>
                              {b.paymentTransactionRef && (
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94A8A3' }}>
                                  {b.paymentTransactionRef}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            'Pending Payment'
                          )}
                        </TableCell>
                        <TableCell>{getStatusChip(b.status)}</TableCell>
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
