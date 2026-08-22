'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
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
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SyncIcon from '@mui/icons-material/Sync';

import { useAdminData } from '@/context/AdminDataContext';
import { useAppTheme } from '@/context/ThemeContext';

const DRAWER_WIDTH = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const { isPreloaded, isSyncing, preloadAll } = useAdminData();
  const { mode, toggleColorMode, isLight, themeColors } = useAppTheme();

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser') || localStorage.getItem('user');
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      sessionStorage.removeItem('medizo_admin_portal_cache_v2');
    } catch (e) {}
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Analytics & Insights', path: '/analytics', icon: <InsightsIcon /> },
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isLight ? '#F5F1E8' : '#131F22', borderRight: isLight ? '1px solid rgba(45, 80, 60, 0.12)' : '1px solid rgba(255,255,255,0.08)' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 900, width: 40, height: 40, boxShadow: isLight ? '0 2px 10px rgba(0,143,104,0.3)' : '0 0 12px rgba(0,200,150,0.5)' }}>
          M
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: themeColors.textPrimary, lineHeight: 1.1, fontSize: '1.1rem' }}>
            Medizo <span style={{ color: themeColors.accentPrimary }}>Admin</span>
          </Typography>
          <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
            Management Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: isLight ? 'rgba(45, 80, 60, 0.1)' : 'rgba(255,255,255,0.08)', mb: 2 }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
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
                mb: 0.8,
                py: 1.1,
                px: 2,
                bgcolor: isActive
                  ? (isLight ? 'rgba(0, 143, 104, 0.12)' : 'rgba(0, 200, 150, 0.15)')
                  : 'transparent',
                color: isActive
                  ? themeColors.accentPrimary
                  : themeColors.textSecondary,
                border: isActive
                  ? (isLight ? '1px solid rgba(0, 143, 104, 0.3)' : '1px solid rgba(0, 200, 150, 0.3)')
                  : '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isLight ? 'rgba(0, 143, 104, 0.08)' : 'rgba(0, 200, 150, 0.1)',
                  color: themeColors.textPrimary
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? themeColors.accentPrimary : themeColors.textSecondary, minWidth: 38 }}>
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

      {/* Quick Theme Switcher Pill in Drawer */}
      <Box sx={{ px: 2, py: 1 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          onClick={toggleColorMode}
          startIcon={isLight ? <DarkModeIcon sx={{ color: '#7C3AED' }} /> : <LightModeIcon sx={{ color: '#F59E0B' }} />}
          sx={{
            borderRadius: '12px',
            py: 1,
            borderColor: isLight ? 'rgba(45, 80, 60, 0.2)' : 'rgba(255,255,255,0.12)',
            bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.04)',
            color: themeColors.textPrimary,
            fontWeight: 800,
            fontSize: '0.78rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: isLight ? '#E2DBD0' : 'rgba(255,255,255,0.08)',
              borderColor: themeColors.accentPrimary
            }
          }}
        >
          {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        </Button>
      </Box>

      {/* Admin User Quick Profile */}
      <Box sx={{ p: 2, m: 1.5, borderRadius: '16px', bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.03)', border: isLight ? '1px solid rgba(45, 80, 60, 0.12)' : '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: isLight ? '#7C3AED' : '#7C4DFF', width: 34, height: 34, fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>
            A
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.textPrimary, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {adminUser?.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : 'System Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.accentPrimary, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.68rem', fontWeight: 700 }}>
              <VerifiedUserIcon sx={{ fontSize: 12 }} /> Superuser
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: '10px', bgcolor: isLight ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.1)', py: 0.8, color: '#DC2626', justifyContent: 'center' }}
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isLight ? '#FAF8F5' : '#0B1315', color: themeColors.textPrimary }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: isLight ? 'rgba(250, 248, 245, 0.92)' : 'rgba(19, 31, 34, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: isLight ? '1px solid rgba(45, 80, 60, 0.12)' : '1px solid rgba(255,255,255,0.08)',
          color: themeColors.textPrimary
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

          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettingsIcon sx={{ color: themeColors.accentPrimary }} /> Medizo Administrative System
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Theme Mode Toggle Button */}
            <Tooltip title={isLight ? "Switch to Dark Mode (Space Teal)" : "Switch to Light Mode (Warm Beige & Olive)"}>
              <Button
                size="small"
                variant="outlined"
                onClick={toggleColorMode}
                startIcon={isLight ? <DarkModeIcon sx={{ color: '#7C3AED', fontSize: 18 }} /> : <LightModeIcon sx={{ color: '#F59E0B', fontSize: 18 }} />}
                sx={{
                  borderRadius: '20px',
                  px: 1.8,
                  py: 0.6,
                  borderColor: isLight ? 'rgba(45, 80, 60, 0.25)' : 'rgba(255,255,255,0.15)',
                  bgcolor: isLight ? '#EBE5D8' : 'rgba(255,255,255,0.05)',
                  color: themeColors.textPrimary,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                  '&:hover': {
                    bgcolor: isLight ? '#E2DBD0' : 'rgba(255,255,255,0.1)',
                    borderColor: themeColors.accentPrimary
                  }
                }}
              >
                {isLight ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Tooltip>

            {/* Sync Cache Badge */}
            <Chip
              icon={<SyncIcon sx={{ fontSize: '14px !important', color: `${themeColors.accentPrimary} !important`, animation: isSyncing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />}
              label={isSyncing ? 'Syncing...' : isPreloaded ? 'Cache Active' : 'Loading...'}
              size="small"
              onClick={() => preloadAll(true)}
              sx={{
                bgcolor: isLight ? 'rgba(0, 143, 104, 0.1)' : 'rgba(0, 200, 150, 0.12)',
                color: themeColors.accentPrimary,
                border: isLight ? '1px solid rgba(0, 143, 104, 0.25)' : '1px solid rgba(0, 200, 150, 0.3)',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { bgcolor: isLight ? 'rgba(0, 143, 104, 0.18)' : 'rgba(0, 200, 150, 0.2)' }
              }}
            />

            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ bgcolor: themeColors.accentPrimary, color: isLight ? '#FFFFFF' : '#0B1315', fontWeight: 800, cursor: 'pointer', width: 36, height: 36 }}
            >
              A
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  bgcolor: isLight ? '#FFFFFF' : '#131F22',
                  border: isLight ? '1px solid rgba(45, 80, 60, 0.15)' : '1px solid rgba(255,255,255,0.1)',
                  color: themeColors.textPrimary,
                  mt: 1,
                  borderRadius: '12px',
                  boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.5)'
                }
              }}
            >
              <MenuItem onClick={() => { setAnchorEl(null); preloadAll(true); }} sx={{ fontWeight: 700, gap: 1 }}>
                <SyncIcon fontSize="small" /> Force Refresh All Data
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); toggleColorMode(); }} sx={{ fontWeight: 700, gap: 1 }}>
                {isLight ? <DarkModeIcon fontSize="small" sx={{ color: '#7C3AED' }} /> : <LightModeIcon fontSize="small" sx={{ color: '#F59E0B' }} />}
                Toggle Theme ({isLight ? 'Dark' : 'Light'})
              </MenuItem>
              <Divider sx={{ borderColor: isLight ? 'rgba(45, 80, 60, 0.1)' : 'rgba(255,255,255,0.08)' }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#DC2626', fontWeight: 700, gap: 1 }}>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: isLight ? '#F5F1E8' : '#131F22' }
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: isLight ? '#F5F1E8' : '#131F22' }
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
          mt: 8,
          bgcolor: isLight ? '#FAF8F5' : '#0B1315',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
