import { useMemo, useRef, useEffect } from "react";

/**
 * MeasurementPicker — tap-based inch + fraction selector.
 *
 * Replaces numeric text input across the measurement flow. Customer taps
 * a whole-inch button, then a fraction chip. Composed value emits as a
 * decimal through onChange. The whole-inch row is a horizontally-scrolling
 * grid that auto-scrolls the selected value into view.
 *
 * Decimal value <-> {whole, fraction} conversions are pure; selecting
 * either axis updates the composed decimal immediately so the downstream
 * components (diagram, price calculator, form) see live updates.
 */

interface Fraction {
  label: string;
  value: string; // "", "1/8", "1/4", ...
  decimal: number;
}

const FRACTIONS: Fraction[] = [
  { label: "0", value: "", decimal: 0 },
  { label: "⅛", value: "1/8", decimal: 0.125 },
  { label: "¼", value: "1/4", decimal: 0.25 },
  { label: "⅜", value: "3/8", decimal: 0.375 },
  { label: "½", value: "1/2", decimal: 0.5 },
  { label: "⅝", value: "5/8", decimal: 0.625 },
  { label: "¾", value: "3/4", decimal: 0.75 },
  { label: "⅞", value: "7/8", decimal: 0.875 },
];

interface MeasurementPickerProps {
  /** Current decimal value (e.g. 54.75). 0 or empty means nothing selected yet. */
  value: number | null;
  /** Called with the new decimal value whenever whole or fraction changes. */
  onChange: (decimal: number) => void;
  /** Minimum whole inches. Width/height defaults to 10, depth to 1. */
  min?: number;
  /** Maximum whole inches. Width/height defaults to 120, depth to 10. */
  max?: number;
  /** Visual style: 'standard' (width/height) or 'compact' (depth — smaller grid). */
  variant?: "standard" | "compact";
  /** Unit label shown after the live value. Default: 'in'. */
  unit?: string;
  /** Called when the user taps a fraction chip (after picking a whole) —
   *  the "I'm done with this measurement" signal. The modal uses this to
   *  auto-advance width → height → depth. */
  onCommit?: () => void;
}

/** Decompose a decimal into whole inches + matching fraction entry. */
function decompose(decimal: number | null): { whole: number | null; fraction: Fraction } {
  if (decimal == null || isNaN(decimal) || decimal <= 0) return { whole: null, fraction: FRACTIONS[0] };
  const whole = Math.floor(decimal);
  const frac = decimal - whole;
  // Find the nearest fraction (within 1/32" tolerance)
  const best = FRACTIONS.reduce((acc, f) =>
    Math.abs(f.decimal - frac) < Math.abs(acc.decimal - frac) ? f : acc
  , FRACTIONS[0]);
  return { whole, fraction: best };
}

function formatLive(whole: number | null, fraction: Fraction): string {
  if (whole == null) return "—";
  return fraction.value === "" ? `${whole}` : `${whole} ${fraction.label}`;
}

export default function MeasurementPicker({
  value,
  onChange,
  min = 10,
  max = 120,
  variant = "standard",
  unit = "in",
  onCommit,
}: MeasurementPickerProps) {
  const { whole, fraction } = useMemo(() => decompose(value), [value]);

  const wholeNumbers = useMemo(() => {
    const out: number[] = [];
    for (let i = min; i <= max; i++) out.push(i);
    return out;
  }, [min, max]);

  const selectWhole = (n: number) => {
    onChange(n + fraction.decimal);
  };

  const selectFraction = (f: Fraction) => {
    if (whole == null) return; // fraction without a whole is meaningless
    onChange(whole + f.decimal);
    // Fire commit callback so parent can auto-advance to the next field.
    // Deferred to next tick so the parent's state update from onChange
    // has time to flush before the advance re-renders.
    if (onCommit) {
      queueMicrotask(onCommit);
    }
  };

  // Auto-scroll the selected whole-inch into view when it changes externally
  // (e.g. when AI tape-measure fills in the value).
  const wholeRowRef = useRef<HTMLDivElement | null>(null);
  const selectedBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // jsdom (test env) doesn't implement scrollIntoView — guard accordingly.
    if (
      selectedBtnRef.current &&
      wholeRowRef.current &&
      typeof selectedBtnRef.current.scrollIntoView === "function"
    ) {
      selectedBtnRef.current.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [whole]);

  // Layout tuning
  const gridColsClass =
    variant === "compact"
      ? "grid-cols-5"
      : "grid-cols-6 sm:grid-cols-8 md:grid-cols-10";

  return (
    <div className="space-y-4">
      {/* Live value readout */}
      <div className="flex items-baseline justify-center gap-1.5">
        <span className="text-3xl font-bold text-ink tabular-nums tracking-tight">
          {formatLive(whole, fraction)}
        </span>
        <span className="text-sm text-warm-gray-500 font-medium">{unit}</span>
      </div>

      {/* Whole-inch grid */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500">
            Whole inches
          </p>
          {whole != null && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="text-[11px] text-warm-gray-500 hover:text-clay font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div
          ref={wholeRowRef}
          className={`grid ${gridColsClass} gap-1.5 max-h-48 overflow-y-auto overflow-x-hidden p-1 rounded-md bg-sand-deep/40 border border-border`}
        >
          {wholeNumbers.map((n) => {
            const isSelected = whole === n;
            return (
              <button
                key={n}
                type="button"
                ref={isSelected ? selectedBtnRef : null}
                onClick={() => selectWhole(n)}
                aria-pressed={isSelected}
                className={`py-2.5 rounded text-sm font-semibold tabular-nums transition-colors ${
                  isSelected
                    ? "bg-ink text-primary-foreground shadow-sm"
                    : "bg-card text-ink hover:bg-sand-deep border border-border"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fraction chips */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500 mb-1.5">
          Fraction
        </p>
        <div className="grid grid-cols-8 gap-1.5">
          {FRACTIONS.map((f) => {
            const isSelected = fraction.value === f.value;
            const disabled = whole == null && f.value !== "";
            return (
              <button
                key={f.value || "zero"}
                type="button"
                onClick={() => selectFraction(f)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={`py-2.5 rounded text-base font-semibold tabular-nums transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSelected
                    ? "bg-clay text-primary-foreground shadow-sm"
                    : "bg-card text-ink hover:bg-sand-deep border border-border"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
