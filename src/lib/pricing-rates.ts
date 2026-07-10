/** Dependency-free pricing constants shared with Supabase Edge Functions. */
export const DEALER_COST_RATE = 0.30;
export const BROKER_MARKUP_RATE = 0.10;

export const STANDARD_FREIGHT_FIRST = 25;
export const STANDARD_FREIGHT_ADDITIONAL = 11;
export const OVERSIZE_FREIGHT_FIRST = 80;
export const OVERSIZE_FREIGHT_ADDITIONAL = 50;
export const OVERSIZE_WIDTH = 90;

/** Norman price-guide freight, passed through without a SnapShades markup. */
export function calculateStorefrontFreight(items: readonly { width: number }[]): number {
  if (items.length === 0) return 0;
  const oversizeCount = items.filter((item) => item.width >= OVERSIZE_WIDTH).length;
  const standardCount = items.length - oversizeCount;

  if (oversizeCount > 0) {
    return OVERSIZE_FREIGHT_FIRST
      + Math.max(0, oversizeCount - 1) * OVERSIZE_FREIGHT_ADDITIONAL
      + standardCount * STANDARD_FREIGHT_ADDITIONAL;
  }

  return STANDARD_FREIGHT_FIRST + Math.max(0, standardCount - 1) * STANDARD_FREIGHT_ADDITIONAL;
}
