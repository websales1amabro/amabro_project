import React from 'react';
import { Bell, Search, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { isConfigured, role } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nomor inquiry, quotation, customer..."
          className="w-full text-xs pl-9 pr-4 py-2 bg-slate-100 rounded-lg border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
        />
      </div>

      {/* Right side info badges & notifications */}
      <div className="flex items-center space-x-4">
        {/* Supabase Connection Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-50">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          {isConfigured ? (
            <span className="text-emerald-700 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Supabase Connected
            </span>
          ) : (
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Dev Mock (.env.example)
            </span>
          )}
        </div>

        {/* RLS Security Guard Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>RLS Active: <strong>{role.toUpperCase()}</strong></span>
        </div>

        {/* Notification Bell */}
        <button 
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
