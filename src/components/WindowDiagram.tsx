/**
 * Animated window diagram that highlights the measurement being taken.
 * Shows a simple window frame with pulsing red measurement indicators.
 */

interface WindowDiagramProps {
  highlight: 'top-width' | 'bottom-width' | 'left-height' | 'right-height' | 'depth' | 'none';
  topWidth?: string;
  bottomWidth?: string;
  leftHeight?: string;
  rightHeight?: string;
  depth?: string;
}

export default function WindowDiagram({ highlight, topWidth, bottomWidth, leftHeight, rightHeight, depth }: WindowDiagramProps) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      {/* Window frame SVG */}
      <svg viewBox="0 0 280 320" className="w-full h-auto">
        {/* Wall background */}
        <rect x="0" y="0" width="280" height="320" fill="#F3F4F6" rx="8" />
        
        {/* Window frame outer */}
        <rect x="40" y="40" width="200" height="240" fill="white" stroke="#9CA3AF" strokeWidth="3" rx="2" />
        
        {/* Window frame inner (glass area) */}
        <rect x="50" y="50" width="180" height="220" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" rx="1" />
        
        {/* Window pane dividers */}
        <line x1="140" y1="50" x2="140" y2="270" stroke="#93C5FD" strokeWidth="1" />
        <line x1="50" y1="160" x2="230" y2="160" stroke="#93C5FD" strokeWidth="1" />
        
        {/* Lock/handle on right side */}
        <rect x="222" y="150" width="8" height="20" fill="#6B7280" rx="2" />

        {/* ===== MEASUREMENT HIGHLIGHTS ===== */}
        
        {/* TOP WIDTH - Red line across top */}
        {(highlight === 'top-width') && (
          <g>
            {/* Pulsing red band */}
            <line x1="40" y1="30" x2="240" y2="30" stroke="#EF4444" strokeWidth="3" strokeDasharray="none">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </line>
            {/* Left arrow */}
            <polygon points="40,25 40,35 48,30" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            {/* Right arrow */}
            <polygon points="240,25 240,35 232,30" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            {/* Label */}
            <text x="140" y="22" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold">
              {topWidth || 'TOP WIDTH'}
            </text>
          </g>
        )}
        
        {/* BOTTOM WIDTH - Red line across bottom */}
        {(highlight === 'bottom-width') && (
          <g>
            <line x1="40" y1="290" x2="240" y2="290" stroke="#EF4444" strokeWidth="3">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </line>
            <polygon points="40,285 40,295 48,290" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            <polygon points="240,285 240,295 232,290" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            <text x="140" y="308" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold">
              {bottomWidth || 'BOTTOM WIDTH'}
            </text>
          </g>
        )}
        
        {/* LEFT HEIGHT - Red line on left */}
        {(highlight === 'left-height') && (
          <g>
            <line x1="28" y1="40" x2="28" y2="280" stroke="#EF4444" strokeWidth="3">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </line>
            <polygon points="23,40 33,40 28,48" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            <polygon points="23,280 33,280 28,272" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            <text x="16" y="165" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold" transform="rotate(-90 16 165)">
              {leftHeight || 'LEFT HEIGHT'}
            </text>
          </g>
        )}
        
        {/* RIGHT HEIGHT - Red line on right */}
        {(highlight === 'right-height') && (
          <g>
            <line x1="252" y1="40" x2="252" y2="280" stroke="#EF4444" strokeWidth="3">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </line>
            <polygon points="247,40 257,40 252,48" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            <polygon points="247,280 257,280 252,272" fill="#EF4444">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            <text x="264" y="165" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="bold" transform="rotate(90 264 165)">
              {rightHeight || 'RIGHT HEIGHT'}
            </text>
          </g>
        )}
        
        {/* DEPTH - Cross section indicator */}
        {(highlight === 'depth') && (
          <g>
            {/* Depth arrow at top of frame */}
            <line x1="140" y1="42" x2="140" y2="58" stroke="#EF4444" strokeWidth="3">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </line>
            {/* Depth indicator box */}
            <rect x="100" y="42" width="80" height="16" fill="#EF4444" fillOpacity="0.15" stroke="#EF4444" strokeWidth="1.5" rx="3">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
            </rect>
            <text x="140" y="54" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">
              {depth || 'DEPTH'}
            </text>
            {/* Arrow pointing to lock/handle */}
            <line x1="218" y1="160" x2="235" y2="160" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
            </line>
            <text x="225" y="145" textAnchor="middle" fill="#EF4444" fontSize="9" fontWeight="bold">
              ← to obstacle
            </text>
          </g>
        )}

        {/* Completed measurement labels (faded green) */}
        {highlight !== 'top-width' && topWidth && (
          <text x="140" y="22" textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="600">
            ✓ {topWidth}"
          </text>
        )}
        {highlight !== 'bottom-width' && bottomWidth && (
          <text x="140" y="308" textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="600">
            ✓ {bottomWidth}"
          </text>
        )}
        {highlight !== 'left-height' && leftHeight && (
          <text x="16" y="165" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="600" transform="rotate(-90 16 165)">
            ✓ {leftHeight}"
          </text>
        )}
        {highlight !== 'right-height' && rightHeight && (
          <text x="264" y="165" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="600" transform="rotate(90 264 165)">
            ✓ {rightHeight}"
          </text>
        )}
      </svg>
    </div>
  );
}
