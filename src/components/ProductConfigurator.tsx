import { useState, useMemo } from 'react';
import { Check, Copy, ChevronDown, ChevronUp, HelpCircle, ArrowRight, Clipboard, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PRODUCT_ORDER_FIELDS, type OrderField } from '@/lib/norman-order-specs';
import { ALL_SWATCHES, SWATCHES_BY_PRODUCT, type Swatch } from '@/data/norman-swatches';
import FabricSelector from './FabricSelector';

interface WindowConfig {
  id: string;
  room: string;
  windowName: string;
  productSlug: string;
  selections: Record<string, string | number | boolean>;
  isConfigured: boolean;
}

interface ProductConfiguratorProps {
  productSlug: string;
  productName: string;
  windows: { id: string; room: string; windowName: string }[];
  onComplete: (configs: WindowConfig[]) => void;
}

export default function ProductConfigurator({ productSlug, productName, windows, onComplete }: ProductConfiguratorProps) {
  const fields = useMemo(() => PRODUCT_ORDER_FIELDS[productSlug] || [], [productSlug]);
  const swatches = useMemo(() => SWATCHES_BY_PRODUCT[productSlug] || ALL_SWATCHES.slice(0, 20), [productSlug]);

  const [configs, setConfigs] = useState<WindowConfig[]>(() =>
    windows.map(w => ({
      ...w,
      productSlug,
      selections: Object.fromEntries(fields.filter(f => f.default !== undefined).map(f => [f.id, f.default!])),
      isConfigured: false,
    }))
  );

  const [activeWindowIdx, setActiveWindowIdx] = useState(0);
  const [showOptional, setShowOptional] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargets, setCopyTargets] = useState<Set<number>>(new Set());

  const activeConfig = configs[activeWindowIdx];

  // Split fields into essential vs optional
  const essentialFields = useMemo(() => fields.filter(f => f.priority === 'essential'), [fields]);
  const optionalFields = useMemo(() => fields.filter(f => f.priority === 'optional'), [fields]);

  // Check if a field should be visible (dependency check)
  const isFieldVisible = (field: OrderField): boolean => {
    if (!field.dependsOn) return true;
    const depValue = String(activeConfig.selections[field.dependsOn.field] ?? '');
    if (Array.isArray(field.dependsOn.value)) {
      return field.dependsOn.value.includes(depValue);
    }
    return depValue === field.dependsOn.value;
  };

  const updateSelection = (fieldId: string, value: string | number | boolean) => {
    setConfigs(prev => prev.map((c, i) =>
      i === activeWindowIdx ? { ...c, selections: { ...c.selections, [fieldId]: value } } : c
    ));
  };

  const markConfigured = () => {
    setConfigs(prev => prev.map((c, i) =>
      i === activeWindowIdx ? { ...c, isConfigured: true } : c
    ));
    const nextIdx = configs.findIndex((c, i) => i > activeWindowIdx && !c.isConfigured);
    if (nextIdx >= 0) setActiveWindowIdx(nextIdx);
  };

  const copyToAll = () => {
    const sourceSelections = { ...activeConfig.selections };
    delete sourceSelections.width;
    delete sourceSelections.height;
    setConfigs(prev => prev.map((c, i) => {
      if (i === activeWindowIdx) return c;
      return { ...c, selections: { ...c.selections, ...sourceSelections } };
    }));
  };

  const copyToWindows = () => {
    const sourceSelections = { ...activeConfig.selections };
    delete sourceSelections.width;
    delete sourceSelections.height;
    setConfigs(prev => prev.map((c, i) => {
      if (!copyTargets.has(i) || i === activeWindowIdx) return c;
      return { ...c, selections: { ...c.selections, ...sourceSelections } };
    }));
    setShowCopyModal(false);
    setCopyTargets(new Set());
  };

  const allConfigured = configs.every(c => c.isConfigured);
  const configuredCount = configs.filter(c => c.isConfigured).length;

  // Check if all essential fields are filled
  const essentialComplete = essentialFields.filter(f => isFieldVisible(f) && f.required).every(f => {
    const val = activeConfig.selections[f.id];
    return val !== undefined && val !== '' && val !== null;
  });

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
              <div className="hidden group-hover:block absolute z-10 bottom-full left-0 mb-1 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2">
                {field.helpText}
              </div>
            </div>
          )}
        </div>

        {/* SELECT */}
        {field.type === 'select' && field.options && (
          <div className="space-y-1.5">
            {field.options.map(opt => {
              const isSelected = String(activeConfig.selections[field.id]) === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateSelection(field.id, opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>{opt.label}</span>
                  {opt.surcharge && (
                    <span className="ml-auto text-xs text-orange-600 flex-shrink-0">
                      +{opt.surchargeType === 'percent' ? `${opt.surcharge}%` : `$${opt.surcharge}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* NUMBER */}
        {field.type === 'number' && (
          <input
            type="number"
            value={activeConfig.selections[field.id] as number || ''}
            onChange={e => updateSelection(field.id, parseFloat(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.min ? `${field.min}" - ${field.max}"` : ''}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono"
          />
        )}

        {/* BOOLEAN */}
        {field.type === 'boolean' && (
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={!!activeConfig.selections[field.id]}
              onChange={e => updateSelection(field.id, e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        )}

        {/* COLOR (swatch picker) - uses FabricSelector */}
        {field.type === 'color' && (
          <FabricSelector
            productSlug={productSlug}
            value={(() => {
              const selectedId = activeConfig.selections[field.id];
              return (selectedId ? swatches.find(s => s.id === selectedId) : null) as Swatch | null;
            })()}
            onChange={(swatch) => {
              updateSelection(field.id, swatch.id);
              // Save swatch details to localStorage for order confirmation
              try {
                const SWATCHES_KEY = 'snapshades_swatches';
                const windowId = configs[activeWindowIdx]?.id || 'unknown';
                const existing: Record<string, unknown> = JSON.parse(localStorage.getItem(SWATCHES_KEY) || '{}');
                existing[windowId] = {
                  swatchId: swatch.id,
                  swatchName: swatch.name,
                  swatchCollection: swatch.collection,
                  swatchImageUrl: swatch.imageUrl,
                  swatchColor: swatch.color,
                  swatchOpacity: swatch.opacity,
                  swatchCode: swatch.code,
                };
                localStorage.setItem(SWATCHES_KEY, JSON.stringify(existing));
              } catch { /* ignore */ }
            }}
            label={`Select ${field.label || 'Color'}`}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Window tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {configs.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveWindowIdx(i)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
              i === activeWindowIdx
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : c.isConfigured
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {c.isConfigured && <Check className="w-3.5 h-3.5 inline mr-1" />}
            <span className="text-xs text-gray-400 mr-1">{c.room}</span>
            {c.windowName}
          </button>
        ))}
      </div>

      {/* Progress + Copy */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{configuredCount} of {configs.length} windows configured</span>
        <div className="flex gap-2">
          {configs.length > 1 && (
            <>
              <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" onClick={copyToAll}>
                <Copy className="w-3 h-3" /> Copy to All
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" onClick={() => { setCopyTargets(new Set()); setShowCopyModal(true); }}>
                <Clipboard className="w-3 h-3" /> Copy to Some...
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Copy modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCopyModal(false)}>
          <Card className="max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-900 mb-2">Copy Options To...</h3>
              <p className="text-xs text-gray-500 mb-4">
                Copies all options from <strong>{activeConfig.room} — {activeConfig.windowName}</strong> except measurements.
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {configs.map((c, i) => {
                  if (i === activeWindowIdx) return null;
                  return (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={copyTargets.has(i)}
                        onChange={e => {
                          const next = new Set(copyTargets);
                          if (e.target.checked) { next.add(i); } else { next.delete(i); }
                          setCopyTargets(next);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{c.room} — {c.windowName}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowCopyModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 text-white rounded-full" disabled={copyTargets.size === 0} onClick={copyToWindows}>
                  Copy to {copyTargets.size} Window{copyTargets.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== ESSENTIAL FIELDS ========== */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Configure Your {productName}</h3>
          {essentialFields.map(renderField)}
        </CardContent>
      </Card>

      {/* ========== OPTIONAL FIELDS (behind toggle) ========== */}
      {optionalFields.length > 0 && (
        <>
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-center gap-2 py-3 mb-4 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showOptional ? 'Hide' : 'Show'} Additional Options ({optionalFields.filter(isFieldVisible).length})
            {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showOptional && (
            <Card className="mb-4">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Additional Options</h3>
                <p className="text-xs text-gray-400 mb-4">These have sensible defaults. Customize only if needed.</p>
                {optionalFields.map(renderField)}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <Button
          className="flex-1 bg-blue-600 text-white rounded-full py-5 text-lg font-semibold gap-2"
          disabled={!essentialComplete}
          onClick={markConfigured}
        >
          {activeConfig.isConfigured ? 'Update & Next' : 'Confirm Window'} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {!essentialComplete && (
        <p className="text-xs text-center text-gray-400 mt-2">Fill in all required fields above to continue</p>
      )}

      {allConfigured && (
        <Button
          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white rounded-full py-5 text-lg font-bold gap-2"
          onClick={() => onComplete(configs)}
        >
          <Check className="w-5 h-5" /> All {configs.length} Windows Configured — Continue to Cart
        </Button>
      )}
    </div>
  );
}
