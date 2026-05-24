/**
 * Persistent Cart — saves to Supabase when logged in, localStorage as fallback.
 * 
 * Customer leaves mid-checkout → comes back → everything's there.
 * Also syncs across devices (phone starts, desktop finishes).
 */

import { supabase } from './supabase';
import type { CartWindow } from '@/hooks/useCart';

const CART_KEY = 'snapshades_cart';
const PROJECT_KEY = 'snapshades_project_id';
const CHECKOUT_KEY = 'snapshades_checkout';

export interface SavedCheckout {
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
  step: string;
  savedAt: string;
}

// ── Local Storage ──

export function loadLocalCart(): CartWindow[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch { return []; }
}

export function saveLocalCart(cart: CartWindow[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function loadLocalCheckout(): SavedCheckout | null {
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLocalCheckout(data: SavedCheckout) {
  localStorage.setItem(CHECKOUT_KEY, JSON.stringify(data));
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(PROJECT_KEY);
  localStorage.removeItem(CHECKOUT_KEY);
}

// ── Supabase Sync ──

export async function saveCartToSupabase(userId: string, cart: CartWindow[], projectId?: string | null): Promise<string | null> {
  if (cart.length === 0) return null;

  // Create or update project
  let pid = projectId;
  if (!pid) {
    const { data } = await supabase
      .from('projects')
      .insert({
        customer_id: userId,
        name: `Project ${new Date().toLocaleDateString()}`,
        status: 'cart',
        service_tier: cart[0]?.tier || 'ship',
      })
      .select('id')
      .single();
    pid = data?.id || null;
  } else {
    await supabase.from('projects').update({ status: 'cart', updated_at: new Date().toISOString() }).eq('id', pid);
  }

  if (!pid) return null;

  // Save rooms
  const roomNames = [...new Set(cart.map(w => w.room))];
  const roomMap: Record<string, string> = {};

  for (const [i, name] of roomNames.entries()) {
    const { data: existing } = await supabase
      .from('rooms').select('id').eq('project_id', pid).eq('name', name).limit(1).single();

    if (existing) {
      roomMap[name] = existing.id;
    } else {
      const { data: newRoom } = await supabase
        .from('rooms').insert({ project_id: pid, name, sort_order: i }).select('id').single();
      if (newRoom) roomMap[name] = newRoom.id;
    }
  }

  // Save windows
  for (const w of cart) {
    const roomId = roomMap[w.room];
    if (!roomId) continue;
    await supabase.from('windows').upsert({
      id: w.id, room_id: roomId, project_id: pid, name: w.name,
      top_width: w.width, left_height: w.height, right_height: w.height, depth: w.depth,
      product_id: w.productId, variant_id: w.variantId, manufacturer: w.manufacturer,
      service_tier: w.tier, retail_price: w.retailPrice, our_cost: w.ourCost,
      customer_price: w.customerPrice, install_fee: w.installFee, design_fee: w.designFee,
      surcharges_total: w.surchargesTotal,
      total_price: w.customerPrice + w.installFee + w.designFee + w.surchargesTotal,
      status: 'priced',
    });
  }

  localStorage.setItem(PROJECT_KEY, pid);
  return pid;
}

export async function loadCartFromSupabase(userId: string): Promise<{ cart: CartWindow[]; projectId: string | null }> {
  // Find most recent cart/draft project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('customer_id', userId)
    .in('status', ['cart', 'draft', 'measuring', 'selecting'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (!project) return { cart: [], projectId: null };

  // Load windows with room names
  const { data: windows } = await supabase
    .from('windows')
    .select('*, rooms(name)')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  if (!windows || windows.length === 0) return { cart: [], projectId: project.id };

  const cart: CartWindow[] = windows.map(w => ({
    id: w.id,
    room: (w.rooms as { name: string } | null)?.name || 'Room',
    name: w.name || 'Window',
    width: Number(w.top_width) || 0,
    height: Number(w.left_height) || 0,
    depth: Number(w.depth) || 0,
    product: w.product_id || '',
    productId: w.product_id || '',
    variantId: w.variant_id || '',
    manufacturer: w.manufacturer || 'Norman®',
    retailPrice: Number(w.retail_price) || 0,
    ourCost: Number(w.our_cost) || 0,
    customerPrice: Number(w.customer_price) || 0,
    tier: (w.service_tier as 'ship' | 'install' | 'design') || 'ship',
    installFee: Number(w.install_fee) || 0,
    designFee: Number(w.design_fee) || 0,
    surchargesTotal: Number(w.surcharges_total) || 0,
  }));

  return { cart, projectId: project.id };
}
