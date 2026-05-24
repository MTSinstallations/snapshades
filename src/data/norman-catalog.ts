/**
 * Norman® 2026 Product Catalog
 * Source: 2026 March Retail Price Guide (40 pages)
 * Pricing: Retail × 0.30 (dealer cost) × 1.20 (20% markup) = customer price
 * Formula: customerPrice = retailPrice * 0.36
 */

// ============================================================
// TYPES
// ============================================================

export interface PriceGrid {
  widths: number[];    // column headers (inches)
  heights: number[];   // row headers (inches)
  prices: number[][];  // [heightIdx][widthIdx] = retail price
}

export interface Surcharge {
  name: string;
  price: number;       // retail price (apply same 0.36 multiplier)
  type: 'flat' | 'percent';
  description?: string;
}

export interface FabricGroup {
  groupNumber: number;
  name: string;
  fabrics: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  cellSize: string;        // e.g., "9/16\"", "3/8\"", "2\""
  construction: string;    // e.g., "Single Cell", "Double Cell"
  liftSystem: string;      // e.g., "Cordless"
  priceGrid: PriceGrid;
  fabricGroups?: FabricGroup[];
  maxWidth: number;        // inches
  maxHeight?: number;      // inches
  restrictions: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: 'shades' | 'blinds' | 'shutters';
  subcategory: string;
  tagline: string;
  description: string;
  features: string[];
  benefits: string[];
  liftSystems: string[];
  motorization: {
    available: boolean;
    options?: string[];
    surcharges?: Surcharge[];
  };
  surcharges: Surcharge[];
  variants: ProductVariant[];
  imageUrls: {
    hero: string;
    gallery: string[];
    swatches: string[];
  };
  specs: Record<string, string>;
  restrictions: string[];
  awards: string[];
}

// ============================================================
// SHARED SURCHARGES
// ============================================================

export const HONEYCOMB_LIFT_SURCHARGES: Surcharge[] = [
  { name: 'Continuous Cord Loop', price: 73, type: 'flat', description: 'Traditional cord loop lift' },
  { name: 'SmartRelease™', price: 89, type: 'flat', description: 'Easy-release lift system' },
  { name: 'Top-Down/Bottom-Up', price: 89, type: 'flat', description: 'Raise from bottom or lower from top' },
  { name: 'Top-Down Only', price: 89, type: 'flat', description: 'Lower from the top only' },
];

export const HONEYCOMB_SMARTFIT_SURCHARGES: Surcharge[] = [
  { name: 'SmartFit®', price: 89, type: 'flat', description: 'Perfect fit frame system' },
  { name: 'SmartFit® with Frame', price: 293, type: 'flat', description: 'SmartFit with decorative frame' },
  { name: 'SmartFit® Dual Shade', price: 178, type: 'flat', description: 'Dual shade SmartFit (price as 2 shades)' },
  { name: 'SmartFit® Dual Shade with Frame', price: 382, type: 'flat', description: 'Dual shade SmartFit with frame' },
];

export const HONEYCOMB_MISC_SURCHARGES: Surcharge[] = [
  { name: 'Shim', price: 7, type: 'flat', description: 'Spacing shim (each)' },
  { name: 'Side Mount Bracket', price: 23, type: 'flat', description: 'Per shade' },
  { name: 'Light Guard / Pole Attachment', price: 45, type: 'flat', description: 'Light blocking side channels or pole' },
  { name: 'Magnetic Hold Down', price: 28, type: 'flat', description: 'Per shade' },
  { name: 'Cut-out / Cordless Operating Pole', price: 89, type: 'flat', description: 'For special installations' },
  { name: 'Specialty Shapes', price: 117, type: 'flat', description: 'Arches, angles, etc.' },
];

export const HONEYCOMB_FABRIC_SURCHARGES: Surcharge[] = [
  { name: 'Room Darkening', price: 20, type: 'percent', description: '20% surcharge on single shade price' },
  { name: 'Sheer Fabric', price: 20, type: 'percent', description: '20% surcharge on single shade price' },
  { name: 'Solus Fabric', price: 20, type: 'percent', description: '20% surcharge on single shade price' },
  { name: 'FR Essentials', price: 20, type: 'percent', description: '20% surcharge on single shade price' },
];

export const MOTORIZATION_SURCHARGES: Surcharge[] = [
  { name: 'AutoWand™ Motorization', price: 166, type: 'flat', description: 'Rechargeable battery with charging wand' },
  { name: 'AutoWand™ Charging Kit', price: 45, type: 'flat', description: 'Extra charging wand' },
  { name: 'Norman® Smart Motorization', price: 482, type: 'flat', description: 'WiFi-enabled, voice control compatible' },
  { name: 'Smart Motorization Bridge', price: 161, type: 'flat', description: 'Required for smart home integration' },
];

