'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { adminApi } from '@/services/adminApi';

export default function PrescriptionTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPrescriptionTransactions();
      if (res.success) {
        setTransactions(res.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (!search) return true;
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptLongIcon sx={{ color: '#7C4DFF', fontSize: 32 }} /> Prescription Transactions Audit Log
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
            Complete real-time transaction log showing who created prescriptions for whom across the system
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchTransactions}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: '12px', borderColor: 'rgba(124, 77, 255, 0.3)', color: '#7C4DFF', fontWeight: 700 }}
        >
          Refresh Logs
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: '20px', bgcolor: '#131F22' }}>
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
              '&:hover fieldset': { borderColor: '#7C4DFF' }
            }
          }}
        />
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: '#131F22', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 700 } }}>
                <TableCell>Date & Time</TableCell>
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
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A8A3' }}>
                    No prescription transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: '#EBF5F3' } }}>
                    <TableCell sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#7C4DFF', fontSize: '0.8rem' }}>
                      #{String(tx.id).slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Box
                        onClick={() => setSelectedUser({ id: tx.doctor?.id, firstName: tx.doctor?.name, role: 'doctor', email: tx.doctor?.email })}
                        sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { opacity: 0.8 } }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#33D3AA' }}>
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
                        sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { opacity: 0.8 } }}
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
                        {Array.isArray(tx.provisionalDiagnosis) ? tx.provisionalDiagnosis.join(', ') : 'Diagnosis Record'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block' }}>
                        {tx.medication || 'Medication items'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.status || 'active'}
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
                        sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.15)', color: '#EBF5F3', fontWeight: 700 }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
            p: 1
          }
        }}
      >
        {selectedTx && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode2Icon sx={{ color: '#00C896', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Prescription Transaction Record #{String(selectedTx.id).slice(-8)}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailModalOpen(false)} size="small">
                <CloseIcon sx={{ color: '#EBF5F3' }} />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 200, 150, 0.06)', border: '1px solid rgba(0, 200, 150, 0.2)', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: '#00C896', fontWeight: 800, textTransform: 'uppercase' }}>
                    Doctor (Created By)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {selectedTx.doctor?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Email: {selectedTx.doctor?.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Specialization: {selectedTx.doctor?.specialization}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 800, textTransform: 'uppercase' }}>
                    Patient (Created For)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {selectedTx.patient?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Email: {selectedTx.patient?.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                    Phone: {selectedTx.patient?.phone}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94A8A3', mb: 1 }}>
                  Provisional Diagnosis
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {Array.isArray(selectedTx.provisionalDiagnosis) ? selectedTx.provisionalDiagnosis.join(', ') : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94A8A3', mb: 1 }}>
                  Medications & Instructions
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Medication: {selectedTx.medication || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
                    Dosage: {selectedTx.dosage || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
                    Instructions: {selectedTx.instructions || 'N/A'}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                  Created At: {new Date(selectedTx.createdAt).toLocaleString()}
                </Typography>
                <Chip label={`QR Code Verified: ${selectedTx.qrCode}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#00C896', fontWeight: 800 }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
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
        onUserUpdated={fetchTransactions}
      />
    </AdminLayout>
  );
}
