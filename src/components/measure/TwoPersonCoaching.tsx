import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Camera, Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import TapeMeasureExamples from "./TapeMeasureExamples";

/**
 * First-time coaching modal for the AI tape-measure flow.
 *
 * Appears once per browser (gated by a localStorage flag). Walks through the
 * three-step two-person photo protocol, then sets `snapshades_coaching_seen`
 * so subsequent captures skip straight to the camera.
 */

const STORAGE_KEY = "snapshades_coaching_seen";

export function shouldShowCoaching(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markCoachingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // noop
  }
}

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: <Users className="w-6 h-6" strokeWidth={1.75} />,
    title: "Grab a partner",
    body: "Measuring windows is easier with two people — one holds the tape taut at the corner, the other takes the close-up photo.",
  },
  {
    icon: <Ruler className="w-6 h-6" strokeWidth={1.75} />,
    title: "Stretch the tape",
    body: "Pull the tape across the opening. Keep it flat against the frame and steady at both ends.",
  },
  {
    icon: <Camera className="w-6 h-6" strokeWidth={1.75} />,
    title: "Close-up, sharp focus",
    body: "Get within a few inches of the tape at the edge you're measuring. Tap to focus. Just the number needs to be in frame.",
  },
];

interface TwoPersonCoachingProps {
  open: boolean;
  onClose: (options: { dontShowAgain: boolean }) => void;
}

export default function TwoPersonCoaching({ open, onClose }: TwoPersonCoachingProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const close = () => onClose({ dontShowAgain });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={close}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="w-full max-w-xl bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-wider text-warm-gray-500 font-medium">Snap</p>
                <h2 className="text-lg font-semibold text-ink tracking-tight">How to measure with your camera</h2>
              </div>
              <button
                onClick={close}
                className="w-9 h-9 rounded-full hover:bg-sand-deep flex items-center justify-center text-warm-gray-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sand-deep flex items-center justify-center text-ink">
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-clay">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-warm-gray-500 leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              ))}

              {/* Visual examples — what good and bad photos look like. */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-border pt-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500 mb-2">
                  Examples
                </p>
                <TapeMeasureExamples variant="standard" />
              </motion.div>
            </div>

            <div className="px-5 pb-5 pt-1 space-y-3">
              <label className="flex items-center gap-2 text-sm text-warm-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-clay focus:ring-clay"
                />
                Don&apos;t show this again
              </label>
              <Button
                onClick={close}
                className="w-full bg-clay hover:bg-clay-hover text-primary-foreground rounded-md py-6 font-semibold text-base"
              >
                Got it — let&apos;s measure
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
