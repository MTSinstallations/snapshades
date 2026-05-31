import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * HeroSection — full-bleed Modern DTC hero for the landing page.
 *
 * Positioning: DIY + savings. The customer does the work themselves with our
 * guidance; the payoff is big savings (no showroom markup, direct from
 * manufacturer). "Snap. Measure. Shade." describes the three-step process
 * the customer walks through — *they* do it, we give them the tools.
 *
 * When real photography lands in public/images/hero/fabric-closeup-1.jpg, the
 * background image swaps in over the current fabric-texture CSS gradient. No
 * code change needed — just drop the file in and run images:optimize.
 */

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-sand">
      {/* Layered background: fabric-texture CSS until real photo lands */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(at 80% 20%, #F2E2C2 0%, transparent 40%), " +
            "radial-gradient(at 20% 80%, #E4C9A0 0%, transparent 45%), " +
            "radial-gradient(at 50% 50%, #F5F2ED 0%, #E8DFD0 70%)",
        }}
        aria-hidden
      />
      {/* Subtle noise/texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.22 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-medium uppercase tracking-[0.15em] text-warm-gray-500"
          >
            Custom blinds. <span className="text-clay">Direct.</span> Cheaper.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-5xl sm:text-6xl md:text-7xl font-bold text-ink tracking-display leading-[1.02]"
          >
            Snap.<span className="text-warm-gray-300">.</span>
            <br />
            Measure.<span className="text-warm-gray-300">.</span>
            <br />
            <span className="text-clay">Shade.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-lg md:text-xl text-warm-gray-500 max-w-xl leading-relaxed"
          >
            Skip the showroom. Skip the markup. We walk you through measuring, choosing,
            and ordering your own custom window coverings — direct from Norman, Levolor,
            and Onyx. You do the work. You <span className="text-ink font-semibold">save up to 60%</span>.
          </motion.p>

          {/* 1-2-3: the whole order in three steps */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-warm-gray-500"
          >
            {["Measure", "Customize", "Pay"].map((label, i) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-clay/15 text-clay text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-ink">{label}</span>
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Link
              to="/order"
              className="inline-flex items-center justify-center gap-2 bg-clay hover:bg-clay-hover text-primary-foreground px-7 py-4 rounded-md text-base font-semibold shadow-sm transition-colors"
            >
              Order in 3 Steps
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/swatches/order"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-ink border border-ink/20 hover:border-ink/40 px-7 py-4 rounded-md text-base font-semibold transition-colors"
            >
              Free Swatches
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-6 text-xs text-warm-gray-500"
          >
            Know your measurements? You&apos;re 60 seconds from done.{" "}
            <Link to="/start" className="text-ink font-semibold underline-offset-2 hover:underline">New to this? We&apos;ll guide you →</Link>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
