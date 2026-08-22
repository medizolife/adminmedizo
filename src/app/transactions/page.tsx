'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';

const formatSafeStr = (val: any, fallback: string = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.map(v => formatSafeStr(v)).join(', ');
    if ('morning' in val || 'afternoon' in val || 'evening' in val || 'night' in val) {
      const m = val.morning ? String(val.morning) : '0';
      const a = val.afternoon ? String(val.afternoon) : '0';
      const e = val.evening ? String(val.evening) : '0';
      const n = val.night ? String(val.night) : '0';
      return `${m}-${a}-${e}-${n}`;
    }
    if (val.name) return String(val.name);
    return Object.entries(val).filter(([_, v]) => Boolean(v)).map(([k, v]) => `${k}: ${v}`).join(', ') || fallback;
  }
  return String(val);
};

export default function PrescriptionTransactions() {
  const { transactions, isPreloaded, isSyncing, refreshSection } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const txList = transactions || [];
  const loading = !isPreloaded && txList.length === 0;

  const filteredTransactions = txList.filter((tx: any) => {
    if (statusFilter !== 'all' && (tx.status || 'active') !== statusFilter) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(tx.id || '').toLowerCase().includes(q) ||
      String(tx.doctor?.name || '').toLowerCase().includes(q) ||
      String(tx.patient?.name || '').toLowerCase().includes(q) ||
      String(tx.medication || '').toLowerCase().includes(q) ||
      (Array.isArray(tx.provisionalDiagnosis) && tx.provisionalDiagnosis.some((d: string) => String(d).toLowerCase().includes(q)))
    );
  });

  const totalTx = txList.length;
  const activeTx = txList.filter((tx: any) => (tx.status || 'active') === 'active').length;
  const completedTx = txList.filter((tx: any) => tx.status === 'completed').length;

  const handleOpenDetail = (tx: any) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ReceiptLongIcon sx={{ color: '#00C896', fontSize: '2.2rem' }} />
              Prescription Transactions Audit Log
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Complete real-time clinical audit trail showing who created prescriptions for whom across the ecosystem
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('transactions')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: 'rgba(0, 200, 150, 0.3)', color: '#00C896', fontWeight: 700, textTransform: 'none' }}
          >
            Refresh Logs
          </Button>
        </Box>

        {/* 3 Executive KPI Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(0, 200, 150, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00C896', mb: 0.5 }}>
                <ReceiptLongIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Transactions</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                {totalTx}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>All Clinical Prescriptions Issued</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10B981', mb: 0.5 }}>
                <LocalHospitalIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Active Prescriptions</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981' }}>
                {activeTx}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Active Regimens &amp; Fulfillments</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38BDF8', mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Completed / Archived</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#38BDF8' }}>
                {completedTx}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Dispensed &amp; Finished Courses</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search & Status Filter Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: '#131F22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Filter transactions by Doctor name, Patient name, Rx ID, or Diagnosis..."
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
              { id: 'all', label: 'All Transactions' },
              { id: 'active', label: 'Active Rx' },
              { id: 'completed', label: 'Completed' }
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

        {/* Transactions Table */}
        <Paper sx={{ borderRadius: '20px', bgcolor: '#131F22', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#0B1315' }}>
                <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 800 } }}>
                  <TableCell>Date &amp; Time</TableCell>
                  <TableCell>Prescription ID</TableCell>
                  <TableCell>Created By (Doctor)</TableCell>
                  <TableCell>Created For (Patient)</TableCell>
                  <TableCell>Diagnosis / Medication</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress sx={{ color: '#00C896' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A8A3' }}>
                      No prescription transactions found under selected filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx: any) => (
                    <TableRow key={tx.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: '#EBF5F3' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#00C896', fontSize: '0.85rem' }}>
                        #{String(tx.id).slice(-8)}
                      </TableCell>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedUser({ id: tx.doctor?.id, firstName: tx.doctor?.name, role: 'doctor', email: tx.doctor?.email })}
                          sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#34D399' }}>
                            {tx.doctor?.name || 'Unknown Doctor'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            {tx.doctor?.specialization || 'General Physician'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedUser({ id: tx.patient?.id, firstName: tx.patient?.name, role: 'patient', email: tx.patient?.email })}
                          sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#60A5FA' }}>
                            {tx.patient?.name || 'Unknown Patient'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            {tx.patient?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {Array.isArray(tx.provisionalDiagnosis) ? tx.provisionalDiagnosis.join(', ') : formatSafeStr(tx.diagnosis || tx.provisionalDiagnosis, 'Diagnosis Record')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block' }}>
                          {formatSafeStr(tx.medication, 'Medication items')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(tx.status || 'active').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: tx.status === 'completed' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: tx.status === 'completed' ? '#60A5FA' : '#34D399',
                            fontWeight: 900,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDetail(tx)}
                          startIcon={<VisibilityIcon />}
                          sx={{
                            borderRadius: '10px',
                            borderColor: 'rgba(0, 200, 150, 0.4)',
                            color: '#00C896',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(0, 200, 150, 0.15)', borderColor: '#00C896' }
                          }}
                        >
                          View Rx
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Transaction Details Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#131F22',
            color: '#EBF5F3',
            border: '1px solid rgba(0, 200, 150, 0.3)'
          }
        }}
      >
        {selectedTx && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode2Icon sx={{ color: '#00C896', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Prescription Transaction Record #{String(selectedTx.id).slice(-8)}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailModalOpen(false)} size="small" sx={{ color: '#94A8A3' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 3, mt: 1 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 200, 150, 0.06)', border: '1px solid rgba(0, 200, 150, 0.2)', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: '#00C896', fontWeight: 800, textTransform: 'uppercase' }}>
                    Doctor (Created By)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {formatSafeStr(selectedTx.doctor?.name, 'Doctor')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Email: {formatSafeStr(selectedTx.doctor?.email, 'N/A')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Specialization: {formatSafeStr(selectedTx.doctor?.specialization, 'General Physician')}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 800, textTransform: 'uppercase' }}>
                    Patient (Created For)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {formatSafeStr(selectedTx.patient?.name, 'Patient')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Email: {formatSafeStr(selectedTx.patient?.email, 'N/A')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Phone: {formatSafeStr(selectedTx.patient?.phone, 'N/A')}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94A8A3', mb: 1 }}>
                  Provisional Diagnosis
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {Array.isArray(selectedTx.provisionalDiagnosis) ? selectedTx.provisionalDiagnosis.join(', ') : formatSafeStr(selectedTx.diagnosis || selectedTx.provisionalDiagnosis, 'Routine Clinical Consultation')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94A8A3', mb: 1 }}>
                  Medications &amp; Prescribed Regimen
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#EBF5F3' }}>
                    Medication: {formatSafeStr(selectedTx.medication, 'Standard Care Regimen')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
                    Dosage: {formatSafeStr(selectedTx.dosage, 'As advised')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
                    Instructions: {formatSafeStr(selectedTx.instructions, 'Take post meals with adequate hydration')}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                  Created At: {new Date(selectedTx.createdAt || Date.now()).toLocaleString()}
                </Typography>
                <Chip label={`QR Code Verified: ${selectedTx.qrCode || selectedTx.id}`} size="small" sx={{ bgcolor: 'rgba(0,200,150,0.15)', color: '#00C896', fontWeight: 800 }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ color: '#00C896', borderColor: '#00C896', borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
              >
                Print Digital Rx
              </Button>
              <Button onClick={() => setDetailModalOpen(false)} sx={{ color: '#94A8A3' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* User 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        userId={selectedUser?.id || selectedUser?._id || selectedUser?.email}
        initialUserData={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={() => refreshSection('transactions')}
      />
    </AdminLayout>
  );
}
