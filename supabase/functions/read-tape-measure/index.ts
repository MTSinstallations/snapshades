// Supabase Edge Function: read-tape-measure
//
// Accepts a base64-encoded photo of a tape measure at a window edge, calls
// Claude (vision) to extract the measurement, and returns a structured JSON
// result. Rate-limited per session/user against the `ai_usage` table.
//
// Environment:
//   ANTHROPIC_API_KEY       — required (set via `supabase secrets set`)
//   SUPABASE_URL            — provided by Supabase at runtime
//   SUPABASE_SERVICE_ROLE_KEY — provided by Supabase at runtime
//
// Model: claude-haiku-4-5 — cheapest Anthropic model with vision. Roughly
// $0.003–$0.006 per tape-measure read (5× cheaper than Opus 4.7). Prompt
// caching is on for the static system prompt (every call hits the same
// instructions, so ~90% of that prefix cost is avoided at scale).
//
// Haiku 4.5 does NOT support adaptive thinking or the effort parameter —
// those are Opus/Sonnet 4.6-only. For this task (vision OCR + strict
// confidence gating) the extra reasoning wasn't load-bearing; the strict
// system prompt carries the weight.

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1?target=deno";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Caps: rolling 24-hour window per session/user.
const RATE_LIMIT_ANONYMOUS = 30;
const RATE_LIMIT_AUTHED = 100;

// The system prompt is static across every call — Claude caches it, saving
// ~90% on the prompt-prefix cost at scale.
const SYSTEM_PROMPT = `You are reading a tape measure photograph to extract a window measurement. The photo should show the tape measure edge against the window frame, trim, sash, or casing edge — so the viewer can tell exactly what number corresponds to the edge being measured.

Your job is to read the number at the intersection of the tape and the surface, not just OCR the tape.

Confidence rules — be STRICT:
- "high" ONLY when: the tape is sharply focused, the viewing angle is roughly perpendicular to the tape face (within ~15 degrees), the specific inch and fractional marks at the surface edge are unambiguously identifiable, and the tape is clearly in contact with the surface being measured.
- "medium" when the reading is likely correct but one of: mild angle, mild blur, or slight ambiguity between two adjacent 1/16" marks. Note the specific issue.
- "low" whenever the photo is blurry, shot at a steep angle (>30 degrees), taken too far away (inch numbers smaller than ~20 px), the tape is floating away from the surface, the surface edge itself is out of frame, or you would have to guess which specific mark aligns with the edge. Provide retake guidance in "notes".

Measurement rules:
- To the nearest 1/16 inch. Standard fractions only: 0, 1/16, 1/8, 3/16, 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8, 11/16, 3/4, 13/16, 7/8, 15/16.
- Plausible ranges by measurement_type: width 10-200 in, height 10-200 in, depth 0.5-8 in. If your reading is wildly outside the hinted range, add "outside_expected_range" to "warnings" and lower confidence to at most "medium".
- Never guess. If you cannot verify the exact mark at the edge, return "low" and say so.

Return JSON ONLY in this exact shape:
{
  "inches": <integer whole inches>,
  "fraction": "<fraction string like '3/8' or '0' if none>",
  "total_inches": <decimal including fraction>,
  "confidence": "high" | "medium" | "low",
  "notes": "<human-readable note; required for low confidence; describe the specific issue and how to fix the next photo>",
  "warnings": ["<array of any problems>"]
}

Output ONLY the JSON object. No preamble, no commentary, no code fences.`;

type MeasurementType = "width" | "height" | "depth";

interface RequestBody {
  image: string; // data URL like "data:image/jpeg;base64,..."
  measurement_type: MeasurementType;
  session_id?: string;
  user_id?: string | null;
  hint?: { expected_min_in?: number; expected_max_in?: number };
}

