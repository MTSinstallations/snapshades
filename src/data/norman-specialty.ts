/**
 * Norman® PerfectSheer™ Shades + SmartDrape® + CityLights™ Aluminum
 * Source: 2026 March Retail Price Guide
 */
import type { Product, Surcharge } from './norman-catalog';

// ============================================================
// PERFECTSHEER™ SHADES
// ============================================================

const PERFECTSHEER_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 98, 104, 110];
const PERFECTSHEER_HEIGHTS = [36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 98, 102, 108, 120];

export const perfectSheer: Product = {
  id: 'perfectsheer',
  slug: 'perfectsheer-shades',
  name: 'PerfectSheer™ Shades',
  brand: 'Norman®',
  category: 'shades',
  subcategory: 'sheer',
  tagline: 'Elegance meets privacy — soft interplay of light, colors and shadows',
  description: 'PerfectSheer\'s soft interplay of light, colors and shadows elevates décor and everyday privacy control to a new level of elegance and softness. Only PerfectSheer combines a banded, layered shade with a sheer fabric vane shade for a sleek and modern effect. Open for light and views, partially close for filtered light, or fully close for privacy.',
  features: [
    'Unique banded + sheer vane construction',
    'Three positions: open, partial, closed',
    'Continuous cord loop standard (no charge)',
    'Curved fascia with fabric included',
    'Fabric covered hem bar included',
    'Room darkening option (+20%)',
    'Basic & Premium Light Guard options',
    'Motorization available',
    'Wood and fabric valance options',
  ],
  benefits: [
    'Elegant light control — sheer when open, private when closed',
    'Modern, sleek profile',
    'UV protection while maintaining views',
    'Soft, natural light filtering',
    'Premium look at competitive pricing',
  ],
  liftSystems: ['Continuous Cord Loop (standard)', 'Motorized'],
  motorization: {
    available: true,
    options: ['Automate Home Motorization'],
    surcharges: [
      { name: 'Motor (Rechargeable Battery)', price: 682, type: 'flat' },
      { name: 'Low Voltage DC Motor', price: 814, type: 'flat' },
    ],
  },
  surcharges: [
    { name: 'Room Darkening', price: 20, type: 'percent' },
    { name: 'Basic Light Guard', price: 45, type: 'flat' },
    { name: 'Premium Wood Light Guard', price: 117, type: 'flat' },
    { name: 'Shim', price: 7, type: 'flat' },
    { name: 'Magnetic Hold Down', price: 28, type: 'flat', description: 'Per shade' },
    { name: 'Keystone', price: 73, type: 'flat' },
  ],
  variants: [
    {
      id: 'perfectsheer-lf',
      name: 'Light Filtering',
      cellSize: 'N/A',
      construction: 'Sheer Vane',
      liftSystem: 'Continuous Cord Loop',
      maxWidth: 110,
      restrictions: [],
      priceGrid: {
        widths: PERFECTSHEER_WIDTHS,
        heights: PERFECTSHEER_HEIGHTS,
        prices: [
          [624,698,774,846,921,1005,1074,1155,1342,1425,1502,1581,1653,1726,1800],
          [651,727,793,873,951,1039,1118,1196,1388,1470,1553,1629,1713,1797,1879],
          [693,762,838,922,1010,1105,1195,1288,1475,1557,1651,1740,1829,1916,2004],
          [715,799,879,983,1074,1171,1275,1372,1557,1657,1746,1852,1950,2050,2149],
          [750,841,927,1029,1128,1243,1348,1461,1644,1751,1862,1974,2081,2187,2294],
          [785,878,976,1083,1195,1313,1433,1555,1732,1856,1976,2094,2211,2329,2448],
          [815,918,1021,1137,1261,1392,1518,1644,1829,1950,2084,2211,2337,2462,2587],
          [837,943,1055,1188,1315,1453,1582,1722,1914,2051,2183,2321,2455,2590,2726],
          [870,988,1102,1247,1383,1525,1672,1810,2011,2157,2303,2445,2584,2724,2863],
          [905,1019,1147,1301,1453,1605,1749,1901,2105,2260,2413,2564,2719,2872,3025],
          [943,1062,1196,1361,1518,1674,1832,1994,2203,2367,2528,2686,2845,3003,3161],
          [983,1103,1249,1421,1579,1741,1915,2083,2302,2475,2645,2808,2972,3136,3299],
          [1020,1146,1298,1479,1644,1807,1998,2175,2398,2581,2758,2928,3099,3267,3437],
          [1058,1188,1348,1539,1706,1874,2081,2265,2496,2687,2873,3050,3225,3399,3574],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/perfectsheer-hero.jpg',
    gallery: ['https://normanusa.com/product/perfectsheer-shades/'],
    swatches: [],
  },
  specs: {
    'Max Width': '110"',
    'Construction': 'Banded + sheer fabric vane',
    'Positions': 'Open, Partially Open, Fully Closed',
    'Standard': 'Cord loop, curved fascia, fabric hem bar',
    'Opacities': 'Light Filtering, Room Darkening (+20%)',
    'Motorization': 'Automate Home available',
  },
  restrictions: [],
  awards: ['Best of the Best — SmartDrape (related product line)'],
};

// ============================================================
// SMARTDRAPE®
// ============================================================

const SMARTDRAPE_WIDTHS = [36, 48, 54, 60, 66, 72, 78, 84, 90, 96, 108, 120, 132, 148, 160, 172, 184];
const SMARTDRAPE_HEIGHTS = [48, 60, 72, 84, 100, 120, 132, 144];

export const smartDrape: Product = {
  id: 'smartdrape',
  slug: 'smartdrape-shades',
  name: 'SmartDrape®',
  brand: 'Norman®',
  category: 'shades',
  subcategory: 'sheer-vertical',
  tagline: 'Soft like drapery, delicately architectural — for seamless indoor-outdoor living',
  description: 'Soft like drapery and delicately architectural, SmartDrape\'s undulating sheer and fabric vane construction is specially made to bring you style, versatility and seamless indoor-outdoor living. Perfect for sliding glass doors, large windows, and open-concept spaces.',
  features: [
    'Best for Kids certified cordless',
    'Sleek valance-free metal headrail',
    'Contemporary headrail finishes',
    'Undulating sheer and fabric vane design',
    'Room darkening option (+20%)',
    'Alternating colors option (+10%)',
    'Motorization available',
    'Additional vane packs available',
    'Perfect for sliding glass doors',
  ],
  benefits: [
    'Drapery-like softness with shade convenience',
    'Ideal for large openings and sliding doors',
    'Child safe — cordless, Best for Kids certified',
    'Modern aesthetic — no bulky valances',
    'Versatile light and privacy control',
    'Expandable with additional vane packs',
  ],
  liftSystems: ['Cordless (standard)', 'Motorized'],
  motorization: {
    available: true,
    options: ['Automate Home Motorization'],
    surcharges: [
      { name: 'Motor (Rechargeable Battery)', price: 682, type: 'flat' },
      { name: 'Low Voltage DC Motor', price: 814, type: 'flat' },
    ],
  },
  surcharges: [
    { name: 'Alternating Colors', price: 10, type: 'percent' },
    { name: 'Room Darkening', price: 20, type: 'percent' },
    { name: 'Aluminum Shim', price: 28, type: 'flat' },
    { name: 'Long L Bracket', price: 61, type: 'flat', description: 'Per shade' },
    { name: 'Keystone', price: 73, type: 'flat' },
    { name: 'Additional Wand', price: 89, type: 'flat' },
  ],
  variants: [
    {
      id: 'smartdrape-standard',
      name: 'Standard Collection',
      cellSize: 'N/A',
      construction: 'Sheer + Fabric Vane',
      liftSystem: 'Cordless',
      maxWidth: 184,
      restrictions: ['For every additional foot beyond 184", add $217-$321 retail depending on height'],
      priceGrid: {
        widths: SMARTDRAPE_WIDTHS,
        heights: SMARTDRAPE_HEIGHTS,
        prices: [
          [643,760,809,862,941,997,1051,1111,1191,1262,1364,1549,1744,1961,2195,2411,2626],
          [716,849,920,984,1081,1140,1204,1276,1367,1451,1567,1760,1968,2191,2453,2675,2897],
          [809,974,1054,1140,1242,1322,1397,1484,1588,1688,1936,2156,2395,2646,2963,3214,3463],
          [873,1089,1176,1268,1381,1471,1559,1648,1768,1873,2025,2254,2500,2762,3094,3356,3617],
          [949,1146,1242,1341,1458,1555,1651,1745,1873,1986,2200,2436,2694,2964,3319,3590,3861],
          [1074,1236,1353,1462,1587,1697,1806,1909,2050,2176,2491,2743,3014,3306,3703,3995,4287],
          [1138,1351,1474,1592,1726,1845,1968,2074,2229,2361,2580,2840,3120,3422,3834,4137,4442],
          [1201,1464,1595,1721,1866,1994,2131,2240,2408,2548,2668,2937,3225,3539,3965,4280,4594],
        ],
      },
    },
    {
      id: 'smartdrape-lakeshore',
      name: 'Lakeshore Stripe Collection',
      cellSize: 'N/A',
      construction: 'Sheer + Fabric Vane (Stripe)',
      liftSystem: 'Cordless',
      maxWidth: 184,
      restrictions: ['Premium fabric — higher pricing', 'For every additional foot beyond 184", add $255-$369 retail'],
      priceGrid: {
        widths: SMARTDRAPE_WIDTHS,
        heights: SMARTDRAPE_HEIGHTS,
        prices: [
          [758,892,951,1013,1107,1171,1235,1306,1400,1484,1604,1821,2051,2305,2582,2834,3088],
          [842,998,1082,1156,1269,1342,1415,1499,1609,1705,1842,2071,2314,2575,2886,3146,3408],
          [951,1146,1239,1342,1459,1555,1643,1744,1868,1983,2277,2535,2817,3111,3485,3779,4073],
          [1026,1281,1382,1491,1624,1730,1835,1939,2078,2203,2382,2651,2941,3249,3639,3947,4255],
          [1115,1347,1459,1576,1714,1830,1942,2052,2203,2337,2587,2865,3169,3486,3904,4223,4542],
          [1262,1455,1590,1720,1867,1996,2124,2244,2411,2559,2928,3225,3546,3889,4355,4699,5042],
          [1310,1554,1695,1832,1984,2122,2263,2386,2563,2717,2966,3267,3589,3935,4409,4758,5107],
          [1382,1685,1835,1979,2146,2292,2450,2575,2769,2929,3069,3377,3711,4070,4560,4922,5285],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/smartdrape-hero.jpg',
    gallery: ['https://normanusa.com/product/smartdrape-shades/'],
    swatches: [],
  },
  specs: {
    'Max Width': '184"+ (expandable)',
    'Construction': 'Undulating sheer + fabric vane',
    'Collections': 'Standard (6 fabrics), Lakeshore Stripe',
    'Additional Vanes': 'Available in packs of 6 ($230-$540 retail by length)',
    'Headrail': 'Sleek valance-free metal with contemporary finishes',
    'Child Safety': 'Best for Kids Certified',
  },
  restrictions: ['For widths beyond 184", pricing is per-additional-foot'],
  awards: [
    'Best of the Best — SmartDrape',
    'Product Design — SmartDrape',
    'Judge\'s Award — SmartDrape',
    'Best New Technical Innovation — SmartDrape',
    'Best New Style Concept — SmartDrape',
  ],
};

// ============================================================
// CITYLIGHTS™ ALUMINUM BLINDS
// ============================================================

// Note: CityLights pricing grid was not fully visible in extracted text
// Will need to extract from PDF images. Using placeholder structure.
export const cityLightsAluminum: Product = {
  id: 'citylights-aluminum',
  slug: 'citylights-aluminum-blinds',
  name: 'CityLights™ Cordless Aluminum Blinds',
  brand: 'Norman®',
  category: 'blinds',
  subcategory: 'aluminum',
  tagline: 'Sophisticated, contemporary, and budget-friendly',
  description: 'The slim profile and crisp lines of aluminum slats create a sophisticated and contemporary look, adding a touch of elegance to any room. Whether your space is traditional or modern, CityLights Aluminum Blinds offer a seamless integration, making them a versatile and budget-friendly choice for any décor.',
  features: [
    'Slim aluminum slat profile',
    'Cordless operation',
    'Budget-friendly entry point',
    'Modern, crisp aesthetic',
    'Lightweight and easy to operate',
    'Multiple color options',
  ],
  benefits: [
    'Most affordable option in the Norman lineup',
    'Contemporary look',
    'Lightweight — easy to raise and lower',
    'Perfect for modern and minimalist spaces',
    'Versatile — works in any room',
  ],
  liftSystems: ['Cordless (standard)'],
  motorization: { available: false },
  surcharges: [],
  variants: [
    {
      id: 'citylights-standard',
      name: 'Standard',
      cellSize: '1"',
      construction: 'Aluminum',
      liftSystem: 'Cordless',
      maxWidth: 72,
      restrictions: ['Pricing grid to be extracted from PDF images'],
      priceGrid: {
        widths: [24, 30, 36, 42, 48, 54, 60, 66, 72],
        heights: [36, 48, 60, 72, 84, 96],
        prices: [
          // Placeholder - need to extract from PDF page 34
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/citylights-hero.jpg',
    gallery: ['https://normanusa.com/product/citylights-blinds/'],
    swatches: [],
  },
  specs: {
    'Slat Size': '1" aluminum',
    'Max Width': '72" (estimated)',
    'Child Safety': 'Cordless',
  },
  restrictions: ['Pricing grid pending extraction from PDF images'],
  awards: [],
};
