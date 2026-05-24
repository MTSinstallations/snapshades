import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { Button } from "@/components/ui/button";

/**
 * SiteHeader — shared sticky header for public pages.
 *
 * Consumed by Index, Products, ProductDetail, Swatches in Phase 4.
 * Phase 10 retrofits the remaining pages.
 */

const NAV_LINKS = [
  { to: "/products", label: "Shop" },
  { to: "/swatches", label: "Swatches" },
  { to: "/inspiration", label: "Rooms" },
  { to: "/#how-it-works", label: "How It Works" },
  { to: "/help", label: "Help" },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="SnapShades home">
            <SnapShadesLogo size={32} />
            <span className="text-xl font-semibold tracking-tight text-ink">
              Snap<span className="text-clay">Shades</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-warm-gray-500">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `hover:text-ink transition-colors ${isActive ? "text-ink" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex bg-clay hover:bg-clay-hover text-primary-foreground rounded-md px-5 font-semibold">
              <Link to="/swatches/order">Get Swatches</Link>
            </Button>
            <Link
              to="/cart"
              className="w-10 h-10 rounded-full hover:bg-sand-deep flex items-center justify-center text-ink"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-full hover:bg-sand-deep flex items-center justify-center text-ink"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav sheet */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2.5 rounded-md text-base font-medium text-ink hover:bg-sand-deep"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/swatches/order"
              onClick={() => setMobileOpen(false)}
              className="block mx-2 mt-2 px-4 py-3 rounded-md bg-clay text-primary-foreground font-semibold text-center"
            >
              Get Free Swatches
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
