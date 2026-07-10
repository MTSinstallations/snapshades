-- Staff use the narrow admin_update_fulfillment RPC. Generic REST updates to
-- order money, payment status, and queue rows are intentionally disabled.

drop policy if exists orders_staff_update on public.orders;
drop policy if exists fulfillment_jobs_staff_update on public.fulfillment_jobs;

comment on function public.admin_update_fulfillment(uuid, text, text, text, date) is
  'Only supported staff write path for storefront fulfillment state, supplier reference, and tracking.';
