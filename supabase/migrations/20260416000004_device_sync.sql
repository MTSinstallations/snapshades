-- Device sync — seamless phone ↔ desktop handoff for logged-in users.
--
-- Customer starts on phone: takes room photos, measures windows, picks
-- swatches. Signs in. State uploads. Logs in on desktop. State downloads.
-- Picks up where they left off.
--
-- `state` is a jsonb blob holding non-cart ephemeral UI state that
-- persistent-cart.ts doesn't already cover:
--   - snapshades_wizard_state  (MeasureWizard in-progress step/measurements)
--   - snapshades_swatches      (per-window swatch picks)
--   - snapshades_photos        (per-window photo references — URLs or base64)
--   - snapshades_notes         (freeform per-window notes)
--
-- The cart itself (windows, pricing) stays in the normalized projects/rooms/
-- windows tables. Sync is one row per user, last-write-wins — simple and
-- sufficient for a single-user-across-devices scenario.

create table if not exists public.user_sync_state (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  state        jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  last_device  text null,
  constraint user_sync_state_payload_reasonable check (pg_column_size(state) < 1048576)
);

create index if not exists user_sync_state_updated_idx
  on public.user_sync_state (updated_at desc);

alter table public.user_sync_state enable row level security;

-- Users read + write their own row.
create policy user_sync_state_select_own
  on public.user_sync_state for select
  using (auth.uid() = user_id);

create policy user_sync_state_insert_own
  on public.user_sync_state for insert
  with check (auth.uid() = user_id);

create policy user_sync_state_update_own
  on public.user_sync_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.user_sync_state is 'Cross-device ephemeral UI state (wizard, swatches, photos). Cart is in projects/rooms/windows; this covers everything else.';
