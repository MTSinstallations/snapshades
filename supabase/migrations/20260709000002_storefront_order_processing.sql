-- Durable, server-authoritative order processing for the three-product value storefront.

alter table public.orders
  add column if not exists contact_email text,
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists checkout_token uuid,
  add column if not exists checkout_fingerprint text,
  add column if not exists checkout_attempt_count integer not null default 0,
  add column if not exists pricing_version text,
  add column if not exists currency text not null default 'usd',
  add column if not exists source text not null default 'legacy',
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists fulfillment_notification_sent_at timestamptz;

create unique index if not exists orders_checkout_token_key
  on public.orders(checkout_token)
  where checkout_token is not null;

create index if not exists orders_checkout_session_idx
  on public.orders(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_contact_email_idx
  on public.orders(lower(contact_email))
  where contact_email is not null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  line_number integer not null check (line_number > 0),
  cart_item_id uuid,
  product_family text not null check (product_family in ('cellular', 'roller', 'faux-wood')),
  product_id text not null,
  variant_id text not null,
  supplier_name text not null,
  supplier_sku text not null,
  product_name text not null,
  room_name text,
  item_name text,
  mount_type text not null check (mount_type in ('inside', 'outside')),
  width decimal(8,3) not null check (width >= 6),
  height decimal(8,3) not null check (height >= 6),
  quantity integer not null default 1 check (quantity > 0),
  product_options jsonb not null default '{}'::jsonb,
  retail_price decimal(10,2) not null check (retail_price >= 0),
  supplier_cost decimal(10,2) not null check (supplier_cost >= 0),
  broker_fee decimal(10,2) not null check (broker_fee >= 0),
  customer_price decimal(10,2) not null check (customer_price >= 0),
  pricing_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (order_id, line_number)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.fulfillment_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  supplier_name text not null,
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'ready_for_review', 'submitted', 'in_production', 'shipped', 'blocked', 'cancelled')),
  supplier_order_ref text,
  attempts integer not null default 0,
  last_error text,
  ready_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fulfillment_jobs_status_idx
  on public.fulfillment_jobs(status, created_at);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null default false,
  status text not null default 'processing'
    check (status in ('processing', 'processed', 'failed')),
  attempts integer not null default 1,
  order_id uuid references public.orders(id) on delete set null,
  last_error text,
  first_received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.storefront_checkout_attempts (
  id bigint generated always as identity primary key,
  rate_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists storefront_checkout_attempts_key_created_idx
  on public.storefront_checkout_attempts(rate_key, created_at desc);

alter table public.order_items enable row level security;
alter table public.fulfillment_jobs enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.storefront_checkout_attempts enable row level security;

create or replace function public.claim_storefront_checkout_attempt(
  p_rate_key text,
  p_limit integer default 8,
  p_window interval default interval '15 minutes'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempts integer;
begin
  if p_rate_key is null or length(p_rate_key) < 16 then
    return false;
  end if;

  delete from public.storefront_checkout_attempts
    where created_at < now() - interval '24 hours';

  perform pg_advisory_xact_lock(hashtext(p_rate_key));

  select count(*) into v_attempts
    from public.storefront_checkout_attempts
    where rate_key = p_rate_key
      and created_at >= now() - p_window;

  if v_attempts >= p_limit then
    return false;
  end if;

  insert into public.storefront_checkout_attempts(rate_key) values (p_rate_key);
  return true;
end;
$$;

revoke all on function public.claim_storefront_checkout_attempt(text, integer, interval) from public, anon, authenticated;
grant execute on function public.claim_storefront_checkout_attempt(text, integer, interval) to service_role;

drop policy if exists order_items_customer_select on public.order_items;
create policy order_items_customer_select
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- Add staff access only when the staff predicate is installed. The preceding
-- crm_chat_v2 migration creates this function on the existing application.
do $$
begin
  if to_regprocedure('public.is_staff()') is not null then
    execute 'drop policy if exists orders_staff_select on public.orders';
    execute 'create policy orders_staff_select on public.orders for select to authenticated using (public.is_staff())';
    execute 'drop policy if exists orders_staff_update on public.orders';
    execute 'create policy orders_staff_update on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff())';
    execute 'drop policy if exists customers_staff_select on public.customers';
    execute 'create policy customers_staff_select on public.customers for select to authenticated using (public.is_staff())';
    execute 'drop policy if exists order_items_staff_select on public.order_items';
    execute 'create policy order_items_staff_select on public.order_items for select to authenticated using (public.is_staff())';
    execute 'drop policy if exists fulfillment_jobs_staff_select on public.fulfillment_jobs';
    execute 'create policy fulfillment_jobs_staff_select on public.fulfillment_jobs for select to authenticated using (public.is_staff())';
    execute 'drop policy if exists fulfillment_jobs_staff_update on public.fulfillment_jobs';
    execute 'create policy fulfillment_jobs_staff_update on public.fulfillment_jobs for update to authenticated using (public.is_staff()) with check (public.is_staff())';
  end if;
end
$$;

create or replace function public.queue_paid_storefront_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supplier text;
begin
  if new.source = 'value_storefront'
    and new.payment_status = 'paid'
    and old.payment_status is distinct from 'paid' then
    select coalesce(min(supplier_name), 'Supplier')
      into v_supplier
      from public.order_items
      where order_id = new.id;

    insert into public.fulfillment_jobs (
      order_id,
      supplier_name,
      status,
      ready_at
    ) values (
      new.id,
      v_supplier,
      'ready_for_review',
      now()
    )
    on conflict (order_id) do update
      set status = case
            when public.fulfillment_jobs.status = 'awaiting_payment' then 'ready_for_review'
            else public.fulfillment_jobs.status
          end,
          ready_at = coalesce(public.fulfillment_jobs.ready_at, excluded.ready_at),
          updated_at = now();

    new.confirmed_at := coalesce(new.confirmed_at, now());
  end if;

  return new;
end;
$$;

create or replace function public.admin_update_fulfillment(
  p_order_id uuid,
  p_status text,
  p_supplier_order_ref text default null,
  p_tracking_number text default null,
  p_estimated_delivery date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.fulfillment_jobs;
begin
  if to_regprocedure('public.is_staff()') is null or not public.is_staff() then
    raise exception 'Staff access required';
  end if;

  if p_status not in ('ready_for_review', 'submitted', 'in_production', 'shipped', 'blocked', 'cancelled') then
    raise exception 'Invalid fulfillment status';
  end if;

  update public.fulfillment_jobs
    set status = p_status,
        supplier_order_ref = nullif(trim(p_supplier_order_ref), ''),
        submitted_at = case
          when p_status = 'submitted' then coalesce(submitted_at, now())
          else submitted_at
        end,
        updated_at = now()
    where order_id = p_order_id
    returning * into v_result;

  if v_result.id is null then
    raise exception 'Fulfillment job not found';
  end if;

  if p_status = 'in_production' then
    update public.orders set status = 'manufacturing' where id = p_order_id;
  elsif p_status = 'shipped' then
    if nullif(trim(p_tracking_number), '') is null then
      raise exception 'Tracking number is required before marking shipped';
    end if;
    update public.orders
      set status = 'shipped',
          tracking_number = trim(p_tracking_number),
          shipped_at = coalesce(shipped_at, now()),
          estimated_delivery = p_estimated_delivery
      where id = p_order_id;
  elsif p_status = 'cancelled' then
    update public.orders set status = 'cancelled' where id = p_order_id;
  end if;

  return to_jsonb(v_result);
end;
$$;

revoke all on function public.admin_update_fulfillment(uuid, text, text, text, date) from public, anon;
grant execute on function public.admin_update_fulfillment(uuid, text, text, text, date) to authenticated;

drop trigger if exists orders_queue_paid_storefront on public.orders;
create trigger orders_queue_paid_storefront
  before update of payment_status on public.orders
  for each row execute function public.queue_paid_storefront_order();

drop trigger if exists fulfillment_jobs_updated on public.fulfillment_jobs;
create trigger fulfillment_jobs_updated
  before update on public.fulfillment_jobs
  for each row execute function public.update_updated_at();

comment on table public.order_items is
  'Immutable customer and supplier specification snapshot for each paid storefront line item.';
comment on table public.fulfillment_jobs is
  'Durable work queue created only after payment is confirmed.';
comment on table public.stripe_webhook_events is
  'Stripe webhook idempotency and retry ledger; never exposed to browser clients.';
