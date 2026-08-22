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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { adminApi } from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function PharmacistsRoster() {
  const { pharmacists, isPreloaded, isSyncing, refreshSection, toggleUserStatusLocal, deleteUserLocal, addUserLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPharmacist, setSelectedPharmacist] = useState<any>(null);
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
    if (isNaN(d.getTime())) return dateStr;
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
  
  // Modal state for adding new Pharmacist
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [newPharm, setNewPharm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    pharmacyName: '',
    licenseNumber: '',
    pharmacyAddress: '',
    phone: ''
  });

  // Instant in-memory search and status filtering (0ms)
  const filteredPharmacists = pharmacists.filter((pharm) => {
    if (statusFilter !== 'all') {
      const isDeactivated = pharm.status === 'deactivated';
      if (statusFilter === 'active' && isDeactivated) return false;
      if (statusFilter === 'deactivated' && !isDeactivated) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (pharm.firstName && pharm.firstName.toLowerCase().includes(q)) ||
        (pharm.lastName && pharm.lastName.toLowerCase().includes(q)) ||
        (pharm.email && pharm.email.toLowerCase().includes(q)) ||
        (pharm.pharmacyName && pharm.pharmacyName.toLowerCase().includes(q)) ||
        (pharm.licenseNumber && pharm.licenseNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleToggleStatus = async (pharmacist: any) => {
    const pharmId = pharmacist.id || pharmacist._id || pharmacist.email;
    const newStatus = pharmacist.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      const success = await toggleUserStatusLocal(pharmId, newStatus);
      if (success) {
        setToastMessage(`Pharmacist ${pharmacist.firstName} ${pharmacist.lastName} account is now ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteUser = async (pharmacist: any) => {
    const targetId = pharmacist.id || pharmacist._id || pharmacist.email;
    if (!targetId) {
      alert('Cannot delete: Missing pharmacist identifier');
      return;
    }
    const confirmName = `${pharmacist.firstName || ''} ${pharmacist.lastName || ''}`.trim() || pharmacist.email;
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING!\n\nAre you sure you want to permanently delete pharmacist account "${confirmName}" (${pharmacist.email})?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const success = await deleteUserLocal(targetId);
      if (success) {
        setToastMessage(`✅ Pharmacist "${confirmName}" permanently deleted successfully!`);
      }
    } catch (err: any) {
      console.error('Error deleting pharmacist:', err);
      alert(err.response?.data?.message || 'Failed to delete pharmacist user.');
    }
  };

  const handleCreatePharmacist = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const payload = {
        ...newPharm,
        role: 'pharmacist'
      };
      const res = await adminApi.createUser(payload);
      if (res.data?.success) {
        addUserLocal(res.data.user || { ...payload, id: `pharm-${Date.now()}` });
        setToastMessage(`Pharmacist ${newPharm.firstName} created successfully!`);
        setAddModalOpen(false);
        setNewPharm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          pharmacyName: '',
          licenseNumber: '',
          pharmacyAddress: '',
          phone: ''
        });
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create pharmacist.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalPharmacyIcon sx={{ color: themeColors.accentWarning, fontSize: 32 }} /> Pharmacists Roster
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
            Manage registered pharmacies, drug licenses, and pharmacist accounts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => refreshSection('pharmacists')}
            startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(217, 119, 6, 0.4)' : 'rgba(245, 158, 11, 0.3)', color: themeColors.accentWarning, fontWeight: 700 }}
          >
            Refresh Roster
          </Button>
          <Button
            variant="contained"
            onClick={() => setAddModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: '12px', bgcolor: themeColors.accentWarning, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, '&:hover': { bgcolor: isLight ? '#B45309' : '#D97706' } }}
          >
            Add Pharmacist
          </Button>
        </Box>
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
            placeholder="Search pharmacists by name, pharmacy name, or license..."
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
                '&:hover fieldset': { borderColor: themeColors.accentWarning }
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Status"
            onClick={() => setStatusFilter('all')}
            sx={{
              bgcolor: statusFilter === 'all' ? themeColors.accentWarning : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'),
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

      {/* Pharmacists Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: themeColors.bgPaper, overflow: 'hidden', border: `1px solid ${themeColors.border}` }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: themeColors.border, color: themeColors.textSecondary, fontWeight: 700, bgcolor: isLight ? '#EBE5D8' : '#0E1719' } }}>
                <TableCell>Pharmacist Name</TableCell>
                <TableCell>Pharmacy &amp; License #</TableCell>
                <TableCell>Contact &amp; Address</TableCell>
                <TableCell>Account Created</TableCell>
                <TableCell>Last Login / Active</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isPreloaded && pharmacists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : filteredPharmacists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: themeColors.textSecondary }}>
                    No pharmacists found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPharmacists.map((pharm) => {
                  const isDeactivated = pharm.status === 'deactivated';
                  const createdDate = pharm.createdAt;
                  const lastActiveDate = pharm.lastLogin || pharm.updatedAt || pharm.createdAt;
                  return (
                    <TableRow key={pharm.id || pharm._id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                      <TableCell>
                        <Box
                          onClick={() => setSelectedPharmacist(pharm)}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                        >
                          <Avatar sx={{ bgcolor: isDeactivated ? '#4B5563' : themeColors.accentWarning, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800 }}>
                            {pharm.firstName?.[0] || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDeactivated ? themeColors.textSecondary : themeColors.textPrimary }}>
                              {pharm.firstName} {pharm.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                              {pharm.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isLight ? '#B45309' : '#FBBF24' }}>
                          {pharm.pharmacyName || 'Central Medizo Pharmacy'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                          License: {pharm.licenseNumber || 'PHARM-88219'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: themeColors.textPrimary }}>
                          {pharm.phone || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                          {pharm.pharmacyAddress || 'City Center'}
                        </Typography>
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
                          <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.accentWarning, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: themeColors.accentWarning }} />
                            {lastActiveDate ? formatDate(lastActiveDate) : 'Active Today'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isLight ? '#B45309' : '#F59E0B', fontWeight: 700, fontSize: '0.7rem' }}>
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
                            onClick={() => setSelectedPharmacist(pharm)}
                            startIcon={<TrendingUpIcon />}
                            sx={{
                              borderRadius: '10px',
                              fontWeight: 800,
                              color: themeColors.accentWarning,
                              borderColor: isLight ? 'rgba(217, 119, 6, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.15)', borderColor: themeColors.accentWarning }
                            }}
                          >
                            Analytics &amp; Profile
                          </Button>
                          <Button
                            variant={isDeactivated ? 'contained' : 'outlined'}
                            color={isDeactivated ? 'success' : 'warning'}
                            size="small"
                            onClick={() => handleToggleStatus(pharm)}
                            startIcon={isDeactivated ? <CheckCircleIcon /> : <BlockIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem' }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(pharm)}
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

      {/* Add New Pharmacist Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: themeColors.bgPaper,
            color: themeColors.textPrimary,
            border: `1px solid ${themeColors.border}`,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: themeColors.accentWarning }}>
          Add New Pharmacist Account
        </DialogTitle>
        <form onSubmit={handleCreatePharmacist}>
          <DialogContent>
            {modalError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                {modalError}
              </Alert>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                required
                label="First Name"
                value={newPharm.firstName}
                onChange={(e) => setNewPharm({ ...newPharm, firstName: e.target.value })}
                sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
              />
              <TextField
                required
                label="Last Name"
                value={newPharm.lastName}
                onChange={(e) => setNewPharm({ ...newPharm, lastName: e.target.value })}
                sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
              />
            </Box>
            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              value={newPharm.email}
              onChange={(e) => setNewPharm({ ...newPharm, email: e.target.value })}
              sx={{ mb: 2, '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
            />
            <TextField
              fullWidth
              label="Pharmacy Name"
              value={newPharm.pharmacyName}
              onChange={(e) => setNewPharm({ ...newPharm, pharmacyName: e.target.value })}
              sx={{ mb: 2, '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="License Number"
                value={newPharm.licenseNumber}
                onChange={(e) => setNewPharm({ ...newPharm, licenseNumber: e.target.value })}
                sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
              />
              <TextField
                label="Phone Number"
                value={newPharm.phone}
                onChange={(e) => setNewPharm({ ...newPharm, phone: e.target.value })}
                sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
              />
            </Box>
            <TextField
              fullWidth
              label="Pharmacy Address"
              value={newPharm.pharmacyAddress}
              onChange={(e) => setNewPharm({ ...newPharm, pharmacyAddress: e.target.value })}
              sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeColors.border}` }}>
            <Button onClick={() => setAddModalOpen(false)} sx={{ color: themeColors.textSecondary }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={modalLoading}
              sx={{ bgcolor: themeColors.accentWarning, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, borderRadius: '12px' }}
            >
              {modalLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Pharmacist'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Pharmacist 360 Degree Profile & Activity Graph Popup */}
      <UserDetailModal
        open={Boolean(selectedPharmacist)}
        userId={selectedPharmacist?.id || selectedPharmacist?._id || selectedPharmacist?.email}
        initialUserData={selectedPharmacist}
        onClose={() => setSelectedPharmacist(null)}
        onUserUpdated={() => refreshSection('pharmacists')}
      />
    </AdminLayout>
  );
}
