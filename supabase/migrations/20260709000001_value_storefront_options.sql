alter table if exists windows
  add column if not exists mount_type text default 'inside'
    check (mount_type in ('inside', 'outside')),
  add column if not exists product_options jsonb default '{}'::jsonb;

