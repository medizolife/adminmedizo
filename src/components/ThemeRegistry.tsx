'use client';
import * as React from 'react';
import { AppThemeProvider } from '@/context/ThemeContext';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <style jsx global>{`
        :root {
          --color-teal: #00C896;
          --color-mint: #33D3AA;
          --color-dark-bg: #0B1315;
          --color-panel-bg: #131F22;
          --color-panel-elevated: #1A2A2E;
          --color-panel-subtle: rgba(255, 255, 255, 0.03);
          --color-text-primary: #EBF5F3;
          --color-text-secondary: #94A8A3;
          --glass-border: rgba(255, 255, 255, 0.08);
          --scrollbar-track: #0B1315;
          --scrollbar-thumb: #1C2D31;
          --table-head-bg: #0E1719;
          --card-bg: #131F22;
          --card-border: rgba(0, 200, 150, 0.2);
        }

        [data-theme='light'] {
          --color-teal: #008F68;
          --color-mint: #10B981;
          --color-dark-bg: #FAF8F5;
          --color-panel-bg: #FFFFFF;
          --color-panel-elevated: #F3EFE6;
          --color-panel-subtle: #EBE5D8;
          --color-text-primary: #182824;
          --color-text-secondary: #526660;
          --glass-border: rgba(45, 80, 60, 0.12);
          --scrollbar-track: #FAF8F5;
          --scrollbar-thumb: #D5CEBF;
          --table-head-bg: #EBE5D8;
          --card-bg: #FFFFFF;
          --card-border: rgba(45, 80, 60, 0.12);
        }

        body {
          background-color: var(--color-dark-bg);
          color: var(--color-text-primary);
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 0;
          transition: background-color 0.25s ease, color 0.25s ease;
        }

        /* ─────────────────────────────────────────────────────────────
           LIGHT MODE UNIVERSAL STYLING OVERRIDES (Warm Beige & Olive)
        ───────────────────────────────────────────────────────────── */
        [data-theme='light'] body {
          background-color: #FAF8F5 !important;
          color: #182824 !important;
        }

        /* Cards & Papers */
        [data-theme='light'] .MuiPaper-root {
          background-color: #FFFFFF !important;
          color: #182824 !important;
          border-color: rgba(45, 80, 60, 0.12) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
        }

        [data-theme='light'] .MuiPaper-root[style*="background-color: #131F22"],
        [data-theme='light'] .MuiPaper-root[style*="background-color: rgb(19, 31, 34)"] {
          background-color: #FFFFFF !important;
          color: #182824 !important;
          border-color: rgba(45, 80, 60, 0.12) !important;
        }

        /* Dialogs & Modals */
        [data-theme='light'] .MuiDialog-paper {
          background-color: #FAF8F5 !important;
          color: #182824 !important;
          border: 1px solid rgba(45, 80, 60, 0.16) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12) !important;
        }

        [data-theme='light'] .MuiDialogTitle-root {
          border-bottom-color: rgba(45, 80, 60, 0.1) !important;
          color: #182824 !important;
        }

        [data-theme='light'] .MuiDialogContent-root {
          color: #182824 !important;
        }

        [data-theme='light'] .MuiDialogActions-root {
          border-top-color: rgba(45, 80, 60, 0.1) !important;
        }

        /* Sidebar Drawer */
        [data-theme='light'] .MuiDrawer-paper {
          background-color: #F5F1E8 !important;
          color: #182824 !important;
          border-right: 1px solid rgba(45, 80, 60, 0.14) !important;
        }

        /* Top Header */
        [data-theme='light'] .MuiAppBar-root {
          background-color: rgba(250, 248, 245, 0.94) !important;
          color: #182824 !important;
          border-bottom: 1px solid rgba(45, 80, 60, 0.12) !important;
          backdrop-filter: blur(12px) !important;
        }

        /* Tables & Rows */
        [data-theme='light'] .MuiTableCell-root {
          color: #182824 !important;
          border-bottom: 1px solid rgba(45, 80, 60, 0.08) !important;
        }

        [data-theme='light'] .MuiTableCell-head {
          background-color: #EBE5D8 !important;
          color: #2D4A41 !important;
          font-weight: 800 !important;
        }

        [data-theme='light'] .MuiTableRow-root:hover {
          background-color: rgba(0, 143, 104, 0.05) !important;
        }

        /* Inputs & TextFields */
        [data-theme='light'] .MuiInputBase-root {
          background-color: #FFFFFF !important;
          color: #182824 !important;
        }

        [data-theme='light'] .MuiOutlinedInput-notchedOutline {
          border-color: rgba(45, 80, 60, 0.2) !important;
        }

        [data-theme='light'] .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #008F68 !important;
        }

        /* Tabs & Indicators */
        [data-theme='light'] .MuiTabs-root {
          background-color: #F5F1E8 !important;
        }

        [data-theme='light'] .MuiTab-root {
          color: #526660 !important;
        }

        [data-theme='light'] .MuiTab-root.Mui-selected {
          color: #008F68 !important;
        }

        [data-theme='light'] .MuiTabs-indicator {
          background-color: #008F68 !important;
        }

        /* Typography Colors in Light Mode */
        [data-theme='light'] .MuiTypography-h1,
        [data-theme='light'] .MuiTypography-h2,
        [data-theme='light'] .MuiTypography-h3,
        [data-theme='light'] .MuiTypography-h4,
        [data-theme='light'] .MuiTypography-h5,
        [data-theme='light'] .MuiTypography-h6,
        [data-theme='light'] .MuiTypography-subtitle1 {
          color: #182824;
        }

        [data-theme='light'] .MuiTypography-body1,
        [data-theme='light'] .MuiTypography-body2 {
          color: #2D3E3A;
        }

        [data-theme='light'] .MuiTypography-caption {
          color: #526660;
        }

        /* Menus & Popovers */
        [data-theme='light'] .MuiMenu-paper {
          background-color: #FFFFFF !important;
          color: #182824 !important;
          border: 1px solid rgba(45, 80, 60, 0.15) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
        }

        [data-theme='light'] .MuiMenuItem-root:hover {
          background-color: rgba(0, 143, 104, 0.08) !important;
        }

        /* Code and Pre Elements */
        [data-theme='light'] pre {
          background-color: #F3EFE6 !important;
          color: #182824 !important;
          border: 1px solid rgba(45, 80, 60, 0.15) !important;
        }

        /* Scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-teal);
        }
      `}</style>
      {children}
    </AppThemeProvider>
  );
}
