# Cloudflare + Vercel Launch Checklist

## Recommended Architecture

- Vercel hosts the Vite build from GitHub.
- Cloudflare manages DNS for `snapshadesandshutters.com`.
- Supabase remains the backend for auth, database, storage, and edge functions.
- Stripe remains the payment processor.

This migration removes builder-specific tooling without rewriting working backend flows.

## Cloudflare DNS Records

After the domain is added in Vercel, copy the exact records Vercel shows into Cloudflare.

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `@` | `76.76.21.21` unless Vercel shows another value | DNS only |
| CNAME | `www` | Vercel CNAME target | DNS only |

Keep Cloudflare DNS records gray-clouded for launch. Vercel recommends avoiding an extra reverse proxy in front of Vercel. If you later orange-cloud the records, keep Cloudflare SSL/TLS on **Full** or **Full (strict)** and exclude `/.well-known/vercel/*` from caching.

## Required Vercel Env Vars

```bash
VITE_SUPABASE_URL=https://ghqfpqthwgwogktlkfjp.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase anon public key>
VITE_SITE_URL=https://snapshadesandshutters.com
```

## Required Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=<stripe secret key>
supabase secrets set STRIPE_WEBHOOK_SECRET=<stripe webhook secret>
supabase secrets set ANTHROPIC_API_KEY=<anthropic key>
supabase secrets set GOOGLE_AI_API_KEY=<google ai key>
```

Only set the AI keys when those features are ready to be live.

## Verification

1. Open the Vercel production URL.
2. Open `https://snapshadesandshutters.com`.
3. Open `https://www.snapshadesandshutters.com` and confirm it redirects to the canonical host.
4. Refresh a nested route such as `/products` and confirm there is no 404.
5. Confirm Supabase requests return 200s in DevTools.
6. Place a Stripe test order before switching to live Stripe keys.
