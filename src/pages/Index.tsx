import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/Footer';
import ProductVisual from '@/components/value/ProductVisual';
import SEOHead, { getFAQSchema } from '@/components/SEOHead';
import { VALUE_PRODUCTS, getStartingPrice } from '@/data/value-products';

const faqs = [
  {
    question: 'Do I make a deduction for an inside mount?',
    answer: 'No. Enter the exact inside width and height of the window opening. The factory makes the production deduction for the product you choose.',
  },
  {
    question: 'What measurement do I enter for an outside mount?',
    answer: 'Enter the finished width and height you want the shade or blind to cover. No factory deduction is made from an outside-mount order.',
  },
  {
    question: 'How is my price calculated?',
    answer: 'We start with our supplier cost and add 10%. Supplier freight is passed through without markup, and Stripe calculates any applicable destination tax during secure payment.',
  },
  {
    question: 'Are these products cordless?',
    answer: 'All three products use cordless lift as standard. Faux wood blinds also let you choose the tilt-wand side.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead
        title="Custom Shades and Blinds at Cost Plus 10%"
        description="Order cellular shades, roller shades, and faux wood blinds in your exact inside- or outside-mount size. Supplier cost plus 10%, plus pass-through freight and applicable tax."
        canonical="/"
        schema={getFAQSchema(faqs)}
      />
      <SiteHeader />

      <main>
        <section className="overflow-hidden border-b border-ink/10">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-warm-gray-500">
                <Tag className="h-3.5 w-3.5 text-clay" />
                Supplier cost + 10%
              </div>
              <h1 className="mt-6 text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Custom window coverings. Without the markup.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-warm-gray-500 sm:text-xl">
                Choose one of three practical products, enter your measurements, and order. We keep 10% and ship it straight to you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/order"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-clay px-6 py-3.5 font-semibold text-white transition-colors hover:bg-clay-hover"
                >
                  Start your order <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center rounded-xl border border-ink/15 bg-white/60 px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-white"
                >
                  See the three products
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-warm-gray-500">
                {['Inside or outside mount', 'Freight at supplier cost', 'Tax calculated by Stripe'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-clay" /> {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mx-0">
              <div className="absolute -inset-10 rounded-full bg-clay/10 blur-3xl" />
              <ProductVisual type="cellular" className="relative mx-auto aspect-[4/5] w-[72%] min-w-[260px]" />
              <div className="absolute -bottom-5 left-0 rounded-2xl border border-ink/10 bg-white p-4 shadow-xl sm:left-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray-500">Your total</p>
                <p className="mt-1 text-2xl font-semibold">Cost + 10%</p>
                <p className="mt-1 text-xs text-warm-gray-500">Plus supplier freight and applicable tax</p>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="scroll-mt-20 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Only what people buy most</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Three products. That’s it.</h2>
              <p className="mt-4 text-lg leading-7 text-warm-gray-500">
                We removed the catalog maze. Pick the function and look you need, then move on to measurements.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {VALUE_PRODUCTS.map((product) => (
                <Link
                  key={product.id}
                  to={`/order?product=${product.id}`}
                  className="group overflow-hidden rounded-3xl border border-ink/10 bg-sand p-4 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-xl"
                >
                  <ProductVisual
                    type={product.visual}
                    color={product.colors[1]?.value ?? product.colors[0].value}
                    className="aspect-[5/4] w-full rounded-2xl border-[7px] shadow-md"
                  />
                  <div className="px-2 pb-2 pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-clay">{product.eyebrow}</p>
                      <p className="text-sm font-semibold">From ${getStartingPrice(product).toFixed(2)}</p>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{product.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-warm-gray-500">{product.description}</p>
                    <ul className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-clay" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-2 font-semibold text-ink">
                      Choose {product.shortName.toLowerCase()} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-ink/10 bg-ink py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ef7a58]">How it works</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Measure. Choose. Order.</h2>
                <p className="mt-4 leading-7 text-white/60">One guided order path. No consultation, quote request, or sales call required.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { number: '01', icon: Ruler, title: 'Enter the size', copy: 'Choose inside or outside mount and enter width and height to the nearest 1/8 inch.' },
                  { number: '02', icon: ShieldCheck, title: 'Choose details', copy: 'Select color, light control, and the few options that apply to that product.' },
                  { number: '03', icon: PackageCheck, title: 'Review and order', copy: 'See supplier cost, our 10% fee, and your exact total before adding it to cart.' },
                ].map((step) => (
                  <div key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center justify-between">
                      <step.icon className="h-5 w-5 text-[#ef7a58]" />
                      <span className="text-xs font-semibold text-white/35">{step.number}</span>
                    </div>
                    <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{step.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="measure" className="scroll-mt-20 bg-sand py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Measure once</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Tell us how you want it mounted.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-warm-gray-500">The order form gives you the right measurement instructions after you choose.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-ink/10 bg-white p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay/10 font-semibold text-clay">IN</div>
                <h3 className="mt-6 text-2xl font-semibold">Inside mount</h3>
                <p className="mt-3 leading-7 text-warm-gray-500">The product sits inside the window opening for the cleanest look.</p>
                <div className="mt-6 rounded-2xl bg-sand p-4 text-sm leading-6">
                  Measure the opening in three places. Enter the narrowest width and tallest height. <strong>Do not make a deduction.</strong>
                </div>
              </div>
              <div className="rounded-3xl border border-ink/10 bg-white p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/5 font-semibold text-ink">OUT</div>
                <h3 className="mt-6 text-2xl font-semibold">Outside mount</h3>
                <p className="mt-3 leading-7 text-warm-gray-500">The product covers the opening and mounts to the trim or wall.</p>
                <div className="mt-6 rounded-2xl bg-sand p-4 text-sm leading-6">
                  Enter the exact finished width and height you want. Add overlap for privacy and light control. <strong>No deduction is made.</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Simple answers</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Before you order</h2>
            </div>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                    {faq.question}
                    <span className="text-xl font-light text-clay group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-2xl pt-3 text-sm leading-6 text-warm-gray-500">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-clay px-4 py-16 text-center text-white">
          <h2 className="text-4xl font-semibold tracking-[-0.04em]">Ready to measure?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">Your exact price appears as soon as you enter a valid size.</p>
          <Link to="/order" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-ink">
            Start your order <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
