import { useNavigate } from 'react-router-dom';
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useMemo } from 'react';
import { Camera, Calendar, Clock, ChevronLeft, ChevronRight, Check, Video, Palette, DollarSign, Star, ArrowRight, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  getAvailableDesignSlots, generateDemoDesignerAvailability,
  DEMO_DESIGNERS, CUSTOMER_RATE_PER_HOUR, SESSION_DURATION_MINUTES,
  type AvailableDesignSlot, type ConsultationSlot,
} from '@/lib/designer-engine';

export default function BookDesigner() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'calendar' | 'details' | 'confirm'>('info');
  const [selectedSlot, setSelectedSlot] = useState<AvailableDesignSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [projectInfo, setProjectInfo] = useState({ rooms: '', windowCount: '', budget: '', style: '', concerns: '' });
  const [booked, setBooked] = useState(false);
  const [meetLink] = useState(`https://meet.google.com/abc-defg-hij`);

  const availability = useMemo(() => generateDemoDesignerAvailability(), []);
  const calendar = useMemo(() => getAvailableDesignSlots(DEMO_DESIGNERS, availability, []), [availability]);

  const startIdx = weekOffset * 5; // 5 days per week (Mon-Fri)
  const visibleDays = calendar.slice(startIdx, startIdx + 5);
  const hasNext = calendar.length > startIdx + 5;
  const hasPrev = weekOffset > 0;

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Consultation Booked! 🎨</h1>
          <p className="mt-2 text-gray-500">Your design consultation is confirmed.</p>

          <Card className="mt-6 text-left">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-bold text-gray-900">
                    {selectedSlot && new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-500">{selectedSlot?.slot} — 60 minutes</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Google Meet</div>
                  <a href={meetLink} className="text-sm text-blue-600 hover:underline break-all">{meetLink}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div className="text-sm text-gray-600">${CUSTOMER_RATE_PER_HOUR}.00 — charged after consultation</div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 bg-blue-50 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">How to prepare:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>📸 Have photos of your windows ready</li>
              <li>🎨 Think about colors and styles you like</li>
              <li>💡 Note any concerns (light, privacy, energy)</li>
              <li>💻 Join the Meet link 5 minutes early</li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Confirmation sent to {customerInfo.email}. Need to reschedule? Email support@snapshades.com at least 24 hours before.
          </p>

          <Button className="mt-6 bg-blue-600 text-white rounded-full w-full py-5" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={28} />
            <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Palette className="w-4 h-4" /> Design Consultation
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 rounded-full px-4 py-2 text-sm font-medium mb-3">
            <Video className="w-4 h-4" /> Remote via Google Meet
          </div>
          <h1 className="text-3xl font-bold text-gray-900">1-on-1 Design Consultation</h1>
          <p className="mt-2 text-gray-500 max-w-lg mx-auto">
            Get personalized window treatment recommendations from a certified interior designer. 
            60-minute video call — no travel needed.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><Clock className="w-4 h-4 text-blue-500" /> 60 minutes</span>
            <span className="flex items-center gap-1.5 text-gray-600"><DollarSign className="w-4 h-4 text-green-500" /> ${CUSTOMER_RATE_PER_HOUR}/session</span>
            <span className="flex items-center gap-1.5 text-gray-600"><Monitor className="w-4 h-4 text-purple-500" /> Google Meet</span>
          </div>
        </div>

        {/* What's included */}
        <Card className="mb-8">
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-3">What You Get:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Personalized product recommendations',
                'Color & style coordination advice',
                'Room-by-room window treatment plan',
                'Budget optimization suggestions',
                'Light & privacy solutions',
                'Written recommendations saved to your project',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { key: 'info', label: 'Your Info' },
            { key: 'calendar', label: 'Pick a Time' },
            { key: 'details', label: 'Project Details' },
            { key: 'confirm', label: 'Confirm' },
          ].map((s, i) => {
            const steps = ['info', 'calendar', 'details', 'confirm'];
            const current = steps.indexOf(step);
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < current ? 'bg-green-500 text-white' : i === current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${i === current ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s.label}</span>
                {i < 3 && <div className="w-6 h-px bg-gray-300" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Contact Info */}
        {step === 'info' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                  <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo(c => ({ ...c, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo(c => ({ ...c, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                  <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo(c => ({ ...c, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none" />
                </div>
              </div>
              <Button className="w-full mt-6 bg-blue-600 text-white rounded-full py-6 text-lg font-semibold" onClick={() => setStep('calendar')}>
                Pick a Time
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Calendar */}
        {step === 'calendar' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">Choose a Date & Time</h2>
            <p className="text-gray-500 text-center text-sm mb-6">All times shown in your local timezone</p>

            {/* Week nav */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" disabled={!hasPrev} onClick={() => setWeekOffset(w => w - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700">
                {visibleDays.length > 0 ? `${visibleDays[0].dateLabel} — ${visibleDays[visibleDays.length - 1].dateLabel}` : 'No availability'}
              </span>
              <Button variant="ghost" size="sm" disabled={!hasNext} onClick={() => setWeekOffset(w => w + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {visibleDays.map(day => (
                <Card key={day.date} className={selectedSlot?.date === day.date ? 'ring-2 ring-blue-300' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-gray-900">{day.dateLabel}</span>
                      <span className="text-xs text-gray-400">{day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map(slot => {
                        const isSelected = selectedSlot?.date === slot.date && selectedSlot?.slot === slot.slot;
                        return (
                          <button
                            key={`${slot.date}-${slot.slot}`}
                            onClick={() => setSelectedSlot(isSelected ? null : slot)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                            }`}
                          >
                            {slot.slot}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="rounded-full" onClick={() => setStep('info')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-blue-600 text-white rounded-full py-5 font-semibold" disabled={!selectedSlot} onClick={() => setStep('details')}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Project Details */}
        {step === 'details' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Tell Us About Your Project</h2>
              <p className="text-sm text-gray-500 mb-4">This helps your designer prepare. All fields optional.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Rooms</label>
                    <input type="text" value={projectInfo.rooms} onChange={e => setProjectInfo(p => ({ ...p, rooms: e.target.value }))} placeholder="Living room, bedroom" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">How Many Windows?</label>
                    <input type="text" value={projectInfo.windowCount} onChange={e => setProjectInfo(p => ({ ...p, windowCount: e.target.value }))} placeholder="5-10" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Budget Range</label>
                  <select value={projectInfo.budget} onChange={e => setProjectInfo(p => ({ ...p, budget: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm">
                    <option value="">Select...</option>
                    <option>Under $500</option>
                    <option>$500 - $1,000</option>
                    <option>$1,000 - $2,500</option>
                    <option>$2,500 - $5,000</option>
                    <option>$5,000+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Style Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {['Modern', 'Traditional', 'Farmhouse', 'Coastal', 'Minimalist', 'Luxury', 'Not Sure'].map(s => (
                      <button
                        key={s}
                        onClick={() => setProjectInfo(p => ({ ...p, style: p.style === s ? '' : s }))}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          projectInfo.style === s ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Any Specific Concerns?</label>
                  <textarea value={projectInfo.concerns} onChange={e => setProjectInfo(p => ({ ...p, concerns: e.target.value }))} placeholder="Too much sun, need privacy, energy efficiency, etc." rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('calendar')}>Back</Button>
                <Button className="flex-1 bg-blue-600 text-white rounded-full py-5 font-semibold" onClick={() => setStep('confirm')}>
                  Review Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && selectedSlot && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Your Consultation</h2>

              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-bold text-gray-900">
                      {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-500">{selectedSlot.slot} — 60 minutes via Google Meet</div>
                  </div>
                  <button onClick={() => setStep('calendar')} className="ml-auto text-sm text-blue-600">Change</button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">{customerInfo.name} • {customerInfo.email}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="text-xl font-bold text-gray-900">${CUSTOMER_RATE_PER_HOUR}.00</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('details')}>Back</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-lg font-bold gap-2" onClick={() => setBooked(true)}>
                  <Check className="w-5 h-5" /> Book Consultation — ${CUSTOMER_RATE_PER_HOUR}
                </Button>
              </div>

              <p className="mt-3 text-xs text-gray-400 text-center">
                Charged after your consultation. Free cancellation up to 24 hours before.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
