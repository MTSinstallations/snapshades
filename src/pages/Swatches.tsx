import { useNavigate } from 'react-router-dom';
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useMemo } from 'react';
import { Camera, Search, X, ArrowRight, Check, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_SWATCHES, SWATCHES_BY_PRODUCT, type Swatch } from '@/data/norman-swatches';
import { motion, AnimatePresence } from 'framer-motion';

const OPACITY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sheer', label: 'Sheer', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'light-filtering', label: 'Light Filtering', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'room-darkening', label: 'Room Darkening', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'blackout', label: 'Blackout', color: 'bg-gray-800 text-white border-gray-600' },
];

const COLLECTIONS = [...new Set(ALL_SWATCHES.map(s => s.collection))].sort();

function getBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export default function Swatches() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedOpacity, setSelectedOpacity] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'light-dark' | 'collection'>('popular');
  const [detailSwatch, setDetailSwatch] = useState<Swatch | null>(null);

  const filtered = useMemo(() => {
    let result = ALL_SWATCHES;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.collection.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.color && s.color.toLowerCase().includes(q))
      );
    }
    if (selectedOpacity !== 'all') {
      result = result.filter(s => s.opacity === selectedOpacity);
    }
    if (selectedCollection) {
      result = result.filter(s => s.collection === selectedCollection);
    }
    if (sortBy === 'light-dark') {
      result = [...result].sort((a, b) => {
        const aB = a.color ? getBrightness(a.color) : 128;
        const bB = b.color ? getBrightness(b.color) : 128;
        return bB - aB;
      });
    } else if (sortBy === 'collection') {
      result = [...result].sort((a, b) => a.collection.localeCompare(b.collection));
    }
    return result;
  }, [search, selectedOpacity, selectedCollection, sortBy]);

  const activeFiltersCount = [
    selectedOpacity !== 'all',
    !!selectedCollection,
    !!search,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setSelectedOpacity('all');
    setSelectedCollection('');
  };

  // Group by collection for display
  const grouped = useMemo(() => {
    if (sortBy !== 'collection') return null;
    const map = new Map<string, Swatch[]>();
    for (const s of filtered) {
      if (!map.has(s.collection)) map.set(s.collection, []);
      map.get(s.collection)!.push(s);
    }
    return map;
  }, [filtered, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <Button
            onClick={() => navigate('/start')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 text-sm"
          >
            Start Measuring <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-12 pb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Norman® USA Fabrics
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Your Perfect Fabric</h1>
          <p className="text-lg text-gray-600">
            {ALL_SWATCHES.length} premium window treatments — from airy sheers to total blackout
          </p>
        </div>
      </section>

      {/* Search + Filters */}
      <div className="sticky top-16 bg-white z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, collection, or code..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Opacity filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {OPACITY_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setSelectedOpacity(f.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedOpacity === f.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : f.key !== 'all'
                    ? `border ${f.color} opacity-80 hover:opacity-100`
                    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="flex-1" />
            <select
              value={selectedCollection}
              onChange={e => setSelectedCollection(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 outline-none focus:border-blue-400 flex-shrink-0"
            >
              <option value="">All Collections</option>
              {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'popular' | 'light-dark' | 'collection')}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 outline-none focus:border-blue-400 flex-shrink-0"
            >
              <option value="popular">Popular</option>
              <option value="light-dark">Light → Dark</option>
              <option value="collection">By Collection</option>
            </select>
          </div>

          {/* Results meta */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filtered.length} fabric{filtered.length !== 1 ? 's' : ''}
              {activeFiltersCount > 0 && ' matching your filters'}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-blue-600 font-medium hover:text-blue-700">
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Swatch Grid — by collection or flat */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {grouped ? (
          /* Grouped by collection */
          Array.from(grouped.entries()).map(([collection, swatches]) => (
            <div key={collection} className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                {collection}
                <span className="text-sm font-normal text-gray-400">{swatches.length} options</span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {swatches.map((swatch, i) => (
                  <SwatchCard key={swatch.id} swatch={swatch} index={i} onClick={() => setDetailSwatch(swatch)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Flat grid */
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filtered.map((swatch, i) => (
              <SwatchCard key={swatch.id} swatch={swatch} index={i} onClick={() => setDetailSwatch(swatch)} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900">No fabrics found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4 rounded-full">Clear filters</Button>
          </div>
        )}
      </div>

      {/* Swatch Detail Modal */}
      <AnimatePresence>
        {detailSwatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setDetailSwatch(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Large swatch image */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={detailSwatch.imageUrl}
                  alt={detailSwatch.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (detailSwatch.color) {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }
                  }}
                />
                {detailSwatch.color && (
                  <div className="absolute inset-0 hidden" style={{ backgroundColor: detailSwatch.color }} />
                )}
                {detailSwatch.opacity && (
                  <span className={`absolute bottom-3 left-3 text-sm px-3 py-1 rounded-full font-medium shadow-sm ${
                    detailSwatch.opacity === 'sheer' ? 'bg-yellow-100/90 text-yellow-800' :
                    detailSwatch.opacity === 'light-filtering' ? 'bg-blue-100/90 text-blue-800' :
                    detailSwatch.opacity === 'room-darkening' ? 'bg-purple-100/90 text-purple-800' :
                    'bg-gray-800/90 text-white'
                  }`}>
                    {detailSwatch.opacity.replace('-', ' ')}
                  </span>
                )}
                <button
                  onClick={() => setDetailSwatch(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{detailSwatch.name}</h3>
                  {detailSwatch.code && (
                    <span className="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{detailSwatch.code}</span>
                  )}
                </div>
                <p className="text-gray-500 mb-1">{detailSwatch.collection}</p>
                {detailSwatch.color && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: detailSwatch.color }} />
                    <span className="text-sm text-gray-500 font-mono">{detailSwatch.color}</span>
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-600 mb-5">
                  {detailSwatch.opacity === 'sheer' && (
                    <p>☀️ Elegant and airy — filters light beautifully while maintaining your view to the outside.</p>
                  )}
                  {detailSwatch.opacity === 'light-filtering' && (
                    <p>🌤️ Blocks harsh glare while letting natural light brighten your room. Great for living spaces.</p>
                  )}
                  {detailSwatch.opacity === 'room-darkening' && (
                    <p>🌙 Significantly reduces light — perfect for bedrooms and home theaters.</p>
                  )}
                  {detailSwatch.opacity === 'blackout' && (
                    <p>🌑 Complete light blockage. Ideal for bedrooms, nurseries, and media rooms.</p>
                  )}
                </div>

                <Button
                  onClick={() => { setDetailSwatch(null); navigate('/start'); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-5 font-semibold"
                >
                  Start with This Fabric <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwatchCard({ swatch, index, onClick }: { swatch: Swatch; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.008, 0.5) }}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group text-left rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={swatch.imageUrl}
          alt={swatch.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            if (swatch.color) {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }
          }}
        />
        {swatch.color && (
          <div className="absolute inset-0 hidden" style={{ backgroundColor: swatch.color }} />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        {/* Opacity badge */}
        {swatch.opacity && (
          <span className={`absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            swatch.opacity === 'sheer' ? 'bg-yellow-100/90 text-yellow-800' :
            swatch.opacity === 'light-filtering' ? 'bg-blue-100/90 text-blue-800' :
            swatch.opacity === 'room-darkening' ? 'bg-purple-100/90 text-purple-800' :
            'bg-gray-800/90 text-white'
          }`}>
            {swatch.opacity === 'light-filtering' ? 'Light Filt.' : swatch.opacity === 'room-darkening' ? 'Room Dark.' : swatch.opacity === 'blackout' ? 'Blackout' : 'Sheer'}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="font-semibold text-gray-800 text-xs leading-tight line-clamp-1">{swatch.name}</p>
        <p className="text-gray-400 text-[10px] mt-0.5 line-clamp-1">{swatch.collection}</p>
      </div>
    </motion.button>
  );
}
