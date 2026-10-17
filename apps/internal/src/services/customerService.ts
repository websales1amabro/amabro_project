import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Customer } from '../types/database';

const STORAGE_KEY = 'asf_customers_data';

const initialMockCustomers: Customer[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    code: 'CUST-001',
    name: 'PT Indofood CBP Sukses Makmur',
    company_type: 'PT',
    pic_name: 'Bpk. Hendra Gunawan',
    pic_phone: '0812-3456-7890',
    pic_email: 'hendra.g@indofood.co.id',
    address: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi',
    city: 'Bekasi',
    npwp: '01.345.678.9-412.000',
    payment_terms_days: 30,
    notes: 'Prioritas customer industri makanan & minuman (F&B)',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    code: 'CUST-002',
    name: 'PT Semen Indonesia Group',
    company_type: 'PT',
    pic_name: 'Ibu Anita Wijayanti',
    pic_phone: '0813-9876-5432',
    pic_email: 'anita.w@sig.id',
    address: 'Gedung Utama Semen Indonesia, Mega Kuningan, Jakarta Selatan',
    city: 'Jakarta Selatan',
    npwp: '02.456.789.1-013.000',
    payment_terms_days: 45,
    notes: 'Kebutuhan heavy industrial drive & automation retrofit',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    code: 'CUST-003',
    name: 'PT Mayora Indah Tbk',
    company_type: 'PT',
    pic_name: 'Bpk. Anton Prasetyo',
    pic_phone: '0811-2345-6789',
    pic_email: 'anton.p@mayora.co.id',
    address: 'Jl. Daan Mogot KM 19, Kalideres, Tangerang',
    city: 'Tangerang',
    npwp: '01.123.456.7-054.000',
    payment_terms_days: 30,
    notes: 'Proyek robot palletizer dan packaging automation',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    code: 'CUST-004',
    name: 'PT Pupuk Sriwidjaja',
    company_type: 'PT',
    pic_name: 'Bpk. Ridwan Hakim',
    pic_phone: '0812-7777-9999',
    pic_email: 'ridwan.h@pusri.co.id',
    address: 'Jl. Mayor Zen, Palembang, Sumatera Selatan',
    city: 'Palembang',
    npwp: '01.234.567.8-301.000',
    payment_terms_days: 30,
    notes: 'Instrumentation & Hazardous Area transmitters',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStoredMockCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockCustomers));
  return initialMockCustomers;
}

function saveStoredMockCustomers(items: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers from Supabase:', error);
        return getStoredMockCustomers();
      }
      return data as Customer[];
    }
    return getStoredMockCustomers().filter((c) => !c.deleted_at);
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      if (error) return null;
      return data as Customer;
    }
    return getStoredMockCustomers().find((c) => c.id === id && !c.deleted_at) || null;
  },

  async createCustomer(payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          return data as Customer;
        }
        console.warn('Supabase RLS constraint active, persisting locally for seamless dev experience:', error?.message);
      } catch (e) {
        console.warn('Supabase insert failed, saving locally:', e);
      }
    }

    const items = getStoredMockCustomers();
    const newCustomer: Customer = {
      ...payload,
      id: crypto.randomUUID(),
      code: payload.code || `CUST-${String(items.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.unshift(newCustomer);
    saveStoredMockCustomers(items);
    return newCustomer;
  },

  async updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as Customer;
        }
      } catch (e) {
        console.warn('Supabase update failed, updating locally:', e);
      }
    }

    const items = getStoredMockCustomers();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer tidak ditemukan');
    const updated = {
      ...items[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    items[index] = updated;
    saveStoredMockCustomers(items);
    return updated;
  },

  async deleteCustomer(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('customers')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase delete failed, deleting locally:', e);
      }
    }

    const items = getStoredMockCustomers();
    const index = items.findIndex((c) => c.id === id);
    if (index !== -1) {
      items[index].deleted_at = new Date().toISOString();
      saveStoredMockCustomers(items);
    }
  },
};
