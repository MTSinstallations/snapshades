import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
} from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import ProductVisual from '@/components/value/ProductVisual';
import SEOHead from '@/components/SEOHead';
import {
  VALUE_PRODUCTS,
  getStartingPrice,
  getValueCatalogProduct,
  getValueProduct,
  type ValueProductId,
} from '@/data/value-products';
import { calculateConfiguredStorefrontPrice, getStorefrontFixedOptions } from '@/data/storefront-catalog';
import { useCart, type CartWindow, type MountType } from '@/hooks/useCart';
import { loadLocalCart, saveLocalCart } from '@/lib/persistent-cart';

const STEPS = ['Product', 'Mount', 'Size', 'Details', 'Review'] as const;
const FRACTIONS = [
  { label: '0', value: 0 },
  { label: '1/8', value: 0.125 },
  { label: '1/4', value: 0.25 },
  { label: '3/8', value: 0.375 },
  { label: '1/2', value: 0.5 },
  { label: '5/8', value: 0.625 },
  { label: '3/4', value: 0.75 },
  { label: '7/8', value: 0.875 },
] as const;

interface MeasurementInputProps {
  label: string;
  whole: string;
  fraction: number;
  onWholeChange: (value: string) => void;
  onFractionChange: (value: number) => void;
  max: number;
}

