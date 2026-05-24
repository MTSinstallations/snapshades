/**
 * Levolor® Product Catalog — Trusted mainstream brand
 * Pricing: Competitive mid-market pricing
 * Structure mirrors Norman catalog for consistent UI
 */

import type { Product } from './norman-catalog';

// Levolor width grid (18-108")
const LEVOLOR_WIDTHS = [18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 54, 60, 66, 72, 78, 84, 96, 108];

// Levolor height grid (24-108")
const LEVOLOR_HEIGHTS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 108];

// ============================================================
// LEVOLOR CELLULAR SHADES
// ============================================================

const levolorHoneycomb: Product = {
  id: 'levolor-cellular',
  slug: 'levolor-cellular',
  name: 'Levolor Cellular Shades',
  brand: 'Levolor®',
  category: 'shades',
  subcategory: 'honeycomb',
  tagline: 'Trusted brand with proven cellular performance',
  description: 'Levolor Cellular Shades offer excellent insulation and light control backed by a name contractors and homeowners have trusted for decades. Available in a wide range of colors and opacities.',
  features: [
    'Single and double cell construction',
    'Cordless and motorization options',
    'Top-Down/Bottom-Up available',
    'Cell sizes: 1/2", 3/4", 1-1/4"',
    'Light filtering to blackout options',
    'Custom sizes to 108" x 108"',
  ],
  benefits: [
    'Established trusted brand',
    'Excellent insulation values',
    'Wide availability through distribution',
    'Good color selection',
  ],
  liftSystems: ['Cordless (standard)', 'Continuous Cord Loop', 'Top-Down/Bottom-Up', 'Motorized'],
  motorization: { available: true },
  variants: [
    {
      id: 'levolor-honeycomb-single',
      name: '1/2" Single Cell Cordless',
      cellSize: '1/2"',
      construction: 'Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 108,
      restrictions: ['Max 108" width'],
      priceGrid: {
        widths: LEVOLOR_WIDTHS,
        heights: LEVOLOR_HEIGHTS,
        prices: [
          [120, 135, 148, 162, 175, 188, 200, 215, 230, 248, 265, 285, 305, 330, 360, 390, 420, 460, 510],
          [135, 152, 168, 184, 199, 214, 228, 246, 264, 285, 305, 330, 355, 385, 420, 455, 490, 538, 595],
          [148, 168, 185, 204, 221, 238, 254, 275, 296, 320, 343, 372, 400, 435, 475, 515, 555, 610, 675],
          [162, 184, 204, 224, 244, 264, 282, 305, 328, 355, 382, 414, 445, 485, 530, 575, 620, 682, 755],
          [175, 199, 221, 244, 266, 288, 308, 334, 360, 390, 420, 456, 490, 535, 585, 635, 685, 754, 835],
          [188, 214, 238, 264, 288, 312, 334, 362, 390, 423, 456, 495, 532, 582, 637, 692, 747, 823, 912],
          [200, 228, 254, 282, 308, 334, 358, 388, 418, 454, 490, 532, 572, 627, 687, 747, 807, 890, 987],
          [215, 246, 275, 305, 334, 362, 388, 420, 452, 491, 530, 576, 620, 680, 745, 810, 875, 965, 1070],
          [230, 264, 296, 328, 360, 390, 418, 452, 486, 528, 570, 620, 668, 733, 803, 873, 943, 1040, 1153],
          [248, 285, 320, 355, 390, 423, 454, 491, 528, 575, 622, 678, 730, 803, 880, 957, 1034, 1142, 1268],
          [265, 305, 343, 382, 420, 456, 490, 530, 570, 622, 674, 734, 792, 873, 957, 1041, 1125, 1244, 1382],
          [285, 330, 372, 414, 456, 495, 532, 576, 620, 678, 734, 800, 862, 950, 1042, 1134, 1226, 1358, 1508],
          [305, 355, 400, 445, 490, 532, 572, 620, 668, 730, 792, 862, 930, 1027, 1127, 1227, 1327, 1472, 1635],
          [330, 385, 435, 485, 535, 582, 627, 680, 733, 803, 873, 950, 1027, 1135, 1245, 1355, 1465, 1628, 1808],
          [360, 420, 475, 530, 585, 637, 687, 745, 803, 880, 957, 1042, 1125, 1245, 1367, 1489, 1611, 1790, 1989],
          [390, 455, 515, 575, 635, 692, 747, 810, 873, 957, 1041, 1134, 1227, 1355, 1489, 1623, 1757, 1952, 2170],
          [420, 490, 555, 620, 685, 747, 807, 875, 943, 1034, 1125, 1226, 1327, 1465, 1611, 1757, 1903, 2114, 2351],
          [460, 538, 610, 682, 754, 823, 890, 965, 1040, 1142, 1244, 1358, 1472, 1628, 1790, 1952, 2114, 2351, 2618],
          [510, 595, 675, 755, 835, 912, 987, 1070, 1153, 1268, 1382, 1508, 1635, 1808, 1989, 2170, 2351, 2618, 2915],
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
// LEVOLOR FAUX WOOD BLINDS
// ============================================================

const levolorFauxWood: Product = {
  id: 'levolor-faux-wood',
  slug: 'levolor-faux-wood',
  name: 'Levolor Faux Wood Blinds',
  brand: 'Levolor®',
  category: 'blinds',
  subcategory: 'faux-wood',
  tagline: 'Durable and stylish, backed by Levolor quality',
  description: 'Levolor Faux Wood Blinds combine the look of real wood with the durability of composite materials. Perfect for bathrooms, kitchens, and any room where moisture is a concern.',
  features: [
    'Moisture resistant composite',
    '2" and 2-1/2" slat options',
    'Cordless standard',
    'Decorative tape options',
    'Custom sizes to 96" x 84"',
  ],
  benefits: [
    'Trusted Levolor brand',
    'Moisture resistant',
    'Child safe cordless',
    'UV resistant',
  ],
  liftSystems: ['Cordless (standard)', 'Continuous Cord Loop'],
  motorization: { available: false },
  variants: [
    {
      id: 'levolor-fw-2',
      name: '2" Faux Wood Cordless',
      cellSize: '2"',
      construction: 'Faux Wood',
      liftSystem: 'Cordless',
      maxWidth: 96,
      maxHeight: 84,
      restrictions: ['Max 96"W x 84"H'],
      priceGrid: {
        widths: LEVOLOR_WIDTHS,
        heights: LEVOLOR_HEIGHTS,
        prices: [
          [72, 82, 92, 102, 112, 122, 130, 140, 150, 162, 174, 188, 202, 220, 242, 264, 286, 316, 350],
          [82, 94, 106, 118, 130, 142, 152, 164, 176, 190, 204, 220, 236, 258, 284, 310, 336, 372, 412],
          [92, 106, 120, 134, 148, 162, 174, 188, 202, 218, 234, 252, 270, 296, 326, 356, 386, 428, 474],
          [102, 118, 134, 150, 166, 182, 195, 210, 225, 244, 262, 282, 302, 332, 366, 400, 434, 482, 534],
          [112, 130, 148, 166, 184, 202, 217, 234, 251, 272, 293, 315, 338, 372, 410, 448, 486, 540, 598],
          [122, 142, 162, 182, 202, 222, 238, 257, 276, 299, 322, 346, 370, 408, 450, 492, 534, 594, 658],
          [130, 152, 174, 195, 217, 238, 256, 277, 298, 323, 348, 374, 400, 442, 488, 534, 580, 646, 716],
          [140, 164, 188, 210, 234, 257, 276, 299, 322, 349, 376, 404, 432, 478, 528, 578, 628, 700, 776],
          [150, 176, 202, 225, 251, 276, 298, 322, 346, 376, 406, 436, 466, 516, 570, 624, 678, 756, 838],
          [162, 190, 218, 244, 272, 299, 323, 349, 376, 409, 442, 475, 508, 564, 624, 684, 744, 830, 922],
          [174, 204, 234, 262, 293, 322, 348, 376, 406, 442, 478, 514, 550, 612, 678, 744, 810, 904, 1004],
          [188, 220, 252, 282, 315, 346, 374, 404, 436, 475, 514, 553, 592, 660, 732, 804, 876, 978, 1088],
          [202, 236, 270, 302, 338, 370, 400, 432, 466, 508, 550, 592, 634, 708, 786, 864, 942, 1052, 1170],
          [220, 258, 296, 332, 372, 408, 442, 478, 516, 564, 612, 660, 708, 792, 880, 968, 1056, 1182, 1316],
          [242, 284, 326, 366, 410, 450, 488, 528, 570, 624, 678, 732, 786, 880, 980, 1080, 1180, 1322, 1472],
          [264, 310, 356, 400, 448, 492, 534, 578, 624, 684, 744, 804, 864, 968, 1080, 1192, 1304, 1462, 1628],
          [286, 336, 386, 434, 486, 534, 580, 628, 678, 744, 810, 876, 942, 1056, 1180, 1304, 1428, 1602, 1784],
          [316, 372, 428, 482, 540, 594, 646, 700, 756, 830, 904, 978, 1052, 1182, 1322, 1462, 1602, 1802, 2008],
          [350, 412, 474, 534, 598, 658, 716, 776, 838, 922, 1006, 1090, 1174, 1318, 1474, 1630, 1786, 2010, 2240],
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
// LEVOLOR ROLLER SHADES
// ============================================================

const levolorRoller: Product = {
  id: 'levolor-roller',
  slug: 'levolor-roller',
  name: 'Levolor Roller Shades',
  brand: 'Levolor®',
  category: 'shades',
  subcategory: 'roller',
  tagline: 'Simple, stylish, and backed by a name you trust',
  description: 'Levolor Roller Shades provide clean, modern window coverage with a wide selection of fabrics from solar screen to full blackout. Reliable performance at a competitive price.',
  features: [
    'Solar screen, light filtering, and blackout fabrics',
    'Cassette valance included',
    'Chain drive or motorization',
    'Custom sizes to 108" x 108"',
  ],
  benefits: [
    'Trusted brand availability',
    'Wide fabric selection',
    'Clean modern lines',
    'Good UV protection',
  ],
  liftSystems: ['Chain Drive (standard)', 'Motorized'],
  motorization: { available: true },
  variants: [
    {
      id: 'levolor-roller-standard',
      name: 'Roller Shade Standard',
      cellSize: 'N/A',
      construction: 'Roller',
      liftSystem: 'Chain Drive',
      maxWidth: 108,
      maxHeight: 108,
      restrictions: ['Max 108"W x 108"H'],
      priceGrid: {
        widths: LEVOLOR_WIDTHS,
        heights: LEVOLOR_HEIGHTS,
        prices: [
          [65, 74, 83, 92, 101, 110, 118, 128, 138, 150, 162, 176, 190, 208, 230, 252, 274, 304, 340],
          [74, 85, 96, 107, 118, 129, 140, 152, 164, 178, 192, 208, 224, 246, 272, 298, 324, 360, 402],
          [83, 96, 108, 120, 133, 146, 158, 172, 186, 202, 218, 236, 254, 280, 310, 340, 370, 412, 460],
          [92, 107, 120, 135, 150, 165, 178, 194, 210, 228, 246, 266, 286, 316, 350, 384, 418, 466, 520],
          [101, 118, 133, 150, 166, 182, 197, 215, 232, 252, 272, 294, 316, 350, 388, 426, 464, 518, 578],
          [110, 129, 146, 165, 182, 200, 216, 236, 256, 278, 300, 324, 348, 386, 428, 470, 512, 572, 638],
          [118, 140, 158, 178, 197, 216, 234, 255, 276, 300, 324, 350, 376, 418, 464, 510, 556, 622, 694],
          [128, 152, 172, 194, 215, 236, 255, 278, 300, 326, 352, 380, 408, 454, 504, 554, 604, 676, 754],
          [138, 164, 186, 210, 232, 256, 276, 300, 324, 352, 380, 410, 440, 490, 544, 598, 652, 730, 814],
          [150, 178, 202, 228, 252, 278, 300, 326, 352, 384, 416, 448, 480, 536, 596, 656, 716, 802, 894],
          [162, 192, 218, 246, 272, 300, 324, 352, 380, 414, 448, 482, 516, 578, 644, 710, 776, 870, 970],
          [176, 208, 236, 266, 294, 324, 350, 380, 410, 448, 486, 524, 562, 630, 702, 774, 846, 948, 1058],
          [190, 224, 254, 286, 316, 348, 376, 408, 440, 480, 520, 560, 600, 674, 752, 830, 908, 1020, 1140],
          [208, 246, 280, 316, 350, 386, 418, 454, 490, 536, 582, 630, 678, 762, 850, 938, 1026, 1154, 1290],
          [230, 272, 310, 350, 388, 428, 464, 504, 544, 596, 648, 702, 756, 852, 952, 1052, 1152, 1296, 1450],
          [252, 298, 340, 384, 426, 470, 510, 554, 598, 656, 714, 774, 834, 940, 1050, 1160, 1270, 1432, 1602],
          [274, 324, 370, 418, 464, 512, 556, 604, 652, 716, 780, 846, 912, 1028, 1150, 1272, 1394, 1572, 1760],
          [304, 360, 412, 466, 518, 572, 622, 676, 730, 802, 874, 948, 1022, 1154, 1294, 1434, 1574, 1778, 1992],
          [340, 402, 460, 520, 578, 638, 694, 754, 814, 894, 974, 1058, 1142, 1290, 1446, 1602, 1758, 1984, 2224],
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
// LEVOLOR VERTICAL BLINDS
// ============================================================

const levolorVertical: Product = {
  id: 'levolor-vertical',
  slug: 'levolor-vertical',
  name: 'Levolor Vertical Blinds',
  brand: 'Levolor®',
  category: 'blinds',
  subcategory: 'vertical',
  tagline: 'Perfect for large windows and sliding doors',
  description: 'Levolor Vertical Blinds are the ideal solution for patio doors, wide windows, and glass walls. Available in fabric, vinyl, and aluminum vanes.',
  features: [
    'Fabric, vinyl, and aluminum vane options',
    'Light control from sheer to blackout',
    'Chain drive valance',
    'Custom sizes to 216" wide',
  ],
  benefits: [
    'Best for large openings',
    'Excellent light control',
    'Good privacy options',
    'Durable and easy to clean',
  ],
  liftSystems: ['Chain Drive (standard)'],
  motorization: { available: false },
  variants: [
    {
      id: 'levolor-vertical-vinyl',
      name: 'Vinyl Vertical Blind',
      cellSize: '3-1/2"',
      construction: 'Vertical',
      liftSystem: 'Chain Drive',
      maxWidth: 216,
      maxHeight: 120,
      restrictions: ['Max 216"W x 120"H'],
      priceGrid: {
        widths: [36, 48, 60, 72, 84, 96, 108, 120, 144, 168, 192, 216],
        heights: [36, 48, 60, 72, 84, 96, 108, 120],
        prices: [
          [145, 178, 212, 245, 278, 310, 345, 380, 448, 520, 592, 665],
          [178, 220, 262, 304, 345, 388, 432, 476, 562, 652, 742, 832],
          [212, 262, 312, 362, 412, 462, 515, 568, 672, 780, 888, 996],
          [245, 304, 362, 420, 478, 538, 598, 658, 778, 904, 1030, 1156],
          [278, 345, 412, 478, 545, 612, 682, 752, 888, 1032, 1176, 1320],
          [310, 388, 462, 538, 612, 688, 768, 848, 1002, 1165, 1328, 1492],
          [345, 432, 515, 598, 682, 768, 855, 942, 1115, 1298, 1480, 1665],
          [380, 476, 568, 658, 752, 848, 942, 1038, 1230, 1432, 1635, 1838],
        ],
      },
    },
  ],
  imageUrls: { hero: '', gallery: [], swatches: [] },
  specs: {},
  restrictions: [],
  awards: [],
};

export { levolorHoneycomb, levolorFauxWood, levolorRoller, levolorVertical };
