'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import RefreshIcon from '@mui/icons-material/Refresh';
import HealingIcon from '@mui/icons-material/Healing';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import AdminLayout from '@/components/AdminLayout';
import UserDetailModal from '@/components/UserDetailModal';
import { adminExtraApi } from '@/services/adminExtraApi';

export default function AssignmentsMatrix() {
  const [tab, setTab] = useState(0);
  const [nurseAssignments, setNurseAssignments] = useState<any[]>([]);
  const [doctorAssignments, setDoctorAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminExtraApi.getAssignmentsOverview();
      if (res.success) {
        setNurseAssignments(res.nurseAssignments?.items || []);
        setDoctorAssignments(res.doctorAssignments?.items || []);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AssignmentIndIcon sx={{ color: '#00C896', fontSize: '2rem' }} />
              Care Assignment Matrix & Visibility
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A8A3', mt: 0.5 }}>
              System-wide mapping of doctor-patient primary care and multi-nurse disease/task care assignments.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={fetchData}
            startIcon={<RefreshIcon />}
            sx={{ color: '#94A8A3', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>

        {/* Tab selector */}
        <Paper sx={{ mb: 3, bgcolor: '#131F22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#00C896', height: 3 },
              '& .MuiTab-root': { color: '#94A8A3', fontWeight: 700, textTransform: 'none', py: 2, '&.Mui-selected': { color: '#00C896' } }
            }}
          >
            <Tab icon={<HealingIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Nurse-Patient Tasks (${nurseAssignments.length})`} />
            <Tab icon={<MedicalServicesIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Doctor-Patient Links (${doctorAssignments.length})`} />
          </Tabs>
        </Paper>

        {/* Content Table */}
        <Paper sx={{ bgcolor: '#131F22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#00C896' }} />
            </Box>
          ) : tab === 0 ? (
            /* Nurse-Patient Table */
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#0B1315' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Nurse</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Care Task / Condition</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Frequency & Period</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Assigned By Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nurseAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No nurse-patient assignments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    nurseAssignments.map((a) => (
                      <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: a.nurseId, firstName: a.nurseFirstName, lastName: a.nurseLastName, role: 'nurse' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              {a.nurseFirstName} {a.nurseLastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#00C896' }}>Nurse Practitioner</Typography>
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
                            <Typography variant="caption" sx={{ color: '#94A8A3' }}>Patient</Typography>
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
                            {a.frequency?.toUpperCase() || 'DAILY'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A8A3' }}>
                            Since {new Date(a.startDate).toLocaleDateString()}
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
                              bgcolor: a.status === 'active' ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
                              color: a.status === 'active' ? '#4CAF50' : '#94A8A3',
                              fontWeight: 800
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* Doctor-Patient Table */
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#0B1315' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Attending Doctor</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Patient</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Assignment Type</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Origin Source</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Linked Date</TableCell>
                    <TableCell sx={{ color: '#94A8A3', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {doctorAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#94A8A3' }}>
                        No doctor-patient assignments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    doctorAssignments.map((d) => (
                      <TableRow key={d.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: d.doctorId, firstName: d.doctorFirstName, lastName: d.doctorLastName, role: 'doctor' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#00C896' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              Dr. {d.doctorFirstName} {d.doctorLastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#00C896' }}>
                              {d.doctorSpecialization || 'Physician'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            onClick={() => setSelectedUser({ id: d.patientId, firstName: d.patientFirstName, lastName: d.patientLastName, role: 'patient' })}
                            sx={{ cursor: 'pointer', display: 'inline-block', '&:hover': { color: '#60A5FA' } }}
                          >
                            <Typography sx={{ color: '#EBF5F3', fontWeight: 700 }}>
                              {d.patientFirstName} {d.patientLastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A8A3' }}>Patient</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={d.assignmentType?.replace(/_/g, ' ').toUpperCase() || 'PRIMARY CARE'}
                            size="small"
                            sx={{ bgcolor: 'rgba(33,150,243,0.15)', color: '#2196F3', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#94A8A3', fontWeight: 600 }}>
                          {d.source?.toUpperCase() || 'PRESCRIPTION'}
                        </TableCell>
                        <TableCell sx={{ color: '#EBF5F3' }}>
                          {new Date(d.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(d.status || 'active').toUpperCase()}
                            size="small"
                            sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4CAF50', fontWeight: 800 }}
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
        onUserUpdated={fetchData}
      />
    </AdminLayout>
  );
}
