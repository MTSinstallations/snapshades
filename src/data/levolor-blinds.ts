/**
 * Levolor Real Wood Blinds + Riviera Metal Blinds
 * Placeholder pricing ~10-15% below Norman equivalents
 */
import type { Product, Surcharge } from './norman-catalog';

const LEVOLOR_WOOD_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72];
const LEVOLOR_WOOD_HEIGHTS = [36, 42, 48, 54, 60, 66, 72];

const LEVOLOR_METAL_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72];
const LEVOLOR_METAL_HEIGHTS = [36, 42, 48, 54, 60, 66, 72];

const REAL_WOOD_SURCHARGES: Surcharge[] = [
  { name: 'Premium Stain', price: 15, type: 'percent', description: '15% surcharge for premium stain finishes' },
  { name: 'Routeless', price: 10, type: 'percent', description: 'Enhanced privacy with no route holes' },
  { name: 'Extension Bracket', price: 18, type: 'flat', description: 'Per blind' },
];

export const levolorRealWood: Product = {
  id: 'levolor-real-wood',
  slug: 'levolor-real-wood',
  name: 'Levolor Real Wood Blinds',
  brand: 'Levolor',
  category: 'blinds',
  subcategory: 'wood',
  tagline: 'Premium basswood blinds with painted and stained finishes',
  description: 'Crafted from genuine North American basswood, Levolor Real Wood Blinds bring natural warmth and character to any space. Each slat is individually sanded and finished with rich stains or smooth painted coatings that highlight the natural grain of the wood. Available in 2-inch and 2-1/2-inch slat sizes with a cordless lift system for a clean, safe window.',
  features: [
    'Genuine basswood construction',
    'Painted and stained finish options',
    'Cordless lift system — child and pet safe',
    'Wand tilt for precise light control',
    'Available in 2" and 2-1/2" slat sizes',
    'Cloth tape decorative option',
    'Decorative valance included',
    'Inside or outside mount',
  ],
  benefits: [
    'Natural wood warmth and beauty',
    'Lightweight basswood is easy to operate',
    'Rich stain finishes showcase real wood grain',
    'Cordless design keeps windows clean and safe',
    'Adds value and character to any room',
    'Wide range of colors to coordinate with trim and furniture',
  ],
  liftSystems: ['Cordless', 'Standard Cord'],
  motorization: { available: false },
  surcharges: REAL_WOOD_SURCHARGES,
  variants: [
    {
      id: 'levolor-wood-2',
      name: '2" Wood',
      cellSize: '2"',
      construction: 'Real Wood (Basswood)',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_WOOD_WIDTHS,
        heights: LEVOLOR_WOOD_HEIGHTS,
        prices: [
          [150, 175, 204, 238, 274, 315, 360, 410, 465],
          [168, 197, 230, 268, 310, 356, 408, 465, 528],
          [188, 220, 258, 301, 348, 400, 458, 523, 594],
          [208, 245, 288, 336, 388, 447, 512, 585, 664],
          [230, 272, 320, 374, 432, 497, 570, 650, 680],
          [248, 293, 345, 404, 467, 537, 615, 650, 680],
        ],
      },
    },
    {
      id: 'levolor-wood-2-5',
      name: '2-1/2" Wood',
      cellSize: '2-1/2"',
      construction: 'Real Wood (Basswood)',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_WOOD_WIDTHS,
        heights: LEVOLOR_WOOD_HEIGHTS,
        prices: [
          [158, 184, 214, 250, 288, 331, 378, 431, 488],
          [176, 207, 242, 282, 326, 374, 428, 488, 554],
          [197, 231, 271, 316, 365, 420, 481, 549, 624],
          [218, 257, 302, 353, 407, 469, 538, 614, 697],
          [242, 286, 336, 393, 454, 522, 599, 683, 714],
          [260, 308, 362, 424, 490, 564, 646, 683, 714],
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
    'Material': 'North American basswood',
    'Finishes': 'Painted and stained',
    'Child Safety': 'Cordless lift system',
  },
  restrictions: ['Max width 72"', 'Not recommended for high-humidity areas'],
  awards: [],
};

export const levolorRivieraMetal: Product = {
  id: 'levolor-riviera-metal',
  slug: 'levolor-riviera-metal',
  name: 'Levolor Riviera Metal Blinds',
  brand: 'Levolor',
  category: 'blinds',
  subcategory: 'aluminum',
  tagline: 'Sleek aluminum blinds in a wide range of metallic and bold colors',
  description: 'The Levolor Riviera is the original metal blind, delivering clean lines and a slim profile in an unmatched selection of over 30 colors. From classic neutrals and metallic tones to bold statement hues, Riviera blinds fit any style. The lightweight aluminum slats are spring-tempered to resist denting and bending, keeping their crisp look for years. Available in 1-inch mini and 1/2-inch micro sizes.',
  features: [
    'Spring-tempered aluminum slats resist denting',
    'Wand tilt for easy light adjustment',
    'Cordless lift option available',
    'Over 30 color choices including metallics',
    'Available in 1" mini and 1/2" micro sizes',
    'Slim, low-profile headrail',
    'Inside or outside mount',
  ],
  benefits: [
    'Most affordable Levolor blind option',
    'Huge color selection to match any decor',
    'Lightweight — effortless to raise and lower',
    'Dent-resistant spring-tempered slats',
    'Sleek and modern appearance',
    'Great for offices, apartments, and modern spaces',
  ],
  liftSystems: ['Cordless', 'Standard Cord'],
  motorization: { available: false },
  surcharges: [],
  variants: [
    {
      id: 'levolor-riviera-1',
      name: '1" Mini Blinds',
      cellSize: '1"',
      construction: 'Aluminum',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_METAL_WIDTHS,
        heights: LEVOLOR_METAL_HEIGHTS,
        prices: [
          [55,  65,  76,  89,  103, 118, 135, 155, 176],
          [62,  74,  87,  102, 117, 135, 155, 177, 201],
          [70,  84,  99,  116, 133, 154, 176, 201, 229],
          [79,  94,  111, 130, 150, 173, 198, 226, 257],
          [88,  105, 124, 145, 168, 193, 222, 253, 288],
          [95,  114, 134, 157, 182, 209, 240, 274, 312],
          [100, 120, 141, 166, 192, 221, 253, 289, 320],
        ],
      },
    },
    {
      id: 'levolor-riviera-micro',
      name: '1/2" Micro Blinds',
      cellSize: '1/2"',
      construction: 'Aluminum',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: LEVOLOR_METAL_WIDTHS,
        heights: LEVOLOR_METAL_HEIGHTS,
        prices: [
          [61,  72,  84,  98,  113, 130, 149, 171, 194],
          [68,  81,  96,  112, 129, 149, 171, 195, 221],
          [77,  92,  109, 128, 146, 169, 194, 221, 252],
          [87,  103, 122, 143, 165, 190, 218, 249, 283],
          [97,  116, 136, 160, 185, 212, 244, 278, 317],
          [105, 125, 147, 173, 200, 230, 264, 301, 343],
          [110, 132, 155, 183, 211, 243, 278, 318, 352],
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
    'Slat Sizes': '1" Mini, 1/2" Micro',
    'Max Width': '72"',
    'Material': 'Spring-tempered aluminum',
    'Colors': '30+ including metallics and bold hues',
    'Child Safety': 'Cordless option available',
  },
  restrictions: ['Max width 72"'],
  awards: [],
};
