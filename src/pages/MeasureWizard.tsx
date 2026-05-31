import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ArrowRight, ArrowLeft, CheckCircle, HelpCircle, BookOpen, Zap, Plus, Home, Eye, Sparkles, DollarSign, Sofa, Bed, BedDouble, ChefHat, Bath, Briefcase, UtensilsCrossed, Baby, DoorOpen, Shirt, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WindowDiagram from '@/components/WindowDiagram';
import ProductPreview from '@/components/ProductPreview';
import InlineProductPicker from '@/components/InlineProductPicker';
import TapeMeasurePhoto from '@/components/measure/TapeMeasurePhoto';
import WindowDepthDiagram from '@/components/measure/WindowDepthDiagram';
import MeasurementPicker from '@/components/measure/MeasurementPicker';
import ProductCategoryComparison from '@/components/ProductCategoryComparison';
import DeviceHandoffBanner from '@/components/DeviceHandoffBanner';
import { PRODUCT_CATEGORIES } from '@/data/product-categories';
import { supabase } from '@/lib/supabase';
import { pushToCloud } from '@/lib/device-sync';
import { ALL_PRODUCTS, getCustomerPrice } from '@/data/catalog-index';

type MeasureMode = 'photo' | 'manual' | 'pro';
type FlowMode = 'guided' | 'express';

interface WindowMeasurement {
  /** Stable id (crypto.randomUUID). Optional for backwards-compat with
   *  saved state from earlier sessions; assigned on first edit. */
  id?: string;
  roomName: string;
  /** 1-based counter within the same room — renders as 'Bedroom #2'. */
  roomNumber?: number;
  topWidth: string;
  bottomWidth: string;
  leftHeight: string;
  rightHeight: string;
  depth: string;
  needsBottomWidth: boolean; // cellular shades only
  photos: { type: string; dataUrl?: string }[];
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'w-' + Math.random().toString(36).slice(2, 10);
}

interface RoomPreset {
  name: string;
  icon: LucideIcon;
}

const ROOM_PRESETS: RoomPreset[] = [
  { name: 'Living Room', icon: Sofa },
  { name: 'Primary Bedroom', icon: BedDouble },
  { name: 'Bedroom', icon: Bed },
  { name: 'Kitchen', icon: ChefHat },
  { name: 'Bathroom', icon: Bath },
  { name: 'Dining Room', icon: UtensilsCrossed },
  { name: 'Office', icon: Briefcase },
  { name: 'Nursery', icon: Baby },
  { name: 'Laundry', icon: Shirt },
  { name: 'Entryway', icon: DoorOpen },
];

const TOTAL_STEPS = 7; // room, overview, width, height, depth, product, review

const STORAGE_KEY = 'snapshades_wizard_state';
const SWATCHES_KEY = 'snapshades_swatches';

interface SwatchSelection {
  swatchId: string;
  swatchName: string;
  swatchCollection: string;
  swatchImageUrl: string;
  swatchColor?: string;
  swatchOpacity?: string;
  swatchCode?: string;
}

interface SwatchSelections {
  [windowId: string]: SwatchSelection;
}

interface ProductSelection {
  productSlug: string;
  productName: string;
  selections: Record<string, string | number | boolean>;
}

interface WizardState {
  step: number;
  measurement: WindowMeasurement;
  sameHeight: boolean;
  windows: WindowMeasurement[];
  productSelection: ProductSelection | null;
}

// Auto-save state to localStorage
function saveWizardState(state: WizardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function loadWizardState(): WizardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function clearWizardState() {
  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SWATCHES_KEY); } catch { /* ignore */ }
}

export function saveSwatchSelections(windowId: string, swatch: SwatchSelection) {
  try {
    const existing: SwatchSelections = JSON.parse(localStorage.getItem(SWATCHES_KEY) || '{}');
    existing[windowId] = swatch;
    localStorage.setItem(SWATCHES_KEY, JSON.stringify(existing));
  } catch { /* ignore */ }
}

export function loadSwatchSelections(): SwatchSelections {
  try {
    return JSON.parse(localStorage.getItem(SWATCHES_KEY) || '{}');
  } catch { return {}; }
}

