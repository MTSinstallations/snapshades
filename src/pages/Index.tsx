import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Star, ArrowRight, CheckCircle, ChevronDown, Smartphone, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn, StaggerList, StaggerItem, HoverScale, PageTransition } from '@/components/ux';
import { MagneticButton } from '@/components/ux';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/layout/SiteHeader';
import HeroSection from '@/components/home/HeroSection';
import DiscoveryGrid from '@/components/home/DiscoveryGrid';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: 'How does the photo measurement system work?', a: 'Place a standard tape measure on your window and snap a photo with your phone. Our AI reads the tape measure from the photo and enters the measurements for you — no math required.' },
  { q: 'What types of window coverings do you sell?', a: 'We sell blinds (faux wood, wood, aluminum), shades (roller, cellular/honeycomb, roman, sheer), and plantation shutters — all custom-made by top manufacturers like Norman® and Levolor® to fit your windows perfectly.' },
  { q: 'How long does delivery take?', a: 'Custom orders ship in 4-6 weeks for shades and blinds, 6-8 weeks for shutters. Shipping rates are calculated at checkout based on your ZIP code.' },
  { q: 'Can I see samples before ordering?', a: 'Yes! Browse our digital swatch gallery online to preview colors and materials. Request free physical swatches shipped to your door.' },
  { q: 'What is the cheapest way to buy custom blinds online?', a: 'We sell direct from the manufacturer at a guaranteed lowest price — up to 60% below retail. No middleman, no showroom overhead.' },
  { q: 'Do you offer a guarantee?', a: 'Yes. Our Price Guarantee means you won\'t find a lower price anywhere. If your window treatment doesn\'t fit due to a measurement error, we\'ll work with you to make it right.' },
  { q: 'What manufacturers do you carry?', a: 'We carry Norman® (premium), Levolor® (mid-range), and Onyx (budget) — giving you options at every price point, all custom-made to your exact measurements.' },
];

