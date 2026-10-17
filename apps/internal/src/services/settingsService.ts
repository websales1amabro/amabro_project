import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CompanySettings {
  company_name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  npwp: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  default_lead_time: string;
  default_payment_terms: string;
  default_warranty: string;
  default_validity_days: number;
  min_margin_percent: number;
  wa_quotation_template: string;
  wa_inquiry_template: string;
}

export interface SalesMember {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'sales' | 'engineer';
  region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SETTINGS_STORAGE_KEY = 'asf_company_settings';
const SALES_STORAGE_KEY = 'asf_sales_team';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'PT. AMABRO BINTANG INOVASI',
  tagline: 'Industrial Automation Systems, Instrumentation & Electrical Solutions',
  address: 'Plaza Aminta Lt 5/504, Jl TB Simatupang Kav 10, Jakarta Selatan - DKI Jakarta - Indonesia 12310',
  phone: '021-2292-0544',
  whatsapp: '6281222920544',
  email: 'info@amabroindonesia.com',
  website: 'www.amabroindonesia.com',
  npwp: '01.482.912.4-413.000',
  bank_name: 'Bank Mandiri',
  bank_account_number: '123-00-9876543-2',
  bank_account_holder: 'PT AMABRO BINTANG INOVASI',
  default_lead_time: 'Ready Stock / 2-3 Minggu Ex-works',
  default_payment_terms: '30 Hari setelah invoice & surat jalan diterima (TOP 30)',
  default_warranty: '12 Bulan Garansi Pabrik terhadap cacat manufaktur',
  default_validity_days: 14,
  min_margin_percent: 15,
  wa_quotation_template: `Halo {customer_pic}, terima kasih atas kepercayaan Anda kepada PT. AMABRO BINTANG INOVASI.

Bersama ini kami lampirkan Surat Penawaran Resmi:
📄 No. Penawaran: {quotation_no}
💼 Proyek: {project_title}
💰 Total Nilai: {total_price}
⏳ Masa Berlaku: {validity_days} Hari

Dokumen PDF resmi telah kami siapkan. Jika ada klarifikasi teknis maupun komersial, silakan hubungi kami.

Hormat kami,
{sales_name} ({sales_phone})
PT. AMABRO BINTANG INOVASI`,
  wa_inquiry_template: `Halo {customer_pic},

Inquiry Anda mengenai "{project_title}" telah kami terima dengan nomor registrasi {inquiry_no}.
Sales Engineer kami ({sales_name}) sedang menyiapkan penawaran teknis dan komersial terbaik untuk Anda.

Salam,
PT. AMABRO BINTANG INOVASI`,
};

