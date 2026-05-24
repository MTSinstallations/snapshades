/**
 * AI session identifier — opaque, persistent per browser.
 *
 * Used as the rate-limit key for anonymous callers of AI endpoints (tape
 * measure, room visualizer). Logged-in users rate-limit against their
 * Supabase auth user ID instead; session_id is a fallback.
 */

const STORAGE_KEY = "snapshades_ai_session";

/** Get or lazily create the browser's AI session ID. Stable for the life of localStorage. */
export function getAiSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 16) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // Private-browsing / disabled storage: fall back to an in-memory ID.
    return "ephemeral-" + Math.random().toString(36).slice(2) + Date.now();
  }
}
