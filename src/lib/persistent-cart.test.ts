import { normalizeStorefrontCart } from './persistent-cart';

const currentCellular = {
  id: 'f7d2949d-bcba-4df7-a836-335354f60195',
  room: 'Living room',
  name: 'Cellular Shades',
  width: 36,
  height: 48,
  depth: 0,
  mountType: 'inside',
  productOptions: {
    color: 'Cloud White',
    colorCode: 'C5004',
    lightControl: 'Light filtering',
    construction: '9/16" Cordless Single Cell',
  },
  product: 'Cellular Shades',
  productId: 'portrait-honeycomb-shades',
  variantId: 'honeycomb-916-single',
  manufacturer: 'Norman®',
  retailPrice: 1,
  ourCost: 1,
  customerPrice: 1,
  tier: 'ship',
  installFee: 999,
  designFee: 999,
  surchargesTotal: 999,
};

describe('normalizeStorefrontCart', () => {
  it('drops retired provisional products instead of showing stale checkout totals', () => {
    expect(normalizeStorefrontCart([{ ...currentCellular, productId: 'onyx-honeycomb' }])).toEqual([]);
  });

  it('reprices current items and resets unsupported service fees', () => {
    const [item] = normalizeStorefrontCart([currentCellular]);
    expect(item).toMatchObject({
      productId: 'portrait-honeycomb-shades',
      manufacturer: 'Norman®',
      retailPrice: 291,
      ourCost: 87.3,
      customerPrice: 96.03,
      installFee: 0,
      designFee: 0,
      surchargesTotal: 0,
    });
  });

  it('rejects color names that do not match a supplier order code', () => {
    expect(normalizeStorefrontCart([{
      ...currentCellular,
      productOptions: { ...currentCellular.productOptions, colorCode: 'NOT-A-SKU' },
    }])).toEqual([]);
  });

  it('rejects faux-wood dimensions above the 48 square-foot supplier limit', () => {
    expect(normalizeStorefrontCart([{
      ...currentCellular,
      product: 'Faux Wood Blinds',
      productId: 'ultimate-faux-wood-blinds',
      variantId: 'ultimate-faux-2-25',
      width: 96,
      height: 96,
      productOptions: {
        color: 'Pearl',
        colorCode: 'P006',
        lightControl: 'Tilting slats',
        controlSide: 'Right',
        slatSize: '2"',
      },
    }])).toEqual([]);
  });
});
