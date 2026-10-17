import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CommercialAnalysis, RiskLevel, UserRole } from '../types/database';

const STORAGE_KEY = 'asf_commercial_analysis_data';

const initialMockAnalysis: Record<string, CommercialAnalysis> = {
  // Analysis for Inquiry 1 (Siemens S7-1500 upgrade)
  'i1111111-1111-1111-1111-111111111111': {
    id: 'ca1',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    total_vendor_cost: 170000000,
    shipping_cost: 5000000,
    customs_duty_cost: 0,
    other_direct_cost: 5000000,
    total_cost: 180000000,
    target_margin_pct: 30,
    risk_buffer_pct: 5,
    risk_level: 'low',
    risk_notes: 'Komponen standar industri dengan garansi distributor resmi Siemens',
    minimum_price: 189000000, // Total cost + 5% risk buffer
    selling_price: 260000000,
    negotiation_room: 71000000, // selling_price - minimum_price
    actual_margin_nominal: 80000000,
    actual_margin_pct: 30.77,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

function getStoredAnalysis(): Record<string, CommercialAnalysis> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockAnalysis));
  return initialMockAnalysis;
}

function saveStoredAnalysis(records: Record<string, CommercialAnalysis>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const commercialAnalysisService = {
  async getAnalysis(inquiryId: string, currentRole: UserRole): Promise<CommercialAnalysis | null> {
    // PRD Hard Rule: Sales and Engineer cannot view commercial analysis
    if (currentRole !== 'owner' && currentRole !== 'finance') {
      return null;
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('commercial_analysis')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .is('deleted_at', null)
        .single();

      if (error) {
        // Fallback to local store
        const records = getStoredAnalysis();
        return records[inquiryId] || null;
      }
      return data as CommercialAnalysis;
    }

    const records = getStoredAnalysis();
    return records[inquiryId] || null;
  },

  async calculateAndSave(
    inquiryId: string,
    params: {
      total_vendor_cost: number;
      shipping_cost: number;
      customs_duty_cost: number;
      other_direct_cost: number;
      target_margin_pct: number;
      risk_buffer_pct: number;
      risk_level: RiskLevel;
      risk_notes?: string;
    },
    currentRole: UserRole
  ): Promise<CommercialAnalysis> {
    if (currentRole !== 'owner' && currentRole !== 'finance') {
      throw new Error('Akses ditolak: Hanya Owner dan Finance yang berhak mengubah analisis komersial.');
    }

    // Formula calculation
    const total_cost = 
      params.total_vendor_cost + 
      params.shipping_cost + 
      params.customs_duty_cost + 
      params.other_direct_cost;

    const risk_amount = total_cost * (params.risk_buffer_pct / 100);
    const minimum_price = total_cost + risk_amount;

    // Selling price based on markup or target margin
    const marginMultiplier = 1 + params.target_margin_pct / 100;
    const rawSellingPrice = total_cost * marginMultiplier + risk_amount;
    // Round to clean thousands
    const selling_price = Math.ceil(rawSellingPrice / 100000) * 100000;

    const negotiation_room = Math.max(0, selling_price - minimum_price);
    const actual_margin_nominal = selling_price - total_cost;
    const actual_margin_pct = total_cost > 0 ? Number(((actual_margin_nominal / selling_price) * 100).toFixed(2)) : 0;

    const recordPayload: Omit<CommercialAnalysis, 'id' | 'created_at' | 'updated_at'> = {
      inquiry_id: inquiryId,
      total_vendor_cost: params.total_vendor_cost,
      shipping_cost: params.shipping_cost,
      customs_duty_cost: params.customs_duty_cost,
      other_direct_cost: params.other_direct_cost,
      total_cost,
      target_margin_pct: params.target_margin_pct,
      risk_buffer_pct: params.risk_buffer_pct,
      risk_level: params.risk_level,
      risk_notes: params.risk_notes || null,
      minimum_price,
      selling_price,
      negotiation_room,
      actual_margin_nominal,
      actual_margin_pct,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('commercial_analysis')
          .upsert(
            {
              ...recordPayload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'inquiry_id' }
          )
          .select()
          .single();

        if (!error && data) {
          return data as CommercialAnalysis;
        }
        console.warn('Supabase commercial_analysis RLS error, falling back to local store:', error?.message);
      } catch (e) {
        console.warn('Supabase commercial_analysis upsert failed, falling back to local store:', e);
      }
    }

    const records = getStoredAnalysis();
    const existing = records[inquiryId];
    const saved: CommercialAnalysis = {
      ...recordPayload,
      id: existing?.id || crypto.randomUUID(),
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    records[inquiryId] = saved;
    saveStoredAnalysis(records);
    return saved;
  },
};
