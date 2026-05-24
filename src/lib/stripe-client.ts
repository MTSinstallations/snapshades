/**
 * Stripe Client Configuration
 * 
 * Customer payments: Stripe Checkout / Payment Intents
 * Contractor payouts: Stripe Connect (Standard accounts)
 * 
 * Flow:
 * 1. Customer → Stripe Checkout → payment confirmed via webhook
 * 2. Order lifecycle advances automatically
 * 3. Job completed → weekly payout via Stripe Connect transfer
 */

// Client-side Stripe (for Checkout redirect)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export function getStripePublishableKey(): string {
  return STRIPE_PUBLISHABLE_KEY;
}

export function isStripeConfigured(): boolean {
  return STRIPE_PUBLISHABLE_KEY.length > 0;
}
