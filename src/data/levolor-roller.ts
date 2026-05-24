/**
 * Levolor Roller Shades
 * Placeholder pricing ~10-15% below Norman equivalents
 */
import type { Product, Surcharge } from './norman-catalog';

const ROLLER_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 84, 96];
const ROLLER_HEIGHTS = [36, 42, 48, 54, 60, 66, 72, 84, 96];

const LEVOLOR_ROLLER_SURCHARGES: Surcharge[] = [
  { name: 'Cassette Headrail', price: 30, type: 'flat', description: 'Decorative cassette cover for the roller tube' },
  { name: 'Motorized Lift', price: 140, type: 'flat', description: 'Battery-powered motorized lift' },
  { name: 'Continuous Loop Upgrade', price: 0, type: 'flat', description: 'Chain/bead loop lift — included at no charge' },
  { name: 'Hold Down Brackets', price: 18, type: 'flat', description: 'Per shade — for doors or tilt windows' },
];

export const levolorRoller: Product = {
  id: 'levolor-roller',
  slug: 'levolor-roller',
  name: 'Levolor Roller Shades',
  brand: 'Levolor',
  category: 'shades',
  subcategory: 'roller',
  tagline: 'Clean, modern roller shades in a wide range of fabrics and opacities',
  description: 'Levolor Roller Shades offer a sleek, streamlined look that works with any interior style. Choose from light filtering fabrics that gently diffuse sunlight, room darkening options for bedrooms and media rooms, or solar screen materials that reduce glare while preserving your view. The cordless spring mechanism provides smooth, quiet operation with no cords to tangle or pose a safety risk.',
  features: [
    'Cordless spring lift for smooth, quiet operation',
    'Optional cassette headrail for a finished look',
    'Continuous loop chain available for larger shades',
    'Motorized lift option with battery power',
    'Multiple fabric opacities — light filtering, room darkening, solar screen',
    'Reverse roll option to position fabric closer to the glass',
    'Standard and cassette mounting options included',
    'Custom widths and heights to fit any window',
  ],
  benefits: [
    'Modern aesthetic — minimal profile complements contemporary interiors',
    'Glare reduction — solar screen fabrics cut glare without blocking the view',
    'UV protection — all fabrics block a significant portion of UV rays',
    'Child safe — cordless spring lift with no exposed cords',
    'Easy care — dust with a soft cloth or vacuum with brush attachment',
    'Versatile — works for windows, patio doors, and specialty applications',
  ],
  liftSystems: ['Cordless Spring', 'Continuous Loop', 'Motorized'],
  motorization: {
    available: true,
    options: ['Battery-Powered Motorized Lift'],
    surcharges: [
      { name: 'Battery Motor', price: 140, type: 'flat', description: 'Rechargeable battery motor with remote' },
      { name: 'Additional Remote', price: 30, type: 'flat', description: 'Extra handheld remote control' },
    ],
  },
  surcharges: LEVOLOR_ROLLER_SURCHARGES,
  variants: [
    {
      id: 'levolor-roller-lf',
      name: 'Light Filtering',
      cellSize: 'N/A',
      construction: 'Fabric Roller',
      liftSystem: 'Cordless Spring',
      maxWidth: 96,
      restrictions: [],
      priceGrid: {
        widths: ROLLER_WIDTHS,
        heights: ROLLER_HEIGHTS,
        prices: [
          // 36h
          [120, 140, 155, 168, 182, 198, 218, 238, 260, 310, 370],
          // 42h
          [132, 154, 170, 185, 200, 218, 240, 262, 286, 341, 407],
          // 48h
          [144, 168, 186, 202, 220, 240, 264, 288, 314, 374, 446],
          // 54h
          [158, 184, 204, 222, 242, 264, 290, 316, 344, 410, 490],
          // 60h
          [172, 200, 222, 242, 264, 288, 316, 344, 376, 448, 534],
          // 66h
          [186, 216, 240, 262, 286, 312, 342, 374, 408, 486, 580],
          // 72h
          [200, 234, 260, 284, 310, 338, 372, 406, 442, 528, 630],
          // 84h
          [230, 268, 298, 326, 356, 388, 426, 466, 508, 606, 722],
          // 96h
          [262, 306, 340, 372, 406, 442, 486, 532, 580, 692, 824],
        ],
      },
    },
    {
      id: 'levolor-roller-rd',
      name: 'Room Darkening',
      cellSize: 'N/A',
      construction: 'Fabric Roller',
      liftSystem: 'Cordless Spring',
      maxWidth: 96,
      restrictions: [],
      priceGrid: {
        widths: ROLLER_WIDTHS,
        heights: ROLLER_HEIGHTS,
        prices: [
          // 36h (~10% more than LF)
          [132, 154, 171, 185, 200, 218, 240, 262, 286, 341, 407],
          // 42h
          [145, 169, 187, 204, 220, 240, 264, 288, 315, 375, 448],
          // 48h
          [158, 185, 205, 222, 242, 264, 290, 317, 345, 411, 491],
          // 54h
          [174, 202, 224, 244, 266, 290, 319, 348, 378, 451, 539],
          // 60h
          [189, 220, 244, 266, 290, 317, 348, 378, 414, 493, 587],
          // 66h
          [205, 238, 264, 288, 315, 343, 376, 411, 449, 535, 638],
          // 72h
          [220, 257, 286, 312, 341, 372, 409, 447, 486, 581, 693],
          // 84h
          [253, 295, 328, 359, 392, 427, 469, 513, 559, 667, 794],
          // 96h
          [288, 337, 374, 409, 447, 486, 535, 585, 638, 761, 906],
        ],
      },
    },
    {
      id: 'levolor-roller-solar',
      name: 'Solar Screen',
      cellSize: 'N/A',
      construction: 'Solar Screen',
      liftSystem: 'Cordless Spring',
      maxWidth: 96,
      restrictions: [],
      priceGrid: {
        widths: ROLLER_WIDTHS,
        heights: ROLLER_HEIGHTS,
        prices: [
          // 36h (~5% more than LF)
          [126, 147, 163, 176, 191, 208, 229, 250, 273, 326, 389],
          // 42h
          [139, 162, 179, 194, 210, 229, 252, 275, 300, 358, 427],
          // 48h
          [151, 176, 195, 212, 231, 252, 277, 302, 330, 393, 468],
          // 54h
          [166, 193, 214, 233, 254, 277, 305, 332, 361, 431, 515],
          // 60h
          [181, 210, 233, 254, 277, 302, 332, 361, 395, 470, 561],
          // 66h
          [195, 227, 252, 275, 300, 328, 359, 393, 428, 510, 609],
          // 72h
          [210, 246, 273, 298, 326, 355, 391, 426, 464, 554, 662],
          // 84h
          [242, 281, 313, 342, 374, 407, 447, 489, 533, 636, 758],
          // 96h
          [275, 321, 357, 391, 426, 464, 510, 559, 609, 727, 865],
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
    'Collections': 'Light Filtering, Room Darkening, Solar Screen',
    'Max Width': '96"',
    'Lift Systems': 'Cordless Spring, Continuous Loop, Motorized',
    'Motorization': 'Battery-powered with remote control',
    'Child Safety': 'Cordless — no exposed cords',
    'Headrail Options': 'Standard open roll, cassette headrail',
    'Roll Position': 'Standard roll or reverse roll',
  },
  restrictions: [
    'Cordless spring max width 96"',
    'Continuous loop recommended for shades wider than 72"',
    'Motorized option adds to production lead time',
  ],
  awards: [],
};
