import Stripe from 'npm:stripe@^22';
import {
  assertPublicPost,
  clientIp,
  getStripeSecret,
  getSupabaseAdmin,
  jsonResponse,
  safeText,
  sha256,
} from '../_shared/runtime.ts';
import { verifyStorefrontPayment } from '../../../src/lib/payment-verification.ts';

const SESSION_PATTERN = /^cs_(?:test_|live_)?[A-Za-z0-9_]{12,200}$/;

Deno.serve(async (req: Request) => {
  const earlyResponse = assertPublicPost(req);
  if (earlyResponse) return earlyResponse;

  try {
    const body = await req.json() as { sessionId?: string };
    const sessionId = safeText(body.sessionId, 255);
    if (!SESSION_PATTERN.test(sessionId)) {
      return jsonResponse(req, { error: 'Invalid checkout session.' }, 422);
    }

    const admin = getSupabaseAdmin();
    const rateSalt = Deno.env.get('RATE_LIMIT_SALT') || 'snapshades-status';
    const rateKey = `status:${await sha256(`${clientIp(req)}:${rateSalt}`)}`;
    const { data: allowed, error: rateError } = await admin.rpc('claim_storefront_checkout_attempt', {
      p_rate_key: rateKey,
      p_limit: 30,
      p_window: '15 minutes',
    });
    if (rateError) throw rateError;
    if (!allowed) return jsonResponse(req, { error: 'Too many status requests. Please wait and refresh.' }, 429);

    const stripe = new Stripe(getStripeSecret(), { httpClient: Stripe.createFetchHttpClient() });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = safeText(session.metadata?.order_id, 36);
    if (!orderId) return jsonResponse(req, { error: 'Order was not found for this checkout.' }, 404);

    const { data: currentOrder, error: orderError } = await admin.from('orders')
      .select('id, order_number, subtotal, shipping_total, grand_total, payment_status, status, stripe_checkout_session_id')
      .eq('id', orderId)
      .eq('stripe_checkout_session_id', session.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!currentOrder) return jsonResponse(req, { error: 'Order was not found for this checkout.' }, 404);

    const amountTax = session.total_details?.amount_tax ?? null;
    const amountShipping = session.total_details?.amount_shipping ?? null;
    const verification = verifyStorefrontPayment({
      subtotalCents: Math.round(Number(currentOrder.subtotal) * 100),
      shippingCents: Math.round(Number(currentOrder.shipping_total) * 100),
      amountTotal: session.amount_total,
      amountTax,
      amountShipping,
    });
    if (session.payment_status === 'paid' && !verification.valid) {
      await admin.from('orders').update({ payment_status: 'failed' }).eq('id', orderId);
      await admin.from('fulfillment_jobs').upsert({
        order_id: orderId,
        supplier_name: 'Supplier',
        status: 'blocked',
        last_error: `Stripe total/shipping did not match the server order (total ${session.amount_total}, pre-tax ${verification.expectedPreTax}, shipping ${amountShipping}).`,
      }, { onConflict: 'order_id' });
      return jsonResponse(req, { error: 'Payment total could not be verified. Support has been notified.' }, 409);
    }

    if (session.payment_status === 'paid' && currentOrder.payment_status !== 'paid') {
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
      const { error: paymentError } = await admin.from('orders').update({
        payment_status: 'paid',
        status: 'confirmed',
        tax_total: Number(verification.taxCents) / 100,
        grand_total: Number(session.amount_total) / 100,
        stripe_payment_intent_id: paymentIntentId || null,
      }).eq('id', orderId);
      if (paymentError) throw paymentError;
    }

    const { data: order, error: detailError } = await admin.from('orders')
      .select('id, order_number, grand_total, payment_status, status, contact_email, shipping_address, confirmed_at, order_items(line_number, product_family, product_name, mount_type, width, height, product_options, customer_price)')
      .eq('id', orderId)
      .single();
    if (detailError || !order) throw detailError || new Error('Order details are unavailable.');

    return jsonResponse(req, {
      order: {
        ...order,
        order_items: Array.isArray(order.order_items)
          ? [...order.order_items].sort((left, right) => Number(left.line_number) - Number(right.line_number))
          : [],
      },
      checkoutStatus: session.status,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return jsonResponse(req, { error: 'Checkout session was not found.' }, 404);
    }
    console.error('get-checkout-status failed:', error instanceof Error ? error.message : error);
    return jsonResponse(req, { error: 'Order status is temporarily unavailable. Please refresh.' }, 500);
  }
});
