import Stripe from 'npm:stripe@^22';
import {
  escapeHtml,
  getStripeSecret,
  getSupabaseAdmin,
} from '../_shared/runtime.ts';
import { verifyStorefrontPayment } from '../../../src/lib/payment-verification.ts';

const cryptoProvider = Stripe.createSubtleCryptoProvider();
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const admin = getSupabaseAdmin();

interface OrderForNotification {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  contact_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  shipping_address: Record<string, string> | null;
  confirmation_email_sent_at: string | null;
  fulfillment_notification_sent_at: string | null;
  order_items: Array<{
    line_number: number;
    product_name: string;
    supplier_name: string;
    supplier_sku: string;
    mount_type: string;
    width: number;
    height: number;
    product_options: Record<string, string>;
    supplier_cost: number;
    broker_fee: number;
    customer_price: number;
  }>;
}

async function sendEmail(input: { to: string; subject: string; html: string }): Promise<'sent' | 'skipped'> {
  const apiKey = Deno.env.get('RESEND_API_KEY') || '';
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured; durable order processing will continue without email.');
    return 'skipped';
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('ORDER_FROM_EMAIL') || 'SnapShades <hello@snapshadesandshutters.com>',
      reply_to: Deno.env.get('ORDER_REPLY_TO') || 'hello@snapshadesandshutters.com',
      ...input,
    }),
  });
  if (!response.ok) throw new Error(`Resend rejected email with status ${response.status}.`);
  return 'sent';
}

