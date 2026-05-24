import { useState, useRef, useEffect } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles, Loader2, Download, Share2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ALL_SWATCHES, type Swatch } from '@/data/norman-swatches';
import { visualizeRoom, getAiCreditBalance } from '@/lib/ai-credits';
import { useNavigate } from 'react-router-dom';

/**
 * ProductPreview — AI-powered "See it on your window" visualizer
 * 
 * Flow:
 * 1. Customer takes/uploads window photo (from measurement step)
 * 2. Taps "Preview Products" button
 * 3. Selects product category + color/swatch
 * 4. Sees instant overlay preview (CSS composite)
 * 5. Can tap "AI Enhance" for photorealistic render (API call)
 * 
 * Architecture:
 * - Canvas-based overlay for instant preview
 * - AI generation endpoint (OpenAI/Replicate) for photorealistic
 * - Saves previews to project for reference
 */

interface ProductPreviewProps {
  windowPhoto: string;  // base64 or URL of customer's window photo
  windowWidth?: number;
  windowHeight?: number;
  onClose?: () => void;
}

interface PreviewProduct {
  id: string;
  name: string;
  category: string;
  overlayStyle: 'horizontal' | 'vertical' | 'cellular' | 'shutter' | 'roller';
  overlayColor: string;
  overlayOpacity: number;
}

const PREVIEW_PRODUCTS: PreviewProduct[] = [
  { id: 'honeycomb-white', name: 'Honeycomb — White', category: 'Honeycomb Shades', overlayStyle: 'cellular', overlayColor: '#F5F5F0', overlayOpacity: 0.85 },
  { id: 'honeycomb-cream', name: 'Honeycomb — Cream', category: 'Honeycomb Shades', overlayStyle: 'cellular', overlayColor: '#F0E8D8', overlayOpacity: 0.85 },
  { id: 'honeycomb-gray', name: 'Honeycomb — Silver', category: 'Honeycomb Shades', overlayStyle: 'cellular', overlayColor: '#C0BEB8', overlayOpacity: 0.85 },
  { id: 'roller-white', name: 'Roller — White', category: 'Roller Shades', overlayStyle: 'roller', overlayColor: '#F8F8F5', overlayOpacity: 0.9 },
  { id: 'roller-mocha', name: 'Roller — Mocha', category: 'Roller Shades', overlayStyle: 'roller', overlayColor: '#B8A594', overlayOpacity: 0.9 },
  { id: 'faux-wood-white', name: 'Faux Wood — Pearl', category: 'Blinds', overlayStyle: 'horizontal', overlayColor: '#F0EDE5', overlayOpacity: 0.88 },
  { id: 'faux-wood-gray', name: 'Faux Wood — Storm Gray', category: 'Blinds', overlayStyle: 'horizontal', overlayColor: '#808890', overlayOpacity: 0.88 },
  { id: 'shutter-white', name: 'Shutters — White', category: 'Shutters', overlayStyle: 'shutter', overlayColor: '#FAFAFA', overlayOpacity: 0.92 },
  { id: 'shutter-cream', name: 'Shutters — Cream', category: 'Shutters', overlayStyle: 'shutter', overlayColor: '#F0E8D8', overlayOpacity: 0.92 },
];

const CATEGORIES = [...new Set(PREVIEW_PRODUCTS.map(p => p.category))];

