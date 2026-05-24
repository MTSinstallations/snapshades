// Supabase Edge Function: Create Stripe Checkout Session
// Keeps STRIPE_SECRET_KEY server-side

import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-04-10' });
const DOMAIN = Deno.env.get('SITE_URL') || 'https://snapshadesandshutters.com';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { orderId, orderNumber, customerEmail, lineItems, successUrl, cancelUrl, metadata } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      success_url: successUrl || `${DOMAIN}/order-confirmation?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${DOMAIN}/checkout?cancelled=true`,
      metadata: { ...metadata, order_id: orderId, order_number: orderNumber },
      payment_intent_data: {
        metadata: { order_id: orderId, order_number: orderNumber },
      },
      shipping_address_collection: { allowed_countries: ['US'] },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
