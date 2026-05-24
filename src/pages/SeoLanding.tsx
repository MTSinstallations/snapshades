/**
 * SEO Landing Page — Dynamic city × product pages
 * Route: /shutters/:cityState, /blinds/:cityState, /shades/:cityState
 * 
 * Generated per-city for organic search traffic.
 * Data pulled from seo_pages + territories tables.
 */

import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Star, Truck, Wrench, ShoppingCart, Check, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface SeoPageData {
  city: string;
  state: string;
  product_category: string;
  title: string;
  description: string;
  installer_count: number;
  starting_price: number | null;
}

const CATEGORY_INFO: Record<string, { name: string; emoji: string; heroText: string; products: string[] }> = {
  shutters: {
    name: 'Plantation Shutters',
    emoji: '🏠',
    heroText: 'Transform your home with custom plantation shutters',
    products: ['Woodlore® Composite', 'Woodlore® Plus Polymer', 'Brightwood™ Engineered', 'Normandy® Real Hardwood'],
  },
  blinds: {
    name: 'Window Blinds',
    emoji: '🪟',
    heroText: 'Custom blinds at dealer-direct prices',
    products: ['Ultimate™ Faux Wood', 'SmartPrivacy® Cordless', 'Normandy® Real Wood', 'CityLights™ Aluminum'],
  },
  shades: {
    name: 'Window Shades',
    emoji: '🌅',
    heroText: 'Beautiful custom shades for every room',
    products: ['Portrait™ Honeycomb', 'Soluna™ Roller', 'Centerpiece™ Roman', 'PerfectSheer™'],
  },
};

export default function SeoLanding() {
  const { cityState } = useParams<{ cityState: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Extract category from URL path: /shutters/city-st → "shutters"
  const category = location.pathname.split('/')[1] || 'shades';
  const [pageData, setPageData] = useState<SeoPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!category || !cityState) { setLoading(false); return; }
      const slug = `${category}/${cityState}`;
      const { data } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_indexed', true)
        .single();
      setPageData(data as SeoPageData | null);
      setLoading(false);
    };
    load();
  }, [category, cityState]);

  const catInfo = CATEGORY_INFO[category || ''] || CATEGORY_INFO.shades;

  // Fallback: parse city/state from URL even without DB record
  const parsedCity = cityState?.split('-').slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '';
  const parsedState = cityState?.split('-').pop()?.toUpperCase() || '';
  const city = pageData?.city || parsedCity;
  const state = pageData?.state || parsedState;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/products" className="text-sm text-gray-600 hover:text-blue-600">Products</a>
            <Button size="sm" className="bg-blue-600 text-white rounded-full" onClick={() => navigate('/start')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-3">{catInfo.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {catInfo.name} in {city}, {state}
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            {catInfo.heroText}. Manufacturer-direct pricing and{' '}
            {pageData?.installer_count && pageData.installer_count > 0
              ? `${pageData.installer_count} certified installer${pageData.installer_count > 1 ? 's' : ''} in your area`
              : 'professional installation available'
            }.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button size="lg" className="bg-blue-600 text-white rounded-full px-8 py-6 text-lg gap-2" onClick={() => navigate('/start')}>
              Start Your Project <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Free Shipping to {city}</h3>
              <p className="text-sm text-gray-500 mt-1">Every order ships free. Custom-made in 4-6 weeks.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Wrench className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Pro Installation</h3>
              <p className="text-sm text-gray-500 mt-1">
                {pageData?.installer_count && pageData.installer_count > 0
                  ? `${pageData.installer_count} certified installer${pageData.installer_count > 1 ? 's' : ''} serving ${city}`
                  : `Professional installation available in ${city}`
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Dealer-Direct Pricing</h3>
              <p className="text-sm text-gray-500 mt-1">Norman® products at 60%+ below retail. No showroom markup.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {catInfo.name} Available in {city}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {catInfo.products.map(p => (
              <Card key={p} className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/products')}>
                <CardContent className="p-5">
                  <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-3xl">
                    {catInfo.emoji}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{p}</h3>
                  <div className="text-xs text-blue-600 mt-1">View options →</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to transform your {city} home?</h2>
        <p className="text-gray-500 mt-2">Free measuring guide • 30-day quality guarantee • No-hassle returns</p>
        <Button size="lg" className="mt-6 bg-blue-600 text-white rounded-full px-10 py-6 text-lg" onClick={() => navigate('/start')}>
          Start Your Free Project
        </Button>
      </div>

      {/* Schema.org markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `SnapShades & Shutters — ${city}, ${state}`,
        description: pageData?.description || `Custom ${catInfo.name.toLowerCase()} in ${city}, ${state}. Manufacturer-direct pricing, professional installation available.`,
        address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: state, addressCountry: 'US' },
        url: `https://snapshadesandshutters.com/${category}/${cityState}`,
        priceRange: '$$',
      })}} />
    </div>
  );
}
