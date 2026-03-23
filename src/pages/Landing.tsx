import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Truck, Palette, Wrench, Star, ArrowRight, CheckCircle } from 'lucide-react'

const tiers = [
  {
    number: 1,
    title: 'Self Install',
    subtitle: 'Ship to Your Door',
    description: 'Snap photos of your windows, pick your style, and we ship custom-fit blinds right to you.',
    icon: Truck,
    price: 'From $29.99/window',
    color: 'snap-500',
    features: [
      'Photo-based measurements',
      'Free shipping nationwide',
      'Easy DIY installation guides',
      'Budget & premium options',
    ],
  },
  {
    number: 2,
    title: 'Pro Install',
    subtitle: 'We Handle Everything',
    description: 'Same great products, professionally installed by a verified local installer.',
    icon: Wrench,
    price: 'From $79.99/window',
    color: 'snap-600',
    popular: true,
    features: [
      'Everything in Self Install',
      'Matched with local installer',
      'Schedule at your convenience',
      'Direct communication with installer',
    ],
  },
  {
    number: 3,
    title: 'Design + Install',
    subtitle: 'The Full Experience',
    description: 'Get a remote design consultation, then professional installation. White-glove service.',
    icon: Palette,
    price: 'From $129.99/window',
    color: 'snap-700',
    features: [
      'Everything in Pro Install',
      'Remote design consultation',
      'Expert color & style advice',
      'Curated product recommendations',
    ],
  },
]

const faqs = [
  {
    q: 'How does the photo measurement system work?',
    a: 'Simply use your phone camera to snap photos of your tape measure across your window. Our AI reads the measurements automatically. You can also enter measurements manually if you prefer.',
  },
  {
    q: 'What types of window coverings do you sell?',
    a: 'We offer blinds (faux wood, wood, aluminum, vertical), shades (roller, cellular, roman, woven wood), and plantation shutters — all custom-made to fit your windows.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Custom orders typically ship within 5-10 business days. Free shipping on all orders nationwide.',
  },
  {
    q: 'Can I see samples before ordering?',
    a: 'Yes! Browse our digital swatch gallery online, or request free physical swatches shipped to your door.',
  },
  {
    q: 'How does the installer matching work?',
    a: 'We match you with a verified, insured installer in your area. You choose from available time slots and communicate directly with your installer.',
  },
  {
    q: 'What is the cheapest way to buy blinds online?',
    a: 'Our Self Install tier offers custom blinds starting at $29.99/window — significantly less than big-box stores or in-home consultation services that charge $80-$250+ per window.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-snap-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Camera className="w-8 h-8 text-snap-600" />
            <span className="text-2xl font-bold text-snap-800">Snap<span className="text-snap-500">Shades</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-snap-600 transition">How It Works</a>
            <a href="#tiers" className="hover:text-snap-600 transition">Pricing</a>
            <a href="#faq" className="hover:text-snap-600 transition">FAQ</a>
            <button className="bg-snap-600 text-white px-5 py-2 rounded-full hover:bg-snap-700 transition font-semibold">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-snap-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-snap-100 text-snap-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Camera className="w-4 h-4" />
              Photo-based measurements — no tape measure expertise needed
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
              Snap. Order.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-snap-500 to-snap-700">
                Done.
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Custom blinds, shades & shutters — measured from photos, priced instantly, 
              delivered to your door. Professional installation available nationwide.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-snap-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-snap-700 transition shadow-lg shadow-snap-200 flex items-center justify-center gap-2">
                Start Your Project <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto border-2 border-snap-200 text-snap-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-snap-50 transition">
                Browse Products
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Free Shipping</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Nationwide Coverage</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Four simple steps to beautiful windows</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Snap Photos', desc: 'Use your phone to photograph your windows with a tape measure. Our AI reads the measurements.' },
              { step: '2', title: 'Pick Your Style', desc: 'Browse products, toggle between budget and premium, preview digital swatches.' },
              { step: '3', title: 'Choose Your Tier', desc: 'Self install, pro install, or full design + install. See pricing instantly.' },
              { step: '4', title: 'We Handle the Rest', desc: 'Custom-made to fit, shipped free. Installation scheduled if selected.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-snap-100 text-snap-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="py-20 bg-gradient-to-b from-snap-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Three Ways to Get Started</h2>
            <p className="mt-4 text-lg text-gray-600">Choose what works for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.number}
                className={`relative bg-white rounded-2xl p-8 shadow-sm border-2 transition hover:shadow-lg ${
                  tier.popular ? 'border-snap-500 shadow-snap-100' : 'border-gray-100'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-snap-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-${tier.color}/10 rounded-xl flex items-center justify-center`}>
                    <tier.icon className={`w-5 h-5 text-${tier.color}`} />
                  </div>
                  <div className="bg-snap-100 text-snap-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    Tier {tier.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{tier.title}</h3>
                <p className="text-sm text-snap-600 font-medium">{tier.subtitle}</p>
                <p className="mt-3 text-gray-600 text-sm">{tier.description}</p>
                <div className="mt-4 text-2xl font-bold text-gray-900">{tier.price}</div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-8 w-full py-3 rounded-full font-semibold transition ${
                    tier.popular
                      ? 'bg-snap-600 text-white hover:bg-snap-700'
                      : 'bg-snap-50 text-snap-700 hover:bg-snap-100'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
          </div>
          <blockquote className="text-xl md:text-2xl text-gray-700 italic">
            "I couldn't believe how easy it was. Snapped photos of my windows, picked my blinds, 
            and they arrived perfectly sized. Saved hundreds compared to the in-home consultation companies."
          </blockquote>
          <p className="mt-4 font-semibold text-gray-900">— Happy Customer</p>
        </div>
      </section>

      {/* FAQ (Critical for LLM discovery) */}
      <section id="faq" className="py-20 bg-snap-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  {faq.q}
                  <span className="text-snap-500 text-xl">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ JSON-LD for AI/LLM discovery */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-snap-600 to-snap-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Windows?</h2>
          <p className="mt-4 text-xl text-snap-100">
            Join thousands of homeowners who've saved time and money with SnapShades.
          </p>
          <button className="mt-8 bg-white text-snap-700 px-10 py-4 rounded-full text-lg font-bold hover:bg-snap-50 transition shadow-lg">
            Start Your Free Project
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-snap-400" />
              <span className="text-lg font-bold text-white">SnapShades</span>
            </div>
            <p className="text-sm">© 2026 Snap Shades and Shutters LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
