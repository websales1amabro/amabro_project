-- ==============================================================================
-- MIGRATION: 20261017000001_transactions_and_finance.sql
-- FASE 2 & FASE 3: Transaksi (PO, DO, Invoice, Pembayaran) & Pajak/Keuangan
-- ==============================================================================

-- 1. Insert Sequence Seeds for Transactions (matches document_sequences schema: code, prefix, year, month, last_number)
insert into public.document_sequences (code, prefix, year, month, last_number, updated_at)
values 
  ('PO_CUST', 'POC', extract(year from current_date)::integer, extract(month from current_date)::integer, 0, now()),
  ('PO_VEND', 'POV', extract(year from current_date)::integer, extract(month from current_date)::integer, 0, now()),
  ('DO', 'DO', extract(year from current_date)::integer, extract(month from current_date)::integer, 0, now()),
  ('INV', 'INV', extract(year from current_date)::integer, extract(month from current_date)::integer, 0, now()),
  ('FP_OUT', 'FPK', extract(year from current_date)::integer, extract(month from current_date)::integer, 0, now())
on conflict (code) do nothing;

-- 2. Customer Purchase Orders (PO Masuk dari Customer)
create table if not exists public.customer_pos (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique, -- nomor PO dari customer
  internal_ref text, -- nomor referensi sistem jika ada
  quotation_id uuid references public.quotations(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  po_date date not null default current_date,
  total_amount numeric(15,2) not null default 0,
  tax_amount numeric(15,2) not null default 0,
  grand_total numeric(15,2) not null default 0,
  payment_terms text,
  delivery_deadline date,
  attachment_url text,
  status text not null default 'received' check (status in ('received', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 3. Vendor Purchase Orders (PO Keluar ke Supplier/Vendor)
create table if not exists public.vendor_pos (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique, -- format: POV/AMB/YYYY/MM/XXXX
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  po_date date not null default current_date,
  expected_delivery_date date,
  currency text not null default 'IDR',
  exchange_rate numeric(15,4) not null default 1,
  subtotal numeric(15,2) not null default 0,
  tax_rate numeric(5,2) not null default 11,
  tax_amount numeric(15,2) not null default 0,
  grand_total numeric(15,2) not null default 0,
  payment_terms text,
  shipping_address text,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'partially_received', 'completed', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Vendor PO Items
create table if not exists public.vendor_po_items (
  id uuid primary key default gen_random_uuid(),
  vendor_po_id uuid not null references public.vendor_pos(id) on delete cascade,
  item_name text not null,
  specifications text,
  brand text,
  quantity numeric(10,2) not null check (quantity > 0),
  unit text not null default 'Unit',
  unit_price numeric(15,2) not null default 0,
  total_price numeric(15,2) not null default 0,
  lead_time_days integer,
  received_quantity numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Delivery Orders (Surat Jalan DO - Mendukung Pengiriman Bertahap)
create table if not exists public.delivery_orders (
  id uuid primary key default gen_random_uuid(),
  do_number text not null unique, -- format: DO/AMB/YYYY/MM/XXXX
  customer_id uuid not null references public.customers(id) on delete restrict,
  customer_po_id uuid references public.customer_pos(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  delivery_date date not null default current_date,
  shipping_address text not null,
  courier_name text,
  vehicle_number text,
  recipient_name text,
  received_at timestamptz,
  proof_of_delivery_url text,
  status text not null default 'draft' check (status in ('draft', 'in_transit', 'delivered', 'returned')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Delivery Order Items
create table if not exists public.delivery_order_items (
  id uuid primary key default gen_random_uuid(),
  delivery_order_id uuid not null references public.delivery_orders(id) on delete cascade,
  item_name text not null,
  specifications text,
  quantity_ordered numeric(10,2) not null,
  quantity_delivered numeric(10,2) not null,
  unit text not null default 'Unit',
  notes text,
  created_at timestamptz not null default now()
);

-- 5. Invoices & Billing Termin
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique, -- format: INV/AMB/YYYY/MM/XXXX
  customer_id uuid not null references public.customers(id) on delete restrict,
  customer_po_id uuid references public.customer_pos(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  delivery_order_id uuid references public.delivery_orders(id) on delete set null,
  invoice_date date not null default current_date,
  due_date date not null,
  termin_type text not null default 'full' check (termin_type in ('full', 'dp', 'progress', 'pelunasan')),
  termin_percentage numeric(5,2) not null default 100,
  subtotal numeric(15,2) not null default 0,
  tax_rate numeric(5,2) not null default 11,
  tax_amount numeric(15,2) not null default 0,
  grand_total numeric(15,2) not null default 0,
  paid_amount numeric(15,2) not null default 0,
  remaining_amount numeric(15,2) not null default 0,
  payment_status text not null default 'draft' check (payment_status in ('draft', 'sent', 'partial', 'paid', 'overdue')),
  bank_account_info text,
  notes text,
  sent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Invoice Items
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_name text not null,
  specifications text,
  quantity numeric(10,2) not null default 1,
  unit text not null default 'Unit',
  unit_price numeric(15,2) not null default 0,
  total_price numeric(15,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Payments (Pencatatan Pembayaran Parsial / Penuh)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_number text not null unique,
  payment_date date not null default current_date,
  amount numeric(15,2) not null check (amount > 0),
  payment_method text not null default 'bank_transfer',
  reference_number text,
  proof_file_url text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 6. Tax Invoices (Faktur Pajak Keluaran & Masukan untuk e-Faktur / Coretax)
create table if not exists public.tax_invoices (
  id uuid primary key default gen_random_uuid(),
  tax_type text not null check (tax_type in ('keluaran', 'masukan')),
  invoice_id uuid references public.invoices(id) on delete set null,
  vendor_po_id uuid references public.vendor_pos(id) on delete set null,
  tax_invoice_number text not null, -- Nomor Seri Faktur Pajak (NSFP)
  tax_date date not null default current_date,
  npwp text not null,
  tax_subject_name text not null,
  tax_subject_address text,
  tax_rate numeric(5,2) not null default 11,
  dpp numeric(15,2) not null default 0,
  ppn numeric(15,2) not null default 0,
  tax_period_month integer not null check (tax_period_month between 1 and 12),
  tax_period_year integer not null check (tax_period_year >= 2020),
  is_creditable boolean not null default true, -- untuk pajak masukan
  efaktur_status text not null default 'draft' check (efaktur_status in ('draft', 'ready', 'uploaded', 'approved', 'rejected')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Views for Financial Reports
-- 7a. Laba Rugi Per Proyek / Quotation
create or replace view public.v_project_profit_loss as
select 
  q.id as quotation_id,
  q.quotation_number,
  i.id as inquiry_id,
  i.inquiry_number,
  i.title as project_title,
  c.id as customer_id,
  c.name as customer_name,
  -- Nilai Penjualan (Revenue dari Quotation Grand Total excl PPN)
  coalesce(q.subtotal, 0) as revenue,
  -- Target Margin dari Commercial Analysis
  ca.target_margin_pct,
  ca.minimum_price,
  ca.total_vendor_cost as planned_cogs,
  -- HPP Aktual dari Vendor PO yang terbit
  coalesce(sum(vp.subtotal), ca.total_vendor_cost, 0) as actual_cogs,
  -- Laba Kotor Aktual
  coalesce(q.subtotal, 0) - coalesce(sum(vp.subtotal), ca.total_vendor_cost, 0) as actual_gross_profit,
  -- Margin Aktual %
  case 
    when coalesce(q.subtotal, 0) > 0 then 
      round(((coalesce(q.subtotal, 0) - coalesce(sum(vp.subtotal), ca.total_vendor_cost, 0)) / q.subtotal) * 100, 2)
    else 0 
  end as actual_margin_pct
from public.quotations q
join public.inquiries i on q.inquiry_id = i.id
left join public.customers c on i.customer_id = c.id
left join public.commercial_analysis ca on ca.inquiry_id = i.id
left join public.vendor_pos vp on vp.quotation_id = q.id and vp.deleted_at is null
where q.status in ('approved', 'sent', 'accepted')
group by q.id, q.quotation_number, i.id, i.inquiry_number, i.title, c.id, c.name, q.subtotal, ca.target_margin_pct, ca.minimum_price, ca.total_vendor_cost;

-- 7b. Aging Piutang (AR Aging)
create or replace view public.v_ar_aging as
select 
  inv.id as invoice_id,
  inv.invoice_number,
  c.id as customer_id,
  c.name as customer_name,
  inv.invoice_date,
  inv.due_date,
  inv.grand_total,
  inv.paid_amount,
  inv.remaining_amount,
  inv.payment_status,
  case 
    when inv.payment_status = 'paid' then 'Lunas'
    when current_date <= inv.due_date then 'Lancar (Belum JT)'
    when current_date - inv.due_date between 1 and 30 then '1 - 30 Hari'
    when current_date - inv.due_date between 31 and 60 then '31 - 60 Hari'
    when current_date - inv.due_date between 61 and 90 then '61 - 90 Hari'
    else '> 90 Hari'
  end as aging_category,
  greatest(0, current_date - inv.due_date) as days_overdue
from public.invoices inv
join public.customers c on inv.customer_id = c.id
where inv.deleted_at is null and inv.remaining_amount > 0;

-- 8. Row Level Security Policies
alter table public.customer_pos enable row level security;
alter table public.vendor_pos enable row level security;
alter table public.vendor_po_items enable row level security;
alter table public.delivery_orders enable row level security;
alter table public.delivery_order_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.tax_invoices enable row level security;

-- Helper alias if needed
create or replace function public.get_current_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role();
$$;

-- Customer PO Policies
create policy "Read customer_pos" on public.customer_pos
  for select using (auth.role() = 'authenticated');
create policy "Insert/Update customer_pos" on public.customer_pos
  for all using (public.current_role() in ('owner', 'sales', 'finance'));

-- Vendor PO Policies (Strict: sales and engineer cannot read vendor costs!)
create policy "Read vendor_pos restricted" on public.vendor_pos
  for select using (public.current_role() in ('owner', 'purchasing', 'finance'));
create policy "Manage vendor_pos" on public.vendor_pos
  for all using (public.current_role() in ('owner', 'purchasing', 'finance'));

create policy "Read vendor_po_items restricted" on public.vendor_po_items
  for select using (public.current_role() in ('owner', 'purchasing', 'finance'));
create policy "Manage vendor_po_items" on public.vendor_po_items
  for all using (public.current_role() in ('owner', 'purchasing', 'finance'));

-- Delivery Order Policies
create policy "Read delivery_orders" on public.delivery_orders
  for select using (auth.role() = 'authenticated');
create policy "Manage delivery_orders" on public.delivery_orders
  for all using (public.current_role() in ('owner', 'sales', 'purchasing', 'finance'));

create policy "Read delivery_order_items" on public.delivery_order_items
  for select using (auth.role() = 'authenticated');
create policy "Manage delivery_order_items" on public.delivery_order_items
  for all using (public.current_role() in ('owner', 'sales', 'purchasing', 'finance'));

-- Invoices & Payments Policies
create policy "Read invoices" on public.invoices
  for select using (auth.role() = 'authenticated');
create policy "Manage invoices" on public.invoices
  for all using (public.current_role() in ('owner', 'finance'));

create policy "Read invoice_items" on public.invoice_items
  for select using (auth.role() = 'authenticated');
create policy "Manage invoice_items" on public.invoice_items
  for all using (public.current_role() in ('owner', 'finance'));

create policy "Read payments" on public.payments
  for select using (auth.role() = 'authenticated');
create policy "Manage payments" on public.payments
  for all using (public.current_role() in ('owner', 'finance'));

-- Tax Invoices Policies
create policy "Read tax_invoices" on public.tax_invoices
  for select using (public.current_role() in ('owner', 'finance', 'purchasing'));
create policy "Manage tax_invoices" on public.tax_invoices
  for all using (public.current_role() in ('owner', 'finance'));

