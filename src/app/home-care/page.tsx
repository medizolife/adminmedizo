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

export default function HomeCareOversight() {
  const { homeCare, nurses, isPreloaded, isSyncing, refreshSection, updateHomeCareStatusLocal, assignNurseToHomeCareLocal } = useAdminData();
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
      const match =
        (r.requestNumber && r.requestNumber.toLowerCase().includes(q)) ||
        (r.patientFirstName && r.patientFirstName.toLowerCase().includes(q)) ||
        (r.patientLastName && r.patientLastName.toLowerCase().includes(q)) ||
        (r.nurseFirstName && r.nurseFirstName.toLowerCase().includes(q)) ||
        (r.nurseLastName && r.nurseLastName.toLowerCase().includes(q)) ||
        (r.serviceType && r.serviceType.toLowerCase().includes(q)) ||
        (r.address && r.address.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // KPI Metrics Calculation
  const totalCount = requests.length;
  const pendingCount = requests.filter((r: any) => r.status === 'requested' || r.status === 'approved').length;
  const inProgressCount = requests.filter((r: any) => r.status === 'assigned' || r.status === 'in_progress').length;
  const completedCount = requests.filter((r: any) => r.status === 'completed').length;

  const handleOpenDispatch = (req: any) => {
    setActiveRequest(req);
    setSelectedNurseId(req.assignedNurseId || req.nurseId || '');
    setSelectedStatus(req.status || 'requested');
    setDispatchModalOpen(true);
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;
    setActionLoading(true);

    try {
      // 1. If nurse changed/assigned
      if (selectedNurseId && selectedNurseId !== activeRequest.assignedNurseId) {
        const nurseObj = nurses.find((n: any) => String(n.id) === String(selectedNurseId));
        await assignNurseToHomeCareLocal(activeRequest.id, selectedNurseId, nurseObj);
      }

      // 2. If status updated
      if (selectedStatus && selectedStatus !== activeRequest.status) {
        await updateHomeCareStatusLocal(activeRequest.id, selectedStatus);
      }

      setToastMessage(`✅ Request #${activeRequest.requestNumber} updated successfully!`);
      setDispatchModalOpen(false);
    } catch (err: any) {
      console.error('Error updating dispatch:', err);
      alert('Failed to update home care dispatch');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      requested: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)' },
      approved: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)' },
      assigned: { color: '#9C27B0', bg: 'rgba(156,39,176,0.15)' },
      in_progress: { color: '#00BCD4', bg: 'rgba(0,188,212,0.15)' },
      completed: { color: '#4CAF50', bg: 'rgba(76,175,80,0.15)' },
      cancelled: { color: '#F44336', bg: 'rgba(244,67,54,0.15)' }
    };
    const s = map[status] || { color: '#94A8A3', bg: 'rgba(255,255,255,0.05)' };
    return (
      <Chip
        label={(status || 'requested').toUpperCase()}
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
              <HomeWorkIcon sx={{ color: '#00C896', fontSize: '2.2rem' }} />
              Home Care &amp; Clinical Dispatch Oversight
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Manage patient home visit requests, nurse dispatch scheduling, and SLA turnaround
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('homeCare')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ color: '#00C896', borderColor: 'rgba(0,200,150,0.3)', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            Refresh Data
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
                <HomeWorkIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Requests</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>All Recorded Dispatches</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(255, 152, 0, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF9800', mb: 0.5 }}>
                <PendingActionsIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Pending Approval</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF9800' }}>
                {pendingCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Requires Nurse Assignment</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(0, 188, 212, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00BCD4', mb: 0.5 }}>
                <DirectionsCarIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>In Progress / En Route</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#00BCD4' }}>
                {inProgressCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Active Field Visits</Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(76, 175, 80, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50', mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Completed Visits</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#4CAF50' }}>
                {completedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Fulfilled Care Visits</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter & Search Bar */}
        <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: '20px', bgcolor: '#131F22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Search by Request #, Patient, Nurse, Service Type, or Address..."
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

        {/* Requests Table */}
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
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Request #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient Details</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Service Type &amp; Urgency</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Assigned Nurse</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Preferred Schedule</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: '#94A8A3', fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No home care requests found under selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((r: any) => (
                      <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                          {r.requestNumber}
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: r.patientId, firstName: r.patientFirstName, lastName: r.patientLastName, role: 'patient', phone: r.contactPhone || r.patientPhone })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              {r.patientFirstName} {r.patientLastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block' }}>
                              {r.contactPhone || r.patientPhone || 'No phone'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#EBF5F3', fontWeight: 600 }}>
                            {r.serviceType?.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Chip
                            label={r.urgency?.toUpperCase() || 'ROUTINE'}
                            size="small"
                            sx={{
                              bgcolor: r.urgency === 'urgent' ? 'rgba(244,67,54,0.15)' : 'rgba(255,255,255,0.05)',
                              color: r.urgency === 'urgent' ? '#F44336' : '#94A8A3',
                              fontSize: '0.65rem',
                              height: 18
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {r.nurseFirstName ? (
                            <Box
                              onClick={() => r.assignedNurseId && setSelectedUser({ id: r.assignedNurseId, firstName: r.nurseFirstName, lastName: r.nurseLastName, role: 'nurse' })}
                              sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#C084FC' } }}
                            >
                              <Typography sx={{ color: '#00C896', fontWeight: 700 }}>
                                {r.nurseFirstName} {r.nurseLastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A8A3', display: 'block' }}>
                                {r.nursePhone || 'RN Field Nurse'}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="Unassigned Nurse" size="small" sx={{ bgcolor: 'rgba(255,152,0,0.15)', color: '#FF9800', fontWeight: 800, fontSize: '0.68rem' }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3' }}>
                          <Typography variant="body2">{r.preferredDate || 'Immediate'}</Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>{r.preferredTimeSlot || 'Morning'}</Typography>
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
                              color: '#00C896',
                              borderColor: 'rgba(0, 200, 150, 0.4)',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(0, 200, 150, 0.15)', borderColor: '#00C896' }
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
        PaperProps={{ sx: { bgcolor: '#131F22', color: '#EBF5F3', borderRadius: '20px', border: '1px solid rgba(0,200,150,0.3)' } }}
      >
        {activeRequest && (
          <form onSubmit={handleSaveDispatch}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <PersonPinIcon sx={{ color: '#00C896' }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Manage Home Care Dispatch #{activeRequest.requestNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setDispatchModalOpen(false)} sx={{ color: '#94A8A3' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Patient Profile Card */}
              <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="caption" sx={{ color: '#94A8A3' }}>PATIENT</Typography>
                <Typography variant="subtitle1" sx={{ color: '#EBF5F3', fontWeight: 800 }}>
                  {activeRequest.patientFirstName} {activeRequest.patientLastName} ({activeRequest.contactPhone || activeRequest.patientPhone || 'N/A'})
                </Typography>
                <Typography variant="caption" sx={{ color: '#38BDF8', display: 'block', mt: 0.5 }}>
                  Address: {activeRequest.address || 'Patna Primary Residence'}
                </Typography>
              </Paper>

              {/* Nurse Assignment Select */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A8A3' }}>Assign Field Nurse</InputLabel>
                <Select
                  value={selectedNurseId}
                  onChange={(e) => setSelectedNurseId(e.target.value)}
                  label="Assign Field Nurse"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#EBF5F3',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }
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
                <InputLabel sx={{ color: '#94A8A3' }}>Dispatch Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Dispatch Status"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#EBF5F3',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }
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
                  <Typography variant="caption" sx={{ color: '#94A8A3' }}>Doctor / Clinical Instructions:</Typography>
                  <Paper sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.2)', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#EBF5F3' }}>
                      {activeRequest.clinicalInstructions}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button onClick={() => setDispatchModalOpen(false)} sx={{ color: '#94A8A3' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
                sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, borderRadius: '10px' }}
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
