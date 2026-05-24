/**
 * Email Templates — Every automated email the system sends.
 * Zero humans write emails. Ever.
 * 
 * Integration: Resend or SendGrid (plug in later via sendEmail())
 * For now: templates + trigger logic ready to wire.
 */

import { SITE_URL, SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from './constants';

const BASE = SITE_URL;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// ============================================================
// CUSTOMER EMAILS
// ============================================================

export const customerEmails = {
  orderConfirmation: (data: {
    name: string; orderNumber: string; total: string;
    itemCount: number; hasInstall: boolean;
  }): EmailPayload => ({
    to: '', // filled by caller
    subject: `Order Confirmed — ${data.orderNumber} | SnapShades & Shutters`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">Thank you, ${data.name}! 🎉</h2>
        <p>Your order <strong>${data.orderNumber}</strong> has been confirmed.</p>
        <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin:16px 0">
          <p style="margin:0"><strong>${data.itemCount} window${data.itemCount > 1 ? 's' : ''}</strong> • Total: <strong>$${data.total}</strong></p>
        </div>
        <h3>What's Next</h3>
        <ol>
          <li>Your window treatments are custom-made (4-6 weeks)</li>
          <li>We'll email you when they ship with tracking</li>
          ${data.hasInstall ? '<li>We\'ll schedule your professional installation after delivery</li>' : ''}
        </ol>
        <a href="/account/orders" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;margin-top:16px">Track Your Order</a>
        <p style="color:#999;font-size:12px;margin-top:32px">Questions? Reply to this email or call (888) 555-0123</p>
      </div>
    `,
  }),

  orderShipped: (data: {
    name: string; orderNumber: string; trackingNumber: string;
    carrier: string; estimatedDelivery: string;
  }): EmailPayload => ({
    to: '',
    subject: `Your Order Has Shipped! 📦 ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">${data.name}, your order is on its way!</h2>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Order:</strong> ${data.orderNumber}</p>
          <p style="margin:0 0 8px"><strong>Carrier:</strong> ${data.carrier}</p>
          <p style="margin:0 0 8px"><strong>Tracking:</strong> ${data.trackingNumber}</p>
          <p style="margin:0"><strong>Est. Delivery:</strong> ${data.estimatedDelivery}</p>
        </div>
        <a href="/account/orders" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">Track Order</a>
      </div>
    `,
  }),

  installScheduled: (data: {
    name: string; orderNumber: string; installerName: string;
    date: string; timeSlot: string; address: string;
  }): EmailPayload => ({
    to: '',
    subject: `Installation Scheduled — ${data.date} | ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">Your installation is scheduled! 🔧</h2>
        <div style="background:#f5f3ff;border-radius:12px;padding:20px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Date:</strong> ${data.date}</p>
          <p style="margin:0 0 8px"><strong>Time:</strong> ${data.timeSlot}</p>
          <p style="margin:0 0 8px"><strong>Installer:</strong> ${data.installerName}</p>
          <p style="margin:0"><strong>Address:</strong> ${data.address}</p>
        </div>
        <h3>Preparation Tips</h3>
        <ul>
          <li>Clear the area around your windows</li>
          <li>Remove existing window treatments if possible</li>
          <li>Ensure someone 18+ is home during the appointment</li>
        </ul>
        <p style="color:#999;font-size:12px">Need to reschedule? Reply to this email at least 24 hours before your appointment.</p>
      </div>
    `,
  }),

  reviewRequest: (data: {
    name: string; orderNumber: string; installerName: string;
  }): EmailPayload => ({
    to: '',
    subject: `How was your installation? ⭐ ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">Hi ${data.name}, how did everything go?</h2>
        <p>Your installation by <strong>${data.installerName}</strong> for order <strong>${data.orderNumber}</strong> was recently completed.</p>
        <p>Your feedback helps us maintain quality and helps ${data.installerName} improve.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="/review?order=${data.orderNumber}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:999px;text-decoration:none;font-size:16px">Leave a Review</a>
        </div>
        <p style="color:#999;font-size:12px">Takes less than 2 minutes. Thank you!</p>
      </div>
    `,
  }),

  inspectionReminder: (data: {
    name: string; orderNumber: string; dayNumber: number;
  }): EmailPayload => ({
    to: '',
    subject: data.dayNumber === 30
      ? `Final inspection reminder — Day 30 | ${data.orderNumber}`
      : `Quick check-in — Day ${data.dayNumber} | ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">Day ${data.dayNumber} Check-In</h2>
        <p>Hi ${data.name}, it's been ${data.dayNumber} days since your installation (order ${data.orderNumber}).</p>
        <p>Everything looking good? Our 30-day quality guarantee covers:</p>
        <ul>
          <li>Fit issues</li>
          <li>Operation problems</li>
          <li>Installation quality</li>
          <li>Color/product concerns</li>
        </ul>
        ${data.dayNumber >= 28 ? '<p style="color:#dc2626;font-weight:bold">⚠️ Your 30-day inspection window closes soon!</p>' : ''}
        <div style="margin:16px 0">
          <a href="/help" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;margin-right:8px">Report an Issue</a>
          <a href="/account/orders" style="display:inline-block;background:#f3f4f6;color:#374151;padding:12px 24px;border-radius:999px;text-decoration:none">Everything's Great ✓</a>
        </div>
      </div>
    `,
  }),

  paymentFailed: (data: {
    name: string; orderNumber: string; amount: string; retryUrl: string;
  }): EmailPayload => ({
    to: '',
    subject: `Action needed — Payment failed for ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#dc2626">Payment Issue</h2>
        <p>Hi ${data.name}, we couldn't process your payment of <strong>$${data.amount}</strong> for order <strong>${data.orderNumber}</strong>.</p>
        <p>Please update your payment method to keep your order on track.</p>
        <a href="${data.retryUrl}" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">Update Payment</a>
        <p style="color:#999;font-size:12px;margin-top:16px">If not resolved within 7 days, your order will be cancelled.</p>
      </div>
    `,
  }),
};

// ============================================================
// CONTRACTOR EMAILS
// ============================================================

export const contractorEmails = {
  welcome: (data: { name: string }): EmailPayload => ({
    to: '',
    subject: `Welcome to SnapShades & Shutters! 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">Welcome aboard, ${data.name}!</h2>
        <p>Your contractor account is now <strong>active</strong>. Jobs will start flowing to your portal as customers order in your service area.</p>
        <h3>Getting Started</h3>
        <ol>
          <li>Log into your <a href="/portal">Contractor Portal</a></li>
          <li>Set your detailed availability calendar</li>
          <li>Review the installation guidelines</li>
          <li>Wait for your first job notification!</li>
        </ol>
        <a href="/portal" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">Open My Portal</a>
        <p style="color:#999;font-size:12px;margin-top:32px">Questions? Reply to this email anytime.</p>
      </div>
    `,
  }),

  newJobOffer: (data: {
    name: string; city: string; state: string; windowCount: number;
    productType: string; date: string; payout: string;
    acceptUrl: string; declineUrl: string; expiresIn: string;
  }): EmailPayload => ({
    to: '',
    subject: `New Job — ${data.windowCount} windows in ${data.city}, ${data.state} ($${data.payout})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">New job available, ${data.name}!</h2>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>${data.windowCount} window${data.windowCount > 1 ? 's' : ''}</strong> — ${data.productType}</p>
          <p style="margin:0 0 8px"><strong>Location:</strong> ${data.city}, ${data.state}</p>
          <p style="margin:0 0 8px"><strong>Date:</strong> ${data.date}</p>
          <p style="margin:0;font-size:24px;font-weight:bold;color:#16a34a">$${data.payout}</p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${data.acceptUrl}" style="display:inline-block;background:#16a34a;color:white;padding:14px 32px;border-radius:999px;text-decoration:none;font-size:16px;margin-right:8px">Accept Job</a>
          <a href="${data.declineUrl}" style="display:inline-block;background:#f3f4f6;color:#374151;padding:14px 32px;border-radius:999px;text-decoration:none;font-size:16px">Decline</a>
        </div>
        <p style="color:#dc2626;font-size:13px;text-align:center">⏰ Expires in ${data.expiresIn}</p>
      </div>
    `,
  }),

  payoutSent: (data: {
    name: string; amount: string; jobCount: number;
    periodStart: string; periodEnd: string;
  }): EmailPayload => ({
    to: '',
    subject: `Payment Sent — $${data.amount} 💰`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f">${data.name}, you've been paid!</h2>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:16px 0;text-align:center">
          <p style="font-size:36px;font-weight:bold;color:#16a34a;margin:0">$${data.amount}</p>
          <p style="color:#666;margin:8px 0 0">${data.jobCount} job${data.jobCount > 1 ? 's' : ''} • ${data.periodStart} — ${data.periodEnd}</p>
        </div>
        <p>Funds should arrive in your bank account within 1-2 business days.</p>
        <a href="/portal" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">View Details in Portal</a>
      </div>
    `,
  }),

  insuranceExpiring: (data: {
    name: string; daysLeft: number; docType: string;
  }): EmailPayload => ({
    to: '',
    subject: data.daysLeft <= 7
      ? `⚠️ URGENT: ${data.docType} expires in ${data.daysLeft} days`
      : `Reminder: ${data.docType} expires in ${data.daysLeft} days`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:${data.daysLeft <= 7 ? '#dc2626' : '#1e3a5f'}">${data.daysLeft <= 7 ? '⚠️ ' : ''}${data.docType} Expiring Soon</h2>
        <p>Hi ${data.name}, your ${data.docType} expires in <strong>${data.daysLeft} days</strong>.</p>
        ${data.daysLeft <= 7 ? '<p style="color:#dc2626;font-weight:bold">Your account will be suspended if not renewed before expiration.</p>' : ''}
        <a href="/portal" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">Upload New Document</a>
      </div>
    `,
  }),

  suspended: (data: { name: string; reason: string }): EmailPayload => ({
    to: '',
    subject: `Account Suspended — Action Required`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#dc2626">Account Suspended</h2>
        <p>Hi ${data.name}, your contractor account has been suspended.</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p>To reactivate, please address the issue and upload any required documents.</p>
        <a href="/portal" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">Go to Portal</a>
        <p style="color:#999;font-size:12px">Your account will be automatically reactivated once all requirements are met.</p>
      </div>
    `,
  }),

  reactivated: (data: { name: string }): EmailPayload => ({
    to: '',
    subject: `You're Back! Account Reactivated ✅`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#16a34a">Welcome back, ${data.name}! ✅</h2>
        <p>Your account has been reactivated. You're eligible for new jobs again.</p>
        <a href="/portal" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:999px;text-decoration:none">Open Portal</a>
      </div>
    `,
  }),
};

// ============================================================
// SEND EMAIL (stub — wire to Resend/SendGrid later)
// ============================================================

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  // TODO: Wire to Resend API
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'SnapShades <hello@snapshadesandshutters.com>', ...payload });
  
  console.log(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
  return { success: true };
}
