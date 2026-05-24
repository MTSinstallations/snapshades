import { useRef, useEffect } from 'react';

const FRACTIONS = [
  { label: '0', decimal: 0 },
  { label: '1/8', decimal: 0.125 },
  { label: '1/4', decimal: 0.25 },
  { label: '3/8', decimal: 0.375 },
  { label: '1/2', decimal: 0.5 },
  { label: '5/8', decimal: 0.625 },
  { label: '3/4', decimal: 0.75 },
  { label: '7/8', decimal: 0.875 },
];

interface MeasurementDropdownsProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
}

export default function MeasurementDropdowns({
  label,
  value,
  onChange,
  min = 1,
  max = 160,
  required = true,
}: MeasurementDropdownsProps) {
  const whole = Math.floor(value) || 0;
  const fraction = Math.round((value - whole) * 8) / 8;
  const gridRef = useRef<HTMLDivElement>(null);

  // Build full list of inch values
  const allSizes: number[] = [];
  for (let i = min; i <= max; i++) allSizes.push(i);

  // Auto-scroll selected value into view on mount / change
  useEffect(() => {
    if (whole > 0 && gridRef.current) {
      const selected = gridRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [whole]);

  const displayValue = value > 0
    ? `${whole}${fraction > 0 ? ' ' + FRACTIONS.find(f => f.decimal === fraction)?.label : ''}″`
    : '';

  const handleWholeSelect = (n: number) => {
    onChange(n + fraction);
  };

  const handleFractionSelect = (decimal: number) => {
    onChange(whole + decimal);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className="text-base font-bold text-gray-900">{label}</span>
          {required && <span className="text-red-500 text-sm">*</span>}
        </div>
        {displayValue && (
          <span className="text-sm font-semibold text-blue-600">{displayValue}</span>
        )}
      </div>

      {/* Scrollable white inch grid — 10 columns, decade markers highlighted */}
      <div
        ref={gridRef}
        className="grid grid-cols-10 gap-[3px] max-h-72 overflow-y-auto rounded-lg border border-gray-200 p-1.5 bg-white"
      >
        {allSizes.map(n => {
          const isSelected = whole === n;
          const isDecade = n % 10 === 0;
          return (
            <button
              key={n}
              type="button"
              data-selected={isSelected}
              onClick={() => handleWholeSelect(n)}
              className={`py-2.5 rounded text-sm font-semibold transition-all
                ${isSelected
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500 ring-offset-1'
                  : isDecade
                    ? 'bg-amber-50 text-amber-700 border border-amber-300 font-bold hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 active:bg-gray-200'
                }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Fraction row */}
      <div className="grid grid-cols-8 gap-[3px] mt-1.5 rounded-lg border border-gray-200 p-1.5 bg-white">
        {FRACTIONS.map(f => (
          <button
            key={f.decimal}
            type="button"
            onClick={() => handleFractionSelect(f.decimal)}
            className={`py-2 rounded text-xs font-semibold transition-all
              ${fraction === f.decimal
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            {f.label === '0' ? '0' : f.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-400 mt-1 block text-center">Fraction (inches)</span>
    </div>
  );
}
