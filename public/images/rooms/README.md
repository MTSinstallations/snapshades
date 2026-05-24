# Room inspiration imagery

One folder per room. Up to 6 images each, named `01.jpg` through `06.jpg`. Used by the `/inspiration` gallery (Phase 8).

## Per-room Unsplash / Pexels queries

| Slug | Queries |
|------|---------|
| `living-room` | `"minimal living room natural light"`, `"scandinavian living room window"`, `"modern living room window shade"` |
| `bedroom` | `"scandinavian bedroom morning"`, `"minimalist bedroom window light"`, `"master bedroom natural light"` |
| `kitchen` | `"warm kitchen window light"`, `"modern kitchen window"`, `"farmhouse kitchen sink window"` |
| `bathroom` | `"bathroom window privacy"`, `"spa bathroom natural light"`, `"modern bathroom window"` |
| `office` | `"bright home office natural light"`, `"minimalist desk window"`, `"home office window light"` |
| `nursery` | `"nursery soft light window"`, `"baby room morning light"`, `"minimalist nursery window"` |

## Style guidelines

- Always with a window visible — the visual point is the window treatment context, not just the room
- Warm natural light, shallow sun
- Modern / Scandinavian / minimalist styling aligns with our brand
- 2400×1600 minimum for responsive crops

## Registration

Add entries to `src/data/inspiration.ts` (Phase 8) referencing filename + product pairings: `{ image: '/images/rooms/bedroom/02.jpg', room: 'bedroom', productSlugs: ['portrait-honeycomb-shades'], style: 'modern' }`.
