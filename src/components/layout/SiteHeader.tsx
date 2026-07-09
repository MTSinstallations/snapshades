import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import SnapShadesLogo from '@/components/SnapShadesLogo';
import { useCart } from '@/hooks/useCart';

const NAV_LINKS = [
  { to: '/#products', label: 'Products' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#measure', label: 'How to measure' },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { windowCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="SnapShades home">
            <SnapShadesLogo size={31} />
            <span className="text-xl font-semibold tracking-tight text-ink">
              Snap<span className="text-clay">Shades</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-warm-gray-500 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.to} href={link.to} className="transition-colors hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/order"
              className="hidden rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/85 sm:inline-flex"
            >
              Start order
            </Link>
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand-deep"
              aria-label={`Cart with ${windowCount} ${windowCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {windowCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                  {windowCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand-deep md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="space-y-1 border-t border-ink/10 py-4 md:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 font-medium text-ink hover:bg-sand-deep"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/order"
              onClick={() => setMobileOpen(false)}
              className="mt-3 block rounded-lg bg-ink px-4 py-3 text-center font-semibold text-white"
            >
              Start order
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
