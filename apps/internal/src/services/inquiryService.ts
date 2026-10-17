import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Inquiry, InquiryItem, InquiryStatus, InquiryPriority, InquirySource } from '../types/database';

const INQUIRIES_STORAGE_KEY = 'asf_inquiries_data';
const INQUIRY_ITEMS_STORAGE_KEY = 'asf_inquiry_items_data';

const initialMockInquiries: Inquiry[] = [
  {
    id: 'i1111111-1111-1111-1111-111111111111',
    inquiry_number: 'INQ/2026/10/0004',
    customer_id: 'c1111111-1111-1111-1111-111111111111',
    title: 'Upgrade PLC Siemens S7-1500 & SCADA WinCC',
    description: 'Modernisasi sistem kontrol packaging line 4 dari S7-300 ke S7-1500 dengan integrasi WinCC RT',
    source: 'website',
    contact_name: 'Bpk. Hendra Gunawan',
    contact_email: 'hendra.g@indofood.co.id',
    contact_phone: '0812-3456-7890',
    status: 'waiting_approval',
    priority: 'high',
    deadline: '2026-10-24',
    estimated_value: 420000000,
    created_at: '2026-10-17T08:30:00Z',
    updated_at: '2026-10-17T11:30:00Z',
    customer: {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'PT Indofood CBP Sukses Makmur',
      payment_terms_days: 30,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'i2222222-2222-2222-2222-222222222222',
    inquiry_number: 'INQ/2026/10/0003',
    customer_id: 'c2222222-2222-2222-2222-222222222222',
    title: 'Retrofit Inverter VFD 75kW & Control Panel',
    description: 'Penggantian drive motor fan clinker cooler dengan VFD Delta CP2000 75kW include enclosure IP54',
    source: 'internal',
    status: 'commercial_analysis',
    priority: 'high',
    deadline: '2026-10-22',
    estimated_value: 185000000,
    created_at: '2026-10-16T10:15:00Z',
    updated_at: '2026-10-16T14:20:00Z',
    customer: {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'PT Semen Indonesia Group',
      payment_terms_days: 45,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'i3333333-3333-3333-3333-333333333333',
    inquiry_number: 'INQ/2026/10/0002',
    customer_id: 'c4444444-4444-4444-4444-444444444444',
    title: 'Sensor Instrumentation & Pressure Transmitter',
    description: 'Pengadaan transmitter tekanan 0-10 bar output 4-20mA explosion proof area boiler',
    source: 'website',
    contact_name: 'Bpk. Ridwan Hakim',
    contact_email: 'ridwan.h@pusri.co.id',
    contact_phone: '0812-7777-9999',
    status: 'vendor_sourcing',
    priority: 'medium',
    deadline: '2026-10-28',
    estimated_value: 95000000,
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T15:00:00Z',
    customer: {
      id: 'c4444444-4444-4444-4444-444444444444',
      name: 'PT Pupuk Sriwidjaja',
      payment_terms_days: 30,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'i4444444-4444-4444-4444-444444444444',
    inquiry_number: 'INQ/2026/10/0001',
    customer_id: 'c3333333-3333-3333-3333-333333333333',
    title: 'Robot Palletizer & Safety Interlock Cage',
    description: 'Sistem integrasi robot palletizing biskuit kardus kecepatan 20 box/menit dengan safety fence',
    source: 'internal',
    status: 'technical_analysis',
    priority: 'urgent',
    deadline: '2026-10-20',
    estimated_value: 785000000,
    created_at: '2026-10-14T07:45:00Z',
    updated_at: '2026-10-14T11:00:00Z',
    customer: {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'PT Mayora Indah Tbk',
      payment_terms_days: 30,
      created_at: '',
      updated_at: '',
    },
  },
];

const initialMockInquiryItems: InquiryItem[] = [
  {
    id: 'it1',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_no: 1,
    item_name: 'CPU Siemens S7-1500 (1516-3 PN/DP)',
    specifications: '6ES7516-3AN02-0AB0, 1MB Code, 5MB Data, 3 Profinet ports',
    brand: 'Siemens',
    quantity: 1,
    unit: 'Unit',
    is_feasible: true,
    technical_notes: 'Kompatibel dengan arsitektur eksisting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'it2',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_no: 2,
    item_name: 'Software SCADA Siemens WinCC RT V18 (2048 PT)',
    specifications: '6AV2102-0AA08-0AA0, Runtime License USB Dongle',
    brand: 'Siemens',
    quantity: 1,
    unit: 'License',
    is_feasible: true,
    technical_notes: 'Dijalankan di PC Industri IPC427E',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'it3',
    inquiry_id: 'i1111111-1111-1111-1111-111111111111',
    item_no: 3,
    item_name: 'Jasa Engineering, Logic Migration, & On-site Testing',
    specifications: 'Konversi program S7-300 ke S7-1500, HMI migration, 5 hari komisioning',
    brand: 'In-house Engineering',
    quantity: 1,
    unit: 'Lot',
    is_feasible: true,
    technical_notes: 'Tim teknis ready jadwal minggu ke-4 Oktober',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStoredInquiries(): Inquiry[] {
  try {
    const data = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(initialMockInquiries));
  return initialMockInquiries;
}

function saveStoredInquiries(items: Inquiry[]) {
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(items));
}

function getStoredItems(): InquiryItem[] {
  try {
    const data = localStorage.getItem(INQUIRY_ITEMS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(INQUIRY_ITEMS_STORAGE_KEY, JSON.stringify(initialMockInquiryItems));
  return initialMockInquiryItems;
}

function saveStoredItems(items: InquiryItem[]) {
  localStorage.setItem(INQUIRY_ITEMS_STORAGE_KEY, JSON.stringify(items));
}

export const inquiryService = {
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          customer:customers(id, name, pic_name, pic_phone, payment_terms_days),
          assignee:profiles!assigned_to(id, full_name, email, role)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries from Supabase:', error);
        return getStoredInquiries();
      }
      return data as Inquiry[];
    }
    return getStoredInquiries().filter((i) => !i.deleted_at);
  },

  async getInquiryById(id: string): Promise<Inquiry | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          customer:customers(id, name, pic_name, pic_phone, address, npwp, payment_terms_days),
          assignee:profiles!assigned_to(id, full_name, email, role)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) return null;
      return data as Inquiry;
    }
    return getStoredInquiries().find((i) => i.id === id && !i.deleted_at) || null;
  },

  async createInquiry(payload: {
    customer_id?: string;
    title: string;
    description?: string;
    source: InquirySource;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    priority: InquiryPriority;
    deadline?: string;
    estimated_value?: number;
    assigned_to?: string;
    items?: Omit<InquiryItem, 'id' | 'inquiry_id' | 'created_at' | 'updated_at'>[];
  }): Promise<Inquiry> {
    if (isSupabaseConfigured) {
      // Get atomic sequence number from database
      const { data: seqData, error: seqError } = await supabase.rpc('next_document_number', {
        p_code: 'INQ',
      });
      const inqNumber = seqError ? `INQ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(Math.random() * 9000 + 1000)}` : seqData;

      try {
        const { data, error } = await supabase
          .from('inquiries')
          .insert({
            inquiry_number: inqNumber,
            customer_id: payload.customer_id,
            title: payload.title,
            description: payload.description,
            source: payload.source,
            contact_name: payload.contact_name,
            contact_email: payload.contact_email,
            contact_phone: payload.contact_phone,
            priority: payload.priority,
            deadline: payload.deadline,
            estimated_value: payload.estimated_value || 0,
            assigned_to: payload.assigned_to,
            status: 'inquiry',
          })
          .select()
          .single();

        if (!error && data) {
          // Insert items if present
          if (payload.items && payload.items.length > 0) {
            const itemRows = payload.items.map((it, idx) => ({
              ...it,
              inquiry_id: data.id,
              item_no: idx + 1,
            }));
            await supabase.from('inquiry_items').insert(itemRows);
          }
          return data as Inquiry;
        }
        console.warn('Supabase createInquiry error, falling back to local:', error?.message);
      } catch (e) {
        console.warn('Supabase createInquiry failed, falling back to local storage:', e);
      }
    }

    // Local persistent mock
    const inquiries = getStoredInquiries();
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(inquiries.length + 1).padStart(4, '0');
    const generatedNumber = `INQ/${currentYear}/${currentMonth}/${seq}`;

    const newInquiry: Inquiry = {
      id: crypto.randomUUID(),
      inquiry_number: generatedNumber,
      customer_id: payload.customer_id || null,
      title: payload.title,
      description: payload.description || '',
      source: payload.source || 'internal',
      contact_name: payload.contact_name || null,
      contact_email: payload.contact_email || null,
      contact_phone: payload.contact_phone || null,
      status: 'inquiry',
      priority: payload.priority || 'medium',
      deadline: payload.deadline || null,
      estimated_value: payload.estimated_value || 0,
      assigned_to: payload.assigned_to || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inquiries.unshift(newInquiry);
    saveStoredInquiries(inquiries);

    if (payload.items && payload.items.length > 0) {
      const allItems = getStoredItems();
      payload.items.forEach((it, idx) => {
        allItems.push({
          ...it,
          id: crypto.randomUUID(),
          inquiry_id: newInquiry.id,
          item_no: idx + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
      saveStoredItems(allItems);
    }

    return newInquiry;
  },

  async updateInquiryStatus(id: string, newStatus: InquiryStatus): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('inquiries')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) return;
        console.warn('Supabase updateInquiryStatus error, falling back to local:', error?.message);
      } catch (e) {
        console.warn('Supabase updateInquiryStatus failed, falling back to local:', e);
      }
    }

    const items = getStoredInquiries();
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx].status = newStatus;
      items[idx].updated_at = new Date().toISOString();
      saveStoredInquiries(items);
    }
  },

  async getInquiryItems(inquiryId: string): Promise<InquiryItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('inquiry_items')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .is('deleted_at', null)
        .order('item_no', { ascending: true });

      if (error) return [];
      return data as InquiryItem[];
    }
    return getStoredItems().filter((it) => it.inquiry_id === inquiryId);
  },

  async addInquiryItem(item: Omit<InquiryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InquiryItem> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('inquiry_items')
          .insert(item)
          .select()
          .single();
        if (!error && data) {
          return data as InquiryItem;
        }
        console.warn('Supabase RLS active on inquiry_items, saving to local state:', error?.message);
      } catch (e) {
        console.warn('Supabase addInquiryItem failed, saving locally:', e);
      }
    }

    const allItems = getStoredItems();
    const newItem: InquiryItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allItems.push(newItem);
    saveStoredItems(allItems);
    return newItem;
  },
};
