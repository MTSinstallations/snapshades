# SnapShades & Shutters

Custom blinds, shades, and shutters storefront built with React, Vite, TypeScript, Tailwind, Supabase, and Stripe.

## Quick Commands

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run test:e2e
```

## Deployment

- Frontend hosting: Vercel
- DNS/domain management: Cloudflare
- Backend: Supabase PostgreSQL, Auth, Storage, and Edge Functions
- Payments: Stripe Checkout, Payment Intents, and Connect

Set browser-safe values in Vercel:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_SITE_URL
```

Set server secrets in Supabase, not Vercel:

```bash
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

See [docs/deployment.md](docs/deployment.md) for the production runbook.
