import {
  __resetForTests,
  getSnapshot,
  selectForViewer,
  startConversation,
  sendMessage,
  markRead,
  setStatus,
  openOrStartConversation,
  staffUnread,
  partyUnread,
  totalUnread,
  unreadFor,
  isVisibleTo,
  previewText,
  type Viewer,
  type Conversation,
} from './crm-chat';

const STAFF: Viewer = { role: 'staff', name: 'Support' };
const SARAH: Viewer = { role: 'customer', id: 'cust-sarah', name: 'Sarah Johnson' };
const MIKE: Viewer = { role: 'contractor', id: 'c-001', name: 'Mike Rodriguez' };

const find = (id: string) => getSnapshot().find(c => c.id === id) as Conversation;

describe('crm-chat engine', () => {
  describe('seed + viewer scoping', () => {
    beforeEach(() => __resetForTests(true));

    it('seeds demo conversations', () => {
      expect(getSnapshot().length).toBeGreaterThanOrEqual(3);
    });

    it('staff sees every conversation', () => {
      expect(selectForViewer(getSnapshot(), STAFF).length).toBe(getSnapshot().length);
    });

    it('a customer sees only their own threads', () => {
      const mine = selectForViewer(getSnapshot(), SARAH);
      expect(mine.length).toBeGreaterThan(0);
      expect(mine.every(c => c.party.kind === 'customer' && c.party.id === 'cust-sarah')).toBe(true);
    });

    it('a contractor sees only their own threads', () => {
      const mine = selectForViewer(getSnapshot(), MIKE);
      expect(mine.length).toBeGreaterThan(0);
      expect(mine.every(c => c.party.kind === 'contractor' && c.party.id === 'c-001')).toBe(true);
    });

    it('a customer cannot see a contractor thread and vice versa', () => {
      const mikeThread = getSnapshot().find(c => c.party.kind === 'contractor')!;
      expect(isVisibleTo(mikeThread, SARAH)).toBe(false);
      expect(isVisibleTo(mikeThread, STAFF)).toBe(true);
    });
  });

  describe('unread derivation', () => {
    beforeEach(() => __resetForTests(true));

    it('counts inbound (non-staff) messages as unread for staff', () => {
      const sarah = find('conv_seed_sarah');
      // Seed leaves Sarah's last (customer) message unread for staff.
      expect(staffUnread(sarah)).toBe(1);
      expect(unreadFor(sarah, STAFF)).toBe(1);
    });

    it('counts staff messages as unread for the party', () => {
      const mike = find('conv_seed_mike');
      // Seed leaves the staff reply unread for the contractor.
      expect(partyUnread(mike)).toBe(1);
      expect(unreadFor(mike, MIKE)).toBe(1);
    });

    it('totals unread across a viewer’s threads', () => {
      expect(totalUnread(getSnapshot(), STAFF)).toBe(1);
      expect(totalUnread(getSnapshot(), MIKE)).toBe(1);
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => __resetForTests(true));

    it('appends a message and bumps recency', async () => {
      const before = find('conv_seed_david');
      const beforeLen = before.messages.length;
      await sendMessage({ conversationId: 'conv_seed_david', role: 'staff', authorName: 'Support', body: 'Following up!' });
      const after = find('conv_seed_david');
      expect(after.messages.length).toBe(beforeLen + 1);
      expect(after.messages.at(-1)!.body).toBe('Following up!');
      expect(after.updatedAt >= before.updatedAt).toBe(true);
    });

    it('marks the sender side read, the other side unread', async () => {
      await sendMessage({ conversationId: 'conv_seed_david', role: 'staff', authorName: 'Support', body: 'Hi' });
      const msg = find('conv_seed_david').messages.at(-1)!;
      expect(msg.readByStaff).toBe(true);
      expect(msg.readByParty).toBe(false);
    });

    it('ignores empty/whitespace bodies', async () => {
      const res = await sendMessage({ conversationId: 'conv_seed_david', role: 'staff', authorName: 'Support', body: '   ' });
      expect(res).toBeNull();
    });

    it('reopens a resolved thread on an inbound message', async () => {
      expect(find('conv_seed_david').status).toBe('resolved');
      await sendMessage({ conversationId: 'conv_seed_david', role: 'customer', authorName: 'David Kim', body: 'Actually one more thing…' });
      expect(find('conv_seed_david').status).toBe('open');
    });

    it('does NOT reopen when staff replies to a resolved thread', async () => {
      await sendMessage({ conversationId: 'conv_seed_david', role: 'staff', authorName: 'Support', body: 'Closing note' });
      expect(find('conv_seed_david').status).toBe('resolved');
    });
  });

  describe('markRead', () => {
    beforeEach(() => __resetForTests(true));

    it('clears staff unread', async () => {
      expect(staffUnread(find('conv_seed_sarah'))).toBe(1);
      await markRead('conv_seed_sarah', 'staff');
      expect(staffUnread(find('conv_seed_sarah'))).toBe(0);
    });

    it('clears party unread without touching the staff side', async () => {
      await markRead('conv_seed_mike', 'party');
      expect(partyUnread(find('conv_seed_mike'))).toBe(0);
      // A subsequent staff message is still unread for the party.
      await sendMessage({ conversationId: 'conv_seed_mike', role: 'staff', authorName: 'Support', body: 'ping' });
      expect(partyUnread(find('conv_seed_mike'))).toBe(1);
    });
  });

  describe('status + start + openOrStart', () => {
    beforeEach(() => __resetForTests(false));

    it('starts a conversation visible to its party', async () => {
      const conv = await startConversation({
        party: { kind: 'customer', id: 'cust-sarah', name: 'Sarah Johnson' },
        subject: 'Order question',
        initialMessage: { role: 'customer', authorName: 'Sarah Johnson', body: 'Hello!' },
      });
      expect(selectForViewer(getSnapshot(), SARAH).some(c => c.id === conv.id)).toBe(true);
      expect(unreadFor(find(conv.id), STAFF)).toBe(1);
    });

    it('setStatus updates the thread', async () => {
      const conv = await startConversation({ party: { kind: 'customer', id: 'x', name: 'X' }, subject: 'S' });
      await setStatus(conv.id, 'resolved');
      expect(find(conv.id).status).toBe('resolved');
    });

    it('openOrStart reuses an existing thread for the same party + subject', async () => {
      const a = await openOrStartConversation({ party: { kind: 'customer', id: 'cust-sarah', name: 'Sarah Johnson' }, subject: 'Repeat' });
      const b = await openOrStartConversation({
        party: { kind: 'customer', id: 'cust-sarah', name: 'Sarah Johnson' },
        subject: 'Repeat',
        initialMessage: { role: 'customer', authorName: 'Sarah Johnson', body: 'again' },
      });
      expect(b.id).toBe(a.id);
      expect(find(a.id).messages.length).toBe(1);
    });
  });

  describe('previewText', () => {
    beforeEach(() => __resetForTests(true));
    it('prefixes "You:" from the staff perspective when staff sent last', () => {
      // conv_seed_mike: last message is from staff.
      expect(previewText(find('conv_seed_mike'), STAFF)).toMatch(/^You: /);
      expect(previewText(find('conv_seed_mike'))).toMatch(/^You: /); // defaults to staff
    });
    it('does NOT say "You:" to the contractor when staff sent last', () => {
      // Same thread, contractor's perspective — the staff message isn't theirs.
      expect(previewText(find('conv_seed_mike'), MIKE)).not.toMatch(/^You: /);
    });
    it('says "You:" to the customer when the customer sent last', () => {
      // conv_seed_sarah: last message is from the customer.
      expect(previewText(find('conv_seed_sarah'), SARAH)).toMatch(/^You: /);
      expect(previewText(find('conv_seed_sarah'), STAFF)).not.toMatch(/^You: /);
    });
  });
});
