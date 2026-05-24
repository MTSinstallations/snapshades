/**
 * Admin Statistics Engine
 * 
 * Pulls every metric from Supabase for the admin dashboard.
 * All queries use service-level access (admin must be authenticated).
 */

import { supabase } from './supabase';

export interface DashboardStats {
  // Revenue
  totalRevenue: number;
  monthRevenue: number;
  weekRevenue: number;
  todayRevenue: number;
  avgOrderValue: number;
  platformFees: number;

  // Orders
  totalOrders: number;
  pendingOrders: number;
  manufacturingOrders: number;
  shippedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  ordersByStatus: { status: string; count: number }[];

  // Customers
  totalCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomers: number;

  // Contractors
  totalContractors: number;
  activeContractors: number;
  pendingContractors: number;
  suspendedContractors: number;
  totalPayouts: number;
  avgContractorRating: number;

  // Territories
  activeZips: number;
  zipsNoContractor: number;
  totalSeoPages: number;

  // Products
  topProducts: { product: string; count: number; revenue: number }[];

  // Recent activity
  recentOrders: {
    id: string; order_number: string; grand_total: number;
    status: string; created_at: string; customer_name: string;
  }[];
  recentContractors: {
    id: string; full_name: string; email: string;
    status: string; created_at: string;
  }[];

  // Compliance
  expiringInsurance: number;
  pendingBackgroundChecks: number;

  // Timeline
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  ordersByDay: { date: string; count: number }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // Parallel queries for speed
  const [
    ordersAll, ordersMonth, ordersWeek, ordersToday,
    customersAll, customersMonth,
    contractorsAll, contractorsByStatus,
    territoriesActive, territoriesNoContractor, seoCount,
    recentOrdersRes, recentContractorsRes,
    payoutsTotal, expiringDocs, pendingBg,
  ] = await Promise.all([
    // Orders
    supabase.from('orders').select('grand_total, status', { count: 'exact' }),
    supabase.from('orders').select('grand_total').gte('created_at', monthStart),
    supabase.from('orders').select('grand_total').gte('created_at', weekStart),
    supabase.from('orders').select('grand_total').gte('created_at', todayStart),
    // Orders by status (calculated from ordersAll below)
    // Customers
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    // Contractors
    supabase.from('installers').select('id, status, rating', { count: 'exact' }),
    supabase.from('installers').select('status'),
    // Territories
    supabase.from('territories').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('territories').select('id', { count: 'exact', head: true }).eq('status', 'active_no_contractor'),
    supabase.from('seo_pages').select('id', { count: 'exact', head: true }).eq('is_indexed', true),
    // Recent
    supabase.from('orders').select('id, order_number, grand_total, status, created_at, customers(full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('installers').select('id, full_name, email, status, created_at').order('created_at', { ascending: false }).limit(10),
    // Payouts
    supabase.from('contractor_payments').select('net_amount').eq('status', 'paid'),
    // Compliance
    supabase.from('contractor_documents').select('id', { count: 'exact', head: true }).eq('doc_type', 'coi_gl').lt('expires_at', new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0]),
    supabase.from('installers').select('id', { count: 'exact', head: true }).eq('background_check', false).eq('onboarded', true),
  ]);

  // Calculate totals
  const allOrders = ordersAll.data || [];
  const totalRevenue = allOrders.reduce((s, o) => s + Number(o.grand_total || 0), 0);
  const monthRevenue = (ordersMonth.data || []).reduce((s, o) => s + Number(o.grand_total || 0), 0);
  const weekRevenue = (ordersWeek.data || []).reduce((s, o) => s + Number(o.grand_total || 0), 0);
  const todayRevenue = (ordersToday.data || []).reduce((s, o) => s + Number(o.grand_total || 0), 0);

  // Orders by status
  const statusCounts: Record<string, number> = {};
  allOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  // Contractor stats
  const contractors = contractorsAll.data || [];
  const contractorStatuses = (contractorsByStatus.data || []) as { status: string }[];
  const activeCount = contractorStatuses.filter(c => c.status === 'active').length;
  const pendingCount = contractorStatuses.filter(c => c.status === 'pending' || c.status === 'pending_review').length;
  const suspendedCount = contractorStatuses.filter(c => c.status === 'suspended').length;
  const ratings = contractors.filter(c => c.rating > 0).map(c => Number(c.rating));
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  // Payouts
  const totalPayoutsAmount = (payoutsTotal.data || []).reduce((s, p) => s + Number(p.net_amount || 0), 0);

  // Recent orders with customer name
  const recent = (recentOrdersRes.data || []).map(o => ({
    id: o.id,
    order_number: o.order_number,
    grand_total: Number(o.grand_total),
    status: o.status,
    created_at: o.created_at,
    customer_name: ((o.customers as unknown) as Record<string, string> | null)?.full_name || 'Unknown',
  }));

  return {
    totalRevenue,
    monthRevenue,
    weekRevenue,
    todayRevenue,
    avgOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
    platformFees: totalRevenue * 0.10,

    totalOrders: ordersAll.count || allOrders.length,
    pendingOrders: statusCounts['pending'] || 0,
    manufacturingOrders: statusCounts['manufacturing'] || 0,
    shippedOrders: statusCounts['shipped'] || 0,
    completedOrders: statusCounts['completed'] || 0,
    cancelledOrders: statusCounts['cancelled'] || 0,
    ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),

    totalCustomers: customersAll.count || 0,
    newCustomersThisMonth: customersMonth.count || 0,
    repeatCustomers: 0, // TODO: query customers with 2+ orders

    totalContractors: contractorsAll.count || contractors.length,
    activeContractors: activeCount,
    pendingContractors: pendingCount,
    suspendedContractors: suspendedCount,
    totalPayouts: totalPayoutsAmount,
    avgContractorRating: Math.round(avgRating * 10) / 10,

    activeZips: territoriesActive.count || 0,
    zipsNoContractor: territoriesNoContractor.count || 0,
    totalSeoPages: seoCount.count || 0,

    topProducts: [], // TODO: aggregate from windows table
    recentOrders: recent,
    recentContractors: (recentContractorsRes.data || []).map(c => ({
      id: c.id, full_name: c.full_name, email: c.email,
      status: c.status, created_at: c.created_at,
    })),

    expiringInsurance: expiringDocs.count || 0,
    pendingBackgroundChecks: pendingBg.count || 0,

    revenueByMonth: [], // TODO: aggregate monthly
    ordersByDay: [], // TODO: aggregate daily
  };
}
