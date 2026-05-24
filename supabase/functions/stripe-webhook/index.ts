// Supabase Edge Function: Stripe Webhook Handler
// Receives ALL Stripe events and routes them to the right handler.
// Verifies HMAC signature to prevent spoofing.

import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-04-10' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200 });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature' }), { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', (err as Error).message);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  console.log(`[STRIPE WEBHOOK] ${event.type} — ${event.id}`);

  try {
    switch (event.type) {
      // ── CHECKOUT COMPLETED ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId && session.payment_status === 'paid') {
          await supabase.from('orders').update({
            payment_status: 'paid',
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'confirmed',
          }).eq('id', orderId);
          console.log(`Order ${orderId} confirmed via checkout`);
        }
        break;
      }

      // ── PAYMENT INTENT SUCCEEDED ──
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          await supabase.from('orders').update({
            payment_status: 'paid',
            stripe_payment_intent_id: pi.id,
            status: 'confirmed',
          }).eq('id', orderId);
          console.log(`Order ${orderId} paid via payment intent`);
        }
        break;
      }

      // ── PAYMENT FAILED ──
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', orderId);

          // Get customer email and send failure notification
          const { data: order } = await supabase
            .from('orders')
            .select('order_number, grand_total, customers(email, full_name)')
            .eq('id', orderId).single();

          // TODO: Send payment failed email (import email-templates in edge function)
          console.log(`Order ${orderId} payment failed: ${pi.last_payment_error?.message}`);
        }
        break;
      }

      // ── REFUND ──
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const pi = charge.payment_intent as string;
        if (pi) {
          const { data: order } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_payment_intent_id', pi)
            .single();

          if (order) {
            const isFullRefund = charge.amount_refunded === charge.amount;
            await supabase.from('orders').update({
              payment_status: isFullRefund ? 'refunded' : 'partial_refund',
              status: isFullRefund ? 'refunded' : undefined,
            }).eq('id', order.id);
            console.log(`Order ${order.id} ${isFullRefund ? 'fully' : 'partially'} refunded`);
          }
        }
        break;
      }

      // ── CONNECT ACCOUNT UPDATED (contractor completed onboarding) ──
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled && account.metadata?.installer_id) {
          // Contractor completed Stripe Connect onboarding
          console.log(`Contractor ${account.metadata.installer_id} Connect account active`);
          // TODO: Update installer record with stripe_connect_id
        }
        break;
      }

      // ── TRANSFER (payout to contractor) ──
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log(`Transfer ${transfer.id} — $${(transfer.amount / 100).toFixed(2)} to ${transfer.destination}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`Error handling ${event.type}:`, (err as Error).message);
    // Return 200 anyway — Stripe will retry on non-2xx
    return new Response(JSON.stringify({ received: true, error: (err as Error).message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
