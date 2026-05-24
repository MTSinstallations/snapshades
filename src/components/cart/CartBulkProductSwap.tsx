import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { PRODUCT_CATEGORIES, getProductSlugForBrand } from "@/data/product-categories";
import { ALL_PRODUCTS, getCustomerPrice } from "@/data/catalog-index";
import { resolveProductImage } from "@/lib/image-helpers";
import type { CartWindow } from "@/hooks/useCart";
import { PRICE_MULTIPLIER } from "@/lib/constants";

/**
 * CartBulkProductSwap — top-of-cart filter bar that lets the customer
 * change product type and manufacturer across one window or every window
 * in their order with one tap.
 *
 * Flow:
 *   1. Horizontal scroll of product-type cards (photo + name + 'from $X')
 *      showing the cheapest-per-category price across the project's
 *      current window sizes.
 *   2. When a type is selected, manufacturer pills appear — only those
 *      that offer this category and can price all the windows. Each
 *      pill shows the manufacturer's total for the project.
 *   3. Two CTAs: 'Apply to all N windows' (bulk) or pick a single
 *      window from a dropdown to apply to just that one.
 *
 * Prices shown here are PRODUCT PRICES ONLY — no shipping. Shipping is
 * added in the order summary at checkout.
 */

interface CartBulkProductSwapProps {
  cart: CartWindow[];
  /** Called when the customer applies a new product+manufacturer to
   *  a specific window (or to all windows if windowId is null). */
  onApply: (input: { windowId: string | null; productId: string; price: number; manufacturer: string; productName: string }) => void;
}

/** Sum of per-window customer prices for a given category + brand. */
function projectPrice(cart: CartWindow[], categoryId: string, brandId: string): { total: number; applicable: number } {
  let total = 0;
  let applicable = 0;
  const slug = getProductSlugForBrand(categoryId, brandId);
  if (!slug) return { total: 0, applicable: 0 };
  const product = ALL_PRODUCTS.find((p) => p.slug === slug);
  if (!product?.variants?.[0]?.priceGrid) return { total: 0, applicable: 0 };
  const grid = product.variants[0].priceGrid;
  for (const w of cart) {
    if (!w.width || !w.height) continue;
    const r = getCustomerPrice(grid, w.width, w.height);
    if (r?.price) {
      total += r.price;
      applicable += 1;
    }
  }
  return { total, applicable };
}

/** Cheapest price across brands for a single window + category. */
function cheapestForWindow(w: CartWindow, categoryId: string): { price: number; brandId: string; slug: string } | null {
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;
  let best: { price: number; brandId: string; slug: string } | null = null;
  for (const b of category.brands) {
    const product = ALL_PRODUCTS.find((p) => p.slug === b.productSlug);
    const grid = product?.variants?.[0]?.priceGrid;
    if (!grid || !w.width || !w.height) continue;
    const r = getCustomerPrice(grid, w.width, w.height);
    if (!r?.price) continue;
    if (!best || r.price < best.price) {
      best = { price: r.price, brandId: b.brandId, slug: b.productSlug };
    }
  }
  return best;
}

