/**
 * InstallerRankings — Displays contractor performance metrics + tier badge
 * Used in: Admin Dashboard (all contractors), Contractor Portal (own stats)
 */

import { Star, Clock, CheckCircle, XCircle, TrendingUp, Award, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type RankTier, getTierForScore, calculateRankScore, type InstallerMetrics } from '@/lib/installer-rankings';

const TIER_STYLES: Record<RankTier, { bg: string; text: string; ring: string; emoji: string }> = {
  bronze: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300', emoji: '🥉' },
  silver: { bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-300', emoji: '🥈' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-300', emoji: '🥇' },
  platinum: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-300', emoji: '💎' },
  diamond: { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-300', emoji: '💠' },
};

function MetricBar({ label, value, max, unit, good }: {
  label: string; value: number; max: number; unit: string; good: 'high' | 'low';
}) {
  const pct = Math.min((value / max) * 100, 100);
  const isGood = good === 'high' ? value >= max * 0.7 : value <= max * 0.3;
  const color = isGood ? 'bg-green-500' : value >= max * 0.4 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function RankBadge({ tier, size = 'md' }: { tier: RankTier; size?: 'sm' | 'md' | 'lg' }) {
  const style = TIER_STYLES[tier];
  const info = getTierForScore(tier === 'diamond' ? 95 : tier === 'platinum' ? 85 : tier === 'gold' ? 75 : tier === 'silver' ? 60 : 0);
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${style.bg} ${style.text} ${sizes[size]}`}>
      {style.emoji} {info.label}
    </span>
  );
}

export function InstallerScoreCard({ metrics, showDetails = true }: {
  metrics: InstallerMetrics; showDetails?: boolean;
}) {
  const score = calculateRankScore(metrics);
  const tier = score >= 95 ? 'diamond' : score >= 85 ? 'platinum' : score >= 75 ? 'gold' : score >= 60 ? 'silver' : 'bronze';
  const style = TIER_STYLES[tier];

  return (
    <Card>
      <CardContent className="p-5">
        {/* Score + Tier */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ring-4 ${style.bg} ${style.ring}`}>
              <span className="text-2xl font-bold">{Math.round(score)}</span>
            </div>
            <div>
              <RankBadge tier={tier} />
              <div className="text-xs text-gray-500 mt-0.5">{metrics.totalRatings} reviews</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-bold">{metrics.customerRating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-400">{metrics.fiveStarRate}% 5★</div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2.5">
            <MetricBar label="On-Time Rate" value={metrics.onTimeRate} max={100} unit="%" good="high" />
            <MetricBar label="Completion Rate" value={metrics.completionRate} max={100} unit="%" good="high" />
            <MetricBar label="Response Time" value={metrics.avgResponseMinutes} max={60} unit=" min" good="low" />
            <MetricBar label="Customer Rating" value={metrics.customerRating} max={5} unit="/5" good="high" />
            <MetricBar label="No-Show Rate" value={metrics.noShowRate} max={10} unit="%" good="low" />
            <MetricBar label="Callback Rate" value={metrics.callbackRate} max={20} unit="%" good="low" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InstallerLeaderboard({ contractors }: {
  contractors: { id: string; name: string; metrics: InstallerMetrics }[];
}) {
  const ranked = contractors
    .map(c => ({ ...c, score: calculateRankScore(c.metrics) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-2">
      {ranked.map((c, i) => {
        const tier: RankTier = c.score >= 95 ? 'diamond' : c.score >= 85 ? 'platinum' : c.score >= 75 ? 'gold' : c.score >= 60 ? 'silver' : 'bronze';
        return (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <RankBadge tier={tier} size="sm" />
                <span className="text-xs text-gray-400">Score: {Math.round(c.score)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{c.metrics.customerRating.toFixed(1)}</span>
              </div>
              <div className="text-[10px] text-gray-400">{c.metrics.completionRate}% complete</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
