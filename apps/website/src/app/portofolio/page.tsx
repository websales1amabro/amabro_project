import React from 'react';
import Link from 'next/link';
import { Building, MapPin, CheckCircle, ArrowRight, Layers, Tag } from 'lucide-react';

export default function PortfolioPage() {
  const projects = [
    {
      id: 'proj-1',
      title: 'Upgrade & Migrasi Sistem Kontrol PLC Siemens S7-1500 & WinCC SCADA',
      industry: 'Makanan & Minuman (F&B)',
      client: 'PT Indofood CBP Sukses Makmur',
      location: 'Cikarang, Jawa Barat',
      scope: 'Penggantian CPU S7-300 yang obsolete ke S7-1516-3 PN/DP, rewrite logic TIA Portal, penambahan ET200SP Remote I/O, dan runtime license SCADA WinCC V18.',
      impact: 'Throughput mesin meningkat 24%, zero unplanned downtime selama 12 bulan pertama, dan visualisasi proses real-time ke ruang kendali utama.',
      techStack: ['Siemens S7-1500', 'WinCC V18', 'Profinet', 'ET200SP Remote I/O'],
    },
    {
      id: 'proj-2',
      title: 'Retrofit Inverter VFD 75kW Clinker Cooler Fan Motor',
      industry: 'Semen & Bahan Bangunan (Heavy Industry)',
      client: 'PT Semen Indonesia Group',
      location: 'Tuban, Jawa Timur',
      scope: 'Penggantian sistem starter konvensional ke Variable Frequency Drive Delta CP2000 75kW lengkap dengan panel enclosure IP54 dan heat exhaust cooling.',
      impact: 'Efisiensi konsumsi listrik fan clinker cooler mencapai 28.5%, tarikan arus start motor halus (tanpa lonjakan voltase pabrik).',
      techStack: ['Delta CP2000 75kW', 'Panel IP54', 'Bypass Contactor', 'Modbus RS485'],
    },
    {
      id: 'proj-3',
      title: 'Sistem Robot Palletizer Otomatis & Safety Interlock Cage',
      industry: 'Kemasan & Consumer Goods',
      client: 'PT Mayora Indah Tbk',
      location: 'Tangerang, Banten',
      scope: 'Pemasangan lengan robot artikulasi 4-axis dengan custom vacuum gripper, konveyor infeed karton, dispenser palet otomatis, dan safety light curtain ISO 13849.',
      impact: 'Kapasitas susun mencapai 20 karton/menit, meniadakan risiko cedera kerja ergonomis manual, dan akurasi susun palet mencapai 100%.',
      techStack: ['Articulated Robot', 'Vacuum Gripper', 'Safety Light Curtain', 'Omron PLC'],
    },
    {
      id: 'proj-4',
      title: 'Supply & Kalibrasi Pressure Transmitter Explosion Proof Area Boiler',
      industry: 'Pupuk & Petrokimia',
      client: 'PT Pupuk Sriwidjaja',
      location: 'Palembang, Sumatera Selatan',
      scope: 'Pengadaan 16 unit transmitter tekanan 0-10 bar dengan sertifikasi ATEX Explosion Proof, komunikasi Hart Protocol, dan sertifikat kalibrasi KAN.',
      impact: 'Pengukuran tekanan uap boiler dengan akurasi 0.075% span dan kepatuhan regulasi keselamatan gas kimia berbahaya.',
      techStack: ['Siemens Sitrans P', 'Hart Protocol', 'ATEX Ex-Proof', 'KAN Certified'],
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
          Rekam Jejak Implementasi
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Portofolio & Studi Kasus Proyek Otomasi
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Berbagai sistem otomasi industri yang telah kami rancang, bangun, dan komisioning untuk meningkatkan produktivitas serta keselamatan kerja pabrik mitra kami.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {p.industry}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {p.location}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {p.title}
              </h2>

              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Klien: {p.client}
              </p>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Lingkup Pekerjaan:</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{p.scope}</p>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-emerald-950">
                  <span className="font-bold block text-[11px] text-emerald-800">Dampak & Manfaat Terukur:</span>
                  <p className="text-slate-700 text-xs leading-relaxed mt-0.5">{p.impact}</p>
                </div>
              </div>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {p.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" /> {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Status: Selesai & Bergaransi</span>
              <Link
                href="/minta-penawaran"
                className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Konsultasikan Proyek Serupa <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
