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
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function PatientsRoster() {
  const { patients, isPreloaded, isSyncing, refreshSection, toggleUserStatusLocal, deleteUserLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    const days = Math.floor(diffSec / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  // Instant in-memory search and status filtering (0ms)
  const filteredPatients = patients.filter((pat) => {
    if (statusFilter !== 'all') {
      const isDeactivated = pat.status === 'deactivated';
      if (statusFilter === 'active' && isDeactivated) return false;
      if (statusFilter === 'deactivated' && !isDeactivated) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (pat.firstName && pat.firstName.toLowerCase().includes(q)) ||
        (pat.lastName && pat.lastName.toLowerCase().includes(q)) ||
        (pat.email && pat.email.toLowerCase().includes(q)) ||
        (pat.phone && pat.phone.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleToggleStatus = async (patient: any) => {
    const patId = patient.id || patient._id || patient.email;
    const newStatus = patient.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      const success = await toggleUserStatusLocal(patId, newStatus);
      if (success) {
        setToastMessage(`Patient ${patient.firstName} ${patient.lastName} account is now ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteUser = async (patient: any) => {
    const targetId = patient.id || patient._id || patient.email;
    if (!targetId) {
      alert('Cannot delete: Missing patient identifier');
      return;
    }
    const confirmName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email;
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING!\n\nAre you sure you want to permanently delete patient "${confirmName}" (${patient.email})?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const success = await deleteUserLocal(targetId);
      if (success) {
        setToastMessage(`✅ Patient "${confirmName}" permanently deleted successfully!`);
      }
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      alert(err.response?.data?.message || 'Failed to delete patient user.');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleIcon sx={{ color: themeColors.accentSecondary, fontSize: 32 }} /> Patients Roster &amp; Records
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
            Monitor registered patients, account creation dates, last active timestamps, and prescription records
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refreshSection('patients')}
          startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
          sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(59, 130, 246, 0.3)', color: themeColors.accentSecondary, fontWeight: 700 }}
        >
          Refresh Roster
        </Button>
      </Box>

      {toastMessage && (
        <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: isLight ? '#065F46' : '#34D399' }}>
          {toastMessage}
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: '20px', bgcolor: themeColors.bgPaper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, border: `1px solid ${themeColors.border}` }}>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <TextField
            fullWidth
            placeholder="Search patients by name, email, or phone number..."
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

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Status"
            onClick={() => setStatusFilter('all')}
            sx={{
              bgcolor: statusFilter === 'all' ? themeColors.accentSecondary : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
              color: statusFilter === 'all' ? '#FFFFFF' : themeColors.textPrimary,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
          <Chip
            label="Active Only"
            onClick={() => setStatusFilter('active')}
            sx={{
              bgcolor: statusFilter === 'active' ? '#10B981' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
              color: statusFilter === 'active' ? '#ffffff' : themeColors.textPrimary,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
          <Chip
            label="Deactivated"
            onClick={() => setStatusFilter('deactivated')}
            sx={{
              bgcolor: statusFilter === 'deactivated' ? '#EF4444' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
              color: statusFilter === 'deactivated' ? '#ffffff' : themeColors.textPrimary,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
        </Box>
      </Paper>

      {/* Patients Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: themeColors.bgPaper, overflow: 'hidden', border: `1px solid ${themeColors.border}` }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: themeColors.border, color: themeColors.textSecondary, fontWeight: 700, bgcolor: isLight ? '#EBE5D8' : '#0E1719' } }}>
                <TableCell>Patient Name &amp; Contact</TableCell>
                <TableCell>Phone &amp; Bio</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Prescriptions Issued</TableCell>
                <TableCell>Account Created</TableCell>
                <TableCell>Last Login / Active</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isPreloaded && patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: themeColors.textSecondary }}>
                    No patients found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((pat) => {
                  const isDeactivated = pat.status === 'deactivated';
                  const createdDate = pat.createdAt;
                  const lastActiveDate = pat.lastLogin || pat.updatedAt || pat.createdAt;
                  return (
                    <TableRow key={pat.id || pat._id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedPatient(pat)}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                        >
                          <Avatar sx={{ bgcolor: isDeactivated ? '#4B5563' : themeColors.accentSecondary, color: '#ffffff', fontWeight: 800 }}>
                            {pat.firstName?.[0] || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDeactivated ? themeColors.textSecondary : themeColors.textPrimary }}>
                              {pat.firstName} {pat.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                              {pat.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                          {pat.phone || 'No phone'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary, textTransform: 'capitalize' }}>
                          {pat.gender || 'N/A'} {pat.dateOfBirth ? `(DOB: ${pat.dateOfBirth})` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pat.bloodType || 'Unknown'}
                          size="small"
                          sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: isLight ? '#0284C7' : '#60A5FA' }}>
                        {pat.prescriptionCount || 0} Records
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarMonthIcon sx={{ fontSize: 13, color: '#00C896' }} />
                            {createdDate ? formatDate(createdDate) : 'July 2026'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                            {formatTimeAgo(createdDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: isLight ? '#0284C7' : '#38BDF8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: '#38BDF8' }} />
                            {lastActiveDate ? formatDate(lastActiveDate) : 'Active Today'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isLight ? '#059669' : '#34D399', fontWeight: 700, fontSize: '0.7rem' }}>
                            {formatTimeAgo(lastActiveDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isDeactivated ? 'DEACTIVATED' : 'ACTIVE'}
                          size="small"
                          sx={{
                            bgcolor: isDeactivated ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isDeactivated ? '#EF4444' : (isLight ? '#059669' : '#10B981'),
                            fontWeight: 900,
                            fontSize: '0.72rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedPatient(pat)}
                            startIcon={<TrendingUpIcon />}
                            sx={{
                              borderRadius: '10px',
                              fontWeight: 800,
                              color: themeColors.accentSecondary,
                              borderColor: isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(59, 130, 246, 0.15)', borderColor: themeColors.accentSecondary }
                            }}
                          >
                            Analytics &amp; Profile
                          </Button>
                          <Button
                            variant={isDeactivated ? 'contained' : 'outlined'}
                            color={isDeactivated ? 'success' : 'warning'}
                            size="small"
                            onClick={() => handleToggleStatus(pat)}
                            startIcon={isDeactivated ? <CheckCircleIcon /> : <BlockIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem' }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(pat)}
                            startIcon={<DeleteIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Patient 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedPatient)}
        userId={selectedPatient?.id || selectedPatient?._id || selectedPatient?.email}
        initialUserData={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onUserUpdated={() => refreshSection('patients')}
      />
    </AdminLayout>
  );
}
