import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  loadLocalCart, saveLocalCart, clearLocalCart,
  saveCartToSupabase, loadCartFromSupabase,
  loadLocalCheckout, saveLocalCheckout, type SavedCheckout,
} from '@/lib/persistent-cart';
import { calculateStorefrontFreight } from '@/lib/pricing-rates';

export type MountType = 'inside' | 'outside';

export interface CartWindow {
  id: string;
  room: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  mountType?: MountType;
  productOptions?: Record<string, string>;
  product: string;
  productId: string;
  variantId: string;
  manufacturer: string;
  retailPrice: number;
  ourCost: number;
  customerPrice: number;
  tier: 'ship' | 'install' | 'design';
  installFee: number;
  designFee: number;
  surchargesTotal: number;
}

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartWindow[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCheckout, setSavedCheckout] = useState<SavedCheckout | null>(null);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load cart: Supabase if logged in, localStorage otherwise
  useEffect(() => {
    const load = async () => {
      if (user) {
        // Try Supabase first
        const { cart: cloudCart, projectId: cloudPid } = await loadCartFromSupabase(user.id);
        if (cloudCart.length > 0) {
          setCart(cloudCart);
          setProjectId(cloudPid);
        } else {
          // Fall back to localStorage (started as guest, now logged in)
          const local = loadLocalCart();
          setCart(local);
          // Sync local cart to Supabase
          if (local.length > 0) {
            const pid = await saveCartToSupabase(user.id, local);
            setProjectId(pid);
          }
        }
      } else {
        setCart(loadLocalCart());
      }
      setSavedCheckout(loadLocalCheckout());
      setLoading(false);
    };
    load();
  }, [user]);

  // Auto-save: debounced write to localStorage + Supabase
  useEffect(() => {
    if (loading) return;
    saveLocalCart(cart);

    // Debounced Supabase sync (2s after last change)
    if (user && cart.length > 0) {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      syncTimeout.current = setTimeout(async () => {
        const pid = await saveCartToSupabase(user.id, cart, projectId);
        if (pid && !projectId) setProjectId(pid);
      }, 2000);
    }

    return () => { if (syncTimeout.current) clearTimeout(syncTimeout.current); };
  }, [cart, loading, user, projectId]);

  const addWindow = useCallback((item: CartWindow) => {
    setCart(prev => [...prev, item]);
  }, []);

  const removeWindow = useCallback((id: string) => {
    setCart(prev => prev.filter(w => w.id !== id));
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<CartWindow>) => {
    setCart(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const changeTier = useCallback((id: string, tier: 'ship' | 'install' | 'design') => {
    setCart(prev => prev.map(w => {
      if (w.id !== id) return w;
      return {
        ...w, tier,
        installFee: tier === 'ship' ? 0 : 50,
        designFee: tier === 'design' ? 50 : 0,
      };
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setProjectId(null);
    clearLocalCart();
  }, []);

  const saveCheckoutProgress = useCallback((data: SavedCheckout) => {
    setSavedCheckout(data);
    saveLocalCheckout(data);
  }, []);

  // Force sync to Supabase (used at checkout)
  const syncToSupabase = useCallback(async (): Promise<string | null> => {
    if (!user || cart.length === 0) return null;
    const pid = await saveCartToSupabase(user.id, cart, projectId);
    if (pid) setProjectId(pid);
    return pid;
  }, [user, cart, projectId]);

  // Totals
  const subtotal = cart.reduce((sum, w) => sum + w.customerPrice, 0);
  const installTotal = cart.reduce((sum, w) => sum + w.installFee, 0);
  const designTotal = cart.reduce((sum, w) => sum + w.designFee, 0);
  const surchargesTotal = cart.reduce((sum, w) => sum + w.surchargesTotal, 0);
  const shippingTotal = calculateStorefrontFreight(cart);
  // Exact destination tax is calculated by Stripe Tax in secure checkout.
  const tax = 0;
  const grandTotal = Math.round((subtotal + installTotal + designTotal + surchargesTotal + shippingTotal) * 100) / 100;

  const rooms: Record<string, CartWindow[]> = {};
  cart.forEach(w => {
    if (!rooms[w.room]) rooms[w.room] = [];
    rooms[w.room].push(w);
  });

  return {
    cart, rooms, loading, projectId,
    addWindow, removeWindow, updateWindow, changeTier, clearCart,
    syncToSupabase, saveCheckoutProgress, savedCheckout,
    subtotal, installTotal, designTotal, surchargesTotal, shippingTotal, tax, grandTotal,
    windowCount: cart.length,
  };
}
