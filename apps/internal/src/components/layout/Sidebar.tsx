import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Inbox, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Receipt, 
  TrendingUp, 
  History,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/database';

export const Sidebar: React.FC = () => {
  const { role, profile, setSimulatedRole, canApproveQuotation } = useAuth();

  const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
    owner: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    sales: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    engineer: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    purchasing: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    finance: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pipeline', label: 'Kanban Pipeline', icon: KanbanSquare },
    { to: '/inquiries', label: 'Inquiry Penjualan', icon: Inbox },
    { to: '/customers', label: 'Data Customer', icon: Users },
    { to: '/vendors', label: 'Vendor & Sourcing', icon: Building2 },
    { to: '/quotations', label: 'Penawaran (Quotation)', icon: FileText },
    { 
      to: '/approvals', 
      label: 'Owner Approval', 
      icon: CheckCircle2, 
      badge: canApproveQuotation ? 'Action' : undefined,
      highlight: canApproveQuotation
    },
    { to: '/transactions', label: 'PO & Pengiriman (Fase 2)', icon: Receipt },
    { to: '/finance', label: 'Keuangan & Pajak (Fase 3)', icon: TrendingUp },
    { to: '/audit', label: 'Jejak Audit', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
          ASF
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-wide">
            AutoSales Flow
          </h1>
          <p className="text-xs text-slate-400">Industrial Automation</p>
        </div>
      </div>

      {/* Role Switcher for Testing / Preview */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-blue-400" /> Mode Peran (Role)
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${roleColors[role].bg} ${roleColors[role].text} ${roleColors[role].border}`}>
            {role}
          </span>
        </div>
        <select
          value={role}
          onChange={(e) => setSimulatedRole(e.target.value as UserRole)}
          className="w-full text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          title="Ganti peran untuk menguji pembatasan hak akses (RLS)"
        >
          <option value="owner">Owner (Akses Penuh + Margin + Approval)</option>
          <option value="sales">Sales (Inquiry + Quotation Draft)</option>
          <option value="engineer">Engineer (BOM & Analisis Teknis V1/V2)</option>
          <option value="purchasing">Purchasing (Vendor & RFQ V3)</option>
          <option value="finance">Finance (Faktur & Laporan Keuangan)</option>
        </select>
        {role === 'sales' || role === 'engineer' ? (
          <p className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            Cost & margin vendor disembunyikan (Aturan RLS)
          </p>
        ) : null}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {profile?.full_name || 'Pengguna'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {profile?.email || 'user@automation.co.id'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
