/**
 * Master catalog index — combines all manufacturer products
 * Add new manufacturers here as they're onboarded
 */
import { portraitHoneycomb, getCustomerPrice, getSurchargePrice } from './norman-catalog';
import { ultimateFauxWood, smartPrivacyFauxWood } from './norman-faux-wood';
import { solunaRoller } from './norman-roller';
import { normandyWood, synchronyVertical } from './norman-wood-blinds';
import { centerpieceRoman } from './norman-roman';
import { perfectSheer, smartDrape, cityLightsAluminum } from './norman-specialty';
import { normanShutters } from './norman-shutters';
import { onyxHoneycomb, onyxFauxWood, onyxRoller } from './onyx-catalog';
// Levolor — detailed per-category files
import { levolorCellular } from './levolor-cellular';
import { levolorRoller } from './levolor-roller';
import { levolorRoman } from './levolor-roman';
import { levolorFauxWood, levolorClassicFauxWood } from './levolor-faux-wood';
import { levolorRealWood, levolorRivieraMetal } from './levolor-blinds';
import { levolorBanded, levolorSoftVertical } from './levolor-specialty';

import type { Product } from './norman-catalog';

// ============================================================
// ALL PRODUCTS — all manufacturers
// ============================================================
export const ALL_PRODUCTS: Product[] = [
  // Norman® Shades
  portraitHoneycomb,
  solunaRoller,
  perfectSheer,
  smartDrape,
  centerpieceRoman,
  // Norman® Blinds
  ultimateFauxWood,
  smartPrivacyFauxWood,
  normandyWood,
  synchronyVertical,
  cityLightsAluminum,
  // Norman® Shutters
  normanShutters,
  // Onyx® — Budget line
  onyxHoneycomb,
  onyxFauxWood,
  onyxRoller,
  // Levolor Shades
  levolorCellular,
  levolorRoller,
  levolorRoman,
  levolorBanded,
  // Levolor Blinds
  levolorFauxWood,
  levolorClassicFauxWood,
  levolorRealWood,
  levolorRivieraMetal,
  levolorSoftVertical,
];

// ============================================================
// BRANDS
// ============================================================
export const BRANDS = [
  { id: 'norman', name: 'Norman®', tagline: 'Premium craftsmanship', tier: 'premium' as const },
  { id: 'onyx', name: 'Onyx®', tagline: 'Affordable quality', tier: 'budget' as const },
  { id: 'levolor', name: 'Levolor', tagline: 'Trusted mainstream', tier: 'mid' as const },
];

// ============================================================
// GROUP BY CATEGORY
// ============================================================
export const PRODUCTS_BY_CATEGORY = {
  shades: ALL_PRODUCTS.filter(p => p.category === 'shades'),
  blinds: ALL_PRODUCTS.filter(p => p.category === 'blinds'),
  shutters: ALL_PRODUCTS.filter(p => p.category === 'shutters'),
};

// ============================================================
// GROUP BY BRAND
// ============================================================
export const PRODUCTS_BY_BRAND = {
  'Norman®': ALL_PRODUCTS.filter(p => p.brand === 'Norman®'),
  'Onyx®': ALL_PRODUCTS.filter(p => p.brand === 'Onyx®'),
  'Levolor': ALL_PRODUCTS.filter(p => p.brand === 'Levolor'),
};

// ============================================================
// BRAND PRICE POSITIONING (for comparison UI)
// ============================================================
export const BRAND_TIER = {
  'Norman®': 'premium',
  'Onyx®': 'budget',
  'Levolor': 'mid',
};

// ============================================================
// Product lookup by slug
// ============================================================
export const PRODUCT_BY_SLUG: Record<string, Product> = {};
ALL_PRODUCTS.forEach(p => { PRODUCT_BY_SLUG[p.slug] = p; });

// Re-export utilities
export { getCustomerPrice, getSurchargePrice };
export type { Product };
