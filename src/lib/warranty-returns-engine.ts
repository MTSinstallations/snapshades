/**
 * SnapShades Warranty, Returns & Customer Care Engine
 * 
 * 30-DAY INSPECTION POLICY (CRITICAL):
 * - Customer MUST inspect product within 30 days of delivery
 * - Customer MUST report any damage/defects within 30 days
 * - After 30 days: warranty void for damage claims
 * - Customer must keep ALL original packaging until confirmed working
 * 
 * COMMUNICATION TRIGGERS:
 * 1. Order placed → confirmation email + SMS
 * 2. Order shipped → tracking email + SMS
 * 3. Delivered → INSPECTION NOTICE (email + SMS, bold 30-day warning)
 * 4. Day 7 → Reminder: "Have you inspected? 23 days left"
 * 5. Day 21 → Urgent: "9 days left to report issues"
 * 6. Day 28 → Final: "2 days left — inspect NOW"
 * 7. Day 30 → Warranty window closed confirmation
 * 
 * RETURNS FLOW:
 * 1. Customer reports issue (within 30 days) via portal or AI phone
 * 2. Upload photos of damage
 * 3. SnapShades reviews → approves or requests more info
 * 4. If approved: schedule carrier pickup from customer's home
 * 5. UPS/FedEx picks up → ships back to manufacturer
 * 6. Replacement manufactured + shipped
 * 
 * DIY INSTRUCTIONS:
 * - Per-product installation guides
 * - Video links
 * - Tool requirements
 * - Step-by-step with images
 * - Common mistakes to avoid
 */

// ============================================================
// TYPES
// ============================================================

export type ClaimType = 'damaged' | 'defective' | 'wrong_product' | 'wrong_size' | 'wrong_color' | 'missing_parts' | 'other';
export type ClaimStatus = 'submitted' | 'reviewing' | 'info_requested' | 'approved' | 'denied' | 'pickup_scheduled' | 'in_transit' | 'received_by_manufacturer' | 'replacement_shipped' | 'resolved';
export type CarrierName = 'UPS' | 'FedEx' | 'USPS';

export interface WarrantyPolicy {
  inspectionWindowDays: 30;
  mustKeepPackaging: true;
  carrierPickupFromHome: true;
  customerPaysReturnShipping: false; // We cover it for valid claims
  maxClaimsPerOrder: 3;
}

export const WARRANTY_POLICY: WarrantyPolicy = {
  inspectionWindowDays: 30,
  mustKeepPackaging: true,
  carrierPickupFromHome: true,
  customerPaysReturnShipping: false,
  maxClaimsPerOrder: 3,
};

export interface DamageClaim {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Claim details
  claimType: ClaimType;
  affectedItems: {
    lineItemId: string;
    room: string;
    windowName: string;
    product: string;
    issue: string;
  }[];
  description: string;
  photoUrls: string[];
  
  // Timeline
  deliveredAt: string;
  reportedAt: string;
  daysAfterDelivery: number;
  withinWarranty: boolean;
  
  // Status
  status: ClaimStatus;
  statusHistory: { status: ClaimStatus; timestamp: string; note?: string; by?: string }[];
  
  // Resolution
  resolution?: 'replacement' | 'refund' | 'repair' | 'denied';
  resolutionNote?: string;
  
  // Return logistics
  returnCarrier?: CarrierName;
  returnTrackingNumber?: string;
  pickupScheduledDate?: string;
  pickupAddress?: string;
  returnLabel?: string; // URL to printable label
  
  // Replacement
  replacementOrderId?: string;
  replacementTrackingNumber?: string;
  
  createdAt: string;
  resolvedAt?: string;
}

export interface InspectionReminder {
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  deliveredAt: string;
  daysSinceDelivery: number;
  reminderType: 'delivery' | 'day7' | 'day21' | 'day28' | 'expired';
  sent: boolean;
  sentAt?: string;
  channel: 'email' | 'sms' | 'both';
}

// ============================================================
// COMMUNICATION TEMPLATES
// ============================================================

