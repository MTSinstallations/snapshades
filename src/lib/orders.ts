import { supabase, isSupabaseConfigured } from './supabase';
import type { CartWindow } from '@/hooks/useCart';

// ── Demo-mode order store (localStorage) ──
// When no Supabase backend is configured the storefront still completes real
// orders so the full purchase flow works end-to-end. Orders are persisted
// locally and read back by the confirmation / account pages.
const DEMO_ORDERS_KEY = 'snapshades_orders';

function loadDemoOrders(): Record<string, Record<string, unknown>> {
  try { return JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) || '{}'); }
  catch { return {}; }
}

function saveDemoOrder(order: Record<string, unknown>) {
  const all = loadDemoOrders();
  all[order.id as string] = order;
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(all));
}

interface CheckoutInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: string;
}

interface OrderResult {
  orderId: string;
  orderNumber: string;
  error: string | null;
}

export async function createOrder(
  userId: string,
  projectId: string | null,
  cart: CartWindow[],
  checkout: CheckoutInfo,
  totals: {
    subtotal: number;
    installTotal: number;
    designTotal: number;
    surchargesTotal: number;
    tax: number;
    grandTotal: number;
  },
): Promise<OrderResult> {
  try {
  // Demo mode: persist the order locally and return success so the customer
  // reaches a real confirmation page without a backend.
  if (!isSupabaseConfigured) {
    const orderNumber = `SS-${Date.now().toString().slice(-6)}`;
    const orderId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `demo-${Date.now()}`;
    const order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: userId,
      project_id: projectId,
      email: checkout.email,
      full_name: `${checkout.firstName} ${checkout.lastName}`.trim(),
      phone: checkout.phone,
      subtotal: totals.subtotal,
      install_total: totals.installTotal,
      design_total: totals.designTotal,
      surcharges_total: totals.surchargesTotal,
      shipping_total: 0,
      tax_total: totals.tax,
      grand_total: totals.grandTotal,
      payment_method: checkout.paymentMethod,
      payment_status: 'pending',
      status: 'pending',
      created_at: new Date().toISOString(),
      items: cart,
      shipping_address: {
        line1: checkout.address1,
        line2: checkout.address2,
        city: checkout.city,
        state: checkout.state,
        zip: checkout.zip,
      },
    };
    saveDemoOrder(order);
    return { orderId, orderNumber, error: null };
  }

  // Generate order number
  const { data: seqData } = await supabase
    .rpc('generate_order_number');

  const orderNumber = seqData || `SS-${Date.now().toString().slice(-6)}`;

  // Ensure customer record exists
  await supabase.from('customers').upsert({
    id: userId,
    email: checkout.email,
    full_name: `${checkout.firstName} ${checkout.lastName}`.trim(),
    phone: checkout.phone,
    address_line1: checkout.address1,
    address_line2: checkout.address2,
    city: checkout.city,
    state: checkout.state,
    zip: checkout.zip,
  });

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      project_id: projectId,
      customer_id: userId,
      order_number: orderNumber,
      subtotal: totals.subtotal,
      install_total: totals.installTotal,
      design_total: totals.designTotal,
      surcharges_total: totals.surchargesTotal,
      shipping_total: 0,
      tax_total: totals.tax,
      grand_total: totals.grandTotal,
      payment_status: 'pending',
      status: 'pending',
      shipping_address: {
        line1: checkout.address1,
        line2: checkout.address2,
        city: checkout.city,
        state: checkout.state,
        zip: checkout.zip,
      },
    })
    .select('id, order_number')
    .single();

  if (orderErr || !order) {
    return { orderId: '', orderNumber: '', error: orderErr?.message || 'Failed to create order' };
  }

  // Update project status if we have one
  if (projectId) {
    await supabase
      .from('projects')
      .update({ status: 'ordered' })
      .eq('id', projectId);
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    error: null,
  };
  } catch (err: unknown) {
    return { orderId: '', orderNumber: '', error: err instanceof Error ? err.message : 'Unexpected error creating order' };
  }
}

export async function getOrder(orderId: string) {
  if (!isSupabaseConfigured) {
    return { order: loadDemoOrders()[orderId] || null, error: null };
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  return { order: data, error };
}

export async function getOrderByNumber(orderNumber: string) {
  if (!isSupabaseConfigured) {
    const match = Object.values(loadDemoOrders()).find(o => o.order_number === orderNumber);
    return { order: match || null, error: null };
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();
  return { order: data, error };
}

/** All demo orders, newest first — used by the account/orders view in demo mode. */
export function getDemoOrders(): Record<string, unknown>[] {
  return Object.values(loadDemoOrders())
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}
