/**
 * Levolor 9/16" Cellular Shades
 * Placeholder pricing ~10-15% below Norman equivalents
 */
import type { Product, Surcharge } from './norman-catalog';

const CELLULAR_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 84, 96];
const CELLULAR_HEIGHTS = [36, 42, 48, 54, 60, 66, 72, 84, 96];

const LEVOLOR_CELLULAR_SURCHARGES: Surcharge[] = [
  { name: 'Top-Down/Bottom-Up', price: 75, type: 'flat', description: 'Raise from bottom or lower from top' },
  { name: 'Motorized Lift', price: 150, type: 'flat', description: 'Bluetooth-enabled motorized lift' },
  { name: 'Light Blocking Side Channels', price: 40, type: 'flat', description: 'Per shade' },
  { name: 'Hold Down Brackets', price: 22, type: 'flat', description: 'Per shade — for doors or tilt windows' },
];

export const levolorCellular: Product = {
  id: 'levolor-cellular',
  slug: 'levolor-cellular',
  name: 'Levolor 9/16" Cellular Shades',
  brand: 'Levolor',
  category: 'shades',
  subcategory: 'honeycomb',
  tagline: 'Classic cellular design for light control and energy savings',
  description: 'Levolor 9/16" Cellular Shades combine timeless honeycomb construction with modern cordless convenience. The cellular design traps air in distinct pockets, providing year-round insulation that helps reduce energy costs. Available in single cell light filtering, single cell room darkening, and double cell constructions with a wide palette of designer colors and textures.',
  features: [
    'Cordless lift system standard on all shades',
    'Top-Down/Bottom-Up option for flexible light and privacy control',
    'Motorized lift with Bluetooth control available',
    'Child-safe design — no exposed cords',
    'Energy-efficient cellular construction traps air for insulation',
    '9/16" cell size fits most standard windows',
    'Available in light filtering, room darkening, and double cell options',
    'Custom made to your exact window measurements',
  ],
  benefits: [
    'Energy savings — cellular pockets insulate against heat and cold',
    'Child and pet safe — cordless with no dangling cords',
    'UV protection — filters harmful rays while softening natural light',
    'Sound absorption — honeycomb cells help dampen outside noise',
    'Wide color selection — dozens of colors and textures to match any decor',
    'Easy installation — includes all mounting hardware',
  ],
  liftSystems: ['Cordless (standard)', 'Top-Down/Bottom-Up', 'Motorized'],
  motorization: {
    available: true,
    options: ['Bluetooth Motorized Lift'],
    surcharges: [
      { name: 'Bluetooth Motor', price: 150, type: 'flat', description: 'Bluetooth-enabled rechargeable motor' },
      { name: 'Remote Control', price: 35, type: 'flat', description: 'Handheld Bluetooth remote' },
    ],
  },
  surcharges: LEVOLOR_CELLULAR_SURCHARGES,
  variants: [
    {
      id: 'levolor-cellular-lf',
      name: 'Single Cell Light Filtering',
      cellSize: '9/16"',
      construction: 'Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Cordless max width 96"'],
      priceGrid: {
        widths: CELLULAR_WIDTHS,
        heights: CELLULAR_HEIGHTS,
        prices: [
          // 36h
          [180, 216, 233, 253, 271, 308, 372, 392, 432, 469, 536],
          // 42h
          [202, 230, 240, 266, 286, 328, 392, 414, 462, 493, 561],
          // 48h
          [211, 237, 248, 279, 312, 344, 413, 437, 488, 525, 592],
          // 54h
          [215, 244, 259, 290, 319, 360, 436, 463, 517, 561, 636],
          // 60h
          [226, 256, 271, 301, 351, 379, 463, 487, 547, 570, 639],
          // 66h
          [240, 278, 290, 314, 358, 394, 482, 508, 572, 616, 691],
          // 72h
          [246, 285, 297, 328, 374, 414, 504, 533, 602, 650, 736],
          // 84h
          [294, 342, 360, 399, 433, 508, 541, 576, 653, 720, 822],
          // 96h
          [311, 360, 384, 425, 463, 545, 586, 628, 706, 790, 889],
        ],
      },
    },
    {
      id: 'levolor-cellular-rd',
      name: 'Single Cell Room Darkening',
      cellSize: '9/16"',
      construction: 'Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Cordless max width 96"'],
      priceGrid: {
        widths: CELLULAR_WIDTHS,
        heights: CELLULAR_HEIGHTS,
        prices: [
          // 36h (~15% more than LF)
          [207, 248, 268, 291, 312, 354, 428, 451, 497, 539, 616],
          // 42h
          [232, 265, 276, 306, 329, 377, 451, 476, 531, 567, 645],
          // 48h
          [243, 273, 285, 321, 359, 396, 475, 503, 561, 604, 681],
          // 54h
          [247, 281, 298, 334, 367, 414, 501, 532, 595, 645, 731],
          // 60h
          [260, 294, 312, 346, 404, 436, 532, 560, 629, 656, 735],
          // 66h
          [276, 320, 334, 361, 412, 453, 554, 584, 658, 709, 795],
          // 72h
          [283, 328, 342, 377, 430, 476, 580, 613, 692, 748, 846],
          // 84h
          [338, 393, 414, 459, 498, 584, 622, 662, 751, 828, 945],
          // 96h
          [358, 414, 442, 489, 533, 627, 674, 722, 812, 909, 1022],
        ],
      },
    },
    {
      id: 'levolor-cellular-dc',
      name: 'Double Cell Light Filtering',
      cellSize: '9/16"',
      construction: 'Double Cell',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Cordless max width 96"'],
      priceGrid: {
        widths: CELLULAR_WIDTHS,
        heights: CELLULAR_HEIGHTS,
        prices: [
          // 36h (~20% more than LF)
          [216, 259, 280, 304, 325, 370, 446, 470, 518, 563, 643],
          // 42h
          [242, 276, 288, 319, 343, 394, 470, 497, 554, 592, 673],
          // 48h
          [253, 284, 298, 335, 374, 413, 496, 524, 586, 630, 710],
          // 54h
          [258, 293, 311, 348, 383, 432, 523, 556, 620, 673, 763],
          // 60h
          [271, 307, 325, 361, 421, 455, 556, 584, 656, 683, 767],
          // 66h
          [288, 334, 348, 377, 430, 473, 578, 610, 686, 739, 829],
          // 72h
          [295, 342, 357, 394, 449, 497, 605, 638, 722, 780, 883],
          // 84h
          [353, 410, 432, 479, 520, 610, 649, 691, 784, 864, 986],
          // 96h
          [373, 432, 461, 510, 556, 654, 703, 754, 847, 948, 1067],
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
    'Cell Size': '9/16"',
    'Construction': 'Single Cell, Double Cell',
    'Max Width': '96"',
    'Lift Systems': 'Cordless, Top-Down/Bottom-Up, Motorized',
    'Fabric Opacities': 'Light Filtering, Room Darkening',
    'Motorization': 'Bluetooth Motorized Lift',
    'Child Safety': 'Cordless — no exposed cords',
    'Energy Efficiency': 'Cellular honeycomb design traps air for insulation',
  },
  restrictions: [
    'Cordless max width 96"',
    'Motorized option adds to production lead time',
    'Oversize surcharge may apply for widths over 84"',
  ],
  awards: [],
};
