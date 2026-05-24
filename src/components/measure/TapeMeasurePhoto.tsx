import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Sparkles, Check, AlertTriangle, Redo2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  readTapeMeasure,
  formatInches,
  type MeasurementType,
  type MeasurementResponse,
} from "@/lib/tape-measure-client";
import TwoPersonCoaching, { shouldShowCoaching, markCoachingSeen } from "./TwoPersonCoaching";
import TapeMeasureExamples from "./TapeMeasureExamples";

/**
 * TapeMeasurePhoto — the "Snap" button.
 *
 * Lets the user take or upload a close-up photo of a tape measure at a window
 * edge. Sends the photo to the read-tape-measure edge function (Claude vision),
 * displays the result with a confidence badge, and calls onResult when the
 * user accepts the value.
 *
 * First-time users see the TwoPersonCoaching modal before the camera opens.
 */

interface TapeMeasurePhotoProps {
  /** Invoked when the user accepts the AI-read value. */
  onResult: (totalInches: number, confidence: "high" | "medium" | "low") => void;
  measurementType: MeasurementType;
  hint?: { expected_min_in?: number; expected_max_in?: number };
  /** Existing manually-typed value; used for reconciliation warnings. */
  existingValue?: number | null;
  /** Compact layout (single-line, for use inline next to manual inputs). */
  compact?: boolean;
}

type Phase =
  | { type: "idle" }
  | { type: "preview"; dataUrl: string }
  | { type: "reading"; dataUrl: string }
  | { type: "result"; dataUrl: string; response: MeasurementResponse };

const TYPE_LABELS: Record<MeasurementType, string> = {
  width: "width",
  height: "height",
  depth: "depth",
};

