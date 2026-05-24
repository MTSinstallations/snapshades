import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart, type CartWindow } from '@/hooks/useCart';
import { PRODUCT_BY_SLUG, getCustomerPrice } from '@/data/catalog-index';
import { saveLocalCart, loadLocalCart } from '@/lib/persistent-cart';
import { Button } from '@/components/ui/button';
import { PRODUCT_ORDER_FIELDS, BRAND_PRODUCT_FIELDS, type OrderField } from '@/lib/norman-order-specs';
import BrandSelector, { hasBrandOptions } from '@/components/addwindow/BrandSelector';
import { getCategoryById, getProductSlugForBrand } from '@/data/product-categories';
import { SWATCHES_BY_PRODUCT, ALL_SWATCHES } from '@/data/norman-swatches';
import FormFieldRenderer from '@/components/FormFieldRenderer';
import ProductTypeGrid from '@/components/addwindow/ProductTypeGrid';
import MountTypeSelector from '@/components/addwindow/MountTypeSelector';
import MeasurementDropdowns from '@/components/addwindow/MeasurementDropdowns';
import WindowDoorSelector from '@/components/addwindow/WindowDoorSelector';
import MeasurementMethodSelector from '@/components/addwindow/MeasurementMethodSelector';
import YesNoRadio from '@/components/addwindow/YesNoRadio';
import ImageCardSelector, {
  CONTROL_LOCATION_OPTIONS,
  VANE_STACK_OPTIONS,
} from '@/components/addwindow/ImageCardSelector';

