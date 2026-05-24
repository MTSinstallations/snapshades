/**
 * Inspiration gallery — curated room × style × product pairings.
 *
 * The UX point: a DIY customer comes to the site without knowing the
 * vocabulary ("is this roman or roller? is this traditional or
 * farmhouse?") and needs to find their style by looking at rooms that
 * feel like theirs. This file is the source of truth for what shows
 * up on /inspiration.
 *
 * Images reference `public/images/rooms/<room>/<NN>.jpg`. Until real
 * photography lands (see docs/dealer-portal-tasks.md + public/images/
 * READMEs), the InspirationCard component gracefully falls back to a
 * warm CSS gradient placeholder keyed to the category.
 */

export type InspirationRoom =
  | "living-room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"
  | "nursery"
  | "dining-room";

export type InspirationStyle =
  | "modern"
  | "farmhouse"
  | "coastal"
  | "traditional"
  | "minimalist"
  | "warm-boho";

export interface InspirationEntry {
  /** Stable ID used in URL / route params / lightbox state. */
  id: string;
  /** Relative URL to the image. May 404 until real photography lands. */
  image: string;
  /** Short alt text — also shown as the lightbox caption. */
  alt: string;
  /** Which room the photo depicts. Drives the Room tab filter. */
  room: InspirationRoom;
  /** One primary style tag. Drives the Style chip filter. */
  style: InspirationStyle;
  /** Categories of window coverings shown in this image. Used both as
   *  secondary filter chips and to surface relevant product links in
   *  the lightbox. Refers to IDs from src/data/product-categories.ts. */
  categoryIds: string[];
  /** Optional freeform caption for the lightbox footer. */
  caption?: string;
  /** Optional "featured" flag — these get the masonry's larger tiles. */
  featured?: boolean;
}

/**
 * Curated set. Intentionally diverse across room/style/category so that
 * every filter combination lands on at least one result. Add more
 * entries as dealer-portal photography arrives.
 */
