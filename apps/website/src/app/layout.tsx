import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'PT Automation Solusi Nusantara | Sistem Integrator & Pengadaan Otomasi Industri',
  description: 'Penyedia solusi integrasi sistem otomasi industri, pemrograman PLC Siemens, Omron, SCADA WinCC, Inverter VFD, robotik, dan supply komponen industri resmi di Indonesia.',
  keywords: [
    'otomasi industri',
    'sistem integrator',
    'distributor PLC Siemens',
    'SCADA Indonesia',
    'inverter VFD',
    'robot palletizer',
    'panel kontrol pabrik',
    'sensor industri',
  ],
  authors: [{ name: 'PT Automation Solusi Nusantara' }],
  openGraph: {
    title: 'PT Automation Solusi Nusantara | Industrial Automation Systems',
    description: 'Solusi terpadu sistem otomasi pabrik, supply PLC, HMI, SCADA, dan instrumentasi resmi di Indonesia.',
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
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