function MeasurementInput({
  label,
  whole,
  fraction,
  onWholeChange,
  onFractionChange,
  max,
}: MeasurementInputProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <label className="rounded-xl border border-ink/15 bg-white px-3 py-2 focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-warm-gray-500">Inches</span>
          <input
            type="number"
            inputMode="numeric"
            min="6"
            max={max}
            value={whole}
            onChange={(event) => onWholeChange(event.target.value)}
            className="mt-1 w-full bg-transparent text-xl font-semibold outline-none"
            aria-label={`${label} whole inches`}
            placeholder="36"
          />
        </label>
        <label className="rounded-xl border border-ink/15 bg-white px-3 py-2 focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-warm-gray-500">Fraction</span>
          <select
            value={fraction}
            onChange={(event) => onFractionChange(Number(event.target.value))}
            className="mt-1 w-full bg-transparent text-xl font-semibold outline-none"
            aria-label={`${label} fraction`}
          >
            {FRACTIONS.map((item) => (
              <option key={item.label} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

interface ChoiceButtonProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}

function ChoiceButton({ selected, onClick, title, description }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-4 text-left transition-colors ${
        selected ? 'border-clay bg-clay/[0.05]' : 'border-ink/10 bg-white hover:border-ink/25'
      }`}
    >
      <span className="block pr-7 font-semibold text-ink">{title}</span>
      {description && <span className="mt-1 block text-sm leading-5 text-warm-gray-500">{description}</span>}
      <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-clay bg-clay text-white' : 'border-ink/20'}`}>
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

export default function QuickOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedProduct = searchParams.get('product');
  const initialProduct = VALUE_PRODUCTS.find((product) => product.id === requestedProduct);
  const { addWindow } = useCart();

  const [step, setStep] = useState(initialProduct ? 1 : 0);
  const [productId, setProductId] = useState<ValueProductId | null>(initialProduct?.id ?? null);
  const [mountType, setMountType] = useState<MountType>('inside');
  const [widthWhole, setWidthWhole] = useState('');
  const [widthFraction, setWidthFraction] = useState(0);
  const [heightWhole, setHeightWhole] = useState('');
  const [heightFraction, setHeightFraction] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [color, setColor] = useState(initialProduct?.colors[0].name ?? '');
  const [lightControl, setLightControl] = useState(initialProduct?.lightControls[0] ?? '');
  const [controlSide, setControlSide] = useState('Right');
  const [slatSize, setSlatSize] = useState('2"');
  const [room, setRoom] = useState('');
  const [quantity, setQuantity] = useState(1);

  const product = productId ? getValueProduct(productId) : null;
  const catalogProduct = product ? getValueCatalogProduct(product) : null;
  const variant = useMemo(() => {
    if (!catalogProduct) return null;
    return catalogProduct.variants.find((item) => item.id === variantId) ?? catalogProduct.variants[0];
  }, [catalogProduct, variantId]);

  const width = (Number.parseInt(widthWhole, 10) || 0) + widthFraction;
  const height = (Number.parseInt(heightWhole, 10) || 0) + heightFraction;
  const maxWidth = variant?.maxWidth ?? 96;
  const maxHeight = variant?.maxHeight
    ?? variant?.priceGrid.heights[variant.priceGrid.heights.length - 1]
    ?? 96;
  const dimensionsWithinProductLimits = width >= 6 && height >= 6 && width <= maxWidth && height <= maxHeight;
  const priceResult = variant && dimensionsWithinProductLimits && product
    ? calculateConfiguredStorefrontPrice({
        productSlug: product.catalogSlug,
        variantId: variant.id,
        width,
        height,
        lightControl,
      })
    : null;
  const availableColors = product?.colors.filter((item) => !item.lightControl || item.lightControl === lightControl) ?? [];
  const selectedColor = availableColors.find((item) => item.name === color) ?? availableColors[0];

  const chooseProduct = (id: ValueProductId) => {
    const nextProduct = getValueProduct(id);
    setProductId(id);
    setVariantId(null);
    setColor(nextProduct.colors[0].name);
    setLightControl(nextProduct.lightControls[0]);
    setControlSide('Right');
    setSlatSize('2"');
  };

  const chooseLightControl = (nextLightControl: string) => {
    setLightControl(nextLightControl);
    if (!product) return;
    const nextColors = product.colors.filter((item) => !item.lightControl || item.lightControl === nextLightControl);
    if (!nextColors.some((item) => item.name === color)) setColor(nextColors[0]?.name ?? '');
  };

  const canContinue =
    (step === 0 && product !== null)
    || step === 1
    || (step === 2 && priceResult !== null)
    || (step === 3 && Boolean(color) && Boolean(lightControl) && (product?.id !== 'faux-wood' || Boolean(slatSize)));

  const nextStep = () => {
    if (canContinue && step < STEPS.length - 1) setStep((current) => current + 1);
  };

  const previousStep = () => {
    if (step > 0) setStep((current) => current - 1);
    else navigate('/');
  };

  const addConfiguredWindows = () => {
    if (!product || !catalogProduct || !variant || !priceResult) return;

    const items: CartWindow[] = Array.from({ length: quantity }, (_, index) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `value-${Date.now()}-${index}`;

      return {
        id,
        room: room.trim() || 'My windows',
        name: quantity > 1 ? `${product.name} ${index + 1}` : product.name,
        width,
        height,
        depth: 0,
        mountType,
        productOptions: {
          color,
          colorCode: selectedColor?.code ?? '',
          lightControl,
          construction: variant.name,
          ...getStorefrontFixedOptions(catalogProduct.slug),
          ...(product.id === 'faux-wood' ? { controlSide, slatSize } : {}),
        },
        product: product.name,
        productId: catalogProduct.slug,
        variantId: variant.id,
        manufacturer: catalogProduct.brand,
        retailPrice: priceResult.retailPrice,
        ourCost: priceResult.supplierCost,
        customerPrice: priceResult.price,
        tier: 'ship',
        installFee: 0,
        designFee: 0,
        surchargesTotal: 0,
      };
    });

    items.forEach(addWindow);
    saveLocalCart([...loadLocalCart(), ...items]);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-sand text-ink">
      <SEOHead
        title="Order Custom Shades or Blinds"
        description="Choose cellular shades, roller shades, or faux wood blinds, enter your mount and exact measurements, and see cost-plus-10% pricing instantly."
        canonical="/order"
        noindex
      />
      <SiteHeader />

      <div className="border-b border-ink/10 bg-white/60">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((label, index) => (
              <div key={label} className="flex flex-1 items-center gap-2 last:flex-none sm:last:flex-1">
                <button
                  type="button"
                  onClick={() => index < step && setStep(index)}
                  disabled={index >= step}
                  className="flex items-center gap-2 disabled:cursor-default"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === step ? 'bg-clay text-white' : index < step ? 'bg-ink text-white' : 'bg-ink/5 text-warm-gray-500'
                  }`}>
                    {index < step ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={`hidden text-sm font-semibold sm:inline ${index === step ? 'text-ink' : 'text-warm-gray-500'}`}>{label}</span>
                </button>
                {index < STEPS.length - 1 && <div className={`h-px flex-1 ${index < step ? 'bg-ink/40' : 'bg-ink/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 pb-32 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {step === 0 && (
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Step 1 of 5</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Choose your product.</h1>
              <p className="mt-3 text-warm-gray-500">We carry only the three value products people buy most.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {VALUE_PRODUCTS.map((item) => {
                  const selected = productId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseProduct(item.id)}
                      className={`overflow-hidden rounded-2xl border-2 bg-white p-3 text-left transition-all ${selected ? 'border-clay ring-4 ring-clay/10' : 'border-transparent hover:border-ink/15'}`}
                    >
                      <ProductVisual type={item.visual} color={item.colors[1]?.value} className="aspect-[5/4] w-full rounded-xl border-[6px] shadow-sm" />
                      <div className="px-1 pb-2 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-semibold leading-5">{item.name}</h2>
                          {selected && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-white"><Check className="h-3.5 w-3.5" /></span>}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-warm-gray-500">{item.bestFor}</p>
                        <p className="mt-3 text-sm font-semibold">From ${getStartingPrice(item).toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 1 && product && (
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Step 2 of 5</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">How will it mount?</h1>
              <p className="mt-3 text-warm-gray-500">This tells us how to interpret your measurements.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMountType('inside')}
                  className={`rounded-3xl border-2 bg-white p-6 text-left ${mountType === 'inside' ? 'border-clay ring-4 ring-clay/10' : 'border-transparent hover:border-ink/15'}`}
                >
                  <div className="relative mx-auto h-44 max-w-[220px] border-[10px] border-[#d5c7b3] bg-[#abb8b7]">
                    <div className="absolute inset-4 border-4 border-ink/70 bg-[#eee8dc]" />
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div><h2 className="text-xl font-semibold">Inside mount</h2><p className="mt-1 text-sm leading-6 text-warm-gray-500">Fits inside the opening. Clean and minimal.</p></div>
                    {mountType === 'inside' && <CheckCircle2 className="h-6 w-6 text-clay" />}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMountType('outside')}
                  className={`rounded-3xl border-2 bg-white p-6 text-left ${mountType === 'outside' ? 'border-clay ring-4 ring-clay/10' : 'border-transparent hover:border-ink/15'}`}
                >
                  <div className="relative mx-auto h-44 max-w-[220px] border-[10px] border-[#d5c7b3] bg-[#abb8b7]">
                    <div className="absolute -inset-x-5 -inset-y-3 border-4 border-ink/70 bg-[#eee8dc]" />
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div><h2 className="text-xl font-semibold">Outside mount</h2><p className="mt-1 text-sm leading-6 text-warm-gray-500">Covers the opening. Better light control.</p></div>
                    {mountType === 'outside' && <CheckCircle2 className="h-6 w-6 text-clay" />}
                  </div>
                </button>
              </div>
            </section>
          )}

          {step === 2 && product && variant && (
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Step 3 of 5</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Enter your measurements.</h1>
              <div className="mt-5 flex gap-3 rounded-2xl border border-clay/20 bg-clay/[0.06] p-4 text-sm leading-6">
                <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                <p>
                  {mountType === 'inside'
                    ? <><strong>Inside mount:</strong> enter the exact opening. Use the narrowest width and tallest height. Do not deduct.</>
                    : <><strong>Outside mount:</strong> enter the finished product size you want. Add overlap before entering the size.</>}
                </p>
              </div>

              <div className="mt-8 grid gap-5 rounded-3xl bg-white p-6 sm:grid-cols-2 sm:p-8">
                <MeasurementInput label="Width" whole={widthWhole} fraction={widthFraction} onWholeChange={setWidthWhole} onFractionChange={setWidthFraction} max={maxWidth} />
                <MeasurementInput label="Height" whole={heightWhole} fraction={heightFraction} onWholeChange={setHeightWhole} onFractionChange={setHeightFraction} max={maxHeight} />
                <div className="sm:col-span-2 flex flex-col gap-2 border-t border-ink/10 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-warm-gray-500">Available up to {maxWidth}&quot; wide × {maxHeight}&quot; high</span>
                  {priceResult && <span className="font-semibold">Your price: ${priceResult.price.toFixed(2)}</span>}
                </div>
              </div>

              {(widthWhole || heightWhole) && !priceResult && (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  Enter a width and height between 6&quot; and {maxWidth}&quot; × {maxHeight}&quot; for this product.
                </p>
              )}
            </section>
          )}

          {step === 3 && product && catalogProduct && variant && (
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Step 4 of 5</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Choose the details.</h1>
              <p className="mt-3 text-warm-gray-500">Only the options that apply to {product.name.toLowerCase()}.</p>

              <div className="mt-8 space-y-7 rounded-3xl bg-white p-6 sm:p-8">
                {catalogProduct.variants.length > 1 && (
                  <fieldset>
                    <legend className="text-sm font-semibold">Construction</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {catalogProduct.variants.map((item) => (
                        <ChoiceButton key={item.id} selected={variant.id === item.id} onClick={() => setVariantId(item.id)} title={item.name} description={item === catalogProduct.variants[0] ? 'Lowest price' : 'Extra insulation'} />
                      ))}
                    </div>
                  </fieldset>
                )}

                <fieldset>
                  <legend className="text-sm font-semibold">Light control</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {product.lightControls.map((item) => (
                      <ChoiceButton key={item} selected={lightControl === item} onClick={() => chooseLightControl(item)} title={item} />
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold">Color</legend>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {availableColors.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setColor(item.name)}
                        className={`rounded-2xl border-2 p-3 text-left ${color === item.name ? 'border-clay' : 'border-ink/10'}`}
                      >
                        <span className={`block h-14 rounded-xl ${item.border ? 'border border-ink/10' : ''}`} style={{ backgroundColor: item.value }} />
                        <span className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold">
                          {item.name} {color === item.name && <Check className="h-3.5 w-3.5 text-clay" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {product.id === 'faux-wood' && (
                  <fieldset>
                    <legend className="text-sm font-semibold">Slat size</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {['2"', '2½"'].map((size) => (
                        <ChoiceButton key={size} selected={slatSize === size} onClick={() => setSlatSize(size)} title={`${size} slats`} />
                      ))}
                    </div>
                  </fieldset>
                )}

                {product.id === 'faux-wood' && (
                  <fieldset>
                    <legend className="text-sm font-semibold">Tilt wand side</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {['Left', 'Right'].map((side) => (
                        <ChoiceButton key={side} selected={controlSide === side} onClick={() => setControlSide(side)} title={side} />
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            </section>
          )}

          {step === 4 && product && variant && priceResult && (
            <section>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-clay">Step 5 of 5</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Review your window.</h1>
              <div className="mt-8 grid gap-5 md:grid-cols-[.8fr_1.2fr]">
                <ProductVisual type={product.visual} color={selectedColor?.value} className="aspect-[4/5] w-full" />
                <div className="rounded-3xl bg-white p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-clay">{mountType} mount</p>
                      <h2 className="mt-1 text-2xl font-semibold">{product.name}</h2>
                    </div>
                    <button type="button" onClick={() => setStep(0)} className="text-sm font-semibold text-clay">Edit</button>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-ink/10 py-5 text-sm">
                    <div><dt className="text-warm-gray-500">Size</dt><dd className="mt-1 font-semibold">{width}&quot; × {height}&quot;</dd></div>
                    <div><dt className="text-warm-gray-500">Color</dt><dd className="mt-1 font-semibold">{color} <span className="font-mono text-xs text-warm-gray-500">{selectedColor?.code}</span></dd></div>
                    <div><dt className="text-warm-gray-500">Light control</dt><dd className="mt-1 font-semibold">{lightControl}</dd></div>
                    <div><dt className="text-warm-gray-500">Operation</dt><dd className="mt-1 font-semibold">{product.id === 'faux-wood' ? `${slatSize} slats · ${controlSide} tilt` : 'Cordless'}</dd></div>
                  </dl>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <label className="block">
                      <span className="text-sm font-semibold">Room name <span className="font-normal text-warm-gray-500">(optional)</span></span>
                      <input value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Living room" className="mt-2 w-full rounded-xl border border-ink/15 px-3 py-2.5 outline-none focus:border-clay" />
                    </label>
                    <div>
                      <p className="mb-2 text-sm font-semibold">Quantity</p>
                      <div className="flex items-center rounded-xl border border-ink/15">
                        <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2.5" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                        <span className="min-w-10 text-center font-semibold">{quantity}</span>
                        <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="p-2.5" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-sand p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray-500">Transparent price per window</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span>Supplier cost</span><span>${priceResult.supplierCost.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>SnapShades 10%</span><span>${priceResult.brokerFee.toFixed(2)}</span></div>
                      <div className="flex justify-between text-warm-gray-500"><span>Supplier freight</span><span>Calculated in cart</span></div>
                      <div className="flex justify-between text-warm-gray-500"><span>Tax</span><span>Calculated at payment</span></div>
                      <div className="flex justify-between border-t border-ink/10 pt-3 text-lg font-semibold"><span>{quantity > 1 ? `Products for ${quantity}` : 'Product price'}</span><span>${(priceResult.price * quantity).toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <button type="button" onClick={previousStep} className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-3 font-semibold text-ink hover:bg-sand">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canContinue}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-clay px-5 py-3 font-semibold text-white transition-colors hover:bg-clay-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to {STEPS[step + 1]} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={addConfiguredWindows}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-clay px-5 py-3 font-semibold text-white hover:bg-clay-hover"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart{priceResult ? ` · $${(priceResult.price * quantity).toFixed(2)}` : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
