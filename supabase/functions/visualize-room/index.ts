// Supabase Edge Function: visualize-room
//
// Accepts a base64 photo of the customer's window + a product descriptor,
// calls a generative image model to composite the product into the scene,
// and returns the result image (base64). Debits 1 AI credit per successful
// generation — no charge on errors.
//
// Primary provider: Google Gemini 2.5 Flash Image ("Nano Banana") — excellent
// at photoreal product-placement edits and cheap (~$0.04 / image).
// If GOOGLE_AI_API_KEY is not set, the function returns a 501
// "not_configured" status so the UI can gracefully fall back to the free
// canvas composite.
//
// Environment:
//   GOOGLE_AI_API_KEY          — required to actually run generation
//   SUPABASE_URL               — provided at runtime
//   SUPABASE_SERVICE_ROLE_KEY  — provided at runtime

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const GEMINI_MODEL = "gemini-2.5-flash-image-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  window_photo: string; // data URL
  product_type: string; // e.g. "Honeycomb shade", "Plantation shutters"
  color_hex: string; // e.g. "#F0E8D8"
  color_name: string; // e.g. "Cream"
  coverage_percent: number; // 30-95
  session_id?: string;
  user_id?: string | null;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseDataUrl(dataUrl: string): { mediaType: string; data: string } | null {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i.exec(dataUrl);
  if (!m) return null;
  return { mediaType: m[1].toLowerCase(), data: m[2] };
}

/** Call Gemini Flash Image for product placement. Returns image base64 or throws. */
async function callGemini(args: {
  imageMediaType: string;
  imageData: string;
  productType: string;
  colorName: string;
  colorHex: string;
  coveragePercent: number;
}): Promise<{ mediaType: string; data: string }> {
  const prompt = `Photorealistically add a ${args.productType.toLowerCase()} in color ${args.colorName} (${args.colorHex}) to the window in this image. The window covering should cover approximately ${args.coveragePercent}% of the window from the top down. Keep everything else identical — same lighting, same perspective, same room, same camera framing. Match the existing light direction and cast natural drop shadows. Preserve fine fabric / louver texture detail. Return ONLY the edited image, no text.`;

  const response = await fetch(`${GEMINI_URL}?key=${GOOGLE_AI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inline_data: { mime_type: args.imageMediaType, data: args.imageData } },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inline_data?: { mime_type?: string; data?: string } }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inline_data?.data && p.inline_data.mime_type) {
      return { mediaType: p.inline_data.mime_type, data: p.inline_data.data };
    }
  }
  throw new Error("Gemini returned no image");
}

/** Call the spend_ai_credit RPC. Returns new balance, or null if insufficient. */
async function spendOneCredit(
  userId: string | null,
  sessionId: string | null,
  reason: string
): Promise<number | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/spend_ai_credit`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_user_id: userId,
      p_session_id: sessionId,
      p_reason: reason,
      p_metadata: null,
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  if (typeof body === "number") return body;
  return null;
}

/** Refund a credit when generation fails after we spent one. */
async function refundOneCredit(
  userId: string | null,
  sessionId: string | null,
  reason: string
): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/award_ai_credits`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_user_id: userId,
      p_session_id: sessionId,
      p_amount: 1,
      p_reason: `refund: ${reason}`,
      p_metadata: null,
    }),
  }).catch(() => {});
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (!body.window_photo || !body.product_type || !body.color_hex || !body.color_name) {
    return json(400, {
      error: "missing_fields",
      required: ["window_photo", "product_type", "color_hex", "color_name"],
    });
  }

  const coverage = Math.max(30, Math.min(95, Math.round(body.coverage_percent || 70)));

  const parsed = parseDataUrl(body.window_photo);
  if (!parsed) {
    return json(400, { error: "invalid_image", message: "Expected data URL (image/jpeg|png|webp)" });
  }

  const approxBytes = Math.ceil((parsed.data.length * 3) / 4);
  if (approxBytes > 10 * 1024 * 1024) {
    return json(413, { error: "image_too_large", message: "Max 10 MB. Try a lower-resolution photo." });
  }

  // If provider not configured, return coming-soon so the UI can fall back.
  if (!GOOGLE_AI_API_KEY) {
    return json(501, {
      error: "not_configured",
      message: "AI visualization isn't turned on yet. Quick preview (free, unlimited) is available below.",
    });
  }

  const userId = body.user_id ?? null;
  const sessionId = userId ? null : body.session_id ?? null;
  if (!userId && !sessionId) {
    return json(400, { error: "missing_identifier", message: "Provide session_id or user_id." });
  }

  // Debit before calling the expensive API, so simultaneous requests can't
  // burn more than the balance. Refund on failure.
  const newBalance = await spendOneCredit(userId, sessionId, "visualize-room");
  if (newBalance === null) {
    return json(402, {
      error: "out_of_credits",
      message: "You're out of AI visualizations. Order free swatches to earn 5 more.",
      upsell: { action: "swatch_order", reward: 5 },
    });
  }

  try {
    const generated = await callGemini({
      imageMediaType: parsed.mediaType,
      imageData: parsed.data,
      productType: body.product_type,
      colorName: body.color_name,
      colorHex: body.color_hex,
      coveragePercent: coverage,
    });

    return json(200, {
      status: "ok",
      image: `data:${generated.mediaType};base64,${generated.data}`,
      balance_remaining: newBalance,
    });
  } catch (err) {
    await refundOneCredit(userId, sessionId, "visualize-room generation failed");
    const message = err instanceof Error ? err.message : String(err);
    return json(502, {
      error: "generation_failed",
      message: `Couldn't generate the preview (${message.slice(0, 120)}). Your credit has been refunded.`,
    });
  }
});
