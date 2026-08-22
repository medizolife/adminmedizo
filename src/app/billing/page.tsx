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
import { useAppTheme } from '@/context/ThemeContext';

export default function BillingOversight() {
  const { billing, isPreloaded, isSyncing, refreshSection, updateBillStatusLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
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
      return (
        String(b.billNumber || '').toLowerCase().includes(q) ||
        String(b.doctorName || '').toLowerCase().includes(q) ||
        String(b.patientName || '').toLowerCase().includes(q) ||
        String(b.paymentTransactionRef || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMarkPaid = async (bill: any) => {
    setActionLoading(true);
    try {
      const ok = await updateBillStatusLocal(bill.id, 'paid', Number(bill.totalAmount || 0));
      if (ok) setToastMessage(`Invoice ${bill.billNumber} marked as PAID`);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PaymentsIcon sx={{ color: themeColors.accentPrimary, fontSize: 32 }} /> Billing &amp; Invoicing Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              Auditable GST compliance (SAC 999312 exemption), invoice generation, and revenue collection ledger
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('billing')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.3)', color: themeColors.accentPrimary, fontWeight: 700 }}
          >
            Refresh Billing
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: isLight ? '#065F46' : '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* Executive Billing KPI Strip */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentPrimary, mb: 1 }}>
                <MonetizationOnIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Gross Revenue Billed</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                ₹{(metrics?.totalRevenue || bills.reduce((acc: number, b: any) => acc + (Number(b.totalAmount) || 0), 0)).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#34D399' }}>Cumulative ledger volume</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isLight ? '#059669' : '#4CAF50', mb: 1 }}>
                <CheckCircleIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Collected Payments</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: isLight ? '#059669' : '#4CAF50' }}>
                ₹{(metrics?.collectedRevenue || bills.reduce((acc: number, b: any) => acc + (Number(b.amountPaid) || (b.status === 'paid' ? Number(b.totalAmount) : 0)), 0)).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Settled &amp; realized revenue</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#EF4444', mb: 1 }}>
                <AccountBalanceWalletIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Pending Receivables</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#EF4444' }}>
                ₹{(metrics?.outstandingDue || bills.reduce((acc: number, b: any) => acc + (Number(b.balanceDue) || (b.status === 'paid' ? 0 : Number(b.totalAmount))), 0)).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#EF4444' }}>Outstanding patient dues</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentSecondary, mb: 1 }}>
                <ReceiptLongIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Invoices Processed</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                {metrics?.totalBillsCount || bills.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>GST SAC 999312 compliant</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter & Search Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: themeColors.bgPaper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, border: `1px solid ${themeColors.border}` }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search bills by Invoice #, Doctor, Patient, or Transaction Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: themeColors.textSecondary }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: themeColors.textPrimary,
                  bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                  borderRadius: '14px',
                  '& fieldset': { borderColor: isLight ? 'rgba(45, 80, 60, 0.18)' : 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: themeColors.accentPrimary }
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
                  bgcolor: statusFilter === f.id ? themeColors.accentPrimary : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
                  color: statusFilter === f.id ? (isLight ? '#FFFFFF' : '#0B1315') : themeColors.textPrimary,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  border: statusFilter === f.id ? `1px solid ${themeColors.accentPrimary}` : `1px solid ${themeColors.border}`
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Invoices Table */}
        <Paper sx={{ bgcolor: themeColors.bgPaper, borderRadius: '18px', border: `1px solid ${themeColors.border}`, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: themeColors.accentPrimary }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                  <TableRow>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Invoice #</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Doctor / Clinic</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>GST SAC</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Total Billed</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Payment Status</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Method &amp; Ref</TableCell>
                    <TableCell align="right" sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: themeColors.textSecondary }}>
                        No billing records found under selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((b: any) => {
                      const isExempt = b.gstType === 'exempt' || !b.gstRate || b.gstRate === 0;
                      const paid = Number(b.amountPaid) || (b.status === 'paid' ? Number(b.totalAmount) : 0);
                      const bal = Number(b.balanceDue) || (b.status === 'paid' ? 0 : Number(b.totalAmount));

                      return (
                        <TableRow key={b.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                          <TableCell sx={{ color: themeColors.accentPrimary, fontWeight: 700, fontFamily: 'monospace' }}>
                            {b.billNumber}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>{b.doctorName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>{b.patientName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isExempt ? 'EXEMPT (SAC 999312)' : `GST ${b.gstRate}%`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                bgcolor: isExempt ? (isLight ? 'rgba(0, 143, 104, 0.12)' : 'rgba(0,200,150,0.15)') : 'rgba(255,152,0,0.15)',
                                color: isExempt ? themeColors.accentPrimary : '#FF9800'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: themeColors.accentPrimary, fontWeight: 900, fontSize: '1.05rem' }}>
                            ₹{Number(b.totalAmount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#4CAF50', fontWeight: 800, display: 'block' }}>
                              Paid: ₹{paid.toLocaleString()}
                            </Typography>
                            {bal > 0 && (
                              <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800, display: 'block' }}>
                                Due: ₹{bal.toLocaleString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: themeColors.textSecondary }}>
                            {b.paymentMethod ? (
                              <Box>
                                <Typography variant="body2" sx={{ color: themeColors.textPrimary, fontWeight: 600, textTransform: 'uppercase' }}>
                                  {b.paymentMethod}
                                </Typography>
                                {b.paymentTransactionRef && (
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: themeColors.accentSecondary, display: 'block', fontSize: '0.68rem' }}>
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
                                  color: themeColors.accentSecondary,
                                  borderColor: isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(56, 189, 248, 0.4)',
                                  fontSize: '0.75rem',
                                  textTransform: 'none'
                                }}
                              >
                                View PDF Bill
                              </Button>
                              {bal > 0 && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={actionLoading}
                                  onClick={() => handleMarkPaid(b)}
                                  startIcon={<CheckCircleIcon />}
                                  sx={{
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    bgcolor: themeColors.accentPrimary,
                                    color: isLight ? '#FFFFFF' : '#0B1315',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: isLight ? '#007A5A' : '#00A87E' }
                                  }}
                                >
                                  Mark Paid
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

      {/* Invoice Details Dialog */}
      <Dialog
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: themeColors.bgPaper,
            color: themeColors.textPrimary,
            border: `1px solid ${themeColors.border}`,
            p: 1
          }
        }}
      >
        {selectedInvoice && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon sx={{ color: themeColors.accentPrimary }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  Tax Invoice &amp; Consultation Bill #{selectedInvoice.billNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedInvoice(null)} size="small" sx={{ color: themeColors.textSecondary }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {/* Doctor & Patient Info Header */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 3 }}>
                <Paper sx={{ p: 2, bgcolor: isLight ? 'rgba(0, 143, 104, 0.08)' : 'rgba(0, 200, 150, 0.05)', borderRadius: '14px', border: isLight ? '1px solid rgba(0, 143, 104, 0.25)' : '1px solid rgba(0, 200, 150, 0.2)' }}>
                  <Typography variant="caption" sx={{ color: themeColors.accentPrimary, fontWeight: 800, textTransform: 'uppercase' }}>
                    Consulting Provider
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: themeColors.textPrimary }}>
                    {selectedInvoice.doctorName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {selectedInvoice.clinicName || 'Medizo Healthcare Center'}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.05)', borderRadius: '14px', border: isLight ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <Typography variant="caption" sx={{ color: themeColors.accentSecondary, fontWeight: 800, textTransform: 'uppercase' }}>
                    Billed Patient
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: themeColors.textPrimary }}>
                    {selectedInvoice.patientName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    Billing Date: {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Box>

              {/* Items List */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textSecondary, mb: 1.5 }}>
                Billed Services &amp; Tariffs
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                    <TableRow>
                      <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Service Description</TableCell>
                      <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>SAC Code</TableCell>
                      <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedInvoice.items || [{ description: 'Clinical Consultation Fee', sacCode: '999312', amount: selectedInvoice.totalAmount }]).map((item: any, idx: number) => (
                      <TableRow key={idx} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell sx={{ fontWeight: 700 }}>{item.description}</TableCell>
                        <TableCell sx={{ color: themeColors.textSecondary }}>{item.sacCode || '999312'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>₹{Number(item.amount || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total Calculation */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Box sx={{ width: 280 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>GST (SAC 999312 Exempt):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isLight ? '#059669' : '#34D399' }}>₹0.00</Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: themeColors.border }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>Grand Total:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: themeColors.accentPrimary }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${themeColors.border}` }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{ color: themeColors.accentPrimary, borderColor: themeColors.accentPrimary, borderRadius: '10px', fontWeight: 700 }}
                >
                  Print Tax Invoice
                </Button>
                <Button onClick={() => setSelectedInvoice(null)} sx={{ color: themeColors.textSecondary }}>
                  Close
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* User 360 Profile Modal */}
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
