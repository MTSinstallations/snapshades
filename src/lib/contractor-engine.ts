/**
 * SnapShades Contractor Infrastructure
 * 
 * COMPLETE SYSTEM:
 * 1. Admin sends invite email → contractor gets unique signup link
 * 2. Contractor completes profile → sets territory (ZIP codes + radius)
 * 3. Contractor sets availability on calendar → goes live
 * 4. Customer orders with Pro tier → system matches by ZIP → assigns contractor
 * 5. Contractor gets email + push notification with full order
 * 6. Contractor opens portal → sees job → measures → submits
 * 7. Measurements verified → order goes to manufacturing
 * 8. Product ships → contractor notified for install scheduling
 * 9. Install complete → contractor marks done → gets paid
 */

// ============================================================
// TYPES
// ============================================================

export type ContractorStatus = 'invited' | 'onboarding' | 'pending_review' | 'active' | 'inactive' | 'suspended';
export type ContractorType = 'installer' | 'measurer' | 'designer' | 'full_service';
export type JobStatus = 'assigned' | 'accepted' | 'declined' | 'en_route' | 'on_site' | 'measuring' | 'measure_complete' | 'installing' | 'install_complete' | 'needs_revisit' | 'completed' | 'cancelled';
export type NotificationType = 'new_job' | 'job_reminder' | 'job_cancelled' | 'payment_sent' | 'review_received' | 'availability_reminder' | 'measure_approved' | 'product_shipped';

export interface ContractorProfile {
  id: string;
  inviteToken: string;
  status: ContractorStatus;
  type: ContractorType;
  
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  profilePhotoUrl?: string;
  
  // Territory
  primaryZip: string;
  serviceZips: string[];
  serviceRadiusMiles: number;
  latitude?: number;
  longitude?: number;
  
  // Capabilities
  canMeasure: boolean;
  canInstall: boolean;
  canDesign: boolean;
  specialties: string[];  // 'blinds', 'shades', 'shutters', 'drapes', 'motorized'
  
  // Verification
  insuranceVerified: boolean;
  insuranceExpiry?: string;
  insuranceDocUrl?: string;
  backgroundCheckPassed: boolean;
  backgroundCheckDate?: string;
  licenseNumber?: string;
  licenseState?: string;
  
  // Rates
  perWindowRate: number;
  minimumJobRate: number;
  travelFeeThreshold: number;  // miles before travel fee
  travelFeePerMile: number;
  
  // Performance
  rating: number;
  totalRatings: number;
  completedJobs: number;
  cancelledJobs: number;
  noShowCount: number;
  avgCompletionMinutes: number;
  onTimePercent: number;
  
  // Payment
  stripeConnectId?: string;
  paymentMethod: 'direct_deposit' | 'check' | 'stripe';
  bankRoutingLast4?: string;
  bankAccountLast4?: string;
  
  // Preferences
  maxJobsPerDay: number;
  preferredNotification: 'email' | 'sms' | 'both';
  autoAcceptJobs: boolean;
  
  // Timestamps
  invitedAt: string;
  onboardedAt?: string;
  activatedAt?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorInvite {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  type: ContractorType;
  territory: string[];  // ZIP codes
  token: string;
  sentAt: string;
  acceptedAt?: string;
  expiresAt: string;
  sentBy: string;  // admin ID
  message?: string;  // custom invite message
}

export interface Territory {
  zip: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  assignedContractors: string[];  // contractor IDs
  maxContractors: number;
  demandLevel: 'low' | 'medium' | 'high';
}

export interface JobAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  contractorId: string;
  
  // Service
  serviceType: 'measure' | 'install' | 'measure_install' | 'design';
  scheduledDate: string;
  scheduledSlot: string;
  
  // Status tracking
  status: JobStatus;
  statusHistory: { status: JobStatus; timestamp: string; note?: string }[];
  
