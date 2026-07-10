/**
 * Shipping Calculator
 * 
 * Manufacturer freight is passed through to the customer without markup.
 */
import { calculateStorefrontFreight } from '@/lib/pricing-rates';

export interface ShippingQuote {
  subtotal: number;
  perItemBreakdown: { description: string; cost: number }[];
  estimatedDays: string;
}

export function calculateShipping(
  items: { productSlug: string; width: number; height: number }[],
  _zip?: string, // reserved for future zone-based shipping
): ShippingQuote {
  if (items.length === 0) return { subtotal: 0, perItemBreakdown: [], estimatedDays: '—' };

  const subtotal = calculateStorefrontFreight(items);
  return {
    subtotal,
    perItemBreakdown: [{ description: 'Supplier freight (no markup)', cost: subtotal }],
    estimatedDays: 'Made to order',
  };
}

/**
 * Admin page: manage shipping rates per ZIP zone
 * Future: this will pull from Supabase for zone-based pricing
 */
export function getEstimatedShippingForDisplay(windowCount: number, hasShutters: boolean): string {
  if (windowCount <= 0) return '$0';
  return hasShutters ? 'Calculated at checkout' : `$${25 + Math.max(0, windowCount - 1) * 11}`;
}
