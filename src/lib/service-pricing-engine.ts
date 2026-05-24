/**
 * SnapShades Service Pricing & Contractor Payout Engine
 * 
 * BUSINESS MODEL:
 * - Customer pays full service price
 * - SnapShades takes 10% platform fee off the top
 * - Contractor receives 90% via weekly ACH
 * 
 * MEASURE PRICING:
 * - $75 flat trip fee
 * - $2 per window
 * - Example: 5 windows = $75 + (5 × $2) = $85
 * 
 * INSTALL PRICING:
 * - $100 minimum (includes 1 blind)
 * - $30 each additional blind
 * - Surcharges:
 *   - Motorization: +$10 per window
 *   - Ladder required: +$40
 *   - Hard surface (tile/concrete): +$40
 *   - 3rd story+: +$100
 * - Travel: free up to 20 miles, $1/mile after
 * 
 * DESIGN PRICING:
 * - $50/hour to customer
 * - Designer gets 70% ($35/hr)
 * - SnapShades keeps 30% ($15/hr)
 * 
 * PAYOUT:
 * - Weekly ACH every Friday
 * - Net 7 after job completion
 * - Platform fee deducted before payout
 */

// ============================================================
// CONSTANTS
// ============================================================

export const PLATFORM_FEE_PERCENT = 0.10; // 10% platform fee

// Measure pricing
export const MEASURE_TRIP_FEE = 75;
export const MEASURE_PER_WINDOW = 2;

// Install pricing
export const INSTALL_MINIMUM = 100;      // Includes 1 blind
export const INSTALL_PER_ADDITIONAL = 30; // Each additional blind
export const INSTALL_INCLUDED_BLINDS = 1; // Number included in minimum

// Install surcharges
export const SURCHARGE_MOTORIZATION = 10;  // Per motorized window
export const SURCHARGE_LADDER = 40;        // One-time if needed
export const SURCHARGE_HARD_SURFACE = 40;  // Tile, concrete, stone
export const SURCHARGE_THIRD_STORY = 100;  // 3rd story and above

// Travel
export const TRAVEL_FREE_MILES = 20;
export const TRAVEL_PER_MILE = 1;

// Design
export const DESIGN_CUSTOMER_RATE = 50;    // Per hour
export const DESIGN_PAYOUT_PERCENT = 0.70; // Designer gets 70%

// Payout
export const PAYOUT_DAY = 'Friday';
export const PAYOUT_NET_DAYS = 7;          // Days after job completion

// ============================================================
// TYPES
// ============================================================

export interface MeasureQuote {
  windowCount: number;
  tripFee: number;
  perWindowFee: number;
  perWindowTotal: number;
  travelMiles: number;
  travelFee: number;
  subtotal: number;
  platformFee: number;
  contractorPayout: number;
  customerTotal: number;
  breakdown: LineItem[];
}

export interface InstallQuote {
  windowCount: number;
  motorizedCount: number;
  needsLadder: boolean;
  hardSurface: boolean;
  thirdStoryPlus: boolean;
  travelMiles: number;
  
  baseFee: number;
  additionalBlinds: number;
  additionalBlindsFee: number;
  motorizedSurcharge: number;
  ladderSurcharge: number;
  hardSurfaceSurcharge: number;
  thirdStorySurcharge: number;
  travelFee: number;
  
  subtotal: number;
  platformFee: number;
  contractorPayout: number;
  customerTotal: number;
  breakdown: LineItem[];
}

export interface CombinedServiceQuote {
  measure?: MeasureQuote;
  install?: InstallQuote;
  design?: DesignQuote;
  
  totalCustomerCost: number;
  totalPlatformFee: number;
  totalContractorPayout: number;
  
  breakdown: LineItem[];
}

export interface DesignQuote {
  hours: number;
  customerRate: number;
  customerTotal: number;
  designerPayout: number;
  platformFee: number;
  breakdown: LineItem[];
}

export interface LineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
  isSurcharge?: boolean;
  category: 'measure' | 'install' | 'design' | 'travel' | 'surcharge' | 'fee';
}

