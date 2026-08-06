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

import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/services/adminApi';

export default function DoctorsRoster() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers('doctor', search, statusFilter);
      if (res.success) {
        setDoctors(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleToggleStatus = async (doctor: any) => {
    const newStatus = doctor.status === 'deactivated' ? 'active' : 'deactivated';
    setActionLoading(true);
    try {
      const res = await adminApi.toggleUserStatus(doctor.id || doctor._id, newStatus);
      if (res.success) {
        setToastMessage(`Account for Dr. ${doctor.firstName} ${doctor.lastName} is now ${newStatus.toUpperCase()}`);
        fetchDoctors();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (doctor: any) => {
    const confirmName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING!\n\nAre you sure you want to permanently delete doctor account "${confirmName}" (${doctor.email})?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const res = await adminApi.deleteUser(doctor.id || doctor._id);
      if (res.success) {
        setToastMessage(`✅ Doctor account "${confirmName}" permanently deleted successfully!`);
        fetchDoctors();
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
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MedicalServicesIcon sx={{ color: '#00C896', fontSize: 32 }} /> Doctors Roster & Verification
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
            View details, DigiLocker identity status, and manage doctor activation/deactivation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchDoctors}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: '12px', borderColor: 'rgba(0, 200, 150, 0.3)', color: '#00C896', fontWeight: 700 }}
        >
          Refresh Roster
        </Button>
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
            placeholder="Search doctors by name, email, or specialization..."
            value={search}
            onChange={handleSearchChange}
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

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Status"
            onClick={() => setStatusFilter('all')}
            sx={{
              bgcolor: statusFilter === 'all' ? '#00C896' : 'rgba(255,255,255,0.05)',
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

      {/* Doctors Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: '#131F22', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 700 } }}>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Specialization & License</TableCell>
                <TableCell>DigiLocker Status</TableCell>
                <TableCell>Prescriptions Rx</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A8A3' }}>
                    No doctors found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doc) => {
                  const isDeactivated = doc.status === 'deactivated';
                  return (
                    <TableRow key={doc.id || doc._id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: '#EBF5F3' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: isDeactivated ? '#4B5563' : '#00C896', color: '#0B1315', fontWeight: 800 }}>
                            {doc.firstName?.[0] || 'D'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDeactivated ? '#94A8A3' : '#EBF5F3' }}>
                              Dr. {doc.firstName} {doc.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                              {doc.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {doc.specialization || 'General Physician'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                          License: {doc.licenseNumber || 'DOC-PENDING'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {doc.digilockerVerified ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#ffffff !important' }} />}
                            label="DigiLocker Verified"
                            size="small"
                            sx={{ bgcolor: '#2e7d32', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Chip
                            label="Unverified"
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#33D3AA' }}>
                        {doc.prescriptionCount || 0} Created
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
                            onClick={() => handleToggleStatus(doc)}
                            startIcon={isDeactivated ? <CheckCircleIcon /> : <BlockIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800 }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(doc)}
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
    </AdminLayout>
  );
}
