import { useState, useMemo } from 'react';
import { Package, Wrench, Palette, Check, ChevronDown, ChevronUp, Truck, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  calculateMeasureQuote, calculateInstallQuote, calculateDesignQuote,
  calculateCombinedQuote,
  MEASURE_TRIP_FEE, MEASURE_PER_WINDOW,
  INSTALL_MINIMUM, INSTALL_PER_ADDITIONAL,
  SURCHARGE_MOTORIZATION, SURCHARGE_LADDER, SURCHARGE_HARD_SURFACE, SURCHARGE_THIRD_STORY,
  TRAVEL_FREE_MILES, TRAVEL_PER_MILE,
  DESIGN_CUSTOMER_RATE,
} from '@/lib/service-pricing-engine';

/**
 * ServicePricingComparison — shows live DIY vs Pro pricing as customer configures
 * 
 * Displays automatically in the cart when service is available in their ZIP.
 * Updates in real-time as windows are added/removed and options selected.
 */

interface ServicePricingComparisonProps {
  windowCount: number;
  productTotal: number;        // Total product cost
  motorizedCount?: number;
  isZipLive: boolean;          // Whether pro service is available in their area
  customerZip?: string;
  travelMiles?: number;
  onSelectTier: (tier: 'diy' | 'pro_measure_install' | 'design_install') => void;
  selectedTier?: 'diy' | 'pro_measure_install' | 'design_install';
}