export interface PayoutRecord {
  id: string;
  contractorId: string;
  contractorName: string;
  
  // Period
  periodStart: string;  // Monday
  periodEnd: string;    // Sunday
  payoutDate: string;   // Friday
  
  // Jobs
  jobs: PayoutJobLine[];
  
  // Totals
  totalCustomerCharged: number;
  totalPlatformFee: number;
  totalPayout: number;
  
  // ACH
  achStatus: 'pending' | 'processing' | 'sent' | 'completed' | 'failed';
  achTransactionId?: string;
  achSentAt?: string;
  achCompletedAt?: string;
  
  // Timestamps
  createdAt: string;
}

export interface PayoutJobLine {
  jobId: string;
  orderNumber: string;
  serviceType: 'measure' | 'install' | 'measure_install' | 'design';
  completedAt: string;
  customerName: string;
  windowCount: number;
  customerCharged: number;
  platformFee: number;
  contractorPayout: number;
}

export interface ContractorLedger {
  contractorId: string;
  
  // Lifetime
  totalEarned: number;
  totalPlatformFees: number;
  totalPaidOut: number;
  pendingPayout: number;
  
  // Current period
  currentPeriodEarnings: number;
  currentPeriodJobs: number;
  
  // History
  payoutHistory: PayoutRecord[];
  
  // Stats
  avgJobValue: number;
  avgWeeklyEarnings: number;
  topMonth: { month: string; amount: number };
  jobsThisMonth: number;
  earningsThisMonth: number;
}

// ============================================================
// PRICING CALCULATORS
// ============================================================

/**
 * Calculate measure service pricing
 */
export function calculateMeasureQuote(
  windowCount: number,
  travelMiles: number = 0,
): MeasureQuote {
  const tripFee = MEASURE_TRIP_FEE;
  const perWindowTotal = windowCount * MEASURE_PER_WINDOW;
  const travelFee = travelMiles > TRAVEL_FREE_MILES
    ? (travelMiles - TRAVEL_FREE_MILES) * TRAVEL_PER_MILE
    : 0;
  
  const subtotal = tripFee + perWindowTotal + travelFee;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT * 100) / 100;
  const contractorPayout = Math.round((subtotal - platformFee) * 100) / 100;

  const breakdown: LineItem[] = [
    { description: 'Measure trip fee', total: tripFee, category: 'measure' },
    { description: `Window measurement (${windowCount} windows × $${MEASURE_PER_WINDOW})`, quantity: windowCount, unitPrice: MEASURE_PER_WINDOW, total: perWindowTotal, category: 'measure' },
  ];
  if (travelFee > 0) {
    breakdown.push({ description: `Travel fee (${travelMiles - TRAVEL_FREE_MILES} miles × $${TRAVEL_PER_MILE}/mi)`, total: travelFee, category: 'travel' });
  }

  return {
    windowCount,
    tripFee,
    perWindowFee: MEASURE_PER_WINDOW,
    perWindowTotal,
    travelMiles,
    travelFee,
    subtotal,
    platformFee,
    contractorPayout,
    customerTotal: subtotal,
    breakdown,
  };
}

/**
 * Calculate installation pricing
 */
