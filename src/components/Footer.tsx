import { Link } from 'react-router-dom';
import SnapShadesLogo from '@/components/SnapShadesLogo';
import { SUPPORT_EMAIL } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <SnapShadesLogo size={30} />
              <span className="text-xl font-semibold">
                Snap<span className="text-[#ef7a58]">Shades</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Three practical window coverings, custom made and shipped direct at supplier cost plus 10%.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-white/70">
            <a href="/#products" className="hover:text-white">Products</a>
            <a href="/#measure" className="hover:text-white">Measure guide</a>
            <Link to="/order" className="hover:text-white">Start order</Link>
            <Link to="/cart" className="hover:text-white">Cart</Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">Email support</a>
            <Link to="/account" className="hover:text-white">My account</Link>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SnapShades LLC.</p>
          <p>Custom products are made to the measurements you submit.</p>
        </div>
      </div>
    </footer>
  );
}
