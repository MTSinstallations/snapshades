/**
 * Internal CRM Chat — staff ↔ customer ↔ contractor messaging.
 *
 * This is the messaging hub behind the Admin "Messages" inbox and the
 * "Messages" sections of the Customer and Contractor portals. A conversation
 * is always between SnapShades **staff** and one **party** (a customer or a
 * contractor), optionally tied to an order/job reference.
 *
 * Persistence mirrors the rest of the app (see persistent-cart.ts):
 *  - **Demo mode** (no Supabase keys): localStorage is the source of truth.
 *    A module-level event bus + the browser `storage` event give live updates
 *    across tabs and components, so the inbox and the portals stay in sync
 *    without a backend.
 *  - **Configured mode**: every write is mirrored to Supabase and a realtime
 *    channel merges remote changes back in. These calls are safe no-ops under
 *    the demo Supabase shim, so the same code runs in both modes.
 *
 * The public API is async and the store is shaped for `useSyncExternalStore`
 * (see hooks/useCrmChat.ts).
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { ConversationStatus } from './types';

// ── Types ──

export type ChatRole = 'staff' | 'customer' | 'contractor';
export type PartyKind = 'customer' | 'contractor';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  authorName: string;
  body: string;
  createdAt: string; // ISO
  readByStaff: boolean;
  readByParty: boolean;
}

export interface ChatParty {
  kind: PartyKind;
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Conversation {
  id: string;
  party: ChatParty;
  subject: string;
  orderRef?: string;
  status: ConversationStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

/** Identity of whoever is looking at the chat — controls which threads they see. */
export type Viewer =
  | { role: 'staff'; name?: string }
  | { role: 'customer'; id: string; name?: string; email?: string }
  | { role: 'contractor'; id: string; name?: string };

/** Demo identities — wired to match the portals' existing demo data. */
export const DEMO_CUSTOMER = { id: 'cust-sarah', name: 'Sarah Johnson', email: 'sarah.j@email.com' } as const;
export const DEMO_CONTRACTOR = { id: 'c-001', name: 'Mike Rodriguez', email: 'mike@proinstalls.com' } as const;
export const STAFF_NAME = 'SnapShades Support';

const STORE_KEY = 'snapshades_crm_chat_v1';

// ── ID + time helpers ──

