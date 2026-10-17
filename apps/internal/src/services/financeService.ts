import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { TaxInvoice, ProjectProfitLoss, ArAgingItem } from '../types/database';
import { transactionService } from './transactionService';
import { quotationService } from './quotationService';
import { commercialAnalysisService } from './commercialAnalysisService';

const STORAGE_KEYS = {
  TAX_INVOICES: 'amabro_tax_invoices',
};

const INITIAL_TAX_INVOICES: TaxInvoice[] = [
  {
    id: 'tx-001',
    tax_type: 'keluaran',
    invoice_id: 'inv-001',
    tax_invoice_number: '010.002-26.89201120',
    tax_date: '2026-10-14',
    npwp: '01.234.567.8-412.000',
    tax_subject_name: 'PT Mayora Indah Tbk',
    tax_subject_address: 'Gedung Mayora, Jl. Tomang Raya 21-23, Jakarta Barat',
    tax_rate: 11,
    dpp: 43500000,
    ppn: 4785000,
    tax_period_month: 10,
    tax_period_year: 2026,
    is_creditable: true,
    efaktur_status: 'approved',
    notes: 'FP Uang Muka DP 30% Revamp Packaging Line 4',
    created_at: new Date('2026-10-14T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-14T10:00:00Z').toISOString()
  },
  {
    id: 'tx-002',
    tax_type: 'masukan',
    vendor_po_id: 'vpo-001',
    tax_invoice_number: '010.003-26.11029384',
    tax_date: '2026-10-15',
    npwp: '01.998.776.5-091.000',
    tax_subject_name: 'PT Siemens Indonesia Distributor',
    tax_subject_address: 'Artha Graha Building Lt 18, SCBD Jakarta',
    tax_rate: 11,
    dpp: 92000000,
    ppn: 10120000,
    tax_period_month: 10,
    tax_period_year: 2026,
    is_creditable: true,
    efaktur_status: 'uploaded',
    notes: 'Faktur Pajak Pembelian PLC & I/O Siemens S7-1500',
    created_at: new Date('2026-10-15T12:00:00Z').toISOString(),
    updated_at: new Date('2026-10-15T12:00:00Z').toISOString()
  },
  {
    id: 'tx-003',
    tax_type: 'keluaran',
    invoice_id: 'inv-002',
    tax_invoice_number: '010.002-26.89201121',
    tax_date: '2026-10-16',
    npwp: '01.234.567.8-412.000',
    tax_subject_name: 'PT Mayora Indah Tbk',
    tax_subject_address: 'Gedung Mayora, Jl. Tomang Raya 21-23, Jakarta Barat',
    tax_rate: 11,
    dpp: 101500000,
    ppn: 11165000,
    tax_period_month: 10,
    tax_period_year: 2026,
    is_creditable: true,
    efaktur_status: 'ready',
    notes: 'FP Pelunasan 70% Revamp Packaging Line 4',
    created_at: new Date('2026-10-16T16:00:00Z').toISOString(),
    updated_at: new Date('2026-10-16T16:00:00Z').toISOString()
  }
];

