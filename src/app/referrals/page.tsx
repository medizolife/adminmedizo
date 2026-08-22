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
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VisibilityIcon from '@mui/icons-material/Visibility';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function ReferralsOversight() {
  const { referrals, isPreloaded, isSyncing, refreshSection, updateReferralStatusLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [responseNotes, setResponseNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const refList = referrals || [];
  const loading = !isPreloaded && refList.length === 0;

  const filteredReferrals = refList.filter((r: any) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        String(r.referralNumber || '').toLowerCase().includes(q) ||
        String(r.referringDoctorFirstName || '').toLowerCase().includes(q) ||
        String(r.referringDoctorLastName || '').toLowerCase().includes(q) ||
        String(r.referredDoctorFirstName || '').toLowerCase().includes(q) ||
        String(r.referredDoctorLastName || '').toLowerCase().includes(q) ||
        String(r.patientFirstName || '').toLowerCase().includes(q) ||
        String(r.patientLastName || '').toLowerCase().includes(q) ||
        String(r.reason || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = refList.filter((r: any) => r.status === 'pending').length;
  const acceptedCount = refList.filter((r: any) => r.status === 'accepted').length;
  const urgentCount = refList.filter((r: any) => r.priority === 'urgent').length;
  const completedTransfers = refList.filter((r: any) => r.status === 'completed').length;

  const handleOpenReferral = (ref: any) => {
    setSelectedReferral(ref);
    setNewStatus(ref.status || 'pending');
    setResponseNotes(ref.responseNotes || '');
  };

  const handleSaveReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setActionLoading(true);
    try {
      await updateReferralStatusLocal(selectedReferral.id, newStatus, responseNotes);
      setToastMessage(`Referral #${selectedReferral.referralNumber} status updated to ${newStatus.toUpperCase()}!`);
      setSelectedReferral(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update referral status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" size="small" sx={{ bgcolor: 'rgba(255, 152, 0, 0.15)', color: '#FF9800', fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'accepted':
        return <Chip label="Accepted" size="small" sx={{ bgcolor: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)', color: themeColors.accentSecondary, fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'completed':
        return <Chip label="Completed" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.15)', color: isLight ? '#059669' : '#4CAF50', fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'rejected':
        return <Chip label="Rejected" size="small" sx={{ bgcolor: 'rgba(244, 67, 54, 0.15)', color: '#F44336', fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'cancelled':
        return <Chip label="Cancelled" size="small" sx={{ bgcolor: isLight ? '#EBE5D8' : 'rgba(255, 255, 255, 0.05)', color: themeColors.textSecondary, fontWeight: 800, fontSize: '0.72rem' }} />;
      default:
        return <Chip label={status || 'Unknown'} size="small" sx={{ bgcolor: isLight ? '#EBE5D8' : 'rgba(255, 255, 255, 0.05)', color: themeColors.textSecondary, fontWeight: 800, fontSize: '0.72rem' }} />;
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SwapHorizIcon sx={{ color: themeColors.accentSecondary, fontSize: 32 }} /> Doctor-to-Doctor Referral Network
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              Inter-specialist clinical handoffs, second opinions, emergency escalations, and diagnostic referrals
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('referrals')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(56, 189, 248, 0.3)', color: themeColors.accentSecondary, fontWeight: 700 }}
          >
            Refresh Referrals
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: isLight ? '#065F46' : '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* 4 Status KPI Strip */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF9800', mb: 0.5 }}>
                <PendingActionsIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Pending Triage</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF9800' }}>
                {pendingCount}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Awaiting Specialist Review</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentSecondary, mb: 0.5 }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Accepted Referrals</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.accentSecondary }}>
                {acceptedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Scheduled for Evaluation</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F44336', mb: 0.5 }}>
                <WarningAmberIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Urgent Escalations</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F44336' }}>
                {urgentCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#F44336' }}>High Priority Patients</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isLight ? '#059669' : '#4CAF50', mb: 0.5 }}>
                <MedicalServicesIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Completed Handoffs</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: isLight ? '#059669' : '#4CAF50' }}>
                {completedTransfers}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Successful Handoffs</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter & Search Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: themeColors.bgPaper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, border: `1px solid ${themeColors.border}` }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by Referral #, Referring Doctor, Specialist, Patient, or Diagnosis..."
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
                  '&:hover fieldset': { borderColor: themeColors.accentSecondary }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Referrals' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'completed', label: 'Completed' },
              { id: 'rejected', label: 'Rejected' }
            ].map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                onClick={() => setStatusFilter(f.id)}
                sx={{
                  bgcolor: statusFilter === f.id ? themeColors.accentSecondary : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
                  color: statusFilter === f.id ? '#FFFFFF' : themeColors.textPrimary,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  border: statusFilter === f.id ? `1px solid ${themeColors.accentSecondary}` : `1px solid ${themeColors.border}`
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Referrals Table */}
        <Paper sx={{ bgcolor: themeColors.bgPaper, borderRadius: '18px', border: `1px solid ${themeColors.border}`, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: themeColors.accentSecondary }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                  <TableRow>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Referral #</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Referring Doctor</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Target Specialist</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Clinical Reason</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Priority</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReferrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: themeColors.textSecondary }}>
                        No referrals found under selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReferrals.map((r: any) => (
                      <TableRow key={r.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell sx={{ color: themeColors.accentPrimary, fontWeight: 700, fontFamily: 'monospace' }}>
                          {r.referralNumber}
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.referringDoctorId, firstName: r.referringDoctorFirstName, lastName: r.referringDoctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentPrimary } }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                              Dr. {r.referringDoctorFirstName} {r.referringDoctorLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.referredDoctorId, firstName: r.referredDoctorFirstName, lastName: r.referredDoctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentSecondary } }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.accentSecondary }}>
                              Dr. {r.referredDoctorFirstName} {r.referredDoctorLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.patientId, firstName: r.patientFirstName, lastName: r.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentSecondary } }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                              {r.patientFirstName} {r.patientLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: themeColors.textSecondary, maxWidth: 220 }}>
                          <Typography variant="body2" noWrap sx={{ color: themeColors.textPrimary, fontWeight: 600 }}>
                            {r.reason || 'Specialist Consultation'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.priority?.toUpperCase() || 'ROUTINE'}
                            size="small"
                            sx={{
                              bgcolor: r.priority === 'urgent' ? 'rgba(244,67,54,0.15)' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
                              color: r.priority === 'urgent' ? '#F44336' : themeColors.textSecondary,
                              fontSize: '0.68rem',
                              fontWeight: 800
                            }}
                          />
                        </TableCell>
                        <TableCell>{getStatusChip(r.status)}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenReferral(r)}
                            startIcon={<VisibilityIcon />}
                            sx={{
                              borderRadius: '10px',
                              fontWeight: 800,
                              color: themeColors.accentPrimary,
                              borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.4)',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: isLight ? 'rgba(0,143,104,0.1)' : 'rgba(0, 200, 150, 0.15)', borderColor: themeColors.accentPrimary }
                            }}
                          >
                            Inspect &amp; Triage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Clinical Referral Inspection Modal */}
      <Dialog
        open={Boolean(selectedReferral)}
        onClose={() => setSelectedReferral(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: themeColors.bgPaper, color: themeColors.textPrimary, borderRadius: '20px', border: `1px solid ${themeColors.border}` } }}
      >
        {selectedReferral && (
          <form onSubmit={handleSaveReferral}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <MedicalServicesIcon sx={{ color: themeColors.accentPrimary }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  Clinical Referral #{selectedReferral.referralNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedReferral(null)} sx={{ color: themeColors.textSecondary }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Doctor Network Strip */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, borderRadius: '12px', bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)', border: `1px solid ${themeColors.border}` }}>
                    <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>REFERRING DOCTOR</Typography>
                    <Typography variant="subtitle2" sx={{ color: themeColors.textPrimary, fontWeight: 800 }}>
                      Dr. {selectedReferral.referringDoctorFirstName} {selectedReferral.referringDoctorLastName}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, borderRadius: '12px', bgcolor: isLight ? 'rgba(0, 143, 104, 0.08)' : 'rgba(0,200,150,0.04)', border: isLight ? '1px solid rgba(0, 143, 104, 0.25)' : '1px solid rgba(0,200,150,0.2)' }}>
                    <Typography variant="caption" sx={{ color: themeColors.accentPrimary }}>TARGET SPECIALIST</Typography>
                    <Typography variant="subtitle2" sx={{ color: themeColors.accentPrimary, fontWeight: 800 }}>
                      Dr. {selectedReferral.referredDoctorFirstName} {selectedReferral.referredDoctorLastName}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Patient Profile */}
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)', border: `1px solid ${themeColors.border}` }}>
                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>PATIENT</Typography>
                <Typography variant="body1" sx={{ color: themeColors.textPrimary, fontWeight: 800 }}>
                  {selectedReferral.patientFirstName} {selectedReferral.patientLastName}
                </Typography>
                <Typography variant="caption" sx={{ color: themeColors.accentSecondary, display: 'block', mt: 0.5 }}>
                  Clinical Reason: {selectedReferral.reason || 'Specialist Evaluation'}
                </Typography>
              </Paper>

              {/* Clinical Summary */}
              {selectedReferral.clinicalSummary && (
                <Box>
                  <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Clinical Diagnostic Summary:</Typography>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)', border: `1px solid ${themeColors.border}`, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>
                      {selectedReferral.clinicalSummary}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Status Select */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: themeColors.textSecondary }}>Referral Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Referral Status"
                  sx={{
                    bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                    color: themeColors.textPrimary,
                    borderRadius: '12px'
                  }}
                >
                  <MenuItem value="pending">Pending (Awaiting Specialist)</MenuItem>
                  <MenuItem value="accepted">Accepted (Triage Confirmed)</MenuItem>
                  <MenuItem value="completed">Completed (Consultation Finished)</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              {/* Triage / Response Notes */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Specialist Triage / Response Notes"
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                InputLabelProps={{ sx: { color: themeColors.textSecondary } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: themeColors.textPrimary,
                    bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                    borderRadius: '12px'
                  }
                }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeColors.border}` }}>
              <Button onClick={() => setSelectedReferral(null)} sx={{ color: themeColors.textSecondary }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
                sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, borderRadius: '10px', '&:hover': { bgcolor: isLight ? '#007A5A' : '#00A87E' } }}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Save Referral Triage'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* User 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        userId={selectedUser?.id || selectedUser?._id || selectedUser?.email}
        initialUserData={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={() => refreshSection('referrals')}
      />
    </AdminLayout>
  );
}
