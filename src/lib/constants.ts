import { BROKER_MARKUP_RATE, DEALER_COST_RATE } from '@/lib/pricing-rates';

/**
 * App-wide constants. Single source of truth.
 */

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://snapshadesandshutters.com';
export const SITE_NAME = 'SnapShades & Shutters';
export const SUPPORT_EMAIL = 'hello@snapshadesandshutters.com';
export const SUPPORT_PHONE = '(888) 555-0123';
export const NORMAN_DEALER_NUMBER = 'R01152';
export { DEALER_COST_RATE, BROKER_MARKUP_RATE };
export const PRICE_MULTIPLIER = DEALER_COST_RATE * (1 + BROKER_MARKUP_RATE); // Retail/MSRP grid × 0.33
export const PLATFORM_FEE_RATE = 0.10; // 10% on contractor jobs
export const DEFAULT_TAX_RATE = 0;
export const CUSTOMER_SHIPPING_RATE = 0;
