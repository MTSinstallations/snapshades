import type { ReactNode } from 'react';

interface ImageCardOption {
  value: string;
  label: string;
  illustration: ReactNode;
}

interface ImageCardSelectorProps {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
  options: ImageCardOption[];
  columns?: 2 | 3;
  required?: boolean;
}

// Pre-built SVG illustrations for common fields
function ControlLeftSVG() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="5" y="5" width="90" height="8" rx="1" fill="#60a5fa" />
      {[17, 25, 33, 41, 49, 57].map((y, i) => (
        <rect key={i} x="7" y={y} width="86" height="4" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.3" />
      ))}
      <line x1="12" y1="13" x2="12" y2="65" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="5" y="65" width="90" height="5" rx="1" fill="#d1d5db" />
    </svg>
  );
}

function ControlRightSVG() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="5" y="5" width="90" height="8" rx="1" fill="#60a5fa" />
      {[17, 25, 33, 41, 49, 57].map((y, i) => (
        <rect key={i} x="7" y={y} width="86" height="4" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.3" />
      ))}
      <line x1="88" y1="13" x2="88" y2="65" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="5" y="65" width="90" height="5" rx="1" fill="#d1d5db" />
    </svg>
  );
}

function CordlessSVG() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="5" y="5" width="90" height="8" rx="1" fill="#60a5fa" />
      {[17, 25, 33, 41, 49, 57].map((y, i) => (
        <rect key={i} x="7" y={y} width="86" height="4" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.3" />
      ))}
      <rect x="5" y="65" width="90" height="5" rx="1" fill="#d1d5db" />
    </svg>
  );
}

function VaneLeftSVG() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="5" y="5" width="90" height="6" rx="1" fill="#d1d5db" />
      {/* Stacked vanes on left */}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={8 + i * 5} y="14" width="4" height="58" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
      ))}
      {/* Open area right */}
      <rect x="30" y="14" width="63" height="58" fill="#f0f9ff" opacity="0.5" />
      <path d="M15 75 L10 75" stroke="#3b82f6" strokeWidth="1" markerEnd="url(#arrowL)" />
    </svg>
  );
}

function VaneRightSVG() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="5" y="5" width="90" height="6" rx="1" fill="#d1d5db" />
      {/* Open area left */}
      <rect x="7" y="14" width="63" height="58" fill="#f0f9ff" opacity="0.5" />
      {/* Stacked vanes on right */}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={73 + i * 5} y="14" width="4" height="58" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
      ))}
      <path d="M85 75 L90 75" stroke="#3b82f6" strokeWidth="1" />
    </svg>
  );
}

function VaneSplitSVG() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="5" y="5" width="90" height="6" rx="1" fill="#d1d5db" />
      {/* Stacked vanes on left */}
      {[0, 1].map(i => (
        <rect key={`l${i}`} x={8 + i * 5} y="14" width="4" height="58" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
      ))}
      {/* Open area center */}
      <rect x="20" y="14" width="60" height="58" fill="#f0f9ff" opacity="0.5" />
      {/* Stacked vanes on right */}
      {[0, 1].map(i => (
        <rect key={`r${i}`} x={83 + i * 5} y="14" width="4" height="58" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5" />
      ))}
      <path d="M50 75 L45 75 M50 75 L55 75" stroke="#3b82f6" strokeWidth="1" />
    </svg>
  );
}

// Pre-built option sets for common fields
export const CONTROL_LOCATION_OPTIONS: ImageCardOption[] = [
  { value: 'left', label: 'Left', illustration: <ControlLeftSVG /> },
  { value: 'right', label: 'Right', illustration: <ControlRightSVG /> },
  { value: 'cordless', label: 'N/A Cordless', illustration: <CordlessSVG /> },
];

export const VANE_STACK_OPTIONS: ImageCardOption[] = [
  { value: 'left', label: 'Left', illustration: <VaneLeftSVG /> },
  { value: 'right', label: 'Right', illustration: <VaneRightSVG /> },
  { value: 'split', label: 'Split Stack', illustration: <VaneSplitSVG /> },
];

export default function ImageCardSelector({
  id,
  label,
  value,
  onChange,
  options,
  columns = 3,
  required = false,
}: ImageCardSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>
      <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map(opt => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(id, opt.value)}
              className={`rounded-lg border-2 overflow-hidden transition-colors text-center ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="aspect-square bg-white p-2 flex items-center justify-center">
                {opt.illustration}
              </div>
              <div className="px-1 py-2">
                <span className="text-xs font-medium text-gray-800">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
