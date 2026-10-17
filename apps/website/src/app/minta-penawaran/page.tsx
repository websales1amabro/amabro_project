'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ArrowRight, 
  FileText,
  Clock,
  Building
} from 'lucide-react';

export default function RequestQuotationPage() {
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    category: 'PLC & HMI',
    description: '',
    honeypot: '', // bot trap
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Spam honeypot detection
    if (formData.honeypot) {
      setSubmittedRef('INQ/2026/10/0099');
      return;
    }

    if (!formData.contact_name || !formData.contact_email || !formData.contact_phone || !formData.description) {
      setErrorMsg('Mohon lengkapi seluruh field wajib bertanda bintang (*).');
      return;
    }

    if (!formData.consent) {
      setErrorMsg('Anda perlu menyetujui ketentuan privasi untuk memproses permintaan penawaran.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan permintaan penawaran');
      }

      setSubmittedRef(data.reference_number || 'INQ/2026/10/0005');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan koneksi. Silakan coba kembali atau hubungi WhatsApp kami.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
          Formulir Permintaan Penawaran (RFQ)
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Konsultasikan Kebutuhan Otomasi Industri Anda
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Sampaikan spesifikasi atau ruang lingkup proyek pabrik Anda. Tim engineer kami akan menyusun surat penawaran resmi (Customer Quotation) lengkap dengan garansi dan jadwal pengerjaan.
        </p>
      </div>

      {submittedRef ? (
        /* Confirmation Screen */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Permintaan Penawaran Berhasil Dikirim!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Terima kasih, data kebutuhan Anda telah otomatis tercatat ke dalam sistem pipeline kami. Tim Sales & Engineering kami akan segera menghubungi Anda.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 inline-block text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Nomor Referensi Inquiry:
            </span>
            <span className="font-mono text-base font-extrabold text-blue-700 tracking-wide">
              {submittedRef}
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2"
            >
              Kembali ke Beranda
            </Link>
            <a
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                `Halo, saya baru saja mengirim permintaan penawaran di website dengan nomor referensi ${submittedRef}. Mohon konfirmasinya.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm"
            >
              Konfirmasi via WhatsApp
            </a>
          </div>
        </div>
      ) : (
        /* The Form */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Honeypot field (hidden from real users, tricks spam bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_hp">Leave this empty</label>
              <input
                id="website_hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Nama Lengkap PIC / Kontak *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ir. Budi Santoso"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Nama Perusahaan / Pabrik (PT / CV)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT Indofood CBP Sukses Makmur"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Email Perusahaan / Kantor *
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi.s@perusahaan.co.id"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Nomor WhatsApp / Telepon Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0812-3456-7890"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Kategori Solusi Kebutuhan
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="PLC & HMI">Sistem PLC & Layar Sentuh HMI (Siemens / Omron / Mitsubishi)</option>
                <option value="SCADA & Software">SCADA System & Industrial IoT Reporting</option>
                <option value="Inverter & Drive">Inverter / VFD & Motion Servo Control</option>
                <option value="Robotik">Robot Palletizer & Mesin Packaging Otomatis</option>
                <option value="Panel Kontrol">Perakitan & Retrofit Panel Kontrol Listrik</option>
                <option value="Sensor & Instrumentasi">Sensor, Flowmeter & Pressure Transmitter</option>
                <option value="Pengadaan Komponen Lain">Pengadaan Suku Cadang / Komponen Otomasi Lainnya</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Rincian Spesifikasi Kebutuhan atau Catatan Proyek *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan spesifikasi part number (jika ada), estimasi kuantitas unit, target waktu implementasi, atau lingkup jasa yang dibutuhkan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="consent-check"
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="consent-check" className="text-slate-600 text-[11px] leading-relaxed cursor-pointer">
                Saya menyetujui data kontak di atas digunakan oleh tim PT Automation Solusi Nusantara untuk keperluan penyusunan surat penawaran harga resmi dan komunikasi proyek.
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Data terlindungi aman
              </span>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:bg-blue-300"
              >
                {loading ? 'Mengirim Data...' : 'Kirim Permintaan Penawaran'} <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
