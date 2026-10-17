import React from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  MonitorCheck, 
  Zap, 
  Bot, 
  Settings2, 
  Gauge, 
  ArrowRight, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function ServicesPage() {
  const serviceCategories = [
    {
      id: 'plc-hmi',
      title: 'PLC & HMI Automation Systems',
      subtitle: 'Logic Programming, Migration & Modernization',
      icon: Cpu,
      color: 'bg-blue-600',
      description: 'Layanan terpadu pemrograman logika kontrol, migrasi sistem legacy (seperti Siemens S7-200/S7-300 ke S7-1200/S7-1500), troubleshooting logic, dan pembuatan tampilan visual HMI yang intuitif bagi operator pabrik.',
      capabilities: [
        'Siemens TIA Portal (S7-1200, S7-1500, ET200SP)',
        'Omron Sysmac Studio & CX-Programmer (CP1, CJ2, NX/NJ)',
        'Mitsubishi GX Works (FX5U, iQ-R, Q-Series)',
        'Schneider EcoStruxure Machine Expert',
        'Layar Sentuh HMI: Siemens KTP/Comfort, Weintek, Pro-face',
      ],
    },
    {
      id: 'scada-iiot',
      title: 'SCADA & Industrial IoT Reporting',
      subtitle: 'Real-Time Plant Visualization & Data Logging',
      icon: MonitorCheck,
      color: 'bg-indigo-600',
      description: 'Pengembangan sistem pengawasan terpusat (SCADA) untuk visualisasi multi-lini produksi, pencatatan parameter suhu/tekanan/kecepatan ke server database industri, serta manajemen alarm terpadu.',
      capabilities: [
        'Siemens WinCC V8 & WinCC Professional (TIA Portal)',
        'Wonderware InTouch / AVEVA Plant SCADA',
        'Ignition by Inductive Automation (Web & Mobile IIoT)',
        'Koneksi PLC multi-protokol (OPC UA, Modbus TCP, Profinet)',
        'Automated Shift Production & Energy Report ke Excel/PDF',
      ],
    },
    {
      id: 'vfd-motion',
      title: 'Inverter (VFD) & Servo Motion Control',
      subtitle: 'Energy Efficiency & Precision Speed Regulation',
      icon: Zap,
      color: 'bg-purple-600',
      description: 'Penyediaan dan instalasi Variable Frequency Drive (VFD) untuk motor induksi kapasitas 0.75kW hingga 315kW, serta servo drive multi-axis untuk sinkronisasi posisi mesin berkecepatan tinggi.',
      capabilities: [
        'Penggantian sistem Direct-On-Line (DOL) / Star-Delta ke Inverter',
        'Penghematan konsumsi listrik motor blower/fan, pompa, & kompresor',
        'Delta Electronics (MS300, CP2000, ASDA-A2/B3 Servo)',
        'Siemens Sinamics (G120, S120, V90 Servo)',
        'Schneider Altivar Process & Machine Series',
      ],
    },
    {
      id: 'robotics-packaging',
      title: 'Industrial Robotics & Packaging Automation',
      subtitle: 'End-of-Line Palletizing & High-Speed Material Handling',
      icon: Bot,
      color: 'bg-teal-600',
      description: 'Integrasi sistem robot palletizer otomatis untuk menata karton/karung produk ke atas palet, konveyor roller bermotor, mesin cartoner, dan interlock pagar pengaman (Safety Cage) berstandar internasional.',
      capabilities: [
        'Kapasitas handling hingga 25 box/menit secara konsisten',
        'Gripper pneumatik & vakum custom untuk berbagai dimensi produk',
        'Sistem Safety Interlock & Light Curtain ISO 13849-1',
        'Integrasi barcode scanner & label applicator otomatis',
      ],
    },
    {
      id: 'control-panel',
      title: 'Perakitan & Retrofit Panel Kontrol Listrik',
      subtitle: 'Custom Panel Fabrication & Wiring Engineering',
      icon: Settings2,
      color: 'bg-slate-800',
      description: 'Fabrikasi panel kontrol custom standar industri IP54 (indoor) dan IP65 (outdoor stainless steel). Dilengkapi komponen proteksi kelistrikan berstandar IEC, kabel ber-ferrule rapi, dan label numbering jelas.',
      capabilities: [
        'Panel PLC & Remote I/O Box (Rittal / Lokal enclosure)',
        'Motor Control Center (MCC Panel)',
        'Panel Distribusi Daya & ATS-AMF Genset',
        'Testing ketahanan isolasi, kontinuitas, & wiring diagram EPLAN CAD',
      ],
    },
    {
      id: 'sensor-instrumentation',
      title: 'Sensor & Instrumentasi Pabrik',
      subtitle: 'Precision Measurement & Hazardous Area Protection',
      icon: Gauge,
      color: 'bg-rose-600',
      description: 'Supply komponen sensor industri, sensor optik, sensor induktif, transmitter tekanan, level transmitter ultrasonik/radar, flowmeter elektromagnetik, dan sensor temperatur PT100 bersertifikasi resmi.',
      capabilities: [
        'Pressure & Differential Pressure Transmitter (Hart Protocol)',
        'Electromagnetic & Coriolis Mass Flowmeter',
        'Ultrasonic & Radar Level Sensor untuk tangki cairan & padatan',
        'Sensor Explosion Proof (ATEX / IECEx) untuk area gas/debu mudah terbakar',
      ],
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
          Katalog Lengkap
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Layanan & Produk Otomasi Industri
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Kami menyediakan hardware resmi bergaransi dan jasa engineering komprehensif untuk mendukung keandalan sistem produksi manufaktur Anda.
        </p>
      </div>

      {/* Services List Detail */}
      <div className="space-y-10">
        {serviceCategories.map((svc, idx) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              id={svc.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="md:w-1/3 space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${svc.color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kategori #{idx + 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-xs font-semibold text-blue-700 mt-1">
                    {svc.subtitle}
                  </p>
                </div>
                <Link
                  href="/minta-penawaran"
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Minta Penawaran Solusi Ini <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="md:w-2/3 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {svc.description}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Cakupan Spesifikasi & Pengalaman Brand:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {svc.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight font-medium">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">
          Butuh Komponen Spesifik atau Modifikasi Sistem?
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          Diskusikan part number atau kendala teknis mesin Anda bersama tim engineering kami secara gratis.
        </p>
        <div className="pt-2">
          <Link
            href="/minta-penawaran"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md"
          >
            Hubungi Engineer Kami
          </Link>
        </div>
      </div>
    </div>
  );
}
