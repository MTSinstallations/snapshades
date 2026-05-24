import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface YesNoUnknownRadioProps {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
  required?: boolean;
}

export default function YesNoUnknownRadio({ id, label, value, onChange, required = false }: YesNoUnknownRadioProps) {
  const displayValue = value === 'yes' ? 'Yes' : value === 'no' ? 'No' : value === 'unknown' ? 'Unknown' : '';

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {required && <span className="text-red-500 text-sm">*</span>}
        {displayValue && <span className="text-sm text-gray-500">: {displayValue}</span>}
      </div>
      <RadioGroup
        value={value || ''}
        onValueChange={(v) => onChange(id, v)}
        className="space-y-2"
      >
        {['yes', 'no', 'unknown'].map(opt => (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem value={opt} id={`${id}-${opt}`} />
            <label htmlFor={`${id}-${opt}`} className="text-sm text-gray-700 cursor-pointer capitalize">
              {opt === 'yes' ? 'Yes' : opt === 'no' ? 'No' : 'Unknown'}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
