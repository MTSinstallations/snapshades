import { useState, useEffect } from 'react';
import { Smartphone, Monitor, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * QR Code Handoff — lets desktop users continue their project on mobile
 * Uses a lightweight QR code generator (no external deps).
 * 
 * Flow:
 * 1. Customer starts measuring on desktop
 * 2. Clicks "Continue on Phone" → gets QR code
 * 3. Scans with phone camera → opens same project
 * 4. Session token links both devices
 */

// Simple QR code generation using a free API (replace with local lib in prod)
function getQRUrl(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=svg&margin=8`;
}

interface QRHandoffProps {
  projectUrl?: string;
  sessionToken?: string;
  onClose?: () => void;
}

export default function QRHandoff({ projectUrl, sessionToken, onClose }: QRHandoffProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate the URL to share
  const shareUrl = projectUrl || `${window.location.origin}/start${sessionToken ? `?session=${sessionToken}` : ''}`;
  const qrUrl = getQRUrl(shareUrl, 300);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-gray-500" />
        </div>
        <ArrowRight className="w-5 h-5 text-blue-500" />
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900">Continue on Your Phone</h2>
      <p className="text-sm text-gray-500 mt-2">
        Scan this QR code with your phone camera to measure your windows with photos.
        Your project syncs automatically.
      </p>

      {/* QR Code */}
      <div className="my-6 flex justify-center">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 inline-block">
          <img
            src={qrUrl}
            alt="QR Code — scan to continue on mobile"
            className="w-[200px] h-[200px]"
          />
        </div>
      </div>

      {/* Link copy */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
        />
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1"
          onClick={copyLink}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* SMS option (future) */}
      <p className="text-xs text-gray-400 mt-4">
        Or text yourself the link — same project, same progress.
      </p>

      {onClose && (
        <Button
          variant="outline"
          className="mt-4 rounded-full"
          onClick={onClose}
        >
          Continue on Desktop
        </Button>
      )}
    </div>
  );
}

/**
 * Floating QR button that shows on desktop for projects
 */
export function QRHandoffButton() {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || /iPhone|iPad|Android/i.test(navigator.userAgent));
  }, []);

  // Don't show on mobile
  if (isMobile) return null;

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all hover:shadow-xl"
      >
        <Smartphone className="w-5 h-5" />
        <span className="text-sm font-medium">Measure on Phone</span>
      </button>

      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div onClick={e => e.stopPropagation()}>
            <QRHandoff onClose={() => setShowQR(false)} />
          </div>
        </div>
      )}
    </>
  );
}
