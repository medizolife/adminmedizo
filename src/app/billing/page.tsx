'use client';
import React, { useState } from 'react';
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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import PaymentsIcon from '@mui/icons-material/Payments';
import RefreshIcon from '@mui/icons-material/Refresh';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';

export default function BillingOversight() {
  const { billing, isPreloaded, isSyncing, refreshSection, updateBillStatusLocal } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const bills = billing?.bills || [];
  const metrics = billing?.metrics || null;
  const loading = !isPreloaded && bills.length === 0;

  const filteredBills = bills.filter((b: any) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && (b.status === 'paid' || Number(b.balanceDue) === 0)) return false;
      if (statusFilter === 'paid' && b.status !== 'paid' && Number(b.balanceDue) > 0) return false;
      if (statusFilter !== 'pending' && statusFilter !== 'paid' && b.status !== statusFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (b.billNumber && b.billNumber.toLowerCase().includes(q)) ||
        (b.doctorName && b.doctorName.toLowerCase().includes(q)) ||
        (b.patientName && b.patientName.toLowerCase().includes(q)) ||
        (b.paymentTransactionRef && b.paymentTransactionRef.toLowerCase().includes(q)) ||
        (b.paymentMethod && b.paymentMethod.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleMarkPaid = async (bill: any) => {
    if (!window.confirm(`Confirm settling payment for Bill #${bill.billNumber} (Amount: ₹${bill.totalAmount})?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const success = await updateBillStatusLocal(bill.id, 'paid', {
        paymentMethod: 'UPI / Admin Verified',
        paymentTransactionRef: `tx_admin_${Date.now()}`
      });
      if (success) {
        setToastMessage(`✅ Bill #${bill.billNumber} marked as fully PAID and settled.`);
      }
    } catch (e) {
      alert('Failed to settle bill');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status: string, balanceDue: number) => {
    if (status === 'paid' || balanceDue === 0) {
      return <Chip label="PAID ✓" size="small" sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4CAF50', fontWeight: 800, fontSize: '0.72rem' }} />;
    }
    const map: Record<string, { color: string; bg: string }> = {
      draft: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
      issued: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)' },
      partially_paid: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
      cancelled: { color: '#F44336', bg: 'rgba(244,67,54,0.15)' },
      refunded: { color: '#9C27B0', bg: 'rgba(156,39,176,0.15)' }
    };
    const s = map[status] || { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' };
    return (
      <Chip
        label={status ? status.toUpperCase() : 'PENDING'}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, fontWeight: 800, fontSize: '0.72rem' }}
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
              <PaymentsIcon sx={{ color: '#00C896', fontSize: '2.2rem' }} />
              Prescription Billing &amp; Revenue Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Medical patient bills, Indian GST compliance, split ledger audit, and revenue analytics
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('billing')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ color: '#00C896', borderColor: 'rgba(0,200,150,0.3)', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            Refresh Billing
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* Top Metric Cards */}
        {metrics && (
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(0, 200, 150, 0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00C896', mb: 0.5 }}>
                  <MonetizationOnIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Invoiced</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                  ₹{metrics.totalBilled?.toLocaleString() || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>Gross Invoicing Volume</Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(76, 175, 80, 0.25)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50', mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Collected</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#4CAF50' }}>
                  ₹{metrics.totalCollected?.toLocaleString() || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>Settled Collections</Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#EF4444', mb: 0.5 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Pending Dues</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: metrics.totalPending > 0 ? '#EF4444' : '#00C896' }}>
                  ₹{metrics.totalPending?.toLocaleString() || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>Accounts Receivable</Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38BDF8', mb: 0.5 }}>
                  <ReceiptLongIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>GST Exemption</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#38BDF8' }}>
                  {metrics.exemptCount || 0} / {bills.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>SAC 999312 Exempt Ratio</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Filter & Search Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: '#131F22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search bills by Invoice #, Doctor, Patient, or Transaction Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A8A3' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#EBF5F3',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: '14px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: '#00C896' }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Invoices' },
              { id: 'paid', label: 'Paid ✓' },
              { id: 'pending', label: 'Pending Dues' },
              { id: 'issued', label: 'Issued' },
              { id: 'draft', label: 'Draft' }
            ].map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                onClick={() => setStatusFilter(f.id)}
                sx={{
                  bgcolor: statusFilter === f.id ? '#00C896' : 'rgba(255,255,255,0.05)',
                  color: statusFilter === f.id ? '#0B1315' : '#94A8A3',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  border: statusFilter === f.id ? '1px solid #00C896' : '1px solid rgba(255,255,255,0.08)'
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Invoices Table */}
        <Paper sx={{ bgcolor: '#131F22', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
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
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Doctor / Clinic</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>GST SAC</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Total Billed</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Payment Status</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Method &amp; Ref</TableCell>
                    <TableCell align="right" sx={{ color: '#94A8A3', fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No billing records found under selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((b: any) => {
                      const isExempt = b.gstType === 'exempt' || !b.gstRate || b.gstRate === 0;
                      const paid = Number(b.amountPaid) || (b.status === 'paid' ? Number(b.totalAmount) : 0);
                      const bal = Number(b.balanceDue) || (b.status === 'paid' ? 0 : Number(b.totalAmount));

                      return (
                        <TableRow key={b.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                            {b.billNumber}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>{b.doctorName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>{b.patientName}</Typography>
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
                            ₹{Number(b.totalAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 800, display: 'block' }}>
                              Paid: ₹{paid.toLocaleString()}
                            </Typography>
                            {bal > 0 && (
                              <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800, display: 'block' }}>
                                Due: ₹{bal.toLocaleString()}
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
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#38BDF8', display: 'block', fontSize: '0.68rem' }}>
                                    {b.paymentTransactionRef}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700 }}>
                                Pending Payment
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setSelectedInvoice(b)}
                                startIcon={<ReceiptLongIcon />}
                                sx={{
                                  borderRadius: '10px',
                                  fontWeight: 800,
                                  color: '#38BDF8',
                                  borderColor: 'rgba(56, 189, 248, 0.4)',
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8' }
                                }}
                              >
                                View Tax Invoice
                              </Button>
                              {bal > 0 && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleMarkPaid(b)}
                                  disabled={actionLoading}
                                  sx={{
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    bgcolor: '#10B981',
                                    color: '#0B1315',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#059669' }
                                  }}
                                >
                                  Settle Paid
                                </Button>
                              )}
                            </Box>
                          </TableCell>
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

      {/* Dedicated Tax Invoice Receipt Modal */}
      <Dialog
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0B1315',
            color: '#EBF5F3',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)'
          }
        }}
      >
        <DialogTitle sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <ReceiptLongIcon sx={{ color: '#38BDF8', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                Tax Invoice &amp; Payment Settlement Breakdown
              </Typography>
              <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700 }}>
                Invoice #{selectedInvoice?.billNumber} • Validated GST Healthcare Record
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedInvoice(null)} sx={{ color: '#94A8A3' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedInvoice && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Doctor & Clinic Header Banner */}
              <Paper sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'rgba(19, 31, 34, 0.95)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#38BDF8' }}>
                    {selectedInvoice.doctorName || 'Medizo Multi-Specialty Clinic'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 600 }}>
                    {selectedInvoice.doctorSpecialization || 'Clinical Practice & Telehealth Services'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block', mt: 0.3 }}>
                    GSTIN: {selectedInvoice.doctorGstin || '10ADSPZ9708R1Z5'} • SAC 999312 (Healthcare Exemption)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={selectedInvoice.status === 'paid' ? 'PAYMENT SETTLED ✓' : 'PAYMENT PENDING'}
                    sx={{
                      bgcolor: selectedInvoice.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: selectedInvoice.status === 'paid' ? '#10B981' : '#EF4444',
                      fontWeight: 800,
                      border: selectedInvoice.status === 'paid' ? '1px solid #10B981' : '1px solid #EF4444',
                      mb: 0.5
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block' }}>
                    Date: {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                  </Typography>
                </Box>
              </Paper>

              {/* Billed To Patient Strip */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94A8A3' }}>Billed To Patient</Typography>
                    <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 800 }}>
                      {selectedInvoice.patientName}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94A8A3' }}>Payment Method</Typography>
                    <Typography variant="body2" sx={{ color: '#C084FC', fontWeight: 800 }}>
                      {selectedInvoice.paymentMethod || 'UPI / Payment Gateway'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94A8A3' }}>Transaction Reference</Typography>
                    <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 800, fontFamily: 'monospace' }}>
                      {selectedInvoice.paymentTransactionRef || `tx_medizo_${selectedInvoice.id || '98234'}`}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Line Items Table */}
              <Paper sx={{ borderRadius: '12px', bgcolor: '#131F22', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94A8A3', fontWeight: 800 }}>#</Typography>
                  <Typography variant="caption" sx={{ color: '#94A8A3', fontWeight: 800 }}>Service Description &amp; SAC Code</Typography>
                  <Typography variant="caption" sx={{ color: '#94A8A3', fontWeight: 800, textAlign: 'center' }}>Qty</Typography>
                  <Typography variant="caption" sx={{ color: '#94A8A3', fontWeight: 800, textAlign: 'right' }}>Amount (₹)</Typography>
                </Box>

                {[
                  { desc: 'Professional Clinical Consultation & Health Check', sac: 'SAC 999312', qty: 1, rate: Number(selectedInvoice.totalAmount) || 500 },
                  { desc: 'Digital Medical Record & Cloud Telemetry Sync', sac: 'SAC 998314', qty: 1, rate: 0 },
                  { desc: 'Prescription Digital Signature & QR Verification', sac: 'SAC 999312', qty: 1, rate: 0 }
                ].map((item, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94A8A3' }}>{idx + 1}</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 700 }}>{item.desc}</Typography>
                      <Typography variant="caption" sx={{ color: '#38BDF8' }}>{item.sac}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#EBF5F3', textAlign: 'center' }}>{item.qty}</Typography>
                    <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 800, textAlign: 'right' }}>₹{item.rate.toLocaleString()}</Typography>
                  </Box>
                ))}

                {/* Total Summary */}
                <Box sx={{ p: 2, bgcolor: 'rgba(56, 189, 248, 0.04)', display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'flex-end' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 280 }}>
                    <Typography variant="body2" sx={{ color: '#94A8A3' }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ color: '#EBF5F3', fontWeight: 700 }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 280 }}>
                    <Typography variant="body2" sx={{ color: '#94A8A3' }}>GST (Healthcare Exempt):</Typography>
                    <Typography variant="body2" sx={{ color: '#34D399', fontWeight: 700 }}>₹0.00 (Exempt)</Typography>
                  </Box>
                  <Divider sx={{ width: 280, my: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 280 }}>
                    <Typography variant="subtitle1" sx={{ color: '#38BDF8', fontWeight: 900 }}>Total Invoiced:</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#34D399', fontWeight: 900 }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 280 }}>
                    <Typography variant="caption" sx={{ color: '#94A8A3' }}>Balance Due:</Typography>
                    <Typography variant="caption" sx={{ color: selectedInvoice.status === 'paid' ? '#34D399' : '#EF4444', fontWeight: 700 }}>
                      ₹{selectedInvoice.status === 'paid' ? 0 : Number(selectedInvoice.balanceDue || selectedInvoice.totalAmount).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                  * This is a computer-generated tax invoice under GST Notification 12/2017 (Central Tax Rate).
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    sx={{ bgcolor: '#38BDF8', color: '#0B1315', fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}
                  >
                    Print Tax Invoice Receipt
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedInvoice, null, 2));
                      alert('Invoice data copied to clipboard!');
                    }}
                    sx={{ color: '#38BDF8', borderColor: '#38BDF8', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}
                  >
                    Copy Invoice Data
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* User 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        userId={selectedUser?.id || selectedUser?._id || selectedUser?.email}
        initialUserData={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={() => refreshSection('billing')}
      />
    </AdminLayout>
  );
}
