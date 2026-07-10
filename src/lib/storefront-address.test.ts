import { CONTIGUOUS_US_STATES, isSupportedShippingState } from './storefront-address';

describe('storefront shipping coverage', () => {
  it('covers the 48 contiguous states only', () => {
    expect(CONTIGUOUS_US_STATES).toHaveLength(48);
    expect(isSupportedShippingState('CA')).toBe(true);
    expect(isSupportedShippingState('ak')).toBe(false);
    expect(isSupportedShippingState('HI')).toBe(false);
  });
});
