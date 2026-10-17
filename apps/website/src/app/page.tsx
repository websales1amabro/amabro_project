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
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const coreServices = [
    {
      title: 'PLC & HMI Automation Systems',
      description: 'Pemrograman logic control, upgrade sistem legacy (S7-300 ke S7-1500), dan perancangan antarmuka layar sentuh HMI responsif.',
      icon: Cpu,
      color: 'bg-blue-600',
    },
    {
      title: 'SCADA & Industrial IoT',
      description: 'Monitoring visual proses pabrik secara real-time, pencatatan data historis, alarm manajemen, dan integrasi reporting database industri.',
      icon: MonitorCheck,
      color: 'bg-indigo-600',
    },
    {
      title: 'Inverter (VFD) & Motion Control',
      description: 'Pengaturan kecepatan motor listrik, penghematan energi hingga 30%, serta sinkronisasi servo multi-axis presisi tinggi.',
      icon: Zap,
      color: 'bg-purple-600',
    },
    {
      title: 'Robotika & Packaging Otomatis',
      description: 'Integrasi lengan robot palletizing, pick-and-place kecepatan tinggi, dan sistem konveyor pintar untuk industri kemasan & makanan.',
      icon: Bot,
      color: 'bg-teal-600',
    },
    {
      title: 'Panel Kontrol & Switchgear Listrik',
      description: 'Perakitan panel PLC, MCC (Motor Control Center), dan panel distribusi standar IP54/IP65 dengan komponen proteksi bersertifikasi.',
      icon: Settings2,
      color: 'bg-slate-800',
    },
    {
      title: 'Sensor & Instrumentasi Proses',
      description: 'Supply transmitter tekanan, level tanki, flowmeter cairan, dan safety light curtain area berbahaya (Hazardous / Explosion Proof).',
      icon: Gauge,
      color: 'bg-rose-600',
    },
  ];

  const brands = [
    'Siemens Automation',
    'Omron Electronics',
    'Schneider Electric',
    'Delta Electronics',
    'Mitsubishi Electric',
    'Endress+Hauser',
  ];

  const featuredProjects = [
    {
      title: 'Upgrade PLC Siemens S7-1500 & SCADA WinCC',
      client: 'Industri Makanan & Minuman (F&B)',
      location: 'Cikarang, Jawa Barat',
      impact: 'Peningkatan throughput lini packaging sebesar 24% tanpa downtime tak terduga.',
    },
    {
      title: 'Retrofit Inverter VFD 75kW Clinker Cooler',
      client: 'Pabrik Semen Terkemuka',
      location: 'Tuban, Jawa Timur',
      impact: 'Efisiensi konsumsi daya motor blower sebesar 28.5% per bulan.',
    },
    {
      title: 'Integrasi Robot Palletizer & Safety Cage',
      client: 'Pabrik Biskuit & Consumer Goods',
      location: 'Tangerang, Banten',
      impact: 'Kapasitas palletizing otomatis 20 kardus/menit dengan standar safety ISO 13849.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
        {/* Background glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Sistem Integrator Resmi & Industrial Automation Supply
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Solusi Otomasi Industri & Supply Komponen Pabrik Terpercaya
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mulai dari perancangan arsitektur PLC, SCADA, instalasi panel kontrol hingga pengadaan suku cadang resmi bergaransi untuk kelancaran operasional pabrik Anda.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/minta-penawaran"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Minta Surat Penawaran Resmi <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/portofolio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-700 transition-colors"
            >
              Lihat Proyek Kami
            </Link>
          </div>

          {/* Key metric highlights */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-black text-white font-mono">150+</div>
              <p className="text-xs text-slate-400 mt-0.5">Proyek Berhasil</p>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">100%</div>
              <p className="text-xs text-slate-400 mt-0.5">Komponen Resmi</p>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">12 Bln</div>
              <p className="text-xs text-slate-400 mt-0.5">Garansi Servis</p>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">24/7</div>
              <p className="text-xs text-slate-400 mt-0.5">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND & MANUFACTURER SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Didukung oleh Brand & Prinsipal Komponen Otomasi Kelas Dunia
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-80">
          {brands.map((b, i) => (
            <div key={i} className="text-sm font-black text-slate-600 tracking-tight">
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* CORE SERVICES SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
            Solusi Menyeluruh
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Layanan Rekayasa & Pengadaan Komponen
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Kami menghadirkan integrasi sistem end-to-end dengan dukungan engineer tersertifikasi dan garansi resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreServices.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl ${svc.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {svc.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <Link
                  href="/layanan"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors pt-2"
                >
                  Detail Solusi <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* VALUE PROPOSITION / MENGAPA KAMI */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
              Komitmen Kualitas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Mengapa Perusahaan Manufaktur Memilih PT Automation Solusi?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Kami memahami bahwa henti produksi (*downtime*) akibat sistem kontrol yang usang sangat merugikan bisnis Anda. Kami hadir dengan pendekatan rekayasa presisi dan transparansi komersial.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Komponen Resmi Asli 100%:</strong> Seluruh hardware dipasok dari distributor resmi dengan garansi resmi pabrik.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Dokumentasi Lengkap:</strong> Kami menyediakan wiring diagram CAD, backup program, dan manual operasional lengkap.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Commissioning & Testing Aman:</strong> Uji fungsi menyeluruh (FAT & SAT) untuk menjamin keselamatan operator dan mesin.</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Alur Kerja Pengadaan Kami</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-slate-900">Inquiry & Analisis Kebutuhan</h4>
                  <p className="text-slate-500 text-[11px]">Survei spesifikasi teknis dan kelayakan sistem eksisting.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-slate-900">Penawaran Resmi & Sourcing</h4>
                  <p className="text-slate-500 text-[11px]">Penyusunan penawaran harga kompetitif bergaransi dengan approval Owner.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-slate-900">Implementasi & Garansi Servis</h4>
                  <p className="text-slate-500 text-[11px]">Pengiriman aman, instalasi on-site, dan dukungan pemeliharaan berkala.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
              Studi Kasus Nyata
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Portofolio Proyek Terkini
            </h2>
          </div>
          <Link
            href="/portofolio"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Lihat Semua Portofolio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
                  {p.client}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {p.title}
                </h3>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" /> {p.location}
                </p>
                <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  <strong>Hasil / Dampak:</strong> {p.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Siap Mengoptimalkan Efisiensi Lini Produksi Anda?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Kirimkan kebutuhan otomasi pabrik Anda melalui form permintaan penawaran. Tim engineering kami akan merespons dengan surat penawaran resmi dan rincian spesifikasi terbaik.
          </p>
          <div className="pt-2">
            <Link
              href="/minta-penawaran"
              className="inline-flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm px-8 py-4 rounded-xl shadow-md hover:scale-105 transition-all"
            >
              Minta Surat Penawaran Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
