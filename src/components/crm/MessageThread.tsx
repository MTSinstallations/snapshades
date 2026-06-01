/**
 * MessageThread — the message list + composer for a single conversation.
 * Shared by the Admin inbox and the Customer/Contractor portal message views.
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, RotateCcw, Package, User, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Conversation, Viewer } from '@/lib/crm-chat';
import type { ConversationStatus } from '@/lib/types';

const STATUS_BADGE: Record<ConversationStatus, string> = {
  open: 'bg-green-100 text-green-700',
  snoozed: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-gray-100 text-gray-500',
};

function formatTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function MessageThread({
  conversation,
  viewer,
  onSend,
  onMarkRead,
  onChangeStatus,
  onBack,
}: {
  conversation: Conversation;
  viewer: Viewer;
  onSend: (conversationId: string, body: string) => void | Promise<unknown>;
  onMarkRead: (conversationId: string) => void | Promise<unknown>;
  onChangeStatus?: (conversationId: string, status: ConversationStatus) => void | Promise<unknown>;
  onBack?: () => void;
}) {
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const isStaff = viewer.role === 'staff';
  const PartyIcon = conversation.party.kind === 'contractor' ? Wrench : User;

  // Mark inbound messages read whenever this thread is shown or grows.
  useEffect(() => {
    onMarkRead(conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, conversation.messages.length]);

  // Keep the latest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [conversation.id, conversation.messages.length]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    onSend(conversation.id, body);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials(conversation.party.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate">{conversation.subject}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[conversation.status]}`}>
              {conversation.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <PartyIcon className="w-3 h-3" />
            <span className="truncate">{conversation.party.name}</span>
            {conversation.orderRef && (
              <>
                <span className="text-gray-300">•</span>
                <Package className="w-3 h-3" />
                <span className="font-mono">{conversation.orderRef}</span>
              </>
            )}
          </div>
        </div>
        {isStaff && onChangeStatus && (
          conversation.status === 'resolved' ? (
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1" onClick={() => onChangeStatus(conversation.id, 'open')}>
              <RotateCcw className="w-3 h-3" /> Reopen
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1" onClick={() => onChangeStatus(conversation.id, 'resolved')}>
              <CheckCircle2 className="w-3 h-3" /> Resolve
            </Button>
          )
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet — say hello 👋</p>
        )}
        {conversation.messages.map(m => {
          const mine = m.role === viewer.role;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {m.body}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {mine ? '' : `${m.authorName} • `}{formatTime(m.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Type a message…  (Enter to send, Shift+Enter for newline)"
            className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
          />
          <Button
            onClick={submit}
            disabled={!draft.trim()}
            className="bg-blue-600 text-white rounded-full h-10 w-10 p-0 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
