import { useNavigate } from 'react-router-dom';
import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { Camera, Wrench, DollarSign, Shield, Star, Clock, MapPin, Check, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InstallerSignup() {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application Received!</h1>
          <p className="mt-2 text-gray-500">
            We'll review your application within 2 business days. Check your email for next steps.
          </p>
          <Button className="mt-6 bg-blue-600 text-white rounded-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-4">
            <Wrench className="w-4 h-4" /> Now Accepting Installers Nationwide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Earn More. <br />Work on Your Terms.</h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Join the SnapShades installer network and get paid to install premium window treatments. 
            Set your own schedule, service area, and rates.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: DollarSign, value: '$75-150', label: 'Per installation' },
            { icon: Clock, value: '30-60 min', label: 'Average install time' },
            { icon: MapPin, value: 'Your Area', label: 'Set your service zone' },
            { icon: Star, value: '4.9★', label: 'Avg installer rating' },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-5 text-center">
                <stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Benefits */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Install with SnapShades?</h2>
            
            <div className="space-y-4">
              {[
                { icon: DollarSign, title: 'Competitive Pay', desc: 'Earn $75-$150 per installation. Paid weekly via direct deposit. No chasing invoices.' },
                { icon: Clock, title: 'Flexible Schedule', desc: 'Set your availability. Accept jobs that work for you. No minimum hours required.' },
                { icon: MapPin, title: 'Your Service Area', desc: 'Define your radius. We only send you jobs in your zone. No wasted drive time.' },
                { icon: Shield, title: 'Insurance Support', desc: 'We verify insurance and can connect you with affordable coverage options.' },
                { icon: Users, title: 'Growing Network', desc: 'As we scale to all 50 states, early installers get priority in their area.' },
                { icon: Star, title: 'Build Your Reputation', desc: 'Earn ratings and reviews. Top-rated installers get premium jobs and higher rates.' },
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">How It Works</h3>
            <div className="space-y-3">
              {[
                'Apply online (takes 5 minutes)',
                'We verify your experience and insurance',
                'Set your availability and service area',
                'Get notified of jobs in your zone',
                'Install, get rated, get paid',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Application form */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Apply to Install</h2>
                <p className="text-sm text-gray-500 mb-6">Takes about 5 minutes. We'll get back to you within 2 business days.</p>

                <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                      <input type="text" required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                      <input type="text" required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                    <input type="email" required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                    <input type="tel" required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Company Name (optional)</label>
                    <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Service ZIP Code</label>
                    <input type="text" required placeholder="Your primary area" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Service Radius</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm">
                      <option>10 miles</option>
                      <option>25 miles</option>
                      <option>50 miles</option>
                      <option>75 miles</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Experience</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm">
                      <option>Less than 1 year</option>
                      <option>1-3 years</option>
                      <option>3-5 years</option>
                      <option>5-10 years</option>
                      <option>10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">What can you install?</label>
                    <div className="space-y-2 mt-1">
                      {['Blinds & Shades', 'Shutters', 'Drapes & Curtains', 'Motorized Systems'].map(skill => (
                        <label key={skill} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                          <span className="text-sm text-gray-600">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-600">I have general liability insurance (or will obtain before accepting jobs)</span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-5 text-lg font-semibold gap-2">
                    Submit Application <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
