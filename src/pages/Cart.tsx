import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2, ArrowLeftRight, Plus, ShoppingCart, CreditCard, X, ChevronDown, ChevronUp, Clock, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import InlineProductPicker from '@/components/InlineProductPicker';
import ProductCategoryComparison from '@/components/ProductCategoryComparison';
import CartBulkProductSwap from '@/components/cart/CartBulkProductSwap';
import { ALL_PRODUCTS, PRODUCTS_BY_CATEGORY } from '@/data/catalog-index';
import { PRODUCT_CATEGORIES, getProductSlugForBrand } from '@/data/product-categories';
import { calculateShipping } from '@/lib/shipping';
import { PRICE_MULTIPLIER } from '@/lib/constants';

// ── Lift system and motorization options per product ──
function getProductOptions(productId: string) {
  const product = ALL_PRODUCTS.find(p => p.slug === productId);
  if (!product) return { liftSystems: [], motorization: [], timeline: '4-6 weeks' };

  const isShutter = product.category === 'shutters' || product.slug.includes('shutter');
  const timeline = isShutter ? '6-8 weeks' : '4-6 weeks';

  return {
    liftSystems: product.liftSystems || [],
    motorization: product.motorization?.available
      ? (product.surcharges || []).filter(s => s.name.toLowerCase().includes('motor'))
      : [],
    timeline,
  };
}

