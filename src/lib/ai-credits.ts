/**
 * AI credits client — balance fetching, visualize-room endpoint wrapper.
 *
 * Credit economics (matches supabase/migrations/20260416000002_ai_credits.sql):
 *  - Anonymous: 3 free on first use; no reset.
 *  - Authenticated: 10 free on first use; refilled separately (future).
 *  - Earn bonus: +5 for first swatch order, +3 for completing account setup,
 *    +10 for first order placed.
 */

import { supabase } from "@/lib/supabase";
import { getAiSessionId } from "@/lib/ai-session";

export interface VisualizeSuccess {
  status: "ok";
  image: string; // data URL
  balance_remaining: number;
}
export interface VisualizeOutOfCredits {
  status: "out_of_credits";
  message: string;
  upsell?: { action: "swatch_order"; reward: number };
}
export interface VisualizeNotConfigured {
  status: "not_configured";
  message: string;
}
export interface VisualizeError {
  status: "error";
  code: string;
  message: string;
}
export type VisualizeResponse =
  | VisualizeSuccess
  | VisualizeOutOfCredits
  | VisualizeNotConfigured
  | VisualizeError;

export interface VisualizeArgs {
  windowPhoto: string; // data URL
  productType: string; // e.g. "Honeycomb Shade"
  colorHex: string;
  colorName: string;
  coveragePercent?: number; // 30-95
}

/**
 * Read the current credit balance for the caller. Returns a best-effort
 * guess for anonymous sessions (starts at 3 if no row exists yet). UI uses
 * this for the counter on the AI Enhance button.
 */
export async function getAiCreditBalance(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("ai_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    return data?.balance ?? 10; // row will be created on first spend
  }

  const sessionId = getAiSessionId();
  const { data } = await supabase
    .from("ai_credits")
    .select("balance")
    .eq("session_id", sessionId)
    .maybeSingle();
  return data?.balance ?? 3;
}

export async function visualizeRoom(args: VisualizeArgs): Promise<VisualizeResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  const session_id = user ? undefined : getAiSessionId();

  const { data, error } = await supabase.functions.invoke("visualize-room", {
    body: {
      window_photo: args.windowPhoto,
      product_type: args.productType,
      color_hex: args.colorHex,
      color_name: args.colorName,
      coverage_percent: args.coveragePercent ?? 70,
      session_id,
      user_id: user?.id ?? null,
    },
  });

  if (error) {
    try {
      const context = (error as { context?: { body?: unknown } }).context;
      const raw = context?.body;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === "object") {
        const p = parsed as Record<string, unknown>;
        if (p.error === "out_of_credits") {
          return {
            status: "out_of_credits",
            message: typeof p.message === "string" ? p.message : "Out of AI visualizations",
            upsell: (p.upsell as VisualizeOutOfCredits["upsell"]) ?? undefined,
          };
        }
        if (p.error === "not_configured") {
          return {
            status: "not_configured",
            message: typeof p.message === "string" ? p.message : "AI visualization not available",
          };
        }
        return {
          status: "error",
          code: typeof p.error === "string" ? p.error : "unknown",
          message: typeof p.message === "string" ? p.message : error.message,
        };
      }
    } catch {
      // fall through
    }
    return { status: "error", code: "network", message: error.message };
  }

  if (data && typeof data === "object" && "image" in data && typeof data.image === "string") {
    const d = data as Record<string, unknown>;
    return {
      status: "ok",
      image: d.image as string,
      balance_remaining: typeof d.balance_remaining === "number" ? d.balance_remaining : 0,
    };
  }

  return { status: "error", code: "bad_response", message: "Unexpected response" };
}
