import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, ArrowLeft, ArrowRight, ChevronRight, Plus, Trash2, MapPin, Package, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_PRODUCTS, getCustomerPrice } from '@/data/catalog-index';
import { getHeroImage } from '@/data/product-images';
import { calculateShipping } from '@/lib/shipping';
import { PRICE_MULTIPLIER } from '@/lib/constants';
import { loadLocalCart, saveLocalCart } from '@/lib/persistent-cart';
import WindowDepthDiagram from '@/components/measure/WindowDepthDiagram';
import type { CartWindow } from '@/hooks/useCart';

// ============================================================
// TYPES
// ============================================================

type MountType = 'inside' | 'outside';
type OutsideMountStyle = 'on-trim' | 'above-trim' | 'no-trim';

interface WindowEntry {
  id: string;
  room: string;
  roomNumber: number;
  mountType: MountType | null;
  outsideStyle: OutsideMountStyle | null;
  width: number | null;
  widthFraction: string;
  height: number | null;
  heightFraction: string;
  depth: number | null;
  depthFraction: string;
  selectedProduct: string | null;
  productPrice: number | null;
}

// Product categories for quick toggle
const PRODUCT_TYPES = [
  { slug: 'portrait-honeycomb-shades', label: 'Honeycomb Shades', short: 'Honeycomb', desc: 'Energy efficient cellular' },
  { slug: 'soluna-roller', label: 'Roller Shades', short: 'Roller', desc: 'Clean modern look' },
  { slug: 'norman-shutters', label: 'Plantation Shutters', short: 'Shutters', desc: 'Classic & premium' },
  { slug: 'ultimate-faux-wood', label: 'Faux Wood Blinds', short: 'Faux Wood', desc: 'Wood look, durable' },
  { slug: 'centerpiece-roman', label: 'Roman Shades', short: 'Roman', desc: 'Elegant fabric folds' },
  { slug: 'perfectsheer', label: 'Sheer Shades', short: 'Sheer', desc: 'Soft light diffusion' },
];

type MeasurePhase = 'mount-type' | 'outside-style' | 'measure-guide' | 'width' | 'width-fraction' | 'height' | 'height-fraction' | 'depth' | 'depth-fraction' | 'done';

// ============================================================
// ROOM BUTTONS
// ============================================================

const ROOMS = [
  'Living Room', 'Family Room', 'Kitchen', 'Bedroom', 'Office',
  'Primary Bed', 'Primary Bath', 'Bath', 'Hall', 'Den', 'Stairs', 'Custom',
];

// ============================================================
// NUMBER GRID (10-129, matching the screenshot)
// ============================================================

const WHOLE_NUMBERS: number[] = [];
for (let i = 10; i <= 129; i++) WHOLE_NUMBERS.push(i);

const FRACTIONS = [
  { label: '0', value: '' },
  { label: '⅛', value: '1/8' },
  { label: '¼', value: '1/4' },
  { label: '⅜', value: '3/8' },
  { label: '½', value: '1/2' },
  { label: '⅝', value: '5/8' },
  { label: '¾', value: '3/4' },
  { label: '⅞', value: '7/8' },
];

const DEPTH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ============================================================
// COMPONENT
// ============================================================

