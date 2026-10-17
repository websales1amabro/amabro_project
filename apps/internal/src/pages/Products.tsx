import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Globe, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Tag,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import type { SiteProduct } from '../types/database';

export const Products: React.FC = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SiteProduct | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: 'Rosemount',
    category: 'Instrument Products',
    model_number: '',
    short_description: '',
    description: '',
    specificationsText: '',
    featuresText: '',
    is_featured: true,
    is_published: true,
    sort_order: 1
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.model_number && p.model_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      brand: 'Rosemount',
      category: 'Instrument Products',
      model_number: '',
      short_description: '',
      description: '',
      specificationsText: 'Accuracy: ±0.065%\nOutput: 4-20 mA HART\nProtection: IP66 / NEMA 4X',
      featuresText: 'Sensor presisi tinggi tahan getaran\nKalibrasi mandiri di lapangan\nSertifikasi keselamatan industri',
      is_featured: true,
      is_published: true,
      sort_order: products.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (p: SiteProduct) => {
    setEditingProduct(p);
    const specsStr = p.specifications ? Object.entries(p.specifications).map(([k, v]) => `${k}: ${v}`).join('\n') : '';
    const featuresStr = p.features ? p.features.join('\n') : '';

    setFormData({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      category: p.category,
      model_number: p.model_number || '',
      short_description: p.short_description || '',
      description: p.description || '',
      specificationsText: specsStr,
      featuresText: featuresStr,
      is_featured: p.is_featured,
      is_published: p.is_published,
      sort_order: p.sort_order
    });
    setShowModal(true);
  };

  const handleTogglePublish = async (p: SiteProduct) => {
    const newStatus = !p.is_published;
    await productService.updateProduct(p.id, { is_published: newStatus });
    await loadProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus produk "${name}" dari katalog website?`)) {
      await productService.deleteProduct(id);
      await loadProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // Generate slug if empty
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Parse specifications
    const specifications: Record<string, string> = {};
    formData.specificationsText.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        specifications[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });

    // Parse features
    const features = formData.featuresText.split('\n').map(f => f.trim()).filter(Boolean);

    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, {
        name: formData.name,
        slug,
        brand: formData.brand,
        category: formData.category,
        model_number: formData.model_number,
        short_description: formData.short_description,
        description: formData.description,
        specifications,
        features,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        sort_order: formData.sort_order
      });
    } else {
      await productService.createProduct({
        name: formData.name,
        slug,
        brand: formData.brand,
        category: formData.category,
        model_number: formData.model_number,
        short_description: formData.short_description,
        description: formData.description,
        specifications,
        features,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        sort_order: formData.sort_order
      });
    }

    setShowModal(false);
    await loadProducts();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Manajemen Katalog Produk Website
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola instrumen proses dan valve PT. Amabro Bintang Inovasi yang ditampilkan di website publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3000/produk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            Lihat di Website
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {(role === 'owner' || role === 'sales' || role === 'engineer') && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
          >
            <option value="ALL">Semua Brand ({brands.length})</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, brand, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3 w-16 text-center">Urutan</th>
                <th className="px-5 py-3">Nama Produk & Model</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Spesifikasi Kunci</th>
                <th className="px-5 py-3 text-center">Status Tampil</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-center font-mono text-slate-400">
                      {p.sort_order}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {p.name}
                        {p.is_featured && (
                          <span className="p-0.5 text-amber-500" title="Produk Unggulan">
                            <Sparkles className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-blue-600 font-mono">
                        Model: {p.model_number || '-'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {p.brand}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {p.category}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs text-slate-500">
                      <p className="line-clamp-2 text-[11px]">
                        {p.short_description}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                          p.is_published 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Klik untuk ubah status tayang"
                      >
                        {p.is_published ? 'Aktif di Web' : 'Disembunyikan'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="text-slate-600 hover:text-blue-600 font-medium text-xs inline-flex items-center gap-1 border border-slate-200 px-2 py-1 rounded hover:border-blue-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-slate-400 hover:text-rose-600 font-medium text-xs inline-flex items-center gap-1 border border-slate-200 px-2 py-1 rounded hover:border-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH / EDIT PRODUK */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru ke Website'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama Produk Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Emerson Rosemount 3051CD Differential Pressure Transmitter"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand Pabrikan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rosemount / Yokogawa / ABB / Azbil / dsb"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Model / Seri</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3051CD / EJA110A / YT-3700"
                    value={formData.model_number}
                    onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kategori Produk</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Instrument Products">Instrument Products (Transmitter, Sensor, Analyzer)</option>
                    <option value="Valve Products">Valve Products (Positioner, Control Valve, Actuator)</option>
                    <option value="Mechanical Solutions">Mechanical Solutions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Urut Tampil</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ringkasan Singkat (Muncul di Kartu Katalog)</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi 1-2 kalimat untuk preview produk di katalog website..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan detail fungsi, aplikasi industri, dan keunggulan teknis..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Spesifikasi Teknis (Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">Label: Nilai</code> per baris)
                </label>
                <textarea
                  rows={3}
                  placeholder="Accuracy: ±0.04%&#10;Output: 4-20 mA HART&#10;Pressure Range: Up to 2000 psi"
                  value={formData.specificationsText}
                  onChange={(e) => setFormData({ ...formData, specificationsText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Fitur Utama (1 baris per fitur)
                </label>
                <textarea
                  rows={3}
                  placeholder="Sertifikasi keselamatan SIL 2/3 IEC 61508&#10;Diagnostik loop kelistrikan canggih&#10;Stabilitas jangka panjang 10 tahun"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-medium text-slate-700">Tampilkan di Website Publik (Published)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-medium text-slate-700">Produk Unggulan Beranda (Featured)</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Terbitkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
