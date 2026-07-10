import { BROKER_MARKUP_RATE } from '@/lib/constants';
import { VALUE_PRODUCTS, getStartingPrice, getValueCatalogProduct } from './value-products';
import {
  STOREFRONT_PRICING_VERSION,
  calculateConfiguredStorefrontPrice,
  calculateStorefrontPrice,
} from './storefront-catalog';
import { calculateStorefrontFreight } from '@/lib/pricing-rates';

describe('value product catalog', () => {
  it('contains exactly the three approved product families', () => {
    expect(VALUE_PRODUCTS.map((product) => product.id)).toEqual([
      'cellular',
      'roller',
      'faux-wood',
    ]);
  });

  it('uses only the price-guide-backed Norman storefront products', () => {
    expect(STOREFRONT_PRICING_VERSION).toBe('norman-2026-03-value-v2');
    expect(VALUE_PRODUCTS.map((product) => product.catalogSlug)).toEqual([
      'portrait-honeycomb-shades',
      'soluna-roller-shades',
      'ultimate-faux-wood-blinds',
    ]);
    for (const product of VALUE_PRODUCTS) {
      expect(getValueCatalogProduct(product).brand).toBe('Norman®');
      expect(product.colors.every((color) => Boolean(color.code))).toBe(true);
    }
  });

  it('has rectangular price grids for every approved product variant', () => {
    for (const product of VALUE_PRODUCTS) {
      const catalogProduct = getValueCatalogProduct(product);
      for (const variant of catalogProduct.variants) {
        expect(variant.priceGrid.prices).toHaveLength(variant.priceGrid.heights.length);
        for (const row of variant.priceGrid.prices) {
          expect(row).toHaveLength(variant.priceGrid.widths.length);
        }
      }
    }
  });

  it('charges supplier cost plus exactly 10 percent', () => {
    for (const product of VALUE_PRODUCTS) {
      const catalogProduct = getValueCatalogProduct(product);
      const variant = catalogProduct.variants[0];
      const result = calculateStorefrontPrice(variant.priceGrid, 36, 48);
      expect(result).not.toBeNull();
      expect(result!.price).toBeCloseTo(result!.supplierCost * (1 + BROKER_MARKUP_RATE), 2);
      expect(result!.brokerFee).toBeCloseTo(result!.price - result!.supplierCost, 2);
    }
  });

  it('publishes a positive starting price for all three products', () => {
    expect(VALUE_PRODUCTS.every((product) => getStartingPrice(product) > 0)).toBe(true);
  });

  it('applies the cellular room-darkening surcharge before dealer cost and broker fee', () => {
    const product = VALUE_PRODUCTS[0];
    const variant = getValueCatalogProduct(product).variants[0];
    const lightFiltering = calculateConfiguredStorefrontPrice({
      productSlug: product.catalogSlug,
      variantId: variant.id,
      width: 36,
      height: 48,
      lightControl: 'Light filtering',
    });
    const roomDarkening = calculateConfiguredStorefrontPrice({
      productSlug: product.catalogSlug,
      variantId: variant.id,
      width: 36,
      height: 48,
      lightControl: 'Room darkening',
    });
    expect(lightFiltering?.price).toBe(96.03);
    expect(roomDarkening?.retailPrice).toBe(349.2);
    expect(roomDarkening?.supplierCost).toBe(104.76);
    expect(roomDarkening?.brokerFee).toBe(10.48);
    expect(roomDarkening?.price).toBe(115.24);
  });

  it('passes through supplier freight without a markup', () => {
    expect(calculateStorefrontFreight([{ width: 36 }])).toBe(25);
    expect(calculateStorefrontFreight([{ width: 36 }, { width: 48 }])).toBe(36);
    expect(calculateStorefrontFreight([{ width: 96 }, { width: 48 }, { width: 90 }])).toBe(141);
  });
});
