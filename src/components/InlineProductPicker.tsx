/**
 * InlineProductPicker — Embedded product selection + configuration
 * 
 * Customer picks a product category → options dynamically switch.
 * Change product type → options reset to that product's essentials.
 * 
 * Uses PRODUCT_ORDER_FIELDS from norman-order-specs.ts
 * Uses catalog data for pricing from catalog-index.ts
 */

import { useState, useMemo, useEffect } from 'react';
import { Check, ChevronDown, HelpCircle, SlidersHorizontal, ChevronUp, GitCompare, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PRODUCT_ORDER_FIELDS, type OrderField } from '@/lib/norman-order-specs';
import { ALL_SWATCHES, SWATCHES_BY_PRODUCT } from '@/data/norman-swatches';
import { ALL_PRODUCTS, PRODUCTS_BY_CATEGORY, BRANDS, getCustomerPrice } from '@/data/catalog-index';

interface ProductSelection {
  productSlug: string;
  productName: string;
  selections: Record<string, string | number | boolean>;
}

interface InlineProductPickerProps {
  width: number;
  height: number;
  depth: number;
  onComplete: (selection: ProductSelection) => void;
  initialProduct?: string;
}

// Product category types
type ProductCategory = 'shades' | 'blinds' | 'shutters';

const CATEGORY_META: Record<string, { name: string; emoji: string; desc: string }> = {
  shades: { name: 'Shades', emoji: '🪟', desc: 'Honeycomb, Roller, Roman, Sheer' },
  blinds: { name: 'Blinds', emoji: '🪵', desc: 'Faux Wood, Wood, Vertical' },
  shutters: { name: 'Shutters', emoji: '🏠', desc: 'Plantation Shutters' },
};

