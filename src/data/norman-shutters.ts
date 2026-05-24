/**
 * Norman® Shutters — Priced per Square Foot
 * Source: Dealer Portal (ProductPriceList.asp) — March 2026
 * 
 * PRICING MODEL: price_per_sqft × square_footage × 0.36 (our multiplier)
 * Minimum: 8 sq ft per shutter (shutters < 8 sq ft priced as 8 sq ft)
 */
import type { Product, Surcharge } from './norman-catalog';

// ============================================================
// SHUTTER PRICING (per square foot - RETAIL)
// ============================================================

export interface ShutterLine {
  id: string;
  name: string;
  material: string;
  description: string;
  retailPerSqFt: number;       // Standard 6-8 week lead time
  americasRetailPerSqFt: number | null;  // Woodlore Americas 3-week (if available)
  airFreightPerSqFt: number | null;      // Air freight 3-week (if available)
  leadTime: string;
  features: string[];
}

export const SHUTTER_LINES: ShutterLine[] = [
  {
    id: 'woodlore',
    name: 'Woodlore®',
    material: 'Engineered Wood Composite',
    description: 'Norman\'s most popular and affordable shutter. Engineered wood composite construction provides durability, moisture resistance, and a classic painted finish at an accessible price point.',
    retailPerSqFt: 14.25,
    americasRetailPerSqFt: 16.50,
    airFreightPerSqFt: null,
    leadTime: '6-8 weeks (standard) | 3 weeks (Americas)',
    features: [
      'Most affordable Norman shutter',
      'Engineered wood composite',
      'Moisture resistant',
      'Classic painted finishes',
      'Best for Kids certified options',
      '3-week expedited option available (Americas)',
    ],
  },
  {
    id: 'woodlore-plus',
    name: 'Woodlore® Plus',
    material: 'Advanced Polymer Composite',
    description: 'Upgraded polymer composite with enhanced durability and refined finish. Superior moisture resistance makes it ideal for bathrooms, kitchens, and humid environments.',
    retailPerSqFt: 17.30,
    americasRetailPerSqFt: null,
    airFreightPerSqFt: 30.00,
    leadTime: '6-8 weeks (standard) | 3 weeks (air freight)',
    features: [
      'Advanced polymer composite',
      'Superior moisture resistance',
      'Refined finish quality',
      'Ideal for kitchens and bathrooms',
      'Air freight expedited option',
    ],
  },
  {
    id: 'woodlore-plus-aquashield',
    name: 'Woodlore® Plus with AquaShield™',
    material: 'Polymer Composite + AquaShield™',
    description: 'The ultimate moisture-proof shutter. AquaShield technology provides complete waterproof protection — perfect for bathrooms, pool houses, and any high-moisture environment.',
    retailPerSqFt: 21.70,
    americasRetailPerSqFt: null,
    airFreightPerSqFt: 36.25,
    leadTime: '6-8 weeks (standard) | 3 weeks (air freight)',
    features: [
      'AquaShield™ waterproof technology',
      '100% moisture proof',
      'Perfect for bathrooms and pool houses',
      'Will not warp, crack, or peel',
      'Easy to clean — wipe down',
    ],
  },
  {
    id: 'brightwood',
    name: 'Brightwood™',
    material: 'Premium Engineered Wood',
    description: 'A step up from Woodlore with premium engineered wood construction and refined detailing. Beautiful painted finishes with enhanced durability.',
    retailPerSqFt: 18.40,
    americasRetailPerSqFt: null,
    airFreightPerSqFt: 32.15,
    leadTime: '6-8 weeks (standard) | 3 weeks (air freight)',
    features: [
      'Premium engineered wood',
      'Enhanced finish quality',
      'Refined panel detailing',
      'Wide color selection',
    ],
  },
  {
    id: 'normandy-painted',
    name: 'Normandy® Painted',
    material: 'Premium Hardwood (Painted)',
    description: 'Norman\'s flagship real wood shutter in painted finishes. Crafted from premium hardwood with furniture-quality paint finishes. The gold standard in plantation shutters.',
    retailPerSqFt: 20.00,
    americasRetailPerSqFt: null,
    airFreightPerSqFt: 32.15,
    leadTime: '6-8 weeks (standard) | 3 weeks (air freight)',
    features: [
      'Premium real hardwood construction',
      'Furniture-quality painted finish',
      'Wide louver options (2.5", 3.5", 4.5")',
      'InvisibleTilt® option available',
      'The gold standard in shutters',
    ],
  },
  {
    id: 'normandy-stained',
    name: 'Normandy® Stained',
    material: 'Premium Hardwood (Stained)',
    description: 'The finest plantation shutter available — premium hardwood with rich stained finishes that showcase the natural wood grain. Unmatched warmth and elegance.',
    retailPerSqFt: 20.80,
    americasRetailPerSqFt: null,
    airFreightPerSqFt: 33.25,
    leadTime: '6-8 weeks (standard) | 3 weeks (air freight)',
    features: [
      'Premium real hardwood',
      'Rich stained finishes — natural wood grain visible',
      'Warmest, most elegant option',
      'Wide louver options',
      'InvisibleTilt® option available',
      'Heirloom quality',
    ],
  },
];

