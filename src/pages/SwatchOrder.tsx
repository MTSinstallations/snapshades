import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Mail, Package, Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getAiSessionId } from "@/lib/ai-session";
import { ALL_SWATCHES, type Swatch } from "@/data/norman-swatches";

/**
 * SwatchOrder — the primary funnel entry. Customer orders free physical
 * swatch samples by mail. Placing an order today locks today's price for 30
 * days (SelectBlinds-inspired commitment escalator).
 *
 * Sources for initial swatch selection, in priority order:
 *   1. ?ids=id1,id2,id3  — direct link from Swatches.tsx or PDP
 *   2. localStorage snapshades_swatches — accumulated via FabricSelector
 *      during MeasureWizard / AddWindowForm
 *   3. A curated 12-pack of popular neutrals if the user arrives cold
 */

const LS_SELECTED = "snapshades_swatches";
const MAX_SWATCHES = 15;
const PRICE_LOCK_DAYS = 30;

// Curated fallback — popular neutrals across product lines, covering all four
// opacity ranges. Matches the "Most Popular Swatches" pattern from The Shade
// Store.
const CURATED_STARTER_IDS = [
  "portrait-hc-C5004", // Cloud White
  "portrait-hc-C5501", // Jersey Cream
  "portrait-hc-C5503", // Oatmeal
  "perfectsheer-PS-Snow",
  "perfectsheer-PS-Chablis",
  "centerpiece-CP-Ivory",
  "centerpiece-CP-Linen",
  "soluna-SR-Seabrook",
  "soluna-SR-Midnight",
  "smartdrape-SD-Arctic",
  "smartdrape-SD-Harbor",
  "ultimate-FW-Walnut",
];

interface FormState {
  name: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal: "",
};

function resolveSwatches(ids: string[]): Swatch[] {
  const set = new Set(ids);
  return ALL_SWATCHES.filter((s) => set.has(s.id));
}

function loadSelectedFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(LS_SELECTED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // persistent-cart.ts writes { windowId: {...} } — extract swatchId from values.
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
      const values = Object.values(parsed) as Array<{ swatchId?: string }>;
      return values.map((v) => v.swatchId).filter((id): id is string => typeof id === "string");
    }
    return [];
  } catch {
    return [];
  }
}

function persistSelectedIds(ids: string[]) {
  try {
    localStorage.setItem(LS_SELECTED + "_order", JSON.stringify(ids));
  } catch {
    // noop
  }
}