export default function AddWindowForm() {
  const navigate = useNavigate();
  const { addWindow } = useCart();

  const [windowOrDoor, setWindowOrDoor] = useState<'window' | 'door' | null>(null);
  const [category, setCategory] = useState('');          // generic category id
  const [brand, setBrand] = useState<string | null>(null);
  const [mountType, setMountType] = useState<'inside' | 'outside' | null>(null);
  const [measureMethod, setMeasureMethod] = useState<'photo' | 'manual' | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [comments, setComments] = useState('');

  // Resolve the brand-specific product slug from category + brand
  const productSlug = useMemo(() => {
    if (!category) return '';
    if (brand) return getProductSlugForBrand(category, brand) || '';
    // Auto-resolve if single brand
    const cat = getCategoryById(category);
    if (cat && cat.brands.length === 1) return cat.brands[0].productSlug;
    return '';
  }, [category, brand]);

  // Product-specific fields — brand-aware: use brand fields if available, else fall back to default
  const productFields = useMemo(() => {
    if (!productSlug) return [];
    if (brand && BRAND_PRODUCT_FIELDS[productSlug]?.[brand]) {
      return BRAND_PRODUCT_FIELDS[productSlug][brand];
    }
    return PRODUCT_ORDER_FIELDS[productSlug] || [];
  }, [productSlug, brand]);

  const swatches = useMemo(
    () => (SWATCHES_BY_PRODUCT[productSlug] || ALL_SWATCHES.slice(0, 20)).map(s => ({
      id: s.id, name: s.name, color: s.color,
    })),
    [productSlug]
  );

  // When category changes, reset brand and form values
  const handleCategoryChange = (categoryId: string) => {
    setCategory(categoryId);
    setBrand(null);

    // If single-brand category, auto-resolve product slug and load defaults
    const cat = getCategoryById(categoryId);
    if (cat && cat.brands.length === 1) {
      const slug = cat.brands[0].productSlug;
      const newFields = PRODUCT_ORDER_FIELDS[slug] || [];
      const defaults = Object.fromEntries(
        newFields.filter(f => f.default !== undefined).map(f => [f.id, f.default!])
      );
      if (mountType) defaults.mountType = mountType;
      setFormValues(defaults);
    } else {
      setFormValues({});
    }
  };

  // When brand changes, resolve product slug and reset form values to that brand's defaults
  const handleBrandChange = (brandId: string) => {
    setBrand(brandId);
    const slug = getProductSlugForBrand(category, brandId) || '';
    const fields = (slug && BRAND_PRODUCT_FIELDS[slug]?.[brandId])
      || PRODUCT_ORDER_FIELDS[slug]
      || [];
    const defaults = Object.fromEntries(
      fields.filter(f => f.default !== undefined).map(f => [f.id, f.default!])
    );
    if (mountType) defaults.mountType = mountType;
    setFormValues(defaults);
  };

  // Field visibility based on dependencies
  const isFieldVisible = (field: OrderField): boolean => {
    if (!field.dependsOn) return true;
    const depValue = String(formValues[field.dependsOn.field] ?? '');
    return Array.isArray(field.dependsOn.value)
      ? field.dependsOn.value.includes(depValue)
      : depValue === field.dependsOn.value;
  };

  const updateFormValue = (fieldId: string, value: string | number | boolean) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  // Determine which image-card fields to render specially
  const IMAGE_CARD_FIELDS: Record<string, typeof CONTROL_LOCATION_OPTIONS> = {
    controlSide: CONTROL_LOCATION_OPTIONS,
    controlLocation: CONTROL_LOCATION_OPTIONS,
    vaneStackLocation: VANE_STACK_OPTIONS,
  };

  // Check if form has minimum required fields filled
  const isValid = windowOrDoor && category && productSlug && mountType && measureMethod === 'manual' && width > 0 && height > 0;

  // Render a product field based on its type and displayHint
  const renderProductField = (field: OrderField) => {
    if (!isFieldVisible(field)) return null;
    // Skip width/height/mountType — handled separately
    if (['width', 'height', 'mountType'].includes(field.id)) return null;

    // Image card fields
    if (IMAGE_CARD_FIELDS[field.id]) {
      return (
        <ImageCardSelector
          key={field.id}
          id={field.id}
          label={field.label}
          value={formValues[field.id] as string}
          onChange={updateFormValue}
          options={IMAGE_CARD_FIELDS[field.id]}
          required={field.required}
        />
      );
    }

    // Boolean fields → radio
    if (field.type === 'boolean') {
      return (
        <YesNoRadio
          key={field.id}
          id={field.id}
          label={field.label}
          value={formValues[field.id] as boolean | undefined}
          onChange={updateFormValue}
          required={field.required}
        />
      );
    }

    // Default: use existing FormFieldRenderer
    return (
      <FormFieldRenderer
        key={field.id}
        field={field}
        value={formValues[field.id]}
        onChange={updateFormValue}
        swatches={field.type === 'color' ? swatches : []}
        skipMeasurementFields
      />
    );
  };

  const handleAddWindow = () => {
    const product = PRODUCT_BY_SLUG[productSlug];
    if (!product || !product.variants.length) return;

    // Resolve variant: match cellSize/slatSize from form, else first variant
    const cellOrSlat = (formValues.cellSize || formValues.slatSize || '') as string;
    const variant = product.variants.find(v => v.cellSize === cellOrSlat) || product.variants[0];

    // Price lookup
    const priceResult = getCustomerPrice(variant.priceGrid, width, height);
    if (!priceResult) {
      alert('Sorry, those dimensions are outside the available size range for this product.');
      return;
    }

    const cartItem: CartWindow = {
      id: crypto.randomUUID(),
      room: 'Room 1',
      name: windowOrDoor === 'door' ? 'Door' : 'Window',
      width,
      height,
      depth: 0,
      product: product.name,
      productId: productSlug,
      variantId: variant.id,
      manufacturer: product.brand,
      customerPrice: priceResult.price,
      retailPrice: Math.ceil(priceResult.price / 0.36 * 100) / 100,
      ourCost: Math.ceil(priceResult.price / 0.36 * 0.30 * 100) / 100,
      tier: 'ship',
      installFee: 0,
      designFee: 0,
      surchargesTotal: 0,
    };

    addWindow(cartItem);
    // Persist immediately so the Cart page sees the item on mount
    const currentCart = loadLocalCart();
    saveLocalCart([...currentCart, cartItem]);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navy header */}
      <header className="bg-[hsl(222.2,84%,11.2%)] text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Add Window</h1>
      </header>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 space-y-8 max-w-lg mx-auto w-full">
        {/* Window or Door */}
        <section>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm font-semibold text-gray-800">Window or Door</span>
            <span className="text-red-500 text-sm">*</span>
            {windowOrDoor && (
              <span className="text-sm text-gray-500">: {windowOrDoor === 'window' ? 'Window' : 'Door'}</span>
            )}
          </div>
          <WindowDoorSelector value={windowOrDoor} onChange={setWindowOrDoor} />
        </section>

        {/* Product Type */}
        <section>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm font-semibold text-gray-800">Product Type</span>
            <span className="text-red-500 text-sm">*</span>
          </div>
          <ProductTypeGrid selected={category} onSelect={handleCategoryChange} />
        </section>

        {/* Manufacturer — only shown when category has multiple brand options */}
        {category && hasBrandOptions(category) && (
          <section>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-sm font-semibold text-gray-800">Manufacturer</span>
              <span className="text-red-500 text-sm">*</span>
              {brand && (
                <span className="text-sm text-gray-500">: {brand.charAt(0).toUpperCase() + brand.slice(1)}</span>
              )}
            </div>
            <BrandSelector categoryId={category} value={brand} onChange={handleBrandChange} />
          </section>
        )}

        {/* Mount Type */}
        <section>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm font-semibold text-gray-800">Mount</span>
            <span className="text-red-500 text-sm">*</span>
            {mountType && (
              <span className="text-sm text-gray-500">: {mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}</span>
            )}
          </div>
          <MountTypeSelector value={mountType} onChange={setMountType} />
        </section>

        {/* Measurement Method */}
        <section>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm font-semibold text-gray-800">How would you like to measure?</span>
            <span className="text-red-500 text-sm">*</span>
          </div>
          <MeasurementMethodSelector
            selected={measureMethod}
            onSelectPhoto={() => navigate('/measure/photo')}
            onSelectManual={() => setMeasureMethod('manual')}
          />
        </section>

        {/* Width & Height — only shown when manual entry selected */}
        {measureMethod === 'manual' && (
          <>
            <section>
              <MeasurementDropdowns
                label="Width"
                value={width}
                onChange={setWidth}
                min={1}
                max={160}
              />
            </section>

            <section>
              <MeasurementDropdowns
                label="Height"
                value={height}
                onChange={setHeight}
                min={1}
                max={160}
              />
            </section>
          </>
        )}

        {/* Product-specific fields */}
        {productSlug && productFields.length > 0 && (
          <section className="space-y-6">
            {productFields.map(renderProductField)}
          </section>
        )}

        {/* Additional Comments */}
        <section>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm font-semibold text-gray-800">Additional Comments (Window Specific)</span>
          </div>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Additional Comments (Window Specific)"
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none"
          />
        </section>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex-1 rounded-lg py-6 text-blue-600 border-blue-500 hover:bg-blue-50 font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddWindow}
          disabled={!isValid}
          className="flex-1 rounded-lg py-6 bg-gray-400 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold disabled:text-gray-500"
        >
          Add Window
        </Button>
      </div>
    </div>
  );
}