let idCounter = 0;
function uid(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
  return `${prefix}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

// ── Unread derivation (counts are derived, never stored) ──

export function staffUnread(c: Conversation): number {
  return c.messages.filter(m => m.role !== 'staff' && !m.readByStaff).length;
}

export function partyUnread(c: Conversation): number {
  return c.messages.filter(m => m.role === 'staff' && !m.readByParty).length;
}

/** Unread count from a given viewer's perspective. */
export function unreadFor(c: Conversation, viewer: Viewer): number {
  return viewer.role === 'staff' ? staffUnread(c) : partyUnread(c);
}

function lastMessage(c: Conversation): ChatMessage | undefined {
  return c.messages[c.messages.length - 1];
}

/** Does this conversation belong to the given viewer? */
export function isVisibleTo(c: Conversation, viewer: Viewer): boolean {
  if (viewer.role === 'staff') return true;
  return c.party.kind === viewer.role && c.party.id === viewer.id;
}

// ── In-memory cache + event bus ──

let cache: Conversation[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

function sortByRecent(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function readLocal(): Conversation[] | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(list: Conversation[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* storage full / unavailable — keep in-memory copy */
  }
}

/** Replace the cache, persist, and notify subscribers. */
function commit(next: Conversation[]) {
  cache = sortByRecent(next);
  writeLocal(cache);
  emit();
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const local = readLocal();
  if (local && local.length > 0) {
    cache = sortByRecent(local);
  } else {
    cache = sortByRecent(seedConversations());
    writeLocal(cache);
  }
  // Cross-tab sync: another tab wrote the store → refresh ours.
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (e.key !== STORE_KEY) return;
      const fresh = readLocal();
      if (fresh) {
        cache = sortByRecent(fresh);
        emit();
      }
    });
  }
}

// ── External-store interface (for useSyncExternalStore) ──

export function subscribe(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stable snapshot of all conversations (reference changes only on mutation). */
export function getSnapshot(): Conversation[] {
  hydrate();
  return cache;
}

// ── Mutations ──

export interface SendMessageInput {
  conversationId: string;
  role: ChatRole;
  authorName: string;
  body: string;
}

export async function sendMessage(input: SendMessageInput): Promise<ChatMessage | null> {
  hydrate();
  const body = input.body.trim();
  if (!body) return null;

  const message: ChatMessage = {
    id: uid('msg'),
    conversationId: input.conversationId,
    role: input.role,
    authorName: input.authorName,
    body,
    createdAt: nowIso(),
    // The sender has implicitly read their own message.
    readByStaff: input.role === 'staff',
    readByParty: input.role !== 'staff',
  };

  let touched = false;
  const next = cache.map(c => {
    if (c.id !== input.conversationId) return c;
    touched = true;
    return {
      ...c,
      messages: [...c.messages, message],
      updatedAt: message.createdAt,
      // Any inbound message re-opens a resolved thread.
      status: c.status === 'resolved' && input.role !== 'staff' ? 'open' : c.status,
    };
  });
  if (!touched) return null;

  commit(next);
  void remoteInsertMessage(message);
  return message;
}

export interface StartConversationInput {
  party: ChatParty;
  subject: string;
  orderRef?: string;
  initialMessage?: { role: ChatRole; authorName: string; body: string };
  assignedTo?: string;
}

export async function startConversation(input: StartConversationInput): Promise<Conversation> {
  hydrate();
  const ts = nowIso();
  const id = uid('conv');
  const messages: ChatMessage[] = [];
  if (input.initialMessage && input.initialMessage.body.trim()) {
    messages.push({
      id: uid('msg'),
      conversationId: id,
      role: input.initialMessage.role,
      authorName: input.initialMessage.authorName,
      body: input.initialMessage.body.trim(),
      createdAt: ts,
      readByStaff: input.initialMessage.role === 'staff',
      readByParty: input.initialMessage.role !== 'staff',
    });
  }
  const conversation: Conversation = {
    id,
    party: input.party,
    subject: input.subject.trim() || 'New conversation',
    orderRef: input.orderRef,
    status: 'open',
    assignedTo: input.assignedTo,
    createdAt: ts,
    updatedAt: ts,
    messages,
  };
  commit([conversation, ...cache]);
  void remoteUpsertConversation(conversation);
  return conversation;
}

/** Mark every inbound message in a thread as read, from one side's perspective. */
export async function markRead(conversationId: string, perspective: 'staff' | 'party'): Promise<void> {
  hydrate();
  let changed = false;
  const next = cache.map(c => {
    if (c.id !== conversationId) return c;
    const messages = c.messages.map(m => {
      if (perspective === 'staff' && m.role !== 'staff' && !m.readByStaff) {
        changed = true;
        return { ...m, readByStaff: true };
      }
      if (perspective === 'party' && m.role === 'staff' && !m.readByParty) {
        changed = true;
        return { ...m, readByParty: true };
      }
      return m;
    });
    return changed ? { ...c, messages } : c;
  });
  if (changed) {
    // Preserve order (read state doesn't bump recency).
    cache = next;
    writeLocal(cache);
    emit();
    void remoteMarkRead(conversationId, perspective);
  }
}

export async function setStatus(conversationId: string, status: ConversationStatus): Promise<void> {
  hydrate();
  let changed = false;
  const next = cache.map(c => {
    if (c.id !== conversationId || c.status === status) return c;
    changed = true;
    return { ...c, status };
  });
  if (changed) {
    cache = next;
    writeLocal(cache);
    emit();
    void remoteSetStatus(conversationId, status);
  }
}

/** Find or create the single open thread for a party + subject (used by entry points). */
export async function openOrStartConversation(input: StartConversationInput): Promise<Conversation> {
  hydrate();
  const existing = cache.find(
    c => c.party.kind === input.party.kind && c.party.id === input.party.id && c.subject === input.subject,
  );
  if (existing) {
    if (input.initialMessage) {
      await sendMessage({ conversationId: existing.id, ...input.initialMessage });
      return cache.find(c => c.id === existing.id) ?? existing;
    }
    return existing;
  }
  return startConversation(input);
}

// ── Selectors ──

export function selectForViewer(list: Conversation[], viewer: Viewer): Conversation[] {
  return sortByRecent(list.filter(c => isVisibleTo(c, viewer)));
}

export function totalUnread(list: Conversation[], viewer: Viewer): number {
  return list.filter(c => isVisibleTo(c, viewer)).reduce((sum, c) => sum + unreadFor(c, viewer), 0);
}

export function previewText(c: Conversation, viewer?: Viewer): string {
  const last = lastMessage(c);
  if (!last) return 'No messages yet';
  // "You:" when the last message is from the viewer's own side (defaults to staff).
  const mine = viewer ? last.role === viewer.role : last.role === 'staff';
  return `${mine ? 'You: ' : ''}${last.body}`;
}

// ── Supabase mirror (active only when configured; safe no-ops in demo) ──

async function remoteInsertMessage(m: ChatMessage): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('crm_messages').insert({
    id: m.id,
    conversation_id: m.conversationId,
    role: m.role,
    author_name: m.authorName,
    body: m.body,
    created_at: m.createdAt,
    read_by_staff: m.readByStaff,
    read_by_party: m.readByParty,
  });
  await supabase.from('crm_conversations').update({ updated_at: m.createdAt }).eq('id', m.conversationId);
}

async function remoteUpsertConversation(c: Conversation): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('crm_conversations').upsert({
    id: c.id,
    party_kind: c.party.kind,
    party_id: c.party.id,
    party_name: c.party.name,
    party_email: c.party.email,
    party_phone: c.party.phone,
    subject: c.subject,
    order_ref: c.orderRef,
    status: c.status,
    assigned_to: c.assignedTo,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  });
  for (const m of c.messages) await remoteInsertMessage(m);
}

async function remoteMarkRead(conversationId: string, perspective: 'staff' | 'party'): Promise<void> {
  if (!isSupabaseConfigured) return;
  const column = perspective === 'staff' ? 'read_by_staff' : 'read_by_party';
  const senderToClear = perspective === 'staff' ? 'staff' : null;
  let q = supabase.from('crm_messages').update({ [column]: true }).eq('conversation_id', conversationId);
  // Staff reads inbound (non-staff) messages; party reads staff messages.
  q = senderToClear ? q.neq('role', senderToClear) : q.eq('role', 'staff');
  await q;
}

async function remoteSetStatus(conversationId: string, status: ConversationStatus): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('crm_conversations').update({ status }).eq('id', conversationId);
}

/**
 * Subscribe to remote changes (configured mode only). Returns an unsubscribe
 * fn. In demo mode this is a no-op — the local event bus already keeps every
 * view in sync.
 */
export function subscribeRemote(onChange: () => void): () => void {
  if (!isSupabaseConfigured) return () => {};
  const channel = supabase
    .channel('crm-chat')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_conversations' }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Demo seed data ──

function seedConversations(): Conversation[] {
  const sarah: ChatParty = { kind: 'customer', ...DEMO_CUSTOMER, phone: '(555) 111-2222' };
  const david: ChatParty = { kind: 'customer', id: 'cust-david', name: 'David Kim', email: 'dkim@email.com' };
  const mike: ChatParty = { kind: 'contractor', ...DEMO_CONTRACTOR };

  const seed: Conversation[] = [
    {
      id: 'conv_seed_sarah',
      party: sarah,
      subject: 'Install appointment timing',
      orderRef: 'SS-010001',
      status: 'open',
      assignedTo: STAFF_NAME,
      createdAt: minutesAgo(180),
      updatedAt: minutesAgo(6),
      messages: [
        {
          id: 'msg_s1', conversationId: 'conv_seed_sarah', role: 'customer', authorName: 'Sarah Johnson',
          body: 'Hi! My install is booked for the 26th — is the 10am–12pm window still good?',
          createdAt: minutesAgo(180), readByStaff: true, readByParty: true,
        },
        {
          id: 'msg_s2', conversationId: 'conv_seed_sarah', role: 'staff', authorName: STAFF_NAME,
          body: 'Hi Sarah! Yes, you\'re all set for the 26th, 10am–12pm. Mike will text when he\'s en route.',
          createdAt: minutesAgo(170), readByStaff: true, readByParty: true,
        },
        {
          id: 'msg_s3', conversationId: 'conv_seed_sarah', role: 'customer', authorName: 'Sarah Johnson',
          body: 'Perfect. One more thing — could he start with the living room? Thanks!',
          createdAt: minutesAgo(6), readByStaff: false, readByParty: true,
        },
      ],
    },
    {
      id: 'conv_seed_mike',
      party: mike,
      subject: 'Gate code for the Johnson job',
      orderRef: 'SS-010001',
      status: 'open',
      assignedTo: STAFF_NAME,
      createdAt: minutesAgo(90),
      updatedAt: minutesAgo(40),
      messages: [
        {
          id: 'msg_m1', conversationId: 'conv_seed_mike', role: 'contractor', authorName: 'Mike Rodriguez',
          body: 'For SS-010001 tomorrow — is there parking on site or should I use the street?',
          createdAt: minutesAgo(90), readByStaff: true, readByParty: true,
        },
        {
          id: 'msg_m2', conversationId: 'conv_seed_mike', role: 'staff', authorName: STAFF_NAME,
          body: 'Driveway is fine. Gate code is 1234, and there\'s a friendly golden retriever. Ring the doorbell.',
          createdAt: minutesAgo(40), readByStaff: true, readByParty: false,
        },
      ],
    },
    {
      id: 'conv_seed_david',
      party: david,
      subject: 'Roller shade color match',
      orderRef: 'SS-010003',
      status: 'resolved',
      assignedTo: STAFF_NAME,
      createdAt: minutesAgo(1440),
      updatedAt: minutesAgo(1200),
      messages: [
        {
          id: 'msg_d1', conversationId: 'conv_seed_david', role: 'customer', authorName: 'David Kim',
          body: 'Will the kitchen rollers match the swatch I ordered (Fabric Group 1, Linen)?',
          createdAt: minutesAgo(1440), readByStaff: true, readByParty: true,
        },
        {
          id: 'msg_d2', conversationId: 'conv_seed_david', role: 'staff', authorName: STAFF_NAME,
          body: 'They will — same dye lot as your swatch. I\'ve noted it on the order so the shop double-checks.',
          createdAt: minutesAgo(1200), readByStaff: true, readByParty: true,
        },
      ],
    },
  ];
  return seed;
}

/** Test/maintenance helper — wipe local store and reseed. */
export function __resetForTests(seed = false) {
  cache = seed ? sortByRecent(seedConversations()) : [];
  hydrated = true;
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}