export const CUSTOMER_MESSAGES = {
  // Delivery notification — THE CRITICAL ONE
  delivery_inspection_notice: {
    subject: '📦 Your SnapShades Order Has Been Delivered — IMPORTANT: 30-Day Inspection Required',
    sms: (orderNumber: string) => 
      `SnapShades: Your order #${orderNumber} was delivered! ⚠️ IMPORTANT: You have 30 days to inspect your window treatments and report any issues. Keep all packaging. Details in your email. Reply HELP for assistance.`,
    email: (orderNumber: string, customerName: string) => `
Hi ${customerName},

Great news — your SnapShades order #${orderNumber} has been delivered! 🎉

⚠️ **IMPORTANT — 30-DAY INSPECTION REQUIRED** ⚠️

Please inspect your window treatments within **30 days** of delivery and report any damage, defects, or issues.

**What to do NOW:**

1. **Open each box carefully** — keep all packaging materials
2. **Inspect every window treatment** for damage, correct color, and correct size
3. **Test the operation** — raise, lower, tilt to make sure everything works
4. **Report any issues immediately** at snapshades.com/claims or call (888) 555-0123

**⏰ Your inspection deadline: [DEADLINE DATE]**

After 30 days, warranty claims for shipping damage or product defects cannot be processed. This protects both you and us.

**Keep your boxes!** If a return is needed, we'll schedule a free carrier pickup from your home — no trip to the post office needed.

Everything look great? Awesome! You can install at your convenience using our step-by-step guides at snapshades.com/install-guides.

— The SnapShades Team
    `.trim(),
  },

  // Day 7 reminder
  day7_reminder: {
    subject: '📋 SnapShades Inspection Reminder — 23 Days Left',
    sms: (orderNumber: string) =>
      `SnapShades reminder: Have you inspected order #${orderNumber}? You have 23 days left to report any issues. Keep packaging until confirmed. snapshades.com/claims`,
    email: (orderNumber: string, customerName: string) => `
Hi ${customerName},

Quick reminder — have you had a chance to inspect your window treatments from order #${orderNumber}?

📅 **23 days remaining** in your inspection window.

If everything looks great, no action needed! If you notice any issues, report them at snapshades.com/claims.

Remember: keep all original packaging until you've confirmed everything is working properly.

— SnapShades
    `.trim(),
  },

  // Day 21 — getting urgent
  day21_reminder: {
    subject: '⚠️ 9 Days Left to Inspect Your SnapShades Order',
    sms: (orderNumber: string) =>
      `⚠️ SnapShades: Only 9 days left to inspect order #${orderNumber} and report issues. After that, warranty claims cannot be processed. snapshades.com/claims`,
    email: (orderNumber: string, customerName: string) => `
Hi ${customerName},

**⚠️ 9 days remaining** to inspect your window treatments and report any issues.

Order: #${orderNumber}

After your 30-day inspection window closes, we cannot process warranty claims for shipping damage or product defects.

**Quick checklist:**
☐ All items accounted for
☐ Correct colors and sizes
☐ No shipping damage
☐ Operation works (raise/lower/tilt)
☐ Fits your window properly

All good? Great! Proceed with installation.
Issue found? Report now: snapshades.com/claims or (888) 555-0123

— SnapShades
    `.trim(),
  },

  // Day 28 — final warning
  day28_final_warning: {
    subject: '🚨 FINAL: 2 Days Left — Inspect Your SnapShades Order NOW',
    sms: (orderNumber: string) =>
      `🚨 FINAL NOTICE: Only 2 days left on order #${orderNumber} inspection window. Report any issues NOW at snapshades.com/claims or call (888) 555-0123.`,
    email: (orderNumber: string, customerName: string) => `
Hi ${customerName},

**🚨 FINAL NOTICE — 2 DAYS REMAINING**

Your 30-day inspection window for order #${orderNumber} closes in **2 days**.

After this date, we cannot accept warranty claims for:
- Shipping damage
- Product defects
- Wrong items or sizes

**If you haven't inspected yet, please do so TODAY.**

Report issues: snapshades.com/claims
Call us: (888) 555-0123

If everything is fine, no action needed. Happy installing!

— SnapShades
    `.trim(),
  },

  // Claim approved
  claim_approved: {
    subject: '✅ Your Claim Has Been Approved — Return Pickup Scheduled',
    email: (claim: DamageClaim) => `
Hi,

Your damage claim for order #${claim.orderNumber} has been approved.

**What happens next:**
1. A ${claim.returnCarrier || 'carrier'} pickup has been scheduled for **${claim.pickupScheduledDate || 'TBD'}**
2. Have the item(s) packed in original packaging and ready at your door
3. The driver will pick up — no need to go anywhere
4. Once received, your replacement will be manufactured and shipped
5. You'll get tracking for the replacement

${claim.returnTrackingNumber ? `Return tracking: ${claim.returnTrackingNumber}` : ''}

Questions? Reply to this email or call (888) 555-0123.

— SnapShades
    `.trim(),
  },
};

// ============================================================
// DIY INSTALLATION GUIDES
// ============================================================

export interface InstallGuide {
  productType: string;
  title: string;
  estimatedTime: string;
  difficulty: 'easy' | 'moderate' | 'advanced';
  toolsRequired: string[];
  steps: { step: number; title: string; description: string; imageUrl?: string; tip?: string }[];
  videoUrl?: string;
  commonMistakes: string[];
  warnings: string[];
}

