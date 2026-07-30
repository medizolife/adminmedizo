import React from 'react';
import ThemeRegistry from '@/components/ThemeRegistry';

export const metadata = {
  title: 'Medizo Admin Portal',
  description: 'Management Portal for Doctors, Patients, Pharmacists Rosters and Prescriptions'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
