# AI Agent Instructions: Deploy SnapShades to Vercel with Cloudflare DNS

Hand this entire document to an AI assistant (Claude Code, Cursor, ChatGPT agent, etc.) or follow the steps yourself. The agent has ~15 minutes of work; you have ~5 minutes of clicking and copy-pasting.

## Context
SnapShades is a Vite + React SPA committed to GitHub at `https://github.com/MTSinstallations/snapshades`. It deploys on Vercel with Cloudflare managing DNS for `snapshadesandshutters.com`. All Vercel config (`vercel.json`), SPA rewrites, security headers, and cache policies are in the repo.

## What you'll have at the end
- Live production URL and custom domain
- Custom domain routed through Cloudflare DNS
- Automatic deploys on every `git push origin main`
- Preview deploys on every feature branch

## Prerequisites (Michael supplies these before you start)
- [ ] Vercel account (free tier) — [vercel.com/signup](https://vercel.com/signup) with Michael's GitHub login
- [ ] Cloudflare account with the domain zone added
- [ ] Supabase anon key — copy from [Supabase API settings](https://supabase.com/dashboard/project/ghqfpqthwgwogktlkfjp/settings/api) → `anon / public` (starts with `eyJ`). **Never use the `service_role` key.**
- [ ] Server-side Stripe and webhook secrets installed in Supabase Edge Functions

---

## Step 1 — Import the repo into Vercel (UI, ~2 minutes)

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Under "Import Git Repository", select `MTSinstallations/snapshades`
   - If it's not listed: click "Adjust GitHub App Permissions" → grant Vercel access to the repo → refresh
3. Vercel should auto-detect Vite. Confirm these:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (should prefill from `vercel.json`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
4. **Don't click Deploy yet** — expand **Environment Variables** first.

## Step 2 — Set environment variables (UI, ~2 minutes)

Add these browser-safe values. For each, select **Production, Preview, and Development** checkboxes.

| Name | Value | Notes |
|------|-------|-------|
| `VITE_SUPABASE_URL` | `https://ghqfpqthwgwogktlkfjp.supabase.co` | Fixed, copy exactly |
| `VITE_SUPABASE_ANON_KEY` | *(the anon key from prerequisites)* | Long JWT starting with `eyJ` |
| `VITE_SITE_URL` | `https://snapshadesandshutters.com` | Canonical production URL |

**Now click Deploy.** First build takes ~90 seconds.

## Step 3 — Verify the deployment (~1 minute)

Vercel will land you on the project dashboard. Open the production URL.

- [ ] Homepage hero renders: "Custom window coverings. Without the markup."
- [ ] `/order` offers exactly the three approved product families
- [ ] `/privacy`, `/terms`, and `/warranty` render without 404s
- [ ] DevTools Network has no requests to localhost and Supabase calls succeed

If the site loads but data fetches fail, check **Settings → Environment Variables** — the most common mistake is forgetting to tick "Production" on the anon key.

## Step 4 — Add the Cloudflare-managed custom domain (~5 minutes)

Only do this when you're ready for `snapshadesandshutters.com` to go live.

1. Vercel project → **Settings → Domains → Add**
2. Enter `snapshadesandshutters.com` and `www.snapshadesandshutters.com`
3. Vercel shows DNS records (a CNAME for `www`, an A record for the apex)
4. Log into Cloudflare → DNS → paste those records
5. Set both records to **DNS only** first. This avoids stacking Cloudflare's reverse proxy in front of Vercel during launch.
6. Cloudflare SSL/TLS must be **Full** or **Full (strict)**. Do not use **Flexible**.
7. Wait 2–15 minutes for DNS → Vercel auto-issues the SSL cert

Until this step is done, Michael's `.vercel.app` URL stays live.

## Step 5 — Verify auto-deploy

Make any trivial change in the repo (e.g. bump a version in `package.json`), commit, push. Within 90 seconds Vercel should kick off a new build visible under the project's Deployments tab. If not, check **Settings → Git** and confirm the GitHub integration is connected.

---

## Troubleshooting

**Build fails with `vite: not found` or `Cannot find module`**
→ Run `npm ci` locally, commit the `package-lock.json`, push, rebuild.

**Routes 404 on refresh** (hit `/products/plantation-shutters`, works; refresh, 404)
→ Confirm `vercel.json` is committed and has the `rewrites` block. Already set up, but double-check.

**Images 404**
→ Expected. `public/images/` is mostly placeholder gradients until manufacturer photography is imported (see `docs/dealer-portal-tasks.md`).

**Secure checkout is temporarily unavailable**
→ Hosted Checkout is server-created. Verify `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Stripe Tax setup, and the deployed Supabase checkout functions; no Stripe secret belongs in Vercel or browser code.

**AI tape-measure feature says "AI not configured"**
→ That's the Supabase edge function, not Vercel. Set `ANTHROPIC_API_KEY` via `supabase secrets set ANTHROPIC_API_KEY=...` and deploy with `supabase functions deploy read-tape-measure`. Unrelated to this Vercel task.

## After you're live

- The project root README.md has a "Quick Commands" section with `npm run dev`, `npm run build`, `npm run test`.
- Every commit to `main` auto-deploys in ~90 seconds.
- Every branch gets a preview URL visible on the GitHub PR.
- Rollback a bad deploy: Vercel **Deployments** → find the last good one → `•••` → **Promote to Production**.

## Report back

When done, share:
- [ ] Production URL
- [ ] Screenshot of Settings → Environment Variables (to confirm vars set)
- [ ] Any errors encountered

If you hit anything that blocks, report the exact error message — don't force-push or try to fix builds from the Vercel UI.
