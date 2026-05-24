/**
 * Onyx® Product Catalog — Budget-friendly window treatments
 * Pricing: Competitive entry-level pricing
 * Structure mirrors Norman catalog for consistent UI
 */

import type { Product } from './norman-catalog';

// Onyx width grid (24-96")
const ONYX_WIDTHS = [24, 27, 30, 33, 36, 39, 42, 45, 48, 54, 60, 66, 72, 84, 96];

// Onyx height grid (24-96")
const ONYX_HEIGHTS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96];

// ============================================================
// ONYX CELLULAR SHADES
// ============================================================

const onyxHoneycomb: Product = {
  id: 'onyx-honeycomb',
  slug: 'onyx-honeycomb',
  name: 'Onyx Cellular Shades',
  brand: 'Onyx®',
  category: 'shades',
  subcategory: 'honeycomb',
  tagline: 'Affordable cellular insulation for every window',
  description: 'Onyx Cellular Shades deliver excellent energy efficiency at an accessible price point. Single and double-cell construction provides insulation without breaking the budget.',
  features: [
    'Single and double cell options',
    'Cordless lift standard',
    'Top-Down/Bottom-Up available',
    'Cell sizes: 1/2", 3/4"',
    'Light filtering and blackout options',
    'Custom sizes to 96" x 96"',
  ],
  benefits: [
    'Budget-friendly cellular technology',
    'Energy efficient honeycomb construction',
    'Child safe cordless design',
    'Wide range of colors',
  ],
  liftSystems: ['Cordless (standard)', 'Continuous Cord Loop', 'Top-Down/Bottom-Up'],
  motorization: { available: false },
  variants: [
    {
      id: 'onyx-honeycomb-single',
      name: '1/2" Single Cell Cordless',
      cellSize: '1/2"',
      construction: 'Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Max 96" width'],
      priceGrid: {
        widths: ONYX_WIDTHS,
        heights: ONYX_HEIGHTS,
        prices: [
          [95, 108, 118, 128, 138, 148, 158, 168, 178, 198, 218, 238, 258],
          [108, 122, 135, 148, 160, 172, 184, 196, 208, 232, 256, 280, 304],
          [118, 135, 150, 165, 180, 195, 210, 225, 240, 268, 296, 324, 352],
          [128, 148, 165, 182, 198, 215, 232, 248, 265, 296, 328, 360, 392],
          [138, 160, 180, 198, 216, 235, 254, 272, 290, 325, 360, 395, 430],
          [148, 172, 195, 215, 235, 256, 276, 296, 316, 354, 392, 430, 468],
          [158, 184, 210, 232, 254, 276, 298, 320, 342, 384, 426, 468, 510],
          [168, 196, 225, 248, 272, 296, 320, 344, 368, 414, 460, 506, 552],
          [178, 208, 240, 265, 290, 316, 342, 368, 394, 444, 494, 544, 594],
          [198, 232, 268, 296, 324, 354, 384, 414, 444, 500, 556, 612, 668],
          [218, 256, 296, 328, 360, 394, 428, 462, 496, 560, 624, 688, 752],
          [238, 280, 324, 360, 396, 434, 472, 510, 548, 620, 692, 764, 836],
          [258, 304, 352, 392, 432, 474, 516, 558, 600, 680, 760, 840, 920],
        ],
      },
    },
    {
      id: 'onyx-honeycomb-double',
      name: '3/4" Double Cell Cordless',
      cellSize: '3/4"',
      construction: 'Double Cell',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Max 96" width'],
      priceGrid: {
        widths: ONYX_WIDTHS,
        heights: ONYX_HEIGHTS,
        prices: [
          [115, 130, 142, 154, 166, 178, 190, 202, 214, 238, 262, 286, 310],
          [130, 148, 163, 178, 193, 208, 223, 238, 253, 282, 312, 342, 372],
          [142, 163, 181, 199, 217, 235, 253, 271, 289, 323, 357, 391, 425],
          [154, 178, 199, 219, 239, 260, 280, 300, 320, 358, 396, 434, 472],
          [166, 193, 217, 239, 260, 283, 305, 328, 350, 393, 436, 479, 522],
          [178, 208, 235, 260, 283, 308, 333, 358, 383, 430, 477, 524, 571],
          [190, 223, 253, 280, 305, 333, 360, 388, 416, 468, 520, 572, 624],
          [202, 238, 271, 300, 328, 358, 388, 418, 448, 505, 562, 619, 676],
          [214, 253, 289, 320, 350, 383, 416, 448, 480, 543, 606, 669, 732],
          [238, 282, 323, 358, 393, 430, 468, 505, 543, 615, 687, 759, 831],
          [262, 312, 357, 396, 436, 477, 520, 562, 606, 688, 770, 852, 934],
          [286, 342, 391, 434, 479, 524, 572, 620, 669, 761, 853, 945, 1037],
          [310, 372, 425, 472, 522, 574, 628, 680, 732, 834, 936, 1038, 1140],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    gallery: [],
    swatches: [],
  },
  specs: {},
  restrictions: [],
  awards: [],
};

// ============================================================
// ONYX FAUX WOOD BLINDS
// ============================================================

const onyxFauxWood: Product = {
  id: 'onyx-faux-wood',
  slug: 'onyx-faux-wood',
  name: 'Onyx Faux Wood Blinds',
  brand: 'Onyx®',
  category: 'blinds',
  subcategory: 'faux-wood',
  tagline: 'The look of wood at a fraction of the price',
  description: 'Onyx Faux Wood Blinds offer the warmth and beauty of real wood with added moisture resistance — perfect for bathrooms, kitchens, and high-humidity spaces.',
  features: [
    'Moisture resistant composite slats',
    'Cordless lift standard',
    '2" and 2-1/2" slat options',
    'Wide color selection',
    'Custom sizes to 96" x 84"',
  ],
  benefits: [
    'Wood look at budget price',
    "Won't warp or crack in humidity",
    'Child safe cordless design',
    'Easy to clean',
  ],
  liftSystems: ['Cordless (standard)', 'Continuous Cord Loop'],
  motorization: { available: false },
  variants: [
    {
      id: 'onyx-fw-2',
      name: '2" Faux Wood Cordless',
      cellSize: '2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 96,
      maxHeight: 84,
      restrictions: ['Max 96"W x 84"H'],
      priceGrid: {
        widths: ONYX_WIDTHS,
        heights: ONYX_HEIGHTS,
        prices: [
          [68, 78, 88, 96, 105, 114, 122, 130, 138, 155, 172, 189, 206],
          [78, 90, 102, 112, 122, 132, 142, 152, 162, 182, 202, 222, 242],
          [88, 102, 115, 128, 140, 152, 164, 175, 187, 210, 233, 256, 279],
          [96, 112, 128, 140, 154, 168, 180, 193, 206, 232, 258, 284, 310],
          [105, 122, 140, 154, 169, 184, 198, 212, 226, 255, 284, 313, 342],
          [114, 132, 152, 168, 184, 200, 216, 232, 248, 280, 312, 344, 376],
          [122, 142, 164, 180, 198, 216, 234, 252, 270, 305, 340, 375, 410],
          [130, 152, 175, 193, 212, 232, 252, 272, 292, 330, 368, 406, 444],
          [138, 162, 187, 206, 226, 248, 270, 292, 314, 356, 398, 440, 482],
          [155, 182, 210, 232, 255, 280, 305, 330, 356, 404, 452, 500, 548],
          [172, 202, 233, 258, 284, 312, 340, 368, 398, 452, 506, 560, 614],
          [189, 222, 256, 284, 313, 344, 375, 406, 440, 500, 560, 620, 680],
          [206, 242, 279, 310, 342, 376, 410, 444, 482, 548, 614, 680, 746],
        ],
      },
    },
  ],
  imageUrls: { hero: '', gallery: [], swatches: [] },
  specs: {},
  restrictions: [],
  awards: [],
};

// ============================================================
// ONYX ROLLER SHADES
// ============================================================

const onyxRoller: Product = {
  id: 'onyx-roller',
  slug: 'onyx-roller',
  name: 'Onyx Roller Shades',
  brand: 'Onyx®',
  category: 'shades',
  subcategory: 'roller',
  tagline: 'Clean lines, clean price point',
  description: 'Onyx Roller Shades deliver minimalist style without the premium price. A wide range of solar screen and blackout fabrics provide flexible light control.',
  features: [
    'Solar screen and blackout fabrics',
    'Cassette valance standard',
    'Chain drive lift',
    'Custom sizes to 116" x 96"',
  ],
  benefits: [
    'Minimalist modern look',
    'Excellent UV block',
    'Budget-friendly',
    'Wide fabric selection',
  ],
  liftSystems: ['Chain Drive (standard)', 'Motorized'],
  motorization: { available: true },
  variants: [
    {
      id: 'onyx-roller-standard',
      name: 'Roller Shade Standard',
      cellSize: 'N/A',
      construction: 'Roller',
      liftSystem: 'Chain Drive',
      maxWidth: 116,
      maxHeight: 96,
      restrictions: ['Max 116"W x 96"H'],
      priceGrid: {
        widths: ONYX_WIDTHS,
        heights: ONYX_HEIGHTS,
        prices: [
          [58, 66, 74, 82, 90, 98, 106, 114, 122, 138, 154, 170, 186],
          [66, 76, 86, 96, 106, 116, 126, 136, 146, 165, 184, 203, 222],
          [74, 86, 97, 108, 119, 130, 141, 152, 163, 185, 207, 229, 251],
          [82, 96, 108, 120, 132, 144, 156, 168, 180, 205, 230, 255, 280],
          [90, 106, 119, 132, 145, 158, 171, 184, 197, 225, 253, 281, 309],
          [98, 116, 130, 144, 158, 172, 186, 200, 214, 245, 276, 307, 338],
          [106, 126, 141, 156, 171, 186, 201, 216, 231, 265, 299, 333, 367],
          [114, 136, 152, 168, 184, 200, 216, 232, 248, 285, 322, 359, 396],
          [122, 146, 163, 180, 197, 214, 231, 248, 265, 305, 345, 385, 425],
          [138, 165, 185, 205, 225, 245, 265, 285, 305, 350, 395, 440, 485],
          [154, 184, 207, 230, 253, 276, 299, 322, 345, 395, 445, 495, 545],
          [170, 203, 229, 255, 281, 307, 333, 359, 385, 440, 495, 550, 605],
          [186, 222, 251, 280, 309, 338, 367, 396, 425, 485, 545, 605, 665],
        ],
      },
    },
  ],
  imageUrls: { hero: '', gallery: [], swatches: [] },
  specs: {},
  restrictions: [],
  awards: [],
};

export { onyxHoneycomb, onyxFauxWood, onyxRoller };
