import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useMemo } from 'react';
import { Camera, Calendar, Clock, Settings, User, MapPin, Star, ChevronRight, ChevronLeft, Check, X, Plus, Trash2, Bell, DollarSign, BarChart3, FileText, Ruler, Save, Send, Phone, Mail, Wallet, MessageSquare } from 'lucide-react';
import ContractorAccounting from '@/components/ContractorAccounting';
import CrmInbox from '@/components/crm/CrmInbox';
import { useCrmChat } from '@/hooks/useCrmChat';
import type { Viewer } from '@/lib/crm-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ALL_SLOTS, type SlotTime, type ServiceType } from '@/lib/scheduling-engine';

type Tab = 'dashboard' | 'availability' | 'bookings' | 'job-detail' | 'measure-sheet' | 'earnings' | 'messages' | 'settings';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ============================================================
// DEMO DATA
// ============================================================

const CONTRACTOR = {
  id: 'c-001',
  name: 'Mike Rodriguez',
  email: 'mike@proinstalls.com',
  phone: '(555) 234-5678',
  type: 'contractor' as const,
  rating: 4.9,
  completedJobs: 247,
  earnings: { thisMonth: 3750, lastMonth: 4200, total: 42350 },
};

const CONTRACTOR_VIEWER: Viewer = { role: 'contractor', id: CONTRACTOR.id, name: CONTRACTOR.name };

interface JobOrder {
  id: string;
  orderNumber: string;
  date: string;
  slot: SlotTime;
  serviceType: ServiceType;
  status: 'pending' | 'confirmed' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    notes?: string;
  };
  lineItems: {
    id: string;
    room: string;
    windowName: string;
    product: string;
    manufacturer: string;
    width?: number;
    height?: number;
    depth?: number;
    tier: 'ship' | 'install' | 'design';
    price: number;
    addOns: string[];
    // Measure sheet fields (filled by contractor)
    measured?: {
      topWidth?: number;
      bottomWidth?: number;
      leftHeight?: number;
      rightHeight?: number;
      depth?: number;
      mountType?: 'inside' | 'outside';
      obstructions?: string[];
      notes?: string;
      photos?: string[];
    };
  }[];
  totalPrice: number;
  installFee: number;
}

