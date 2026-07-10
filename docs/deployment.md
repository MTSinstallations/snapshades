# Deployment Runbook: Take SnapShades Live

Follow these steps in order. Each step is independently testable. Total time: ~45 minutes for a first deploy, ~3 minutes for every deploy thereafter (it's automatic once Vercel is hooked up).

## What you'll have when you're done

- Live production URL (e.g. `https://snapshades.vercel.app` or your custom domain)
- Supabase migrations applied, including immutable order items, payment webhooks, and the fulfillment queue
- Preview deploys on every git push — you see a unique URL for every branch before merging
- Env vars set in Vercel so browser-safe Supabase / Stripe values never live in the repo
- DNS managed in Cloudflare, with the app deployed on Vercel

## Prerequisites (check before starting)

- [x] Supabase project exists (`ghqfpqthwgwogktlkfjp`)
- [x] Repo on GitHub (`MTSinstallations/snapshade-quick-view`)
- [ ] Supabase CLI installed locally (`brew install supabase/tap/supabase`)
- [ ] Vercel account (free tier is plenty) — [vercel.com/signup](https://vercel.com/signup)
- [ ] Cloudflare account with `snapshadesandshutters.com` added as a zone

---

## Step 1 — Apply Supabase migrations (one-time)

The `supabase/migrations/` folder holds the schema this app needs. Apply any versions not yet present in the live project.

### Option A — Supabase CLI (recommended, 2 minutes)

```bash
# One-time: link this repo to your Supabase project
supabase login
supabase link --project-ref ghqfpqthwgwogktlkfjp

# Apply every migration that hasn't already run
supabase db push
```

### Option B — SQL Editor (if the CLI balks)

Open each `.sql` file in `supabase/migrations/` in numeric order and paste the SQL into **Supabase Dashboard → SQL Editor → Run**. The storefront processing migrations are:

```
20260709000002_storefront_order_processing.sql — immutable order lines, webhook ledger, fulfillment queue
20260709000003_lock_down_customer_order_writes.sql — server-authoritative order totals and payment state
20260709000004_storefront_tax_and_freight.sql — Stripe customer address used for destination tax
```

### Verify

In the Supabase dashboard → **Table Editor**, confirm `orders`, `order_items`, `fulfillment_jobs`, and `stripe_webhook_events` exist.

---

## Step 2 — Get your Supabase anon key

The `.env` in this repo has a placeholder for `VITE_SUPABASE_ANON_KEY`. We never commit the real one; it lives in Vercel.

1. Go to [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/ghqfpqthwgwogktlkfjp/settings/api)
2. Copy the `anon` / `public` key (NOT the `service_role` key — never expose that to a browser)
3. Keep the tab open — you'll paste it into Vercel in Step 4

---

## Step 3 — Push the repo to GitHub

```bash
# Check we're clean and on main
git status
git push origin main
```

If this says "fast-forward" or "up to date," you're good.

---

## Step 4 — Import the repo into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → authorize GitHub if prompted
3. Select `MTSinstallations/snapshade-quick-view`
4. Vercel auto-detects Vite — you should see:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - (These match `vercel.json` committed in this repo — no changes needed.)

5. Expand **Environment Variables** and paste:

| Name                         | Value                                                  | Notes                    |
|------------------------------|--------------------------------------------------------|--------------------------|
| `VITE_SUPABASE_URL`          | `https://ghqfpqthwgwogktlkfjp.supabase.co`             | Already in `.env`        |
| `VITE_SUPABASE_ANON_KEY`     | `<paste from Step 2>`                                  | From Supabase dashboard  |
| `VITE_STRIPE_PUBLISHABLE_KEY`| `pk_live_...` or `pk_test_...` (start with test)       | From Stripe dashboard    |
| `VITE_SITE_URL`              | `https://snapshadesandshutters.com`                    | Public canonical URL     |

Leave the Production / Preview / Development checkboxes all on.

6. Click **Deploy**. Grab a coffee; first build is ~90 seconds.

### Verify

Visit the URL Vercel gives you (`<project>.vercel.app`). You should see:

- Homepage hero: **"Snap. Measure. Shade."** with clay-orange accent
- Clicking **Rooms** in the nav loads `/inspiration`
- `Get Free Swatches` loads `/swatches/order`
- DevTools Network tab: no requests to `localhost`, no CORS errors, Supabase calls return 200

If any of those fail, check **Vercel Dashboard → Deployments → Logs** for the failing build.

---

## Step 5 — Deploy the Supabase Edge Functions (required for live orders)

The AI features (tape measure reader + room visualizer) live in edge functions. Deploy them so they're callable from the live site.

```bash
# Deploy all functions
supabase functions deploy read-tape-measure
supabase functions deploy visualize-room
supabase functions deploy create-checkout-session
supabase functions deploy get-checkout-status
supabase functions deploy stripe-webhook
```

The storefront stays in local demo mode without the browser Supabase values. A configured production frontend requires the checkout functions and secrets below before it can accept a payment.

```bash
# Tape measure (Anthropic Claude vision)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Room visualizer (Google Gemini 2.5 Flash Image — optional)
supabase secrets set GOOGLE_AI_API_KEY=AIza...

# Stripe (required for checkout)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ORDER_NOTIFICATION_EMAIL=hello@snapshadesandshutters.com
supabase secrets set ALLOWED_ORIGINS=https://snapshadesandshutters.com,https://www.snapshadesandshutters.com
supabase secrets set RATE_LIMIT_SALT=<long-random-secret>
```

See `docs/agent-instructions-stripe-setup.md` for the Stripe side. AI features are pure upgrades — the DIY flow works without them.

### Required Stripe Dashboard setup

1. Activate Stripe Tax, set the business origin address, and add every tax registration advised by the business's tax professional.
2. Set the default product tax code to **General — Tangible Goods** and configure the physical-goods shipping tax code.
3. Create a webhook endpoint for `https://ghqfpqthwgwogktlkfjp.supabase.co/functions/v1/stripe-webhook` and subscribe to checkout session completion/expiry, PaymentIntent success/failure, and charge refund events.
4. Store that endpoint's signing secret as `STRIPE_WEBHOOK_SECRET`.

The application passes Norman freight through without markup ($25 first standard unit, $11 each additional; $80 first 90-inch-or-wider unit and $50 each additional oversized unit). Stripe adds applicable destination tax during hosted payment, and the paid order stores the exact tax and final total returned by Stripe.

---

## Step 6 — Wire Cloudflare DNS to Vercel

Use Cloudflare for DNS management and Vercel for the app origin. Start with DNS-only records because Vercel does not recommend placing another reverse proxy in front of Vercel unless you knowingly accept the visibility, cache, and latency tradeoffs.

1. Vercel project → **Settings → Domains → Add**
2. Add both `snapshadesandshutters.com` and `www.snapshadesandshutters.com`
3. In Cloudflare DNS, add the records Vercel shows:

| Type | Name | Target | Proxy status |
|------|------|--------|--------------|
| A | `@` | `76.76.21.21` unless Vercel shows a project-specific value | DNS only |
| CNAME | `www` | Vercel's CNAME target, often `cname.vercel-dns.com` or `cname.vercel-dns-0.com` | DNS only |

4. In Cloudflare SSL/TLS, use **Full** or **Full (strict)**. Never use **Flexible** with Vercel; it can create redirect loops.
5. In Vercel, set the canonical redirect so either `www` redirects to apex or apex redirects to `www`.
6. Wait for Vercel to verify DNS and issue SSL, then open both hostnames.

If you later turn on Cloudflare's orange-cloud proxy, do it after launch, keep SSL/TLS on **Full** or **Full (strict)**, and do not cache `/.well-known/vercel/*`.

---

## Every deploy after the first

```bash
# Make changes, test locally
npm run dev
npm run build   # verify it builds clean
npm run test

# Commit + push
git add <files>
git commit -m "..."
git push

# Vercel auto-deploys in 30–90 seconds
# For feature branches, Vercel gives you a unique preview URL per commit
```

Branches that aren't `main` get **preview deploys** — shareable URLs like
`snapshade-quick-view-git-mybranch.vercel.app`. Click through Vercel's
comment on the PR to preview before merging.

---

## Rollback (if a deploy breaks prod)

1. Vercel Dashboard → **Deployments**
2. Find the last known-good deploy
3. Click `•••` → **Promote to Production**

Takes ~10 seconds. Then fix forward in a new commit.

---

## Health checklist (run once a week)

- [ ] [status.vercel.com](https://status.vercel.com) green
- [ ] [status.supabase.com](https://status.supabase.com) green
- [ ] [status.stripe.com](https://status.stripe.com) green
- [ ] Place a $0.50 Stripe test order end-to-end
- [ ] Verify the cart persists across browsers (log in on two devices, confirm sync)

---

## Troubleshooting

**Build fails with `Cannot find module '@fontsource-variable/inter'`**
Run `npm ci` locally to regenerate `node_modules` → push → Vercel rebuilds.

**Routes 404 on refresh**
Check `vercel.json` rewrites are present. They tell Vercel to serve `index.html` for every client-side route.

**"Supabase URL is not a valid URL" error at runtime**
You forgot to set `VITE_SUPABASE_URL` in Vercel env vars. Go to **Settings → Environment Variables → Add**, redeploy.

**"Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY" error at runtime**
The app is intentionally failing fast because browser env vars are not configured. Add both values in Vercel and redeploy.

**Cloudflare shows `ERR_TOO_MANY_REDIRECTS`**
Set Cloudflare SSL/TLS to **Full** or **Full (strict)**. **Flexible** sends HTTP to Vercel, and Vercel redirects back to HTTPS.

**Edge function logs are empty**
Set `LOG_LEVEL=debug` via `supabase secrets set LOG_LEVEL=debug` and redeploy the function.

**Images 404**
Real photography hasn't landed yet (see `docs/dealer-portal-tasks.md`). The app falls back to warm gradients — this is expected.
