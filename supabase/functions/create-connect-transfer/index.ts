// Supabase Edge Function: Transfer payout to contractor via Stripe Connect

import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-04-10' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { contractorId, amount, paymentId, description } = await req.json();

    // Look up contractor's Stripe Connect account ID
    const { data: banking } = await supabase
      .from('contractor_banking')
      .select('*')
      .eq('installer_id', contractorId)
      .single();

    // For now, we need the Connect account ID stored somewhere
    // This would be set during Connect onboarding
    const { data: installer } = await supabase
      .from('installers')
      .select('email')
      .eq('id', contractorId)
      .single();

    // TODO: Get stripe_connect_id from a column on installers or contractor_banking
    // For now, return a placeholder
    const connectAccountId = (banking as Record<string, unknown>)?.stripe_connect_id as string;

    if (!connectAccountId) {
      return new Response(JSON.stringify({
        error: 'Contractor has not completed Stripe Connect onboarding',
        transferId: null,
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transfer = await stripe.transfers.create({
      amount, // cents
      currency: 'usd',
      destination: connectAccountId,
      description: description || `SnapShades payout`,
      metadata: { contractor_id: contractorId, payment_id: paymentId },
    });

    return new Response(JSON.stringify({ transferId: transfer.id }), {
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
