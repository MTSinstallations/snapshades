-- AI usage tracking table — rolling 24h window rate limits for AI endpoints.
-- Used by:
--   supabase/functions/read-tape-measure — action = 'tape_measure'
--
-- Design notes:
-- - We track usage by (user_id) for authenticated callers and by
--   (session_id) — a client-generated opaque string — for anonymous ones.
-- - Rate-limit lookup is a simple COUNT over the last 24 hours; the index
--   is set up to serve that predicate cheaply.
-- - RLS blocks direct client reads/writes. Edge functions hit the table
--   with the service role key.

create table if not exists public.ai_usage (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid null references auth.users (id) on delete cascade,
  session_id   text null,
  action       text not null check (action in ('tape_measure', 'visualize_room')),
  created_at   timestamptz not null default now()
);

-- Require either user_id or session_id (not both null) so every row is
-- attributable to a rate-limit key.
alter table public.ai_usage
  add constraint ai_usage_identifier_present
  check (user_id is not null or session_id is not null);

-- Indexes to serve the rolling-window count cheaply.
create index if not exists ai_usage_user_action_created_idx
  on public.ai_usage (user_id, action, created_at desc)
  where user_id is not null;

create index if not exists ai_usage_session_action_created_idx
  on public.ai_usage (session_id, action, created_at desc)
  where session_id is not null;

-- RLS: lock the table down. Edge functions use the service role key, which
-- bypasses RLS; ordinary clients have no direct access.
alter table public.ai_usage enable row level security;

-- No policies = no access for anon or authenticated roles. Service role
-- bypasses RLS by design.

comment on table public.ai_usage is 'Per-user/per-session rate-limit counters for AI endpoints (tape measure, room visualizer). Cleaned via nightly cron of rows older than 30 days.';
