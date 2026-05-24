import { motion } from "framer-motion";

/**
 * WindowDepthDiagram — photo-illustration of the depth measurement.
 *
 * Main scene: side-profile cutaway of a window with a realistic casement
 * crank protruding into the airspace, and a yellow tape measure physically
 * hooked at the face of the opening with its tip resting against the crank
 * knob. The tape reading is the depth.
 *
 * Reference inset (top-right): the same crank drawn from the front — the
 * view the customer sees standing in their room. Helps them recognize
 * which piece of hardware on their window is the obstruction.
 *
 * All rendered in SVG (no external photos — no licensing risk, no bandwidth).
 * Theme-aware: pass `theme="dark"` on StartProject's dark bg; omit for
 * light surfaces.
 */

interface WindowDepthDiagramProps {
  depth?: string;
  theme?: "light" | "dark";
  className?: string;
}

export default function WindowDepthDiagram({
  depth,
  theme = "light",
  className = "",
}: WindowDepthDiagramProps) {
  const isDark = theme === "dark";

  const c = {
    ink: isDark ? "#F2EEE6" : "#151515",
    subtle: isDark ? "#8A8275" : "#6B655C",
    bg: isDark ? "#15130F" : "#FBF8F2",
    cardBg: isDark ? "#1C1915" : "#FFFFFF",
    cardBorder: isDark ? "#3A342C" : "#E0D7C5",

    wallLight: isDark ? "#3E3730" : "#D9CDB6",
    wallMid: isDark ? "#322B24" : "#B8A989",
    wallDark: isDark ? "#251F19" : "#8C7E63",

    woodLight: isDark ? "#9E8870" : "#E6D3B0",
    woodMid: isDark ? "#6E5C48" : "#B48F5E",
    woodDark: isDark ? "#3F3428" : "#7A5D36",
    woodGrain: isDark ? "#2E251C" : "#6B4C26",

    glassTop: isDark ? "#3B4753" : "#DDEAF2",
    glassBottom: isDark ? "#27313C" : "#B8D0DE",
    glassEdge: isDark ? "#4A5A6C" : "#6A8A9C",
    sunRay: isDark ? "#F8E7B8" : "#FFF4D4",

    // Crank — chrome/brushed steel with warm highlights
    metalA: isDark ? "#D8CFBA" : "#EDE5D4", // lightest
    metalB: isDark ? "#A39A82" : "#B0A692", // mid
    metalC: isDark ? "#635947" : "#756A55", // shadow
    metalD: isDark ? "#38322A" : "#3F382D", // deep shadow
    metalHi: "#FFFFFF",

    tapeLight: "#F8D15E",
    tapeMid: "#E9B43C",
    tapeDark: "#B7851E",
    tapeInk: "#221605",

    clay: "#E04E2A",
  };

  // Geometry for the main scene (viewBox 440×260 — gave the top an extra 20px for the inset)
  const FACE_X = 110;
  const GLASS_X = 372;
  const CRANK_TIP_X = 208; // x of the room-side edge of the crank knob
  const OPENING_TOP = 90;
  const OPENING_BOTTOM = 200;
  const SILL_TOP = OPENING_BOTTOM;
  const TAPE_Y = 128;

  return (
    <figure className={`mx-auto ${className}`}>
      {/* Two small reference panels showing the same crank from FRONT and
          SIDE, so the customer can recognize the hardware on their own
          window before measuring. */}
      <div className="grid grid-cols-2 gap-2 mb-3 max-w-md mx-auto">
        <div className={`rounded-md border ${isDark ? "border-[#3A342C] bg-[#1C1915]" : "border-border bg-card"} p-2 flex items-center gap-2`}>
          <svg viewBox="0 0 70 70" className="w-14 h-14 flex-shrink-0">
            <defs>
              <radialGradient id="front-knob" cx="0.3" cy="0.3" r="0.9">
                <stop offset="0" stopColor={c.metalHi} stopOpacity="0.8" />
                <stop offset="0.3" stopColor={c.metalA} />
                <stop offset="0.75" stopColor={c.metalC} />
                <stop offset="1" stopColor={c.metalD} />
              </radialGradient>
              <linearGradient id="front-handle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c.metalA} />
                <stop offset="0.3" stopColor={c.metalB} />
                <stop offset="0.7" stopColor={c.metalC} />
                <stop offset="1" stopColor={c.metalD} />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="36" cy="56" rx="20" ry="2.2" fill="#000" opacity="0.25" />
            {/* Escutcheon — oval mounting plate */}
            <ellipse cx="35" cy="35" rx="26" ry="17" fill="url(#front-knob)" stroke={c.metalD} strokeWidth="0.6" />
            <ellipse cx="35" cy="35" rx="21" ry="12.5" fill="none" stroke={c.metalD} strokeWidth="0.4" opacity="0.55" />
            {/* Two mounting screws */}
            <circle cx="13" cy="35" r="1.6" fill={c.metalD} />
            <line x1="11.3" y1="35" x2="14.7" y2="35" stroke={c.metalHi} strokeWidth="0.55" opacity="0.8" />
            <circle cx="57" cy="35" r="1.6" fill={c.metalD} />
            <line x1="55.3" y1="35" x2="58.7" y2="35" stroke={c.metalHi} strokeWidth="0.55" opacity="0.8" />
            {/* Center boss */}
            <circle cx="35" cy="35" r="6.5" fill="url(#front-knob)" stroke={c.metalD} strokeWidth="0.7" />
            <circle cx="35" cy="35" r="2.2" fill={c.metalD} />
            {/* Folding handle curving down-right */}
            <path d="M 35 35 Q 42 44 50 53" fill="none" stroke="url(#front-handle)" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M 34.3 34.3 Q 41.3 43.3 49.3 52.3" fill="none" stroke={c.metalHi} strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />
            {/* Knob at end of handle */}
            <circle cx="51" cy="54" r="4" fill="url(#front-knob)" stroke={c.metalD} strokeWidth="0.5" />
            <circle cx="49.8" cy="52.8" r="1.1" fill={c.metalHi} opacity="0.85" />
          </svg>
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-warm-gray-500"}`}>Front</p>
            <p className={`text-xs font-medium ${isDark ? "text-white" : "text-ink"}`}>What you see</p>
            <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-warm-gray-500"} leading-tight`}>on your window</p>
          </div>
        </div>

        <div className={`rounded-md border ${isDark ? "border-[#3A342C] bg-[#1C1915]" : "border-border bg-card"} p-2 flex items-center gap-2`}>
          <svg viewBox="0 0 70 70" className="w-14 h-14 flex-shrink-0">
            <defs>
              <linearGradient id="side-handle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c.metalA} />
                <stop offset="0.3" stopColor={c.metalB} />
                <stop offset="0.7" stopColor={c.metalC} />
                <stop offset="1" stopColor={c.metalD} />
              </linearGradient>
              <radialGradient id="side-knob" cx="0.3" cy="0.3" r="0.9">
                <stop offset="0" stopColor={c.metalHi} stopOpacity="0.8" />
                <stop offset="0.3" stopColor={c.metalA} />
                <stop offset="0.75" stopColor={c.metalC} />
                <stop offset="1" stopColor={c.metalD} />
              </radialGradient>
            </defs>
            {/* Sill surface (ground reference line) */}
            <line x1="5" y1="56" x2="65" y2="56" stroke={c.woodDark} strokeWidth="1" />
            {/* Shadow */}
            <ellipse cx="42" cy="59" rx="18" ry="1.8" fill="#000" opacity="0.25" />
            {/* Escutcheon seen edge-on — shallow oval */}
            <ellipse cx="45" cy="54" rx="18" ry="3" fill="url(#side-handle)" stroke={c.metalD} strokeWidth="0.6" />
            {/* Center hub */}
            <ellipse cx="45" cy="50" rx="5" ry="3" fill="url(#side-knob)" stroke={c.metalD} strokeWidth="0.5" />
            {/* Handle curving up and out to the left (toward room) */}
            <path d="M 45 48 Q 32 36 15 28" fill="none" stroke="url(#side-handle)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 44.3 47.3 Q 31.3 35.3 14.3 27.3" fill="none" stroke={c.metalHi} strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />
            {/* Knob at end */}
            <circle cx="14" cy="28" r="4.5" fill="url(#side-knob)" stroke={c.metalD} strokeWidth="0.5" />
            <circle cx="12.5" cy="26.5" r="1.2" fill={c.metalHi} opacity="0.85" />
          </svg>
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-warm-gray-500"}`}>Side</p>
            <p className={`text-xs font-medium ${isDark ? "text-white" : "text-ink"}`}>How it sticks out</p>
            <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-warm-gray-500"} leading-tight`}>into the opening</p>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 440 260" className="w-full h-auto" role="img" aria-label="Side view of a window with a casement crank and a tape measure hooked at the face of the opening, reaching the crank.">
        <defs>
          {/* ── Gradients ─────────────────────────────────────────── */}
          <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.wallLight} />
            <stop offset="0.5" stopColor={c.wallMid} />
            <stop offset="1" stopColor={c.wallDark} />
          </linearGradient>

          <linearGradient id="wood-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.woodMid} />
            <stop offset="0.4" stopColor={c.woodLight} />
            <stop offset="1" stopColor={c.woodMid} />
          </linearGradient>

          <pattern id="wood-grain" patternUnits="userSpaceOnUse" width="8" height="120" patternTransform="rotate(2)">
            <rect width="8" height="120" fill={c.woodLight} />
            <path d="M 1 0 Q 2 30 1 60 Q 0 90 1 120" stroke={c.woodGrain} strokeWidth="0.3" fill="none" opacity="0.35" />
            <path d="M 4 0 Q 5 25 4 55 Q 3 95 4 120" stroke={c.woodGrain} strokeWidth="0.4" fill="none" opacity="0.45" />
            <path d="M 6.5 0 Q 7 40 6.5 80 Q 6 100 6.5 120" stroke={c.woodGrain} strokeWidth="0.35" fill="none" opacity="0.3" />
          </pattern>

          <linearGradient id="sill-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.woodLight} />
            <stop offset="1" stopColor={c.woodDark} />
          </linearGradient>

          <linearGradient id="glass-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.glassTop} />
            <stop offset="1" stopColor={c.glassBottom} />
          </linearGradient>

          <linearGradient id="sunlight" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor={c.sunRay} stopOpacity="0.55" />
            <stop offset="0.6" stopColor={c.sunRay} stopOpacity="0.15" />
            <stop offset="1" stopColor={c.sunRay} stopOpacity="0" />
          </linearGradient>

          {/* Brushed chrome/steel — realistic casement crank finish */}
          <linearGradient id="chrome-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={c.metalC} />
            <stop offset="0.08" stopColor={c.metalB} />
            <stop offset="0.25" stopColor={c.metalA} />
            <stop offset="0.5" stopColor={c.metalB} />
            <stop offset="0.75" stopColor={c.metalA} />
            <stop offset="0.92" stopColor={c.metalB} />
            <stop offset="1" stopColor={c.metalC} />
          </linearGradient>
          <linearGradient id="chrome-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.metalA} />
            <stop offset="0.3" stopColor={c.metalB} />
            <stop offset="0.7" stopColor={c.metalC} />
            <stop offset="1" stopColor={c.metalD} />
          </linearGradient>
          <radialGradient id="chrome-radial" cx="0.3" cy="0.3" r="0.9">
            <stop offset="0" stopColor={c.metalHi} stopOpacity="0.8" />
            <stop offset="0.3" stopColor={c.metalA} />
            <stop offset="0.75" stopColor={c.metalC} />
            <stop offset="1" stopColor={c.metalD} />
          </radialGradient>

          {/* Tape measure */}
          <linearGradient id="tape-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.tapeDark} />
            <stop offset="0.25" stopColor={c.tapeLight} />
            <stop offset="0.5" stopColor={c.tapeMid} />
            <stop offset="0.85" stopColor={c.tapeDark} />
            <stop offset="1" stopColor={c.tapeDark} stopOpacity="0.85" />
          </linearGradient>

          {/* ── Filters ───────────────────────────────────────────── */}
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" />
            <feOffset dx="0.8" dy="1.8" />
            <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id="crank-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" />
            <feOffset dx="1.3" dy="2.2" />
            <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id="wall-texture">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="5" />
            <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.18  0 0 0 0 0.15  0 0 0 0.12 0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feComposite in="SourceGraphic" operator="over" />
          </filter>

          <marker id="dim-left" viewBox="0 0 12 12" refX="1" refY="6" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 12 0 L 0 6 L 12 12" fill="none" stroke={c.clay} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="dim-right" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 12 6 L 0 12" fill="none" stroke={c.clay} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="440" height="260" fill={c.bg} />

        {/* ═══════════════════════════════════════════════════════════
             ROOM WALL (LEFT)
             ═══════════════════════════════════════════════════════════ */}
        <g>
          <rect x="0" y="0" width={FACE_X} height="260" fill="url(#wall-grad)" />
          <rect x="0" y="0" width={FACE_X} height="260" filter="url(#wall-texture)" opacity="0.4" />
          <rect x={FACE_X - 4} y="0" width="4" height="260" fill={c.woodDark} />
          <rect x={FACE_X - 4} y="0" width="1.5" height="260" fill={c.woodLight} opacity="0.5" />
        </g>

        {/* ═══════════════════════════════════════════════════════════
             WINDOW OPENING — airspace, frame, glass
             ═══════════════════════════════════════════════════════════ */}
        <rect x={FACE_X} y={OPENING_TOP + 6} width={GLASS_X - FACE_X} height={OPENING_BOTTOM - OPENING_TOP - 6} fill={isDark ? "#1E1A15" : "#F5EDDC"} />
        <rect x={FACE_X} y={OPENING_TOP + 6} width={GLASS_X - FACE_X} height={OPENING_BOTTOM - OPENING_TOP - 6} fill="url(#sunlight)" />

        {/* Head */}
        <g filter="url(#soft-shadow)">
          <rect x={FACE_X} y={OPENING_TOP - 20} width={GLASS_X - FACE_X + 10} height="20" fill="url(#wood-face)" />
          <rect x={FACE_X} y={OPENING_TOP - 20} width={GLASS_X - FACE_X + 10} height="20" fill="url(#wood-grain)" opacity="0.35" />
          <line x1={FACE_X} y1={OPENING_TOP} x2={GLASS_X + 10} y2={OPENING_TOP} stroke={c.woodDark} strokeWidth="1" />
        </g>

        {/* Sill */}
        <g filter="url(#soft-shadow)">
          <rect x={FACE_X} y={SILL_TOP} width={GLASS_X - FACE_X + 10} height="30" fill="url(#wood-face)" />
          <rect x={FACE_X} y={SILL_TOP} width={GLASS_X - FACE_X + 10} height="30" fill="url(#wood-grain)" opacity="0.35" />
          <polygon
            points={`${FACE_X},${SILL_TOP} ${GLASS_X + 10},${SILL_TOP} ${GLASS_X + 10},${SILL_TOP - 3} ${FACE_X},${SILL_TOP - 3}`}
            fill="url(#sill-top)"
          />
        </g>

        {/* Glass pane */}
        <g>
          <rect x={GLASS_X} y={OPENING_TOP - 6} width="10" height={OPENING_BOTTOM - OPENING_TOP + 12} fill="url(#glass-grad)" stroke={c.glassEdge} strokeWidth="1.2" />
          <rect x={GLASS_X + 2} y={OPENING_TOP + 4} width="2.5" height="40" fill="#FFFFFF" opacity="0.55" />
          <rect x={GLASS_X + 6} y={OPENING_TOP + 60} width="1.2" height="40" fill="#FFFFFF" opacity="0.35" />
        </g>

        {/* Exterior wall */}
        <g>
          <rect x={GLASS_X + 10} y="0" width={440 - GLASS_X - 10} height="260" fill="url(#wall-grad)" />
          <rect x={GLASS_X + 10} y="0" width={440 - GLASS_X - 10} height="260" filter="url(#wall-texture)" opacity="0.4" />
          <rect x={GLASS_X + 10} y="0" width="2" height="260" fill={c.woodDark} />
        </g>

        {/* ═══════════════════════════════════════════════════════════
             CRANK — SIDE VIEW (in scene). Realistic casement crank
             drawn edge-on: escutcheon shows as a shallow oval sitting
             on the sill, the folding handle extends toward the room
             with the knob at the tip (= nearest obstruction).
             ═══════════════════════════════════════════════════════════ */}
        <g filter="url(#crank-shadow)">
          {/* Escutcheon base — oval seen edge-on, sits on the sill top */}
          <ellipse cx="245" cy={SILL_TOP - 4} rx="26" ry="4" fill="url(#chrome-v)" stroke={c.metalD} strokeWidth="0.7" />
          {/* Top highlight band on the escutcheon */}
          <ellipse cx="245" cy={SILL_TOP - 5.5} rx="22" ry="1.8" fill={c.metalA} opacity="0.7" />

          {/* Center hub — raised boss where the handle attaches */}
          <ellipse cx="245" cy={SILL_TOP - 8.5} rx="7" ry="4" fill="url(#chrome-radial)" stroke={c.metalD} strokeWidth="0.6" />
          <circle cx="245" cy={SILL_TOP - 9} r="2" fill={c.metalD} />

          {/* Folding handle — curves up and out toward the room */}
          <path
            d={`M 245 ${SILL_TOP - 11} Q 225 ${SILL_TOP - 25} ${CRANK_TIP_X + 6} ${SILL_TOP - 36}`}
            fill="none"
            stroke="url(#chrome-v)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Handle highlight */}
          <path
            d={`M 245 ${SILL_TOP - 11} Q 225 ${SILL_TOP - 25} ${CRANK_TIP_X + 6} ${SILL_TOP - 36}`}
            fill="none"
            stroke={c.metalHi}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
            transform="translate(-1, -1)"
          />

          {/* Knob at the end of the handle — sphere with specular */}
          <circle cx={CRANK_TIP_X + 2} cy={SILL_TOP - 36} r="6.5" fill="url(#chrome-radial)" stroke={c.metalD} strokeWidth="0.7" />
          <circle cx={CRANK_TIP_X - 1} cy={SILL_TOP - 38} r="1.6" fill={c.metalHi} opacity="0.85" />
        </g>

        {/* Label pointing to the crank in the scene */}
        <g opacity="0.85">
          <line x1={CRANK_TIP_X - 8} y1={SILL_TOP - 36} x2="175" y2="168" stroke={c.subtle} strokeWidth="1" strokeDasharray="2 2" />
          <text x="173" y="165" textAnchor="end" fill={c.ink} fontSize="10" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600">
            crank
          </text>
        </g>

        {/* ═══════════════════════════════════════════════════════════
             TAPE MEASURE — hook at face, tip against crank knob
             ═══════════════════════════════════════════════════════════ */}
        <g filter="url(#soft-shadow)">
          <rect
            x={FACE_X}
            y={TAPE_Y - 10}
            width={CRANK_TIP_X - FACE_X - 5}
            height="20"
            fill="url(#tape-grad)"
            stroke={c.tapeInk}
            strokeWidth="0.7"
          />
          <rect x={FACE_X + 2} y={TAPE_Y - 7.5} width={CRANK_TIP_X - FACE_X - 10} height="1.4" fill="#FFFFFF" opacity="0.55" />

          {Array.from({ length: Math.floor((CRANK_TIP_X - FACE_X - 6) / 6) + 1 }).map((_, i) => {
            const x = FACE_X + 2 + i * 6;
            const isInch = i % 4 === 0;
            const isHalf = i % 4 === 2;
            const h = isInch ? 8 : isHalf ? 5 : 3;
            return (
              <line
                key={i}
                x1={x}
                y1={TAPE_Y - 10}
                x2={x}
                y2={TAPE_Y - 10 + h}
                stroke={c.tapeInk}
                strokeWidth={isInch ? 0.9 : 0.65}
              />
            );
          })}

          {Array.from({ length: Math.floor((CRANK_TIP_X - FACE_X - 6) / 24) }).map((_, i) => {
            const x = FACE_X + 2 + (i + 1) * 24;
            return (
              <text key={i} x={x} y={TAPE_Y + 4.5} textAnchor="middle" fill={c.tapeInk} fontSize="7" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700">
                {i + 1}
              </text>
            );
          })}

          {/* Hook catches the face of the opening */}
          <path d={`M ${FACE_X - 3} ${TAPE_Y - 14} L ${FACE_X + 3} ${TAPE_Y - 14} L ${FACE_X + 3} ${TAPE_Y + 14} L ${FACE_X - 3} ${TAPE_Y + 14} Z`} fill={c.metalC} stroke={c.tapeInk} strokeWidth="0.7" />
          <rect x={FACE_X - 3} y={TAPE_Y - 14} width="1.3" height="28" fill={c.metalHi} opacity="0.35" />
        </g>

        {/* Depth reading badge */}
        <g>
          <rect x={(FACE_X + CRANK_TIP_X) / 2 - 24} y={TAPE_Y - 28} width="48" height="16" rx="3" fill={c.clay} filter="url(#soft-shadow)" />
          <text x={(FACE_X + CRANK_TIP_X) / 2} y={TAPE_Y - 17} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700">
            {depth ? `${depth}"` : '3 ½"'}
          </text>
          <polygon points={`${(FACE_X + CRANK_TIP_X) / 2 - 3},${TAPE_Y - 12} ${(FACE_X + CRANK_TIP_X) / 2 + 3},${TAPE_Y - 12} ${(FACE_X + CRANK_TIP_X) / 2},${TAPE_Y - 9}`} fill={c.clay} />
        </g>

        {/* Dimension line */}
        <motion.g initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
          <line x1={FACE_X} y1={OPENING_TOP - 20} x2={FACE_X} y2="52" stroke={c.clay} strokeWidth="1" strokeDasharray="3 2" opacity="0.85" />
          <line x1={CRANK_TIP_X} y1={SILL_TOP - 40} x2={CRANK_TIP_X} y2="52" stroke={c.clay} strokeWidth="1" strokeDasharray="3 2" opacity="0.85" />
          <line x1={FACE_X} y1="52" x2={CRANK_TIP_X} y2="52" stroke={c.clay} strokeWidth="1.8" markerStart="url(#dim-left)" markerEnd="url(#dim-right)" />
          <rect x={(FACE_X + CRANK_TIP_X) / 2 - 30} y="38" width="60" height="16" rx="2" fill={c.bg} stroke={c.clay} strokeWidth="1.4" />
          <text x={(FACE_X + CRANK_TIP_X) / 2} y="49" textAnchor="middle" fill={c.clay} fontSize="11" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700" letterSpacing="0.03em">
            DEPTH
          </text>
        </motion.g>

        {/* Base labels */}
        <g opacity="0.8">
          <text x="55" y="250" textAnchor="middle" fill={c.ink} fontSize="10" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600" letterSpacing="0.04em">ROOM</text>
          <text x="405" y="250" textAnchor="middle" fill={c.ink} fontSize="10" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600" letterSpacing="0.04em">OUTSIDE</text>
          <text x={FACE_X} y={SILL_TOP + 46} textAnchor="middle" fill={c.subtle} fontSize="9" fontFamily="ui-sans-serif, system-ui, sans-serif" fontStyle="italic">face of opening</text>
        </g>
      </svg>

      <figcaption className={`mt-3 text-center text-xs leading-relaxed ${isDark ? "text-gray-400" : "text-warm-gray-500"} max-w-md mx-auto`}>
        Hook your tape against the <strong className={isDark ? "text-white" : "text-ink"}>face of the opening</strong>{" "}
        and read the inch mark where it touches the{" "}
        <strong className={isDark ? "text-white" : "text-ink"}>nearest obstruction</strong>{" "}
        — crank, lock, or handle. The front-view inset shows what to look for on your window.
      </figcaption>
    </figure>
  );
}