export const INSTALL_GUIDES: InstallGuide[] = [
  {
    productType: 'honeycomb',
    title: 'How to Install Honeycomb (Cellular) Shades',
    estimatedTime: '10-15 minutes per window',
    difficulty: 'easy',
    toolsRequired: ['Phillips screwdriver or drill', 'Level', 'Pencil', 'Tape measure', 'Step stool (if needed)'],
    steps: [
      { step: 1, title: 'Unpack & Inspect', description: 'Remove shade from packaging. Lay flat and inspect for any damage. Check that width and color match your order. DO NOT discard packaging until installed and confirmed working.', tip: 'Take a photo of the shade before installing — useful if you need to file a claim.' },
      { step: 2, title: 'Mark Bracket Positions', description: 'For inside mount: position brackets 2-3 inches from each end inside the window frame. Use a level to ensure they\'re aligned. Mark screw holes with pencil.', tip: 'If your window frame is narrow, you may need to use the shallowest bracket position.' },
      { step: 3, title: 'Install Brackets', description: 'For inside mount: screw brackets into the top of the window frame using provided screws. For outside mount: screw into the wall above the window. Use wall anchors if not screwing into studs.', tip: 'Pre-drill pilot holes to prevent wood splitting.' },
      { step: 4, title: 'Snap in the Shade', description: 'Hold the headrail up to the brackets. Push the front of the headrail into the bracket clips until they snap into place. You should hear/feel a click.', tip: 'If the shade doesn\'t snap in easily, check that brackets are level and properly spaced.' },
      { step: 5, title: 'Test Operation', description: 'For cordless: gently push up from the bottom rail to raise, pull down to lower. For SmartFit: push down from the top rail to lower the top. Test full range of motion.', tip: 'If the shade doesn\'t stay in position, it may need tension adjustment — see troubleshooting.' },
      { step: 6, title: 'Install Hold-Down Brackets (if applicable)', description: 'For doors or SmartFit shades: install hold-down brackets at the bottom of the frame. These keep the shade in place when the door opens.' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_honeycomb',
    commonMistakes: [
      'Mounting brackets too close together (shade won\'t snap in)',
      'Not using a level (shade hangs crooked)',
      'Over-tightening screws (cracks the frame)',
      'Discarding packaging before testing the shade',
      'Forcing the shade into brackets instead of snapping',
    ],
    warnings: [
      'Keep all cords out of reach of children and pets',
      'Do not force the shade mechanism — if stuck, check for obstructions',
      'For motorized shades, fully charge before first use',
    ],
  },
  {
    productType: 'roller',
    title: 'How to Install Roller Shades',
    estimatedTime: '10-15 minutes per window',
    difficulty: 'easy',
    toolsRequired: ['Phillips screwdriver or drill', 'Level', 'Pencil', 'Tape measure'],
    steps: [
      { step: 1, title: 'Unpack & Inspect', description: 'Remove shade and brackets from packaging. Unroll the shade to check for damage. Verify width, color, and roll direction match your order.' },
      { step: 2, title: 'Identify Left & Right Brackets', description: 'Brackets are marked L and R. The pin end goes in the non-clutch bracket. The clutch/chain end goes in the clutch bracket.' },
      { step: 3, title: 'Mark & Install Brackets', description: 'Inside mount: install brackets at top of window frame, 2" from each side. Outside mount: install above window on wall. Use level to align.' },
      { step: 4, title: 'Mount the Shade', description: 'Insert the pin end into the non-clutch bracket first. Then push the clutch end into the clutch bracket until it clicks.' },
      { step: 5, title: 'Test Operation', description: 'Pull the chain to lower and raise the shade. Check that it rolls evenly and stops at desired positions.' },
      { step: 6, title: 'Install Cassette (if ordered)', description: 'If you have a cassette cover, snap it over the roller tube after mounting the shade.' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_roller',
    commonMistakes: [
      'Reversing left and right brackets',
      'Not checking roll direction before mounting',
      'Installing cassette before shade is mounted',
    ],
    warnings: [
      'Chain can be a strangulation hazard — install chain tensioner',
      'Keep chain out of reach of children',
    ],
  },
  {
    productType: 'faux_wood_blinds',
    title: 'How to Install Faux Wood Blinds',
    estimatedTime: '15-20 minutes per window',
    difficulty: 'easy',
    toolsRequired: ['Phillips screwdriver or drill', 'Level', 'Pencil', 'Tape measure'],
    steps: [
      { step: 1, title: 'Unpack & Inspect', description: 'Check all slats for damage. Count slats against packing slip. Verify color, width, and slat size.' },
      { step: 2, title: 'Mark Bracket Positions', description: 'Inside mount: position brackets 2-4" from each end at top of frame. For wide blinds (>48"), add center support bracket.' },
      { step: 3, title: 'Install Brackets', description: 'Screw brackets into window frame or wall. Inside mount uses top-of-frame. Outside mount uses wall above window.' },
      { step: 4, title: 'Clip in the Headrail', description: 'Push the headrail into the bracket clips from the front. Close the bracket doors/latches to lock the headrail in place.' },
      { step: 5, title: 'Test Lift & Tilt', description: 'Test the cord/wand to raise, lower, and tilt the slats. Ensure smooth operation in all positions.' },
      { step: 6, title: 'Attach Valance', description: 'Clip the valance onto the provided valance clips on the front of the headrail.' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_fauxwood',
    commonMistakes: [
      'Forgetting center support bracket on wide blinds',
      'Not closing bracket latches fully (blind falls)',
      'Pulling too hard on tilt wand',
    ],
    warnings: [
      'Cords are a strangulation hazard for children',
      'Install cord cleats high on wall, out of child reach',
    ],
  },
  {
    productType: 'shutters',
    title: 'How to Install Plantation Shutters',
    estimatedTime: '30-60 minutes per window',
    difficulty: 'advanced',
    toolsRequired: ['Drill with Phillips bit', 'Level', 'Pencil', 'Tape measure', 'Shims', 'Wood filler (for holes)', 'Step stool'],
    steps: [
      { step: 1, title: 'Unpack & Inspect', description: 'Carefully unpack frame and panels. Check for shipping damage. Verify dimensions, color, louver size, and configuration match your order.' },
      { step: 2, title: 'Dry Fit the Frame', description: 'Place the frame in the window opening WITHOUT screwing. Check for square using a level. Identify where shims may be needed.' },
      { step: 3, title: 'Install the Frame', description: 'Inside mount: position frame flush with window edge. Pre-drill through frame into window jamb. Use shims if window is out of square. Screw through frame into jamb.', tip: 'For Z-frame, screws go through the back channel. For L-frame, screws go through the side.' },
      { step: 4, title: 'Check Level & Square', description: 'After securing, verify frame is level and square. Adjust shims if needed. Fill any visible screw holes with matching wood filler.' },
      { step: 5, title: 'Hang Shutter Panels', description: 'Attach panels to frame using the provided hinges. Most shutters come with hinges pre-attached — just screw hinge pins into the frame.' },
      { step: 6, title: 'Test Operation', description: 'Open and close panels. Tilt louvers up and down using tilt rod or InvisibleTilt. Ensure panels align when closed.' },
      { step: 7, title: 'Adjust & Finish', description: 'Adjust hinge tension if panels don\'t stay in position. Apply touch-up paint to any screw holes or minor scratches.' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_shutters',
    commonMistakes: [
      'Not checking for square before screwing frame',
      'Using wrong screws (too long = damages wall, too short = doesn\'t hold)',
      'Forgetting to shim on uneven windows',
      'Over-tightening hinges',
      'Not pre-drilling (splits the frame)',
    ],
    warnings: [
      '⚠️ Shutter installation is ADVANCED — we strongly recommend professional installation',
      'Shutters are heavy — use a helper for large panels',
      'Incorrect installation can damage the window frame and void warranty',
    ],
  },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if a claim is within the 30-day inspection window
 */
export function isWithinWarrantyWindow(deliveredAt: string, reportedAt: string = new Date().toISOString()): boolean {
  const delivered = new Date(deliveredAt);
  const reported = new Date(reportedAt);
  const diffDays = Math.floor((reported.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= WARRANTY_POLICY.inspectionWindowDays;
}

/**
 * Get remaining inspection days
 */
export function getInspectionDaysRemaining(deliveredAt: string): number {
  const delivered = new Date(deliveredAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, WARRANTY_POLICY.inspectionWindowDays - diffDays);
}

/**
 * Determine which reminder to send based on days since delivery
 */
export function getNextReminder(daysSinceDelivery: number): InspectionReminder['reminderType'] | null {
  if (daysSinceDelivery === 0) return 'delivery';
  if (daysSinceDelivery === 7) return 'day7';
  if (daysSinceDelivery === 21) return 'day21';
  if (daysSinceDelivery === 28) return 'day28';
  if (daysSinceDelivery === 30) return 'expired';
  return null;
}

/**
 * Get installation guide for a product type
 */
export function getInstallGuide(productType: string): InstallGuide | undefined {
  return INSTALL_GUIDES.find(g => g.productType === productType);
}
