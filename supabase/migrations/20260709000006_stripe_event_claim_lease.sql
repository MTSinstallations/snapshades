-- A short processing lease distinguishes a completed duplicate from a
-- concurrent delivery. Busy deliveries receive a non-2xx response so Stripe
-- retries instead of silently dropping an event whose first worker may fail.

create or replace function public.claim_stripe_webhook_event_v2(
  p_event_id text,
  p_event_type text,
  p_livemode boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_updated_at timestamptz;
begin
  if p_event_id is null or length(p_event_id) < 8 then
    return 'duplicate';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id));

  select status, updated_at into v_status, v_updated_at
    from public.stripe_webhook_events
    where stripe_event_id = p_event_id;

  if found then
    if v_status = 'processed' then
      return 'duplicate';
    end if;
    if v_status = 'processing' and v_updated_at > now() - interval '5 minutes' then
      return 'busy';
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

  return 'claimed';
end;
$$;

revoke all on function public.claim_stripe_webhook_event_v2(text, text, boolean) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook_event_v2(text, text, boolean) to service_role;
