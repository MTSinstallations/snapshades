-- swatch_requests — physical swatch-by-mail fulfillment queue.
--
-- Created when a customer completes /swatches/order. Admin ships from this
-- queue. The price_lock_until column implements the SelectBlinds-inspired
-- commitment escalator: today's order locks pricing for 30 days.
--
-- Anonymous (logged-out) customers can insert; reads are admin-only.
--
-- Fully idempotent: safe to re-run against a partial existing state.

create table if not exists public.swatch_requests (
  id                uuid primary key default gen_random_uuid()
);

-- Add columns defensively. `add column if not exists` (pg 9.6+) lets us
-- bring pre-existing tables from other partial migrations into line.
alter table public.swatch_requests
  add column if not exists email             text,
  add column if not exists name              text,
  add column if not exists user_id           uuid references auth.users (id) on delete set null,
  add column if not exists session_id        text,
  add column if not exists address_line1     text,
  add column if not exists address_line2     text,
  add column if not exists city              text,
  add column if not exists state             text,
  add column if not exists postal            text,
  add column if not exists country           text default 'US',
  add column if not exists swatch_ids        text[],
  add column if not exists status            text default 'pending',
  add column if not exists tracking_number   text,
  add column if not exists price_lock_until  timestamptz,
  add column if not exists created_at        timestamptz default now(),
  add column if not exists shipped_at        timestamptz;

-- Enforce NOT NULL on the columns that should be required (only if every
-- existing row already has a value).
do $$
begin
  if not exists (select 1 from public.swatch_requests where email is null) then
    alter table public.swatch_requests alter column email set not null;
  end if;
  if not exists (select 1 from public.swatch_requests where name is null) then
    alter table public.swatch_requests alter column name set not null;
  end if;
  if not exists (select 1 from public.swatch_requests where address_line1 is null) then
    alter table public.swatch_requests alter column address_line1 set not null;
  end if;
  if not exists (select 1 from public.swatch_requests where city is null) then
    alter table public.swatch_requests alter column city set not null;
  end if;
  if not exists (select 1 from public.swatch_requests where state is null) then
    alter table public.swatch_requests alter column state set not null;
  end if;
  if not exists (select 1 from public.swatch_requests where postal is null) then
    alter table public.swatch_requests alter column postal set not null;
  end if;
  if not exists (select 1 from public.swatch_requests where swatch_ids is null) then
    alter table public.swatch_requests alter column swatch_ids set not null;
  end if;
end$$;

-- Check constraints — drop and recreate so we can re-run safely
alter table public.swatch_requests
  drop constraint if exists swatch_requests_email_format;
alter table public.swatch_requests
  add constraint swatch_requests_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table public.swatch_requests
  drop constraint if exists swatch_requests_swatch_count;
alter table public.swatch_requests
  add constraint swatch_requests_swatch_count check (cardinality(swatch_ids) between 1 and 25);

alter table public.swatch_requests
  drop constraint if exists swatch_requests_status_check;
alter table public.swatch_requests
  add constraint swatch_requests_status_check
  check (status in ('pending', 'shipped', 'delivered', 'cancelled'));

-- Default the price-lock date to created_at + 30 days via trigger.
create or replace function public.set_swatch_price_lock()
returns trigger
language plpgsql
as $$
begin
  if new.price_lock_until is null then
    new.price_lock_until := coalesce(new.created_at, now()) + interval '30 days';
  end if;
  return new;
end;
$$;

drop trigger if exists swatch_requests_price_lock on public.swatch_requests;
create trigger swatch_requests_price_lock
  before insert on public.swatch_requests
  for each row
  execute function public.set_swatch_price_lock();

create index if not exists swatch_requests_status_created_idx
  on public.swatch_requests (status, created_at desc);

create index if not exists swatch_requests_email_idx
  on public.swatch_requests (email);

-- RLS.
alter table public.swatch_requests enable row level security;

drop policy if exists swatch_requests_public_insert on public.swatch_requests;
create policy swatch_requests_public_insert
  on public.swatch_requests for insert
  with check (true);

drop policy if exists swatch_requests_read_own on public.swatch_requests;
create policy swatch_requests_read_own
  on public.swatch_requests for select
  using (user_id is not null and auth.uid() = user_id);

comment on table public.swatch_requests is 'Physical swatch fulfillment queue. 30-day price lock per the brand commitment.';
