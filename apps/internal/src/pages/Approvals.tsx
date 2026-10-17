import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  Building, 
  DollarSign, 
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  Clock,
  History,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { approvalService } from '../services/approvalService';
import { quotationService } from '../services/quotationService';
import { commercialAnalysisService } from '../services/commercialAnalysisService';
import { inquiryService } from '../services/inquiryService';
import type { Quotation, Approval, ApprovalDecision } from '../types/database';

interface ApprovalCardItem {
  quotation: Quotation;
  totalCost: number;
  minimumPrice: number;
  negoRoom: number;
  marginPct: number;
}

export const Approvals: React.FC = () => {
  const { role, profile, canApproveQuotation } = useAuth();
  const [pendingItems, setPendingItems] = useState<ApprovalCardItem[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<ApprovalCardItem | null>(null);
  const [actionType, setActionType] = useState<ApprovalDecision | null>(null);
  const [comment, setComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Auto-ensure quotation exists for inquiries in waiting_approval
      try {
        const allInquiries = await inquiryService.getInquiries();
        const waitingInqs = allInquiries.filter((i) => i.status === 'waiting_approval');
        for (const inq of waitingInqs) {
          const inqItems = await inquiryService.getInquiryItems(inq.id);
          const comm = await commercialAnalysisService.getAnalysis(inq.id, 'owner');
          await quotationService.ensureQuotationForInquiry(inq, inqItems, comm);
        }
      } catch (inqErr) {
        console.warn('Error syncing waiting_approval inquiries:', inqErr);
      }

      const allQuotes = await quotationService.getQuotations();
      const waiting = allQuotes.filter((q) => q.status === 'waiting_approval');

      // Fetch commercial secret data for each pending quotation
      const cardItems: ApprovalCardItem[] = [];
      for (const q of waiting) {
        const comm = await commercialAnalysisService.getAnalysis(q.inquiry_id, role);
        cardItems.push({
          quotation: q,
          totalCost: comm?.total_cost || 170000000,
          minimumPrice: comm?.minimum_price || 189000000,
          negoRoom: comm?.negotiation_room || 71000000,
          marginPct: comm?.target_margin_pct || 30,
        });
      }
      setPendingItems(cardItems);

      // Load approval history
      if (allQuotes.length > 0) {
        const hist = await approvalService.getApprovalHistory(allQuotes[0].id);
        setApprovalHistory(hist);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleDecision = async () => {
    if (!actionType || !selectedItem) return;

    if (actionType === 'revision_requested' && !comment.trim()) {
      alert('Komentar wajib diisi jika meminta revisi penawaran.');
      return;
    }

    try {
      await approvalService.executeApproval({
        quotationId: selectedItem.quotation.id,
        decision: actionType,
        comment,
        approverId: profile?.id || '11111111-1111-1111-1111-111111111111',
        approverName: profile?.full_name || 'Budi Santoso (Owner)',
        role,
      });

      alert(`Keputusan "${actionType.toUpperCase()}" berhasil diproses. Jejak audit dan status pipeline telah diperbarui.`);
      setSelectedItem(null);
      setActionType(null);
      setComment('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses approval');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Owner Approval Center (F7)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pusat tinjauan persetujuan penawaran harga, kontrol margin komersial, dan batas ruang negosiasi oleh Owner.
          </p>
        </div>

        {!canApproveQuotation && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Mode Baca (Peran aktif: <strong>{role.toUpperCase()}</strong>. Hanya Owner yang dapat mengeksekusi Approval)
          </div>
        )}
      </div>

      {/* Pending List Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Daftar Penawaran Menunggu Persetujuan ({pendingItems.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Memuat data approval...</div>
        ) : pendingItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingItems.map((item) => (
              <div 
                key={item.quotation.id} 
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                      {item.quotation.quotation_number} (Rev {item.quotation.revision})
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Ref Inquiry: <strong>{item.quotation.inquiry?.inquiry_number}</strong>
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Diajukan: {new Date(item.quotation.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Customer & PIC</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {item.quotation.inquiry?.customer?.name || 'Customer'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.quotation.inquiry?.customer?.pic_name} ({item.quotation.inquiry?.customer?.pic_phone})
                    </p>
                  </div>

                  {/* Secret numbers (Only visible to Owner/Finance) */}
                  {canApproveQuotation || role === 'finance' ? (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Modal Cost Vendor</span>
                        <p className="font-bold text-slate-700 text-sm mt-0.5 font-mono">
                          Rp {item.totalCost.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Target Margin: {item.marginPct}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Harga Minimum (Floor)</span>
                        <p className="font-bold text-amber-700 text-sm mt-0.5 font-mono">
                          Rp {item.minimumPrice.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[10px] text-amber-600 font-medium">Batas bawah negosiasi</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Harga Jual Resmi Customer</span>
                        <p className="font-bold text-blue-700 text-sm mt-0.5 font-mono">
                          Rp {item.quotation.subtotal.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[11px] text-purple-700 font-semibold">
                          Ruang Nego: Rp {item.negoRoom.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      Detail cost, margin, dan harga minimum dienkapsulasi oleh RLS (hanya dapat dilihat oleh Owner).
                    </div>
                  )}
                </div>

                {/* Owner Action Buttons */}
                {canApproveQuotation && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('revision_requested');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Minta Revisi
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('rejected');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak (Reject)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('approved');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Setujui (Approve)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Tidak Ada Penawaran Menunggu Persetujuan</h3>
            <p className="text-xs text-slate-500">Seluruh quotation telah disetujui atau diproses oleh Owner.</p>
          </div>
        )}
      </div>

      {/* Approval Audit Trail History Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" /> Riwayat Keputusan & Jejak Audit Persetujuan
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Waktu Keputusan</th>
                <th className="p-3">Approver (Owner)</th>
                <th className="p-3 text-center">Keputusan</th>
                <th className="p-3">Catatan / Komentar Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvalHistory.map((app) => (
                <tr key={app.id}>
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    {new Date(app.decided_at).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">
                    {app.approver?.full_name || 'Budi Santoso (Owner)'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      app.decision === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.decision === 'revision_requested'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {app.decision.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-md">
                    {app.comment || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {actionType && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Konfirmasi Keputusan Owner
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan mengeksekusi status <strong>{actionType.toUpperCase().replace(/_/g, ' ')}</strong> untuk{' '}
              <strong className="text-blue-600">{selectedItem.quotation.quotation_number}</strong> ({selectedItem.quotation.inquiry?.customer?.name}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Komentar / Instruksi Owner {actionType === 'revision_requested' && <span className="text-red-500">* (Wajib diisi)</span>}
              </label>
              <textarea
                rows={3}
                required={actionType === 'revision_requested'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis alasan, instruksi penyesuaian margin, atau persetujuan pengiriman..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  setActionType(null);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleDecision}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs ${
                  actionType === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'revision_requested'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Eksekusi Keputusan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
