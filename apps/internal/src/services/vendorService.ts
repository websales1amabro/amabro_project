import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Vendor } from '../types/database';

const STORAGE_KEY = 'asf_vendors_data';

const initialMockVendors: Vendor[] = [
  {
    id: 'v1111111-1111-1111-1111-111111111111',
    code: 'VEND-001',
    name: 'PT Siemens Indonesia (Distributor Resmi)',
    pic_name: 'Bpk. Agus Santoso',
    pic_phone: '0812-1111-2222',
    pic_email: 'sales@siemens-dist.co.id',
    address: 'Kawasan Industri Pulogadung, Jakarta Timur',
    city: 'Jakarta Timur',
    npwp: '01.999.888.7-001.000',
    product_categories: ['PLC', 'HMI', 'SCADA', 'Drive & Inverter'],
    payment_terms: 'Tempo 30 Hari',
    bank_account_info: 'BCA 123-456-7890 a.n. PT Siemens Indo',
    notes: 'Stok S7-1500 & S7-1200 ready stock reguler',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v2222222-2222-2222-2222-222222222222',
    code: 'VEND-002',
    name: 'PT Omron Electronics Automation',
    pic_name: 'Ibu Ratna Sari',
    pic_phone: '0813-3333-4444',
    pic_email: 'ratna@omron-partner.com',
    address: 'Total Building Lantai 8, Tomang, Jakarta Barat',
    city: 'Jakarta Barat',
    npwp: '01.777.666.5-002.000',
    product_categories: ['Sensor & Instrumentasi', 'Safety Light Curtain', 'Relay', 'PLC'],
    payment_terms: 'DP 50%, Pelunasan sebelum barang kirim',
    bank_account_info: 'Mandiri 111-00-9988776-5 a.n. PT Omron Partner',
    notes: 'Lead time sensor berkisar 1 - 2 minggu bila tidak ready',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v3333333-3333-3333-3333-333333333333',
    code: 'VEND-003',
    name: 'PT Delta Automation Solusi',
    pic_name: 'Bpk. Kevin Tan',
    pic_phone: '0817-5555-6666',
    pic_email: 'kevin@delta-dist.id',
    address: 'Ruko Gading Bukit Indah, Kelapa Gading, Jakarta Utara',
    city: 'Jakarta Utara',
    npwp: '02.333.444.5-003.000',
    product_categories: ['Inverter/VFD', 'Servo Motor', 'HMI Panel'],
    payment_terms: 'Tempo 14 Hari',
    bank_account_info: 'BCA 888-999-0011 a.n. PT Delta Automation',
    notes: 'Kuat di inverter seri MS300 dan servo drive ASDA-A2',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v4444444-4444-4444-4444-444444444444',
    code: 'VEND-004',
    name: 'PT Schneider Electric Supply & Switchgear',
    pic_name: 'Bpk. Dimas Pratama',
    pic_phone: '0818-7777-8888',
    pic_email: 'dimas@schneider-agent.co.id',
    address: 'Ventura Building, Cilandak, Jakarta Selatan',
    city: 'Jakarta Selatan',
    npwp: '01.555.444.3-004.000',
    product_categories: ['Panel Listrik', 'MCCB & Contactor', 'PLC Modicon'],
    payment_terms: 'Tempo 30 Hari',
    bank_account_info: 'CIMB Niaga 700-12345-6 a.n. PT Schneider Agent',
    notes: 'Penyedia komponen panel enclosure dan proteksi daya',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStoredMockVendors(): Vendor[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockVendors));
  return initialMockVendors;
}

function saveStoredMockVendors(items: Vendor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const vendorService = {
  async getVendors(): Promise<Vendor[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors from Supabase:', error);
        return getStoredMockVendors();
      }
      return data as Vendor[];
    }
    return getStoredMockVendors().filter((v) => !v.deleted_at);
  },

  async getVendorById(id: string): Promise<Vendor | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      if (error) return null;
      return data as Vendor;
    }
    return getStoredMockVendors().find((v) => v.id === id && !v.deleted_at) || null;
  },

  async createVendor(payload: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendors')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Vendor;
    }

    const items = getStoredMockVendors();
    const newVendor: Vendor = {
      ...payload,
      id: crypto.randomUUID(),
      code: payload.code || `VEND-${String(items.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.unshift(newVendor);
    saveStoredMockVendors(items);
    return newVendor;
  },

  async updateVendor(id: string, payload: Partial<Vendor>): Promise<Vendor> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Vendor;
    }

    const items = getStoredMockVendors();
    const index = items.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vendor tidak ditemukan');
    const updated = {
      ...items[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    items[index] = updated;
    saveStoredMockVendors(items);
    return updated;
  },

  async deleteVendor(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('vendors')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return;
    }

    const items = getStoredMockVendors();
    const index = items.findIndex((v) => v.id === id);
    if (index !== -1) {
      items[index].deleted_at = new Date().toISOString();
      saveStoredMockVendors(items);
    }
  },
};
