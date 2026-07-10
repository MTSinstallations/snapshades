import Stripe from 'npm:stripe@^22';
import {
  STOREFRONT_PRICING_VERSION,
  priceStorefrontItem,
} from '../../../src/data/storefront-catalog.ts';
import { calculateStorefrontFreight } from '../../../src/lib/pricing-rates.ts';
import {
  assertPublicPost,
  clientIp,
  getStripeSecret,
  getSupabaseAdmin,
  jsonResponse,
  requestOrigin,
  safeText,
  sha256,
} from '../_shared/runtime.ts';

interface CheckoutContact {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

interface CheckoutItemInput {
  id?: string;
  room?: string;
  name?: string;
  productId?: string;
  variantId?: string;
  width?: number;
  height?: number;
  mountType?: string;
  productOptions?: Record<string, unknown>;
}

interface CheckoutRequest {
  checkoutToken?: string;
  contact?: Partial<CheckoutContact>;
  items?: CheckoutItemInput[];
}

interface PricedItem {
  cartItemId: string | null;
  roomName: string;
  itemName: string;
  productFamily: 'cellular' | 'roller' | 'faux-wood';
  productId: string;
  variantId: string;
  supplierName: string;
  supplierSku: string;
  productName: string;
  mountType: 'inside' | 'outside';
  width: number;
  height: number;
  options: Record<string, string>;
  retailPrice: number;
  supplierCost: number;
  brokerFee: number;
  customerPrice: number;
  gridWidth: number;
  gridHeight: number;
}

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s\-().]{7,20}$/;
const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;
const STATE_PATTERN = /^[A-Z]{2}$/;

const PRODUCT_FAMILY: Record<string, PricedItem['productFamily']> = {
  'portrait-honeycomb-shades': 'cellular',
  'soluna-roller-shades': 'roller',
  'ultimate-faux-wood-blinds': 'faux-wood',
};

const ALLOWED_OPTIONS: Record<string, {
  colors: ReadonlyArray<{ name: string; code: string; lightControl?: string }>;
  lightControls: readonly string[];
}> = {
  'portrait-honeycomb-shades': {
    colors: [
      { name: 'Cloud White', code: 'C5004', lightControl: 'Light filtering' },
      { name: 'Toasted Beige', code: 'C6503', lightControl: 'Light filtering' },
      { name: 'Ashley Gray', code: 'C6101', lightControl: 'Light filtering' },
      { name: 'Eggshell White', code: 'C0001T', lightControl: 'Room darkening' },
      { name: 'Dark Champagne', code: 'C0402T', lightControl: 'Room darkening' },
      { name: 'Annapolis Gray', code: 'C4102T', lightControl: 'Room darkening' },
    ],
    lightControls: ['Light filtering', 'Room darkening'],
  },
  'soluna-roller-shades': {
    colors: [
      { name: 'Pure White', code: 'F1734' },
      { name: 'Natural Tan', code: 'F1736' },
      { name: 'Pebble Gray', code: 'F1738' },
    ],
    lightControls: ['Light filtering'],
  },
  'ultimate-faux-wood-blinds': {
    colors: [
      { name: 'Pearl', code: 'P006' },
      { name: 'Storm Gray', code: 'P075' },
    ],
    lightControls: ['Tilting slats'],
  },
};

function validEighth(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value * 8 - Math.round(value * 8)) < 0.00001;
}

function validateContact(input: CheckoutRequest['contact']): CheckoutContact | null {
  const contact: CheckoutContact = {
    email: safeText(input?.email, 254).toLowerCase(),
    firstName: safeText(input?.firstName, 100),
    lastName: safeText(input?.lastName, 100),
    phone: safeText(input?.phone, 20),
    address1: safeText(input?.address1, 200),
    address2: safeText(input?.address2, 200),
    city: safeText(input?.city, 100),
    state: safeText(input?.state, 2).toUpperCase(),
    zip: safeText(input?.zip, 10),
  };

  if (!EMAIL_PATTERN.test(contact.email)
    || !contact.firstName
    || !contact.lastName
    || !PHONE_PATTERN.test(contact.phone)
    || !contact.address1
    || !contact.city
    || !STATE_PATTERN.test(contact.state)
    || !ZIP_PATTERN.test(contact.zip)) return null;

  return contact;
}

