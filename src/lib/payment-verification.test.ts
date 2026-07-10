import { verifyStorefrontPayment } from './payment-verification';

describe('verifyStorefrontPayment', () => {
  it('accepts Stripe tax on top of server-owned products and freight', () => {
    expect(verifyStorefrontPayment({
      subtotalCents: 9603,
      shippingCents: 2500,
      amountTotal: 13102,
      amountTax: 999,
      amountShipping: 2500,
    })).toEqual({ valid: true, expectedPreTax: 12103, taxCents: 999 });
  });

  it('derives tax from a signed PaymentIntent total', () => {
    expect(verifyStorefrontPayment({
      subtotalCents: 9603,
      shippingCents: 2500,
      amountTotal: 13102,
    }).valid).toBe(true);
  });

  it('rejects changed freight and implausible totals', () => {
    expect(verifyStorefrontPayment({
      subtotalCents: 9603,
      shippingCents: 2500,
      amountTotal: 13102,
      amountTax: 999,
      amountShipping: 0,
    }).valid).toBe(false);
    expect(verifyStorefrontPayment({
      subtotalCents: 9603,
      shippingCents: 2500,
      amountTotal: 17103,
    }).valid).toBe(false);
  });
});
