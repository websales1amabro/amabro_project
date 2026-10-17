import React from 'react';
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  Building, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface KanbanItem {
  id: string;
  number: string;
  title: string;
  customer: string;
  source: 'internal' | 'website';
  value: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  daysInStage: number;
}

export const PipelineKanban: React.FC = () => {
  const { canViewCommercialAnalysis } = useAuth();

  const columns: { id: string; title: string; count: number; items: KanbanItem[] }[] = [
    {
      id: 'inquiry',
      title: 'Inquiry Masuk',
      count: 2,
      items: [
        {
          id: '1',
          number: 'INQ/2026/10/0005',
          title: 'Panel PLC Mitsubishi FX5U untuk Water Treatment',
          customer: 'PT Krakatau Steel Tbk',
          source: 'website',
          value: 'Rp 140.000.000',
          priority: 'high',
          daysInStage: 1,
        },
        {
          id: '2',
          number: 'INQ/2026/10/0006',
          title: 'Sensor Ultrasonic & Flowmeter Endress+Hauser',
          customer: 'PT Ultra Jaya Milk',
          source: 'internal',
          value: 'Rp 65.000.000',
          priority: 'medium',
          daysInStage: 2,
        },
      ],
    },
    {
      id: 'technical_analysis',
      title: 'Analisis Teknis (V1/V2)',
      count: 1,
      items: [
        {
          id: '3',
          number: 'INQ/2026/10/0001',
          title: 'Robot Palletizer & Safety Interlock Cage',
          customer: 'PT Mayora Indah Tbk',
          source: 'internal',
          value: 'Rp 785.000.000',
          priority: 'urgent',
          daysInStage: 3,
        },
      ],
    },
    {
      id: 'vendor_sourcing',
      title: 'Sourcing Vendor (V3)',
      count: 1,
      items: [
        {
          id: '4',
          number: 'INQ/2026/10/0002',
          title: 'Sensor Instrumentation & Pressure Transmitter',
          customer: 'PT Pupuk Sriwidjaja',
          source: 'website',
          value: 'Rp 95.000.000',
          priority: 'medium',
          daysInStage: 4,
        },
      ],
    },
    {
      id: 'commercial_analysis',
      title: 'Analisis Komersial (V4)',
      count: 1,
      items: [
        {
          id: '5',
          number: 'INQ/2026/10/0003',
          title: 'Retrofit Inverter VFD 75kW & Control Panel',
          customer: 'PT Semen Indonesia Group',
          source: 'internal',
          value: 'Rp 185.000.000',
          priority: 'high',
          daysInStage: 2,
        },
      ],
    },
    {
      id: 'waiting_approval',
      title: 'Menunggu Approval',
      count: 1,
      items: [
        {
          id: '6',
          number: 'INQ/2026/10/0004',
          title: 'Upgrade PLC Siemens S7-1500 & SCADA WinCC',
          customer: 'PT Indofood CBP Sukses Makmur',
          source: 'website',
          value: 'Rp 420.000.000',
          priority: 'high',
          daysInStage: 1,
        },
      ],
    },
    {
      id: 'sent_to_customer',
      title: 'Terkirim ke Customer',
      count: 2,
      items: [
        {
          id: '7',
          number: 'INQ/2026/09/0012',
          title: 'Servo Drive Delta 3-Axis & HMI DOP-100',
          customer: 'PT Kalbe Farma Tbk',
          source: 'internal',
          value: 'Rp 310.000.000',
          priority: 'medium',
          daysInStage: 5,
        },
      ],
    },
    {
      id: 'won',
      title: 'Won (Deal PO Masuk)',
      count: 1,
      items: [
        {
          id: '8',
          number: 'INQ/2026/09/0008',
          title: 'SCADA System Batching Plant Integration',
          customer: 'PT Holcim Indonesia',
          source: 'internal',
          value: 'Rp 560.000.000',
          priority: 'high',
          daysInStage: 12,
        },
      ],
    },
  ];

  const priorityBadge = (p: KanbanItem['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Urgent</span>;
      case 'high':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">High</span>;
      case 'medium':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-medium px-1.5 py-0.5 rounded">Medium</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pipeline Kanban Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualisasi alur lengkap proses penjualan: V1/V2 (Teknis) → V3 (Vendor) → V4 (Komersial) → Approval → Kirim → Won.
          </p>
        </div>

        <Link
          to="/inquiries/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Inquiry Baru
        </Link>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {columns.map((col) => (
          <div 
            key={col.id} 
            className="w-72 shrink-0 bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col max-h-[calc(100vh-220px)]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-2">
              <span className="text-xs font-bold text-slate-700">{col.title}</span>
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                {col.count}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {col.items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-700">
                      {item.number}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.source === 'website' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1 rounded">
                          Web
                        </span>
                      )}
                      {priorityBadge(item.priority)}
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.customer}</span>
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {item.value}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.daysInStage} hari
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