export default function Index() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <HeroSection />

      <DiscoveryGrid />

      {/* Legacy hero content kept for the FAQ/how-it-works sections below.
          Phase 10 retrofit will harmonize the remaining colors.  */}
      <section style={{ display: 'none' }} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <FadeIn>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10"
              >
                <Camera className="w-4 h-4" />
                Snap a photo of your tape measure — AI reads it for you
              </motion.div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                Custom Window Coverings.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-sky-300">
                  Less Money.
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Straight from the manufacturer to your door — just less money. Measure with your phone, order online, delivered custom-made.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton
                  className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 rounded-full px-8 py-4 text-lg font-bold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                  onClick={() => navigate("/start")}
                >
                  Start Your Project <ArrowRight className="w-5 h-5" />
                </MagneticButton>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/products")}
                  className="w-full sm:w-auto border-2 border-white/20 text-white rounded-full px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Browse Products
                </motion.button>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
                {['Price Guarantee', 'Direct from Manufacturer', 'AI-Powered Measuring'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-400" /> {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* QR Callout */}
      <FadeIn>
        <section className="py-12 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 text-white text-center md:text-left">
            <Smartphone className="w-10 h-10 text-blue-200" />
            <div>
              <h3 className="text-xl font-bold">On a computer? No problem.</h3>
              <p className="text-blue-100 mt-1">Start here, then scan a QR code to continue on your phone for photo measurements.</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/swatches')}
              className="bg-white text-blue-700 hover:bg-blue-50 rounded-full px-6 py-2.5 font-medium whitespace-nowrap">
              Browse Fabrics
            </motion.button>
          </div>
        </section>
      </FadeIn>

      {/* Featured Fabrics Showcase */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">150+ Premium Fabrics</h2>
              <p className="mt-2 text-gray-600">From sheer to blackout — Norman®, Levolor®, and more</p>
            </div>
          </FadeIn>
          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex gap-3" style={{ width: 'max-content' }}>
              {[
                { name: 'Cloud White', collection: 'Portrait Honeycomb', img: 'https://normanusa.com/app/uploads/2020/03/C5004-Cloud-White.jpg', color: '#F8F6F0' },
                { name: 'Jersey Cream', collection: 'Portrait Honeycomb', img: 'https://normanusa.com/app/uploads/2020/03/C5501-Jersey-Cream.jpg', color: '#F5F0E1' },
                { name: 'Snow', collection: 'Perfect Sheer', img: 'https://normanusa.com/app/uploads/2020/03/PS-Snow.jpg', color: '#FAFAFA' },
                { name: 'Walnut', collection: 'Faux Wood', img: 'https://normanusa.com/app/uploads/2020/03/FW-Walnut.jpg', color: '#5C4033' },
                { name: 'Ivory', collection: 'Roman Shade', img: 'https://normanusa.com/app/uploads/2020/03/RS-Ivory.jpg', color: '#FFFFF0' },
                { name: 'Midnight', collection: 'Soluna Roller', img: 'https://normanusa.com/app/uploads/2021/06/SR-Midnight.jpg', color: '#1A1A2E' },
                { name: 'Oatmeal', collection: 'Portrait Honeycomb', img: 'https://normanusa.com/app/uploads/2020/03/C5503-Oatmeal.jpg', color: '#C8BFA8' },
                { name: 'Seabrook', collection: 'Soluna Roller', img: 'https://normanusa.com/app/uploads/2021/06/SR-Seabrook.jpg', color: '#D4C5A9' },
              ].map((swatch, i) => (
                <motion.div
                  key={swatch.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="flex-shrink-0 cursor-pointer group"
                  onClick={() => navigate('/swatches')}
                >
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                    <img src={swatch.img} alt={swatch.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                    <div className="w-full h-full hidden" style={{ backgroundColor: swatch.color }} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-2 text-center">{swatch.name}</p>
                  <p className="text-xs text-gray-400 text-center">{swatch.collection}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/swatches')} variant="outline" className="rounded-full px-6 border-blue-200 text-blue-600 hover:bg-blue-50">
              View All 150+ Swatches <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">Three simple steps to beautiful windows</p>
            </div>
          </FadeIn>
          <StaggerList className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Measure & Snap', desc: 'Place your tape measure on the window, snap a photo. Our AI reads the measurement — no math required.', icon: '📸' },
              { step: '2', title: 'Pick Your Product', desc: 'Browse blinds, shades, and shutters. See real pricing for your exact window size. Choose your favorite.', icon: '🎨' },
              { step: '3', title: 'We Deliver', desc: 'Custom-made by the manufacturer and shipped direct to your door in 4-6 weeks.', icon: '📦' },
            ].map((s) => (
              <StaggerItem key={s.step}>
                <HoverScale>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-blue-50 text-3xl rounded-2xl flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                      {s.icon}
                    </div>
                    <div className="mt-3 inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full">{s.step}</div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{s.title}</h3>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Brand Trust Bar */}
      <section className="py-10 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-blue-300" />
              <p className="font-semibold text-sm">Made in the USA</p>
              <p className="text-xs text-blue-200">Norman® manufacturing in Texas</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="w-8 h-8 text-blue-300" />
              <p className="font-semibold text-sm">Manufacturer Warranty</p>
              <p className="text-xs text-blue-200">Up to 25 years coverage</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-blue-300" />
              <p className="font-semibold text-sm">Price Guarantee</p>
              <p className="text-xs text-blue-200">Lowest price — guaranteed</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 text-blue-300" />
              <p className="font-semibold text-sm">AI Measuring</p>
              <p className="text-xs text-blue-200">Snap a photo, we read it</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition — Why SnapShades */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why SnapShades?</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">We cut out the middleman so you get manufacturer-quality window treatments at the lowest possible price.</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Manufacturer Direct',
                desc: 'We buy direct from Norman®, Levolor®, and Onyx — no retail markup, no showroom overhead. You save up to 60%.',
                icon: '🏭',
              },
              {
                title: 'AI-Powered Measuring',
                desc: 'Just snap a photo of your tape measure. Our AI reads it instantly — no math, no guesswork, no expensive home visit.',
                icon: '📱',
              },
              {
                title: 'Custom Made for You',
                desc: 'Every blind, shade, and shutter is made to your exact window dimensions. Not close — exact.',
                icon: '✂️',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof — single featured quote */}
      <FadeIn>
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed">
              "I couldn't believe how easy it was. Snapped photos of my windows, picked my blinds,
              and they arrived perfectly sized. Saved hundreds compared to in-home consultation companies."
            </blockquote>
            <p className="mt-4 font-semibold text-gray-900">— Early Beta Customer</p>
            <p className="text-sm text-gray-400 mt-1">More reviews coming soon as we launch</p>
          </div>
        </section>
      </FadeIn>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="mt-4 text-gray-600">Everything you need to know about ordering custom window coverings online</p>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} layout className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  <span className="pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <div className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <FadeIn>
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Windows?</h2>
            <p className="mt-4 text-xl text-blue-100">Custom blinds, shades & shutters — direct from the manufacturer at the guaranteed lowest price.</p>
            <MagneticButton
              className="mt-8 bg-white text-blue-700 hover:bg-blue-50 rounded-full px-10 py-4 text-lg font-bold shadow-lg inline-flex items-center gap-2"
              onClick={() => navigate("/start")}
            >
              Start Your Free Project <ArrowRight className="w-5 h-5" />
            </MagneticButton>
            <p className="mt-4 text-blue-200 text-sm">No credit card required to get started</p>
          </div>
        </section>
      </FadeIn>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question', name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }),
      }} />
    </div>
    </PageTransition>
  );
}
