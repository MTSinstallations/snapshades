import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface YesNoRadioProps {
  id: string;
  label: string;
  value: boolean | undefined;
  onChange: (id: string, value: boolean) => void;
  required?: boolean;
}

export default function YesNoRadio({ id, label, value, onChange, required = false }: YesNoRadioProps) {
  const displayValue = value === true ? 'Yes' : value === false ? 'No' : '';

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {required && <span className="text-red-500 text-sm">*</span>}
        {displayValue && <span className="text-sm text-gray-500">: {displayValue}</span>}
      </div>
      <RadioGroup
        value={value === true ? 'yes' : value === false ? 'no' : ''}
        onValueChange={(v) => onChange(id, v === 'yes')}
        className="flex items-center gap-6"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id={`${id}-yes`} />
          <label htmlFor={`${id}-yes`} className="text-sm text-gray-700 cursor-pointer">Yes</label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id={`${id}-no`} />
          <label htmlFor={`${id}-no`} className="text-sm text-gray-700 cursor-pointer">No</label>
        </div>
      </RadioGroup>
    </div>
  );
}
