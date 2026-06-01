/**
 * CrmInbox — a self-contained two-pane messaging surface (conversation list +
 * active thread). Scoped by `viewer`, so the very same component powers the
 * staff inbox (Admin) and the customer/contractor portal message views.
 */

import { useEffect, useMemo, useState } from 'react';
import { Search, MessageSquare, Plus, User, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCrmChat } from '@/hooks/useCrmChat';
import { previewText, type Conversation, type Viewer, type PartyKind } from '@/lib/crm-chat';
import type { ConversationStatus } from '@/lib/types';
import MessageThread from './MessageThread';

function timeShort(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 1440) return `${Math.round(diffMin / 60)}h`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ConversationRow({
  c, active, unread, viewer, onClick,
}: { c: Conversation; active: boolean; unread: number; viewer: Viewer; onClick: () => void }) {
  const Icon = c.party.kind === 'contractor' ? Wrench : User;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
        active ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className={`truncate text-sm ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
            {c.party.name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-400">{timeShort(c.updatedAt)}</span>
          {unread > 0 && (
            <span className="bg-blue-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      </div>
      <div className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-700' : 'text-gray-500'}`}>{c.subject}</div>
      <div className="text-[11px] text-gray-400 truncate mt-0.5">{previewText(c, viewer)}</div>
    </button>
  );
}

function NewConversation({
  viewer, onClose, onCreated,
}: {
  viewer: Viewer;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const chat = useCrmChat(viewer);
  const isStaff = viewer.role === 'staff';
  const [kind, setKind] = useState<PartyKind>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const submit = async () => {
    if (!subject.trim() || !body.trim()) return;
    const party =
      viewer.role === 'customer'
        ? { kind: 'customer' as const, id: viewer.id, name: viewer.name ?? 'Customer', email: viewer.email }
        : viewer.role === 'contractor'
          ? { kind: 'contractor' as const, id: viewer.id, name: viewer.name ?? 'Contractor' }
          : { kind, id: `${kind}-${(email || name).toLowerCase().replace(/\s+/g, '-') || 'new'}`, name: name || 'New contact', email };
    const conv = await chat.startConversation({
      party,
      subject,
      assignedTo: isStaff ? chat.myName : undefined,
      initialMessage: { role: chat.myRole, authorName: chat.myName, body },
    });
    onCreated(conv.id);
  };

  return (
    <div className="absolute inset-0 z-10 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">New message</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isStaff && (
          <>
            <div className="flex gap-2">
              {(['customer', 'contractor'] as const).map(k => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`flex-1 px-3 py-2 rounded-xl border-2 text-sm capitalize ${
                    kind === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Recipient name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
          </>
        )}
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Write your message…" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm resize-none" />
      </div>
      <div className="border-t border-gray-100 p-3 flex justify-end gap-2">
        <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
        <Button className="bg-blue-600 text-white rounded-full" disabled={!subject.trim() || !body.trim()} onClick={submit}>Start conversation</Button>
      </div>
    </div>
  );
}

export default function CrmInbox({
  viewer,
  heightClass = 'h-[72vh]',
}: {
  viewer: Viewer;
  heightClass?: string;
}) {
  const chat = useCrmChat(viewer);
  const isStaff = viewer.role === 'staff';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationStatus>('all');
  const [composing, setComposing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chat.conversations.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.party.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.orderRef ?? '').toLowerCase().includes(q) ||
        c.messages.some(m => m.body.toLowerCase().includes(q))
      );
    });
  }, [chat.conversations, query, statusFilter]);

  // Keep a valid selection: clear it if the selected thread filtered out.
  useEffect(() => {
    if (selectedId && !filtered.some(c => c.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  const selected = chat.conversations.find(c => c.id === selectedId) ?? null;

  return (
    <div className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden grid md:grid-cols-[320px_1fr] ${heightClass}`}>
      {/* List pane */}
      <div className={`flex-col border-r border-gray-100 min-h-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              {isStaff ? 'Inbox' : 'Messages'}
              {chat.unreadTotal > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{chat.unreadTotal}</span>
              )}
            </h3>
            <Button size="sm" className="bg-blue-600 text-white rounded-full h-7 gap-1 text-xs px-3" onClick={() => setComposing(true)}>
              <Plus className="w-3 h-3" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search messages"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
            />
          </div>
          {isStaff && (
            <div className="flex gap-1">
              {(['all', 'open', 'resolved'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 text-xs py-1.5 rounded-lg capitalize transition-colors ${
                    statusFilter === s ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-10 px-4">
              {query || statusFilter !== 'all' ? 'No conversations match.' : 'No conversations yet.'}
            </div>
          ) : (
            filtered.map(c => (
              <ConversationRow
                key={c.id}
                c={c}
                active={c.id === selectedId}
                unread={chat.unread(c)}
                viewer={viewer}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Thread pane */}
      <div className={`min-h-0 ${selectedId ? 'flex' : 'hidden md:flex'} flex-col`}>
        {selected ? (
          <MessageThread
            conversation={selected}
            viewer={viewer}
            onSend={chat.send}
            onMarkRead={chat.markRead}
            onChangeStatus={isStaff ? chat.changeStatus : undefined}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
            <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm">Select a conversation to read and reply.</p>
          </div>
        )}
      </div>

      {composing && (
        <NewConversation
          viewer={viewer}
          onClose={() => setComposing(false)}
          onCreated={id => { setComposing(false); setSelectedId(id); }}
        />
      )}
    </div>
  );
}
