import { PRODUCT_BY_SLUG, getCustomerPrice, type Product } from '@/data/catalog-index';

export type ValueProductId = 'cellular' | 'roller' | 'faux-wood';
export type ValueProductVisual = 'cellular' | 'roller' | 'faux-wood';

export interface ProductColor {
  name: string;
  value: string;
  border?: boolean;
}

export interface ValueProduct {
  id: ValueProductId;
  catalogSlug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  description: string;
  bestFor: string;
  visual: ValueProductVisual;
  features: string[];
  colors: ProductColor[];
  lightControls: string[];
}

export const VALUE_PRODUCTS: readonly ValueProduct[] = [
  {
    id: 'cellular',
    catalogSlug: 'onyx-honeycomb',
    name: 'Cellular Shades',
    shortName: 'Cellular',
    eyebrow: 'Best overall value',
    description: 'Soft honeycomb cells add privacy and insulation without adding visual clutter.',
    bestFor: 'Bedrooms, living rooms, temperature control',
    visual: 'cellular',
    features: ['Cordless standard', 'Light filtering or blackout', 'Single or double cell'],
    colors: [
      { name: 'Pure White', value: '#f8f7f2', border: true },
      { name: 'Warm Ivory', value: '#e9e0cf' },
      { name: 'Soft Gray', value: '#c7c7c2' },
    ],
    lightControls: ['Light filtering', 'Blackout'],
  },
  {
    id: 'roller',
    catalogSlug: 'onyx-roller',
    name: 'Roller Shades',
    shortName: 'Roller',
    eyebrow: 'Lowest permanent price',
    description: 'A clean sheet of fabric that rolls away neatly and works in almost every room.',
    bestFor: 'Simple rooms, rentals, offices, blackout',
    visual: 'roller',
    features: ['Compact profile', 'Easy to clean', 'Light filtering, solar, or blackout'],
    colors: [
      { name: 'White', value: '#f5f4ef', border: true },
      { name: 'Linen', value: '#d7c8ae' },
      { name: 'Pebble', value: '#a7a39a' },
      { name: 'Charcoal', value: '#4a4a46' },
    ],
    lightControls: ['Light filtering', 'Solar', 'Blackout'],
  },
  {
    id: 'faux-wood',
    catalogSlug: 'onyx-faux-wood',
    name: 'Faux Wood Blinds',
    shortName: 'Faux Wood',
    eyebrow: 'Classic and durable',
    description: 'Moisture-resistant 2-inch slats deliver the familiar wood-blind look for less.',
    bestFor: 'Kitchens, bathrooms, high-traffic rooms',
    visual: 'faux-wood',
    features: ['Cordless lift', '2-inch slats', 'Moisture resistant'],
    colors: [
      { name: 'Bright White', value: '#f8f7f2', border: true },
      { name: 'Off White', value: '#e9e2d3' },
      { name: 'Natural Oak', value: '#b78e5e' },
      { name: 'Walnut', value: '#75543a' },
    ],
    lightControls: ['Tilting slats'],
  },
] as const;

export function getValueProduct(id: ValueProductId): ValueProduct {
  return VALUE_PRODUCTS.find((product) => product.id === id) ?? VALUE_PRODUCTS[0];
}

export function getValueCatalogProduct(product: ValueProduct): Product {
  const catalogProduct = PRODUCT_BY_SLUG[product.catalogSlug];
  if (!catalogProduct) throw new Error(`Missing catalog product: ${product.catalogSlug}`);
  return catalogProduct;
}

export function getStartingPrice(product: ValueProduct): number {
  const catalogProduct = getValueCatalogProduct(product);
  const variant = catalogProduct.variants[0];
  const width = variant.priceGrid.widths[0];
  const height = variant.priceGrid.heights[0];
  return getCustomerPrice(variant.priceGrid, width, height)?.price ?? 0;
}

