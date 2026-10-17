import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Quotation, QuotationItem, InternalQuotation, UserRole } from '../types/database';

const QUOTATIONS_STORAGE_KEY = 'asf_quotations_data';
const QUOTATION_ITEMS_STORAGE_KEY = 'asf_quotation_items_data';
const INTERNAL_QUOTATIONS_STORAGE_KEY = 'asf_internal_quotations_data';

export const DEFAULT_AUTOMATION_TERMS = {
  payment_terms: 'Termin pembayaran: 30 (tiga puluh) hari kalender setelah Berita Acara Serah Terima (BAST) dan Faktur Pajak diterbitkan.',
  delivery_terms: 'Harga sudah termasuk pengiriman (DDP / Franko) sampai ke pabrik/lokasi customer di wilayah Jabodetabek.',
  warranty_terms: 'Garansi resmi pabrikan selama 12 (dua belas) bulan terhitung sejak tanggal uji komisioning selesai, tidak mencakup kelalaian operasional.',
  general_terms: 'Pekerjaan integrasi software SCADA & commissioning dilaksanakan pada hari kerja (Senin - Jumat 08.00 - 17.00 WIB). Penambahan lingkup pekerjaan di luar penawaran ini akan dikenakan adendum.',
  validity_days: 14,
  tax_rate: 11.00,
};

const initialMockQuotations: Quotation[] = [
  {
    id: 'q1111111-1111-1111-1111-111111111111',
    quotation_number: 'QUO/2026/10/0004',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    revision: 0,
    status: 'waiting_approval',
    date: '2026-10-17',
    validity_days: 14,
    currency: 'IDR',
    subtotal: 260000000,
    discount: 0,
    tax_rate: 11.00,
    tax_amount: 28600000,
    grand_total: 288600000,
    payment_terms: DEFAULT_AUTOMATION_TERMS.payment_terms,
    delivery_terms: DEFAULT_AUTOMATION_TERMS.delivery_terms,
    warranty_terms: DEFAULT_AUTOMATION_TERMS.warranty_terms,
    general_terms: DEFAULT_AUTOMATION_TERMS.general_terms,
    customer_notes: 'Pengadaan komponen otomatisasi lini packaging line 4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inquiry: {
      id: 'i1111111-1111-1111-1111-111111111111',
      inquiry_number: 'INQ/2026/10/0004',
      title: 'Upgrade PLC Siemens S7-1500 & SCADA WinCC',
      customer: {
        id: 'c1111111-1111-1111-1111-111111111111',
        name: 'PT Indofood CBP Sukses Makmur',
        pic_name: 'Bpk. Hendra Gunawan',
        pic_phone: '0812-3456-7890',
        pic_email: 'hendra.g@indofood.co.id',
        address: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi',
        payment_terms_days: 30,
        created_at: '',
        updated_at: '',
      },
    } as any,
  },
];

