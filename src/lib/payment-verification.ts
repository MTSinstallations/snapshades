export interface PaymentBreakdownInput {
  subtotalCents: number;
  shippingCents: number;
  amountTotal: number | null;
  amountTax?: number | null;
  amountShipping?: number | null;
}

export interface PaymentBreakdownResult {
  valid: boolean;
  expectedPreTax: number;
  taxCents: number | null;
}

/** Verifies a signed Stripe total against server-owned product and freight cents. */
export function verifyStorefrontPayment(input: PaymentBreakdownInput): PaymentBreakdownResult {
  const expectedPreTax = input.subtotalCents + input.shippingCents;
  const taxCents = input.amountTax ?? (input.amountTotal === null ? null : input.amountTotal - expectedPreTax);
  const totalMatches = input.amountTotal !== null
    && taxCents !== null
    && taxCents >= 0
    && taxCents <= Math.round(expectedPreTax * 0.25)
    && input.amountTotal === expectedPreTax + taxCents;
  const shippingMatches = input.amountShipping === undefined
    || input.amountShipping === null
    || input.amountShipping === input.shippingCents;

  return { valid: totalMatches && shippingMatches, expectedPreTax, taxCents };
}
