import { useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Camera } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import {
  INSPIRATION_ENTRIES,
  INSPIRATION_ROOMS,
  INSPIRATION_STYLES,
  ROOM_FALLBACK_GRADIENT,
  filterInspiration,
  type InspirationEntry,
  type InspirationRoom,
  type InspirationStyle,
} from "@/data/inspiration";
import { PRODUCT_CATEGORIES, getCategoryById } from "@/data/product-categories";

/**
 * /inspiration — filterable room-by-room inspiration gallery.
 *
 * The DIY customer who doesn't know "is that a cellular or roman?" lands
 * here, filters by the room they're shopping for and the style they like,
 * sees rooms that feel like theirs, and clicks a photo to find out what
 * product pairs with it. The lightbox links directly to the PDP.
 *
 * URL state:
 *  - ?room=bedroom
 *  - ?style=modern
 *  - ?category=cellular
 * Filters are combinable (intersect), and shareable — the result of
 * pressing share on a filter state preserves it.
 *
 * Graceful photography fallback: when an image 404s (because dealer-
 * portal shots haven't landed yet), the tile falls back to a warm
 * gradient keyed to the room type, with the caption and product pairing
 * still fully functional.
 */

type FilterRoom = InspirationRoom | "all";
type FilterStyle = InspirationStyle | "all";
type FilterCategory = string | "all";

