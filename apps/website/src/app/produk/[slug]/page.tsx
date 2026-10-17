import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Tag, 
  Layers, 
  Download, 
  Cpu, 
  Sparkles,
  Building
} from 'lucide-react';
import { FALLBACK_PRODUCTS, getProductBySlug } from '@/lib/products';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FALLBACK_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Breadcrumb Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Link
            href="/produk"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Produk
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-600 text-white">
              {product.brand}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {product.category}
            </span>
            {product.model_number && (
              <span className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-blue-300 border border-slate-700">
                Model: {product.model_number}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {product.name}
          </h1>

          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            {product.short_description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details & Specs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Deskripsi & Aplikasi Industri
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {product.description || product.short_description}
              </p>
            </div>

            {/* Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Spesifikasi Teknis
                </h2>

                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(product.specifications).map(([key, val], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                          <td className="px-4 py-3 font-semibold text-slate-700 w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-slate-900 font-medium">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Features List */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Keunggulan & Fitur Utama
                </h2>

                <ul className="space-y-2.5">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: RFQ Box */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-5 sticky top-24">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Pengadaan Resmi
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Minta Penawaran Harga
                </h3>
                <p className="text-xs text-slate-500">
                  Dapatkan Surat Penawaran Resmi (Quotation) berstempel PT. Amabro Bintang Inovasi dalam hitungan jam.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-y border-slate-100 py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan 100% Produk Asli & Baru</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sertifikat Pabrikan (COO / Kalibrasi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Garansi Resmi 12 Bulan</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href={`/minta-penawaran?product=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(product.brand)}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all"
                >
                  Isi Formulir RFQ Produk Ini
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/6281315333391?text=${encodeURIComponent(`Halo PT Amabro Bintang Inovasi, saya ingin meminta informasi harga dan ketersediaan stok untuk: ${product.name} (Model: ${product.model_number || '-'}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Chat WhatsApp Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
