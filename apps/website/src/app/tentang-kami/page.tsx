import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Users, CheckCircle2, Building, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const certifications = [
    'Nomor Induk Berusaha (NIB): 1234567890123 (Sistem Integrator Industri)',
    'NPWP Perusahaan Terdaftar PKP: 01.234.567.8-000.000',
    'Certified Siemens TIA Portal Automation Engineer',
    'Certified Omron Sysmac Motion & Safety Specialist',
    'Standar Keselamatan Kerja K3 & Lisensi Teknisi Listrik Kemnaker',
  ];

  const teamValues = [
    {
      title: 'Presisi Rekayasa Teknis',
      desc: 'Setiap baris kode PLC, pengkabelan panel, dan loop instrumentasi diuji teliti melalui prosedur FAT & SAT sebelum serah terima.',
    },
    {
      title: 'Transparansi & Legalitas Resmi',
      desc: 'Semua komponen yang kami supply dilengkapi faktur pajak resmi, garansi distributor prinsipal, dan dokumen serial number asli.',
    },
    {
      title: 'Dukungan Emergency Tanpa Henti',
      desc: 'Kami mendampingi klien kami pasca serah terima untuk memastikan lini produksi berjalan stabil tanpa interupsi berkepanjangan.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
          Profil Perusahaan
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Tentang PT Automation Solusi Nusantara
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Mitra strategis industri manufaktur Indonesia dalam modernisasi sistem kontrol, digitalisasi proses pabrik, dan supply suku cadang otomasi terpercaya.
        </p>
      </div>

      {/* Main Profile Story */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Membangun Daya Saing Manufaktur Melalui Otomasi yang Handal
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Didirikan oleh praktisi dan engineer otomasi berpengalaman lebih dari 10 tahun, <strong>PT Automation Solusi Nusantara</strong> berfokus pada penyediaan solusi sistem kontrol menyeluruh: mulai dari rekayasa sistem otomasi baru (*greenfield project*) hingga peremajaan (*retrofit/modernization*) mesin-mesin industri eksisting.
          </p>
          <p>
            Dengan kantor operasional dan workshop di Kawasan Industri MM2100 Cikarang Barat, kami berada tepat di jantung denyut manufaktur nasional. Lokasi strategis ini memungkinkan tim teknisi kami merespons kebutuhan survei teknis maupun penanganan darurat pabrik Anda dengan cepat.
          </p>
        </div>

        {/* Legalities & Certifications */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Legalitas & Sertifikasi Resmi Perusahaan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium leading-relaxed">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 text-center">
          Nilai Utama yang Kami Pegang Teguh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamValues.map((val, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
                0{idx + 1}
              </span>
              <h3 className="font-bold text-slate-900 text-sm pt-1">{val.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">
          Ingin Berkolaborasi dengan Tim Kami?
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
          Diskusikan rencana otomasi pabrik Anda bersama para spesialis sistem kontrol kami.
        </p>
        <div className="pt-2">
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md"
          >
            Hubungi Kantor Kami <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
