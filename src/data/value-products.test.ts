import { BROKER_MARKUP_RATE } from '@/lib/constants';
import { VALUE_PRODUCTS, getStartingPrice, getValueCatalogProduct } from './value-products';
import { getCustomerPrice } from './catalog-index';

describe('value product catalog', () => {
  it('contains exactly the three approved product families', () => {
    expect(VALUE_PRODUCTS.map((product) => product.id)).toEqual([
      'cellular',
      'roller',
      'faux-wood',
    ]);
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
      const result = getCustomerPrice(variant.priceGrid, 36, 48);
      expect(result).not.toBeNull();
      expect(result!.price).toBeCloseTo(result!.supplierCost * (1 + BROKER_MARKUP_RATE), 2);
      expect(result!.brokerFee).toBeCloseTo(result!.price - result!.supplierCost, 2);
    }
  });

  it('publishes a positive starting price for all three products', () => {
    expect(VALUE_PRODUCTS.every((product) => getStartingPrice(product) > 0)).toBe(true);
  });
});

