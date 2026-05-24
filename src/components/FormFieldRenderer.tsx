import { Check, HelpCircle } from 'lucide-react';
import type { OrderField } from '@/lib/norman-order-specs';

interface Swatch {
  id: string;
  name: string;
  color?: string;
}

interface FormFieldRendererProps {
  field: OrderField;
  value: string | number | boolean | undefined;
  onChange: (fieldId: string, value: string | number | boolean) => void;
  swatches: Swatch[];
  /** Max swatches to display */
  maxSwatches?: number;
  /** Grid columns for swatch picker */
  swatchCols?: string;
  /** Hide width/height number fields (already measured) */
  skipMeasurementFields?: boolean;
}

export default function FormFieldRenderer({
  field,
  value,
  onChange,
  swatches,
  maxSwatches = 40,
  swatchCols = 'grid-cols-5 sm:grid-cols-8',
  skipMeasurementFields = false,
}: FormFieldRendererProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-sm font-medium text-gray-700">{field.label}</label>
        {field.required && <span className="text-red-400 text-xs">*</span>}
        {field.helpText && (
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            <div className="hidden group-hover:block absolute z-10 bottom-full left-0 mb-1 w-60 bg-gray-900 text-white text-xs rounded-lg px-3 py-2">
              {field.helpText}
            </div>
          </div>
        )}
      </div>

      {/* SELECT */}
      {field.type === 'select' && field.options && (
        <div className="space-y-1.5">
          {field.options.map(opt => {
            const isSelected = String(value) === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange(field.id, opt.value)}
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
      {field.type === 'number' && !(skipMeasurementFields && ['width', 'height'].includes(field.id)) && (
        <input
          type="number"
          value={(value as number) || ''}
          onChange={e => onChange(field.id, parseFloat(e.target.value) || 0)}
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
            checked={!!value}
            onChange={e => onChange(field.id, e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">{field.label}</span>
        </label>
      )}

      {/* COLOR (swatch picker) */}
      {field.type === 'color' && (
        <div className={`grid ${swatchCols} gap-2 max-h-48 overflow-y-auto p-1`}>
          {swatches.slice(0, maxSwatches).map(swatch => {
            const isSelected = value === swatch.id;
            return (
              <button
                key={swatch.id}
                onClick={() => onChange(field.id, swatch.id)}
                className={`flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                title={swatch.name}
              >
                <div
                  className="w-10 h-10 rounded-lg border border-gray-200"
                  style={{ backgroundColor: swatch.color || '#ddd' }}
                />
                <span className="text-[9px] text-gray-500 truncate w-full text-center">{swatch.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