export const INSPIRATION_ENTRIES: InspirationEntry[] = [
  // ── Living Room ───────────────────────────────────────────────────
  {
    id: "lr-01",
    image: "/images/rooms/living-room/01.jpg",
    alt: "Modern living room with linen roller shades at a large picture window",
    room: "living-room",
    style: "modern",
    categoryIds: ["roller"],
    caption: "Soft linen roller shades on a picture window — privacy without darkness.",
    featured: true,
  },
  {
    id: "lr-02",
    image: "/images/rooms/living-room/02.jpg",
    alt: "Coastal living room with plantation shutters on bay windows",
    room: "living-room",
    style: "coastal",
    categoryIds: ["shutters"],
    caption: "Bright plantation shutters on bay windows — classic coastal palette.",
  },
  {
    id: "lr-03",
    image: "/images/rooms/living-room/03.jpg",
    alt: "Warm boho living room with layered sheer drapery and honeycomb shades",
    room: "living-room",
    style: "warm-boho",
    categoryIds: ["cellular", "sheer-drape"],
    caption: "Layered: honeycomb for insulation, sheers for softness.",
  },
  {
    id: "lr-04",
    image: "/images/rooms/living-room/04.jpg",
    alt: "Farmhouse living room with white faux wood blinds",
    room: "living-room",
    style: "farmhouse",
    categoryIds: ["faux-wood"],
    caption: "2\" faux wood blinds in cottage white — moisture-safe and cordless.",
  },
  {
    id: "lr-05",
    image: "/images/rooms/living-room/05.jpg",
    alt: "Minimalist living room with zebra banded shades",
    room: "living-room",
    style: "minimalist",
    categoryIds: ["zebra"],
    caption: "Zebra shades: alternate sheer and opaque bands for on-demand light.",
  },
  {
    id: "lr-06",
    image: "/images/rooms/living-room/06.jpg",
    alt: "Traditional living room with roman shades in muted linen",
    room: "living-room",
    style: "traditional",
    categoryIds: ["roman"],
    caption: "Flat-fold roman shades — timeless and tactile.",
  },

  // ── Bedroom ───────────────────────────────────────────────────────
  {
    id: "bd-01",
    image: "/images/rooms/bedroom/01.jpg",
    alt: "Modern master bedroom with blackout cellular shades",
    room: "bedroom",
    style: "modern",
    categoryIds: ["cellular"],
    caption: "Blackout honeycomb cell — total darkness, total energy efficiency.",
    featured: true,
  },
  {
    id: "bd-02",
    image: "/images/rooms/bedroom/02.jpg",
    alt: "Minimalist bedroom with white plantation shutters",
    room: "bedroom",
    style: "minimalist",
    categoryIds: ["shutters"],
    caption: "Tilt louvers for morning light, close for sleep.",
  },
  {
    id: "bd-03",
    image: "/images/rooms/bedroom/03.jpg",
    alt: "Warm boho bedroom with layered roman shade and curtains",
    room: "bedroom",
    style: "warm-boho",
    categoryIds: ["roman"],
    caption: "Relaxed roman in washed linen.",
  },
  {
    id: "bd-04",
    image: "/images/rooms/bedroom/04.jpg",
    alt: "Coastal bedroom with soft white roller shades",
    room: "bedroom",
    style: "coastal",
    categoryIds: ["roller"],
    caption: "Room-darkening roller — quiet, simple, cordless.",
  },
  {
    id: "bd-05",
    image: "/images/rooms/bedroom/05.jpg",
    alt: "Farmhouse bedroom with faux wood blinds",
    room: "bedroom",
    style: "farmhouse",
    categoryIds: ["faux-wood"],
  },

  // ── Kitchen ───────────────────────────────────────────────────────
  {
    id: "kt-01",
    image: "/images/rooms/kitchen/01.jpg",
    alt: "Farmhouse kitchen with white faux wood blinds above the sink",
    room: "kitchen",
    style: "farmhouse",
    categoryIds: ["faux-wood"],
    caption: "Faux wood is the right answer above a sink — humidity won't warp it.",
    featured: true,
  },
  {
    id: "kt-02",
    image: "/images/rooms/kitchen/02.jpg",
    alt: "Modern kitchen with cordless cellular shades",
    room: "kitchen",
    style: "modern",
    categoryIds: ["cellular"],
  },
  {
    id: "kt-03",
    image: "/images/rooms/kitchen/03.jpg",
    alt: "Coastal kitchen with cafe-height plantation shutters",
    room: "kitchen",
    style: "coastal",
    categoryIds: ["shutters"],
    caption: "Café shutters cover the bottom half — privacy with light above.",
  },
  {
    id: "kt-04",
    image: "/images/rooms/kitchen/04.jpg",
    alt: "Traditional kitchen with roman shades in soft taupe",
    room: "kitchen",
    style: "traditional",
    categoryIds: ["roman"],
  },

  // ── Bathroom ──────────────────────────────────────────────────────
  {
    id: "bt-01",
    image: "/images/rooms/bathroom/01.jpg",
    alt: "Modern bathroom with top-down bottom-up honeycomb for privacy",
    room: "bathroom",
    style: "modern",
    categoryIds: ["cellular"],
    caption: "Top-down / bottom-up — privacy below, light above.",
    featured: true,
  },
  {
    id: "bt-02",
    image: "/images/rooms/bathroom/02.jpg",
    alt: "Spa-style bathroom with frosted faux wood blinds",
    room: "bathroom",
    style: "minimalist",
    categoryIds: ["faux-wood"],
  },
  {
    id: "bt-03",
    image: "/images/rooms/bathroom/03.jpg",
    alt: "Coastal bathroom with plantation shutters",
    room: "bathroom",
    style: "coastal",
    categoryIds: ["shutters"],
    caption: "Waterproof composite shutters — engineered for humidity.",
  },

  // ── Office ────────────────────────────────────────────────────────
  {
    id: "of-01",
    image: "/images/rooms/office/01.jpg",
    alt: "Minimalist home office with solar roller shades and city view",
    room: "office",
    style: "minimalist",
    categoryIds: ["roller"],
    caption: "Solar shades: 5% openness — glare gone, view intact.",
    featured: true,
  },
  {
    id: "of-02",
    image: "/images/rooms/office/02.jpg",
    alt: "Modern home office with sheer layered shades",
    room: "office",
    style: "modern",
    categoryIds: ["sheer-drape"],
  },
  {
    id: "of-03",
    image: "/images/rooms/office/03.jpg",
    alt: "Traditional home office with wood blinds",
    room: "office",
    style: "traditional",
    categoryIds: ["faux-wood"],
    caption: "Real wood 2\" slats — rich warmth for a classic office.",
  },
  {
    id: "of-04",
    image: "/images/rooms/office/04.jpg",
    alt: "Warm boho office with natural linen roman shade",
    room: "office",
    style: "warm-boho",
    categoryIds: ["roman"],
  },

  // ── Nursery ───────────────────────────────────────────────────────
  {
    id: "nr-01",
    image: "/images/rooms/nursery/01.jpg",
    alt: "Soft nursery with blackout cordless cellular shades",
    room: "nursery",
    style: "warm-boho",
    categoryIds: ["cellular"],
    caption: "Cordless is the only safe answer in a nursery.",
    featured: true,
  },
  {
    id: "nr-02",
    image: "/images/rooms/nursery/02.jpg",
    alt: "Modern nursery with pale blue roller shades",
    room: "nursery",
    style: "modern",
    categoryIds: ["roller"],
  },
  {
    id: "nr-03",
    image: "/images/rooms/nursery/03.jpg",
    alt: "Farmhouse nursery with white faux wood blinds",
    room: "nursery",
    style: "farmhouse",
    categoryIds: ["faux-wood"],
  },

  // ── Dining Room ───────────────────────────────────────────────────
  {
    id: "dn-01",
    image: "/images/rooms/dining-room/01.jpg",
    alt: "Traditional dining room with full-height plantation shutters",
    room: "dining-room",
    style: "traditional",
    categoryIds: ["shutters"],
    caption: "Full-height shutters frame a dining bay with presence.",
  },
  {
    id: "dn-02",
    image: "/images/rooms/dining-room/02.jpg",
    alt: "Modern dining with zebra banded shades",
    room: "dining-room",
    style: "modern",
    categoryIds: ["zebra"],
  },
  {
    id: "dn-03",
    image: "/images/rooms/dining-room/03.jpg",
    alt: "Warm boho dining with layered sheer and roman",
    room: "dining-room",
    style: "warm-boho",
    categoryIds: ["roman", "sheer-drape"],
  },
];

