import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Cpu, 
  MonitorCheck, 
  Zap, 
  Bot, 
  Gauge, 
  Settings2, 
  ShieldCheck, 
  Clock, 
  Users, 
  ChevronRight,
  Building,
  Sparkles,
  Package,
  Layers
} from 'lucide-react';
import { FALLBACK_PRODUCTS } from '@/lib/products';

export default function HomePage() {
  const featuredProducts = FALLBACK_PRODUCTS.slice(0, 6);

  const coreServices = [
    {
      title: 'Solusi Instrumentasi & Kalibrasi',
      description: 'Pengadaan transmitter tekanan diferensial (DP), flowmeter Coriolis/ultrasonic, level radar, dan analyzer cairan bergaransi resmi.',
      icon: Gauge,
      color: 'bg-blue-600',
    },
    {
      title: 'Control Valve & Smart Positioner',
      description: 'Supply dan retrofitting elektro-pneumatik valve positioner (Rotork, ABB TZIDC, Siemens SIPART, Azbil) untuk presisi aliran fluida.',
      icon: Settings2,
      color: 'bg-indigo-600',
    },
    {
      title: 'Heavy Duty Pressure Switches & Interlock',
      description: 'Pengadaan switch tekanan SOR (Explosion-proof, hermetically sealed) untuk perlindungan trip turbin boiler dan tangki gas.',
      icon: Zap,
      color: 'bg-purple-600',
    },
    {
      title: 'Handheld Field Communicator',
      description: 'Device communicator portabel Emerson AMS Trex, HART 475, dan Yokogawa BT200 untuk teknisi instrumen di area hazardous.',
      icon: Cpu,
      color: 'bg-teal-600',
    },
    {
      title: 'Sistem PLC & Integrasi SCADA',
      description: 'Arsitektur kontrol logika terprogram, integrasi komunikasi Modbus/Profibus/HART, dan monitoring HMI/SCADA proses pabrik.',
      icon: MonitorCheck,
      color: 'bg-slate-800',
    },
    {
      title: 'Mechanical Engineering & Piping Support',
      description: 'Pengadaan manifold, fitting instrumen stainless steel, diaphragm seal, dan instalasi mekanikal tahan korosi.',
      icon: Bot,
      color: 'bg-rose-600',
    },
  ];

  const brands = [
    'Emerson / Rosemount',
    'Yokogawa',
    'ABB',
    'Azbil',
    'Endress+Hauser',
    'SOR Controls',
    'Siemens',
    'Honeywell',
    'Rotork',
    'Fisher / Masoneilan',
  ];

  const clientSuccess = [
    { name: 'PLN Indonesia Power', desc: 'Pembangkit Listrik Tenaga Uap & Gas' },
    { name: 'PLN Nusantara Power', desc: 'Penyedia Energi Listrik Nasional' },
    { name: 'PT Indah Kiat Pulp & Paper', desc: 'Industri Pulp & Kertas Skala Global' },
    { name: 'TJB Power Services', desc: 'Pembangkit Listrik Tanjung Jati B' },
    { name: 'SIG (Semen Indonesia Group)', desc: 'Produsen Bahan Bangunan & Semen Terbesar' },
    { name: 'Star Energy Geothermal', desc: 'Pembangkit Listrik Tenaga Panas Bumi' },
    { name: 'PT Pupuk Indonesia (Holding)', desc: 'Industri Pupuk & Petrokimia Nasional' },
    { name: 'PT Sumba Manis', desc: 'Industri Agribisnis & Pengolahan Gula' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            PT. Amabro Bintang Inovasi &bull; Solusi Instrumentasi, Mechanical & Valve
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Solusi Instrumentasi Proses, Valve & Otomasi Industri Terpercaya
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mitra pengadaan resmi komponen instrumen presisi, positioner katup kontrol, dan sistem otomasi pabrik berstandar internasional dengan garansi pabrikan resmi.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/produk"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Lihat Katalog Produk <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/minta-penawaran"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-700 transition-colors"
            >
              Minta Surat Penawaran (RFQ)
            </Link>
          </div>

          {/* Key metric highlights */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-black text-white font-mono">Est. 2018</div>
              <p className="text-xs text-slate-400 mt-0.5">Pengalaman Industri</p>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">100%</div>
              <p className="text-xs text-slate-400 mt-0.5">Produk Asli Bergaransi</p>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">COO & Test</div>
              <p className="text-xs text-slate-400 mt-0.5">Sertifikasi Kalibrasi</p>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">24/7</div>
              <p className="text-xs text-slate-400 mt-0.5">Engineering Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND & PARTNERS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Didukung oleh Brand & Prinsipal Kelas Dunia (Rosemount, Yokogawa, ABB, Azbil, E+H, SOR, Siemens, Rotork)
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600 font-bold text-sm">
          {brands.map((b, i) => (
            <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Katalog Unggulan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Produk Instrumentasi & Valve Pilihan
            </h2>
          </div>

          <Link
            href="/produk"
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Lihat Semua Produk ({FALLBACK_PRODUCTS.length}+) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {p.brand}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {p.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                  {p.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {p.short_description}
                </p>

                {p.specifications && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] space-y-1">
                    {Object.entries(p.specifications).slice(0, 2).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <Link
                  href={`/produk/${p.slug}`}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  Detail <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/minta-penawaran?product=${encodeURIComponent(p.name)}&brand=${encodeURIComponent(p.brand)}`}
                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                >
                  Minta RFQ
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Bidang Kompetensi
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Layanan & Solusi Rekayasa Otomasi
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Dukungan menyeluruh mulai dari studi kelayakan teknis, pengadaan instrumen, instalasi lapangan, hingga kalibrasi dan purnajual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl ${srv.color} text-white flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{srv.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{srv.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CLIENT REFERENCES (SUCCESS STORY FROM PDF) */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Klien & Pengalaman Proyek
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dipercaya oleh Sektor Pembangkit & Industri Terkemuka
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Rekam jejak supply instrumen dan mechanical engineering PT. Amabro Bintang Inovasi pada BUMN dan korporasi multinasional.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {clientSuccess.map((cl, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-1 hover:border-blue-300 transition-colors"
              >
                <div className="font-bold text-slate-900 text-xs sm:text-sm">{cl.name}</div>
                <p className="text-[11px] text-slate-500">{cl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-14 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Siap Meningkatkan Keandalan & Efisiensi Sistem Pabrik Anda?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm">
              Konsultasikan kebutuhan instrumen, transmitter, atau valve positioner dengan tim engineering PT. Amabro Bintang Inovasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/minta-penawaran"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              Minta Surat Penawaran (RFQ) <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/6281315333391"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-800/80 hover:bg-blue-900 text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl border border-blue-400/30 transition-all"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
