import { Check, X } from "lucide-react";

/**
 * TapeMeasureExamples — illustrated good vs bad example grid for the AI
 * tape-measure flow. Shown in the first-time coaching modal and again in
 * the low-confidence rejection state so the customer sees exactly what
 * went wrong with their photo.
 *
 * Rendered entirely in SVG so there are no photo licensing concerns and
 * no external asset dependencies. Each example is ~160×120 and highlights
 * ONE decision that flips the result: angle, distance, focus, framing,
 * tape position against the surface.
 *
 * Accepts `variant` so the component can shrink when embedded inline.
 */

type ExampleKind =
  | "good-flush-closeup"
  | "good-hook-against-edge"
  | "bad-angled"
  | "bad-too-far"
  | "bad-blurry"
  | "bad-not-against-surface";

interface ExampleTile {
  kind: ExampleKind;
  good: boolean;
  label: string;
  note: string;
}

const TILES: ExampleTile[] = [
  { kind: "good-flush-closeup", good: true, label: "Perpendicular, close-up", note: "Tape flat on the frame, number clearly at the edge." },
  { kind: "good-hook-against-edge", good: true, label: "Hook catching the trim", note: "Tape hook pulled taut against the face of the opening." },
  { kind: "bad-angled", good: false, label: "Don't shoot at an angle", note: "Perspective skew hides the exact inch mark." },
  { kind: "bad-too-far", good: false, label: "Don't stand back", note: "Numbers too small for the AI to read reliably." },
  { kind: "bad-blurry", good: false, label: "Don't let it blur", note: "Tap the number on screen to lock focus before snapping." },
  { kind: "bad-not-against-surface", good: false, label: "Keep tape against the frame", note: "If the tape floats, there's nothing to measure to." },
];

interface TapeMeasureExamplesProps {
  /** Compact = 3-col smaller tiles for inline rejection states.
   *  Standard = 2-col larger tiles for the coaching modal. */
  variant?: "standard" | "compact";
  /** Filter to only the kinds of examples relevant to the caller. */
  show?: "all" | "good" | "bad";
}

