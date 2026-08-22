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

export default function ReferralsOversight() {
  const { referrals, isPreloaded, isSyncing, refreshSection, updateReferralStatusLocal } = useAdminData();
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
      const match =
        (r.referralNumber && r.referralNumber.toLowerCase().includes(q)) ||
        (r.referringDoctorFirstName && r.referringDoctorFirstName.toLowerCase().includes(q)) ||
        (r.referringDoctorLastName && r.referringDoctorLastName.toLowerCase().includes(q)) ||
        (r.referredDoctorFirstName && r.referredDoctorFirstName.toLowerCase().includes(q)) ||
        (r.referredDoctorLastName && r.referredDoctorLastName.toLowerCase().includes(q)) ||
        (r.patientFirstName && r.patientFirstName.toLowerCase().includes(q)) ||
        (r.patientLastName && r.patientLastName.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.clinicalSummary && r.clinicalSummary.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // KPI Metrics Calculation
  const totalReferrals = refList.length;
  const pendingTriage = refList.filter((r: any) => r.status === 'pending').length;
  const urgentCount = refList.filter((r: any) => r.priority === 'urgent' || r.urgency === 'urgent').length;
  const completedTransfers = refList.filter((r: any) => r.status === 'accepted' || r.status === 'completed').length;

  const handleOpenReferral = (r: any) => {
    setSelectedReferral(r);
    setNewStatus(r.status || 'pending');
    setResponseNotes(r.responseNotes || '');
  };

  const handleSaveReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setActionLoading(true);

    try {
      await updateReferralStatusLocal(selectedReferral.id, newStatus, responseNotes);
      setToastMessage(`✅ Referral #${selectedReferral.referralNumber} status updated to ${newStatus.toUpperCase()}`);
      setSelectedReferral(null);
    } catch (err) {
      alert('Failed to update referral');
    } finally {
      setActionLoading(false);
    }
  };

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
        label={(status || 'pending').toUpperCase()}
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
              <SwapHorizIcon sx={{ color: '#00C896', fontSize: '2.2rem' }} />
              Doctor Clinical Network &amp; Referrals Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Inter-doctor specialty transfers, second opinion handoffs, and specialist triage
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('referrals')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ color: '#00C896', borderColor: 'rgba(0,200,150,0.3)', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            Refresh Referrals
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* 4 Executive KPI Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(0, 200, 150, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00C896', mb: 0.5 }}>
                <SwapHorizIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Referrals</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                {totalReferrals}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Cross-Specialty Transfers</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(255, 152, 0, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF9800', mb: 0.5 }}>
                <PendingActionsIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Pending Triage</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF9800' }}>
                {pendingTriage}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Awaiting Specialist Acceptance</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#EF4444', mb: 0.5 }}>
                <WarningAmberIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Urgent Priority</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#EF4444' }}>
                {urgentCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>High-Acuity Referrals</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(76, 175, 80, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50', mb: 0.5 }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Accepted &amp; Completed</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#4CAF50' }}>
                {completedTransfers}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Successful Handoffs</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter & Search Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: '#131F22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by Referral #, Referring Doctor, Specialist, Patient, or Diagnosis..."
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

        {/* Referrals Table */}
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
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Referral #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Referring Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Target Specialist</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Clinical Reason</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Priority</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: '#94A8A3', fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReferrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No referrals found under selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReferrals.map((r: any) => (
                      <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                          {r.referralNumber}
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.referringDoctorId, firstName: r.referringDoctorFirstName, lastName: r.referringDoctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#EBF5F3' }}>
                              Dr. {r.referringDoctorFirstName} {r.referringDoctorLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.referredDoctorId, firstName: r.referredDoctorFirstName, lastName: r.referredDoctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#38BDF8' } }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#38BDF8' }}>
                              Dr. {r.referredDoctorFirstName} {r.referredDoctorLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.patientId, firstName: r.patientFirstName, lastName: r.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#EBF5F3' }}>
                              {r.patientFirstName} {r.patientLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3', maxWidth: 220 }}>
                          <Typography variant="body2" noWrap sx={{ color: '#EBF5F3', fontWeight: 600 }}>
                            {r.reason || 'Specialist Consultation'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.priority?.toUpperCase() || 'ROUTINE'}
                            size="small"
                            sx={{
                              bgcolor: r.priority === 'urgent' ? 'rgba(244,67,54,0.15)' : 'rgba(255,255,255,0.05)',
                              color: r.priority === 'urgent' ? '#F44336' : '#94A8A3',
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
                              color: '#00C896',
                              borderColor: 'rgba(0, 200, 150, 0.4)',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(0, 200, 150, 0.15)', borderColor: '#00C896' }
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
        PaperProps={{ sx: { bgcolor: '#131F22', color: '#EBF5F3', borderRadius: '20px', border: '1px solid rgba(0,200,150,0.3)' } }}
      >
        {selectedReferral && (
          <form onSubmit={handleSaveReferral}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <MedicalServicesIcon sx={{ color: '#00C896' }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Clinical Referral #{selectedReferral.referralNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedReferral(null)} sx={{ color: '#94A8A3' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Doctor Network Strip */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94A8A3' }}>REFERRING DOCTOR</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#EBF5F3', fontWeight: 800 }}>
                      Dr. {selectedReferral.referringDoctorFirstName} {selectedReferral.referringDoctorLastName}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(0,200,150,0.04)', border: '1px solid rgba(0,200,150,0.2)' }}>
                    <Typography variant="caption" sx={{ color: '#00C896' }}>TARGET SPECIALIST</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#00C896', fontWeight: 800 }}>
                      Dr. {selectedReferral.referredDoctorFirstName} {selectedReferral.referredDoctorLastName}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Patient Profile */}
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>PATIENT</Typography>
                <Typography variant="body1" sx={{ color: '#EBF5F3', fontWeight: 800 }}>
                  {selectedReferral.patientFirstName} {selectedReferral.patientLastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#38BDF8', display: 'block', mt: 0.5 }}>
                  Clinical Reason: {selectedReferral.reason || 'Specialist Evaluation'}
                </Typography>
              </Paper>

              {/* Clinical Summary */}
              {selectedReferral.clinicalSummary && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A8A3' }}>Clinical Diagnostic Summary:</Typography>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#EBF5F3' }}>
                      {selectedReferral.clinicalSummary}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Status Select */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A8A3' }}>Referral Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Referral Status"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#EBF5F3',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }
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
                InputLabelProps={{ sx: { color: '#94A8A3' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#EBF5F3',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }
                  }
                }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button onClick={() => setSelectedReferral(null)} sx={{ color: '#94A8A3' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
                sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, borderRadius: '10px' }}
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
