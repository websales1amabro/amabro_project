import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services/customerService';
import type { Customer } from '../types/database';

export const Customers: React.FC = () => {
  const { role } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company_type: 'PT',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    address: '',
    city: '',
    npwp: '',
    payment_terms_days: 30,
    notes: '',
  });

  const canEdit = role === 'owner' || role === 'sales';

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      company_type: 'PT',
      pic_name: '',
      pic_phone: '',
      pic_email: '',
      address: '',
      city: '',
      npwp: '',
      payment_terms_days: 30,
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      company_type: c.company_type || 'PT',
      pic_name: c.pic_name || '',
      pic_phone: c.pic_phone || '',
      pic_email: c.pic_email || '',
      address: c.address || '',
      city: c.city || '',
      npwp: c.npwp || '',
      payment_terms_days: c.payment_terms_days || 30,
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus customer "${name}"?`)) {
      await customerService.deleteCustomer(id);
      loadCustomers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama perusahaan wajib diisi.');
      return;
    }

    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      setShowModal(false);
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan customer');
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.pic_name && c.pic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Customer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola profil perusahaan customer, PIC penanggung jawab, termin pembayaran, dan NPWP (F1).
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Customer
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode, nama perusahaan, PIC, atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 whitespace-nowrap">
          Total: <strong className="text-slate-800">{filtered.length} Customer Terdaftar</strong>
        </div>
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Memuat data customer...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cust) => (
            <div 
              key={cust.id} 
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cust.code || 'CUST'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                      {cust.name}
                    </h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" /> {cust.payment_terms_days} Hari
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{cust.pic_name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cust.pic_phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.pic_email || '-'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 line-clamp-2">
                      {cust.address ? `${cust.address}${cust.city ? `, ${cust.city}` : ''}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  NPWP: {cust.npwp || 'Belum diisi'}
                </span>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cust)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Edit Customer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cust.id, cust.name)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Hapus Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              Tidak ada customer yang sesuai dengan pencarian.
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Customer */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCustomer ? 'Edit Data Customer' : 'Tambah Customer Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Badan Usaha</label>
                  <select 
                    value={formData.company_type}
                    onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="PT">PT</option>
                    <option value="CV">CV</option>
                    <option value="Perorangan">Perorangan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">Nama Perusahaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Indofood CBP Sukses Makmur"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama PIC (Kontak)</label>
                  <input
                    type="text"
                    placeholder="Nama PIC proyek"
                    value={formData.pic_name}
                    onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. Telepon / WhatsApp</label>
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
                    placeholder="email@perusahaan.co.id"
                    value={formData.pic_email}
                    onChange={(e) => setFormData({ ...formData, pic_email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kota / Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Cikarang, Bekasi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap Perusahaan</label>
                <textarea
                  rows={2}
                  placeholder="Nama jalan, gedung, kawasan industri..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor NPWP</label>
                  <input
                    type="text"
                    placeholder="00.000.000.0-000.000"
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Termin Pembayaran (Hari)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.payment_terms_days}
                    onChange={(e) => setFormData({ ...formData, payment_terms_days: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan khusus, preferensi brand, dll."
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
                  {editingCustomer ? 'Simpan Perubahan' : 'Tambah Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
