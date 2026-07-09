/**
 * Zod validation schemas for critical data inputs.
 *
 * Use these at system boundaries: form submissions, API responses,
 * and before database writes.
 */

import { z } from 'zod';

// ── Contact / Checkout ──

export const checkoutInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'),
  address1: z.string().min(1, 'Address is required').max(200),
  address2: z.string().max(200).optional().default(''),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'Use 2-letter state code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
});

export type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;

// ── Window Measurements ──

export const windowMeasurementSchema = z.object({
  width: z.number().min(6, 'Min width is 6"').max(240, 'Max width is 240"'),
  height: z.number().min(6, 'Min height is 6"').max(240, 'Max height is 240"'),
  depth: z.number().min(0).max(24).optional().default(0),
});

// ── Cart Window ──

export const cartWindowSchema = z.object({
  id: z.string().uuid(),
  room: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  width: z.number().min(6).max(240),
  height: z.number().min(6).max(240),
  depth: z.number().min(0).max(24),
  mountType: z.enum(['inside', 'outside']).optional().default('inside'),
  productOptions: z.record(z.string()).optional().default({}),
  productId: z.string().min(1),
  variantId: z.string().optional().default(''),
  manufacturer: z.string().default('Norman®'),
  retailPrice: z.number().min(0),
  ourCost: z.number().min(0),
  customerPrice: z.number().min(0),
  tier: z.enum(['ship', 'install', 'design']),
  installFee: z.number().min(0).default(0),
  designFee: z.number().min(0).default(0),
  surchargesTotal: z.number().min(0).default(0),
});

// ── ZIP Code (standalone, for service checks) ──

export const zipCodeSchema = z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits');

// ── Contractor Profile (onboarding) ──

export const contractorProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/),
  companyName: z.string().max(200).optional(),
  licenseNumber: z.string().max(50).optional(),
  insuranceExpiry: z.string().date().optional(),
  serviceRadius: z.number().min(5).max(100).default(25),
  zipCodes: z.array(z.string().regex(/^\d{5}$/)).min(1, 'At least one ZIP required'),
});

/**
 * Validate data and return typed result or throw.
 * Usage: const info = validate(checkoutInfoSchema, formData);
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation — returns { success, data, error } without throwing.
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}
