# Product category imagery

One folder per category slug (matching `src/data/product-categories.ts`).

Each folder should contain:
- `hero.jpg` — primary lifestyle shot (2400×1600+), used on the category grid tile and PDP hero
- `detail-1.jpg` — close-up showing texture / slat / fabric detail (1600×1200+)
- `lifestyle-1.jpg` — secondary room context shot (2400×1600+)

Optional:
- `detail-2.jpg`, `lifestyle-2.jpg` — additional images for PDP galleries

## Per-category Unsplash / Pexels queries

| Slug | Queries |
|------|---------|
| `cellular` | `"honeycomb blind"`, `"cellular shade sunlight"`, `"pleated shade close up"` |
| `roller` | `"roller shade bedroom"`, `"white roller blind window"`, `"solar shade office"` |
| `roman` | `"linen roman blind"`, `"roman shade fabric folds"` |
| `faux-wood` | `"white faux wood blind"`, `"wood venetian blind kitchen"` |
| `vertical` | `"vertical blinds sliding door"` |
| `mini-blinds` | `"aluminum mini blinds office"` |
| `zebra` | `"zebra blind living room"`, `"banded shade"` |
| `sheer-drape` | `"sheer layered shade"`, `"soft vertical sheer"` |
| `shutters` | `"plantation shutter white"`, `"cafe shutter kitchen"`, `"interior shutters window"` |

## Brand-exact photography

Unsplash photos are generic stand-ins. For SKU-exact imagery that matches the actual Norman / Levolor / Onyx product being sold, follow `docs/dealer-portal-tasks.md`. Brand assets replace these files one-for-one (same filename) and the site automatically picks them up.

## Registration

After dropping a file, update `src/data/local-product-images.ts` so the site uses the local path in place of the external CDN URL. Then `npm run images:optimize`.