interface MeasurementResult {
  inches: number;
  fraction: string;
  total_inches: number;
  confidence: "high" | "medium" | "low";
  notes: string;
  warnings: string[];
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Count rows in ai_usage within the last 24h for a given key. */
async function countRecentUsage(key: { user_id: string | null; session_id: string | null }): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const filter = key.user_id
    ? `user_id=eq.${key.user_id}`
    : `session_id=eq.${encodeURIComponent(key.session_id ?? "")}`;
  const url = `${SUPABASE_URL}/rest/v1/ai_usage?select=id&action=eq.tape_measure&created_at=gte.${since}&${filter}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "count=exact",
    },
  });
  if (!res.ok) return 0; // Fail open on rate-limit lookup errors.
  const total = res.headers.get("content-range")?.split("/")[1];
  return total ? parseInt(total, 10) : 0;
}

/** Insert a usage row so future calls count against the cap. */
async function recordUsage(key: { user_id: string | null; session_id: string | null }): Promise<void> {
  const url = `${SUPABASE_URL}/rest/v1/ai_usage`;
  await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      user_id: key.user_id,
      session_id: key.session_id,
      action: "tape_measure",
    }),
  });
  // Ignore errors: usage logging is best-effort.
}

/** Pull the base64 payload and media type out of a data URL. */
function parseDataUrl(dataUrl: string): { mediaType: string; data: string } | null {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/i.exec(dataUrl);
  if (!m) return null;
  return { mediaType: m[1].toLowerCase(), data: m[2] };
}

function extractJson(text: string): MeasurementResult | null {
  // Strip code fences if the model added any despite instructions.
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // Find the first `{...}` object.
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (
      typeof obj.inches === "number" &&
      typeof obj.fraction === "string" &&
      typeof obj.total_inches === "number" &&
      typeof obj.confidence === "string"
    ) {
      return {
        inches: obj.inches,
        fraction: obj.fraction,
        total_inches: obj.total_inches,
        confidence: obj.confidence,
        notes: typeof obj.notes === "string" ? obj.notes : "",
        warnings: Array.isArray(obj.warnings) ? obj.warnings.map(String) : [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  if (!ANTHROPIC_API_KEY) {
    return json(500, { error: "server_misconfigured", message: "ANTHROPIC_API_KEY not set" });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (!body.image || !body.measurement_type) {
    return json(400, { error: "missing_fields", required: ["image", "measurement_type"] });
  }
  if (!["width", "height", "depth"].includes(body.measurement_type)) {
    return json(400, { error: "invalid_measurement_type" });
  }

  const parsed = parseDataUrl(body.image);
  if (!parsed) {
    return json(400, { error: "invalid_image", message: "Expected data URL (image/jpeg|png|webp|gif)" });
  }

  // Size check — Claude's vision API caps at 5 MB per image.
  const approximateBytes = Math.ceil((parsed.data.length * 3) / 4);
  if (approximateBytes > 5 * 1024 * 1024) {
    return json(413, { error: "image_too_large", message: "Max 5 MB. Try a lower-resolution photo." });
  }

  // Rate limiting — need either session_id or user_id to track.
  const key = {
    user_id: body.user_id ?? null,
    session_id: body.user_id ? null : body.session_id ?? null,
  };
  if (!key.user_id && !key.session_id) {
    return json(400, { error: "missing_identifier", message: "Provide session_id or user_id." });
  }

  const cap = key.user_id ? RATE_LIMIT_AUTHED : RATE_LIMIT_ANONYMOUS;
  const used = await countRecentUsage(key);
  if (used >= cap) {
    return json(429, {
      error: "rate_limited",
      message: `You've used ${used} of ${cap} AI measurements in the last 24 hours. Enter the measurement manually, or come back tomorrow.`,
      fallback: "manual_entry",
      cap,
      used,
    });
  }

  // Build the user prompt with the hint.
  const hintText = body.hint
    ? `\n\nMeasurement type: ${body.measurement_type}. Expected range: ${
        body.hint.expected_min_in ?? (body.measurement_type === "depth" ? 0.5 : 10)
      }-${body.hint.expected_max_in ?? (body.measurement_type === "depth" ? 8 : 200)} inches.`
    : `\n\nMeasurement type: ${body.measurement_type}.`;

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  let responseText = "";
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: parsed.mediaType, data: parsed.data },
            },
            { type: "text", text: `Read the measurement from this tape-measure photo.${hintText}` },
          ],
        },
      ],
    });

    for (const block of message.content) {
      if (block.type === "text") responseText += block.text;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return json(502, { error: "upstream_error", message: errorMessage });
  }

  const result = extractJson(responseText);
  if (!result) {
    return json(502, {
      error: "parse_error",
      message: "Couldn't parse measurement from the model response. Try retaking the photo.",
      raw: responseText.slice(0, 500),
    });
  }

  // Record usage (fire and forget).
  recordUsage(key).catch(() => {});

  return json(200, { ...result, usage_remaining: Math.max(0, cap - used - 1), cap });
});