function validateAndPriceItems(items: CheckoutItemInput[] | undefined): PricedItem[] | null {
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) return null;

  const priced: PricedItem[] = [];
  for (const input of items) {
    const productId = safeText(input.productId, 80);
    const variantId = safeText(input.variantId, 100);
    const width = Number(input.width);
    const height = Number(input.height);
    const mountType = input.mountType === 'outside' ? 'outside' : input.mountType === 'inside' ? 'inside' : null;
    const family = PRODUCT_FAMILY[productId];
    const optionsForProduct = ALLOWED_OPTIONS[productId];
    const rawOptions = input.productOptions && typeof input.productOptions === 'object'
      ? input.productOptions
      : {};
    const color = safeText(rawOptions.color, 60);
    const colorCode = safeText(rawOptions.colorCode, 20);
    const lightControl = safeText(rawOptions.lightControl, 60);
    const controlSide = safeText(rawOptions.controlSide, 10);
    const slatSize = safeText(rawOptions.slatSize, 10);
    const allowedColor = optionsForProduct?.colors.find((candidate) => (
      candidate.name === color
      && candidate.code === colorCode
      && (!candidate.lightControl || candidate.lightControl === lightControl)
    ));
    const result = priceStorefrontItem({ productSlug: productId, variantId, width, height, lightControl });

    if (!mountType || !family || !optionsForProduct || !result || !validEighth(width) || !validEighth(height)) {
      return null;
    }
    if (!allowedColor
      || !optionsForProduct.lightControls.includes(lightControl)
      || (family === 'faux-wood' && (!['Left', 'Right'].includes(controlSide) || !['2"', '2½"'].includes(slatSize)))) return null;

    priced.push({
      cartItemId: TOKEN_PATTERN.test(safeText(input.id, 36)) ? safeText(input.id, 36) : null,
      roomName: safeText(input.room, 100) || 'My windows',
      itemName: safeText(input.name, 100) || result.product.name,
      productFamily: family,
      productId,
      variantId,
      supplierName: result.product.brand,
      supplierSku: result.variant.id,
      productName: result.product.name,
      mountType,
      width,
      height,
      options: {
        color,
        colorCode,
        lightControl,
        ...(family === 'faux-wood' ? { controlSide, slatSize } : {}),
        construction: result.variant.name,
      },
      retailPrice: result.price.retailPrice,
      supplierCost: result.price.supplierCost,
      brokerFee: result.price.brokerFee,
      customerPrice: result.price.price,
      gridWidth: result.price.gridWidth,
      gridHeight: result.price.gridHeight,
    });
  }

  return priced;
}

function cents(value: number): number {
  return Math.round(value * 100);
}

function dollars(value: number): number {
  return Math.round(value * 100) / 100;
}

function itemFingerprint(items: PricedItem[]): string {
  return JSON.stringify(items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    width: item.width,
    height: item.height,
    mountType: item.mountType,
    options: Object.fromEntries(Object.entries(item.options).sort(([left], [right]) => left.localeCompare(right))),
  })));
}

async function authenticatedCustomerId(req: Request, contact: CheckoutContact): Promise<string | null> {
  const authorization = req.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return null;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const { error: customerError } = await admin.from('customers').upsert({
    id: data.user.id,
    email: data.user.email || contact.email,
    full_name: `${contact.firstName} ${contact.lastName}`,
    phone: contact.phone,
    address_line1: contact.address1,
    address_line2: contact.address2,
    city: contact.city,
    state: contact.state,
    zip: contact.zip,
  }, { onConflict: 'id' });

  if (customerError) {
    console.error('Could not associate authenticated customer:', customerError.message);
    return null;
  }
  return data.user.id;
}

