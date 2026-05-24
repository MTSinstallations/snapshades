/**
 * Image helpers — bridge local overrides and external CDN fallbacks.
 *
 * Use `resolveProductHero(slug)` and `resolveProductImage(slug, variant)` to
 * get a URL that prefers local imagery (public/images/products/<slug>/) when
 * available, falling back to the existing vendor CDN URLs in product-images.ts.
 *
 * For responsive srcSet, use `buildSrcSet(pathPrefix, variant)`.
 */

import { getLocalImages, hasLocalImages, type LocalImageSet } from "@/data/local-product-images";
import { getHeroImage, getProductImages, type ProductImage } from "@/data/product-images";

export type ImageVariant = "hero" | "detail-1" | "detail-2" | "lifestyle-1" | "lifestyle-2";

const PRODUCT_TYPE_FALLBACKS: Record<ProductImage["type"], ImageVariant> = {
  hero: "hero",
  detail: "detail-1",
  closeup: "detail-1",
  lifestyle: "lifestyle-1",
};

/**
 * Return a URL for the hero image of a product, preferring local assets.
 * Returns an empty string if neither a local override nor a registered
 * external URL exists.
 */
export function resolveProductHero(slug: string): string {
  const local = getLocalImages(slug);
  if (local?.available.includes("hero")) {
    return `${local.pathPrefix}/hero.jpg`;
  }
  return getHeroImage(slug);
}

/**
 * Return a URL for a specific image variant, preferring local assets.
 */
export function resolveProductImage(slug: string, variant: ImageVariant): string {
  const local = getLocalImages(slug);
  if (local?.available.includes(variant)) {
    return `${local.pathPrefix}/${variant}.jpg`;
  }

  // Fall back to external set — map our variant → ProductImage.type
  const externalSet = getProductImages(slug);
  if (!externalSet) return "";

  // Find best external match: variant -> preferred type
  const wantedType: ProductImage["type"] =
    variant === "hero" ? "hero" :
    variant.startsWith("detail") ? "detail" :
    "lifestyle";

  const match = externalSet.images.find((img) => img.type === wantedType);
  if (match) return match.url;

  // Last resort: any image in the set
  return externalSet.images[0]?.url ?? "";
}

/**
 * Build a `srcSet` string for responsive images when WebP derivatives exist
 * (via `npm run images:optimize`). Only emits srcSet for local paths — external
 * CDN URLs are returned as a single src.
 */
export function buildSrcSet(slug: string, variant: ImageVariant): { src: string; srcSet?: string; sizes?: string } {
  const local = getLocalImages(slug);
  if (local?.available.includes(variant)) {
    const base = `${local.pathPrefix}/${variant}`;
    return {
      src: `${base}.jpg`,
      srcSet: `${base}@1x.webp 1600w, ${base}@2x.webp 3200w`,
      sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
    };
  }
  return { src: resolveProductImage(slug, variant) };
}

export { hasLocalImages };
export type { LocalImageSet };
