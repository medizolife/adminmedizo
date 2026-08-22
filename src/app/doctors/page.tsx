'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function DoctorsRoster() {
  const { doctors, isPreloaded, isSyncing, refreshSection, toggleUserStatusLocal, deleteUserLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Instant in-memory search and status filtering (0ms)
  const filteredDoctors = doctors.filter((doc) => {
    if (statusFilter !== 'all') {
      const isDeactivated = doc.status === 'deactivated';
      if (statusFilter === 'active' && isDeactivated) return false;
      if (statusFilter === 'deactivated' && !isDeactivated) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (doc.firstName && doc.firstName.toLowerCase().includes(q)) ||
        (doc.lastName && doc.lastName.toLowerCase().includes(q)) ||
        (doc.email && doc.email.toLowerCase().includes(q)) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
        (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleToggleStatus = async (doctor: any) => {
    const docId = doctor.id || doctor._id || doctor.email;
    const newStatus = doctor.status === 'deactivated' ? 'active' : 'deactivated';
    setActionLoading(true);
    try {
      const success = await toggleUserStatusLocal(docId, newStatus);
      if (success) {
        setToastMessage(`Account for Dr. ${doctor.firstName} ${doctor.lastName} is now ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (doctor: any) => {
    const targetId = doctor.id || doctor._id || doctor.email;
    if (!targetId) {
      alert('Cannot delete: Missing doctor identifier');
      return;
    }
    const confirmName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING!\n\nAre you sure you want to permanently delete doctor account "${confirmName}" (${doctor.email})?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const success = await deleteUserLocal(targetId);
      if (success) {
        setToastMessage(`✅ Doctor account "${confirmName}" permanently deleted successfully!`);
      }
    } catch (err: any) {
      console.error('Error deleting doctor:', err);
      alert(err.response?.data?.message || 'Failed to delete doctor user.');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MedicalServicesIcon sx={{ color: themeColors.accentPrimary, fontSize: 32 }} /> Doctors Roster & Verification
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
            View details, DigiLocker identity status, and manage doctor activation/deactivation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refreshSection('doctors')}
          startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
          sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.3)', color: themeColors.accentPrimary, fontWeight: 700 }}
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
            placeholder="Search doctors by name, email, or specialization..."
            value={search}
            onChange={handleSearchChange}
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

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Status"
            onClick={() => setStatusFilter('all')}
            sx={{
              bgcolor: statusFilter === 'all' ? themeColors.accentPrimary : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
              color: statusFilter === 'all' ? (isLight ? '#FFFFFF' : '#0B1315') : themeColors.textPrimary,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
          <Chip
            label="Active Only"
            onClick={() => setStatusFilter('active')}
            sx={{
              bgcolor: statusFilter === 'active' ? '#10B981' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
              color: statusFilter === 'active' ? '#FFFFFF' : themeColors.textPrimary,
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

      {/* Doctors Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: themeColors.bgPaper, overflow: 'hidden', border: `1px solid ${themeColors.border}` }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: themeColors.border, color: themeColors.textSecondary, fontWeight: 700, bgcolor: isLight ? '#EBE5D8' : '#0E1719' } }}>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Specialization & License</TableCell>
                <TableCell>DigiLocker Status</TableCell>
                <TableCell>Prescriptions Rx</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isPreloaded && doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: themeColors.textSecondary }}>
                    No doctors found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map((doc) => {
                  const isDeactivated = doc.status === 'deactivated';
                  return (
                    <TableRow key={doc.id || doc._id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedDoctor(doc)}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                        >
                          <Avatar sx={{ bgcolor: isDeactivated ? '#4B5563' : themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800 }}>
                            {doc.firstName?.[0] || 'D'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDeactivated ? themeColors.textSecondary : themeColors.textPrimary }}>
                              Dr. {doc.firstName} {doc.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                              {doc.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.textPrimary }}>
                          {doc.specialization || 'General Physician'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                          License: {doc.licenseNumber || 'DOC-PENDING'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {doc.digilockerVerified ? (
                          <Box>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#ffffff !important' }} />}
                              label="DigiLocker Verified"
                              size="small"
                              sx={{ bgcolor: '#2e7d32', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem', mb: 0.3 }}
                            />
                            {doc.digilockerProfile?.maskedAadhaar && (
                              <Typography variant="caption" sx={{ display: 'block', color: isLight ? '#059669' : '#34D399', fontSize: '0.68rem', fontWeight: 600 }}>
                                Aadhaar: {doc.digilockerProfile.maskedAadhaar}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Chip
                            label="Unverified"
                            size="small"
                            sx={{ bgcolor: isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.15)', color: isLight ? '#B45309' : '#F59E0B', fontWeight: 800, fontSize: '0.7rem', border: isLight ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: isLight ? '#008F68' : '#33D3AA' }}>
                        {doc.prescriptionCount || 0} Created
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
                            onClick={() => setSelectedDoctor(doc)}
                            startIcon={<TrendingUpIcon />}
                            sx={{
                              borderRadius: '10px',
                              borderColor: isLight ? 'rgba(0,143,104,0.4)' : 'rgba(0, 200, 150, 0.3)',
                              color: themeColors.accentPrimary,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              '&:hover': { bgcolor: isLight ? 'rgba(0,143,104,0.1)' : 'rgba(0, 200, 150, 0.1)', borderColor: themeColors.accentPrimary }
                            }}
                          >
                            Profile 360°
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color={isDeactivated ? 'success' : 'error'}
                            disabled={actionLoading}
                            onClick={() => handleToggleStatus(doc)}
                            sx={{ borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDeleteUser(doc)}
                            startIcon={<DeleteIcon sx={{ fontSize: 15 }} />}
                            sx={{
                              borderRadius: '10px',
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              color: '#EF4444',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              minWidth: 0,
                              px: 1.2,
                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }
                            }}
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

      {/* 360° User Intelligence Modal */}
      {selectedDoctor && (
        <UserDetailModal
          open={Boolean(selectedDoctor)}
          userId={selectedDoctor.id || selectedDoctor._id || selectedDoctor.email}
          userRole="doctor"
          initialUserData={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onUserUpdated={() => refreshSection('doctors')}
        />
      )}
    </AdminLayout>
  );
}
