interface WindowDoorSelectorProps {
  value: 'window' | 'door' | null;
  onChange: (v: 'window' | 'door') => void;
}

function WindowSVG() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Window frame */}
      <rect x="15" y="8" width="90" height="84" fill="none" stroke="#9ca3af" strokeWidth="2.5" rx="1" />
      {/* Inner frame */}
      <rect x="20" y="13" width="80" height="74" fill="#e0f2fe" stroke="#9ca3af" strokeWidth="1" opacity="0.5" />
      {/* Vertical divider */}
      <line x1="60" y1="13" x2="60" y2="87" stroke="#9ca3af" strokeWidth="1.5" />
      {/* Horizontal divider */}
      <line x1="20" y1="50" x2="100" y2="50" stroke="#9ca3af" strokeWidth="1.5" />
      {/* Glass panes */}
      <rect x="21" y="14" width="38" height="35" fill="#bfdbfe" opacity="0.3" />
      <rect x="61" y="14" width="38" height="35" fill="#bfdbfe" opacity="0.3" />
      <rect x="21" y="51" width="38" height="35" fill="#bfdbfe" opacity="0.3" />
      <rect x="61" y="51" width="38" height="35" fill="#bfdbfe" opacity="0.3" />
      {/* Window sill */}
      <rect x="10" y="92" width="100" height="4" rx="1" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.5" />
    </svg>
  );
}

function DoorSVG() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Door frame */}
      <rect x="10" y="5" width="100" height="90" fill="none" stroke="#9ca3af" strokeWidth="2.5" rx="1" />
      {/* Left panel (fixed) */}
      <rect x="14" y="9" width="44" height="82" fill="#e0f2fe" stroke="#9ca3af" strokeWidth="0.8" opacity="0.5" />
      {/* Right panel (sliding) */}
      <rect x="62" y="9" width="44" height="82" fill="#bfdbfe" stroke="#9ca3af" strokeWidth="0.8" opacity="0.4" />
      {/* Vertical bars on left panel */}
      {[26, 38, 50].map(x => (
        <line key={x} x1={x} y1="9" x2={x} y2="91" stroke="#9ca3af" strokeWidth="0.5" opacity="0.5" />
      ))}
      {/* Vertical bars on right panel */}
      {[74, 86, 98].map(x => (
        <line key={x} x1={x} y1="9" x2={x} y2="91" stroke="#9ca3af" strokeWidth="0.5" opacity="0.5" />
      ))}
      {/* Door handle on right panel */}
      <rect x="63" y="42" width="3" height="16" rx="1.5" fill="#6b7280" />
      {/* Sliding arrow indicator */}
      <line x1="70" y1="96" x2="90" y2="96" stroke="#60a5fa" strokeWidth="1" />
      <polygon points="90,93.5 95,96 90,98.5" fill="#60a5fa" />
      {/* Floor line */}
      <rect x="5" y="95" width="110" height="2" rx="0.5" fill="#d1d5db" />
    </svg>
  );
}

export default function WindowDoorSelector({ value, onChange }: WindowDoorSelectorProps) {
  const options = [
    { key: 'window' as const, label: 'Window', Illustration: WindowSVG },
    { key: 'door' as const, label: 'Door', Illustration: DoorSVG },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(({ key, label, Illustration }) => {
        const isSelected = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`rounded-lg border-2 overflow-hidden transition-colors text-center ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="aspect-[4/3] bg-white p-2 flex items-center justify-center">
              <Illustration />
            </div>
            <div className="px-2 py-2">
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
