import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ExternalLink,
  Edit3,
  Trash2,
  X,
  CreditCard,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { vendorService } from '../services/vendorService';
import type { Vendor } from '../types/database';

export const Vendors: React.FC = () => {
  const { role, canManageVendors } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'rfq_compare'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    address: '',
    city: '',
    npwp: '',
    product_categories_input: '',
    payment_terms: 'Tempo 30 Hari',
    bank_account_info: '',
    notes: '',
  });

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getVendors();
      setVendors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      pic_name: '',
      pic_phone: '',
      pic_email: '',
      address: '',
      city: '',
      npwp: '',
      product_categories_input: 'PLC, HMI, Sensor',
      payment_terms: 'Tempo 30 Hari',
      bank_account_info: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      pic_name: v.pic_name || '',
      pic_phone: v.pic_phone || '',
      pic_email: v.pic_email || '',
      address: v.address || '',
      city: v.city || '',
      npwp: v.npwp || '',
      product_categories_input: (v.product_categories || []).join(', '),
      payment_terms: v.payment_terms || 'Tempo 30 Hari',
      bank_account_info: v.bank_account_info || '',
      notes: v.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus vendor/supplier "${name}"?`)) {
      await vendorService.deleteVendor(id);
      loadVendors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama vendor wajib diisi.');
      return;
    }

    const categories = formData.product_categories_input
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const payload = {
        name: formData.name,
        pic_name: formData.pic_name,
        pic_phone: formData.pic_phone,
        pic_email: formData.pic_email,
        address: formData.address,
        city: formData.city,
        npwp: formData.npwp,
        product_categories: categories,
        payment_terms: formData.payment_terms,
        bank_account_info: formData.bank_account_info,
        notes: formData.notes,
      };

      if (editingVendor) {
        await vendorService.updateVendor(editingVendor.id, payload);
      } else {
        await vendorService.createVendor(payload);
      }
      setShowModal(false);
      loadVendors();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan vendor');
    }
  };

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.pic_name && v.pic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.code && v.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.product_categories && v.product_categories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Supplier & Sourcing RFQ (V3)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola mitra supplier komponen, permintaan harga (RFQ), dan tabel evaluasi komparasi harga (F1 & F4).
          </p>
        </div>

        {canManageVendors && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Vendor Baru
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Katalog Mitra Vendor ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('rfq_compare')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'rfq_compare'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tabel Komparasi Harga Vendor (Side-by-Side RFQ)
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode, nama vendor, kategori produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 whitespace-nowrap">
              Ditemukan: <strong className="text-slate-800">{filtered.length} Vendor</strong>
            </div>
          </div>

          {/* Vendor Cards */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Memuat data vendor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((vendor) => (
                <div 
                  key={vendor.id} 
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {vendor.code || 'VEND'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">
                          {vendor.name}
                        </h3>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                        {vendor.city || 'Indonesia'}
                      </span>
                    </div>

                    {/* Product Categories */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {vendor.product_categories && vendor.product_categories.map((cat, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-400" /> {cat}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">PIC: {vendor.pic_name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.pic_phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{vendor.pic_email || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Termin: {vendor.payment_terms || '-'}
                    </span>

                    {canManageVendors && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(vendor)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Vendor"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id, vendor.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Hapus Vendor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* RFQ Side-by-Side Comparison Module (F4) */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                INQ/2026/10/0002
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Perbandingan Vendor RFQ: Sensor Instrumentation & Pressure Transmitter
              </h3>
              <p className="text-xs text-slate-500">Evaluasi penawaran supplier untuk item: Pressure Transmitter 0-10 bar 4-20mA (Qty: 4 Unit)</p>
            </div>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              Vendor Terpilih Ditandai
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3 w-48">Parameter Evaluasi</th>
                  <th className="p-3 bg-emerald-50/70 border-x border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">PT Siemens Indo (Terpilih)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </th>
                  <th className="p-3 border-r border-slate-200">
                    <span className="font-bold text-slate-800">PT Endress Partner</span>
                  </th>
                  <th className="p-3">
                    <span className="font-bold text-slate-800">PT Yokogawa Agent</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium text-slate-500">Harga Satuan (IDR)</td>
                  <td className="p-3 bg-emerald-50/40 border-x border-emerald-200 font-bold text-emerald-800">
                    Rp 14.500.000
                  </td>
                  <td className="p-3 border-r border-slate-200 font-semibold text-slate-800">
                    Rp 16.200.000
                  </td>
                  <td className="p-3 font-semibold text-slate-800">
                    Rp 15.800.000
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-500">Total Harga (4 Unit)</td>
                  <td className="p-3 bg-emerald-50/40 border-x border-emerald-200 font-bold text-emerald-900">
                    Rp 58.000.000
                  </td>
                  <td className="p-3 border-r border-slate-200">Rp 64.800.000</td>
                  <td className="p-3">Rp 63.200.000</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-500">Lead Time Pengiriman</td>
                  <td className="p-3 bg-emerald-50/40 border-x border-emerald-200 font-semibold text-emerald-800">
                    Ready Stock (3 hari kerja)
                  </td>
                  <td className="p-3 border-r border-slate-200 text-slate-700">Indent 4-6 minggu</td>
                  <td className="p-3 text-slate-700">Indent 3-4 minggu</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-500">Masa Garansi</td>
                  <td className="p-3 bg-emerald-50/40 border-x border-emerald-200 text-slate-700">12 Bulan Resmi</td>
                  <td className="p-3 border-r border-slate-200 text-slate-700">12 Bulan Resmi</td>
                  <td className="p-3 text-slate-700">12 Bulan Resmi</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-500">Syarat Pembayaran</td>
                  <td className="p-3 bg-emerald-50/40 border-x border-emerald-200 text-slate-700">Tempo 30 Hari</td>
                  <td className="p-3 border-r border-slate-200 text-slate-700">DP 30%, Pelunasan 70%</td>
                  <td className="p-3 text-slate-700">Tempo 14 Hari</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Vendor */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingVendor ? 'Edit Data Vendor' : 'Tambah Vendor Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Vendor / Distributor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Siemens Indonesia"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori Produk (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Contoh: PLC, HMI, Inverter, Sensor"
                  value={formData.product_categories_input}
                  onChange={(e) => setFormData({ ...formData, product_categories_input: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama PIC Vendor</label>
                  <input
                    type="text"
                    placeholder="Nama sales/kontak vendor"
                    value={formData.pic_name}
                    onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telepon / WhatsApp PIC</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.pic_phone}
                    onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email PIC</label>
                  <input
                    type="email"
                    placeholder="sales@vendor.co.id"
                    value={formData.pic_email}
                    onChange={(e) => setFormData({ ...formData, pic_email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kota</label>
                  <input
                    type="text"
                    placeholder="Jakarta, Surabaya, dll."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Termin Pembayaran</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tempo 30 Hari, DP 50%"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Info Rekening Bank</label>
                  <input
                    type="text"
                    placeholder="BCA 123456 a.n. PT ..."
                    value={formData.bank_account_info}
                    onChange={(e) => setFormData({ ...formData, bank_account_info: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Khusus Vendor</label>
                <input
                  type="text"
                  placeholder="Diskon khusus, garansi, keandalan pengiriman..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingVendor ? 'Simpan Perubahan' : 'Tambah Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
