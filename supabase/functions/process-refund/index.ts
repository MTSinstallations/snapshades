// Supabase Edge Function: Process Stripe Refund

import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-04-10' });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { paymentIntentId, amount, reason, metadata } = await req.json();

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // undefined = full refund
      reason: reason || 'requested_by_customer',
      metadata,
    });

    return new Response(JSON.stringify({ refundId: refund.id, status: refund.status }), {
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
