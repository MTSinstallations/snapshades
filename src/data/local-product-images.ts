/**
 * Local product image overrides.
 *
 * When a product slug has a local photography set registered here, the site
 * uses the local paths instead of the external CDN URLs in product-images.ts.
 * This lets us migrate from fragile vendor CDNs to locally-hosted, optimized
 * imagery one product at a time.
 *
 * To add a product:
 *   1. Drop `hero.jpg`, `detail-1.jpg`, `lifestyle-1.jpg` into
 *      `public/images/products/<category-slug>/`
 *   2. Run `npm run images:optimize` to emit WebP derivatives
 *   3. Add an entry below — key is the product slug from the catalog
 *      (e.g. 'portrait-honeycomb-shades'), value is the path prefix to the
 *      files without the filename (e.g. '/images/products/cellular')
 *
 * The `<img srcSet>` helper in `src/lib/image-helpers.ts` composes the
 * final src/srcSet URLs from this prefix.
 */

export interface LocalImageSet {
  /** Relative URL path to the folder containing the product's images (no trailing slash). */
  pathPrefix: string;
  /** Which filenames exist at that prefix. At minimum, `hero.jpg` should exist. */
  available: Array<"hero" | "detail-1" | "detail-2" | "lifestyle-1" | "lifestyle-2">;
  /** Short credit/source line, shown as <img> alt-text prefix. */
  credit?: string;
}

/**
 * Slug → local asset set. Empty by default; populate as files land under
 * public/images/products/<slug>/. The Phase 1 infrastructure is in place;
 * photography is the parallel Track 2 (see docs/dealer-portal-tasks.md).
 */
export const LOCAL_PRODUCT_IMAGES: Record<string, LocalImageSet> = {
  // Example once photos land:
  // 'portrait-honeycomb-shades': {
  //   pathPrefix: '/images/products/cellular',
  //   available: ['hero', 'detail-1', 'lifestyle-1'],
  //   credit: 'Photo by Jane Doe on Unsplash',
  // },
};

/** Check whether a product slug has local imagery registered. */
export function hasLocalImages(slug: string): boolean {
  return slug in LOCAL_PRODUCT_IMAGES;
}

/** Get the local image set for a slug (or undefined if not registered). */
export function getLocalImages(slug: string): LocalImageSet | undefined {
  return LOCAL_PRODUCT_IMAGES[slug];
}
