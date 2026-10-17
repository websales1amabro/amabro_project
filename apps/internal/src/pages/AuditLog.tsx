import React from 'react';
import { History, Shield, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuditLog: React.FC = () => {
  const { role } = useAuth();

  const mockLogs = [
    {
      id: '1',
      action: 'APPROVE',
      table: 'quotations',
      record: 'QUO/2026/10/0004 (Rev 0)',
      user: 'Budi Santoso (Owner)',
      role: 'owner',
      details: 'Persetujuan penawaran disetujui tanpa catatan diskon tambahan',
      time: '17 Okt 2026, 11:35 WIB',
    },
    {
      id: '2',
      action: 'UPDATE',
      table: 'commercial_analysis',
      record: 'INQ/2026/10/0004',
      user: 'Budi Santoso (Owner)',
      role: 'owner',
      details: 'Penetapan margin target 34.6% dan risk buffer 5%',
      time: '17 Okt 2026, 11:15 WIB',
    },
    {
      id: '3',
      action: 'INSERT',
      table: 'vendor_quotes',
      record: 'Siemens S7-1500 (Qty 1)',
      user: 'Hendra Wijaya (Purchasing)',
      role: 'purchasing',
      details: 'Input penawaran harga vendor PT Siemens Indo: Rp 85.000.000',
      time: '17 Okt 2026, 09:40 WIB',
    },
    {
      id: '4',
      action: 'INSERT',
      table: 'inquiries',
      record: 'INQ/2026/10/0004',
      user: 'Edge Function (submit_inquiry)',
      role: 'system',
      details: 'Pengunjung website publik mengirim inquiry melalui Turnstile CAPTCHA',
      time: '17 Okt 2026, 08:20 WIB',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" /> Jejak Audit & Log Aktivitas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekam jejak setiap perubahan status, input harga vendor, modifikasi margin, dan keputusan Owner (Aturan PRD).
          </p>
        </div>

        <div className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 self-start sm:self-auto">
          <Shield className="w-4 h-4 text-emerald-600" /> Tamper-evident Audit Triggers
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-5 py-3">Waktu</th>
                <th className="px-5 py-3">Aksi</th>
                <th className="px-5 py-3">Tabel / Record</th>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-5 py-3">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {log.time}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      log.action === 'APPROVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.action === 'UPDATE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-mono text-slate-800 font-medium">{log.record}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">({log.table})</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{log.user}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-sm">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
