/**
 * Norman® Ultimate™ Normandy® Cordless Wood Blinds
 * + Synchrony™ Vertical Blinds
 * + CityLights™ Aluminum Blinds
 * Source: 2026 March Retail Price Guide
 */
import type { Product, Surcharge } from './norman-catalog';

// ============================================================
// NORMANDY WOOD BLINDS
// ============================================================

const WOOD_WIDTHS = [24, 28, 32, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96];
const WOOD_HEIGHTS = [30, 36, 42, 48, 54, 60, 66, 73, 78, 84, 90, 96];

export const normandyWood: Product = {
  id: 'normandy-wood',
  slug: 'normandy-wood-blinds',
  name: 'Ultimate™ Normandy® Cordless Wood Blinds',
  brand: 'Norman®',
  category: 'blinds',
  subcategory: 'wood',
  tagline: 'Premium real wood with SmartPrivacy® — the finest wood blind available',
  description: 'Norman\'s Normandy wood blinds combine the natural beauty of real wood with patented SmartPrivacy technology for unmatched privacy and light control. Each blind is crafted from sustainably harvested basswood with a rich, furniture-quality finish.',
  features: [
    'SmartPrivacy® technology — concealed route holes',
    'Best for Kids certified cordless',
    'Premium basswood construction',
    'Modern valance-free PolyDeco headrail',
    '2" and 2-1/2" slat options',
    'Wand tilt (standard left, optional right)',
    'Designer Crown and Contempo valance options',
    'Multiple color finishes: Standard, Designer (+10%), Premium (+50%)',
  ],
  benefits: [
    'Natural wood beauty with superior privacy',
    'Furniture-quality finish enhances any room',
    'Sustainably harvested wood',
    'Child safe cordless operation',
    'Warm, classic aesthetic',
  ],
  liftSystems: ['Cordless (standard)'],
  motorization: { available: false },
  surcharges: [
    { name: 'Designer Color', price: 10, type: 'percent' },
    { name: 'Premium Color', price: 50, type: 'percent' },
    { name: 'Shim', price: 7, type: 'flat' },
    { name: 'Side Mount Bracket', price: 25, type: 'flat', description: 'Per blind' },
    { name: 'Keystone', price: 81, type: 'flat' },
    { name: 'Cut-Out', price: 99, type: 'flat', description: 'Per side' },
  ],
  variants: [
    {
      id: 'normandy-2-25',
      name: '2" & 2-1/2" Slats — Standard Colors',
      cellSize: '2" / 2-1/2"',
      construction: 'Real Wood (Basswood)',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: [],
      priceGrid: {
        widths: WOOD_WIDTHS,
        heights: WOOD_HEIGHTS,
        prices: [
          [297,318,339,364,394,425,472,526,563,609,655,709,748,796],
          [327,343,361,389,429,461,501,574,612,664,714,775,816,876],
          [345,369,389,421,464,501,557,627,678,735,788,864,913,982],
          [376,389,418,451,500,536,598,680,732,794,856,938,994,1063],
          [390,424,464,505,557,604,666,760,815,888,956,1053,1111,1191],
          [420,464,494,535,598,641,714,813,875,956,1035,1133,1191,1289],
          [448,493,523,568,633,691,767,870,937,1020,1111,1223,1289,1407],
          [479,522,560,604,682,739,822,939,1022,1115,1218,1329,1412,1531],
          [487,542,581,635,709,769,884,1008,1084,1167,1261,1433,1515,1655],
          [522,561,621,673,751,820,943,1059,1147,1223,1342,1505,1619,1698],
          [548,585,649,704,788,862,986,1106,1187,1307,1378,1578,1667,1774],
          [561,616,684,746,834,913,1035,1156,1266,1369,1414,1600,1703,1799],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/normandy-wood-hero.jpg',
    gallery: [],
    swatches: [],
  },
  specs: {
    'Material': 'Sustainably harvested Basswood',
    'Slat Sizes': '2", 2-1/2"',
    'Max Width': '96"',
    'Finishes': 'Standard, Designer (+10%), Premium (+50%)',
    'Privacy': 'SmartPrivacy® concealed route holes',
    'Child Safety': 'Best for Kids Certified',
  },
  restrictions: [],
  awards: [],
};

// ============================================================
// SYNCHRONY VERTICAL BLINDS
// ============================================================

const VERT_WIDTHS = [24, 36, 48, 60, 72, 84, 92, 100];
const VERT_HEIGHTS = [48, 60, 72, 84, 96, 108];

export const synchronyVertical: Product = {
  id: 'synchrony-vertical',
  slug: 'synchrony-vertical-blinds',
  name: 'Synchrony™ Vertical Blinds',
  brand: 'Norman®',
  category: 'blinds',
  subcategory: 'vertical',
  tagline: 'Revolutionized vertical blinds — sleek, modern, no valance',
  description: 'Synchrony\'s headrail offers a sleek, modern design with greater light blocking capability and no unattractive valances to fall off, break or fail. A refinement on an iconic solution combining traditional practicality with improved durability and performance.',
  features: [
    'Modern valance-free headrail design',
    'Greater light blocking capability',
    'No valances to break or fall off',
    'Smooth traversing operation',
    'Available in Classic and S-Curved/Sandblasted styles',
    'Ideal for sliding glass doors and large windows',
  ],
  benefits: [
    'Perfect for sliding glass doors and patio doors',
    'Modern look vs traditional verticals',
    'Durable — no valance maintenance issues',
    'Easy to operate and clean',
    'Light control for large openings',
  ],
  liftSystems: ['Traversing (standard)'],
  motorization: { available: false },
  surcharges: [],
  variants: [
    {
      id: 'synchrony-classic',
      name: 'Classic',
      cellSize: 'N/A',
      construction: 'Vertical Vane',
      liftSystem: 'Traversing',
      maxWidth: 100,
      restrictions: [],
      fabricGroups: [{ groupNumber: 1, name: 'Classic', fabrics: ['Classic collection'] }],
      priceGrid: {
        widths: VERT_WIDTHS,
        heights: VERT_HEIGHTS,
        prices: [
          [204,251,303,346,398,434,492,559],
          [217,261,321,366,417,460,519,590],
          [224,279,341,386,440,477,546,623],
          [240,294,361,404,463,501,572,651],
          [247,304,376,428,486,534,601,682],
          [255,319,396,446,511,557,632,714],
        ],
      },
    },
    {
      id: 'synchrony-scurved',
      name: 'S-Curved & Sandblasted',
      cellSize: 'N/A',
      construction: 'Vertical Vane (S-Curved)',
      liftSystem: 'Traversing',
      maxWidth: 100,
      restrictions: [],
      fabricGroups: [{ groupNumber: 2, name: 'S-Curved / Sandblasted', fabrics: ['S-Curved', 'Sandblasted'] }],
      priceGrid: {
        widths: VERT_WIDTHS,
        heights: VERT_HEIGHTS,
        prices: [
          [244,301,365,417,477,522,594,674],
          [260,319,391,440,501,549,624,708],
          [271,335,412,465,529,580,659,746],
          [288,351,433,488,559,609,685,787],
          [298,367,454,511,585,636,724,823],
          [307,386,472,539,614,668,760,862],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/synchrony-vertical-hero.jpg',
    gallery: ['https://normanusa.com/product/synchrony-blinds/'],
    swatches: [],
  },
  specs: {
    'Max Width': '100"',
    'Styles': 'Classic, S-Curved, Sandblasted',
    'Application': 'Sliding glass doors, large windows, patio doors',
  },
  restrictions: [],
  awards: ['Best New Style Concept — Synchrony Vertical Blinds', 'Product Design — Light Shielding Vertical Blinds'],
};
