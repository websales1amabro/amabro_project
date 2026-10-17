-- Migration: 20261017000000_initial_schema.sql
-- Description: Full schema for Automation Sales Flow with strict RLS and role separation

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. PROFILES & ROLES
-- ==========================================
create type user_role as enum ('owner', 'sales', 'engineer', 'purchasing', 'finance');

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text not null,
    phone text,
    role user_role not null default 'sales',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper function to get current user's role with SECURITY DEFINER
create or replace function public.current_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
    select role from public.profiles where id = auth.uid() and is_active = true limit 1;
$$;

-- Helper function to check if current user is owner
create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select (public.current_role() = 'owner');
$$;

-- Profiles Policies
create policy "Users can read profiles"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    to authenticated
    using (id = auth.uid())
    with check (
        id = auth.uid() 
        and (
            role = (select role from public.profiles where id = auth.uid())
            or public.is_owner()
        )
    );

create policy "Owner can manage profiles"
    on public.profiles for all
    to authenticated
    using (public.is_owner())
    with check (public.is_owner());

-- Trigger to create profile automatically on auth.users sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        coalesce((new.raw_user_meta_data->>'role')::user_role, 'sales')
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();


-- ==========================================
-- 2. DOCUMENT SEQUENCES & NUMBERING FUNCTION
-- ==========================================
create table public.document_sequences (
    code text primary key, -- 'INQ', 'QUO', 'PO_CUST', 'PO_VEND', 'DO', 'INV', 'FP'
    prefix text not null,
    year integer not null,
    month integer not null,
    last_number integer not null default 0,
    updated_at timestamptz not null default now()
);

alter table public.document_sequences enable row level security;

create policy "Authenticated users can read sequences"
    on public.document_sequences for select
    to authenticated
    using (true);