// ============================================================
// SHUTTER SURCHARGES
// ============================================================

export const SHUTTER_SURCHARGES: Surcharge[] = [
  // Specialty shapes (flat fees)
  { name: 'Quarter Sunburst Panel with Continuous Frame', price: 430, type: 'flat' },
  { name: 'Horizontal Center Arch with Quarter Round Side Panels', price: 430, type: 'flat' },
  { name: 'Sunburst Center Arch with Quarter Round Side Panels', price: 645, type: 'flat' },
  
  // Frame surcharges (percentage)
  { name: 'L Frames (1/2" or 1" Buildout)', price: 5, type: 'percent' },
  { name: 'Deco Frames (1/2", 1", or 1-1/2" Extension)', price: 10, type: 'percent' },
  { name: 'Frames with Custom Extension', price: 10, type: 'percent' },
  { name: 'Custom Width T-Posts', price: 5, type: 'percent' },
  { name: 'Pre-Drilled Z Frames & L Frames', price: 5, type: 'percent' },
  
  // Per-unit flat surcharges
  { name: 'Frame & Light Block Notch Outs', price: 10, type: 'flat', description: 'Per cut' },
  { name: '3" Deco Sill Frame', price: 14, type: 'flat', description: 'Per linear foot' },
  { name: 'Offset Tilt Rod', price: 10, type: 'flat', description: 'Per panel' },
  { name: 'InvisibleTilt®', price: 20, type: 'flat', description: 'Per panel — hidden tilt mechanism' },
  { name: 'AutoTilt', price: 70, type: 'flat', description: 'Per panel — motorized tilt' },
  { name: 'DayNite', price: 4, type: 'flat', description: 'Per sq ft — dual louver system' },
  { name: 'Raised Panel', price: 60, type: 'flat', description: 'Per panel' },
  { name: 'Liberty Arch', price: 60, type: 'flat', description: 'Per panel' },
  { name: 'Stainless Steel Hinges', price: 5, type: 'percent' },
  { name: 'Panel Locks', price: 15, type: 'flat', description: 'Each' },
  { name: 'Shutter Pole', price: 40, type: 'flat', description: 'Each' },
  { name: 'Shutter Pole Attachment', price: 20, type: 'flat', description: 'Each' },
  { name: 'Custom Width Divider Rail', price: 21, type: 'flat', description: 'Per divider rail' },
  { name: 'Shutter Keystones', price: 20, type: 'flat', description: 'Each' },
  
  // Configuration surcharges (percentage)
  { name: 'Café Shutters', price: 30, type: 'percent', description: 'Half-height shutters' },
  { name: 'Bypass & Bifold Track Shutters', price: 40, type: 'percent', description: 'Track-mounted systems' },
  { name: 'Floating Panels', price: 5, type: 'percent' },
  { name: 'Track Only (without header/fascia/frames)', price: 10, type: 'percent' },
  { name: 'Track with Header & Fascia (without side frames)', price: 20, type: 'percent' },
];

// ============================================================
// SHUTTER FREIGHT
// ============================================================

export const SHUTTER_FREIGHT: Surcharge[] = [
  { name: 'First Shutter', price: 75, type: 'flat' },
  { name: 'Each Additional Shutter', price: 25, type: 'flat' },
  { name: 'Oversize (height 90"+) — First', price: 80, type: 'flat' },
  { name: 'Oversize — Each Additional', price: 50, type: 'flat' },
];

// ============================================================
// PRICING UTILITY
// ============================================================

const PRICE_MULTIPLIER = 0.36; // 0.30 dealer cost × 1.20 markup
const MIN_SQ_FT = 8;

/**
 * Calculate shutter customer price
 * @param line - Shutter product line
 * @param widthInches - Window width
 * @param heightInches - Window height
 * @param expedited - Use Americas/Air Freight pricing
 */
export function getShutterPrice(
  line: ShutterLine,
  widthInches: number,
  heightInches: number,
  expedited: boolean = false,
): { 
  sqFt: number;
  effectiveSqFt: number;
  retailPerSqFt: number;
  retailTotal: number;
  customerPrice: number;
  leadTime: string;
} | null {
  const sqFt = (widthInches * heightInches) / 144;
  const effectiveSqFt = Math.max(sqFt, MIN_SQ_FT);
  
  let retailPerSqFt = line.retailPerSqFt;
  let leadTime = '6-8 weeks';
  
  if (expedited) {
    if (line.americasRetailPerSqFt) {
      retailPerSqFt = line.americasRetailPerSqFt;
      leadTime = '3 weeks (Americas)';
    } else if (line.airFreightPerSqFt) {
      retailPerSqFt = line.airFreightPerSqFt;
      leadTime = '3 weeks (Air Freight)';
    }
  }
  
  const retailTotal = effectiveSqFt * retailPerSqFt;
  const customerPrice = Math.ceil(retailTotal * PRICE_MULTIPLIER * 100) / 100;
  
  return {
    sqFt: Math.round(sqFt * 100) / 100,
    effectiveSqFt,
    retailPerSqFt,
    retailTotal: Math.round(retailTotal * 100) / 100,
    customerPrice,
    leadTime,
  };
}

