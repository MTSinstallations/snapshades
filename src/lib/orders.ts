import { supabase } from './supabase';
import type { CartWindow } from '@/hooks/useCart';

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
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  return { order: data, error };
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();
  return { order: data, error };
}
