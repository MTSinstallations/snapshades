import { useState, useId, useMemo } from 'react';

interface TapeMeasureProps {
  /** Currently selected fraction (0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875) */
  selectedFraction: number;
  /** Called when user clicks a fraction */
  onSelect: (fraction: number) => void;
  /** The whole-inch value to display context */
  wholeInches?: number;
}

const FRACTIONS = [
  { value: 0,     label: '0',   unicode: '0' },
  { value: 0.125, label: '1/8', unicode: '⅛' },
  { value: 0.25,  label: '1/4', unicode: '¼' },
  { value: 0.375, label: '3/8', unicode: '⅜' },
  { value: 0.5,   label: '1/2', unicode: '½' },
  { value: 0.625, label: '5/8', unicode: '⅝' },
  { value: 0.75,  label: '3/4', unicode: '¾' },
  { value: 0.875, label: '7/8', unicode: '⅞' },
];

// Tick classification for proper rendering
type TickType = 'inch' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

interface Tick {
  index: number;       // 0–16
  pos: number;         // 0.0–1.0
  type: TickType;
  height: number;      // px height of the tick line
  width: number;       // px stroke width
  label?: string;      // label to show below tick
  isFractionMark: boolean; // is this an 1/8" boundary
}

function buildTicks(wholeInches: number): Tick[] {
  const ticks: Tick[] = [];
  for (let i = 0; i <= 16; i++) {
    let type: TickType;
    let height: number;
    let width: number;
    let label: string | undefined;

    if (i === 0 || i === 16) {
      type = 'inch';
      height = 72;
      width = 2.5;
      label = String(wholeInches + (i === 16 ? 1 : 0));
    } else if (i === 8) {
      type = 'half';
      height = 56;
      width = 2;
      label = '½';
    } else if (i % 4 === 0) {
      type = 'quarter';
      height = 44;
      width = 1.8;
      label = i === 4 ? '¼' : '¾';
    } else if (i % 2 === 0) {
      type = 'eighth';
      height = 34;
      width = 1.5;
      // label for eighths
      const map: Record<number, string> = { 2: '⅛', 6: '⅜', 10: '⅝', 14: '⅞' };
      label = map[i];
    } else {
      type = 'sixteenth';
      height = 20;
      width = 1;
    }

    ticks.push({
      index: i,
      pos: i / 16,
      type,
      height,
      width,
      label,
      isFractionMark: i % 2 === 0, // every 1/8" is a fraction boundary
    });
  }
  return ticks;
}

