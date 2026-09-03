# DesiHub — Architecture Decisions & Build Log

This log records every meaningful architectural choice and why, plus what was
built and what is still open, per phase. Newest entries at the top of each
section.

---

## Phase 0 — Foundation

### What was built

- **Monorepo** with pnpm workspaces: `apps/web`, `apps/mobile`, `packages/shared`,
  `packages/ui-tokens`, `packages/eslint-config`, `supabase/`, `docs/`.
- **Strict TypeScript** everywhere (`tsconfig.base.json` with `noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noUnusedLocals/Parameters`, etc.), Prettier, a shared flat
  ESLint config, and a Husky pre-commit running lint-staged + typecheck + tests.
- **`packages/ui-tokens`** — the single source of truth for design tokens (colour,
  type scale 12/14/16/20/28/40/56, spacing, radius, one shadow, motion). Tokens are
  authored in TypeScript and a generator emits `tokens.css` (web CSS variables); a
  vitest test fails the build if the committed CSS drifts from the TS source. A
  shared Tailwind preset maps semantic colour roles to CSS variables so one set of
  class names renders correctly in light/dark on both web and mobile.
- **`packages/shared`** — Zod schemas mirroring every DB table, inferred TS types,
  money utilities (integer-cents, fee model, EUR formatting), timezone-correct date
  handling (Europe/Amsterdam), the festival-season calendar that powers the home
  "Season" strip, slug helpers, and a Supabase client factory. 35 unit tests.
- **Supabase** — four migrations (`0001_init`, `0002_functions_triggers`,
  `0003_rls`, `0004_storage`) and `seed.sql` (8 organisers, 12 venues, 30 events
  across all 12 categories and 6 cities). Validated end-to-end against a real
  Postgres 16 with stubbed `auth`/`storage` schemas.

### Decisions

- **Accent colour: deep marigold `#E8802A`.** Committed, per the brief's "pick one".
  Warm and festive without being a gold gradient; colour otherwise comes from event
  photography, not chrome.
- **Fonts: Fraunces (display) + Geist (UI).** Both OFL/self-hostable, avoiding the
  "Devanagari-style Latin" trap. Fallbacks: Georgia/serif and Inter/system-ui.
- **Money is integer cents, never floats.** All pricing/fee logic lives in
  `packages/shared/money.ts` with a transparent fee model (5% + €0.60/ticket) and
  `absorb`/`pass_on` modes matching the `ticket_types.fee_mode` column.
- **Timezones**: timestamps stored as `timestamptz` (UTC), always rendered in the
  venue timezone (`Europe/Amsterdam`) so a user abroad still sees the local door
  time. Date logic is tested across the UTC day boundary.
- **Prices stored in `*_cents` integer columns** rather than the brief's bare
  `min_price`/`max_price`, for exactness. Documented here as the deliberate rename.
- **RLS on from day one.** Default-deny; public read limited to
  published/cancelled/sold-out events and their ticket types. Organisers manage only
  their own rows via `owns_organiser()`; admins via `is_admin()`. Buyers see only
  their own orders/tickets; event organisers can read tickets for door scanning.
- **No overselling is enforced at three layers**: a `CHECK (sold <= quantity)`
  constraint (final backstop), an atomic `reserve_tickets()` function for graceful
  checkout failure, and a trigger that flips events to `sold_out` and back
  automatically. All three verified on real Postgres.
- **Storage buckets**: `event-images` and `organiser-logos` public;
  `user-avatars` private with owner-only RLS keyed on the `<uid>/` path prefix.
- **Seed images are intentionally null** so the branded fallback-card pipeline is
  exercised, and because we never scrape or embed organiser artwork (copyright rule).

### Environment constraints (honest limits, not skipped work)

- This build runs in an ephemeral container **without Docker**, so `supabase start`
  (the full local stack) cannot run here. Instead the SQL was validated against a
  **real Postgres 16 server** with minimal `auth`/`storage` stubs — migrations,
  constraints, the oversell guard, `reserve_tickets`, and the sold-out trigger were
  all executed and asserted. To run the full stack locally: install the Supabase CLI
  and run `supabase start && supabase db reset`.

### Open / deferred

- Generated TypeScript types from the live Supabase schema (`supabase gen types`)
  are not wired yet; the Zod-inferred types in `packages/shared` are the contract
  until then.
- `apps/web` and `apps/mobile` are scaffolded in Phase 1 (below).
