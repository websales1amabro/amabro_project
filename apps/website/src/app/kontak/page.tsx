import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Building2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
          Hubungi Kami
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Kontak Kantor & Workshop Otomasi
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Kami siap melayani kebutuhan konsultasi sistem kontrol industri, survei teknis on-site, dan permintaan surat penawaran harga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Alamat Kantor & Workshop</h3>
                <p className="text-slate-500 text-xs">Kawasan Industri MM2100</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-13">
              Jl. Jawa Blok B-12, Kawasan Industri MM2100, Cikarang Barat, Kabupaten Bekasi, Jawa Barat 17530, Indonesia.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">WhatsApp & Telepon Resmi</h3>
                <p className="text-slate-500 text-xs">Respon cepat hari kerja</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-700 pl-13 font-mono">
              <p>Telepon Kantor: (021) 8990-1234</p>
              <p>Hotline WhatsApp: 0812-3456-7890</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Email Resmi</h3>
                <p className="text-slate-500 text-xs">Penawaran & Pengadaan Barang</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-700 pl-13 font-mono">
              <p>Penawaran: sales@automationsolusi.co.id</p>
              <p>Pengadaan: purchasing@automationsolusi.co.id</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Jam Operasional</h3>
                <p className="text-slate-500 text-xs">Waktu Indonesia Barat (WIB)</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 pl-13">
              <p>Senin – Jumat: 08.00 – 17.00 WIB</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Sabtu & Minggu: Tutup (Layanan Emergency On-Call tetap aktif)</p>
            </div>
          </div>
        </div>

        {/* Map / Fast Inquiry Shortcut */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-md space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
              Layanan Langsung
            </span>
            <h2 className="text-xl font-bold">
              Butuh Surat Penawaran Resmi Cepat?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda tidak perlu menunggu lama. Isi formulir kebutuhan Anda secara online, dan inquiry Anda akan langsung diteruskan ke tim engineering kami dalam hitungan detik.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/minta-penawaran"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-colors"
            >
              Isi Form Minta Penawaran <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/6281234567890?text=Halo%20PT%20Automation%20Solusi,%20saya%20ingin%20konsultasi%20langsung%20mengenai%20kebutuhan%20pabrik%20kami."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat WhatsApp Sekarang
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kerahasiaan spesifikasi & data pabrik Anda terjamin 100%.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
