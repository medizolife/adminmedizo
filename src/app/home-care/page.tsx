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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import HomeWorkIcon from '@mui/icons-material/HomeWork';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PersonPinIcon from '@mui/icons-material/PersonPin';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function HomeCareOversight() {
  const { homeCare, nurses, isPreloaded, isSyncing, refreshSection, updateHomeCareStatusLocal, assignNurseToHomeCareLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const requests = homeCare || [];
  const loading = !isPreloaded && requests.length === 0;

  // Filtered requests
  const filteredRequests = requests.filter((r: any) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        String(r.requestNumber || '').toLowerCase().includes(q) ||
        String(r.patientFirstName || '').toLowerCase().includes(q) ||
        String(r.patientLastName || '').toLowerCase().includes(q) ||
        String(r.nurseFirstName || '').toLowerCase().includes(q) ||
        String(r.nurseLastName || '').toLowerCase().includes(q) ||
        String(r.serviceType || '').toLowerCase().includes(q) ||
        String(r.address || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const requestedCount = requests.filter((r: any) => r.status === 'requested').length;
  const assignedCount = requests.filter((r: any) => r.status === 'assigned' || r.status === 'approved').length;
  const inProgressCount = requests.filter((r: any) => r.status === 'in_progress').length;
  const completedCount = requests.filter((r: any) => r.status === 'completed').length;

  const handleOpenDispatch = (req: any) => {
    setActiveRequest(req);
    setSelectedNurseId(req.assignedNurseId || '');
    setSelectedStatus(req.status || 'requested');
    setDispatchModalOpen(true);
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;
    setActionLoading(true);
    try {
      if (selectedNurseId && selectedNurseId !== activeRequest.assignedNurseId) {
        const foundNurse = nurses.find((n: any) => (n.id || n._id) === selectedNurseId);
        await assignNurseToHomeCareLocal(activeRequest.id, selectedNurseId, foundNurse);
      }
      if (selectedStatus && selectedStatus !== activeRequest.status) {
        await updateHomeCareStatusLocal(activeRequest.id, selectedStatus);
      }
      setToastMessage(`Home care request #${activeRequest.requestNumber} updated successfully!`);
      setDispatchModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update home care request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'requested':
        return <Chip label="Requested" size="small" sx={{ bgcolor: 'rgba(255, 152, 0, 0.15)', color: '#FF9800', fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'approved':
      case 'assigned':
        return <Chip label="Assigned" size="small" sx={{ bgcolor: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)', color: themeColors.accentSecondary, fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'in_progress':
        return <Chip label="In Progress" size="small" sx={{ bgcolor: 'rgba(0, 188, 212, 0.15)', color: '#00BCD4', fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'completed':
        return <Chip label="Completed" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.15)', color: isLight ? '#059669' : '#4CAF50', fontWeight: 800, fontSize: '0.72rem' }} />;
      case 'cancelled':
        return <Chip label="Cancelled" size="small" sx={{ bgcolor: 'rgba(244, 67, 54, 0.15)', color: '#F44336', fontWeight: 800, fontSize: '0.72rem' }} />;
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
              <HomeWorkIcon sx={{ color: themeColors.accentTertiary, fontSize: 32 }} /> Home Care Dispatch &amp; Nursing Requests
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              Manage doorstep medical care orders, post-op wound recovery, and nurse field deployments
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('homeCare')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(124, 58, 237, 0.4)' : 'rgba(192, 132, 252, 0.3)', color: themeColors.accentTertiary, fontWeight: 700 }}
          >
            Refresh Requests
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: isLight ? '#065F46' : '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* 4 Status Quick Metrics */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF9800', mb: 0.5 }}>
                <PendingActionsIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>New Requests</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF9800' }}>
                {requestedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Awaiting Nurse Dispatch</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentSecondary, mb: 0.5 }}>
                <DirectionsCarIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Assigned Nurses</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.accentSecondary }}>
                {assignedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Scheduled for Visits</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00BCD4', mb: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>In Progress</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#00BCD4' }}>
                {inProgressCount}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Active Field Visits</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isLight ? '#059669' : '#4CAF50', mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Completed Visits</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: isLight ? '#059669' : '#4CAF50' }}>
                {completedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Fulfilled Care Visits</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter & Search Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: themeColors.bgPaper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, border: `1px solid ${themeColors.border}` }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by Request #, Patient, Nurse, Service Type, or Address..."
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
              { id: 'all', label: 'All Requests' },
              { id: 'requested', label: 'Requested' },
              { id: 'assigned', label: 'Assigned' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' }
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

        {/* Requests Table */}
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
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Request #</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Patient Details</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Service Type &amp; Urgency</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Assigned Nurse</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Preferred Schedule</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: themeColors.textSecondary }}>
                        No home care requests found under selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((r: any) => (
                      <TableRow key={r.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell sx={{ color: themeColors.accentPrimary, fontWeight: 700, fontFamily: 'monospace' }}>
                          {r.requestNumber}
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.patientId, firstName: r.patientFirstName, lastName: r.patientLastName, role: 'patient', phone: r.contactPhone || r.patientPhone })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentSecondary } }}
                          >
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>
                              {r.patientFirstName} {r.patientLastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>
                              {r.contactPhone || r.patientPhone || 'No phone'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: themeColors.textPrimary, fontWeight: 600 }}>
                            {r.serviceType?.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Chip
                            label={r.urgency?.toUpperCase() || 'ROUTINE'}
                            size="small"
                            sx={{
                              bgcolor: r.urgency === 'urgent' ? 'rgba(244,67,54,0.15)' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
                              color: r.urgency === 'urgent' ? '#F44336' : themeColors.textSecondary,
                              fontSize: '0.65rem',
                              height: 18
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {r.nurseFirstName ? (
                            <Box
                              onClick={() => r.assignedNurseId && setSelectedUser({ id: r.assignedNurseId, firstName: r.nurseFirstName, lastName: r.nurseLastName, role: 'nurse' })}
                              sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentTertiary } }}
                            >
                              <Typography sx={{ color: themeColors.accentPrimary, fontWeight: 700 }}>
                                {r.nurseFirstName} {r.nurseLastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>
                                {r.nursePhone || 'RN Field Nurse'}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="Unassigned Nurse" size="small" sx={{ bgcolor: 'rgba(255,152,0,0.15)', color: '#FF9800', fontWeight: 800, fontSize: '0.68rem' }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: themeColors.textPrimary }}>
                          <Typography variant="body2">{r.preferredDate || 'Immediate'}</Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{r.preferredTimeSlot || 'Morning'}</Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(r.status)}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenDispatch(r)}
                            startIcon={<DirectionsCarIcon />}
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
                            Dispatch &amp; Manage
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

      {/* Dispatch & Nurse Assignment Modal */}
      <Dialog
        open={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: themeColors.bgPaper, color: themeColors.textPrimary, borderRadius: '20px', border: `1px solid ${themeColors.border}` } }}
      >
        {activeRequest && (
          <form onSubmit={handleSaveDispatch}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <PersonPinIcon sx={{ color: themeColors.accentPrimary }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                  Manage Home Care Dispatch #{activeRequest.requestNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setDispatchModalOpen(false)} sx={{ color: themeColors.textSecondary }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Patient Profile Card */}
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)', border: `1px solid ${themeColors.border}` }}>
                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>PATIENT</Typography>
                <Typography variant="subtitle1" sx={{ color: themeColors.textPrimary, fontWeight: 800 }}>
                  {activeRequest.patientFirstName} {activeRequest.patientLastName} ({activeRequest.contactPhone || activeRequest.patientPhone || 'N/A'})
                </Typography>
                <Typography variant="caption" sx={{ color: themeColors.accentSecondary, display: 'block', mt: 0.5 }}>
                  Address: {activeRequest.address || 'Patna Primary Residence'}
                </Typography>
              </Paper>

              {/* Nurse Assignment Select */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: themeColors.textSecondary }}>Assign Field Nurse</InputLabel>
                <Select
                  value={selectedNurseId}
                  onChange={(e) => setSelectedNurseId(e.target.value)}
                  label="Assign Field Nurse"
                  sx={{
                    bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                    color: themeColors.textPrimary,
                    borderRadius: '12px'
                  }}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {nurses.map((n: any) => (
                    <MenuItem key={n.id || n._id} value={n.id || n._id}>
                      {n.firstName} {n.lastName} ({n.nurseSpecialization || 'Clinical Care'}) • {n.phone || 'RN'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Select */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: themeColors.textSecondary }}>Dispatch Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Dispatch Status"
                  sx={{
                    bgcolor: isLight ? '#FAF8F5' : 'rgba(255,255,255,0.03)',
                    color: themeColors.textPrimary,
                    borderRadius: '12px'
                  }}
                >
                  <MenuItem value="requested">Requested (Pending Approval)</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="assigned">Assigned to Nurse</MenuItem>
                  <MenuItem value="in_progress">In Progress / En Route</MenuItem>
                  <MenuItem value="completed">Completed &amp; Recorded</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              {/* Clinical Instructions */}
              {activeRequest.clinicalInstructions && (
                <Box>
                  <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Doctor / Clinical Instructions:</Typography>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: isLight ? 'rgba(0, 143, 104, 0.08)' : 'rgba(0,200,150,0.05)', border: isLight ? '1px solid rgba(0, 143, 104, 0.25)' : '1px solid rgba(0,200,150,0.2)', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>
                      {activeRequest.clinicalInstructions}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeColors.border}` }}>
              <Button onClick={() => setDispatchModalOpen(false)} sx={{ color: themeColors.textSecondary }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
                sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, borderRadius: '10px', '&:hover': { bgcolor: isLight ? '#007A5A' : '#00A87E' } }}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Save Dispatch Updates'}
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
        onUserUpdated={() => refreshSection('homeCare')}
      />
    </AdminLayout>
  );
}
