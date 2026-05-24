/**
 * Levolor Faux Wood Blinds + Classic Value Faux Wood
 * Placeholder pricing ~10-15% below Norman equivalents
 */
import type { Product, Surcharge } from './norman-catalog';

const LEVOLOR_FAUX_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72];
const LEVOLOR_FAUX_HEIGHTS = [36, 42, 48, 54, 60, 66, 72];

const FAUX_WOOD_SURCHARGES: Surcharge[] = [
  { name: 'Premium Finish', price: 15, type: 'percent', description: '15% surcharge for premium woodgrain finishes' },
  { name: 'Extension Bracket', price: 18, type: 'flat', description: 'Per blind' },
];

export const levolorFauxWood: Product = {
  id: 'levolor-faux-wood',
  slug: 'levolor-faux-wood',
  name: 'Levolor Faux Wood Blinds',
  brand: 'Levolor',
  category: 'blinds',
  subcategory: 'faux-wood',
  tagline: 'Moisture-resistant faux wood blinds with real wood look',
  description: 'Levolor Faux Wood Blinds deliver the warmth and beauty of real wood with the durability and moisture resistance of advanced composite materials. Available in both smooth and realistic woodgrain finishes, these blinds are ideal for any room including kitchens, bathrooms, and laundry rooms where humidity is a concern. The cordless lift system keeps windows clean and child-safe.',
  features: [
    'Cordless lift system — child and pet safe',
    'Wand tilt for precise light control',
    'Moisture resistant — ideal for kitchens and bathrooms',
    'Realistic woodgrain and smooth finish options',
    'Available in 2" and 2-1/2" slat sizes',
    'Durable composite construction resists warping and fading',
    'Decorative valance included',
    'Inside or outside mount',
  ],
  benefits: [
    'Real wood look without the maintenance',
    'Safe for high-humidity rooms',
    'Child and pet safe cordless operation',
    'Easy to clean — wipe with a damp cloth',
    'Will not warp, crack, or peel over time',
    'Wide selection of finishes to match any decor',
  ],
  liftSystems: ['Cordless', 'Standard Cord'],
  motorization: { available: false },
  surcharges: FAUX_WOOD_SURCHARGES,
  variants: [
    {
      id: 'levolor-faux-2',
      name: '2" Faux Wood',
      cellSize: '2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_FAUX_WIDTHS,
        heights: LEVOLOR_FAUX_HEIGHTS,
        prices: [
          [95,  112, 132, 155, 178, 205, 235, 268, 305],
          [108, 128, 150, 176, 203, 234, 268, 306, 348],
          [122, 145, 170, 200, 230, 265, 304, 347, 395],
          [137, 163, 192, 225, 260, 299, 343, 392, 445],
          [153, 182, 215, 252, 291, 336, 385, 440, 500],
          [165, 197, 232, 272, 315, 363, 416, 475, 520],
        ],
      },
    },
    {
      id: 'levolor-faux-2-5',
      name: '2-1/2" Faux Wood',
      cellSize: '2-1/2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_FAUX_WIDTHS,
        heights: LEVOLOR_FAUX_HEIGHTS,
        prices: [
          [100, 118, 139, 163, 187, 215, 247, 281, 320],
          [113, 134, 158, 185, 213, 246, 281, 321, 365],
          [128, 152, 179, 210, 242, 278, 319, 364, 415],
          [144, 171, 202, 236, 273, 314, 360, 412, 467],
          [161, 191, 226, 265, 306, 353, 404, 462, 525],
          [173, 207, 244, 286, 331, 381, 437, 499, 546],
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
    'Slat Sizes': '2", 2-1/2"',
    'Max Width': '72"',
    'Material': 'Composite PVC faux wood',
    'Finishes': 'Woodgrain and smooth',
    'Moisture Resistant': 'Yes — suitable for kitchens & bathrooms',
    'Child Safety': 'Cordless lift system',
  },
  restrictions: ['Max width 72"'],
  awards: [],
};

export const levolorClassicFauxWood: Product = {
  id: 'levolor-classic-faux-wood',
  slug: 'levolor-classic-faux-wood',
  name: 'Levolor Classic Value Faux Wood Blinds',
  brand: 'Levolor',
  category: 'blinds',
  subcategory: 'faux-wood',
  tagline: 'Affordable faux wood blinds with dependable quality',
  description: 'The Levolor Classic Value Faux Wood Blind offers the timeless look of wood at an everyday price. Built with durable composite slats in a streamlined selection of popular neutral finishes, these 2-inch blinds are a smart choice for renters, first-time homeowners, or anyone who wants a clean and classic window treatment on a budget.',
  features: [
    'Cordless lift system — child and pet safe',
    'Wand tilt control',
    'Moisture resistant construction',
    '2" slat size',
    'Select neutral finish options',
    'Decorative valance included',
  ],
  benefits: [
    'Budget-friendly entry point for faux wood blinds',
    'Clean, classic look in popular finishes',
    'Child safe cordless operation',
    'Durable and easy to maintain',
    'Great value for multi-window installations',
  ],
  liftSystems: ['Cordless', 'Standard Cord'],
  motorization: { available: false },
  surcharges: [],
  variants: [
    {
      id: 'levolor-classic-faux-2',
      name: '2" Faux Wood',
      cellSize: '2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_FAUX_WIDTHS,
        heights: LEVOLOR_FAUX_HEIGHTS,
        prices: [
          [76,  90,  106, 124, 142, 164, 188, 214, 244],
          [86,  102, 120, 141, 162, 187, 214, 245, 278],
          [98,  116, 136, 160, 184, 212, 243, 278, 316],
          [110, 130, 154, 180, 208, 239, 274, 314, 356],
          [122, 146, 172, 202, 233, 269, 308, 352, 400],
          [132, 158, 186, 218, 252, 290, 333, 380, 416],
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
    'Slat Size': '2"',
    'Max Width': '72"',
    'Material': 'Composite PVC faux wood',
    'Finishes': 'Select neutral finishes',
    'Moisture Resistant': 'Yes',
    'Child Safety': 'Cordless lift system',
  },
  restrictions: ['Max width 72"'],
  awards: [],
};