export default function CartBulkProductSwap({ cart, onApply }: CartBulkProductSwapProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [scope, setScope] = useState<{ type: 'all' } | { type: 'one'; windowId: string }>({ type: 'all' });
  const [justApplied, setJustApplied] = useState(false);

  /** Per-category 'from $X' starting price across the project,
   *  collapsed to the single cheapest brand. */
  const categoryStartingPrices = useMemo(() => {
    return PRODUCT_CATEGORIES.map((cat) => {
      // Sum the cheapest-per-window across the cart, for display. That
      // mirrors what the customer will pay if they use the cheapest
      // brand for each window (though in practice they'll pick one).
      let cheapestTotal = 0;
      let brandId: string | null = null;
      for (const w of cat.brands) {
        const p = projectPrice(cart, cat.id, w.brandId);
        if (p.applicable > 0 && (cheapestTotal === 0 || p.total < cheapestTotal)) {
          cheapestTotal = p.total;
          brandId = w.brandId;
        }
      }
      return { categoryId: cat.id, label: cat.label, imageSlug: cat.imageSlug, total: cheapestTotal, brandId };
    });
  }, [cart]);

  const selectedCategory = selectedCategoryId
    ? PRODUCT_CATEGORIES.find((c) => c.id === selectedCategoryId)
    : null;

  /** Pricing per manufacturer for the selected category, for the current project. */
  const brandsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory.brands.map((b) => {
      const price = projectPrice(cart, selectedCategory.id, b.brandId);
      return { ...b, ...price };
    });
  }, [selectedCategory, cart]);

  const applyNow = () => {
    if (!selectedCategoryId || !selectedBrandId) return;
    const slug = getProductSlugForBrand(selectedCategoryId, selectedBrandId);
    if (!slug) return;
    const product = ALL_PRODUCTS.find((p) => p.slug === slug);
    if (!product?.variants?.[0]?.priceGrid) return;
    const grid = product.variants[0].priceGrid;
    const brandLabel = product.brand;

    if (scope.type === 'all') {
      for (const w of cart) {
        if (!w.width || !w.height) continue;
        const r = getCustomerPrice(grid, w.width, w.height);
        if (!r?.price) continue;
        onApply({
          windowId: w.id,
          productId: slug,
          productName: product.name,
          manufacturer: brandLabel,
          price: r.price,
        });
      }
    } else {
      const w = cart.find((x) => x.id === scope.windowId);
      if (!w) return;
      const r = getCustomerPrice(grid, w.width, w.height);
      if (!r?.price) return;
      onApply({
        windowId: w.id,
        productId: slug,
        productName: product.name,
        manufacturer: brandLabel,
        price: r.price,
      });
    }

    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2000);
  };

  if (cart.length === 0) return null;

  return (
    <section className="rounded-md border border-border bg-card overflow-hidden">
      <header className="px-4 py-3 border-b border-border bg-sand-deep/40">
        <h2 className="text-sm font-semibold text-ink tracking-tight">Change product across your project</h2>
        <p className="text-xs text-warm-gray-500 mt-0.5">
          Pick a product type, pick a manufacturer, apply it to this window or to all of them.
        </p>
      </header>

      {/* 1. CATEGORY CARDS — horizontal scroll with photos */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-thin">
        <ul className="flex gap-2 p-3 min-w-max">
          {categoryStartingPrices.map((cat) => {
            const isSelected = selectedCategoryId === cat.categoryId;
            const imageUrl = resolveProductImage(cat.imageSlug, "hero");
            const hasPrice = cat.total > 0;
            return (
              <li key={cat.categoryId}>
                <button
                  type="button"
                  disabled={!hasPrice}
                  onClick={() => {
                    setSelectedCategoryId(cat.categoryId);
                    // Auto-pick the first brand that has a price for this category
                    const firstBrand = PRODUCT_CATEGORIES.find((c) => c.id === cat.categoryId)?.brands[0]?.brandId ?? null;
                    setSelectedBrandId(firstBrand);
                  }}
                  aria-pressed={isSelected}
                  className={`w-36 flex-shrink-0 rounded-md border text-left overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-clay bg-clay/5 shadow-sm'
                      : 'border-border bg-card hover:border-ink/40'
                  }`}
                >
                  <div className="aspect-[4/3] bg-sand-deep flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={cat.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs text-warm-gray-500">{cat.label}</span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-ink leading-tight line-clamp-1">{cat.label}</p>
                    {hasPrice ? (
                      <p className="text-[11px] text-warm-gray-500 mt-0.5">
                        <span className="text-warm-gray-500">from</span>{' '}
                        <span className="text-ink font-semibold tabular-nums">${cat.total.toFixed(0)}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-warm-gray-500 mt-0.5 italic">Out of size range</p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. MANUFACTURER PILLS (when a type is selected) */}
      {selectedCategory && brandsForCategory.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-border/50 bg-background">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500 mt-2 mb-2">
            Manufacturer for {selectedCategory.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {brandsForCategory.map((b) => {
              const isSelected = selectedBrandId === b.brandId;
              const brandLabel = b.brandId.charAt(0).toUpperCase() + b.brandId.slice(1);
              return (
                <button
                  key={b.brandId}
                  type="button"
                  disabled={b.applicable === 0}
                  onClick={() => setSelectedBrandId(b.brandId)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-md border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-ink bg-ink text-primary-foreground'
                      : 'border-border bg-card text-ink hover:border-ink/40'
                  }`}
                >
                  {isSelected && <Check strokeWidth={2.5} className="w-3 h-3" />}
                  <span>{brandLabel}</span>
                  {b.total > 0 && (
                    <span className={`tabular-nums font-semibold ${isSelected ? '' : 'text-warm-gray-500'}`}>
                      ${b.total.toFixed(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. SCOPE + APPLY */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-stretch">
            <select
              value={scope.type === 'all' ? '__all' : scope.windowId}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__all') setScope({ type: 'all' });
                else setScope({ type: 'one', windowId: v });
              }}
              className="appearance-none flex-1 px-3 h-10 rounded-md border border-border bg-card text-sm text-ink focus:border-clay outline-none"
            >
              <option value="__all">Apply to all {cart.length} windows</option>
              <optgroup label="Apply to one window">
                {cart.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.room} — {w.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <button
              type="button"
              onClick={applyNow}
              disabled={!selectedBrandId || justApplied}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-md bg-clay hover:bg-clay-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-sm font-semibold transition-colors"
            >
              {justApplied ? (
                <>
                  <Check strokeWidth={2.5} className="w-4 h-4" />
                  Applied
                </>
              ) : (
                <>Apply</>
              )}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-warm-gray-500">
            Prices shown are product only. Shipping is calculated at checkout.
          </p>
        </div>
      )}
    </section>
  );
}