export default function TapeMeasureExamples({ variant = "standard", show = "all" }: TapeMeasureExamplesProps) {
  const tiles = TILES.filter((t) => (show === "all" ? true : show === "good" ? t.good : !t.good));
  const cols = variant === "compact" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2";

  return (
    <ul className={`grid ${cols} gap-2.5`}>
      {tiles.map((tile) => (
        <li
          key={tile.kind}
          className={`rounded-md border overflow-hidden bg-card ${
            tile.good ? "border-emerald-200" : "border-rose-200"
          }`}
        >
          <div className="relative aspect-[4/3] bg-sand-deep/40">
            <ExampleSvg kind={tile.kind} />
            <span
              className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                tile.good ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {tile.good ? <Check className="w-3 h-3" strokeWidth={3} /> : <X className="w-3 h-3" strokeWidth={3} />}
              {tile.good ? "Do" : "Don't"}
            </span>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-xs font-semibold text-ink leading-tight">{tile.label}</p>
            <p className="text-[11px] text-warm-gray-500 leading-snug mt-0.5">{tile.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** One SVG per example kind. Stylised illustration of a tape measure on
 *  a window edge, clear enough to make the decision-critical element
 *  visible (angle, distance, focus, contact with surface). */
function ExampleSvg({ kind }: { kind: ExampleKind }) {
  const common = {
    className: "absolute inset-0 w-full h-full",
    viewBox: "0 0 160 120",
    xmlns: "http://www.w3.org/2000/svg",
  };

  const wallFill = "#D9CDB6";
  const frameFill = "#E6D3B0";
  const frameEdge = "#7A5D36";
  const tapeFill = "url(#tape-grad)";
  const tapeInk = "#221605";

  const defs = (
    <defs>
      <linearGradient id="tape-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B7851E" />
        <stop offset="0.3" stopColor="#F8D15E" />
        <stop offset="0.6" stopColor="#E9B43C" />
        <stop offset="1" stopColor="#B7851E" />
      </linearGradient>
      <filter id="blur-filter">
        <feGaussianBlur stdDeviation="2" />
      </filter>
    </defs>
  );

  // The "frame edge" is a vertical line at x=70 — the target of measurement.
  // Room is left, window glass area is right.
  const backdrop = (
    <>
      <rect x="0" y="0" width="70" height="120" fill={wallFill} />
      <rect x="70" y="0" width="20" height="120" fill={frameFill} />
      <line x1="70" y1="0" x2="70" y2="120" stroke={frameEdge} strokeWidth="1.2" />
      <rect x="90" y="0" width="70" height="120" fill="#DDEAF2" />
      <line x1="90" y1="0" x2="90" y2="120" stroke="#6A8A9C" strokeWidth="0.8" />
    </>
  );

  switch (kind) {
    case "good-flush-closeup":
      return (
        <svg {...common}>
          {defs}
          {backdrop}
          {/* Tape running horizontally, perpendicular to frame, flush */}
          <rect x="20" y="55" width="55" height="16" fill={tapeFill} stroke={tapeInk} strokeWidth="0.6" />
          {/* Tick marks */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={22 + i * 5.5} y1="55" x2={22 + i * 5.5} y2={55 + (i % 4 === 0 ? 6 : 3)} stroke={tapeInk} strokeWidth="0.6" />
          ))}
          {/* Inch number visible */}
          <text x="37" y="66" fill={tapeInk} fontSize="7" fontWeight="700" fontFamily="ui-sans-serif">36</text>
          {/* Hook catching the frame edge */}
          <rect x="72" y="52" width="3" height="22" fill="#3A342C" />
          {/* Subtle focus indicator — crosshair over the number */}
          <circle cx="40" cy="63" r="9" fill="none" stroke="#10B981" strokeWidth="1.2" strokeDasharray="1.5 1.5" opacity="0.9" />
        </svg>
      );

    case "good-hook-against-edge":
      return (
        <svg {...common}>
          {defs}
          {backdrop}
          {/* Tape pulled taut across the opening */}
          <rect x="15" y="54" width="120" height="14" fill={tapeFill} stroke={tapeInk} strokeWidth="0.6" />
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={i} x1={17 + i * 5.4} y1="54" x2={17 + i * 5.4} y2={54 + (i % 4 === 0 ? 6 : 3)} stroke={tapeInk} strokeWidth="0.55" />
          ))}
          {/* Hook at the face of the opening */}
          <path d="M 68 49 L 72 49 L 72 73 L 68 73 Z" fill="#3A342C" />
          {/* Green arrow pointing to the hook */}
          <path d="M 78 40 L 73 49 M 73 49 L 76 45 M 73 49 L 78 46" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      );

    case "bad-angled":
      return (
        <svg {...common}>
          {defs}
          {backdrop}
          {/* Tape drawn with a skew transform — perspective */}
          <g transform="rotate(22 70 60)">
            <rect x="20" y="55" width="70" height="16" fill={tapeFill} stroke={tapeInk} strokeWidth="0.6" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1={22 + i * 5.5} y1="55" x2={22 + i * 5.5} y2={55 + (i % 4 === 0 ? 6 : 3)} stroke={tapeInk} strokeWidth="0.55" />
            ))}
            <text x="40" y="66" fill={tapeInk} fontSize="7" fontWeight="700">36</text>
          </g>
          {/* Red X overlay */}
          <line x1="20" y1="20" x2="140" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="140" y1="20" x2="20" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        </svg>
      );

    case "bad-too-far":
      return (
        <svg {...common}>
          {defs}
          {backdrop}
          {/* Smaller tape, further back */}
          <rect x="40" y="62" width="30" height="6" fill={tapeFill} stroke={tapeInk} strokeWidth="0.4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={41 + i * 3.5} y1="62" x2={41 + i * 3.5} y2="65" stroke={tapeInk} strokeWidth="0.3" />
          ))}
          {/* Zoom-out indicators (corner brackets) */}
          <path d="M 8 8 L 18 8 M 8 8 L 8 18" stroke="#6B655C" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 152 8 L 142 8 M 152 8 L 152 18" stroke="#6B655C" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 8 112 L 18 112 M 8 112 L 8 102" stroke="#6B655C" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 152 112 L 142 112 M 152 112 L 152 102" stroke="#6B655C" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Red X overlay */}
          <line x1="20" y1="20" x2="140" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="140" y1="20" x2="20" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        </svg>
      );

    case "bad-blurry":
      return (
        <svg {...common}>
          {defs}
          {backdrop}
          {/* Blurred tape */}
          <g filter="url(#blur-filter)">
            <rect x="20" y="55" width="55" height="16" fill={tapeFill} stroke={tapeInk} strokeWidth="0.6" />
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={i} x1={22 + i * 5.5} y1="55" x2={22 + i * 5.5} y2={55 + (i % 4 === 0 ? 6 : 3)} stroke={tapeInk} strokeWidth="0.6" />
            ))}
            <text x="37" y="66" fill={tapeInk} fontSize="7" fontWeight="700">36</text>
          </g>
          {/* Red X overlay */}
          <line x1="20" y1="20" x2="140" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="140" y1="20" x2="20" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        </svg>
      );

    case "bad-not-against-surface":
      return (
        <svg {...common}>
          {defs}
          {backdrop}
          {/* Tape floating in the air above the frame, not touching */}
          <rect x="20" y="38" width="55" height="16" fill={tapeFill} stroke={tapeInk} strokeWidth="0.6" />
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={22 + i * 5.5} y1="38" x2={22 + i * 5.5} y2={38 + (i % 4 === 0 ? 6 : 3)} stroke={tapeInk} strokeWidth="0.6" />
          ))}
          <text x="37" y="49" fill={tapeInk} fontSize="7" fontWeight="700">36</text>
          {/* Gap indicator */}
          <path d="M 52 55 L 52 68" stroke="#E11D48" strokeWidth="1.2" strokeDasharray="2 2" />
          <text x="54" y="64" fill="#E11D48" fontSize="7" fontWeight="600">gap</text>
          {/* Red X overlay */}
          <line x1="20" y1="20" x2="140" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="140" y1="20" x2="20" y2="100" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        </svg>
      );
  }
}
