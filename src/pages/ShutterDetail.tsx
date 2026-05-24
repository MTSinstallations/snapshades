import { useNavigate } from 'react-router-dom';
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { Camera, ArrowLeft, Package, Wrench, Palette, Check, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SHUTTER_LINES, SHUTTER_SURCHARGES, getShutterPrice, type ShutterLine } from '@/data/norman-shutters';

const tierConfig = {
  ship: { icon: Package, label: 'Ship to Door', price: '$0', desc: 'You install or hire locally' },
  install: { icon: Wrench, label: 'Pro Install', price: '+$75/window', desc: 'We send a certified installer' },
  design: { icon: Palette, label: 'Design + Install', price: '+$125/window', desc: 'Design consultation + installation' },
};

export default function ShutterDetail() {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState<ShutterLine>(SHUTTER_LINES[0]);
  const [width, setWidth] = useState(36);
  const [height, setHeight] = useState(48);
  const [tier, setTier] = useState<'ship' | 'install' | 'design'>('install');
  const [expedited, setExpedited] = useState(false);
  const [showSurcharges, setShowSurcharges] = useState(false);

  const pricing = getShutterPrice(selectedLine, width, height, expedited);
  const installFee = tier === 'install' ? 75 : tier === 'design' ? 125 : 0;
  const totalPerWindow = pricing ? pricing.customerPrice + installFee : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/products" className="text-sm text-gray-600 hover:text-blue-600">Products</a>
            <a href="/swatches" className="text-sm text-gray-600 hover:text-blue-600">Swatches</a>
            <Button className="bg-blue-600 text-white rounded-full px-6" onClick={() => navigate('/cart')}>Cart</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <a href="/products" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </a>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Norman® Plantation Shutters</h1>
            <p className="text-lg text-gray-500 mt-2">Hand-crafted furniture for your windows</p>
            
            <div className="mt-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Not just window coverings — plantation shutters are permanent, furniture-quality additions to your home 
                that increase property value. Choose from 6 product lines ranging from budget-friendly engineered 
                composite to premium real hardwood with stained finishes.
              </p>

              {/* Key specs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Material', value: '6 options (composite → hardwood)' },
                  { label: 'Louver Sizes', value: '2.5", 3.5", 4.5"' },
                  { label: 'Tilt Options', value: 'Standard, InvisibleTilt®, AutoTilt' },
                  { label: 'Lead Time', value: '6-8 weeks (3-week expedited available)' },
                  { label: 'Shapes', value: 'Rectangle, Arch, Sunburst, Quarter Round' },
                  { label: 'Warranty', value: 'Limited Lifetime' },
                ].map(spec => (
                  <div key={spec.label} className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="text-xs text-gray-400">{spec.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-0.5">{spec.value}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="bg-blue-50 rounded-xl p-5 mt-4">
                <h3 className="font-semibold text-blue-900 mb-3">Premium Features Available</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'InvisibleTilt® — hidden tilt mechanism',
                    'DayNite — dual louver system',
                    'AutoTilt — motorized per panel',
                    'AquaShield™ — 100% waterproof',
                    'Café style — half-height shutters',
                    'Bypass & bifold track systems',
                  ].map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm text-blue-800">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Calculator */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shutter Price Calculator</h2>

                {/* Product line selector */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Product Line</label>
                  <div className="space-y-2">
                    {SHUTTER_LINES.map(line => (
                      <button
                        key={line.id}
                        onClick={() => setSelectedLine(line)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          selectedLine.id === line.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{line.name}</div>
                            <div className="text-xs text-gray-400">{line.material}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-600">
                              from ${(line.retailPerSqFt * 0.36).toFixed(2)}/sq ft
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size inputs */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Width (inches)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={e => setWidth(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-lg font-mono"
                      min={8}
                      max={144}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Height (inches)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={e => setHeight(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-lg font-mono"
                      min={8}
                      max={120}
                    />
                  </div>
                </div>

                {/* Expedited toggle */}
                {(selectedLine.americasRetailPerSqFt || selectedLine.airFreightPerSqFt) && (
                  <div className="mb-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expedited}
                        onChange={e => setExpedited(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">🚀 Expedited (3-week delivery)</div>
                        <div className="text-xs text-gray-400">
                          {selectedLine.americasRetailPerSqFt ? 'Americas manufacturing' : 'Air freight'}
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {/* Service tier */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Service Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ship', 'install', 'design'] as const).map(t => {
                      const info = tierConfig[t];
                      const Icon = info.icon;
                      return (
                        <button
                          key={t}
                          onClick={() => setTier(t)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            tier === t ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto ${tier === t ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="text-xs font-medium mt-1">{info.label}</div>
                          <div className="text-[10px] text-gray-400">{info.price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price breakdown */}
                {pricing && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Size</span>
                        <span>{width}" × {height}" = {pricing.sqFt} sq ft</span>
                      </div>
                      {pricing.sqFt < 8 && (
                        <div className="flex justify-between text-amber-600 text-xs">
                          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Minimum applies</span>
                          <span>Priced as {pricing.effectiveSqFt} sq ft</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>{selectedLine.name}</span>
                        <span>${pricing.customerPrice.toFixed(2)}</span>
                      </div>
                      {installFee > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>{tier === 'design' ? 'Design + Install' : 'Installation'}</span>
                          <span>${installFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>Lead time</span>
                        <span className="text-xs">{pricing.leadTime}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">Per Window</span>
                          <span className="text-2xl font-bold text-blue-600">${totalPerWindow.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold"
                  onClick={() => navigate('/start')}
                >
                  Start Your Shutter Project
                </Button>

                <p className="mt-3 text-xs text-gray-400 text-center">
                  Manufacturer-direct pricing • Limited lifetime warranty
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Surcharges section */}
        <div className="mt-12">
          <button
            onClick={() => setShowSurcharges(!showSurcharges)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {showSurcharges ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            <span className="font-medium">Add-Ons & Surcharges</span>
          </button>

          {showSurcharges && (
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                {SHUTTER_SURCHARGES.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <div className="text-sm text-gray-900">{s.name}</div>
                      {s.description && <div className="text-xs text-gray-400">{s.description}</div>}
                    </div>
                    <div className="text-sm font-medium text-gray-600 ml-4 whitespace-nowrap">
                      {s.type === 'percent' ? `+${s.price}%` : `+$${s.price.toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compare Lines */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Shutter Lines</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHUTTER_LINES.map(line => (
              <Card key={line.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900">{line.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{line.material}</p>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">{line.description}</p>
                  
                  <div className="mt-4 space-y-1">
                    {line.features.slice(0, 3).map(f => (
                      <div key={f} className="flex items-start gap-1.5 text-xs text-gray-500">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">From</div>
                      <div className="text-lg font-bold text-blue-600">${(line.retailPerSqFt * 0.36).toFixed(2)}/sq ft</div>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 text-white rounded-full"
                      onClick={() => {
                        setSelectedLine(line);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Calculate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
