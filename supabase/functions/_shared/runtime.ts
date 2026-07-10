import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@^2.100.0';

const DEFAULT_SITE_URL = 'https://snapshadesandshutters.com';

function secretKeyFromEnvironment(): string {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;

  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}') as Record<string, string>;
    return keys.default || '';
  } catch {
    return '';
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const key = secretKeyFromEnvironment();
  if (!url || !key) throw new Error('Supabase server credentials are unavailable.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getStripeSecret(): string {
  const key = Deno.env.get('STRIPE_SECRET_KEY') || '';
  if (!key) throw new Error('Stripe is not configured.');
  return key;
}

export function allowedOrigins(): Set<string> {
  const configured = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('SITE_URL') || DEFAULT_SITE_URL)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try { return new URL(value).origin; } catch { return ''; }
    })
    .filter(Boolean);

  return new Set([
    ...configured,
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5199',
    'http://127.0.0.1:5199',
  ]);
}

export function requestOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  try {
    const normalized = new URL(origin).origin;
    return allowedOrigins().has(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = requestOrigin(req);
  return {
    'Access-Control-Allow-Origin': origin || DEFAULT_SITE_URL,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function assertPublicPost(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed.' }, 405);
  if (req.headers.get('origin') && !requestOrigin(req)) {
    return jsonResponse(req, { error: 'Origin not allowed.' }, 403);
  }
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 100_000) return jsonResponse(req, { error: 'Request is too large.' }, 413);
  return null;
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function clientIp(req: Request): string {
  return (req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]
    || 'unknown').trim();
}

export function safeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
