/**
 * useCrmChat — React binding for the CRM chat store (lib/crm-chat.ts).
 *
 * Subscribes to the local event bus (live across tabs/components) and, when a
 * Supabase backend is configured, to its realtime channel. Everything is
 * scoped to a `viewer`: staff see every thread; a customer or contractor sees
 * only their own.
 */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  subscribe,
  subscribeRemote,
  getSnapshot,
  selectForViewer,
  totalUnread,
  unreadFor,
  markRead,
  sendMessage as sendMessageRaw,
  setStatus as setStatusRaw,
  startConversation as startConversationRaw,
  openOrStartConversation as openOrStartRaw,
  type Viewer,
  type Conversation,
  type ChatRole,
  type StartConversationInput,
} from '@/lib/crm-chat';
import type { ConversationStatus } from '@/lib/types';

export function useCrmChat(viewer: Viewer) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Re-fetch when the remote channel reports a change (configured mode only).
  useEffect(() => subscribeRemote(() => { /* getSnapshot already reflects local cache */ }), []);

  const conversations = useMemo(() => selectForViewer(all, viewer), [all, viewer]);
  const unreadTotal = useMemo(() => totalUnread(all, viewer), [all, viewer]);

  const perspective: 'staff' | 'party' = viewer.role === 'staff' ? 'staff' : 'party';
  const myRole: ChatRole = viewer.role;
  const myName =
    viewer.role === 'staff'
      ? viewer.name ?? 'SnapShades Support'
      : viewer.name ?? (viewer.role === 'customer' ? 'Customer' : 'Contractor');

  const send = useCallback(
    (conversationId: string, body: string) =>
      sendMessageRaw({ conversationId, role: myRole, authorName: myName, body }),
    [myRole, myName],
  );

  const open = useCallback(
    (conversationId: string) => markRead(conversationId, perspective),
    [perspective],
  );

  const changeStatus = useCallback(
    (conversationId: string, status: ConversationStatus) => setStatusRaw(conversationId, status),
    [],
  );

  const start = useCallback(
    (input: StartConversationInput) => startConversationRaw(input),
    [],
  );

  const openOrStart = useCallback(
    (input: StartConversationInput) => openOrStartRaw(input),
    [],
  );

  const unread = useCallback((c: Conversation) => unreadFor(c, viewer), [viewer]);

  return {
    conversations,
    unreadTotal,
    myRole,
    myName,
    send,
    markRead: open,
    changeStatus,
    startConversation: start,
    openOrStartConversation: openOrStart,
    unread,
  };
}
