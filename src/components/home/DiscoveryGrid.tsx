import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DISCOVERY, type DiscoveryTile } from "@/data/discovery-taxonomy";

/**
 * DiscoveryGrid — Shop by Room / Need / Style.
 *
 * Three parallel entry points that meet non-expert shoppers where they are.
 * Each tile lands in a pre-filtered Products.tsx view. Until real room
 * photography lands, the tile backgrounds use the per-tile CSS gradient
 * defined in discovery-taxonomy.ts.
 */

export default function DiscoveryGrid() {
  return (
    <section className="bg-sand-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-warm-gray-500">
            Start browsing
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-ink tracking-tight">
            Three ways to find your look.
          </h2>
          <p className="mt-3 text-warm-gray-500">
            Not sure whether you need a cellular shade or a roller? Shop by the room, the
            problem you&apos;re solving, or the aesthetic you love — we&apos;ll match you to the
            right product.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {DISCOVERY.map((section) => (
            <DiscoveryColumn key={section.id} title={section.title} tiles={section.tiles} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscoveryColumn({ title, tiles }: { title: string; tiles: DiscoveryTile[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">{title}</h3>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map((tile, i) => (
          <motion.li
            key={tile.slug}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={tile.route}
              className="group block aspect-[4/5] rounded-lg overflow-hidden relative border border-transparent hover:border-ink/10 transition-colors"
              style={{
                background: tile.gradient ?? "var(--sand)",
              }}
            >
              {/* Image swaps in when a real photo lands at tile.image */}
              {tile.image && (
                <img
                  src={tile.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "1";
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-primary-foreground text-sm font-semibold tracking-tight drop-shadow">
                  {tile.label}
                </h4>
                <p className="mt-0.5 text-primary-foreground/80 text-xs leading-tight drop-shadow">
                  {tile.blurb}
                </p>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
