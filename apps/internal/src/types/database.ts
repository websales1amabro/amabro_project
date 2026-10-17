export type UserRole = 'owner' | 'sales' | 'engineer' | 'purchasing' | 'finance';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  code?: string | null;
  name: string;
  company_type?: string | null;
  pic_name?: string | null;
  pic_phone?: string | null;
  pic_email?: string | null;
  address?: string | null;
  city?: string | null;
  npwp?: string | null;
  payment_terms_days: number;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Vendor {
  id: string;
  code?: string | null;
  name: string;
  pic_name?: string | null;
  pic_phone?: string | null;
  pic_email?: string | null;
  address?: string | null;
  city?: string | null;
  npwp?: string | null;
  product_categories: string[];
  payment_terms?: string | null;
  bank_account_info?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type InquiryStatus = 
  | 'inquiry'
  | 'technical_analysis'
  | 'vendor_sourcing'
  | 'commercial_analysis'
  | 'waiting_approval'
  | 'revision'
  | 'approved'
  | 'sent_to_customer'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'po_customer'
  | 'procurement'
  | 'delivery'
  | 'invoiced'
  | 'paid'
  | 'cancelled';

export type InquiryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InquirySource = 'internal' | 'website' | 'referral' | 'repeat';

export interface Inquiry {
  id: string;
  inquiry_number: string;
  customer_id?: string | null;
  title: string;
  description?: string | null;
  source: InquirySource;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  consent_at?: string | null;
  status: InquiryStatus;
  priority: InquiryPriority;
  assigned_to?: string | null;
  deadline?: string | null;
  estimated_value: number;
  lost_reason?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined fields
  customer?: Customer | null;
  assignee?: Profile | null;
}

export interface InquiryItem {
  id: string;
  inquiry_id: string;
  item_no: number;
  item_name: string;
  specifications?: string | null;
  brand?: string | null;
  quantity: number;
  unit: string;
  is_feasible: boolean;
  technical_notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorQuote {
  id: string;
  inquiry_id: string;
  item_id: string;
  vendor_id: string;
  unit_price: number;
  currency: string;
  exchange_rate: number;
  unit_price_idr: number;
  lead_time_days?: number | null;
  warranty_period?: string | null;
  validity_date?: string | null;
  payment_terms?: string | null;
  quote_reference?: string | null;
  attachment_url?: string | null;
  notes?: string | null;
  is_selected: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined
  vendor?: Vendor;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface CommercialAnalysis {
  id: string;
  inquiry_id: string;
  total_vendor_cost: number;
  shipping_cost: number;
  customs_duty_cost: number;
  other_direct_cost: number;
  total_cost: number;
  target_margin_pct: number;
  risk_buffer_pct: number;
  risk_level: RiskLevel;
  risk_notes?: string | null;
  minimum_price: number;
  selling_price: number;
  negotiation_room: number;
  actual_margin_nominal: number;
  actual_margin_pct: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InternalQuotation {
  id: string;
  inquiry_id: string;
  item_id: string;
  selected_vendor_quote_id?: string | null;
  unit_cost: number;
  margin_pct: number;
  risk_pct: number;
  unit_minimum_price: number;
  unit_selling_price: number;
  negotiation_room: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type QuotationStatus = 
  | 'draft'
  | 'waiting_approval'
  | 'approved'
  | 'rejected'
  | 'revision_requested'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'superseded';

export interface Quotation {
  id: string;
  quotation_number: string;
  inquiry_id: string;
  revision: number;
  status: QuotationStatus;
  date: string;
  validity_days: number;
  currency: string;
  subtotal: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  warranty_terms?: string | null;
  general_terms?: string | null;
  customer_notes?: string | null;
  pdf_url?: string | null;
  sent_at?: string | null;
  sent_by?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined
  inquiry?: Inquiry;
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  inquiry_item_id?: string | null;
  item_no: number;
  item_name: string;
  specifications?: string | null;
  brand?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type ApprovalDecision = 'approved' | 'rejected' | 'revision_requested';

export interface Approval {
  id: string;
  quotation_id: string;
  approver_id: string;
  decision: ApprovalDecision;
  comment?: string | null;
  decided_at: string;
  created_at: string;
  // Joined
  approver?: Profile;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SEND';
  performed_by?: string | null;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  created_at: string;
  performer?: Profile | null;
}

// ----------------------------------------------------
// FASE 2: Transaksi (Customer PO, Vendor PO, DO, Invoice)
// ----------------------------------------------------

export type CustomerPOStatus = 'received' | 'in_progress' | 'completed' | 'cancelled';

export interface CustomerPO {
  id: string;
  po_number: string;
  internal_ref?: string | null;
  quotation_id?: string | null;
  inquiry_id?: string | null;
  customer_id: string;
  po_date: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  payment_terms?: string | null;
  delivery_deadline?: string | null;
  attachment_url?: string | null;
  status: CustomerPOStatus;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined
  customer?: Customer;
  quotation?: Quotation;
}

export type VendorPOStatus = 'draft' | 'sent' | 'partially_received' | 'completed' | 'cancelled';

export interface VendorPOItem {
  id: string;
  vendor_po_id: string;
  item_name: string;
  specifications?: string | null;
  brand?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  lead_time_days?: number | null;
  received_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface VendorPO {
  id: string;
  po_number: string;
  vendor_id: string;
  inquiry_id?: string | null;
  quotation_id?: string | null;
  po_date: string;
  expected_delivery_date?: string | null;
  currency: string;
  exchange_rate: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  payment_terms?: string | null;
  shipping_address?: string | null;
  notes?: string | null;
  status: VendorPOStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined
  vendor?: Vendor;
  items?: VendorPOItem[];
}

export type DeliveryOrderStatus = 'draft' | 'in_transit' | 'delivered' | 'returned';

export interface DeliveryOrderItem {
  id: string;
  delivery_order_id: string;
  item_name: string;
  specifications?: string | null;
  quantity_ordered: number;
  quantity_delivered: number;
  unit: string;
  notes?: string | null;
  created_at: string;
}

export interface DeliveryOrder {
  id: string;
  do_number: string;
  customer_id: string;
  customer_po_id?: string | null;
  quotation_id?: string | null;
  delivery_date: string;
  shipping_address: string;
  courier_name?: string | null;
  vehicle_number?: string | null;
  recipient_name?: string | null;
  received_at?: string | null;
  proof_of_delivery_url?: string | null;
  status: DeliveryOrderStatus;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined
  customer?: Customer;
  customer_po?: CustomerPO;
  items?: DeliveryOrderItem[];
}

export type TerminType = 'full' | 'dp' | 'progress' | 'pelunasan';
export type InvoicePaymentStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_name: string;
  specifications?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string | null;
  proof_file_url?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_po_id?: string | null;
  quotation_id?: string | null;
  delivery_order_id?: string | null;
  invoice_date: string;
  due_date: string;
  termin_type: TerminType;
  termin_percentage: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: InvoicePaymentStatus;
  bank_account_info?: string | null;
  notes?: string | null;
  sent_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined
  customer?: Customer;
  customer_po?: CustomerPO;
  items?: InvoiceItem[];
  payments?: Payment[];
}

// ----------------------------------------------------
// FASE 3: Pajak & Keuangan
// ----------------------------------------------------

export type TaxType = 'keluaran' | 'masukan';
export type EfakturStatus = 'draft' | 'ready' | 'uploaded' | 'approved' | 'rejected';

export interface TaxInvoice {
  id: string;
  tax_type: TaxType;
  invoice_id?: string | null;
  vendor_po_id?: string | null;
  tax_invoice_number: string;
  tax_date: string;
  npwp: string;
  tax_subject_name: string;
  tax_subject_address?: string | null;
  tax_rate: number;
  dpp: number;
  ppn: number;
  tax_period_month: number;
  tax_period_year: number;
  is_creditable: boolean;
  efaktur_status: EfakturStatus;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectProfitLoss {
  quotation_id: string;
  quotation_number: string;
  inquiry_id: string;
  inquiry_number: string;
  project_title: string;
  customer_id: string;
  customer_name: string;
  revenue: number;
  planned_cogs: number;
  target_margin_pct: number;
  actual_cogs: number;
  actual_gross_profit: number;
  actual_margin_pct: number;
}

export interface ArAgingItem {
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  grand_total: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: InvoicePaymentStatus;
  aging_category: string;
  days_overdue: number;
}

// ----------------------------------------------------
// WEBSITE CMS: Katalog Produk
// ----------------------------------------------------

export interface SiteProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  model_number?: string | null;
  short_description?: string | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  features?: string[] | null;
  image_url?: string | null;
  datasheet_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}


