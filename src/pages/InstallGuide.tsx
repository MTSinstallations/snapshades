import SnapShadesLogo from "@/components/SnapShadesLogo";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Wrench, CheckCircle, Lightbulb, PlayCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INSTALL_GUIDES, getInstallGuide } from '@/lib/warranty-returns-engine';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function InstallGuide() {
  const { product } = useParams<{ product: string }>();
  const navigate = useNavigate();

  // Show guide list if no product specified
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <SnapShadesLogo size={28} />
              <span className="text-xl font-bold text-blue-900">Snap<span className="text-blue-500">Shades</span></span>
            </a>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">DIY Installation Guides</h1>
          <p className="text-sm text-gray-500 mb-6">Step-by-step instructions for every product type.</p>
          <div className="space-y-3">
            {INSTALL_GUIDES.map(guide => (
              <Card key={guide.productType} className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/guides/${guide.productType}`)}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{guide.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" /> {guide.estimatedTime}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[guide.difficulty]}`}>{guide.difficulty}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const guide = getInstallGuide(product);
  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Guide not found</h2>
          <Button className="mt-4 rounded-full" onClick={() => navigate('/guides')}>View All Guides</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
          <button onClick={() => navigate('/guides')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> All Guides
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{guide.title}</h1>

        <div className="flex items-center gap-4 mb-6">
          <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" /> {guide.estimatedTime}</span>
          <span className={`text-sm px-3 py-1 rounded-full ${DIFFICULTY_COLORS[guide.difficulty]}`}>{guide.difficulty}</span>
        </div>

        {/* Tools */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" /> Tools Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {guide.toolsRequired.map(tool => (
                <span key={tool} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">{tool}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Video */}
        {guide.videoUrl && (
          <Card className="mb-6 cursor-pointer hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <PlayCircle className="w-10 h-10 text-red-500" />
              <div>
                <div className="font-medium text-gray-900">Watch Video Guide</div>
                <div className="text-xs text-gray-500">Visual walkthrough of the entire installation</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        <div className="space-y-4">
          {guide.steps.map((s, i) => (
            <Card key={s.step}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{s.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                    {s.tip && (
                      <div className="mt-2 flex items-start gap-2 bg-yellow-50 rounded-lg p-2.5">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-yellow-800">{s.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Common mistakes */}
        {guide.commonMistakes && guide.commonMistakes.length > 0 && (
          <Card className="mt-6 border-red-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-red-900 mb-3">⚠️ Common Mistakes</h3>
              <ul className="space-y-2">
                {guide.commonMistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-400 mt-0.5">✕</span> {m}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Button className="bg-blue-600 text-white rounded-full" onClick={() => navigate('/help')}>
            Need Help? Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
