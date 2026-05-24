/**
 * SnapShades Payment Engine
 * 
 * SUPPORTED PAYMENT METHODS:
 * 1. Credit/Debit Cards (Stripe) — Visa, Mastercard, Amex, Discover
 * 2. Apple Pay (Stripe)
 * 3. Google Pay (Stripe)
 * 4. PayPal
 * 5. Venmo (via PayPal SDK)
 * 6. Zelle (manual verification)
 * 7. Stablecoins — USDC, USDT (via Coinbase Commerce or Circle)
 * 8. Affirm / Klarna (Buy Now Pay Later via Stripe)
 * 9. ACH Bank Transfer (Stripe)
 * 
 * ARCHITECTURE:
 * - Stripe is the primary processor (cards, wallets, BNPL, ACH)
 * - PayPal SDK handles PayPal + Venmo
 * - Crypto via Coinbase Commerce API
 * - Zelle is manual (customer sends, we verify)
 * - All payments create a unified PaymentRecord
 */

// ============================================================
// TYPES
// ============================================================

export type PaymentMethod =
  | 'card'           // Visa, MC, Amex, Discover
  | 'apple_pay'      // Apple Pay (Stripe)
  | 'google_pay'     // Google Pay (Stripe)
  | 'paypal'         // PayPal
  | 'venmo'          // Venmo (via PayPal)
  | 'zelle'          // Zelle (manual)
  | 'usdc'           // USD Coin (stablecoin)
  | 'usdt'           // Tether (stablecoin)
  | 'affirm'         // Buy Now Pay Later
  | 'klarna'         // Buy Now Pay Later
  | 'ach'            // ACH Bank Transfer
  | 'cashapp';       // Cash App

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'requires_action'  // 3D Secure, crypto confirmation, etc.
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partial_refund';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: string;        // emoji
  description: string;
  processor: 'stripe' | 'paypal' | 'coinbase' | 'manual';
  category: 'card' | 'wallet' | 'crypto' | 'bnpl' | 'bank' | 'p2p';
  enabled: boolean;
  processingFee: string;   // Display string
  processingTime: string;  // Display string
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  
  // Amount
  subtotal: number;
  installTotal: number;
  designTotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  
  // Method
  method: PaymentMethod;
  methodName: string;
  processor: string;
  
  // Processor references
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  paypalOrderId?: string;
  paypalTransactionId?: string;
  coinbaseChargeId?: string;
  coinbaseChargeCode?: string;
  zelleReferenceNumber?: string;
  cashappCashtag?: string;
  
  // Card details (if card payment)
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  
  // Crypto details
  cryptoNetwork?: string;
  cryptoTxHash?: string;
  cryptoWalletAddress?: string;
  cryptoAmount?: string;
  cryptoCurrency?: string;
  
  // Status
  status: PaymentStatus;
  statusHistory: { status: PaymentStatus; timestamp: string; note?: string }[];
  
  // Refund
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  
  // Timestamps
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface CheckoutSession {
  id: string;
  orderId: string;
  orderNumber: string;
  
  // Cart totals
  subtotal: number;
  installTotal: number;
  designTotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  promoCode?: string;
  grandTotal: number;
  
  // Customer
  customerEmail: string;
  customerName: string;
  
  // Selected method
  selectedMethod?: PaymentMethod;
  
  // Stripe
  stripeClientSecret?: string;
  
  // Status
  status: 'open' | 'processing' | 'complete' | 'expired';
  expiresAt: string;
  
  createdAt: string;
}

// ============================================================
// PAYMENT METHOD CONFIGURATIONS
// ============================================================

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  // Cards (via Stripe)
  {
    id: 'card',
    name: 'Credit or Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, American Express, Discover',
    processor: 'stripe',
    category: 'card',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: 'Instant',
  },
  
  // Digital Wallets
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '🍎',
    description: 'Pay with Face ID or Touch ID',
    processor: 'stripe',
    category: 'wallet',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: 'Instant',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: '🔵',
    description: 'Pay with your Google account',
    processor: 'stripe',
    category: 'wallet',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: 'Instant',
  },
  
  // PayPal ecosystem
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay with your PayPal balance or linked accounts',
    processor: 'paypal',
    category: 'wallet',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: 'Instant',
  },
  {
    id: 'venmo',
    name: 'Venmo',
    icon: '✌️',
    description: 'Pay with your Venmo balance',
    processor: 'paypal',
    category: 'p2p',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: 'Instant',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    icon: '💲',
    description: 'Pay with Cash App',
    processor: 'manual',
    category: 'p2p',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: '1-2 hours (manual verification)',
  },
  
  // Bank
  {
    id: 'zelle',
    name: 'Zelle',
    icon: '🏦',
    description: 'Send directly from your bank app',
    processor: 'manual',
    category: 'bank',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: '1-2 hours (manual verification)',
  },
  {
    id: 'ach',
    name: 'Bank Transfer (ACH)',
    icon: '🏛️',
    description: 'Direct bank debit — save on processing fees',
    processor: 'stripe',
    category: 'bank',
    enabled: true,
    processingFee: 'Save 1.5%',
    processingTime: '3-5 business days',
  },
  
  // Crypto / Stablecoins
  {
    id: 'usdc',
    name: 'USD Coin (USDC)',
    icon: '🪙',
    description: 'Pay with USDC on Ethereum, Polygon, or Solana',
    processor: 'coinbase',
    category: 'crypto',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: '1-5 minutes (blockchain confirmation)',
  },
  {
    id: 'usdt',
    name: 'Tether (USDT)',
    icon: '💎',
    description: 'Pay with USDT on Ethereum or Tron',
    processor: 'coinbase',
    category: 'crypto',
    enabled: true,
    processingFee: 'No extra fee',
    processingTime: '1-5 minutes (blockchain confirmation)',
  },
  
  // Buy Now Pay Later
  {
    id: 'affirm',
    name: 'Affirm',
    icon: '📅',
    description: 'Pay over time — 0% APR available',
    processor: 'stripe',
    category: 'bnpl',
    enabled: true,
    processingFee: 'No extra fee to you',
    processingTime: 'Instant approval',
    minAmount: 50,
    maxAmount: 30000,
  },
  {
    id: 'klarna',
    name: 'Klarna',
    icon: '🛍️',
    description: 'Pay in 4 interest-free installments',
    processor: 'stripe',
    category: 'bnpl',
    enabled: true,
    processingFee: 'No extra fee to you',
    processingTime: 'Instant approval',
    minAmount: 35,
    maxAmount: 10000,
  },
];

