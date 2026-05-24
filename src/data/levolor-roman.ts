/**
 * Levolor Roman Shades
 * Placeholder pricing ~10-15% below Norman equivalents
 */
import type { Product, Surcharge } from './norman-catalog';

const ROMAN_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72];
const ROMAN_HEIGHTS = [36, 42, 48, 54, 60, 66, 72];

const LEVOLOR_ROMAN_SURCHARGES: Surcharge[] = [
  { name: 'Blackout Lining', price: 15, type: 'percent', description: '15% surcharge for blackout lining upgrade' },
  { name: 'Continuous Loop Upgrade', price: 25, type: 'flat', description: 'Continuous loop lift instead of cordless' },
  { name: 'Hold Down Brackets', price: 20, type: 'flat', description: 'Per shade — for doors or tilt windows' },
  { name: 'Edge Binding', price: 35, type: 'flat', description: 'Decorative edge binding accent' },
];

export const levolorRoman: Product = {
  id: 'levolor-roman',
  slug: 'levolor-roman',
  name: 'Levolor Roman Shades',
  brand: 'Levolor',
  category: 'shades',
  subcategory: 'roman',
  tagline: 'Soft fabric shades with timeless Roman fold styling',
  description: 'Levolor Roman Shades bring the warmth and texture of soft fabric to your windows with classic Roman fold styling. Choose from flat fold for a clean, tailored look or hobbled (waterfall) for elegant cascading folds that add depth and dimension. A curated collection of designer fabrics in solids, patterns, and natural textures ensures you will find the perfect match for your space.',
  features: [
    'Cordless lift system for clean lines and child safety',
    'Continuous loop lift available for larger or heavier shades',
    'Optional blackout lining for bedrooms and media rooms',
    'Flat fold and hobbled (waterfall) fold styles',
    'Decorative fabric collection with solids, patterns, and textures',
    'Built-in aluminum headrail with mounting hardware included',
    'Fabric-covered front and bottom rail for a finished look',
    'Custom made to your exact window dimensions',
  ],
  benefits: [
    'Designer look — soft fabric folds add warmth and sophistication',
    'Versatile light control — from soft filtering to full blackout with lining',
    'Child safe — cordless operation with no dangling cords',
    'Easy to operate — lightweight fabric raises and lowers smoothly',
    'Timeless style — Roman shades complement traditional and modern interiors',
    'Energy savings — fabric layers provide an extra barrier against drafts',
  ],
  liftSystems: ['Cordless', 'Continuous Loop'],
  motorization: { available: false },
  surcharges: LEVOLOR_ROMAN_SURCHARGES,
  variants: [
    {
      id: 'levolor-roman-flat',
      name: 'Flat Fold',
      cellSize: 'N/A',
      construction: 'Flat Fold Roman',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: ['Max width 72"'],
      priceGrid: {
        widths: ROMAN_WIDTHS,
        heights: ROMAN_HEIGHTS,
        prices: [
          // 36h
          [160, 188, 214, 240, 268, 296, 326, 358, 392],
          // 42h
          [178, 208, 238, 266, 298, 328, 362, 398, 436],
          // 48h
          [196, 230, 262, 294, 328, 362, 400, 440, 482],
          // 54h
          [216, 252, 288, 324, 362, 400, 440, 484, 530],
          // 60h
          [236, 276, 316, 354, 396, 438, 482, 530, 580],
          // 66h
          [258, 302, 344, 388, 432, 478, 528, 580, 634],
          // 72h
          [280, 328, 374, 422, 470, 520, 574, 632, 692],
        ],
      },
    },
    {
      id: 'levolor-roman-hobbled',
      name: 'Hobbled / Waterfall',
      cellSize: 'N/A',
      construction: 'Hobbled Roman',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: ['Max width 72"'],
      priceGrid: {
        widths: ROMAN_WIDTHS,
        heights: ROMAN_HEIGHTS,
        prices: [
          // 36h (~15% more than flat fold)
          [184, 216, 246, 276, 308, 340, 375, 412, 451],
          // 42h
          [205, 239, 274, 306, 343, 377, 416, 458, 501],
          // 48h
          [225, 265, 301, 338, 377, 416, 460, 506, 554],
          // 54h
          [248, 290, 331, 373, 416, 460, 506, 557, 610],
          // 60h
          [271, 317, 363, 407, 455, 504, 554, 610, 667],
          // 66h
          [297, 347, 396, 446, 497, 550, 607, 667, 729],
          // 72h
          [322, 377, 430, 485, 541, 598, 660, 727, 796],
        ],
      },
    },
  ],
  imageUrls: {
    hero: '',
    gallery: [],
    swatches: [],
  },
  specs: {
    'Fold Styles': 'Flat Fold, Hobbled (Waterfall)',
    'Max Width': '72"',
    'Lift Systems': 'Cordless, Continuous Loop',
    'Lining Options': 'Standard, Blackout',
    'Child Safety': 'Cordless — no exposed cords',
    'Headrail': 'Aluminum with fabric-covered front',
    'Bottom Rail': 'Fabric-covered weighted bottom rail',
  },
  restrictions: [
    'Max width 72"',
    'Continuous loop recommended for shades wider than 60"',
    'Blackout lining adds weight — may affect maximum size',
  ],
  awards: [],
};
