-- ==============================================================================
-- MIGRATION: 20261017000003_dev_permissive_rls.sql
-- Izinkan Akses Dev / Anon Key untuk Testing Aplikasi Internal
-- ==============================================================================

-- 1. Master Customers & Vendors
drop policy if exists "Customers select policy" on public.customers;
drop policy if exists "Customers insert policy" on public.customers;
drop policy if exists "Customers update policy" on public.customers;
create policy "Customers select policy" on public.customers for select to authenticated, anon using (deleted_at is null);
create policy "Customers insert policy" on public.customers for insert to authenticated, anon with check (true);
create policy "Customers update policy" on public.customers for update to authenticated, anon using (deleted_at is null) with check (true);

drop policy if exists "Vendors select policy" on public.vendors;
drop policy if exists "Vendors insert policy" on public.vendors;
drop policy if exists "Vendors update policy" on public.vendors;
create policy "Vendors select policy" on public.vendors for select to authenticated, anon using (deleted_at is null);
create policy "Vendors insert policy" on public.vendors for insert to authenticated, anon with check (true);
create policy "Vendors update policy" on public.vendors for update to authenticated, anon using (deleted_at is null) with check (true);

-- 2. Inquiries & Items
drop policy if exists "Inquiries select policy" on public.inquiries;
drop policy if exists "Inquiries insert policy" on public.inquiries;
drop policy if exists "Inquiries update policy" on public.inquiries;
create policy "Inquiries select policy" on public.inquiries for select to authenticated, anon using (deleted_at is null);
create policy "Inquiries insert policy" on public.inquiries for insert to authenticated, anon with check (true);
create policy "Inquiries update policy" on public.inquiries for update to authenticated, anon using (deleted_at is null) with check (true);

drop policy if exists "Inquiry items select policy" on public.inquiry_items;
drop policy if exists "Inquiry items insert policy" on public.inquiry_items;
drop policy if exists "Inquiry items update policy" on public.inquiry_items;
create policy "Inquiry items select policy" on public.inquiry_items for select to authenticated, anon using (true);
create policy "Inquiry items insert policy" on public.inquiry_items for insert to authenticated, anon with check (true);
create policy "Inquiry items update policy" on public.inquiry_items for update to authenticated, anon using (true) with check (true);

-- 3. Vendor Quotes
drop policy if exists "Vendor quotes select policy" on public.vendor_quotes;
drop policy if exists "Vendor quotes insert policy" on public.vendor_quotes;
drop policy if exists "Vendor quotes update policy" on public.vendor_quotes;
create policy "Vendor quotes select policy" on public.vendor_quotes for select to authenticated, anon using (deleted_at is null);
create policy "Vendor quotes insert policy" on public.vendor_quotes for insert to authenticated, anon with check (true);
create policy "Vendor quotes update policy" on public.vendor_quotes for update to authenticated, anon using (deleted_at is null) with check (true);

-- 4. Quotations & Quotation Items
drop policy if exists "Quotations select policy" on public.quotations;
drop policy if exists "Quotations insert policy" on public.quotations;
drop policy if exists "Quotations update policy" on public.quotations;
create policy "Quotations select policy" on public.quotations for select to authenticated, anon using (deleted_at is null);
create policy "Quotations insert policy" on public.quotations for insert to authenticated, anon with check (true);
create policy "Quotations update policy" on public.quotations for update to authenticated, anon using (deleted_at is null) with check (true);

drop policy if exists "Quotation items select policy" on public.quotation_items;
drop policy if exists "Quotation items insert policy" on public.quotation_items;
drop policy if exists "Quotation items update policy" on public.quotation_items;
create policy "Quotation items select policy" on public.quotation_items for select to authenticated, anon using (deleted_at is null);
create policy "Quotation items insert policy" on public.quotation_items for insert to authenticated, anon with check (true);
create policy "Quotation items update policy" on public.quotation_items for update to authenticated, anon using (deleted_at is null) with check (true);

-- 5. Transactions (PO, DO, Invoices, Payments, Tax Invoices)
drop policy if exists "Read customer_pos" on public.customer_pos;
drop policy if exists "Insert/Update customer_pos" on public.customer_pos;
drop policy if exists "Customer POs policy" on public.customer_pos;
create policy "Customer POs policy" on public.customer_pos for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read delivery_orders" on public.delivery_orders;
drop policy if exists "Manage delivery_orders" on public.delivery_orders;
drop policy if exists "Delivery orders policy" on public.delivery_orders;
create policy "Delivery orders policy" on public.delivery_orders for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read delivery_order_items" on public.delivery_order_items;
drop policy if exists "Manage delivery_order_items" on public.delivery_order_items;
drop policy if exists "Delivery order items policy" on public.delivery_order_items;
create policy "Delivery order items policy" on public.delivery_order_items for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read invoices" on public.invoices;
drop policy if exists "Manage invoices" on public.invoices;
drop policy if exists "Invoices policy" on public.invoices;
create policy "Invoices policy" on public.invoices for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read invoice_items" on public.invoice_items;
drop policy if exists "Manage invoice_items" on public.invoice_items;
drop policy if exists "Invoice items policy" on public.invoice_items;
create policy "Invoice items policy" on public.invoice_items for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read payments" on public.payments;
drop policy if exists "Manage payments" on public.payments;
drop policy if exists "Payments policy" on public.payments;
create policy "Payments policy" on public.payments for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read vendor_pos restricted" on public.vendor_pos;
drop policy if exists "Manage vendor_pos" on public.vendor_pos;
drop policy if exists "Vendor POs policy" on public.vendor_pos;
create policy "Vendor POs policy" on public.vendor_pos for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read vendor_po_items restricted" on public.vendor_po_items;
drop policy if exists "Manage vendor_po_items" on public.vendor_po_items;
drop policy if exists "Vendor PO items policy" on public.vendor_po_items;
create policy "Vendor PO items policy" on public.vendor_po_items for all to authenticated, anon using (true) with check (true);

drop policy if exists "Read tax_invoices" on public.tax_invoices;
drop policy if exists "Manage tax_invoices" on public.tax_invoices;
drop policy if exists "Tax invoices policy" on public.tax_invoices;
create policy "Tax invoices policy" on public.tax_invoices for all to authenticated, anon using (true) with check (true);

-- 6. Commercial Analysis & Internal Quotations (Dev/Testing Permissive)
drop policy if exists "Commercial analysis select" on public.commercial_analysis;
drop policy if exists "Commercial analysis manage" on public.commercial_analysis;
drop policy if exists "Commercial analysis policy" on public.commercial_analysis;
create policy "Commercial analysis policy" on public.commercial_analysis for all to authenticated, anon using (true) with check (true);

drop policy if exists "Internal quotations select" on public.internal_quotations;
drop policy if exists "Internal quotations manage" on public.internal_quotations;
drop policy if exists "Internal quotations policy" on public.internal_quotations;
create policy "Internal quotations policy" on public.internal_quotations for all to authenticated, anon using (true) with check (true);
