/**
 * SnapShades Logo — Roller shade with camera shutter aperture
 * The shade pulls down to reveal a camera aperture, merging both brand concepts
 */

interface LogoProps {
  size?: number;
  className?: string;
}

export default function SnapShadesLogo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#151515" />

      {/* Window opening (light area — full height behind shade) */}
      <rect x="7" y="7" width="34" height="34" rx="3" fill="#F5F2ED" />

      {/* Camera lens — large, centered in the window */}
      <circle cx="24" cy="28" r="11" stroke="#A83A20" strokeWidth="2.5" fill="white" />
      <circle cx="24" cy="28" r="7.5" fill="#E04E2A" />
      <circle cx="24" cy="28" r="4" fill="#A83A20" />
      {/* Lens highlight */}
      <circle cx="21" cy="25.5" r="2" fill="white" opacity="0.5" />
      <circle cx="22" cy="26.5" r="0.8" fill="white" opacity="0.8" />

      {/* Roller shade — pulled partway down, overlapping top of lens */}
      <rect x="7" y="7" width="34" height="14" rx="2" fill="#E04E2A" />

      {/* Shade fabric ridges */}
      <line x1="7" y1="11" x2="41" y2="11" stroke="#F7A58F" strokeWidth="0.8" opacity="0.65" />
      <line x1="7" y1="15" x2="41" y2="15" stroke="#F7A58F" strokeWidth="0.8" opacity="0.65" />

      {/* Bottom rail of shade */}
      <rect x="7" y="19" width="34" height="3" rx="1.5" fill="#A83A20" />
      {/* Pull tab */}
      <rect x="21" y="22" width="6" height="2" rx="1" fill="#A83A20" opacity="0.6" />
    </svg>
  );
}

/**
 * Full logo with text
 */
export function SnapShadesLogoFull({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SnapShadesLogo size={size} />
      <span className="font-bold text-ink" style={{ fontSize: size * 0.75 }}>
        Snap<span className="text-clay">Shades</span>
      </span>
    </div>
  );
}