export default function TapeMeasurePhoto({
  onResult,
  measurementType,
  hint,
  existingValue,
  compact = false,
}: TapeMeasurePhotoProps) {
  const [phase, setPhase] = useState<Phase>({ type: "idle" });
  const [coachingOpen, setCoachingOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Coach the first time a user opens the flow. After the modal closes, the
  // camera picker opens automatically.
  const openCameraAfterCoaching = useRef(false);

  function triggerCameraCapture() {
    if (shouldShowCoaching()) {
      openCameraAfterCoaching.current = true;
      setCoachingOpen(true);
    } else {
      cameraInputRef.current?.click();
    }
  }

  function onCoachingClose({ dontShowAgain }: { dontShowAgain: boolean }) {
    if (dontShowAgain) markCoachingSeen();
    setCoachingOpen(false);
    if (openCameraAfterCoaching.current) {
      openCameraAfterCoaching.current = false;
      // Small delay so the modal unmount doesn't steal focus from the input.
      setTimeout(() => cameraInputRef.current?.click(), 120);
    }
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhase({ type: "preview", dataUrl });
    };
    reader.readAsDataURL(file);
    // Reset so selecting the same file twice still fires change.
    e.target.value = "";
  }

  async function submit(dataUrl: string) {
    setPhase({ type: "reading", dataUrl });
    const response = await readTapeMeasure(dataUrl, measurementType, hint);
    setPhase({ type: "result", dataUrl, response });
  }

  function accept() {
    if (phase.type !== "result" || phase.response.status !== "ok") return;
    onResult(phase.response.total_inches, phase.response.confidence);
    setPhase({ type: "idle" });
  }

  function retake() {
    setPhase({ type: "idle" });
    // Re-open the camera.
    setTimeout(() => cameraInputRef.current?.click(), 50);
  }

  // Auto-submit when we land on preview (saves the user a tap). Keep preview
  // around in case submit needs to re-run.
  useEffect(() => {
    if (phase.type === "preview") {
      submit(phase.dataUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.type]);

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChosen}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChosen}
      />

      <TwoPersonCoaching open={coachingOpen} onClose={onCoachingClose} />

      {/* Idle — CTA */}
      {phase.type === "idle" && (
        compact ? (
          <Button
            onClick={triggerCameraCapture}
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-md border-clay/30 text-clay hover:bg-clay/5 hover:border-clay hover:text-clay-hover flex-shrink-0"
          >
            <Camera className="w-4 h-4" />
            Snap
          </Button>
        ) : (
          <Button
            onClick={triggerCameraCapture}
            className="w-full rounded-md py-6 gap-2 text-base bg-clay hover:bg-clay-hover text-primary-foreground font-semibold"
          >
            <Camera className="w-5 h-5" />
            Snap photo of tape measure
            <Sparkles className="w-4 h-4 opacity-80" />
          </Button>
        )
      )}

      {/* Reading — spinner over preview */}
      <AnimatePresence mode="wait">
        {(phase.type === "preview" || phase.type === "reading") && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative rounded-xl overflow-hidden border border-border bg-card"
          >
            <img
              src={phase.dataUrl}
              alt="Your measurement photo"
              className="w-full h-auto max-h-56 object-cover"
            />
            <div className="absolute inset-0 bg-ink/55 backdrop-blur-[1px] flex flex-col items-center justify-center text-primary-foreground">
              <Loader2 className="w-7 h-7 animate-spin mb-2" />
              <p className="text-sm font-semibold">Reading the tape…</p>
              <p className="text-xs opacity-70">usually under 5 seconds</p>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {phase.type === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {phase.response.status === "ok" && (
              <ResultOk
                response={phase.response}
                measurementType={measurementType}
                existingValue={existingValue}
                onAccept={accept}
                onRetake={retake}
                onManual={() => setPhase({ type: "idle" })}
              />
            )}
            {phase.response.status === "rate_limited" && (
              <ResultRateLimited message={phase.response.message} onManual={() => setPhase({ type: "idle" })} />
            )}
            {phase.response.status === "error" && (
              <ResultError
                message={phase.response.message}
                onRetake={retake}
                onManual={() => setPhase({ type: "idle" })}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const map = {
    high: { label: "High confidence", bg: "bg-emerald-50", text: "text-emerald-700", icon: Check },
    medium: { label: "Looks OK — double-check", bg: "bg-amber-50", text: "text-amber-700", icon: AlertTriangle },
    low: { label: "Low confidence — retake", bg: "bg-rose-50", text: "text-rose-700", icon: AlertTriangle },
  } as const;
  const { label, bg, text, icon: Icon } = map[confidence];
  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} ${text} text-xs font-medium rounded-full px-2.5 py-1`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function ResultOk({
  response,
  measurementType,
  existingValue,
  onAccept,
  onRetake,
  onManual,
}: {
  response: Extract<MeasurementResponse, { status: "ok" }>;
  measurementType: MeasurementType;
  existingValue?: number | null;
  onAccept: () => void;
  onRetake: () => void;
  onManual: () => void;
}) {
  const differsFromExisting =
    typeof existingValue === "number" && Math.abs(existingValue - response.total_inches) > 1;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <ConfidenceBadge confidence={response.confidence} />
        {response.cap > 0 && (
          <span className="text-[11px] text-warm-gray-500">
            {response.usage_remaining} of {response.cap} AI reads left today
          </span>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-warm-gray-500">
          {TYPE_LABELS[measurementType]}
        </p>
        <p className="text-3xl font-bold text-ink tracking-tight mt-0.5">
          {formatInches(response.total_inches)}
        </p>
      </div>

      {response.notes && (
        <p className="text-sm text-warm-gray-500 italic">&ldquo;{response.notes}&rdquo;</p>
      )}

      {differsFromExisting && typeof existingValue === "number" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <strong>Heads up:</strong> the photo reads {formatInches(response.total_inches)}, but you
          previously entered {formatInches(existingValue)}. Which is correct?
        </div>
      )}

      {/* Low-confidence: show what went wrong + examples to correct it. */}
      {response.confidence === "low" && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 space-y-2.5">
          <p className="text-xs text-rose-800 font-semibold">
            Photo quality too low to trust. Common issues:
          </p>
          <TapeMeasureExamples variant="compact" show="bad" />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          onClick={onAccept}
          disabled={response.confidence === "low"}
          className="flex-1 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md font-semibold disabled:opacity-60"
        >
          {response.confidence === "low" ? "Retake to use this" : "Use this value"}
        </Button>
        <Button onClick={onRetake} variant="outline" size="icon" className="rounded-md" aria-label="Retake">
          <Redo2 className="w-4 h-4" />
        </Button>
        <Button onClick={onManual} variant="ghost" size="icon" className="rounded-md" aria-label="Enter manually">
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ResultRateLimited({ message, onManual }: { message: string; onManual: () => void }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full px-2.5 py-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Daily limit hit
        </span>
      </div>
      <p className="text-sm text-warm-gray-500">{message}</p>
      <Button onClick={onManual} className="w-full bg-clay hover:bg-clay-hover text-primary-foreground rounded-md font-semibold">
        Enter manually
      </Button>
    </div>
  );
}

function ResultError({
  message,
  onRetake,
  onManual,
}: {
  message: string;
  onRetake: () => void;
  onManual: () => void;
}) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-full px-2.5 py-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Couldn&apos;t read the tape
        </span>
      </div>
      <p className="text-sm text-warm-gray-500">{message}</p>

      <div className="rounded-md bg-sand-deep/40 border border-border p-3 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray-500">
          Try again — here's what works and what doesn't
        </p>
        <TapeMeasureExamples variant="compact" />
      </div>

      <div className="flex gap-2">
        <Button onClick={onRetake} className="flex-1 bg-clay hover:bg-clay-hover text-primary-foreground rounded-md font-semibold">
          <Redo2 className="w-4 h-4 mr-1.5" />
          Retake photo
        </Button>
        <Button onClick={onManual} variant="outline" className="flex-1 rounded-md">
          Enter manually
        </Button>
      </div>
    </div>
  );
}
