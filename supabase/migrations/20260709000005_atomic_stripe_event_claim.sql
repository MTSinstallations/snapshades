-- Atomically claim a Stripe event so concurrent deliveries cannot process the
-- same signed event twice.

create or replace function public.claim_stripe_webhook_event(
  p_event_id text,
  p_event_type text,
  p_livemode boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if p_event_id is null or length(p_event_id) < 8 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id));

  select status into v_status
    from public.stripe_webhook_events
    where stripe_event_id = p_event_id;

  if found then
    if v_status = 'processed' then
      return false;
    end if;

    update public.stripe_webhook_events
      set status = 'processing',
          attempts = attempts + 1,
          last_error = null,
          updated_at = now()
      where stripe_event_id = p_event_id;
  else
    insert into public.stripe_webhook_events (
      stripe_event_id,
      event_type,
      livemode
    ) values (
      p_event_id,
      p_event_type,
      p_livemode
    );
  end if;

  return true;
end;
$$;

revoke all on function public.claim_stripe_webhook_event(text, text, boolean) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook_event(text, text, boolean) to service_role;
