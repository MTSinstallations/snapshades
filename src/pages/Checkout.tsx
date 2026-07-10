import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, ShoppingBag } from 'lucide-react';
import SnapShadesLogo from '@/components/SnapShadesLogo';
import ProductVisual from '@/components/value/ProductVisual';
import SEOHead from '@/components/SEOHead';
import { VALUE_PRODUCTS } from '@/data/value-products';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/lib/orders';
import { createStorefrontCheckout } from '@/lib/payment-pipeline';
import { isSupabaseConfigured } from '@/lib/supabase';
import { checkoutInfoSchema } from '@/lib/validation';

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_FORM: CheckoutForm = {
  email: '', firstName: '', lastName: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '',
};

const CHECKOUT_TOKEN_KEY = 'snapshades_checkout_token';

function getCheckoutToken(): string {
  const existing = sessionStorage.getItem(CHECKOUT_TOKEN_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID();
  sessionStorage.setItem(CHECKOUT_TOKEN_KEY, token);
  return token;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    cart,
    subtotal,
    installTotal,
    designTotal,
    surchargesTotal,
    shippingTotal,
    tax,
    grandTotal,
    windowCount,
    saveCheckoutProgress,
    savedCheckout,
    clearCart,
    loading,
  } = useCart();
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [confirmed, setConfirmed] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const restoredCheckout = useRef(false);

  useEffect(() => {
    if (!savedCheckout || restoredCheckout.current) return;
    restoredCheckout.current = true;
    setForm({
      email: savedCheckout.email,
      firstName: savedCheckout.firstName,
      lastName: savedCheckout.lastName,
      phone: savedCheckout.phone,
      address1: savedCheckout.address1,
      address2: savedCheckout.address2,
      city: savedCheckout.city,
      state: savedCheckout.state,
      zip: savedCheckout.zip,
    });
  }, [savedCheckout]);

  const update = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      saveCheckoutProgress({
        ...next,
        paymentMethod: 'card',
        step: 'checkout',
        savedAt: new Date().toISOString(),
      });
      return next;
    });
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    const validation = checkoutInfoSchema.safeParse(form);
    if (!validation.success) {
      const nextErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    if (!confirmed) {
      setSubmitError('Please confirm that you reviewed every mount and measurement.');
      return;
    }
    if (cart.length === 0) return;

    setPlacing(true);
    if (isSupabaseConfigured) {
      const checkoutInput = (checkoutToken: string) => ({
        checkoutToken,
        contact: form,
        items: cart.map((item) => ({
          id: item.id,
          room: item.room,
          name: item.name,
          productId: item.productId,
          variantId: item.variantId,
          width: item.width,
          height: item.height,
          mountType: item.mountType ?? 'inside' as const,
          productOptions: item.productOptions ?? {},
        })),
      });

      let session = await createStorefrontCheckout(checkoutInput(getCheckoutToken()));
      if (session.code === 'CHECKOUT_CHANGED') {
        sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
        session = await createStorefrontCheckout(checkoutInput(getCheckoutToken()));
      }

      if (session.error || !session.checkoutUrl) {
        setSubmitError(session.error || 'Secure checkout could not be opened. Please try again.');
        setPlacing(false);
        return;
      }

      window.location.assign(session.checkoutUrl);
      return;
    }

    const result = await createOrder(
      user?.id ?? 'guest',
      null,
      cart,
      { ...form, paymentMethod: 'card' },
      { subtotal, installTotal, designTotal, surchargesTotal, shippingTotal, tax, grandTotal },
    );

    if (result.error) {
      setSubmitError(result.error);
      setPlacing(false);
      return;
    }

    clearCart();
    sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
    navigate(`/order-confirmation?id=${result.orderId}&order=${result.orderNumber}`);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-sand"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-clay" /></div>;
  }

  if (windowCount === 0) {
    return (
      <div className="min-h-screen bg-sand text-center text-ink">
        <div className="mx-auto max-w-md px-4 py-24">
          <ShoppingBag className="mx-auto h-10 w-10 text-clay" />
          <h1 className="mt-5 text-3xl font-semibold">Your cart is empty.</h1>
          <Link to="/order" className="mt-6 inline-block rounded-xl bg-clay px-6 py-3 font-semibold text-white">Start an order</Link>
        </div>
      </div>
    );
  }

  const supplierCostTotal = cart.reduce((sum, item) => sum + item.ourCost, 0);
  const brokerFeeTotal = Math.round((subtotal - supplierCostTotal) * 100) / 100;
  const inputClass = 'mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-3 outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/10';

  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead title="Checkout" description="Complete your custom SnapShades order." noindex />
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5"><SnapShadesLogo size={30} /><span className="text-xl font-semibold">Snap<span className="text-clay">Shades</span></span></Link>
          <span className="flex items-center gap-2 text-xs font-semibold text-warm-gray-500"><Lock className="h-4 w-4" /> Secure checkout</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-warm-gray-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <form onSubmit={submit} className="rounded-3xl bg-white p-6 sm:p-8" noValidate>
            {searchParams.get('cancelled') === 'true' && (
              <div role="status" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Payment was cancelled. Your measurements and shipping details are still here, and you have not been charged.
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">Checkout</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Where should we send it?</h1>
              <p className="mt-2 text-sm leading-6 text-warm-gray-500">No account required. Payment opens securely after you review this page.</p>
            </div>

            <fieldset className="mt-8">
              <legend className="text-lg font-semibold">Contact</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-semibold">Email<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} autoComplete="email" />{errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}</label>
                <label className="text-sm font-semibold">First name<input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className={inputClass} autoComplete="given-name" />{errors.firstName && <span className="mt-1 block text-xs text-red-600">{errors.firstName}</span>}</label>
                <label className="text-sm font-semibold">Last name<input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className={inputClass} autoComplete="family-name" />{errors.lastName && <span className="mt-1 block text-xs text-red-600">{errors.lastName}</span>}</label>
                <label className="sm:col-span-2 text-sm font-semibold">Phone<input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} autoComplete="tel" />{errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}</label>
              </div>
            </fieldset>

            <fieldset className="mt-9 border-t border-ink/10 pt-8">
              <legend className="text-lg font-semibold">Shipping address</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-semibold">Street address<input value={form.address1} onChange={(e) => update('address1', e.target.value)} className={inputClass} autoComplete="address-line1" />{errors.address1 && <span className="mt-1 block text-xs text-red-600">{errors.address1}</span>}</label>
                <label className="sm:col-span-2 text-sm font-semibold">Apartment, suite, etc. <span className="font-normal text-warm-gray-500">(optional)</span><input value={form.address2} onChange={(e) => update('address2', e.target.value)} className={inputClass} autoComplete="address-line2" /></label>
                <label className="text-sm font-semibold">City<input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} autoComplete="address-level2" />{errors.city && <span className="mt-1 block text-xs text-red-600">{errors.city}</span>}</label>
                <label className="text-sm font-semibold">State<select value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass} autoComplete="address-level1"><option value="">Select</option>{STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select>{errors.state && <span className="mt-1 block text-xs text-red-600">{errors.state}</span>}</label>
                <label className="text-sm font-semibold">ZIP code<input inputMode="numeric" value={form.zip} onChange={(e) => update('zip', e.target.value)} className={inputClass} autoComplete="postal-code" />{errors.zip && <span className="mt-1 block text-xs text-red-600">{errors.zip}</span>}</label>
              </div>
            </fieldset>

            <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-sand p-4 text-sm leading-6">
              <input type="checkbox" checked={confirmed} onChange={(e) => { setConfirmed(e.target.checked); setSubmitError(''); }} className="mt-1 h-4 w-4 accent-[#e04e2a]" />
              <span>I reviewed every product, mount type, width, and height. I understand these products are custom made to the measurements I submitted.</span>
            </label>

            {submitError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}

            <button type="submit" disabled={placing} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-6 py-4 font-semibold text-white hover:bg-clay-hover disabled:opacity-50">
              {placing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Preparing secure payment…</> : <><Lock className="h-4 w-4" /> Continue to payment · ${grandTotal.toFixed(2)} + tax</>}
            </button>
          </form>

          <aside className="rounded-3xl bg-ink p-6 text-white lg:sticky lg:top-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Your order</h2><Link to="/cart" className="text-xs font-semibold text-[#ef7a58]">Edit</Link></div>
            <div className="mt-5 max-h-64 space-y-4 overflow-y-auto pr-1">
              {cart.map((item) => {
                const valueProduct = VALUE_PRODUCTS.find((product) => product.catalogSlug === item.productId) ?? VALUE_PRODUCTS[0];
                const colorName = item.productOptions?.color;
                const color = valueProduct.colors.find((option) => option.name === colorName)?.value;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <ProductVisual type={valueProduct.visual} color={color} className="h-16 w-16 shrink-0 rounded-xl border-[4px] shadow-none" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.product}</p><p className="text-xs text-white/50">{item.width}&quot; × {item.height}&quot; · {item.mountType} mount</p></div>
                    <span className="text-sm font-semibold">${item.customerPrice.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div className="flex justify-between text-white/60"><span>Supplier cost</span><span>${supplierCostTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/60"><span>SnapShades 10%</span><span>${brokerFeeTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/60"><span>Supplier freight</span><span>${shippingTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/60"><span>Tax</span><span>Calculated by Stripe</span></div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-xl font-semibold"><span>Before tax</span><span>${grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="mt-6 space-y-2 text-xs text-white/50">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ef7a58]" /> Supplier cost + 10%</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ef7a58]" /> Freight passed through at supplier cost</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ef7a58]" /> Secure card payment</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
