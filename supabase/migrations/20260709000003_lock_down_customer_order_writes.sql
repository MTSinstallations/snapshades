-- Order totals and payment/fulfillment state are server-authoritative.
-- The original application policy used FOR ALL, which allowed an authenticated
-- customer to update every column on their own order row.

drop policy if exists orders_own_data on public.orders;
drop policy if exists orders_customer_select on public.orders;

create policy orders_customer_select
  on public.orders for select to authenticated
  using (customer_id = auth.uid());

comment on policy orders_customer_select on public.orders is
  'Customers may read their own orders; only service-role and staff policies may write order state.';
