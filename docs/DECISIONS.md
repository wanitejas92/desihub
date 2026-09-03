# DesiHub — Architecture Decisions & Build Log

This log records every meaningful architectural choice and why, plus what was
built and what is still open, per phase. Newest entries at the top of each
section.

---

## Phase 1 — Listings layer (mobile)

### What was built

- **Expo SDK 52 app** (Expo Router, React Native 0.76, NativeWind v4) sharing the
  design tokens and the exact same 30-event catalogue via `@desihub/shared`.
- Tabs: **Discover / Search / Saved / Profile**, plus a native event-detail
  screen (`app/e/[slug].tsx`).
  - *Discover*: Season banner (live festival / off-season countdown), This
    weekend / Featured / Near you rails, category chips.
  - *Search*: live query + category/city/free filters, 2-column results, empty
    state; deep-linkable via `?category=`.
  - *Saved*: AsyncStorage-backed, grouped upcoming/past, designed empty state.
  - *Profile*: saved count, appearance (light/dark/system) persisted, accounts
    teaser for Phase 2.
- **Push permission is requested only on the first save**, never on launch
  (`lib/saved.ts` → `lib/notifications.ts`), per the brief.
- Native `EventImage` renders an `expo-image` (blurhash) or the branded
  `FallbackCard` (gradient by category) — a broken/empty image never renders.
- Dark mode is first-class via NativeWind `colorScheme`, themed by the same
  token roles as web (CSS variables in `global.css`, light + `.dark`).

### Decisions

- **Mobile shares the pure data layer** from `@desihub/shared` — same repository
  interface, mock catalogue and filter semantics as web. No duplicated events.
- **Phase 1 mobile is mock-only**; the Supabase/React-Native adapter (AsyncStorage
  auth) lands with accounts in Phase 2. Screens only see `EventRepository`.
- **NativeWind (Tailwind v3)** on mobile vs **Tailwind v4** on web: the shared
  token preset is written to satisfy both. The mobile `tailwind.config.ts` is a
  TS file so jiti can resolve the shared TS preset; it's excluded from `tsc`
  (Tailwind v3's stricter config types don't match the shared preset's tuples —
  a config-file-only concern, not app code).
- **Single `@types/react` (19.0.7) pinned workspace-wide** via pnpm `overrides`.
  Web is React 19 and mobile is React 18.3; without the pin, two `@types/react`
  copies leaked through `@types/react-dom` and broke web's JSX types
  ("Suspense cannot be used as a JSX component"). One version typechecks both.

### Verification & honest limits

- `tsc --noEmit` and `eslint` (0 warnings) pass for the mobile app; the shared
  logic it relies on is unit-tested in `@desihub/shared`.
- **This container has no Android/iOS simulator and can't run Metro**, so the
  mobile app was **not** launched or screenshotted here — unlike web, which was
  built, served and visually verified. Mobile is validated by typecheck + lint +
  shared-logic tests. To run it: `pnpm --filter @desihub/mobile start`.

### Open / deferred

- No device-level visual pass or E2E (Detox/Maestro) yet — needs a simulator.
- Supabase adapter for RN, real auth, and the wallet/tickets screens are Phase 2/3.

---

## Phase 1 — Listings layer (web)

### What was built

- **Next.js 15 web app** (App Router, RSC, Tailwind v4) consuming the shared
  packages. Pages: home, `/browse` (URL-driven filters), `/e/[slug]` event
  detail, `/o/[slug]` organiser, `/submit`, `/admin/import`. Plus `sitemap.xml`,
  `robots.txt`, per-event dynamic OG images, and designed `not-found`, `error`
  and `loading` states.
- **Repository pattern for data.** One `EventRepository` interface with two
  implementations — a Supabase adapter and an in-memory mock seeded from the
  same 30-event catalogue. The app picks the mock automatically when Supabase
  env is absent, so the site renders, builds and is E2E-tested with no backend.
  The filtering/sorting semantics live in a pure, unit-tested `applyFilters`.
- **Signature moments**: the festival **Season strip** (live festival banner or
  off-season countdown, driven by `packages/shared/season`), event cards with a
  full-bleed image, floating date chip and category pill, and the branded
  **fallback card** generator (deterministic SVG) so a missing image is never a
  broken image — and we never scrape organiser artwork.
- **SEO**: server-rendered, JSON-LD `Event` on every event page, canonical URLs,
  sitemap, and per-event OG images via `next/og`.
- **`/admin/import`**: a deterministic, unit-tested text extractor that pulls
  title/date/city/category/price from a pasted Facebook/Instagram/Eventbrite
  blob into a reviewable draft with per-field confidence. **Text only** — it
  never fetches or copies images.
- **Accessibility**: semantic landmarks, skip link, labelled controls, visible
  focus rings, `aria-live` result counts, and contrast-checked token pairs.
- **Every list has designed empty / loading / error states.**

### Decisions

- **Data access via a repository interface**, not direct Supabase calls in
  components. This keeps the UI backend-agnostic, makes the mock/offline mode
  first-class (not a hack), and means Phase 3's ticketing provider swap and any
  schema change never touch the pages.
- **The mock catalogue mirrors `seed.sql`** rather than inventing data: it's the
  same events, kept as the dev/offline/E2E fixture behind the adapter — honouring
  "never invent an API response".
- **Fallback images are inline data-URI SVGs, loaded eagerly** (zero network
  cost, so lazy-loading them only causes blank cards). Real uploaded images use
  `next/image` and stay lazy.
- **`experimental.typedRoutes` disabled**: it requires Next's generated route
  manifest, which standalone `tsc --noEmit` (the pre-commit/CI typecheck) can't
  see, so it produced false type errors. Not worth the friction here.
- **Follows are stored in `localStorage` in Phase 1** (works with no account);
  Phase 2 migrates them into the `follows` table on sign-in.
- **i18n scaffolding**: UI locales `en`/`nl`/`hi` are defined in shared from day
  one; only English strings are filled. A message-catalogue layer lands with
  Phase 4's multi-language UI.

### Verification (what actually ran)

- `tsc --noEmit`, `eslint` (0 warnings) and a **production build** (47 routes,
  all 30 events + 8 organisers prerendered) pass.
- **Vitest**: shared (35) + ui-tokens (3) + web extractor (6) = 44 unit tests.
- **Playwright E2E** across mobile + desktop projects: discover → browse →
  filter → empty-state → event (JSON-LD asserted) → free-event state → submit →
  organiser → admin-import.
- **Visual pass**: screenshots at 390px and 1440px in light and dark for home,
  browse, event, organiser, submit and admin/import. Fixed two issues found this
  way — a doubled date chip on the event hero, and blank below-fold cards from
  lazy-loading inline fallbacks.

### Open / deferred

- "Near you" uses a city fallback, not geolocation yet (a proactive-improvement
  candidate).
- Image upload + server-side resize/WebP/EXIF-strip pipeline is speced (Storage
  buckets exist, `next/image` wired) but the upload UI + transform function land
  with organiser accounts in Phase 2/3; Phase 1 events use uploads-or-fallback.
- The mobile Expo app is the next Phase 1 deliverable.

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
