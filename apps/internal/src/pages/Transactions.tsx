import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Truck, 
  FileCheck, 
  Plus, 
  Calendar, 
  Building, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Download, 
  Eye, 
  CreditCard, 
  ChevronRight, 
  X, 
  FileText, 
  PackageCheck,
  ShieldAlert,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { customerService } from '../services/customerService';
import { vendorService } from '../services/vendorService';
import { quotationService } from '../services/quotationService';
import { terbilangRupiah } from '../utils/terbilang';
import type { 
  CustomerPO, 
  VendorPO, 
  DeliveryOrder, 
  Invoice, 
  Customer, 
  Vendor, 
  Quotation 
} from '../types/database';

export const Transactions: React.FC = () => {
  const { role, canViewCommercialAnalysis } = useAuth();
  const [activeTab, setActiveTab] = useState<'po' | 'do' | 'invoice'>('po');
  const [poSubTab, setPoSubTab] = useState<'customer' | 'vendor'>('customer');

  const [customerPOs, setCustomerPOs] = useState<CustomerPO[]>([]);
  const [vendorPOs, setVendorPOs] = useState<VendorPO[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showNewCustomerPOModal, setShowNewCustomerPOModal] = useState(false);
  const [showNewVendorPOModal, setShowNewVendorPOModal] = useState(false);
  const [showNewDOModal, setShowNewDOModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<{
    type: 'vendor_po' | 'do' | 'invoice';
    data: any;
  } | null>(null);

  // Form States
  const [cpoForm, setCpoForm] = useState({
    po_number: '',
    customer_id: '',
    quotation_id: '',
    po_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    payment_terms: 'DP 30%, Pelunasan 70%',
    delivery_deadline: '',
    notes: ''
  });

  const [vpoForm, setVpoForm] = useState({
    vendor_id: '',
    quotation_id: '',
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    payment_terms: 'CBD (Cash Before Delivery)',
    shipping_address: 'Workshop Amabro Automation, Kawasan Industri Jababeka II, Cikarang',
    notes: '',
    items: [
      { item_name: '', specifications: '', brand: '', quantity: 1, unit: 'Unit', unit_price: 0, lead_time_days: 14 }
    ]
  });

  const [doForm, setDoForm] = useState({
    customer_id: '',
    customer_po_id: '',
    delivery_date: new Date().toISOString().split('T')[0],
    shipping_address: '',
    courier_name: 'Ekspedisi Internal Amabro',
    vehicle_number: 'B 9482 KCA',
    notes: '',
    items: [
      { item_name: '', specifications: '', quantity_ordered: 1, quantity_delivered: 1, unit: 'Unit', notes: '' }
    ]
  });

  const [invForm, setInvForm] = useState({
    customer_id: '',
    customer_po_id: '',
    quotation_id: '',
    delivery_order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    termin_type: 'dp' as Invoice['termin_type'],
    termin_percentage: 30,
    subtotal: 0,
    tax_rate: 11,
    bank_account_info: 'BCA KCP Cikarang 883-0912-334 a/n PT Amabro Otomasi Industri',
    notes: '',
    item_name: 'Tagihan Uang Muka (DP 30%) Otomasi Industri'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cpos, vpos, dos, invs, custs, vends, quots] = await Promise.all([
        transactionService.getCustomerPOs(),
        transactionService.getVendorPOs(),
        transactionService.getDeliveryOrders(),
        transactionService.getInvoices(),
        customerService.getCustomers(),
        vendorService.getVendors(),
        quotationService.getQuotations()
      ]);
      setCustomerPOs(cpos);
      setVendorPOs(vpos);
      setDeliveryOrders(dos);
      setInvoices(invs);
      setCustomers(custs);
      setVendors(vends);
      setQuotations(quots);
    } catch (err) {
      console.error('Error loading transaction data:', err);
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

  // Submit Handlers
  const handleCreateCustomerPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpoForm.customer_id || !cpoForm.po_number) return;
    const tax = Math.round(cpoForm.total_amount * 0.11);
    await transactionService.createCustomerPO({
      po_number: cpoForm.po_number,
      customer_id: cpoForm.customer_id,
      quotation_id: cpoForm.quotation_id || null,
      po_date: cpoForm.po_date,
      total_amount: cpoForm.total_amount,
      tax_amount: tax,
      grand_total: cpoForm.total_amount + tax,
      payment_terms: cpoForm.payment_terms,
      delivery_deadline: cpoForm.delivery_deadline || null,
      status: 'received',
      notes: cpoForm.notes
    });
    setShowNewCustomerPOModal(false);
    await loadData();
  };

  const handleCreateVendorPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpoForm.vendor_id || vpoForm.items.length === 0) return;
    const subtotal = vpoForm.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    const tax = Math.round(subtotal * 0.11);
    const poNumber = `POV/AMB/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    await transactionService.createVendorPO({
      po_number: poNumber,
      vendor_id: vpoForm.vendor_id,
      quotation_id: vpoForm.quotation_id || null,
      po_date: vpoForm.po_date,
      expected_delivery_date: vpoForm.expected_delivery_date || null,
      currency: 'IDR',
      exchange_rate: 1,
      subtotal,
      tax_rate: 11,
      tax_amount: tax,
      grand_total: subtotal + tax,
      payment_terms: vpoForm.payment_terms,
      shipping_address: vpoForm.shipping_address,
      notes: vpoForm.notes,
      status: 'draft',
      items: vpoForm.items.map(i => ({
        id: `vpi-${Date.now()}-${Math.random()}`,
        vendor_po_id: '',
        item_name: i.item_name,
        specifications: i.specifications,
        brand: i.brand,
        quantity: i.quantity,
        unit: i.unit,
        unit_price: i.unit_price,
        total_price: i.quantity * i.unit_price,
        lead_time_days: i.lead_time_days,
        received_quantity: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    });
    setShowNewVendorPOModal(false);
    await loadData();
  };

  const handleCreateDeliveryOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doForm.customer_id) return;
    const doNumber = `DO/AMB/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    await transactionService.createDeliveryOrder({
      do_number: doNumber,
      customer_id: doForm.customer_id,
      customer_po_id: doForm.customer_po_id || null,
      delivery_date: doForm.delivery_date,
      shipping_address: doForm.shipping_address,
      courier_name: doForm.courier_name,
      vehicle_number: doForm.vehicle_number,
      status: 'in_transit',
      notes: doForm.notes,
      items: doForm.items.map(i => ({
        id: `doi-${Date.now()}-${Math.random()}`,
        delivery_order_id: '',
        item_name: i.item_name,
        specifications: i.specifications,
        quantity_ordered: i.quantity_ordered,
        quantity_delivered: i.quantity_delivered,
        unit: i.unit,
        notes: i.notes,
        created_at: new Date().toISOString()
      }))
    });
    setShowNewDOModal(false);
    await loadData();
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invForm.customer_id) return;
    const invNumber = `INV/AMB/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;
    const tax = Math.round(invForm.subtotal * (invForm.tax_rate / 100));
    const grandTotal = invForm.subtotal + tax;

    await transactionService.createInvoice({
      invoice_number: invNumber,
      customer_id: invForm.customer_id,
      customer_po_id: invForm.customer_po_id || null,
      quotation_id: invForm.quotation_id || null,
      delivery_order_id: invForm.delivery_order_id || null,
      invoice_date: invForm.invoice_date,
      due_date: invForm.due_date,
      termin_type: invForm.termin_type,
      termin_percentage: invForm.termin_percentage,
      subtotal: invForm.subtotal,
      tax_rate: invForm.tax_rate,
      tax_amount: tax,
      grand_total: grandTotal,
      payment_status: 'sent',
      bank_account_info: invForm.bank_account_info,
      notes: invForm.notes,
      items: [
        {
          id: `ii-${Date.now()}`,
          invoice_id: '',
          item_name: invForm.item_name,
          specifications: `Termin ${invForm.termin_percentage}% (${invForm.termin_type.toUpperCase()})`,
          quantity: 1,
          unit: 'Lot',
          unit_price: invForm.subtotal,
          total_price: invForm.subtotal,
          created_at: new Date().toISOString()
        }
      ]
    });
    setShowNewInvoiceModal(false);
    await loadData();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || paymentForm.amount <= 0) return;
    await transactionService.recordPayment(showPaymentModal.id, {
      amount: paymentForm.amount,
      payment_date: paymentForm.payment_date,
      payment_method: paymentForm.payment_method,
      reference_number: paymentForm.reference_number,
      notes: paymentForm.notes
    });
    setShowPaymentModal(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            PO, Surat Jalan, & Invoicing (Fase 2)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Eksekusi transaksi pesanan resmi: Purchase Order, Surat Jalan pengiriman bertahap (DO), dan Invoice termin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'po' && (
            poSubTab === 'customer' ? (
              <button 
                onClick={() => setShowNewCustomerPOModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Catat PO Customer
              </button>
            ) : (
              (role === 'owner' || role === 'purchasing' || role === 'finance') && (
                <button 
                  onClick={() => setShowNewVendorPOModal(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Buat PO ke Vendor
                </button>
              )
            )
          )}
          {activeTab === 'do' && (
            <button 
              onClick={() => setShowNewDOModal(true)}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Surat Jalan (DO)
            </button>
          )}
          {activeTab === 'invoice' && (
            <button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Invoice Termin
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('po')}
          className={`pb-3 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'po' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Purchase Order ({customerPOs.length + vendorPOs.length})
        </button>
        <button
          onClick={() => setActiveTab('do')}
          className={`pb-3 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'do' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          Surat Jalan DO ({deliveryOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`pb-3 px-5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'invoice' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Invoice & Termin ({invoices.length})
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDER */}
      {activeTab === 'po' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPoSubTab('customer')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  poSubTab === 'customer' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                PO Masuk dari Customer ({customerPOs.length})
              </button>
              <button
                onClick={() => setPoSubTab('vendor')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  poSubTab === 'vendor' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                PO Keluar ke Vendor / Supplier ({vendorPOs.length})
              </button>
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor PO atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* PO Customer Table */}
          {poSubTab === 'customer' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Nomor PO Customer</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Tanggal PO</th>
                      <th className="px-5 py-3">Batas Kirim</th>
                      <th className="px-5 py-3">Nilai Kontrak</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {customerPOs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Belum ada PO Customer tercatat. Klik "Catat PO Customer" untuk mulai.
                        </td>
                      </tr>
                    ) : (
                      customerPOs.map(cpo => (
                        <tr key={cpo.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            <div>{cpo.po_number}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{cpo.internal_ref || '-'}</div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800">
                            {cpo.customer?.name || 'Customer'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{cpo.po_date}</td>
                          <td className="px-5 py-3.5 text-slate-500">{cpo.delivery_deadline || '-'}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {formatIDR(cpo.grand_total)}
                            <div className="text-[10px] text-slate-400 font-normal">
                              DPP: {formatIDR(cpo.total_amount)}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              cpo.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              cpo.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {cpo.status === 'completed' ? 'Selesai' :
                               cpo.status === 'in_progress' ? 'Sedang Diproses' : 'Diterima'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setDoForm({
                                  ...doForm,
                                  customer_id: cpo.customer_id,
                                  customer_po_id: cpo.id,
                                  shipping_address: cpo.customer?.address || 'Pabrik Mitra Industri'
                                });
                                setShowNewDOModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs inline-flex items-center gap-1"
                            >
                              Buat DO <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PO Vendor Table */}
          {poSubTab === 'vendor' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Security Boundary Alert for Sales/Engineer */}
              {!canViewCommercialAnalysis && (
                <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3 text-amber-800 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong>Akses Terbatas:</strong> Anda sedang login dengan role {role.toUpperCase()}. Detail harga beli vendor disamarkan demi kepatuhan kontrol margin internal Amabro.
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Nomor PO Vendor</th>
                      <th className="px-5 py-3">Vendor / Supplier</th>
                      <th className="px-5 py-3">Tanggal PO</th>
                      <th className="px-5 py-3">Estimasi Kirim</th>
                      <th className="px-5 py-3">Total Biaya Vendor</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {vendorPOs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Belum ada PO Vendor.
                        </td>
                      </tr>
                    ) : (
                      vendorPOs.map(vpo => (
                        <tr key={vpo.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                            {vpo.po_number}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800">
                            {vpo.vendor?.name || 'Vendor Supplier'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{vpo.po_date}</td>
                          <td className="px-5 py-3.5 text-slate-500">{vpo.expected_delivery_date || '-'}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {canViewCommercialAnalysis ? (
                              formatIDR(vpo.grand_total)
                            ) : (
                              <span className="text-slate-400 font-mono italic">•••••••• (Protected)</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              vpo.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              vpo.status === 'sent' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {vpo.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setShowPrintModal({ type: 'vendor_po', data: vpo })}
                              className="text-slate-600 hover:text-slate-900 font-medium text-xs inline-flex items-center gap-1 border border-slate-200 px-2 py-1 rounded"
                            >
                              <Printer className="w-3.5 h-3.5" /> Cetak PO
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SURAT JALAN / DELIVERY ORDER (DO) */}
      {activeTab === 'do' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Nomor Surat Jalan</th>
                    <th className="px-5 py-3">Customer & Alamat Kirim</th>
                    <th className="px-5 py-3">Tanggal Kirim</th>
                    <th className="px-5 py-3">Kurir / Kendaraan</th>
                    <th className="px-5 py-3">Penerima Barang</th>
                    <th className="px-5 py-3">Status Pengiriman</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {deliveryOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Belum ada Surat Jalan tercatat. Klik "Buat Surat Jalan (DO)" untuk membuat.
                      </td>
                    </tr>
                  ) : (
                    deliveryOrders.map(dord => (
                      <tr key={dord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                          {dord.do_number}
                          {dord.customer_po && (
                            <div className="text-[10px] text-slate-400 font-sans">
                              Ref: {dord.customer_po.po_number}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-800">{dord.customer?.name}</div>
                          <div className="text-[11px] text-slate-400 max-w-xs truncate">{dord.shipping_address}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{dord.delivery_date}</td>
                        <td className="px-5 py-3.5 text-slate-700">
                          <div>{dord.courier_name || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{dord.vehicle_number || ''}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          {dord.recipient_name ? (
                            <div className="text-emerald-700 font-medium flex items-center gap-1">
                              <PackageCheck className="w-3.5 h-3.5" />
                              {dord.recipient_name}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum diterima</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            dord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            dord.status === 'in_transit' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {dord.status === 'delivered' ? 'Diterima di Pabrik' :
                             dord.status === 'in_transit' ? 'Dalam Pengiriman' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => setShowPrintModal({ type: 'do', data: dord })}
                            className="text-slate-600 hover:text-slate-900 font-medium text-xs inline-flex items-center gap-1 border border-slate-200 px-2 py-1 rounded"
                          >
                            <Printer className="w-3.5 h-3.5" /> Cetak DO 3 Rangkap
                          </button>
                          {dord.status !== 'delivered' && (
                            <button
                              onClick={async () => {
                                const name = prompt('Masukkan nama penerima di lokasi customer:');
                                if (name) {
                                  await transactionService.updateDeliveryOrderStatus(dord.id, 'delivered', name);
                                  await loadData();
                                }
                              }}
                              className="text-emerald-600 hover:text-emerald-800 font-medium text-xs inline-flex items-center gap-1 border border-emerald-200 px-2 py-1 rounded bg-emerald-50"
                            >
                              Konfirmasi Terima
                            </button>
                          )}
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

      {/* TAB 3: INVOICE & PENAGIHAN TERMIN */}
      {activeTab === 'invoice' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Nomor Invoice</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Termin</th>
                    <th className="px-5 py-3">Tgl & Jatuh Tempo</th>
                    <th className="px-5 py-3">Total Tagihan</th>
                    <th className="px-5 py-3">Status Bayar</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Belum ada Invoice diterbitkan. Klik "Buat Invoice Termin" untuk membuat.
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                          {inv.invoice_number}
                          {inv.customer_po && (
                            <div className="text-[10px] text-slate-400 font-sans">
                              PO: {inv.customer_po.po_number}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {inv.customer?.name}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {inv.termin_type.toUpperCase()} {inv.termin_percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">
                          <div>{inv.invoice_date}</div>
                          <div className="text-[10px] text-rose-500 font-medium">JT: {inv.due_date}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{formatIDR(inv.grand_total)}</div>
                          <div className="text-[10px] text-slate-400">
                            Terbayar: {formatIDR(inv.paid_amount)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            inv.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            inv.payment_status === 'partial' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            inv.payment_status === 'sent' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {inv.payment_status === 'paid' ? 'LUNAS' :
                             inv.payment_status === 'partial' ? 'DIBAYAR SEBAGIAN' :
                             inv.payment_status === 'sent' ? 'MENUNGGU BAYAR' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => setShowPrintModal({ type: 'invoice', data: inv })}
                            className="text-slate-600 hover:text-slate-900 font-medium text-xs inline-flex items-center gap-1 border border-slate-200 px-2 py-1 rounded"
                          >
                            <Printer className="w-3.5 h-3.5" /> Cetak
                          </button>
                          {inv.remaining_amount > 0 && (
                            <button
                              onClick={() => {
                                setShowPaymentModal(inv);
                                setPaymentForm({
                                  amount: inv.remaining_amount,
                                  payment_date: new Date().toISOString().split('T')[0],
                                  payment_method: 'bank_transfer',
                                  reference_number: '',
                                  notes: `Pelunasan Invoice ${inv.invoice_number}`
                                });
                              }}
                              className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs inline-flex items-center gap-1 border border-emerald-200 px-2 py-1 rounded bg-emerald-50"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Catat Bayar
                            </button>
                          )}
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

      {/* MODAL: BUAT PO CUSTOMER */}
      {showNewCustomerPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                Catat Purchase Order Resmi dari Customer
              </h3>
              <button onClick={() => setShowNewCustomerPOModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomerPO} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor PO Customer *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PO-MAYORA-2026-089"
                  value={cpoForm.po_number}
                  onChange={(e) => setCpoForm({ ...cpoForm, po_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Customer *</label>
                <select
                  required
                  value={cpoForm.customer_id}
                  onChange={(e) => setCpoForm({ ...cpoForm, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city || 'Indonesia'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal PO</label>
                  <input
                    type="date"
                    value={cpoForm.po_date}
                    onChange={(e) => setCpoForm({ ...cpoForm, po_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deadline Kirim</label>
                  <input
                    type="date"
                    value={cpoForm.delivery_deadline}
                    onChange={(e) => setCpoForm({ ...cpoForm, delivery_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nilai PO (DPP sebelum PPN) *</label>
                <input
                  type="number"
                  required
                  value={cpoForm.total_amount || ''}
                  onChange={(e) => setCpoForm({ ...cpoForm, total_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  PPN 11%: {formatIDR(cpoForm.total_amount * 0.11)} | Grand Total: {formatIDR(cpoForm.total_amount * 1.11)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Termin Pembayaran</label>
                <input
                  type="text"
                  value={cpoForm.payment_terms}
                  onChange={(e) => setCpoForm({ ...cpoForm, payment_terms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerPOModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan PO Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT PO VENDOR */}
      {showNewVendorPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Terbitkan Purchase Order ke Vendor Supplier
              </h3>
              <button onClick={() => setShowNewVendorPOModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVendorPO} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Vendor Supplier *</label>
                <select
                  required
                  value={vpoForm.vendor_id}
                  onChange={(e) => setVpoForm({ ...vpoForm, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.city || 'Indonesia'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal PO</label>
                  <input
                    type="date"
                    value={vpoForm.po_date}
                    onChange={(e) => setVpoForm({ ...vpoForm, po_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimasi Tiba (Lead Time)</label>
                  <input
                    type="date"
                    value={vpoForm.expected_delivery_date}
                    onChange={(e) => setVpoForm({ ...vpoForm, expected_delivery_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="font-semibold text-slate-900">Rincian Item yang Dipesan ke Vendor:</div>
                {vpoForm.items.map((it, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang / Komponen"
                          value={it.item_name}
                          onChange={(e) => {
                            const updated = [...vpoForm.items];
                            updated[idx].item_name = e.target.value;
                            setVpoForm({ ...vpoForm, items: updated });
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Brand (e.g. Siemens)"
                          value={it.brand}
                          onChange={(e) => {
                            const updated = [...vpoForm.items];
                            updated[idx].brand = e.target.value;
                            setVpoForm({ ...vpoForm, items: updated });
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={it.quantity}
                          onChange={(e) => {
                            const updated = [...vpoForm.items];
                            updated[idx].quantity = parseFloat(e.target.value) || 1;
                            setVpoForm({ ...vpoForm, items: updated });
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Harga Satuan Vendor (Rp)"
                          value={it.unit_price || ''}
                          onChange={(e) => {
                            const updated = [...vpoForm.items];
                            updated[idx].unit_price = parseFloat(e.target.value) || 0;
                            setVpoForm({ ...vpoForm, items: updated });
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Pengiriman Workshop</label>
                <textarea
                  rows={2}
                  value={vpoForm.shipping_address}
                  onChange={(e) => setVpoForm({ ...vpoForm, shipping_address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewVendorPOModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Terbitkan PO Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT SURAT JALAN DO */}
      {showNewDOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Buat Surat Jalan Pengiriman (Delivery Order)
              </h3>
              <button onClick={() => setShowNewDOModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDeliveryOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Penerima *</label>
                <select
                  required
                  value={doForm.customer_id}
                  onChange={(e) => setDoForm({ ...doForm, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Pabrik / Lokasi Serah Terima *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Alamat lengkap pabrik tujuan..."
                  value={doForm.shipping_address}
                  onChange={(e) => setDoForm({ ...doForm, shipping_address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Pengemudi / Ekspedisi</label>
                  <input
                    type="text"
                    value={doForm.courier_name}
                    onChange={(e) => setDoForm({ ...doForm, courier_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Plat Polisi</label>
                  <input
                    type="text"
                    value={doForm.vehicle_number}
                    onChange={(e) => setDoForm({ ...doForm, vehicle_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="font-semibold text-slate-900">Barang yang Dikirimkan:</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Barang / Modul"
                    value={doForm.items[0].item_name}
                    onChange={(e) => {
                      const items = [...doForm.items];
                      items[0].item_name = e.target.value;
                      setDoForm({ ...doForm, items });
                    }}
                    className="col-span-2 px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Jumlah Dikirim"
                    value={doForm.items[0].quantity_delivered}
                    onChange={(e) => {
                      const items = [...doForm.items];
                      items[0].quantity_delivered = parseFloat(e.target.value) || 1;
                      setDoForm({ ...doForm, items });
                    }}
                    className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDOModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Terbitkan Surat Jalan (DO)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT INVOICE */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Terbitkan Invoice & Tagihan Termin
              </h3>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Ditagih *</label>
                <select
                  required
                  value={invForm.customer_id}
                  onChange={(e) => setInvForm({ ...invForm, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Termin *</label>
                  <select
                    value={invForm.termin_type}
                    onChange={(e) => setInvForm({ ...invForm, termin_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="dp">Uang Muka (DP)</option>
                    <option value="progress">Progress / Pengiriman</option>
                    <option value="pelunasan">Pelunasan Akhir (BAST)</option>
                    <option value="full">Lunas Penuh (100%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Persentase Termin (%)</label>
                  <input
                    type="number"
                    value={invForm.termin_percentage}
                    onChange={(e) => setInvForm({ ...invForm, termin_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi Tagihan</label>
                <input
                  type="text"
                  value={invForm.item_name}
                  onChange={(e) => setInvForm({ ...invForm, item_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subtotal Tagihan (DPP) *</label>
                <input
                  type="number"
                  required
                  value={invForm.subtotal || ''}
                  onChange={(e) => setInvForm({ ...invForm, subtotal: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  PPN 11%: {formatIDR(invForm.subtotal * 0.11)} | Grand Total: {formatIDR(invForm.subtotal * 1.11)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Invoice</label>
                  <input
                    type="date"
                    value={invForm.invoice_date}
                    onChange={(e) => setInvForm({ ...invForm, invoice_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={invForm.due_date}
                    onChange={(e) => setInvForm({ ...invForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATAT PEMBAYARAN */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Catat Pembayaran Masuk
              </h3>
              <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                <div>Invoice: <strong className="font-mono text-slate-900">{showPaymentModal.invoice_number}</strong></div>
                <div>Customer: <strong>{showPaymentModal.customer?.name}</strong></div>
                <div>Sisa Tagihan: <strong className="text-rose-600">{formatIDR(showPaymentModal.remaining_amount)}</strong></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jumlah Nominal Bayar (Rp) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Metode Pembayaran</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="giro">Giro / Cek</option>
                    <option value="cash">Tunai / Kas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">No. Referensi Rekening / Mutasi</label>
                <input
                  type="text"
                  placeholder="Contoh: TRF-BCA-8920192"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT PREVIEW DOKUMEN RESMI (A4) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                Cetak Dokumen: {showPrintModal.type.toUpperCase()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
                </button>
                <button
                  onClick={() => setShowPrintModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-100 flex-1">
              <div className="bg-white p-10 max-w-3xl mx-auto shadow-sm border border-slate-200 text-slate-800 text-xs font-sans space-y-6">
                {/* Header Kop */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/amabro-logo.png" alt="Amabro Logo" className="h-12 w-auto object-contain" />
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">PT. AMABRO BINTANG INOVASI</h2>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Plaza Aminta Lt 5/504, Jl TB Simatupang Kav 10, Jakarta Selatan - DKI Jakarta 12310<br />
                        Phone: 021-2292-0544 | Email: info@amabroindonesia.com | Website: www.amabroindonesia.com
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold uppercase tracking-widest text-slate-900">
                      {showPrintModal.type === 'vendor_po' && 'PURCHASE ORDER'}
                      {showPrintModal.type === 'do' && 'SURAT JALAN (DO)'}
                      {showPrintModal.type === 'invoice' && 'FAKTUR INVOICE'}
                    </span>
                    <div className="text-xs font-mono font-bold text-blue-600 mt-1">
                      {showPrintModal.data.po_number || showPrintModal.data.do_number || showPrintModal.data.invoice_number}
                    </div>
                  </div>
                </div>

                {/* Surat Jalan 3 Rangkap Watermark / Header */}
                {showPrintModal.type === 'do' && (
                  <div className="bg-amber-50 border border-amber-200 p-2 text-center text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                    RANGKAP 1: ASLI (CUSTOMER) / RANGKAP 2: MERAH (FINANCE) / RANGKAP 3: KUNING (GUDANG & ARSIP)
                  </div>
                )}

                {/* Info Fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Tujuan Dokumen:</span>
                    <div className="font-bold text-sm text-slate-900 mt-0.5">
                      {showPrintModal.data.customer?.name || showPrintModal.data.vendor?.name || 'Mitra Industri'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {showPrintModal.data.shipping_address || showPrintModal.data.customer?.address || showPrintModal.data.vendor?.address || '-'}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-slate-500">Tanggal:</span>{' '}
                      <strong>{showPrintModal.data.po_date || showPrintModal.data.delivery_date || showPrintModal.data.invoice_date}</strong>
                    </div>
                    {showPrintModal.data.due_date && (
                      <div>
                        <span className="text-slate-500">Jatuh Tempo:</span>{' '}
                        <strong className="text-rose-600">{showPrintModal.data.due_date}</strong>
                      </div>
                    )}
                    {showPrintModal.data.vehicle_number && (
                      <div>
                        <span className="text-slate-500">No. Kendaraan:</span>{' '}
                        <strong>{showPrintModal.data.vehicle_number}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-800">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 w-10 text-center">No</th>
                      <th className="border border-slate-200 px-3 py-2">Deskripsi Barang & Spesifikasi</th>
                      <th className="border border-slate-200 px-3 py-2 text-center w-20">Qty</th>
                      {showPrintModal.type !== 'do' && (
                        <>
                          <th className="border border-slate-200 px-3 py-2 text-right w-32">Harga Satuan</th>
                          <th className="border border-slate-200 px-3 py-2 text-right w-36">Total (Rp)</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(showPrintModal.data.items || []).map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="border border-slate-200 px-3 py-2 text-center">{i + 1}</td>
                        <td className="border border-slate-200 px-3 py-2">
                          <div className="font-bold text-slate-900">{it.item_name}</div>
                          <div className="text-[11px] text-slate-500">{it.specifications || it.notes}</div>
                        </td>
                        <td className="border border-slate-200 px-3 py-2 text-center">
                          {it.quantity || it.quantity_delivered} {it.unit || 'Unit'}
                        </td>
                        {showPrintModal.type !== 'do' && (
                          <>
                            <td className="border border-slate-200 px-3 py-2 text-right">{formatIDR(it.unit_price)}</td>
                            <td className="border border-slate-200 px-3 py-2 text-right font-semibold">{formatIDR(it.total_price)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total & Terbilang */}
                {showPrintModal.type !== 'do' && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Subtotal DPP:</span>
                          <span className="font-semibold">{formatIDR(showPrintModal.data.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">PPN (11%):</span>
                          <span className="font-semibold">{formatIDR(showPrintModal.data.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-900 pt-1 text-sm font-bold text-slate-900">
                          <span>Grand Total:</span>
                          <span>{formatIDR(showPrintModal.data.grand_total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 italic text-[11px]">
                      <strong>Terbilang:</strong> {terbilangRupiah(showPrintModal.data.grand_total)}
                    </div>
                  </div>
                )}

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
                  <div>
                    <p className="text-slate-500">Dibuat Oleh,</p>
                    <div className="h-16"></div>
                    <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">Logistik / Administrasi</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Mengetahui / Disetujui,</p>
                    <div className="h-16"></div>
                    <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">Operational Director</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Tanda Terima Pelanggan,</p>
                    <div className="h-16"></div>
                    <p className="font-bold border-t border-slate-300 pt-1 text-slate-900">
                      {showPrintModal.data.recipient_name || '(Nama & Cap Perusahaan)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
