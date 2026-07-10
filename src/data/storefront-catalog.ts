/**
 * Storefront catalog shared by the browser and Supabase checkout functions.
 * Only price-guide-backed Norman products are allowed into paid checkout.
 */
import { portraitHoneycomb } from './norman-catalog.ts';
import { solunaRoller } from './norman-roller.ts';
import { ultimateFauxWood } from './norman-faux-wood.ts';
import { BROKER_MARKUP_RATE, DEALER_COST_RATE } from '../lib/pricing-rates.ts';

export const STOREFRONT_PRICING_VERSION = 'norman-2026-03-value-v2';
export const STOREFRONT_DEALER_COST_RATE = DEALER_COST_RATE;
export const STOREFRONT_BROKER_MARKUP_RATE = BROKER_MARKUP_RATE;

export const STOREFRONT_FIXED_OPTIONS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'portrait-honeycomb-shades': {
    cellSize: '9/16" Single Cell',
    liftSystem: 'Cordless',
  },
  'soluna-roller-shades': {
    fabricGroup: 'Fabric Group 1',
    liftSystem: 'PrecisionLift Cordless',
    rollType: 'Standard roll',
  },
  'ultimate-faux-wood-blinds': {
    finish: 'Smooth',
    liftSystem: 'Cordless',
    tiltType: 'Wand',
    headrail: 'PolyDeco valance-free',
    routeHoles: 'SmartPrivacy concealed',
  },
};

export function getStorefrontFixedOptions(productSlug: string): Record<string, string> {
  return { ...(STOREFRONT_FIXED_OPTIONS[productSlug] || {}) };
}

export interface StorefrontPriceGrid {
  widths: readonly number[];
  heights: readonly number[];
  prices: readonly (readonly number[])[];
}

export interface StorefrontVariant {
  id: string;
  name: string;
  maxWidth?: number;
  maxHeight?: number;
  priceGrid: StorefrontPriceGrid;
}

export interface StorefrontCatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  variants: readonly StorefrontVariant[];
}

export interface StorefrontPrice {
  price: number;
  retailPrice: number;
  supplierCost: number;
  brokerFee: number;
  gridWidth: number;
  gridHeight: number;
}

function requiredVariant(productName: string, variants: readonly StorefrontVariant[], id: string): StorefrontVariant {
  const variant = variants.find((candidate) => candidate.id === id);
  if (!variant) throw new Error(`Missing ${productName} storefront variant: ${id}`);
  return variant;
}

const cellularVariant = requiredVariant('cellular', portraitHoneycomb.variants, 'honeycomb-916-single');
const rollerVariant = requiredVariant('roller', solunaRoller.variants, 'soluna-fabric-g1');
const fauxWoodVariant = requiredVariant('faux wood', ultimateFauxWood.variants, 'ultimate-faux-2-25');

export const STOREFRONT_PRODUCTS: readonly StorefrontCatalogProduct[] = [
  {
    id: 'value-cellular',
    slug: 'portrait-honeycomb-shades',
    name: 'Cellular Shades',
    brand: 'Norman®',
    variants: [cellularVariant],
  },
  {
    id: 'value-roller',
    slug: 'soluna-roller-shades',
    name: 'Roller Shades',
    brand: 'Norman®',
    variants: [rollerVariant],
  },
  {
    id: 'value-faux-wood',
    slug: 'ultimate-faux-wood-blinds',
    name: 'Faux Wood Blinds',
    brand: 'Norman®',
    variants: [fauxWoodVariant],
  },
];

export const STOREFRONT_PRODUCT_BY_SLUG: Readonly<Record<string, StorefrontCatalogProduct>> =
  Object.fromEntries(STOREFRONT_PRODUCTS.map((product) => [product.slug, product]));

export function getStorefrontProduct(productSlug: string): StorefrontCatalogProduct | null {
  return STOREFRONT_PRODUCT_BY_SLUG[productSlug] ?? null;
}

function priceFromRetail(retailPrice: number, gridWidth: number, gridHeight: number): StorefrontPrice {
  const supplierCost = Math.round(retailPrice * STOREFRONT_DEALER_COST_RATE * 100) / 100;
  const brokerFee = Math.round(supplierCost * STOREFRONT_BROKER_MARKUP_RATE * 100) / 100;
  return {
    price: Math.round((supplierCost + brokerFee) * 100) / 100,
    retailPrice,
    supplierCost,
    brokerFee,
    gridWidth,
    gridHeight,
  };
}

export function calculateStorefrontPrice(
  grid: StorefrontPriceGrid,
  widthInches: number,
  heightInches: number,
): StorefrontPrice | null {
  const widthIndex = grid.widths.findIndex((width) => width >= widthInches);
  const heightIndex = grid.heights.findIndex((height) => height >= heightInches);
  if (widthIndex === -1 || heightIndex === -1) return null;

  const retailPrice = grid.prices[heightIndex]?.[widthIndex];
  if (!retailPrice || retailPrice <= 0) return null;
  return priceFromRetail(retailPrice, grid.widths[widthIndex], grid.heights[heightIndex]);
}

export function calculateConfiguredStorefrontPrice(input: {
  productSlug: string;
  variantId: string;
  width: number;
  height: number;
  lightControl?: string;
}): StorefrontPrice | null {
  const product = getStorefrontProduct(input.productSlug);
  const variant = product?.variants.find((candidate) => candidate.id === input.variantId);
  if (!product || !variant) return null;

  const basePrice = calculateStorefrontPrice(variant.priceGrid, input.width, input.height);
  if (!basePrice) return null;

  if (input.productSlug === 'portrait-honeycomb-shades' && input.lightControl === 'Room darkening') {
    const retailWithRoomDarkening = Math.round(basePrice.retailPrice * 1.20 * 100) / 100;
    return priceFromRetail(retailWithRoomDarkening, basePrice.gridWidth, basePrice.gridHeight);
  }
  return basePrice;
}

export function priceStorefrontItem(input: {
  productSlug: string;
  variantId: string;
  width: number;
  height: number;
  lightControl?: string;
}): { product: StorefrontCatalogProduct; variant: StorefrontVariant; price: StorefrontPrice } | null {
  const product = getStorefrontProduct(input.productSlug);
  if (!product) return null;
  const variant = product.variants.find((candidate) => candidate.id === input.variantId);
  if (!variant) return null;

  const maxWidth = variant.maxWidth ?? variant.priceGrid.widths[variant.priceGrid.widths.length - 1];
  const maxHeight = variant.maxHeight ?? variant.priceGrid.heights[variant.priceGrid.heights.length - 1];
  if (input.width < 6 || input.height < 6 || input.width > maxWidth || input.height > maxHeight) return null;
  if (input.productSlug === 'ultimate-faux-wood-blinds' && input.width * input.height > 48 * 144) return null;

  const price = calculateConfiguredStorefrontPrice(input);
  return price ? { product, variant, price } : null;
}
