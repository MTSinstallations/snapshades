/**
 * Payment Pipeline — Full autonomous payment processing
 * 
 * CUSTOMER PAYMENT FLOW:
 * 1. Customer clicks "Continue to payment" → createStorefrontCheckout()
 * 2. Redirect to Stripe Checkout (hosted page)
 * 3. Signed Stripe webhook verifies the paid amount and confirms the order
 * 4. Database trigger creates a fulfillment job exactly once
 * 
 * CONTRACTOR PAYOUT FLOW:
 * 1. Job marked complete → payout queued
 * 2. Weekly cron (Monday) → processWeeklyPayouts()
 * 3. Calculate: (per_window × windows + surcharges) × 0.90 (keep 10%)
 * 4. Stripe Connect transfer → contractor's bank
 * 5. Auto-email payout receipt
 * 
 * REFUND FLOW:
 * 1. Customer requests refund OR warranty claim approved
 * 2. processRefund() → Stripe refund API
 * 3. Order status → refunded
 * 4. If contractor already paid → create adjustment deduction
 */

import { supabase } from './supabase';
import { sendEmail, contractorEmails } from './email-templates';

// ============================================================
// TYPES
// ============================================================

export interface StorefrontCheckoutItem {
  id: string;
  room: string;
  name: string;
  productId: string;
  variantId: string;
  width: number;
  height: number;
  mountType: 'inside' | 'outside';
  productOptions: Record<string, string>;
}

export interface StorefrontCheckoutRequest {
  checkoutToken: string;
  contact: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  items: StorefrontCheckoutItem[];
}

export interface StorefrontCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
  orderId: string;
  orderNumber: string;
  code?: string;
  error: string | null;
}

async function functionErrorMessage(error: unknown, fallback: string): Promise<{ message: string; code?: string }> {
  const context = error && typeof error === 'object' && 'context' in error
    ? (error as { context?: unknown }).context
    : null;
  if (context instanceof Response) {
    try {
      const body = await context.clone().json() as { error?: string; code?: string };
      return { message: body.error || fallback, code: body.code };
    } catch {
      // The function returned a non-JSON error; use the customer-safe fallback.
    }
  }
  return { message: fallback };
}

/**
 * Create the order and Stripe session in one server-authoritative operation.
 * The Edge Function ignores all browser price fields and prices each item from
 * the shared supplier grid before it writes the order or calls Stripe.
 */
export async function createStorefrontCheckout(
  input: StorefrontCheckoutRequest,
): Promise<StorefrontCheckoutResult> {
  const empty: StorefrontCheckoutResult = {
    sessionId: '', checkoutUrl: '', orderId: '', orderNumber: '', error: null,
  };

  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', { body: input });
    if (error) {
      const parsed = await functionErrorMessage(error, 'Secure checkout could not be opened. Please try again.');
      return { ...empty, error: parsed.message, code: parsed.code };
    }
    if (!data?.checkoutUrl || !data?.sessionId || !data?.orderId || !data?.orderNumber) {
      return { ...empty, error: data?.error || 'Secure checkout returned an incomplete response.' };
    }
    return {
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      error: null,
    };
  } catch (error: unknown) {
    return { ...empty, error: error instanceof Error ? error.message : 'Secure checkout could not be opened.' };
  }
}

export interface PaymentEvent {
  type: 'payment_success' | 'payment_failure' | 'refund_processed' | 'payout_sent';
  orderId?: string;
  amount: number;
  stripeId: string;
  metadata: Record<string, unknown>;
}

export interface PayoutSummary {
  contractorId: string;
  contractorName: string;
  jobCount: number;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  bookingIds: string[];
  status: 'calculated' | 'processing' | 'sent' | 'failed';
  error?: string;
}

// ============================================================
// REFUNDS
// ============================================================

/**
 * Process a refund for an order.
 * Calls Stripe refund API via edge function.
 */
export async function processRefund(
  orderId: string,
  amount?: number, // partial refund amount in dollars; null = full refund
  reason?: string,
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('stripe_payment_intent_id, grand_total')
      .eq('id', orderId)
      .single();

    if (!order?.stripe_payment_intent_id) {
      return { success: false, error: 'No payment found for this order' };
    }

    const refundAmount = amount ? Math.round(amount * 100) : undefined; // undefined = full refund

    const { data, error } = await supabase.functions.invoke('process-refund', {
      body: {
        paymentIntentId: order.stripe_payment_intent_id,
        amount: refundAmount,
        reason: reason || 'requested_by_customer',
        metadata: { order_id: orderId },
      },
    });

    if (error) throw error;

    // Update order status
    const isFullRefund = !amount || amount >= Number(order.grand_total);
    await supabase.from('orders').update({
      payment_status: isFullRefund ? 'refunded' : 'partial_refund',
      status: isFullRefund ? 'refunded' : undefined,
    }).eq('id', orderId);

    await logPaymentEvent({
      type: 'refund_processed',
      orderId,
      amount: (amount || Number(order.grand_total)),
      stripeId: data.refundId,
      metadata: { reason, full: isFullRefund },
    });

    return { success: true, refundId: data.refundId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Refund failed' };
  }
}

// ============================================================
// CONTRACTOR PAYOUTS (Stripe Connect)
// ============================================================

/**
 * Create a Stripe Connect onboarding link for a contractor.
 * They complete Stripe's hosted onboarding to link their bank.
 */
