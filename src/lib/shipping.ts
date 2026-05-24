/**
 * Shipping Calculator
 * 
 * Shipping costs come from the manufacturer. For Norman:
 * - Blinds & Shades: $25 first unit, $5 each additional
 * - Shutters: $45 first unit, $10 each additional
 * - Oversized (>96"): +$15 surcharge per unit
 * 
 * These are wholesale shipping costs — we pass them through.
 * When we add more manufacturers, each will have their own rates.
 */

export interface ShippingQuote {
  subtotal: number;
  perItemBreakdown: { description: string; cost: number }[];
  estimatedDays: string;
}

type ProductCategory = 'shades' | 'blinds' | 'shutters';

function getCategory(productSlug: string): ProductCategory {
  if (productSlug.includes('shutter')) return 'shutters';
  if (productSlug.includes('faux-wood') || productSlug.includes('wood-blind') || productSlug.includes('aluminum')) return 'blinds';
  return 'shades'; // honeycomb, roller, roman, sheer, smartdrape
}

const SHIPPING_RATES: Record<ProductCategory, { firstUnit: number; additionalUnit: number }> = {
  shades: { firstUnit: 25, additionalUnit: 5 },
  blinds: { firstUnit: 25, additionalUnit: 5 },
  shutters: { firstUnit: 45, additionalUnit: 10 },
};

const OVERSIZE_THRESHOLD = 96; // inches
const OVERSIZE_SURCHARGE = 15;

export function calculateShipping(
  items: { productSlug: string; width: number; height: number }[],
  _zip?: string, // reserved for future zone-based shipping
): ShippingQuote {
  if (items.length === 0) return { subtotal: 0, perItemBreakdown: [], estimatedDays: '—' };

  const breakdown: { description: string; cost: number }[] = [];
  let total = 0;

  // Group by category to apply first-unit logic per category
  const byCategory: Record<string, typeof items> = {};
  items.forEach(item => {
    const cat = getCategory(item.productSlug);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  for (const [cat, catItems] of Object.entries(byCategory)) {
    const rates = SHIPPING_RATES[cat as ProductCategory] || SHIPPING_RATES.shades;

    catItems.forEach((item, i) => {
      const isFirst = i === 0;
      const isOversize = item.width > OVERSIZE_THRESHOLD || item.height > OVERSIZE_THRESHOLD;
      const baseCost = isFirst ? rates.firstUnit : rates.additionalUnit;
      const oversizeCost = isOversize ? OVERSIZE_SURCHARGE : 0;
      const itemTotal = baseCost + oversizeCost;

      breakdown.push({
        description: `${cat} ${isFirst ? '(first)' : `(+${i})`}${isOversize ? ' + oversize' : ''}`,
        cost: itemTotal,
      });
      total += itemTotal;
    });
  }

  // Estimate delivery based on product type
  const hasShutters = items.some(i => getCategory(i.productSlug) === 'shutters');
  const estimatedDays = hasShutters ? '6-8 weeks' : '4-6 weeks';

  return {
    subtotal: Math.round(total * 100) / 100,
    perItemBreakdown: breakdown,
    estimatedDays,
  };
}

/**
 * Admin page: manage shipping rates per ZIP zone
 * Future: this will pull from Supabase for zone-based pricing
 */
export function getEstimatedShippingForDisplay(windowCount: number, hasShutters: boolean): string {
  if (windowCount === 0) return '$0';
  const base = hasShutters ? 45 : 25;
  const additional = hasShutters ? 10 : 5;
  const total = base + (Math.max(0, windowCount - 1) * additional);
  return `$${total}`;
}
