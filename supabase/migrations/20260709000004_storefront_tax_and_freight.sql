-- Store the Stripe customer used to preserve the checkout shipping address.
-- Freight is known before payment; destination tax is finalized by Stripe Tax.

alter table public.orders
  add column if not exists stripe_customer_id text;

create index if not exists orders_stripe_customer_idx
  on public.orders(stripe_customer_id)
  where stripe_customer_id is not null;

comment on column public.orders.stripe_customer_id is
  'Stripe Customer created idempotently for the checkout shipping and tax address.';
