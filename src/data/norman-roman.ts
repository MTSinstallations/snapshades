/**
 * Norman® Centerpiece™ Roman Shades
 * Source: 2026 March Retail Price Guide
 */
import type { Product, Surcharge } from './norman-catalog';

const ROMAN_WIDTHS = [24, 31, 36, 42, 48, 54, 60, 66, 72, 84, 96];
const ROMAN_HEIGHTS = [36, 42, 48, 54, 60, 66, 72, 78, 90, 102];

export const ROMAN_LIFT_SURCHARGES: Surcharge[] = [
  { name: 'SmartRelease™', price: 89, type: 'flat' },
];

export const ROMAN_FABRIC_SURCHARGES: Surcharge[] = [
  { name: 'Blackout Lining', price: 10, type: 'percent' },
  { name: 'Ribbon Banding', price: 15, type: 'percent' },
  { name: 'Soft Fold / Edge Banding / Border', price: 30, type: 'percent' },
  { name: 'Day & Night (includes roller shade)', price: 425, type: 'flat' },
];

export const ROMAN_MISC_SURCHARGES: Surcharge[] = [
  { name: 'Magnetic Hold Down', price: 28, type: 'flat', description: 'Per shade' },
  { name: 'Pole Attachment Only', price: 40, type: 'flat' },
  { name: 'Cordless Operating Pole', price: 89, type: 'flat' },
  { name: 'Shim', price: 7, type: 'flat' },
];

