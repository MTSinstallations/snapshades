/**
 * SnapShades Designer Engine
 * 
 * DESIGNERS ARE REMOTE — no ZIP code requirement.
 * They work via Google Meet. Any designer can serve any customer nationwide.
 * 
 * KEY DIFFERENCES FROM CONTRACTOR ENGINE:
 * - No territory/ZIP assignment
 * - No travel fees
 * - Availability is purely calendar-based
 * - Customer pays $50/hour
 * - Sessions are 1-hour blocks
 * - Google Meet link auto-generated per booking
 * - Designer can work from anywhere
 * 
 * FLOW:
 * 1. Customer selects "Design Consultation" tier
 * 2. System shows ALL designers' merged availability (nationwide)
 * 3. Customer picks a time → auto-assigned to available designer
 * 4. Both get email with Google Meet link
 * 5. Designer consults, makes product recommendations
 * 6. Recommendations saved to customer's project
 */

// ============================================================
// TYPES
// ============================================================

export type DesignerStatus = 'invited' | 'onboarding' | 'active' | 'inactive' | 'on_leave';

export interface DesignerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  bio: string;
  specialties: string[];  // 'modern', 'traditional', 'farmhouse', 'coastal', 'minimalist', 'luxury'
  certifications: string[];
  yearsExperience: number;
  
  // Status
  status: DesignerStatus;
  
  // Performance
  rating: number;
  totalRatings: number;
  completedConsultations: number;
  
  // Payment
  hourlyRate: number;        // What we pay them (internal)
  customerRate: number;      // What customer pays ($50/hr)
  stripeConnectId?: string;
  
  // Preferences
  maxSessionsPerDay: number;
  preferredHours: { start: string; end: string };  // e.g. "09:00" to "17:00"
  timezone: string;
  autoAccept: boolean;
  
  // Timestamps
  activatedAt?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export type ConsultationSlot = '9:00 AM' | '10:00 AM' | '11:00 AM' | '12:00 PM' | '1:00 PM' | '2:00 PM' | '3:00 PM' | '4:00 PM' | '5:00 PM';

export const ALL_CONSULTATION_SLOTS: ConsultationSlot[] = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

export interface DesignerAvailability {
  designerId: string;
  date: string;        // YYYY-MM-DD
  slots: ConsultationSlot[];
}

export interface DesignConsultation {
  id: string;
  designerId: string;
  designerName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: string;
  
  // Scheduling
  date: string;
  slot: ConsultationSlot;
  durationMinutes: number;  // Default 60
  timezone: string;
  
  // Meeting
  googleMeetLink: string;
  googleCalendarEventId?: string;
  
  // Status
  status: 'scheduled' | 'reminder_sent' | 'in_progress' | 'completed' | 'no_show' | 'cancelled' | 'rescheduled';
  
  // Consultation content
  customerProject?: {
    rooms: string[];
    windowCount: number;
    budget?: string;
    style?: string;
    concerns?: string;
  };
  
  // Designer's recommendations (filled during/after consultation)
  recommendations?: {
    windowId: string;
    room: string;
    windowName: string;
    recommendedProduct: string;
    recommendedColor: string;
    recommendedLift: string;
    notes: string;
    alternativeProducts?: string[];
  }[];
  designerNotes?: string;
  
  // Payment
  customerCharge: number;    // $50/hr
  designerPayout: number;    // What we pay designer
  paymentStatus: 'pending' | 'charged' | 'refunded';
  stripePaymentIntentId?: string;
  
  // Timestamps
  createdAt: string;
  completedAt?: string;
}

export interface AvailableDesignSlot {
  date: string;
  slot: ConsultationSlot;
  designerIds: string[];  // Hidden from customer
}

// ============================================================
// CONSTANTS
// ============================================================

export const CUSTOMER_RATE_PER_HOUR = 50;  // $50/hr customer pays
export const DESIGNER_PAYOUT_PERCENT = 0.70;  // Designer gets 70% = $35/hr
export const SESSION_DURATION_MINUTES = 60;

// ============================================================
// SCHEDULING LOGIC
// ============================================================

/**
 * Get available consultation slots across ALL designers.
 * Customer sees merged calendar — doesn't know which designer.
 * No ZIP code filtering — designers are nationwide remote.
 */
