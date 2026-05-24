import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, CheckCircle, Star, Filter, ChevronDown, Shield, Zap, Eye, Sun, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ALL_PRODUCTS, PRODUCTS_BY_CATEGORY, getCustomerPrice } from '@/data/catalog-index';
import type { Product } from '@/data/catalog-index';
import { getHeroImage } from '@/data/product-images';

type Category = 'all' | 'shades' | 'blinds' | 'shutters';

const categoryIcons: Record<string, React.ReactNode> = {
  shades: <Sun className="w-4 h-4" />,
  blinds: <Eye className="w-4 h-4" />,
  shutters: <Home className="w-4 h-4" />,
};

const categoryDescriptions: Record<string, string> = {
  shades: 'Soft fabrics, cellular insulation, and elegant light control',
  blinds: 'Classic slat design with SmartPrivacy® technology',
  shutters: 'Plantation shutters — the premium choice for any home',
};

function getStartingPrice(product: Product): string {
  // Find lowest price across all variants
  let lowest = Infinity;
  for (const variant of product.variants) {
    const grid = variant.priceGrid;
    for (const row of grid.prices) {
      for (const price of row) {
        if (price > 0 && price < lowest) {
          lowest = price;
        }
      }
    }
  }
  if (lowest === Infinity) return 'Contact for pricing';
  // Apply our multiplier: retail × 0.30 × 1.20 = × 0.36
  const customerPrice = Math.ceil(lowest * 0.36 * 100) / 100;
  return `$${customerPrice.toFixed(2)}`;
}

function getProductIcon(product: Product) {
  switch (product.subcategory) {
    case 'honeycomb': return <Sparkles className="w-5 h-5" />;
    case 'roller': return <Sun className="w-5 h-5" />;
    case 'sheer': return <Eye className="w-5 h-5" />;
    case 'sheer-vertical': return <Eye className="w-5 h-5" />;
    case 'roman': return <Sparkles className="w-5 h-5" />;
    case 'faux-wood': return <Shield className="w-5 h-5" />;
    case 'wood': return <Home className="w-5 h-5" />;
    case 'vertical': return <Filter className="w-5 h-5" />;
    case 'aluminum': return <Zap className="w-5 h-5" />;
    default: return <Star className="w-5 h-5" />;
  }
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const startingPrice = getStartingPrice(product);
  const variantCount = product.variants.length;

  return (
    <Card className="group overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate(`/products/${product.slug}`)}>
      {/* Product Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
        {(() => {
          const heroImg = getHeroImage(product.slug);
          return heroImg ? (
            <img src={heroImg} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              {getProductIcon(product)}
            </div>
          );
        })()}
        {/* Brand badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full">
          {product.brand}
        </div>
        {/* Awards badge */}
        {product.awards.length > 0 && (
          <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500" /> Award Winner
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
            {product.subcategory.replace('-', ' ')}
          </span>
          {variantCount > 1 && (
            <span className="text-xs text-gray-400">{variantCount} options</span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
          {product.name}
        </h3>

        <p className="mt-1.5 text-sm text-gray-600 leading-relaxed line-clamp-2">
          {product.tagline}
        </p>

        {/* Key features - top 3 */}
        <div className="mt-3 space-y-1.5">
          {product.features.slice(0, 3).map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
              <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{f}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-xs text-gray-400">Starting at</span>
            <div className="text-xl font-bold text-gray-900">{startingPrice}</div>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-1 text-xs">
            View Details <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Products() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = (activeCategory === 'all' ? ALL_PRODUCTS : PRODUCTS_BY_CATEGORY[activeCategory] || [])
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || 
             p.tagline.toLowerCase().includes(q) ||
             p.subcategory.includes(q);
    });

  const categories: { key: Category; label: string; count: number }[] = [
    { key: 'all', label: 'All Products', count: ALL_PRODUCTS.length },
    { key: 'shades', label: 'Shades', count: PRODUCTS_BY_CATEGORY.shades.length },
    { key: 'blinds', label: 'Blinds', count: PRODUCTS_BY_CATEGORY.blinds.length },
    { key: 'shutters', label: 'Shutters', count: PRODUCTS_BY_CATEGORY.shutters.length },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">
              Snap<span className="text-blue-500">Shades</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="/#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
            <a href="/products" className="text-blue-600 font-semibold">Products</a>
            <a href="/#faq" className="hover:text-blue-600 transition">FAQ</a>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              Start Project
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Premium Window Coverings at{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                Unbeatable Prices
              </span>
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Norman® award-winning products — blinds, shades & shutters custom-made for your windows.
              Our prices are up to 64% below retail.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {cat.key !== 'all' && <span className="mr-1.5">{categoryIcons[cat.key]}</span>}
                {cat.label}
                <span className={`ml-1.5 text-xs ${activeCategory === cat.key ? 'text-blue-200' : 'text-gray-400'}`}>
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Description */}
      {activeCategory !== 'all' && categoryDescriptions[activeCategory] && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">{categoryDescriptions[activeCategory]}</p>
        </div>
      )}

      {/* Product Grid */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No products found</p>
              <Button variant="outline" className="mt-4" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
                View All Products
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white">Not Sure Which Product Is Right?</h2>
          <p className="mt-2 text-blue-100">Start a project and we'll help you choose the perfect window covering.</p>
          <Button size="lg" className="mt-6 bg-white text-blue-700 hover:bg-blue-50 rounded-full px-8 font-semibold">
            Start Your Project
          </Button>
        </div>
      </section>
    </div>
  );
}