const DEMO_JOBS: JobOrder[] = [
  {
    id: 'job-001',
    orderNumber: 'SS-010001',
    date: '2026-03-26',
    slot: '10:00 AM - 12:00 PM',
    serviceType: 'measure_install',
    status: 'confirmed',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 111-2222',
      address: '123 Oak Street, Beverly Hills, CA 90210',
      zip: '90210',
      notes: 'Gate code: 1234. Ring doorbell. Friendly golden retriever.',
    },
    lineItems: [
      { id: 'w1', room: 'Living Room', windowName: 'Window 1 (Front)', product: '9/16" Cordless Single Cell Honeycomb', manufacturer: 'Norman®', width: undefined, height: undefined, depth: undefined, tier: 'install', price: 104.76, addOns: ['Cordless Lift', 'Light Filtering'] },
      { id: 'w2', room: 'Living Room', windowName: 'Window 2 (Side)', product: '9/16" Cordless Single Cell Honeycomb', manufacturer: 'Norman®', width: undefined, height: undefined, depth: undefined, tier: 'install', price: 206.28, addOns: ['Cordless Lift', 'Light Filtering'] },
      { id: 'w3', room: 'Living Room', windowName: 'Sliding Door', product: 'SmartDrape® Shade', manufacturer: 'Norman®', width: undefined, height: undefined, depth: undefined, tier: 'install', price: 312.50, addOns: ['Motorized', 'Room Darkening'] },
      { id: 'w4', room: 'Master Bedroom', windowName: 'Window 1', product: '9/16" Cordless Double Cell Honeycomb', manufacturer: 'Norman®', width: undefined, height: undefined, depth: undefined, tier: 'install', price: 151.20, addOns: ['Cordless Lift', 'Room Darkening'] },
      { id: 'w5', room: 'Master Bedroom', windowName: 'Window 2', product: '9/16" Cordless Double Cell Honeycomb', manufacturer: 'Norman®', width: undefined, height: undefined, depth: undefined, tier: 'install', price: 151.20, addOns: ['Cordless Lift', 'Room Darkening'] },
    ],
    totalPrice: 925.94,
    installFee: 250,
  },
  {
    id: 'job-002',
    orderNumber: 'SS-010003',
    date: '2026-03-27',
    slot: '2:00 PM - 4:00 PM',
    serviceType: 'measure',
    status: 'pending',
    customer: {
      name: 'David Kim',
      email: 'dkim@email.com',
      phone: '(555) 333-4444',
      address: '456 Pine Avenue, Santa Monica, CA 90401',
      zip: '90401',
    },
    lineItems: [
      { id: 'w6', room: 'Kitchen', windowName: 'Above Sink', product: 'Soluna™ Roller Shade — Fabric Group 1', manufacturer: 'Norman®', tier: 'install', price: 89.50, addOns: ['Moisture Resistant'] },
      { id: 'w7', room: 'Kitchen', windowName: 'Breakfast Nook (L)', product: 'Soluna™ Roller Shade — Fabric Group 1', manufacturer: 'Norman®', tier: 'install', price: 112.00, addOns: ['Light Filtering'] },
      { id: 'w8', room: 'Kitchen', windowName: 'Breakfast Nook (R)', product: 'Soluna™ Roller Shade — Fabric Group 1', manufacturer: 'Norman®', tier: 'install', price: 112.00, addOns: ['Light Filtering'] },
    ],
    totalPrice: 313.50,
    installFee: 150,
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function ContractorPortal() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { unreadTotal: msgUnread } = useCrmChat(CONTRACTOR_VIEWER);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Availability: date -> slots (submitted availability)
  const [availability, setAvailability] = useState<Record<string, SlotTime[]>>({});
  const [pendingSlots, setPendingSlots] = useState<SlotTime[]>([]);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Measure sheet state
  const [measureData, setMeasureData] = useState<Record<string, JobOrder['lineItems'][0]['measured']>>({});

  // ============================================================
  // CALENDAR HELPERS
  // ============================================================

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = toYMD(new Date());

    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean; hasAvailability: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const date = toYMD(new Date(year, month - 1, d));
      days.push({ date, day: d, isCurrentMonth: false, isToday: false, isPast: true, hasAvailability: !!availability[date]?.length });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = toYMD(new Date(year, month, d));
      const isPast = date < today;
      days.push({ date, day: d, isCurrentMonth: true, isToday: date === today, isPast, hasAvailability: !!availability[date]?.length });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = toYMD(new Date(year, month + 1, d));
      days.push({ date, day: d, isCurrentMonth: false, isToday: false, isPast: false, hasAvailability: !!availability[date]?.length });
    }

    return days;
  }, [calendarMonth, availability]);

  const prevMonth = () => setCalendarMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  const nextMonth = () => setCalendarMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });

  const handleDateClick = (date: string, isPast: boolean) => {
    if (isPast) return;
    setSelectedDate(date);
    setPendingSlots(availability[date] || []);
  };

  const togglePendingSlot = (slot: SlotTime) => {
    setPendingSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
    setHasUnsaved(true);
  };

  const saveDateAvailability = () => {
    if (!selectedDate) return;
    setAvailability(prev => ({
      ...prev,
      [selectedDate]: [...pendingSlots],
    }));
    setHasUnsaved(false);
  };

  const clearDateAvailability = () => {
    if (!selectedDate) return;
    setPendingSlots([]);
    setAvailability(prev => {
      const next = { ...prev };
      delete next[selectedDate];
      return next;
    });
    setHasUnsaved(false);
  };

  const submitAllAvailability = () => {
    // In production: POST to Supabase
    alert('Availability submitted! Customers can now book your available slots.');
  };

  // ============================================================
  // MEASURE SHEET HELPERS
  // ============================================================

  const updateMeasure = (itemId: string, field: string, value: string | number | string[]) => {
    setMeasureData(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value,
      },
    }));
  };

  const selectedJob = DEMO_JOBS.find(j => j.id === selectedJobId);
  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    en_route: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-orange-100 text-orange-700',
  };

  // Group line items by room
  const groupByRoom = (items: JobOrder['lineItems']) => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!groups[item.room]) groups[item.room] = [];
      groups[item.room].push(item);
    });
    return groups;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <SnapShadesLogo size={28} />
              <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
            </a>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Contractor Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {DEMO_JOBS.filter(j => j.status === 'pending').length}
              </span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{CONTRACTOR.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-1">
              {([
                { key: 'dashboard' as Tab, icon: BarChart3, label: 'Dashboard' },
                { key: 'availability' as Tab, icon: Calendar, label: 'My Calendar' },
                { key: 'bookings' as Tab, icon: FileText, label: 'Jobs' },
                { key: 'messages' as Tab, icon: MessageSquare, label: 'Messages' },
                { key: 'earnings' as Tab, icon: Wallet, label: 'Earnings' },
                { key: 'settings' as Tab, icon: Settings, label: 'Settings' },
              ] as const).map(item => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    tab === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.key === 'bookings' && (
                    <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      {DEMO_JOBS.filter(j => j.status === 'pending').length}
                    </span>
                  )}
                  {item.key === 'messages' && msgUnread > 0 && (
                    <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                      {msgUnread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick stats */}
            <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">{CONTRACTOR.rating} rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{CONTRACTOR.completedJobs} jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">${CONTRACTOR.earnings.thisMonth.toLocaleString()} this month</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-4">

            {/* ============================================================ */}
            {/* DASHBOARD */}
            {/* ============================================================ */}
            {tab === 'dashboard' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome back, {CONTRACTOR.name.split(' ')[0]}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Rating', value: `${CONTRACTOR.rating}★`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Completed', value: CONTRACTOR.completedJobs.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'This Month', value: `$${CONTRACTOR.earnings.thisMonth.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending Jobs', value: DEMO_JOBS.filter(j => j.status === 'pending').length.toString(), color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map(stat => (
                    <Card key={stat.label}>
                      <CardContent className={`p-4 text-center ${stat.bg} rounded-xl`}>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <h3 className="font-semibold text-gray-900 mb-3">Upcoming Jobs</h3>
                <div className="space-y-3">
                  {DEMO_JOBS.map(job => (
                    <Card key={job.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => { setSelectedJobId(job.id); setTab('job-detail'); }}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                          <div className="text-[10px] text-blue-500 uppercase">
                            {MONTH_NAMES[parseInt(job.date.split('-')[1]) - 1]?.slice(0, 3)}
                          </div>
                          <div className="text-xl font-bold text-blue-700">{parseInt(job.date.split('-')[2])}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{job.customer.name}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[job.status]}`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                            <span><Clock className="w-3 h-3 inline mr-0.5" /> {job.slot}</span>
                            <span><MapPin className="w-3 h-3 inline mr-0.5" /> {job.customer.address.split(',')[0]}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {job.serviceType === 'install' ? '🔧 Install' : job.serviceType === 'measure' ? '📏 Measure' : '📏🔧 Measure + Install'} — {job.lineItems.length} windows — #{job.orderNumber}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-green-600">${job.installFee}</div>
                          <div className="text-[10px] text-gray-400">your payout</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* AVAILABILITY CALENDAR */}
            {/* ============================================================ */}
            {tab === 'availability' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Set Your Availability</h2>
                    <p className="text-sm text-gray-500 mt-1">Click a day → select your available time slots → save. Blue = available.</p>
                  </div>
                  <Button className="bg-green-600 text-white rounded-full gap-2" onClick={submitAllAvailability}>
                    <Send className="w-4 h-4" /> Submit Availability
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Calendar */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardContent className="p-5">
                        {/* Month header */}
                        <div className="flex items-center justify-between mb-4">
                          <Button variant="ghost" size="sm" onClick={prevMonth}>
                            <ChevronLeft className="w-5 h-5" />
                          </Button>
                          <h3 className="text-lg font-bold text-gray-900">
                            {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
                          </h3>
                          <Button variant="ghost" size="sm" onClick={nextMonth}>
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {DAY_NAMES_SHORT.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                          ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day, i) => {
                            const isSelected = selectedDate === day.date;
                            const slotCount = availability[day.date]?.length || 0;

                            return (
                              <button
                                key={i}
                                onClick={() => handleDateClick(day.date, day.isPast)}
                                disabled={day.isPast || !day.isCurrentMonth}
                                className={`
                                  relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all
                                  ${!day.isCurrentMonth ? 'text-gray-200 cursor-default' : ''}
                                  ${day.isPast && day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                                  ${day.isToday ? 'ring-2 ring-blue-300' : ''}
                                  ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-105' : ''}
                                  ${!isSelected && day.hasAvailability ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                  ${!isSelected && !day.hasAvailability && !day.isPast && day.isCurrentMonth ? 'hover:bg-gray-100 text-gray-700' : ''}
                                `}
                              >
                                <span className={`font-medium ${isSelected ? 'text-white' : ''}`}>{day.day}</span>
                                {slotCount > 0 && !isSelected && (
                                  <span className="text-[9px] mt-0.5 font-medium text-blue-500">{slotCount} slots</span>
                                )}
                                {slotCount > 0 && isSelected && (
                                  <span className="text-[9px] mt-0.5 font-medium text-blue-200">{slotCount} slots</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded" /> Available</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded" /> Selected</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded ring-2 ring-blue-300" /> Today</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Time slot picker (right side) */}
                  <div>
                    {selectedDate ? (
                      <Card>
                        <CardContent className="p-5">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                          <p className="text-xs text-gray-400 mb-4">Tap the times you're available</p>

                          <div className="space-y-2">
                            {ALL_SLOTS.map(slot => {
                              const isActive = pendingSlots.includes(slot);
                              return (
                                <button
                                  key={slot}
                                  onClick={() => togglePendingSlot(slot)}
                                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all border-2 ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm'
                                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                    isActive ? 'bg-blue-600' : 'bg-gray-100'
                                  }`}>
                                    {isActive && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                  <Clock className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-300'}`} />
                                  <span>{slot}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              className="flex-1 bg-blue-600 text-white rounded-full gap-1"
                              onClick={saveDateAvailability}
                            >
                              <Save className="w-4 h-4" /> Save Day
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full text-red-500 border-red-200 hover:bg-red-50"
                              onClick={clearDateAvailability}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {hasUnsaved && (
                            <p className="text-xs text-amber-600 mt-2 text-center">⚠️ Unsaved changes</p>
                          )}

                          <p className="text-[10px] text-gray-400 mt-3 text-center">
                            {pendingSlots.length} slot{pendingSlots.length !== 1 ? 's' : ''} selected
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <h3 className="font-medium text-gray-900">Select a Date</h3>
                          <p className="text-sm text-gray-400 mt-1">Click any future date on the calendar to set your available time slots.</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Stats */}
                    <div className="mt-4 bg-blue-50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Availability Summary</h4>
                      <div className="text-sm text-blue-700">
                        <div>{Object.keys(availability).length} days with availability</div>
                        <div>{Object.values(availability).reduce((sum, slots) => sum + slots.length, 0)} total slots open</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* JOBS LIST */}
            {/* ============================================================ */}
            {tab === 'bookings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Jobs</h2>
                <div className="space-y-3">
                  {DEMO_JOBS.map(job => (
                    <Card key={job.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => { setSelectedJobId(job.id); setTab('job-detail'); }}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-gray-900">#{job.orderNumber}</span>
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[job.status]}`}>
                                {job.status}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {job.serviceType === 'install' ? '🔧 Install' : job.serviceType === 'measure' ? '📏 Measure' : '📏🔧 Measure + Install'}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900 mt-2">{job.customer.name}</h3>
                            <div className="text-sm text-gray-500 mt-0.5">{job.customer.address}</div>
                            <div className="text-sm text-gray-400 mt-0.5">
                              {new Date(job.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {job.slot}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">${job.installFee}</div>
                            <div className="text-xs text-gray-400">{job.lineItems.length} windows</div>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          {Object.keys(groupByRoom(job.lineItems)).map(room => (
                            <span key={room} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">
                              🏠 {room} ({groupByRoom(job.lineItems)[room].length})
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 text-xs text-blue-600 flex items-center gap-1">
                          View full order details + measure sheet <ChevronRight className="w-3 h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* JOB DETAIL */}
            {/* ============================================================ */}
            {tab === 'job-detail' && selectedJob && (
              <div>
                <button onClick={() => setTab('bookings')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back to Jobs
                </button>

                {/* Job header */}
                <Card className="mb-4">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-gray-900">#{selectedJob.orderNumber}</span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[selectedJob.status]}`}>
                            {selectedJob.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(selectedJob.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • {selectedJob.slot}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">${selectedJob.installFee}</div>
                        <div className="text-xs text-gray-400">your payout</div>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {selectedJob.customer.name}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {selectedJob.customer.address}</div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${selectedJob.customer.phone}`} className="text-blue-600 hover:underline">{selectedJob.customer.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${selectedJob.customer.email}`} className="text-blue-600 hover:underline">{selectedJob.customer.email}</a>
                        </div>
                        {selectedJob.customer.notes && (
                          <div className="bg-yellow-50 text-yellow-800 text-xs rounded-lg px-3 py-2 mt-2">
                            📝 {selectedJob.customer.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order line items */}
                <h3 className="font-bold text-gray-900 mb-3">Order Details — {selectedJob.lineItems.length} Windows</h3>
                {Object.entries(groupByRoom(selectedJob.lineItems)).map(([room, items]) => (
                  <Card key={room} className="mb-4">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-gray-900 mb-3">🏠 {room} ({items.length} window{items.length > 1 ? 's' : ''})</h4>
                      <div className="space-y-3">
                        {items.map((item, i) => (
                          <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{item.windowName}</div>
                                <div className="text-sm text-gray-500 mt-0.5">{item.manufacturer} — {item.product}</div>
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                  {item.addOns.map(addon => (
                                    <span key={addon} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{addon}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">${item.price.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Totals */}
                <Card className="mb-4">
                  <CardContent className="p-5">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Product Total</span><span className="font-medium">${selectedJob.totalPrice.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Your Installation Fee</span><span className="font-medium text-green-600">${selectedJob.installFee.toFixed(2)}</span></div>
                      <div className="border-t pt-2 mt-2 flex justify-between"><span className="font-bold">Customer Total</span><span className="font-bold">${(selectedJob.totalPrice + selectedJob.installFee).toFixed(2)}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {selectedJob.serviceType !== 'install' && (
                    <Button
                      className="flex-1 bg-blue-600 text-white rounded-full py-5 gap-2 text-lg font-semibold"
                      onClick={() => setTab('measure-sheet')}
                    >
                      <Ruler className="w-5 h-5" /> Open Measure Sheet
                    </Button>
                  )}
                  <Button variant="outline" className="rounded-full py-5 gap-2" onClick={() => window.open(`tel:${selectedJob.customer.phone}`)}>
                    <Phone className="w-4 h-4" /> Call
                  </Button>
                  <Button variant="outline" className="rounded-full py-5 gap-2">
                    <MapPin className="w-4 h-4" /> Navigate
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* MEASURE SHEET */}
            {/* ============================================================ */}
            {tab === 'measure-sheet' && selectedJob && (
              <div>
                <button onClick={() => setTab('job-detail')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back to Job Details
                </button>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">📏 Measure Sheet</h2>
                    <p className="text-sm text-gray-500">#{selectedJob.orderNumber} — {selectedJob.customer.name}</p>
                  </div>
                  <Button className="bg-green-600 text-white rounded-full gap-2">
                    <Send className="w-4 h-4" /> Submit Measurements
                  </Button>
                </div>

                {Object.entries(groupByRoom(selectedJob.lineItems)).map(([room, items]) => (
                  <Card key={room} className="mb-6">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">🏠 {room}</h3>

                      {items.map((item) => {
                        const md = measureData[item.id] || {};
                        return (
                          <div key={item.id} className="mb-6 last:mb-0 border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            {/* Window header */}
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-semibold text-gray-900">{item.windowName}</div>
                                <div className="text-xs text-gray-500">{item.manufacturer} — {item.product}</div>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {item.addOns.map(a => (
                                    <span key={a} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{a}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-sm font-bold text-gray-900">${item.price.toFixed(2)}</div>
                            </div>

                            {/* Mount type */}
                            <div className="mb-3">
                              <label className="text-xs font-semibold text-gray-700 block mb-1.5">Mount Type</label>
                              <div className="flex gap-2">
                                {(['inside', 'outside'] as const).map(mt => (
                                  <button
                                    key={mt}
                                    onClick={() => updateMeasure(item.id, 'mountType', mt)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                                      md.mountType === mt
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                    }`}
                                  >
                                    {mt === 'inside' ? '⬛ Inside Mount' : '⬜ Outside Mount'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Measurements grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Top Width (in)</label>
                                <input
                                  type="number"
                                  step="0.125"
                                  value={md.topWidth || ''}
                                  onChange={e => updateMeasure(item.id, 'topWidth', parseFloat(e.target.value) || 0)}
                                  placeholder="36.000"
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Bottom Width (in)</label>
                                <input
                                  type="number"
                                  step="0.125"
                                  value={md.bottomWidth || ''}
                                  onChange={e => updateMeasure(item.id, 'bottomWidth', parseFloat(e.target.value) || 0)}
                                  placeholder="35.875"
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Left Height (in)</label>
                                <input
                                  type="number"
                                  step="0.125"
                                  value={md.leftHeight || ''}
                                  onChange={e => updateMeasure(item.id, 'leftHeight', parseFloat(e.target.value) || 0)}
                                  placeholder="48.000"
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Right Height (in)</label>
                                <input
                                  type="number"
                                  step="0.125"
                                  value={md.rightHeight || ''}
                                  onChange={e => updateMeasure(item.id, 'rightHeight', parseFloat(e.target.value) || 0)}
                                  placeholder="47.875"
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Depth (in)</label>
                                <input
                                  type="number"
                                  step="0.125"
                                  value={md.depth || ''}
                                  onChange={e => updateMeasure(item.id, 'depth', parseFloat(e.target.value) || 0)}
                                  placeholder="3.500"
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-mono"
                                />
                              </div>
                            </div>

                            {/* Obstructions */}
                            <div className="mb-3">
                              <label className="text-xs font-semibold text-gray-700 block mb-1.5">Obstructions</label>
                              <div className="flex gap-2 flex-wrap">
                                {['Handle', 'Lock', 'Crank', 'Tile', 'Trim', 'AC Unit', 'Alarm Sensor', 'None'].map(obs => {
                                  const current = (md.obstructions as string[]) || [];
                                  const isActive = current.includes(obs);
                                  return (
                                    <button
                                      key={obs}
                                      onClick={() => {
                                        const next = isActive ? current.filter(o => o !== obs) : [...current.filter(o => o !== 'None'), ...(obs === 'None' ? ['None'] : [obs])];
                                        updateMeasure(item.id, 'obstructions', obs === 'None' ? ['None'] : next.filter(o => o !== 'None'));
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        isActive
                                          ? obs === 'None' ? 'border-green-400 bg-green-50 text-green-700' : 'border-orange-400 bg-orange-50 text-orange-700'
                                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                      }`}
                                    >
                                      {obs}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-3">
                              <label className="text-xs font-semibold text-gray-700 block mb-1">Notes</label>
                              <textarea
                                value={(md.notes as string) || ''}
                                onChange={e => updateMeasure(item.id, 'notes', e.target.value)}
                                placeholder="Any notes about this window (depth issues, unusual shape, etc.)"
                                rows={2}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm resize-none"
                              />
                            </div>

                            {/* Computed order size */}
                            {(md.topWidth || md.bottomWidth) && (md.leftHeight || md.rightHeight) && (
                              <div className="bg-blue-50 rounded-xl p-3 text-sm">
                                <span className="font-semibold text-blue-900">Order Size: </span>
                                <span className="font-mono text-blue-700">
                                  {Math.min(md.topWidth || 999, md.bottomWidth || 999).toFixed(3)}" W × {Math.min(md.leftHeight || 999, md.rightHeight || 999).toFixed(3)}" H
                                </span>
                                <span className="text-blue-500 text-xs ml-2">(smallest dimensions)</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}

                {/* Submit */}
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full py-5" onClick={() => setTab('job-detail')}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-5 text-lg font-bold gap-2">
                    <Send className="w-5 h-5" /> Submit All Measurements
                  </Button>
                </div>

                <p className="mt-3 text-xs text-gray-400 text-center">
                  Measurements will be verified before production. You'll be notified when the order ships for installation scheduling.
                </p>
              </div>
            )}

            {/* ============================================================ */}
            {/* EARNINGS */}
            {/* ============================================================ */}
            {tab === 'earnings' && <ContractorAccounting />}

            {/* ============================================================ */}
            {/* MESSAGES */}
            {/* ============================================================ */}
            {tab === 'messages' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Messages</h2>
                <p className="text-sm text-gray-500 mb-4">Chat with the SnapShades team about your jobs, schedule, and payouts.</p>
                <CrmInbox viewer={CONTRACTOR_VIEWER} heightClass="h-[68vh]" />
              </div>
            )}

            {/* SETTINGS */}
            {/* ============================================================ */}
            {tab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Settings</h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                          <input type="text" defaultValue={CONTRACTOR.name} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Email</label>
                          <input type="email" defaultValue={CONTRACTOR.email} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Phone</label>
                          <input type="tel" defaultValue={CONTRACTOR.phone} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-medium text-gray-900 mb-3">Service Area & Rates</h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Primary ZIP</label>
                          <input type="text" defaultValue="90210" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Radius</label>
                          <select defaultValue="25" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none">
                            <option>10 miles</option>
                            <option>25 miles</option>
                            <option>50 miles</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Per Window Rate ($)</label>
                          <input type="number" defaultValue="50" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="bg-blue-600 text-white rounded-full">Save Changes</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