// Confetti burst using CSS + framer-motion
function ConfettiBurst({ active }: { active: boolean }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${50 + (Math.random() - 0.5) * 20}%`,
            top: '40%',
          }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: -200 - Math.random() * 400,
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.8,
            ease: 'easeOut',
            delay: Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

/** Tap-to-edit measurement cell used inside each window row on step 0. */
function MeasurementFieldButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  const hasValue = !!value;
  // Show whole + fraction for >0.01 differences
  const display = (() => {
    if (!hasValue) return '—';
    const v = parseFloat(value);
    if (!isFinite(v)) return value;
    const whole = Math.floor(v);
    const frac = v - whole;
    if (Math.abs(frac) < 0.01) return `${whole}"`;
    // Map to eighths for display
    const eighths = Math.round(frac * 8);
    const glyphs = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
    if (eighths >= 1 && eighths <= 7) return `${whole} ${glyphs[eighths]}"`;
    return `${v.toFixed(2)}"`;
  })();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors ${
        hasValue
          ? 'bg-card text-ink hover:bg-sand-deep/40'
          : 'bg-card text-warm-gray-500 hover:bg-sand-deep/40 hover:text-ink'
      }`}
    >
      <span className="text-[10px] uppercase tracking-wider text-warm-gray-500 font-semibold">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${hasValue ? 'text-ink' : 'text-warm-gray-500'}`}>
        {display}
      </span>
    </button>
  );
}

