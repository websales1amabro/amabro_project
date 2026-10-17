import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  CustomerPO, 
  VendorPO, 
  VendorPOItem, 
  DeliveryOrder, 
  DeliveryOrderItem, 
  Invoice, 
  InvoiceItem, 
  Payment 
} from '../types/database';

const STORAGE_KEYS = {
  CUSTOMER_POS: 'amabro_customer_pos',
  VENDOR_POS: 'amabro_vendor_pos',
  DELIVERY_ORDERS: 'amabro_delivery_orders',
  INVOICES: 'amabro_invoices',
  PAYMENTS: 'amabro_payments',
};

// Seed realistic initial mock transaction data
const INITIAL_CUSTOMER_POS: CustomerPO[] = [
  {
    id: 'cpo-001',
    po_number: 'PO-MAYORA-2026-089',
    internal_ref: 'POC/2026/10/0001',
    quotation_id: 'q-001',
    inquiry_id: 'inq-001',
    customer_id: 'cust-1',
    po_date: '2026-10-14',
    total_amount: 145000000,
    tax_amount: 15950000,
    grand_total: 160950000,
    payment_terms: 'DP 30%, Pelunasan 70% BAST',
    delivery_deadline: '2026-11-20',
    attachment_url: 'https://example.com/docs/po-mayora-089.pdf',
    status: 'in_progress',
    notes: 'Prioritas lini packaging Plant Cibitung. Mohon konfirmasi jadwal FAT.',
    created_at: new Date('2026-10-14T09:00:00Z').toISOString(),
    updated_at: new Date('2026-10-14T09:00:00Z').toISOString(),
    customer: {
      id: 'cust-1',
      name: 'PT Mayora Indah Tbk',
      city: 'Tangerang',
      payment_terms_days: 30,
      created_at: '',
      updated_at: ''
    }
  }
];

