'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Tag, 
  Cpu, 
  Gauge, 
  Sliders, 
  Download,
  Phone,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { FALLBACK_PRODUCTS, type ProductItem } from '@/lib/products';

export default function ProdukPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const brands = useMemo(() => {
    return Array.from(new Set(FALLBACK_PRODUCTS.map(p => p.brand))).filter(Boolean);
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(FALLBACK_PRODUCTS.map(p => p.category))).filter(Boolean);
  }, []);

  const filteredProducts = useMemo(() => {
    return FALLBACK_PRODUCTS.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.model_number && p.model_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.short_description && p.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchSearch && matchBrand && matchCategory;
    });
  }, [searchQuery, selectedBrand, selectedCategory]);

  return (
    <div className="space-y-12 pb-20">
      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Distributor Resmi Instrumentasi & Valve Industri Original Bergaransi
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Katalog Produk Instrumentasi & Valve
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            PT. Amabro Bintang Inovasi menyuplai perangkat transmitter, smart valve positioner, analyzer, dan switch dari prinsipal terkemuka dunia seperti Rosemount, Yokogawa, ABB, Azbil, Endress+Hauser, Siemens, dan Rotork.
          </p>

          {/* Quick Stats */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800 text-left">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">100% Original</div>
              <p className="text-xs text-slate-400">Garansi Pabrikan Resmi</p>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">COO & Test Rep.</div>
              <p className="text-xs text-slate-400">Sertifikat Kalibrasi</p>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">Fast Delivery</div>
              <p className="text-xs text-slate-400">Ready Stock & Sourcing Cepat</p>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">24/7 Tech Support</div>
              <p className="text-xs text-slate-400">Dukungan Komisioning</p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari produk (misal: 3051CD, EJA110A, AMS Trex, YT-3700, Rosemount)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Brand:
            </span>
            <button
              onClick={() => setSelectedBrand('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                selectedBrand === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Brand ({brands.length})
            </button>
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  selectedBrand === b
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{filteredProducts.length}</strong> produk instrumen & valve
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Cpu className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada produk yang cocok dengan pencarian "{searchQuery}". Tim kami dapat membantu melakukan pengadaan suku cadang khusus sesuai spesifikasi Anda.
            </p>
            <Link
              href="/minta-penawaran"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg mt-2"
            >
              Kirimkan RFQ Khusus
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(p => (
              <div 
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {p.brand}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {p.category}
                    </span>
                  </div>

                  {/* Product Title */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                      {p.name}
                    </h3>
                    {p.model_number && (
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Model: <strong className="text-slate-800">{p.model_number}</strong>
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {p.short_description}
                  </p>

                  {/* Key Specifications Preview */}
                  {p.specifications && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] space-y-1">
                      {Object.entries(p.specifications).slice(0, 3).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-start">
                          <span className="text-slate-500">{key}:</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-5 border-t border-slate-100 mt-5 space-y-2">
                  <Link
                    href={`/minta-penawaran?product=${encodeURIComponent(p.name)}&brand=${encodeURIComponent(p.brand)}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all"
                  >
                    Minta Surat Penawaran (RFQ)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/produk/${p.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium py-1.5 transition-colors"
                  >
                    Lihat Spesifikasi Lengkap
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM CTA: REQUEST CUSTOM PART */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Mencari Part Number atau Spesifikasi Khusus?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm">
              Kami memiliki jaringan distributor resmi global untuk instrumentasi langka, transmitter pengganti legacy, dan katup kontrol khusus. Hubungi engineering sales kami sekarang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/6281315333391?text=Halo%20PT%20Amabro%20Bintang%20Inovasi,%20saya%20ingin%20menanyakan%20ketersediaan%20produk%20otomasi/instrumentasi."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              Chat WhatsApp (Egi Restu)
            </a>

            <Link
              href="/minta-penawaran"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-800/60 hover:bg-blue-800 text-white border border-blue-400/30 text-xs font-bold px-6 py-3.5 rounded-xl transition-all"
            >
              Isi Formulir Penawaran
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
