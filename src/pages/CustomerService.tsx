import { useState } from 'react';
import { Search, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Shield, Package, Truck, Ruler, Wrench, AlertTriangle, X, Camera as CameraIcon, Upload, Check, Clock, ArrowRight, FileText, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SnapShadesLogo from '@/components/SnapShadesLogo';
import { SNAPSHADES_POLICIES, MANUFACTURER_WARRANTIES, getWarrantyForProduct, type PolicySection, type ManufacturerWarranty } from '@/lib/warranty-info';
import { WARRANTY_POLICY, INSTALL_GUIDES, type InstallGuide } from '@/lib/warranty-returns-engine';

type Tab = 'help' | 'warranty' | 'claims' | 'guides' | 'contact';

export default function CustomerService() {
  const [tab, setTab] = useState<Tab>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>('inspection');
  const [expandedWarranty, setExpandedWarranty] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  // Claim form
  const [claimStep, setClaimStep] = useState<'select' | 'details' | 'photos' | 'submitted'>('select');
  const [claimOrder, setClaimOrder] = useState('');
  const [claimType, setClaimType] = useState('');
  const [claimDescription, setClaimDescription] = useState('');

  const tabs = [
    { key: 'help' as Tab, icon: HelpCircle, label: 'Help Center' },
    { key: 'warranty' as Tab, icon: Shield, label: 'Warranty' },
    { key: 'claims' as Tab, icon: AlertTriangle, label: 'File a Claim' },
    { key: 'guides' as Tab, icon: FileText, label: 'Install Guides' },
    { key: 'contact' as Tab, icon: Phone, label: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <span className="text-sm text-gray-500">Customer Service</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">How Can We Help?</h1>
          <p className="mt-2 text-blue-100">Find answers, file claims, check warranty, or get in touch.</p>
          <div className="mt-6 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for help (e.g., 'damaged blind', 'install guide', 'warranty')"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 outline-none focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab nav */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* HELP CENTER */}
        {tab === 'help' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Policies & Information</h2>
            <div className="space-y-3">
              {SNAPSHADES_POLICIES.map(policy => (
                <Card key={policy.id}>
                  <button
                    onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{policy.icon}</span>
                      <span className="font-semibold text-gray-900">{policy.title}</span>
                    </div>
                    {expandedPolicy === policy.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {expandedPolicy === policy.id && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-gray-600 mb-3">{policy.content}</p>
                      {policy.bullets && (
                        <ul className="space-y-2">
                          {policy.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Quick action cards */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setTab('claims')}>
                <CardContent className="p-5 text-center">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Report Damage</h3>
                  <p className="text-xs text-gray-500 mt-1">File a claim for damaged or defective products</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setTab('guides')}>
                <CardContent className="p-5 text-center">
                  <Wrench className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Install Guides</h3>
                  <p className="text-xs text-gray-500 mt-1">Step-by-step instructions for every product</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setTab('warranty')}>
                <CardContent className="p-5 text-center">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Warranty Info</h3>
                  <p className="text-xs text-gray-500 mt-1">Coverage details by manufacturer</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* WARRANTY */}
        {tab === 'warranty' && (
          <div>
            {/* 30-day banner */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900 text-lg">⚠️ 30-Day Inspection Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You MUST inspect your products within <strong>30 days of delivery</strong> and report any damage or defects.
                    After 30 days, shipping damage claims cannot be processed. Keep all original packaging until confirmed.
                  </p>
                  <Button className="mt-3 bg-red-600 text-white rounded-full gap-1" onClick={() => setTab('claims')}>
                    <AlertTriangle className="w-4 h-4" /> Report an Issue Now
                  </Button>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Manufacturer Warranties</h2>
            {MANUFACTURER_WARRANTIES.map(warranty => (
              <Card key={warranty.manufacturer} className="mb-4">
                <button
                  onClick={() => setExpandedWarranty(expandedWarranty === warranty.manufacturer ? null : warranty.manufacturer)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{warranty.manufacturer}</h3>
                    <p className="text-sm text-blue-600">{warranty.warrantyName} — {warranty.duration}</p>
                  </div>
                  {expandedWarranty === warranty.manufacturer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedWarranty === warranty.manufacturer && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-600 mb-4">{warranty.coverageSummary}</p>
                    
                    <h4 className="font-semibold text-green-800 mb-2">✅ What's Covered:</h4>
                    <ul className="space-y-1.5 mb-4">
                      {warranty.covers.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-semibold text-red-800 mb-2">❌ What's NOT Covered:</h4>
                    <ul className="space-y-1.5 mb-4">
                      {warranty.doesNotCover.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">📋 Claim Process:</h4>
                    <ol className="space-y-2">
                      {warranty.claimProcess.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* FILE A CLAIM */}
        {tab === 'claims' && (
          <div className="max-w-2xl mx-auto">
            {claimStep === 'submitted' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Claim Submitted</h2>
                <p className="mt-2 text-gray-500">We'll review your claim within 24-48 hours and contact you at the email on file.</p>
                <p className="mt-1 text-sm text-gray-400">Reference: CLM-{Date.now().toString().slice(-6)}</p>
                <Button className="mt-6 bg-blue-600 text-white rounded-full" onClick={() => { setClaimStep('select'); setClaimOrder(''); setClaimType(''); setClaimDescription(''); }}>
                  Submit Another Claim
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2">File a Warranty Claim</h2>
                <p className="text-sm text-gray-500 mb-6">Report damaged, defective, or incorrect products. We'll handle everything.</p>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                  {['Order Info', 'Details', 'Photos'].map((label, i) => {
                    const stepKeys = ['select', 'details', 'photos'];
                    const current = stepKeys.indexOf(claimStep);
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          i < current ? 'bg-green-500 text-white' : i === current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span className="text-xs text-gray-500">{label}</span>
                        {i < 2 && <div className="w-8 h-px bg-gray-300" />}
                      </div>
                    );
                  })}
                </div>

                {claimStep === 'select' && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Order Number *</label>
                          <input type="text" value={claimOrder} onChange={e => setClaimOrder(e.target.value)} placeholder="SS-010001" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none font-mono" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">What's the issue? *</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'damaged', label: '💥 Shipping Damage', desc: 'Arrived broken or bent' },
                              { value: 'defective', label: '⚙️ Defective Product', desc: 'Doesn\'t work properly' },
                              { value: 'wrong_product', label: '❌ Wrong Product', desc: 'Received wrong item' },
                              { value: 'wrong_size', label: '📏 Wrong Size', desc: 'Doesn\'t fit the window' },
                              { value: 'wrong_color', label: '🎨 Wrong Color', desc: 'Color doesn\'t match order' },
                              { value: 'missing_parts', label: '🔩 Missing Parts', desc: 'Hardware or parts missing' },
                            ].map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => setClaimType(opt.value)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${
                                  claimType === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                                }`}
                              >
                                <div className="font-medium text-sm">{opt.label}</div>
                                <div className="text-xs text-gray-500">{opt.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button className="w-full mt-6 bg-blue-600 text-white rounded-full py-5" disabled={!claimOrder || !claimType} onClick={() => setClaimStep('details')}>
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {claimStep === 'details' && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Describe the issue *</label>
                          <textarea value={claimDescription} onChange={e => setClaimDescription(e.target.value)} rows={4} placeholder="Please describe what's wrong in detail. Which window(s) are affected? What does the damage look like?" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none resize-none" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Which windows are affected?</label>
                          <input type="text" placeholder="e.g., Living Room Window 1, Master Bedroom Window 2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="rounded-full" onClick={() => setClaimStep('select')}>Back</Button>
                        <Button className="flex-1 bg-blue-600 text-white rounded-full py-5" disabled={!claimDescription} onClick={() => setClaimStep('photos')}>
                          Continue to Photos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {claimStep === 'photos' && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Upload Photos *</h3>
                      <p className="text-sm text-gray-500 mb-4">Clear photos help us process your claim faster. Show the damage/issue clearly.</p>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">Drag photos here or tap to upload</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG — up to 10MB each, 5 photos max</p>
                        <input type="file" accept="image/*" multiple className="hidden" />
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 mt-4">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">📸 Photo tips for faster resolution:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Show the full product with damage visible</li>
                          <li>• Close-up of the specific issue</li>
                          <li>• Photo of the shipping box (if shipping damage)</li>
                          <li>• Photo of the product label/tag</li>
                          <li>• Good lighting, in focus</li>
                        </ul>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="rounded-full" onClick={() => setClaimStep('details')}>Back</Button>
                        <Button className="flex-1 bg-green-600 text-white rounded-full py-5 text-lg font-bold gap-2" onClick={() => setClaimStep('submitted')}>
                          <Check className="w-5 h-5" /> Submit Claim
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* INSTALL GUIDES */}
        {tab === 'guides' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Installation Guides</h2>
            <div className="space-y-4">
              {INSTALL_GUIDES.map(guide => (
                <Card key={guide.productType}>
                  <button
                    onClick={() => setExpandedGuide(expandedGuide === guide.productType ? null : guide.productType)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span>⏱ {guide.estimatedTime}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            guide.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            guide.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {guide.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedGuide === guide.productType ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  {expandedGuide === guide.productType && (
                    <div className="px-5 pb-5">
                      {/* Tools */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">🧰 Tools Required:</h4>
                        <div className="flex flex-wrap gap-2">
                          {guide.toolsRequired.map(tool => (
                            <span key={tool} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-700">{tool}</span>
                          ))}
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="space-y-4">
                        {guide.steps.map(step => (
                          <div key={step.step} className="flex gap-4">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step.step}</div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{step.title}</h5>
                              <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                              {step.tip && (
                                <div className="bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2 mt-2">
                                  💡 <strong>Tip:</strong> {step.tip}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Warnings */}
                      {guide.warnings.length > 0 && (
                        <div className="mt-4 bg-red-50 rounded-xl p-4">
                          <h4 className="font-medium text-red-900 text-sm mb-2">⚠️ Safety Warnings:</h4>
                          <ul className="space-y-1">
                            {guide.warnings.map((w, i) => (
                              <li key={i} className="text-xs text-red-700">{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Common mistakes */}
                      <div className="mt-4 bg-yellow-50 rounded-xl p-4">
                        <h4 className="font-medium text-yellow-900 text-sm mb-2">❌ Common Mistakes:</h4>
                        <ul className="space-y-1">
                          {guide.commonMistakes.map((m, i) => (
                            <li key={i} className="text-xs text-yellow-800">• {m}</li>
                          ))}
                        </ul>
                      </div>

                      {guide.videoUrl && (
                        <Button variant="outline" className="mt-4 rounded-full gap-2" onClick={() => window.open(guide.videoUrl, '_blank')}>
                          ▶️ Watch Video Guide <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT */}
        {tab === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-5 text-center">
                  <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">AI Chat Support</h3>
                  <span className="text-gray-500 text-sm mt-1 block">Coming soon</span>
                  <p className="text-xs text-gray-400 mt-1">Use email for now</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:support@snapshades.com" className="text-blue-600 text-sm mt-1 block">support@snapshades.com</a>
                  <p className="text-xs text-gray-400 mt-1">Response within 24 hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Live Chat</h3>
                  <p className="text-sm text-gray-600 mt-1">AI assistant available 24/7</p>
                  <p className="text-xs text-gray-400 mt-1">Human agents during business hours</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Send Us a Message</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm text-gray-700 block mb-1">Name</label><input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" /></div>
                    <div><label className="text-sm text-gray-700 block mb-1">Email</label><input type="email" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" /></div>
                  </div>
                  <div><label className="text-sm text-gray-700 block mb-1">Order Number (optional)</label><input type="text" placeholder="SS-010001" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" /></div>
                  <div><label className="text-sm text-gray-700 block mb-1">Message</label><textarea rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none resize-none" /></div>
                  <Button className="w-full bg-blue-600 text-white rounded-full py-5 font-semibold">Send Message</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
