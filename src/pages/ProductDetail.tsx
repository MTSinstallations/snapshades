import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, ArrowRight, CheckCircle, Star, Shield, ChevronDown, Zap, Package, Wrench, Palette, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PRODUCT_BY_SLUG, getCustomerPrice } from '@/data/catalog-index';
import { SWATCHES_BY_PRODUCT, type Swatch } from '@/data/norman-swatches';
import FabricSelector from '@/components/FabricSelector';
import { getProductImages } from '@/data/product-images';
import type { Product } from '@/data/catalog-index';

function PriceCalculator({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [width, setWidth] = useState('36');
  const [height, setHeight] = useState('48');

  const variant = product.variants[selectedVariant];
  const result = variant ? getCustomerPrice(variant.priceGrid, parseFloat(width) || 0, parseFloat(height) || 0) : null;

  // Installation pricing estimate
  const installFee = 50; // per window
  const designFee = 50;  // per consultation

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Get Your Price</h3>
        
        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Product Option</label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              {product.variants.map((v, i) => (
                <option key={v.id} value={i}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Size inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Width (inches)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-blue-400 outline-none"
              min="10" max="200" step="0.125"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Height (inches)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-blue-400 outline-none"
              min="10" max="200" step="0.125"
            />
          </div>
        </div>

        {/* Pricing tiers */}
        {result ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-400">
              Priced for {result.gridWidth}" × {result.gridHeight}" (rounded up to nearest size)
            </div>
            
            {/* Tier 1: Ship to door */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Ship to Your Door</div>
                    <div className="text-xs text-gray-400">Direct from manufacturer</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">${result.price.toFixed(2)}</div>
              </div>
            </div>

            {/* Tier 2: + Install */}
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">+ Pro Installation</div>
                    <div className="text-xs text-gray-400">Matched with local installer</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-700">${(result.price + installFee).toFixed(2)}</div>
              </div>
            </div>

            {/* Tier 3: + Design + Install */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">+ Design & Install</div>
                    <div className="text-xs text-gray-400">Remote consultation + install</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">${(result.price + installFee + designFee).toFixed(2)}</div>
              </div>
            </div>

            <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold gap-2">
              Start Your Project <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            {parseFloat(width) > 0 && parseFloat(height) > 0
              ? 'Size exceeds maximum for this product'
              : 'Enter dimensions to see pricing'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'options' | 'colors'>('overview');
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch | null>(null);

  const product = slug ? PRODUCT_BY_SLUG[slug] : undefined;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <Button className="mt-4" onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const productSwatches = slug ? (SWATCHES_BY_PRODUCT[slug] || []) : [];

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'specs' as const, label: 'Specifications' },
    { key: 'options' as const, label: 'Options & Add-ons' },
    ...(productSwatches.length > 0 ? [{ key: 'colors' as const, label: `Colors (${productSwatches.length})` }] : []),
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
          <Button variant="ghost" onClick={() => navigate('/products')} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> All Products
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="/products" className="hover:text-blue-600">Products</a>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Product Info (3 cols) */}
          <div className="lg:col-span-3">
            {/* Product Images */}
            {(() => {
              const imgSet = getProductImages(product.slug);
              if (imgSet && imgSet.images.length > 0) {
                return (
                  <div className="mb-6">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-2">
                      <img src={imgSet.images[0].url} alt={imgSet.images[0].alt} className="w-full h-full object-cover" />
                    </div>
                    {imgSet.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {imgSet.images.slice(1).map((img, i) => (
                          <div key={i} className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-blue-400 cursor-pointer transition-all">
                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mb-6">
                  <p className="text-sm text-gray-400">Product image</p>
                </div>
              );
            })()}

            {/* Brand + Name */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{product.brand}</span>
              {product.awards.length > 0 && (
                <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-500" /> {product.awards.length} Award{product.awards.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-lg text-gray-600">{product.tagline}</p>

            {/* Tabs */}
            <div className="mt-8 flex gap-1 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'overview' && (
                <div>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  
                  <h3 className="mt-8 text-lg font-semibold text-gray-900">Key Features</h3>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    {product.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="mt-8 text-lg font-semibold text-gray-900">Benefits</h3>
                  <div className="mt-3 space-y-2">
                    {product.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {product.awards.length > 0 && (
                    <>
                      <h3 className="mt-8 text-lg font-semibold text-gray-900">Awards</h3>
                      <div className="mt-3 space-y-2">
                        {product.awards.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <div key={key} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <div className="w-1/3 px-4 py-3 text-sm font-medium text-gray-500">{key}</div>
                        <div className="w-2/3 px-4 py-3 text-sm text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>

                  {product.restrictions.length > 0 && (
                    <>
                      <h3 className="mt-6 text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-orange-500" /> Important Notes
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {product.restrictions.map((r, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-400">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* Variants */}
                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Available Options</h3>
                  <div className="mt-2 space-y-2">
                    {product.variants.map(v => (
                      <div key={v.id} className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{v.name}</div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {v.cellSize !== 'N/A' && `Cell: ${v.cellSize} · `}
                          {v.construction} · Max width: {v.maxWidth}"
                        </div>
                        {v.fabricGroups && v.fabricGroups.map(fg => (
                          <div key={fg.groupNumber} className="text-xs text-gray-400 mt-1">
                            Fabrics: {fg.fabrics.join(', ')}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'options' && (
                <div>
                  {/* Lift Systems */}
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Lift Systems</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.liftSystems.map(ls => (
                      <span key={ls} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                        {ls}
                      </span>
                    ))}
                  </div>

                  {/* Motorization */}
                  {product.motorization.available && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Motorization</h3>
                      <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Smart Motorization Available</span>
                        </div>
                        {product.motorization.options?.map((opt, i) => (
                          <p key={i} className="text-xs text-blue-700">{opt}</p>
                        ))}
                        {product.motorization.surcharges && (
                          <div className="mt-3 space-y-1">
                            {product.motorization.surcharges.map((s, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-blue-700">{s.name}</span>
                                <span className="font-medium text-blue-900">
                                  +${(s.price * 0.36).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Surcharges */}
                  {product.surcharges && product.surcharges.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Add-ons & Upgrades</h3>
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        {product.surcharges.map((s, i) => (
                          <div key={i} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <div>
                              <div className="text-sm text-gray-900">{s.name}</div>
                              {s.description && <div className="text-xs text-gray-400">{s.description}</div>}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {s.type === 'percent'
                                ? `+${s.price}%`
                                : `+$${(s.price * 0.36).toFixed(2)}`
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'colors' && productSwatches.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Browse the full {productSwatches.length}-swatch Norman® collection. Tap any fabric to learn more.
                  </p>
                  <FabricSelector
                    productSlug={slug}
                    value={selectedSwatch}
                    onChange={setSelectedSwatch}
                    label="Browse this product's fabrics"
                  />
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      className="rounded-full text-sm"
                      onClick={() => navigate('/swatches')}
                    >
                      View All Fabrics Across Products
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Price Calculator (2 cols) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <PriceCalculator product={product} />

              {/* Quick facts */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Price Guarantee — lowest price, period
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Custom made to your dimensions
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Fit guaranteed
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-blue-500" /> {product.brand} warranty
                </div>
              </div>

              {/* Swatch CTA */}
              <Button variant="outline" className="w-full mt-4 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50">
                🎨 Order Free Swatches
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