export default function Inspiration() {
  const [params, setParams] = useSearchParams();
  const [openEntry, setOpenEntry] = useState<InspirationEntry | null>(null);

  const room = (params.get("room") as FilterRoom | null) ?? "all";
  const style = (params.get("style") as FilterStyle | null) ?? "all";
  const categoryId = (params.get("category") as FilterCategory | null) ?? "all";

  const setFilter = useCallback(
    (key: "room" | "style" | "category", value: string) => {
      const next = new URLSearchParams(params);
      if (value === "all") next.delete(key);
      else next.set(key, value);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const entries = useMemo(
    () => filterInspiration(INSPIRATION_ENTRIES, { room, style, categoryId }),
    [room, style, categoryId]
  );

  const activeFilters = [
    room !== "all" && `Room: ${INSPIRATION_ROOMS.find((r) => r.id === room)?.label}`,
    style !== "all" && `Style: ${INSPIRATION_STYLES.find((s) => s.id === style)?.label}`,
    categoryId !== "all" && `Type: ${getCategoryById(categoryId)?.label}`,
  ].filter(Boolean) as string[];

  const clearAll = () => setParams({}, { replace: true });

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Page header */}
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-warm-gray-500">
            Inspiration
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-display text-ink">
            Rooms like yours.
          </h1>
          <p className="mt-3 text-lg text-warm-gray-500 leading-relaxed">
            Not sure whether you need cellular, roller, or shutters? Filter by the
            room you're shopping and the style you like — tap any photo to see what
            paired with it and price it for your window.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-10 space-y-4">
          <FilterRow
            label="Room"
            value={room}
            options={[
              { id: "all", label: "All" },
              ...INSPIRATION_ROOMS.map((r) => ({ id: r.id, label: r.label })),
            ]}
            onChange={(v) => setFilter("room", v)}
          />
          <FilterRow
            label="Style"
            value={style}
            options={[
              { id: "all", label: "All" },
              ...INSPIRATION_STYLES.map((s) => ({ id: s.id, label: s.label })),
            ]}
            onChange={(v) => setFilter("style", v)}
          />
          <FilterRow
            label="Window covering"
            value={categoryId}
            options={[
              { id: "all", label: "All" },
              ...PRODUCT_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
            ]}
            onChange={(v) => setFilter("category", v)}
          />

          {activeFilters.length > 0 && (
            <div className="flex items-center gap-3 pt-2 text-sm text-warm-gray-500">
              <span>{entries.length} result{entries.length === 1 ? "" : "s"}</span>
              <button
                onClick={clearAll}
                className="text-clay hover:text-clay-hover font-medium underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Masonry grid */}
        {entries.length > 0 ? (
          <ul className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {entries.map((entry, i) => (
              <InspirationCard
                key={entry.id}
                entry={entry}
                index={i}
                onClick={() => setOpenEntry(entry)}
              />
            ))}
          </ul>
        ) : (
          <EmptyState onClear={clearAll} />
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {openEntry && (
          <Lightbox entry={openEntry} onClose={() => setOpenEntry(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
                active
                  ? "bg-ink text-primary-foreground border-ink"
                  : "bg-card text-ink border-border hover:border-ink/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function InspirationCard({
  entry,
  index,
  onClick,
}: {
  entry: InspirationEntry;
  index: number;
  onClick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Larger spread for featured tiles
  const aspectClass = entry.featured ? "aspect-[4/5]" : "aspect-[4/3]";

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-4 break-inside-avoid"
    >
      <button
        type="button"
        onClick={onClick}
        className="group w-full block rounded-lg overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-clay/40"
      >
        <div
          className={`${aspectClass} w-full relative`}
          style={imgFailed ? { background: ROOM_FALLBACK_GRADIENT[entry.room] } : undefined}
        >
          {!imgFailed && (
            <img
              src={entry.image}
              alt={entry.alt}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          )}
          {imgFailed && (
            <div className="absolute inset-0 flex flex-col items-end justify-end p-4">
              <span className="text-[10px] uppercase tracking-wider text-white/70 bg-ink/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                Photography coming soon
              </span>
            </div>
          )}
          {/* Overlay strip on hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-primary-foreground text-sm font-medium leading-tight line-clamp-2">
              {entry.alt}
            </p>
            <p className="mt-1 text-[11px] text-primary-foreground/70 uppercase tracking-wider">
              {INSPIRATION_STYLES.find((s) => s.id === entry.style)?.label} ·{" "}
              {INSPIRATION_ROOMS.find((r) => r.id === entry.room)?.label}
            </p>
          </div>
        </div>
      </button>
    </motion.li>
  );
}

// ────────────────────────────────────────────────────────────────────

function Lightbox({ entry, onClose }: { entry: InspirationEntry; onClose: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const pairedCategories = entry.categoryIds
    .map((id) => getCategoryById(id))
    .filter((c): c is NonNullable<ReturnType<typeof getCategoryById>> => !!c);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card rounded-xl max-w-3xl w-full overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur hover:bg-card flex items-center justify-center text-ink shadow z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="aspect-[16/10] relative"
          style={imgFailed ? { background: ROOM_FALLBACK_GRADIENT[entry.room] } : undefined}
        >
          {!imgFailed && (
            <img
              src={entry.image}
              alt={entry.alt}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {imgFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary-foreground/80">
              <Camera className="w-10 h-10" />
              <p className="text-sm">Photography coming soon</p>
            </div>
          )}
        </div>

        <div className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500">
            {INSPIRATION_STYLES.find((s) => s.id === entry.style)?.label} ·{" "}
            {INSPIRATION_ROOMS.find((r) => r.id === entry.room)?.label}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-ink tracking-tight">
            {entry.alt}
          </h3>
          {entry.caption && (
            <p className="mt-2 text-sm text-warm-gray-500 leading-relaxed">{entry.caption}</p>
          )}

          {pairedCategories.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray-500 mb-3">
                Paired with
              </p>
              <ul className="space-y-2">
                {pairedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/products?category=${cat.id}`}
                      className="flex items-center justify-between gap-4 rounded-md border border-border hover:border-clay px-4 py-3 group transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{cat.label}</p>
                        <p className="text-xs text-warm-gray-500">
                          Price this category for your window
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-warm-gray-500 group-hover:text-clay group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/start"
                className="mt-4 inline-flex items-center gap-2 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md px-5 py-2.5 text-sm font-semibold"
              >
                Price this for my window
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-16 text-center py-16 border border-dashed border-border rounded-lg">
      <p className="text-sm text-warm-gray-500">No rooms match this combination yet.</p>
      <button
        onClick={onClear}
        className="mt-3 text-sm font-medium text-clay hover:text-clay-hover underline underline-offset-4"
      >
        Clear all filters
      </button>
    </div>
  );
}
