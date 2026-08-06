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

import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/services/adminApi';

export default function PatientsRoster() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers('patient', search, statusFilter);
      if (res.success) {
        setPatients(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleToggleStatus = async (patient: any) => {
    const newStatus = patient.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      const res = await adminApi.toggleUserStatus(patient.id || patient._id, newStatus);
      if (res.success) {
        setToastMessage(`Patient ${patient.firstName} ${patient.lastName} account is now ${newStatus.toUpperCase()}`);
        fetchPatients();
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
      const res = await adminApi.deleteUser(targetId);
      if (res.success) {
        setToastMessage(`✅ Patient "${confirmName}" permanently deleted successfully!`);
        fetchPatients();
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
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleIcon sx={{ color: '#3B82F6', fontSize: 32 }} /> Patients Roster & Records
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
            Monitor registered patients, prescription histories, and manage account activation status
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchPatients}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: '12px', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3B82F6', fontWeight: 700 }}
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
            placeholder="Search patients by name, email, or phone..."
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
                '&:hover fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Status"
            onClick={() => setStatusFilter('all')}
            sx={{
              bgcolor: statusFilter === 'all' ? '#3B82F6' : 'rgba(255,255,255,0.05)',
              color: statusFilter === 'all' ? '#ffffff' : '#EBF5F3',
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

      {/* Patients Table */}
      <Paper sx={{ borderRadius: '20px', bgcolor: '#131F22', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: '#94A8A3', fontWeight: 700 } }}>
                <TableCell>Patient Name</TableCell>
                <TableCell>Contact & Gender</TableCell>
                <TableCell>Blood Group</TableCell>
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
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A8A3' }}>
                    No patients found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((pat) => {
                  const isDeactivated = pat.status === 'deactivated';
                  return (
                    <TableRow key={pat.id || pat._id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: '#EBF5F3' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: isDeactivated ? '#4B5563' : '#3B82F6', color: '#ffffff', fontWeight: 800 }}>
                            {pat.firstName?.[0] || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDeactivated ? '#94A8A3' : '#EBF5F3' }}>
                              {pat.firstName} {pat.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                              {pat.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {pat.phone || 'No phone'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A8A3', textTransform: 'capitalize' }}>
                          {pat.gender || 'N/A'} {pat.dateOfBirth ? `(DOB: ${pat.dateOfBirth})` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pat.bloodType || 'Unknown'}
                          size="small"
                          sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#60A5FA' }}>
                        {pat.prescriptionCount || 0} Records
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
                            onClick={() => handleToggleStatus(pat)}
                            startIcon={isDeactivated ? <CheckCircleIcon /> : <BlockIcon />}
                            sx={{ borderRadius: '10px', fontWeight: 800 }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(pat)}
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
