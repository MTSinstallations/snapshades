# SnapShades image library

This directory holds all hand-curated, locally-hosted imagery for the site. Everything under `public/` is served at the URL path that mirrors the file layout — e.g. `public/images/hero/fabric-closeup-1.jpg` is fetched at `/images/hero/fabric-closeup-1.jpg`.

## Why local images

Early versions of the site pulled product photography from `normanusa.com` and `levolor.com` CDNs. Those links break when vendors move assets, and they leak referrer data about who's shopping our catalog. Local hosting gives us:

- Deterministic LCP (Largest Contentful Paint) — images ship with the site
- Full control over compression and WebP derivatives
- No third-party dependency at runtime

## Layout

```
public/images/
  hero/              — landing page hero + section heroes
  products/<slug>/   — one folder per product category (hero.jpg, detail-1.jpg, lifestyle-1.jpg)
  rooms/<room>/      — inspiration gallery (01.jpg..06.jpg per room)
  measure-coaching/  — illustrations for the two-person tape-measure instructions
  trust/             — warranty / guarantee / Made-in-USA badge SVGs
```

Category slugs match `src/data/product-categories.ts`: `cellular`, `roller`, `roman`, `faux-wood`, `vertical`, `mini-blinds`, `zebra`, `sheer-drape`, `shutters`.

Room slugs: `living-room`, `bedroom`, `kitchen`, `bathroom`, `office`, `nursery`.

## Source policy

### Lifestyle / inspiration / hero — Unsplash + Pexels (free, commercial-OK)

Both licenses permit commercial use without attribution. See each folder's README for the exact search queries used. Prefer:

- Warm, natural light
- Minimal / modern / Scandinavian styling (matches our Modern DTC aesthetic)
- No visible branding on the product (legal + aesthetic)

Original full-resolution files go in this folder. Run `npm run images:optimize` (see below) to emit `@1x` (1600w) and `@2x` (3200w) WebP derivatives next to the original.

### Product-specific / SKU-exact photography — manufacturer dealer portals

Generic Unsplash photos won't match your actual Norman / Levolor / Onyx SKUs. See `docs/dealer-portal-tasks.md` for the step-by-step process to register as an authorized dealer and download brand-official high-res product photography. When those assets land, they replace files in `products/<slug>/` one-for-one (same filename) and the site picks them up automatically.

## Adding or replacing images

1. Drop the original (largest sensible resolution) JPG or PNG into the target folder.
2. Name it per the folder README (usually `hero.jpg`, `detail-1.jpg`, etc.).
3. Run `npm run images:optimize` — generates WebP derivatives. Both original and WebP are committed.
4. Update `src/data/local-product-images.ts` to register the slug (if adding a new product category).
5. Visual-QA with `npm run dev`. Check the Network tab for 404s.

## Optimization

`scripts/optimize-images.ts` uses `sharp` to emit:
- `<name>@1x.webp` — 1600px wide, quality 80
- `<name>@2x.webp` — 3200px wide, quality 80
- Skips files whose `.webp` is newer than the source (idempotent).

Run `npm run images:optimize` any time you add / replace an image.
