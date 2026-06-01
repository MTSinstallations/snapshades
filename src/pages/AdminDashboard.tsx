import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, DollarSign, Package, Users, Wrench, MapPin, ShieldCheck,
  TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle, Eye,
  ArrowUpRight, ArrowDownRight, ChevronRight, FileText, CreditCard,
  Globe, Star, Zap, Activity, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchDashboardStats, type DashboardStats } from '@/lib/admin-stats';
import CrmInbox from '@/components/crm/CrmInbox';
import { useCrmChat } from '@/hooks/useCrmChat';
import { STAFF_NAME, type Viewer } from '@/lib/crm-chat';

const STAFF_VIEWER: Viewer = { role: 'staff', name: STAFF_NAME };

// Status colors
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  manufacturing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-teal-100 text-teal-700',
  installing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  inactive: 'bg-gray-100 text-gray-500',
};

function StatCard({ icon: Icon, label, value, subValue, trend, color = 'blue', onClick }: {
  icon: React.ElementType; label: string; value: string | number; subValue?: string;
  trend?: { value: string; up: boolean }; color?: string; onClick?: () => void;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };
  return (
    <Card className={`hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
              {trend.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend.value}
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          {subValue && <div className="text-xs text-gray-400 mt-0.5">{subValue}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniBar({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label}>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-gray-600">{d.label}</span>
            <span className="font-medium text-gray-900">{d.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${d.color}`} style={{ width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, total, centerLabel }: {
  segments: { label: string; value: number; color: string }[];
  total: number; centerLabel: string;
}) {
  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const offset = cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none" strokeWidth="12"
              stroke={seg.color}
              strokeDasharray={`${pct * circumference} ${circumference}`}
              strokeDashoffset={-offset}
              className="transition-all duration-500"
            />
          );
        })}
        {total === 0 && (
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="12" stroke="#e5e7eb" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{total}</span>
        <span className="text-[10px] text-gray-400">{centerLabel}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'contractors' | 'territories' | 'messages' | 'compliance'>('overview');
  const { unreadTotal } = useCrmChat(STAFF_VIEWER);

  useEffect(() => {
    fetchDashboardStats().then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
  const fmtMoney = (n: number) => n >= 10000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <SnapShadesLogo size={28} />
              <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
            </a>
            <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" onClick={() => navigate('/admin/zip-activation')}>
              <MapPin className="w-3 h-3" /> ZIP Activation
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" onClick={() => navigate('/admin/contractors')}>
              <Wrench className="w-3 h-3" /> Contractors
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
            <p className="text-sm text-gray-500">Real-time business overview</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Activity className="w-3.5 h-3.5 text-green-500" />
            Live
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { key: 'orders' as const, label: 'Orders', icon: Package },
            { key: 'contractors' as const, label: 'Contractors', icon: Wrench },
            { key: 'territories' as const, label: 'Territories', icon: MapPin },
            { key: 'messages' as const, label: 'Messages', icon: MessageSquare },
            { key: 'compliance' as const, label: 'Compliance', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'messages' && unreadTotal > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'messages' ? 'bg-white/25 text-white' : 'bg-blue-600 text-white'}`}>
                  {unreadTotal}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════ OVERVIEW TAB ══════ */}
        {activeTab === 'overview' && (
          <>
            {/* Revenue Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={DollarSign} label="Total Revenue" value={fmtMoney(stats.totalRevenue)} color="green" />
              <StatCard icon={TrendingUp} label="This Month" value={fmtMoney(stats.monthRevenue)} color="blue" />
              <StatCard icon={TrendingUp} label="This Week" value={fmtMoney(stats.weekRevenue)} color="cyan" />
              <StatCard icon={Zap} label="Today" value={fmtMoney(stats.todayRevenue)} color="purple" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Package} label="Total Orders" value={fmt(stats.totalOrders)} subValue={`${stats.pendingOrders} pending`} color="blue" onClick={() => setActiveTab('orders')} />
              <StatCard icon={Users} label="Customers" value={fmt(stats.totalCustomers)} subValue={`${stats.newCustomersThisMonth} new this month`} color="purple" />
              <StatCard icon={Wrench} label="Contractors" value={stats.activeContractors} subValue={`${stats.totalContractors} total`} color="orange" onClick={() => setActiveTab('contractors')} />
              <StatCard icon={MapPin} label="Active ZIPs" value={stats.activeZips} subValue={`${stats.zipsNoContractor} need contractors`} color="cyan" onClick={() => setActiveTab('territories')} />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Order Status Distribution */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" /> Order Pipeline
                  </h3>
                  <DonutChart
                    segments={[
                      { label: 'Pending', value: stats.pendingOrders, color: '#eab308' },
                      { label: 'Manufacturing', value: stats.manufacturingOrders, color: '#6366f1' },
                      { label: 'Shipped', value: stats.shippedOrders, color: '#06b6d4' },
                      { label: 'Completed', value: stats.completedOrders, color: '#22c55e' },
                      { label: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' },
                    ]}
                    total={stats.totalOrders}
                    centerLabel="orders"
                  />
                  <div className="mt-4 space-y-1">
                    {stats.ordersByStatus.map(s => (
                      <div key={s.status} className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>
                          {s.status}
                        </span>
                        <span className="font-medium">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contractor Distribution */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-600" /> Contractor Status
                  </h3>
                  <DonutChart
                    segments={[
                      { label: 'Active', value: stats.activeContractors, color: '#22c55e' },
                      { label: 'Pending', value: stats.pendingContractors, color: '#eab308' },
                      { label: 'Suspended', value: stats.suspendedContractors, color: '#ef4444' },
                    ]}
                    total={stats.totalContractors}
                    centerLabel="contractors"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Avg Rating</span><span className="font-medium flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {stats.avgContractorRating || '—'}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Total Payouts</span><span className="font-medium">{fmtMoney(stats.totalPayouts)}</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Financials */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-600" /> Financials
                  </h3>
                  <MiniBar
                    maxVal={Math.max(stats.totalRevenue, 1)}
                    data={[
                      { label: 'Revenue', value: stats.totalRevenue, color: 'bg-green-500' },
                      { label: 'Platform Fees (10%)', value: stats.platformFees, color: 'bg-blue-500' },
                      { label: 'Contractor Payouts', value: stats.totalPayouts, color: 'bg-orange-500' },
                      { label: 'Net Profit', value: stats.totalRevenue - stats.totalPayouts, color: 'bg-purple-500' },
                    ]}
                  />
                  <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                    <div className="flex justify-between"><span>Avg Order Value</span><span className="font-medium text-gray-900">{fmtMoney(stats.avgOrderValue)}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(stats.expiringInsurance > 0 || stats.pendingBackgroundChecks > 0 || stats.zipsNoContractor > 0) && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Attention Required
                  </h3>
                  <div className="space-y-1">
                    {stats.expiringInsurance > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <ShieldCheck className="w-4 h-4" />
                        <span><strong>{stats.expiringInsurance}</strong> contractor(s) with insurance expiring within 30 days</span>
                      </div>
                    )}
                    {stats.pendingBackgroundChecks > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <Clock className="w-4 h-4" />
                        <span><strong>{stats.pendingBackgroundChecks}</strong> pending background check(s)</span>
                      </div>
                    )}
                    {stats.zipsNoContractor > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <MapPin className="w-4 h-4" />
                        <span><strong>{stats.zipsNoContractor}</strong> active ZIP(s) with no contractor assigned</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" /> Recent Orders
                    </h3>
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setActiveTab('orders')}>
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {stats.recentOrders.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
                    ) : stats.recentOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-gray-900">{order.order_number}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{order.customer_name} • {new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className="font-medium text-gray-900">${order.grand_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Contractors */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-orange-600" /> Recent Contractors
                    </h3>
                    <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => navigate('/admin/contractors')}>
                      Manage <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {stats.recentContractors.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No contractors yet</p>
                    ) : stats.recentContractors.slice(0, 5).map(c => (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{c.full_name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || ''}`}>
                              {c.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{c.email}</div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ══════ ORDERS TAB ══════ */}
        {activeTab === 'orders' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Pending', count: stats.pendingOrders, icon: Clock, color: 'orange' },
                { label: 'Manufacturing', count: stats.manufacturingOrders, icon: Package, color: 'blue' },
                { label: 'Shipped', count: stats.shippedOrders, icon: Package, color: 'cyan' },
                { label: 'Completed', count: stats.completedOrders, icon: CheckCircle, color: 'green' },
                { label: 'Cancelled', count: stats.cancelledOrders, icon: XCircle, color: 'red' },
                { label: 'Total', count: stats.totalOrders, icon: BarChart3, color: 'purple' },
              ].map(s => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.count} color={s.color} />
              ))}
            </div>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">All Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                        <th className="pb-3 font-medium">Order</th>
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Total</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map(o => (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 font-mono font-medium">{o.order_number}</td>
                          <td className="py-3 text-gray-600">{o.customer_name}</td>
                          <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span></td>
                          <td className="py-3 text-right font-medium">${o.grand_total.toFixed(2)}</td>
                          <td className="py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ══════ CONTRACTORS TAB ══════ */}
        {activeTab === 'contractors' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Users} label="Active" value={stats.activeContractors} color="green" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pendingContractors} color="orange" />
              <StatCard icon={XCircle} label="Suspended" value={stats.suspendedContractors} color="red" />
              <StatCard icon={DollarSign} label="Total Payouts" value={fmtMoney(stats.totalPayouts)} color="blue" />
            </div>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">All Contractors</h3>
                  <Button size="sm" className="bg-blue-600 text-white rounded-full gap-1" onClick={() => navigate('/admin/contractors')}>
                    Manage Contractors
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentContractors.map(c => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 font-medium">{c.full_name}</td>
                          <td className="py-3 text-gray-600">{c.email}</td>
                          <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span></td>
                          <td className="py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ══════ TERRITORIES TAB ══════ */}
        {activeTab === 'territories' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={MapPin} label="Active ZIPs" value={stats.activeZips} color="green" />
              <StatCard icon={AlertTriangle} label="Need Contractors" value={stats.zipsNoContractor} color="orange" />
              <StatCard icon={Globe} label="SEO Pages" value={stats.totalSeoPages} color="blue" />
              <StatCard icon={Wrench} label="Active Contractors" value={stats.activeContractors} color="purple" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full rounded-xl justify-start gap-3 py-5" onClick={() => navigate('/admin/zip-activation')}>
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Activate New ZIP Codes</div>
                        <div className="text-xs text-gray-500">Full infrastructure auto-provisions</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl justify-start gap-3 py-5" onClick={() => navigate('/admin/contractors')}>
                      <Users className="w-5 h-5 text-orange-600" />
                      <div className="text-left">
                        <div className="font-medium">Invite Contractor</div>
                        <div className="text-xs text-gray-500">Send onboarding link</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Territory Coverage</h3>
                  <MiniBar
                    maxVal={Math.max(stats.activeZips + stats.zipsNoContractor, 1)}
                    data={[
                      { label: 'Fully staffed ZIPs', value: stats.activeZips - stats.zipsNoContractor, color: 'bg-green-500' },
                      { label: 'Need contractors', value: stats.zipsNoContractor, color: 'bg-yellow-500' },
                      { label: 'SEO pages live', value: stats.totalSeoPages, color: 'bg-blue-500' },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ══════ MESSAGES TAB ══════ */}
        {activeTab === 'messages' && (
          <CrmInbox viewer={STAFF_VIEWER} />
        )}

        {/* ══════ COMPLIANCE TAB ══════ */}
        {activeTab === 'compliance' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={AlertTriangle} label="Insurance Expiring (30d)" value={stats.expiringInsurance} color={stats.expiringInsurance > 0 ? 'red' : 'green'} />
              <StatCard icon={Clock} label="Pending Background Checks" value={stats.pendingBackgroundChecks} color={stats.pendingBackgroundChecks > 0 ? 'orange' : 'green'} />
              <StatCard icon={FileText} label="Active Contractors" value={stats.activeContractors} color="green" />
              <StatCard icon={ShieldCheck} label="Suspended" value={stats.suspendedContractors} color={stats.suspendedContractors > 0 ? 'red' : 'green'} />
            </div>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Compliance System</h3>
                <p className="text-sm text-gray-500 mb-4">Fully autonomous — monitors, alerts, suspends, and reinstates without human intervention.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Insurance monitoring', desc: 'Auto-alerts at 60/30/7 days, auto-suspend on expiry', status: 'active' },
                    { label: 'Background checks', desc: 'Auto-triggered on onboarding, consent required', status: 'active' },
                    { label: 'State license verification', desc: 'State-aware — only requires where mandated', status: 'active' },
                    { label: 'W-9 collection', desc: 'Digital W-9 with e-signature at onboarding', status: 'active' },
                    { label: '1099-NEC generation', desc: 'Auto-generates January 1 for all contractors paid ≥$600', status: 'ready' },
                    { label: 'Auto-reinstatement', desc: 'Uploads new docs → auto-verify → auto-reactivate', status: 'active' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-50">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