const initialMockQuotationItems: QuotationItem[] = [
  {
    id: 'qi1',
    quotation_id: 'q1111111-1111-1111-1111-111111111111',
    item_no: 1,
    item_name: 'PLC Siemens S7-1500 (CPU 1516-3 PN/DP)',
    specifications: '6ES7516-3AN02-0AB0, Work memory 1 MB code, 5 MB data',
    brand: 'Siemens',
    quantity: 1,
    unit: 'Unit',
    unit_price: 115000000,
    total_price: 115000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'qi2',
    quotation_id: 'q1111111-1111-1111-1111-111111111111',
    item_no: 2,
    item_name: 'SCADA Software Siemens WinCC Comfort/Advanced V18',
    specifications: '6AV2102-0AA08-0AA0, 2048 PowerTags Runtime License USB Dongle',
    brand: 'Siemens',
    quantity: 1,
    unit: 'License',
    unit_price: 65000000,
    total_price: 65000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'qi3',
    quotation_id: 'q1111111-1111-1111-1111-111111111111',
    item_no: 3,
    item_name: 'Jasa Engineering, Pemrograman Logic, & Komisioning SCADA',
    specifications: 'Migration program S7-300 to S7-1500, I/O loop testing, 5 hari on-site commissioning',
    brand: 'In-house Engineering',
    quantity: 1,
    unit: 'Lot',
    unit_price: 80000000,
    total_price: 80000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialMockInternalItems: InternalQuotation[] = [
  {
    id: 'iq1',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_id: 'it1',
    unit_cost: 85000000,
    margin_pct: 26.08,
    risk_pct: 5,
    unit_minimum_price: 89250000,
    unit_selling_price: 115000000,
    negotiation_room: 25750000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'iq2',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_id: 'it2',
    unit_cost: 45000000,
    margin_pct: 30.76,
    risk_pct: 5,
    unit_minimum_price: 47250000,
    unit_selling_price: 65000000,
    negotiation_room: 17750000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'iq3',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_id: 'it3',
    unit_cost: 40000000,
    margin_pct: 50.00,
    risk_pct: 10,
    unit_minimum_price: 44000000,
    unit_selling_price: 80000000,
    negotiation_room: 36000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStoredQuotations(): Quotation[] {
  try {
    const data = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(initialMockQuotations));
  return initialMockQuotations;
}

function saveStoredQuotations(items: Quotation[]) {
  localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(items));
}

function getStoredQuotationItems(): QuotationItem[] {
  try {
    const data = localStorage.getItem(QUOTATION_ITEMS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(QUOTATION_ITEMS_STORAGE_KEY, JSON.stringify(initialMockQuotationItems));
  return initialMockQuotationItems;
}

function saveStoredQuotationItems(items: QuotationItem[]) {
  localStorage.setItem(QUOTATION_ITEMS_STORAGE_KEY, JSON.stringify(items));
}

function getStoredInternalItems(): InternalQuotation[] {
  try {
    const data = localStorage.getItem(INTERNAL_QUOTATIONS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(INTERNAL_QUOTATIONS_STORAGE_KEY, JSON.stringify(initialMockInternalItems));
  return initialMockInternalItems;
}

export const quotationService = {
  async getQuotations(): Promise<Quotation[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          inquiry:inquiries(
            id, inquiry_number, title,
            customer:customers(id, name, pic_name, pic_phone, pic_email, address)
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotations from Supabase:', error);
        return getStoredQuotations();
      }
      return data as Quotation[];
    }
    return getStoredQuotations().filter((q) => !q.deleted_at);
  },

  async getQuotationById(id: string): Promise<{ quotation: Quotation; items: QuotationItem[] } | null> {
    if (isSupabaseConfigured) {
      const { data: quo, error: quoError } = await supabase
        .from('quotations')
        .select(`
          *,
          inquiry:inquiries(
            id, inquiry_number, title,
            customer:customers(id, name, pic_name, pic_phone, pic_email, address)
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (quoError || !quo) return null;

      const { data: quoItems } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .is('deleted_at', null)
        .order('item_no', { ascending: true });

      return {
        quotation: quo as Quotation,
        items: (quoItems || []) as QuotationItem[],
      };
    }

    const quotes = getStoredQuotations();
    const target = quotes.find((q) => q.id === id && !q.deleted_at);
    if (!target) return null;
    const items = getStoredQuotationItems().filter((it) => it.quotation_id === id);
    return { quotation: target, items };
  },

  async getInternalItems(inquiryId: string, currentRole: UserRole): Promise<InternalQuotation[]> {
    // PRD Hard Rule: Sales & Engineer cannot view internal quotation cost & margin
    if (currentRole !== 'owner' && currentRole !== 'finance') {
      return [];
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('internal_quotations')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .is('deleted_at', null);

      if (error) return getStoredInternalItems().filter((it) => it.inquiry_id === inquiryId);
      return data as InternalQuotation[];
    }

    return getStoredInternalItems().filter((it) => it.inquiry_id === inquiryId);
  },

  async updateTerms(id: string, terms: {
    payment_terms?: string;
    delivery_terms?: string;
    warranty_terms?: string;
    general_terms?: string;
    validity_days?: number;
  }): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('quotations')
        .update({ ...terms, updated_at: new Date().toISOString() })
        .eq('id', id);
      return;
    }

    const quotes = getStoredQuotations();
    const idx = quotes.findIndex((q) => q.id === id);
    if (idx !== -1) {
      quotes[idx] = { ...quotes[idx], ...terms, updated_at: new Date().toISOString() };
      saveStoredQuotations(quotes);
    }
  },
};
