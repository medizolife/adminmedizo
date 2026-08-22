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
import { useAppTheme } from '@/context/ThemeContext';

export default function AssignmentsMatrix() {
  const [tab, setTab] = useState(0);
  const { assignments, isPreloaded, isSyncing, refreshSection, updateAssignmentStatusLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
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
    if (statusFilter !== 'all' && (a.status || 'active') !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(a.nurseFirstName || '').toLowerCase().includes(q) ||
      String(a.nurseLastName || '').toLowerCase().includes(q) ||
      String(a.patientFirstName || '').toLowerCase().includes(q) ||
      String(a.patientLastName || '').toLowerCase().includes(q) ||
      String(a.diseaseCondition || '').toLowerCase().includes(q) ||
      String(a.assignmentType || '').toLowerCase().includes(q)
    );
  });

  // Filtered Doctor Assignments
  const filteredDoctorAssignments = doctorAssignments.filter((a: any) => {
    if (statusFilter !== 'all' && (a.status || 'active') !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(a.doctorFirstName || '').toLowerCase().includes(q) ||
      String(a.doctorLastName || '').toLowerCase().includes(q) ||
      String(a.patientFirstName || '').toLowerCase().includes(q) ||
      String(a.patientLastName || '').toLowerCase().includes(q) ||
      String(a.assignmentType || '').toLowerCase().includes(q)
    );
  });

  const handleToggleNurseStatus = async (item: any) => {
    const nextStatus = item.status === 'active' ? 'paused' : 'active';
    setActionLoading(true);
    try {
      const ok = await updateAssignmentStatusLocal(item.id, nextStatus);
      if (ok) setToastMessage(`Care task marked as ${nextStatus.toUpperCase()}`);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async (item: any) => {
    setActionLoading(true);
    try {
      const ok = await updateAssignmentStatusLocal(item.id, 'completed');
      if (ok) setToastMessage(`Care task marked as COMPLETED`);
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
              <AssignmentIndIcon sx={{ color: themeColors.accentPrimary, fontSize: 32 }} /> Clinical Care Assignment Matrix
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              Live deployment tracking: Nurse-to-Patient home care regimens &amp; Doctor-to-Patient primary care links
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refreshSection('assignments')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.3)', color: themeColors.accentPrimary, fontWeight: 700 }}
          >
            Refresh Matrix
          </Button>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: isLight ? '#065F46' : '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* Top Summary Banner */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentPrimary, mb: 1 }}>
                <HealingIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Active Nurse Tasks</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                {assignments?.nurseAssignments?.activeCount || nurseAssignments.filter((a: any) => a.status === 'active').length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#34D399' }}>Home visits &amp; nursing regimens</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentSecondary, mb: 1 }}>
                <MedicalServicesIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Doctor-Patient Links</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                {assignments?.doctorAssignments?.totalLinks || doctorAssignments.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Active consulting links</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentTertiary, mb: 1 }}>
                <VerifiedUserIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Compliance Rate</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                98.4%
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#34D399' }}>Nurse check-in adherence</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.accentWarning, mb: 1 }}>
                <AssignmentIndIcon />
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Total Care Roster</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary }}>
                {(nurseAssignments.length + doctorAssignments.length) || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>Assigned relationships</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs & Filter Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '18px', bgcolor: themeColors.bgPaper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, border: `1px solid ${themeColors.border}` }}>
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: themeColors.accentPrimary, height: 3 },
              '& .MuiTab-root': { color: themeColors.textSecondary, fontWeight: 700, textTransform: 'none', py: 1.5, '&.Mui-selected': { color: themeColors.accentPrimary } }
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
                    <SearchIcon sx={{ color: themeColors.textSecondary }} />
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
        </Paper>

        <Paper sx={{ bgcolor: themeColors.bgPaper, borderRadius: '18px', border: `1px solid ${themeColors.border}`, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: themeColors.accentPrimary }} />
            </Box>
          ) : tab === 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                  <TableRow>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Nurse Practitioner</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Care Task / Condition</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Frequency &amp; Period</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Assigned By Doctor</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNurseAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: themeColors.textSecondary }}>
                        No nurse-patient assignments found under selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNurseAssignments.map((a: any) => (
                      <TableRow key={a.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.nurseId, firstName: a.nurseFirstName, lastName: a.nurseLastName, role: 'nurse' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentPrimary } }}
                          >
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>
                              {a.nurseFirstName} {a.nurseLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.patientId, firstName: a.patientFirstName, lastName: a.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentSecondary } }}
                          >
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>
                              {a.patientFirstName} {a.patientLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={a.assignmentType?.replace(/_/g, ' ').toUpperCase() || 'GENERAL CARE'}
                            size="small"
                            sx={{ bgcolor: isLight ? 'rgba(0, 143, 104, 0.12)' : 'rgba(0,200,150,0.15)', color: themeColors.accentPrimary, fontWeight: 700, mr: 1 }}
                          />
                          {a.diseaseCondition && (
                            <Typography variant="body2" sx={{ color: themeColors.textPrimary, mt: 0.5, fontWeight: 600 }}>
                              {a.diseaseCondition}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: themeColors.textPrimary }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
                            {typeof a.frequency === 'object' && a.frequency !== null
                              ? Object.entries(a.frequency).filter(([_, v]) => Boolean(v)).map(([k, v]) => `${k}: ${v}`).join(', ') || 'DAILY'
                              : String(a.frequency || 'DAILY').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                            Since {new Date(a.startDate || Date.now()).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: themeColors.textSecondary }}>
                          {a.doctorFirstName ? `Dr. ${a.doctorFirstName} ${a.doctorLastName}` : 'System Admin'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(a.status || 'active').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: a.status === 'active' ? 'rgba(76,175,80,0.15)' : a.status === 'paused' ? 'rgba(255,152,0,0.15)' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
                              color: a.status === 'active' ? (isLight ? '#059669' : '#4CAF50') : a.status === 'paused' ? '#FF9800' : themeColors.textSecondary,
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
                                color: a.status === 'active' ? '#FF9800' : (isLight ? '#059669' : '#4CAF50'),
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
                                  bgcolor: themeColors.accentPrimary,
                                  color: isLight ? '#FFFFFF' : '#0B1315',
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: isLight ? '#007A5A' : '#00A87E' }
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
                <TableHead sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                  <TableRow>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Primary Care Doctor</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Specialization</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Assignment Type</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Linked Since</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDoctorAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: themeColors.textSecondary }}>
                        No doctor-patient assignments found under selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctorAssignments.map((a: any) => (
                      <TableRow key={a.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.doctorId, firstName: a.doctorFirstName, lastName: a.doctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentPrimary } }}
                          >
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>
                              Dr. {a.doctorFirstName} {a.doctorLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: themeColors.accentPrimary, fontWeight: 600 }}>
                          {a.doctorSpecialization || 'General Physician'}
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.patientId, firstName: a.patientFirstName, lastName: a.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: themeColors.accentSecondary } }}
                          >
                            <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700 }}>
                              {a.patientFirstName} {a.patientLastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={a.assignmentType?.replace(/_/g, ' ').toUpperCase() || 'PRIMARY CARE'}
                            size="small"
                            sx={{ bgcolor: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56,189,248,0.15)', color: themeColors.accentSecondary, fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: themeColors.textSecondary }}>
                          {new Date(a.startDate || a.createdAt || Date.now()).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(a.status || 'active').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: a.status === 'active' ? 'rgba(76,175,80,0.15)' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
                              color: a.status === 'active' ? (isLight ? '#059669' : '#4CAF50') : themeColors.textSecondary,
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
