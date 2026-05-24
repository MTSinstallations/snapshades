/**
 * Device sync — cross-device project continuity for logged-in users.
 *
 * Covers the ephemeral UI state that persistent-cart.ts doesn't:
 *   - MeasureWizard in-progress state
 *   - Per-window swatch selections
 *   - Per-window photos
 *   - Freeform notes
 *
 * Flow:
 *   1. On login: pullFromCloud() — merge cloud state into localStorage
 *   2. After state changes: pushToCloud() (debounced) — upload local to cloud
 *   3. On logout: nothing (localStorage retains the last state)
 *
 * `last-write-wins` merge strategy. For a single-user-across-devices
 * scenario this is sufficient — the same person won't realistically
 * make conflicting edits simultaneously on two devices.
 */

import { supabase } from "./supabase";

/** All localStorage keys that should sync across devices. */
const SYNCED_KEYS = [
  "snapshades_wizard_state",
  "snapshades_swatches",
  "snapshades_photos",
  "snapshades_notes",
  "snapshades_cart",
  "snapshades_checkout",
] as const;

type SyncedKey = (typeof SYNCED_KEYS)[number];

type SyncPayload = Partial<Record<SyncedKey, unknown>>;

function readLocalPayload(): SyncPayload {
  const payload: SyncPayload = {};
  for (const key of SYNCED_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        payload[key] = JSON.parse(raw);
      }
    } catch {
      // Malformed JSON — skip this key.
    }
  }
  return payload;
}

function writeLocalPayload(payload: SyncPayload) {
  for (const key of SYNCED_KEYS) {
    if (key in payload) {
      try {
        localStorage.setItem(key, JSON.stringify(payload[key]));
      } catch {
        // Storage full / disabled. Best-effort only.
      }
    }
  }
}

function currentDeviceLabel(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPod/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return "Browser";
}

/**
 * Push current localStorage state to Supabase. No-op if not signed in.
 * Debounced — call freely on state change; only hits the network after 2s
 * of no further changes.
 */
let pushTimer: ReturnType<typeof setTimeout> | null = null;
export function pushToCloud(debounceMs = 2000): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = readLocalPayload();
    if (Object.keys(payload).length === 0) return;

    await supabase
      .from("user_sync_state")
      .upsert({
        user_id: user.id,
        state: payload,
        last_device: currentDeviceLabel(),
        updated_at: new Date().toISOString(),
      });
  }, debounceMs);
}

/**
 * Pull cloud state into localStorage. Called on sign-in and on explicit
 * "resume from cloud" action. Returns a summary of what was pulled so the
 * UI can show a "Welcome back from your iPhone" toast.
 */
export interface PullResult {
  pulled: boolean;
  lastDevice: string | null;
  updatedAt: string | null;
  keys: SyncedKey[];
}

export async function pullFromCloud(): Promise<PullResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pulled: false, lastDevice: null, updatedAt: null, keys: [] };

  const { data, error } = await supabase
    .from("user_sync_state")
    .select("state, updated_at, last_device")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data || !data.state) {
    return { pulled: false, lastDevice: null, updatedAt: null, keys: [] };
  }

  const payload = data.state as SyncPayload;
  writeLocalPayload(payload);

  return {
    pulled: true,
    lastDevice: data.last_device ?? null,
    updatedAt: data.updated_at ?? null,
    keys: (Object.keys(payload) as SyncedKey[]).filter((k) => SYNCED_KEYS.includes(k)),
  };
}

/**
 * Wire auto-sync on auth state changes. Call once at app boot.
 *   - On SIGNED_IN: pull cloud state (merge into local)
 *   - On storage changes: debounced push to cloud
 */
export function initDeviceSync(): () => void {
  const authListener = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN") {
      pullFromCloud().catch(() => { /* best-effort */ });
    }
  });

  // Listen for localStorage writes from other tabs AND this tab
  // (via explicit push calls — see below).
  const storageHandler = () => pushToCloud();
  window.addEventListener("storage", storageHandler);

  return () => {
    authListener.data.subscription.unsubscribe();
    window.removeEventListener("storage", storageHandler);
  };
}

/**
 * Manually trigger a push right now (no debounce). Used by the "Save to
 * cloud before I switch devices" button.
 */
export async function pushNowAndWait(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const payload = readLocalPayload();
  if (Object.keys(payload).length === 0) return false;

  const { error } = await supabase
    .from("user_sync_state")
    .upsert({
      user_id: user.id,
      state: payload,
      last_device: currentDeviceLabel(),
      updated_at: new Date().toISOString(),
    });
  return !error;
}