export default function TapeMeasure({ selectedFraction, onSelect, wholeInches = 0 }: TapeMeasureProps) {
  const [hoveredFraction, setHoveredFraction] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');

  const activeFraction = hoveredFraction ?? selectedFraction;
  const highlightIndex = Math.round(activeFraction * 16);
  const isHovering = hoveredFraction !== null;

  const ticks = useMemo(() => buildTicks(wholeInches), [wholeInches]);

  // SVG layout — wide and tall for close-up detail
  const svgW = 420;
  const svgH = 140;
  const tapeTop = 10;
  const tapeH = 100;
  const padX = 24;
  const usable = svgW - padX * 2;

  // Compute x position for a tick index (0-16)
  const tickX = (i: number) => padX + (i / 16) * usable;

  return (
    <div className="select-none">
      {/* ── Close-up tape measure ── */}
      <div className="relative mx-auto rounded-2xl overflow-hidden bg-slate-800 p-3 pb-1">
        {/* Reading display */}
        <div className="flex items-baseline justify-center gap-1.5 mb-2">
          <span className="text-3xl font-black text-white tabular-nums tracking-tight">
            {wholeInches}
          </span>
          {activeFraction > 0 && (
            <span className="text-2xl font-bold text-green-400 transition-all duration-200">
              {FRACTIONS.find(f => f.value === activeFraction)?.unicode}
            </span>
          )}
          <span className="text-xl text-gray-400 font-medium">"</span>
        </div>

        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ display: 'block' }}
        >
          <defs>
            {/* Tape gradient — realistic yellow */}
            <linearGradient id={`tg-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="30%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            {/* Glow for active tick */}
            <filter id={`glow-${uid}`} x="-100%" y="-50%" width="300%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Mask for highlight zone */}
            <clipPath id={`tape-clip-${uid}`}>
              <rect x={padX - 2} y={tapeTop} width={usable + 4} height={tapeH + 8} />
            </clipPath>
          </defs>

          {/* Tape body */}
          <rect
            x={padX - 6}
            y={tapeTop}
            width={usable + 12}
            height={tapeH}
            rx={5}
            fill={`url(#tg-${uid})`}
            stroke="#B45309"
            strokeWidth={1.2}
          />

          {/* Tape edge shadow */}
          <rect
            x={padX - 6}
            y={tapeTop + tapeH - 3}
            width={usable + 12}
            height={3}
            rx={1}
            fill="#92400E"
            opacity={0.2}
          />

          {/* Highlight zone — colored band behind the selected tick */}
          {highlightIndex > 0 && (
            <rect
              x={padX - 2}
              y={tapeTop + 2}
              width={tickX(highlightIndex) - padX + 2}
              height={tapeH - 4}
              fill="#DC2626"
              opacity={isHovering ? 0.10 : 0.08}
              rx={3}
              clipPath={`url(#tape-clip-${uid})`}
              style={{ transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
            />
          )}

          {/* All 17 tick marks (0 through 16 sixteenths) */}
          {ticks.map((tick) => {
            const x = tickX(tick.index);
            const isActive = tick.index === highlightIndex;
            const isBeforeActive = tick.index > 0 && tick.index < highlightIndex && tick.isFractionMark;

            // Base color
            let color = '#78350F';
            let opacity = tick.type === 'sixteenth' ? 0.5 : 0.75;
            let sw = tick.width;

            if (isActive) {
              color = '#DC2626';
              opacity = 1;
              sw = 3.5;
            } else if (isBeforeActive) {
              color = '#B91C1C';
              opacity = 0.45;
            }

            const y1 = tapeTop + tapeH;
            const y2 = tapeTop + tapeH - tick.height;

            return (
              <g key={tick.index}>
                {/* Tick line */}
                <line
                  x1={x} y1={y1} x2={x} y2={y2}
                  stroke={color}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  opacity={opacity}
                  filter={isActive ? `url(#glow-${uid})` : undefined}
                  style={{ transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)' }}
                />

                {/* Active indicator — red diamond + line */}
                {isActive && tick.index > 0 && tick.index < 16 && (
                  <>
                    {/* Vertical highlight bar */}
                    <rect
                      x={x - 3}
                      y={y2}
                      width={6}
                      height={tick.height}
                      fill="#DC2626"
                      opacity={0.2}
                      rx={3}
                      style={{ transition: 'all 0.25s ease-out' }}
                    />
                    {/* Arrow pointer above */}
                    <polygon
                      points={`${x},${tapeTop + 6} ${x - 7},${tapeTop - 2} ${x + 7},${tapeTop - 2}`}
                      fill="#DC2626"
                      style={{ transition: 'all 0.25s ease-out' }}
                    >
                      <animate
                        attributeName="opacity"
                        values="1;0.5;1"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </polygon>
                  </>
                )}

                {/* Tick label */}
                {tick.label && (
                  <text
                    x={x}
                    y={tapeTop + 16}
                    fontSize={tick.type === 'inch' ? 14 : tick.type === 'half' ? 12 : tick.type === 'quarter' ? 11 : 9}
                    fontWeight={tick.type === 'inch' || tick.type === 'half' ? 'bold' : '600'}
                    fill={isActive ? '#DC2626' : '#78350F'}
                    textAnchor="middle"
                    opacity={isActive ? 1 : (tick.type === 'eighth' ? 0.6 : 0.85)}
                    style={{ transition: 'all 0.2s ease-out' }}
                  >
                    {tick.label}
                  </text>
                )}

                {/* Sixteenth number labels (small) */}
                {tick.type === 'sixteenth' && (
                  <text
                    x={x}
                    y={tapeTop + tapeH - tick.height - 4}
                    fontSize={7}
                    fill={isActive ? '#DC2626' : '#92400E'}
                    textAnchor="middle"
                    opacity={isActive ? 1 : 0.3}
                    style={{ transition: 'all 0.2s ease-out' }}
                  >
                    {tick.index}/16
                  </text>
                )}
              </g>
            );
          })}

          {/* Bottom edge line */}
          <line
            x1={padX - 4} y1={tapeTop + tapeH}
            x2={padX + usable + 4} y2={tapeTop + tapeH}
            stroke="#92400E"
            strokeWidth={1.5}
            opacity={0.6}
          />
        </svg>

        {/* ── Fraction selector buttons ── */}
        <div className="grid grid-cols-4 gap-2 mt-2 mb-1">
          {FRACTIONS.map((frac) => {
            const isSelected = selectedFraction === frac.value;
            const isHovered = hoveredFraction === frac.value;

            return (
              <button
                key={frac.value}
                onClick={() => onSelect(frac.value)}
                onMouseEnter={() => setHoveredFraction(frac.value)}
                onMouseLeave={() => setHoveredFraction(null)}
                onTouchStart={() => setHoveredFraction(frac.value)}
                onTouchEnd={() => {
                  // On touch, select + clear hover
                  onSelect(frac.value);
                  setHoveredFraction(null);
                }}
                className={`
                  relative py-3.5 rounded-xl text-center font-bold
                  transition-all duration-200 ease-out
                  ${isSelected
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-[1.06] ring-2 ring-green-400/50'
                    : isHovered
                      ? 'bg-red-600/80 text-white scale-[1.04] shadow-md ring-2 ring-red-400/40'
                      : 'bg-slate-700/80 text-gray-300 hover:bg-slate-600'
                  }
                `}
              >
                <span className="text-xl">{frac.unicode}</span>
                {/* Subscript label */}
                {frac.value > 0 && (
                  <span className={`block text-[10px] mt-0.5 font-medium ${
                    isSelected ? 'text-green-100' : isHovered ? 'text-red-200' : 'text-gray-500'
                  }`}>
                    {frac.label}"
                  </span>
                )}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-300 rounded-full border-2 border-slate-800 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
