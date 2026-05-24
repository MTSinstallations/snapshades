/**
 * SnapShades Scheduling Engine
 * 
 * ARCHITECTURE:
 * - Contractors/Designers set weekly availability + blackout dates in their portal
 * - System merges all available slots for a customer's zip code
 * - Customer sees unified calendar (doesn't know which contractor)
 * - On booking, system routes to the correct contractor by slot
 * - Email/SMS notifications sent to both parties
 * 
 * SLOT MODEL:
 * - 2-hour windows: 8-10am, 10-12pm, 12-2pm, 2-4pm, 4-6pm
 * - Contractor sets which windows they're available each day of week
 * - Contractor can block specific dates (vacation, etc.)
 * - Max bookings per slot = 1 (per contractor)
 * - Lookahead: 6 weeks from today
 */

// ============================================================
// TYPES
// ============================================================

export type ServiceType = 'measure' | 'install' | 'design' | 'measure_install';

export type SlotTime = '8:00 AM - 10:00 AM' | '10:00 AM - 12:00 PM' | '12:00 PM - 2:00 PM' | '2:00 PM - 4:00 PM' | '4:00 PM - 6:00 PM';

export const ALL_SLOTS: SlotTime[] = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
];

export interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'contractor' | 'designer';
  serviceTypes: ServiceType[];
  serviceZips: string[];
  serviceRadius: number; // miles
  latitude?: number;
  longitude?: number;
  rating: number;
  completedJobs: number;
  hourlyRate?: number;
  perWindowRate?: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface WeeklyAvailability {
  contractorId: string;
  // 0 = Sunday, 6 = Saturday
  schedule: Record<number, SlotTime[]>;
}

export interface BlackoutDate {
  contractorId: string;
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface Booking {
  id: string;
  contractorId: string;
  customerId: string;
  orderId?: string;
  serviceType: ServiceType;
  date: string; // YYYY-MM-DD
  slot: SlotTime;
  status: 'pending' | 'confirmed' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerZip: string;
  customerNotes?: string;
  contractorNotes?: string;
  windowCount?: number;
  createdAt: string;
}

export interface AvailableSlot {
  date: string; // YYYY-MM-DD
  dayOfWeek: number;
  dayName: string;
  slot: SlotTime;
  contractorIds: string[]; // Which contractors are available (hidden from customer)
}

export interface CalendarDay {
  date: string;
  dayOfWeek: number;
  dayName: string;
  dateLabel: string; // "Mon, Mar 24"
  slots: AvailableSlot[];
  isToday: boolean;
  isPast: boolean;
}

// ============================================================
// DEMO DATA
// ============================================================

export const DEMO_CONTRACTORS: Contractor[] = [
  {
    id: 'c-001',
    name: 'Mike Rodriguez',
    email: 'mike@proinstalls.com',
    phone: '(555) 234-5678',
    type: 'contractor',
    serviceTypes: ['measure', 'install', 'measure_install'],
    serviceZips: ['90210', '90211', '90212', '90213', '90001', '90002', '90003', '90004', '90005'],
    serviceRadius: 25,
    rating: 4.9,
    completedJobs: 247,
    perWindowRate: 50,
    status: 'active',
  },
  {
    id: 'c-002',
    name: 'Sarah Kim',
    email: 'sarah@windowpros.com',
    phone: '(555) 345-6789',
    type: 'contractor',
    serviceTypes: ['measure', 'install', 'measure_install'],
    serviceZips: ['90210', '90211', '90212', '90401', '90402', '90403'],
    serviceRadius: 20,
    rating: 4.8,
    completedJobs: 183,
    perWindowRate: 55,
    status: 'active',
  },
  {
    id: 'c-003',
    name: 'David Chen',
    email: 'david@elitewindows.com',
    phone: '(555) 456-7890',
    type: 'contractor',
    serviceTypes: ['install'],
    serviceZips: ['90210', '90211', '90001', '90002', '90003', '90004', '91001', '91002'],
    serviceRadius: 30,
    rating: 4.7,
    completedJobs: 312,
    perWindowRate: 45,
    status: 'active',
  },
  {
    id: 'd-001',
    name: 'Jessica Park',
    email: 'jessica@designstudio.com',
    phone: '(555) 567-8901',
    type: 'designer',
    serviceTypes: ['design'],
    serviceZips: ['90210', '90211', '90212', '90213', '90401', '90402', '90001', '90002'],
    serviceRadius: 25,
    rating: 5.0,
    completedJobs: 89,
    hourlyRate: 75,
    status: 'active',
  },
  {
    id: 'd-002',
    name: 'Marcus Johnson',
    email: 'marcus@interiordesigns.com',
    phone: '(555) 678-9012',
    type: 'designer',
    serviceTypes: ['design'],
    serviceZips: ['90210', '90001', '90002', '90003', '90004', '90005', '91001'],
    serviceRadius: 30,
    rating: 4.9,
    completedJobs: 124,
    hourlyRate: 85,
    status: 'active',
  },
];

export const DEMO_AVAILABILITY: WeeklyAvailability[] = [
  {
    contractorId: 'c-001',
    schedule: {
      1: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'],
      2: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      3: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM'],
      4: ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      5: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM'],
      6: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM'],
    },
  },
  {
    contractorId: 'c-002',
    schedule: {
      1: ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'],
      2: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'],
      3: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      4: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM'],
      5: ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
    },
  },
  {
    contractorId: 'c-003',
    schedule: {
      1: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      2: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM'],
      3: ['12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      4: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'],
      5: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM'],
      6: ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM'],
    },
  },
  {
    contractorId: 'd-001',
    schedule: {
      1: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM'],
      2: ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'],
      3: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM'],
      4: ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM'],
      5: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM'],
    },
  },
  {
    contractorId: 'd-002',
    schedule: {
      1: ['8:00 AM - 10:00 AM', '12:00 PM - 2:00 PM', '4:00 PM - 6:00 PM'],
      2: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM'],
      3: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM'],
      4: ['2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      5: ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM'],
    },
  },
];

export const DEMO_BLACKOUTS: BlackoutDate[] = [
  { contractorId: 'c-001', date: '2026-04-01', reason: 'Personal' },
  { contractorId: 'c-002', date: '2026-04-07', reason: 'Training' },
  { contractorId: 'd-001', date: '2026-04-10', reason: 'Conference' },
];

// ============================================================
// SCHEDULING LOGIC
// ============================================================

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateLabel(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get available calendar slots for a customer's zip code and service type.
 * Merges availability from ALL matching contractors.
 * Customer never sees which contractor — just available times.
 */
export function getAvailableCalendar(
  customerZip: string,
  serviceType: ServiceType,
  contractors: Contractor[] = DEMO_CONTRACTORS,
  availability: WeeklyAvailability[] = DEMO_AVAILABILITY,
  blackouts: BlackoutDate[] = DEMO_BLACKOUTS,
  existingBookings: Booking[] = [],
  weeksAhead: number = 6,
): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter contractors by zip + service type + active
  const matchingContractors = contractors.filter(c =>
    c.status === 'active' &&
    c.serviceZips.includes(customerZip) &&
    c.serviceTypes.includes(serviceType)
  );

  if (matchingContractors.length === 0) return [];

  const calendar: CalendarDay[] = [];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + weeksAhead * 7);

