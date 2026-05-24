/**
 * Generic Product Categories — brand-agnostic product types
 *
 * The user picks a category first, then a manufacturer.
 * Each category maps to brand-specific product slugs.
 */

export interface BrandProductMapping {
  brandId: string;       // key into BRANDS in norman-order-specs.ts
  productSlug: string;   // brand-specific slug for order fields & catalog lookup
}

export interface GenericCategory {
  id: string;
  label: string;
  imageSlug: string;     // key into PRODUCT_IMAGES for the grid thumbnail
  brands: BrandProductMapping[];
}

export const PRODUCT_CATEGORIES: GenericCategory[] = [
  {
    id: 'cellular',
    label: 'Cellular / Pleated',
    imageSlug: 'portrait-honeycomb-shades',
    brands: [
      { brandId: 'norman', productSlug: 'portrait-honeycomb-shades' },
      { brandId: 'levolor', productSlug: 'levolor-cellular' },
    ],
  },
  {
    id: 'roller',
    label: 'Roller / Solar / Sheer',
    imageSlug: 'soluna-roller',
    brands: [
      { brandId: 'norman', productSlug: 'soluna-roller-shades' },
      { brandId: 'levolor', productSlug: 'levolor-roller' },
    ],
  },
  {
    id: 'roman',
    label: 'Roman Shades',
    imageSlug: 'centerpiece-roman',
    brands: [
      { brandId: 'norman', productSlug: 'centerpiece-roman-shades' },
      { brandId: 'levolor', productSlug: 'levolor-roman' },
    ],
  },
  {
    id: 'faux-wood',
    label: 'Faux Wood / Wood',
    imageSlug: 'ultimate-faux-wood',
    brands: [
      { brandId: 'norman', productSlug: 'ultimate-faux-wood-blinds' },
      { brandId: 'levolor', productSlug: 'levolor-faux-wood' },
    ],
  },
  {
    id: 'vertical',
    label: 'Vertical Blinds',
    imageSlug: 'synchrony-vertical',
    brands: [
      { brandId: 'norman', productSlug: 'synchrony-vertical-blinds' },
      { brandId: 'levolor', productSlug: 'levolor-soft-vertical' },
    ],
  },
  {
    id: 'mini-blinds',
    label: 'Mini Blinds',
    imageSlug: 'citylights-aluminum',
    brands: [
      { brandId: 'norman', productSlug: 'citylights-aluminum-blinds' },
      { brandId: 'levolor', productSlug: 'levolor-riviera-metal' },
    ],
  },
  {
    id: 'zebra',
    label: 'Zebra / Banded Shades',
    imageSlug: 'perfectsheer',
    brands: [
      { brandId: 'norman', productSlug: 'perfectsheer-shades' },
      { brandId: 'levolor', productSlug: 'levolor-banded' },
    ],
  },
  {
    id: 'sheer-drape',
    label: 'Silhouette / SmartDrape',
    imageSlug: 'smartdrape',
    brands: [
      { brandId: 'norman', productSlug: 'smartdrape-shades' },
    ],
  },
  {
    id: 'shutters',
    label: 'Shutters',
    imageSlug: 'norman-shutters',
    brands: [
      { brandId: 'norman', productSlug: 'plantation-shutters' },
    ],
  },
];

/** Look up a category by its ID */
export function getCategoryById(categoryId: string): GenericCategory | undefined {
  return PRODUCT_CATEGORIES.find(c => c.id === categoryId);
}

/** Get the product slug for a brand within a category */
export function getProductSlugForBrand(categoryId: string, brandId: string): string | undefined {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  return category.brands.find(b => b.brandId === brandId)?.productSlug;
}

/** Check if a category has multiple brand options */
export function categoryHasMultipleBrands(categoryId: string): boolean {
  const category = getCategoryById(categoryId);
  return !!category && category.brands.length > 1;
}
