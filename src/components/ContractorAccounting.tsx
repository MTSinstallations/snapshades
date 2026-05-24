import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, ChevronDown, ChevronRight, Check, Clock, ArrowUpRight, BarChart3, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PLATFORM_FEE_PERCENT, type PayoutRecord, type PayoutJobLine } from '@/lib/service-pricing-engine';

/**
 * Contractor Accounting Dashboard
 * 
 * Shows:
 * - Earnings summary (this week, this month, all time)
 * - Pending payout amount + next payout date
 * - Job-by-job earnings breakdown
 * - Weekly payout history
 * - Platform fee transparency
 * - Downloadable statements
 */

// Demo data
const DEMO_PAYOUTS: PayoutRecord[] = [
  {
    id: 'po-001',
    contractorId: 'c-001',
    contractorName: 'Mike Rodriguez',
    periodStart: '2026-03-17',
    periodEnd: '2026-03-23',
    payoutDate: '2026-03-27',
    jobs: [
      { jobId: 'j-101', orderNumber: 'SS-009982', serviceType: 'measure_install', completedAt: '2026-03-18T14:00:00Z', customerName: 'Johnson', windowCount: 5, customerCharged: 325, platformFee: 32.50, contractorPayout: 292.50 },
      { jobId: 'j-102', orderNumber: 'SS-009990', serviceType: 'install', completedAt: '2026-03-19T11:00:00Z', customerName: 'Kim', windowCount: 3, customerCharged: 160, platformFee: 16, contractorPayout: 144 },
      { jobId: 'j-103', orderNumber: 'SS-009995', serviceType: 'measure', completedAt: '2026-03-20T09:00:00Z', customerName: 'Patel', windowCount: 8, customerCharged: 91, platformFee: 9.10, contractorPayout: 81.90 },
      { jobId: 'j-104', orderNumber: 'SS-010001', serviceType: 'install', completedAt: '2026-03-21T15:00:00Z', customerName: 'Gonzalez', windowCount: 10, customerCharged: 470, platformFee: 47, contractorPayout: 423 },
    ],
    totalCustomerCharged: 1046,
    totalPlatformFee: 104.60,
    totalPayout: 941.40,
    achStatus: 'completed',
    achTransactionId: 'ach_abc123',
    achSentAt: '2026-03-27T06:00:00Z',
    achCompletedAt: '2026-03-28T12:00:00Z',
    createdAt: '2026-03-24T00:00:00Z',
  },
  {
    id: 'po-002',
    contractorId: 'c-001',
    contractorName: 'Mike Rodriguez',
    periodStart: '2026-03-10',
    periodEnd: '2026-03-16',
    payoutDate: '2026-03-20',
    jobs: [
      { jobId: 'j-095', orderNumber: 'SS-009950', serviceType: 'install', completedAt: '2026-03-11T10:00:00Z', customerName: 'Williams', windowCount: 7, customerCharged: 340, platformFee: 34, contractorPayout: 306 },
      { jobId: 'j-096', orderNumber: 'SS-009960', serviceType: 'measure_install', completedAt: '2026-03-12T13:00:00Z', customerName: 'Brown', windowCount: 4, customerCharged: 265, platformFee: 26.50, contractorPayout: 238.50 },
      { jobId: 'j-097', orderNumber: 'SS-009970', serviceType: 'install', completedAt: '2026-03-14T11:00:00Z', customerName: 'Davis', windowCount: 6, customerCharged: 310, platformFee: 31, contractorPayout: 279 },
    ],
    totalCustomerCharged: 915,
    totalPlatformFee: 91.50,
    totalPayout: 823.50,
    achStatus: 'completed',
    achTransactionId: 'ach_def456',
    achSentAt: '2026-03-20T06:00:00Z',
    achCompletedAt: '2026-03-21T12:00:00Z',
    createdAt: '2026-03-17T00:00:00Z',
  },
];

// Current pending jobs (not yet paid out)
const PENDING_JOBS: PayoutJobLine[] = [
  { jobId: 'j-110', orderNumber: 'SS-010010', serviceType: 'install', completedAt: '2026-03-24T10:00:00Z', customerName: 'Martinez', windowCount: 4, customerCharged: 220, platformFee: 22, contractorPayout: 198 },
  { jobId: 'j-111', orderNumber: 'SS-010015', serviceType: 'measure', completedAt: '2026-03-24T14:00:00Z', customerName: 'Lee', windowCount: 6, customerCharged: 87, platformFee: 8.70, contractorPayout: 78.30 },
];

const achStatusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-600 bg-blue-50', icon: Clock },
  sent: { label: 'Sent', color: 'text-purple-600 bg-purple-50', icon: ArrowUpRight },
  completed: { label: 'Deposited', color: 'text-green-600 bg-green-50', icon: Check },
  failed: { label: 'Failed', color: 'text-red-600 bg-red-50', icon: Clock },
};

