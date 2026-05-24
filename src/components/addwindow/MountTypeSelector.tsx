interface MountTypeSelectorProps {
  value: 'inside' | 'outside' | null;
  onChange: (v: 'inside' | 'outside') => void;
}

function InsideMountSVG() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Window frame */}
      <rect x="10" y="5" width="100" height="90" fill="none" stroke="#9ca3af" strokeWidth="2" />
      {/* Inner frame */}
      <rect x="15" y="10" width="90" height="80" fill="none" stroke="#9ca3af" strokeWidth="1" />
      {/* Blind slats inside frame */}
      <rect x="18" y="13" width="84" height="4" rx="1" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.5" />
      {/* Headrail */}
      <rect x="18" y="12" width="84" height="3" rx="1" fill="#60a5fa" />
      {/* Slats */}
      {[20, 27, 34, 41, 48, 55, 62, 69, 76].map((y, i) => (
        <rect key={i} x="20" y={y} width="80" height="3" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.3" />
      ))}
      {/* Measurement arrows - inside the frame */}
      <line x1="17" y1="88" x2="103" y2="88" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,2" />
    </svg>
  );
}

function OutsideMountSVG() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      {/* Window frame (smaller, behind the blind) */}
      <rect x="20" y="15" width="80" height="75" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
      {/* Glass */}
      <rect x="22" y="17" width="76" height="71" fill="#e0f2fe" opacity="0.5" />
      {/* Blind overlapping outside frame */}
      <rect x="8" y="5" width="104" height="6" rx="1" fill="#60a5fa" />
      {/* Dashed lines showing overlap */}
      <line x1="8" y1="5" x2="8" y2="95" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="112" y1="5" x2="112" y2="95" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3" />
      {/* Slats extending beyond frame */}
      {[15, 23, 31, 39, 47, 55, 63, 71, 79].map((y, i) => (
        <rect key={i} x="10" y={y} width="100" height="4" rx="0.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.3" />
      ))}
      {/* Bottom rail */}
      <rect x="10" y="87" width="100" height="4" rx="1" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.5" />
    </svg>
  );
}

export default function MountTypeSelector({ value, onChange }: MountTypeSelectorProps) {
  const options = [
    { key: 'inside' as const, label: 'Inside Mount', Illustration: InsideMountSVG },
    { key: 'outside' as const, label: 'Outside Mount', Illustration: OutsideMountSVG },
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
