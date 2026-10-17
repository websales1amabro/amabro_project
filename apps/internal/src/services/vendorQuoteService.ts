import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { VendorQuote } from '../types/database';

const STORAGE_KEY = 'asf_vendor_quotes_data';

const initialMockQuotes: VendorQuote[] = [
  // For Item 1 (Siemens S7-1500) on Inquiry 1
  {
    id: 'vq1',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_id: 'it1',
    vendor_id: 'v1111111-1111-1111-1111-111111111111', // PT Siemens Indonesia
    unit_price: 85000000,
    currency: 'IDR',
    exchange_rate: 1,
    unit_price_idr: 85000000,
    lead_time_days: 7,
    warranty_period: '12 Bulan Resmi Siemens',
    validity_date: '2026-11-15',
    payment_terms: 'Tempo 30 Hari',
    quote_reference: 'SIEM-QT-2026-991',
    notes: 'Unit garansi distributor resmi PT Siemens Indonesia',
    is_selected: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vendor: {
      id: 'v1111111-1111-1111-1111-111111111111',
      name: 'PT Siemens Indonesia (Distributor Resmi)',
      product_categories: ['PLC', 'HMI'],
      payment_terms_days: 30,
      created_at: '',
      updated_at: '',
    } as any,
  },
  {
    id: 'vq2',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_id: 'it1',
    vendor_id: 'v4444444-4444-4444-4444-444444444444',
    unit_price: 89000000,
    currency: 'IDR',
    exchange_rate: 1,
    unit_price_idr: 89000000,
    lead_time_days: 14,
    warranty_period: '12 Bulan',
    validity_date: '2026-11-01',
    payment_terms: 'Tempo 14 Hari',
    quote_reference: 'SCH-OFFER-77',
    notes: 'Alternatif supplier',
    is_selected: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vendor: {
      id: 'v4444444-4444-4444-4444-444444444444',
      name: 'PT Schneider Electric Supply & Switchgear',
      product_categories: ['Panel'],
      payment_terms_days: 14,
      created_at: '',
      updated_at: '',
    } as any,
  },
  // For Item 2 (WinCC RT V18)
  {
    id: 'vq3',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_id: 'it2',
    vendor_id: 'v1111111-1111-1111-1111-111111111111',
    unit_price: 45000000,
    currency: 'IDR',
    exchange_rate: 1,
    unit_price_idr: 45000000,
    lead_time_days: 3,
    warranty_period: 'Software License Lifetime',
    validity_date: '2026-11-15',
    payment_terms: 'Tempo 30 Hari',
    quote_reference: 'SIEM-SW-102',
    notes: 'USB Dongle Hardware License included',
    is_selected: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vendor: {
      id: 'v1111111-1111-1111-1111-111111111111',
      name: 'PT Siemens Indonesia (Distributor Resmi)',
      product_categories: ['SCADA'],
      payment_terms_days: 30,
      created_at: '',
      updated_at: '',
    } as any,
  },
];

function getStoredQuotes(): VendorQuote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockQuotes));
  return initialMockQuotes;
}

function saveStoredQuotes(items: VendorQuote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const vendorQuoteService = {
  async getQuotesByInquiry(inquiryId: string): Promise<VendorQuote[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendor_quotes')
        .select(`
          *,
          vendor:vendors(id, name, pic_name, pic_phone, payment_terms)
        `)
        .eq('inquiry_id', inquiryId)
        .is('deleted_at', null)
        .order('unit_price_idr', { ascending: true });

      if (error) {
        console.error('Error fetching quotes from Supabase:', error);
        return getStoredQuotes().filter((q) => q.inquiry_id === inquiryId);
      }
      return data as VendorQuote[];
    }
    return getStoredQuotes().filter((q) => q.inquiry_id === inquiryId && !q.deleted_at);
  },

  async addVendorQuote(quote: {
    inquiry_id: string;
    item_id: string;
    vendor_id: string;
    unit_price: number;
    currency: string;
    exchange_rate: number;
    lead_time_days?: number;
    warranty_period?: string;
    validity_date?: string;
    payment_terms?: string;
    quote_reference?: string;
    notes?: string;
    vendor_name?: string;
  }): Promise<VendorQuote> {
    const unitPriceIdr = quote.unit_price * (quote.exchange_rate || 1);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendor_quotes')
        .insert({
          inquiry_id: quote.inquiry_id,
          item_id: quote.item_id,
          vendor_id: quote.vendor_id,
          unit_price: quote.unit_price,
          currency: quote.currency || 'IDR',
          exchange_rate: quote.exchange_rate || 1,
          lead_time_days: quote.lead_time_days,
          warranty_period: quote.warranty_period,
          validity_date: quote.validity_date,
          payment_terms: quote.payment_terms,
          quote_reference: quote.quote_reference,
          notes: quote.notes,
          is_selected: false,
        })
        .select(`
          *,
          vendor:vendors(id, name, pic_name, pic_phone, payment_terms)
        `)
        .single();

      if (error) throw error;
      return data as VendorQuote;
    }

    const quotes = getStoredQuotes();
    const newQuote: VendorQuote = {
      id: crypto.randomUUID(),
      inquiry_id: quote.inquiry_id,
      item_id: quote.item_id,
      vendor_id: quote.vendor_id,
      unit_price: quote.unit_price,
      currency: quote.currency || 'IDR',
      exchange_rate: quote.exchange_rate || 1,
      unit_price_idr: unitPriceIdr,
      lead_time_days: quote.lead_time_days || null,
      warranty_period: quote.warranty_period || null,
      validity_date: quote.validity_date || null,
      payment_terms: quote.payment_terms || null,
      quote_reference: quote.quote_reference || null,
      notes: quote.notes || null,
      is_selected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendor: {
        id: quote.vendor_id,
        name: quote.vendor_name || 'Vendor Terpilih',
        product_categories: [],
      } as any,
    };

    quotes.push(newQuote);
    saveStoredQuotes(quotes);
    return newQuote;
  },

  async selectVendorQuote(itemId: string, quoteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      // Deselect all other quotes for this item
      await supabase
        .from('vendor_quotes')
        .update({ is_selected: false, updated_at: new Date().toISOString() })
        .eq('item_id', itemId);

      // Select chosen quote
      await supabase
        .from('vendor_quotes')
        .update({ is_selected: true, updated_at: new Date().toISOString() })
        .eq('id', quoteId);
      return;
    }

    const quotes = getStoredQuotes();
    quotes.forEach((q) => {
      if (q.item_id === itemId) {
        q.is_selected = q.id === quoteId;
        q.updated_at = new Date().toISOString();
      }
    });
    saveStoredQuotes(quotes);
  },

  async deleteVendorQuote(quoteId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('vendor_quotes').delete().eq('id', quoteId);
      return;
    }

    const quotes = getStoredQuotes().filter((q) => q.id !== quoteId);
    saveStoredQuotes(quotes);
  },
};
