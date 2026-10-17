import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  FileText, 
  Save, 
  ShieldAlert, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  ExternalLink, 
  PhoneCall, 
  RefreshCw,
  Info,
  CreditCard,
  CheckCircle2,
  Sliders,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  settingsService, 
  DEFAULT_COMPANY_SETTINGS,
  type CompanySettings, 
  type SalesMember 
} from '../services/settingsService';

export const Settings: React.FC = () => {
  const { role, setSimulatedRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'company' | 'sales' | 'whatsapp' | 'commercial'>('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);

  // Sales Team State
  const [salesTeam, setSalesTeam] = useState<SalesMember[]>([]);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesMember | null>(null);
  const [salesFormData, setSalesFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    region: '',
    role: 'sales' as 'sales' | 'engineer',
    is_active: true,
  });

  // Test WhatsApp message modal / preview
  const [testCustomerPhone, setTestCustomerPhone] = useState('6281234567890');
  const [testCustomerName, setTestCustomerName] = useState('Bpk. Hendra (PT Indofood)');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedSales] = await Promise.all([
        settingsService.getCompanySettings(),
        settingsService.getSalesTeam(),
      ]);
      setSettings(fetchedSettings);
      setSalesTeam(fetchedSales);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const result = await settingsService.saveCompanySettings(settings);
    setSaving(false);

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      setSaveError(result.error || 'Gagal menyimpan pengaturan.');
    }
  };

  // Sales Modal Handlers
  const handleOpenAddSales = () => {
    setEditingSales(null);
    setSalesFormData({
      full_name: '',
      email: '',
      phone: '628',
      region: 'Jabodetabek',
      role: 'sales',
      is_active: true,
    });
    setShowSalesModal(true);
  };

  const handleOpenEditSales = (sales: SalesMember) => {
    setEditingSales(sales);
    setSalesFormData({
      full_name: sales.full_name,
      email: sales.email,
      phone: sales.phone,
      region: sales.region,
      role: sales.role,
      is_active: sales.is_active,
    });
    setShowSalesModal(true);
  };

  const handleSaveSalesMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesFormData.full_name || !salesFormData.phone) {
      alert('Nama lengkap dan nomor WhatsApp wajib diisi.');
      return;
    }

    try {
      if (editingSales) {
        await settingsService.updateSalesMember(editingSales.id, salesFormData);
      } else {
        await settingsService.createSalesMember(salesFormData);
      }
      setShowSalesModal(false);
      const updatedList = await settingsService.getSalesTeam();
      setSalesTeam(updatedList);
    } catch (err) {
      console.error('Error saving sales member:', err);
      alert('Terjadi kesalahan saat menyimpan data sales.');
    }
  };

  const handleToggleSalesStatus = async (sales: SalesMember) => {
    try {
      await settingsService.updateSalesMember(sales.id, { is_active: !sales.is_active });
      const updatedList = await settingsService.getSalesTeam();
      setSalesTeam(updatedList);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteSales = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus sales "${name}" dari sistem?`)) {
      try {
        await settingsService.deleteSalesMember(id);
        const updatedList = await settingsService.getSalesTeam();
        setSalesTeam(updatedList);
      } catch (err) {
        console.error('Failed to delete sales member:', err);
      }
    }
  };

  // WhatsApp Preview Generator
  const generatePreviewWaMessage = () => {
    const activeSales = salesTeam.find((s) => s.is_active) || salesTeam[0];
    const template = settings.wa_quotation_template || '';
    return template
      .replace('{customer_pic}', testCustomerName)
      .replace('{quotation_no}', 'QUO/2026/10/0001')
      .replace('{project_title}', 'Pengadaan Valve & Automation Instrumentation')
      .replace('{total_price}', 'Rp 37.851.000 (Incl. PPN 11%)')
      .replace('{validity_days}', String(settings.default_validity_days || 14))
      .replace('{sales_name}', activeSales?.full_name || 'Rian Pratama')
      .replace('{sales_phone}', activeSales?.phone || settings.whatsapp);
  };

  const handleTestSendWhatsApp = () => {
    const cleanPhone = testCustomerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(generatePreviewWaMessage());
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // ==========================================
  // OWNER SECURITY GUARD (Hanya Bisa Diakses Oleh Owner)
  // ==========================================
  if (role !== 'owner') {
    return (
      <div className="p-8 max-w-xl mx-auto mt-16 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Dibatasi (Owner Only)</h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
          Menu Pengaturan Sistem ini berisi konfigurasi data legal PT, pengaturan tim sales, nomor WhatsApp, serta standar komersial yang <strong>hanya dapat diakses oleh peran Owner</strong>.
        </p>
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
          <p className="font-semibold text-slate-700">Untuk menguji menu ini saat peninjauan sistem:</p>
          <p className="text-slate-500">
            Anda dapat beralih peran ke <strong>Owner</strong> menggunakan menu seleksi peran di sidebar kiri, atau klik tombol di bawah ini:
          </p>
          <button
            onClick={() => setSimulatedRole('owner')}
            className="w-full mt-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4" /> Beralih ke Mode Owner Sekarang
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm">Memuat pengaturan sistem...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
            <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
              Khusus Owner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi identitas resmi perusahaan, tim sales, integrasi WhatsApp, dan standar komersial penawaran.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-lg border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Pengaturan berhasil diperbarui!
          </div>
        )}

        {saveError && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-800 text-xs font-semibold px-4 py-2 rounded-lg border border-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            {saveError}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil & Alamat PT</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'sales'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Maintenance Tim Sales</span>
          <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
            {salesTeam.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Pengaturan WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('commercial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'commercial'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Standar Penawaran (T&C)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: IDENTITAS & PROFIL PERUSAHAAN                         */}
      {/* ============================================================ */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompanySettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Identitas Legal & Kontak Perusahaan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nama Perusahaan Resmi (Kop Surat & Invoice) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.company_name}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PT. AMABRO BINTANG INOVASI"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tagline / Bidang Usaha
                    </label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Industrial Automation Systems, Instrumentation & Electrical Solutions"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Alamat Lengkap Kantor *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      placeholder="Plaza Aminta Lt 5/504, Jl TB Simatupang Kav 10, Jakarta Selatan..."
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor Telepon Kantor (PABX / Telp) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="021-2292-0544"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor WhatsApp Resmi (CS / Hotline) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="6281222920544"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Gunakan format internasional tanpa spasi/strip (cth: 62812...)</p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Email Resmi Perusahaan *
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@amabroindonesia.com"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Website Resmi *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="www.amabroindonesia.com"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor Pokok Wajib Pajak (NPWP)
                    </label>
                    <input
                      type="text"
                      value={settings.npwp}
                      onChange={(e) => setSettings({ ...settings, npwp: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="01.482.912.4-413.000"
                    />
                  </div>
                </div>
              </div>

              {/* Rekening Bank Perusahaan */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Rekening Bank Pembayaran (Invoice & Quotation)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nama Bank</label>
                    <input
                      type="text"
                      value={settings.bank_name}
                      onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300"
                      placeholder="Bank Mandiri / BCA"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={settings.bank_account_number}
                      onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                      placeholder="123-00-9876543-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={settings.bank_account_holder}
                      onChange={(e) => setSettings({ ...settings, bank_account_holder: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300"
                      placeholder="PT. AMABRO BINTANG INOVASI"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Profil Perusahaan'}
                </button>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  Live Preview Kop Surat Resmi
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-2 text-[10px]">
                  <div className="flex items-center gap-2.5 border-b border-slate-900 pb-2">
                    <img src="/amabro-logo.png" alt="Logo" className="w-9 h-9 object-contain" />
                    <div>
                      <h5 className="font-black text-slate-900 uppercase leading-none">
                        {settings.company_name || 'PT. AMABRO BINTANG INOVASI'}
                      </h5>
                      <p className="text-[9px] text-slate-600 mt-0.5 line-clamp-1">{settings.tagline}</p>
                      <p className="text-[8.5px] text-slate-500 line-clamp-1">{settings.address}</p>
                      <p className="text-[8.5px] text-slate-500">
                        Phone: {settings.phone} | WA: {settings.whatsapp} | Email: {settings.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-4 text-slate-400 italic">
                    [Konten Isi Surat Penawaran / Invoice]
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Perubahan data di atas akan otomatis diterapkan pada seluruh cetakan PDF penawaran, purchase order, dan surat jalan.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MAINTENANCE TIM SALES                                 */}
      {/* ============================================================ */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daftar Tim Sales & Engineer</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola nama personil sales, nomor WhatsApp untuk penawaran, serta area kerja.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddSales}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Anggota Sales
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Nama Personil</th>
                    <th className="p-3.5">Role / Peran</th>
                    <th className="p-3.5">Nomor WhatsApp / HP</th>
                    <th className="p-3.5">Wilayah / Spesialisasi</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesTeam.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{member.full_name}</div>
                        <div className="text-[11px] text-slate-500">{member.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          member.role === 'engineer' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role === 'engineer' ? 'Sales Engineer' : 'Sales Representative'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 font-mono">
                          <span>{member.phone}</span>
                          <a
                            href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Chat via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">{member.region || 'Nasional'}</td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSalesStatus(member)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            member.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {member.is_active ? '● Aktif' : '○ Non-Aktif'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSales(member)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Sales"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSales(member.id, member.full_name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Sales"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PENGATURAN WHATSAPP & TEMPLATE PESAN                 */}
      {/* ============================================================ */}
      {activeTab === 'whatsapp' && (
        <form onSubmit={handleSaveCompanySettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Format Template Pesan WhatsApp Penawaran
                </h3>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor WhatsApp Center / Gateway
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                      placeholder="6281222920544"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Template Pesan Kirim Penawaran (Quotation) ke Customer
                    </label>
                    <textarea
                      rows={9}
                      value={settings.wa_quotation_template}
                      onChange={(e) => setSettings({ ...settings, wa_quotation_template: e.target.value })}
                      className="w-full p-3 rounded-lg border border-slate-300 font-mono text-[11px] leading-relaxed"
                    />
                    <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-[10px] text-blue-900 mt-2 space-y-1">
                      <p className="font-bold">Variabel Tag Otomatis yang Tersedia:</p>
                      <div className="flex flex-wrap gap-1.5 font-mono">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{customer_pic}`}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{quotation_no}`}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{project_title}`}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{total_price}`}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{validity_days}`}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{sales_name}`}</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">{`{sales_phone}`}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Template Pesan Konfirmasi Penerimaan Inquiry Baru
                    </label>
                    <textarea
                      rows={5}
                      value={settings.wa_inquiry_template}
                      onChange={(e) => setSettings({ ...settings, wa_inquiry_template: e.target.value })}
                      className="w-full p-3 rounded-lg border border-slate-300 font-mono text-[11px] leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Template WhatsApp'}
                  </button>
                </div>
              </div>
            </div>

            {/* Test WhatsApp Tester Box */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  Uji Coba Kirim Pesan WhatsApp
                </h4>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama PIC Customer Uji</label>
                  <input
                    type="text"
                    value={testCustomerName}
                    onChange={(e) => setTestCustomerName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp Tujuan (Test)</label>
                  <input
                    type="text"
                    value={testCustomerPhone}
                    onChange={(e) => setTestCustomerPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                    placeholder="6281234567890"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hasil Teks Pesan Yang Terbentuk:</label>
                  <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl font-mono text-[10px] whitespace-pre-wrap text-slate-800 leading-relaxed max-h-56 overflow-y-auto">
                    {generatePreviewWaMessage()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestSendWhatsApp}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Buka WhatsApp & Test Kirim
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* TAB 4: STANDAR PENAWARAN (COMMERCIAL DEFAULTS & T&C)          */}
      {/* ============================================================ */}
      {activeTab === 'commercial' && (
        <form onSubmit={handleSaveCompanySettings} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-4xl">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Nilai Standar Syarat & Ketentuan Penawaran (Default Quotation T&C)
            </h3>
            <p className="text-xs text-slate-500">
              Nilai-nilai ini akan otomatis terisi setiap kali Sales atau Owner membuat draft surat penawaran baru.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Masa Berlaku Penawaran Standar (Hari) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={settings.default_validity_days}
                  onChange={(e) => setSettings({ ...settings, default_validity_days: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Batas Peringatan Minimal Margin (%) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={settings.min_margin_percent}
                  onChange={(e) => setSettings({ ...settings, min_margin_percent: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Sistem akan memberi highlight merah bila margin penawaran di bawah persentase ini.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Ketentuan Waktu Pengiriman Default (Delivery Terms) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={settings.default_lead_time}
                  onChange={(e) => setSettings({ ...settings, default_lead_time: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="Ready Stock / 2-3 Minggu Ex-works..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Ketentuan Syarat Pembayaran Default (Payment Terms) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={settings.default_payment_terms}
                  onChange={(e) => setSettings({ ...settings, default_payment_terms: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="30 Hari setelah invoice & surat jalan diterima (TOP 30)..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Ketentuan Garansi Default (Warranty Terms) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={settings.default_warranty}
                  onChange={(e) => setSettings({ ...settings, default_warranty: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="12 Bulan Garansi Pabrik terhadap cacat manufaktur..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Standar Penawaran'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH / EDIT SALES MEMBER                           */}
      {/* ============================================================ */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSales ? 'Edit Data Sales' : 'Tambah Personil Sales Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSalesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalesMember} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={salesFormData.full_name}
                  onChange={(e) => setSalesFormData({ ...salesFormData, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                  placeholder="Contoh: Rian Pratama, S.T."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Sales *</label>
                <input
                  type="email"
                  required
                  value={salesFormData.email}
                  onChange={(e) => setSalesFormData({ ...salesFormData, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="rian.pratama@amabroindonesia.com"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp / HP *</label>
                <input
                  type="text"
                  required
                  value={salesFormData.phone}
                  onChange={(e) => setSalesFormData({ ...salesFormData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  placeholder="6281288880101"
                />
                <p className="text-[10px] text-slate-500 mt-1">Gunakan kode negara (628...), tanpa spasi/dash</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Peran (Role)</label>
                  <select
                    value={salesFormData.role}
                    onChange={(e) => setSalesFormData({ ...salesFormData, role: e.target.value as 'sales' | 'engineer' })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="sales">Sales Representative</option>
                    <option value="engineer">Sales Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Keaktifan</label>
                  <select
                    value={salesFormData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setSalesFormData({ ...salesFormData, is_active: e.target.value === 'active' })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Wilayah Kerja / Spesialisasi</label>
                <input
                  type="text"
                  value={salesFormData.region}
                  onChange={(e) => setSalesFormData({ ...salesFormData, region: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="Contoh: Jabodetabek, Industrial West Java, EPC"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSalesModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingSales ? 'Perbarui Sales' : 'Simpan Sales'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
