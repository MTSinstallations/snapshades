/**
 * Manufacturer Warranty Database
 * 
 * Each manufacturer has different warranty terms.
 * Customer is routed to the correct warranty based on their purchased products.
 * Warranty info is included in the order confirmation email.
 */

export interface ManufacturerWarranty {
  manufacturer: string;
  warrantyName: string;
  duration: string;
  coverageSummary: string;
  covers: string[];
  doesNotCover: string[];
  claimProcess: string[];
  contactPhone?: string;
  contactEmail?: string;
  contactUrl?: string;
  pdfUrl?: string;  // Downloadable warranty doc
  productLines: string[];  // Which product slugs this applies to
}

export const MANUFACTURER_WARRANTIES: ManufacturerWarranty[] = [
  {
    manufacturer: 'Norman®',
    warrantyName: 'Norman® Limited Lifetime Warranty',
    duration: 'Limited Lifetime',
    coverageSummary: 'Norman warrants that their products are free from defects in materials and workmanship for the lifetime of the original purchaser. This is one of the strongest warranties in the window treatment industry.',
    covers: [
      'Defects in materials and workmanship',
      'Fabric fading beyond normal wear (5 years)',
      'Lift system mechanical failure',
      'Motorization components (5 years)',
      'Headrail and hardware defects',
      'Cord and chain mechanism failure',
      'Structural integrity of shutters, blinds, and shades',
      'Color consistency within the same order',
    ],
    doesNotCover: [
      'Normal wear and tear',
      'Damage from misuse, abuse, or accidents',
      'Damage from improper installation (DIY installations — document everything!)',
      'Damage from cleaning with improper chemicals',
      'Color fading from extreme sun exposure after 5 years',
      'Pet damage',
      'Damage from remodeling or construction',
      'Products installed in commercial settings (separate commercial warranty)',
      'Shipping damage not reported within 30 days of delivery',
    ],
    claimProcess: [
      'Contact SnapShades customer service at (888) 555-0123 or support@snapshades.com',
      'Provide your order number and describe the issue',
      'Upload photos of the defect through our claims portal',
      'Our team reviews and contacts Norman on your behalf',
      'If approved: replacement manufactured at no charge',
      'Free carrier pickup of defective product from your home',
      'New product shipped directly to you',
      'Typical resolution time: 2-4 weeks',
    ],
    contactPhone: '(888) 555-0123',
    contactEmail: 'warranty@snapshades.com',
    contactUrl: 'https://snapshades.com/claims',
    productLines: [
      'portrait-honeycomb', 'soluna-roller', 'perfectsheer', 'smartdrape',
      'centerpiece-roman', 'ultimate-faux-wood', 'smartprivacy-faux-wood',
      'normandy-wood', 'synchrony-vertical', 'citylights-aluminum', 'norman-shutters',
    ],
  },
];

// ============================================================
// SNAPSHADES POLICIES
// ============================================================

export interface PolicySection {
  id: string;
  title: string;
  icon: string;
  content: string;
  bullets?: string[];
}

