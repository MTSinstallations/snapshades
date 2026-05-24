/**
 * Discovery taxonomy — the three parallel entry points on the homepage
 * (Shop by Room / Need / Style). Non-experts don't know the difference
 * between a cellular shade and a roller — these tiles meet them where
 * they are.
 *
 * Each tile is a Link; `route` is the destination. Future Phase 8 work
 * wires Need / Style tiles into pre-filtered Products.tsx views.
 */

export interface DiscoveryTile {
  slug: string;
  label: string;
  blurb: string;
  route: string;
  /** Optional background image path (loaded from public/images/...). */
  image?: string;
  /** Fallback radial-gradient swatch when no image exists yet. */
  gradient?: string;
}

export interface DiscoverySection {
  id: "rooms" | "needs" | "styles";
  title: string;
  tiles: DiscoveryTile[];
}

export const DISCOVERY: DiscoverySection[] = [
  {
    id: "rooms",
    title: "Shop by Room",
    tiles: [
      { slug: "living-room", label: "Living Room", blurb: "Warm light, layered drama", route: "/products?room=living-room", image: "/images/rooms/living-room/01.jpg", gradient: "radial-gradient(at 30% 30%, #E8DCC8, #C9B59A)" },
      { slug: "bedroom", label: "Bedroom", blurb: "Blackout options, total calm", route: "/products?room=bedroom", image: "/images/rooms/bedroom/01.jpg", gradient: "radial-gradient(at 30% 30%, #D8CEC1, #9A8E7F)" },
      { slug: "kitchen", label: "Kitchen", blurb: "Moisture-tough, easy to clean", route: "/products?room=kitchen", image: "/images/rooms/kitchen/01.jpg", gradient: "radial-gradient(at 30% 30%, #F2E8D4, #B89468)" },
      { slug: "bathroom", label: "Bathroom", blurb: "Privacy without losing the view", route: "/products?room=bathroom", image: "/images/rooms/bathroom/01.jpg", gradient: "radial-gradient(at 30% 30%, #E0E8E8, #9AB0B0)" },
      { slug: "office", label: "Office", blurb: "Glare control, sharp focus", route: "/products?room=office", image: "/images/rooms/office/01.jpg", gradient: "radial-gradient(at 30% 30%, #D8D0C4, #8A7E6E)" },
      { slug: "nursery", label: "Nursery", blurb: "Soft, cordless, safe for small hands", route: "/products?room=nursery", image: "/images/rooms/nursery/01.jpg", gradient: "radial-gradient(at 30% 30%, #F4DCDC, #D8A8A8)" },
    ],
  },
  {
    id: "needs",
    title: "Shop by Need",
    tiles: [
      { slug: "privacy", label: "Privacy", blurb: "Room-darkening + blackout options", route: "/products?need=privacy", gradient: "radial-gradient(at 30% 30%, #5A4F44, #26201A)" },
      { slug: "blackout", label: "Total Blackout", blurb: "Sleep-tight bedroom-grade", route: "/products?need=blackout", gradient: "radial-gradient(at 30% 30%, #2A2420, #0F0C0A)" },
      { slug: "energy", label: "Energy Efficient", blurb: "Cellular shades trap air", route: "/products?need=energy", gradient: "radial-gradient(at 30% 30%, #C8DCC8, #6E8A6E)" },
      { slug: "motorized", label: "Motorized", blurb: "App or voice, zero cords", route: "/products?need=motorized", gradient: "radial-gradient(at 30% 30%, #D8D8E2, #808098)" },
      { slug: "child-safe", label: "Kid & Pet Safe", blurb: "Fully cordless designs", route: "/products?need=child-safe", gradient: "radial-gradient(at 30% 30%, #F0DCB8, #C89E58)" },
      { slug: "sheer", label: "Soft Light", blurb: "Diffuse glare, keep the view", route: "/products?need=sheer", gradient: "radial-gradient(at 30% 30%, #F4ECD8, #D6C088)" },
    ],
  },
  {
    id: "styles",
    title: "Shop by Style",
    tiles: [
      { slug: "modern", label: "Modern", blurb: "Clean lines, minimal hardware", route: "/products?style=modern", gradient: "radial-gradient(at 30% 30%, #E8E0D4, #A89E8E)" },
      { slug: "farmhouse", label: "Farmhouse", blurb: "Natural wood, warm neutrals", route: "/products?style=farmhouse", gradient: "radial-gradient(at 30% 30%, #E4D2B4, #9E7E4E)" },
      { slug: "coastal", label: "Coastal", blurb: "Bright whites and soft blues", route: "/products?style=coastal", gradient: "radial-gradient(at 30% 30%, #D8E8EC, #8AAEBC)" },
      { slug: "traditional", label: "Traditional", blurb: "Plantation shutters, roman folds", route: "/products?style=traditional", gradient: "radial-gradient(at 30% 30%, #F0E4CC, #B89868)" },
      { slug: "minimalist", label: "Minimalist", blurb: "Pared-back roller or solar", route: "/products?style=minimalist", gradient: "radial-gradient(at 30% 30%, #F0ECE4, #B8B0A4)" },
      { slug: "boho", label: "Boho", blurb: "Textured romans, layered looks", route: "/products?style=boho", gradient: "radial-gradient(at 30% 30%, #E8D8C0, #B88E5A)" },
    ],
  },
];
