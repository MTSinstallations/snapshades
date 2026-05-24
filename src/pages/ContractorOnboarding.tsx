import { useNavigate } from 'react-router-dom';
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useEffect } from 'react';
import { Check, ChevronRight, ArrowLeft, MapPin, Shield, Upload, Clock, FileText, Building2, CreditCard, Calendar, UserCheck, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/lib/contractor-engine';

const STEP_ICONS: Record<OnboardingStep, React.ReactNode> = {
  account: <UserCheck className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
  w9: <FileText className="w-5 h-5" />,
  territory: <MapPin className="w-5 h-5" />,
  capabilities: <Shield className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />,
  banking: <CreditCard className="w-5 h-5" />,
  availability: <Calendar className="w-5 h-5" />,
  background: <UserCheck className="w-5 h-5" />,
  agreement: <Handshake className="w-5 h-5" />,
};

const SPECIALTIES = [
  { id: 'blinds', label: 'Blinds', emoji: '🪟' },
  { id: 'shades', label: 'Shades', emoji: '🌅' },
  { id: 'shutters', label: 'Plantation Shutters', emoji: '🏠' },
  { id: 'motorized', label: 'Motorized Systems', emoji: '⚡' },
  { id: 'specialty', label: 'Specialty Shapes', emoji: '🔶' },
];

const STATES_LIST = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

interface StateReqs {
  license_required: boolean;
  license_type: string | null;
  license_agency: string | null;
  license_url: string | null;
  workers_comp_required: boolean;
  workers_comp_exemption: string | null;
  bond_required: boolean;
  bond_amount: number | null;
  notes: string | null;
}

export default function ContractorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('account');
  const [completed, setCompleted] = useState<Set<OnboardingStep>>(new Set());
  const [stateReqs, setStateReqs] = useState<StateReqs | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    // Account
    email: '', password: '', phone: '',
    // Business
    firstName: '', lastName: '', businessName: '', businessType: 'sole_proprietor',
    ein: '', address: '', city: '', state: 'CA', zip: '',
    // W-9
    w9Name: '', w9BusinessName: '', w9TaxClass: 'individual', w9Tin: '', w9Signed: false,
    // Territory
    primaryZip: '', radiusMiles: 25, additionalZips: '',
    // Capabilities
    canMeasure: true, canInstall: true, canDesign: false,
    specialties: new Set<string>(), yearsExperience: '', hasLadder: true, hasVehicle: true,
    // Insurance
    hasGl: false, glExpiry: '', hasWc: false, wcExpiry: '', wcExempt: false,
    licenseNumber: '', licenseState: '',
    // Banking
    bankName: '', routingNumber: '', accountNumber: '', accountType: 'checking' as 'checking' | 'savings',
    accountHolderName: '', backupMethod: 'none', backupHandle: '',
    // Availability
    maxJobsPerDay: 4, notifyPref: 'both' as 'email' | 'sms' | 'both', autoAccept: false,
    // Background
    bgConsentName: '', bgConsentSigned: false,
    // Agreement
    icaSigned: false,
  });

  const u = (updates: Partial<typeof form>) => setForm(f => ({ ...f, ...updates }));
  const stepIdx = ONBOARDING_STEPS.findIndex(s => s.key === step);

  // Load state requirements when state changes
  useEffect(() => {
    if (form.state) {
      supabase.from('state_requirements').select('*').eq('state', form.state).single()
        .then(({ data }) => { if (data) setStateReqs(data as StateReqs); });
    }
  }, [form.state]);

  const goNext = () => {
    setCompleted(prev => new Set([...prev, step]));
    const next = ONBOARDING_STEPS[stepIdx + 1];
    if (next) setStep(next.key);
  };
  const goBack = () => {
    const prev = ONBOARDING_STEPS[stepIdx - 1];
    if (prev) setStep(prev.key);
  };

  const handleSubmit = async () => {
    // Validate required fields before submission
    if (!form.email || !form.password || form.password.length < 8) {
      toast({ title: 'Missing info', description: 'Email and password (8+ chars) required.', variant: 'destructive' }); return;
    }
    if (!form.firstName || !form.lastName) {
      toast({ title: 'Missing info', description: 'First and last name required.', variant: 'destructive' }); return;
    }
    if (!form.primaryZip || !/^\d{5}$/.test(form.primaryZip)) {
      toast({ title: 'Invalid ZIP', description: 'Enter a valid 5-digit primary ZIP code.', variant: 'destructive' }); return;
    }
    if (!form.routingNumber || form.routingNumber.length !== 9) {
      toast({ title: 'Invalid routing number', description: 'Routing number must be 9 digits.', variant: 'destructive' }); return;
    }
    if (!form.accountNumber || form.accountNumber.length < 4) {
      toast({ title: 'Invalid account number', description: 'Enter a valid bank account number.', variant: 'destructive' }); return;
    }
    if (!form.bgConsentSigned) {
      toast({ title: 'Consent required', description: 'Background check consent must be signed.', variant: 'destructive' }); return;
    }

    setSubmitting(true);

    // Create auth account
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: `${form.firstName} ${form.lastName}`, role: 'installer' } },
    });
    if (authErr) { setSubmitting(false); toast({ title: 'Error', description: authErr.message, variant: 'destructive' }); return; }

    const userId = authData.user?.id;
    if (!userId) { setSubmitting(false); toast({ title: 'Error', description: 'Account creation failed', variant: 'destructive' }); return; }

    // Create installer record
    const serviceZips = [form.primaryZip, ...form.additionalZips.split(/[,\s]+/).filter(z => /^\d{5}$/.test(z))];
    await supabase.from('installers').upsert({
      id: userId, email: form.email, full_name: `${form.firstName} ${form.lastName}`,
      phone: form.phone, company_name: form.businessName || null,
      service_zips: serviceZips, service_radius_miles: form.radiusMiles,
      insurance_verified: false, insurance_expiry: form.glExpiry || null,
      background_check: false, onboarded: true,
      status: 'pending',
    });

    // Create banking record
    await supabase.from('contractor_banking').upsert({
      installer_id: userId, bank_name: form.bankName,
      routing_number: form.routingNumber, account_number_last4: form.accountNumber.slice(-4),
      account_type: form.accountType, account_holder_name: form.accountHolderName,
      backup_method: form.backupMethod === 'none' ? null : form.backupMethod,
      backup_handle: form.backupHandle || null,
    });

    // Auto-link to active territories
    for (const zip of serviceZips) {
      const { data: terr } = await supabase.from('territories').select('zip').eq('zip', zip).eq('status', 'active').single();
      if (terr) {
        await supabase.from('territory_contractors').upsert(
          { zip, installer_id: userId, rank: 99, is_primary: false },
          { onConflict: 'zip,installer_id' }
        );
        await supabase.from('territories').update({ pro_install_available: true, status: 'active' }).eq('zip', zip);
      }
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Application Submitted! 🎉</h1>
          <p className="mt-3 text-gray-500">We'll review your info and verify documents within 1-2 business days.</p>
          <p className="mt-2 text-sm text-gray-400">Confirmation sent to <strong>{form.email}</strong></p>
          <Card className="mt-6 text-left">
            <CardContent className="p-5 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Profile created</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> W-9 submitted</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Banking set up</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Territory: {form.primaryZip} + {form.radiusMiles}mi</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Insurance verification pending</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Background check pending</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Agreement countersign pending</div>
            </CardContent>
          </Card>
          <Button className="mt-6 bg-blue-600 text-white rounded-full w-full py-5" onClick={() => navigate('/portal')}>
            Go to My Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <span className="text-sm text-gray-500">Contractor Setup</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {stepIdx + 1} of {ONBOARDING_STEPS.length}</span>
            <span className="text-sm text-gray-400">{Math.round(((stepIdx + 1) / ONBOARDING_STEPS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${((stepIdx + 1) / ONBOARDING_STEPS.length) * 100}%` }} />
          </div>
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {ONBOARDING_STEPS.map((s, i) => (
              <button key={s.key} onClick={() => (completed.has(s.key) || i <= stepIdx) && setStep(s.key)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                  s.key === step ? 'bg-blue-600 text-white' : completed.has(s.key) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                {completed.has(s.key) && <Check className="w-3 h-3 inline mr-0.5" />}{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 1: Account ── */}
        {step === 'account' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create Your Account</h2>
            <p className="text-sm text-gray-500 mb-6">This will be your login for the contractor portal.</p>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => u({ email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => u({ password: e.target.value })} minLength={8} placeholder="Minimum 8 characters" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => u({ phone: e.target.value })} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 2: Business Info ── */}
        {step === 'business' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Business Information</h2>
            <p className="text-sm text-gray-500 mb-6">Legal info for tax and compliance purposes.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => u({ firstName: e.target.value, w9Name: `${e.target.value} ${form.lastName}` })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={e => u({ lastName: e.target.value, w9Name: `${form.firstName} ${e.target.value}` })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Business Name (if applicable)</label>
                <input type="text" value={form.businessName} onChange={e => u({ businessName: e.target.value, w9BusinessName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Business Type *</label>
                <select value={form.businessType} onChange={e => u({ businessType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                  <option value="sole_proprietor">Sole Proprietor</option>
                  <option value="llc_single">LLC (Single Member)</option>
                  <option value="llc_multi">LLC (Multi Member)</option>
                  <option value="s_corp">S Corporation</option>
                  <option value="c_corp">C Corporation</option>
                  <option value="partnership">Partnership</option>
                </select></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">EIN or SSN *</label>
                <input type="text" value={form.ein} onChange={e => u({ ein: e.target.value, w9Tin: e.target.value })} placeholder="XX-XXXXXXX or XXX-XX-XXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" />
                <p className="text-xs text-gray-400 mt-1">EIN for businesses, SSN for sole proprietors</p></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Address *</label>
                <input type="text" value={form.address} onChange={e => u({ address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                  <input type="text" value={form.city} onChange={e => u({ city: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                  <select value={form.state} onChange={e => u({ state: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                    {STATES_LIST.map(s => <option key={s}>{s}</option>)}
                  </select></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">ZIP</label>
                  <input type="text" value={form.zip} onChange={e => u({ zip: e.target.value })} maxLength={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              </div>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 3: W-9 ── */}
        {step === 'w9' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">📄 W-9 Tax Form</h2>
            <p className="text-sm text-gray-500 mb-6">Required by the IRS for 1099-NEC reporting. Pre-filled from your business info.</p>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                This is a digital W-9. By signing below, you certify the information is correct under penalty of perjury.
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Name (as shown on tax return) *</label>
                <input type="text" value={form.w9Name} onChange={e => u({ w9Name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Business Name (if different)</label>
                <input type="text" value={form.w9BusinessName} onChange={e => u({ w9BusinessName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Tax Classification *</label>
                <select value={form.w9TaxClass} onChange={e => u({ w9TaxClass: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                  <option value="individual">Individual / Sole Proprietor</option>
                  <option value="llc_c">LLC — C Corporation</option>
                  <option value="llc_s">LLC — S Corporation</option>
                  <option value="llc_p">LLC — Partnership</option>
                  <option value="c_corp">C Corporation</option>
                  <option value="s_corp">S Corporation</option>
                  <option value="partnership">Partnership</option>
                </select></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Taxpayer ID (SSN or EIN) *</label>
                <input type="text" value={form.w9Tin} onChange={e => u({ w9Tin: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" /></div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
                <p className="font-semibold mb-1">Address on file:</p>
                <p>{form.address}, {form.city}, {form.state} {form.zip}</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <input type="checkbox" checked={form.w9Signed} onChange={e => u({ w9Signed: e.target.checked })} className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">I certify under penalty of perjury that:</div>
                  <ol className="text-xs text-gray-600 mt-1 space-y-0.5 list-decimal list-inside">
                    <li>The number shown is my correct taxpayer identification number</li>
                    <li>I am not subject to backup withholding</li>
                    <li>I am a U.S. citizen or U.S. resident alien</li>
                  </ol>
                </div>
              </label>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 4: Territory ── */}
        {step === 'territory' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🗺️ Service Territory</h2>
            <p className="text-sm text-gray-500 mb-6">We only send you jobs in your area.</p>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Primary ZIP Code *</label>
                <input type="text" maxLength={5} value={form.primaryZip} onChange={e => u({ primaryZip: e.target.value.replace(/\D/g, '').slice(0, 5) })} placeholder="90210" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-lg font-mono" /></div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Service Radius: <span className="text-blue-600">{form.radiusMiles} miles</span></label>
                <input type="range" min={5} max={75} step={5} value={form.radiusMiles} onChange={e => u({ radiusMiles: Number(e.target.value) })} className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>5 mi</span><span>25 mi</span><span>50 mi</span><span>75 mi</span></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Additional ZIPs (optional)</label>
                <textarea value={form.additionalZips} onChange={e => u({ additionalZips: e.target.value })} placeholder="Comma-separated ZIPs outside your radius" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm resize-none" /></div>
              <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center text-gray-400"><MapPin className="w-6 h-6 mx-auto mb-1" /><p className="text-xs">{form.radiusMiles}-mile radius from {form.primaryZip || '...'}</p></div>
              </div>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 5: Skills ── */}
        {step === 'capabilities' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🔧 Skills & Services</h2>
            <p className="text-sm text-gray-500 mb-6">Tell us what you can do.</p>
            <div className="space-y-5">
              <div className="space-y-2">
                {[
                  { key: 'canMeasure', label: 'Professional Measuring', icon: '📏' },
                  { key: 'canInstall', label: 'Installation', icon: '🔧' },
                  { key: 'canDesign', label: 'Design Consultation', icon: '🎨' },
                ].map(s => (
                  <button key={s.key} onClick={() => u({ [s.key]: !form[s.key as keyof typeof form] })}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${form[s.key as keyof typeof form] ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-medium text-gray-900 flex-1">{s.label}</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${form[s.key as keyof typeof form] ? 'bg-blue-600' : 'bg-gray-100'}`}>
                      {form[s.key as keyof typeof form] && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              <h3 className="font-semibold text-gray-900">Product Specialties</h3>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALTIES.map(s => (
                  <button key={s.id} onClick={() => { const n = new Set(form.specialties); if (n.has(s.id)) { n.delete(s.id); } else { n.add(s.id); } u({ specialties: n }); }}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm ${form.specialties.has(s.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600'}`}>
                    <span>{s.emoji}</span><span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Years of Experience</label>
                  <select value={form.yearsExperience} onChange={e => u({ yearsExperience: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                    <option value="">Select...</option><option>Less than 1</option><option>1-3 years</option><option>3-5 years</option><option>5-10 years</option><option>10+ years</option>
                  </select></div>
                <div className="space-y-2 pt-6">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasLadder} onChange={e => u({ hasLadder: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm">Can do ladder/2nd story</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasVehicle} onChange={e => u({ hasVehicle: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm">Have work vehicle</span></label>
                </div>
              </div>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 6: Insurance & License ── */}
        {step === 'insurance' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🛡️ Insurance & Licensing</h2>
            <p className="text-sm text-gray-500 mb-6">Requirements based on your state ({form.state}).</p>

            {stateReqs && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
                <p className="font-semibold">{form.state} Requirements:</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>• General Liability: <strong>Required</strong> ($1M minimum)</li>
                  <li>• Workers' Comp: {stateReqs.workers_comp_required ? <strong>Required</strong> : 'Not required'}{stateReqs.workers_comp_exemption && ` (${stateReqs.workers_comp_exemption})`}</li>
                  <li>• Contractor License: {stateReqs.license_required ? <><strong>Required</strong> — {stateReqs.license_type}</> : 'Not required for window coverings'}</li>
                  {stateReqs.bond_required && <li>• Surety Bond: <strong>Required</strong> — ${stateReqs.bond_amount?.toLocaleString()}</li>}
                  {stateReqs.notes && <li>• Note: {stateReqs.notes}</li>}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              {/* GL Insurance */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> General Liability Insurance *</h3>
                <label className="flex items-center gap-3 mb-3"><input type="checkbox" checked={form.hasGl} onChange={e => u({ hasGl: e.target.checked })} className="w-5 h-5 rounded" /><span className="text-sm">I have GL insurance ($1M+ coverage)</span></label>
                {form.hasGl && (
                  <div className="space-y-3">
                    <div><label className="text-xs text-gray-500 block mb-1">Policy Expiry</label>
                      <input type="date" value={form.glExpiry} onChange={e => u({ glExpiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 text-center cursor-pointer hover:bg-gray-100">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" /><p className="text-sm text-gray-500">Upload Certificate of Insurance</p><p className="text-xs text-gray-400">PDF, JPG, PNG — max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Workers Comp */}
              {stateReqs?.workers_comp_required && (
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Workers' Compensation</h3>
                  {stateReqs.workers_comp_exemption && (
                    <label className="flex items-center gap-3 mb-3"><input type="checkbox" checked={form.wcExempt} onChange={e => u({ wcExempt: e.target.checked })} className="w-5 h-5 rounded" /><span className="text-sm">I am exempt ({stateReqs.workers_comp_exemption})</span></label>
                  )}
                  {!form.wcExempt && (
                    <>
                      <label className="flex items-center gap-3 mb-3"><input type="checkbox" checked={form.hasWc} onChange={e => u({ hasWc: e.target.checked })} className="w-5 h-5 rounded" /><span className="text-sm">I have Workers' Comp insurance</span></label>
                      {form.hasWc && (
                        <div><label className="text-xs text-gray-500 block mb-1">Policy Expiry</label>
                          <input type="date" value={form.wcExpiry} onChange={e => u({ wcExpiry: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* State License */}
              {stateReqs?.license_required && (
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">State Contractor License — {stateReqs.license_type}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500 block mb-1">License Number</label>
                      <input type="text" value={form.licenseNumber} onChange={e => u({ licenseNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">State</label>
                      <input type="text" value={form.state} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
                  </div>
                  {stateReqs.license_url && (
                    <p className="text-xs text-blue-600 mt-2">Apply: <a href={stateReqs.license_url} target="_blank" rel="noreferrer" className="underline">{stateReqs.license_agency}</a></p>
                  )}
                </div>
              )}
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 7: Banking ── */}
        {step === 'banking' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🏦 Payment Setup</h2>
            <p className="text-sm text-gray-500 mb-6">ACH direct deposit every Friday (net-7).</p>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Account Holder Name *</label>
                <input type="text" value={form.accountHolderName} onChange={e => u({ accountHolderName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Bank Name *</label>
                <input type="text" value={form.bankName} onChange={e => u({ bankName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Routing Number *</label>
                  <input type="text" value={form.routingNumber} onChange={e => u({ routingNumber: e.target.value })} maxLength={9} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Account Number *</label>
                  <input type="text" value={form.accountNumber} onChange={e => u({ accountNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" /></div>
              </div>
              <div className="flex gap-3">
                {(['checking', 'savings'] as const).map(t => (
                  <button key={t} onClick={() => u({ accountType: t })} className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${form.accountType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 text-center cursor-pointer hover:bg-gray-100">
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" /><p className="text-sm text-gray-500">Upload voided check (optional)</p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Backup Payment Method (optional)</h3>
                <div className="flex gap-2">
                  {['none', 'paypal', 'venmo', 'zelle'].map(m => (
                    <button key={m} onClick={() => u({ backupMethod: m })} className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${form.backupMethod === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500'}`}>
                      {m === 'none' ? 'None' : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
                {form.backupMethod !== 'none' && (
                  <input type="text" value={form.backupHandle} onChange={e => u({ backupHandle: e.target.value })} placeholder={form.backupMethod === 'paypal' ? 'PayPal email' : form.backupMethod === 'venmo' ? '@username' : 'Email or phone'} className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Shield className="w-4 h-4 text-green-500" /> Bank details are encrypted with AES-256. Same security as major banks.</div>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 8: Availability ── */}
        {step === 'availability' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">📅 Availability</h2>
            <p className="text-sm text-gray-500 mb-6">Set your defaults. Fine-tune in the portal calendar later.</p>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-2">Max Jobs Per Day: <span className="text-blue-600 font-bold">{form.maxJobsPerDay}</span></label>
                <input type="range" min={1} max={8} value={form.maxJobsPerDay} onChange={e => u({ maxJobsPerDay: Number(e.target.value) })} className="w-full accent-blue-600" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-2">Notifications</label>
                <div className="flex gap-2">
                  {[{ v: 'email', l: '📧 Email' }, { v: 'sms', l: '📱 SMS' }, { v: 'both', l: '📧📱 Both' }].map(o => (
                    <button key={o.v} onClick={() => u({ notifyPref: o.v as 'email'|'sms'|'both' })} className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 ${form.notifyPref === o.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500'}`}>{o.l}</button>
                  ))}
                </div></div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={form.autoAccept} onChange={e => u({ autoAccept: e.target.checked })} className="w-5 h-5 rounded" />
                <div><div className="text-sm font-medium">Auto-accept jobs</div><div className="text-xs text-gray-500">Automatically accept jobs in your availability. Cancel within 2 hours.</div></div>
              </label>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 9: Background Check ── */}
        {step === 'background' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🔍 Background Check</h2>
            <p className="text-sm text-gray-500 mb-6">Required for customer safety. Free and typically takes 2-3 business days.</p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 space-y-2">
                <p>SnapShades & Shutters conducts a standard background check on all contractors. This includes:</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                  <li>Criminal history (county, state, federal)</li>
                  <li>Sex offender registry</li>
                  <li>Identity verification</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Results are confidential and used solely for contractor eligibility. You will be notified of the outcome.</p>
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Full Legal Name (as it appears on ID) *</label>
                <input type="text" value={form.bgConsentName} onChange={e => u({ bgConsentName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" /></div>
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <input type="checkbox" checked={form.bgConsentSigned} onChange={e => u({ bgConsentSigned: e.target.checked })} className="w-5 h-5 mt-0.5 rounded" />
                <div className="text-sm"><div className="font-medium text-gray-900">I authorize SnapShades & Shutters to conduct a background check</div>
                  <p className="text-xs text-gray-600 mt-1">I understand this is a condition of the contractor relationship and I consent to the release of information.</p></div>
              </label>
            </div>
          </CardContent></Card>
        )}

        {/* ── Step 10: Agreement ── */}
        {step === 'agreement' && (
          <Card><CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">🤝 Independent Contractor Agreement</h2>
            <p className="text-sm text-gray-500 mb-6">Review and sign to complete your application.</p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 max-h-64 overflow-y-auto text-xs text-gray-600 space-y-3">
                <p className="font-bold text-gray-900 text-sm">INDEPENDENT CONTRACTOR AGREEMENT</p>
                <p>This Agreement is between SnapShades & Shutters ("Company") and {form.firstName} {form.lastName}{form.businessName ? ` d/b/a ${form.businessName}` : ''} ("Contractor").</p>
                <p><strong>1. Services.</strong> Contractor will provide window covering measurement, installation, and/or design consultation services as assigned through the Company's platform.</p>
                <p><strong>2. Independent Contractor Status.</strong> Contractor is an independent contractor, not an employee. Contractor controls the manner and means of performing services.</p>
                <p><strong>3. Payment.</strong> Company pays weekly via ACH direct deposit, net-7. Platform fee of 10% applies to all jobs. Contractor is responsible for all taxes.</p>
                <p><strong>4. Insurance.</strong> Contractor must maintain General Liability insurance ($1M minimum) and any state-required licenses/insurance at all times.</p>
                <p><strong>5. Term.</strong> This agreement is at-will and may be terminated by either party with written notice.</p>
                <p><strong>6. Non-Solicitation.</strong> During engagement and 12 months after, Contractor will not directly solicit Company customers for competing services.</p>
                <p><strong>7. Indemnification.</strong> Contractor indemnifies Company against claims arising from Contractor's work, negligence, or breach of this agreement.</p>
                <p><strong>8. Confidentiality.</strong> Contractor will not disclose customer information, pricing, or business practices to third parties.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Application Summary</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                  <div>Name: <strong>{form.firstName} {form.lastName}</strong></div>
                  <div>Business: <strong>{form.businessName || '—'}</strong></div>
                  <div>Email: <strong>{form.email}</strong></div>
                  <div>Phone: <strong>{form.phone}</strong></div>
                  <div>Territory: <strong>{form.primaryZip} + {form.radiusMiles}mi</strong></div>
                  <div>State: <strong>{form.state}</strong></div>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-green-50 rounded-xl border border-green-200">
                <input type="checkbox" checked={form.icaSigned} onChange={e => u({ icaSigned: e.target.checked })} className="w-5 h-5 mt-0.5 rounded" />
                <div className="text-sm"><div className="font-medium text-gray-900">I have read and agree to the Independent Contractor Agreement</div>
                  <p className="text-xs text-gray-600 mt-1">Electronic signature: {form.firstName} {form.lastName} — {new Date().toLocaleDateString()}</p></div>
              </label>
            </div>
          </CardContent></Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {stepIdx > 0 && (
            <Button variant="outline" className="rounded-full py-5" onClick={goBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          )}
          {step === 'agreement' ? (
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-5 text-lg font-bold gap-2" disabled={!form.icaSigned || submitting} onClick={handleSubmit}>
              {submitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Submitting...</> : <><Check className="w-5 h-5" /> Submit Application</>}
            </Button>
          ) : (
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-5 text-lg font-semibold gap-2" onClick={goNext}>
              Continue <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
