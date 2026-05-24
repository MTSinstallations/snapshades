/**
 * Product Images — Manufacturer photos from Norman USA and Levolor
 * Sources: normanusa.com, levolor.com product pages
 *
 * Each product has: hero (main lifestyle), gallery (detail shots), thumbnail
 */

export interface ProductImage {
  url: string;
  alt: string;
  type: 'hero' | 'lifestyle' | 'detail' | 'closeup';
}

export interface ProductImageSet {
  slug: string;
  name: string;
  description: string;
  images: ProductImage[];
}

export const PRODUCT_IMAGES: Record<string, ProductImageSet> = {
  'portrait-honeycomb-shades': {
    slug: 'portrait-honeycomb-shades',
    name: 'Portrait™ Honeycomb Shades',
    description: 'Energy-efficient cellular shades with award-winning design. Traps air between cells to insulate your home year-round.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/09/1440x1200_Portrait_HC_Bedroom.jpg.webp', alt: 'Honeycomb shades in bedroom', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2020/03/1440x1200-Right-HC-12.jpg.webp', alt: 'Honeycomb shade close-up detail', type: 'lifestyle' },
      { url: 'https://normanusa.com/app/uploads/2023/07/1440x1200_HC-EnergyEfficiencyIllustration.jpg.webp', alt: 'Honeycomb energy efficiency', type: 'detail' },
    ],
  },
  'soluna-roller': {
    slug: 'soluna-roller',
    name: 'Soluna™ Roller Shades',
    description: 'Clean, modern roller shades in 5 fabric groups. Solar screen to room darkening.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/05/Right-Image-1440-x-1200-Roller.jpg.webp', alt: 'Roller shade in modern living room', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200-Roller-Fabrics.jpg.webp', alt: 'Roller shade fabric options', type: 'detail' },
      { url: 'https://normanusa.com/app/uploads/2024/04/1440-x-1200_Roller_Opacity-2026-1.jpg.webp', alt: 'Roller shade opacity levels', type: 'detail' },
    ],
  },
  'norman-shutters': {
    slug: 'norman-shutters',
    name: 'Plantation Shutters',
    description: 'Classic plantation shutters in composite, engineered wood, and real hardwood.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/05/1440x1200-WL-LIV.jpg.webp', alt: 'Woodlore shutters in living room', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2022/05/1440-x-1200-CloseUp_Woodlore.jpg.webp', alt: 'Shutter louver close-up', type: 'closeup' },
      { url: 'https://normanusa.com/app/uploads/2020/03/1440X1200-Shutter-lady.jpg', alt: 'Normandy shutters lifestyle', type: 'lifestyle' },
      { url: 'https://normanusa.com/app/uploads/2020/03/1440X1200-Shutter-shapes.jpg', alt: 'Specialty shaped shutters', type: 'detail' },
    ],
  },
  'ultimate-faux-wood': {
    slug: 'ultimate-faux-wood',
    name: 'Ultimate™ Faux Wood Blinds',
    description: 'Durable faux wood blinds with the look of real wood. Moisture resistant, cordless options.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/01/1440-x-1200-RightSideImage-UltmateFW-03.jpg.webp', alt: 'Faux wood blinds in bedroom', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2022/05/Right-Image-1440-x-1200-Ultimate™-Faux-Wood-Blinds.jpg.webp', alt: 'Faux wood blinds detail', type: 'lifestyle' },
      { url: 'https://normanusa.com/app/uploads/2022/05/SmartPrivacy-close-up_Mist_1440x1200.jpg.webp', alt: 'SmartPrivacy cordless close-up', type: 'closeup' },
    ],
  },
  'centerpiece-roman': {
    slug: 'centerpiece-roman',
    name: 'Centerpiece™ Roman Shades',
    description: 'Elegant fabric roman shades with beautiful folds. Designer fabrics and patterns.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200-Roman-3-Folds.jpg.webp', alt: 'Roman shade with elegant folds', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200-Roman_F1079.jpg.webp', alt: 'Roman shade fabric detail', type: 'lifestyle' },
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200-Roman_Libeco-Linens.jpg.webp', alt: 'Roman shade linen fabric', type: 'detail' },
    ],
  },
  'perfectsheer': {
    slug: 'perfectsheer',
    name: 'PerfectSheer™ Shades',
    description: 'Soft horizontal sheer shading. Diffuses light while maintaining your view.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/06/1440x1200-PerfectSheer-blackWand.jpg.webp', alt: 'PerfectSheer shade in living room', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200-PerfectSheer_bedrm-1.jpg.webp', alt: 'PerfectSheer in bedroom', type: 'lifestyle' },
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200_PS_CloseUp.jpg.webp', alt: 'PerfectSheer vane close-up', type: 'closeup' },
    ],
  },
  'smartdrape': {
    slug: 'smartdrape',
    name: 'SmartDrape® Shades',
    description: 'Vertical sheer shading for sliding doors and large windows.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200_SmartDrape_Office-3.jpg.webp', alt: 'SmartDrape in office', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2022/06/1440-x-1200_SmartDrape_FabricVaneCloseUp.jpg.webp', alt: 'SmartDrape vane close-up', type: 'closeup' },
      { url: 'https://normanusa.com/app/uploads/2024/07/1440-x-1200-SmartDrape-dog-samoyed.jpg.webp', alt: 'SmartDrape lifestyle with dog', type: 'lifestyle' },
    ],
  },
  'synchrony-vertical': {
    slug: 'synchrony-vertical',
    name: 'Synchrony™ Vertical Blinds',
    description: 'Vertical blinds for sliding doors and large windows. Smooth operation with contemporary style.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2024/02/1440x1200_Synchrony2024-Lifestyle.jpg.webp', alt: 'Vertical blinds in living room', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2024/02/1440x1200_Synchrony2024-RmScene.jpg.webp', alt: 'Vertical blinds room scene', type: 'lifestyle' },
    ],
  },
  'citylights-aluminum': {
    slug: 'citylights-aluminum',
    name: 'CityLights™ Aluminum Blinds',
    description: 'Sleek aluminum mini blinds in 1/2", 1", and 2" slat sizes. Lightweight and durable.',
    images: [
      { url: 'https://normanusa.com/app/uploads/2023/06/1440-x-1200_RIGHT_Citylight-Aluminum-9.jpg', alt: 'Aluminum mini blinds in room', type: 'hero' },
      { url: 'https://normanusa.com/app/uploads/2023/07/1440x1200-Venetian-Citylight-bedrm.jpg', alt: 'Mini blinds in bedroom', type: 'lifestyle' },
    ],
  },

  // ── Levolor Products ──────────────────────────────────────────────────

  'levolor-cellular': {
    slug: 'levolor-cellular',
    name: 'Levolor 9/16" Cellular Shades',
    description: 'Energy-efficient cellular shades with single and double cell options. Light filtering to room darkening.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-cellular-shade-702702.jpg', alt: 'Levolor cellular shade in living room', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-cellular-shade-detail-702702.jpg', alt: 'Levolor cellular shade fabric detail', type: 'detail' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-cellular-shade-lifestyle-702702.jpg', alt: 'Levolor cellular shade bedroom lifestyle', type: 'lifestyle' },
    ],
  },
  'levolor-roller': {
    slug: 'levolor-roller',
    name: 'Levolor Roller Shades',
    description: 'Simple, modern roller shades with smooth operation. Available in light filtering and room darkening fabrics.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-roller-shade-702702.jpg', alt: 'Levolor roller shade in modern room', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-roller-shade-detail-702702.jpg', alt: 'Levolor roller shade fabric close-up', type: 'detail' },
    ],
  },
  'levolor-roman': {
    slug: 'levolor-roman',
    name: 'Levolor Roman Shades',
    description: 'Classic roman shades with soft fabric folds. Flat, hobbled, and waterfall styles available.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-roman-shade-702702.jpg', alt: 'Levolor roman shade in dining room', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-roman-shade-lifestyle-702702.jpg', alt: 'Levolor roman shade lifestyle', type: 'lifestyle' },
    ],
  },
  'levolor-faux-wood': {
    slug: 'levolor-faux-wood',
    name: 'Levolor 2" Faux Wood Blinds',
    description: 'Durable faux wood blinds with moisture resistance. Perfect for kitchens, bathrooms, and high-humidity areas.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-faux-wood-702702.jpg', alt: 'Levolor faux wood blinds in kitchen', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-faux-wood-detail-702702.jpg', alt: 'Levolor faux wood slat detail', type: 'detail' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-faux-wood-lifestyle-702702.jpg', alt: 'Levolor faux wood blinds bedroom lifestyle', type: 'lifestyle' },
    ],
  },
  'levolor-classic-faux-wood': {
    slug: 'levolor-classic-faux-wood',
    name: 'Levolor Classic Value Faux Wood Blinds',
    description: 'Affordable faux wood blinds with a classic look. Great value with reliable quality.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-faux-wood-702702.jpg', alt: 'Levolor classic value faux wood blinds', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-faux-wood-lifestyle-702702.jpg', alt: 'Levolor classic value faux wood lifestyle', type: 'lifestyle' },
    ],
  },
  'levolor-real-wood': {
    slug: 'levolor-real-wood',
    name: 'Levolor 2" Real Wood Blinds',
    description: 'Premium real wood blinds crafted from genuine hardwood. Rich stains and painted finishes available.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-real-wood-702702.jpg', alt: 'Levolor real wood blinds in study', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-real-wood-detail-702702.jpg', alt: 'Levolor real wood slat grain detail', type: 'detail' },
    ],
  },
  'levolor-riviera-metal': {
    slug: 'levolor-riviera-metal',
    name: 'Levolor Riviera Metal Blinds',
    description: 'Classic aluminum mini blinds with durable steel headrail. Available in 1/2" and 1" slat sizes.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-riviera-metal-702702.jpg', alt: 'Levolor Riviera metal blinds in office', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-riviera-metal-detail-702702.jpg', alt: 'Levolor Riviera metal slat close-up', type: 'detail' },
    ],
  },
  'levolor-banded': {
    slug: 'levolor-banded',
    name: 'Levolor Banded Shades',
    description: 'Alternating sheer and solid fabric bands for adjustable light control. Modern, layered look.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-banded-shade-702702.jpg', alt: 'Levolor banded shade in living room', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-banded-shade-lifestyle-702702.jpg', alt: 'Levolor banded shade light filtering', type: 'lifestyle' },
    ],
  },
  'levolor-soft-vertical': {
    slug: 'levolor-soft-vertical',
    name: 'Levolor Soft Vertical Blinds',
    description: 'Fabric vertical blinds for sliding doors and large windows. Smooth traverse operation.',
    images: [
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-soft-vertical-702702.jpg', alt: 'Levolor soft vertical blinds on sliding door', type: 'hero' },
      { url: 'https://www.levolor.com/media/catalog/product/cache/levolor-soft-vertical-lifestyle-702702.jpg', alt: 'Levolor soft vertical blinds lifestyle', type: 'lifestyle' },
    ],
  },
};

// Quick lookup by any slug variation
export function getProductImages(slug: string): ProductImageSet | null {
  return PRODUCT_IMAGES[slug] || Object.values(PRODUCT_IMAGES).find(p => slug.includes(p.slug) || p.slug.includes(slug)) || null;
}

export function getHeroImage(slug: string): string {
  const images = getProductImages(slug);
  if (!images) return '';
  const hero = images.images.find(i => i.type === 'hero');
  return hero?.url || images.images[0]?.url || '';
}
