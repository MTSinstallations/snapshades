/**
 * Shipping Calculator
 * 
 * SnapShades does not add a customer shipping charge. Manufacturer freight,
 * when applicable, is handled outside the customer-facing order total.
 */

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

  return {
    subtotal: 0,
    perItemBreakdown: [{ description: 'Shipping included', cost: 0 }],
    estimatedDays: 'Made to order',
  };
}

/**
 * Admin page: manage shipping rates per ZIP zone
 * Future: this will pull from Supabase for zone-based pricing
 */
export function getEstimatedShippingForDisplay(windowCount: number, hasShutters: boolean): string {
  void windowCount;
  void hasShutters;
  return '$0';
}