export const DEFAULT_SALES_TEAM: SalesMember[] = [
  {
    id: 's-001',
    full_name: 'Rian Pratama, S.T.',
    email: 'rian.pratama@amabroindonesia.com',
    phone: '6281288880101',
    role: 'sales',
    region: 'Jabodetabek & Banten',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-002',
    full_name: 'Budi Santoso, S.T.',
    email: 'budi.santoso@amabroindonesia.com',
    phone: '6281377770202',
    role: 'sales',
    region: 'Jawa Barat (Cikarang, Karawang, Bandung)',
    is_active: true,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-003',
    full_name: 'Dedi Kurniawan',
    email: 'dedi.k@amabroindonesia.com',
    phone: '6281166660303',
    role: 'sales',
    region: 'Jawa Tengah & Jawa Timur (Semarang, Surabaya)',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-004',
    full_name: 'Dewi Lestari, S.T.',
    email: 'dewi.lestari@amabroindonesia.com',
    phone: '6281555550404',
    role: 'engineer',
    region: 'Technical Sales / Systems Support',
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const settingsService = {
  // ==========================================
  // COMPANY & GENERAL SETTINGS
  // ==========================================
  getCompanySettings: async (): Promise<CompanySettings> => {
    // 1. Try local storage cache first for instant UI response
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let settings: CompanySettings = cached ? { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(cached) } : DEFAULT_COMPANY_SETTINGS;

    // 2. If Supabase configured, attempt to sync from site_settings table
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          settings = {
            ...settings,
            company_name: data.company_name || settings.company_name,
            tagline: data.tagline || settings.tagline,
            email: data.email || settings.email,
            phone: data.phone || settings.phone,
            whatsapp: data.whatsapp || settings.whatsapp,
            address: data.address || settings.address,
          };
          // Save merged back to cache
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        }
      } catch (err) {
        console.warn('Could not fetch settings from Supabase, using local fallback:', err);
      }
    }

    return settings;
  },

  saveCompanySettings: async (settings: CompanySettings): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Save to localStorage
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

      // 2. If Supabase configured, sync with site_settings table
      if (isSupabaseConfigured) {
        try {
          const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .limit(1)
            .maybeSingle();

          const payload = {
            company_name: settings.company_name,
            tagline: settings.tagline,
            email: settings.email,
            phone: settings.phone,
            whatsapp: settings.whatsapp,
            address: settings.address,
            updated_at: new Date().toISOString(),
          };

          if (existing?.id) {
            await supabase
              .from('site_settings')
              .update(payload)
              .eq('id', existing.id);
          } else {
            await supabase
              .from('site_settings')
              .insert([payload]);
          }
        } catch (dbErr) {
          console.warn('Failed to sync settings to Supabase, local cache updated successfully:', dbErr);
        }
      }

      // Dispatch custom event so open components (like Quotation) can react immediately
      window.dispatchEvent(new Event('amabro_settings_updated'));

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: message };
    }
  },

  // ==========================================
  // SALES TEAM MAINTENANCE
  // ==========================================
  getSalesTeam: async (): Promise<SalesMember[]> => {
    // 1. Try local storage
    const local = localStorage.getItem(SALES_STORAGE_KEY);
    let team: SalesMember[] = local ? JSON.parse(local) : DEFAULT_SALES_TEAM;

    // 2. If Supabase is available, merge/load from profiles
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['sales', 'engineer'])
          .order('full_name', { ascending: true });

        if (!error && data && data.length > 0) {
          team = data.map((p) => {
            // Find existing local data for region and phone if missing in DB
            const existing = team.find((t) => t.email === p.email || t.id === p.id);
            return {
              id: p.id,
              full_name: p.full_name,
              email: p.email,
              phone: p.phone || existing?.phone || '628120000000',
              role: (p.role as 'sales' | 'engineer') || 'sales',
              region: existing?.region || 'Nasional',
              is_active: p.is_active ?? true,
              created_at: p.created_at || new Date().toISOString(),
              updated_at: p.updated_at || new Date().toISOString(),
            };
          });
          localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(team));
        }
      } catch (err) {
        console.warn('Could not fetch profiles from Supabase, using local team list:', err);
      }
    }

    return team;
  },

  createSalesMember: async (member: Omit<SalesMember, 'id' | 'created_at' | 'updated_at'>): Promise<SalesMember> => {
    const newId = 's-' + Date.now();
    const newMember: SalesMember = {
      ...member,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local storage
    const current = await settingsService.getSalesTeam();
    const updated = [newMember, ...current];
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updated));

    // Also attempt to insert to Supabase profiles if possible
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert([
          {
            id: crypto.randomUUID ? crypto.randomUUID() : newId,
            full_name: member.full_name,
            email: member.email,
            phone: member.phone,
            role: member.role,
            is_active: member.is_active,
          },
        ]);
      } catch (dbErr) {
        console.warn('Could not sync new profile to Supabase:', dbErr);
      }
    }

    window.dispatchEvent(new Event('amabro_sales_updated'));
    return newMember;
  },

  updateSalesMember: async (id: string, updates: Partial<SalesMember>): Promise<SalesMember> => {
    const current = await settingsService.getSalesTeam();
    const index = current.findIndex((m) => m.id === id);

    if (index === -1) {
      throw new Error('Sales member not found');
    }

    const updatedItem: SalesMember = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[index] = updatedItem;
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(current));

    // Sync to Supabase profiles
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updatedItem.full_name,
            phone: updatedItem.phone,
            is_active: updatedItem.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (dbErr) {
        console.warn('Could not sync updated profile to Supabase:', dbErr);
      }
    }

    window.dispatchEvent(new Event('amabro_sales_updated'));
    return updatedItem;
  },

  deleteSalesMember: async (id: string): Promise<boolean> => {
    const current = await settingsService.getSalesTeam();
    const updated = current.filter((m) => m.id !== id);
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (dbErr) {
        console.warn('Could not delete profile in Supabase:', dbErr);
      }
    }

    window.dispatchEvent(new Event('amabro_sales_updated'));
    return true;
  },
};