export const INSPIRATION_ROOMS: Array<{ id: InspirationRoom; label: string }> = [
  { id: "living-room", label: "Living Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "kitchen", label: "Kitchen" },
  { id: "bathroom", label: "Bathroom" },
  { id: "office", label: "Office" },
  { id: "nursery", label: "Nursery" },
  { id: "dining-room", label: "Dining" },
];

export const INSPIRATION_STYLES: Array<{ id: InspirationStyle; label: string }> = [
  { id: "modern", label: "Modern" },
  { id: "farmhouse", label: "Farmhouse" },
  { id: "coastal", label: "Coastal" },
  { id: "traditional", label: "Traditional" },
  { id: "minimalist", label: "Minimalist" },
  { id: "warm-boho", label: "Warm Boho" },
];

/** Fallback CSS gradients by room, used when the image file 404s. */
export const ROOM_FALLBACK_GRADIENT: Record<InspirationRoom, string> = {
  "living-room": "linear-gradient(135deg, #E8D8C0 0%, #C9B393 50%, #9C7F5F 100%)",
  bedroom: "linear-gradient(135deg, #EFE1D0 0%, #C8B89E 50%, #8C7656 100%)",
  kitchen: "linear-gradient(135deg, #F4E9D3 0%, #D8C098 50%, #A68558 100%)",
  bathroom: "linear-gradient(135deg, #E2E8EC 0%, #B7C2C9 50%, #7A8A94 100%)",
  office: "linear-gradient(135deg, #EDE5D5 0%, #C4B396 50%, #8A7354 100%)",
  nursery: "linear-gradient(135deg, #F6ECDB 0%, #E0CCB2 50%, #B09475 100%)",
  "dining-room": "linear-gradient(135deg, #E8DCC8 0%, #C1A876 50%, #7D5F34 100%)",
};

/** Predicate helper: does an entry match the current filter state? */
export function filterInspiration(
  entries: InspirationEntry[],
  filters: {
    room?: InspirationRoom | "all";
    style?: InspirationStyle | "all";
    categoryId?: string | "all";
  }
): InspirationEntry[] {
  return entries.filter((e) => {
    if (filters.room && filters.room !== "all" && e.room !== filters.room) return false;
    if (filters.style && filters.style !== "all" && e.style !== filters.style) return false;
    if (
      filters.categoryId &&
      filters.categoryId !== "all" &&
      !e.categoryIds.includes(filters.categoryId)
    ) {
      return false;
    }
    return true;
  });
}