export default function ProductPreview({ windowPhoto, onClose }: ProductPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<PreviewProduct>(PREVIEW_PRODUCTS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiError, setAiError] = useState<{ kind: 'out_of_credits' | 'not_configured' | 'error'; message: string } | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [coveragePercent, setCoveragePercent] = useState(70); // how much of window is covered
  const [position, setPosition] = useState({ top: 15, left: 10 }); // % offset from top-left

  const filteredProducts = PREVIEW_PRODUCTS.filter(p => p.category === selectedCategory);

  // Fetch credit balance on mount so the button shows "AI Enhance (3 left)"
  useEffect(() => {
    let cancelled = false;
    getAiCreditBalance().then((b) => {
      if (!cancelled) setCreditBalance(b);
    });
    return () => { cancelled = true; };
  }, []);

  // Draw the composite on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showOriginal || aiPreview) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original photo
      ctx.drawImage(img, 0, 0);

      // Calculate overlay area (simulating the window opening)
      const overlayX = (position.left / 100) * img.width;
      const overlayY = (position.top / 100) * img.height;
      const overlayW = (coveragePercent / 100) * img.width * 0.8;
      const overlayH = (coveragePercent / 100) * img.height * 0.7;

      // Draw product overlay
      ctx.globalAlpha = selectedProduct.overlayOpacity;
      ctx.fillStyle = selectedProduct.overlayColor;
      ctx.fillRect(overlayX, overlayY, overlayW, overlayH);

      // Draw product-specific texture lines
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;

      if (selectedProduct.overlayStyle === 'horizontal' || selectedProduct.overlayStyle === 'cellular') {
        // Horizontal lines (blinds/cellular)
        const slatSpacing = selectedProduct.overlayStyle === 'cellular' ? overlayH / 20 : overlayH / 15;
        for (let y = overlayY + slatSpacing; y < overlayY + overlayH; y += slatSpacing) {
          ctx.beginPath();
          ctx.moveTo(overlayX, y);
          ctx.lineTo(overlayX + overlayW, y);
          ctx.stroke();
        }
        
        // Cellular shades get a second set of softer lines for the cell shape
        if (selectedProduct.overlayStyle === 'cellular') {
          ctx.globalAlpha = 0.05;
          for (let y = overlayY + slatSpacing / 2; y < overlayY + overlayH; y += slatSpacing) {
            ctx.beginPath();
            ctx.moveTo(overlayX, y);
            ctx.lineTo(overlayX + overlayW, y);
            ctx.stroke();
          }
        }
      }

      if (selectedProduct.overlayStyle === 'shutter') {
        // Shutter louvers — thicker, wider spaced
        const louverSpacing = overlayH / 10;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.2;
        for (let y = overlayY + louverSpacing; y < overlayY + overlayH; y += louverSpacing) {
          ctx.beginPath();
          ctx.moveTo(overlayX + 5, y);
          ctx.lineTo(overlayX + overlayW - 5, y);
          ctx.stroke();
        }
        // Center tilt rod
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 4;
        const centerX = overlayX + overlayW / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, overlayY + 5);
        ctx.lineTo(centerX, overlayY + overlayH - 5);
        ctx.stroke();
        
        // Panel divider (for wider windows)
        if (overlayW > img.width * 0.4) {
          ctx.globalAlpha = 0.15;
          ctx.lineWidth = 2;
          const divX = overlayX + overlayW / 2;
          ctx.beginPath();
          ctx.moveTo(divX, overlayY);
          ctx.lineTo(divX, overlayY + overlayH);
          ctx.stroke();
        }
      }

      if (selectedProduct.overlayStyle === 'roller') {
        // Roller shade — smooth with subtle bottom bar
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(overlayX, overlayY + overlayH - 2);
        ctx.lineTo(overlayX + overlayW, overlayY + overlayH - 2);
        ctx.stroke();
        // Top roller tube
        ctx.fillStyle = '#888';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(overlayX, overlayY - 8, overlayW, 12);
      }

      if (selectedProduct.overlayStyle === 'vertical') {
        // Vertical blinds
        const vaneSpacing = overlayW / 12;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.15;
        for (let x = overlayX + vaneSpacing; x < overlayX + overlayW; x += vaneSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, overlayY);
          ctx.lineTo(x, overlayY + overlayH);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      // Subtle shadow at top of overlay
      const gradient = ctx.createLinearGradient(overlayX, overlayY, overlayX, overlayY + 20);
      gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(overlayX, overlayY, overlayW, 20);
    };
    img.src = windowPhoto;
  }, [windowPhoto, selectedProduct, showOriginal, aiPreview, coveragePercent, position]);

  // AI generation — calls visualize-room edge function (Gemini 2.5 Flash Image
  // under the hood). Debits 1 credit on success; refunds on failure. Falls
  // back to the canvas composite if the provider isn't configured yet.
  const generateAIPreview = async () => {
    if (creditBalance !== null && creditBalance <= 0) {
      setAiError({ kind: 'out_of_credits', message: "You're out of AI visualizations. Order free swatches to earn 5 more." });
      return;
    }

    setAiGenerating(true);
    setAiError(null);

    const response = await visualizeRoom({
      windowPhoto,
      productType: selectedProduct.category,
      colorHex: selectedProduct.overlayColor,
      colorName: selectedProduct.name.split('—').pop()?.trim() ?? selectedProduct.name,
      coveragePercent,
    });

    setAiGenerating(false);

    if (response.status === 'ok') {
      setAiPreview(response.image);
      setCreditBalance(response.balance_remaining);
      return;
    }
    if (response.status === 'out_of_credits') {
      setAiError({ kind: 'out_of_credits', message: response.message });
      setCreditBalance(0);
      return;
    }
    if (response.status === 'not_configured') {
      setAiError({ kind: 'not_configured', message: response.message });
      return;
    }
    setAiError({ kind: 'error', message: response.message });
  };

  const downloadPreview = () => {
    const dataUrl = aiPreview || canvasRef.current?.toDataURL('image/jpeg', 0.9);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `snapshades-preview-${selectedProduct.id}.jpg`;
    a.click();
  };

  const sharePreview = async () => {
    const dataUrl = aiPreview || canvasRef.current?.toDataURL('image/jpeg', 0.9);
    if (!dataUrl || !navigator.share) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'snapshades-preview.jpg', { type: 'image/jpeg' });
      await navigator.share({ title: 'My SnapShades Preview', files: [file] });
    } catch {
      // Fallback — copy to clipboard
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">Preview on Your Window</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1" onClick={downloadPreview}>
            <Download className="w-4 h-4" /> Save
          </Button>
          {'share' in navigator && (
            <Button variant="ghost" size="sm" className="gap-1" onClick={sharePreview}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
          )}
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-full max-h-full">
          {aiPreview ? (
            <img src={aiPreview} alt="AI Preview" className="max-w-full max-h-[60vh] rounded-xl shadow-2xl" />
          ) : showOriginal ? (
            <img src={windowPhoto} alt="Original" className="max-w-full max-h-[60vh] rounded-xl shadow-2xl" />
          ) : (
            <canvas ref={canvasRef} className="max-w-full max-h-[60vh] rounded-xl shadow-2xl" style={{ width: '100%', height: 'auto' }} />
          )}

          {/* Toggle original */}
          <button
            className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
          >
            👁 Hold to see original
          </button>

          {/* AI enhance button */}
          {!aiPreview && (
            <button
              className="absolute bottom-4 right-4 bg-clay hover:bg-clay-hover text-primary-foreground text-xs px-4 py-2 rounded-md flex items-center gap-1.5 shadow-lg disabled:opacity-50 font-semibold"
              onClick={generateAIPreview}
              disabled={aiGenerating || (creditBalance !== null && creditBalance <= 0)}
            >
              {aiGenerating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Enhance
                  {creditBalance !== null && (
                    <span className="opacity-80">({creditBalance} left)</span>
                  )}
                </>
              )}
            </button>
          )}

          {aiPreview && (
            <button
              className="absolute bottom-4 right-4 bg-card/95 text-ink text-xs px-3 py-1.5 rounded-md font-medium border border-border"
              onClick={() => setAiPreview(null)}
            >
              ← Back to quick preview
            </button>
          )}
        </div>
      </div>

      {/* Error / upsell banners */}
      {aiError && (
        <div className="bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3">
          <div className="max-w-lg mx-auto flex items-start gap-2.5">
            {aiError.kind === 'not_configured' ? (
              <Info className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm text-ink">
              {aiError.message}
              {aiError.kind === 'out_of_credits' && (
                <button
                  onClick={() => { onClose?.(); navigate('/swatches'); }}
                  className="ml-2 text-clay font-semibold underline underline-offset-2 hover:text-clay-hover"
                >
                  Get free swatches →
                </button>
              )}
            </div>
            <button
              onClick={() => setAiError(null)}
              className="text-warm-gray-500 hover:text-ink"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200">
        {/* Coverage slider */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Coverage</span>
            <span>{coveragePercent}%</span>
          </div>
          <input
            type="range"
            min={30}
            max={95}
            value={coveragePercent}
            onChange={e => { setCoveragePercent(Number(e.target.value)); setAiPreview(null); }}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Category tabs */}
        <div className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const first = PREVIEW_PRODUCTS.find(p => p.category === cat);
                if (first) { setSelectedProduct(first); setAiPreview(null); }
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Color/product swatches */}
        <div className="px-4 py-3 flex gap-3 overflow-x-auto">
          {filteredProducts.map(prod => (
            <button
              key={prod.id}
              onClick={() => { setSelectedProduct(prod); setAiPreview(null); }}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 ${
                selectedProduct.id === prod.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl border-2 shadow-sm transition-all ${
                  selectedProduct.id === prod.id ? 'border-blue-500 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: prod.overlayColor }}
              />
              <span className="text-[10px] text-gray-600 max-w-[80px] text-center truncate">{prod.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Floating preview button — shows on measurement pages after photo is taken
 */
export function PreviewButton({ windowPhoto, onClick }: { windowPhoto: string; onClick: () => void }) {
  if (!windowPhoto) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:shadow-xl"
    >
      <Eye className="w-5 h-5" />
      <span className="text-sm font-medium">Preview Products</span>
      <Sparkles className="w-4 h-4 text-blue-200" />
    </button>
  );
}
