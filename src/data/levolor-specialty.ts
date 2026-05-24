/**
 * Levolor Banded Shades + Soft Vertical Blinds
 * Placeholder pricing ~10-15% below Norman equivalents
 */
import type { Product, Surcharge } from './norman-catalog';

const BANDED_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72];
const BANDED_HEIGHTS = [36, 42, 48, 54, 60, 66, 72];

const VERTICAL_WIDTHS = [48, 60, 72, 84, 96, 108, 120, 144, 168, 192];
const VERTICAL_HEIGHTS = [48, 60, 72, 84, 96, 108, 120];

const BANDED_SURCHARGES: Surcharge[] = [
  { name: 'Premium Fabric', price: 15, type: 'percent', description: '15% surcharge for premium fabric selections' },
];

const VERTICAL_SURCHARGES: Surcharge[] = [
  { name: 'Wand Upgrade (longer)', price: 25, type: 'flat', description: 'Extended wand for wider openings' },
];

export const levolorBanded: Product = {
  id: 'levolor-banded',
  slug: 'levolor-banded',
  name: 'Levolor Banded Shades',
  brand: 'Levolor',
  category: 'shades',
  subcategory: 'banded',
  tagline: 'Modern zebra-style shades with alternating sheer and opaque bands',
  description: 'Levolor Banded Shades feature a striking dual-layer design with alternating sheer and solid fabric bands that glide past each other to transition smoothly between filtered light and full privacy. The modern zebra-stripe effect adds a bold, contemporary accent to any room. Raise the shade for an unobstructed view or adjust the bands to dial in the exact level of light and privacy you want.',
  features: [
    'Cordless lift and adjustment',
    'Alternating sheer and opaque fabric bands',
    'Smooth transition between light filtering and privacy',
    'Modern zebra-stripe aesthetic',
    'Light filtering and room darkening options',
    'Slim cassette headrail',
    'Inside or outside mount',
  ],
  benefits: [
    'Versatile light control — from sheer to private in one shade',
    'Contemporary design makes a style statement',
    'Cordless for child and pet safety',
    'No separate sheer and blackout treatments needed',
    'Easy to operate with one hand',
    'Clean lines with slim cassette headrail',
  ],
  liftSystems: ['Cordless'],
  motorization: { available: false },
  surcharges: BANDED_SURCHARGES,
  variants: [
    {
      id: 'levolor-banded-lf',
      name: 'Light Filtering',
      cellSize: 'N/A',
      construction: 'Banded Fabric',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: BANDED_WIDTHS,
        heights: BANDED_HEIGHTS,
        prices: [
          [145, 170, 198, 230, 265, 305, 348, 396, 450],
          [162, 190, 222, 259, 298, 343, 392, 447, 508],
          [180, 212, 248, 290, 334, 384, 440, 502, 570],
          [200, 236, 276, 323, 372, 428, 490, 560, 620],
          [218, 258, 302, 354, 408, 470, 538, 590, 620],
          [232, 274, 322, 377, 435, 500, 560, 590, 620],
        ],
      },
    },
    {
      id: 'levolor-banded-rd',
      name: 'Room Darkening',
      cellSize: 'N/A',
      construction: 'Banded Fabric',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: [],
      priceGrid: {
        widths: BANDED_WIDTHS,
        heights: BANDED_HEIGHTS,
        prices: [
          [167, 196, 228, 265, 305, 351, 400, 455, 518],
          [186, 219, 255, 298, 343, 394, 451, 514, 584],
          [207, 244, 285, 334, 384, 442, 506, 577, 656],
          [230, 271, 317, 372, 428, 492, 564, 644, 713],
          [251, 297, 347, 407, 469, 541, 619, 679, 713],
          [267, 315, 370, 434, 500, 575, 644, 679, 713],
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
    'Max Width': '72"',
    'Construction': 'Dual-layer alternating sheer and opaque bands',
    'Opacities': 'Light Filtering, Room Darkening',
    'Headrail': 'Slim cassette',
    'Child Safety': 'Cordless operation',
  },
  restrictions: ['Max width 72"'],
  awards: [],
};

export const levolorSoftVertical: Product = {
  id: 'levolor-soft-vertical',
  slug: 'levolor-soft-vertical',
  name: 'Levolor Soft Vertical Blinds',
  brand: 'Levolor',
  category: 'blinds',
  subcategory: 'vertical',
  tagline: 'Elegant fabric vertical blinds for sliding doors and large windows',
  description: 'Levolor Soft Vertical Blinds replace stiff PVC verticals with graceful S-shaped fabric vanes that drape softly and move quietly. Designed for sliding glass doors, patio entries, and wide window expanses, they combine the full-coverage traversing function of a vertical blind with the refined look and feel of drapery. Choose light filtering for a gentle glow or room darkening for media rooms and bedrooms.',
  features: [
    'Wand traverse operation for smooth one-handed control',
    'S-shaped fabric vanes for a soft, drapery-like look',
    'Light filtering and room darkening options',
    'Designed for sliding doors and large windows',
    'Fabric vanes rotate for light and privacy control',
    'Split-draw or one-way draw configurations',
    'Contemporary headrail with returns',
    'Max width 192" for extra-wide openings',
  ],
  benefits: [
    'Elegant alternative to stiff PVC verticals',
    'Quiet, smooth traversing operation',
    'Soft fabric adds warmth and texture',
    'Covers the widest openings — up to 16 feet',
    'Light filtering or room darkening to suit any room',
    'Easy maintenance — spot clean or vacuum with brush attachment',
  ],
  liftSystems: ['Wand Traverse'],
  motorization: { available: false },
  surcharges: VERTICAL_SURCHARGES,
  variants: [
    {
      id: 'levolor-soft-vertical-lf',
      name: 'Light Filtering',
      cellSize: 'N/A',
      construction: 'S-Shaped Fabric Vane',
      liftSystem: 'Wand Traverse',
      maxWidth: 192,
      restrictions: [],
      priceGrid: {
        widths: VERTICAL_WIDTHS,
        heights: VERTICAL_HEIGHTS,
        prices: [
          [280, 320, 368, 420, 478, 540, 610, 750, 895, 1050],
          [310, 358, 412, 472, 538, 608, 686, 848, 1010, 1080],
          [342, 398, 460, 528, 602, 682, 770, 950, 1050, 1120],
          [378, 440, 510, 586, 670, 758, 856, 1010, 1100, 1160],
          [415, 485, 562, 648, 740, 838, 948, 1080, 1150, 1200],
          [448, 525, 610, 702, 804, 910, 1028, 1100, 1160, 1200],
          [470, 552, 642, 740, 848, 960, 1050, 1120, 1180, 1200],
        ],
      },
    },
    {
      id: 'levolor-soft-vertical-rd',
      name: 'Room Darkening',
      cellSize: 'N/A',
      construction: 'S-Shaped Fabric Vane',
      liftSystem: 'Wand Traverse',
      maxWidth: 192,
      restrictions: [],
      priceGrid: {
        widths: VERTICAL_WIDTHS,
        heights: VERTICAL_HEIGHTS,
        prices: [
          [322, 368, 423, 483, 550, 621, 702, 863, 1029, 1200],
          [357, 412, 474, 543, 619, 699, 789, 975, 1062, 1130],
          [393, 458, 529, 607, 692, 784, 886, 1093, 1130, 1180],
          [435, 506, 587, 674, 771, 872, 984, 1062, 1150, 1200],
          [477, 558, 646, 745, 851, 964, 1090, 1130, 1200, 1200],
          [515, 604, 702, 808, 925, 1047, 1082, 1150, 1200, 1200],
          [541, 635, 738, 851, 975, 1040, 1082, 1150, 1200, 1200],
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
    'Max Width': '192"',
    'Construction': 'S-shaped fabric vanes',
    'Opacities': 'Light Filtering, Room Darkening',
    'Operation': 'Wand traverse — split-draw or one-way',
    'Headrail': 'Contemporary with returns',
  },
  restrictions: ['Max width 192"'],
  awards: [],
};