// ============================================================
// PRODUCT ENTRY (for catalog)
// ============================================================

export const normanShutters: Product = {
  id: 'norman-shutters',
  slug: 'plantation-shutters',
  name: 'Norman® Plantation Shutters',
  brand: 'Norman®',
  category: 'shutters',
  subcategory: 'plantation',
  tagline: 'Hand-crafted furniture for your windows — 6 product lines from $14.25/sq ft',
  description: 'Not just any shutters — they are custom, hand-crafted furniture for your windows. Norman plantation shutters come in 6 product lines from budget-friendly engineered composite to premium real hardwood with stained finishes. Options include InvisibleTilt® hidden tilt mechanism, DayNite dual louver system, AquaShield waterproof technology, and more.',
  features: [
    '6 product lines from $14.25 to $20.80 per sq ft (retail)',
    'Woodlore® — most affordable, engineered composite',
    'Woodlore® Plus — enhanced polymer, superior moisture resistance',
    'Woodlore® Plus AquaShield™ — 100% waterproof',
    'Brightwood™ — premium engineered wood',
    'Normandy® Painted — real hardwood, furniture-quality paint',
    'Normandy® Stained — real hardwood, natural grain finish',
    'InvisibleTilt® — hidden tilt mechanism (no visible tilt rod)',
    'DayNite — dual louver system for day and night privacy',
    'AutoTilt — motorized tilt per panel',
    'Specialty shapes — arches, sunbursts, quarter rounds',
    'Louver sizes: 2.5", 3.5", 4.5"',
  ],
  benefits: [
    'Increases home value — shutters are a permanent fixture',
    'Maximum light control and privacy',
    'Energy efficient — insulating air pocket',
    'Durable — built to last decades',
    'Timeless style that never goes out of fashion',
    'Options for every budget and environment',
  ],
  liftSystems: ['Tilt Rod (standard)', 'InvisibleTilt® (hidden)', 'AutoTilt (motorized)'],
  motorization: {
    available: true,
    options: ['AutoTilt — motorized tilt per panel ($70/panel retail)'],
    surcharges: [{ name: 'AutoTilt', price: 70, type: 'flat', description: 'Per panel' }],
  },
  surcharges: SHUTTER_SURCHARGES,
  variants: [
    // We use a single "variant" with a dummy price grid since shutters use sq ft pricing
    {
      id: 'shutters-all',
      name: 'All Shutter Lines (priced per sq ft)',
      cellSize: 'N/A',
      construction: 'Various (composite to hardwood)',
      liftSystem: 'Tilt Rod',
      maxWidth: 144,
      restrictions: ['Minimum 8 sq ft per shutter', 'Oversize surcharge for heights 90"+'],
      priceGrid: {
        widths: [24, 36, 48, 60, 72, 84, 96],
        heights: [36, 48, 60, 72, 84, 96],
        // These are Woodlore RETAIL prices calculated from sq ft
        prices: [
          [85.5, 85.5, 85.5, 85.5, 102.86, 120.00, 137.14],  // 36h: most are min 8sqft
          [114.00, 114.00, 114.00, 142.50, 171.00, 199.50, 228.00],
          [114.00, 142.50, 171.43, 214.29, 257.14, 300.00, 342.86],
          [114.00, 171.00, 228.00, 285.00, 342.00, 399.00, 456.00],
          [114.00, 199.50, 266.00, 332.50, 399.00, 465.50, 532.00],
          [114.00, 228.00, 304.00, 380.00, 456.00, 532.00, 608.00],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/shutters-hero.jpg',
    gallery: ['https://normanusa.com/window-treatments/shutters/'],
    swatches: [],
  },
  specs: {
    'Product Lines': '6 (Woodlore, Woodlore Plus, AquaShield, Brightwood, Normandy Painted, Normandy Stained)',
    'Pricing': 'Per square foot (8 sq ft minimum)',
    'Louver Sizes': '2.5", 3.5", 4.5"',
    'Frame Options': 'L Frame, Deco Frame, Z Frame, Custom Extension',
    'Tilt Options': 'Standard Tilt Rod, InvisibleTilt®, AutoTilt (motorized)',
    'Special Features': 'DayNite dual louver, AquaShield waterproof, Café style',
    'Lead Time': '6-8 weeks standard, 3 weeks expedited (select lines)',
    'Specialty Shapes': 'Arches, Sunbursts, Quarter Rounds',
  },
  restrictions: [
    'Minimum 8 sq ft per shutter',
    'Oversize surcharge for heights 90" or over',
    'Not all options available in every shutter line',
    'AquaShield only on Woodlore Plus',
    'InvisibleTilt not available on Woodlore Plus AquaShield',
  ],
  awards: [],
};