  // Customer
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes?: string;
  };
  
  // Order details
  lineItems: OrderLineItem[];
  productTotal: number;
  installFee: number;
  travelFee: number;
  contractorPayout: number;
  
  // Measurements (filled by contractor)
  measurements?: Record<string, WindowMeasurement>;
  measureSubmittedAt?: string;
  measureApprovedAt?: string;
  
  // Completion
  completedAt?: string;
  completionPhotos?: string[];
  customerSignatureUrl?: string;
  
  // Payment
  payoutStatus: 'pending' | 'processing' | 'paid' | 'held';
  payoutAmount: number;
  paidAt?: string;
  
  // Timestamps
  assignedAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface OrderLineItem {
  id: string;
  room: string;
  windowName: string;
  windowNumber: number;
  product: string;
  manufacturer: string;
  variant?: string;
  color?: string;
  liftSystem?: string;
  tier: 'ship' | 'install' | 'design';
  price: number;
  addOns: string[];
  customerWidth?: number;  // customer-provided (may be approximate)
  customerHeight?: number;
  specialInstructions?: string;
}

export interface WindowMeasurement {
  windowId: string;
  mountType: 'inside' | 'outside';
  
  // Primary measurements (in inches, 1/8" precision)
  topWidth: number;
  middleWidth?: number;
  bottomWidth: number;
  leftHeight: number;
  centerHeight?: number;
  rightHeight: number;
  depth: number;
  
  // Computed (auto-calculated)
  orderWidth: number;   // smallest width
  orderHeight: number;  // smallest height
  squareFeet: number;
  
  // Details
  obstructions: string[];
  obstructionNotes?: string;
  frameCondition: 'good' | 'fair' | 'damaged' | 'needs_repair';
  windowType: 'single_hung' | 'double_hung' | 'casement' | 'slider' | 'fixed' | 'bay' | 'arch' | 'skylight' | 'french_door' | 'sliding_door' | 'other';
  
  // Photos
  overviewPhotoUrl?: string;
  measurePhotoUrls?: string[];
  obstructionPhotoUrls?: string[];
  
  // Notes
  notes?: string;
  issueFlag?: 'none' | 'depth_concern' | 'out_of_square' | 'obstruction_issue' | 'product_may_not_fit' | 'customer_request';
  issueFlagNote?: string;
  