export const FREIGHT_CHARGES: Surcharge[] = [
  { name: 'Blinds & Shades - 1st Unit', price: 25, type: 'flat' },
  { name: 'Blinds & Shades - Each Additional', price: 11, type: 'flat' },
  { name: 'Oversize (90"+ width) - 1st Unit', price: 80, type: 'flat' },
  { name: 'Oversize - Each Additional', price: 50, type: 'flat' },
];

// ============================================================
// PRODUCT 1: PORTRAIT™ HONEYCOMB SHADES
// ============================================================

const HONEYCOMB_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 84, 96, 108, 120];
const HONEYCOMB_HEIGHTS = [36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 108, 120, 144];

export const portraitHoneycomb: Product = {
  id: 'portrait-honeycomb',
  slug: 'portrait-honeycomb-shades',
  name: 'Portrait™ Honeycomb Shades',
  brand: 'Norman®',
  category: 'shades',
  subcategory: 'honeycomb',
  tagline: 'Advanced cellular technology for extra insulation and energy efficiency',
  description: 'With rich materials and an even richer history, Portrait Honeycomb Shades feature award-winning designs, exclusive options and industry-leading construction. Advanced cellular honeycomb technology provides extra insulation and home energy efficiency. Stylish and streamlined — made for every window.',
  features: [
    'PrecisionLift™ cordless technology — one-touch lift for quick, accurate control',
    'SmartRise™ cordless — reliable self-leveling, Best for Kids certified',
    'Top-Down/Bottom-Up option for versatile light control',
    'SmartFit® system for perfect window fit',
    'SmartFit® Dual Shade — day and night shade combination',
    'Multiple cell sizes: 9/16", 3/8", 1/2", 3/4", 1-1/4"',
    'Single and double cell construction',
    'Motorization available (AutoWand™ and Smart)',
    'Specialty shapes available (arches, angles)',
    'Light Guard side channels for extra light blocking',
  ],
  benefits: [
    'Energy efficient — cellular design traps air for insulation',
    'Child safe — cordless and Best for Kids certified',
    'UV protection — blocks harmful rays while filtering light',
    'Noise reduction — honeycomb cells absorb sound',
    'Wide range of opacities — sheer to room darkening',
    'Custom made to fit your exact window dimensions',
  ],
  liftSystems: ['Cordless (standard)', 'Continuous Cord Loop', 'SmartRelease™', 'Top-Down/Bottom-Up', 'Motorized'],
  motorization: {
    available: true,
    options: ['AutoWand™ Rechargeable Battery', 'Smart Motorization (WiFi/Voice)'],
    surcharges: MOTORIZATION_SURCHARGES,
  },
  surcharges: [
    ...HONEYCOMB_LIFT_SURCHARGES,
    ...HONEYCOMB_SMARTFIT_SURCHARGES,
    ...HONEYCOMB_MISC_SURCHARGES,
    ...HONEYCOMB_FABRIC_SURCHARGES,
  ],
  variants: [
    {
      id: 'honeycomb-916-single',
      name: '9/16" Cordless Single Cell',
      cellSize: '9/16"',
      construction: 'Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 96,
      restrictions: ['Cordless max width 96"'],
      priceGrid: {
        widths: HONEYCOMB_WIDTHS,
        heights: HONEYCOMB_HEIGHTS,
        prices: [
          [212,254,274,297,318,362,437,460,508,551,630,711,791],
          [238,270,282,312,336,385,460,486,543,579,659,737,814],
          [248,278,291,328,366,404,485,513,573,616,695,771,849],
          [252,286,304,340,374,423,512,543,607,659,747,837,923],
          [266,301,318,353,412,445,543,572,642,669,750,862,918],
          [282,326,340,368,420,463,566,596,671,723,811,898,988],
          [289,335,349,385,439,486,592,625,707,763,864,966,1067],
          [338,387,412,449,490,573,611,650,730,805,923,1043,1161],
          [345,401,423,468,508,596,635,676,766,845,965,1081,1198],
          [353,412,439,484,525,618,661,707,797,888,1002,1120,1235],
          [365,423,451,499,544,640,688,737,829,927,1043,1157,1274],
          [401,471,508,565,618,730,791,843,956,1011,1122,1233,1347],
          [439,520,565,625,692,823,887,952,1083,1173,1281,1388,1494],
          [519,622,674,748,838,1007,1080,1173,1264,1389,1500,1694,1790],
        ],
      },
    },
    {
      id: 'honeycomb-38-single',
      name: '3/8" Cordless Single & 3/4" Single',
      cellSize: '3/8" / 3/4"',
      construction: 'Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 108,
      restrictions: ['3/4" single cordless max width 108"', '3/8" single max width 96"'],
      priceGrid: {
        widths: HONEYCOMB_WIDTHS,
        heights: HONEYCOMB_HEIGHTS,
        prices: [
          [270,336,351,387,418,448,472,569,600,666,727,868,1153],
          [311,347,367,404,437,471,501,601,635,705,770,924,1227],
          [319,359,382,424,484,497,527,634,672,747,821,981,1301],
          [334,373,398,443,500,522,552,669,707,791,868,1035,1365],
          [342,394,415,465,527,546,577,705,744,843,920,1097,1446],
          [367,423,443,482,532,566,605,739,779,872,968,1148,1515],
          [376,434,456,502,543,595,635,770,820,925,1017,1206,1593],
          [438,504,537,590,639,699,747,800,850,956,1061,1258,1657],
          [449,523,554,608,666,727,779,830,888,999,1108,1316,1727],
          [465,537,573,629,688,752,810,866,924,1042,1155,1369,1797],
          [474,552,592,650,713,780,841,897,960,1082,1204,1425,1873],
          [507,596,639,705,778,850,919,987,1057,1195,1331,1576,2066],
          [543,636,688,764,842,922,999,1074,1149,1312,1459,1726,2256],
          [572,676,749,820,904,997,1079,1162,1249,1422,1652,1874,2450],
        ],
      },
    },
    {
      id: 'honeycomb-12-double',
      name: '1/2" Cordless Double Cell',
      cellSize: '1/2"',
      construction: 'Double Cell',
      liftSystem: 'Cordless',
      maxWidth: 108,
      restrictions: ['Cordless max width 108"'],
      priceGrid: {
        widths: HONEYCOMB_WIDTHS,
        heights: HONEYCOMB_HEIGHTS,
        prices: [
          [281,347,364,402,433,464,490,592,623,690,752,900,1195],
          [323,359,382,420,453,487,520,624,659,733,800,960,1275],
          [333,373,397,440,501,515,545,658,698,775,852,1018,1352],
          [346,388,411,460,519,541,573,695,736,818,900,1073,1417],
          [356,407,430,483,545,567,601,733,772,874,955,1139,1500],
          [382,439,460,499,549,587,628,767,810,904,1004,1192,1572],
          [390,450,472,522,563,616,659,800,849,963,1055,1253,1652],
          [454,526,558,609,665,725,775,830,882,992,1100,1309,1722],
          [465,542,574,630,690,752,810,863,921,1037,1149,1365,1795],
          [483,558,595,652,712,780,840,898,960,1081,1200,1422,1867],
          [493,573,613,674,739,811,871,933,998,1123,1251,1479,1945],
          [527,617,665,733,809,882,953,1022,1095,1243,1383,1635,2144],
          [563,660,712,793,873,956,1037,1116,1193,1361,1516,1793,2341],
          [594,690,766,849,939,1035,1120,1206,1295,1475,1650,1946,2543],
        ],
      },
    },
    {
      id: 'honeycomb-34-double',
      name: '3/4" Cordless Double & 1-1/4" Single',
      cellSize: '3/4" / 1-1/4"',
      construction: 'Double Cell / Single Cell',
      liftSystem: 'Cordless',
      maxWidth: 108,
      restrictions: ['Cordless max width 108"'],
      priceGrid: {
        widths: HONEYCOMB_WIDTHS,
        heights: HONEYCOMB_HEIGHTS,
        prices: [
          [336,416,436,483,519,555,591,707,746,827,903,1080,1437],
          [387,432,457,503,544,586,625,747,792,878,960,1152,1529],
          [399,446,474,529,602,620,655,789,839,932,1021,1220,1622],
          [415,465,494,549,624,648,689,831,879,983,1080,1288,1700],
          [429,490,517,577,655,680,721,878,925,1049,1146,1366,1801],
          [457,527,549,600,660,704,753,920,970,1088,1204,1430,1885],
          [469,541,569,626,675,739,792,960,1020,1154,1265,1503,1981],
          [545,629,669,733,797,871,932,995,1058,1190,1320,1570,2067],
          [561,649,690,759,827,903,970,1036,1105,1243,1380,1637,2153],
          [577,669,713,786,854,938,1007,1079,1152,1298,1439,1705,2238],
          [592,689,736,811,887,971,1046,1120,1196,1348,1499,1774,2333],
          [630,740,797,878,969,1058,1145,1228,1316,1490,1658,1963,2571],
          [675,793,854,951,1047,1148,1243,1341,1431,1632,1818,2149,2809],
          [712,810,918,1020,1126,1241,1343,1447,1553,1769,1978,2334,3048],
        ],
      },
    },
    {
      id: 'honeycomb-fr',
      name: 'Flame Resistant Fabrics',
      cellSize: 'Various',
      construction: 'Flame Resistant',
      liftSystem: 'Cordless',
      maxWidth: 108,
      restrictions: ['Cordless max width 108"', '3/8" single max width 96"'],
      priceGrid: {
        widths: HONEYCOMB_WIDTHS,
        heights: HONEYCOMB_HEIGHTS,
        prices: [
          [471,587,611,676,730,780,826,992,1048,1162,1268,1518,1766],
          [543,605,641,705,765,823,875,1049,1111,1233,1348,1618,1887],
          [558,629,667,742,846,868,920,1108,1176,1309,1433,1713,1993],
          [581,651,695,772,873,911,966,1169,1238,1381,1518,1810,2104],
          [600,689,725,813,920,956,1010,1233,1300,1475,1609,1919,2231],
          [641,739,772,842,932,989,1058,1291,1363,1525,1693,2009,2325],
          [658,759,798,877,949,1039,1111,1348,1432,1619,1777,2109,2440],
          [767,882,939,1029,1116,1221,1309,1399,1487,1672,1854,2202,2548],
          [782,913,968,1064,1162,1268,1363,1452,1552,1746,1937,2303,2667],
          [813,939,1001,1098,1200,1316,1416,1515,1618,1822,2019,2397,2774],
          [828,966,1033,1138,1247,1365,1471,1569,1679,1892,2105,2492,2879],
          [887,1041,1116,1233,1361,1487,1606,1726,1847,2092,2329,2756,3184],
          [949,1113,1200,1333,1473,1612,1746,1878,2011,2293,2554,3019,3486],
          // 144 height row not in FR table
          [0,0,0,0,0,0,0,0,0,0,0,0,0],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/portrait-honeycomb-hero.jpg',
    gallery: [
      'https://normanusa.com/product/portrait-honeycomb/',
    ],
    swatches: [], // TODO: crawl dealer portal
  },
  specs: {
    'Cell Sizes': '9/16", 3/8", 1/2", 3/4", 1-1/4"',
    'Construction': 'Single Cell, Double Cell',
    'Max Width (Cordless)': '96" (9/16"), 108" (others)',
    'Lift Systems': 'Cordless, Cord Loop, SmartRelease, TDBU, Motorized',
    'Fabric Opacities': 'Sheer, Light Filtering, Room Darkening',
    'Motorization': 'AutoWand™, Smart Motorization',
    'Child Safety': 'Best for Kids Certified (Cordless)',
    'Energy Rating': 'Cellular honeycomb design for insulation',
  },
  restrictions: [
    'Cordless max width varies by cell size (96"-108")',
    'SmartFit Dual Shade priced as 2 individual shades',
    'Oversize surcharge for widths 90" or over',
    'Hawaii & Alaska have different freight charges',
  ],
  awards: [
    'Best New Technical Innovation — SmartFit Dual Shades with Frame',
    'Product Design — SmartRise G6 Cordless',
    'Product Design — Windsong Woven Honeycomb Fabric',
  ],
};

// ============================================================
// PRICING UTILITY
// ============================================================

const DEALER_DISCOUNT = 0.30;  // Our cost = 30% of retail
const MARKUP = 1.20;           // Customer sees cost + 20%
const PRICE_MULTIPLIER = DEALER_DISCOUNT * MARKUP; // = 0.36

/**
 * Look up customer price from a retail price grid.
 * Rounds up to next grid size if exact width/height not found.
 */
export function getCustomerPrice(
  grid: PriceGrid,
  widthInches: number,
  heightInches: number
): { price: number; gridWidth: number; gridHeight: number } | null {
  // Find the smallest grid width >= requested width
  const widthIdx = grid.widths.findIndex(w => w >= widthInches);
  if (widthIdx === -1) return null; // Too wide

  // Find the smallest grid height >= requested height
  const heightIdx = grid.heights.findIndex(h => h >= heightInches);
  if (heightIdx === -1) return null; // Too tall

  const retailPrice = grid.prices[heightIdx][widthIdx];
  if (!retailPrice || retailPrice === 0) return null;

  return {
    price: Math.ceil(retailPrice * PRICE_MULTIPLIER * 100) / 100, // Round up to nearest cent
    gridWidth: grid.widths[widthIdx],
    gridHeight: grid.heights[heightIdx],
  };
}

/**
 * Calculate surcharge customer price
 */
export function getSurchargePrice(surcharge: Surcharge, basePrice?: number): number {
  if (surcharge.type === 'percent' && basePrice) {
    return Math.ceil(basePrice * (surcharge.price / 100) * 100) / 100;
  }
  return Math.ceil(surcharge.price * PRICE_MULTIPLIER * 100) / 100;
}

// ============================================================
// FULL CATALOG (will add remaining products)
// ============================================================

export const PRODUCT_CATALOG: Product[] = [
  portraitHoneycomb,
  // TODO: Add remaining 17 products as they're digitized
];

export default PRODUCT_CATALOG;
