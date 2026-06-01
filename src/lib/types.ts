/**
 * Centralized status types and enums for the SnapShades platform.
 *
 * All status strings used across the codebase should reference these
 * types to prevent typos and ensure consistency.
 */

// ── Order Lifecycle ──

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'manufacturing'
  | 'shipped'
  | 'delivered'
  | 'installing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'pending', 'confirmed', 'manufacturing', 'shipped',
  'delivered', 'installing', 'completed', 'cancelled', 'refunded',
] as const;

// ── Project / Cart ──

export type ProjectStatus =
  | 'cart'
  | 'draft'
  | 'measuring'
  | 'selecting'
  | 'checkout'
  | 'ordered'
  | 'completed';

export const ACTIVE_PROJECT_STATUSES: readonly ProjectStatus[] = [
  'cart', 'draft', 'measuring', 'selecting',
] as const;

// ── Contractor ──

export type ContractorStatus =
  | 'invited'
  | 'onboarding'
  | 'pending_review'
  | 'active'
  | 'inactive'
  | 'suspended';

export const CONTRACTOR_STATUSES: readonly ContractorStatus[] = [
  'invited', 'onboarding', 'pending_review', 'active', 'inactive', 'suspended',
] as const;

// ── Jobs ──

export type JobStatus =
  | 'assigned'
  | 'accepted'
  | 'declined'
  | 'en_route'
  | 'on_site'
  | 'measuring'
  | 'measure_complete'
  | 'installing'
  | 'install_complete'
  | 'needs_revisit'
  | 'completed'
  | 'cancelled';

export const JOB_STATUSES: readonly JobStatus[] = [
  'assigned', 'accepted', 'declined', 'en_route', 'on_site',
  'measuring', 'measure_complete', 'installing', 'install_complete',
  'needs_revisit', 'completed', 'cancelled',
] as const;

// ── Window ──

export type WindowStatus = 'draft' | 'measured' | 'priced' | 'ordered' | 'manufacturing' | 'shipped' | 'installed';

// ── Service Tier ──

export type ServiceTier = 'ship' | 'install' | 'design';

// ── Payment ──

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

// ── CRM Chat / Conversations ──

export type ConversationStatus = 'open' | 'snoozed' | 'resolved';

export const CONVERSATION_STATUSES: readonly ConversationStatus[] = [
  'open', 'snoozed', 'resolved',
] as const;