export function calculateInstallQuote(
  windowCount: number,
  options: {
    motorizedCount?: number;
    needsLadder?: boolean;
    hardSurface?: boolean;
    thirdStoryPlus?: boolean;
    travelMiles?: number;
  } = {},
): InstallQuote {
  const { motorizedCount = 0, needsLadder = false, hardSurface = false, thirdStoryPlus = false, travelMiles = 0 } = options;
  
  // Base: $100 minimum includes 1 blind
  const additionalBlinds = Math.max(0, windowCount - INSTALL_INCLUDED_BLINDS);
  const additionalBlindsFee = additionalBlinds * INSTALL_PER_ADDITIONAL;
  const baseFee = Math.max(INSTALL_MINIMUM, INSTALL_MINIMUM + additionalBlindsFee);
  
  // Surcharges
  const motorizedSurcharge = motorizedCount * SURCHARGE_MOTORIZATION;
  const ladderSurcharge = needsLadder ? SURCHARGE_LADDER : 0;
  const hardSurfaceSurcharge = hardSurface ? SURCHARGE_HARD_SURFACE : 0;
  const thirdStorySurcharge = thirdStoryPlus ? SURCHARGE_THIRD_STORY : 0;
  
  // Travel
  const travelFee = travelMiles > TRAVEL_FREE_MILES
    ? (travelMiles - TRAVEL_FREE_MILES) * TRAVEL_PER_MILE
    : 0;
  
  const subtotal = baseFee + motorizedSurcharge + ladderSurcharge + hardSurfaceSurcharge + thirdStorySurcharge + travelFee;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT * 100) / 100;
  const contractorPayout = Math.round((subtotal - platformFee) * 100) / 100;

  const breakdown: LineItem[] = [
    { description: `Installation base (includes ${INSTALL_INCLUDED_BLINDS} blind)`, total: INSTALL_MINIMUM, category: 'install' },
  ];
  if (additionalBlinds > 0) {
    breakdown.push({ description: `Additional blinds (${additionalBlinds} × $${INSTALL_PER_ADDITIONAL})`, quantity: additionalBlinds, unitPrice: INSTALL_PER_ADDITIONAL, total: additionalBlindsFee, category: 'install' });
  }
  if (motorizedSurcharge > 0) {
    breakdown.push({ description: `Motorization (${motorizedCount} × $${SURCHARGE_MOTORIZATION})`, quantity: motorizedCount, unitPrice: SURCHARGE_MOTORIZATION, total: motorizedSurcharge, isSurcharge: true, category: 'surcharge' });
  }
  if (ladderSurcharge > 0) {
    breakdown.push({ description: 'Ladder required', total: ladderSurcharge, isSurcharge: true, category: 'surcharge' });
  }
  if (hardSurfaceSurcharge > 0) {
    breakdown.push({ description: 'Hard surface installation (tile/concrete)', total: hardSurfaceSurcharge, isSurcharge: true, category: 'surcharge' });
  }
  if (thirdStorySurcharge > 0) {
    breakdown.push({ description: '3rd story+ installation', total: thirdStorySurcharge, isSurcharge: true, category: 'surcharge' });
  }
  if (travelFee > 0) {
    breakdown.push({ description: `Travel (${travelMiles - TRAVEL_FREE_MILES} mi × $${TRAVEL_PER_MILE}/mi)`, total: travelFee, category: 'travel' });
  }

  return {
    windowCount,
    motorizedCount,
    needsLadder,
    hardSurface,
    thirdStoryPlus,
    travelMiles,
    baseFee: INSTALL_MINIMUM,
    additionalBlinds,
    additionalBlindsFee,
    motorizedSurcharge,
    ladderSurcharge,
    hardSurfaceSurcharge,
    thirdStorySurcharge,
    travelFee,
    subtotal,
    platformFee,
    contractorPayout,
    customerTotal: subtotal,
    breakdown,
  };
}

/**
 * Calculate design consultation pricing
 */
export function calculateDesignQuote(hours: number = 1): DesignQuote {
  const customerTotal = hours * DESIGN_CUSTOMER_RATE;
  const designerPayout = Math.round(customerTotal * DESIGN_PAYOUT_PERCENT * 100) / 100;
  const platformFee = Math.round((customerTotal - designerPayout) * 100) / 100;

  return {
    hours,
    customerRate: DESIGN_CUSTOMER_RATE,
    customerTotal,
    designerPayout,
    platformFee,
    breakdown: [
      { description: `Design consultation (${hours}hr × $${DESIGN_CUSTOMER_RATE}/hr)`, quantity: hours, unitPrice: DESIGN_CUSTOMER_RATE, total: customerTotal, category: 'design' },
    ],
  };
}

/**
 * Calculate combined service quote (measure + install + design)
 */
