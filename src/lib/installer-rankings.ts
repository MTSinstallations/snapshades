/**
 * Installer Rankings & Performance System
 * 
 * METRICS TRACKED:
 * - Response time (how fast they accept/decline a job)
 * - Communication time (time to first customer contact)
 * - On-time rate (arrived within scheduled window)
 * - Completion rate (jobs completed vs assigned)
 * - Customer rating (1-5 stars)
 * - No-show rate
 * - Measurement accuracy (if re-measures needed)
 * - Install quality (callbacks/revisits)
 * 
 * RANKINGS:
 * - Tier system: Bronze → Silver → Gold → Platinum → Diamond
 * - Tiers unlock benefits (priority jobs, higher visibility, bonus payouts)
 * - Rankings visible to admin, tier badge visible to customer
 */

// ============================================================
// TYPES
// ============================================================

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface InstallerMetrics {
  contractorId: string;
  
  // Response
  avgResponseMinutes: number;      // Time to accept/decline after assignment
  responseWithin30Min: number;     // % of jobs responded within 30 min
  
  // Communication
  avgFirstContactMinutes: number;  // Time to first customer contact after accepting
  communicationRating: number;     // 1-5 from customer reviews
  
  // Punctuality
  onTimeRate: number;              // % arrived within scheduled window
  avgArrivalVariance: number;      // Minutes early/late (negative = early)
  
  // Completion
  completionRate: number;          // % jobs completed vs assigned
  cancelRate: number;              // % cancelled by contractor
  noShowRate: number;              // % no-shows
  
  // Quality
  customerRating: number;          // Average 1-5 stars
  totalRatings: number;
  fiveStarRate: number;            // % of 5-star reviews
  callbackRate: number;            // % needing revisit
  measureAccuracy: number;         // % orders with no re-measure needed
  
  // Volume
  totalJobsCompleted: number;
  jobsThisMonth: number;
  jobsThisWeek: number;
  
  // Rank
  tier: RankTier;
  rankScore: number;               // 0-100 composite score
  rankPosition: number;            // Position among all installers
  
  // Timestamps
  lastJobDate?: string;
  memberSince: string;
  lastUpdated: string;
}

export interface RankTierConfig {
  tier: RankTier;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  minScore: number;
  benefits: string[];
}

export const RANK_TIERS: RankTierConfig[] = [
  {
    tier: 'diamond',
    label: 'Diamond',
    emoji: '💎',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    minScore: 90,
    benefits: ['Priority job assignments', 'Featured profile badge', '5% bonus on all payouts', 'Direct customer requests', 'Dedicated support line'],
  },
  {
    tier: 'platinum',
    label: 'Platinum',
    emoji: '⚡',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    minScore: 80,
    benefits: ['Priority job assignments', 'Featured profile badge', '3% bonus on payouts', 'Early access to new territories'],
  },
  {
    tier: 'gold',
    label: 'Gold',
    emoji: '🥇',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    minScore: 65,
    benefits: ['Standard priority assignments', 'Profile badge', '1% bonus on payouts'],
  },
  {
    tier: 'silver',
    label: 'Silver',
    emoji: '🥈',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    minScore: 40,
    benefits: ['Standard job assignments'],
  },
  {
    tier: 'bronze',
    label: 'Bronze',
    emoji: '🥉',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    minScore: 0,
    benefits: ['New installer — building reputation'],
  },
];

// ============================================================
// SCORE CALCULATION
// ============================================================

/**
 * Calculate composite rank score (0-100)
 * 
 * Weights:
 * - Customer rating: 30%
 * - On-time rate: 20%
 * - Response time: 15%
 * - Completion rate: 15%
 * - Communication: 10%
 * - Quality (no callbacks): 10%
 */