export const centerpieceRoman: Product = {
  id: 'centerpiece-roman',
  slug: 'centerpiece-roman-shades',
  name: 'Centerpiece™ Roman Shades',
  brand: 'Norman®',
  category: 'shades',
  subcategory: 'roman',
  tagline: 'A world of soft luxury fabrics and exquisite tailored craftsmanship',
  description: 'Centerpiece embodies the best of tailored craftsmanship. Capture the spirit of exceptionally tailored draperies more conveniently — and with a sleeker profile. Norman\'s award-winning roman shades deliver modern elegance with exclusive technology. Pillow covers available in most fabrics to further enhance your decor.',
  features: [
    'PrecisionLift™ cordless technology',
    'SmartRelease™ lift option',
    'Motorization available (Automate Home)',
    'Day & Night option — roman shade + roller shade combination',
    'Blackout lining option',
    'Ribbon banding and edge banding decorative options',
    'Soft fold style available',
    'Matching pillow covers and fabric by the yard',
    'Valance option available',
    'Wide selection of luxury fabrics',
  ],
  benefits: [
    'Luxury drapery look with the convenience of a shade',
    'Tailored craftsmanship — every detail matters',
    'Versatile fabric options from sheer to blackout',
    'Matching home décor items (pillow covers)',
    'Child safe cordless operation',
    'Energy efficient when lined',
  ],
  liftSystems: ['Cordless (standard)', 'SmartRelease™', 'Motorized'],
  motorization: {
    available: true,
    options: ['Automate Home — rechargeable battery'],
    surcharges: [
      { name: 'Motor (Rechargeable Battery)', price: 682, type: 'flat' },
      { name: 'Low Voltage DC Motor', price: 814, type: 'flat' },
    ],
  },
  surcharges: [...ROMAN_LIFT_SURCHARGES, ...ROMAN_FABRIC_SURCHARGES, ...ROMAN_MISC_SURCHARGES],
  variants: [
    // Group 1
    {
      id: 'roman-g1',
      name: 'Group 1 — Scarlett',
      cellSize: 'N/A',
      construction: 'Roman Shade',
      liftSystem: 'Cordless',
      maxWidth: 96,
      fabricGroups: [{ groupNumber: 1, name: 'Group 1', fabrics: ['Scarlett'] }],
      restrictions: ['Fabric by the yard: $115/yard (max 10 yards)'],
      priceGrid: {
        widths: ROMAN_WIDTHS,
        heights: ROMAN_HEIGHTS,
        prices: [
          [404,453,587,655,685,765,938,988,1062,1120,1410],
          [430,626,715,792,863,951,983,1047,1102,1301,1568],
          [499,693,775,858,940,1029,1038,1080,1156,1380,1662],
          [574,743,824,916,1014,1074,1113,1154,1220,1532,1803],
          [627,824,861,1003,1052,1130,1147,1215,1269,1659,2098],
          [655,858,951,1042,1106,1173,1204,1264,1321,1854,2166],
          [740,923,1014,1094,1154,1230,1254,1317,1419,1962,2306],
          [793,965,1080,1151,1224,1290,1316,1399,1582,2034,2390],
          [840,1029,1130,1222,1283,1357,1385,1564,1641,2089,2538],
          [888,1093,1184,1291,1343,1423,1454,1730,1702,2146,2688],
        ],
      },
    },
    // Group 2
    {
      id: 'roman-g2',
      name: 'Group 2 — Designer Collection',
      cellSize: 'N/A',
      construction: 'Roman Shade',
      liftSystem: 'Cordless',
      maxWidth: 96,
      fabricGroups: [{ groupNumber: 2, name: 'Group 2', fabrics: ['Alma', 'Caroline', 'Windsor', 'Lakeside', 'Lorraine', 'Seabreeze', 'Taylor', 'Patterns', 'Sheer Elegance', 'Francis', 'Valencia', 'Ella', 'Solids', 'Bora Bora', 'Catalina', 'Java', 'Phuket', 'Riviera', 'Sumatra', 'Sierra', 'Ashley', 'Whispering Willow', 'Impressions', 'Louise'] }],
      restrictions: ['Fabric by the yard: $150/yard (max 10 yards)'],
      priceGrid: {
        widths: ROMAN_WIDTHS,
        heights: ROMAN_HEIGHTS,
        prices: [
          [492,613,698,807,916,1021,1092,1191,1283,1379,1699],
          [566,697,793,897,1043,1147,1185,1264,1328,1444,1894],
          [609,792,863,985,1140,1246,1297,1357,1448,1596,2008],
          [684,901,995,1111,1219,1299,1344,1444,1502,1711,2179],
          [760,995,1038,1211,1268,1364,1432,1535,1650,1824,2528],
          [807,1029,1147,1259,1329,1416,1510,1693,1817,1973,2616],
          [876,1112,1219,1320,1398,1489,1653,1845,1979,2166,2784],
          [959,1167,1301,1392,1475,1627,1797,2035,2154,2329,2886],
          [1037,1246,1364,1474,1551,1724,1934,2138,2241,2436,3064],
          [1115,1322,1428,1555,1627,1821,2072,2241,2327,2543,3242],
        ],
      },
    },
    // Group 3
    {
      id: 'roman-g3',
      name: 'Group 3 — Premium Collection',
      cellSize: 'N/A',
      construction: 'Roman Shade',
      liftSystem: 'Cordless',
      maxWidth: 96,
      fabricGroups: [{ groupNumber: 3, name: 'Group 3', fabrics: ['Blake', 'Libeco', 'Rochelle', 'Bali', 'Breeze', 'Ellie'] }],
      restrictions: ['Fabric by the yard: $173/yard (max 10 yards)'],
      priceGrid: {
        widths: ROMAN_WIDTHS,
        heights: ROMAN_HEIGHTS,
        prices: [
          [593,740,840,971,1103,1228,1316,1433,1547,1661,2047],
          [682,839,954,1081,1256,1382,1427,1522,1601,1740,2280],
          [734,953,1041,1187,1372,1500,1562,1635,1744,1924,2418],
          [824,1085,1198,1338,1467,1564,1617,1740,1809,2062,2624],
          [913,1198,1251,1459,1526,1643,1727,1848,1987,2199,3046],
          [971,1239,1382,1518,1602,1705,1819,2040,2190,2376,3151],
          [1055,1341,1467,1590,1685,1793,1991,2222,2385,2607,3353],
          [1157,1406,1568,1676,1778,1962,2166,2452,2595,2806,3476],
          [1250,1500,1643,1776,1869,2078,2328,2575,2699,2934,3692],
          [1344,1594,1721,1873,1962,2194,2496,2699,2802,3064,3904],
        ],
      },
    },
  ],
  imageUrls: {
    hero: 'https://normanusa.com/wp-content/uploads/centerpiece-roman-hero.jpg',
    gallery: ['https://normanusa.com/product/centerpiece-roman/'],
    swatches: [],
  },
  specs: {
    'Max Width': '96"',
    'Fabric Groups': '3 price groups with 30+ fabrics',
    'Lift Systems': 'Cordless, SmartRelease™, Motorized',
    'Options': 'Blackout lining, Ribbon banding, Soft fold, Edge banding, Day & Night',
    'Matching': 'Pillow covers, Fabric by the yard, Valances',
    'Child Safety': 'Best for Kids Certified (Cordless)',
  },
  restrictions: ['Max width 96"'],
  awards: [],
};
