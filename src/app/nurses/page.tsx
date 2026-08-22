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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal, { getUserSpecificIpUtil } from '@/components/UserDetailModal';
import { adminApi } from '@/services/adminApi';
import { adminExtraApi } from '@/services/adminExtraApi';
import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function NursesRoster() {
  const { nurses, doctors, isPreloaded, isSyncing, refreshSection, addUserLocal } = useAdminData();
  const { isLight, themeColors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [profileNurse, setProfileNurse] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
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

  // Affiliate doctor dialog
  const [affiliationDialogOpen, setAffiliationDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [affiliationType, setAffiliationType] = useState('employed');
  const [affiliationNotes, setAffiliationNotes] = useState('');

  const filteredNurses = nurses.filter((nurse) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (nurse.firstName && nurse.firstName.toLowerCase().includes(q)) ||
      (nurse.lastName && nurse.lastName.toLowerCase().includes(q)) ||
      (nurse.email && nurse.email.toLowerCase().includes(q)) ||
      (nurse.nurseSpecialization && nurse.nurseSpecialization.toLowerCase().includes(q)) ||
      (nurse.nurseLicenseNumber && nurse.nurseLicenseNumber.toLowerCase().includes(q))
    );
  });

  const handleCreateNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.createUser({
        ...createForm,
        role: 'nurse'
      });
      if (res.data?.success) {
        addUserLocal(res.data.user || { ...createForm, role: 'nurse', id: `nurse-${Date.now()}` });
        setToastMessage(`Nurse ${createForm.firstName} ${createForm.lastName} registered successfully!`);
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
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create nurse account');
    }
  };

  const handleCreateAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedNurse) return;
    try {
      await adminExtraApi.createAffiliation({
        doctorId: selectedDoctorId,
        nurseId: selectedNurse.id,
        relationshipType: affiliationType,
        notes: affiliationNotes
      });
      setToastMessage(`Nurse successfully affiliated with doctor!`);
      setAffiliationDialogOpen(false);
      refreshSection('nurses');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create affiliation');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header Strip */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HealingIcon sx={{ color: themeColors.accentTertiary, fontSize: 32 }} /> Field Nurses &amp; Clinical Staff Roster
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              Manage registered nurses, hospital/doctor affiliations, and track home-care deployments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => refreshSection('nurses')}
              startIcon={<RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
              sx={{ borderRadius: '12px', borderColor: isLight ? 'rgba(124, 58, 237, 0.4)' : 'rgba(192, 132, 252, 0.3)', color: themeColors.accentTertiary, fontWeight: 700 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: '12px', bgcolor: themeColors.accentTertiary, color: '#FFFFFF', fontWeight: 800, '&:hover': { bgcolor: isLight ? '#6D28D9' : '#A855F7' } }}
            >
              Register Nurse
            </Button>
          </Box>
        </Box>

        {toastMessage && (
          <Alert severity="success" onClose={() => setToastMessage('')} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.15)', color: isLight ? '#065F46' : '#34D399' }}>
            {toastMessage}
          </Alert>
        )}

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: themeColors.bgPaper, border: `1px solid ${themeColors.border}` }}>
          <TextField
            fullWidth
            placeholder="Search nurses by name, email, specialization, or RN license number..."
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
                '&:hover fieldset': { borderColor: themeColors.accentTertiary }
              }
            }}
          />
        </Paper>

        {/* Nurses Table */}
        <Paper sx={{ borderRadius: '16px', bgcolor: themeColors.bgPaper, overflow: 'hidden', border: `1px solid ${themeColors.border}` }}>
          {!isPreloaded && nurses.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: isLight ? '#EBE5D8' : '#0E1719' }}>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Nurse Name &amp; Contact</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Specialization &amp; Qualification</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>RN License</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Affiliations &amp; Cases</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Account Created</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Last Login / Active</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ color: themeColors.textSecondary, fontWeight: 800, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNurses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: themeColors.textSecondary }}>
                        No nurse accounts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNurses.map((nurse) => {
                      const createdDate = nurse.createdAt;
                      const lastActiveDate = nurse.lastLogin || nurse.updatedAt || nurse.createdAt;
                      return (
                      <TableRow key={nurse.id} sx={{ '& td': { borderColor: themeColors.border, color: themeColors.textPrimary } }}>
                        <TableCell>
                          <Box
                            onClick={() => setProfileNurse(nurse)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                          >
                            <Avatar sx={{ bgcolor: themeColors.accentTertiary, color: '#FFFFFF', fontWeight: 800 }}>
                              {nurse.firstName?.charAt(0) || 'N'}
                            </Avatar>
                            <Box>
                              <Typography sx={{ color: themeColors.textPrimary, fontWeight: 700, fontSize: '0.95rem' }}>
                                {nurse.firstName} {nurse.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                {nurse.email} {nurse.phone && `• ${nurse.phone}`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: themeColors.textPrimary, fontSize: '0.9rem', fontWeight: 600 }}>
                            {nurse.nurseSpecialization || 'General Care'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                            {nurse.nurseQualifications || 'Registered Nurse'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: themeColors.accentTertiary, fontWeight: 700, fontFamily: 'monospace' }}>
                          {nurse.nurseLicenseNumber || 'RN-PENDING'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={`${(nurse.affiliations || []).length} Affiliated Doctors`}
                              size="small"
                              sx={{ bgcolor: isLight ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,200,150,0.1)', color: themeColors.accentTertiary, fontWeight: 700, width: 'fit-content' }}
                            />
                            <Chip
                              label={`${nurse.activeAssignmentsCount || 0} Active Patients`}
                              size="small"
                              sx={{ bgcolor: (nurse.activeAssignmentsCount || 0) > 0 ? 'rgba(76, 175, 80, 0.15)' : (isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)'), color: (nurse.activeAssignmentsCount || 0) > 0 ? '#4CAF50' : themeColors.textSecondary, fontWeight: 700, width: 'fit-content' }}
                            />
                          </Box>
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: themeColors.accentTertiary, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem' }}>
                              <AccessTimeIcon sx={{ fontSize: 13, color: themeColors.accentTertiary }} />
                              {lastActiveDate ? formatDate(lastActiveDate) : 'Active Today'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: isLight ? '#7C3AED' : '#C084FC', fontWeight: 700, fontSize: '0.68rem' }}>
                              {formatTimeAgo(lastActiveDate)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.66rem' }}>
                              IP: {nurse.lastLoginIp || nurse.ipAddress || getUserSpecificIpUtil(nurse)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(nurse.status || 'active').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: nurse.status === 'deactivated' ? 'rgba(244,67,54,0.15)' : 'rgba(0,200,150,0.15)',
                              color: nurse.status === 'deactivated' ? '#F44336' : (isLight ? '#059669' : '#00C896'),
                              fontWeight: 800
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<TrendingUpIcon />}
                            onClick={() => setProfileNurse(nurse)}
                            sx={{
                              color: themeColors.accentTertiary,
                              borderColor: isLight ? 'rgba(124, 58, 237, 0.4)' : 'rgba(192, 132, 252, 0.4)',
                              textTransform: 'none',
                              borderRadius: '8px',
                              mr: 1,
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: isLight ? 'rgba(124, 58, 237, 0.1)' : 'rgba(192, 132, 252, 0.15)', borderColor: themeColors.accentTertiary }
                            }}
                          >
                            Analytics
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            onClick={() => {
                              setSelectedNurse(nurse);
                              setAffiliationDialogOpen(true);
                            }}
                            sx={{ color: themeColors.accentPrimary, borderColor: isLight ? 'rgba(0, 143, 104, 0.3)' : 'rgba(0,200,150,0.3)', textTransform: 'none', borderRadius: '8px', mr: 1, fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Affiliate Doctor
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Register Nurse Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: themeColors.bgPaper, color: themeColors.textPrimary, borderRadius: '16px', border: `1px solid ${themeColors.border}` } }}>
          <form onSubmit={handleCreateNurse}>
            <DialogTitle sx={{ fontWeight: 800, color: themeColors.textPrimary, borderBottom: `1px solid ${themeColors.border}` }}>
              Register Professional Nurse
            </DialogTitle>
            <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First Name" fullWidth required value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
                <TextField label="Last Name" fullWidth required value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
              </Box>
              <TextField label="Email Address" type="email" fullWidth required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
              <TextField label="Initial Password" type="password" fullWidth required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
              <TextField label="Phone Number" fullWidth value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
              <TextField label="Nurse License Number (e.g. RN-88210)" fullWidth value={createForm.nurseLicenseNumber} onChange={(e) => setCreateForm({ ...createForm, nurseLicenseNumber: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
              <TextField label="Specialization (e.g. Wound Care, Elderly, Palliative)" fullWidth value={createForm.nurseSpecialization} onChange={(e) => setCreateForm({ ...createForm, nurseSpecialization: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
              <TextField label="Qualifications (e.g. B.Sc. Nursing, Critical Care)" fullWidth value={createForm.nurseQualifications} onChange={(e) => setCreateForm({ ...createForm, nurseQualifications: e.target.value })} sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }} />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeColors.border}` }}>
              <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: themeColors.textSecondary }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: themeColors.accentTertiary, color: '#FFFFFF', fontWeight: 800, '&:hover': { bgcolor: isLight ? '#6D28D9' : '#A855F7' } }}>
                Create Nurse Account
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Affiliate Doctor Dialog */}
        <Dialog open={affiliationDialogOpen} onClose={() => setAffiliationDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: themeColors.bgPaper, color: themeColors.textPrimary, borderRadius: '16px', border: `1px solid ${themeColors.border}` } }}>
          <form onSubmit={handleCreateAffiliation}>
            <DialogTitle sx={{ fontWeight: 800, color: themeColors.textPrimary, borderBottom: `1px solid ${themeColors.border}` }}>
              Affiliate Nurse with Doctor
            </DialogTitle>
            <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                Affiliating <strong>{selectedNurse?.firstName} {selectedNurse?.lastName}</strong> with a doctor allows the doctor to dispatch this nurse for patient home visits.
              </Typography>
              <FormControl fullWidth sx={{ bgcolor: isLight ? '#FAF8F5' : '#0B1315', borderRadius: '12px' }}>
                <InputLabel sx={{ color: themeColors.textSecondary }}>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctorId}
                  label="Select Doctor"
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  sx={{ color: themeColors.textPrimary }}
                >
                  {doctors.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName} ({doc.specialization || 'Physician'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ bgcolor: isLight ? '#FAF8F5' : '#0B1315', borderRadius: '12px' }}>
                <InputLabel sx={{ color: themeColors.textSecondary }}>Affiliation Type</InputLabel>
                <Select
                  value={affiliationType}
                  label="Affiliation Type"
                  onChange={(e) => setAffiliationType(e.target.value)}
                  sx={{ color: themeColors.textPrimary }}
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
                sx={{ '& .MuiInputBase-root': { bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary } }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${themeColors.border}` }}>
              <Button onClick={() => setAffiliationDialogOpen(false)} sx={{ color: themeColors.textSecondary }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, '&:hover': { bgcolor: themeColors.accentPrimary } }}>
                Save Affiliation
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Nurse 360 Degree Profile & Activity Graph Popup */}
        <UserDetailModal
          open={Boolean(profileNurse)}
          userId={profileNurse?.id || profileNurse?._id || profileNurse?.email}
          initialUserData={profileNurse}
          onClose={() => setProfileNurse(null)}
          onUserUpdated={() => refreshSection('nurses')}
        />
      </Box>
    </AdminLayout>
  );
}
