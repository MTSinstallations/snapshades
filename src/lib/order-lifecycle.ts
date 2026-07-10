/**
 * Order Lifecycle State Machine
 * 
 * Every order transition happens automatically.
 * No human dispatchers, no manual status updates.
 * 
 * States:
 *   pending → confirmed → manufacturing → shipped → 
 *   delivered → (installing → completed) | completed
 * 
 * Side channels:
 *   cancelled, refunded, failed
 */

import { supabase } from './supabase';
import { SITE_URL } from './constants';
import { sendEmail, customerEmails, contractorEmails } from './email-templates';

type OrderStatus = 'pending' | 'confirmed' | 'manufacturing' | 'shipped' | 'delivered' | 'installing' | 'completed' | 'cancelled' | 'refunded';

async function getWindowCount(projectId: string | null): Promise<number> {
  if (!projectId) return 0;
  const { count } = await supabase
    .from('windows')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);
  return count ?? 0;
}

interface TransitionResult {
  success: boolean;
  orderId: string;
  from: string;
  to: string;
  actions: string[];
  error?: string;
}

/**
 * Advance an order to its next state.
 * Triggers all side effects (emails, contractor matching, etc.)
 */
export async function advanceOrder(orderId: string, targetStatus: OrderStatus, metadata?: Record<string, unknown>): Promise<TransitionResult> {
  const actions: string[] = [];

  try {
  // Load order
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { success: false, orderId, from: '', to: targetStatus, actions, error: 'Order not found' };
  }

  const fromStatus = order.status;
  const customer = order.customers;

  // Update order status
  const updates: Record<string, unknown> = { status: targetStatus };
  if (targetStatus === 'shipped' && metadata?.trackingNumber) {
    updates.tracking_number = metadata.trackingNumber;
    updates.shipped_at = new Date().toISOString();
    if (metadata.estimatedDelivery) updates.estimated_delivery = metadata.estimatedDelivery;
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (updateErr) {
    return { success: false, orderId, from: fromStatus, to: targetStatus, actions, error: updateErr.message };
  }

  // ── SIDE EFFECTS BY STATUS ──

  if (targetStatus === 'confirmed') {
    // Send confirmation email
    if (customer?.email) {
      const email = customerEmails.orderConfirmation({
        name: customer.full_name || 'Customer',
        orderNumber: order.order_number,
        total: Number(order.grand_total).toFixed(2),
        itemCount: await getWindowCount(order.project_id as string | null),
        hasInstall: Number(order.install_total) > 0,
      });
      email.to = customer.email;
      await sendEmail(email);
      actions.push('Sent confirmation email');
    }

    // Supplier work is queued only by the paid-order database trigger. A
    // status transition by itself must never release an unpaid order.
    actions.push('Fulfillment remains gated by verified payment');
  }

  if (targetStatus === 'shipped') {
    // Send shipping email
    if (customer?.email && metadata?.trackingNumber) {
      const email = customerEmails.orderShipped({
        name: customer.full_name || 'Customer',
        orderNumber: order.order_number,
        trackingNumber: String(metadata.trackingNumber),
        carrier: String(metadata.carrier || 'UPS'),
        estimatedDelivery: String(metadata.estimatedDelivery || 'TBD'),
      });
      email.to = customer.email;
      await sendEmail(email);
      actions.push('Sent shipping notification');
    }
  }

  if (targetStatus === 'delivered') {
    // If order has install tier → auto-match contractor
    if (Number(order.install_total) > 0) {
      const matchResult = await autoMatchContractor(orderId, order);
      actions.push(matchResult);
    } else {
      // DIY order → mark complete
      await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
      actions.push('DIY order — auto-completed');

      // Schedule review request (24h delay — will be cron)
      actions.push('Queued review request for 24h');
    }

    // Schedule 30-day inspection emails
    actions.push('Scheduled 30-day inspection email sequence');
  }

  if (targetStatus === 'completed') {
    // Send review request
    if (customer?.email) {
      // Queue for 24h later (cron)
      actions.push('Review request queued (24h delay)');
    }

    // Schedule inspection sequence: day 7, 14, 21, 28, 30
    actions.push('30-day inspection sequence scheduled');
  }

  return { success: true, orderId, from: fromStatus, to: targetStatus, actions };
  } catch (err: unknown) {
    return { success: false, orderId, from: '', to: targetStatus, actions, error: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

/**
 * Auto-match a contractor to an order.
 * No dispatcher. Algorithm picks the best available contractor.
 */
async function autoMatchContractor(orderId: string, order: Record<string, unknown>): Promise<string> {
  // Get customer ZIP from shipping address
  const shippingAddr = order.shipping_address as { zip?: string } | null;
  const customerZip = shippingAddr?.zip;
  if (!customerZip) return 'No customer ZIP — cannot match contractor';

  // Find ranked contractors for this ZIP
  const { data: matches } = await supabase
    .from('territory_contractors')
    .select('installer_id, rank, installers(id, full_name, email, phone, status)')
    .eq('zip', customerZip)
    .order('rank', { ascending: true });

  if (!matches || matches.length === 0) {
    // Expand search — find nearby ZIPs
    // For now, just flag it
    return 'No contractors in ZIP — added to waitlist';
  }

  // Filter to active contractors
  const active = matches.filter((m: Record<string, unknown>) => {
    const installer = m.installers as Record<string, unknown> | null;
    return installer && installer.status === 'active';
  });

  if (active.length === 0) {
    return 'Contractors found but none active — added to waitlist';
  }

  // Resolve city/state for the customer ZIP
  const { data: zipInfo } = await supabase
    .from('zip_metadata')
    .select('city, state')
    .eq('zip', customerZip)
    .single();

  // Offer to #1 ranked
  const topMatch = active[0];
  const installer = topMatch.installers as unknown as Record<string, unknown>;

  // Create booking
  const { data: booking } = await supabase
    .from('installer_bookings')
    .insert({
      order_id: orderId,
      installer_id: topMatch.installer_id,
      customer_id: order.customer_id,
      booking_type: 'install',
      status: 'pending',
      installer_payout: Number(order.install_total) * 0.9, // 90% to contractor
      payout_status: 'pending',
    })
    .select('id')
    .single();

  // Send job offer email
  if (installer.email) {
    const email = contractorEmails.newJobOffer({
      name: String(installer.full_name),
      city: zipInfo?.city || 'your area',
      state: zipInfo?.state || '',
      windowCount: await getWindowCount(order.project_id as string | null),
      productType: 'Window Treatments',
      date: 'Flexible — customer will coordinate',
      payout: (Number(order.install_total) * 0.9).toFixed(2),
      acceptUrl: `${SITE_URL}/portal?accept=${booking?.id}`,
      declineUrl: `${SITE_URL}/portal?decline=${booking?.id}`,
      expiresIn: '4 hours',
    });
    email.to = String(installer.email);
    await sendEmail(email);
  }

  return `Job offered to ${installer.full_name} (rank #${topMatch.rank})`;
}

/**
 * Process weekly contractor payouts.
 * Runs every Monday at midnight via cron.
 * Calculates all completed jobs from prior week → auto-pays.
 */
export async function processWeeklyPayouts(): Promise<{
  processed: number; totalPaid: number; failed: string[];
}> {
  const failed: string[] = [];
  let totalPaid = 0;
  let processed = 0;

  // Get all completed bookings from last week that haven't been paid
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: bookings } = await supabase
    .from('installer_bookings')
    .select('id, installer_id, installer_payout, order_id, installers(full_name, email)')
    .eq('status', 'completed')
    .eq('payout_status', 'pending')
    .lt('completed_at', new Date().toISOString());

  if (!bookings || bookings.length === 0) {
    return { processed: 0, totalPaid: 0, failed: [] };
  }

  // Group by contractor
  const byContractor: Record<string, { bookingIds: string[]; total: number; name: string; email: string }> = {};

  for (const b of bookings) {
    const cid = b.installer_id;
    if (!byContractor[cid]) {
      const inst = b.installers as unknown as Record<string, string> | null;
      byContractor[cid] = {
        bookingIds: [],
        total: 0,
        name: inst?.full_name || '',
        email: inst?.email || '',
      };
    }
    byContractor[cid].bookingIds.push(b.id);
    byContractor[cid].total += Number(b.installer_payout);
  }

  // Process each contractor
  for (const [contractorId, data] of Object.entries(byContractor)) {
    const platformFee = data.total * 0.10; // 10% platform fee already deducted from payout calc
    const netAmount = data.total;

    // Create payment record
    const { error: payErr } = await supabase
      .from('contractor_payments')
      .insert({
        installer_id: contractorId,
        amount: data.total + platformFee,
        platform_fee: platformFee,
        net_amount: netAmount,
        payment_method: 'ach',
        status: 'processing',
        period_start: weekAgo.toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        description: `${data.bookingIds.length} job(s) — weekly payout`,
      });

    if (payErr) {
      failed.push(`${data.name}: ${payErr.message}`);
      continue;
    }

    // TODO: Execute Stripe Connect transfer
    // const transfer = await stripe.transfers.create({ amount: netAmount * 100, currency: 'usd', destination: contractor.stripe_connect_id });

    // Mark bookings as paid
    await supabase
      .from('installer_bookings')
      .update({ payout_status: 'processing' })
      .in('id', data.bookingIds);

    // Send payout email
    if (data.email) {
      const email = contractorEmails.payoutSent({
        name: data.name,
        amount: netAmount.toFixed(2),
        jobCount: data.bookingIds.length,
        periodStart: weekAgo.toLocaleDateString(),
        periodEnd: new Date().toLocaleDateString(),
      });
      email.to = data.email;
      await sendEmail(email);
    }

    totalPaid += netAmount;
    processed++;
  }

  return { processed, totalPaid, failed };
}

/**
 * Auto-send inspection emails.
 * Runs daily. Checks for orders completed X days ago.
 * Sends at day 7, 14, 21, 28, 30.
 */
export async function sendInspectionEmails(): Promise<{ sent: number }> {
  const checkDays = [7, 14, 21, 28, 30];
  let sent = 0;

  for (const day of checkDays) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - day);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Find orders completed on this date
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, customer_id, customers(email, full_name)')
      .eq('status', 'completed')
      .gte('updated_at', `${dateStr}T00:00:00`)
      .lt('updated_at', `${dateStr}T23:59:59`);

    if (!orders) continue;

    for (const order of orders) {
      const customer = order.customers as unknown as Record<string, string> | null;
      if (!customer?.email) continue;

      const email = customerEmails.inspectionReminder({
        name: customer.full_name || 'Customer',
        orderNumber: order.order_number,
        dayNumber: day,
      });
      email.to = customer.email;
      await sendEmail(email);
      sent++;
    }
  }

  return { sent };
}
