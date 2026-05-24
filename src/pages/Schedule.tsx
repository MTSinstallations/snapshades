import { useNavigate } from 'react-router-dom';
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState, useMemo } from 'react';
import { Camera, Calendar, Clock, ChevronLeft, ChevronRight, Check, MapPin, ArrowRight, Wrench, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAvailableCalendar, type ServiceType, type AvailableSlot, type CalendarDay } from '@/lib/scheduling-engine';

const SERVICE_OPTIONS: { type: ServiceType; icon: typeof Wrench; label: string; desc: string }[] = [
  { type: 'measure', icon: Ruler, label: 'Professional Measure', desc: 'A certified technician measures your windows on-site' },
  { type: 'install', icon: Wrench, label: 'Professional Installation', desc: 'Expert installation of your custom window treatments' },
  { type: 'measure_install', icon: Wrench, label: 'Measure + Install Bundle', desc: 'One visit for measuring, one for installation — save on scheduling' },
  { type: 'design', icon: Palette, label: 'Design Consultation', desc: 'In-home consultation with a certified interior designer' },
];

export default function Schedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'service' | 'zip' | 'calendar' | 'confirm'>('service');
  const [serviceType, setServiceType] = useState<ServiceType>('install');
  const [zip, setZip] = useState('90210');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [booked, setBooked] = useState(false);

  // Get 6 weeks of availability
  const calendar = useMemo(() => getAvailableCalendar(zip, serviceType), [zip, serviceType]);

  // Paginate by week
  const startIdx = weekOffset * 7;
  const visibleDays = calendar.slice(startIdx, startIdx + 7);
  const hasNextWeek = calendar.length > startIdx + 7;
  const hasPrevWeek = weekOffset > 0;

  // Group days into a nice week view
  const currentWeekLabel = visibleDays.length > 0
    ? `${visibleDays[0].dateLabel} — ${visibleDays[visibleDays.length - 1].dateLabel}`
    : 'No availability';

  const handleBook = () => {
    // In production: createBooking() + email notification
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Booked!</h1>
          <p className="mt-2 text-gray-500">
            Your {SERVICE_OPTIONS.find(s => s.type === serviceType)?.label.toLowerCase()} is confirmed for:
          </p>
          <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
              <Calendar className="w-5 h-5" />
              {selectedSlot?.date && new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1 text-gray-600">
              <Clock className="w-4 h-4" /> {selectedSlot?.slot}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            A confirmation email has been sent to {customerInfo.email}. Your technician will contact you 30 minutes before arrival.
          </p>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1 bg-blue-600 text-white rounded-full" onClick={() => navigate('/account/orders')}>
              View My Orders
            </Button>
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate('/')}>
              Home
            </Button>
          </div>
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
            <Calendar className="w-4 h-4" /> Schedule Service
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Service', 'Location', 'Date & Time', 'Confirm'].map((label, i) => {
            const stepKeys: typeof step[] = ['service', 'zip', 'calendar', 'confirm'];
            const current = stepKeys.indexOf(step);
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < current ? 'bg-green-500 text-white' :
                  i === current ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {i < current ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === current ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < 3 && <div className="w-6 h-px bg-gray-300" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Service type */}
        {step === 'service' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">What do you need?</h1>
            <div className="space-y-3">
              {SERVICE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => { setServiceType(opt.type); setStep('zip'); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      serviceType === opt.type ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{opt.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: ZIP code */}
        {step === 'zip' && (
          <div className="max-w-sm mx-auto text-center">
            <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Where's the project?</h1>
            <p className="text-gray-500 text-sm mb-6">We'll find available professionals in your area.</p>
            <input
              type="text"
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="ZIP Code"
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-center text-2xl font-mono tracking-wider"
              maxLength={5}
            />
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-full py-5" onClick={() => setStep('service')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-blue-600 text-white rounded-full py-5 font-semibold"
                disabled={zip.length < 5}
                onClick={() => { setWeekOffset(0); setSelectedSlot(null); setStep('calendar'); }}
              >
                Find Availability
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Calendar */}
        {step === 'calendar' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Pick a Date & Time</h1>
            <p className="text-gray-500 text-center text-sm mb-6">
              {SERVICE_OPTIONS.find(s => s.type === serviceType)?.label} near {zip}
            </p>

            {calendar.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">No availability in your area</h3>
                <p className="text-sm text-gray-400 mt-1">
                  We're expanding our installer network. Try a different ZIP code or check back soon.
                </p>
                <Button variant="outline" className="mt-4 rounded-full" onClick={() => setStep('zip')}>
                  Try Different ZIP
                </Button>
              </div>
            ) : (
              <>
                {/* Week navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasPrevWeek}
                    onClick={() => setWeekOffset(w => w - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700">{currentWeekLabel}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasNextWeek}
                    onClick={() => setWeekOffset(w => w + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar grid */}
                <div className="space-y-3">
                  {visibleDays.map(day => (
                    <Card key={day.date} className={selectedSlot?.date === day.date ? 'ring-2 ring-blue-300' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-semibold text-gray-900">{day.dateLabel}</span>
                            <span className="ml-2 text-xs text-gray-400">{day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}</span>
                          </div>
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
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
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
                  <Button variant="outline" className="rounded-full" onClick={() => setStep('zip')}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 text-white rounded-full py-5 font-semibold"
                    disabled={!selectedSlot}
                    onClick={() => setStep('confirm')}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && selectedSlot && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Confirm Your Appointment</h1>

            {/* Appointment summary */}
            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {selectedSlot.slot}
                    </div>
                    <div className="text-xs text-blue-600 mt-0.5">
                      {SERVICE_OPTIONS.find(s => s.type === serviceType)?.label}
                    </div>
                  </div>
                  <button
                    className="ml-auto text-sm text-blue-600 hover:underline"
                    onClick={() => setStep('calendar')}
                  >
                    Change
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Contact form */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo(c => ({ ...c, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={e => setCustomerInfo(c => ({ ...c, email: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={e => setCustomerInfo(c => ({ ...c, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
                    <input
                      type="text"
                      value={customerInfo.address}
                      onChange={e => setCustomerInfo(c => ({ ...c, address: e.target.value }))}
                      placeholder="Full address for the appointment"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Special Instructions (optional)</label>
                    <textarea
                      value={customerInfo.notes}
                      onChange={e => setCustomerInfo(c => ({ ...c, notes: e.target.value }))}
                      placeholder="Gate code, parking, pets, etc."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="rounded-full" onClick={() => setStep('calendar')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-5 text-lg font-bold gap-2"
                onClick={handleBook}
              >
                <Check className="w-5 h-5" /> Book Appointment
              </Button>
            </div>

            <p className="mt-3 text-xs text-gray-400 text-center">
              Your technician will contact you 30 minutes before arrival. Free cancellation up to 24 hours before.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
