import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { Camera, Send, Plus, Search, MapPin, Star, Check, X, ChevronRight, User, Mail, Phone, Calendar, DollarSign, Shield, Clock, Eye, Trash2, Edit, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ContractorType } from '@/lib/contractor-engine';

/**
 * Admin Panel — Contractor Management
 * 
 * PLUG AND PLAY: Enter an email → contractor gets invite → they onboard themselves.
 * 
 * Features:
 * - Invite contractors by email (one-click)
 * - View all contractors with status
 * - Territory coverage map
 * - Performance dashboards
 */

// Demo contractors
const DEMO_CONTRACTORS = [
  { id: 'c-001', name: 'Mike Rodriguez', email: 'mike@proinstalls.com', phone: '(555) 234-5678', type: 'full_service' as ContractorType, status: 'active', territory: '90210 + 25mi', rating: 4.9, jobs: 247, earnings: 42350, lastActive: '2 hours ago', specialties: ['blinds', 'shades', 'shutters'] },
  { id: 'c-002', name: 'Sarah Kim', email: 'sarah@windowpros.com', phone: '(555) 345-6789', type: 'installer' as ContractorType, status: 'active', territory: '90210 + 20mi', rating: 4.8, jobs: 183, earnings: 31500, lastActive: '5 hours ago', specialties: ['blinds', 'shades'] },
  { id: 'c-003', name: 'David Chen', email: 'david@elitewindows.com', phone: '(555) 456-7890', type: 'installer' as ContractorType, status: 'active', territory: '90210 + 30mi', rating: 4.7, jobs: 312, earnings: 55200, lastActive: '1 day ago', specialties: ['shutters', 'motorized'] },
  { id: 'd-001', name: 'Jessica Park', email: 'jessica@designstudio.com', phone: '(555) 567-8901', type: 'designer' as ContractorType, status: 'active', territory: '90210 + 25mi', rating: 5.0, jobs: 89, earnings: 18750, lastActive: '3 hours ago', specialties: ['design'] },
  { id: 'c-004', name: 'Tom Wilson', email: 'tom@blindspro.com', phone: '(555) 789-0123', type: 'installer' as ContractorType, status: 'pending_review', territory: '90401 + 15mi', rating: 0, jobs: 0, earnings: 0, lastActive: 'Never', specialties: ['blinds'] },
  { id: 'c-005', name: 'Ana Gutierrez', email: 'ana@windowcraft.com', phone: '', type: 'full_service' as ContractorType, status: 'invited', territory: '91001 + 25mi', rating: 0, jobs: 0, earnings: 0, lastActive: 'Never', specialties: [] },
];

const PENDING_INVITES = [
  { email: 'john@handymanservices.com', name: 'John Brooks', sentAt: '2026-03-22', status: 'sent' },
  { email: 'lisa@moderninstalls.com', name: 'Lisa Tran', sentAt: '2026-03-23', status: 'sent' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
  invited: { label: 'Invited', color: 'bg-blue-100 text-blue-700' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
  onboarding: { label: 'Onboarding', color: 'bg-purple-100 text-purple-700' },
};

export default function AdminContractors() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteType, setInviteType] = useState<ContractorType>('installer');
  const [inviteZips, setInviteZips] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const filtered = DEMO_CONTRACTORS.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const handleSendInvite = () => {
    // In production: createInvite() → send email via Supabase edge function
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteName('');
      setInvitePhone('');
      setInviteMessage('');
    }, 2000);
  };

  const activeCount = DEMO_CONTRACTORS.filter(c => c.status === 'active').length;
  const pendingCount = DEMO_CONTRACTORS.filter(c => c.status === 'pending_review').length;
  const totalEarnings = DEMO_CONTRACTORS.reduce((sum, c) => sum + c.earnings, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <SnapShadesLogo size={28} />
              <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
            </a>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contractor Management</h1>
            <p className="text-sm text-gray-500">Invite, manage, and monitor your installer network.</p>
          </div>
          <Button className="bg-blue-600 text-white rounded-full gap-2" onClick={() => setShowInviteForm(true)}>
            <Plus className="w-4 h-4" /> Invite Contractor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{activeCount}</div><div className="text-xs text-gray-500">Active</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{pendingCount}</div><div className="text-xs text-gray-500">Pending Review</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{PENDING_INVITES.length}</div><div className="text-xs text-gray-500">Open Invites</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">${(totalEarnings / 1000).toFixed(0)}K</div><div className="text-xs text-gray-500">Total Paid Out</div></CardContent></Card>
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !inviteSent && setShowInviteForm(false)}>
            <Card className="max-w-md w-full" onClick={e => e.stopPropagation()}>
              <CardContent className="p-6">
                {inviteSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Invite Sent!</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {inviteName || inviteEmail} will receive an email with a signup link.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900">Invite a Contractor</h2>
                      <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Enter their email and we'll send a signup link. They handle the rest.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          placeholder="contractor@email.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Name (optional)</label>
                          <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Phone (optional)</label>
                          <input type="tel" value={invitePhone} onChange={e => setInvitePhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                        <div className="flex gap-2">
                          {[
                            { value: 'installer' as ContractorType, label: '🔧 Installer' },
                            { value: 'measurer' as ContractorType, label: '📏 Measurer' },
                            { value: 'designer' as ContractorType, label: '🎨 Designer' },
                            { value: 'full_service' as ContractorType, label: '⭐ Full Service' },
                          ].map(t => (
                            <button
                              key={t.value}
                              onClick={() => setInviteType(t.value)}
                              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                                inviteType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Territory ZIP codes</label>
                        <input type="text" value={inviteZips} onChange={e => setInviteZips(e.target.value)} placeholder="90210, 90211, 90212" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Personal Message (optional)</label>
                        <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} placeholder="Hey, we'd love to have you on the team..." rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm resize-none" />
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4 bg-blue-600 text-white rounded-full py-5 text-lg font-semibold gap-2"
                      disabled={!inviteEmail}
                      onClick={handleSendInvite}
                    >
                      <Send className="w-5 h-5" /> Send Invite
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contractors..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
            />
          </div>
          <div className="flex gap-1">
            {['active', 'pending_review', 'invited', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === status ? STATUS_CONFIG[status].color + ' ring-2 ring-blue-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Contractor list */}
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[c.status]?.color || 'bg-gray-100'}`}>
                        {STATUS_CONFIG[c.status]?.label}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {c.type === 'full_service' ? '⭐ Full Service' : c.type === 'designer' ? '🎨 Designer' : c.type === 'measurer' ? '📏 Measurer' : '🔧 Installer'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.territory}</span>
                    </div>
                    {c.specialties.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {c.specialties.map(s => (
                          <span key={s} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    {c.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm justify-end">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-900">{c.rating}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">{c.jobs} jobs</div>
                    {c.earnings > 0 && <div className="text-xs text-green-600 font-medium">${c.earnings.toLocaleString()}</div>}
                    <div className="text-[10px] text-gray-400 mt-1">Active: {c.lastActive}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending invites */}
        {PENDING_INVITES.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-3">Pending Invites</h3>
            <div className="space-y-2">
              {PENDING_INVITES.map(inv => (
                <div key={inv.email} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-900 text-sm">{inv.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{inv.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Sent {inv.sentAt}</span>
                    <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                      <Send className="w-3 h-3" /> Resend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