export default function InlineProductPicker({ width, height, depth, onComplete, initialProduct }: InlineProductPickerProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>(initialProduct || '');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('shades');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null); // null = all brands
  const [selections, setSelections] = useState<Record<string, string | number | boolean>>({});
  const [showOptional, setShowOptional] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);

  // Get fields for selected product
  const fields = useMemo(() => PRODUCT_ORDER_FIELDS[selectedProduct] || [], [selectedProduct]);
  const essentialFields = useMemo(() => fields.filter(f => f.priority === 'essential'), [fields]);
  const optionalFields = useMemo(() => fields.filter(f => f.priority === 'optional'), [fields]);
  const swatches = useMemo(() => SWATCHES_BY_PRODUCT[selectedProduct] || ALL_SWATCHES.slice(0, 20), [selectedProduct]);

  // When product changes, reset selections but keep measurements
  const handleProductChange = (slug: string) => {
    setSelectedProduct(slug);
    setShowOptional(false);
    // Pre-fill measurements + defaults for new product
    const newFields = PRODUCT_ORDER_FIELDS[slug] || [];
    const defaults = Object.fromEntries(
      newFields.filter(f => f.default !== undefined).map(f => [f.id, f.default!])
    );
    setSelections({
      ...defaults,
      width,
      height,
      mountType: depth >= 3 ? 'inside' : 'outside', // auto-suggest based on depth
    });
  };

  const updateSelection = (fieldId: string, value: string | number | boolean) => {
    setSelections(prev => ({ ...prev, [fieldId]: value }));
  };

  const isFieldVisible = (field: OrderField): boolean => {
    if (!field.dependsOn) return true;
    const depValue = String(selections[field.dependsOn.field] ?? '');
    return Array.isArray(field.dependsOn.value)
      ? field.dependsOn.value.includes(depValue)
      : depValue === field.dependsOn.value;
  };

  // Check if all essential fields filled
  const essentialComplete = essentialFields
    .filter(f => isFieldVisible(f) && f.required)
    .every(f => {
      const val = selections[f.id];
      return val !== undefined && val !== '' && val !== null;
    });

  const selectedCategoryMeta = CATEGORY_META[selectedCategory];

  // Products in selected category, optionally filtered by brand
  const categoryProducts = useMemo(() => {
    let products = PRODUCTS_BY_CATEGORY[selectedCategory] || [];
    if (selectedBrand) {
      products = products.filter(p => p.brand === selectedBrand);
    }
    return products;
  }, [selectedCategory, selectedBrand]);

  // Compute prices for all category products
  const categoryPrices = useMemo(() => {
    return categoryProducts.map(p => {
      if (!p || !p.variants?.[0]?.priceGrid || !width || !height) return { slug: p?.slug ?? '', price: null };
      const result = getCustomerPrice(p.variants[0].priceGrid, width, height);
      return { slug: p.slug, name: p.name, brand: p.brand, price: result?.price ?? null };
    });
  }, [categoryProducts, width, height]);

  // Calculate real price from catalog
  const calculatedPrice = useMemo(() => {
    if (!selectedProduct || !width || !height) return null;
    const product = ALL_PRODUCTS.find(p => p.slug === selectedProduct);
    if (!product || !product.variants || product.variants.length === 0) return null;
    // Use first variant as default (customer selects specific later)
    const variant = product.variants[0];
    if (!variant.priceGrid) return null;
    return getCustomerPrice(variant.priceGrid, width, height);
  }, [selectedProduct, width, height]);

  // Live price: recalculate whenever any selection changes
  const livePriceResult = useMemo(() => {
    if (!selectedProduct || !width || !height) return null;
    const product = ALL_PRODUCTS.find(p => p.slug === selectedProduct);
    if (!product || !product.variants || product.variants.length === 0) return null;
    const variant = product.variants[0];
    if (!variant.priceGrid) return null;
    // Factor in surcharges from PRODUCT_ORDER_FIELDS
    const result = getCustomerPrice(variant.priceGrid, width, height);
    let surcharge = 0;
    essentialFields.forEach(f => {
      if (['width', 'height'].includes(f.id)) return;
      const val = selections[f.id];
      if (val === undefined || val === '' || val === null) return;
      const opt = f.options?.find(o => String(o.value) === String(val));
      if (opt?.surcharge) {
        surcharge += opt.surchargeType === 'percent' ? (result.price * opt.surcharge / 100) : opt.surcharge;
      }
      if (f.type === 'boolean' && val) {
        const boolSurcharge = f.surcharge ?? 0;
        surcharge += typeof boolSurcharge === 'number' ? boolSurcharge : 0;
      }
    });
    return { ...result, price: result.price + surcharge };
  }, [selectedProduct, width, height, selections, essentialFields]);

  // Update live price display when recalculated
  useEffect(() => {
    if (livePriceResult) setLivePrice(livePriceResult.price);
    else setLivePrice(null);
  }, [livePriceResult]);

  const renderField = (field: OrderField) => {
    if (!isFieldVisible(field)) return null;

    return (
      <div key={field.id} className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-medium text-gray-700">{field.label}</label>
          {field.required && <span className="text-red-400 text-xs">*</span>}
          {field.helpText && (
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute z-10 bottom-full left-0 mb-1 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2">
                {field.helpText}
              </div>
            </div>
          )}
        </div>

        {/* SELECT */}
        {field.type === 'select' && field.options && (
          <div className="space-y-1.5">
            {field.options.map(opt => {
              const isSelected = String(selections[field.id]) === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateSelection(field.id, opt.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>{opt.label}</span>
                  {opt.surcharge && (
                    <span className="ml-auto text-xs text-orange-600">
                      +{opt.surchargeType === 'percent' ? `${opt.surcharge}%` : `$${opt.surcharge}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* NUMBER — skip width/height (already measured) */}
        {field.type === 'number' && !['width', 'height'].includes(field.id) && (
          <input
            type="number"
            value={selections[field.id] as number || ''}
            onChange={e => updateSelection(field.id, parseFloat(e.target.value) || 0)}
            min={field.min} max={field.max} step={field.step}
            placeholder={field.min ? `${field.min}" - ${field.max}"` : ''}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono"
          />
        )}

        {/* BOOLEAN */}
        {field.type === 'boolean' && (
          <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-gray-50 rounded-xl">
            <input type="checkbox" checked={!!selections[field.id]}
              onChange={e => updateSelection(field.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        )}

        {/* COLOR */}
        {field.type === 'color' && (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1">
            {swatches.slice(0, 32).map(swatch => {
              const isSelected = selections[field.id] === swatch.id;
              return (
                <button key={swatch.id} onClick={() => updateSelection(field.id, swatch.id)}
                  className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`} title={swatch.name}>
                  <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: swatch.color || '#ddd' }} />
                  <span className="text-[8px] text-gray-500 truncate w-full text-center">{swatch.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // All products in category (for comparison mode — never filtered by brand)
  const allCategoryProducts = useMemo(() => {
    return PRODUCTS_BY_CATEGORY[selectedCategory] || [];
  }, [selectedCategory]);

  // Prices for all products in category (cross-brand comparison)
  const allCategoryPrices = useMemo(() => {
    return allCategoryProducts.map(p => {
      if (!p || !p.variants?.[0]?.priceGrid || !width || !height) return { slug: p?.slug ?? '', name: p?.name ?? '', brand: p?.brand ?? '', price: null };
      const result = getCustomerPrice(p.variants[0].priceGrid, width, height);
      return { slug: p.slug, name: p.name, brand: p.brand, price: result?.price ?? null };
    });
  }, [allCategoryProducts, width, height]);

  // Brand color badge
  const brandBadge = (brand: string) => {
    if (brand === 'Norman®') return 'bg-blue-100 text-blue-700';
    if (brand === 'Onyx®') return 'bg-gray-100 text-gray-700';
    if (brand === 'Levolor®') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      {/* Category + Brand Header */}
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Choose your product</h2>
      <p className="text-sm text-gray-500 text-center mb-4">
        For your {width}" × {height}" window
        {depth && <> • {depth}" depth {depth >= 3 ? '(inside mount OK)' : '(outside mount recommended)'}</>}
      </p>

      {/* Category tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
        {(['shades', 'blinds', 'shutters'] as ProductCategory[]).map(cat => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setSelectedProduct(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{meta.emoji}</span>
              <span>{meta.name}</span>
            </button>
          );
        })}
      </div>

      {/* Brand filter pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedBrand(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedBrand === null
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          All Brands
        </button>
        {BRANDS.map(b => (
          <button
            key={b.id}
            onClick={() => { setSelectedBrand(b.name); setSelectedProduct(''); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedBrand === b.name
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {categoryProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No products available for this selection
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {categoryProducts.map(p => {
            const priceEntry = categoryPrices.find(cp => cp.slug === p.slug);
            const displayPrice = priceEntry?.price;
            const isSelected = selectedProduct === p.slug;
            const meta = CATEGORY_META[selectedCategory];
            return (
              <button
                key={p.slug}
                onClick={() => handleProductChange(p.slug)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900 truncate leading-tight">{p.name}</div>
                    <span className={`inline-block mt-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${brandBadge(p.brand)}`}>
                      {p.brand}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                </div>
                <div className="text-sm font-bold mt-1">
                  {displayPrice !== null && displayPrice !== undefined ? (
                    <span className={isSelected ? 'text-blue-700' : 'text-gray-900'}>
                      ${displayPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Compare toggle */}
      {selectedProduct && allCategoryProducts.length > 1 && (
        <button
          onClick={() => setCompareMode(m => !m)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 mb-4 text-sm font-medium rounded-xl border-2 transition-all ${
            compareMode
              ? 'border-blue-400 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {compareMode ? <X className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
          {compareMode ? 'Exit Comparison' : `Compare All ${allCategoryProducts.length} Products Across Brands`}
        </button>
      )}

      {/* Cross-brand comparison grid */}
      {compareMode && allCategoryProducts.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cross-Brand Price Comparison</span>
            <span className="text-xs text-gray-400">— {width}" × {height}" with current options</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allCategoryPrices.map(({ slug, name, brand, price }) => {
              const isSelected = slug === selectedProduct;
              const meta = CATEGORY_META[selectedCategory];
              return (
                <button
                  key={slug}
                  onClick={() => handleProductChange(slug)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{meta.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium truncate leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{name}</div>
                      <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${brandBadge(brand)}`}>{brand}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </div>
                  <div className="text-lg font-bold">
                    {price !== null ? (
                      <span className={isSelected ? 'text-blue-700' : 'text-gray-900'}>${price.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No pricing</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Showing base price. Upgrades (motorization, etc.) will adjust the total.
          </p>
        </div>
      )}

      {/* Configuration (only shows after product selected) */}
      {selectedProduct && fields.length > 0 && (
        <>
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                {selectedCategoryMeta.emoji} Configure Your {selectedCategoryMeta.name}
              </h3>

              {/* Measurements (pre-filled, shown for reference) */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-gray-400">Width</div>
                  <div className="text-sm font-bold">{width}"</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-gray-400">Height</div>
                  <div className="text-sm font-bold">{height}"</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-gray-400">Depth</div>
                  <div className="text-sm font-bold">{depth}"</div>
                </div>
              </div>

              {/* Essential fields */}
              {essentialFields.filter(f => !['width', 'height'].includes(f.id)).map(renderField)}
            </CardContent>
          </Card>

          {/* Optional fields toggle */}
          {optionalFields.length > 0 && (
            <>
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 text-sm font-medium text-gray-500 hover:text-blue-600 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showOptional ? 'Hide' : 'Show'} Additional Options ({optionalFields.filter(isFieldVisible).length})
                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showOptional && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 mb-3">These have sensible defaults. Customize only if needed.</p>
                    {optionalFields.map(renderField)}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Price Display */}
          {(livePrice !== null || calculatedPrice) && (
            <div className="bg-green-50 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600 font-medium">
                  {livePrice !== null && livePrice !== (calculatedPrice?.price ?? null) ? '⚡ Live Price' : 'Your Price'}
                </div>
                <div className="text-2xl font-bold text-green-800">
                  ${(livePrice ?? calculatedPrice?.price ?? 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-green-600">per window • {width}" × {height}"</div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>Retail: ~${((livePrice ?? calculatedPrice?.price ?? 0) / 0.36).toFixed(0)}+</div>
                <div className="text-green-600 font-medium">You save 60%+</div>
              </div>
            </div>
          )}

          {/* Confirm */}
          <Button
            onClick={() => onComplete({
              productSlug: selectedProduct,
              productName: selectedCategoryMeta.name || selectedProduct,
              selections: { ...selections, width, height },
              ...(calculatedPrice ? { price: livePrice ?? calculatedPrice.price } : {}),
            } as ProductSelection)}
            disabled={!essentialComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold gap-2"
          >
            <Check className="w-5 h-5" />
            {essentialComplete
              ? `Confirm — ${livePrice !== null ? `$${livePrice.toFixed(2)}` : calculatedPrice ? `$${calculatedPrice.price.toFixed(2)}` : selectedCategoryMeta.name}`
              : 'Complete required fields above'
            }
          </Button>
        </>
      )}

      {/* No fields for this product yet */}
      {selectedProduct && fields.length === 0 && (
        <Card className="mb-4">
          <CardContent className="p-5 text-center">
            <p className="text-gray-500">Configuration for this product is coming soon.</p>
            <Button
              onClick={() => onComplete({
                productSlug: selectedProduct,
                productName: selectedCategoryMeta.name || selectedProduct,
                selections: { width, height, mountType: depth >= 3 ? 'inside' : 'outside' },
              })}
              className="mt-4 bg-blue-600 text-white rounded-full"
            >
              Continue Anyway
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
