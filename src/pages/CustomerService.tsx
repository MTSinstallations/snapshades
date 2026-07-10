import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Mail, PackageCheck, Ruler, ShieldCheck } from 'lucide-react';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import SiteHeader from '@/components/layout/SiteHeader';
import { SUPPORT_EMAIL } from '@/lib/constants';

const warrantyUrl = 'https://normanusa.com/warranties/';

export default function CustomerService() {
  const pathname = useLocation().pathname;
  const claimsFocus = pathname === '/claims' || pathname === '/returns';
  const title = pathname === '/warranty' ? 'Warranty and claims' : claimsFocus ? 'Order problem or claim' : 'Help and order support';
  const claimEmail = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('SnapShades order support — order number needed')}`;

  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead title={title} description="Accurate measurement, shipping, custom-order, warranty, and claims guidance for SnapShades orders." noindex />
      <SiteHeader />
      <main>
        <section className="border-b border-ink/10 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Customer care</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-warm-gray-500">Written order support, clear custom-product policies, and manufacturer-backed warranty guidance.</p>
            <a href={claimEmail} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-clay px-6 py-3.5 font-semibold text-white">Email order support <Mail className="h-4 w-4" /></a>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-2">
          <article className="rounded-3xl bg-white p-6"><Ruler className="h-6 w-6 text-clay" /><h2 className="mt-4 text-xl font-semibold">Measurements</h2><p className="mt-2 leading-7 text-warm-gray-500">Inside mount: send the exact opening size without deductions. Outside mount: send the finished size you want. Review every window before payment because the supplier builds from the submitted values.</p><Link to="/#measure" className="mt-4 inline-flex items-center gap-1 font-semibold text-clay">Measurement guide <ArrowRight className="h-4 w-4" /></Link></article>
          <article className="rounded-3xl bg-white p-6"><PackageCheck className="h-6 w-6 text-clay" /><h2 className="mt-4 text-xl font-semibold">Changes and delivery</h2><p className="mt-2 leading-7 text-warm-gray-500">Email immediately if something must change. Once released to the supplier, a custom order generally cannot be changed or cancelled. Freight currently covers physical addresses in the contiguous United States.</p></article>
          <article className="rounded-3xl bg-white p-6"><ShieldCheck className="h-6 w-6 text-clay" /><h2 className="mt-4 text-xl font-semibold">Norman warranty</h2><p className="mt-2 leading-7 text-warm-gray-500">Norman publishes a limited lifetime warranty against defects for the original purchaser, with stated exceptions. Warranty service requires proof of purchase and problem details through the servicing retailer; shipping and labor are not included by the manufacturer.</p><a href={warrantyUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 font-semibold text-clay">Read Norman’s warranty <ArrowRight className="h-4 w-4" /></a></article>
          <article className="rounded-3xl bg-white p-6"><AlertTriangle className="h-6 w-6 text-clay" /><h2 className="mt-4 text-xl font-semibold">Damage, defect, or wrong item</h2><p className="mt-2 leading-7 text-warm-gray-500">Keep all packaging. Email your order number, delivery date, affected room or line item, a description, and clear photos of the product and carton. We review the evidence before requesting a supplier repair, remake, replacement, or other resolution.</p></article>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="rounded-3xl bg-ink p-7 text-white sm:p-9">
            <h2 className="text-2xl font-semibold">What to include in a claim</h2>
            <ul className="mt-5 grid gap-3 text-sm text-white/70 sm:grid-cols-2"><li>Order number</li><li>Room or line item</li><li>Delivery date</li><li>Photos of product and carton</li><li>What you expected</li><li>What arrived or failed</li></ul>
            <a href={claimEmail} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-clay px-5 py-3 font-semibold text-white">Start an email claim <Mail className="h-4 w-4" /></a>
          </div>
          <p className="mt-7 text-sm leading-6 text-warm-gray-500">Custom products are not returnable for preference, color choice, or customer measurement error after supplier release. Verified defects, shipping damage, wrong items, and SnapShades specification errors are reviewed individually. See the <Link to="/terms" className="font-semibold text-ink underline">terms of sale</Link>.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