export const PAYMENT_CATEGORIES = [
  { key: 'card', label: 'Card', icon: '💳' },
  { key: 'wallet', label: 'Digital Wallet', icon: '📱' },
  { key: 'p2p', label: 'Send Money', icon: '💸' },
  { key: 'bank', label: 'Bank', icon: '🏦' },
  { key: 'crypto', label: 'Crypto', icon: '🪙' },
  { key: 'bnpl', label: 'Pay Later', icon: '📅' },
];

// ============================================================
// PAYMENT PROCESSING
// ============================================================

/**
 * Create a Stripe Payment Intent (server-side in production)
 */
export async function createStripePaymentIntent(
  amount: number,
  currency: string = 'usd',
  method: PaymentMethod,
  metadata: Record<string, string>,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // In production: POST to /api/payments/create-intent
  // Stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency, ... })
  return {
    clientSecret: `pi_demo_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
    paymentIntentId: `pi_demo_${Date.now()}`,
  };
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  amount: number,
  orderNumber: string,
): Promise<{ orderId: string; approveUrl: string }> {
  // In production: POST to PayPal Orders API
  return {
    orderId: `PP-${Date.now()}`,
    approveUrl: `https://www.paypal.com/checkoutnow?token=demo_${Date.now()}`,
  };
}

/**
 * Create a Coinbase Commerce charge for crypto payments
 */
export async function createCryptoCharge(
  amount: number,
  currency: 'USDC' | 'USDT',
  orderNumber: string,
): Promise<{ chargeId: string; chargeCode: string; walletAddress: string; qrCodeUrl: string; expiresAt: string }> {
  // In production: POST to Coinbase Commerce API
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 60);
  
  return {
    chargeId: `CB-${Date.now()}`,
    chargeCode: `SNAP${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    walletAddress: currency === 'USDC' 
      ? '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD3e'
      : 'TN3W4wSTR82yw11223344556677889900ab',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${amount}_${currency}`,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Generate Zelle payment instructions
 */
export function getZelleInstructions(amount: number, orderNumber: string): {
  recipientEmail: string;
  recipientName: string;
  amount: number;
  memo: string;
  instructions: string[];
} {
  return {
    recipientEmail: 'payments@snapshades.com',
    recipientName: 'SnapShades LLC',
    amount,
    memo: `Order #${orderNumber}`,
    instructions: [
      'Open your bank app or the Zelle app',
      'Send payment to: payments@snapshades.com',
      `Amount: $${amount.toFixed(2)}`,
      `Memo: Order #${orderNumber}`,
      'Your order will be confirmed within 1-2 hours after we verify the payment',
    ],
  };
}

/**
 * Generate Cash App payment instructions
 */
export function getCashAppInstructions(amount: number, orderNumber: string): {
  cashtag: string;
  amount: number;
  note: string;
  instructions: string[];
} {
  return {
    cashtag: '$SnapShades',
    amount,
    note: `Order #${orderNumber}`,
    instructions: [
      'Open Cash App',
      'Send payment to: $SnapShades',
      `Amount: $${amount.toFixed(2)}`,
      `Note: Order #${orderNumber}`,
      'Your order will be confirmed within 1-2 hours after verification',
    ],
  };
}

/**
 * Calculate processing fee for display
 */
export function getProcessingFee(method: PaymentMethod, amount: number): number {
  switch (method) {
    case 'card':
    case 'apple_pay':
    case 'google_pay':
      return Math.round(amount * 0.029 + 30) / 100; // 2.9% + $0.30 (absorbed by us)
    case 'paypal':
    case 'venmo':
      return Math.round(amount * 0.0349 + 49) / 100; // 3.49% + $0.49
    case 'ach':
      return Math.min(Math.round(amount * 0.008 * 100) / 100, 5); // 0.8% capped at $5
    case 'usdc':
    case 'usdt':
      return 1; // Flat $1 network fee estimate
    case 'zelle':
    case 'cashapp':
      return 0;
    case 'affirm':
    case 'klarna':
      return 0; // BNPL providers charge the merchant, not customer
    default:
      return 0;
  }
}

/**
 * Create a unified PaymentRecord
 */
export function createPaymentRecord(
  orderId: string,
  orderNumber: string,
  customerId: string,
  method: PaymentMethod,
  totals: {
    subtotal: number;
    installTotal: number;
    designTotal: number;
    shippingTotal: number;
    taxTotal: number;
    discountTotal: number;
    grandTotal: number;
  },
): PaymentRecord {
  const config = PAYMENT_METHODS.find(m => m.id === method);
  
  return {
    id: `pay-${Date.now()}`,
    orderId,
    orderNumber,
    customerId,
    ...totals,
    method,
    methodName: config?.name || method,
    processor: config?.processor || 'manual',
    status: 'pending',
    statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  };
}
