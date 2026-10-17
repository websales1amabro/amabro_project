import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'PT. Amabro Bintang Inovasi | Distributor Resmi Instrumentasi, Mechanical & Valve',
  description: 'Spesialis penyedia solusi instrumentasi proses, transmitter Rosemount, Yokogawa, valve positioner ABB, Rotork, Siemens, Endress+Hauser, dan SOR di Indonesia.',
  keywords: [
    'Amabro Bintang Inovasi',
    'distributor Rosemount Indonesia',
    'Yokogawa transmitter EJA',
    'Rotork positioner YT-3700',
    'ABB TZIDC valve positioner',
    'SOR pressure switch',
    'Endress Hauser flowmeter',
    'instrumentasi pabrik',
  ],
  authors: [{ name: 'PT. Amabro Bintang Inovasi' }],
  openGraph: {
    title: 'PT. Amabro Bintang Inovasi | Instrumentation & Valve Solutions',
    description: 'Solusi terpadu pengadaan instrumen presisi, valve positioner, dan mechanical engineering di Indonesia.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans flex flex-col min-h-screen">
        <Suspense fallback={<div className="h-20 bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}