export async function createConnectOnboardingLink(
  installerId: string,
  email: string,
  returnUrl: string,
): Promise<{ url: string; accountId: string; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-connect-account', {
      body: {
        installerId,
        email,
        returnUrl,
        refreshUrl: returnUrl,
      },
    });

    if (error) throw error;

    // Store Connect account ID
    await supabase.from('installers').update({
      // stripe_connect_id stored in a future column or in contractor_banking
    }).eq('id', installerId);

    return { url: data.onboardingUrl, accountId: data.accountId, error: null };
  } catch (err: unknown) {
    return { url: '', accountId: '', error: err instanceof Error ? err.message : 'Failed to create Connect account' };
  }
}

/**
 * Calculate payouts for a given period.
 * Returns summary per contractor without executing transfers.
 */
export async function calculatePayouts(
  periodStart: Date,
  periodEnd: Date,
): Promise<PayoutSummary[]> {
  const { data: bookings } = await supabase
    .from('installer_bookings')
    .select('id, installer_id, installer_payout, installers(full_name)')
    .eq('status', 'completed')
    .eq('payout_status', 'pending')
    .gte('completed_at', periodStart.toISOString())
    .lte('completed_at', periodEnd.toISOString());

  if (!bookings || bookings.length === 0) return [];

  const byContractor: Record<string, PayoutSummary> = {};

  for (const b of bookings) {
    const cid = b.installer_id;
    if (!byContractor[cid]) {
      const inst = b.installers as unknown as Record<string, string> | null;
      byContractor[cid] = {
        contractorId: cid,
        contractorName: inst?.full_name || 'Unknown',
        jobCount: 0,
        grossAmount: 0,
        platformFee: 0,
        netAmount: 0,
        bookingIds: [],
        status: 'calculated',
      };
    }
    const payout = Number(b.installer_payout) || 0;
    byContractor[cid].jobCount++;
    byContractor[cid].grossAmount += payout / 0.9; // reverse the 90% to get gross
    byContractor[cid].platformFee += (payout / 0.9) * 0.10;
    byContractor[cid].netAmount += payout;
    byContractor[cid].bookingIds.push(b.id);
  }

  return Object.values(byContractor);
}

/**
 * Execute payouts for calculated summaries.
 * Creates Stripe Connect transfers + records in contractor_payments.
 */
export async function executePayouts(summaries: PayoutSummary[]): Promise<{
  processed: number; totalPaid: number; failed: string[];
}> {
  let processed = 0;
  let totalPaid = 0;
  const failed: string[] = [];

  for (const summary of summaries) {
    try {
      // Create payment record
      const { data: payment, error: payErr } = await supabase
        .from('contractor_payments')
        .insert({
          installer_id: summary.contractorId,
          amount: Math.round(summary.grossAmount * 100) / 100,
          platform_fee: Math.round(summary.platformFee * 100) / 100,
          net_amount: Math.round(summary.netAmount * 100) / 100,
          payment_method: 'ach',
          status: 'processing',
          period_start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
          description: `${summary.jobCount} job(s) — weekly payout`,
        })
        .select('id')
        .single();

      if (payErr) throw payErr;

      // Execute Stripe Connect transfer
      const { data: transferData, error: transferErr } = await supabase.functions.invoke('create-connect-transfer', {
        body: {
          contractorId: summary.contractorId,
          amount: Math.round(summary.netAmount * 100), // cents
          paymentId: payment?.id,
          description: `SnapShades payout — ${summary.jobCount} job(s)`,
        },
      });

      if (transferErr) {
        // Mark payment as failed
        if (payment) {
          await supabase.from('contractor_payments').update({ status: 'failed' }).eq('id', payment.id);
        }
        throw transferErr;
      }

      // Mark payment + bookings as paid
      if (payment) {
        await supabase.from('contractor_payments').update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_transfer_id: transferData?.transferId,
        }).eq('id', payment.id);
      }

      await supabase.from('installer_bookings')
        .update({ payout_status: 'paid' })
        .in('id', summary.bookingIds);

      // Send payout email
      const { data: installer } = await supabase
        .from('installers')
        .select('email')
        .eq('id', summary.contractorId)
        .single();

      if (installer?.email) {
        const email = contractorEmails.payoutSent({
          name: summary.contractorName,
          amount: summary.netAmount.toFixed(2),
          jobCount: summary.jobCount,
          periodStart: new Date(Date.now() - 7 * 86400000).toLocaleDateString(),
          periodEnd: new Date().toLocaleDateString(),
        });
        email.to = installer.email;
        await sendEmail(email);
      }

      await logPaymentEvent({
        type: 'payout_sent',
        amount: summary.netAmount,
        stripeId: transferData?.transferId || '',
        metadata: { contractorId: summary.contractorId, jobCount: summary.jobCount },
      });

      processed++;
      totalPaid += summary.netAmount;
    } catch (err: unknown) {
      failed.push(`${summary.contractorName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { processed, totalPaid, failed };
}

// ============================================================
// PAYMENT EVENTS LOG
// ============================================================

async function logPaymentEvent(event: PaymentEvent): Promise<void> {
  // Log to zip_activation_log (reusing as general event log)
  // In production, this would be a dedicated payment_events table
  await supabase.from('zip_activation_log').insert({
    zip: 'PAYMENT',
    action: event.type === 'payment_success' ? 'activated' : 'deactivated',
    steps_completed: event,
    contractors_matched: 0,
    pricing_zone: 0,
    warnings: (event as { error?: string }).error ? [(event as { error?: string }).error as string] : [],
  });
}

// ============================================================
// UTILITY: Get payment status for display
// ============================================================

export function getPaymentStatusDisplay(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-600' },
    partial_refund: { label: 'Partially Refunded', color: 'bg-orange-100 text-orange-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
}