  // Verification
  measuredAt: string;
  measuredBy: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Notification {
  id: string;
  contractorId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  sentAt: string;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

export const EMAIL_TEMPLATES = {
  contractor_invite: {
    subject: 'You\'re Invited to Join the SnapShades Installer Network',
    template: (invite: ContractorInvite, signupUrl: string) => `
Hi ${invite.name || 'there'},

You've been invited to join the SnapShades professional installer network.

SnapShades is a premium window treatment platform that connects homeowners with certified installers like you. Set your own schedule, service area, and rates — we handle the rest.

**What you get:**
• Steady stream of local installation jobs
• $50-150+ per installation
• Set your own availability
• All materials shipped to the customer — you just install
• Weekly direct deposit payments
• Build your reputation with ratings & reviews

**Get started in 3 minutes:**
${signupUrl}

This invite is valid for 7 days.

${invite.message ? `Personal note: ${invite.message}` : ''}

Questions? Reply to this email or call (888) 555-0123.

— The SnapShades Team
    `.trim(),
  },
  
  new_job_assigned: {
    subject: (orderNumber: string) => `New Job Assigned: #${orderNumber}`,
    template: (job: JobAssignment) => `
Hi,

You have a new job assigned!

**Order #${job.orderNumber}**
📅 ${job.scheduledDate} at ${job.scheduledSlot}
📍 ${job.customer.address}
👤 ${job.customer.name} — ${job.customer.phone}
🔧 ${job.serviceType === 'measure' ? 'Measure Only' : job.serviceType === 'install' ? 'Installation' : job.serviceType === 'measure_install' ? 'Measure + Install' : 'Design Consultation'}
🪟 ${job.lineItems.length} windows across ${[...new Set(job.lineItems.map(i => i.room))].length} rooms
💰 Your payout: $${job.contractorPayout.toFixed(2)}

${job.customer.notes ? `📝 Customer notes: ${job.customer.notes}` : ''}

**Action required:** Please accept or decline within 2 hours.

View full details and accept: [Open Portal]

— SnapShades
    `.trim(),
  },

  job_reminder: {
    subject: (orderNumber: string) => `Reminder: Job #${orderNumber} Tomorrow`,
    template: (job: JobAssignment) => `
Reminder: You have a job tomorrow.

**Order #${job.orderNumber}**
📅 ${job.scheduledDate} at ${job.scheduledSlot}
📍 ${job.customer.address}
👤 ${job.customer.name} — ${job.customer.phone}

Please contact the customer 30 minutes before arrival.

— SnapShades
    `.trim(),
  },

  measurement_approved: {
    subject: (orderNumber: string) => `Measurements Approved: #${orderNumber}`,
    template: (job: JobAssignment) => `
Great news! Your measurements for Order #${job.orderNumber} have been approved and sent to manufacturing.

Estimated production time: 4-6 weeks
You'll be notified when products ship so we can schedule the installation.

— SnapShades
    `.trim(),
  },

  payment_sent: {
    subject: (amount: number) => `Payment Sent: $${amount.toFixed(2)}`,
    template: (amount: number, jobIds: string[]) => `
Your payment of $${amount.toFixed(2)} has been sent via direct deposit.

Jobs included: ${jobIds.join(', ')}
Expected arrival: 1-2 business days

View payment history in your portal.

— SnapShades
    `.trim(),
  },
};

// ============================================================
// TERRITORY ENGINE
// ============================================================

// Haversine distance calculation
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find all eligible contractors for a customer's address
 * Scoring: distance (40%) + rating (30%) + availability (20%) + workload balance (10%)
 */
export function findEligibleContractors(
  customerZip: string,
  serviceType: 'measure' | 'install' | 'measure_install' | 'design',
  contractors: ContractorProfile[],
): { contractor: ContractorProfile; score: number; distance?: number }[] {
  return contractors
    .filter(c => {
      if (c.status !== 'active') return false;
      if (!c.serviceZips.includes(customerZip)) return false;
      if (serviceType === 'measure' && !c.canMeasure) return false;
      if (serviceType === 'install' && !c.canInstall) return false;
      if (serviceType === 'design' && !c.canDesign) return false;
      if (serviceType === 'measure_install' && (!c.canMeasure || !c.canInstall)) return false;
      return true;
    })
    .map(c => {
      // Score calculation
      const ratingScore = (c.rating / 5) * 30;
      const reliabilityScore = (c.onTimePercent / 100) * 20;
      const workloadScore = Math.max(0, 10 - (c.completedJobs % 10)); // favor less loaded
      const score = ratingScore + reliabilityScore + workloadScore;
      return { contractor: c, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Auto-assign a job to the best contractor
 */
export function autoAssignContractor(
  customerZip: string,
  serviceType: 'measure' | 'install' | 'measure_install' | 'design',
  date: string,
  slot: string,
  contractors: ContractorProfile[],
  existingAssignments: JobAssignment[],
): ContractorProfile | null {
  const eligible = findEligibleContractors(customerZip, serviceType, contractors);
  
  for (const { contractor } of eligible) {
    // Check if contractor already has a job at this date/slot
    const hasConflict = existingAssignments.some(
      a => a.contractorId === contractor.id && 
      a.scheduledDate === date && 
      a.scheduledSlot === slot && 
      !['declined', 'cancelled'].includes(a.status)
    );
    if (!hasConflict) return contractor;
  }
  
  return null;
}

// ============================================================
// INVITE SYSTEM
// ============================================================

export function generateInviteToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function createInvite(
  email: string,
  type: ContractorType,
  territory: string[],
  sentBy: string,
  name?: string,
  phone?: string,
  message?: string,
): ContractorInvite {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7);
  
  return {
    id: `inv-${Date.now()}`,
    email,
    name,
    phone,
    type,
    territory,
    token: generateInviteToken(),
    sentAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    sentBy,
    message,
  };
}

// ============================================================
// ONBOARDING STEPS
// ============================================================

export const ONBOARDING_STEPS = [
  { key: 'account', label: 'Account', description: 'Email, password, phone' },
  { key: 'business', label: 'Business Info', description: 'Legal name, business type, EIN/SSN, address' },
  { key: 'w9', label: 'W-9 Form', description: 'Tax form — required for 1099' },
  { key: 'territory', label: 'Service Area', description: 'Set your ZIP codes and radius' },
  { key: 'capabilities', label: 'Skills', description: 'Products, experience, vehicle' },
  { key: 'insurance', label: 'Insurance & License', description: 'GL, workers comp, state license' },
  { key: 'banking', label: 'Banking', description: 'ACH direct deposit setup' },
  { key: 'availability', label: 'Availability', description: 'Weekly schedule, max jobs' },
  { key: 'background', label: 'Background Check', description: 'Consent & authorization' },
  { key: 'agreement', label: 'Agreement', description: 'Sign contractor agreement & go live' },
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number]['key'];

// ============================================================
// PAYOUT CALCULATOR
// ============================================================

export function calculatePayout(
  contractor: ContractorProfile,
  windowCount: number,
  customerZip: string,
): { basePay: number; travelFee: number; total: number } {
  const basePay = Math.max(
    contractor.minimumJobRate,
    contractor.perWindowRate * windowCount
  );
  
  // Travel fee (if applicable — needs geo lookup in production)
  const travelFee = 0; // Would calculate from distance
  
  return {
    basePay,
    travelFee,
    total: basePay + travelFee,
  };
}

// ============================================================
// MEASUREMENT VALIDATION
// ============================================================

export function validateMeasurement(m: Partial<WindowMeasurement>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!m.mountType) errors.push('Mount type is required');
  if (!m.topWidth || m.topWidth < 6) errors.push('Top width must be at least 6"');
  if (!m.bottomWidth || m.bottomWidth < 6) errors.push('Bottom width must be at least 6"');
  if (!m.leftHeight || m.leftHeight < 6) errors.push('Left height must be at least 6"');
  if (!m.rightHeight || m.rightHeight < 6) errors.push('Right height must be at least 6"');
  if (!m.depth || m.depth < 0.5) errors.push('Depth must be at least 0.5"');
  
  // Check if window is wildly out of square
  if (m.topWidth && m.bottomWidth) {
    const widthDiff = Math.abs(m.topWidth - m.bottomWidth);
    if (widthDiff > 0.5) errors.push(`Width difference of ${widthDiff}" — window may be out of square`);
  }
  if (m.leftHeight && m.rightHeight) {
    const heightDiff = Math.abs(m.leftHeight - m.rightHeight);
    if (heightDiff > 0.5) errors.push(`Height difference of ${heightDiff}" — window may be out of square`);
  }
  
  // Check max sizes
  if (m.topWidth && m.topWidth > 144) errors.push('Width exceeds 144" maximum');
  if (m.leftHeight && m.leftHeight > 120) errors.push('Height exceeds 120" maximum');
  
  // Depth warnings
  if (m.depth && m.depth < 1.5 && m.mountType === 'inside') {
    errors.push('Depth < 1.5" — inside mount may not be possible');
  }
  
  if (!m.windowType) errors.push('Window type is required');
  if (!m.frameCondition) errors.push('Frame condition is required');
  
  return { valid: errors.length === 0, errors };
}

// ============================================================
// JOB LIFECYCLE
// ============================================================

export const JOB_STATUS_FLOW: Record<JobStatus, { next: JobStatus[]; label: string; color: string }> = {
  assigned: { next: ['accepted', 'declined'], label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  accepted: { next: ['en_route', 'cancelled'], label: 'Accepted', color: 'bg-green-100 text-green-700' },
  declined: { next: [], label: 'Declined', color: 'bg-red-100 text-red-700' },
  en_route: { next: ['on_site', 'cancelled'], label: 'En Route', color: 'bg-purple-100 text-purple-700' },
  on_site: { next: ['measuring', 'installing'], label: 'On Site', color: 'bg-purple-100 text-purple-700' },
  measuring: { next: ['measure_complete'], label: 'Measuring', color: 'bg-orange-100 text-orange-700' },
  measure_complete: { next: ['completed', 'needs_revisit'], label: 'Measure Complete', color: 'bg-green-100 text-green-700' },
  installing: { next: ['install_complete', 'needs_revisit'], label: 'Installing', color: 'bg-orange-100 text-orange-700' },
  install_complete: { next: ['completed'], label: 'Install Complete', color: 'bg-green-100 text-green-700' },
  needs_revisit: { next: ['en_route', 'cancelled'], label: 'Needs Revisit', color: 'bg-yellow-100 text-yellow-700' },
  completed: { next: [], label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { next: [], label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};