export function calculateCombinedQuote(params: {
  windowCount: number;
  includeMeasure: boolean;
  includeInstall: boolean;
  includeDesign: boolean;
  designHours?: number;
  motorizedCount?: number;
  needsLadder?: boolean;
  hardSurface?: boolean;
  thirdStoryPlus?: boolean;
  travelMiles?: number;
}): CombinedServiceQuote {
  const measure = params.includeMeasure ? calculateMeasureQuote(params.windowCount, params.travelMiles) : undefined;
  const install = params.includeInstall ? calculateInstallQuote(params.windowCount, {
    motorizedCount: params.motorizedCount,
    needsLadder: params.needsLadder,
    hardSurface: params.hardSurface,
    thirdStoryPlus: params.thirdStoryPlus,
    travelMiles: params.travelMiles,
  }) : undefined;
  const design = params.includeDesign ? calculateDesignQuote(params.designHours || 1) : undefined;

  const totalCustomerCost = (measure?.customerTotal || 0) + (install?.customerTotal || 0) + (design?.customerTotal || 0);
  const totalPlatformFee = (measure?.platformFee || 0) + (install?.platformFee || 0) + (design?.platformFee || 0);
  const totalContractorPayout = (measure?.contractorPayout || 0) + (install?.contractorPayout || 0) + (design?.designerPayout || 0);

  const breakdown = [
    ...(measure?.breakdown || []),
    ...(install?.breakdown || []),
    ...(design?.breakdown || []),
  ];

  return {
    measure,
    install,
    design,
    totalCustomerCost,
    totalPlatformFee,
    totalContractorPayout,
    breakdown,
  };
}

// ============================================================
// PAYOUT GENERATION
// ============================================================

/**
 * Generate a weekly payout record for a contractor
 */
export function generatePayoutRecord(
  contractorId: string,
  contractorName: string,
  completedJobs: PayoutJobLine[],
  periodStart: string,
  periodEnd: string,
): PayoutRecord {
  const totalCustomerCharged = completedJobs.reduce((sum, j) => sum + j.customerCharged, 0);
  const totalPlatformFee = completedJobs.reduce((sum, j) => sum + j.platformFee, 0);
  const totalPayout = completedJobs.reduce((sum, j) => sum + j.contractorPayout, 0);

  // Payout date = Friday of the following week
  const end = new Date(periodEnd);
  const daysUntilFriday = (5 - end.getDay() + 7) % 7 || 7;
  const payoutDate = new Date(end);
  payoutDate.setDate(payoutDate.getDate() + daysUntilFriday);

  return {
    id: `po-${Date.now()}`,
    contractorId,
    contractorName,
    periodStart,
    periodEnd,
    payoutDate: payoutDate.toISOString().split('T')[0],
    jobs: completedJobs,
    totalCustomerCharged: Math.round(totalCustomerCharged * 100) / 100,
    totalPlatformFee: Math.round(totalPlatformFee * 100) / 100,
    totalPayout: Math.round(totalPayout * 100) / 100,
    achStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// EXAMPLE SCENARIOS (for display/demo)
// ============================================================

export const PRICING_EXAMPLES = {
  measure_5_windows: calculateMeasureQuote(5),
  measure_10_windows: calculateMeasureQuote(10),
  measure_5_far: calculateMeasureQuote(5, 35),
  
  install_1_blind: calculateInstallQuote(1),
  install_5_blinds: calculateInstallQuote(5),
  install_10_blinds: calculateInstallQuote(10),
  install_5_motorized: calculateInstallQuote(5, { motorizedCount: 5 }),
  install_complex: calculateInstallQuote(8, { motorizedCount: 3, needsLadder: true, hardSurface: true, thirdStoryPlus: false, travelMiles: 30 }),
  install_3rd_story: calculateInstallQuote(6, { thirdStoryPlus: true }),
  
  design_1hr: calculateDesignQuote(1),
  design_2hr: calculateDesignQuote(2),
  
  full_service_5: calculateCombinedQuote({ windowCount: 5, includeMeasure: true, includeInstall: true, includeDesign: true }),
  full_service_10_complex: calculateCombinedQuote({
    windowCount: 10, includeMeasure: true, includeInstall: true, includeDesign: true,
    designHours: 2, motorizedCount: 4, needsLadder: true, hardSurface: false, thirdStoryPlus: false, travelMiles: 25,
  }),
};