export default function StartProject() {
  const navigate = useNavigate();
  const [zip, setZip] = useState('');
  const [windows, setWindows] = useState<WindowEntry[]>([]);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [customRoom, setCustomRoom] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Measurement modal state
  const [measuringWindow, setMeasuringWindow] = useState<string | null>(null);
  const [measurePhase, setMeasurePhase] = useState<MeasurePhase>('width');

  const activeWindow = windows.find(w => w.id === measuringWindow);

  // ── Room Selection ──
  const addRoom = useCallback((roomName: string) => {
    const count = (roomCounts[roomName] || 0) + 1;
    setRoomCounts(prev => ({ ...prev, [roomName]: count }));

    const id = `${roomName}-${count}-${Date.now()}`;
    const entry: WindowEntry = {
      id, room: roomName, roomNumber: count,
      mountType: null, outsideStyle: null,
      width: null, widthFraction: '', height: null, heightFraction: '',
      depth: null, depthFraction: '',
      selectedProduct: null, productPrice: null,
    };
    setWindows(prev => [...prev, entry]);
    setMeasuringWindow(id);
    setMeasurePhase('mount-type');
  }, [roomCounts]);

  const removeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (measuringWindow === id) setMeasuringWindow(null);
  };

  // ── Measurement Updates ──
  const updateWindow = (id: string, updates: Partial<WindowEntry>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const selectWholeNumber = (num: number) => {
    if (!measuringWindow) return;
    if (measurePhase === 'width') {
      updateWindow(measuringWindow, { width: num });
      setMeasurePhase('width-fraction');
    } else if (measurePhase === 'height') {
      updateWindow(measuringWindow, { height: num });
      setMeasurePhase('height-fraction');
    } else if (measurePhase === 'depth') {
      updateWindow(measuringWindow, { depth: num });
      setMeasurePhase('depth-fraction');
    }
  };

  const selectFraction = (frac: string) => {
    if (!measuringWindow) return;
    if (measurePhase === 'width-fraction') {
      updateWindow(measuringWindow, { widthFraction: frac });
      setMeasurePhase('height');
    } else if (measurePhase === 'height-fraction') {
      updateWindow(measuringWindow, { heightFraction: frac });
      setMeasurePhase('depth');
    } else if (measurePhase === 'depth-fraction') {
      updateWindow(measuringWindow, { depthFraction: frac });
      setMeasurePhase('done');
      setMeasuringWindow(null);
    }
  };

  const formatMeasurement = (whole: number | null, frac: string): string => {
    if (whole === null) return '—';
    return frac ? `${whole} ${frac}"` : `${whole}"`;
  };

  const isOnTrim = activeWindow?.outsideStyle === 'on-trim';
  const depthLabel = isOnTrim ? 'Trim Thickness' : 'Depth';

  const currentPhaseLabel: Record<MeasurePhase, string> = {
    'mount-type': 'Mount Type',
    'outside-style': 'Outside Mount Style',
    'measure-guide': 'How to Measure',
    'width': 'Select Width',
    'width-fraction': 'Width Fraction',
    'height': 'Select Height',
    'height-fraction': 'Height Fraction',
    'depth': isOnTrim ? 'Trim Thickness' : 'Select Depth',
    'depth-fraction': isOnTrim ? 'Trim Fraction' : 'Depth Fraction',
    'done': 'Done',
  };

  const currentPhaseSubLabel: Record<MeasurePhase, string> = {
    'mount-type': 'Where will your treatment be mounted?',
    'outside-style': 'How will it mount outside the opening?',
    'measure-guide': 'Follow the arrows to measure correctly',
    'width': 'Tap the whole number for the width',
    'width-fraction': 'Tap the nearest fraction',
    'height': 'Tap the whole number for the height',
    'height-fraction': 'Tap the nearest fraction',
    'depth': isOnTrim ? 'How thick is the window trim?' : 'Tap the depth of the window frame',
    'depth-fraction': 'Tap the nearest fraction',
    'done': '',
  };

  const phaseSteps = ['W', 'W+', 'H', 'H+', 'D', 'D+'];
  const phaseIndex = ['width', 'width-fraction', 'height', 'height-fraction', 'depth', 'depth-fraction'].indexOf(measurePhase);

  const allWindowsMeasured = windows.length > 0 && windows.every(w => w.width !== null && w.height !== null && w.depth !== null);

  // Calculate price for a window given a product slug
  const getPrice = useCallback((w: WindowEntry, productSlug: string): number | null => {
    if (w.width === null || w.height === null) return null;
    const widthInches = w.width + (w.widthFraction === '1/2' ? 0.5 : w.widthFraction === '1/4' ? 0.25 : w.widthFraction === '3/4' ? 0.75 : w.widthFraction === '1/8' ? 0.125 : w.widthFraction === '3/8' ? 0.375 : w.widthFraction === '5/8' ? 0.625 : w.widthFraction === '7/8' ? 0.875 : 0);
    const heightInches = w.height + (w.heightFraction === '1/2' ? 0.5 : w.heightFraction === '1/4' ? 0.25 : w.heightFraction === '3/4' ? 0.75 : w.heightFraction === '1/8' ? 0.125 : w.heightFraction === '3/8' ? 0.375 : w.heightFraction === '5/8' ? 0.625 : w.heightFraction === '7/8' ? 0.875 : 0);
    const product = ALL_PRODUCTS.find(p => p.slug === productSlug);
    if (!product || !product.variants?.length) return null;
    const result = getCustomerPrice(product.variants[0].priceGrid, widthInches, heightInches);
    return result?.price ?? null;
  }, []);

  // Select product for a window
  const selectProduct = (windowId: string, productSlug: string) => {
    const w = windows.find(win => win.id === windowId);
    if (!w) return;
    const price = getPrice(w, productSlug);
    updateWindow(windowId, { selectedProduct: productSlug, productPrice: price });
  };

  // Order total + shipping
  const productTotal = windows.reduce((sum, w) => sum + (w.productPrice || 0), 0);
  const shippingItems = windows.filter(w => w.selectedProduct && w.width).map(w => ({
    productSlug: w.selectedProduct!, width: w.width!, height: w.height!,
  }));
  const shippingQuote = calculateShipping(shippingItems, zip);
  const orderTotal = productTotal + shippingQuote.subtotal;
  const allProductsSelected = allWindowsMeasured && windows.every(w => w.selectedProduct !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={24} />
            <span className="text-lg font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          {windows.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              {windows.length} window{windows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* ── HEADER ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Build Your Order</h1>
          <p className="text-sm text-gray-500 mb-4">Measure your windows, pick your products, and we'll ship them direct from the manufacturer.</p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
          {[
            { step: '1', title: 'Measure', desc: 'Snap a photo', icon: Camera },
            { step: '2', title: 'Pick', desc: 'Choose product', icon: MousePointerClick },
            { step: '3', title: 'Order', desc: 'Direct to you', icon: Package },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="flex-shrink-0 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{step}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{title}</span>
                <span className="text-xs text-gray-400">— {desc}</span>
              </div>
              {step !== '3' && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* ── ZIP CODE ── */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Your ZIP Code <span className="text-gray-400 font-normal">(for estimated shipping)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={zip}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZip(val);
              }}
              placeholder="Enter ZIP code"
              maxLength={5}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-lg font-mono tracking-wider"
            />
          </div>
        </div>

        {/* ── BUILD YOUR ORDER ── */}
        <h2 className="text-xl font-bold text-gray-900 mb-3">Build Your Order</h2>

        {/* Room Buttons */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Tap a room to add a window. Tap again for additional windows.</p>
          <div className="grid grid-cols-4 gap-1.5">
            {ROOMS.map(room => {
              const count = roomCounts[room] || 0;
              if (room === 'Custom') {
                return (
                  <button
                    key={room}
                    onClick={() => setShowCustomInput(true)}
                    className="relative py-2.5 px-1 rounded-lg text-[11px] font-medium text-center transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95"
                  >
                    + Custom
                  </button>
                );
              }
              return (
                <button
                  key={room}
                  onClick={() => addRoom(room)}
                  className={`relative py-2.5 px-1 rounded-lg text-[11px] font-medium text-center transition-all active:scale-95 ${
                    count > 0
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {room}
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Room Input */}
        <AnimatePresence>
          {showCustomInput && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRoom}
                  onChange={e => setCustomRoom(e.target.value)}
                  placeholder="Room name"
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none"
                  autoFocus
                />
                <Button size="sm" className="bg-blue-600 text-white rounded-lg" onClick={() => {
                  if (customRoom.trim()) { addRoom(customRoom.trim()); setCustomRoom(''); setShowCustomInput(false); }
                }}>Add</Button>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setShowCustomInput(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── WINDOW LINE ITEMS ── */}
        {windows.length > 0 && (
          <div className="space-y-3 mb-4">
            {windows.map(w => {
              const isMeasured = w.width !== null && w.height !== null && w.depth !== null;
              const mountLabel = w.mountType === 'inside' ? 'Inside' : w.outsideStyle ? `Outside · ${w.outsideStyle}` : 'Outside';

              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Line item header */}
                  <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {w.room} {w.roomNumber > 1 ? `#${w.roomNumber}` : ''}
                        </span>
                        {w.mountType && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {mountLabel}
                          </span>
                        )}
                      </div>
                      {isMeasured ? (
                        <div className="text-xs text-gray-500 mt-0.5 font-mono">
                          {formatMeasurement(w.width, w.widthFraction)} W × {formatMeasurement(w.height, w.heightFraction)} H × {formatMeasurement(w.depth, w.depthFraction)} D
                        </div>
                      ) : (
                        <div className="text-xs text-blue-600 mt-0.5">Needs measurements</div>
                      )}
                    </div>

                    {/* Price */}
                    {w.productPrice !== null && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">${w.productPrice.toFixed(2)}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!isMeasured ? (
                        <Button size="sm" className="bg-blue-600 text-white rounded-lg text-xs px-3 h-8" onClick={() => { setMeasuringWindow(w.id); setMeasurePhase(w.mountType ? 'width' : 'mount-type'); }}>
                          Measure
                        </Button>
                      ) : (
                        <button onClick={() => { setMeasuringWindow(w.id); setMeasurePhase('mount-type'); }} className="text-xs text-blue-600 hover:underline px-1">Edit</button>
                      )}
                      <button onClick={() => removeWindow(w.id)} className="text-gray-300 hover:text-red-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Product selector — only shows when measured */}
                  {isMeasured && (
                    <div className="p-2">
                      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {PRODUCT_TYPES.map(pt => {
                          const price = getPrice(w, pt.slug);
                          const isSelected = w.selectedProduct === pt.slug;
                          const heroImg = getHeroImage(pt.slug);
                          return (
                            <button
                              key={pt.slug}
                              onClick={() => selectProduct(w.id, pt.slug)}
                              className={`flex-shrink-0 rounded-xl overflow-hidden transition-all min-w-[100px] max-w-[110px] border-2 ${
                                isSelected
                                  ? 'border-blue-500 shadow-md shadow-blue-200'
                                  : 'border-transparent hover:border-gray-200'
                              }`}
                            >
                              {/* Product photo */}
                              <div className="w-full h-16 bg-gray-100 overflow-hidden">
                                {heroImg ? (
                                  <img src={heroImg} alt={pt.label} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🪟</div>
                                )}
                              </div>
                              {/* Label + price */}
                              <div className={`px-1.5 py-1.5 text-center ${isSelected ? 'bg-blue-600' : 'bg-white'}`}>
                                <div className={`text-[10px] font-semibold leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                  {pt.short}
                                </div>
                                {price !== null && (
                                  <div className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-green-600'}`}>
                                    ${price.toFixed(0)}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {/* Future: manufacturer toggle will go here */}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── ADD LINE ITEM ── */}
        {windows.length > 0 && (
          <div className="space-y-3 mb-6">
            {/* Add another window button */}
            <button
              onClick={() => {/* Room buttons above handle this */}}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Another Window
            </button>

            {/* Snap photo option */}
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all text-left">
              <Camera className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs font-medium text-blue-700">📸 Snap a photo of your tape measure</div>
                <div className="text-[10px] text-blue-500">AI reads the measurements for you</div>
              </div>
            </button>
          </div>
        )}

        {/* ── ORDER TOTAL + SERVICE TIER ── */}
        {windows.length > 0 && (
          <div className="pt-4 pb-8">
            {/* Order summary */}
            {productTotal > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Products ({windows.filter(w => w.selectedProduct).length} windows)</span>
                  <span className="text-sm font-medium">${productTotal.toFixed(2)}</span>
                </div>
                {shippingQuote.subtotal > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Estimated Shipping</span>
                    <span className="text-sm font-medium">${shippingQuote.subtotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Estimated Total</span>
                  <span className="text-xl font-bold text-gray-900">${orderTotal.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Delivery: {shippingQuote.estimatedDays} · Tax calculated at checkout</div>
              </div>
            )}

            {/* Complete Order → Service Tier Selection */}
            {allProductsSelected && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Complete Your Order</h3>

                {/* Ship to Home (DIY) — adds all windows to cart */}
                <button
                  onClick={() => {
                    // Build cart items and save directly to localStorage
                    const existingCart = loadLocalCart();
                    const newItems: CartWindow[] = windows
                      .filter(w => w.selectedProduct && w.width !== null && w.height !== null)
                      .map(w => {
                        const product = ALL_PRODUCTS.find(p => p.slug === w.selectedProduct);
                        const widthInches = w.width! + (w.widthFraction === '1/2' ? 0.5 : w.widthFraction === '1/4' ? 0.25 : w.widthFraction === '3/4' ? 0.75 : w.widthFraction === '1/8' ? 0.125 : w.widthFraction === '3/8' ? 0.375 : w.widthFraction === '5/8' ? 0.625 : w.widthFraction === '7/8' ? 0.875 : 0);
                        const heightInches = w.height! + (w.heightFraction === '1/2' ? 0.5 : w.heightFraction === '1/4' ? 0.25 : w.heightFraction === '3/4' ? 0.75 : w.heightFraction === '1/8' ? 0.125 : w.heightFraction === '3/8' ? 0.375 : w.heightFraction === '5/8' ? 0.625 : w.heightFraction === '7/8' ? 0.875 : 0);
                        const priceResult = product?.variants?.[0]?.priceGrid
                          ? getCustomerPrice(product.variants[0].priceGrid, widthInches, heightInches)
                          : null;
                        const customerPrice = priceResult?.price ?? 0;

                        return {
                          id: w.id,
                          room: w.room,
                          name: `${w.room} Window${w.roomNumber > 1 ? ` #${w.roomNumber}` : ''}`,
                          width: widthInches,
                          height: heightInches,
                          depth: w.depth ?? 0,
                          product: product?.name ?? w.selectedProduct ?? '',
                          productId: product?.slug ?? '',
                          variantId: product?.variants?.[0]?.id ?? '',
                          manufacturer: product?.brand ?? 'Norman',
                          retailPrice: customerPrice / PRICE_MULTIPLIER,
                          ourCost: customerPrice / PRICE_MULTIPLIER * 0.30,
                          customerPrice,
                          tier: 'ship' as const,
                          installFee: 0,
                          designFee: 0,
                          surchargesTotal: 0,
                        };
                      });
                    saveLocalCart([...existingCart, ...newItems]);
                    navigate('/cart');
                  }}
                  className="w-full text-left bg-white rounded-2xl border-2 border-blue-500 p-5 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">📦</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-gray-900">View Cart & Configure</h4>
                        <span className="text-lg font-bold text-blue-600">${orderTotal.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Review your windows, pick colors & options, then checkout. Custom-made in 4-6 weeks.</p>
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Best Price — Direct from Manufacturer</span>
                    </div>
                  </div>
                </button>

              </motion.div>
            )}

            {/* Not ready yet */}
            {!allProductsSelected && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">
                  {!allWindowsMeasured
                    ? 'Measure all windows to see service options'
                    : 'Select a product for each window to continue'
                  }
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MEASUREMENT MODAL — Number Grid */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {measuringWindow && activeWindow && measurePhase !== 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/95 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{currentPhaseLabel[measurePhase]}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{currentPhaseSubLabel[measurePhase]}</p>
              </div>
              <button onClick={() => setMeasuringWindow(null)} className="text-gray-500 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ── MOUNT TYPE SELECTION ── */}
            {measurePhase === 'mount-type' && (
              <div className="flex-1 px-4 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-sm text-center mb-2">Where will your window treatment be mounted?</p>

                {/* Inside Mount */}
                <button
                  onClick={() => { updateWindow(measuringWindow, { mountType: 'inside', outsideStyle: null }); setMeasurePhase('width'); }}
                  className="w-full max-w-sm bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-5 transition-all active:scale-[0.97]"
                >
                  <div className="flex items-center gap-4">
                    {/* Inside mount illustration */}
                    <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                      <div className="absolute inset-2 border-2 border-gray-500 rounded-lg" />
                      <motion.div animate={{ scale: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-400">
                        <ArrowRight className="w-5 h-5 -rotate-45" />
                        <span className="text-[8px] block text-center">IN</span>
                      </motion.div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">Inside Mount</div>
                      <div className="text-xs text-gray-400 mt-0.5">Fits inside the window frame opening. Cleaner look.</div>
                    </div>
                  </div>
                </button>

                {/* Outside Mount */}
                <button
                  onClick={() => { updateWindow(measuringWindow, { mountType: 'outside' }); setMeasurePhase('outside-style'); }}
                  className="w-full max-w-sm bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-5 transition-all active:scale-[0.97]"
                >
                  <div className="flex items-center gap-4">
                    {/* Outside mount illustration */}
                    <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                      <div className="absolute inset-3 border-2 border-gray-500 rounded-lg" />
                      <div className="absolute inset-1 border-2 border-dashed border-blue-400 rounded-lg" />
                      <motion.div animate={{ scale: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-400 absolute -top-0.5 -right-0.5">
                        <ArrowRight className="w-4 h-4 rotate-45" />
                      </motion.div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">Outside Mount</div>
                      <div className="text-xs text-gray-400 mt-0.5">Mounts on the wall or trim above/around the opening.</div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* ── OUTSIDE MOUNT STYLE ── */}
            {measurePhase === 'outside-style' && (
              <div className="flex-1 px-4 flex flex-col items-center justify-center gap-3">
                <p className="text-gray-400 text-sm text-center mb-2">How will it mount outside the opening?</p>

                {/* On Trim */}
                <button
                  onClick={() => { updateWindow(measuringWindow, { outsideStyle: 'on-trim' }); setMeasurePhase('measure-guide'); }}
                  className="w-full max-w-sm bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-4 transition-all active:scale-[0.97]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                      {/* Trim illustration */}
                      <div className="absolute inset-2 border-4 border-amber-600 rounded" />
                      <div className="absolute inset-4 bg-gray-600 rounded-sm" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-white">On Trim</div>
                      <div className="text-xs text-gray-400">Mounted directly on the window trim/casing</div>
                    </div>
                  </div>
                </button>

                {/* Above Trim */}
                <button
                  onClick={() => { updateWindow(measuringWindow, { outsideStyle: 'above-trim' }); setMeasurePhase('width'); }}
                  className="w-full max-w-sm bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-4 transition-all active:scale-[0.97]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                      <div className="absolute bottom-2 left-2 right-2 border-3 border-amber-600 rounded h-10" />
                      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute top-1 text-blue-400">
                        <ArrowRight className="w-3 h-3 -rotate-90" />
                      </motion.div>
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-white">Above Trim</div>
                      <div className="text-xs text-gray-400">Mounted on the wall above the trim</div>
                    </div>
                  </div>
                </button>

                {/* No Trim */}
                <button
                  onClick={() => { updateWindow(measuringWindow, { outsideStyle: 'no-trim' }); setMeasurePhase('width'); }}
                  className="w-full max-w-sm bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-4 transition-all active:scale-[0.97]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                      <div className="absolute inset-3 bg-gray-600 rounded" />
                      <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-white">No Trim</div>
                      <div className="text-xs text-gray-400">Mounted on flat wall — no trim around window</div>
                    </div>
                  </div>
                </button>

                <button onClick={() => setMeasurePhase('mount-type')} className="text-sm text-gray-500 hover:text-gray-300 mt-2">
                  ← Back to mount type
                </button>
              </div>
            )}

            {/* ── ON-TRIM MEASUREMENT GUIDE ── */}
            {measurePhase === 'measure-guide' && (
              <div className="flex-1 px-4 flex flex-col items-center justify-center">
                <div className="w-full max-w-sm">
                  {/* Animated trim measurement guide */}
                  <div className="bg-gray-800 rounded-2xl p-6 mb-4">
                    <div className="relative mx-auto w-48 h-56">
                      {/* Window frame with trim */}
                      <div className="absolute inset-0 border-[6px] border-amber-700 rounded-lg" />
                      <div className="absolute inset-3 bg-sky-900/30 rounded" />

                      {/* Width arrows */}
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute -top-5 left-0 right-0 flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4 text-green-400" />
                        <span className="text-[10px] font-bold text-green-400">WIDTH — edge to edge of trim</span>
                        <ArrowRight className="w-4 h-4 text-green-400" />
                      </motion.div>

                      {/* Height arrows */}
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                        className="absolute -right-24 top-0 bottom-0 flex flex-col items-center justify-center gap-1"
                      >
                        <ArrowRight className="w-4 h-4 text-blue-400 -rotate-90" />
                        <span className="text-[10px] font-bold text-blue-400 [writing-mode:vertical-lr]">HEIGHT</span>
                        <ArrowRight className="w-4 h-4 text-blue-400 rotate-90" />
                      </motion.div>

                      {/* Depth/thickness indicator */}
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-1.5 bg-red-400 rounded" />
                          <span className="text-[9px] font-bold text-red-400">TRIM THICKNESS</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-start gap-2"><span className="text-green-400 font-bold">W:</span> Measure outside edge to outside edge of trim</div>
                    <div className="flex items-start gap-2"><span className="text-blue-400 font-bold">H:</span> Measure top of trim to bottom of trim (or sill)</div>
                    <div className="flex items-start gap-2"><span className="text-red-400 font-bold">D:</span> Measure how thick the trim is</div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white rounded-full py-5 text-base font-semibold"
                    onClick={() => setMeasurePhase('width')}
                  >
                    Got it — Start Measuring
                  </Button>
                </div>
              </div>
            )}

            {/* Phase Indicators (W, W+, H, H+, D, D+) — only during number entry */}
            {phaseIndex >= 0 && (
            <div className="px-4 pb-2 flex items-center justify-center gap-1.5">
              {phaseSteps.map((step, i) => (
                <div
                  key={step}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    i === phaseIndex
                      ? 'bg-green-500 text-white'
                      : i < phaseIndex
                        ? 'bg-green-800 text-green-300'
                        : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            )}

            {/* Current values display */}
            <div className="px-4 pb-3 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Width</div>
                <div className="text-lg font-bold text-white">
                  {activeWindow.width !== null ? formatMeasurement(activeWindow.width, activeWindow.widthFraction) : '—'}
                </div>
              </div>
              <div className="text-gray-600 text-lg">×</div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Height</div>
                <div className="text-lg font-bold text-white">
                  {activeWindow.height !== null ? formatMeasurement(activeWindow.height, activeWindow.heightFraction) : '—'}
                </div>
              </div>
              <div className="text-gray-600 text-lg">×</div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{isOnTrim ? 'Trim' : 'Depth'}</div>
                <div className="text-lg font-bold text-white">
                  {activeWindow.depth !== null ? formatMeasurement(activeWindow.depth, activeWindow.depthFraction) : '—'}
                </div>
              </div>
            </div>

            {/* Animated arrow indicator */}
            {(measurePhase === 'width' || measurePhase === 'height' || measurePhase === 'depth') && (
              <div className="px-4 pb-2 flex justify-center">
                <motion.div
                  animate={{ x: [0, 8, 0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center gap-2 text-blue-400"
                >
                  {measurePhase === 'width' && <><ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">WIDTH</span><ArrowRight className="w-5 h-5" /></>}
                  {measurePhase === 'height' && <><span className="text-sm font-medium rotate-90 inline-block">↕</span><span className="text-sm font-medium">HEIGHT</span></>}
                  {measurePhase === 'depth' && <><span className="text-sm font-medium">↗</span><span className="text-sm font-medium">DEPTH</span></>}
                </motion.div>
              </div>
            )}

            {/* Photo Option — available at every measurement step */}
            {(measurePhase === 'width' || measurePhase === 'height' || measurePhase === 'depth') && (
              <div className="px-4 pb-3">
                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 active:scale-[0.98] transition-all">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-blue-400">📸 Snap a photo instead</div>
                    <div className="text-[11px] text-blue-500/70">Take a photo of your tape measure — AI reads it for you</div>
                  </div>
                </button>
              </div>
            )}

            {/* Number Grid */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {/* WHOLE NUMBER GRID (width / height) */}
              {(measurePhase === 'width' || measurePhase === 'height') && (
                <div className="grid grid-cols-10 gap-1">
                  {WHOLE_NUMBERS.map(num => {
                    const isTens = num % 10 === 0;
                    return (
                      <button
                        key={num}
                        onClick={() => selectWholeNumber(num)}
                        className={`py-3 rounded-lg text-sm font-medium transition-all active:scale-90 ${
                          isTens
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* DEPTH GRID (smaller range 1-10) */}
              {measurePhase === 'depth' && (
                <div>
                  {/* Cross-section diagram showing what "depth" means.
                      Hidden when measuring trim thickness (not relevant then). */}
                  {!isOnTrim && (
                    <div className="mb-4 mx-auto max-w-sm">
                      <WindowDepthDiagram theme="dark" />
                    </div>
                  )}
                  <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-3 mb-4 mx-auto max-w-xs">
                    <p className="text-red-400 text-sm font-bold text-center">
                      {isOnTrim
                        ? '⚠️ Measure how thick the window trim is'
                        : '⚠️ Measure from face of the opening to the nearest object (lock, crank, etc.)'
                      }
                    </p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                    {DEPTH_NUMBERS.map(num => (
                      <button
                        key={num}
                        onClick={() => selectWholeNumber(num)}
                        className="py-4 rounded-xl text-lg font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-90 transition-all"
                      >
                        {num}"
                      </button>
                    ))}
                  </div>
                  {/* Photo the window/obstruction */}
                  <button className="w-full flex items-center justify-center gap-3 py-3 mt-4 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 active:scale-[0.98] transition-all max-w-xs mx-auto">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400">Take a photo of the window for reference</span>
                  </button>
                </div>
              )}

              {/* FRACTION GRID */}
              {(measurePhase === 'width-fraction' || measurePhase === 'height-fraction' || measurePhase === 'depth-fraction') && (
                <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto mt-4">
                  {FRACTIONS.map(frac => (
                    <button
                      key={frac.label}
                      onClick={() => selectFraction(frac.value)}
                      className={`py-5 rounded-xl text-2xl font-bold transition-all active:scale-90 ${
                        frac.value === '' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {frac.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room label at bottom */}
            <div className="px-4 pb-4 text-center">
              <span className="text-xs text-gray-600">
                {activeWindow.room} {activeWindow.roomNumber > 1 ? `#${activeWindow.roomNumber}` : ''} — Window
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
