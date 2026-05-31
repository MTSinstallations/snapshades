import SnapShadesLogo from '@/components/SnapShadesLogo';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Truck, Wrench, Palette, Plus, Minus,
  ShoppingCart, Ruler, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_PRODUCTS, PRODUCT_BY_SLUG, getCustomerPrice } from '@/data/catalog-index';
import type { Product } from '@/data/catalog-index';
import { getProductImages } from '@/data/product-images';
import { SWATCHES_BY_PRODUCT, type Swatch } from '@/data/norman-swatches';
import { useCart, type CartWindow } from '@/hooks/useCart';
import { loadLocalCart, saveLocalCart } from '@/lib/persistent-cart';

type Tier = 'ship' | 'install' | 'design';
type CatFilter = 'all' | 'shades' | 'blinds' | 'shutters';

// Flat per-window service fees — mirrors useCart.changeTier so the express
// flow stays consistent with the cart and checkout totals.
const TIER_FEES: Record<Tier, { install: number; design: number }> = {
  ship: { install: 0, design: 0 },
  install: { install: 50, design: 0 },
  design: { install: 50, design: 50 },
};

const TIERS: { id: Tier; label: string; sub: string; icon: typeof Truck; add: number }[] = [
  { id: 'ship', label: 'Ship to Me', sub: 'I’ll install it myself', icon: Truck, add: 0 },
  { id: 'install', label: 'Pro Install', sub: 'A local pro installs it', icon: Wrench, add: 50 },
  { id: 'design', label: 'Design + Install', sub: 'Consult + pro install', icon: Palette, add: 100 },
];

const STEPS = ['Measure', 'Customize', 'Pay'];

/** Cheapest customer price for a product (smallest size in the grid). */
function startingPrice(product: Product): number | null {
  const v = product.variants[0];
  if (!v?.priceGrid?.widths?.length) return null;
  const r = getCustomerPrice(v.priceGrid, v.priceGrid.widths[0], v.priceGrid.heights[0]);
  return r?.price ?? null;
}

function thumb(slug: string): string | null {
  return getProductImages(slug)?.images?.[0]?.url ?? null;
}

