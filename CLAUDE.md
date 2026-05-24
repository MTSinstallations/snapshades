# SnapShades & Shutters — Claude Code Instructions

## Quick Commands

```bash
npm run build          # Production build (must pass with zero errors)
npm run test           # Vitest (run mode, not watch)
npm run test:watch     # Vitest in watch mode (for development)
npm run lint           # ESLint
npm run dev            # Vite dev server (port 8080)
npx tsc --noEmit -p tsconfig.app.json  # TypeScript type-check only
npx playwright test    # E2E tests (requires dev server running)
```

## Build-Test-Verify Loop

After EVERY code change, follow this loop before committing:

1. `npm run build` — must complete with zero errors
2. `npx tsc --noEmit -p tsconfig.app.json` — must pass with no type errors
3. `npm run test` — all vitest tests must pass
4. Start dev server via preview tools, visually verify the change works
5. If the change touches user flows, run `npx playwright test`
6. If anything fails, fix and restart from step 1
7. On success, commit with a descriptive message (see Commit Convention below)

Never skip this loop. Never commit code that fails build or tests.

## Architecture

### Directory Structure
```
src/
  App.tsx                  # All routes defined here (React Router v6)
  main.tsx                 # Entry point
  components/
    ui/                    # shadcn/ui primitives — DO NOT edit manually
    addwindow/             # Add-window form sub-components
    ux/                    # Shared animation/interaction utilities
    *.tsx                  # Feature components
  pages/                   # One file per route (~28 pages, lazy-loaded)
  lib/                     # Business logic, engines, utilities, types
  data/                    # Product catalogs (Norman, Levolor, Onyx)
  hooks/                   # Custom React hooks (useCart, use-mobile, use-toast)
  contexts/                # React contexts (AuthContext)
  test/                    # Test setup and test files
```

### Import Alias
`@/` maps to `src/`. Always use `@/` imports, never relative paths like `../../`.
```ts
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/hooks/useCart";
```

### Key Files
- `src/lib/types.ts` — All status enums (OrderStatus, ServiceTier, etc.). Use these, never raw strings.
- `src/lib/constants.ts` — PRICE_MULTIPLIER (0.36), PLATFORM_FEE_RATE (0.10), DEFAULT_TAX_RATE (0.07)
- `src/lib/service-pricing-engine.ts` — Measure, install, and design pricing logic
- `src/lib/persistent-cart.ts` — Cart persistence (Supabase + localStorage fallback)
- `src/hooks/useCart.ts` — Cart state management (CartWindow interface)
- `src/contexts/AuthContext.tsx` — Supabase auth (user, session, signIn, signUp, signOut)

### Component Patterns
- Use shadcn/ui components from `@/components/ui/` for all UI primitives
- Use Tailwind utility classes, no custom CSS files (except index.css for CSS variables)
- Use `sonner` for toast notifications
- Use `react-hook-form` + `zod` for form validation
- Use `@tanstack/react-query` for server state
- Use `framer-motion` for animations
- Use `lucide-react` for icons
- Lazy-load pages with `React.lazy()` (see App.tsx pattern)

### Data Flow
- Auth: Supabase Auth via AuthContext
- Database: Supabase client from `@/lib/supabase`
- Cart: useCart hook (localStorage + Supabase sync)
- Payments: Stripe via `@/lib/stripe-client` and `@/lib/payment-engine`

## Business Rules

### Pricing
- Products have a `retailPrice` (manufacturer MSRP from 2026 catalogs)
- Customer price = `retailPrice * 0.36` (PRICE_MULTIPLIER in constants.ts)
- Formula: retail × 0.30 (dealer cost) × 1.20 (20% markup) = 0.36

### Service Tiers (ServiceTier type: 'ship' | 'install' | 'design')
- **Ship**: Product only, customer self-installs
- **Install**: Product + professional installation
  - $100 minimum (includes 1 blind), $30 each additional
  - Surcharges: motorization +$10/window, ladder +$40, hard surface +$40, 3rd story+ +$100
  - Travel: free < 20 miles, $1/mile after
- **Design**: Product + design consultation + installation
  - $50/hour customer rate
  - Designer gets 70%, SnapShades keeps 30%

### Platform Fee
- 10% platform fee on all contractor jobs
- Contractor receives 90% via weekly ACH

### Manufacturers
- **Norman** — premium tier: shutters, faux wood, roller, roman, wood blinds, specialty
- **Levolor** — mid tier: blinds, cellular, faux wood, roller, roman, specialty
- **Onyx** — budget tier: shutters

## TypeScript
- Always add proper types for new code (interfaces, not `any`)
- Use the type definitions in `src/lib/types.ts` for status values
- `vitest/globals` types are available (no need to import describe/it/expect in tests)

## Testing

### Vitest (Unit/Component Tests)
- Config: `vitest.config.ts`
- Setup: `src/test/setup.ts` (includes @testing-library/jest-dom and matchMedia mock)
- Pattern: `src/**/*.{test,spec}.{ts,tsx}`
- Use `@testing-library/react` for component tests
- Globals enabled (describe, it, expect available without import)

### Playwright (E2E Tests)
- Config: `playwright.config.ts`
- Always start dev server before running E2E tests

### Test Requirements
- Write tests alongside every new feature
- Test file goes next to the source file or in src/test/
- At minimum test: component renders, key interactions, business logic functions

## Commit Convention
Format:
```
type: Short description of the change

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`

## Environment
- `.env` contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (never commit secrets)
- Vite exposes env vars prefixed with VITE_
- Dev server port: 8080 (vite.config.ts), preview launch.json uses port 5199

## Do NOT
- Edit files in `src/components/ui/` by hand — use `npx shadcn-ui add <component>`
- Use relative imports when `@/` works
- Use raw status strings — import from `@/lib/types.ts`
- Skip the build-test-verify loop
- Commit without running build + test
- Use `any` type in new code when a proper type exists