Deno.serve(async (req: Request) => {
  const earlyResponse = assertPublicPost(req);
  if (earlyResponse) return earlyResponse;

  const origin = requestOrigin(req);
  if (!origin) return jsonResponse(req, { error: 'Checkout must start on the SnapShades website.' }, 403);

  try {
    const body = await req.json() as CheckoutRequest;
    const checkoutToken = safeText(body.checkoutToken, 36);
    const contact = validateContact(body.contact);
    const items = validateAndPriceItems(body.items);
    if (!TOKEN_PATTERN.test(checkoutToken) || !contact || !items) {
      return jsonResponse(req, { error: 'Please review the contact, measurement, and product details.' }, 422);
    }

    const admin = getSupabaseAdmin();
    const rateSalt = Deno.env.get('RATE_LIMIT_SALT') || 'snapshades-checkout';
    const rateKey = await sha256(`${clientIp(req)}:${rateSalt}`);
    const { data: allowed, error: rateError } = await admin.rpc('claim_storefront_checkout_attempt', {
      p_rate_key: rateKey,
      p_limit: 8,
      p_window: '15 minutes',
    });
    if (rateError) throw rateError;
    if (!allowed) return jsonResponse(req, { error: 'Too many checkout attempts. Please wait 15 minutes and try again.' }, 429);

    const fingerprint = await sha256(JSON.stringify({ items: itemFingerprint(items), contact }));
    const subtotal = dollars(items.reduce((sum, item) => sum + item.customerPrice, 0));
    const shippingTotal = calculateStorefrontFreight(items);
    const preTaxTotal = dollars(subtotal + shippingTotal);
    const supplierCostTotal = dollars(items.reduce((sum, item) => sum + item.supplierCost, 0));
    const brokerFeeTotal = dollars(items.reduce((sum, item) => sum + item.brokerFee, 0));
    const stripe = new Stripe(getStripeSecret(), { httpClient: Stripe.createFetchHttpClient() });

    let { data: order } = await admin.from('orders')
      .select('id, order_number, checkout_fingerprint, stripe_checkout_session_id, stripe_customer_id, payment_status, checkout_attempt_count')
      .eq('checkout_token', checkoutToken)
      .maybeSingle();

    if (order && order.checkout_fingerprint !== fingerprint) {
      return jsonResponse(req, { error: 'Your cart changed. Please submit checkout again.', code: 'CHECKOUT_CHANGED' }, 409);
    }

    if (order?.stripe_checkout_session_id) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
        if (existingSession.status === 'open' && existingSession.url) {
          return jsonResponse(req, {
            orderId: order.id,
            orderNumber: order.order_number,
            checkoutUrl: existingSession.url,
            sessionId: existingSession.id,
          });
        }
        if (existingSession.status === 'complete' && existingSession.payment_status === 'paid') {
          return jsonResponse(req, {
            orderId: order.id,
            orderNumber: order.order_number,
            checkoutUrl: `${origin}/order-confirmation?session_id=${encodeURIComponent(existingSession.id)}`,
            sessionId: existingSession.id,
          });
        }
      } catch (error) {
        console.warn('Could not reuse checkout session:', error instanceof Error ? error.message : error);
      }

      // Never open a second payment session for an order the server already
      // considers paid, even if Stripe retrieval is temporarily unavailable.
      if (order.payment_status === 'paid') {
        return jsonResponse(req, {
          orderId: order.id,
          orderNumber: order.order_number,
          checkoutUrl: `${origin}/order-confirmation?session_id=${encodeURIComponent(order.stripe_checkout_session_id)}`,
          sessionId: order.stripe_checkout_session_id,
        });
      }
    }

    if (!order) {
      const orderId = crypto.randomUUID();
      const { data: generatedOrderNumber } = await admin.rpc('generate_order_number');
      const orderNumber = typeof generatedOrderNumber === 'string' && generatedOrderNumber
        ? generatedOrderNumber
        : `SS-${Date.now()}-${orderId.slice(0, 4).toUpperCase()}`;
      const customerId = await authenticatedCustomerId(req, contact);
      const { data: insertedOrder, error: orderError } = await admin.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        customer_id: customerId,
        subtotal,
        install_total: 0,
        design_total: 0,
        surcharges_total: 0,
        shipping_total: shippingTotal,
        tax_total: 0,
        grand_total: preTaxTotal,
        payment_status: 'pending',
        status: 'pending',
        contact_email: contact.email,
        contact_name: `${contact.firstName} ${contact.lastName}`,
        contact_phone: contact.phone,
        checkout_token: checkoutToken,
        checkout_fingerprint: fingerprint,
        pricing_version: STOREFRONT_PRICING_VERSION,
        source: 'value_storefront',
        currency: 'usd',
        shipping_address: {
          line1: contact.address1,
          line2: contact.address2,
          city: contact.city,
          state: contact.state,
          zip: contact.zip,
          country: 'US',
        },
      }).select('id, order_number, stripe_customer_id, checkout_attempt_count').single();
      if (orderError || !insertedOrder) throw orderError || new Error('Order could not be created.');

      const { error: itemsError } = await admin.from('order_items').insert(items.map((item, index) => ({
        order_id: insertedOrder.id,
        line_number: index + 1,
        cart_item_id: item.cartItemId,
        product_family: item.productFamily,
        product_id: item.productId,
        variant_id: item.variantId,
        supplier_name: item.supplierName,
        supplier_sku: item.supplierSku,
        product_name: item.productName,
        room_name: item.roomName,
        item_name: item.itemName,
        mount_type: item.mountType,
        width: item.width,
        height: item.height,
        quantity: 1,
        product_options: item.options,
        retail_price: item.retailPrice,
        supplier_cost: item.supplierCost,
        broker_fee: item.brokerFee,
        customer_price: item.customerPrice,
        pricing_snapshot: {
          version: STOREFRONT_PRICING_VERSION,
          gridWidth: item.gridWidth,
          gridHeight: item.gridHeight,
          supplierCostRate: 0.30,
          brokerMarkupRate: 0.10,
        },
      })));
      if (itemsError) {
        await admin.from('orders').delete().eq('id', insertedOrder.id);
        throw itemsError;
      }
      order = insertedOrder;
    } else {
      await admin.from('orders').update({
        contact_email: contact.email,
        contact_name: `${contact.firstName} ${contact.lastName}`,
        contact_phone: contact.phone,
        shipping_total: shippingTotal,
        tax_total: 0,
        grand_total: preTaxTotal,
        shipping_address: {
          line1: contact.address1,
          line2: contact.address2,
          city: contact.city,
          state: contact.state,
          zip: contact.zip,
          country: 'US',
        },
      }).eq('id', order.id);
    }

    let stripeCustomerId = order.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: contact.email,
        name: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        address: {
          line1: contact.address1,
          line2: contact.address2 || undefined,
          city: contact.city,
          state: contact.state,
          postal_code: contact.zip,
          country: 'US',
        },
        shipping: {
          name: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          address: {
            line1: contact.address1,
            line2: contact.address2 || undefined,
            city: contact.city,
            state: contact.state,
            postal_code: contact.zip,
            country: 'US',
          },
        },
        metadata: { order_id: order.id, order_number: order.order_number },
      }, { idempotencyKey: `snapshades-customer-${checkoutToken}` });
      stripeCustomerId = customer.id;
      const { error: customerUpdateError } = await admin.from('orders')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', order.id);
      if (customerUpdateError) throw customerUpdateError;
    } else {
      await stripe.customers.update(stripeCustomerId, {
        email: contact.email,
        name: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        address: {
          line1: contact.address1,
          line2: contact.address2 || undefined,
          city: contact.city,
          state: contact.state,
          postal_code: contact.zip,
          country: 'US',
        },
        shipping: {
          name: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          address: {
            line1: contact.address1,
            line2: contact.address2 || undefined,
            city: contact.city,
            state: contact.state,
            postal_code: contact.zip,
            country: 'US',
          },
        },
      });
    }

    const attemptNumber = Number(order.checkout_attempt_count || 0) + 1;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: order.id,
      customer: stripeCustomerId,
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.productName} — ${item.width}" × ${item.height}"`,
            description: `${item.mountType} mount · ${item.options.color} · ${item.options.lightControl}`,
            metadata: {
              product_id: item.productId,
              variant_id: item.variantId,
            },
            tax_code: 'txcd_99999999',
          },
          unit_amount: cents(item.customerPrice),
          tax_behavior: 'exclusive',
        },
        quantity: 1,
      })),
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=true`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        pricing_version: STOREFRONT_PRICING_VERSION,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
        description: `SnapShades order ${order.order_number}`,
        shipping: {
          name: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          address: {
            line1: contact.address1,
            line2: contact.address2 || undefined,
            city: contact.city,
            state: contact.state,
            postal_code: contact.zip,
            country: 'US',
          },
        },
      },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Supplier freight',
          fixed_amount: { amount: cents(shippingTotal), currency: 'usd' },
          tax_behavior: 'exclusive',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 10 },
            maximum: { unit: 'business_day', value: 35 },
          },
        },
      }],
      automatic_tax: { enabled: true },
    }, { idempotencyKey: `snapshades-${checkoutToken}-${attemptNumber}` });

    if (!session.url) throw new Error('Stripe did not return a checkout URL.');

    const { error: sessionUpdateError } = await admin.from('orders').update({
      stripe_checkout_session_id: session.id,
      payment_status: 'processing',
      checkout_attempt_count: attemptNumber,
    }).eq('id', order.id);
    if (sessionUpdateError) throw sessionUpdateError;

    console.log(JSON.stringify({
      event: 'checkout_session_created',
      orderId: order.id,
      orderNumber: order.order_number,
      itemCount: items.length,
      supplierCostTotal,
      brokerFeeTotal,
      shippingTotal,
      preTaxTotal,
    }));

    return jsonResponse(req, {
      sessionId: session.id,
      checkoutUrl: session.url,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error('create-checkout-session failed:', error instanceof Error ? error.message : error);
    return jsonResponse(req, { error: 'Secure checkout is temporarily unavailable. Please try again.' }, 500);
  }
});