export const SNAPSHADES_POLICIES: PolicySection[] = [
  {
    id: 'inspection',
    title: '30-Day Inspection Policy',
    icon: '🔍',
    content: 'You have 30 days from delivery to inspect your window treatments and report any issues. This is critical — claims made after 30 days cannot be processed.',
    bullets: [
      'Inspect ALL items within 30 days of delivery',
      'Report any damage, defects, or errors immediately',
      'Keep ALL original packaging until you confirm everything works',
      'Take photos during inspection — useful for any future claims',
      'After 30 days, shipping damage and initial defect claims cannot be filed',
      'Manufacturing defects discovered later ARE covered under manufacturer warranty',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    icon: '📦',
    content: 'Since all products are custom-made to your exact specifications, we cannot accept returns for buyer\'s remorse or change of mind. However, we stand behind our products 100%.',
    bullets: [
      'Damaged or defective products: FREE replacement, no questions asked',
      'Wrong product shipped: FREE replacement + carrier pickup',
      'Wrong size (our measurement error): FREE remake',
      'Wrong size (customer measurement error): Remake at 50% discount',
      'Color doesn\'t match swatch: Contact us within 30 days for resolution',
      'Custom products cannot be returned for change of mind',
      'Free carrier pickup from your home for all approved returns — no post office trips',
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    icon: '🚚',
    content: 'All orders ship free within the continental United States. Custom products are manufactured to order.',
    bullets: [
      'FREE shipping on all orders, all 50 states',
      'Manufacturing time: 3-6 weeks depending on product',
      'Shipping transit: 3-7 business days after manufacturing',
      'You\'ll receive tracking via email and SMS',
      'Signature may be required for orders over $500',
      'Delivery to residential addresses only',
      'Alaska and Hawaii: additional 1-2 weeks transit time',
    ],
  },
  {
    id: 'fitguarantee',
    title: 'Fit Guarantee',
    icon: '📐',
    content: 'We guarantee your window treatments will fit. If they don\'t, we\'ll make it right.',
    bullets: [
      'If our measurements are wrong (Pro Measure): 100% free remake',
      'If your measurements are wrong (DIY): remake at 50% discount',
      'Professional Measure customers: full fit guarantee, no risk',
      'DIY customers: follow our measurement guide carefully for best results',
      'When in doubt, order a Pro Measure ($75 + $2/window) — cheaper than a wrong order',
    ],
  },
  {
    id: 'installation',
    title: 'Installation Responsibility',
    icon: '🔧',
    content: 'For DIY installations, you are responsible for proper installation. We provide detailed guides but cannot warranty installation workmanship.',
    bullets: [
      'DIY: follow our step-by-step guides and videos exactly',
      'DIY: you are responsible for proper mounting and alignment',
      'DIY: improper installation may void manufacturer warranty for related damage',
      'Pro Install: our installers are certified and insured',
      'Pro Install: installation workmanship guaranteed for 1 year',
      'Pro Install: any damage during installation is covered by installer insurance',
      'Shutters: we STRONGLY recommend professional installation',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    icon: '❌',
    content: 'Orders can be cancelled before they enter manufacturing. Once in production, cancellation is not possible.',
    bullets: [
      'Cancel within 24 hours of ordering: full refund',
      'Cancel before manufacturing begins: full refund minus 5% processing fee',
      'Once in manufacturing: cannot be cancelled (custom-made to your specs)',
      'Design consultations: cancel 24 hours before for full refund',
      'Installation appointments: cancel 24 hours before, no charge',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: '🔒',
    content: 'Your privacy matters. We protect your data and never sell your information.',
    bullets: [
      'Payment processing secured by Stripe (PCI Level 1 compliant)',
      'Photos used only for measurements — never shared or sold',
      'Personal information never sold to third parties',
      'You can request data deletion at any time',
      'SSL encryption on all pages',
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Get the warranty that applies to a specific product
 */
export function getWarrantyForProduct(productSlug: string): ManufacturerWarranty | undefined {
  return MANUFACTURER_WARRANTIES.find(w => w.productLines.includes(productSlug));
}

/**
 * Get all unique warranties for an order's products
 */
export function getWarrantiesForOrder(productSlugs: string[]): ManufacturerWarranty[] {
  const seen = new Set<string>();
  return MANUFACTURER_WARRANTIES.filter(w => {
    if (seen.has(w.manufacturer)) return false;
    const applies = w.productLines.some(p => productSlugs.includes(p));
    if (applies) seen.add(w.manufacturer);
    return applies;
  });
}

/**
 * Generate warranty summary for order confirmation email
 */
export function generateWarrantyEmailSection(productSlugs: string[]): string {
  const warranties = getWarrantiesForOrder(productSlugs);
  
  let content = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANT WARRANTY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 30-DAY INSPECTION REQUIRED
You MUST inspect your products within 30 days of delivery.
Report any damage or defects immediately.
Keep all original packaging until confirmed working.
After 30 days, shipping damage claims cannot be processed.

📞 Report issues: snapshades.com/claims or (888) 555-0123
`;

  for (const warranty of warranties) {
    content += `
━━━━━━━━━━━━━━━━━━━
${warranty.manufacturer} — ${warranty.warrantyName}
Duration: ${warranty.duration}

${warranty.coverageSummary}

Covered:
${warranty.covers.map(c => `  ✓ ${c}`).join('\n')}

Not Covered:
${warranty.doesNotCover.slice(0, 5).map(c => `  ✗ ${c}`).join('\n')}

Full warranty details: snapshades.com/warranty
`;
  }

  content += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For warranty claims, always contact SnapShades first.
We handle everything with the manufacturer on your behalf.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return content.trim();
}