function itemRows(order: OrderForNotification): string {
  return [...order.order_items]
    .sort((left, right) => left.line_number - right.line_number)
    .map((item) => {
      const options = Object.values(item.product_options || {}).filter(Boolean).map(escapeHtml).join(' · ');
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #e7e2d8">${item.line_number}</td>
        <td style="padding:10px;border-bottom:1px solid #e7e2d8"><strong>${escapeHtml(item.product_name)}</strong><br><span style="color:#6d6861">${escapeHtml(options)}</span></td>
        <td style="padding:10px;border-bottom:1px solid #e7e2d8">${escapeHtml(item.mount_type)}<br>${escapeHtml(item.width)}&quot; × ${escapeHtml(item.height)}&quot;</td>
        <td style="padding:10px;border-bottom:1px solid #e7e2d8">${escapeHtml(item.supplier_sku)}</td>
        <td style="padding:10px;border-bottom:1px solid #e7e2d8;text-align:right">$${Number(item.customer_price).toFixed(2)}</td>
      </tr>`;
    }).join('');
}

async function notifyPaidOrder(orderId: string): Promise<void> {
  const { data, error } = await admin.from('orders')
    .select('id, order_number, subtotal, shipping_total, tax_total, grand_total, contact_email, contact_name, contact_phone, shipping_address, confirmation_email_sent_at, fulfillment_notification_sent_at, order_items(line_number, product_name, supplier_name, supplier_sku, mount_type, width, height, product_options, supplier_cost, broker_fee, customer_price)')
    .eq('id', orderId)
    .single();
  if (error || !data) throw error || new Error('Paid order could not be loaded for notification.');
  const order = data as unknown as OrderForNotification;
  const address = order.shipping_address || {};

  if (order.contact_email && !order.confirmation_email_sent_at) {
    const customerResult = await sendEmail({
      to: order.contact_email,
      subject: `Payment confirmed — ${order.order_number}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#25221f">
        <h1 style="font-size:28px">Your SnapShades order is confirmed.</h1>
        <p>Thank you, ${escapeHtml(order.contact_name || 'Customer')}. We received your payment for <strong>${escapeHtml(order.order_number)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0"><tbody>${itemRows(order)}</tbody></table>
        <p>Supplier freight: $${Number(order.shipping_total).toFixed(2)}<br>Tax: $${Number(order.tax_total).toFixed(2)}</p>
        <p style="font-size:18px"><strong>Total paid: $${Number(order.grand_total).toFixed(2)}</strong></p>
        <p>Your custom products will be reviewed before they are released to the supplier. We will email tracking as soon as they ship.</p>
        <p style="color:#6d6861;font-size:13px">Questions? Reply to this email.</p>
      </div>`,
    });
    if (customerResult === 'sent') {
      await admin.from('orders').update({ confirmation_email_sent_at: new Date().toISOString() }).eq('id', orderId);
    }
  }

  if (!order.fulfillment_notification_sent_at) {
    const supplierCost = order.order_items.reduce((sum, item) => sum + Number(item.supplier_cost), 0);
    const brokerFee = order.order_items.reduce((sum, item) => sum + Number(item.broker_fee), 0);
    const operationsResult = await sendEmail({
      to: Deno.env.get('ORDER_NOTIFICATION_EMAIL') || 'hello@snapshadesandshutters.com',
      subject: `Paid order ready for review — ${order.order_number}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#25221f">
        <h1 style="font-size:26px">Paid order ready for supplier review</h1>
        <p><strong>${escapeHtml(order.order_number)}</strong> · ${escapeHtml(order.contact_name)} · ${escapeHtml(order.contact_phone)} · ${escapeHtml(order.contact_email)}</p>
        <p>${escapeHtml(address.line1)} ${escapeHtml(address.line2)}<br>${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.zip)}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0"><thead><tr><th>#</th><th>Product</th><th>Size</th><th>Supplier SKU</th><th style="text-align:right">Customer</th></tr></thead><tbody>${itemRows(order)}</tbody></table>
        <p>Supplier cost: <strong>$${supplierCost.toFixed(2)}</strong><br>SnapShades 10%: <strong>$${brokerFee.toFixed(2)}</strong><br>Supplier freight: <strong>$${Number(order.shipping_total).toFixed(2)}</strong><br>Tax: <strong>$${Number(order.tax_total).toFixed(2)}</strong><br>Paid total: <strong>$${Number(order.grand_total).toFixed(2)}</strong></p>
        <p>This order is in the fulfillment queue with status <strong>ready for review</strong>.</p>
      </div>`,
    });
    if (operationsResult === 'sent') {
      await admin.from('orders').update({ fulfillment_notification_sent_at: new Date().toISOString() }).eq('id', orderId);
    }
  }
}

async function markOrderPaid(input: {
  orderId: string;
  amountTotal: number | null;
  amountTax?: number | null;
  amountShipping?: number | null;
  paymentIntentId: string | null;
  checkoutSessionId?: string;
  notify?: boolean;
}): Promise<void> {
  const { data: order, error } = await admin.from('orders')
    .select('id, subtotal, shipping_total, payment_status')
    .eq('id', input.orderId)
    .single();
  if (error || !order) throw error || new Error('Order was not found.');

  const expectedShipping = Math.round(Number(order.shipping_total) * 100);
  const verification = verifyStorefrontPayment({
    subtotalCents: Math.round(Number(order.subtotal) * 100),
    shippingCents: expectedShipping,
    amountTotal: input.amountTotal,
    amountTax: input.amountTax,
    amountShipping: input.amountShipping,
  });
  if (!verification.valid) {
    await admin.from('orders').update({ payment_status: 'failed' }).eq('id', input.orderId);
    await admin.from('fulfillment_jobs').upsert({
      order_id: input.orderId,
      supplier_name: 'Supplier',
      status: 'blocked',
      last_error: `Stripe total/shipping did not match the server order (total ${input.amountTotal}, pre-tax ${verification.expectedPreTax}, shipping ${input.amountShipping}).`,
    }, { onConflict: 'order_id' });
    console.error(`Payment amount mismatch for order ${input.orderId}.`);
    return;
  }

  const { error: updateError } = await admin.from('orders').update({
    payment_status: 'paid',
    status: 'confirmed',
    tax_total: Number(verification.taxCents) / 100,
    grand_total: Number(input.amountTotal) / 100,
    stripe_payment_intent_id: input.paymentIntentId,
    ...(input.checkoutSessionId ? { stripe_checkout_session_id: input.checkoutSessionId } : {}),
  }).eq('id', input.orderId);
  if (updateError) throw updateError;

  if (input.notify !== false) await notifyPaidOrder(input.orderId);
}

async function startEvent(event: Stripe.Event): Promise<'claimed' | 'duplicate' | 'busy'> {
  const { data, error } = await admin.rpc('claim_stripe_webhook_event_v2', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_livemode: event.livemode,
  });
  if (error) throw error;
  return data === 'claimed' ? 'claimed' : data === 'busy' ? 'busy' : 'duplicate';
}

async function finishEvent(event: Stripe.Event, orderId?: string): Promise<void> {
  await admin.from('stripe_webhook_events').update({
    status: 'processed',
    order_id: orderId || null,
    processed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('stripe_event_id', event.id);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!webhookSecret) return new Response('Webhook is not configured', { status: 503 });

  let stripe: Stripe;
  try {
    stripe = new Stripe(getStripeSecret(), { httpClient: Stripe.createFetchHttpClient() });
  } catch {
    return new Response('Stripe is not configured', { status: 503 });
  }

  const signature = req.headers.get('stripe-signature') || '';
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
  } catch (error) {
    console.error('Stripe signature verification failed:', error instanceof Error ? error.message : error);
    return new Response('Invalid signature', { status: 400 });
  }

  let orderId: string | undefined;
  try {
    const claim = await startEvent(event);
    if (claim === 'duplicate') return Response.json({ received: true, duplicate: true });
    if (claim === 'busy') return Response.json({ received: false, busy: true }, { status: 409 });

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        orderId = session.metadata?.order_id;
        if (orderId && session.payment_status === 'paid') {
          await markOrderPaid({
            orderId,
            amountTotal: session.amount_total,
            amountTax: session.total_details?.amount_tax,
            amountShipping: session.total_details?.amount_shipping,
            paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
            checkoutSessionId: session.id,
          });
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        orderId = paymentIntent.metadata?.order_id;
        if (orderId) {
          await markOrderPaid({
            orderId,
            amountTotal: paymentIntent.amount_received,
            paymentIntentId: paymentIntent.id,
            notify: false,
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        orderId = session.metadata?.order_id;
        if (orderId) await admin.from('orders').update({ payment_status: 'failed' }).eq('id', orderId).neq('payment_status', 'paid');
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        orderId = paymentIntent.metadata?.order_id;
        if (orderId) await admin.from('orders').update({ payment_status: 'failed' }).eq('id', orderId).neq('payment_status', 'paid');
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (paymentIntentId) {
          const { data: order } = await admin.from('orders').select('id').eq('stripe_payment_intent_id', paymentIntentId).maybeSingle();
          orderId = order?.id;
          if (orderId) {
            const fullRefund = charge.amount_refunded === charge.amount;
            await admin.from('orders').update({
              payment_status: fullRefund ? 'refunded' : 'partial_refund',
              ...(fullRefund ? { status: 'refunded' } : {}),
            }).eq('id', orderId);
            if (fullRefund) await admin.from('fulfillment_jobs').update({ status: 'cancelled' }).eq('order_id', orderId);
          }
        }
        break;
      }
      default:
        break;
    }

    await finishEvent(event, orderId);
    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error';
    console.error(`Stripe webhook ${event.id} failed:`, message);
    await admin.from('stripe_webhook_events').update({
      status: 'failed',
      order_id: orderId || null,
      last_error: message.slice(0, 1000),
      updated_at: new Date().toISOString(),
    }).eq('stripe_event_id', event.id);
    return Response.json({ received: false }, { status: 500 });
  }
});
