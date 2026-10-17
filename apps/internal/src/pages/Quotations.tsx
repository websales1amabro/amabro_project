import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  Eye, 
  Lock,
  Building,
  Calendar,
  CreditCard,
  Edit,
  Check,
  X,
  ShieldCheck,
  Percent,
  Download,
  AlertCircle,
  Send,
  Handshake,
  TrendingDown,
  AlertTriangle,
  Award,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quotationService, DEFAULT_AUTOMATION_TERMS } from '../services/quotationService';
import { approvalService } from '../services/approvalService';
import { terbilang } from '../utils/terbilang';
import type { Quotation, QuotationItem, InternalQuotation } from '../types/database';

export const Quotations: React.FC = () => {
  const { role, profile, canViewCommercialAnalysis, canApproveQuotation } = useAuth();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [internalItems, setInternalItems] = useState<InternalQuotation[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'customer' | 'internal'
  const [viewMode, setViewMode] = useState<'customer' | 'internal'>('customer');

  // Terms Edit Modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [editTerms, setEditTerms] = useState({
    payment_terms: '',
    delivery_terms: '',
    warranty_terms: '',
    general_terms: '',
    validity_days: 14,
  });

  // Negotiation Modal (F9)
  const [showNegoModal, setShowNegoModal] = useState(false);
  const [negoForm, setNegoForm] = useState({
    counterOfferPrice: 0,
    decision: 'won' as 'won' | 'lost' | 'negotiation',
    lostReason: '',
    notes: '',
  });

  // Sales Price Adjustment Modal
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedItemForPrice, setSelectedItemForPrice] = useState<QuotationItem | null>(null);
  const [newUnitPriceInput, setNewUnitPriceInput] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await quotationService.getQuotations();
      setQuotations(list);
      if (list.length > 0) {
        const detail = await quotationService.getQuotationById(list[0].id);
        if (detail) {
          setSelectedQuotation(detail.quotation);
          setQuotationItems(detail.items);
          setEditTerms({
            payment_terms: detail.quotation.payment_terms || DEFAULT_AUTOMATION_TERMS.payment_terms,
            delivery_terms: detail.quotation.delivery_terms || DEFAULT_AUTOMATION_TERMS.delivery_terms,
            warranty_terms: detail.quotation.warranty_terms || DEFAULT_AUTOMATION_TERMS.warranty_terms,
            general_terms: detail.quotation.general_terms || DEFAULT_AUTOMATION_TERMS.general_terms,
            validity_days: detail.quotation.validity_days || 14,
          });

          if (canViewCommercialAnalysis) {
            const secretItems = await quotationService.getInternalItems(detail.quotation.inquiry_id, role);
            setInternalItems(secretItems);
          }
        }
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

  const handleSelectQuotation = async (q: Quotation) => {
    const detail = await quotationService.getQuotationById(q.id);
    if (detail) {
      setSelectedQuotation(detail.quotation);
      setQuotationItems(detail.items);
      setEditTerms({
        payment_terms: detail.quotation.payment_terms || DEFAULT_AUTOMATION_TERMS.payment_terms,
        delivery_terms: detail.quotation.delivery_terms || DEFAULT_AUTOMATION_TERMS.delivery_terms,
        warranty_terms: detail.quotation.warranty_terms || DEFAULT_AUTOMATION_TERMS.warranty_terms,
        general_terms: detail.quotation.general_terms || DEFAULT_AUTOMATION_TERMS.general_terms,
        validity_days: detail.quotation.validity_days || 14,
      });

      if (canViewCommercialAnalysis) {
        const secretItems = await quotationService.getInternalItems(detail.quotation.inquiry_id, role);
        setInternalItems(secretItems);
      }
    }
  };

  const handleSaveTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;
    try {
      await quotationService.updateTerms(selectedQuotation.id, editTerms);
      setShowTermsModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan syarat ketentuan');
    }
  };

  const handleSendToCustomer = async () => {
    if (!selectedQuotation) return;

    // PRD Hard Rule
    if (selectedQuotation.status !== 'approved') {
      alert('Aturan PRD: Customer Quotation TIDAK BOLEH dikirim ke customer sebelum disetujui (Approved) oleh Owner.');
      return;
    }

    if (confirm(`Kirim quotation ${selectedQuotation.quotation_number} ke customer ${selectedQuotation.inquiry?.customer?.name}?`)) {
      try {
        await approvalService.sendToCustomer({
          quotationId: selectedQuotation.id,
          sentBy: profile?.full_name || 'Sales PIC',
        });
        alert('Quotation resmi berhasil dikirim ke customer! Status alur diperbarui menjadi "Terkirim ke Customer".');
        loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal mengirim quotation');
      }
    }
  };

  const handleProcessNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;

    try {
      const res = await approvalService.recordNegotiation({
        quotationId: selectedQuotation.id,
        counterOfferPrice: Number(negoForm.counterOfferPrice),
        minimumPrice: totalMinPrice,
        decision: negoForm.decision,
        lostReason: negoForm.lostReason,
        notes: negoForm.notes,
      });

      if (res.requiresReapproval) {
        alert('PERINGATAN: Harga counter offer customer di bawah Harga Minimum! Status penawaran direset menjadi "Menunggu Approval" untuk persetujuan override khusus Owner.');
      } else {
        alert(`Hasil negosiasi deal "${negoForm.decision.toUpperCase()}" berhasil disimpan ke sistem!`);
      }

      setShowNegoModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat negosiasi');
    }
  };

  const handleOpenPriceModal = (item: QuotationItem) => {
    setSelectedItemForPrice(item);
    setNewUnitPriceInput(item.unit_price);
    setShowPriceModal(true);
  };

  const handleSaveItemPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation || !selectedItemForPrice) return;

    try {
      const updatedTotals = await quotationService.updateItemPrice(
        selectedQuotation.id,
        selectedItemForPrice.id,
        newUnitPriceInput
      );

      setQuotationItems((prev) =>
        prev.map((it) =>
          it.id === selectedItemForPrice.id
            ? { ...it, unit_price: newUnitPriceInput, total_price: newUnitPriceInput * it.quantity }
            : it
        )
      );

      setSelectedQuotation((prev) =>
        prev
          ? {
              ...prev,
              subtotal: updatedTotals.subtotal,
              tax_amount: updatedTotals.tax_amount,
              grand_total: updatedTotals.grand_total,
            }
          : prev
      );

      setShowPriceModal(false);
      alert('Harga jual resmi berhasil diperbarui oleh Sales!');
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah harga jual');
    }
  };

  if (loading || !selectedQuotation) {
    return <div className="text-center py-16 text-slate-400 text-xs">Memuat dokumen penawaran...</div>;
  }

  const computedItemSubtotal = quotationItems.reduce((acc, it) => acc + (it.total_price || it.unit_price * it.quantity), 0);
  const subtotal = computedItemSubtotal > 0 ? computedItemSubtotal : (selectedQuotation.subtotal || 0);
  const taxAmount = (subtotal * (selectedQuotation.tax_rate || 11)) / 100;
  const grandTotal = subtotal + taxAmount;
  const grandTotalTerbilang = terbilang(grandTotal);

  // Internal totals (for Owner)
  const totalCost = internalItems.reduce((acc, it) => acc + (it.unit_cost || 0), 0);
  const totalMinPrice = internalItems.reduce((acc, it) => acc + (it.unit_minimum_price || 0), 0);
  const totalNegoRoom = Math.max(0, subtotal - totalMinPrice);
  const grossProfit = subtotal - totalCost;
  const grossMarginPct = subtotal > 0 ? ((grossProfit / subtotal) * 100).toFixed(1) : '0';

  const isApproved = selectedQuotation.status === 'approved';
  const isSent = selectedQuotation.status === 'sent';

  return (
    <div className="space-y-6">
      {/* Top action header (Hidden when printing PDF) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quotation Resmi Penjualan (F6–F9)
            </h1>
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {selectedQuotation.quotation_number} (Rev {selectedQuotation.revision})
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Dokumen Ganda Terintegrasi: Customer Quotation Resmi, Kontrol Margin, dan Kirim ke Customer.
          </p>
        </div>

        {/* Action Buttons: Kirim ke Customer & Catat Negosiasi */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowTermsModal(true)}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit Syarat
          </button>

          <button
            onClick={() => setShowNegoModal(true)}
            className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Handshake className="w-3.5 h-3.5" /> Negosiasi & Deal (Won/Lost)
          </button>

          <button
            onClick={handleSendToCustomer}
            disabled={!isApproved && !isSent}
            title={!isApproved ? 'Hanya dapat dikirim setelah disetujui (Approved) oleh Owner' : 'Kirim penawaran resmi ke customer'}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all ${
              isApproved || isSent
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> {isSent ? 'Kirim Ulang Customer' : 'Kirim ke Customer (F8)'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak PDF (A4)
          </button>
        </div>
      </div>

      {/* Switcher & Status Bar (Hidden when printing) */}
      <div className="print:hidden bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('customer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'customer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" /> Customer Quotation (Dokumen Resmi)
          </button>

          {canViewCommercialAnalysis ? (
            <button
              onClick={() => setViewMode('internal')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'internal'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Eye className="w-4 h-4" /> Internal Control Quotation (Rahasia Owner)
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" /> Internal Control Quotation (Terkunci untuk {role.toUpperCase()})
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status Penawaran:</span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${
            selectedQuotation.status === 'approved'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : selectedQuotation.status === 'sent'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : selectedQuotation.status === 'accepted'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {selectedQuotation.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Warning Notice if not approved yet */}
      {!isApproved && !isSent && (
        <div className="print:hidden bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs text-amber-800">
            <strong>Aturan PRD Bagian 6 (F8):</strong> Penawaran ini berstatus <em>{selectedQuotation.status.replace(/_/g, ' ')}</em> dan belum dapat dikirimkan ke customer sampai disetujui (Approved) oleh <strong>Owner</strong>.
          </div>
        </div>
      )}

      {/* Executive Secret Strip (Only in Internal Mode for Owner/Finance) */}
      {viewMode === 'internal' && canViewCommercialAnalysis && (
        <div className="print:hidden bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-purple-800 pb-2.5">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Analisis Kontrol Internal (V4) — Rahasia Owner
            </span>
            <span className="text-xs bg-purple-800/80 px-2 py-0.5 rounded text-purple-200">
              Quotation: {selectedQuotation.quotation_number}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div>
              <span className="text-[10px] text-purple-300 uppercase font-semibold">Total Modal Cost Vendor</span>
              <div className="text-lg font-black text-white mt-0.5">
                Rp {totalCost.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-purple-300 uppercase font-semibold">Harga Minimum (Batas Bawah)</span>
              <div className="text-lg font-black text-amber-300 mt-0.5">
                Rp {totalMinPrice.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-purple-300 uppercase font-semibold">Ruang Negosiasi Sales</span>
              <div className="text-lg font-black text-emerald-300 mt-0.5">
                Rp {totalNegoRoom.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-purple-300 uppercase font-semibold">Target Margin Kotor</span>
              <div className="text-lg font-black text-white mt-0.5">
                {grossMarginPct}% (Rp {grossProfit.toLocaleString('id-ID')})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW CANVAS (Standard A4 Page Format) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 sm:p-12 max-w-4xl mx-auto space-y-8 font-sans print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Letterhead (Kop Surat Resmi) */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-2xl shadow-sm print:border print:border-slate-800">
              ASF
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight tracking-wide">
                PT AUTOMATION SOLUSI NUSANTARA
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                Industrial Automation Systems, Robotics & Electrical Engineering
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kawasan Industri MM2100, Cikarang Barat, Bekasi 17530 | Telp: (021) 8990-1234
              </p>
              <p className="text-[11px] text-slate-500">
                Email: sales@automationsolusi.co.id | Website: www.automationsolusi.co.id
              </p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              {viewMode === 'internal' ? 'INTERNAL CONTROL QUOTATION' : 'SURAT PENAWARAN HARGA'}
            </h3>
            <p className="font-mono text-sm font-bold text-blue-700 mt-0.5">
              {selectedQuotation.quotation_number}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tanggal: <strong>{new Date(selectedQuotation.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Masa Berlaku: <strong>{selectedQuotation.validity_days} Hari Kalender</strong>
            </p>
          </div>
        </div>

        {/* Customer Destination Info */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Kepada Yth:</span>
            <p className="font-bold text-slate-900 text-sm">
              {selectedQuotation.inquiry?.customer?.name || 'Customer Terkait'}
            </p>
            <p className="text-slate-700 font-medium">
              Attn: {selectedQuotation.inquiry?.customer?.pic_name || 'Bpk/Ibu Bagian Pengadaan'}
            </p>
            <p className="text-slate-500 text-[11px]">
              {selectedQuotation.inquiry?.customer?.address || '-'}
            </p>
            <p className="text-slate-500 text-[11px]">
              Telp: {selectedQuotation.inquiry?.customer?.pic_phone || '-'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Referensi Proyek:</span>
            <div className="flex justify-between">
              <span className="text-slate-500">No. Inquiry:</span>
              <span className="font-mono font-bold text-slate-800">{selectedQuotation.inquiry?.inquiry_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Judul Pekerjaan:</span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{selectedQuotation.inquiry?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mata Uang:</span>
              <span className="font-semibold text-slate-800">IDR (Rupiah Indonesia)</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 text-center w-10">No</th>
                <th className="p-3">Deskripsi & Spesifikasi Teknis Komponen</th>
                <th className="p-3 text-center w-16">Qty</th>
                <th className="p-3 text-right">Harga Satuan (IDR)</th>
                {viewMode === 'internal' && (
                  <>
                    <th className="p-3 text-right bg-purple-50 text-purple-900">Cost Vendor</th>
                    <th className="p-3 text-right bg-purple-50 text-purple-900">Harga Min.</th>
                  </>
                )}
                <th className="p-3 text-right">Total Harga (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotationItems.map((it, idx) => {
                const secret = internalItems[idx];

                return (
                  <tr key={it.id || idx}>
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{it.item_name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{it.specifications}</p>
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                      {it.quantity} {it.unit}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-800 whitespace-nowrap font-mono">
                      <div className="flex items-center justify-end gap-2">
                        <span>Rp {it.unit_price.toLocaleString('id-ID')}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenPriceModal(it)}
                          className="print:hidden inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                          title="Sales berhak mengedit harga jual resmi (harga purchasing hanya rekomendasi)"
                        >
                          <Edit className="w-3 h-3" /> Edit Harga
                        </button>
                      </div>
                    </td>
                    {viewMode === 'internal' && (
                      <>
                        <td className="p-3 text-right bg-purple-50/50 text-purple-900 font-mono whitespace-nowrap">
                          {secret ? `Rp ${secret.unit_cost.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="p-3 text-right bg-purple-50/50 text-amber-800 font-mono font-bold whitespace-nowrap">
                          {secret ? `Rp ${secret.unit_minimum_price.toLocaleString('id-ID')}` : '-'}
                        </td>
                      </>
                    )}
                    <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap font-mono">
                      Rp {(it.total_price || it.unit_price * it.quantity).toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Terbilang */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Terbilang Jumlah Resmi:
              </span>
              <p className="font-semibold text-blue-950 italic text-xs leading-relaxed">
                "{grandTotalTerbilang}"
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2 text-xs border border-slate-200 p-4 rounded-lg bg-slate-50/50">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Penawaran:</span>
                <span className="font-bold text-slate-900 font-mono">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PPN {selectedQuotation.tax_rate}%:</span>
                <span className="font-bold text-slate-900 font-mono">
                  Rp {taxAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Grand Total Resmi:</span>
                <span className="text-blue-700 font-black font-mono">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Section */}
        <div className="pt-4 border-t border-slate-200 text-xs space-y-2 text-slate-700">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
            Syarat & Ketentuan Penawaran:
          </h4>
          <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
            <li><strong>Pengiriman:</strong> {selectedQuotation.delivery_terms || DEFAULT_AUTOMATION_TERMS.delivery_terms}</li>
            <li><strong>Pembayaran:</strong> {selectedQuotation.payment_terms || DEFAULT_AUTOMATION_TERMS.payment_terms}</li>
            <li><strong>Masa Garansi:</strong> {selectedQuotation.warranty_terms || DEFAULT_AUTOMATION_TERMS.warranty_terms}</li>
            <li><strong>Ketentuan Umum:</strong> {selectedQuotation.general_terms || DEFAULT_AUTOMATION_TERMS.general_terms}</li>
          </ol>
        </div>

        {/* Signatures Block */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="space-y-16">
            <div>
              <p className="font-semibold text-slate-600">Dibuat & Diajukan Oleh:</p>
              <p className="text-slate-400 text-[11px]">PT Automation Solusi Nusantara</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">Rian Pratama, S.T.</p>
              <p className="text-[11px] text-slate-500">Industrial Sales & Automation Engineer</p>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p className="font-semibold text-slate-600">Disetujui Oleh (Owner):</p>
              <p className="text-slate-400 text-[11px]">Operational Director</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">Budi Santoso, M.T.</p>
              <p className="text-[11px] text-slate-500">Direktur / Managing Partner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Terms & Conditions */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Syarat & Ketentuan Penawaran
              </h3>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTerms} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Masa Berlaku (Hari)</label>
                <input
                  type="number"
                  min={1}
                  value={editTerms.validity_days}
                  onChange={(e) => setEditTerms({ ...editTerms, validity_days: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Syarat Pengiriman</label>
                <textarea
                  rows={2}
                  value={editTerms.delivery_terms}
                  onChange={(e) => setEditTerms({ ...editTerms, delivery_terms: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Termin Pembayaran</label>
                <textarea
                  rows={2}
                  value={editTerms.payment_terms}
                  onChange={(e) => setEditTerms({ ...editTerms, payment_terms: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Masa Garansi</label>
                <textarea
                  rows={2}
                  value={editTerms.warranty_terms}
                  onChange={(e) => setEditTerms({ ...editTerms, warranty_terms: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ketentuan Umum</label>
                <textarea
                  rows={2}
                  value={editTerms.general_terms}
                  onChange={(e) => setEditTerms({ ...editTerms, general_terms: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Negosiasi & Deal Won/Lost (F9) */}
      {showNegoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Handshake className="w-5 h-5 text-purple-600" /> Catat Negosiasi & Hasil Deal (F9)
              </h3>
              <button onClick={() => setShowNegoModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessNegotiation} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga Penawaran Awal:</span>
                  <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga Minimum (Batas Bawah):</span>
                  <span className="font-bold text-amber-700">Rp {totalMinPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Harga Tawar Customer (Counter-Offer IDR)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="Masukkan nominal tawaran customer..."
                  value={negoForm.counterOfferPrice}
                  onChange={(e) => setNegoForm({ ...negoForm, counterOfferPrice: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-semibold"
                />
              </div>

              {/* Warning if below minimum price */}
              {negoForm.counterOfferPrice > 0 && negoForm.counterOfferPrice < totalMinPrice && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Peringatan Batas Bawah:</strong> Harga tawar customer (Rp {negoForm.counterOfferPrice.toLocaleString('id-ID')}) berada <strong>DI BAWAH</strong> harga minimum (Rp {totalMinPrice.toLocaleString('id-ID')}). Jika deal ini disetujui, sistem akan otomatis mereset penawaran ke status <strong>Menunggu Approval Owner</strong> untuk otorisasi khusus.
                  </span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keputusan Akhir Deal</label>
                <select
                  value={negoForm.decision}
                  onChange={(e) => setNegoForm({ ...negoForm, decision: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="won">🎉 Deal Won (Customer Setuju / PO Segera Masuk)</option>
                  <option value="lost">❌ Deal Lost (Customer Menolak / Batal)</option>
                  <option value="negotiation">🔄 Masih Proses Negosiasi Berjalan</option>
                </select>
              </div>

              {negoForm.decision === 'lost' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alasan Kalah / Batal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kalah harga dengan distributor lain, proyek ditunda..."
                    value={negoForm.lostReason}
                    onChange={(e) => setNegoForm({ ...negoForm, lostReason: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan Negosiasi</label>
                <textarea
                  rows={2}
                  placeholder="Catatan negosiasi termin, garansi tambahan, dsb."
                  value={negoForm.notes}
                  onChange={(e) => setNegoForm({ ...negoForm, notes: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNegoModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white"
                >
                  Simpan Hasil Negosiasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Harga Jual oleh Sales */}
      {showPriceModal && selectedItemForPrice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" /> Edit Harga Jual Penawaran
              </h3>
              <button
                onClick={() => setShowPriceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                💡 Wewenang Fleksibilitas Sales:
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Harga modal dan kalkulasi dari purchasing hanyalah <strong>sebatas saran / rekomendasi dasar</strong>. Tim Sales berhak penuh menentukan dan mengubah harga jual akhir yang diajukan ke customer.
              </p>
            </div>

            <form onSubmit={handleSaveItemPrice} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Komponen / Barang:</span>
                <p className="font-bold text-slate-900 text-xs">{selectedItemForPrice.item_name}</p>
                <p className="text-[11px] text-slate-500">Jumlah: {selectedItemForPrice.quantity} {selectedItemForPrice.unit}</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Harga Jual Satuan Baru (IDR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={newUnitPriceInput}
                    onChange={(e) => setNewUnitPriceInput(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Masukkan harga satuan baru"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600">Total Harga Item (Qty × Satuan):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Rp {(newUnitPriceInput * selectedItemForPrice.quantity).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Harga Jual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
