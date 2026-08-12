'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import DashboardIcon from '@mui/icons-material/Dashboard';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PeopleIcon from '@mui/icons-material/People';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HealingIcon from '@mui/icons-material/Healing';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const DRAWER_WIDTH = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/login') {
      router.push('/login');
      return;
    }
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Doctors Roster', path: '/doctors', icon: <MedicalServicesIcon /> },
    { label: 'Nurses Roster', path: '/nurses', icon: <HealingIcon /> },
    { label: 'Patients Roster', path: '/patients', icon: <PeopleIcon /> },
    { label: 'Pharmacists Roster', path: '/pharmacists', icon: <LocalPharmacyIcon /> },
    { label: 'Home Care Requests', path: '/home-care', icon: <HomeWorkIcon /> },
    { label: 'Doctor Referrals', path: '/referrals', icon: <SwapHorizIcon /> },
    { label: 'Assignment Matrix', path: '/assignments', icon: <AssignmentIndIcon /> },
    { label: 'Billing Oversight', path: '/billing', icon: <PaymentsIcon /> },
    { label: 'Prescription Logs', path: '/transactions', icon: <ReceiptLongIcon /> }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#131F22', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 900, width: 40, height: 40, boxShadow: '0 0 12px rgba(0,200,150,0.5)' }}>
          M
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#EBF5F3', lineHeight: 1.1, fontSize: '1.1rem' }}>
            Medizo <span style={{ color: '#00C896' }}>Admin</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A8A3', fontWeight: 600, fontSize: '0.7rem' }}>
            Management Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: '12px',
                mb: 1,
                py: 1.2,
                px: 2,
                bgcolor: isActive ? 'rgba(0, 200, 150, 0.15)' : 'transparent',
                color: isActive ? '#00C896' : '#94A8A3',
                border: isActive ? '1px solid rgba(0, 200, 150, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(0, 200, 150, 0.1)',
                  color: '#EBF5F3'
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#00C896' : '#94A8A3', minWidth: 38 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, fontSize: '0.9rem' }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Admin User Quick Profile */}
      <Box sx={{ p: 2, m: 1.5, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: '#7C4DFF', width: 34, height: 34, fontSize: '0.9rem', fontWeight: 800 }}>
            A
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#EBF5F3', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {adminUser?.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : 'System Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#00C896', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.68rem' }}>
              <VerifiedUserIcon sx={{ fontSize: 12 }} /> Superuser
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.1)', py: 0.8, color: '#EF4444', justifyContent: 'center' }}
        >
          <LogoutIcon sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            Sign Out
          </Typography>
        </ListItemButton>
      </Box>
    </Box>
  );

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B1315' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(19, 31, 34, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#EBF5F3', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettingsIcon sx={{ color: '#00C896' }} /> Medizo Administrative System
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: '14px !important', color: '#00C896 !important' }} />}
              label="Live Cloudflare D1 System"
              size="small"
              sx={{ bgcolor: 'rgba(0, 200, 150, 0.12)', color: '#00C896', border: '1px solid rgba(0, 200, 150, 0.3)', fontWeight: 700 }}
            />
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ bgcolor: '#00C896', color: '#0B1315', fontWeight: 800, cursor: 'pointer', width: 36, height: 36 }}
            >
              A
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: { bgcolor: '#131F22', border: '1px solid rgba(255,255,255,0.1)', color: '#EBF5F3', mt: 1, borderRadius: '12px' }
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', fontWeight: 700, gap: 1 }}>
                <LogoutIcon fontSize="small" /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#131F22' }
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#131F22' }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
