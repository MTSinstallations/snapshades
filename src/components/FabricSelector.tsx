import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ALL_SWATCHES, SWATCHES_BY_PRODUCT, type Swatch } from '@/data/norman-swatches';

interface FabricSelectorProps {
  productSlug?: string;
  value: Swatch | null;
  onChange: (swatch: Swatch) => void;
  label?: string;
}

const OPACITY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sheer', label: 'Sheer', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'light-filtering', label: 'Light Filtering', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'room-darkening', label: 'Room Darkening', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'blackout', label: 'Blackout', color: 'bg-gray-800 text-white border-gray-600' },
];

const COLLECTIONS = [...new Set(ALL_SWATCHES.map(s => s.collection))].sort();

export default function FabricSelector({ productSlug, value, onChange, label = 'Select Fabric' }: FabricSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOpacity, setSelectedOpacity] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'light-dark' | 'collection'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Get swatches for this product or all
  const productSwatches = useMemo(() => {
    if (productSlug && SWATCHES_BY_PRODUCT[productSlug]) {
      return SWATCHES_BY_PRODUCT[productSlug];
    }
    return ALL_SWATCHES;
  }, [productSlug]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = productSwatches;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.collection.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        (s.color && s.color.toLowerCase().includes(q))
      );
    }

    // Opacity filter
    if (selectedOpacity !== 'all') {
      result = result.filter(s => s.opacity === selectedOpacity);
    }

    // Collection filter
    if (selectedCollection) {
      result = result.filter(s => s.collection === selectedCollection);
    }

    // Sort
    if (sortBy === 'light-dark') {
      result = [...result].sort((a, b) => {
        const aBright = a.color ? getBrightness(a.color) : 128;
        const bBright = b.color ? getBrightness(b.color) : 128;
        return bBright - aBright;
      });
    } else if (sortBy === 'collection') {
      result = [...result].sort((a, b) => a.collection.localeCompare(b.collection));
    }

    return result;
  }, [productSwatches, search, selectedOpacity, selectedCollection, sortBy]);

  function getBrightness(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  const activeFiltersCount = [
    selectedOpacity !== 'all',
    !!selectedCollection,
    !!search,
  ].filter(Boolean).length;

  const handleSelect = (swatch: Swatch) => {
    onChange(swatch);
    setOpen(false);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedOpacity('all');
    setSelectedCollection('');
  };

  return (
    <div className="w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors bg-white text-left"
      >
        {value ? (
          <>
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={value.imageUrl}
                alt={value.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (value.color) {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }
                }}
              />
              {value.color && (
                <div
                  className="w-full h-full hidden"
                  style={{ backgroundColor: value.color }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{value.name}</p>
              <p className="text-sm text-gray-500 truncate">{value.collection}</p>
              {value.opacity && (
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                  value.opacity === 'sheer' ? 'bg-yellow-100 text-yellow-700' :
                  value.opacity === 'light-filtering' ? 'bg-blue-100 text-blue-700' :
                  value.opacity === 'room-darkening' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-800 text-white'
                }`}>
                  {value.opacity.replace('-', ' ')}
                </span>
              )}
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 flex-shrink-0">
              <SlidersHorizontal className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-700">{label}</p>
              <p className="text-sm text-gray-400">Tap to browse {productSwatches.length} fabrics</p>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </>
        )}
      </button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">Choose Your Fabric</h2>
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear {activeFiltersCount}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, collection, or code..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
              />
            </div>

            {/* Filter Row */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-hide">
              {/* Opacity chips */}
              <div className="flex gap-1.5 flex-shrink-0">
                {OPACITY_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSelectedOpacity(f.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedOpacity === f.key
                        ? 'bg-blue-600 text-white'
                        : f.key !== 'all'
                        ? `border ${f.color} opacity-80 hover:opacity-100`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Collection + Sort */}
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-blue-400 outline-none"
              >
                <option value="">All Collections</option>
                {COLLECTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-blue-400 outline-none"
              >
                <option value="popular">Popular</option>
                <option value="light-dark">Light → Dark</option>
                <option value="collection">By Collection</option>
              </select>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 mt-2">
              {filtered.length} fabric{filtered.length !== 1 ? 's' : ''}
              {activeFiltersCount > 0 && ` matching your filters`}
            </p>
          </div>

          {/* Fabric Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No fabrics match your search</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((swatch, i) => {
                    const isSelected = value?.id === swatch.id;
                    return (
                      <motion.button
                        key={swatch.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: Math.min(i * 0.01, 0.3), duration: 0.2 }}
                        onClick={() => handleSelect(swatch)}
                        className={`relative group text-left rounded-xl overflow-hidden transition-all duration-200 ${
                          isSelected
                            ? 'ring-2 ring-blue-500 ring-offset-2 scale-[1.02]'
                            : 'hover:scale-[1.02] hover:shadow-lg'
                        }`}
                      >
                        {/* Fabric Image */}
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          <img
                            src={swatch.imageUrl}
                            alt={swatch.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              if (swatch.color) {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }
                            }}
                          />
                          {swatch.color && (
                            <div
                              className="absolute inset-0 hidden"
                              style={{ backgroundColor: swatch.color }}
                            />
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                          {/* Selected checkmark */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}

                          {/* Opacity badge */}
                          {swatch.opacity && (
                            <span className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                              swatch.opacity === 'sheer' ? 'bg-yellow-100/90 text-yellow-800' :
                              swatch.opacity === 'light-filtering' ? 'bg-blue-100/90 text-blue-800' :
                              swatch.opacity === 'room-darkening' ? 'bg-purple-100/90 text-purple-800' :
                              'bg-gray-800/90 text-white'
                            }`}>
                              {swatch.opacity.replace('-', ' ')}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-2.5 bg-white">
                          <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{swatch.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{swatch.collection}</p>
                          {swatch.code && (
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">{swatch.code}</p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
