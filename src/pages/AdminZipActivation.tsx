import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useState } from 'react';
import { MapPin, Check, X, Loader2, AlertTriangle, Zap, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { activateZip, deactivateZip, bulkActivateZips, type ActivationResult, type ActivationStep } from '@/lib/zip-activation';

const stepIcons: Record<ActivationStep['status'], React.ReactNode> = {
  pending: <div className="w-5 h-5 rounded-full bg-gray-200" />,
  running: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
  done: <Check className="w-5 h-5 text-green-500" />,
  error: <X className="w-5 h-5 text-red-500" />,
  skipped: <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-500">—</div>,
};

export default function AdminZipActivation() {
  const [zipInput, setZipInput] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ActivationResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const { toast } = useToast();

  const handleActivate = async () => {
    const zips = zipInput.split(/[,\s\n]+/).filter(z => /^\d{5}$/.test(z.trim()));
    if (zips.length === 0) {
      toast({ title: 'Invalid input', description: 'Enter one or more 5-digit ZIP codes.', variant: 'destructive' });
      return;
    }

    setRunning(true);
    setResults([]);

    if (zips.length === 1) {
      const result = await activateZip(zips[0]);
      setResults([result]);
    } else {
      const allResults = await bulkActivateZips(zips);
      setResults(allResults);
    }

    setRunning(false);
    setZipInput('');

    const successCount = results.filter(r => r.success).length;
    toast({
      title: 'Activation complete',
      description: `${successCount} of ${zips.length} ZIP(s) activated.`,
    });
  };

  const handleDeactivate = async (zip: string) => {
    const { success, error } = await deactivateZip(zip);
    if (success) {
      toast({ title: 'Deactivated', description: `ZIP ${zip} is now inactive.` });
      setResults(prev => prev.filter(r => r.zip !== zip));
    } else {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <SnapShadesLogo size={32} />
            <span className="text-2xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
          </a>
          <span className="text-sm text-gray-500 bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">Admin</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ZIP Code Activation</h1>
            <p className="text-sm text-gray-500">Enter a ZIP → full infrastructure auto-provisions</p>
          </div>
        </div>

        {/* Input */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              ZIP Code(s)
            </label>
            <div className="flex gap-3">
              <textarea
                value={zipInput}
                onChange={e => setZipInput(e.target.value)}
                placeholder="Enter ZIP codes (comma or newline separated)&#10;e.g., 90210, 90211, 90212"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-mono resize-none"
                rows={3}
                disabled={running}
              />
              <Button
                onClick={handleActivate}
                disabled={running || !zipInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 self-start gap-2"
              >
                {running ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Activating...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Activate</>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Each ZIP triggers: metadata resolution → territory creation → pricing → contractor matching → scheduling → SEO pages → activation log
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Activation Results</h2>
            {results.map((r, idx) => {
              const isExpanded = expandedResult === idx;
              return (
                <Card key={r.zip} className={r.success ? '' : 'border-red-200'}>
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedResult(isExpanded ? null : idx)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left"
                    >
                      {r.success ? (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <X className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">{r.zip}</span>
                          {r.city && <span className="text-sm text-gray-500">— {r.city}, {r.state}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          {r.pricing_zone && <span>Zone {r.pricing_zone}</span>}
                          {r.contractors_matched !== undefined && <span>{r.contractors_matched} contractor(s)</span>}
                          {r.seo_pages_created !== undefined && <span>{r.seo_pages_created} SEO pages</span>}
                        </div>
                      </div>
                      {r.warnings.length > 0 && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        {/* Steps */}
                        <div className="space-y-2 mt-3">
                          {r.steps.map(step => (
                            <div key={step.step} className="flex items-center gap-3">
                              {stepIcons[step.status]}
                              <span className={`text-sm flex-1 ${step.status === 'done' ? 'text-gray-700' : step.status === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                                {step.name}
                              </span>
                              {step.detail && (
                                <span className="text-xs text-gray-400">{step.detail}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Warnings */}
                        {r.warnings.length > 0 && (
                          <div className="mt-3 bg-yellow-50 rounded-lg p-3">
                            {r.warnings.map((w, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-yellow-700">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                {w}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Error */}
                        {r.error && (
                          <div className="mt-3 bg-red-50 rounded-lg p-3 text-xs text-red-700">
                            {r.error}
                          </div>
                        )}

                        {/* Actions */}
                        {r.success && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeactivate(r.zip)}
                            >
                              <Trash2 className="w-3 h-3" /> Deactivate
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
