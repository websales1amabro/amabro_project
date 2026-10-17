import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Building, 
  Calendar, 
  ArrowRight,
  Globe,
  Briefcase,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { inquiryService } from '../services/inquiryService';
import { customerService } from '../services/customerService';
import type { Inquiry, Customer, InquiryPriority, InquirySource } from '../types/database';

export const Inquiries: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'internal' | 'website'>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Inquiry form state
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    source: 'internal' as InquirySource,
    priority: 'medium' as InquiryPriority,
    deadline: '',
    estimated_value: 0,
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [inqList, custList] = await Promise.all([
        inquiryService.getInquiries(),
        customerService.getCustomers(),
      ]);
      setInquiries(inqList);
      setCustomers(custList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul kebutuhan / proyek wajib diisi.');
      return;
    }

    try {
      const created = await inquiryService.createInquiry({
        customer_id: formData.customer_id || undefined,
        title: formData.title,
        description: formData.description,
        source: formData.source,
        priority: formData.priority,
        deadline: formData.deadline || undefined,
        estimated_value: Number(formData.estimated_value) || 0,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
      });

      setShowNewModal(false);
      setFormData({
        customer_id: '',
        title: '',
        description: '',
        source: 'internal',
        priority: 'medium',
        deadline: '',
        estimated_value: 0,
        contact_name: '',
        contact_phone: '',
        contact_email: '',
      });
      loadData();
      navigate(`/inquiries/${created.id}`);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan inquiry');
    }
  };

  const getStatusBadge = (status: string) => {
    const formatted = status.replace(/_/g, ' ');
    switch (status) {
      case 'inquiry':
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
      case 'technical_analysis':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
      case 'vendor_sourcing':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
      case 'commercial_analysis':
        return <span className="bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
      case 'waiting_approval':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
      default:
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize">{formatted}</span>;
    }
  };

  const filtered = inquiries.filter((item) => {
    const matchesSearch = 
      item.inquiry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.customer?.name && item.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.contact_name && item.contact_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = filterSource === 'all' || item.source === filterSource;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Inquiry & Kebutuhan Proyek (F2)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh inquiry alur penjualan dari customer langsung maupun formulir website publik.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Inquiry Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor, judul atau customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Sumber:
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterSource === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Semua ({inquiries.length})
            </button>
            <button
              onClick={() => setFilterSource('internal')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterSource === 'internal' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Internal
            </button>
            <button
              onClick={() => setFilterSource('website')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterSource === 'website' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Website
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Memuat daftar inquiry...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">No. Inquiry</th>
                  <th className="px-5 py-3">Customer & Judul Proyek</th>
                  <th className="px-5 py-3">Sumber</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3">Estimasi Nilai</th>
                  <th className="px-5 py-3">Status Pipeline</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                      {inq.inquiry_number}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-slate-900">{inq.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        {inq.customer?.name || inq.contact_name || 'Customer Terkait'}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {inq.source === 'website' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <Globe className="w-3 h-3" /> Website
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <Briefcase className="w-3 h-3" /> Internal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {inq.deadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {inq.deadline}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      Rp {inq.estimated_value.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/inquiries/${inq.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Proses Alur <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Tidak ada inquiry yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Buat Inquiry Baru */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Buat Form Inquiry Baru (F2)</h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Customer *</label>
                <select 
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Customer Terdaftar --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city || 'Indonesia'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Permintaan / Proyek *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Pengadaan & Pemrograman PLC Siemens S7-1200"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sumber Inquiry</label>
                  <select 
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as InquirySource })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="internal">Internal Tim Sales</option>
                    <option value="website">Website Publik</option>
                    <option value="referral">Referral / Rekomendasi</option>
                    <option value="repeat">Repeat Order</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prioritas</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as InquiryPriority })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Deadline</label>
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300" 
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi Nilai Proyek (Rp)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300" 
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi & Ruang Lingkup Kebutuhan</label>
                <textarea 
                  rows={3} 
                  placeholder="Deskripsikan spesifikasi umum, lingkup integrasi, atau catatan customer..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan & Lanjut ke BOM Teknis (V1/V2)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
