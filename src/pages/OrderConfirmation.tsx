import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, LoaderCircle, Mail, PackageCheck } from 'lucide-react';
import SnapShadesLogo from '@/components/SnapShadesLogo';
import SEOHead from '@/components/SEOHead';
import {
  getCheckoutStatus,
  getOrder,
  type CheckoutStatusItem,
  type CheckoutStatusOrder,
} from '@/lib/orders';
import { clearLocalCart } from '@/lib/persistent-cart';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SUPPORT_EMAIL } from '@/lib/constants';

interface DemoOrderData {
  order_number?: string;
  grand_total?: number;
  email?: string;
  payment_status?: string;
  shipping_address?: CheckoutStatusOrder['shipping_address'];
  items?: Array<Partial<CheckoutStatusItem> & { product?: string; mountType?: string }>;
}

const CHECKOUT_TOKEN_KEY = 'snapshades_checkout_token';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const demoOrderId = searchParams.get('id');
  const orderNumberParam = searchParams.get('order');
  const [order, setOrder] = useState<CheckoutStatusOrder | DemoOrderData | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId || demoOrderId));
  const [verificationError, setVerificationError] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(!isSupabaseConfigured && Boolean(demoOrderId));

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const finishSuccessfulOrder = () => {
      clearLocalCart();
      sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
    };

    const loadLiveOrder = async (attempt = 0) => {
      if (!sessionId) return;
      const result = await getCheckoutStatus(sessionId);
      if (cancelled) return;

      if (result.order) setOrder(result.order);
      const paid = result.paymentStatus === 'paid' || result.order?.payment_status === 'paid';
      if (paid) {
        setPaymentConfirmed(true);
        setVerificationError('');
        setLoading(false);
        finishSuccessfulOrder();
        return;
      }

      if (result.error) {
        setVerificationError(result.error);
        setLoading(false);
        return;
      }

      if (attempt < 7) {
        retryTimer = setTimeout(() => loadLiveOrder(attempt + 1), 1250);
      } else {
        setLoading(false);
      }
    };

    const loadDemoOrder = async () => {
      if (!demoOrderId) {
        setLoading(false);
        return;
      }
      const { order: data } = await getOrder(demoOrderId);
      if (cancelled) return;
      if (data) setOrder(data as DemoOrderData);
      setLoading(false);
      finishSuccessfulOrder();
    };

    if (sessionId && isSupabaseConfigured) loadLiveOrder();
    else loadDemoOrder();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [sessionId, demoOrderId]);

  const orderNumber = order?.order_number || orderNumberParam || 'Pending';
  const total = Number(order?.grand_total || 0);
  const address = order?.shipping_address;
  const items = 'order_items' in (order || {})
    ? ((order as CheckoutStatusOrder).order_items || [])
    : ((order as DemoOrderData | null)?.items || []);
  const liveConfirmation = Boolean(sessionId && isSupabaseConfigured);
  const pending = liveConfirmation && !paymentConfirmed && !verificationError;
  const eyebrow = verificationError
    ? 'Payment verification needed'
    : pending
      ? 'Confirming payment'
      : liveConfirmation
        ? 'Payment confirmed'
        : 'Demo order received';

  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead title="Order confirmation" description="Your SnapShades checkout status." noindex />
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5"><SnapShadesLogo size={30} /><span className="text-xl font-semibold">Snap<span className="text-clay">Shades</span></span></Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-[2rem] bg-white p-7 text-center shadow-sm sm:p-12">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${verificationError ? 'bg-red-50' : 'bg-clay/10'}`}>
            {verificationError
              ? <AlertCircle className="h-9 w-9 text-red-600" />
              : pending || loading
                ? <LoaderCircle className="h-9 w-9 animate-spin text-clay" />
                : <Check className="h-9 w-9 text-clay" />}
          </div>
          <p className={`mt-7 text-sm font-semibold uppercase tracking-[0.14em] ${verificationError ? 'text-red-600' : 'text-clay'}`}>{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            {verificationError ? 'We could not verify the payment.' : pending ? 'Almost there.' : 'Thank you.'}
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-warm-gray-500">
            {verificationError
              ? 'Your cart is still saved. Return to checkout or contact us and we will help before anything enters production.'
              : pending
                ? 'Stripe is finishing the payment. Keep this page open; we will update it automatically.'
                : liveConfirmation
                  ? 'Your payment is confirmed. The complete order is now in our fulfillment queue for review.'
                  : 'This local demo did not charge a card or send an order to production.'}
          </p>

          {!verificationError && (
            <div className="mt-8 rounded-2xl bg-sand p-5 text-left">
              <div className="flex items-center justify-between gap-4"><span className="text-sm text-warm-gray-500">Order number</span><span className="font-mono font-semibold">{loading && !order ? 'Loading…' : orderNumber}</span></div>
              {total > 0 && <div className="mt-3 flex items-center justify-between gap-4 border-t border-ink/10 pt-3"><span className="text-sm text-warm-gray-500">Total</span><span className="text-xl font-semibold">${total.toFixed(2)}</span></div>}
              {address?.line1 && (
                <div className="mt-3 border-t border-ink/10 pt-3 text-sm">
                  <p className="text-warm-gray-500">Shipping to</p>
                  <p className="mt-1 font-medium">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.zip}</p>
                </div>
              )}
            </div>
          )}

          {items.length > 0 && !verificationError && (
            <div className="mt-5 space-y-3 text-left">
              {items.map((item, index) => {
                const productName = 'product_name' in item ? item.product_name : item.product;
                const mountType = 'mount_type' in item
                  ? item.mount_type
                  : 'mountType' in item
                    ? String(item.mountType)
                    : undefined;
                return (
                  <div key={`${productName}-${index}`} className="flex items-start justify-between gap-4 rounded-2xl border border-ink/10 p-4 text-sm">
                    <div><p className="font-semibold">{productName || 'Window treatment'}</p><p className="mt-1 text-warm-gray-500">{Number(item.width)}&quot; × {Number(item.height)}&quot;{mountType ? ` · ${mountType} mount` : ''}</p></div>
                    {Number(item.customer_price) > 0 && <span className="font-semibold">${Number(item.customer_price).toFixed(2)}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {!verificationError && !pending && (
            <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-ink/10 p-4"><Mail className="h-5 w-5 text-clay" /><h2 className="mt-3 font-semibold">{liveConfirmation ? 'Watch your email' : 'No email sent'}</h2><p className="mt-1 text-sm leading-6 text-warm-gray-500">{liveConfirmation ? 'Order and shipping updates go to the email entered at checkout.' : 'Email starts only after the live payment service confirms an order.'}</p></div>
              <div className="rounded-2xl border border-ink/10 p-4"><PackageCheck className="h-5 w-5 text-clay" /><h2 className="mt-3 font-semibold">Made to order</h2><p className="mt-1 text-sm leading-6 text-warm-gray-500">Your products are built for the exact mount and measurements submitted.</p></div>
            </div>
          )}

          {verificationError ? (
            <Link to="/checkout" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-clay px-6 py-3.5 font-semibold text-white">Return to checkout <ArrowRight className="h-4 w-4" /></Link>
          ) : !pending && (
            <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-semibold text-white">Back to home <ArrowRight className="h-4 w-4" /></Link>
          )}
          <p className="mt-6 text-xs text-warm-gray-500">Questions? <a className="font-semibold text-ink" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </div>
      </main>
    </div>
  );
}