export default function ContractorAccounting() {
  const [expandedPayout, setExpandedPayout] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  // Calculate totals
  const allJobs = [...DEMO_PAYOUTS.flatMap(p => p.jobs), ...PENDING_JOBS];
  const totalEarned = allJobs.reduce((sum, j) => sum + j.contractorPayout, 0);
  const totalFees = allJobs.reduce((sum, j) => sum + j.platformFee, 0);
  const totalCharged = allJobs.reduce((sum, j) => sum + j.customerCharged, 0);
  const pendingAmount = PENDING_JOBS.reduce((sum, j) => sum + j.contractorPayout, 0);
  const paidOut = DEMO_PAYOUTS.filter(p => p.achStatus === 'completed').reduce((sum, p) => sum + p.totalPayout, 0);
  
  const thisWeekEarnings = PENDING_JOBS.reduce((sum, j) => sum + j.contractorPayout, 0);
  const lastWeekEarnings = DEMO_PAYOUTS[0]?.totalPayout || 0;
  const thisMonthEarnings = totalEarned;
  const avgPerJob = allJobs.length > 0 ? totalEarned / allJobs.length : 0;
  const totalJobs = allJobs.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">💰 Earnings & Payouts</h2>
          <p className="text-sm text-gray-500">Your complete financial dashboard</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full gap-1">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Pending Payout</span>
            </div>
            <div className="text-2xl font-bold text-green-600">${pendingAmount.toFixed(2)}</div>
            <div className="text-[10px] text-gray-400">Next ACH: Friday</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${thisMonthEarnings.toFixed(2)}</div>
            <div className="text-[10px] text-gray-400">{totalJobs} jobs completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Avg Per Job</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${avgPerJob.toFixed(2)}</div>
            <div className="text-[10px] text-gray-400">across all services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-500">Total Paid Out</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${paidOut.toFixed(2)}</div>
            <div className="text-[10px] text-gray-400">all time via ACH</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending jobs (this week) */}
      {PENDING_JOBS.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">⏳ Pending This Week</h3>
              <span className="text-sm font-bold text-green-600">${pendingAmount.toFixed(2)} coming Friday</span>
            </div>
            <div className="space-y-2">
              {PENDING_JOBS.map(job => (
                <div key={job.jobId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900">#{job.orderNumber}</span>
                    <span className="text-xs text-gray-500 ml-2">{job.customerName} • {job.windowCount} windows</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-2">
                      {job.serviceType === 'install' ? '🔧' : '📏'} {job.serviceType}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">${job.contractorPayout.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400">of ${job.customerCharged.toFixed(2)} charged</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee transparency */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-3">📊 Fee Breakdown (All Time)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Charged (total)</span>
              <span className="text-sm font-medium">${totalCharged.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform Fee ({(PLATFORM_FEE_PERCENT * 100).toFixed(0)}%)</span>
              <span className="text-sm font-medium text-red-500">-${totalFees.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-bold text-gray-900">Your Earnings ({((1 - PLATFORM_FEE_PERCENT) * 100).toFixed(0)}%)</span>
              <span className="text-lg font-bold text-green-600">${totalEarned.toFixed(2)}</span>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${(1 - PLATFORM_FEE_PERCENT) * 100}%` }} />
            <div className="bg-orange-400 h-full" style={{ width: `${PLATFORM_FEE_PERCENT * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>🟢 Your earnings (90%)</span>
            <span>🟠 Platform fee (10%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Payout history */}
      <h3 className="font-semibold text-gray-900 mb-3">📋 Payout History</h3>
      <div className="space-y-3">
        {DEMO_PAYOUTS.map(payout => {
          const isExpanded = expandedPayout === payout.id;
          const statusInfo = achStatusConfig[payout.achStatus];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={payout.id}>
              <button
                onClick={() => setExpandedPayout(isExpanded ? null : payout.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Week of {new Date(payout.periodStart + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(payout.periodEnd + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="text-xs text-gray-500">{payout.jobs.length} jobs • Payout {new Date(payout.payoutDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${payout.totalPayout.toFixed(2)}</div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="space-y-2 mt-3">
                    {payout.jobs.map(job => (
                      <div key={job.jobId} className="flex items-center justify-between py-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">#{job.orderNumber}</span>
                          <span className="text-gray-500 ml-2">{job.customerName}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {job.serviceType === 'install' ? '🔧' : job.serviceType === 'measure' ? '📏' : '📏🔧'} {job.windowCount}w
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">${job.contractorPayout.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 ml-1">(${job.customerCharged.toFixed(2)} - ${job.platformFee.toFixed(2)} fee)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                    <span className="text-gray-500">Customer Total: ${payout.totalCustomerCharged.toFixed(2)}</span>
                    <span className="text-gray-500">Platform Fee: -${payout.totalPlatformFee.toFixed(2)}</span>
                    <span className="font-bold text-green-600">Your Payout: ${payout.totalPayout.toFixed(2)}</span>
                  </div>
                  {payout.achTransactionId && (
                    <div className="mt-2 text-xs text-gray-400">
                      ACH: {payout.achTransactionId} • Sent {payout.achSentAt ? new Date(payout.achSentAt).toLocaleDateString() : '—'}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
