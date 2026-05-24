# AI Agent Instructions: Dealer Portal Photography Access for SnapShades

## Objective
Register SnapShades with Norman, Levolor (Hunter Douglas), and Onyx dealer portals so we can download brand-official, high-resolution, SKU-exact product photography. These images replace generic Unsplash stand-ins on actual product pages.

## Why this matters
Unsplash and Pexels photography is fine for lifestyle/inspiration context, but showing a generic "honeycomb shade" photo when a customer is configuring a specific Norman Portrait™ Single Cell in fabric color C5501 is dishonest — and legally murky if the photo clearly depicts a competitor's product. Dealer portals give us royalty-free rights to manufacturer-produced photography for the SKUs we actually sell.

## Prerequisites
- Business email on SnapShades domain (e.g. `hello@snapshadesandshutters.com`)
- SnapShades LLC EIN / business license
- Reseller permit (state-specific)
- Existing authorized-dealer status if any

---

## Task 1: Norman Window Fashions dealer portal

### Step 1 — Register as authorized dealer
1. Go to https://normanusa.com/trade-program/
2. Click "Become a Dealer"
3. Complete the application:
   - Business name: SnapShades LLC
   - Business type: Online retailer / e-commerce
   - Website: https://snapshadesandshutters.com
   - Tax ID: <EIN>
   - Territory: United States (national e-commerce)
4. Submit. Typical approval time: 3–5 business days.

### Step 2 — Once approved, access the asset library
1. Login at https://normanusa.com/dealer-login
2. Navigate to: `Dealer Resources` → `Product Images & Assets`
3. Download the following collections:
   - **Portrait™ Honeycomb Shades** — hero, detail, lifestyle (all fabric colors)
   - **Soluna™ Roller Shades** — hero, fabric swatches at 1200×1200
   - **Centerpiece™ Roman Shades** — hero, fabric detail
   - **Ultimate™ Faux Wood Blinds** — hero, SmartPrivacy close-up
   - **Plantation Shutters** (Woodlore, Brightwood, Normandy) — hero, louver detail
   - **PerfectSheer™** — hero, vane close-up
   - **SmartDrape®** — hero, fabric detail
   - **Synchrony™ Vertical** — hero, room scene
   - **CityLights™ Aluminum** — hero, bedroom lifestyle

### Step 3 — Drop files into SnapShades repo
For each product, rename the downloaded files to match our convention:
- `hero.jpg` — primary lifestyle shot
- `detail-1.jpg` — fabric/louver/slat close-up
- `lifestyle-1.jpg` — secondary room context

Drop them into `public/images/products/<category-slug>/` (see `public/images/products/README.md` for slug list).

### Step 4 — Register in the code
Open `src/data/local-product-images.ts` and uncomment / add entries:
```ts
'portrait-honeycomb-shades': {
  pathPrefix: '/images/products/cellular',
  available: ['hero', 'detail-1', 'lifestyle-1'],
  credit: 'Photo © Norman Window Fashions, used under dealer license',
},
```

### Step 5 — Optimize and commit
```bash
npm run images:optimize
git add public/images/products src/data/local-product-images.ts
git commit -m "feat: Norman-official SKU photography (Phase 1 Track 2)"
```

---

## Task 2: Levolor (Hunter Douglas) dealer portal

### Step 1 — Register
1. Go to https://www.levolor.com/custom-window-treatments/dealer-locator
2. Scroll to footer → "Become a Dealer" / "Trade Program"
3. Alternative entrypoint: https://hdtradelogin.com (Hunter Douglas Trade Portal — Levolor is owned by HD)
4. Complete the dealer application:
   - Business type: Online retailer
   - Target markets: US nationwide
   - Existing business: SnapShades LLC
5. Typical approval: 5–10 business days for HD trade accounts.

### Step 2 — Asset library access
Once approved at https://hdtradelogin.com:
1. Navigate to: `Marketing Resources` → `Product Photography`
2. Download for each Levolor SKU we sell:
   - Cellular Shades (9/16" single and double cell)
   - Roller Shades
   - Roman Shades
   - 2" Faux Wood Blinds (premium and classic value lines)
   - 2" Real Wood Blinds
   - Riviera Metal Blinds
   - Banded Shades
   - Soft Vertical Blinds

### Step 3 — Drop + register (same pattern as Task 1)
Rename to `hero.jpg` / `detail-1.jpg` / `lifestyle-1.jpg`, drop into the matching category folder, register in `local-product-images.ts` — one entry per Levolor slug:
- `levolor-cellular`, `levolor-roller`, `levolor-roman`, `levolor-faux-wood`, `levolor-classic-faux-wood`, `levolor-real-wood`, `levolor-riviera-metal`, `levolor-banded`, `levolor-soft-vertical`

---

## Task 3: Onyx Window Treatments

### Step 1 — Contact for media
Onyx is a smaller manufacturer; no self-serve dealer portal.
1. Email their sales team: `sales@onyxwindowtreatments.com` (or whatever the current address is — check their website contact page)
2. Request "high-resolution product photography for an authorized dealer website listing"
3. Attach SnapShades business info + URL
4. Request assets for:
   - Onyx Honeycomb Shades
   - Onyx Faux Wood Blinds
   - Onyx Roller Shades
   - Onyx Shutters

### Step 2 — Drop + register
Same pattern. Onyx entries in `local-product-images.ts` use slugs from the Onyx catalog in `src/data/onyx-catalog.ts`.

---

## Task 4: Swatch imagery (separate track)

Product photography and fabric swatch photography are different needs. Swatch images need to be hex-accurate and flat-lit.

For Norman, request the dealer-portal fabric swatch library (typically 500+ color chips photographed against neutral backgrounds). Place those files at `public/images/swatches/norman/<fabric-code>.jpg` and wire them through `src/data/norman-swatches.ts` by updating the `image` field on each swatch entry.

Same pattern for Levolor swatches.

---

## Success criteria

- At least `hero.jpg` exists for all 9 product categories under `public/images/products/`
- `src/data/local-product-images.ts` has entries for all products where photos landed
- `npm run images:optimize` produces WebP derivatives
- Site renders local imagery in place of `normanusa.com` / `levolor.com` CDN URLs (verify in DevTools Network tab that no requests to external vendor domains happen on product pages)
- License files or terms-of-use documents from each manufacturer stored in `docs/licenses/<vendor>/`

## Fallback if dealer approval is blocked

If any manufacturer declines or the approval drags past 30 days:
1. Keep the current external CDN URLs in `src/data/product-images.ts` as fallback
2. For the most-shopped categories, hire a photographer for 5–10 original shots ($500–$2,000 total). Original photography is the strongest premium signal anyway.
3. Generic Unsplash / Pexels photography remains valid for homepage hero, inspiration gallery, and room-context shots where no specific SKU is depicted.
