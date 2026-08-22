'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import PaymentsIcon from '@mui/icons-material/Payments';
import RefreshIcon from '@mui/icons-material/Refresh';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { adminExtraApi } from '@/services/adminExtraApi';

export default function BillingOversight() {
  const [bills, setBills] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminExtraApi.getBillingOverview();
      if (res.success) {
        setBills(res.bills || []);
        setMetrics(res.metrics || null);
      }
    } catch (err) {
      console.error('Error fetching billing:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      const match = 
        (b.billNumber && b.billNumber.toLowerCase().includes(q)) ||
        (b.doctorName && b.doctorName.toLowerCase().includes(q)) ||
        (b.patientName && b.patientName.toLowerCase().includes(q)) ||
        (b.paymentTransactionRef && b.paymentTransactionRef.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (startDate) {
      const bDate = (b.createdAt || '').substring(0, 10);
      if (bDate < startDate) return false;
    }
    if (endDate) {
      const bDate = (b.createdAt || '').substring(0, 10);
      if (bDate > endDate) return false;
    }
    return true;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      draft: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
      issued: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)' },
      partially_paid: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PaymentsIcon sx={{ color: '#00C896', fontSize: '2rem' }} />
              Prescription Billing & Revenue Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Medical patient bills, Indian GST compliance, split ledger audit, and revenue analytics.
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

        {/* Top Metric Cards */}
        {metrics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#131F22', border: '1px solid rgba(0, 200, 150, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00C896', mb: 0.5 }}>
                  <MonetizationOnIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Billed</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  ₹{metrics.totalBilled?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>Gross Platform Invoicing</Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#131F22', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50', mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Collected</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#4CAF50' }}>
                  ₹{metrics.totalCollected?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>Settled Payments</Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#131F22', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#EF4444', mb: 0.5 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Pending Dues</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: metrics.totalPending > 0 ? '#EF4444' : '#00C896' }}>
                  ₹{metrics.totalPending?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>Outstanding Balance</Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#131F22', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38BDF8', mb: 0.5 }}>
                  <ReceiptLongIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>GST Exemption Ratio</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#38BDF8' }}>
                  {metrics.exemptCount || 0} / {bills.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>SAC 999312 Exempt Bills</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Filter Bar */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: '16px', bgcolor: '#131F22', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Bill #, Doctor, Patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A8A3' }} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3', borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true, sx: { color: '#94A8A3' } }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3', borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true, sx: { color: '#94A8A3' } }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3', borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
                sx={{ color: '#94A8A3', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', textTransform: 'none', height: 40 }}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
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
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Invoice / BOS #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Attending Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>GST Classification</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Amount (INR)</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Paid / Due</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Payment Method / Ref</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No invoices match the selected date / search filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((b) => {
                      const isExempt = b.gstType === 'exempt' || !b.gstRate || b.gstRate === 0;
                      const paid = Number(b.amountPaid) || (b.status === 'paid' ? Number(b.totalAmount) : 0);
                      const bal = Number(b.balanceDue) || (b.status === 'paid' ? 0 : Number(b.totalAmount));

                      return (
                        <TableRow key={b.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                            {b.billNumber}
                          </TableCell>
                          <TableCell>
                            <Box
                              onClick={() => b.doctorId && setSelectedUser({ id: b.doctorId, firstName: b.doctorName, role: 'doctor' })}
                              sx={{ cursor: b.doctorId ? 'pointer' : 'default', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                            >
                              <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                                {b.doctorName}
                              </Typography>
                              {b.doctorGstin && (
                                <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block', fontSize: '0.65rem' }}>
                                  GSTIN: {b.doctorGstin}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              onClick={() => b.patientId && setSelectedUser({ id: b.patientId, firstName: b.patientName, role: 'patient' })}
                              sx={{ cursor: b.patientId ? 'pointer' : 'default', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                            >
                              <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                                {b.patientName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isExempt ? 'EXEMPT (SAC 999312)' : `GST ${b.gstRate}%`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                bgcolor: isExempt ? 'rgba(0,200,150,0.15)' : 'rgba(255,152,0,0.15)',
                                color: isExempt ? '#00C896' : '#FF9800'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#00C896', fontWeight: 900, fontSize: '1.05rem' }}>
                            ₹{b.totalAmount}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 800, display: 'block' }}>
                              Paid: ₹{paid.toFixed(2)}
                            </Typography>
                            {bal > 0 && (
                              <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800, display: 'block' }}>
                                Due: ₹{bal.toFixed(2)}
                              </Typography>
                            )}
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* User 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        userId={selectedUser?.id || selectedUser?._id || selectedUser?.email}
        initialUserData={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={fetchData}
      />
    </AdminLayout>
  );
}
