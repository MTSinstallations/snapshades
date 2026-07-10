/**
 * The live storefront delegates exact destination tax to Stripe Tax. These
 * legacy helpers return zero because the browser must not guess a tax amount.
 */

// State-level defaults (simplified — matches zip-activation.ts)
const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04, AK: 0, AZ: 0.056, AR: 0.065, CA: 0.0725, CO: 0.029, CT: 0.0635,
  DE: 0, FL: 0.06, GA: 0.04, HI: 0.04, ID: 0.06, IL: 0.0625, IN: 0.07,
  IA: 0.06, KS: 0.065, KY: 0.06, LA: 0.0445, ME: 0.055, MD: 0.06,
  MA: 0.0625, MI: 0.06, MN: 0.06875, MS: 0.07, MO: 0.04225, MT: 0,
  NE: 0.055, NV: 0.0685, NH: 0, NJ: 0.06625, NM: 0.05125, NY: 0.04,
  NC: 0.0475, ND: 0.05, OH: 0.0575, OK: 0.045, OR: 0, PA: 0.06,
  RI: 0.07, SC: 0.06, SD: 0.042, TN: 0.07, TX: 0.0625, UT: 0.061,
  VT: 0.06, VA: 0.053, WA: 0.065, WV: 0.06, WI: 0.05, WY: 0.04,
};

const FALLBACK_RATE = 0.07;

/**
 * Get tax rate for a specific ZIP code from Supabase.
 * Falls back to state rate, then fallback.
 */
export async function getTaxRateForZip(zip: string): Promise<number> {
  void zip;
  return 0;
}

/**
 * Client-side estimate when we don't have a ZIP yet.
 * Uses state code if available, otherwise fallback.
 */
export function getEstimatedTaxRate(stateCode?: string): number {
  void stateCode;
  return 0;
}

export { STATE_TAX_RATES };