export function getAvailableDesignSlots(
  designers: DesignerProfile[],
  availability: DesignerAvailability[],
  existingBookings: DesignConsultation[],
  weeksAhead: number = 4,
): { date: string; dateLabel: string; dayName: string; slots: AvailableDesignSlot[] }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 1); // No same-day bookings

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + weeksAhead * 7);

  const activeDesigners = designers.filter(d => d.status === 'active');
  if (activeDesigners.length === 0) return [];

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const calendar: { date: string; dateLabel: string; dayName: string; slots: AvailableDesignSlot[] }[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();

    // Skip weekends (designers work Mon-Fri by default)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const slotMap: Record<string, string[]> = {};

    for (const designer of activeDesigners) {
      // Check designer's availability for this date
      const dayAvail = availability.find(a => a.designerId === designer.id && a.date === dateStr);
      if (!dayAvail) continue;

      for (const slot of dayAvail.slots) {
        // Check if designer already booked
        const isBooked = existingBookings.some(
          b => b.designerId === designer.id && b.date === dateStr && b.slot === slot && !['cancelled', 'rescheduled'].includes(b.status)
        );
        if (isBooked) continue;

        if (!slotMap[slot]) slotMap[slot] = [];
        slotMap[slot].push(designer.id);
      }
    }

    const slots: AvailableDesignSlot[] = ALL_CONSULTATION_SLOTS
      .filter(s => slotMap[s])
      .map(s => ({
        date: dateStr,
        slot: s,
        designerIds: slotMap[s],
      }));

    if (slots.length > 0) {
      calendar.push({
        date: dateStr,
        dateLabel: `${DAY_NAMES[dayOfWeek]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
        dayName: DAY_NAMES[dayOfWeek],
        slots,
      });
    }
  }

  return calendar;
}

/**
 * Select the best designer for a slot.
 * Priority: highest rating → fewest consultations today → random
 */
export function selectDesigner(
  slot: AvailableDesignSlot,
  designers: DesignerProfile[],
  todayBookings: DesignConsultation[],
): DesignerProfile | null {
  const candidates = designers.filter(d => slot.designerIds.includes(d.id));
  if (candidates.length === 0) return null;

  // Count today's bookings per designer
  const bookingCounts: Record<string, number> = {};
  for (const b of todayBookings) {
    bookingCounts[b.designerId] = (bookingCounts[b.designerId] || 0) + 1;
  }

  candidates.sort((a, b) => {
    // Highest rating first
    if (b.rating !== a.rating) return b.rating - a.rating;
    // Fewest bookings today (spread work)
    return (bookingCounts[a.id] || 0) - (bookingCounts[b.id] || 0);
  });

  // Check max sessions
  return candidates.find(c => (bookingCounts[c.id] || 0) < c.maxSessionsPerDay) || null;
}

/**
 * Generate a Google Meet link (placeholder — real implementation uses Google Calendar API)
 */
export function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${segment()}-${segment()}-${segment()}`;
}

/**
 * Book a design consultation
 */
export function bookConsultation(
  slot: AvailableDesignSlot,
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  },
  designers: DesignerProfile[],
  todayBookings: DesignConsultation[],
  orderId?: string,
  projectDetails?: DesignConsultation['customerProject'],
): DesignConsultation | null {
  const designer = selectDesigner(slot, designers, todayBookings);
  if (!designer) return null;

  return {
    id: `dc-${Date.now()}`,
    designerId: designer.id,
    designerName: `${designer.firstName} ${designer.lastName}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    orderId,
    date: slot.date,
    slot: slot.slot,
    durationMinutes: SESSION_DURATION_MINUTES,
    timezone: 'America/Los_Angeles', // Customer's timezone
    googleMeetLink: generateMeetLink(),
    status: 'scheduled',
    customerProject: projectDetails,
    customerCharge: CUSTOMER_RATE_PER_HOUR,
    designerPayout: CUSTOMER_RATE_PER_HOUR * DESIGNER_PAYOUT_PERCENT,
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

export const DESIGNER_EMAIL_TEMPLATES = {
  consultation_booked_customer: {
    subject: (date: string, slot: string) => `Design Consultation Confirmed — ${date} at ${slot}`,
    template: (consultation: DesignConsultation) => `
Hi ${consultation.customerName},

Your design consultation is confirmed!

📅 ${consultation.date} at ${consultation.slot}
⏱ 60 minutes
💻 Google Meet: ${consultation.googleMeetLink}
💰 $${consultation.customerCharge}.00

**How to prepare:**
1. Have photos of your windows ready
2. Think about your style preferences and budget
3. Note any concerns (light, privacy, energy efficiency)
4. Join the Google Meet link 5 minutes early

Your designer will walk you through product options, colors, and configurations tailored to your home.

Need to reschedule? Reply to this email at least 24 hours before.

— SnapShades Design Team
    `.trim(),
  },

  consultation_booked_designer: {
    subject: (date: string, customerName: string) => `New Consultation: ${customerName} — ${date}`,
    template: (consultation: DesignConsultation) => `
New design consultation booked:

📅 ${consultation.date} at ${consultation.slot}
👤 ${consultation.customerName}
📧 ${consultation.customerEmail}
📞 ${consultation.customerPhone}
💻 ${consultation.googleMeetLink}

${consultation.customerProject ? `
**Project Details:**
- Rooms: ${consultation.customerProject.rooms.join(', ')}
- Windows: ${consultation.customerProject.windowCount}
- Budget: ${consultation.customerProject.budget || 'Not specified'}
- Style: ${consultation.customerProject.style || 'Not specified'}
- Concerns: ${consultation.customerProject.concerns || 'None noted'}
` : ''}

Your payout: $${consultation.designerPayout.toFixed(2)}

— SnapShades
    `.trim(),
  },

  consultation_reminder: {
    subject: 'Reminder: Design Consultation Tomorrow',
    template: (consultation: DesignConsultation) => `
Reminder: You have a design consultation tomorrow.

📅 ${consultation.date} at ${consultation.slot}
💻 ${consultation.googleMeetLink}

See you there!
— SnapShades
    `.trim(),
  },
};

// ============================================================
// DEMO DATA
// ============================================================

export const DEMO_DESIGNERS: DesignerProfile[] = [
  {
    id: 'des-001',
    firstName: 'Jessica',
    lastName: 'Park',
    email: 'jessica@designstudio.com',
    phone: '(555) 567-8901',
    bio: 'Certified interior designer with 8 years specializing in window treatments. Passionate about creating spaces that balance beauty and function.',
    specialties: ['modern', 'minimalist', 'coastal'],
    certifications: ['ASID Certified', 'WCAA Member'],
    yearsExperience: 8,
    status: 'active',
    rating: 5.0,
    totalRatings: 89,
    completedConsultations: 89,
    hourlyRate: 35,
    customerRate: 50,
    maxSessionsPerDay: 6,
    preferredHours: { start: '09:00', end: '17:00' },
    timezone: 'America/Los_Angeles',
    autoAccept: true,
    activatedAt: '2026-01-15T00:00:00Z',
    lastActiveAt: '2026-03-24T10:00:00Z',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'des-002',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus@interiordesigns.com',
    phone: '(555) 678-9012',
    bio: 'Former architect turned interior designer. Loves helping homeowners find the perfect window treatments that complement their architecture.',
    specialties: ['traditional', 'luxury', 'farmhouse'],
    certifications: ['NCIDQ Certified'],
    yearsExperience: 12,
    status: 'active',
    rating: 4.9,
    totalRatings: 124,
    completedConsultations: 124,
    hourlyRate: 35,
    customerRate: 50,
    maxSessionsPerDay: 5,
    preferredHours: { start: '10:00', end: '18:00' },
    timezone: 'America/New_York',
    autoAccept: true,
    activatedAt: '2026-01-20T00:00:00Z',
    lastActiveAt: '2026-03-24T09:00:00Z',
    createdAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'des-003',
    firstName: 'Elena',
    lastName: 'Vasquez',
    email: 'elena@windowdesign.co',
    phone: '(555) 789-0123',
    bio: 'Bilingual designer (English/Spanish) with a keen eye for color coordination and natural light optimization.',
    specialties: ['modern', 'traditional', 'coastal'],
    certifications: ['CID Certified', 'Bilingual (EN/ES)'],
    yearsExperience: 6,
    status: 'active',
    rating: 4.8,
    totalRatings: 67,
    completedConsultations: 67,
    hourlyRate: 35,
    customerRate: 50,
    maxSessionsPerDay: 5,
    preferredHours: { start: '08:00', end: '16:00' },
    timezone: 'America/Chicago',
    autoAccept: false,
    activatedAt: '2026-02-01T00:00:00Z',
    lastActiveAt: '2026-03-23T15:00:00Z',
    createdAt: '2026-01-28T00:00:00Z',
  },
];

// Generate demo availability for next 4 weeks
export function generateDemoDesignerAvailability(): DesignerAvailability[] {
  const availability: DesignerAvailability[] = [];
  const today = new Date();

  for (const designer of DEMO_DESIGNERS) {
    for (let i = 1; i <= 28; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const dateStr = d.toISOString().split('T')[0];
      
      // Random availability (most slots, some gaps)
      const slots = ALL_CONSULTATION_SLOTS.filter(() => Math.random() > 0.25);
      if (slots.length > 0) {
        availability.push({ designerId: designer.id, date: dateStr, slots: slots as ConsultationSlot[] });
      }
    }
  }

  return availability;
}
