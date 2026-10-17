import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Company Col */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-base">
              ASF
            </div>
            <span className="font-bold text-white text-base">Automation Solusi</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Perusahaan supply komponen dan penyedia solusi integrasi sistem otomasi industri, PLC, SCADA, robotika, dan panel kontrol terpercaya di Indonesia.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            NIB: 1234567890123 | NPWP: 01.234.567.8-000.000
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Navigasi Utama</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            </li>
            <li>
              <Link href="/layanan" className="hover:text-white transition-colors">Layanan & Produk Otomasi</Link>
            </li>
            <li>
              <Link href="/portofolio" className="hover:text-white transition-colors">Portofolio & Studi Kasus</Link>
            </li>
            <li>
              <Link href="/tentang-kami" className="hover:text-white transition-colors">Profil Perusahaan & Legalitas</Link>
            </li>
            <li>
              <Link href="/kontak" className="hover:text-white transition-colors">Hubungi Kami</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Solusi Industri</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Programmable Logic Controller (PLC)</li>
            <li>Human Machine Interface (HMI) & SCADA</li>
            <li>Variable Frequency Drive (VFD / Inverter)</li>
            <li>Instrumentation & Process Sensor</li>
            <li>Control Panel Assembly & Retrofit</li>
            <li>Industrial Robot Palletizer</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Kantor & Workshop</h4>
          <div className="space-y-2.5 text-slate-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Kawasan Industri MM2100, Blok B-12, Cikarang Barat, Bekasi, Jawa Barat 17530</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>(021) 8990-1234 / 0812-3456-7890</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>sales@automationsolusi.co.id</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Senin - Jumat: 08.00 - 17.00 WIB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <p>© 2026 PT Automation Solusi Nusantara. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="flex items-center gap-2">
          <span>Solusi Otomasi Industri Terpadu</span>
        </p>
      </div>
    </footer>
  );
};
