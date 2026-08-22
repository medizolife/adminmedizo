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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import RefreshIcon from '@mui/icons-material/Refresh';
import HealingIcon from '@mui/icons-material/Healing';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';

export default function AssignmentsMatrix() {
  const [tab, setTab] = useState(0);
  const { assignments, isPreloaded, isSyncing, refreshSection, updateAssignmentStatusLocal } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const nurseAssignments = assignments?.nurseAssignments?.items || [];
  const doctorAssignments = assignments?.doctorAssignments?.items || [];
  const loading = !isPreloaded && nurseAssignments.length === 0 && doctorAssignments.length === 0;

  // Filtered Nurse Assignments
  const filteredNurseAssignments = nurseAssignments.filter((a: any) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (a.nurseFirstName && a.nurseFirstName.toLowerCase().includes(q)) ||
        (a.nurseLastName && a.nurseLastName.toLowerCase().includes(q)) ||
        (a.patientFirstName && a.patientFirstName.toLowerCase().includes(q)) ||
        (a.patientLastName && a.patientLastName.toLowerCase().includes(q)) ||
        (a.diseaseCondition && a.diseaseCondition.toLowerCase().includes(q)) ||
        (a.assignmentType && a.assignmentType.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered Doctor Assignments
  const filteredDoctorAssignments = doctorAssignments.filter((a: any) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (a.doctorFirstName && a.doctorFirstName.toLowerCase().includes(q)) ||
        (a.doctorLastName && a.doctorLastName.toLowerCase().includes(q)) ||
        (a.patientFirstName && a.patientFirstName.toLowerCase().includes(q)) ||
        (a.patientLastName && a.patientLastName.toLowerCase().includes(q)) ||
        (a.assignmentType && a.assignmentType.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleToggleNurseStatus = async (item: any) => {
    const nextStatus = item.status === 'active' ? 'paused' : 'active';
    setActionLoading(true);
    try {
      const success = await updateAssignmentStatusLocal(item.id, nextStatus);
      if (success) {
        setToastMessage(`✅ Care task #${item.id.substring(0, 8)} status set to ${nextStatus.toUpperCase()}`);
      }
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async (item: any) => {
    setActionLoading(true);
    try {
      const success = await updateAssignmentStatusLocal(item.id, 'completed');
      if (success) {
        setToastMessage(`✅ Care task #${item.id.substring(0, 8)} marked COMPLETED`);
      }
    } catch (e) {
      alert('Failed to mark completed');
    } finally {
      setActionLoading(false);
    }
  };

  // KPI Metrics Calculation
  const totalNurseTasks = nurseAssignments.length;
  const activeNurseTasks = nurseAssignments.filter((a: any) => a.status === 'active').length;
  const totalDoctorLinks = doctorAssignments.length;
  const conditionsCount = Array.from(new Set(nurseAssignments.map((a: any) => a.diseaseCondition).filter(Boolean))).length;

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AssignmentIndIcon sx={{ color: '#00C896', fontSize: '2.2rem' }} />
              Care Assignment Matrix & Visibility
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              System-wide mapping of doctor-patient primary care and multi-nurse disease/task care assignments
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('assignments')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ color: '#00C896', borderColor: 'rgba(0,200,150,0.3)', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            Refresh Matrix
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(0, 200, 150, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00C896', mb: 0.5 }}>
                <HealingIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Nurse Tasks</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3' }}>
                {totalNurseTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Field Care Tasks</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(76, 175, 80, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4CAF50', mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Active Tasks</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#4CAF50' }}>
                {activeNurseTasks}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Ongoing Patient Monitoring</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38BDF8', mb: 0.5 }}>
                <MedicalServicesIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Doctor Links</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#38BDF8' }}>
                {totalDoctorLinks}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Primary Doctor Ties</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2.2, borderRadius: '18px', bgcolor: '#131F22', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C084FC', mb: 0.5 }}>
                <VerifiedUserIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Conditions Covered</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#C084FC' }}>
                {conditionsCount || 1}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A8A3' }}>Chronic Disease Protocols</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 3.5, borderRadius: '20px', bgcolor: '#131F22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#00C896', height: 3 },
              '& .MuiTab-root': { color: '#94A8A3', fontWeight: 700, textTransform: 'none', py: 1.5, '&.Mui-selected': { color: '#00C896' } }
            }}
          >
            <Tab icon={<HealingIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Nurse-Patient Tasks (${nurseAssignments.length})`} />
            <Tab icon={<MedicalServicesIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Doctor-Patient Links (${doctorAssignments.length})`} />
          </Tabs>

          <Box sx={{ flex: 1, minWidth: 260 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search matrix by Nurse, Patient, Doctor, or Condition..."
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
                  borderRadius: '12px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: '#00C896' }
                }
              }}
            />
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: '#131F22', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#00C896' }} />
            </Box>
          ) : tab === 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#0B1315' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Nurse Practitioner</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Care Task / Condition</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Frequency & Period</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Assigned By Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: '#94A8A3', fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNurseAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No nurse-patient assignments found under selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNurseAssignments.map((a: any) => (
                      <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.nurseId, firstName: a.nurseFirstName, lastName: a.nurseLastName, role: 'nurse' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              {a.nurseFirstName} {a.nurseLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.patientId, firstName: a.patientFirstName, lastName: a.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              {a.patientFirstName} {a.patientLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={a.assignmentType?.replace(/_/g, ' ').toUpperCase() || 'GENERAL CARE'}
                            size="small"
                            sx={{ bgcolor: 'rgba(0,200,150,0.15)', color: '#00C896', fontWeight: 700, mr: 1 }}
                          />
                          {a.diseaseCondition && (
                            <Typography variant="body2" sx={{ color: '#EBF5F3', mt: 0.5, fontWeight: 600 }}>
                              {a.diseaseCondition}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {typeof a.frequency === 'object' && a.frequency !== null
                              ? Object.entries(a.frequency).filter(([_, v]) => Boolean(v)).map(([k, v]) => `${k}: ${v}`).join(', ') || 'DAILY'
                              : String(a.frequency || 'DAILY').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            Since {new Date(a.startDate || Date.now()).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3' }}>
                          {a.doctorFirstName ? `Dr. ${a.doctorFirstName} ${a.doctorLastName}` : 'System Admin'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(a.status || 'active').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: a.status === 'active' ? 'rgba(76,175,80,0.15)' : a.status === 'paused' ? 'rgba(255,152,0,0.15)' : 'rgba(255,255,255,0.05)',
                              color: a.status === 'active' ? '#4CAF50' : a.status === 'paused' ? '#FF9800' : '#94A8A3',
                              fontWeight: 800,
                              fontSize: '0.72rem'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={actionLoading}
                              onClick={() => handleToggleNurseStatus(a)}
                              startIcon={a.status === 'active' ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
                              sx={{
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                color: a.status === 'active' ? '#FF9800' : '#4CAF50',
                                borderColor: a.status === 'active' ? 'rgba(255,152,0,0.4)' : 'rgba(76,175,80,0.4)',
                                textTransform: 'none'
                              }}
                            >
                              {a.status === 'active' ? 'Pause' : 'Resume'}
                            </Button>
                            {a.status !== 'completed' && (
                              <Button
                                variant="contained"
                                size="small"
                                disabled={actionLoading}
                                onClick={() => handleMarkCompleted(a)}
                                sx={{
                                  borderRadius: '10px',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  bgcolor: '#00C896',
                                  color: '#0B1315',
                                  textTransform: 'none'
                                }}
                              >
                                Done
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#0B1315' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Primary Care Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Specialization</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Assignment Type</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Linked Since</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDoctorAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No doctor-patient assignments found under selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctorAssignments.map((a: any) => (
                      <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.doctorId, firstName: a.doctorFirstName, lastName: a.doctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              Dr. {a.doctorFirstName} {a.doctorLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#00C896', fontWeight: 600 }}>
                          {a.doctorSpecialization || 'General Physician'}
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.patientId, firstName: a.patientFirstName, lastName: a.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              {a.patientFirstName} {a.patientLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={a.assignmentType?.replace(/_/g, ' ').toUpperCase() || 'PRIMARY CARE'}
                            size="small"
                            sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3' }}>
                          {new Date(a.startDate || a.createdAt || Date.now()).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(a.status || 'active').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: a.status === 'active' ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
                              color: a.status === 'active' ? '#4CAF50' : '#94A8A3',
                              fontWeight: 800,
                              fontSize: '0.72rem'
                            }}
                          />
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

      {/* User 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        userId={selectedUser?.id || selectedUser?._id || selectedUser?.email}
        initialUserData={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdated={() => refreshSection('assignments')}
      />
    </AdminLayout>
  );
}