export default function ServicePricingComparison({
  windowCount,
  productTotal,
  motorizedCount = 0,
  isZipLive,
  customerZip,
  travelMiles = 0,
  onSelectTier,
  selectedTier = 'diy',
}: ServicePricingComparisonProps) {
  const [showSurcharges, setShowSurcharges] = useState(false);
  const [surcharges, setSurcharges] = useState({
    needsLadder: false,
    hardSurface: false,
    thirdStoryPlus: false,
  });

  // Calculate all pricing live
  const measureQuote = useMemo(() => calculateMeasureQuote(windowCount, travelMiles), [windowCount, travelMiles]);
  const installQuote = useMemo(() => calculateInstallQuote(windowCount, {
    motorizedCount,
    ...surcharges,
    travelMiles,
  }), [windowCount, motorizedCount, surcharges, travelMiles]);
  const designQuote = useMemo(() => calculateDesignQuote(1), []);
  const combinedQuote = useMemo(() => calculateCombinedQuote({
    windowCount,
    includeMeasure: true,
    includeInstall: true,
    includeDesign: false,
    motorizedCount,
    ...surcharges,
    travelMiles,
  }), [windowCount, motorizedCount, surcharges, travelMiles]);

  // Shipping estimate (free)
  const shippingCost = 0;

  // Tax estimate (8.75% CA)
  const taxRate = 0.0875;

  const tiers = [
    {
      id: 'diy' as const,
      icon: Package,
      emoji: '📦',
      title: 'Do It Yourself',
      subtitle: 'Ship to Your Door',
      productCost: productTotal,
      serviceCost: 0,
      shippingCost: 0,
      get tax() { return Math.round((this.productCost + this.serviceCost) * taxRate * 100) / 100; },
      get total() { return this.productCost + this.serviceCost + this.shippingCost + this.tax; },
      features: ['Free shipping', 'DIY installation guides', 'Video tutorials'],
      savings: null as string | null,
    },
    {
      id: 'pro_measure_install' as const,
      icon: Wrench,
      emoji: '🔧',
      title: 'Pro Measure & Install',
      subtitle: 'We Handle Everything',
      productCost: productTotal,
      serviceCost: combinedQuote.totalCustomerCost,
      shippingCost: 0,
      get tax() { return Math.round((this.productCost) * taxRate * 100) / 100; }, // Service not taxed
      get total() { return this.productCost + this.serviceCost + this.shippingCost + this.tax; },
      popular: true,
      features: ['Certified local technician', 'Professional measurements', 'Full installation included'],
      savings: null as string | null,
    },
    {
      id: 'design_install' as const,
      icon: Palette,
      emoji: '🎨',
      title: 'Design + Install',
      subtitle: 'Expert Guidance + Pro Install',
      productCost: productTotal,
      serviceCost: combinedQuote.totalCustomerCost + designQuote.customerTotal,
      shippingCost: 0,
      get tax() { return Math.round((this.productCost) * taxRate * 100) / 100; },
      get total() { return this.productCost + this.serviceCost + this.shippingCost + this.tax; },
      features: ['1-on-1 design consultation', 'Expert recommendations', 'Certified local installer'],
      savings: null as string | null,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Choose Your Service Level</h3>
        {!isZipLive && customerZip && (
          <span className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Pro service not yet available in {customerZip}
          </span>
        )}
      </div>

      {/* Live pricing cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {tiers.map(tier => {
          const isSelected = selectedTier === tier.id;
          const isDisabled = tier.id !== 'diy' && !isZipLive;
          const Icon = tier.icon;

          return (
            <button
              key={tier.id}
              onClick={() => !isDisabled && onSelectTier(tier.id)}
              disabled={isDisabled}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isDisabled ? 'opacity-40 cursor-not-allowed border-gray-100' :
                isSelected ? 'border-blue-500 bg-blue-50 shadow-md' :
                'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
              } ${tier.popular && !isDisabled ? 'ring-1 ring-blue-200' : ''}`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{tier.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{tier.title}</div>
                  <div className="text-[10px] text-gray-500">{tier.subtitle}</div>
                </div>
                {tier.popular && !isDisabled && (
                  <span className="ml-auto text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Popular</span>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between text-gray-500">
                  <span>Products ({windowCount})</span>
                  <span>${tier.productCost.toFixed(2)}</span>
                </div>
                {tier.serviceCost > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Service fees</span>
                    <span>${tier.serviceCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Est. tax</span>
                  <span>${tier.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-base">${tier.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Service breakdown detail */}
              {tier.serviceCost > 0 && (
                <div className="mt-2 bg-gray-50 rounded-lg p-2 text-[10px] text-gray-500 space-y-0.5">
                  {tier.id === 'pro_measure_install' && (
                    <>
                      <div>Measure: ${measureQuote.customerTotal.toFixed(2)} ($75 trip + $2×{windowCount})</div>
                      <div>Install: ${installQuote.customerTotal.toFixed(2)} ($100 + $30×{Math.max(0, windowCount - 1)})</div>
                      {travelMiles > TRAVEL_FREE_MILES && <div>Travel: ${installQuote.travelFee.toFixed(2)}</div>}
                    </>
                  )}
                  {tier.id === 'design_install' && (
                    <>
                      <div>Design: ${designQuote.customerTotal.toFixed(2)} (1hr × $50)</div>
                      <div>Measure: ${measureQuote.customerTotal.toFixed(2)}</div>
                      <div>Install: ${installQuote.customerTotal.toFixed(2)}</div>
                    </>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="mt-3 space-y-1">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-3 bg-blue-600 text-white text-xs font-medium py-1.5 rounded-lg text-center">
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Install surcharges (show when pro selected) */}
      {(selectedTier === 'pro_measure_install' || selectedTier === 'design_install') && isZipLive && (
        <div className="mt-4">
          <button
            onClick={() => setShowSurcharges(!showSurcharges)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600"
          >
            {showSurcharges ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Additional installation fees (if applicable)
          </button>

          {showSurcharges && (
            <Card className="mt-2">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-gray-500">Check any that apply to your installation:</p>
                {[
                  { key: 'needsLadder' as const, label: 'Ladder needed (windows above standard height)', price: SURCHARGE_LADDER },
                  { key: 'hardSurface' as const, label: 'Hard surface mount (tile, concrete, stone)', price: SURCHARGE_HARD_SURFACE },
                  { key: 'thirdStoryPlus' as const, label: '3rd story or higher', price: SURCHARGE_THIRD_STORY },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={surcharges[item.key]}
                        onChange={e => setSurcharges(s => ({ ...s, [item.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">+${item.price}</span>
                  </label>
                ))}
                {motorizedCount > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-gray-500">Motorized windows ({motorizedCount})</span>
                    <span className="font-medium text-gray-900">+${(motorizedCount * SURCHARGE_MOTORIZATION).toFixed(2)}</span>
                  </div>
                )}
                {travelMiles > TRAVEL_FREE_MILES && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Travel ({travelMiles - TRAVEL_FREE_MILES} miles beyond free zone)</span>
                    <span className="font-medium text-gray-900">+${((travelMiles - TRAVEL_FREE_MILES) * TRAVEL_PER_MILE).toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pricing reference */}
      <div className="mt-4 bg-gray-50 rounded-xl p-3 text-[10px] text-gray-400 space-y-0.5">
        <div className="font-medium text-gray-500 mb-1">Service pricing reference:</div>
        <div>📏 Measure: ${MEASURE_TRIP_FEE} trip + ${MEASURE_PER_WINDOW}/window</div>
        <div>🔧 Install: ${INSTALL_MINIMUM} min (1 blind) + ${INSTALL_PER_ADDITIONAL}/each additional</div>
        <div>🚗 Travel: Free ≤{TRAVEL_FREE_MILES}mi, ${TRAVEL_PER_MILE}/mi after</div>
        <div>🎨 Design: ${DESIGN_CUSTOMER_RATE}/hr video consultation</div>
      </div>
    </div>
  );
}
