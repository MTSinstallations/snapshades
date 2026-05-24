import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  User, Package, Clock, Settings, LogOut, ChevronRight, Eye, Truck, Calendar,
  Wrench, Camera, FileText, ShoppingCart, Star, Shield, Download, Image,
  Home, CreditCard, MessageSquare, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type Tab = 'dashboard' | 'orders' | 'projects' | 'photos' | 'documents' | 'settings';

interface Order {
  id: string; order_number: string; created_at: string; status: string;
  payment_status: string; grand_total: number; install_total: number;
  tracking_number: string | null; estimated_delivery: string | null;
  shipping_address: Record<string, string> | null;
}

interface Project {
  id: string; name: string; created_at: string; status: string;
  service_tier: string | null; measurement_mode: string | null;
  window_count?: number;
}

interface Photo {
  id: string; storage_path: string; photo_type: string;
  created_at: string; window_name?: string; room_name?: string;
}

interface CustomerProfile {
  full_name: string; email: string; phone: string;
  address_line1: string; address_line2: string;
  city: string; state: string; zip: string;
}

const STATUS_STYLES: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: Package },
  manufacturing: { label: 'Manufacturing', color: 'bg-indigo-100 text-indigo-700', icon: Wrench },
  shipped: { label: 'Shipped', color: 'bg-green-100 text-green-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-teal-100 text-teal-700', icon: Home },
  installing: { label: 'Installing', color: 'bg-purple-100 text-purple-700', icon: Wrench },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: Star },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: Package },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Clock },
  cart: { label: 'In Cart', color: 'bg-blue-100 text-blue-600', icon: ShoppingCart },
  measuring: { label: 'Measuring', color: 'bg-yellow-100 text-yellow-700', icon: Camera },
  ordered: { label: 'Ordered', color: 'bg-green-100 text-green-700', icon: Package },
};

