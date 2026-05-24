import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, Mail, ArrowRight, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getOrder } from '@/lib/orders';

interface SwatchSelection {
  swatchId: string;
  swatchName: string;
  swatchCollection: string;
  swatchImageUrl: string;
  swatchColor?: string;
  swatchOpacity?: string;
  swatchCode?: string;
}

function loadSwatchSelections(): Record<string, SwatchSelection> {
  try { return JSON.parse(localStorage.getItem('snapshades_swatches') || '{}'); }
  catch { return {}; }
}

interface OrderData {
  id: string;
  order_number: string;
  grand_total: number;
  install_total: number;
  created_at: string;
  shipping_address: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
  status: string;
}

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('id');
  const orderNumberParam = searchParams.get('order');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [swatchSelections, setSwatchSelections] = useState<Record<string, SwatchSelection>>({});

  useEffect(() => {
    const load = async () => {
      if (orderId) {
        const { order: data } = await getOrder(orderId);
        if (data) setOrder(data as OrderData);
      }
      setSwatchSelections(loadSwatchSelections());
      setLoading(false);
    };
    load();
  }, [orderId]);

  const orderNumber = order?.order_number || orderNumberParam || 'SS-XXXXXX';
  const total = order ? Number(order.grand_total) : 0;
  const hasInstall = order ? Number(order.install_total) > 0 : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-gray-500">
            Thank you for your order. We've sent a confirmation email with your order details.
          </p>
          <p className="mt-1 text-lg font-mono font-bold text-blue-600">Order #{orderNumber}</p>
          {total > 0 && (
            <p className="mt-1 text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
          )}
        </div>

        {/* Timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold text-gray-900 mb-4">What Happens Next</h2>
            <div className="space-y-6">
              {[
                { icon: Mail, title: 'Order Confirmation', desc: 'Email sent with order details and receipt', status: 'done' as const, time: 'Just now' },
                { icon: Package, title: 'Custom Manufacturing', desc: 'Your window treatments are made to order (4-6 weeks)', status: 'current' as const, time: '4-6 weeks' },
                { icon: Truck, title: 'Shipping', desc: 'Tracking number emailed when your order ships', status: 'upcoming' as const, time: 'After manufacturing' },
                ...(hasInstall ? [
                  { icon: Calendar, title: 'Installation Scheduling', desc: "We'll match you with a local certified installer and schedule a convenient time", status: 'upcoming' as const, time: 'After delivery' },
                ] : []),
              ].map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      s.status === 'done' ? 'bg-green-100' :
                      s.status === 'current' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <s.icon className={`w-5 h-5 ${
                        s.status === 'done' ? 'text-green-500' :
                        s.status === 'current' ? 'text-blue-500' :
                        'text-gray-400'
                      }`} />
                    </div>
                    {i < (hasInstall ? 3 : 2) && <div className="absolute left-5 top-10 w-px h-6 bg-gray-200" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${s.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>{s.title}</h3>
                      <span className="text-xs text-gray-400">{s.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fabric Selections */}
        {Object.keys(swatchSelections).length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-gray-900">Your Fabric Selections</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(swatchSelections).map(([windowId, swatch]) => (
                  <div key={windowId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                      {swatch.swatchImageUrl ? (
                        <img
                          src={swatch.swatchImageUrl}
                          alt={swatch.swatchName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (swatch.swatchColor) {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      {swatch.swatchColor && (
                        <div className="w-full h-full hidden" style={{ backgroundColor: swatch.swatchColor }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{swatch.swatchName}</p>
                      <p className="text-xs text-gray-500 truncate">{swatch.swatchCollection}</p>
                      {swatch.swatchOpacity && (
                        <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full ${
                          swatch.swatchOpacity === 'sheer' ? 'bg-yellow-100 text-yellow-700' :
                          swatch.swatchOpacity === 'light-filtering' ? 'bg-blue-100 text-blue-700' :
                          swatch.swatchOpacity === 'room-darkening' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-800 text-white'
                        }`}>
                          {swatch.swatchOpacity.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping address */}
        {order?.shipping_address && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-900 mb-2">Shipping To</h2>
              <p className="text-sm text-gray-600">
                {order.shipping_address?.line1}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 bg-blue-600 text-white rounded-full py-5 gap-2" onClick={() => navigate('/account/orders')}>
            Track Your Order <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="flex-1 rounded-full py-5 gap-2" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" /> Back to Home
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Questions? Email <a href="mailto:support@snapshades.com" className="text-blue-600 hover:underline">support@snapshades.com</a>
        </p>
      </div>
    </div>
  );
}
