/**
 * Norman® Ultimate™ Faux Wood Blinds + SmartPrivacy® Faux Wood
 * Source: 2026 March Retail Price Guide
 */
import type { Product, PriceGrid, Surcharge } from './norman-catalog';

const FAUX_WOOD_WIDTHS = [24, 28, 32, 36, 42, 48, 54, 60, 66, 72, 78, 84, 96];
const FAUX_WOOD_HEIGHTS = [30, 36, 42, 48, 54, 60, 66, 73, 78, 84, 90, 96];

const SMARTPRIVACY_WIDTHS = [24, 28, 32, 36, 42, 48, 54, 60, 66, 72];
const SMARTPRIVACY_HEIGHTS = [30, 36, 42, 48, 54, 60, 66, 73, 78, 84, 90, 96];

export const FAUX_WOOD_SURCHARGES: Surcharge[] = [
  { name: 'Printed Color', price: 20, type: 'percent', description: '20% surcharge for printed colors' },
  { name: 'Shim', price: 7, type: 'flat' },
  { name: 'Side Mount Bracket', price: 23, type: 'flat', description: 'Per blind' },
  { name: 'Keystone', price: 73, type: 'flat' },
  { name: 'Cut-Out', price: 89, type: 'flat', description: 'Per side' },
];

export const ultimateFauxWood: Product = {
  id: 'ultimate-faux-wood',
  slug: 'ultimate-faux-wood-blinds',
  name: 'Ultimate™ Cordless Faux Wood Blinds',
  brand: 'Norman®',
  category: 'blinds',
  subcategory: 'faux-wood',
  tagline: "Industry's #1 blind — SmartPrivacy® for unmatched light control",
  description: 'Our flagship Ultimate faux wood blind takes light control and privacy to the highest level with an exclusive bottom rail that pivots 90 degrees when closed for the tightest closure in the market. The signature cordless system is Best for Kids certified and offers flawless daily operation. Co-extruded slats are lightweight, durable, and moisture-resistant.',
  features: [
    'SmartPrivacy® technology — tighter closure, concealed route holes',
    'Pivoting bottom rail — 90° rotation for tightest closure in market',
    'Best for Kids certified cordless operation',
    'Self-leveling technology — stays perfectly level',
    'Co-extruded slats — QUV 500H, 125° HDT rated',
    'Modern valance-free PolyDeco headrail with built-in light block',
    'Moisture resistant — perfect for kitchens and bathrooms',
    'Available in 2" and 2-1/2" slat sizes',
    'Wand tilt (standard left, optional right)',
  ],
  benefits: [
    'Maximum privacy — concealed route holes block more light than competitors',
    'Child & pet safe — cordless with no dangling cords',
    'Durable — withstands humidity, heat, and UV exposure',
    'Easy to clean — just wipe with a damp cloth',
    'Classic look — resembles real wood at a fraction of the cost',
    'Smooth operation — raise and lower with one hand',
  ],
  liftSystems: ['Cordless (standard)'],
  motorization: { available: false },
  surcharges: FAUX_WOOD_SURCHARGES,
  variants: [
    {
      id: 'ultimate-faux-2-25',
      name: '2" & 2-1/2" Slats',
      cellSize: '2" / 2-1/2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Max area 48 sq ft', 'Widths 90"+ not available in all heights'],
      priceGrid: {
        widths: FAUX_WOOD_WIDTHS,
        heights: FAUX_WOOD_HEIGHTS,
        prices: [
          [169,185,200,223,238,256,280,326,347,373,400,421,454],
          [180,194,210,236,254,273,304,347,371,408,421,454,494],
          [193,210,228,252,272,298,329,372,403,438,462,498,535],
          [206,223,239,267,289,319,350,397,431,471,494,528,571],
          [223,249,259,296,321,350,384,438,471,509,543,577,620],
          [238,255,278,314,340,368,407,467,500,544,574,620,673],
          [252,270,293,331,357,394,432,497,531,591,614,660,715],
          [265,288,312,355,383,420,462,531,571,620,660,711,769],
          [273,302,329,365,400,438,482,559,598,659,696,742,812],
          [288,314,342,388,420,462,512,585,632,701,730,771,854],
          [302,329,357,407,439,482,533,609,660,725,761,805,0], // 90" height: NA for 96" width
          [312,346,373,421,462,512,569,641,695,764,791,0,0],   // 96" height: NA for 84"+ width
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/ultimate-faux-wood-hero.jpg',
    gallery: ['https://normanusa.com/product/ultimate-faux-wood-blinds/'],
    swatches: [],
  },
  specs: {
    'Slat Sizes': '2", 2-1/2"',
    'Max Width': '96"',
    'Max Area': '48 sq ft',
    'Material': 'Co-extruded PVC (lead-free)',
    'UV Rating': 'QUV 500H',
    'Heat Deflection': '125° HDT',
    'Privacy': 'SmartPrivacy® concealed route holes',
    'Child Safety': 'Best for Kids Certified',
    'Moisture Resistant': 'Yes — suitable for kitchens & bathrooms',
  },
  restrictions: [
    'Max area 48 sq ft (cordless)',
    'Some width/height combinations not available at larger sizes',
    'Oversize surcharge for widths 90" or over',
  ],
  awards: ['Best Technical Innovation — Ultimate Cordless Faux Wood Blinds'],
};

export const smartPrivacyFauxWood: Product = {
  id: 'smartprivacy-faux-wood',
  slug: 'smartprivacy-faux-wood-blinds',
  name: 'SmartPrivacy® Cordless Faux Wood Blinds',
  brand: 'Norman®',
  category: 'blinds',
  subcategory: 'faux-wood',
  tagline: 'Better light & privacy control at an accessible price',
  description: 'The SmartPrivacy faux wood blind features our patented SmartPrivacy technology with concealed route holes for extra privacy and less light leakage. Impact resistant modern valance-free PolyDeco headrail and co-extruded high HDT slats deliver lasting performance.',
  features: [
    'SmartPrivacy® concealed route holes',
    'Impact resistant PolyDeco headrail — modern, valance-free',
    'Co-extruded high HDT slats',
    'Best for Kids certified cordless',
    'Available in 2" and 2-1/2" slat sizes',
    'Wand tilt (standard left)',
    'Designer Crown and Modern Curved valance options',
  ],
  benefits: [
    'Affordable entry point for premium-quality blinds',
    'Enhanced privacy vs standard blinds',
    'Child safe — cordless operation',
    'Durable and moisture resistant',
    'Clean, modern look without bulky valances',
  ],
  liftSystems: ['Cordless (standard)'],
  motorization: { available: false },
  surcharges: [
    { name: 'Printed Colors', price: 20, type: 'percent' },
    { name: 'Shim', price: 7, type: 'flat' },
    { name: 'Side Mount Bracket', price: 23, type: 'flat', description: 'Per blind' },
  ],
  variants: [
    {
      id: 'smartprivacy-faux-2-25',
      name: '2" & 2-1/2" Slats',
      cellSize: '2" / 2-1/2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: ['Max width 72"'],
      priceGrid: {
        widths: SMARTPRIVACY_WIDTHS,
        heights: SMARTPRIVACY_HEIGHTS,
        prices: [
          [134,146,156,176,186,201,218,255,272,291],
          [140,153,163,185,199,213,238,272,289,321],
          [152,163,179,196,212,233,257,290,314,342],
          [161,176,186,209,227,249,274,309,336,367],
          [176,194,203,229,250,274,299,342,367,399],
          [186,200,217,246,266,288,319,365,389,424],
          [196,211,229,258,279,307,337,387,414,460],
          [208,226,244,278,299,328,361,414,445,483],
          [213,235,257,284,312,342,376,435,467,513],
          [226,246,269,304,328,361,401,456,494,546],
          [235,257,279,319,342,376,416,476,513,566],
          [244,270,291,329,361,401,443,501,542,596],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/smartprivacy-hero.jpg',
    gallery: ['https://normanusa.com/smartprivacy/'],
    swatches: [],
  },
  specs: {
    'Slat Sizes': '2", 2-1/2"',
    'Max Width': '72"',
    'Material': 'Co-extruded PVC',
    'Privacy': 'SmartPrivacy® concealed route holes',
    'Child Safety': 'Best for Kids Certified',
    'Headrail': 'Impact resistant PolyDeco, valance-free',
  },
  restrictions: ['Max width 72"'],
  awards: [],
};
