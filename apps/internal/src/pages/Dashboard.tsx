import React from 'react';
import { 
  DollarSign, 
  Inbox, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowRight,
  ShieldAlert,
  Plus,
  Building,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { role, canViewCommercialAnalysis, canApproveQuotation } = useAuth();

  // Sample pipeline statistics
  const stats = [
    {
      title: 'Total Pipeline Value',
      value: canViewCommercialAnalysis ? 'Rp 1.485.000.000' : 'Rp 1.850.000.000 (Harga Jual)',
      subtext: canViewCommercialAnalysis ? 'Estimasi Gross Margin: 28.5%' : 'Target Kuartal IV',
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'Inquiry Aktif',
      value: '14 Proyek',
      subtext: '4 butuh analisis teknis V1/V2',
      icon: Inbox,
      color: 'bg-blue-500',
    },
    {
      title: 'Menunggu Approval Owner',
      value: '3 Penawaran',
      subtext: canApproveQuotation ? 'Perlu tindakan segera!' : 'Menunggu Owner review',
      icon: Clock,
      color: 'bg-amber-500',
      badge: canApproveQuotation ? 'Wajib Review' : undefined,
    },
    {
      title: 'Win Rate Penawaran',
      value: '68%',
      subtext: '12 deal won bulan ini',
      icon: CheckCircle,
      color: 'bg-indigo-500',
    },
  ];

  // Pipeline stage counters
  const pipelineStages = [
    { name: 'Inquiry Masuk', count: 4, color: 'border-blue-400 bg-blue-50/50' },
    { name: 'Analisis V1/V2', count: 3, color: 'border-indigo-400 bg-indigo-50/50' },
    { name: 'Sourcing V3', count: 2, color: 'border-purple-400 bg-purple-50/50' },
    { name: 'Analisis Komersial V4', count: 2, color: 'border-violet-400 bg-violet-50/50' },
    { name: 'Menunggu Approval', count: 3, color: 'border-amber-400 bg-amber-50/50' },
    { name: 'Terkirim ke Customer', count: 5, color: 'border-teal-400 bg-teal-50/50' },
    { name: 'Won (Deal PO)', count: 8, color: 'border-emerald-500 bg-emerald-50/50' },
  ];

  // Recent inquiries mock data
  const recentInquiries = [
    {
      id: '1',
      number: 'INQ/2026/10/0004',
      title: 'Upgrade PLC Siemens S7-1500 & SCADA WinCC',
      customer: 'PT Indofood CBP Sukses Makmur',
      source: 'website',
      date: '17 Okt 2026',
      status: 'waiting_approval',
      statusLabel: 'Menunggu Approval',
      value: 'Rp 420.000.000',
      margin: '32%',
    },
    {
      id: '2',
      number: 'INQ/2026/10/0003',
      title: 'Retrofit Inverter VFD 75kW & Control Panel',
      customer: 'PT Semen Indonesia Group',
      source: 'internal',
      date: '16 Okt 2026',
      status: 'commercial_analysis',
      statusLabel: 'Analisis Komersial (V4)',
      value: 'Rp 185.000.000',
      margin: '25%',
    },
    {
      id: '3',
      number: 'INQ/2026/10/0002',
      title: 'Sensor Instrumentation & Pressure Transmitter',
      customer: 'PT Pupuk Sriwidjaja',
      source: 'website',
      date: '15 Okt 2026',
      status: 'vendor_sourcing',
      statusLabel: 'Sourcing Vendor (V3)',
      value: 'Rp 95.000.000',
      margin: '20%',
    },
    {
      id: '4',
      number: 'INQ/2026/10/0001',
      title: 'Robot Palletizer & Safety Interlock Cage',
      customer: 'PT Mayora Indah Tbk',
      source: 'internal',
      date: '14 Okt 2026',
      status: 'technical_analysis',
      statusLabel: 'Analisis Teknis (V1/V2)',
      value: 'Rp 785.000.000',
      margin: '30%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Penjualan & Transaksi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan alur quotation dari customer inquiry sampai status pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inquiries/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Input Inquiry Baru
          </Link>
        </div>
      </div>

      {/* RLS Policy Notice Banner */}
      {!canViewCommercialAnalysis && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong className="font-semibold">Proteksi Keamanan RLS Aktif (Role: {role.toUpperCase()}):</strong> Sesuai aturan bisnis PRD, data modal supplier, persentase margin, dan harga minimum dienkapsulasi pada tabel terpisah <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">commercial_analysis</code> dan hanya dapat dibaca oleh <strong>Owner</strong> dan <strong>Finance</strong>.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.color} text-white flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  {stat.badge ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {stat.badge}
                    </span>
                  ) : null}
                  <span>{stat.subtext}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Status Breakdown Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Alur Status Pipeline Penawaran</h2>
            <p className="text-xs text-slate-500">Distribusi seluruh penawaran yang sedang berjalan</p>
          </div>
          <Link
            to="/pipeline"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            Buka Kanban Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {pipelineStages.map((stage, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border text-center transition-all hover:shadow-xs ${stage.color}`}
            >
              <div className="text-2xl font-bold text-slate-800">{stage.count}</div>
              <div className="text-[11px] font-medium text-slate-600 mt-1 truncate">{stage.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inquiry List & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Inquiry Terbaru</h3>
            <Link to="/inquiries" className="text-xs text-blue-600 hover:underline font-medium">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {inq.number}
                    </span>
                    {inq.source === 'website' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded">
                        Website Form
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{inq.date}</span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-900 truncate">
                    {inq.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    {inq.customer}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">{inq.value}</div>
                  {canViewCommercialAnalysis && (
                    <div className="text-[10px] text-emerald-600 font-medium">
                      Margin: {inq.margin}
                    </div>
                  )}
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    inq.status === 'waiting_approval' 
                      ? 'bg-amber-100 text-amber-800'
                      : inq.status === 'commercial_analysis'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {inq.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel / Approvals Shortcut */}
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                Owner Approval Action
              </span>
              <FileCheck className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold">Persetujuan Penawaran</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Customer Quotation <strong>tidak dapat dikirimkan ke customer</strong> tanpa persetujuan Owner.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">3 Penawaran Pending</span>
              <Link
                to="/approvals"
                className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Tinjau Sekarang <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Akses Cepat Modul
            </h4>
            <div className="space-y-2">
              <Link 
                to="/customers" 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" /> Kelola Customer (PT / CV)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link 
                to="/vendors" 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" /> Vendor Sourcing & RFQ (V3)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link 
                to="/quotations" 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" /> Internal & Customer Quotation
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
