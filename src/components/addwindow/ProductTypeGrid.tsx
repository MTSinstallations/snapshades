import { getHeroImage } from '@/data/product-images';
import { PRODUCT_CATEGORIES, type GenericCategory } from '@/data/product-categories';

interface ProductTypeGridProps {
  selected: string;
  onSelect: (categoryId: string) => void;
}

export default function ProductTypeGrid({ selected, onSelect }: ProductTypeGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {PRODUCT_CATEGORIES.map((cat: GenericCategory) => {
        const isSelected = selected === cat.id;
        const heroUrl = cat.imageSlug ? getHeroImage(cat.imageSlug) : '';
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`rounded-lg border-2 overflow-hidden transition-colors text-center ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {heroUrl ? (
                <img src={heroUrl} alt={cat.label} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#003366] flex items-center justify-center">
                  <span className="text-white text-xs font-bold px-2 text-center">Unknown</span>
                </div>
              )}
            </div>
            <div className="px-1 py-2">
              <span className="text-xs font-medium text-gray-800 leading-tight">{cat.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
