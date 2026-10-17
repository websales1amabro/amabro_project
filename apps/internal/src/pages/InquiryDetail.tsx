import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  CheckCircle, 
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
  Calculator,
  Lock,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inquiryService } from '../services/inquiryService';
import { vendorService } from '../services/vendorService';
import { vendorQuoteService } from '../services/vendorQuoteService';
import { commercialAnalysisService } from '../services/commercialAnalysisService';
import { quotationService } from '../services/quotationService';
import { generateWhatsAppRFQ, generateEmailRFQ } from '../utils/rfqGenerator';
import type { 
  Inquiry, 
  InquiryItem, 
  Vendor, 
  VendorQuote, 
  CommercialAnalysis, 
  RiskLevel,
  InquiryStatus 
} from '../types/database';

export const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, canEditTechnicalAnalysis, canManageVendors, canViewCommercialAnalysis, canApproveQuotation } = useAuth();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorQuotes, setVendorQuotes] = useState<VendorQuote[]>([]);
  const [commercialData, setCommercialData] = useState<CommercialAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'technical_v1_v2' | 'vendor_sourcing_v3' | 'commercial_v4'
  const [activeTab, setActiveTab] = useState<'technical_v1_v2' | 'vendor_sourcing_v3' | 'commercial_v4'>('technical_v1_v2');

  // Modal Add BOM Item
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: '',
    specifications: '',
    brand: '',
    quantity: 1,
    unit: 'Unit',
    is_feasible: true,
    technical_notes: '',
  });

  // Modal Add Vendor Quote
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedItemIdForQuote, setSelectedItemIdForQuote] = useState<string>('');
  const [quoteFormData, setQuoteFormData] = useState({
    vendor_id: '',
    unit_price: 0,
    currency: 'IDR',
    exchange_rate: 1,
    lead_time_days: 7,
    warranty_period: '12 Bulan',
    validity_date: '',
    payment_terms: 'Tempo 30 Hari',
    quote_reference: '',
    notes: '',
  });

  // RFQ Share Modal
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [rfqTargetVendor, setRfqTargetVendor] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'wa' | 'email' | null>(null);

  // Commercial Analysis Calculator State
  const [calcForm, setCalcForm] = useState({
    total_vendor_cost: 0,
    shipping_cost: 0,
    customs_duty_cost: 0,
    other_direct_cost: 0,
    target_margin_pct: 25,
    risk_buffer_pct: 5,
    risk_level: 'low' as RiskLevel,
    risk_notes: '',
  });

  const loadAllData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [inq, boms, vList, quotes, comm] = await Promise.all([
        inquiryService.getInquiryById(id),
        inquiryService.getInquiryItems(id),
        vendorService.getVendors(),
        vendorQuoteService.getQuotesByInquiry(id),
        commercialAnalysisService.getAnalysis(id, role),
      ]);
      setInquiry(inq);
      setItems(boms);
      setVendors(vList);
      setVendorQuotes(quotes);
      setCommercialData(comm);

      // Auto compute total vendor cost from selected quotes
      let calculatedVendorCost = 0;
      boms.forEach((it) => {
        const selectedQuote = quotes.find((q) => q.item_id === it.id && q.is_selected);
        if (selectedQuote) {
          calculatedVendorCost += selectedQuote.unit_price_idr * it.quantity;
        }
      });

      if (comm) {
        setCalcForm({
          total_vendor_cost: comm.total_vendor_cost || calculatedVendorCost,
          shipping_cost: comm.shipping_cost,
          customs_duty_cost: comm.customs_duty_cost,
          other_direct_cost: comm.other_direct_cost,
          target_margin_pct: comm.target_margin_pct,
          risk_buffer_pct: comm.risk_buffer_pct,
          risk_level: comm.risk_level,
          risk_notes: comm.risk_notes || '',
        });
      } else {
        setCalcForm((prev) => ({
          ...prev,
          total_vendor_cost: calculatedVendorCost,
        }));
      }

      if (vList.length > 0) {
        setRfqTargetVendor(vList[0].name);
        setQuoteFormData((prev) => ({ ...prev, vendor_id: vList[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id, role]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || !newItem.item_name.trim()) return;

    try {
      await inquiryService.addInquiryItem({
        inquiry_id: inquiry.id,
        item_no: items.length + 1,
        item_name: newItem.item_name,
        specifications: newItem.specifications,
        brand: newItem.brand,
        quantity: newItem.quantity,
        unit: newItem.unit,
        is_feasible: newItem.is_feasible,
        technical_notes: newItem.technical_notes,
      });
      setShowItemModal(false);
      setNewItem({
        item_name: '',
        specifications: '',
        brand: '',
        quantity: 1,
        unit: 'Unit',
        is_feasible: true,
        technical_notes: '',
      });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan item BOM');
    }
  };

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const handleOpenQuoteModal = (itemId: string) => {
    setEditingQuoteId(null);
    setSelectedItemIdForQuote(itemId);
    setQuoteFormData({
      vendor_id: vendors.length > 0 ? vendors[0].id : '',
      unit_price: 0,
      currency: 'IDR',
      exchange_rate: 1,
      lead_time_days: 7,
      warranty_period: '12 Bulan',
      validity_date: '',
      payment_terms: 'Tempo 30 Hari',
      quote_reference: '',
      notes: '',
    });
    setShowQuoteModal(true);
  };

  const handleOpenEditQuoteModal = (quote: VendorQuote) => {
    setEditingQuoteId(quote.id);
    setSelectedItemIdForQuote(quote.item_id);
    setQuoteFormData({
      vendor_id: quote.vendor_id,
      unit_price: quote.unit_price,
      currency: quote.currency || 'IDR',
      exchange_rate: quote.exchange_rate || 1,
      lead_time_days: quote.lead_time_days || 7,
      warranty_period: quote.warranty_period || '12 Bulan',
      validity_date: quote.validity_date || '',
      payment_terms: quote.payment_terms || 'Tempo 30 Hari',
      quote_reference: quote.quote_reference || '',
      notes: quote.notes || '',
    });
    setShowQuoteModal(true);
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || !selectedItemIdForQuote || !quoteFormData.vendor_id) {
      alert('Pilih vendor dan masukkan harga.');
      return;
    }

    const selectedVendor = vendors.find((v) => v.id === quoteFormData.vendor_id);

    try {
      if (editingQuoteId) {
        await vendorQuoteService.updateVendorQuote(editingQuoteId, {
          unit_price: Number(quoteFormData.unit_price),
          currency: quoteFormData.currency,
          exchange_rate: Number(quoteFormData.exchange_rate) || 1,
          lead_time_days: Number(quoteFormData.lead_time_days) || undefined,
          warranty_period: quoteFormData.warranty_period,
          validity_date: quoteFormData.validity_date || undefined,
          payment_terms: quoteFormData.payment_terms,
          quote_reference: quoteFormData.quote_reference,
          notes: quoteFormData.notes,
        });
        setShowQuoteModal(false);
        setEditingQuoteId(null);
        loadAllData();
        return;
      }

      await vendorQuoteService.addVendorQuote({
        inquiry_id: inquiry.id,
        item_id: selectedItemIdForQuote,
        vendor_id: quoteFormData.vendor_id,
        vendor_name: selectedVendor?.name,
        unit_price: Number(quoteFormData.unit_price),
        currency: quoteFormData.currency,
        exchange_rate: Number(quoteFormData.exchange_rate) || 1,
        lead_time_days: Number(quoteFormData.lead_time_days) || undefined,
        warranty_period: quoteFormData.warranty_period,
        validity_date: quoteFormData.validity_date || undefined,
        payment_terms: quoteFormData.payment_terms,
        quote_reference: quoteFormData.quote_reference,
        notes: quoteFormData.notes,
      });
      setShowQuoteModal(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan penawaran vendor');
    }
  };

  const handleSelectQuote = async (itemId: string, quoteId: string) => {
    await vendorQuoteService.selectVendorQuote(itemId, quoteId);
    loadAllData();
  };

  const handleSaveCommercialAnalysis = async () => {
    if (!inquiry) return;
    try {
      const saved = await commercialAnalysisService.calculateAndSave(
        inquiry.id,
        calcForm,
        role
      );
      setCommercialData(saved);
      // Auto transition to commercial_analysis if in previous stage
      if (inquiry.status === 'inquiry' || inquiry.status === 'technical_analysis' || inquiry.status === 'vendor_sourcing') {
        await inquiryService.updateInquiryStatus(inquiry.id, 'commercial_analysis');
      }
      alert('Analisis Komersial (V4) berhasil disimpan! Harga minimum dan ruang negosiasi telah diperbarui.');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan analisis komersial');
    }
  };

  const handleCopy = (text: string, type: 'wa' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleStatusTransition = async (nextStatus: InquiryStatus, label: string) => {
    if (!inquiry) return;
    if (confirm(`Pindahkan status inquiry ke "${label}"?`)) {
      await inquiryService.updateInquiryStatus(inquiry.id, nextStatus);
      if (nextStatus === 'waiting_approval') {
        try {
          await quotationService.ensureQuotationForInquiry(inquiry, items, commercialData);
        } catch (e) {
          console.warn('Auto create quotation failed:', e);
        }
      }
      loadAllData();
    }
  };

  // Live calculation preview
  const liveTotalCost = 
    Number(calcForm.total_vendor_cost) + 
    Number(calcForm.shipping_cost) + 
    Number(calcForm.customs_duty_cost) + 
    Number(calcForm.other_direct_cost);

  const liveRiskAmount = liveTotalCost * (Number(calcForm.risk_buffer_pct) / 100);
  const liveMinPrice = liveTotalCost + liveRiskAmount;
  const liveMultiplier = 1 + Number(calcForm.target_margin_pct) / 100;
  const liveSellingPrice = Math.ceil((liveTotalCost * liveMultiplier + liveRiskAmount) / 100000) * 100000;
  const liveNegoRoom = Math.max(0, liveSellingPrice - liveMinPrice);
  const liveProfit = liveSellingPrice - liveTotalCost;
  const liveMarginPct = liveSellingPrice > 0 ? ((liveProfit / liveSellingPrice) * 100).toFixed(1) : '0';

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Memuat detail inquiry...</div>;
  }

  if (!inquiry) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm">Inquiry tidak ditemukan.</p>
        <button onClick={() => navigate('/inquiries')} className="text-blue-600 text-xs font-semibold">
          Kembali ke Daftar Inquiry
        </button>
      </div>
    );
  }

  const selectedVendorTarget = vendors.find((v) => v.name === rfqTargetVendor) || vendors[0];
  const waText = selectedVendorTarget ? generateWhatsAppRFQ(inquiry, items, selectedVendorTarget.name) : '';
  const emailText = selectedVendorTarget ? generateEmailRFQ(inquiry, items, selectedVendorTarget.name) : '';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/inquiries"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {inquiry.title}
            </h1>
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {inquiry.inquiry_number}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRfqModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs cursor-pointer transition-all"
            title="Salin template RFQ WhatsApp / Email ke supplier"
          >
            <Share2 className="w-3.5 h-3.5" /> Minta Penawaran (RFQ)
          </button>

          {inquiry.status === 'inquiry' && (
            <button
              onClick={() => handleStatusTransition('technical_analysis', 'Analisis Teknis (V1/V2)')}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs cursor-pointer"
            >
              Mulai Analisis Teknis (V1/V2) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {inquiry.status === 'technical_analysis' && (
            <button
              onClick={() => handleStatusTransition('vendor_sourcing', 'Sourcing Vendor (V3)')}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs cursor-pointer"
            >
              Lanjut ke Sourcing Vendor (V3) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {inquiry.status === 'vendor_sourcing' && (
            <button
              onClick={() => {
                setActiveTab('commercial_v4');
                handleStatusTransition('commercial_analysis', 'Analisis Komersial (V4)');
              }}
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs cursor-pointer"
            >
              Lanjut ke Analisis Komersial (V4) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {inquiry.status === 'commercial_analysis' && (
            <button
              onClick={() => handleStatusTransition('waiting_approval', 'Menunggu Approval Owner')}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs cursor-pointer"
            >
              Ajukan Approval ke Owner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {inquiry.status === 'waiting_approval' && (
            <Link
              to="/approvals"
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Buka Owner Approval Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Customer & PIC</span>
          <p className="font-bold text-slate-900 text-xs">
            {inquiry.customer?.name || inquiry.contact_name || 'Customer Terkait'}
          </p>
          <p className="text-[11px] text-slate-500">
            {inquiry.contact_phone || inquiry.contact_email || 'Tidak ada kontak tambahan'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Status Alur Penjualan</span>
          <div className="mt-0.5">
            <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
              {inquiry.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Prioritas: <strong className="capitalize">{inquiry.priority}</strong></p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Target Deadline & Estimasi Nilai</span>
          <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {inquiry.deadline || 'Belum ditentukan'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            Estimasi: Rp {inquiry.estimated_value.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tabs: V1/V2 vs V3 vs V4 */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('technical_v1_v2')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'technical_v1_v2'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Tahap V1 & V2: Teknis & BOM ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('vendor_sourcing_v3')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'vendor_sourcing_v3'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Tahap V3: Vendor RFQ ({vendorQuotes.length} Penawaran)
        </button>

        <button
          onClick={() => setActiveTab('commercial_v4')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'commercial_v4'
              ? 'border-violet-600 text-violet-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" /> Tahap V4: Analisis Komersial & Margin (Rahasia)
          {!canViewCommercialAnalysis && <Lock className="w-3 h-3 text-amber-500" />}
        </button>
      </div>

      {/* TAB 1: TECHNICAL ANALYSIS V1/V2 */}
      {activeTab === 'technical_v1_v2' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-blue-600" /> Checklist Analisis Kelayakan Teknis (V2)
              </span>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                Lead Engineer Approved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold">1. Lingkungan & Proteksi</span>
                <p className="font-semibold text-slate-800">Panel IP54 / Outdoor IP65</p>
                <p className="text-[11px] text-slate-500">Suhu operasi maks. 45°C dengan exhaust fan</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold">2. Kompatibilitas Sistem</span>
                <p className="font-semibold text-slate-800">Profinet & Modbus TCP/IP</p>
                <p className="text-[11px] text-slate-500">Integrasi mulus ke DCS eksisting pabrik</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold">3. Kebutuhan Daya & Safety</span>
                <p className="font-semibold text-slate-800">3-Phase 380V / 24VDC Control</p>
                <p className="text-[11px] text-slate-500">Dilengkapi Safety Relay & Emergency Stop</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Daftar Item & Analisis Teknis (BOM)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar komponen yang dibutuhkan sebelum diajukan permintaan harga (RFQ) ke vendor supplier.
                </p>
              </div>

              {canEditTechnicalAnalysis && (
                <button
                  onClick={() => setShowItemModal(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Item BOM
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-5 py-3 w-10 text-center">No</th>
                    <th className="px-5 py-3">Nama Item & Spesifikasi</th>
                    <th className="px-5 py-3">Merek Ref.</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3">Kelayakan Teknis</th>
                    <th className="px-5 py-3">Status Sourcing V3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => {
                    const quotesForItem = vendorQuotes.filter((q) => q.item_id === it.id);
                    const hasSelected = quotesForItem.some((q) => q.is_selected);

                    return (
                      <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{it.item_name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{it.specifications || '-'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded">
                            {it.brand || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-900">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="px-5 py-4">
                          {it.is_feasible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Layak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              <AlertCircle className="w-3 h-3" /> Tidak Layak
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {hasSelected ? (
                            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Vendor Terpilih
                            </span>
                          ) : quotesForItem.length > 0 ? (
                            <span className="text-[11px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded">
                              {quotesForItem.length} Penawaran Masuk
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Belum ada penawaran
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR SOURCING V3 */}
      {activeTab === 'vendor_sourcing_v3' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 leading-relaxed">
              <strong className="font-semibold">Tahap Sourcing Vendor (V3):</strong> Catat penawaran harga dari berbagai supplier per item BOM. Tandai vendor terpilih sebagai acuan modal cost yang akan masuk ke <strong>Analisis Komersial (V4)</strong>.
            </div>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">Belum ada item barang pada inquiry ini</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Penawaran vendor (harga modal, lead time, dan garansi) dicatat spesifik per-item barang. Silakan tambahkan item barang terlebih dahulu di Tahap V1 & V2.
              </p>
              <button
                onClick={() => setActiveTab('technical_v1_v2')}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                Buka Tab V1 & V2: Tambah Item Barang
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((it, idx) => {
                const quotesForItem = vendorQuotes.filter((q) => q.item_id === it.id);

                return (
                  <div key={it.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{it.item_name}</h4>
                        <span className="text-xs font-semibold text-slate-500">
                          ({it.quantity} {it.unit})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 ml-7 mt-0.5">{it.specifications}</p>
                    </div>

                    {canManageVendors && (
                      <button
                        onClick={() => handleOpenQuoteModal(it.id)}
                        className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" /> Input Penawaran Vendor
                      </button>
                    )}
                  </div>

                  {quotesForItem.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold">
                          <tr>
                            <th className="p-3">Nama Vendor / Distributor</th>
                            <th className="p-3 text-right">Harga Satuan (IDR)</th>
                            <th className="p-3 text-right">Total Modal Item</th>
                            <th className="p-3 text-center">Lead Time</th>
                            <th className="p-3">Garansi</th>
                            <th className="p-3">Termin</th>
                            <th className="p-3 text-center">Pilihan Final</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {quotesForItem.map((q) => {
                            const totalItemCost = q.unit_price_idr * it.quantity;

                            return (
                              <tr 
                                key={q.id} 
                                className={`transition-colors ${
                                  q.is_selected ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="p-3">
                                  <p className="font-bold text-slate-900">
                                    {q.vendor?.name || 'Vendor'}
                                  </p>
                                  {q.quote_reference && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Ref: {q.quote_reference}
                                    </span>
                                  )}
                                </td>

                                <td className="p-3 text-right font-mono font-semibold text-slate-900">
                                  Rp {q.unit_price_idr.toLocaleString('id-ID')}
                                  {q.currency !== 'IDR' && (
                                    <span className="text-[10px] text-slate-400 block font-normal">
                                      ({q.currency} {q.unit_price.toLocaleString()} @ kurs {q.exchange_rate})
                                    </span>
                                  )}
                                </td>

                                <td className="p-3 text-right font-mono font-bold text-purple-900">
                                  Rp {totalItemCost.toLocaleString('id-ID')}
                                </td>

                                <td className="p-3 text-center text-slate-600">
                                  {q.lead_time_days ? `${q.lead_time_days} Hari` : 'Ready'}
                                </td>

                                <td className="p-3 text-slate-600">
                                  {q.warranty_period || '-'}
                                </td>

                                <td className="p-3 text-slate-600">
                                  {q.payment_terms || '-'}
                                </td>

                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    {q.is_selected ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                                        <CheckCircle className="w-3.5 h-3.5" /> Terpilih
                                      </span>
                                    ) : canManageVendors ? (
                                      <button
                                        onClick={() => handleSelectQuote(it.id, q.id)}
                                        className="text-xs text-slate-600 hover:text-emerald-700 font-semibold bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
                                      >
                                        Pilih Ini
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 text-xs">-</span>
                                    )}

                                    {canManageVendors && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditQuoteModal(q)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded border border-purple-200 transition-colors cursor-pointer shadow-2xs"
                                        title="Edit & Perbarui Harga Satuan atau Kondisi Terakhir Penawaran Vendor Ini"
                                      >
                                        <Edit className="w-3 h-3" /> Edit Harga
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-xs border border-dashed rounded-lg">
                      Belum ada penawaran harga vendor untuk item ini. Klik "Input Penawaran Vendor" untuk menambahkan.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* TAB 3: COMMERCIAL ANALYSIS V4 (RAHASIA OWNER & FINANCE) */}
      {activeTab === 'commercial_v4' && (
        <div className="space-y-6">
          {!canViewCommercialAnalysis ? (
            /* RLS Guarded Screen for Sales & Engineer */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Akses Terproteksi oleh Row Level Security (RLS)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Peran aktif Anda adalah <strong>{role.toUpperCase()}</strong>. Sesuai aturan bisnis PRD Bagian 2 & 7A, seluruh data modal supplier (cost), persentase margin, cadangan risiko, dan harga minimum dienkapsulasi pada tabel rahasia <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">commercial_analysis</code> dan hanya dapat diakses oleh <strong>Owner</strong> dan <strong>Finance</strong>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-xs border border-slate-200 text-left">
                💡 <em>Tips Pengujian:</em> Anda dapat mengganti peran ke <strong>Owner</strong> melalui menu <em>Mode Peran (Role)</em> di sidebar kiri untuk meninjau dan menguji kalkulator komersial ini.
              </div>
            </div>
          ) : (
            /* Commercial Analysis Form & Live Calculator for Owner & Finance */
            <div className="space-y-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Cost Modal Proyek
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    Rp {liveTotalCost.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-500">Harga vendor + ongkir + biaya langsung</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Harga Minimum (Batas Bawah)
                  </span>
                  <div className="text-xl font-black text-amber-800">
                    Rp {liveMinPrice.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-amber-700">Tidak boleh dilanggar sales saat negosiasi</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/30 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Harga Jual Penawaran
                  </span>
                  <div className="text-xl font-black text-blue-800">
                    Rp {liveSellingPrice.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-blue-700">Harga resmi ke customer (Customer Quotation)</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" /> Ruang Negosiasi Sales
                  </span>
                  <div className="text-xl font-black text-emerald-800">
                    Rp {liveNegoRoom.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-emerald-700">Gross Margin: {liveMarginPct}% (Rp {liveProfit.toLocaleString('id-ID')})</p>
                </div>
              </div>

              {/* Calculator Settings Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-purple-600" /> Kalkulator Parameter Komersial (F5)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Atur modal vendor, biaya penanganan, target margin, dan batas risiko untuk menghasilkan harga penawaran final.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveCommercialAnalysis}
                    className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Simpan Analisis Komersial (V4)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Left Column: Direct Cost Breakdown */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                      1. Struktur Biaya Modal (Cost Breakdown)
                    </h4>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Total Modal Vendor Terpilih (IDR)
                      </label>
                      <input
                        type="number"
                        value={calcForm.total_vendor_cost}
                        onChange={(e) => setCalcForm({ ...calcForm, total_vendor_cost: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-semibold text-slate-900 bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Dihitung otomatis dari item vendor terpilih pada Tab V3.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Ongkos Kirim & Logistik (IDR)
                        </label>
                        <input
                          type="number"
                          value={calcForm.shipping_cost}
                          onChange={(e) => setCalcForm({ ...calcForm, shipping_cost: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Bea Masuk / Impor (IDR)
                        </label>
                        <input
                          type="number"
                          value={calcForm.customs_duty_cost}
                          onChange={(e) => setCalcForm({ ...calcForm, customs_duty_cost: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Biaya Langsung Lain / On-Site Allowance (IDR)
                      </label>
                      <input
                        type="number"
                        value={calcForm.other_direct_cost}
                        onChange={(e) => setCalcForm({ ...calcForm, other_direct_cost: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Right Column: Margin & Risk Parameters */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                      2. Target Margin & Penanganan Risiko
                    </h4>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="font-semibold text-slate-700">Target Gross Margin: {calcForm.target_margin_pct}%</label>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={60}
                        step={1}
                        value={calcForm.target_margin_pct}
                        onChange={(e) => setCalcForm({ ...calcForm, target_margin_pct: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>5% (Kompetitif)</span>
                        <span>25% (Standar Industri)</span>
                        <span>60% (High Value)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="font-semibold text-slate-700">Cadangan Risiko (Risk Buffer): {calcForm.risk_buffer_pct}%</label>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={calcForm.risk_buffer_pct}
                        onChange={(e) => setCalcForm({ ...calcForm, risk_buffer_pct: Number(e.target.value) })}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>0% (Tanpa Buffer)</span>
                        <span>5% (Wajar)</span>
                        <span>20% (Proyek Kompleks)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Tingkat Risiko Proyek</label>
                        <select
                          value={calcForm.risk_level}
                          onChange={(e) => setCalcForm({ ...calcForm, risk_level: e.target.value as RiskLevel })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white capitalize"
                        >
                          <option value="low">Rendah (Low)</option>
                          <option value="medium">Sedang (Medium)</option>
                          <option value="high">Tinggi (High)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Catatan Risiko Proyek</label>
                        <input
                          type="text"
                          placeholder="Misal: Fluktuasi kurs euro, lead time mepet"
                          value={calcForm.risk_notes}
                          onChange={(e) => setCalcForm({ ...calcForm, risk_notes: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Add BOM Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Tambah Item Analisis Teknis (BOM)</h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Item Komponen / Jasa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PLC CPU Siemens 1516-3 PN/DP"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Spesifikasi Detail</label>
                <textarea
                  rows={2}
                  placeholder="Part number, daya, protokol komunikasi, port I/O..."
                  value={newItem.specifications}
                  onChange={(e) => setNewItem({ ...newItem, specifications: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Merek</label>
                  <input
                    type="text"
                    placeholder="Siemens, Omron.."
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="Unit, Lot, Pcs"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Teknis / Kelayakan</label>
                <input
                  type="text"
                  placeholder="Kesesuaian dengan sistem eksisting..."
                  value={newItem.technical_notes}
                  onChange={(e) => setNewItem({ ...newItem, technical_notes: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tambahkan ke BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Vendor Quote (F4) */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">
              {editingQuoteId ? 'Update / Edit Harga Penawaran Vendor' : 'Input Harga Penawaran Vendor (V3 RFQ)'}
            </h3>

            <form onSubmit={handleSaveQuote} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Vendor Supplier *</label>
                <select
                  required
                  value={quoteFormData.vendor_id}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, vendor_id: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city || 'Indonesia'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Mata Uang</label>
                  <select
                    value={quoteFormData.currency}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, currency: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="SGD">SGD (Singapura)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Harga Satuan Asli *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={quoteFormData.unit_price}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, unit_price: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {quoteFormData.currency !== 'IDR' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kurs Manual ke IDR (Rp)</label>
                  <input
                    type="number"
                    min={1}
                    value={quoteFormData.exchange_rate}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, exchange_rate: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lead Time (Hari)</label>
                  <input
                    type="number"
                    value={quoteFormData.lead_time_days}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, lead_time_days: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Masa Garansi</label>
                  <input
                    type="text"
                    placeholder="Contoh: 12 Bulan Resmi"
                    value={quoteFormData.warranty_period}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, warranty_period: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Termin Pembayaran</label>
                  <input
                    type="text"
                    value={quoteFormData.payment_terms}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, payment_terms: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. Surat Penawaran Vendor</label>
                  <input
                    type="text"
                    placeholder="Contoh: QUO-SIEM-2026"
                    value={quoteFormData.quote_reference}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, quote_reference: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors shadow-xs"
                >
                  {editingQuoteId ? 'Simpan Pembaruan Harga' : 'Simpan Penawaran Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Share RFQ (WhatsApp / Email Template) */}
      {showRfqModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" /> Template Pesan RFQ (Permintaan Penawaran Harga)
              </h3>
              <button onClick={() => setShowRfqModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Nama Vendor Tujuan:</label>
                <select
                  value={rfqTargetVendor}
                  onChange={(e) => setRfqTargetVendor(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    Format Chat WhatsApp
                  </span>
                  <button
                    onClick={() => handleCopy(waText, 'wa')}
                    className="inline-flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    {copiedType === 'wa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedType === 'wa' ? 'Tersalin!' : 'Salin Chat WA'}
                  </button>
                </div>
                <pre className="bg-white p-3 rounded-lg border border-emerald-100 text-[11px] text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                  {waText}
                </pre>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Format Surat / Email Resmi
                  </span>
                  <button
                    onClick={() => handleCopy(emailText, 'email')}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-900 text-white font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    {copiedType === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedType === 'email' ? 'Tersalin!' : 'Salin Email'}
                  </button>
                </div>
                <pre className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                  {emailText}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowRfqModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
