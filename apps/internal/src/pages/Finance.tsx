import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  AlertTriangle, 
  ShieldCheck, 
  PieChart, 
  Receipt, 
  Calendar, 
  DollarSign, 
  Download, 
  Plus, 
  Search, 
  Building, 
  Clock, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Filter, 
  ShieldAlert,
  Percent,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { financeService } from '../services/financeService';
import type { TaxInvoice, ProjectProfitLoss, ArAgingItem } from '../types/database';

export const Finance: React.FC = () => {
  const { role, canViewCommercialAnalysis } = useAuth();
  const [activeTab, setActiveTab] = useState<'pajak' | 'labarugi' | 'aging'>('pajak');
  const [taxSubTab, setTaxSubTab] = useState<'keluaran' | 'masukan'>('keluaran');

  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>([]);
  const [profitLossList, setProfitLossList] = useState<ProjectProfitLoss[]>([]);
  const [arAgingList, setArAgingList] = useState<ArAgingItem[]>([]);
  const [vatRecap, setVatRecap] = useState({
    keluaranTotal: 0,
    masukanTotal: 0,
    netPayable: 0,
    isOverpaid: false
  });
  const [loading, setLoading] = useState(true);

  // Modal Tambah Faktur Pajak
  const [showNewTaxModal, setShowNewTaxModal] = useState(false);
  const [taxForm, setTaxForm] = useState({
    tax_type: 'keluaran' as TaxInvoice['tax_type'],
    tax_invoice_number: '010.002-26.',
    tax_date: new Date().toISOString().split('T')[0],
    npwp: '',
    tax_subject_name: '',
    tax_subject_address: '',
    dpp: 0,
    tax_rate: 11,
    tax_period_month: new Date().getMonth() + 1,
    tax_period_year: new Date().getFullYear(),
    is_creditable: true,
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [taxes, pl, ar, vat] = await Promise.all([
        financeService.getTaxInvoices(),
        financeService.getProfitLossReport(),
        financeService.getArAgingReport(),
        financeService.getVatRecap()
      ]);
      setTaxInvoices(taxes);
      setProfitLossList(pl);
      setArAgingList(ar);
      setVatRecap(vat);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  // Ekspor CSV format e-Faktur Coretax DJP
  const handleExportEFakturCSV = () => {
    const csvContent = financeService.exportEFakturCSV(taxInvoices);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eFaktur_Keluaran_Amabro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTaxInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxForm.tax_invoice_number || !taxForm.npwp || !taxForm.tax_subject_name) return;
    const ppn = Math.round(taxForm.dpp * (taxForm.tax_rate / 100));

    await financeService.createTaxInvoice({
      tax_type: taxForm.tax_type,
      tax_invoice_number: taxForm.tax_invoice_number,
      tax_date: taxForm.tax_date,
      npwp: taxForm.npwp,
      tax_subject_name: taxForm.tax_subject_name,
      tax_subject_address: taxForm.tax_subject_address,
      tax_rate: taxForm.tax_rate,
      dpp: taxForm.dpp,
      ppn,
      tax_period_month: taxForm.tax_period_month,
      tax_period_year: taxForm.tax_period_year,
      is_creditable: taxForm.is_creditable,
      efaktur_status: 'ready',
      notes: taxForm.notes
    });

    setShowNewTaxModal(false);
    await loadData();
  };

  // Check if Sales or Engineer is trying to view restricted cost / P&L
  const isFinanceOrOwner = role === 'owner' || role === 'finance';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Pajak (Faktur) & Laporan Keuangan (Fase 3)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekap e-Faktur PPN 11% (siap impor DJP/Coretax), analisis laba rugi proyek aktual, dan matriks umur piutang (AR).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'pajak' && (
            <>
              <button
                onClick={() => setShowNewTaxModal(true)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Input Faktur Pajak
              </button>
              <button
                onClick={handleExportEFakturCSV}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Ekspor CSV e-Faktur
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Piutang */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Piutang Berjalan (AR)
            </span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatIDR(arAgingList.reduce((sum, a) => sum + a.remaining_amount, 0))}
          </div>
          <p className="text-[11px] text-slate-500">
            {arAgingList.filter(a => a.days_overdue > 0).length} invoice melewati jatuh tempo
          </p>
        </div>

        {/* PPN Keluaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              PPN Keluaran (11%)
            </span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {formatIDR(vatRecap.keluaranTotal)}
          </div>
          <p className="text-[11px] text-slate-500">Faktur Pajak Penjualan Customer</p>
        </div>

        {/* PPN Masukan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              PPN Masukan (Kredit Pajak)
            </span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {formatIDR(vatRecap.masukanTotal)}
          </div>
          <p className="text-[11px] text-slate-500">Faktur Pajak Pembelian Vendor</p>
        </div>

        {/* Net Kurang/Lebih Bayar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              SPT Masa: {vatRecap.isOverpaid ? 'Lebih Bayar' : 'Kurang Bayar'}
            </span>
            <span className={`p-1.5 rounded-lg ${vatRecap.isOverpaid ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-xl font-bold ${vatRecap.isOverpaid ? 'text-amber-600' : 'text-rose-600'}`}>
            {formatIDR(vatRecap.netPayable)}
          </div>
          <p className="text-[11px] text-slate-500">
            {vatRecap.isOverpaid ? 'Dapat dikompensasikan ke bulan depan' : 'Wajib disetor sebelum akhir bulan'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pajak')}
          className={`pb-3 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'pajak' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Faktur Pajak & e-Faktur ({taxInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('labarugi')}
          className={`pb-3 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'labarugi' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Laba Rugi Proyek ({profitLossList.length})
        </button>
        <button
          onClick={() => setActiveTab('aging')}
          className={`pb-3 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'aging' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Aging Piutang AR ({arAgingList.length})
        </button>
      </div>

      {/* TAB 1: FAKTUR PAJAK */}
      {activeTab === 'pajak' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTaxSubTab('keluaran')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  taxSubTab === 'keluaran' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pajak Keluaran (Customer)
              </button>
              <button
                onClick={() => setTaxSubTab('masukan')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  taxSubTab === 'masukan' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pajak Masukan (Vendor / Pembelian)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Tarif PPN Standar: <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">11.0%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Nomor Seri FP (NSFP)</th>
                    <th className="px-5 py-3">Nama Subjek Pajak</th>
                    <th className="px-5 py-3">NPWP</th>
                    <th className="px-5 py-3">Tanggal & Masa</th>
                    <th className="px-5 py-3">Dasar Pengenaan Pajak (DPP)</th>
                    <th className="px-5 py-3">PPN (11%)</th>
                    <th className="px-5 py-3">Status e-Faktur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {taxInvoices.filter(t => t.tax_type === taxSubTab).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Belum ada Faktur Pajak {taxSubTab} tercatat.
                      </td>
                    </tr>
                  ) : (
                    taxInvoices
                      .filter(t => t.tax_type === taxSubTab)
                      .map(tax => (
                        <tr key={tax.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                            {tax.tax_invoice_number}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800">
                            {tax.tax_subject_name}
                            <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                              {tax.tax_subject_address || '-'}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-600">{tax.npwp}</td>
                          <td className="px-5 py-3.5 text-slate-500">
                            <div>{tax.tax_date}</div>
                            <div className="text-[10px] text-slate-400">Masa {tax.tax_period_month}/{tax.tax_period_year}</div>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {formatIDR(tax.dpp)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-emerald-600">
                            {formatIDR(tax.ppn)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              tax.efaktur_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              tax.efaktur_status === 'uploaded' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              tax.efaktur_status === 'ready' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {tax.efaktur_status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LABA RUGI PROYEK */}
      {activeTab === 'labarugi' && (
        <div className="space-y-4">
          {!isFinanceOrOwner ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Akses Laporan Laba Rugi Dibatasi</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Role Anda ({role.toUpperCase()}) tidak memiliki izin untuk melihat laporan laba kotor, HPP supplier, dan margin aktual proyek. Akses ini dikhususkan bagi Owner dan Tim Finance.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Analisis Margin Rencana vs Realisasi Aktual</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Membandingkan Target Margin awal dari Commercial Analysis V4 dengan HPP PO Vendor aktual yang dikeluarkan.
                  </p>
                </div>
                <div className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-semibold">
                  Total Nilai Kontrak: {formatIDR(profitLossList.reduce((s, p) => s + p.revenue, 0))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Nama Proyek & Customer</th>
                      <th className="px-5 py-3">No. Quotation</th>
                      <th className="px-5 py-3">Revenue (Penjualan)</th>
                      <th className="px-5 py-3">HPP Vendor Aktual</th>
                      <th className="px-5 py-3">Laba Kotor Aktual</th>
                      <th className="px-5 py-3">Target Margin %</th>
                      <th className="px-5 py-3">Realisasi Margin %</th>
                      <th className="px-5 py-3 text-center">Status Varian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {profitLossList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-400">
                          Belum ada transaksi quotation yang disetujui.
                        </td>
                      </tr>
                    ) : (
                      profitLossList.map((pl, idx) => {
                        const variance = pl.actual_margin_pct - pl.target_margin_pct;
                        const isUnderperforming = variance < -2; // Margin bocor lebih dari 2%

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-slate-900">{pl.project_title}</div>
                              <div className="text-[11px] text-slate-500">{pl.customer_name}</div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-600">{pl.quotation_number}</td>
                            <td className="px-5 py-3.5 font-semibold text-slate-900">{formatIDR(pl.revenue)}</td>
                            <td className="px-5 py-3.5 text-slate-700 font-medium">{formatIDR(pl.actual_cogs)}</td>
                            <td className="px-5 py-3.5 font-bold text-emerald-600">{formatIDR(pl.actual_gross_profit)}</td>
                            <td className="px-5 py-3.5 text-slate-600 font-medium">{pl.target_margin_pct}%</td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">
                              <span className={isUnderperforming ? 'text-rose-600' : 'text-emerald-600'}>
                                {pl.actual_margin_pct}%
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {isUnderperforming ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3" /> Margin Bocor ({variance.toFixed(1)}%)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> Sesuai Target (+{variance.toFixed(1)}%)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AGING PIUTANG (AR AGING) */}
      {activeTab === 'aging' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Daftar Umur Piutang Pelanggan (AR Aging)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemantauan tagihan belum terbayar untuk menjaga kelancaran arus kas operasional Amabro.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Nomor Invoice</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Tanggal Invoice</th>
                    <th className="px-5 py-3">Tanggal Jatuh Tempo</th>
                    <th className="px-5 py-3">Sisa Piutang (Rp)</th>
                    <th className="px-5 py-3">Hari Overdue</th>
                    <th className="px-5 py-3">Kategori Umur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {arAgingList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-emerald-600 font-medium">
                        Semua tagihan customer lunas! Tidak ada piutang tertunggak.
                      </td>
                    </tr>
                  ) : (
                    arAgingList.map((ar, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                          {ar.invoice_number}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {ar.customer_name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{ar.invoice_date}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">{ar.due_date}</td>
                        <td className="px-5 py-3.5 font-bold text-rose-600">
                          {formatIDR(ar.remaining_amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          {ar.days_overdue > 0 ? (
                            <span className="font-semibold text-rose-600">
                              {ar.days_overdue} hari
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Belum jatuh tempo</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            ar.aging_category === 'Lancar (Belum JT)' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            ar.aging_category === '1 - 30 Hari' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            ar.aging_category === '31 - 60 Hari' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {ar.aging_category}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT FAKTUR PAJAK */}
      {showNewTaxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Input Faktur Pajak Baru (e-Faktur DJP)
              </h3>
              <button onClick={() => setShowNewTaxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTaxInvoice} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Faktur *</label>
                  <select
                    value={taxForm.tax_type}
                    onChange={(e) => setTaxForm({ ...taxForm, tax_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="keluaran">Pajak Keluaran (Customer)</option>
                    <option value="masukan">Pajak Masukan (Vendor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Seri FP (NSFP) *</label>
                  <input
                    type="text"
                    required
                    placeholder="010.002-26.89201123"
                    value={taxForm.tax_invoice_number}
                    onChange={(e) => setTaxForm({ ...taxForm, tax_invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lawan Transaksi (PT/CV) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Mayora Indah Tbk"
                  value={taxForm.tax_subject_name}
                  onChange={(e) => setTaxForm({ ...taxForm, tax_subject_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NPWP Lawan Transaksi (15/16 Digit) *</label>
                <input
                  type="text"
                  required
                  placeholder="01.234.567.8-412.000"
                  value={taxForm.npwp}
                  onChange={(e) => setTaxForm({ ...taxForm, npwp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dasar Pengenaan Pajak (DPP) *</label>
                  <input
                    type="number"
                    required
                    value={taxForm.dpp || ''}
                    onChange={(e) => setTaxForm({ ...taxForm, dpp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tarif PPN (%)</label>
                  <input
                    type="number"
                    value={taxForm.tax_rate}
                    onChange={(e) => setTaxForm({ ...taxForm, tax_rate: parseFloat(e.target.value) || 11 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
                Estimasi PPN Terutang (11%): <strong>{formatIDR(taxForm.dpp * (taxForm.tax_rate / 100))}</strong>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal FP</label>
                  <input
                    type="date"
                    value={taxForm.tax_date}
                    onChange={(e) => setTaxForm({ ...taxForm, tax_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Masa Pajak</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={taxForm.tax_period_month}
                    onChange={(e) => setTaxForm({ ...taxForm, tax_period_month: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tahun Pajak</label>
                  <input
                    type="number"
                    value={taxForm.tax_period_year}
                    onChange={(e) => setTaxForm({ ...taxForm, tax_period_year: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaxModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan Faktur Pajak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
