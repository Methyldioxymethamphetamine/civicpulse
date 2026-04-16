import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'CivicPulse — Infrastructure Reporting Platform',
  description:
    'Frictionless public infrastructure reporting for citizens, field workers, and government authorities.',
  keywords: ['infrastructure', 'reporting', 'civic', 'government', 'public works'],
  openGraph: {
    title: 'CivicPulse',
    description: 'Report and track public infrastructure issues in real time.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161c2e',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