export default function SwatchOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ priceLockUntil: string } | null>(null);

  // Resolve initial selection on mount.
  useEffect(() => {
    const fromUrl = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
    const fromStorage = loadSelectedFromStorage();
    let initial = fromUrl.length > 0 ? fromUrl : fromStorage;
    if (initial.length === 0) initial = CURATED_STARTER_IDS;
    setSelectedIds(initial.slice(0, MAX_SWATCHES));
  }, [searchParams]);

  // Persist selection so refresh doesn't blow it away.
  useEffect(() => {
    if (selectedIds.length > 0) persistSelectedIds(selectedIds);
  }, [selectedIds]);

  const selectedSwatches = useMemo(() => resolveSwatches(selectedIds), [selectedIds]);

  function removeSwatch(id: string) {
    setSelectedIds((ids) => ids.filter((x) => x !== id));
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const formComplete =
    form.name.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) &&
    form.address_line1.trim().length > 1 &&
    form.city.trim().length > 1 &&
    form.state.trim().length > 0 &&
    /^\d{5}(-\d{4})?$/.test(form.postal.trim());

  const canSubmit = formComplete && selectedIds.length > 0 && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("swatch_requests")
      .insert({
        email: form.email.trim(),
        name: form.name.trim(),
        user_id: user?.id ?? null,
        session_id: user ? null : getAiSessionId(),
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        postal: form.postal.trim(),
        country: "US",
        swatch_ids: selectedIds,
      })
      .select("price_lock_until")
      .single();

    setSubmitting(false);

    if (error) {
      toast.error("Couldn't submit your request", {
        description: error.message,
      });
      return;
    }

    const lockDate = new Date(
      data?.price_lock_until ?? Date.now() + PRICE_LOCK_DAYS * 24 * 60 * 60 * 1000
    );
    setSuccess({
      priceLockUntil: lockDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    });

    try {
      localStorage.removeItem(LS_SELECTED + "_order");
    } catch { /* noop */ }
  }

  // ── Success ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-clay/10 text-clay mb-6">
              <Check className="w-8 h-8" strokeWidth={2.25} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
              Swatches on the way.
            </h1>
            <p className="mt-4 text-warm-gray-500 leading-relaxed">
              We&apos;ll ship them out within 1 business day. Check your inbox for confirmation.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-md bg-clay/5 border border-clay/20 px-4 py-3 text-sm">
              <Sparkles className="w-4 h-4 text-clay" />
              <span className="text-ink">
                Your price is locked until{" "}
                <strong className="font-semibold">{success.priceLockUntil}</strong>.
              </span>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-clay hover:bg-clay-hover text-primary-foreground rounded-md px-6 font-semibold"
              >
                <Link to="/measure/photo">
                  Start measuring →
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-md px-6">
                <Link to="/products">Keep browsing</Link>
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-warm-gray-500 hover:text-ink mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-[1fr,1.1fr] gap-10">
          {/* Left: selection */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-warm-gray-500">
              Step 1 of 2
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-ink tracking-tight">
              Free swatches, shipped tomorrow.
            </h1>
            <p className="mt-3 text-warm-gray-500 leading-relaxed">
              Touch the fabric. See how it looks in your light. Today&apos;s order locks your
              price for <strong className="text-ink">{PRICE_LOCK_DAYS} days</strong>.
            </p>

            <div className="mt-8 rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-clay" />
                  <span className="text-sm font-semibold text-ink">
                    Your swatches ({selectedSwatches.length})
                  </span>
                </div>
                <Link to="/swatches" className="text-xs font-semibold text-clay hover:text-clay-hover">
                  Browse more →
                </Link>
              </div>
              {selectedSwatches.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-warm-gray-500">
                  Your swatch list is empty.{" "}
                  <Link to="/swatches" className="text-clay font-semibold">
                    Pick some colors →
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {selectedSwatches.map((s) => (
                    <li key={s.id} className="px-5 py-3 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-md border border-border flex-shrink-0"
                        style={{ backgroundColor: s.color ?? "#D8D0C4" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{s.name}</p>
                        <p className="text-xs text-warm-gray-500 truncate">{s.collection}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSwatch(s.id)}
                        className="w-8 h-8 rounded-md hover:bg-sand-deep flex items-center justify-center text-warm-gray-500 hover:text-ink"
                        aria-label={`Remove ${s.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="px-5 py-3 bg-sand border-t border-border text-xs text-warm-gray-500">
                Max {MAX_SWATCHES} swatches per order.
              </div>
            </div>
          </div>

          {/* Right: form */}
          <form onSubmit={submit}>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-warm-gray-500">
              Step 2 of 2
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-ink tracking-tight">
              Where should we send them?
            </h2>

            <div className="mt-6 space-y-4">
              <Field label="Your name">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink"
                />
              </Field>
              <Field label="Street address">
                <input
                  type="text"
                  required
                  value={form.address_line1}
                  onChange={(e) => updateField("address_line1", e.target.value)}
                  autoComplete="address-line1"
                  className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink"
                />
              </Field>
              <Field label="Apt / Suite (optional)">
                <input
                  type="text"
                  value={form.address_line2}
                  onChange={(e) => updateField("address_line2", e.target.value)}
                  autoComplete="address-line2"
                  className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink"
                />
              </Field>
              <div className="grid grid-cols-[1fr,90px,120px] gap-3">
                <Field label="City">
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    autoComplete="address-level2"
                    className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink"
                  />
                </Field>
                <Field label="State">
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                    autoComplete="address-level1"
                    className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink uppercase"
                  />
                </Field>
                <Field label="ZIP">
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={form.postal}
                    onChange={(e) => updateField("postal", e.target.value)}
                    autoComplete="postal-code"
                    className="w-full px-3.5 py-2.5 rounded-md border border-border bg-card focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none text-ink"
                  />
                </Field>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full mt-7 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold text-base disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send me these swatches
                </>
              )}
            </Button>

            <p className="mt-4 text-xs text-warm-gray-500 text-center">
              Free shipping. No credit card. No account needed.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}
