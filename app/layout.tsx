import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Old City Sand Washing - Slip Control',
  description: 'Delivery slip and tax invoice management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
