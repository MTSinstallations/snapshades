import {
  calculateStorefrontPrice,
  getStorefrontProduct,
  type StorefrontCatalogProduct,
} from '@/data/storefront-catalog';

export type ValueProductId = 'cellular' | 'roller' | 'faux-wood';
export type ValueProductVisual = 'cellular' | 'roller' | 'faux-wood';

export interface ProductColor {
  name: string;
  code: string;
  value: string;
  border?: boolean;
  lightControl?: string;
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
    catalogSlug: 'portrait-honeycomb-shades',
    name: 'Cellular Shades',
    shortName: 'Cellular',
    eyebrow: 'Best overall value',
    description: 'Soft honeycomb cells add privacy and insulation without adding visual clutter.',
    bestFor: 'Bedrooms, living rooms, temperature control',
    visual: 'cellular',
    features: ['Cordless standard', 'Light filtering or room darkening', '9/16-inch single cell'],
    colors: [
      { name: 'Cloud White', code: 'C5004', value: '#f8f6f0', border: true, lightControl: 'Light filtering' },
      { name: 'Toasted Beige', code: 'C6503', value: '#d8c8b0', lightControl: 'Light filtering' },
      { name: 'Ashley Gray', code: 'C6101', value: '#b8b4ac', lightControl: 'Light filtering' },
      { name: 'Eggshell White', code: 'C0001T', value: '#f0ece2', border: true, lightControl: 'Room darkening' },
      { name: 'Dark Champagne', code: 'C0402T', value: '#c8b898', lightControl: 'Room darkening' },
      { name: 'Annapolis Gray', code: 'C4102T', value: '#808888', lightControl: 'Room darkening' },
    ],
    lightControls: ['Light filtering', 'Room darkening'],
  },
  {
    id: 'roller',
    catalogSlug: 'soluna-roller-shades',
    name: 'Roller Shades',
    shortName: 'Roller',
    eyebrow: 'Lowest permanent price',
    description: 'A clean sheet of fabric that rolls away neatly and works in almost every room.',
    bestFor: 'Simple rooms, rentals, offices, clean lines',
    visual: 'roller',
    features: ['PrecisionLift cordless', 'Easy to clean', 'Designer light-filtering fabric'],
    colors: [
      { name: 'Pure White', code: 'F1734', value: '#f5f4ef', border: true },
      { name: 'Natural Tan', code: 'F1736', value: '#c6b08d' },
      { name: 'Pebble Gray', code: 'F1738', value: '#a7a39a' },
    ],
    lightControls: ['Light filtering'],
  },
  {
    id: 'faux-wood',
    catalogSlug: 'ultimate-faux-wood-blinds',
    name: 'Faux Wood Blinds',
    shortName: 'Faux Wood',
    eyebrow: 'Classic and durable',
    description: 'Moisture-resistant 2-inch slats deliver the familiar wood-blind look for less.',
    bestFor: 'Kitchens, bathrooms, high-traffic rooms',
    visual: 'faux-wood',
    features: ['Cordless lift', '2-inch or 2½-inch slats', 'Moisture resistant'],
    colors: [
      { name: 'Pearl', code: 'P006', value: '#f0ede5', border: true },
      { name: 'Storm Gray', code: 'P075', value: '#808890' },
    ],
    lightControls: ['Tilting slats'],
  },
] as const;

export function getValueProduct(id: ValueProductId): ValueProduct {
  return VALUE_PRODUCTS.find((product) => product.id === id) ?? VALUE_PRODUCTS[0];
}

export function getValueCatalogProduct(product: ValueProduct): StorefrontCatalogProduct {
  const catalogProduct = getStorefrontProduct(product.catalogSlug);
  if (!catalogProduct) throw new Error(`Missing catalog product: ${product.catalogSlug}`);
  return catalogProduct;
}

export function getStartingPrice(product: ValueProduct): number {
  const catalogProduct = getValueCatalogProduct(product);
  const variant = catalogProduct.variants[0];
  const width = variant.priceGrid.widths[0];
  const height = variant.priceGrid.heights[0];
  return calculateStorefrontPrice(variant.priceGrid, width, height)?.price ?? 0;
}
