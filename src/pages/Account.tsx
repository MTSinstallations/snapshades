import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Package, Clock, Settings, LogOut, ChevronRight, Eye, Truck, Calendar, Wrench, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type Tab = 'orders' | 'projects' | 'settings';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  grand_total: number;
  install_total: number;
  tracking_number: string | null;
  estimated_delivery: string | null;
}

interface Project {
  id: string;
  name: string;
  created_at: string;
  status: string;
  service_tier: string | null;
}

interface CustomerProfile {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
}

const statusStyles: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  manufacturing: { label: 'Manufacturing', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', color: 'bg-green-100 text-green-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  installing: { label: 'Installing', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<CustomerProfile>({
    full_name: '', email: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', zip: '',
  });
  const [saving, setSaving] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Load data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load profile
      const { data: cust } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .single();
      if (cust) {
        setProfile({
          full_name: cust.full_name || '',
          email: cust.email || user.email || '',
          phone: cust.phone || '',
          address_line1: cust.address_line1 || '',
          address_line2: cust.address_line2 || '',
          city: cust.city || '',
          state: cust.state || '',
          zip: cust.zip || '',
        });
      } else {
        setProfile(p => ({ ...p, email: user.email || '' }));
      }

      // Load orders
      const { data: ord } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, payment_status, grand_total, install_total, tracking_number, estimated_delivery')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (ord) setOrders(ord);

      // Load projects
      const { data: proj } = await supabase
        .from('projects')
        .select('id, name, created_at, status, service_tier')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (proj) setProjects(proj);
    };

    loadData();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('customers').upsert({
      id: user.id,
      ...profile,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Profile updated.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/products" className="text-sm text-gray-600 hover:text-blue-600">Products</a>
            <Button variant="outline" className="rounded-full gap-2 text-sm">
              <User className="w-4 h-4" /> Account
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || 'My Account'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-1">
              {[
                { key: 'orders' as const, icon: Package, label: 'Orders' },
                { key: 'projects' as const, icon: Clock, label: 'Projects' },
                { key: 'settings' as const, icon: Settings, label: 'Settings' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    tab === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {tab === 'orders' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Button className="mt-4 bg-blue-600 text-white rounded-full" onClick={() => navigate('/start')}>
                      Start Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const style = statusStyles[order.status] || statusStyles.pending;
                      return (
                        <Card key={order.id} className="hover:shadow-md transition-all">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-gray-900">{order.order_number}</span>
                                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.color}`}>
                                    {style.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Ordered {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">${Number(order.grand_total).toFixed(2)}</div>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                              {order.status === 'shipped' && order.tracking_number && (
                                <div className="flex items-center gap-1.5 text-xs text-green-600">
                                  <Truck className="w-3.5 h-3.5" /> {order.tracking_number}
                                </div>
                              )}
                              {order.install_total > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-purple-600">
                                  <Calendar className="w-3.5 h-3.5" /> Includes installation
                                </div>
                              )}
                            </div>

                            <Button variant="outline" size="sm" className="mt-3 rounded-full gap-1 text-xs">
                              <Eye className="w-3 h-3" /> View Details
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Saved Projects</h2>
                  <Button size="sm" className="bg-blue-600 text-white rounded-full gap-1" onClick={() => navigate('/start')}>
                    + New Project
                  </Button>
                </div>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No projects yet</p>
                    <Button className="mt-4 bg-blue-600 text-white rounded-full" onClick={() => navigate('/start')}>
                      Start Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map(proj => (
                      <Card key={proj.id} className="hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{proj.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Created {new Date(proj.created_at).toLocaleDateString()}
                              {proj.service_tier && ` • ${proj.service_tier}`}
                            </p>
                            <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                              proj.status === 'ordered' || proj.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {proj.status.charAt(0).toUpperCase() + proj.status.slice(1)}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                          <input
                            type="text"
                            value={profile.full_name}
                            onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Email</label>
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Phone</label>
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-medium text-gray-900 mb-3">Default Shipping Address</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={profile.address_line1}
                          onChange={e => setProfile(p => ({ ...p, address_line1: e.target.value }))}
                          placeholder="Address"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                        />
                        <input
                          type="text"
                          value={profile.address_line2}
                          onChange={e => setProfile(p => ({ ...p, address_line2: e.target.value }))}
                          placeholder="Apt, suite, etc."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={profile.city}
                            onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                            placeholder="City"
                            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          />
                          <input
                            type="text"
                            value={profile.state}
                            onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                            placeholder="State"
                            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          />
                          <input
                            type="text"
                            value={profile.zip}
                            onChange={e => setProfile(p => ({ ...p, zip: e.target.value }))}
                            placeholder="ZIP"
                            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-blue-600 text-white rounded-full"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