export default function MeasureWizard() {
  const { mode } = useParams<{ mode: MeasureMode }>();
  const navigate = useNavigate();

  const [flowMode, setFlowMode] = useState<FlowMode | null>(null);
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedState, setSavedState] = useState<ReturnType<typeof loadWizardState>>(null);
  const [measurement, setMeasurement] = useState<WindowMeasurement>({
    roomName: '',
    topWidth: '',
    bottomWidth: '',
    leftHeight: '',
    rightHeight: '',
    depth: '',
    needsBottomWidth: false,
    photos: [],
  });
  const [sameHeight, setSameHeight] = useState(false);
  const [windows, setWindows] = useState<WindowMeasurement[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [windowPhotoUrl, setWindowPhotoUrl] = useState<string | null>(null);
  const [productSelection, setProductSelection] = useState<ProductSelection | null>(null);
  // Category chosen from ProductCategoryComparison; null = show the comparison
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  // Custom room-name input is hidden until the user explicitly chooses it
  const [showCustomRoom, setShowCustomRoom] = useState(false);
  // Inline field editor — tap a measurement on a window row to edit it
  // without leaving the project-builder view.
  const [editingField, setEditingField] = useState<
    | { windowId: string; field: 'width' | 'height' | 'depth'; roomName: string }
    | null
  >(null);
  const [proInstallAvailable, setProInstallAvailable] = useState<boolean | null>(null);

  const checkZip = useCallback(async (zip: string) => {
    if (zip.length !== 5) return;
    try {
      const { data } = await supabase
        .from('territories')
        .select('pro_install_available, status')
        .eq('zip', zip)
        .single();
      setProInstallAvailable(data?.pro_install_available === true && data?.status === 'active');
    } catch {
      setProInstallAvailable(false);
    }
  }, []);

  /** Add a new empty window in the given room; stacks below and numbers
   *  within-room (e.g. Bedroom #1, Bedroom #2). */
  const addProjectWindow = (roomName: string) => {
    const usedNumbers = windows.filter(w => w.roomName === roomName).map(w => w.roomNumber ?? 0);
    const nextNumber = (usedNumbers.length === 0 ? 0 : Math.max(...usedNumbers)) + 1;
    const nw: WindowMeasurement = {
      id: uid(),
      roomName,
      roomNumber: nextNumber,
      topWidth: '', bottomWidth: '', leftHeight: '', rightHeight: '', depth: '',
      needsBottomWidth: false, photos: [],
    };
    setWindows((prev) => [...prev, nw]);
    setShowCustomRoom(false);
  };

  /** Patch a specific window by id. */
  const patchProjectWindow = (id: string, patch: Partial<WindowMeasurement>) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  /** Remove a window by id. */
  const removeProjectWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const isComplete = (w: WindowMeasurement) =>
    !!(w.topWidth && w.leftHeight && w.depth);

  const anyComplete = windows.some(isComplete);
  const totalCompleteCount = windows.filter(isComplete).length;

  // Check for saved state on mount
  useEffect(() => {
    const saved = loadWizardState();
    if (saved && (saved.windows.length > 0 || saved.measurement.roomName)) {
      setSavedState(saved);
      setShowResumePrompt(true);
    }
  }, []);

  // Auto-save to localStorage whenever state changes + debounced cloud sync
  useEffect(() => {
    if (step > 0 || measurement.roomName || windows.length > 0) {
      saveWizardState({ step, measurement, sameHeight, windows, productSelection });
      // Fire-and-forget cloud sync for logged-in users (2s debounced)
      pushToCloud();
    }
  }, [step, measurement, sameHeight, windows, productSelection]);

  // Pro mode — skip to scheduling
  if (mode === 'pro') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-sand-deep rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase strokeWidth={1.5} className="w-7 h-7 text-clay" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Professional Technician Service</h1>
          <p className="mt-3 text-gray-600">
            We'll send a verified local technician to your home to measure all your windows and install your new window coverings.
          </p>
          <div className="mt-6 space-y-3">
            <input 
              type="text" 
              placeholder="Enter your zip code" 
              className="w-full px-4 py-3 rounded-md border border-border text-center text-lg focus:border-clay focus:ring-2 focus:ring-clay/20 outline-none"
            />
            <Button className="w-full bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 text-lg font-semibold gap-2">
              Find Technicians Near Me <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-400">Professional measure + install starting at $149/visit</p>
        </div>
      </div>
    );
  }

  // Default to guided mode (one adaptive flow — no mode selection screen)
  const isGuided = flowMode ?? true;
  const isPhoto = mode === 'photo';
  const progressPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  // Determine which window diagram highlight
  const diagramHighlight = 
    step === 2 ? 'top-width' :
    step === 3 ? (measurement.needsBottomWidth && !measurement.bottomWidth ? 'bottom-width' : 'left-height') :
    step === 4 ? 'depth' :
    'none';

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  // Compute live price estimate
  const estimatedPrice = (() => {
    if (!productSelection?.productSlug) return null;
    const product = ALL_PRODUCTS.find(p => p.slug === productSelection.productSlug);
    const variant = product?.variants?.[0];
    if (!variant?.priceGrid) return null;
    const w = parseFloat(measurement.topWidth) || 0;
    const h = parseFloat(measurement.leftHeight) || 0;
    if (!w || !h) return null;
    const result = getCustomerPrice(variant.priceGrid, w, h);
    return result?.price ?? null;
  })();

  const showPriceBar = productSelection?.productSlug && (estimatedPrice !== null || (measurement.topWidth && measurement.leftHeight));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ConfettiBurst active={showConfetti} />
      <DeviceHandoffBanner windowCount={windows.length} minWindowsRequired={1} />

      {/* Resume Prompt */}
      {showResumePrompt && savedState && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-3 bg-sand-deep rounded-full flex items-center justify-center">
              <BookOpen strokeWidth={1.5} className="w-6 h-6 text-clay" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-500 mb-1">You have {savedState.windows.length} window{savedState.windows.length !== 1 ? 's' : ''} in progress</p>
            {savedState.measurement.roomName && <p className="text-gray-500 mb-4">in {savedState.measurement.roomName}</p>}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setStep(savedState.step);
                  setMeasurement(savedState.measurement);
                  setSameHeight(savedState.sameHeight);
                  setWindows(savedState.windows);
                  setProductSelection(savedState.productSelection);
                  setShowResumePrompt(false);
                }}
                className="w-full bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-5 font-semibold"
              >Continue Where I Left Off</Button>
              <Button
                onClick={() => {
                  clearWizardState();
                  setShowResumePrompt(false);
                  setStep(0);
                  setMeasurement({ roomName: '', topWidth: '', bottomWidth: '', leftHeight: '', rightHeight: '', depth: '', needsBottomWidth: false, photos: [] });
                  setWindows([]);
                  setProductSelection(null);
                }}
                variant="outline"
                className="w-full rounded-md py-5 border-border hover:bg-sand-deep/40"
              >Start Fresh</Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={step === 0 ? () => navigate('/start') : goBack} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-500">Step {step + 1} of {TOTAL_STEPS}</span>
            <div className="w-5" /> {/* spacer */}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-clay h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Territory warning banner */}
      {proInstallAvailable === false && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2 text-center">
          <p className="text-xs text-yellow-700">
            ⚠️ Pro Install not available in your area — DIY delivery available nationwide
          </p>
        </div>
      )}
      {proInstallAvailable === true && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-2 text-center">
          <p className="text-xs text-green-700">
            ✅ Pro Install available — certified technicians ready to help
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto px-4 py-6 w-full">
        
        {/* STEP 0: PROJECT BUILDER
              Add rooms as line items, tap any measurement field to edit
              it inline. No wasted space, no forced single-window path. */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray-500">Step 1</p>
            <h2 className="mt-1.5 text-2xl font-bold text-ink tracking-tight">Build your project</h2>
            <p className="mt-1 text-sm text-warm-gray-500 leading-snug">
              Tap a room to add a window. Tap any measurement to fill it in.
            </p>

            {/* ADD ROOM CHIPS — compact row, wraps as needed */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500 mb-2">
                Add a room
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_PRESETS.map((room) => {
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.name}
                      type="button"
                      onClick={() => addProjectWindow(room.name)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-ink text-xs font-medium hover:border-ink/40 hover:shadow-sm transition-all"
                    >
                      <Icon strokeWidth={1.75} className="w-3.5 h-3.5 text-warm-gray-500" />
                      {room.name}
                      <Plus strokeWidth={2} className="w-3 h-3 text-warm-gray-500" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCustomRoom((v) => !v)}
                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs font-medium transition-all ${
                    showCustomRoom
                      ? 'border-clay bg-clay/5 text-ink'
                      : 'border-dashed border-border bg-transparent text-warm-gray-500 hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  <Plus strokeWidth={2} className="w-3.5 h-3.5" />
                  Custom
                </button>
              </div>

              {/* Custom name input + add button — only when Custom is toggled */}
              {showCustomRoom && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = (e.currentTarget.elements.namedItem('customRoom') as HTMLInputElement)?.value?.trim();
                    if (name) {
                      addProjectWindow(name);
                      (e.currentTarget.elements.namedItem('customRoom') as HTMLInputElement).value = '';
                    }
                  }}
                  className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <input
                    type="text"
                    name="customRoom"
                    autoFocus
                    placeholder="e.g. Guest room, Sunroom, Loft"
                    className="flex-1 px-3 py-2 rounded-md border border-border focus:border-clay focus:ring-2 focus:ring-clay/20 outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-ink text-primary-foreground rounded-md px-3 text-xs font-semibold hover:bg-ink/90"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* WINDOW LINE ITEMS */}
            {windows.length > 0 ? (
              <div className="mt-6">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500">
                    Your project · {windows.length} window{windows.length === 1 ? '' : 's'}
                  </p>
                  {totalCompleteCount > 0 && (
                    <p className="text-[11px] text-warm-gray-500">
                      {totalCompleteCount} ready
                    </p>
                  )}
                </div>
                <ul className="space-y-2">
                  {windows.map((w) => {
                    const complete = isComplete(w);
                    const wid = w.id ?? w.roomName;
                    return (
                      <li
                        key={wid}
                        className={`rounded-md border ${complete ? 'border-border' : 'border-border'} bg-card overflow-hidden`}
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                          <div className="flex items-center gap-2 min-w-0">
                            {complete && (
                              <CheckCircle className="w-4 h-4 text-clay flex-shrink-0" strokeWidth={2} />
                            )}
                            <span className="text-sm font-semibold text-ink truncate">
                              {w.roomName}
                              {w.roomNumber ? <span className="text-warm-gray-500 font-normal"> #{w.roomNumber}</span> : null}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProjectWindow(wid)}
                            aria-label={`Remove ${w.roomName}`}
                            className="w-6 h-6 rounded-full text-warm-gray-500 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"
                          >
                            <X strokeWidth={1.8} className="w-4 h-4" />
                          </button>
                        </div>
                        {/* 3-col measurement grid — tap any to edit */}
                        <div className="grid grid-cols-3 divide-x divide-border">
                          <MeasurementFieldButton
                            label="Width"
                            value={w.topWidth}
                            onClick={() => setEditingField({ windowId: wid, field: 'width', roomName: w.roomName })}
                          />
                          <MeasurementFieldButton
                            label="Height"
                            value={w.leftHeight}
                            onClick={() => setEditingField({ windowId: wid, field: 'height', roomName: w.roomName })}
                          />
                          <MeasurementFieldButton
                            label="Depth"
                            value={w.depth}
                            onClick={() => setEditingField({ windowId: wid, field: 'depth', roomName: w.roomName })}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Pro Install check — kept available but out of the way */}
                <details className="mt-5 group">
                  <summary className="list-none cursor-pointer flex items-center justify-between text-xs text-warm-gray-500 hover:text-ink py-1.5">
                    <span className="font-medium">Pro Install available in my area?</span>
                    <span className="text-[10px] uppercase tracking-wider group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="mt-2 p-3 bg-sand-deep/40 rounded-md border border-border">
                    <input
                      type="text"
                      placeholder="ZIP code"
                      maxLength={5}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        if (val.length === 5) checkZip(val);
                      }}
                      className="w-full px-3 py-2 rounded border border-border text-sm bg-card focus:border-clay outline-none"
                    />
                    {proInstallAvailable === false && (
                      <p className="mt-2 text-xs text-warm-gray-500">
                        Pro Install isn&apos;t live in your area yet — DIY delivery is available nationwide.
                      </p>
                    )}
                    {proInstallAvailable === true && (
                      <p className="mt-2 text-xs text-ink font-medium">✓ Pro Install is available.</p>
                    )}
                  </div>
                </details>
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-warm-gray-500 italic py-8 border border-dashed border-border rounded-md">
                Tap a room above to add your first window.
              </p>
            )}

            <Button
              onClick={() => {
                // Load the first complete window as the 'measurement' and
                // jump to product picker (step 5).
                const firstComplete = windows.find(isComplete);
                if (firstComplete) {
                  setMeasurement(firstComplete);
                  setStep(5);
                }
              }}
              disabled={!anyComplete}
              className="w-full mt-6 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold gap-2 disabled:opacity-50"
            >
              Continue to products <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Inline measurement editor — tapping a Width / Height / Depth
            field on any window row opens this drawer with the grid picker.
            Auto-advances Width → Height → Depth as each fraction is tapped. */}
        {editingField && (() => {
          const w = windows.find((x) => (x.id ?? x.roomName) === editingField.windowId);
          if (!w) return null;
          const currentField = editingField.field;
          const currentValue =
            currentField === 'width' ? w.topWidth
            : currentField === 'height' ? w.leftHeight
            : w.depth;
          const fieldLabel =
            currentField === 'width' ? 'Width'
            : currentField === 'height' ? 'Height'
            : 'Depth';
          const isDepth = currentField === 'depth';

          // Progress dots for the three-step sequence
          const fieldOrder: Array<'width' | 'height' | 'depth'> = ['width', 'height', 'depth'];
          const fieldIndex = fieldOrder.indexOf(currentField);

          const advance = () => {
            if (currentField === 'width') {
              setEditingField({ ...editingField, field: 'height' });
            } else if (currentField === 'height') {
              setEditingField({ ...editingField, field: 'depth' });
            } else {
              // Finished depth → close with a gentle celebration
              setEditingField(null);
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 1200);
            }
          };

          return (
            <div
              className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setEditingField(null)}
            >
              <div
                className="bg-background w-full sm:max-w-md rounded-t-xl sm:rounded-lg shadow-xl border border-border p-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500">
                      {editingField.roomName}{w.roomNumber ? ` #${w.roomNumber}` : ''}
                    </p>
                    {/* Field label — clay orange, larger, so the customer
                        sees at a glance which measurement they're taking. */}
                    <h3
                      key={currentField} // remount to re-animate on advance
                      className="text-3xl font-bold text-clay tracking-tight mt-1 uppercase tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-200"
                    >
                      {fieldLabel}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    aria-label="Close"
                    className="w-8 h-8 rounded-full hover:bg-sand-deep text-warm-gray-500 hover:text-ink flex items-center justify-center -mt-1 -mr-1"
                  >
                    <X strokeWidth={1.8} className="w-5 h-5" />
                  </button>
                </div>

                {/* 3-step progress dots */}
                <div className="flex items-center gap-2 mb-5">
                  {fieldOrder.map((f, i) => {
                    const wasMeasured =
                      (f === 'width' && w.topWidth) ||
                      (f === 'height' && w.leftHeight) ||
                      (f === 'depth' && w.depth);
                    const isActive = i === fieldIndex;
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => setEditingField({ ...editingField, field: f })}
                        aria-label={`Go to ${f}`}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          isActive ? 'bg-clay' : wasMeasured ? 'bg-ink' : 'bg-border'
                        }`}
                      />
                    );
                  })}
                </div>

                {isDepth && (
                  <div className="mb-4 -mx-1">
                    <WindowDepthDiagram
                      theme="light"
                      depth={currentValue}
                    />
                  </div>
                )}

                <MeasurementPicker
                  value={currentValue ? parseFloat(currentValue) : null}
                  onChange={(d) => {
                    const patch: Partial<WindowMeasurement> =
                      currentField === 'width' ? { topWidth: d ? d.toString() : '' }
                      : currentField === 'height' ? {
                          leftHeight: d ? d.toString() : '',
                          rightHeight: d ? d.toString() : '', // default same-height
                        }
                      : { depth: d ? d.toString() : '' };
                    patchProjectWindow(editingField.windowId, patch);
                  }}
                  onCommit={advance}
                  min={isDepth ? 1 : 10}
                  max={isDepth ? 10 : 120}
                  variant={isDepth ? 'compact' : 'standard'}
                />

                <div className="flex items-center gap-2 mt-5">
                  {fieldIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setEditingField({ ...editingField, field: fieldOrder[fieldIndex - 1] })}
                      className="flex-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                    className="flex-1 border-border hover:bg-sand-deep/40"
                  >
                    {currentField === 'depth' ? 'Done' : 'Skip for now'}
                  </Button>
                  {currentField !== 'depth' && (
                    <Button
                      onClick={advance}
                      className="flex-none bg-ink text-primary-foreground hover:bg-ink/90"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* STEP 1: Window Overview Photo */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray-500 text-center">Step 2</p>
            <h2 className="mt-2 text-3xl font-bold text-ink tracking-tight text-center">
              Photo of your window
            </h2>
            {isGuided && (
              <p className="mt-2 text-gray-500 text-center text-sm">
                This helps us see the window and any obstructions. Stand back and capture the full window.
              </p>
            )}

            {/* Camera area */}
            {windowPhotoUrl ? (
              <div className="mt-6 relative">
                <img src={windowPhotoUrl} alt="Your window" className="w-full rounded-2xl border border-gray-200" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/90 backdrop-blur-sm rounded-full gap-2 text-sm"
                    onClick={() => setWindowPhotoUrl(null)}
                  >
                    <Camera className="w-4 h-4" /> Retake
                  </Button>
                  <Button
                    className="flex-1 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md gap-2 text-sm shadow-sm"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4" /> Preview Products
                    <Sparkles className="w-3 h-3 text-primary-foreground/70" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                <Camera className="w-12 h-12 text-gray-300 mb-3" />
                <label className="cursor-pointer">
                  <Button variant="outline" className="rounded-full gap-2 pointer-events-none">
                    <Camera className="w-4 h-4" /> Open Camera
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          setWindowPhotoUrl(ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <label className="mt-2 text-xs text-clay cursor-pointer hover:underline">
                  or upload from gallery
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          setWindowPhotoUrl(ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={goNext} className="flex-1 rounded-full py-6">
                {windowPhotoUrl ? 'Continue without preview' : 'Skip for now'}
              </Button>
              <Button onClick={goNext} className="flex-1 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Product Preview Modal */}
            {showPreview && windowPhotoUrl && (
              <ProductPreview
                windowPhoto={windowPhotoUrl}
                onClose={() => setShowPreview(false)}
              />
            )}
          </div>
        )}

        {/* STEP 2: Top Width */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Measure the TOP width
            </h2>
            {isGuided && (
              <p className="mt-2 text-gray-500 text-center text-sm">
                Place your tape measure across the <strong>top</strong> of the window frame, from left edge to right edge.
              </p>
            )}

            {/* Animated window diagram */}
            <div className="mt-4">
              <WindowDiagram 
                highlight="top-width" 
                topWidth={measurement.topWidth}
                leftHeight={measurement.leftHeight}
                rightHeight={measurement.rightHeight}
              />
            </div>

            {/* Input */}
            <div className="mt-4">
              {isPhoto ? (
                <div className="space-y-3">
                  <TapeMeasurePhoto
                    measurementType="width"
                    hint={{ expected_min_in: 10, expected_max_in: 200 }}
                    existingValue={measurement.topWidth ? parseFloat(measurement.topWidth) : null}
                    onResult={(totalInches) =>
                      setMeasurement((m) => ({ ...m, topWidth: totalInches.toString() }))
                    }
                  />
                  <div className="text-center text-xs text-warm-gray-500">or enter manually</div>
                </div>
              ) : null}
              <div className="mt-2">
                <MeasurementPicker
                  value={measurement.topWidth ? parseFloat(measurement.topWidth) : null}
                  onChange={(d) =>
                    setMeasurement((m) => ({ ...m, topWidth: d ? d.toString() : '' }))
                  }
                  min={10}
                  max={120}
                />
              </div>
            </div>

            <Button 
              onClick={goNext} 
              disabled={!measurement.topWidth}
              className="w-full mt-6 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STEP 3: Heights (left + right) */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Measure the height
            </h2>
            {isGuided && (
              <p className="mt-2 text-gray-500 text-center text-sm">
                Measure the <strong>left side</strong> first, then the <strong>right side</strong>. We'll use the smaller measurement.
              </p>
            )}

            <div className="mt-4">
              <WindowDiagram 
                highlight={!measurement.leftHeight ? 'left-height' : 'right-height'}
                topWidth={measurement.topWidth}
                leftHeight={measurement.leftHeight}
                rightHeight={sameHeight ? measurement.leftHeight : measurement.rightHeight}
              />
            </div>

            <div className="mt-4 space-y-3">
              {/* Left height */}
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">Left Height</label>
                {isPhoto && (
                  <div className="mb-2">
                    <TapeMeasurePhoto
                      measurementType="height"
                      hint={{ expected_min_in: 10, expected_max_in: 200 }}
                      existingValue={measurement.leftHeight ? parseFloat(measurement.leftHeight) : null}
                      onResult={(totalInches) =>
                        setMeasurement((m) => ({
                          ...m,
                          leftHeight: totalInches.toString(),
                          ...(sameHeight ? { rightHeight: totalInches.toString() } : {}),
                        }))
                      }
                      compact
                    />
                  </div>
                )}
                <MeasurementPicker
                  value={measurement.leftHeight ? parseFloat(measurement.leftHeight) : null}
                  onChange={(d) => {
                    const v = d ? d.toString() : '';
                    setMeasurement((m) => ({ ...m, leftHeight: v, ...(sameHeight ? { rightHeight: v } : {}) }));
                  }}
                  min={10}
                  max={120}
                />
              </div>

              {/* Same height checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sameHeight}
                  onChange={e => {
                    setSameHeight(e.target.checked);
                    if (e.target.checked) setMeasurement(m => ({...m, rightHeight: m.leftHeight}));
                  }}
                  className="w-4 h-4 rounded border-border text-clay focus:ring-clay/30"
                />
                <span className="text-sm text-gray-600">Both sides are the same height</span>
              </label>

              {/* Right height */}
              {!sameHeight && (
                <div>
                  <label className="text-sm font-medium text-ink mb-1 block">Right Height</label>
                  {isPhoto && (
                    <div className="mb-2">
                      <TapeMeasurePhoto
                        measurementType="height"
                        hint={{ expected_min_in: 10, expected_max_in: 200 }}
                        existingValue={measurement.rightHeight ? parseFloat(measurement.rightHeight) : null}
                        onResult={(totalInches) =>
                          setMeasurement((m) => ({ ...m, rightHeight: totalInches.toString() }))
                        }
                        compact
                      />
                    </div>
                  )}
                  <MeasurementPicker
                    value={measurement.rightHeight ? parseFloat(measurement.rightHeight) : null}
                    onChange={(d) =>
                      setMeasurement((m) => ({ ...m, rightHeight: d ? d.toString() : '' }))
                    }
                    min={10}
                    max={120}
                  />
                </div>
              )}
            </div>

            <Button 
              onClick={goNext} 
              disabled={!measurement.leftHeight || (!sameHeight && !measurement.rightHeight)}
              className="w-full mt-6 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STEP 4: Depth */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Measure the depth
            </h2>
            {isGuided && (
              <p className="mt-2 text-gray-500 text-center text-sm">
                Measure from the <strong>front of the window frame</strong> to the <strong>nearest obstacle</strong> (lock, crank, handle, etc.)
              </p>
            )}

            <div className="mt-4">
              <WindowDiagram
                highlight="depth"
                topWidth={measurement.topWidth}
                leftHeight={measurement.leftHeight}
                rightHeight={sameHeight ? measurement.leftHeight : measurement.rightHeight}
                depth={measurement.depth}
              />
            </div>
            {/* Cross-section showing what "depth" actually means — from the
                face of the opening to the nearest obstruction like a crank. */}
            <div className="mt-4 rounded-lg border border-border bg-sand/60 p-3">
              <WindowDepthDiagram theme="light" depth={measurement.depth} />
            </div>

            <div className="mt-4">
              {isPhoto && (
                <div className="mb-3">
                  <TapeMeasurePhoto
                    measurementType="depth"
                    hint={{ expected_min_in: 0.5, expected_max_in: 8 }}
                    existingValue={measurement.depth ? parseFloat(measurement.depth) : null}
                    onResult={(totalInches) =>
                      setMeasurement((m) => ({ ...m, depth: totalInches.toString() }))
                    }
                  />
                </div>
              )}
              <MeasurementPicker
                value={measurement.depth ? parseFloat(measurement.depth) : null}
                onChange={(d) =>
                  setMeasurement((m) => ({ ...m, depth: d ? d.toString() : '' }))
                }
                min={1}
                max={10}
                variant="compact"
              />
              {/* (Number field removed — picker is the canonical input.) */}

              {isGuided && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-700">
                    <strong>Common obstructions:</strong> window locks, crank handles, vent registers, door handles. 
                    If nothing is in the way, measure the full frame depth.
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={goNext} 
              disabled={!measurement.depth}
              className="w-full mt-6 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STEP 5: Product Selection + Configuration
            Two-phase:
              (a) cross-category price comparison — user picks a category
              (b) InlineProductPicker for brand/variant/options within it
            Chosen category pre-seeds the picker via initialProduct. */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            {!productSelection?.productSlug && !selectedCategoryId ? (
              <ProductCategoryComparison
                width={parseFloat(measurement.topWidth) || 0}
                height={parseFloat(measurement.leftHeight) || 0}
                depth={parseFloat(measurement.depth) || 0}
                onSelect={(categoryId) => {
                  setSelectedCategoryId(categoryId);
                  // Seed the picker with the cheapest product in that category
                  const cat = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
                  const firstSlug = cat?.brands[0]?.productSlug;
                  if (firstSlug) {
                    setProductSelection((prev) => prev ?? {
                      productSlug: firstSlug,
                      productName: '',
                      selections: {},
                    });
                  }
                }}
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setSelectedCategoryId(null); setProductSelection(null); }}
                  className="mb-3 text-xs text-warm-gray-500 hover:text-ink inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Compare categories again
                </button>
                <InlineProductPicker
                  width={parseFloat(measurement.topWidth) || 0}
                  height={parseFloat(measurement.leftHeight) || 0}
                  depth={parseFloat(measurement.depth) || 0}
                  initialProduct={productSelection?.productSlug}
                  onComplete={(selection) => {
                    setProductSelection(selection);
                    goNext();
                  }}
                />
              </>
            )}
            <Button
              onClick={goNext}
              variant="outline"
              className="w-full mt-3 rounded-full py-5 text-warm-gray-500"
            >
              Skip for now — I&apos;ll choose later
            </Button>
          </div>
        )}

        {/* STEP 6: Review */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-ink tracking-tight">Window saved</h2>
              <p className="mt-1 text-gray-500">{measurement.roomName}</p>
            </div>

            {/* Product selection summary */}
            {productSelection && (
              <div className="bg-sand-deep/60 border border-border rounded-md p-4 mb-4">
                <div className="text-[11px] uppercase tracking-wider text-warm-gray-500 font-semibold mb-1">Selected product</div>
                <div className="text-lg font-bold text-gray-900">{productSelection.productName}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {productSelection.selections.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}
                  {productSelection.selections.fabricColor && ` • ${productSelection.selections.fabricColor}`}
                  {productSelection.selections.color && ` • ${productSelection.selections.color}`}
                </div>
              </div>
            )}

            {/* Measurement summary */}
            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400">Top Width</div>
                  <div className="text-lg font-bold text-gray-900">{measurement.topWidth}"</div>
                </div>
                {measurement.bottomWidth && (
                  <div className="bg-white rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400">Bottom Width</div>
                    <div className="text-lg font-bold text-gray-900">{measurement.bottomWidth}"</div>
                  </div>
                )}
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400">Left Height</div>
                  <div className="text-lg font-bold text-gray-900">{measurement.leftHeight}"</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400">Right Height</div>
                  <div className="text-lg font-bold text-gray-900">{sameHeight ? measurement.leftHeight : measurement.rightHeight}"</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center col-span-2">
                  <div className="text-xs text-gray-400">Depth</div>
                  <div className="text-lg font-bold text-gray-900">{measurement.depth}"</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button 
                onClick={() => {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 1500);
                  setWindows(w => [...w, measurement]);
                  setMeasurement({ roomName: measurement.roomName, topWidth: '', bottomWidth: '', leftHeight: '', rightHeight: '', depth: '', needsBottomWidth: false, photos: [] });
                  setStep(1); // back to window overview (same room)
                }}
                className="w-full bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold gap-2"
              >
                <Plus className="w-4 h-4" /> Add Another Window in {measurement.roomName}
              </Button>
              <Button 
                onClick={() => {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 1500);
                  setWindows(w => [...w, measurement]);
                  setMeasurement({ roomName: '', topWidth: '', bottomWidth: '', leftHeight: '', rightHeight: '', depth: '', needsBottomWidth: false, photos: [] });
                  setStep(0); // back to room selection
                }}
                variant="outline"
                className="w-full rounded-full py-6 gap-2"
              >
                <Home className="w-4 h-4" /> Add a Different Room
              </Button>
              <Button 
                onClick={() => navigate('/products')}
                variant="outline"
                className="w-full rounded-full py-6 gap-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4" /> Done — Choose Products & Checkout
              </Button>
            </div>

            {/* Windows count */}
            {windows.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-400">
                {windows.length + 1} window{windows.length > 0 ? 's' : ''} measured so far
              </div>
            )}

            {/* Sticky price bar */}
            {showPriceBar && (
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 mt-4">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-clay" />
                    {estimatedPrice !== null ? (
                      <div>
                        <span className="text-sm text-gray-500">Estimated price </span>
                        <span className="text-xl font-bold text-gray-900">${estimatedPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Enter width &amp; height for price</span>
                    )}
                  </div>
                  {estimatedPrice !== null && (
                    <Button
                      onClick={() => navigate('/products')}
                      className="bg-clay hover:bg-clay-hover text-primary-foreground rounded-md px-5 text-sm"
                    >
                      Continue →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
