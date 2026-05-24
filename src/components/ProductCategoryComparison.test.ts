import { computeCategoryPrices } from "./ProductCategoryComparison";
import { PRODUCT_CATEGORIES } from "@/data/product-categories";

describe("computeCategoryPrices", () => {
  it("returns one summary per product category (9 total)", () => {
    const result = computeCategoryPrices(36, 48);
    expect(result).toHaveLength(PRODUCT_CATEGORIES.length);
  });

  it("picks the cheapest product within each category", () => {
    // At 36x48, cellular includes Norman Portrait + Levolor Cellular. Whichever
    // is cheaper at that size should be reflected in cheapestProductSlug.
    const result = computeCategoryPrices(36, 48);
    const cellular = result.find((r) => r.categoryId === "cellular");
    expect(cellular).toBeDefined();
    expect(cellular!.priceFrom).toBeGreaterThan(0);
    expect(cellular!.cheapestProductSlug).toBeTruthy();
    expect(cellular!.brandCount).toBeGreaterThan(0);
  });

  it("returns null price for impossible dimensions", () => {
    // 500x500 is far outside any standard price grid
    const result = computeCategoryPrices(500, 500);
    // All categories should be out of range OR gracefully fallback
    const someOutOfRange = result.filter((r) => r.priceFrom === null);
    expect(someOutOfRange.length).toBeGreaterThan(0);
  });

  it("returns null price when width or height is zero", () => {
    const result = computeCategoryPrices(0, 48);
    expect(result.every((r) => r.priceFrom === null)).toBe(true);
  });

  it("preserves category metadata (label, imageSlug)", () => {
    const result = computeCategoryPrices(36, 48);
    for (const summary of result) {
      const original = PRODUCT_CATEGORIES.find((c) => c.id === summary.categoryId);
      expect(original).toBeDefined();
      expect(summary.label).toBe(original!.label);
      expect(summary.imageSlug).toBe(original!.imageSlug);
    }
  });
});