export const financeService = {
  // ----------------------------------------------------
  // TAX INVOICES (FAKTUR PAJAK KELUARAN & MASUKAN)
  // ----------------------------------------------------
  async getTaxInvoices(): Promise<TaxInvoice[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tax_invoices')
        .select('*')
        .order('tax_date', { ascending: false });

      if (error) {
        console.error('Error fetching tax invoices from Supabase:', error);
      } else if (data && data.length > 0) {
        return data as TaxInvoice[];
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.TAX_INVOICES);
    if (!local) {
      localStorage.setItem(STORAGE_KEYS.TAX_INVOICES, JSON.stringify(INITIAL_TAX_INVOICES));
      return INITIAL_TAX_INVOICES;
    }
    return JSON.parse(local);
  },

  async createTaxInvoice(taxData: Omit<TaxInvoice, 'id' | 'created_at' | 'updated_at'>): Promise<TaxInvoice> {
    const newTax: TaxInvoice = {
      ...taxData,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tax_invoices')
        .insert([{
          tax_type: taxData.tax_type,
          invoice_id: taxData.invoice_id,
          vendor_po_id: taxData.vendor_po_id,
          tax_invoice_number: taxData.tax_invoice_number,
          tax_date: taxData.tax_date,
          npwp: taxData.npwp,
          tax_subject_name: taxData.tax_subject_name,
          tax_subject_address: taxData.tax_subject_address,
          tax_rate: taxData.tax_rate,
          dpp: taxData.dpp,
          ppn: taxData.ppn,
          tax_period_month: taxData.tax_period_month,
          tax_period_year: taxData.tax_period_year,
          is_creditable: taxData.is_creditable,
          efaktur_status: taxData.efaktur_status,
          notes: taxData.notes
        }])
        .select()
        .single();

      if (!error && data) return data as TaxInvoice;
    }

    const current = await this.getTaxInvoices();
    const updated = [newTax, ...current];
    localStorage.setItem(STORAGE_KEYS.TAX_INVOICES, JSON.stringify(updated));
    return newTax;
  },

  async updateTaxInvoiceStatus(id: string, efaktur_status: TaxInvoice['efaktur_status']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('tax_invoices')
        .update({ efaktur_status, updated_at: new Date().toISOString() })
        .eq('id', id);
    }
    const current = await this.getTaxInvoices();
    const updated = current.map(item => item.id === id ? { ...item, efaktur_status, updated_at: new Date().toISOString() } : item);
    localStorage.setItem(STORAGE_KEYS.TAX_INVOICES, JSON.stringify(updated));
  },

  // ----------------------------------------------------
  // EKSPOR CSV FORMAT E-FAKTUR / CORETAX (DJP)
  // ----------------------------------------------------
  exportEFakturCSV(invoices: TaxInvoice[]): string {
    const keluaran = invoices.filter(inv => inv.tax_type === 'keluaran');
    
    // Header format standar impor e-Faktur Pajak Keluaran DJP
    const headers = [
      'FK',
      'KD_JENIS_TRANSAKSI',
      'FG_PENGGANTI',
      'NOMOR_FAKTUR',
      'MASA_PAJAK',
      'TAHUN_PAJAK',
      'TANGGAL_FAKTUR',
      'NPWP',
      'NAMA',
      'ALAMAT_LENGKAP',
      'JUMLAH_DPP',
      'JUMLAH_PPN',
      'JUMLAH_PPNBM',
      'ID_KETERANGAN_TAMBAHAN',
      'FG_UANG_MUKA',
      'UANG_MUKA_DPP',
      'UANG_MUKA_PPN',
      'REFERENSI'
    ];

    const rows = keluaran.map(inv => {
      // Clean NSFP numbers (remove dots and dashes)
      const cleanNSFP = inv.tax_invoice_number.replace(/[.-]/g, '');
      const cleanNPWP = inv.npwp.replace(/[.-]/g, '');
      const formattedDate = inv.tax_date.split('-').reverse().join('/'); // DD/MM/YYYY

      return [
        'FK',
        '01', // Normal penyerahan BKP/JKP
        '0',  // Bukan faktur pengganti
        `"${cleanNSFP}"`,
        inv.tax_period_month,
        inv.tax_period_year,
        `"${formattedDate}"`,
        `"${cleanNPWP}"`,
        `"${inv.tax_subject_name.replace(/"/g, '""')}"`,
        `"${(inv.tax_subject_address || '-').replace(/"/g, '""')}"`,
        Math.round(inv.dpp),
        Math.round(inv.ppn),
        0, // PPNBM
        '0',
        '0',
        0,
        0,
        `"${(inv.notes || 'Invoicing Amabro').replace(/"/g, '""')}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  },

  // ----------------------------------------------------
  // LAPORAN LABA RUGI PER PROYEK (ACTUAL VS TARGET)
  // ----------------------------------------------------
  async getProfitLossReport(): Promise<ProjectProfitLoss[]> {
    const quotations = await quotationService.getQuotations();
    const vendorPOs = await transactionService.getVendorPOs();

    const results: ProjectProfitLoss[] = [];

    for (const q of quotations) {
      // Find associated commercial analysis
      const analysis = await commercialAnalysisService.getAnalysis(q.inquiry_id, 'owner');
      
      // Calculate actual vendor cost spent on this quotation
      const relatedVendorPOs = vendorPOs.filter(
        v => v.quotation_id === q.id || v.inquiry_id === q.inquiry_id
      );
      const actualVendorCost = relatedVendorPOs.reduce((sum, v) => sum + (v.subtotal || 0), 0);

      const revenue = q.subtotal || 0;
      const plannedCogs = analysis?.total_cost || analysis?.total_vendor_cost || 0;
      const actualCogs = actualVendorCost > 0 ? actualVendorCost : plannedCogs;
      const actualGrossProfit = revenue - actualCogs;
      const actualMarginPct = revenue > 0 ? Math.round((actualGrossProfit / revenue) * 1000) / 10 : 0;

      results.push({
        quotation_id: q.id,
        quotation_number: q.quotation_number,
        inquiry_id: q.inquiry_id,
        inquiry_number: q.inquiry?.inquiry_number || `INQ-${q.inquiry_id.substring(0, 6)}`,
        project_title: q.inquiry?.title || 'Pengadaan Sistem Kontrol Otomasi',
        customer_id: q.inquiry?.customer_id || '',
        customer_name: q.inquiry?.customer?.name || 'Customer Mitra',
        revenue,
        planned_cogs: plannedCogs,
        target_margin_pct: analysis?.target_margin_pct || 25,
        actual_cogs: actualCogs,
        actual_gross_profit: actualGrossProfit,
        actual_margin_pct: actualMarginPct
      });
    }

    return results;
  },

  // ----------------------------------------------------
  // AGING PIUTANG (AR AGING)
  // ----------------------------------------------------
  async getArAgingReport(): Promise<ArAgingItem[]> {
    const invoices = await transactionService.getInvoices();
    const today = new Date();

    return invoices
      .filter(inv => inv.remaining_amount > 0)
      .map(inv => {
        const dueDate = new Date(inv.due_date);
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysOverdue = Math.max(0, diffDays);

        let category = 'Lancar (Belum JT)';
        if (daysOverdue > 90) category = '> 90 Hari';
        else if (daysOverdue > 60) category = '61 - 90 Hari';
        else if (daysOverdue > 30) category = '31 - 60 Hari';
        else if (daysOverdue > 0) category = '1 - 30 Hari';

        return {
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          customer_id: inv.customer_id,
          customer_name: inv.customer?.name || 'Pelanggan Industri',
          invoice_date: inv.invoice_date,
          due_date: inv.due_date,
          grand_total: inv.grand_total,
          paid_amount: inv.paid_amount,
          remaining_amount: inv.remaining_amount,
          payment_status: inv.payment_status,
          aging_category: category,
          days_overdue: daysOverdue
        };
      });
  },

  // ----------------------------------------------------
  // REKAP PPN KELUARAN VS MASUKAN
  // ----------------------------------------------------
  async getVatRecap(): Promise<{
    keluaranTotal: number;
    masukanTotal: number;
    netPayable: number;
    isOverpaid: boolean;
  }> {
    const taxInvoices = await this.getTaxInvoices();
    const keluaran = taxInvoices
      .filter(t => t.tax_type === 'keluaran')
      .reduce((sum, t) => sum + (t.ppn || 0), 0);
    
    const masukan = taxInvoices
      .filter(t => t.tax_type === 'masukan' && t.is_creditable)
      .reduce((sum, t) => sum + (t.ppn || 0), 0);

    const net = keluaran - masukan;

    return {
      keluaranTotal: keluaran,
      masukanTotal: masukan,
      netPayable: Math.abs(net),
      isOverpaid: net < 0
    };
  }
};