// ── Swatch selection storage ──
interface SwatchSelection {
  swatchId: string; swatchName: string; swatchCollection: string;
  swatchImageUrl: string; swatchColor?: string; swatchOpacity?: string;
}
function loadSwatchSelections(): Record<string, SwatchSelection> {
  try { return JSON.parse(localStorage.getItem('snapshades_swatches') || '{}'); }
  catch { return {}; }
}

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart, rooms, loading,
    removeWindow, updateWindow,
    subtotal, tax, grandTotal, windowCount,
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [expandedWindows, setExpandedWindows] = useState<Set<string>>(new Set());

  const editingWindow = editingWindowId ? cart.find(w => w.id === editingWindowId) : null;

  // Calculate shipping from cart items
  const shippingItems = cart
    .filter(w => w.productId && w.width)
    .map(w => ({ productSlug: w.productId, width: w.width, height: w.height }));
  const shippingQuote = calculateShipping(shippingItems);
  const totalWithShipping = grandTotal + shippingQuote.subtotal;

  const toggleExpand = (id: string) => {
    setExpandedWindows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (windowCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-sm mx-auto px-4 text-center">
          <div className="text-7xl mb-6">🪟</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your windows are waiting</h2>
          <p className="text-gray-500 mb-8">
            Measure your windows in under 5 minutes using just your phone camera. We'll handle the rest.
          </p>
          <Button
            onClick={() => navigate('/start')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-5 font-semibold text-base"
          >
            Start Measuring — It's Free
          </Button>
          <p className="mt-4 text-xs text-gray-400">No account needed • Manufacturer-direct pricing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold text-gray-900">{windowCount} item{windowCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </nav>

      {/* Product Edit Modal — two-phase:
          (1) ProductCategoryComparison — compare all 9 categories side-by-side
          (2) InlineProductPicker — pick brand + variant within the chosen category */}
      {editingWindow && (
        <div
          className="fixed inset-0 bg-ink/60 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10"
          onClick={() => { setEditingWindowId(null); setEditCategoryId(null); }}
        >
          <div
            className="bg-card rounded-xl max-w-2xl w-full p-6 relative shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setEditingWindowId(null); setEditCategoryId(null); }}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-sand-deep text-warm-gray-500 hover:text-ink flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="text-xs font-medium uppercase tracking-wider text-warm-gray-500">
              {editingWindow.room} / {editingWindow.name}
            </p>

            {!editCategoryId ? (
              <div className="mt-2">
                <ProductCategoryComparison
                  width={editingWindow.width}
                  height={editingWindow.height}
                  depth={editingWindow.depth}
                  onSelect={(categoryId) => setEditCategoryId(categoryId)}
                  title="Change window covering"
                />
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditCategoryId(null)}
                  className="mt-2 mb-3 text-xs text-warm-gray-500 hover:text-ink inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Compare all categories
                </button>
                <InlineProductPicker
                  width={editingWindow.width}
                  height={editingWindow.height}
                  depth={editingWindow.depth}
                  initialProduct={
                    // Seed picker with the cheapest product in the chosen category
                    (() => {
                      const cat = PRODUCT_CATEGORIES.find((c) => c.id === editCategoryId);
                      if (!cat) return editingWindow.productId;
                      return getProductSlugForBrand(cat.id, 'norman')
                        ?? getProductSlugForBrand(cat.id, 'levolor')
                        ?? cat.brands[0]?.productSlug
                        ?? editingWindow.productId;
                    })()
                  }
                  onComplete={(selection) => {
                    const price = (selection as unknown as Record<string, unknown>).price as number | undefined;
                    const product = ALL_PRODUCTS.find((p) => p.slug === selection.productSlug);
                    updateWindow(editingWindow.id, {
                      product: selection.productName,
                      productId: selection.productSlug,
                      manufacturer: product?.brand ?? editingWindow.manufacturer,
                      ...(price ? {
                        customerPrice: price,
                        retailPrice: Math.round((price / PRICE_MULTIPLIER) * 100) / 100,
                        ourCost: Math.round((price / PRICE_MULTIPLIER) * 0.30 * 100) / 100,
                      } : {}),
                    });
                    setEditingWindowId(null);
                    setEditCategoryId(null);
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink tracking-tight mb-6">Your Project</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bulk product-type + manufacturer swap panel.
                Updates product + customerPrice per window. Shipping is
                excluded from these prices (recalculated in the summary). */}
            <CartBulkProductSwap
              cart={cart}
              onApply={({ windowId, productId, productName, manufacturer, price }) => {
                if (!windowId) return;
                updateWindow(windowId, {
                  product: productName,
                  productId,
                  manufacturer,
                  customerPrice: price,
                  retailPrice: Math.round((price / PRICE_MULTIPLIER) * 100) / 100,
                  ourCost: Math.round((price / PRICE_MULTIPLIER) * 0.30 * 100) / 100,
                });
              }}
            />
            {Object.entries(rooms).map(([room, windows]) => (
              <Card key={room}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🏠 {room}
                    <span className="text-xs text-gray-400 font-normal">
                      {windows.length} window{windows.length > 1 ? 's' : ''}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {windows.map(w => {
                      const options = getProductOptions(w.productId);
                      const isExpanded = expandedWindows.has(w.id);
                      const swatches = loadSwatchSelections();
                      const swatch = swatches[w.id];

                      return (
                        <div key={w.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          {/* Main row */}
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{w.name}</h4>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {w.width}" × {w.height}" × {w.depth}" deep
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {w.manufacturer} — {w.product}
                                </p>
                                {/* Manufacturing timeline */}
                                <div className="flex items-center gap-1 mt-1.5">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span className="text-xs text-amber-600 font-medium">
                                    Made to order ({options.timeline})
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">${w.customerPrice.toFixed(2)}</div>
                              </div>
                            </div>

                            {/* Swatch display */}
                            {swatch && (
                              <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                  {swatch.swatchImageUrl ? (
                                    <img src={swatch.swatchImageUrl} alt={swatch.swatchName} className="w-full h-full object-cover" />
                                  ) : swatch.swatchColor ? (
                                    <div className="w-full h-full" style={{ backgroundColor: swatch.swatchColor }} />
                                  ) : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">{swatch.swatchName}</p>
                                  <p className="text-xs text-gray-400 truncate">{swatch.swatchCollection}</p>
                                </div>
                                {swatch.swatchOpacity && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                    swatch.swatchOpacity === 'sheer' ? 'bg-yellow-100 text-yellow-700' :
                                    swatch.swatchOpacity === 'light-filtering' ? 'bg-blue-100 text-blue-700' :
                                    swatch.swatchOpacity === 'room-darkening' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-800 text-white'
                                  }`}>{swatch.swatchOpacity.replace('-', ' ')}</span>
                                )}
                              </div>
                            )}

                            {/* Actions row */}
                            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                              <div className="flex gap-2 items-center flex-wrap">
                                <button
                                  onClick={() => { setEditingWindowId(w.id); setEditCategoryId(null); }}
                                  className="inline-flex items-center gap-1.5 bg-clay hover:bg-clay-hover text-primary-foreground text-xs font-semibold rounded-md px-3 py-1.5 transition-colors"
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" />
                                  Change product
                                </button>
                                {(options.liftSystems.length > 0 || options.motorization.length > 0) && (
                                  <button
                                    onClick={() => toggleExpand(w.id)}
                                    className="inline-flex items-center gap-1 text-xs text-warm-gray-500 hover:text-ink font-medium rounded-md px-2 py-1.5 border border-border hover:border-ink/30"
                                  >
                                    Options
                                    {isExpanded
                                      ? <ChevronUp className="w-3 h-3" />
                                      : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                )}
                              </div>
                              <button
                                className="text-xs text-warm-gray-500 hover:text-destructive flex items-center gap-1"
                                onClick={() => removeWindow(w.id)}
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>

                          {/* Expandable configuration panel */}
                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                              {/* Lift System */}
                              {options.liftSystems.length > 0 && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-700 block mb-2">Lift System</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      className="text-left px-3 py-2 rounded-lg text-xs border-2 border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                    >
                                      Cordless (Standard)
                                      <span className="block text-[10px] text-blue-500 mt-0.5">Included</span>
                                    </button>
                                    {options.liftSystems.filter(ls => !ls.toLowerCase().includes('cordless')).map(ls => (
                                      <button
                                        key={ls}
                                        className="text-left px-3 py-2 rounded-lg text-xs border border-gray-200 bg-white text-gray-700 hover:border-blue-300 transition-colors"
                                      >
                                        {ls}
                                        <span className="block text-[10px] text-gray-400 mt-0.5">+ surcharge</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Motorization */}
                              {options.motorization.length > 0 && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-700 block mb-2">Motorization</label>
                                  <div className="space-y-2">
                                    <button className="w-full text-left px-3 py-2 rounded-lg text-xs border-2 border-blue-500 bg-blue-50 text-blue-700 font-medium">
                                      Manual (Standard)
                                      <span className="block text-[10px] text-blue-500 mt-0.5">Included</span>
                                    </button>
                                    {options.motorization.map(m => (
                                      <button
                                        key={m.name}
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs border border-gray-200 bg-white text-gray-700 hover:border-blue-300 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{m.name}</span>
                                          <span className="font-semibold text-gray-900">+${m.price}</span>
                                        </div>
                                        {m.description && (
                                          <span className="block text-[10px] text-gray-400 mt-0.5">{m.description}</span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <p className="text-[10px] text-gray-400">
                                Options will be applied at checkout. Final pricing includes all selected upgrades.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full rounded-xl py-6 gap-2 border-dashed border-2"
              onClick={() => navigate('/start')}
            >
              <Plus className="w-5 h-5" /> Add More Windows
            </Button>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Products ({windowCount} windows)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Shipping
                    </span>
                    <span className="font-medium">
                      {shippingQuote.subtotal > 0 ? `$${shippingQuote.subtotal.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  {shippingQuote.estimatedDays !== '—' && (
                    <div className="text-xs text-gray-400 pl-5">
                      Est. delivery: {shippingQuote.estimatedDays}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">${(totalWithShipping).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none"
                    />
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold gap-2"
                  onClick={() => navigate('/checkout')}
                >
                  <CreditCard className="w-5 h-5" /> Checkout
                </Button>

                <div className="mt-3 space-y-1.5 text-center">
                  <p className="text-xs text-gray-400">Secure checkout powered by Stripe</p>
                  <p className="text-xs text-gray-400">Price Guarantee — lowest price, period</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