const INITIAL_VENDOR_POS: VendorPO[] = [
  {
    id: 'vpo-001',
    po_number: 'POV/AMB/2026/10/0001',
    vendor_id: 'v-1',
    inquiry_id: 'inq-001',
    quotation_id: 'q-001',
    po_date: '2026-10-15',
    expected_delivery_date: '2026-11-05',
    currency: 'IDR',
    exchange_rate: 1,
    subtotal: 92000000,
    tax_rate: 11,
    tax_amount: 10120000,
    grand_total: 102120000,
    payment_terms: 'CBD (Cash Before Delivery)',
    shipping_address: 'Workshop Amabro Automation, Kawasan Industri Jababeka II, Cikarang',
    notes: 'Sertakan Certificate of Origin & Test Report dari Siemens.',
    status: 'sent',
    created_at: new Date('2026-10-15T11:00:00Z').toISOString(),
    updated_at: new Date('2026-10-15T11:00:00Z').toISOString(),
    vendor: {
      id: 'v-1',
      name: 'PT Siemens Indonesia Distributor',
      city: 'Jakarta Timur',
      product_categories: ['PLC', 'Inverter'],
      created_at: '',
      updated_at: ''
    },
    items: [
      {
        id: 'vpi-1',
        vendor_po_id: 'vpo-001',
        item_name: 'PLC Siemens S7-1500 (CPU 1515-2 PN)',
        specifications: 'Work memory 500 KB code, 3 MB data, PROFINET IO IRT interface',
        brand: 'Siemens',
        quantity: 2,
        unit: 'Set',
        unit_price: 36000000,
        total_price: 72000000,
        lead_time_days: 14,
        received_quantity: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'vpi-2',
        vendor_po_id: 'vpo-001',
        item_name: 'Digital Input/Output Module 32-ch',
        specifications: 'SM 521 DI 32x24VDC HF + SM 522 DQ 32x24VDC/0.5A ST',
        brand: 'Siemens',
        quantity: 4,
        unit: 'Unit',
        unit_price: 5000000,
        total_price: 20000000,
        lead_time_days: 14,
        received_quantity: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

const INITIAL_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 'do-001',
    do_number: 'DO/AMB/2026/10/0001',
    customer_id: 'cust-1',
    customer_po_id: 'cpo-001',
    quotation_id: 'q-001',
    delivery_date: '2026-10-16',
    shipping_address: 'PT Mayora Indah Tbk, Factory 2 Cibitung, Jl. Raya Jawa No. 12, Bekasi',
    courier_name: 'Ekspedisi Internal Amabro (Bpk. Mulyadi)',
    vehicle_number: 'B 9482 KCA (Blind Van)',
    recipient_name: 'Ir. Danang Prasetyo (Lead Automation Mayora)',
    received_at: '2026-10-16T14:30:00Z',
    status: 'delivered',
    notes: 'Pengiriman Partial Tahap 1 (Kabel tray & sensor optik). Komponen kontrol menyusul.',
    created_at: new Date('2026-10-16T08:00:00Z').toISOString(),
    updated_at: new Date('2026-10-16T15:00:00Z').toISOString(),
    customer: {
      id: 'cust-1',
      name: 'PT Mayora Indah Tbk',
      city: 'Tangerang',
      payment_terms_days: 30,
      created_at: '',
      updated_at: ''
    },
    items: [
      {
        id: 'doi-1',
        delivery_order_id: 'do-001',
        item_name: 'Optical Sensor Sick WTB4S-3P2261',
        specifications: 'Range 20-350mm, PNP LO/DO',
        quantity_ordered: 6,
        quantity_delivered: 6,
        unit: 'Unit',
        notes: 'Lolos uji fungsi awal',
        created_at: new Date().toISOString()
      }
    ]
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoice_number: 'INV/AMB/2026/10/0001',
    customer_id: 'cust-1',
    customer_po_id: 'cpo-001',
    quotation_id: 'q-001',
    invoice_date: '2026-10-14',
    due_date: '2026-10-28',
    termin_type: 'dp',
    termin_percentage: 30,
    subtotal: 43500000,
    tax_rate: 11,
    tax_amount: 4785000,
    grand_total: 48285000,
    paid_amount: 48285000,
    remaining_amount: 0,
    payment_status: 'paid',
    bank_account_info: 'BCA KCP Cikarang 883-0912-334 a/n PT Amabro Otomasi Industri',
    notes: 'Uang Muka (DP) 30% PO-MAYORA-2026-089',
    sent_at: '2026-10-14T10:00:00Z',
    created_at: new Date('2026-10-14T09:30:00Z').toISOString(),
    updated_at: new Date('2026-10-15T16:00:00Z').toISOString(),
    customer: {
      id: 'cust-1',
      name: 'PT Mayora Indah Tbk',
      city: 'Tangerang',
      payment_terms_days: 30,
      created_at: '',
      updated_at: ''
    },
    items: [
      {
        id: 'ii-1',
        invoice_id: 'inv-001',
        item_name: 'Down Payment (DP 30%) - Revamp Sistem Otomasi Packaging Line 4',
        specifications: 'Sesuai Kontrak PO-MAYORA-2026-089',
        quantity: 1,
        unit: 'Lot',
        unit_price: 43500000,
        total_price: 43500000,
        created_at: new Date().toISOString()
      }
    ],
    payments: [
      {
        id: 'pay-001',
        invoice_id: 'inv-001',
        payment_number: 'PAY/2026/10/0001',
        payment_date: '2026-10-15',
        amount: 48285000,
        payment_method: 'bank_transfer',
        reference_number: 'TRF-BCA-9938102',
        notes: 'DP 30% ditransfer penuh dari rekening Mayora Pusat.',
        created_at: new Date('2026-10-15T16:00:00Z').toISOString()
      }
    ]
  },
  {
    id: 'inv-002',
    invoice_number: 'INV/AMB/2026/10/0002',
    customer_id: 'cust-1',
    customer_po_id: 'cpo-001',
    quotation_id: 'q-001',
    delivery_order_id: 'do-001',
    invoice_date: '2026-10-16',
    due_date: '2026-11-15',
    termin_type: 'pelunasan',
    termin_percentage: 70,
    subtotal: 101500000,
    tax_rate: 11,
    tax_amount: 11165000,
    grand_total: 112665000,
    paid_amount: 0,
    remaining_amount: 112665000,
    payment_status: 'sent',
    bank_account_info: 'BCA KCP Cikarang 883-0912-334 a/n PT Amabro Otomasi Industri',
    notes: 'Penagihan Termin Pelunasan 70% setelah pengiriman dan BAST parsial.',
    sent_at: '2026-10-16T16:00:00Z',
    created_at: new Date('2026-10-16T15:30:00Z').toISOString(),
    updated_at: new Date('2026-10-16T16:00:00Z').toISOString(),
    customer: {
      id: 'cust-1',
      name: 'PT Mayora Indah Tbk',
      city: 'Tangerang',
      payment_terms_days: 30,
      created_at: '',
      updated_at: ''
    },
    items: [
      {
        id: 'ii-2',
        invoice_id: 'inv-002',
        item_name: 'Pelunasan 70% - Revamp Sistem Otomasi Packaging Line 4',
        specifications: 'Pengiriman & BAST DO/AMB/2026/10/0001',
        quantity: 1,
        unit: 'Lot',
        unit_price: 101500000,
        total_price: 101500000,
        created_at: new Date().toISOString()
      }
    ],
    payments: []
  }
];

export const transactionService = {
  // ----------------------------------------------------
  // CUSTOMER POs (PO Masuk)
  // ----------------------------------------------------
  async getCustomerPOs(): Promise<CustomerPO[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('customer_pos')
        .select('*, customer:customers(*), quotation:quotations(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer POs from Supabase:', error);
      } else if (data && data.length > 0) {
        return data as CustomerPO[];
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.CUSTOMER_POS);
    if (!local) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_POS, JSON.stringify(INITIAL_CUSTOMER_POS));
      return INITIAL_CUSTOMER_POS;
    }
    return JSON.parse(local);
  },

  async createCustomerPO(poData: Omit<CustomerPO, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerPO> {
    const newPO: CustomerPO = {
      ...poData,
      id: `cpo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('customer_pos')
        .insert([{
          po_number: poData.po_number,
          internal_ref: poData.internal_ref,
          quotation_id: poData.quotation_id,
          inquiry_id: poData.inquiry_id,
          customer_id: poData.customer_id,
          po_date: poData.po_date,
          total_amount: poData.total_amount,
          tax_amount: poData.tax_amount,
          grand_total: poData.grand_total,
          payment_terms: poData.payment_terms,
          delivery_deadline: poData.delivery_deadline,
          attachment_url: poData.attachment_url,
          status: poData.status,
          notes: poData.notes
        }])
        .select('*, customer:customers(*), quotation:quotations(*)')
        .single();

      if (!error && data) return data as CustomerPO;
    }

    const current = await this.getCustomerPOs();
    const updated = [newPO, ...current];
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_POS, JSON.stringify(updated));
    return newPO;
  },

  async updateCustomerPOStatus(id: string, status: CustomerPO['status']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('customer_pos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    }
    const current = await this.getCustomerPOs();
    const updated = current.map(item => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_POS, JSON.stringify(updated));
  },

  // ----------------------------------------------------
  // VENDOR POs (PO Keluar ke Supplier)
  // ----------------------------------------------------
  async getVendorPOs(): Promise<VendorPO[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendor_pos')
        .select('*, vendor:vendors(*), items:vendor_po_items(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor POs from Supabase:', error);
      } else if (data && data.length > 0) {
        return data as VendorPO[];
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.VENDOR_POS);
    if (!local) {
      localStorage.setItem(STORAGE_KEYS.VENDOR_POS, JSON.stringify(INITIAL_VENDOR_POS));
      return INITIAL_VENDOR_POS;
    }
    return JSON.parse(local);
  },

  async createVendorPO(poData: Omit<VendorPO, 'id' | 'created_at' | 'updated_at'>): Promise<VendorPO> {
    const newPO: VendorPO = {
      ...poData,
      id: `vpo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vendor_pos')
        .insert([{
          po_number: poData.po_number,
          vendor_id: poData.vendor_id,
          inquiry_id: poData.inquiry_id,
          quotation_id: poData.quotation_id,
          po_date: poData.po_date,
          expected_delivery_date: poData.expected_delivery_date,
          currency: poData.currency,
          exchange_rate: poData.exchange_rate,
          subtotal: poData.subtotal,
          tax_rate: poData.tax_rate,
          tax_amount: poData.tax_amount,
          grand_total: poData.grand_total,
          payment_terms: poData.payment_terms,
          shipping_address: poData.shipping_address,
          notes: poData.notes,
          status: poData.status
        }])
        .select('*, vendor:vendors(*)')
        .single();

      if (!error && data) {
        if (poData.items && poData.items.length > 0) {
          const itemPayloads = poData.items.map(i => ({
            vendor_po_id: data.id,
            item_name: i.item_name,
            specifications: i.specifications,
            brand: i.brand,
            quantity: i.quantity,
            unit: i.unit,
            unit_price: i.unit_price,
            total_price: i.total_price,
            lead_time_days: i.lead_time_days,
            received_quantity: 0
          }));
          await supabase.from('vendor_po_items').insert(itemPayloads);
        }
        return data as VendorPO;
      }
    }

    const current = await this.getVendorPOs();
    const updated = [newPO, ...current];
    localStorage.setItem(STORAGE_KEYS.VENDOR_POS, JSON.stringify(updated));
    return newPO;
  },

  async updateVendorPOStatus(id: string, status: VendorPO['status']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase
        .from('vendor_pos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    }
    const current = await this.getVendorPOs();
    const updated = current.map(item => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item);
    localStorage.setItem(STORAGE_KEYS.VENDOR_POS, JSON.stringify(updated));
  },

  // ----------------------------------------------------
  // DELIVERY ORDERS (Surat Jalan DO)
  // ----------------------------------------------------
  async getDeliveryOrders(): Promise<DeliveryOrder[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('delivery_orders')
        .select('*, customer:customers(*), customer_po:customer_pos(*), items:delivery_order_items(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching delivery orders from Supabase:', error);
      } else if (data && data.length > 0) {
        return data as DeliveryOrder[];
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.DELIVERY_ORDERS);
    if (!local) {
      localStorage.setItem(STORAGE_KEYS.DELIVERY_ORDERS, JSON.stringify(INITIAL_DELIVERY_ORDERS));
      return INITIAL_DELIVERY_ORDERS;
    }
    return JSON.parse(local);
  },

  async createDeliveryOrder(doData: Omit<DeliveryOrder, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryOrder> {
    const newDO: DeliveryOrder = {
      ...doData,
      id: `do-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('delivery_orders')
        .insert([{
          do_number: doData.do_number,
          customer_id: doData.customer_id,
          customer_po_id: doData.customer_po_id,
          quotation_id: doData.quotation_id,
          delivery_date: doData.delivery_date,
          shipping_address: doData.shipping_address,
          courier_name: doData.courier_name,
          vehicle_number: doData.vehicle_number,
          recipient_name: doData.recipient_name,
          status: doData.status,
          notes: doData.notes
        }])
        .select('*, customer:customers(*), customer_po:customer_pos(*)')
        .single();

      if (!error && data) {
        if (doData.items && doData.items.length > 0) {
          const itemPayloads = doData.items.map(i => ({
            delivery_order_id: data.id,
            item_name: i.item_name,
            specifications: i.specifications,
            quantity_ordered: i.quantity_ordered,
            quantity_delivered: i.quantity_delivered,
            unit: i.unit,
            notes: i.notes
          }));
          await supabase.from('delivery_order_items').insert(itemPayloads);
        }
        return data as DeliveryOrder;
      }
    }

    const current = await this.getDeliveryOrders();
    const updated = [newDO, ...current];
    localStorage.setItem(STORAGE_KEYS.DELIVERY_ORDERS, JSON.stringify(updated));
    return newDO;
  },

  async updateDeliveryOrderStatus(
    id: string, 
    status: DeliveryOrder['status'], 
    recipientName?: string, 
    proofUrl?: string
  ): Promise<void> {
    const updates: Partial<DeliveryOrder> = {
      status,
      updated_at: new Date().toISOString()
    };
    if (status === 'delivered') {
      updates.received_at = new Date().toISOString();
      if (recipientName) updates.recipient_name = recipientName;
      if (proofUrl) updates.proof_of_delivery_url = proofUrl;
    }

    if (isSupabaseConfigured) {
      await supabase.from('delivery_orders').update(updates).eq('id', id);
    }
    const current = await this.getDeliveryOrders();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    localStorage.setItem(STORAGE_KEYS.DELIVERY_ORDERS, JSON.stringify(updated));
  },

  // ----------------------------------------------------
  // INVOICES & TERMIN BILLING
  // ----------------------------------------------------
  async getInvoices(): Promise<Invoice[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customer:customers(*), customer_po:customer_pos(*), items:invoice_items(*), payments(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices from Supabase:', error);
      } else if (data && data.length > 0) {
        return data as Invoice[];
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!local) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    return JSON.parse(local);
  },

  async createInvoice(invData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'remaining_amount'>): Promise<Invoice> {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      paid_amount: 0,
      remaining_amount: invData.grand_total,
      payments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invData.invoice_number,
          customer_id: invData.customer_id,
          customer_po_id: invData.customer_po_id,
          quotation_id: invData.quotation_id,
          delivery_order_id: invData.delivery_order_id,
          invoice_date: invData.invoice_date,
          due_date: invData.due_date,
          termin_type: invData.termin_type,
          termin_percentage: invData.termin_percentage,
          subtotal: invData.subtotal,
          tax_rate: invData.tax_rate,
          tax_amount: invData.tax_amount,
          grand_total: invData.grand_total,
          paid_amount: 0,
          remaining_amount: invData.grand_total,
          payment_status: invData.payment_status,
          bank_account_info: invData.bank_account_info,
          notes: invData.notes
        }])
        .select('*, customer:customers(*), customer_po:customer_pos(*)')
        .single();

      if (!error && data) {
        if (invData.items && invData.items.length > 0) {
          const itemPayloads = invData.items.map(i => ({
            invoice_id: data.id,
            item_name: i.item_name,
            specifications: i.specifications,
            quantity: i.quantity,
            unit: i.unit,
            unit_price: i.unit_price,
            total_price: i.total_price
          }));
          await supabase.from('invoice_items').insert(itemPayloads);
        }
        return data as Invoice;
      }
    }

    const current = await this.getInvoices();
    const updated = [newInv, ...current];
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
    return newInv;
  },

  async recordPayment(
    invoiceId: string, 
    paymentData: { amount: number; payment_date: string; payment_method: string; reference_number?: string; notes?: string }
  ): Promise<Invoice> {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoice_id: invoiceId,
      payment_number: `PAY/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`,
      payment_date: paymentData.payment_date,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      await supabase.from('payments').insert([newPayment]);
    }

    const current = await this.getInvoices();
    let updatedInvoice: Invoice | null = null;

    const updated = current.map(inv => {
      if (inv.id === invoiceId) {
        const currentPaid = inv.paid_amount || 0;
        const newPaid = currentPaid + paymentData.amount;
        const newRemaining = Math.max(0, inv.grand_total - newPaid);
        const newStatus: Invoice['payment_status'] = newRemaining <= 0 ? 'paid' : 'partial';

        updatedInvoice = {
          ...inv,
          paid_amount: newPaid,
          remaining_amount: newRemaining,
          payment_status: newStatus,
          payments: [...(inv.payments || []), newPayment],
          updated_at: new Date().toISOString()
        };
        return updatedInvoice;
      }
      return inv;
    });

    if (isSupabaseConfigured && updatedInvoice) {
      await supabase
        .from('invoices')
        .update({
          paid_amount: (updatedInvoice as Invoice).paid_amount,
          remaining_amount: (updatedInvoice as Invoice).remaining_amount,
          payment_status: (updatedInvoice as Invoice).payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
    }

    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
    return updatedInvoice || current.find(i => i.id === invoiceId)!;
  },

  async updateInvoiceStatus(id: string, payment_status: Invoice['payment_status']): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('invoices').update({ payment_status, updated_at: new Date().toISOString() }).eq('id', id);
    }
    const current = await this.getInvoices();
    const updated = current.map(item => item.id === id ? { ...item, payment_status, updated_at: new Date().toISOString() } : item);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
  }
};
