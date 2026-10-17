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
              ABI
            </div>
            <div>
              <span className="font-bold text-white text-base block leading-none">AMABRO</span>
              <span className="text-[10px] text-slate-400">Bintang Inovasi</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            PT. Amabro Bintang Inovasi adalah perusahaan spesialis solusi Instrumentasi, Mechanical, dan Valve terpercaya untuk pembangkit listrik, pabrik kertas, semen, dan manufaktur di Indonesia.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            Est. 2018 | www.amabroindonesia.com
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
              <Link href="/produk" className="hover:text-white text-blue-400 font-semibold transition-colors">Katalog Produk & Valve</Link>
            </li>
            <li>
              <Link href="/layanan" className="hover:text-white transition-colors">Layanan & Solusi Otomasi</Link>
            </li>
            <li>
              <Link href="/portofolio" className="hover:text-white transition-colors">Portofolio & Pengalaman</Link>
            </li>
            <li>
              <Link href="/tentang-kami" className="hover:text-white transition-colors">Profil Perusahaan</Link>
            </li>
            <li>
              <Link href="/kontak" className="hover:text-white transition-colors">Hubungi Kami</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Produk & Brand Utama</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Emerson / Rosemount (Transmitters, TREX)</li>
            <li>Yokogawa (DPharp EJA Series, BT200)</li>
            <li>ABB (TZIDC Valve Positioners, 266 Series)</li>
            <li>Azbil (AVP Smart Positioners & Transmitters)</li>
            <li>Endress+Hauser (Promass, Levelflex Radar)</li>
            <li>SOR (Heavy-Duty Pressure Switches)</li>
            <li>Rotork (YT Series Positioners & Actuators)</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm tracking-wide">Kantor & Kontak</h4>
          <div className="space-y-2.5 text-slate-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Plaza Aminta Lt 5/504, Jl. TB Simatupang Kav 10, Jakarta Selatan, DKI Jakarta 12310</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>(021) 2292-0544</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+62 813-1533-3391 (Egi Restu)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>info@amabroindonesia.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Senin - Jumat: 08.00 - 17.00 WIB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <p>© 2026 PT. Amabro Bintang Inovasi. All Rights Reserved.</p>
        <p className="flex items-center gap-2">
          <span>Committed to Excellence and Innovation</span>
        </p>
      </div>
    </footer>
  );
};
