import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import ProductVisual from '@/components/value/ProductVisual';
import SEOHead from '@/components/SEOHead';
import { VALUE_PRODUCTS } from '@/data/value-products';
import { useCart } from '@/hooks/useCart';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    removeWindow,
    subtotal,
    shippingTotal,
    grandTotal,
    windowCount,
  } = useCart();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-clay" />
      </div>
    );
  }

  if (windowCount === 0) {
    return (
      <div className="min-h-screen bg-sand text-ink">
        <SEOHead title="Your Cart" description="Your SnapShades cart." noindex />
        <SiteHeader />
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag className="h-8 w-8 text-clay" />
          </div>
          <h1 className="mt-7 text-3xl font-semibold tracking-tight">Your cart is empty.</h1>
          <p className="mt-3 max-w-sm leading-7 text-warm-gray-500">Choose a product, enter your mount and measurements, and your exact price will appear.</p>
          <Link to="/order" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-clay px-6 py-3.5 font-semibold text-white">
            Start an order <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  const supplierCostTotal = cart.reduce((sum, item) => sum + item.ourCost, 0);
  const brokerFeeTotal = Math.round((subtotal - supplierCostTotal) * 100) / 100;

  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead title="Your Cart" description="Review your custom SnapShades order." noindex />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/order" className="inline-flex items-center gap-2 text-sm font-semibold text-warm-gray-500 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Add another window
        </Link>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">Your cart</h1>
        <p className="mt-2 text-warm-gray-500">Review each custom measurement before checkout.</p>

        <div className="mt-9 grid items-start gap-7 lg:grid-cols-[1.35fr_.65fr]">
          <section className="space-y-4" aria-label="Cart items">
            {cart.map((item) => {
              const valueProduct = VALUE_PRODUCTS.find((product) => product.catalogSlug === item.productId) ?? VALUE_PRODUCTS[0];
              const colorName = item.productOptions?.color ?? valueProduct.colors[0].name;
              const color = valueProduct.colors.find((option) => option.name === colorName)?.value;
              return (
                <article key={item.id} className="grid gap-5 rounded-3xl border border-ink/10 bg-white p-4 sm:grid-cols-[150px_1fr_auto] sm:p-5">
                  <ProductVisual type={valueProduct.visual} color={color} className="aspect-[5/4] w-full rounded-2xl border-[6px] shadow-sm sm:aspect-square" />
                  <div className="min-w-0 py-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-clay">{item.mountType ?? 'inside'} mount</p>
                    <h2 className="mt-1 text-xl font-semibold">{item.product}</h2>
                    <p className="mt-2 text-sm text-warm-gray-500">{item.width}&quot; wide × {item.height}&quot; high</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {Object.entries(item.productOptions ?? {})
                        .filter(([key]) => key !== 'controlSide' || valueProduct.id !== 'cellular')
                        .map(([key, value]) => (
                          <span key={key} className="rounded-full bg-sand px-2.5 py-1.5 text-warm-gray-500">{value}</span>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-warm-gray-500">{item.room}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-1">
                    <p className="text-xl font-semibold">${item.customerPrice.toFixed(2)}</p>
                    <button type="button" onClick={() => removeWindow(item.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-gray-500 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </article>
              );
            })}

            <Link to="/order" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-white/50 px-5 py-5 font-semibold text-ink hover:bg-white">
              <Plus className="h-4 w-4" /> Add another window
            </Link>
          </section>

          <aside className="rounded-3xl bg-ink p-6 text-white lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-white/65"><span>Supplier cost</span><span>${supplierCostTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/65"><span>SnapShades 10%</span><span>${brokerFeeTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/65"><span>Supplier freight</span><span>${shippingTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/65"><span>Tax</span><span>Calculated at payment</span></div>
              <div className="flex justify-between border-t border-white/15 pt-4 text-xl font-semibold"><span>Before tax</span><span>${grandTotal.toFixed(2)}</span></div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-5 py-3.5 font-semibold text-white hover:bg-[#c84222]"
            >
              Continue to checkout <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-xs text-white/55">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ef7a58]" /> Custom made to your submitted size</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ef7a58]" /> Supplier freight passed through at cost</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ef7a58]" /> Applicable tax calculated by Stripe</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