export default function QuickOrder() {
  const navigate = useNavigate();
  const { addWindow, windowCount } = useCart();

  const [step, setStep] = useState(1);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState<CatFilter>('all');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mount, setMount] = useState<'inside' | 'outside'>('inside');
  const [variantId, setVariantId] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier>('ship');
  const [swatch, setSwatch] = useState<Swatch | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const product = productSlug ? PRODUCT_BY_SLUG[productSlug] : null;
  const variant = useMemo(
    () => (product ? product.variants.find(v => v.id === variantId) || product.variants[0] : null),
    [product, variantId],
  );
  const swatches = productSlug ? (SWATCHES_BY_PRODUCT[productSlug] || []) : [];

  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const priceResult = variant && w >= 1 && h >= 1 ? getCustomerPrice(variant.priceGrid, w, h) : null;
  const basePrice = priceResult?.price ?? null;
  const sizeEntered = width !== '' && height !== '';
  const sizeOutOfRange = sizeEntered && w >= 1 && h >= 1 && variant != null && basePrice == null;

  const fees = TIER_FEES[tier];
  const perWindow = basePrice != null ? basePrice + fees.install + fees.design : null;
  const orderTotal = perWindow != null ? perWindow * quantity : null;

  const products = useMemo(
    () => (filter === 'all' ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category === filter)),
    [filter],
  );

  const step1Ready = !!product && basePrice != null;

  const resetForNext = () => {
    setStep(1);
    setProductSlug(null);
    setWidth(''); setHeight(''); setQuantity(1); setMount('inside');
    setVariantId(null); setTier('ship'); setSwatch(null);
  };

  /** Add the configured window(s) to the cart. Returns how many were added. */
  const addToCart = (): number => {
    if (!product || !variant || basePrice == null) return 0;
    const items: CartWindow[] = [];
    for (let i = 0; i < quantity; i++) {
      const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `qo-${Date.now()}-${i}`;
      items.push({
        id,
        room: 'My Windows',
        name: mount === 'inside' ? 'Inside Mount' : 'Outside Mount',
        width: w, height: h, depth: 0,
        product: product.name,
        productId: product.slug,
        variantId: variant.id,
        manufacturer: product.brand,
        customerPrice: basePrice,
        retailPrice: Math.ceil((basePrice / 0.36) * 100) / 100,
        ourCost: Math.ceil((basePrice / 0.36) * 0.3 * 100) / 100,
        tier,
        installFee: fees.install,
        designFee: fees.design,
        surchargesTotal: 0,
      });
    }
    items.forEach(item => {
      addWindow(item);
      if (swatch) saveSwatch(item.id, swatch);
    });
    // Persist synchronously so the cart/checkout pages see the items
    // immediately on navigation (addWindow's state write is async).
    saveLocalCart([...loadLocalCart(), ...items]);
    setAddedCount(c => c + items.length);
    return items.length;
  };

  const handleAddAnother = () => {
    addToCart();
    resetForNext();
  };

  const handleCheckout = () => {
    addToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-ink/10 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-ink">Snap<span className="text-clay">Shades</span></span>
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 text-sm font-medium text-warm-gray-500 hover:text-ink transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {windowCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-clay text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {windowCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-ink/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => { if (done) setStep(n); }}
                  disabled={!done}
                  className="flex items-center gap-2 disabled:cursor-default"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    active ? 'bg-clay text-white' : done ? 'bg-clay/15 text-clay' : 'bg-warm-gray-300/30 text-warm-gray-500'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : n}
                  </span>
                  <span className={`text-sm font-semibold ${active ? 'text-ink' : 'text-warm-gray-500'}`}>{label}</span>
                </button>
                {n < STEPS.length && <div className="w-6 sm:w-10 h-px bg-ink/10" />}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-32">
        {/* ───────────── STEP 1 — MEASURE ───────────── */}
        {step === 1 && (
          <div>
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-ink">What are you covering?</h1>
              <p className="text-warm-gray-500 mt-1">Pick a product, then punch in your measurements. You know the drill.</p>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'shades', 'blinds', 'shutters'] as CatFilter[]).map(c => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    filter === c ? 'bg-ink text-white' : 'bg-white text-warm-gray-500 border border-ink/10 hover:border-ink/30'
                  }`}
                >
                  {c === 'all' ? 'All Products' : c}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map(p => {
                const img = thumb(p.slug);
                const from = startingPrice(p);
                const selected = productSlug === p.slug;
                return (
                  <button
                    key={p.slug}
                    onClick={() => { setProductSlug(p.slug); setVariantId(null); setSwatch(null); }}
                    className={`text-left bg-white rounded-xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-clay ring-2 ring-clay/20' : 'border-transparent hover:border-ink/15'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-warm-gray-300/20 relative">
                      {img && <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />}
                      {selected && (
                        <div className="absolute top-2 right-2 bg-clay text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11px] text-warm-gray-500">{p.brand}</div>
                      <div className="text-sm font-semibold text-ink leading-tight line-clamp-2">{p.name}</div>
                      {from != null && <div className="text-xs text-clay font-semibold mt-1">from ${from.toFixed(0)}</div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Size entry — appears once a product is chosen */}
            {product && (
              <div className="mt-6 bg-white rounded-2xl border border-ink/10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-5 h-5 text-clay" />
                  <h2 className="font-bold text-ink">Your measurements</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-warm-gray-500">Width (in)</span>
                    <input
                      type="number" inputMode="decimal" min={1} placeholder="36"
                      value={width} onChange={e => setWidth(e.target.value)}
                      className="mt-1 w-full px-4 py-3 text-2xl font-semibold text-ink rounded-xl border border-ink/15 focus:border-clay focus:ring-2 focus:ring-clay/20 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-warm-gray-500">Height (in)</span>
                    <input
                      type="number" inputMode="decimal" min={1} placeholder="48"
                      value={height} onChange={e => setHeight(e.target.value)}
                      className="mt-1 w-full px-4 py-3 text-2xl font-semibold text-ink rounded-xl border border-ink/15 focus:border-clay focus:ring-2 focus:ring-clay/20 outline-none"
                    />
                  </label>
                </div>

                {/* Mount + quantity */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="text-sm font-medium text-warm-gray-500">Mount</span>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {(['inside', 'outside'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setMount(m)}
                          className={`py-2.5 rounded-xl text-sm font-medium capitalize border transition-colors ${
                            mount === m ? 'bg-clay/10 border-clay text-clay' : 'bg-white border-ink/15 text-warm-gray-500 hover:border-ink/30'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-warm-gray-500">Quantity</span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-11 h-11 rounded-xl border border-ink/15 flex items-center justify-center text-ink hover:border-ink/30 disabled:opacity-40"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center text-2xl font-semibold text-ink">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(50, q + 1))}
                        className="w-11 h-11 rounded-xl border border-ink/15 flex items-center justify-center text-ink hover:border-ink/30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live price / validation */}
                {basePrice != null && (
                  <div className="mt-4 flex items-baseline justify-between rounded-xl bg-sand-deep/40 px-4 py-3">
                    <span className="text-sm text-warm-gray-500">Your price</span>
                    <span className="text-2xl font-bold text-ink">${basePrice.toFixed(2)}<span className="text-sm font-medium text-warm-gray-500">/window</span></span>
                  </div>
                )}
                {sizeOutOfRange && (
                  <p className="mt-4 text-sm text-red-600">
                    That size is outside the available range for this product. Try a different size or product.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ───────────── STEP 2 — CUSTOMIZE ───────────── */}
        {step === 2 && product && variant && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-ink">Make it yours</h1>
              <p className="text-warm-gray-500 mt-1">{product.brand} · {product.name} · {w}&quot; × {h}&quot;</p>
            </div>

            {/* Variant */}
            {product.variants.length > 1 && (
              <div className="bg-white rounded-2xl border border-ink/10 p-5">
                <h2 className="font-bold text-ink mb-3">Style</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                        variant.id === v.id ? 'bg-clay/10 border-clay' : 'bg-white border-ink/15 hover:border-ink/30'
                      }`}
                    >
                      <div className="text-sm font-semibold text-ink">{v.name}</div>
                      {(v.cellSize || v.liftSystem) && (
                        <div className="text-xs text-warm-gray-500">{[v.cellSize, v.liftSystem].filter(Boolean).join(' · ')}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color / fabric */}
            {swatches.length > 0 && (
              <div className="bg-white rounded-2xl border border-ink/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-ink">Color {swatch && <span className="font-normal text-warm-gray-500">· {swatch.name}</span>}</h2>
                  <span className="text-xs text-warm-gray-500">{swatches.length} options</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {swatches.slice(0, 16).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSwatch(swatch?.id === s.id ? null : s)}
                      title={s.name}
                      className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                        swatch?.id === s.id ? 'border-clay ring-2 ring-clay/20 scale-105' : 'border-ink/10 hover:border-ink/30'
                      }`}
                      style={s.color ? { backgroundColor: s.color } : undefined}
                    >
                      {s.imageUrl && <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" loading="lazy" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-warm-gray-500 mt-2">Optional — pick a fabric or keep the default.</p>
              </div>
            )}

            {/* Service tier */}
            <div className="bg-white rounded-2xl border border-ink/10 p-5">
              <h2 className="font-bold text-ink mb-3">How do you want it done?</h2>
              <div className="grid sm:grid-cols-3 gap-2">
                {TIERS.map(t => {
                  const Icon = t.icon;
                  const sel = tier === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`text-left p-4 rounded-xl border transition-colors ${
                        sel ? 'bg-clay/10 border-clay' : 'bg-white border-ink/15 hover:border-ink/30'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${sel ? 'text-clay' : 'text-warm-gray-500'}`} />
                      <div className="text-sm font-semibold text-ink">{t.label}</div>
                      <div className="text-xs text-warm-gray-500">{t.sub}</div>
                      <div className={`text-sm font-bold mt-1 ${sel ? 'text-clay' : 'text-ink'}`}>
                        {t.add === 0 ? 'Included' : `+$${t.add}/window`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ───────────── STEP 3 — PAY ───────────── */}
        {step === 3 && product && variant && perWindow != null && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-ink">Review &amp; order</h1>
              <p className="text-warm-gray-500 mt-1">Looks good? Add it and you’re done.</p>
            </div>

            <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
              <div className="flex gap-4 p-5">
                {thumb(product.slug) && (
                  <img src={thumb(product.slug)!} alt={product.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-warm-gray-500">{product.brand}</div>
                  <div className="font-bold text-ink">{product.name}</div>
                  <div className="text-sm text-warm-gray-500 mt-1">
                    {w}&quot; × {h}&quot; · {mount === 'inside' ? 'Inside' : 'Outside'} mount
                    {product.variants.length > 1 ? ` · ${variant.name}` : ''}
                    {swatch ? ` · ${swatch.name}` : ''}
                  </div>
                  <div className="text-sm text-warm-gray-500">
                    {TIERS.find(t => t.id === tier)?.label} · Qty {quantity}
                  </div>
                </div>
              </div>

              <div className="border-t border-ink/10 px-5 py-4 space-y-2 text-sm">
                <Row label={`Product × ${quantity}`} value={`$${(basePrice! * quantity).toFixed(2)}`} />
                {fees.install > 0 && <Row label={`Installation × ${quantity}`} value={`$${(fees.install * quantity).toFixed(2)}`} />}
                {fees.design > 0 && <Row label={`Design × ${quantity}`} value={`$${(fees.design * quantity).toFixed(2)}`} />}
                <Row label="Shipping" value="FREE" valueClass="text-green-600 font-semibold" />
                <div className="border-t border-ink/10 pt-2 flex items-center justify-between">
                  <span className="font-bold text-ink">Order total</span>
                  <span className="text-xl font-bold text-ink">${orderTotal!.toFixed(2)}</span>
                </div>
                <p className="text-xs text-warm-gray-500">Tax calculated at checkout.</p>
              </div>
            </div>

            {addedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4" /> {addedCount} window{addedCount > 1 ? 's' : ''} already in your cart.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleAddAnother}
                className="flex-1 rounded-full py-6 gap-2 border-ink/20"
              >
                <Plus className="w-4 h-4" /> Add another window
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 rounded-full py-6 gap-2 bg-clay hover:bg-clay-hover text-white"
              >
                Review cart &amp; check out <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky action bar (steps 1 & 2) */}
      {step < 3 && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-ink/10 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-1 text-warm-gray-500">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <button onClick={() => navigate('/measure/new')} className="text-sm text-warm-gray-500 hover:text-ink underline-offset-2 hover:underline">
                Not sure how to measure?
              </button>
            )}
            <div className="flex-1" />
            {perWindow != null && (
              <div className="text-right mr-1 hidden sm:block">
                <div className="text-[11px] text-warm-gray-500 leading-none">Est. total</div>
                <div className="text-lg font-bold text-ink leading-tight">${orderTotal!.toFixed(2)}</div>
              </div>
            )}
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !step1Ready : false}
              className="rounded-full px-8 py-6 gap-2 bg-clay hover:bg-clay-hover text-white disabled:opacity-40"
            >
              {step === 1 ? 'Customize' : 'Review'} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueClass = 'text-ink font-medium' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-warm-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

// Persist a fabric choice so it shows on the cart/order-confirmation pages.
function saveSwatch(windowId: string, s: Swatch) {
  try {
    const KEY = 'snapshades_swatches';
    const existing = JSON.parse(localStorage.getItem(KEY) || '{}');
    existing[windowId] = {
      swatchId: s.id,
      swatchName: s.name,
      swatchCollection: s.collection,
      swatchImageUrl: s.imageUrl,
      swatchColor: s.color,
      swatchOpacity: s.opacity,
      swatchCode: s.code,
    };
    localStorage.setItem(KEY, JSON.stringify(existing));
  } catch { /* ignore */ }
}
