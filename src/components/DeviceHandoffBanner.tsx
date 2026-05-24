import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Laptop, ArrowRightLeft, X, CloudUpload, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { pushNowAndWait, pullFromCloud } from "@/lib/device-sync";
import { Button } from "@/components/ui/button";

/**
 * DeviceHandoffBanner — non-intrusive nudge for cross-device continuity.
 *
 * Appears at the bottom of the wizard after the user has measured ≥1 window
 * AND isn't signed in. Sends them through sign-in, which triggers sync (via
 * initDeviceSync's SIGNED_IN listener). Once signed in, the banner morphs
 * into a "Save to cloud now" button plus a "last synced from Mac 2h ago"
 * status line.
 *
 * Dismiss state persists to sessionStorage so it doesn't reappear if
 * dismissed during this browser session.
 */

const DISMISSED_KEY = "snapshades_handoff_dismissed";

interface DeviceHandoffBannerProps {
  /** Only show if the user has done at least this much work — prevents
   *  harassing users who just landed on the page. */
  minWindowsRequired?: number;
  windowCount: number;
}

export default function DeviceHandoffBanner({
  minWindowsRequired = 1,
  windowCount,
}: DeviceHandoffBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "synced" | "error"
  >("idle");
  const [lastSync, setLastSync] = useState<{ device: string | null; when: string | null } | null>(null);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    // On mount (post-login), check whether there's a newer cloud state.
    pullFromCloud()
      .then((r) => {
        if (r.pulled) setLastSync({ device: r.lastDevice, when: r.updatedAt });
      })
      .catch(() => { /* noop */ });
  }, [user]);

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* noop */ }
  }

  async function saveNow() {
    setSyncStatus("syncing");
    const ok = await pushNowAndWait();
    setSyncStatus(ok ? "synced" : "error");
    if (ok) {
      setTimeout(() => setSyncStatus("idle"), 2500);
    }
  }

  if (dismissed) return null;
  if (windowCount < minWindowsRequired) return null;

  const signedIn = !!user;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-40"
      >
        <div className="rounded-lg bg-ink text-primary-foreground shadow-xl border border-ink/10 overflow-hidden">
          <div className="px-4 py-3.5 flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-md bg-clay/20 text-clay flex items-center justify-center">
              {signedIn ? <CloudUpload className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              {!signedIn ? (
                <>
                  <p className="text-sm font-semibold leading-tight">
                    Switch devices any time.
                  </p>
                  <p className="mt-1 text-xs text-primary-foreground/70 leading-relaxed">
                    Sign in once to sync this project across your phone, tablet, and
                    computer.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => navigate(`/signup?return=${encodeURIComponent(window.location.pathname)}`)}
                      size="sm"
                      className="bg-clay hover:bg-clay-hover text-primary-foreground rounded-md font-semibold text-xs h-8"
                    >
                      Sign in to sync
                    </Button>
                    <Link
                      to={`/signin?return=${encodeURIComponent(window.location.pathname)}`}
                      className="text-xs font-medium text-primary-foreground/70 hover:text-primary-foreground self-center"
                    >
                      I have an account
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold leading-tight flex items-center gap-1.5">
                    {syncStatus === "synced" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> Saved to cloud
                      </>
                    ) : syncStatus === "syncing" ? (
                      <>Syncing…</>
                    ) : (
                      <>Across all your devices</>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-primary-foreground/70 leading-relaxed">
                    {lastSync?.device
                      ? <>Last synced from <strong>{lastSync.device}</strong></>
                      : <>Auto-syncs as you work. Sign in on any device to continue.</>}
                  </p>
                  {syncStatus !== "synced" && (
                    <Button
                      onClick={saveNow}
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-7 px-2 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <CloudUpload className="w-3 h-3 mr-1" />
                      Save now
                    </Button>
                  )}
                </>
              )}
            </div>

            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-primary-foreground/10 text-primary-foreground/60 hover:text-primary-foreground flex items-center justify-center -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!signedIn && (
            <div className="px-4 pb-3 flex items-center gap-4 text-[10px] uppercase tracking-wider text-primary-foreground/50">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Phone
              </span>
              <ArrowRightLeft className="w-3 h-3" />
              <span className="flex items-center gap-1">
                <Laptop className="w-3 h-3" /> Desktop
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
