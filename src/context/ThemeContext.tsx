'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bgDefault: string;
  bgPaper: string;
  bgPaperElevated: string;
  bgPaperSubtle: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  borderAccent: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  accentWarning: string;
  accentSuccess: string;
  accentError: string;
}

export const darkColors: ThemeColors = {
  bgDefault: '#0B1315',
  bgPaper: '#131F22',
  bgPaperElevated: '#1A2A2E',
  bgPaperSubtle: 'rgba(255, 255, 255, 0.03)',
  textPrimary: '#EBF5F3',
  textSecondary: '#94A8A3',
  border: 'rgba(255, 255, 255, 0.08)',
  borderAccent: 'rgba(0, 200, 150, 0.3)',
  accentPrimary: '#00C896',
  accentSecondary: '#38BDF8',
  accentTertiary: '#C084FC',
  accentWarning: '#F59E0B',
  accentSuccess: '#10B981',
  accentError: '#EF4444'
};

export const lightColors: ThemeColors = {
  bgDefault: '#FAF8F5',       // Very light warm beige
  bgPaper: '#FFFFFF',         // Pure clean card paper
  bgPaperElevated: '#F3EFE6', // Soft oatmeal beige elevation
  bgPaperSubtle: '#EBE5D8',   // Light sand background
  textPrimary: '#182824',     // Deep charcoal forest espresso
  textSecondary: '#526660',   // Muted sage olive
  border: 'rgba(45, 80, 60, 0.12)',
  borderAccent: 'rgba(0, 143, 104, 0.35)',
  accentPrimary: '#008F68',   // Deep medical emerald
  accentSecondary: '#0284C7', // Sky cyan
  accentTertiary: '#7C3AED', // Royal purple
  accentWarning: '#D97706',   // Warm amber
  accentSuccess: '#059669',   // Forest green
  accentError: '#DC2626'      // Crimson red
};

interface ThemeContextType {
  mode: ThemeMode;
  toggleColorMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isLight: boolean;
  themeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
  setThemeMode: () => {},
  isLight: false,
  themeColors: darkColors
});

export const useAppTheme = () => useContext(ThemeContext);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('medizo_theme_mode') as ThemeMode;
    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('medizo_theme_mode', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('medizo_theme_mode', newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const isLight = mode === 'light';
  const themeColors = isLight ? lightColors : darkColors;

  const theme: Theme = useMemo(() => {
    const isL = mode === 'light';
    return createTheme({
      palette: {
        mode,
        primary: {
          main: isL ? '#008F68' : '#00C896',
          light: isL ? '#10B981' : '#33D3AA',
          dark: isL ? '#006B4D' : '#009A73'
        },
        secondary: {
          main: isL ? '#7C3AED' : '#7C4DFF',
          light: isL ? '#A78BFA' : '#B388FF',
          dark: isL ? '#5B21B6' : '#651FFF'
        },
        background: {
          default: isL ? '#FAF8F5' : '#0B1315',
          paper: isL ? '#FFFFFF' : '#131F22'
        },
        text: {
          primary: isL ? '#182824' : '#EBF5F3',
          secondary: isL ? '#526660' : '#94A8A3'
        },
        divider: isL ? 'rgba(45, 80, 60, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        success: { main: isL ? '#059669' : '#10B981' },
        error: { main: isL ? '#DC2626' : '#EF4444' },
        warning: { main: isL ? '#D97706' : '#F59E0B' },
        info: { main: isL ? '#0284C7' : '#3B82F6' }
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 800 },
        h4: { fontWeight: 800 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 }
      },
      shape: {
        borderRadius: 16
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 12
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: isL ? '1px solid rgba(45, 80, 60, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isL ? '0 4px 20px rgba(0, 0, 0, 0.04)' : 'none'
            }
          }
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: isL ? '1px solid rgba(45, 80, 60, 0.08)' : '1px solid rgba(255, 255, 255, 0.06)'
            },
            head: {
              backgroundColor: isL ? '#EBE5D8' : '#0E1719',
              color: isL ? '#182824' : '#94A8A3',
              fontWeight: 800
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 700
            }
          }
        }
      }
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, setThemeMode, isLight, themeColors }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