export default function CustomerPortal() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [profile, setProfile] = useState<CustomerProfile>({
    full_name: '', email: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', zip: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      // Profile
      const { data: cust } = await supabase.from('customers').select('*').eq('id', user.id).single();
      if (cancelled) return;
      if (cust) {
        setProfile({
          full_name: cust.full_name || '', email: cust.email || user.email || '',
          phone: cust.phone || '', address_line1: cust.address_line1 || '',
          address_line2: cust.address_line2 || '', city: cust.city || '',
          state: cust.state || '', zip: cust.zip || '',
        });
      } else {
        setProfile(p => ({ ...p, email: user.email || '' }));
      }
      // Orders
      const { data: ord } = await supabase.from('orders')
        .select('id, order_number, created_at, status, payment_status, grand_total, install_total, tracking_number, estimated_delivery, shipping_address')
        .eq('customer_id', user.id).order('created_at', { ascending: false });
      if (ord) setOrders(ord);
      // Projects
      const { data: proj } = await supabase.from('projects')
        .select('id, name, created_at, status, service_tier, measurement_mode')
        .eq('customer_id', user.id).order('updated_at', { ascending: false });
      if (proj) setProjects(proj);
      // Photos
      const { data: photoData } = await supabase.from('window_photos')
        .select('id, storage_path, photo_type, created_at, windows(name, rooms(name))')
        .in('window_id', (await supabase.from('windows').select('id').in('project_id', proj?.map(p => p.id) || [])).data?.map(w => w.id) || [])
        .order('created_at', { ascending: false }).limit(50);
      if (photoData) setPhotos(photoData.map(p => ({
        id: p.id, storage_path: p.storage_path, photo_type: p.photo_type,
        created_at: p.created_at,
        window_name: ((p.windows as unknown) as Record<string, unknown> | null)?.name as string || '',
        room_name: (((p.windows as unknown) as Record<string, unknown> | null)?.rooms as Record<string, unknown> | null)?.name as string || '',
      })));
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('customers').upsert({ id: user.id, ...profile });
    setSaving(false);
    toast(error ? { title: 'Error', description: error.message, variant: 'destructive' } : { title: 'Saved!' });
  };

  if (authLoading || !user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const activeOrders = orders.filter(o => !['completed', 'cancelled', 'refunded'].includes(o.status));
  const totalSpent = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.grand_total), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" onClick={() => navigate('/cart')}>
              <ShoppingCart className="w-3 h-3" /> Cart
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" onClick={() => navigate('/help')}>
              <MessageSquare className="w-3 h-3" /> Help
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || 'My Account'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => navigate('/start')}>
            + New Project
          </Button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'dashboard' as const, label: 'Dashboard', icon: Home },
            { key: 'orders' as const, label: 'Orders', icon: Package },
            { key: 'projects' as const, label: 'Projects', icon: Camera },
            { key: 'photos' as const, label: 'Photos', icon: Image },
            { key: 'documents' as const, label: 'Documents', icon: FileText },
            { key: 'settings' as const, label: 'Settings', icon: Settings },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.key === 'orders' && activeOrders.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeOrders.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card><CardContent className="p-4 text-center">
                <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">{activeOrders.length}</div>
                <div className="text-xs text-gray-500">Active Orders</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <Camera className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-xs text-gray-500">Projects</div>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold">${totalSpent.toFixed(0)}</div>
                <div className="text-xs text-gray-500">Total Spent</div>
              </CardContent></Card>
            </div>

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" /> Active Orders
                  </h3>
                  <div className="space-y-3">
                    {activeOrders.map(o => {
                      const s = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
                      const StatusIcon = s.icon;
                      return (
                        <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-mono font-medium text-sm">{o.order_number}</div>
                              <div className="text-xs text-gray-500">{s.label}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${Number(o.grand_total).toFixed(2)}</div>
                            {o.tracking_number && <div className="text-xs text-blue-600">{o.tracking_number}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Draft Projects (abandoned carts) */}
            {projects.filter(p => ['cart', 'draft', 'measuring'].includes(p.status)).length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-600" /> Continue Where You Left Off
                  </h3>
                  {projects.filter(p => ['cart', 'draft', 'measuring'].includes(p.status)).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl mb-2">
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.service_tier && `${p.service_tier} tier`} • Started {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button size="sm" className="bg-orange-600 text-white rounded-full" onClick={() => navigate('/cart')}>
                        Continue
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'New Project', icon: Camera, action: () => navigate('/start'), color: 'bg-blue-50 text-blue-600' },
                { label: 'Browse Products', icon: Package, action: () => navigate('/products'), color: 'bg-purple-50 text-purple-600' },
                { label: 'Get Help', icon: MessageSquare, action: () => navigate('/help'), color: 'bg-green-50 text-green-600' },
                { label: 'File a Claim', icon: Shield, action: () => navigate('/claims'), color: 'bg-red-50 text-red-600' },
              ].map(a => (
                <Card key={a.label} className="cursor-pointer hover:shadow-md transition-all" onClick={a.action}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${a.color}`}>
                      <a.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{a.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">No orders yet</h2>
                <Button className="mt-4 bg-blue-600 text-white rounded-full" onClick={() => navigate('/start')}>Start Your First Project</Button>
              </div>
            ) : orders.map(o => {
              const s = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
              const StatusIcon = s.icon;
              return (
                <Card key={o.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{o.order_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Ordered {new Date(o.created_at).toLocaleDateString()}
                            {o.estimated_delivery && ` • Est. delivery: ${o.estimated_delivery}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">${Number(o.grand_total).toFixed(2)}</div>
                    </div>
                    {o.tracking_number && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                        <Truck className="w-4 h-4" /> Tracking: {o.tracking_number}
                      </div>
                    )}
                    {Number(o.install_total) > 0 && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-purple-600">
                        <Calendar className="w-3.5 h-3.5" /> Includes professional installation
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === 'projects' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-900">Your Projects</h2>
              <Button size="sm" className="bg-blue-600 text-white rounded-full" onClick={() => navigate('/start')}>+ New Project</Button>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">No projects yet</h2>
                <Button className="mt-4 bg-blue-600 text-white rounded-full" onClick={() => navigate('/start')}>Start Measuring</Button>
              </div>
            ) : projects.map(p => {
              const s = STATUS_STYLES[p.status] || STATUS_STYLES.draft;
              return (
                <Card key={p.id} className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{p.name}</h3>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.service_tier && `${p.service_tier} • `}
                        {p.measurement_mode && `${p.measurement_mode} • `}
                        Created {new Date(p.created_at).toLocaleDateString()}
                      </div>
                      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── PHOTOS ── */}
        {tab === 'photos' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Window Photos</h2>
            {photos.length === 0 ? (
              <div className="text-center py-16">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">No photos yet</h2>
                <p className="text-sm text-gray-500 mt-1">Photos taken during measurement will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map(p => (
                  <Card key={p.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                    <CardContent className="p-3">
                      <div className="text-xs font-medium text-gray-900">{p.room_name} — {p.window_name}</div>
                      <div className="text-[10px] text-gray-400">{p.photo_type} • {new Date(p.created_at).toLocaleDateString()}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === 'documents' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Documents & Receipts</h2>
            <div className="space-y-3">
              {orders.map(o => (
                <Card key={o.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">Order Receipt — {o.order_number}</div>
                        <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()} • ${Number(o.grand_total).toFixed(2)}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs">
                      <Download className="w-3 h-3" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No documents yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-500 block mb-1">Full Name</label>
                    <input type="text" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
                  <div><label className="text-sm text-gray-500 block mb-1">Email</label>
                    <input type="email" value={profile.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400" /></div>
                  <div><label className="text-sm text-gray-500 block mb-1">Phone</label>
                    <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-medium text-gray-900 mb-3">Default Shipping Address</h3>
                <div className="space-y-3">
                  <input type="text" value={profile.address_line1} onChange={e => setProfile(p => ({ ...p, address_line1: e.target.value }))} placeholder="Address" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                  <input type="text" value={profile.address_line2} onChange={e => setProfile(p => ({ ...p, address_line2: e.target.value }))} placeholder="Apt, suite, etc." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="City" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                    <input type="text" value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} placeholder="State" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                    <input type="text" value={profile.zip} onChange={e => setProfile(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button onClick={saveProfile} disabled={saving} className="bg-blue-600 text-white rounded-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" className="rounded-full text-red-500 hover:bg-red-50" onClick={async () => { await signOut(); navigate('/'); }}>
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
