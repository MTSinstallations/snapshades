-- Internal CRM chat — staff ↔ customer ↔ contractor messaging.
--
-- Backs the Admin "Messages" inbox and the "Messages" sections of the Customer
-- and Contractor portals (see src/lib/crm-chat.ts). A conversation is always
-- between SnapShades staff and one "party" (a customer or a contractor),
-- optionally tied to an order/job reference.
--
-- IDs are application-generated text ('conv_…' / 'msg_…') so the same record
-- round-trips between the localStorage demo store and Postgres unchanged.
-- Realtime is enabled so every open inbox/portal updates the instant a message
-- is sent — the demo build gets the same liveness from a localStorage event bus.

-- ── Conversations ──

create table if not exists public.crm_conversations (
  id           text primary key,
  party_kind   text not null check (party_kind in ('customer', 'contractor')),
  party_id     text not null,
  party_name   text not null,
  party_email  text null,
  party_phone  text null,
  subject      text not null,
  order_ref    text null,
  status       text not null default 'open' check (status in ('open', 'snoozed', 'resolved')),
  assigned_to  text null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists crm_conversations_party_idx
  on public.crm_conversations (party_kind, party_id);
create index if not exists crm_conversations_updated_idx
  on public.crm_conversations (updated_at desc);

-- ── Messages ──

create table if not exists public.crm_messages (
  id              text primary key,
  conversation_id text not null references public.crm_conversations (id) on delete cascade,
  role            text not null check (role in ('staff', 'customer', 'contractor')),
  author_name     text not null,
  body            text not null,
  created_at      timestamptz not null default now(),
  read_by_staff   boolean not null default false,
  read_by_party   boolean not null default false
);

create index if not exists crm_messages_conversation_idx
  on public.crm_messages (conversation_id, created_at);

-- ── Row-level security ──
--
-- The party (customer/contractor) reads and writes only their own threads,
-- keyed on auth.uid(). Staff/admin access is broader and should run through a
-- service-role context (server functions) or a future is_admin() claim — the
-- app's AdminGuard still has an "any authenticated user is admin" TODO, so we
-- deliberately do NOT grant blanket staff access from the client here.

alter table public.crm_conversations enable row level security;
alter table public.crm_messages enable row level security;

create policy crm_conversations_party_select
  on public.crm_conversations for select
  using (party_id = auth.uid()::text);

create policy crm_conversations_party_insert
  on public.crm_conversations for insert
  with check (party_id = auth.uid()::text);

create policy crm_conversations_party_update
  on public.crm_conversations for update
  using (party_id = auth.uid()::text)
  with check (party_id = auth.uid()::text);

create policy crm_messages_party_select
  on public.crm_messages for select
  using (
    exists (
      select 1 from public.crm_conversations c
      where c.id = crm_messages.conversation_id
        and c.party_id = auth.uid()::text
    )
  );

create policy crm_messages_party_insert
  on public.crm_messages for insert
  with check (
    exists (
      select 1 from public.crm_conversations c
      where c.id = crm_messages.conversation_id
        and c.party_id = auth.uid()::text
    )
  );

create policy crm_messages_party_update
  on public.crm_messages for update
  using (
    exists (
      select 1 from public.crm_conversations c
      where c.id = crm_messages.conversation_id
        and c.party_id = auth.uid()::text
    )
  );

-- ── Realtime ──
-- Push inserts/updates to subscribed inboxes (src/lib/crm-chat.ts → subscribeRemote).
alter publication supabase_realtime add table public.crm_conversations;
alter publication supabase_realtime add table public.crm_messages;

comment on table public.crm_conversations is 'CRM chat threads between staff and a customer/contractor. See src/lib/crm-chat.ts.';
comment on table public.crm_messages is 'Messages within a CRM chat thread. Realtime-enabled.';
