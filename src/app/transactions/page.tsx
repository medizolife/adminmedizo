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
import { useAppTheme } from '@/context/ThemeContext';

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
  const { isLight, themeColors } = useAppTheme();
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

  const handleOpenDetail = (tx: any) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header Strip */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ReceiptLongIcon sx={{ color: themeColors.accentPrimary, fontSize: 32 }} /> Prescription Records &amp; Encounters
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              Auditable logs of doctor prescriptions, QR digital signatures, medications, and dispensations
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('prescriptions')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.3)', color: themeColors.accentPrimary, fontWeight: 700 }}
          >
            Refresh Logs
          </Button>
        </Box>

        {/* Search & Filter Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: themeColors.bgPaper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, border: `1px solid ${themeColors.border}` }}>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Prescription ID, Doctor, Patient, Medication, Diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: themeColors.textSecondary, fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: themeColors.textPrimary,
                  bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: isLight ? 'rgba(45, 80, 60, 0.18)' : 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: themeColors.accentPrimary }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${txList.length})` },
              { id: 'active', label: 'Active Rx' },
              { id: 'completed', label: 'Dispensed' }
            ].map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                size="small"
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

        {/* Transactions Table */}
        <Paper sx={{ borderRadius: '20px', bgcolor: themeColors.bgPaper, overflow: 'hidden', border: `1px solid ${themeColors.border}` }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                <TableRow sx={{ '& th': { borderColor: themeColors.border, color: themeColors.textSecondary, fontWeight: 800 } }}>
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
                      <CircularProgress sx={{ color: themeColors.accentPrimary }} />
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: themeColors.textSecondary }}>
                      No prescription transactions found under selected filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx: any) => (
                    <TableRow key={tx.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                      <TableCell sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: themeColors.accentPrimary, fontSize: '0.85rem' }}>
                        #{String(tx.id).slice(-8)}
                      </TableCell>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedUser({ id: tx.doctor?.id, firstName: tx.doctor?.name, role: 'doctor', email: tx.doctor?.email })}
                          sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentPrimary } }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 800, color: isLight ? '#008F68' : '#34D399' }}>
                            {tx.doctor?.name || 'Unknown Doctor'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                            {tx.doctor?.specialization || 'General Physician'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedUser({ id: tx.patient?.id, firstName: tx.patient?.name, role: 'patient', email: tx.patient?.email })}
                          sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentSecondary } }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 800, color: isLight ? '#0284C7' : '#60A5FA' }}>
                            {tx.patient?.name || 'Unknown Patient'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                            {tx.patient?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                          {Array.isArray(tx.provisionalDiagnosis) ? tx.provisionalDiagnosis.join(', ') : formatSafeStr(tx.diagnosis || tx.provisionalDiagnosis, 'Diagnosis Record')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>
                          {formatSafeStr(tx.medication, 'Medication items')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(tx.status || 'active').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: tx.status === 'completed' ? (isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(59, 130, 246, 0.15)') : 'rgba(16, 185, 129, 0.15)',
                            color: tx.status === 'completed' ? themeColors.accentSecondary : (isLight ? '#059669' : '#34D399'),
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
                            borderColor: isLight ? 'rgba(0, 143, 104, 0.4)' : 'rgba(0, 200, 150, 0.4)',
                            color: themeColors.accentPrimary,
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            '&:hover': { bgcolor: isLight ? 'rgba(0, 143, 104, 0.1)' : 'rgba(0, 200, 150, 0.15)', borderColor: themeColors.accentPrimary }
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
            bgcolor: themeColors.bgPaper,
            color: themeColors.textPrimary,
            border: `1px solid ${themeColors.border}`
          }
        }}
      >
        {selectedTx && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode2Icon sx={{ color: themeColors.accentPrimary, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  Prescription Transaction Record #{String(selectedTx.id).slice(-8)}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailModalOpen(false)} size="small" sx={{ color: themeColors.textSecondary }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 3, mt: 1 }}>
                <Paper sx={{ p: 2, bgcolor: isLight ? 'rgba(0, 143, 104, 0.08)' : 'rgba(0, 200, 150, 0.06)', border: isLight ? '1px solid rgba(0, 143, 104, 0.25)' : '1px solid rgba(0, 200, 150, 0.2)', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: themeColors.accentPrimary, fontWeight: 800, textTransform: 'uppercase' }}>
                    Doctor (Created By)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: themeColors.textPrimary }}>
                    {formatSafeStr(selectedTx.doctor?.name, 'Doctor')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    Email: {formatSafeStr(selectedTx.doctor?.email, 'N/A')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    Specialization: {formatSafeStr(selectedTx.doctor?.specialization, 'General Physician')}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(59, 130, 246, 0.06)', border: isLight ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: themeColors.accentSecondary, fontWeight: 800, textTransform: 'uppercase' }}>
                    Patient (Created For)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: themeColors.textPrimary }}>
                    {formatSafeStr(selectedTx.patient?.name, 'Patient')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    Email: {formatSafeStr(selectedTx.patient?.email, 'N/A')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    Phone: {formatSafeStr(selectedTx.patient?.phone, 'N/A')}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textSecondary, mb: 1 }}>
                  Provisional Diagnosis
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                  {Array.isArray(selectedTx.provisionalDiagnosis) ? selectedTx.provisionalDiagnosis.join(', ') : formatSafeStr(selectedTx.diagnosis || selectedTx.provisionalDiagnosis, 'Routine Clinical Consultation')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textSecondary, mb: 1 }}>
                  Medications &amp; Prescribed Regimen
                </Typography>
                <Paper sx={{ p: 2, bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${themeColors.border}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                    Medication: {formatSafeStr(selectedTx.medication, 'Standard Care Regimen')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                    Dosage: {formatSafeStr(selectedTx.dosage, 'As advised')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
                    Instructions: {formatSafeStr(selectedTx.instructions, 'Take post meals with adequate hydration')}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                  Created At: {new Date(selectedTx.createdAt || Date.now()).toLocaleString()}
                </Typography>
                <Chip label={`QR Code Verified: ${selectedTx.qrCode || selectedTx.id}`} size="small" sx={{ bgcolor: isLight ? 'rgba(0, 143, 104, 0.12)' : 'rgba(0,200,150,0.15)', color: themeColors.accentPrimary, fontWeight: 800 }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeColors.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ color: themeColors.accentPrimary, borderColor: themeColors.accentPrimary, borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
              >
                Print Digital Rx
              </Button>
              <Button onClick={() => setDetailModalOpen(false)} sx={{ color: themeColors.textSecondary }}>
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
