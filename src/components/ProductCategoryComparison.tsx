/**
 * ProductCategoryComparison — cross-category price comparison for one window.
 *
 * Given width × height × depth, shows all 9 product categories side-by-side
 * with the cheapest starting price in each. The customer taps a category to
 * "lock in" that product type. A second render then swaps to
 * InlineProductPicker for brand/variant/option selection within the chosen
 * category.
 *
 * This is the DIY shopping spine: customer enters dimensions → sees all
 * their options at once → makes an informed decision.
 *
 * Reused in:
 *  - MeasureWizard step 5 (product selection after measurement)
 *  - Cart (change a window's product type)
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/data/product-categories";
import { ALL_PRODUCTS, getCustomerPrice } from "@/data/catalog-index";

export interface CategoryPriceSummary {
  categoryId: string;
  label: string;
  imageSlug: string;
  /** Cheapest price across all products in this category for the given dims. */
  priceFrom: number | null;
  /** Slug of the product giving the `priceFrom` quote. */
  cheapestProductSlug: string | null;
  /** Brand label of the cheapest product, for the badge. */
  cheapestBrand: string | null;
  /** Total brands + product count for this category. */
  productCount: number;
  brandCount: number;
}

/** Compute the cheapest price across every product in each of the 9 categories. */
export function computeCategoryPrices(width: number, height: number): CategoryPriceSummary[] {
  return PRODUCT_CATEGORIES.map((cat) => {
    const productSlugs = cat.brands.map((b) => b.productSlug);
    const products = ALL_PRODUCTS.filter((p) => productSlugs.includes(p.slug));

    let cheapest: { price: number; slug: string; brand: string } | null = null;
    for (const product of products) {
      const variant = product.variants?.[0];
      if (!variant?.priceGrid || !width || !height) continue;
      const result = getCustomerPrice(variant.priceGrid, width, height);
      if (!result?.price) continue;
      if (!cheapest || result.price < cheapest.price) {
        cheapest = { price: result.price, slug: product.slug, brand: product.brand };
      }
    }

    const brandCount = new Set(products.map((p) => p.brand)).size;

    return {
      categoryId: cat.id,
      label: cat.label,
      imageSlug: cat.imageSlug,
      priceFrom: cheapest?.price ?? null,
      cheapestProductSlug: cheapest?.slug ?? null,
      cheapestBrand: cheapest?.brand ?? null,
      productCount: products.length,
      brandCount,
    };
  });
}

interface ProductCategoryComparisonProps {
  width: number;
  height: number;
  depth?: number;
  /** Called with the categoryId when the user picks a category. */
  onSelect: (categoryId: string) => void;
  /** Optional heading override. */
  title?: string;
}

// Small accent color per category — matches the Modern DTC palette by rotating
// through warm, muted hues rather than a bright spectrum.
const CATEGORY_ACCENT: Record<string, string> = {
  cellular: "bg-[#F2E2C2]",
  roller: "bg-[#E4D2B4]",
  roman: "bg-[#E8D8C0]",
  "faux-wood": "bg-[#D8CEC1]",
  vertical: "bg-[#E0E8E8]",
  "mini-blinds": "bg-[#D8D8E2]",
  zebra: "bg-[#F0E4CC]",
  "sheer-drape": "bg-[#F4ECD8]",
  shutters: "bg-[#E8DCC8]",
};

export default function ProductCategoryComparison({
  width,
  height,
  depth,
  onSelect,
  title = "Pick your window covering",
}: ProductCategoryComparisonProps) {
  const summaries = useMemo(() => computeCategoryPrices(width, height), [width, height]);

  const cheapestOverall = summaries.reduce<number | null>(
    (min, s) => (s.priceFrom !== null && (min === null || s.priceFrom < min) ? s.priceFrom : min),
    null
  );

  const hasValidDims = width > 0 && height > 0;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-ink tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-warm-gray-500">
          Prices shown for your <strong className="text-ink">{width}"&thinsp;×&thinsp;{height}"</strong>
          {depth ? <> window, <strong className="text-ink">{depth}" deep</strong></> : <> window</>}. Tap a
          category to pick your brand and options.
        </p>
      </div>

      {!hasValidDims && (
        <div className="rounded-md bg-sand-deep border border-border px-4 py-3 text-sm text-warm-gray-500">
          Enter width and height above to see live pricing.
        </div>
      )}

      {hasValidDims && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {summaries.map((s, i) => {
            const isCheapest =
              cheapestOverall !== null && s.priceFrom !== null && Math.abs(s.priceFrom - cheapestOverall) < 0.01;
            const isAvailable = s.priceFrom !== null;
            return (
              <motion.li
                key={s.categoryId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onClick={() => isAvailable && onSelect(s.categoryId)}
                  disabled={!isAvailable}
                  className={`w-full text-left rounded-lg border border-border bg-card hover:border-clay hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-clay/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCheapest ? "ring-2 ring-clay/40 border-clay" : ""
                  }`}
                >
                  <div className="flex items-stretch">
                    <div
                      className={`w-16 flex-shrink-0 rounded-l-lg ${CATEGORY_ACCENT[s.categoryId] ?? "bg-sand-deep"}`}
                      aria-hidden
                    />
                    <div className="flex-1 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-ink leading-tight">{s.label}</h3>
                          <p className="mt-0.5 text-[11px] text-warm-gray-500">
                            {s.productCount} products • {s.brandCount}{" "}
                            {s.brandCount === 1 ? "brand" : "brands"}
                          </p>
                        </div>
                        {isCheapest && (
                          <span className="inline-flex items-center gap-0.5 bg-clay/10 text-clay text-[10px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            best
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <div>
                          {isAvailable ? (
                            <>
                              <span className="text-[10px] uppercase tracking-wider text-warm-gray-500">
                                from
                              </span>
                              <span className="ml-1 text-lg font-bold text-ink tabular-nums">
                                ${s.priceFrom!.toFixed(0)}
                              </span>
                              {s.cheapestBrand && (
                                <span className="ml-1 text-[11px] text-warm-gray-500">
                                  / {s.cheapestBrand.replace(/[®™]/g, "")}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-warm-gray-500">Out of size range</span>
                          )}
                        </div>
                        {isAvailable && (
                          <ChevronRight className="w-4 h-4 text-warm-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {hasValidDims && (
        <p className="mt-4 text-xs text-warm-gray-500">
          All prices are manufacturer-direct — already <strong className="text-ink">60% below retail</strong>.
          Free shipping, no showroom markup.
        </p>
      )}
    </div>
  );
}
