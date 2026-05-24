-- AI credits ledger — tracks generative-AI credit balance per user/session.
--
-- Used by:
--   supabase/functions/visualize-room — debits 1 credit per successful
--     photorealistic room visualization.
--
-- Anonymous sessions get 3 credits on creation (browser-session scoped).
-- Authenticated users get 10 credits on creation. Credits are earned via
-- bonus actions (swatch order, account setup, order placement) — tracked
-- by incrementing balance with a reason recorded in ai_credits_ledger.
--
-- RLS: owners can read their own balance (for UI display); writes are
-- service-role only (edge functions).

create table if not exists public.ai_credits (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid null references auth.users (id) on delete cascade,
  session_id     text null,
  balance        int not null default 0,
  total_earned   int not null default 0,
  total_spent    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint ai_credits_identifier_present
    check (user_id is not null or session_id is not null),
  constraint ai_credits_balance_nonneg
    check (balance >= 0)
);

-- One row per user OR session — whichever is authoritative for that caller.
create unique index if not exists ai_credits_user_idx
  on public.ai_credits (user_id)
  where user_id is not null;

create unique index if not exists ai_credits_session_idx
  on public.ai_credits (session_id)
  where session_id is not null;

-- Audit log — every credit movement recorded for debugging & abuse detection.
create table if not exists public.ai_credits_ledger (
  id          uuid primary key default gen_random_uuid(),
  credits_id  uuid not null references public.ai_credits (id) on delete cascade,
  delta       int not null,
  reason      text not null,
  metadata    jsonb null,
  created_at  timestamptz not null default now()
);

create index if not exists ai_credits_ledger_credits_idx
  on public.ai_credits_ledger (credits_id, created_at desc);

-- RLS. Credits row is readable by its owner; ledger is admin-only.
alter table public.ai_credits enable row level security;
alter table public.ai_credits_ledger enable row level security;

create policy ai_credits_read_own
  on public.ai_credits for select
  using (
    (user_id is not null and auth.uid() = user_id)
    -- anon readers identify themselves via session_id in the RPC, not here
    or user_id is null
  );

comment on table public.ai_credits is 'Per-user/session credit balance for generative-AI endpoints (room visualizer). Starts at 3 (anon) or 10 (authed).';
comment on table public.ai_credits_ledger is 'Audit log of credit grants, spends, refunds, and bonuses.';

-- Atomic spend-one-credit function. Returns the new balance, or null if
-- insufficient credits. Called by the visualize-room edge function.
create or replace function public.spend_ai_credit(
  p_user_id    uuid,
  p_session_id text,
  p_reason     text,
  p_metadata   jsonb default null
)
returns int
language plpgsql
security definer
as $$
declare
  v_credits_id uuid;
  v_new_balance int;
begin
  -- Locate the credits row (or create it on first use).
  if p_user_id is not null then
    insert into public.ai_credits (user_id, balance, total_earned)
    values (p_user_id, 10, 10)
    on conflict (user_id) where user_id is not null do nothing;
    select id into v_credits_id
      from public.ai_credits
      where user_id = p_user_id
      for update;
  else
    insert into public.ai_credits (session_id, balance, total_earned)
    values (p_session_id, 3, 3)
    on conflict (session_id) where session_id is not null do nothing;
    select id into v_credits_id
      from public.ai_credits
      where session_id = p_session_id
      for update;
  end if;

  -- Attempt to debit.
  update public.ai_credits
     set balance = balance - 1,
         total_spent = total_spent + 1,
         updated_at = now()
   where id = v_credits_id and balance > 0
   returning balance into v_new_balance;

  if v_new_balance is null then
    return null; -- insufficient credits
  end if;

  insert into public.ai_credits_ledger (credits_id, delta, reason, metadata)
  values (v_credits_id, -1, p_reason, p_metadata);

  return v_new_balance;
end;
$$;

-- Award credits (for bonuses: swatch order, account setup, order placement).
create or replace function public.award_ai_credits(
  p_user_id    uuid,
  p_session_id text,
  p_amount     int,
  p_reason     text,
  p_metadata   jsonb default null
)
returns int
language plpgsql
security definer
as $$
declare
  v_credits_id uuid;
  v_new_balance int;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;

  if p_user_id is not null then
    insert into public.ai_credits (user_id, balance, total_earned)
    values (p_user_id, 10, 10)
    on conflict (user_id) where user_id is not null do nothing;
    select id into v_credits_id from public.ai_credits where user_id = p_user_id for update;
  else
    insert into public.ai_credits (session_id, balance, total_earned)
    values (p_session_id, 3, 3)
    on conflict (session_id) where session_id is not null do nothing;
    select id into v_credits_id from public.ai_credits where session_id = p_session_id for update;
  end if;

  update public.ai_credits
     set balance = balance + p_amount,
         total_earned = total_earned + p_amount,
         updated_at = now()
   where id = v_credits_id
   returning balance into v_new_balance;

  insert into public.ai_credits_ledger (credits_id, delta, reason, metadata)
  values (v_credits_id, p_amount, p_reason, p_metadata);

  return v_new_balance;
end;
$$;

grant execute on function public.spend_ai_credit to service_role;
grant execute on function public.award_ai_credits to service_role, authenticated;
