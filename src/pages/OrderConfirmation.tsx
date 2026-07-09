import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Mail, PackageCheck } from 'lucide-react';
import SnapShadesLogo from '@/components/SnapShadesLogo';
import SEOHead from '@/components/SEOHead';
import { getOrder } from '@/lib/orders';
import { clearLocalCart } from '@/lib/persistent-cart';
import { SUPPORT_EMAIL } from '@/lib/constants';

interface OrderData {
  order_number?: string;
  grand_total?: number;
  email?: string;
  shipping_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
}
export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const orderNumberParam = searchParams.get('order');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    clearLocalCart();
    const load = async () => {
      if (orderId) {
        const { order: data } = await getOrder(orderId);
        if (data) setOrder(data as OrderData);
      }
      setLoading(false);
    };
    load();
  }, [orderId]);

  const orderNumber = order?.order_number || orderNumberParam || 'Pending';
  const total = Number(order?.grand_total || 0);
  const address = order?.shipping_address;

  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead title="Order received" description="Your SnapShades order was received." noindex />
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5"><SnapShadesLogo size={30} /><span className="text-xl font-semibold">Snap<span className="text-clay">Shades</span></span></Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-[2rem] bg-white p-7 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-clay/10">
            <Check className="h-9 w-9 text-clay" />
          </div>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.14em] text-clay">Order received</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Thank you.</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-warm-gray-500">We’ll verify the order details and keep you updated by email as your custom products move into production.</p>

          <div className="mt-8 rounded-2xl bg-sand p-5 text-left">
            <div className="flex items-center justify-between gap-4"><span className="text-sm text-warm-gray-500">Order number</span><span className="font-mono font-semibold">{loading ? 'Loading…' : orderNumber}</span></div>
            {total > 0 && <div className="mt-3 flex items-center justify-between gap-4 border-t border-ink/10 pt-3"><span className="text-sm text-warm-gray-500">Total</span><span className="text-xl font-semibold">${total.toFixed(2)}</span></div>}
            {address?.line1 && (
              <div className="mt-3 border-t border-ink/10 pt-3 text-sm">
                <p className="text-warm-gray-500">Shipping to</p>
                <p className="mt-1 font-medium">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.zip}</p>
              </div>
            )}
          </div>

          <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 p-4"><Mail className="h-5 w-5 text-clay" /><h2 className="mt-3 font-semibold">Watch your email</h2><p className="mt-1 text-sm leading-6 text-warm-gray-500">Order and shipping updates go to the email entered at checkout.</p></div>
            <div className="rounded-2xl border border-ink/10 p-4"><PackageCheck className="h-5 w-5 text-clay" /><h2 className="mt-3 font-semibold">Made to order</h2><p className="mt-1 text-sm leading-6 text-warm-gray-500">Your products are built for the exact mount and measurements submitted.</p></div>
          </div>

          <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-semibold text-white">Back to home <ArrowRight className="h-4 w-4" /></Link>
          <p className="mt-6 text-xs text-warm-gray-500">Questions? <a className="font-semibold text-ink" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </div>
      </main>
    </div>
  );
}
