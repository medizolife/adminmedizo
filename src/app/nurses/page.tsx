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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import SearchIcon from '@mui/icons-material/Search';
import HealingIcon from '@mui/icons-material/Healing';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LinkIcon from '@mui/icons-material/Link';

import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/services/adminApi';
import { adminExtraApi } from '@/services/adminExtraApi';

export default function NursesRoster() {
  const [nurses, setNurses] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add nurse dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    nurseLicenseNumber: '',
    nurseSpecialization: '',
    nurseQualifications: ''
  });

  // Affiliation dialog
  const [affiliationDialogOpen, setAffiliationDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [affiliationType, setAffiliationType] = useState('employed');
  const [affiliationNotes, setAffiliationNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nursesRes, docsRes] = await Promise.all([
        adminExtraApi.getNurses(),
        adminApi.getUsers('doctor')
      ]);
      if (nursesRes.success) setNurses(nursesRes.nurses || []);
      if (docsRes.success) setDoctors(docsRes.users || []);
    } catch (err) {
      console.error('Error fetching nurses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.createUser({
        ...createForm,
        role: 'nurse'
      });
      if (res.success) {
        setToastMessage(`Nurse ${createForm.firstName} ${createForm.lastName} registered successfully`);
        setCreateDialogOpen(false);
        setCreateForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          nurseLicenseNumber: '',
          nurseSpecialization: '',
          nurseQualifications: ''
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create nurse account');
    }
  };

  const handleCreateAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNurse || !selectedDoctorId) return;
    try {
      const res = await adminExtraApi.createAffiliation({
        nurseId: selectedNurse.id,
        doctorId: selectedDoctorId,
        affiliationType,
        notes: affiliationNotes
      });
      if (res.success) {
        setToastMessage('Affiliation created successfully');
        setAffiliationDialogOpen(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to link nurse');
    }
  };

  const filteredNurses = nurses.filter(n => {
    const q = search.toLowerCase();
    return (
      (n.firstName || '').toLowerCase().includes(q) ||
      (n.lastName || '').toLowerCase().includes(q) ||
      (n.email || '').toLowerCase().includes(q) ||
      (n.nurseLicenseNumber || '').toLowerCase().includes(q) ||
      (n.nurseSpecialization || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header Banner */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HealingIcon sx={{ color: '#00C896', fontSize: '2rem' }} />
              Nurses & Clinical Practitioners Roster
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              Manage registered nurses, hospital/clinic affiliations, and patient care assignments.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={fetchData}
              startIcon={<RefreshIcon />}
              sx={{ color: '#94A8A3', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', textTransform: 'none' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
              startIcon={<PersonAddIcon />}
              sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#00A87E' } }}
            >
              Register New Nurse
            </Button>
          </Box>
        </Box>

        {toastMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(0,200,150,0.15)', color: '#00C896', border: '1px solid rgba(0,200,150,0.3)' }} onClose={() => setToastMessage('')}>
            {toastMessage}
          </Alert>
        )}

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#131F22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TextField
            fullWidth
            placeholder="Search by nurse name, email, specialization, or license number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A8A3' }} />
                </InputAdornment>
              ),
              sx: { color: '#EBF5F3', bgcolor: '#0B1315', borderRadius: '12px' }
            }}
          />
        </Paper>

        {/* Table */}
        <Paper sx={{ bgcolor: '#131F22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#00C896' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#0B1315' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Nurse</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Specialization & Qualifications</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>License #</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Affiliations</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Active Care Tasks</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNurses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No nurse accounts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNurses.map((nurse) => (
                      <TableRow key={nurse.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800 }}>
                              {nurse.firstName?.charAt(0) || 'N'}
                            </Avatar>
                            <Box>
                              <Typography sx={{ color: '#EBF5F3', fontWeight: 700, fontSize: '0.95rem' }}>
                                {nurse.firstName} {nurse.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                                {nurse.email} {nurse.phone && `• ${nurse.phone}`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#EBF5F3', fontSize: '0.9rem', fontWeight: 600 }}>
                            {nurse.nurseSpecialization || 'General Care'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            {nurse.nurseQualifications || 'Registered Nurse'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#00C896', fontWeight: 700, fontFamily: 'monospace' }}>
                          {nurse.nurseLicenseNumber || 'RN-PENDING'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${(nurse.affiliations || []).length} Affiliated Doctors`}
                            size="small"
                            sx={{ bgcolor: 'rgba(0,200,150,0.1)', color: '#00C896', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${nurse.activeAssignmentsCount || 0} Active Patients`}
                            size="small"
                            sx={{ bgcolor: (nurse.activeAssignmentsCount || 0) > 0 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255,255,255,0.05)', color: (nurse.activeAssignmentsCount || 0) > 0 ? '#4CAF50' : '#94A8A3', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(nurse.status || 'active').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: nurse.status === 'deactivated' ? 'rgba(244,67,54,0.15)' : 'rgba(0,200,150,0.15)',
                              color: nurse.status === 'deactivated' ? '#F44336' : '#00C896',
                              fontWeight: 800
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            onClick={() => {
                              setSelectedNurse(nurse);
                              setAffiliationDialogOpen(true);
                            }}
                            sx={{ color: '#00C896', borderColor: 'rgba(0,200,150,0.3)', textTransform: 'none', borderRadius: '8px', mr: 1 }}
                          >
                            Affiliate Doctor
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

        {/* Register Nurse Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#131F22', color: '#EBF5F3', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' } }}>
          <form onSubmit={handleCreateNurse}>
            <DialogTitle sx={{ fontWeight: 800, color: '#EBF5F3', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              Register Professional Nurse
            </DialogTitle>
            <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First Name" fullWidth required value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
                <TextField label="Last Name" fullWidth required value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
              </Box>
              <TextField label="Email Address" type="email" fullWidth required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
              <TextField label="Initial Password" type="password" fullWidth required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
              <TextField label="Phone Number" fullWidth value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
              <TextField label="Nurse License Number (e.g. RN-88210)" fullWidth value={createForm.nurseLicenseNumber} onChange={(e) => setCreateForm({ ...createForm, nurseLicenseNumber: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
              <TextField label="Specialization (e.g. Wound Care, Elderly, Palliative)" fullWidth value={createForm.nurseSpecialization} onChange={(e) => setCreateForm({ ...createForm, nurseSpecialization: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
              <TextField label="Qualifications (e.g. B.Sc. Nursing, Critical Care)" fullWidth value={createForm.nurseQualifications} onChange={(e) => setCreateForm({ ...createForm, nurseQualifications: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }} />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#94A8A3' }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, '&:hover': { bgcolor: '#00A87E' } }}>
                Create Nurse Account
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Affiliate Doctor Dialog */}
        <Dialog open={affiliationDialogOpen} onClose={() => setAffiliationDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#131F22', color: '#EBF5F3', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' } }}>
          <form onSubmit={handleCreateAffiliation}>
            <DialogTitle sx={{ fontWeight: 800, color: '#EBF5F3', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              Affiliate Nurse with Doctor
            </DialogTitle>
            <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#94A8A3' }}>
                Affiliating <strong>{selectedNurse?.firstName} {selectedNurse?.lastName}</strong> with a doctor allows the doctor to dispatch this nurse for patient home visits.
              </Typography>
              <FormControl fullWidth sx={{ bgcolor: '#0B1315', borderRadius: '12px' }}>
                <InputLabel sx={{ color: '#94A8A3' }}>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctorId}
                  label="Select Doctor"
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  sx={{ color: '#EBF5F3' }}
                >
                  {doctors.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName} ({doc.specialization || 'Physician'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ bgcolor: '#0B1315', borderRadius: '12px' }}>
                <InputLabel sx={{ color: '#94A8A3' }}>Affiliation Type</InputLabel>
                <Select
                  value={affiliationType}
                  label="Affiliation Type"
                  onChange={(e) => setAffiliationType(e.target.value)}
                  sx={{ color: '#EBF5F3' }}
                >
                  <MenuItem value="employed">Employed Staff</MenuItem>
                  <MenuItem value="clinic_staff">Clinic Associate</MenuItem>
                  <MenuItem value="network_associate">Network Partner</MenuItem>
                  <MenuItem value="independent_partner">Independent Practitioner</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes / Specific Instructions"
                fullWidth
                multiline
                rows={2}
                value={affiliationNotes}
                onChange={(e) => setAffiliationNotes(e.target.value)}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0B1315', color: '#EBF5F3' } }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button onClick={() => setAffiliationDialogOpen(false)} sx={{ color: '#94A8A3' }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, '&:hover': { bgcolor: '#00A87E' } }}>
                Save Affiliation
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