export function calculateRankScore(metrics: Partial<InstallerMetrics>): number {
  const weights = {
    customerRating: 0.30,
    onTimeRate: 0.20,
    responseTime: 0.15,
    completionRate: 0.15,
    communication: 0.10,
    quality: 0.10,
  };

  // Normalize each metric to 0-100
  const ratingScore = ((metrics.customerRating || 0) / 5) * 100;
  const onTimeScore = (metrics.onTimeRate || 0);
  const responseScore = Math.max(0, 100 - (metrics.avgResponseMinutes || 60) * 2); // 0 min = 100, 50 min = 0
  const completionScore = (metrics.completionRate || 0);
  const commScore = ((metrics.communicationRating || 0) / 5) * 100;
  const qualityScore = Math.max(0, 100 - (metrics.callbackRate || 0) * 5); // 0% callbacks = 100, 20% = 0

  const composite = 
    ratingScore * weights.customerRating +
    onTimeScore * weights.onTimeRate +
    responseScore * weights.responseTime +
    completionScore * weights.completionRate +
    commScore * weights.communication +
    qualityScore * weights.quality;

  return Math.round(Math.min(100, Math.max(0, composite)));
}

/**
 * Determine tier from score
 */
export function getTierForScore(score: number): RankTierConfig {
  return RANK_TIERS.find(t => score >= t.minScore) || RANK_TIERS[RANK_TIERS.length - 1];
}

// ============================================================
// DEMO DATA
// ============================================================

export const DEMO_INSTALLER_METRICS: InstallerMetrics[] = [
  {
    contractorId: 'c-001',
    avgResponseMinutes: 8,
    responseWithin30Min: 95,
    avgFirstContactMinutes: 22,
    communicationRating: 4.8,
    onTimeRate: 97,
    avgArrivalVariance: -5,
    completionRate: 99,
    cancelRate: 0.5,
    noShowRate: 0,
    customerRating: 4.9,
    totalRatings: 247,
    fiveStarRate: 85,
    callbackRate: 2,
    measureAccuracy: 98,
    totalJobsCompleted: 247,
    jobsThisMonth: 18,
    jobsThisWeek: 4,
    tier: 'diamond',
    rankScore: 95,
    rankPosition: 1,
    lastJobDate: '2026-03-24',
    memberSince: '2025-06-15',
    lastUpdated: '2026-03-24T14:00:00Z',
  },
  {
    contractorId: 'c-002',
    avgResponseMinutes: 15,
    responseWithin30Min: 88,
    avgFirstContactMinutes: 35,
    communicationRating: 4.5,
    onTimeRate: 94,
    avgArrivalVariance: -2,
    completionRate: 97,
    cancelRate: 1.5,
    noShowRate: 0.5,
    customerRating: 4.8,
    totalRatings: 183,
    fiveStarRate: 78,
    callbackRate: 3,
    measureAccuracy: 96,
    totalJobsCompleted: 183,
    jobsThisMonth: 14,
    jobsThisWeek: 3,
    tier: 'platinum',
    rankScore: 87,
    rankPosition: 2,
    lastJobDate: '2026-03-23',
    memberSince: '2025-08-01',
    lastUpdated: '2026-03-24T14:00:00Z',
  },
  {
    contractorId: 'c-003',
    avgResponseMinutes: 25,
    responseWithin30Min: 72,
    avgFirstContactMinutes: 60,
    communicationRating: 4.2,
    onTimeRate: 90,
    avgArrivalVariance: 3,
    completionRate: 95,
    cancelRate: 3,
    noShowRate: 1,
    customerRating: 4.7,
    totalRatings: 312,
    fiveStarRate: 72,
    callbackRate: 5,
    measureAccuracy: 94,
    totalJobsCompleted: 312,
    jobsThisMonth: 12,
    jobsThisWeek: 2,
    tier: 'gold',
    rankScore: 76,
    rankPosition: 3,
    lastJobDate: '2026-03-22',
    memberSince: '2025-03-10',
    lastUpdated: '2026-03-24T14:00:00Z',
  },
];