-- Atomic sequence generator with row locking
create or replace function public.next_document_number(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_year integer := extract(year from current_date);
    v_month integer := extract(month from current_date);
    v_prefix text;
    v_current_seq integer;
    v_formatted_num text;
begin
    -- Determine default prefix if not found
    v_prefix := upper(p_code);

    -- Lock and retrieve or insert sequence for current year/month
    insert into public.document_sequences (code, prefix, year, month, last_number, updated_at)
    values (p_code, v_prefix, v_year, v_month, 1, now())
    on conflict (code) do update
    set last_number = case 
            when document_sequences.year = v_year and document_sequences.month = v_month 
            then document_sequences.last_number + 1
            else 1
        end,
        year = v_year,
        month = v_month,
        updated_at = now()
    returning last_number into v_current_seq;

    -- Format: PREFIX/YYYY/MM/0001
    v_formatted_num := v_prefix || '/' || to_char(current_date, 'YYYY/MM') || '/' || lpad(v_current_seq::text, 4, '0');
    return v_formatted_num;
end;
$$;


-- ==========================================
-- 3. MASTER DATA: CUSTOMERS & VENDORS
-- ==========================================
create table public.customers (
    id uuid primary key default gen_random_uuid(),
    code text unique,
    name text not null,
    company_type text default 'PT', -- PT, CV, Perorangan, dll
    pic_name text,
    pic_phone text,
    pic_email text,
    address text,
    city text,
    npwp text,
    payment_terms_days integer not null default 30,
    notes text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table public.vendors (
    id uuid primary key default gen_random_uuid(),
    code text unique,
    name text not null,
    pic_name text,
    pic_phone text,
    pic_email text,
    address text,
    city text,
    npwp text,
    product_categories text[] default '{}',
    payment_terms text,
    bank_account_info text,
    notes text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

alter table public.customers enable row level security;
alter table public.vendors enable row level security;

-- Customers Policies
-- owner, sales: RW
-- finance, purchasing, engineer: R
create policy "Customers select policy"
    on public.customers for select
    to authenticated
    using (deleted_at is null);

create policy "Customers insert policy"
    on public.customers for insert
    to authenticated
    with check (public.current_role() in ('owner', 'sales'));

create policy "Customers update policy"
    on public.customers for update
    to authenticated
    using (public.current_role() in ('owner', 'sales') and deleted_at is null)
    with check (public.current_role() in ('owner', 'sales'));

-- Vendors Policies
-- owner, purchasing: RW
-- finance, sales, engineer: R
create policy "Vendors select policy"
    on public.vendors for select
    to authenticated
    using (deleted_at is null);

create policy "Vendors insert policy"
    on public.vendors for insert
    to authenticated
    with check (public.current_role() in ('owner', 'purchasing'));

create policy "Vendors update policy"
    on public.vendors for update
    to authenticated
    using (public.current_role() in ('owner', 'purchasing') and deleted_at is null)
    with check (public.current_role() in ('owner', 'purchasing'));


-- ==========================================
-- 4. INQUIRIES & ITEMS (BOM / V1 / V2)
-- ==========================================
create type inquiry_status as enum (
    'inquiry',
    'technical_analysis',
    'vendor_sourcing',
    'commercial_analysis',
    'waiting_approval',
    'revision',
    'approved',
    'sent_to_customer',
    'negotiation',
    'won',
    'lost',
    'po_customer',
    'procurement',
    'delivery',
    'invoiced',
    'paid',
    'cancelled'
);

create type inquiry_priority as enum ('low', 'medium', 'high', 'urgent');
create type inquiry_source as enum ('internal', 'website', 'referral', 'repeat');

create table public.inquiries (
    id uuid primary key default gen_random_uuid(),
    inquiry_number text not null unique,
    customer_id uuid references public.customers(id),
    title text not null,
    description text,
    source inquiry_source not null default 'internal',
    -- Website visitor details (if source = 'website')
    contact_name text,
    contact_email text,
    contact_phone text,
    consent_at timestamptz,
    status inquiry_status not null default 'inquiry',
    priority inquiry_priority not null default 'medium',
    assigned_to uuid references public.profiles(id),
    deadline date,
    estimated_value numeric(15,2) default 0,
    lost_reason text,
    notes text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table public.inquiry_items (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null references public.inquiries(id) on delete cascade,
    item_no integer not null default 1,
    item_name text not null,
    specifications text,
    brand text,
    quantity numeric(12, 2) not null default 1,
    unit text not null default 'pcs',
    is_feasible boolean not null default true,
    technical_notes text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;

-- Inquiries Policies
-- owner, sales, engineer: RW
-- purchasing, finance: R
create policy "Inquiries select policy"
    on public.inquiries for select
    to authenticated
    using (deleted_at is null);

create policy "Inquiries insert policy"
    on public.inquiries for insert
    to authenticated
    with check (public.current_role() in ('owner', 'sales', 'engineer'));

create policy "Inquiries update policy"
    on public.inquiries for update
    to authenticated
    using (public.current_role() in ('owner', 'sales', 'engineer') and deleted_at is null)
    with check (public.current_role() in ('owner', 'sales', 'engineer'));

-- Inquiry Items Policies
create policy "Inquiry items select policy"
    on public.inquiry_items for select
    to authenticated
    using (deleted_at is null);

create policy "Inquiry items insert policy"
    on public.inquiry_items for insert
    to authenticated
    with check (public.current_role() in ('owner', 'sales', 'engineer'));

create policy "Inquiry items update policy"
    on public.inquiry_items for update
    to authenticated
    using (public.current_role() in ('owner', 'sales', 'engineer') and deleted_at is null)
    with check (public.current_role() in ('owner', 'sales', 'engineer'));


-- ==========================================
-- 5. VENDOR QUOTES (V3 VENDOR SOURCING)
-- ==========================================
create table public.vendor_quotes (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null references public.inquiries(id) on delete cascade,
    item_id uuid not null references public.inquiry_items(id) on delete cascade,
    vendor_id uuid not null references public.vendors(id) on delete cascade,
    unit_price numeric(15, 2) not null default 0,
    currency text not null default 'IDR',
    exchange_rate numeric(15, 4) not null default 1.0000,
    unit_price_idr numeric(15, 2) generated always as (unit_price * exchange_rate) stored,
    lead_time_days integer,
    warranty_period text,
    validity_date date,
    payment_terms text,
    quote_reference text,
    attachment_url text,
    notes text,
    is_selected boolean not null default false,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

alter table public.vendor_quotes enable row level security;

-- Vendor quotes policies
-- Owner, Purchasing: Full RW
-- Finance: Read
-- Sales, Engineer: Read (cannot insert/modify)
create policy "Vendor quotes select policy"
    on public.vendor_quotes for select
    to authenticated
    using (deleted_at is null);

create policy "Vendor quotes insert policy"
    on public.vendor_quotes for insert
    to authenticated
    with check (public.current_role() in ('owner', 'purchasing'));

create policy "Vendor quotes update policy"
    on public.vendor_quotes for update
    to authenticated
    using (public.current_role() in ('owner', 'purchasing') and deleted_at is null)
    with check (public.current_role() in ('owner', 'purchasing'));


-- ==========================================
-- 6. COMMERCIAL ANALYSIS & INTERNAL QUOTATIONS (V4 - RAHASIA)
-- STRICTLY OWNER ONLY (plus limited finance read)
-- SALES & ENGINEER HAVE ZERO ACCESS
-- ==========================================
create type risk_level_enum as enum ('low', 'medium', 'high');

create table public.commercial_analysis (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null unique references public.inquiries(id) on delete cascade,
    total_vendor_cost numeric(15, 2) not null default 0,
    shipping_cost numeric(15, 2) not null default 0,
    customs_duty_cost numeric(15, 2) not null default 0,
    other_direct_cost numeric(15, 2) not null default 0,
    total_cost numeric(15, 2) not null default 0,
    target_margin_pct numeric(5, 2) not null default 20.00,
    risk_buffer_pct numeric(5, 2) not null default 5.00,
    risk_level risk_level_enum not null default 'low',
    risk_notes text,
    minimum_price numeric(15, 2) not null default 0,
    selling_price numeric(15, 2) not null default 0,
    negotiation_room numeric(15, 2) not null default 0,
    actual_margin_nominal numeric(15, 2) not null default 0,
    actual_margin_pct numeric(5, 2) not null default 0,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table public.internal_quotations (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null references public.inquiries(id) on delete cascade,
    item_id uuid not null references public.inquiry_items(id) on delete cascade,
    selected_vendor_quote_id uuid references public.vendor_quotes(id),
    unit_cost numeric(15, 2) not null default 0,
    margin_pct numeric(5, 2) not null default 20.00,
    risk_pct numeric(5, 2) not null default 5.00,
    unit_minimum_price numeric(15, 2) not null default 0,
    unit_selling_price numeric(15, 2) not null default 0,
    negotiation_room numeric(15, 2) not null default 0,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

alter table public.commercial_analysis enable row level security;
alter table public.internal_quotations enable row level security;

-- Strictly Owner RW, Finance R. Sales & Engineer have NO ACCESS.
create policy "Commercial analysis owner/finance select"
    on public.commercial_analysis for select
    to authenticated
    using (public.current_role() in ('owner', 'finance') and deleted_at is null);

create policy "Commercial analysis owner insert"
    on public.commercial_analysis for insert
    to authenticated
    with check (public.is_owner());

create policy "Commercial analysis owner update"
    on public.commercial_analysis for update
    to authenticated
    using (public.is_owner() and deleted_at is null)
    with check (public.is_owner());

-- Internal quotations policies
create policy "Internal quotations owner/finance select"
    on public.internal_quotations for select
    to authenticated
    using (public.current_role() in ('owner', 'finance') and deleted_at is null);

create policy "Internal quotations owner insert"
    on public.internal_quotations for insert
    to authenticated
    with check (public.is_owner());

create policy "Internal quotations owner update"
    on public.internal_quotations for update
    to authenticated
    using (public.is_owner() and deleted_at is null)
    with check (public.is_owner());


-- ==========================================
-- 7. CUSTOMER QUOTATIONS & ITEMS
-- ==========================================
create type quotation_status as enum (
    'draft',
    'waiting_approval',
    'approved',
    'rejected',
    'revision_requested',
    'sent',
    'accepted',
    'declined',
    'superseded'
);

create table public.quotations (
    id uuid primary key default gen_random_uuid(),
    quotation_number text not null unique,
    inquiry_id uuid not null references public.inquiries(id) on delete cascade,
    revision integer not null default 0,
    status quotation_status not null default 'draft',
    date date not null default current_date,
    validity_days integer not null default 14,
    currency text not null default 'IDR',
    subtotal numeric(15, 2) not null default 0,
    discount numeric(15, 2) not null default 0,
    tax_rate numeric(5, 2) not null default 11.00, -- PPN 11% (configurable)
    tax_amount numeric(15, 2) not null default 0,
    grand_total numeric(15, 2) not null default 0,
    payment_terms text,
    delivery_terms text,
    warranty_terms text,
    general_terms text,
    customer_notes text,
    pdf_url text,
    sent_at timestamptz,
    sent_by uuid references public.profiles(id),
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create table public.quotation_items (
    id uuid primary key default gen_random_uuid(),
    quotation_id uuid not null references public.quotations(id) on delete cascade,
    inquiry_item_id uuid references public.inquiry_items(id),
    item_no integer not null default 1,
    item_name text not null,
    specifications text,
    brand text,
    quantity numeric(12, 2) not null default 1,
    unit text not null default 'pcs',
    unit_price numeric(15, 2) not null default 0,
    total_price numeric(15, 2) generated always as (quantity * unit_price) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

-- Quotations Policies
create policy "Quotations select policy"
    on public.quotations for select
    to authenticated
    using (deleted_at is null);

create policy "Quotations insert policy"
    on public.quotations for insert
    to authenticated
    with check (public.current_role() in ('owner', 'sales'));

-- Non-owner cannot update if status is 'approved' or 'sent'
create policy "Quotations update policy"
    on public.quotations for update
    to authenticated
    using (
        deleted_at is null 
        and (
            public.is_owner() 
            or (public.current_role() = 'sales' and status in ('draft', 'revision_requested'))
        )
    )
    with check (
        public.is_owner() 
        or (public.current_role() = 'sales' and status in ('draft', 'waiting_approval', 'revision_requested'))
    );

-- Quotation Items Policies
create policy "Quotation items select policy"
    on public.quotation_items for select
    to authenticated
    using (deleted_at is null);

create policy "Quotation items insert policy"
    on public.quotation_items for insert
    to authenticated
    with check (public.current_role() in ('owner', 'sales'));

create policy "Quotation items update policy"
    on public.quotation_items for update
    to authenticated
    using (public.current_role() in ('owner', 'sales') and deleted_at is null)
    with check (public.current_role() in ('owner', 'sales'));


-- ==========================================
-- 8. APPROVALS & OWNER APPROVAL FUNCTION
-- ==========================================
create type approval_decision as enum ('approved', 'rejected', 'revision_requested');

create table public.approvals (
    id uuid primary key default gen_random_uuid(),
    quotation_id uuid not null references public.quotations(id) on delete cascade,
    approver_id uuid not null references public.profiles(id),
    decision approval_decision not null,
    comment text,
    decided_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

alter table public.approvals enable row level security;

create policy "Approvals select policy"
    on public.approvals for select
    to authenticated
    using (true);

create policy "Owner can insert approvals"
    on public.approvals for insert
    to authenticated
    with check (public.is_owner());

-- Atomic approve function (Security Definer)
create or replace function public.approve_quotation(
    p_quotation_id uuid,
    p_decision approval_decision,
    p_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_new_status quotation_status;
    v_inquiry_id uuid;
begin
    -- Verify caller is owner
    if not public.is_owner() then
        raise exception 'Hanya Owner yang berhak memberikan persetujuan (approval).';
    end if;

    if p_decision = 'revision_requested' and (p_comment is null or trim(p_comment) = '') then
        raise exception 'Komentar wajib diisi jika meminta revisi.';
    end if;

    -- Map decision to quotation status
    v_new_status := case p_decision
        when 'approved' then 'approved'::quotation_status
        when 'rejected' then 'rejected'::quotation_status
        when 'revision_requested' then 'revision_requested'::quotation_status
    end;

    -- Get inquiry ID
    select inquiry_id into v_inquiry_id from public.quotations where id = p_quotation_id;

    -- Insert approval record
    insert into public.approvals (quotation_id, approver_id, decision, comment, decided_at)
    values (p_quotation_id, auth.uid(), p_decision, p_comment, now());

    -- Update quotation status
    update public.quotations
    set status = v_new_status,
        updated_at = now()
    where id = p_quotation_id;

    -- Update inquiry status
    if p_decision = 'approved' then
        update public.inquiries set status = 'approved', updated_at = now() where id = v_inquiry_id;
    elsif p_decision = 'revision_requested' then
        update public.inquiries set status = 'revision', updated_at = now() where id = v_inquiry_id;
    end if;
end;
$$;


-- ==========================================
-- 9. AUDIT LOGS
-- ==========================================
create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    table_name text not null,
    record_id uuid not null,
    action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SEND')),
    performed_by uuid references public.profiles(id),
    old_data jsonb,
    new_data jsonb,
    created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Owner and Finance can view audit logs"
    on public.audit_logs for select
    to authenticated
    using (public.current_role() in ('owner', 'finance'));

-- Generic audit trigger function
create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.audit_logs (table_name, record_id, action, performed_by, old_data, new_data)
    values (
        tg_table_name,
        coalesce(new.id, old.id),
        tg_op,
        auth.uid(),
        case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
        case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
    return coalesce(new, old);
end;
$$;

create trigger audit_quotations
    after insert or update on public.quotations
    for each row execute function public.log_audit_event();

create trigger audit_commercial_analysis
    after insert or update on public.commercial_analysis
    for each row execute function public.log_audit_event();


-- ==========================================
-- 10. CMS TABLES FOR PUBLIC WEBSITE (PHASE 1B)
-- ==========================================
create table public.site_settings (
    id uuid primary key default gen_random_uuid(),
    company_name text not null default 'PT Automation Solusi Indonesia',
    tagline text default 'Industrial Automation & Systems Integration',
    email text default 'info@automation-company.com',
    phone text default '+62 21 0000000',
    whatsapp text default '+62 812 00000000',
    address text default 'Kawasan Industri, Jakarta, Indonesia',
    working_hours text default 'Senin - Jumat: 08.00 - 17.00 WIB',
    seo_meta_title text,
    seo_meta_description text,
    updated_at timestamptz not null default now()
);

create table public.site_services (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    description text,
    icon text,
    image_url text,
    sort_order integer not null default 0,
    is_published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.site_projects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    industry text,
    client_name text,
    description text,
    main_image_url text,
    gallery_urls text[] default '{}',
    sort_order integer not null default 0,
    is_published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.site_services enable row level security;
alter table public.site_projects enable row level security;

-- Public anon read access to published website content
create policy "Public can read site settings"
    on public.site_settings for select
    to anon, authenticated
    using (true);

create policy "Public can read published services"
    on public.site_services for select
    to anon, authenticated
    using (is_published = true);

create policy "Public can read published projects"
    on public.site_projects for select
    to anon, authenticated
    using (is_published = true);

-- Owner and Sales can manage site content
create policy "Staff can manage site settings"
    on public.site_settings for all
    to authenticated
    using (public.current_role() in ('owner', 'sales'))
    with check (public.current_role() in ('owner', 'sales'));

create policy "Staff can manage site services"
    on public.site_services for all
    to authenticated
    using (public.current_role() in ('owner', 'sales'))
    with check (public.current_role() in ('owner', 'sales'));

create policy "Staff can manage site projects"
    on public.site_projects for all
    to authenticated
    using (public.current_role() in ('owner', 'sales'))
    with check (public.current_role() in ('owner', 'sales'));


-- ==========================================
-- 11. VIEWS FOR DASHBOARDS & SUMMARY
-- ==========================================
create or replace view public.v_pipeline_summary as
select 
    status,
    count(*) as total_count,
    coalesce(sum(estimated_value), 0) as total_estimated_value
from public.inquiries
where deleted_at is null
group by status;

-- Auto updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_updated_at_profiles before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at_customers before update on public.customers for each row execute function public.set_updated_at();
create trigger set_updated_at_vendors before update on public.vendors for each row execute function public.set_updated_at();
create trigger set_updated_at_inquiries before update on public.inquiries for each row execute function public.set_updated_at();
create trigger set_updated_at_quotations before update on public.quotations for each row execute function public.set_updated_at();