  // Start from tomorrow (no same-day bookings)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 1);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = toYMD(d);
    const dayOfWeek = d.getDay();
    const isToday = toYMD(d) === toYMD(today);

    // Collect all available slots across all matching contractors
    const slotMap: Record<string, string[]> = {};

    for (const contractor of matchingContractors) {
      // Check if contractor has this day blacked out
      if (blackouts.some(b => b.contractorId === contractor.id && b.date === dateStr)) continue;

      // Get weekly schedule for this day
      const avail = availability.find(a => a.contractorId === contractor.id);
      if (!avail) continue;

      const daySlots = avail.schedule[dayOfWeek] || [];
      for (const slot of daySlots) {
        // Check if contractor already has a booking for this slot
        const hasBooking = existingBookings.some(
          b => b.contractorId === contractor.id && b.date === dateStr && b.slot === slot && b.status !== 'cancelled'
        );
        if (hasBooking) continue;

        if (!slotMap[slot]) slotMap[slot] = [];
        slotMap[slot].push(contractor.id);
      }
    }

    const slots: AvailableSlot[] = ALL_SLOTS
      .filter(slot => slotMap[slot])
      .map(slot => ({
        date: dateStr,
        dayOfWeek,
        dayName: DAY_NAMES[dayOfWeek],
        slot,
        contractorIds: slotMap[slot],
      }));

    if (slots.length > 0) {
      calendar.push({
        date: dateStr,
        dayOfWeek,
        dayName: DAY_NAMES[dayOfWeek],
        dateLabel: formatDateLabel(new Date(d)),
        slots,
        isToday,
        isPast: d < today,
      });
    }
  }

  return calendar;
}

/**
 * Select the best contractor for a given slot.
 * Priority: highest rating, then fewest completed jobs (give newer contractors work).
 */
export function selectContractor(
  slot: AvailableSlot,
  contractors: Contractor[] = DEMO_CONTRACTORS,
): Contractor | null {
  const candidates = contractors.filter(c => slot.contractorIds.includes(c.id));
  if (candidates.length === 0) return null;

  // Sort: highest rating first, then lowest completed jobs (balance workload)
  candidates.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.completedJobs - b.completedJobs;
  });

  return candidates[0];
}

/**
 * Create a booking. Returns the booking object.
 * In production, this writes to Supabase and sends emails.
 */
export function createBooking(
  slot: AvailableSlot,
  serviceType: ServiceType,
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    notes?: string;
    windowCount?: number;
  },
  orderId?: string,
): Booking | null {
  const contractor = selectContractor(slot);
  if (!contractor) return null;

  return {
    id: `bk-${Date.now()}`,
    contractorId: contractor.id,
    customerId: customer.id,
    orderId,
    serviceType,
    date: slot.date,
    slot: slot.slot,
    status: 'confirmed',
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    customerZip: customer.zip,
    customerNotes: customer.notes,
    windowCount: customer.windowCount,
    createdAt: new Date().toISOString(),
  };
}
