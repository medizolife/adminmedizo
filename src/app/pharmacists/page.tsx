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

import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/services/adminApi';

export default function PharmacistsRoster() {
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal state for adding new Pharmacist
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [newPharm, setNewPharm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123',
    pharmacyName: '',
    licenseNumber: '',
    pharmacyAddress: '',
    phone: ''
  });

  const fetchPharmacists = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers('pharmacist', search, statusFilter);
      if (res.success) {
        setPharmacists(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching pharmacists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacists();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPharmacists();
  };

  const handleToggleStatus = async (pharmacist: any) => {
    const newStatus = pharmacist.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      const res = await adminApi.toggleUserStatus(pharmacist.id || pharmacist._id, newStatus);
      if (res.success) {
        setToastMessage(`Pharmacist ${pharmacist.firstName} ${pharmacist.lastName} account is now ${newStatus.toUpperCase()}`);
        fetchPharmacists();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteUser = async (pharmacist: any) => {
    const confirmName = `${pharmacist.firstName || ''} ${pharmacist.lastName || ''}`.trim() || pharmacist.email;
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING!\n\nAre you sure you want to permanently delete pharmacist account "${confirmName}" (${pharmacist.email})?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const res = await adminApi.deleteUser(pharmacist.id || pharmacist._id);
      if (res.success) {
        setToastMessage(`✅ Pharmacist account "${confirmName}" permanently deleted successfully!`);
        fetchPharmacists();
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
      const res = await adminApi.createUser({
        ...newPharm,
        role: 'pharmacist'
      });
      if (res.success) {
        setAddModalOpen(false);
        setToastMessage(`Pharmacist ${newPharm.firstName} ${newPharm.lastName} created successfully!`);
        setNewPharm({
          firstName: '',
          lastName: '',
          email: '',
          password: 'password123',
          pharmacyName: '',
          licenseNumber: '',
          pharmacyAddress: '',
          phone: ''
        });
        fetchPharmacists();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create pharmacist');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalPharmacyIcon sx={{ color: '#F59E0B', fontSize: 32 }} /> Pharmacists & Pharmacy Roster
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
            Manage pharmacy accounts, license numbers, and toggle activation status
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={fetchPharmacists}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: '12px', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B', fontWeight: 700 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => setAddModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: '12px', bgcolor: '#F59E0B', color: '#0B1315', fontWeight: 800, '&:hover': { bgcolor: '#FBBF24' } }}
          >
            Add New Pharmacist
          </Button>
        </Box>
      </Box>

      {toastMessage && (
        <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
          {toastMessage}
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: '20px', bgcolor: '#131F22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1, minWidth: 280 }}>
          <TextField
            fullWidth
            placeholder="Search pharmacists by name, pharmacy, or license #..."
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
                '&:hover fieldset': { borderColor: '#F59E0B' }
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Status"
            onClick={() => setStatusFilter('all')}
            sx={{
              bgcolor: statusFilter === 'all' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
              color: statusFilter === 'all' ? '#0B1315' : '#EBF5F3',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
          <Chip
            label="Active Only"
            onClick={() => setStatusFilter('active')}
            sx={{
              bgcolor: statusFilter === 'active' ? '#10B981' : 'rgba(255,255,255,0.05)',
              color: statusFilter === 'active' ? '#0B1315' : '#EBF5F3',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
          <Chip
            label="Deactivated"
            onClick={() => setStatusFilter('deactivated')}
            sx={{
              bgcolor: statusFilter === 'deactivated' ? '#EF4444' : 'rgba(255,255,255,0.05)',
              color: statusFilter === 'deactivated' ? '#ffffff' : '#EBF5F3',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          />
        </Box>
      </Paper>

      {/* Pharmacists Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: '#131F22', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 700 } }}>
                <TableCell>Pharmacist Name</TableCell>
                <TableCell>Pharmacy & License #</TableCell>
                <TableCell>Contact & Address</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : pharmacists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A8A3' }}>
                    No pharmacists found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                pharmacists.map((pharm) => {
                  const isDeactivated = pharm.status === 'deactivated';
                  return (
                    <TableRow key={pharm.id || pharm._id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: '#EBF5F3' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: isDeactivated ? '#4B5563' : '#F59E0B', color: '#0B1315', fontWeight: 800 }}>
                            {pharm.firstName?.[0] || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDeactivated ? '#94A8A3' : '#EBF5F3' }}>
                              {pharm.firstName} {pharm.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                              {pharm.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FBBF24' }}>
                          {pharm.pharmacyName || 'Central Medizo Pharmacy'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                          License: {pharm.licenseNumber || 'PHARM-88219'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {pharm.phone || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                          {pharm.pharmacyAddress || 'City Center'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isDeactivated ? 'DEACTIVATED' : 'ACTIVE'}
                          size="small"
                          sx={{
                            bgcolor: isDeactivated ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isDeactivated ? '#EF4444' : '#10B981',
                            fontWeight: 900,
                            fontSize: '0.72rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant={isDeactivated ? 'contained' : 'outlined'}
                            color={isDeactivated ? 'success' : 'warning'}
                            size="small"
                            onClick={() => handleToggleStatus(pharm)}
                            startIcon={isDeactivated ? <CheckCircleIcon /> : <BlockIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800 }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(pharm)}
                            startIcon={<DeleteIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
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
            bgcolor: '#131F22',
            color: '#EBF5F3',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#F59E0B' }}>
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
                sx={{ input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
              />
              <TextField
                required
                label="Last Name"
                value={newPharm.lastName}
                onChange={(e) => setNewPharm({ ...newPharm, lastName: e.target.value })}
                sx={{ input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
              />
            </Box>
            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              value={newPharm.email}
              onChange={(e) => setNewPharm({ ...newPharm, email: e.target.value })}
              sx={{ mb: 2, input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
            />
            <TextField
              fullWidth
              label="Pharmacy Name"
              value={newPharm.pharmacyName}
              onChange={(e) => setNewPharm({ ...newPharm, pharmacyName: e.target.value })}
              sx={{ mb: 2, input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="License Number"
                value={newPharm.licenseNumber}
                onChange={(e) => setNewPharm({ ...newPharm, licenseNumber: e.target.value })}
                sx={{ input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
              />
              <TextField
                label="Phone Number"
                value={newPharm.phone}
                onChange={(e) => setNewPharm({ ...newPharm, phone: e.target.value })}
                sx={{ input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
              />
            </Box>
            <TextField
              fullWidth
              label="Pharmacy Address"
              value={newPharm.pharmacyAddress}
              onChange={(e) => setNewPharm({ ...newPharm, pharmacyAddress: e.target.value })}
              sx={{ input: { color: '#EBF5F3' }, label: { color: '#94A8A3' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setAddModalOpen(false)} sx={{ color: '#94A8A3' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={modalLoading}
              sx={{ bgcolor: '#F59E0B', color: '#0B1315', fontWeight: 800, borderRadius: '12px' }}
            >
              {modalLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Pharmacist'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
