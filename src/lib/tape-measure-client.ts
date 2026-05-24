/**
 * Client for the read-tape-measure Supabase Edge Function.
 *
 * Converts a File/Blob into the data URL the function expects, forwards the
 * request, and normalizes errors into a discriminated union the UI can pattern
 * match on.
 */

import { supabase } from "@/lib/supabase";
import { getAiSessionId } from "@/lib/ai-session";

export type MeasurementType = "width" | "height" | "depth";
export type Confidence = "high" | "medium" | "low";

export interface MeasurementSuccess {
  status: "ok";
  inches: number;
  fraction: string;
  total_inches: number;
  confidence: Confidence;
  notes: string;
  warnings: string[];
  usage_remaining: number;
  cap: number;
}

export interface MeasurementRateLimited {
  status: "rate_limited";
  message: string;
  cap: number;
  used: number;
}

export interface MeasurementError {
  status: "error";
  code: string;
  message: string;
}

export type MeasurementResponse = MeasurementSuccess | MeasurementRateLimited | MeasurementError;

async function fileToDataUrl(file: File | Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

/**
 * Send a tape-measure photo to the edge function. Returns a discriminated
 * union; callers pattern match on .status.
 */
export async function readTapeMeasure(
  photo: File | Blob | string,
  measurementType: MeasurementType,
  hint?: { expected_min_in?: number; expected_max_in?: number }
): Promise<MeasurementResponse> {
  const image = typeof photo === "string" ? photo : await fileToDataUrl(photo);

  // Prefer the authed user ID if signed in; otherwise fall back to the
  // browser session ID.
  const { data: { user } } = await supabase.auth.getUser();
  const session_id = user ? undefined : getAiSessionId();

  const { data, error } = await supabase.functions.invoke("read-tape-measure", {
    body: {
      image,
      measurement_type: measurementType,
      session_id,
      user_id: user?.id ?? null,
      hint,
    },
  });

  if (error) {
    // supabase-js lumps HTTP + network errors together; try to recover the
    // structured JSON body if the edge function returned one.
    try {
      const context = (error as { context?: { body?: unknown } }).context;
      const body = context?.body;
      const parsed = typeof body === "string" ? JSON.parse(body) : body;
      if (parsed && typeof parsed === "object") {
        const p = parsed as Record<string, unknown>;
        if (p.error === "rate_limited") {
          return {
            status: "rate_limited",
            message: typeof p.message === "string" ? p.message : "Rate limit hit",
            cap: typeof p.cap === "number" ? p.cap : 0,
            used: typeof p.used === "number" ? p.used : 0,
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

  if (!data || typeof data !== "object") {
    return { status: "error", code: "bad_response", message: "Empty response from server" };
  }

  const d = data as Record<string, unknown>;
  if (
    typeof d.inches === "number" &&
    typeof d.fraction === "string" &&
    typeof d.total_inches === "number" &&
    typeof d.confidence === "string"
  ) {
    return {
      status: "ok",
      inches: d.inches,
      fraction: d.fraction,
      total_inches: d.total_inches,
      confidence: d.confidence as Confidence,
      notes: typeof d.notes === "string" ? d.notes : "",
      warnings: Array.isArray(d.warnings) ? d.warnings.map(String) : [],
      usage_remaining: typeof d.usage_remaining === "number" ? d.usage_remaining : 0,
      cap: typeof d.cap === "number" ? d.cap : 0,
    };
  }

  return { status: "error", code: "bad_response", message: "Unexpected response shape" };
}

/** Format a numeric inches value to a human-friendly string like `48 3/8"`. */
export function formatInches(totalInches: number): string {
  const whole = Math.floor(totalInches);
  const remainder = totalInches - whole;
  // Snap to the nearest 1/16.
  const sixteenths = Math.round(remainder * 16);
  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;
  // Reduce the fraction.
  let num = sixteenths;
  let den = 16;
  while (num % 2 === 0 && den > 1) {
    num /= 2;
    den /= 2;
  }
  return `${whole} ${num}/${den}"`;
}
