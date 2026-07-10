const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: { invoke },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/email-templates', () => ({
  sendEmail: vi.fn(),
  contractorEmails: {},
}));

import { createStorefrontCheckout, type StorefrontCheckoutRequest } from './payment-pipeline';

const request: StorefrontCheckoutRequest = {
  checkoutToken: '21b1320d-8504-4f04-b090-58dca4e445dc',
  contact: {
    email: 'customer@example.com',
    firstName: 'Taylor',
    lastName: 'Customer',
    phone: '805-555-0100',
    address1: '123 Main Street',
    address2: '',
    city: 'Ventura',
    state: 'CA',
    zip: '93001',
  },
  items: [{
    id: 'f7d2949d-bcba-4df7-a836-335354f60195',
    room: 'Living room',
    name: 'Cellular Shades',
    productId: 'portrait-honeycomb-shades',
    variantId: 'honeycomb-916-single',
    width: 36,
    height: 48,
    mountType: 'inside',
    productOptions: {
      color: 'Cloud White',
      colorCode: 'C5004',
      lightControl: 'Light filtering',
      construction: '9/16" Cordless Single Cell',
    },
  }],
};

describe('createStorefrontCheckout', () => {
  beforeEach(() => invoke.mockReset());

  it('sends only product configuration and never trusts browser price fields', async () => {
    invoke.mockResolvedValue({
      data: {
        sessionId: 'cs_test_123',
        checkoutUrl: 'https://checkout.stripe.test/session',
        orderId: '4f605043-83a7-497c-b0b4-46e10814bfa3',
        orderNumber: 'SS-010001',
      },
      error: null,
    });

    const result = await createStorefrontCheckout(request);

    expect(result.error).toBeNull();
    expect(invoke).toHaveBeenCalledWith('create-checkout-session', { body: request });
    const sent = invoke.mock.calls[0][1].body.items[0];
    expect(sent).not.toHaveProperty('customerPrice');
    expect(sent).not.toHaveProperty('ourCost');
    expect(sent).not.toHaveProperty('retailPrice');
  });

  it('preserves a structured cart-change error so checkout can rotate its idempotency token', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        context: new Response(JSON.stringify({
          error: 'Your cart changed. Please submit checkout again.',
          code: 'CHECKOUT_CHANGED',
        }), { status: 409, headers: { 'Content-Type': 'application/json' } }),
      },
    });

    const result = await createStorefrontCheckout(request);
    expect(result.error).toMatch(/cart changed/i);
    expect(result.code).toBe('CHECKOUT_CHANGED');
  });
});
