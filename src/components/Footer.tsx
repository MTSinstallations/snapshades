import { Mail, Phone, MapPin } from 'lucide-react';
import SnapShadesLogo from '@/components/SnapShadesLogo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <SnapShadesLogo size={28} />
              <span className="text-xl font-bold text-white">Snap<span className="text-blue-400">Shades</span></span>
            </a>
            <p className="text-sm leading-relaxed">
              Custom window treatments measured by phone. Premium products at wholesale prices, shipped or professionally installed.
            </p>
            <div className="mt-4 space-y-2">
              <a href="mailto:support@snapshades.com" className="flex items-center gap-2 text-sm hover:text-white transition">
                <Mail className="w-4 h-4" /> support@snapshades.com
              </a>
              <a href="tel:+18885550123" className="flex items-center gap-2 text-sm hover:text-white transition">
                <Phone className="w-4 h-4" /> (888) 555-0123
              </a>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" /> Nationwide — All 50 States
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-white mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products/portrait-honeycomb" className="hover:text-white transition">Honeycomb Shades</a></li>
              <li><a href="/products/soluna-roller" className="hover:text-white transition">Roller Shades</a></li>
              <li><a href="/products/plantation-shutters" className="hover:text-white transition">Plantation Shutters</a></li>
              <li><a href="/products/centerpiece-roman" className="hover:text-white transition">Roman Shades</a></li>
              <li><a href="/products/smartdrape" className="hover:text-white transition">SmartDrape Shades</a></li>
              <li><a href="/products/ultimate-faux-wood" className="hover:text-white transition">Faux Wood Blinds</a></li>
              <li><a href="/products" className="hover:text-white transition">All Products →</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/swatches" className="hover:text-white transition">Digital Swatches</a></li>
              <li><a href="/start" className="hover:text-white transition">Start a Project</a></li>
              <li><a href="/installers" className="hover:text-white transition">Become an Installer</a></li>
              <li><a href="/account" className="hover:text-white transition">My Account</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="/returns" className="hover:text-white transition">Return Policy</a></li>
              <li><a href="/warranty" className="hover:text-white transition">Warranty Info</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2026 SnapShades LLC. All rights reserved.</p>
          <p className="text-xs">Norman® is a registered trademark of Norman International.</p>
        </div>
      </div>
    </footer>
  );
}
