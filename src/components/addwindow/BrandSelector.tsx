import { BRANDS, type BrandInfo } from '@/lib/norman-order-specs';
import { getCategoryById } from '@/data/product-categories';

interface BrandSelectorProps {
  categoryId: string;
  value: string | null;
  onChange: (brandId: string) => void;
}

function BrandCard({ brand, isSelected, onClick }: { brand: BrandInfo; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 overflow-hidden transition-colors text-center ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div className="aspect-[3/2] flex items-center justify-center p-4">
        <div
          className="text-2xl font-black tracking-tight"
          style={{ color: brand.logoColor }}
        >
          {brand.name}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-gray-100">
        <span className="text-xs text-gray-500 leading-tight">{brand.description}</span>
      </div>
    </button>
  );
}

export default function BrandSelector({ categoryId, value, onChange }: BrandSelectorProps) {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  const availableBrands = category.brands
    .map(b => BRANDS[b.brandId])
    .filter(Boolean);

  if (availableBrands.length <= 1) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {availableBrands.map(brand => (
        <BrandCard
          key={brand.id}
          brand={brand}
          isSelected={value === brand.id}
          onClick={() => onChange(brand.id)}
        />
      ))}
    </div>
  );
}

/** Returns whether a product category has multiple brand options */
export function hasBrandOptions(categoryId: string): boolean {
  const category = getCategoryById(categoryId);
  return !!category && category.brands.length > 1;
}
