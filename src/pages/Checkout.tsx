import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, ArrowLeft, Check, Truck, Shield, Package, Copy, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/orders';
import { PAYMENT_METHODS, PAYMENT_CATEGORIES, getZelleInstructions, getCashAppInstructions, type PaymentMethod } from '@/lib/payment-engine';

type Step = 'contact' | 'shipping' | 'payment' | 'confirm';

const STEPS: { key: Step; label: string }[] = [
  { key: 'contact', label: 'Contact' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirm', label: 'Confirm' },
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    cart, subtotal, installTotal, designTotal, surchargesTotal, tax, grandTotal,
    windowCount, syncToSupabase, clearCart, loading: cartLoading,
  } = useCart();

  const [step, setStep] = useState<Step>('contact');
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address1: '', address2: '', city: '', state: 'CA', zip: '',
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('card');
  const [copied, setCopied] = useState(false);

  // Pre-fill from auth
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        email: f.email || user.email || '',
        firstName: f.firstName || user.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: f.lastName || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [user]);

  // Redirect if cart empty (after loading completes)
  useEffect(() => {
    if (!cartLoading && cart.length === 0) navigate('/cart');
  }, [cart.length, cartLoading, navigate]);

  const updateForm = (updates: Partial<typeof form>) => setForm(f => ({ ...f, ...updates }));
  const stepIndex = STEPS.findIndex(s => s.key === step);
  const nextStep = () => { const next = STEPS[stepIndex + 1]; if (next) setStep(next.key); };
  const prevStep = () => { const prev = STEPS[stepIndex - 1]; if (prev) setStep(prev.key); };

  const selectedConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const zelleInfo = getZelleInstructions(grandTotal, 'PENDING');
  const cashAppInfo = getCashAppInstructions(grandTotal, 'PENDING');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      // Prompt sign in
      toast({ title: 'Sign in required', description: 'Please sign in or create an account to place your order.', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    setPlacing(true);

    // Sync cart to Supabase
    const projectId = await syncToSupabase();

    // Create the order
    const result = await createOrder(
      user.id,
      projectId,
      cart,
      {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address1: form.address1,
        address2: form.address2,
        city: form.city,
        state: form.state,
        zip: form.zip,
        paymentMethod: selectedMethod || 'card',
      },
      { subtotal, installTotal, designTotal, surchargesTotal, tax, grandTotal },
    );

    setPlacing(false);

    if (result.error) {
      toast({ title: 'Order failed', description: result.error, variant: 'destructive' });
      return;
    }

    // Clear cart and navigate to confirmation
    clearCart();
    navigate(`/order-confirmation?order=${result.orderNumber}&id=${result.orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4 text-green-500" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => i <= stepIndex && setStep(s.key)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  i < stepIndex ? 'bg-green-500 text-white' :
                  i === stepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </button>
              <span className={`text-sm hidden sm:inline ${i === stepIndex ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {/* CONTACT */}
            {step === 'contact' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                  {!user && (
                    <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm text-blue-700">
                      Already have an account? <a href="/auth" className="font-semibold underline">Sign in</a> to pre-fill your info.
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                      <input type="email" value={form.email} onChange={e => updateForm({ email: e.target.value })} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                        <input type="text" value={form.firstName} onChange={e => updateForm({ firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                        <input type="text" value={form.lastName} onChange={e => updateForm({ lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => updateForm({ phone: e.target.value })} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 text-white rounded-full py-6 text-lg font-semibold" onClick={nextStep}>
                    Continue to Shipping
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* SHIPPING */}
            {step === 'shipping' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
                      <input type="text" value={form.address1} onChange={e => updateForm({ address1: e.target.value })} placeholder="123 Main St" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Apt / Suite (optional)</label>
                      <input type="text" value={form.address2} onChange={e => updateForm({ address2: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="text-sm font-medium text-gray-700 block mb-1">City</label><input type="text" value={form.city} onChange={e => updateForm({ city: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-1">State</label><select value={form.state} onChange={e => updateForm({ state: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                      <div><label className="text-sm font-medium text-gray-700 block mb-1">ZIP</label><input type="text" value={form.zip} onChange={e => updateForm({ zip: e.target.value })} placeholder="90210" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="rounded-full" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                    <Button className="flex-1 bg-blue-600 text-white rounded-full py-6 text-lg font-semibold" onClick={nextStep}>Continue to Payment</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PAYMENT */}
            {step === 'payment' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Choose How to Pay</h2>
                <p className="text-sm text-gray-500 mb-6">All payment methods are secure and encrypted.</p>

                {/* Apple Pay / Google Pay — one tap, always first */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setSelectedMethod('apple_pay')}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                      selectedMethod === 'apple_pay'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl">🍎</span>
                    <span className="text-sm font-semibold text-gray-900">Apple Pay</span>
                    <span className="text-xs text-green-600 font-medium">No fees</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('google_pay')}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                      selectedMethod === 'google_pay'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl">🔵</span>
                    <span className="text-sm font-semibold text-gray-900">Google Pay</span>
                    <span className="text-xs text-green-600 font-medium">No fees</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {PAYMENT_CATEGORIES.map(cat => {
                    const methods = PAYMENT_METHODS.filter(m => m.category === cat.key && m.enabled);
                    if (methods.length === 0) return null;
                    const isExpanded = expandedCategory === cat.key;

                    return (
                      <Card key={cat.key}>
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{cat.icon}</span>
                            <div>
                              <span className="font-semibold text-gray-900">{cat.label}</span>
                              <span className="text-xs text-gray-400 ml-2">{methods.length} option{methods.length > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-4 space-y-2">
                            {methods.map(method => {
                              const isSelected = selectedMethod === method.id;
                              return (
                                <button
                                  key={method.id}
                                  onClick={() => setSelectedMethod(method.id)}
                                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                    isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                                  }`}
                                >
                                  <span className="text-2xl">{method.icon}</span>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{method.name}</div>
                                    <div className="text-xs text-gray-500">{method.description}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-xs font-medium ${method.processingFee.includes('Save') ? 'text-green-600' : 'text-gray-400'}`}>
                                      {method.processingFee}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-0.5 justify-end">
                                      <Clock className="w-3 h-3" /> {method.processingTime}
                                    </div>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>

                {/* Payment-specific UI (card form, etc) */}
                {selectedMethod === 'card' && (
                  <Card className="mt-4">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Card Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">Card Number</label>
                          <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs font-medium text-gray-700 block mb-1">Expiry</label><input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" /></div>
                          <div><label className="text-xs font-medium text-gray-700 block mb-1">CVC</label><input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" /></div>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3 text-green-500" /> Secured by Stripe — we never see your card details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(selectedMethod === 'apple_pay' || selectedMethod === 'google_pay') && (
                  <Card className="mt-4">
                    <CardContent className="p-5 text-center py-4">
                      <p className="text-gray-600 mb-4">Click below to pay with {selectedMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}</p>
                      <Button className="w-full bg-black text-white rounded-xl py-6 text-lg font-semibold">
                        {selectedMethod === 'apple_pay' ? '🍎 Pay with Apple Pay' : '🔵 Pay with Google Pay'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {(selectedMethod === 'paypal' || selectedMethod === 'venmo') && (
                  <Card className="mt-4">
                    <CardContent className="p-5 text-center py-4">
                      <p className="text-gray-600 mb-4">You'll be redirected to {selectedMethod === 'paypal' ? 'PayPal' : 'Venmo'} to complete payment.</p>
                    </CardContent>
                  </Card>
                )}

                {selectedMethod === 'zelle' && (
                  <Card className="mt-4">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Send via Zelle</h3>
                      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500">Send to:</div>
                            <div className="font-mono font-bold text-blue-700">{zelleInfo.recipientEmail}</div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={() => copyToClipboard(zelleInfo.recipientEmail)}>
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Amount:</div>
                          <div className="font-bold text-2xl text-gray-900">${grandTotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedMethod === 'cashapp' && (
                  <Card className="mt-4">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Send via Cash App</h3>
                      <div className="bg-green-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500">Send to:</div>
                            <div className="font-mono font-bold text-green-700 text-xl">{cashAppInfo.cashtag}</div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={() => copyToClipboard(cashAppInfo.cashtag)}>
                            <Copy className="w-3 h-3" /> Copy
                          </Button>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Amount:</div>
                          <div className="font-bold text-2xl text-gray-900">${grandTotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(selectedMethod === 'affirm' || selectedMethod === 'klarna') && (
                  <Card className="mt-4">
                    <CardContent className="p-5 text-center py-4">
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        {selectedMethod === 'klarna' && (
                          <div className="grid grid-cols-4 gap-2 text-center">
                            {[1, 2, 3, 4].map(n => (
                              <div key={n}>
                                <div className="text-xs text-gray-500">Payment {n}</div>
                                <div className="font-bold text-gray-900">${(grandTotal / 4).toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedMethod === 'affirm' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-gray-600">3 months</span><span className="font-bold">${(grandTotal / 3).toFixed(2)}/mo</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">6 months</span><span className="font-bold">${(grandTotal / 6).toFixed(2)}/mo</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">12 months</span><span className="font-bold">${(grandTotal / 12).toFixed(2)}/mo</span></div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="rounded-full" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button
                    className="flex-1 bg-blue-600 text-white rounded-full py-5 text-lg font-semibold gap-2"
                    disabled={!selectedMethod}
                    onClick={nextStep}
                  >
                    <Lock className="w-4 h-4" /> Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* CONFIRM */}
            {step === 'confirm' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Review Your Order</h2>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-gray-900">Contact</span><button className="text-xs text-blue-600" onClick={() => setStep('contact')}>Edit</button></div>
                      <p className="text-sm text-gray-600">{form.firstName} {form.lastName}</p>
                      <p className="text-sm text-gray-500">{form.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-gray-900">Ship to</span><button className="text-xs text-blue-600" onClick={() => setStep('shipping')}>Edit</button></div>
                      <p className="text-sm text-gray-600">{form.address1}{form.address2 ? `, ${form.address2}` : ''}, {form.city}, {form.state} {form.zip}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-gray-900">Payment</span><button className="text-xs text-blue-600" onClick={() => setStep('payment')}>Edit</button></div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedConfig?.icon}</span>
                        <span className="text-sm text-gray-600">{selectedConfig?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="rounded-full" onClick={prevStep}>Back</Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-lg font-bold gap-2"
                      disabled={placing}
                      onClick={handlePlaceOrder}
                    >
                      {placing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Place Order — ${grandTotal.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Products ({windowCount} windows)</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                  {installTotal > 0 && <div className="flex justify-between"><span className="text-gray-500">Installation</span><span className="font-medium">${installTotal.toFixed(2)}</span></div>}
                  {designTotal > 0 && <div className="flex justify-between"><span className="text-gray-500">Design</span><span className="font-medium">${designTotal.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-medium text-green-600">FREE</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                  <div className="border-t pt-3 mt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-gray-400 mb-2">We accept:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PAYMENT_METHODS.filter(m => m.enabled).map(m => (
                      <span key={m.id} className="text-lg" title={m.name}>{m.icon}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Shield className="w-4 h-4 text-green-500" /> SSL encrypted</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Truck className="w-4 h-4 text-blue-500" /> Ships direct from manufacturer</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Package className="w-4 h-4 text-purple-500" /> Fit guarantee</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
