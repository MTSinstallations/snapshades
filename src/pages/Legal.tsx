import { Link, useLocation } from 'react-router-dom';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import SiteHeader from '@/components/layout/SiteHeader';
import { SUPPORT_EMAIL } from '@/lib/constants';

const reviewed = 'July 9, 2026';

function PrivacyPolicy() {
  return (
    <>
      <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Privacy policy</h1>
      <p className="mt-4 text-sm text-warm-gray-500">Last reviewed {reviewed}</p>
      <div className="mt-10 space-y-9 leading-7 text-warm-gray-500">
        <section><h2 className="text-xl font-semibold text-ink">Information we collect</h2><p className="mt-2">We collect the contact, shipping, account, window measurement, product-selection, and order information you provide. We also use ordinary security and diagnostic records such as IP address, browser type, request time, and error logs.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Payments</h2><p className="mt-2">Card payment is completed on Stripe’s hosted checkout. SnapShades stores Stripe transaction identifiers and payment status, but does not receive or store your complete card number.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">How information is used</h2><p className="mt-2">We use information to price and fulfill orders, provide support, prevent fraud, calculate applicable tax, send transactional updates, and maintain the service. We do not sell personal information or use it for third-party targeted advertising.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Service providers</h2><p className="mt-2">Information is shared only as needed with providers that operate the storefront and fulfill an order, including Vercel, Supabase, Stripe, transactional email providers, Norman or another disclosed supplier, and shipping carriers.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Storage and retention</h2><p className="mt-2">The cart and checkout progress may be stored in your browser. Account and order records are retained for fulfillment, warranty, fraud prevention, tax, accounting, and legal obligations. We delete or de-identify records when they are no longer reasonably needed.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Your choices</h2><p className="mt-2">You may request access, correction, or deletion of personal information by emailing <a className="font-semibold text-clay" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Some transaction records must be retained when required for accounting, warranty, fraud prevention, or law.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Children and changes</h2><p className="mt-2">The storefront is not directed to children under 13. Material policy changes will be posted here with a revised review date.</p></section>
      </div>
    </>
  );
}

function TermsOfSale() {
  return (
    <>
      <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Terms of sale</h1>
      <p className="mt-4 text-sm text-warm-gray-500">Last reviewed {reviewed}</p>
      <div className="mt-10 space-y-9 leading-7 text-warm-gray-500">
        <section><h2 className="text-xl font-semibold text-ink">Price</h2><p className="mt-2">The product price is the disclosed supplier cost plus a 10% SnapShades fee. Supplier freight is passed through without a SnapShades markup. Stripe calculates applicable destination tax during secure payment. The final Stripe total is shown before payment is submitted.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Measurements and mount type</h2><p className="mt-2">Products are custom made from the width, height, and inside- or outside-mount choice you submit. For inside mount, enter the exact opening size and do not make a factory deduction. For outside mount, enter the finished product size desired. You are responsible for reviewing every submitted measurement and option before payment.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Order acceptance</h2><p className="mt-2">Payment confirmation places the order into a staff review queue; it does not mean the supplier has accepted it. If a selected configuration is unavailable or cannot be produced, we will contact you before supplier submission and offer a correction or refund.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Changes, cancellation, and custom goods</h2><p className="mt-2">Email us immediately if an order needs to change. Once released to the supplier, custom products generally cannot be changed, cancelled, or returned for preference, color choice, or customer measurement error. Nothing here limits rights that cannot lawfully be limited.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Delivery</h2><p className="mt-2">Current checkout freight covers physical addresses in the 48 contiguous United States. Production and delivery dates are estimates until the supplier accepts the order. Inspect delivered cartons and products promptly, retain packaging, and report loss, visible damage, or an incorrect item with photographs.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Defects and warranty</h2><p className="mt-2">Verified manufacturing defects or SnapShades specification errors are reviewed with the servicing supplier. Norman’s published warranty controls manufacturer coverage and excludes some items, including shipping and labor. See our <Link className="font-semibold text-clay" to="/warranty">warranty and claims guidance</Link>.</p></section>
        <section><h2 className="text-xl font-semibold text-ink">Contact</h2><p className="mt-2">Questions about an order or these terms may be sent to <a className="font-semibold text-clay" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></section>
      </div>
    </>
  );
}

export default function Legal() {
  const privacy = useLocation().pathname === '/privacy';
  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead title={privacy ? 'Privacy policy' : 'Terms of sale'} description={privacy ? 'How SnapShades handles customer and order information.' : 'Terms for custom SnapShades orders, measurements, freight, tax, and warranty.'} canonical={privacy ? '/privacy' : '/terms'} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        {privacy ? <PrivacyPolicy /> : <TermsOfSale />}
      </main>
      <Footer />
    </div>
  );
}
