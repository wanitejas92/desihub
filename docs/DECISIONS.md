# DesiHub — Architecture Decisions & Build Log

This log records every meaningful architectural choice and why, plus what was
built and what is still open, per phase. Newest entries at the top of each
section.

---

## Phase 1 — Full design-system rewrite: "premium European startup" brief

The user supplied a complete, prescriptive design brief (exact hex palette,
typography, radius/shadow/spacing system, a full button taxonomy, card/chip/
badge/input specs) with one explicit, load-bearing instruction: **no dark
theme**. This supersedes every prior colour pass this build (marigold →
DesiPass-crimson → gradient-monogram-magenta → this) — this one is a real
design system, not another accent swap, so it's documented as its own entry
rather than folded into the previous one.

### What was built

- **Tokens rewritten wholesale** (`packages/ui-tokens/src/tokens.ts`): the
  brief's exact palette (`#FAFAF7` bg, `#171A35` navy text, `#FF8A00` /
  `#F0446F` / `#7B35D6` orange/pink/purple accents, soft tint backgrounds),
  an 8px spacing scale, the brief's radius steps (10/12/16/20/pill), and
  soft-only shadows (`0 4px 16px rgba(23,26,53,.06)`). `colorRoles` is now
  `{ light: {...} }` only — no `dark` branch — and `accentPink`/
  `accentPurple` roles were added alongside `accent` (orange) so the two
  secondary brand colours are real, reusable tokens, not one-off hex.
- **Dark theme removed, not hidden.** Deleted `ThemeToggle`, the
  localStorage theme-persistence script and `data-theme` attribute in
  `layout.tsx`, the `@media (prefers-color-scheme: dark)` /
  `[data-theme='dark']` blocks in the `tokens.css` generator, mobile's
  `.dark` CSS block, and every `useColorScheme`/dark-conditional branch in
  the Expo app (root layout's theme bootstrap, the tab bar's light/dark
  tint switch, Profile's whole "Appearance" picker). A stale toggle that
  does nothing is worse than no toggle.
- **Typography swapped**: Fraunces (serif display) → Inter everywhere,
  changed once in `fontFamily.display`/`.sans` since every heading already
  routes through the `font-display` token rather than a hardcoded family —
  no per-component edits needed for the type change itself.
- **A real `Button` component** (`apps/web/src/components/ui/button.tsx`):
  primary (gradient bg, white text), secondary (white + border), outline
  (transparent + orange), soft (tinted bg + tone-matched text, orange/pink/
  purple), text — one polymorphic component (renders `<Link>` when `href`
  is passed, `<button>` otherwise) so every CTA in the app got the same
  variant/size rules in one place instead of N hand-rolled class strings.
- **An original line-icon set** (`apps/web/src/components/ui/icons.tsx`,
  ~24 icons incl. one per event category) replacing the emoji used
  throughout Phase 1's earlier passes (🔥📅📍🔍🎟️✨🧩 etc.) — the brief is
  explicit that the product should read premium and modern, not "childish,"
  and emoji-as-icon cuts against that everywhere it showed up (nav, chips,
  badges, category tiles, empty states).
- **Card/chip/input specs applied**: event card image aspect 4:5 → 4:3
  (brief: "16:10 or 4:3"), 16px radius + border + soft shadow; category
  tiles get soft orange/pink/purple icon badges instead of a flat emoji;
  search/select inputs get a focus glow (`box-shadow` ring in `.input:focus`)
  per "subtle accent border or soft glow."
- **Decorative gradients realigned to the brand trio.** The organiser-banner
  and Popular-Cities gradient palette (`apps/web/src/lib/gradient.ts`) used
  an arbitrary 6-colour set left over from the crimson pass (teal, green,
  rust); replaced with two-stop slices of orange/pink/purple so those
  "no-photo" banners read as DesiHub rather than an unrelated palette.

### Bug caught before shipping

- Changing the card image aspect ratio (4:5 → 4:3) broke the branded
  fallback-card SVG: `EventCard` wasn't passing `fallbackWidth`/
  `fallbackHeight` to `EventImage`, so it kept using the generator's 800×1000
  default on a now-800×600 box. The generator's title/caption `y` positions
  are computed relative to `height` (`h - 60 - …`), so the mismatch pushed
  the title down past the new, shorter frame — titles rendered clipped or
  overlapping the sold-out/cancelled bar. Fixed by passing the matching
  `800×600` fallback dimensions from the card. Caught by actually rendering
  the grid at full size and looking, not by reading the diff — the same
  render-before-shipping discipline as the logo-mark bugs two passes ago.

### Decisions

- **Gradient stays a brand accent, not a UI-wide treatment**, per the
  brief's own "never as the main page background… keep it subtle." Applied
  to: the logo/wordmark, primary buttons, the announcement ribbon, and
  decorative banners with no photo. Not applied to: borders, focus rings,
  category chips (soft tints instead), or body text.
- **Category-specific fallback-card gradients (12 hues, one per category)
  were left alone**, not forced into the 3-colour brand palette. They're
  content-driven category-coding (Phase 0 decision), the same reasoning
  that already kept festival-mood colours and category-coding independent
  of the brand accent through two earlier colour passes — the brief's
  "don't overuse orange/pink/purple" is about the brand accent's use in
  chrome, not a mandate to recolour every content-driven palette in the app.
- **Mobile got token/colour parity, not full component parity.** Its
  `global.css`, hardcoded `ActivityIndicator`/tab-bar hex, and the dark-mode
  removal are all done — the app is correctly light-only and on-palette.
  Its tab-bar and category icons are still emoji, not the new SVG set:
  `react-native-svg` isn't an existing dependency, and adding an unverified
  native dependency in a container with no simulator to actually test it on
  is a worse trade than shipping mobile's icons as a scoped, documented
  follow-up (same category as the deferred mobile logo-mark from the
  previous pass).

### Verification

- `pnpm typecheck` / `lint` / `test` (48 unit tests, `ui-tokens`'s CSS test
  now asserts *no* dark-mode branching instead of asserting one exists) and
  the full Playwright suite (18 tests, mobile + desktop) all pass. Full
  production build (48 routes). Screenshots across home, browse, event
  detail, organiser, and submit — desktop and mobile viewports — confirm
  the palette, gradient buttons, new card aspect ratio, icons, and focus
  states all render as specified, with no dark-mode remnants anywhere.

---

## Phase 1 — Real brand mark: gradient monogram + magenta accent

The user has their own AI-generated DesiHub logo concept (rights confirmed
by the user) — a "D" monogram with an NL skyline silhouette, orange→
magenta→purple gradient, paired with a "Desi" (dark) / "Hub" (gradient)
wordmark. Asked to build the app to match. This is the third accent-colour
revision this build (marigold → DesiPass-crimson → this) — each documented
here rather than silently overwritten.

### What was built

- **`LogoMark`/`Logo`** (`apps/web/src/components/logo.tsx`): an original
  SVG "D" monogram — not traced from the reference image (a flat raster
  mockup isn't something to embed as a production asset: no transparency,
  wrong background, unreadable "Desi" on dark theme, and soft at small
  sizes). The D is a true semicircle bulge (path `M6,4 H24 A36,36 0 0 1
  24,76 H6 Z`) gradient-filled, with a clipped skyline silhouette (windmill,
  gabled canal house, cable-stay bridge) sitting in the band where the
  curve still leaves enough width (y 40–62 — the available width follows
  the semicircle and narrows fast near the bottom, which is exactly what
  broke the first attempt, see below). The wordmark repeats the gradient as
  live CSS text (`background-clip: text`) — real, accessible, theme-safe
  text, not a picture of text. Used in the header and footer.
- **`app/icon.svg`**: the same mark as Next.js's auto-detected favicon.
- **Accent token renamed and revalued**: `palette.crimson* ` → `palette.magenta*`
  in `packages/ui-tokens/src/tokens.ts` (`#C1348A` light / `#E27FB8` dark),
  the flat mid-tone of the new gradient — regenerated `tokens.css`, and
  updated every place that mirrors it outside the token system: mobile's
  `global.css`, and the hardcoded hex in mobile's `ActivityIndicator` colour
  and tab-bar active tint (no central token for React Native's non-CSS
  props). Added `brandGradient` (`#F0812A → #D6338C → #7B3FA0`) as an
  explicit token export, used by the logo and (already-gradient)
  announcement ribbon — not applied to buttons/pills/borders, which stay
  the flat accent for legible, consistent contrast.

### Bug caught before shipping

- First render of the monogram put the skyline elements' baseline at y=74,
  near the very bottom of the D's bulge. The bulge is a true semicircle
  (centre (24,40), r 36) — its right edge is at x=60 only at the vertical
  midpoint (y=40) and narrows back to x=24 at both endpoints (y=4 and
  y=76). Elements placed near the bottom got silently clipped by that
  curve, and the third element (meant to be a building) rendered as a
  stray triangle-on-a-line — looked like a bug in the shape, was actually
  its base getting cut off. Fixed by moving the whole skyline band up to
  y 40–62, where the curve still leaves ~28–36 units of width. Caught by
  rendering the SVG standalone at large size before wiring it into the
  header — screenshot first, not guessed at.
- Separately, the gradient didn't render at all on the first pass (whole D
  came out flat orange) — `<linearGradient>`'s `x1/y1/x2/y2` default to
  `objectBoundingBox` units (0–1 range) unless `gradientUnits=
  "userSpaceOnUse"` is set; the coordinates were written assuming the
  path's own coordinate space. Both bugs found by actually rendering the
  asset, not by reading the SVG source.

### Decisions

- **Never embed the reference image itself.** Confirmed rights with the
  user, but even so: it's a raster mockup with a baked-in background and
  dark text that breaks on our dark theme. A logo has to be a vector, drawn
  in our own coordinate system, to work as production UI — so this is an
  original interpretation of the same idea, not the literal file.
- **Gradient reserved for brand moments, not the whole UI.** Buttons,
  pills, borders, and focus rings stay the flat magenta accent — matches
  how the reference itself uses gradient only on the logo/wordmark, and
  keeps contrast and hover/active states simple and consistent everywhere
  else, the same reasoning applied when crimson replaced marigold.

### Verification

- `pnpm typecheck` / `lint` / `test` (48 unit tests) and the full Playwright
  suite (18 tests) all pass. `ui-tokens`'s CSS-drift test confirms
  `tokens.css` matches the regenerated source. Screenshots of the standalone
  SVG (large, to inspect the artwork) and the live header, in both light
  and dark themes, confirm the gradient renders and the skyline reads
  clearly.

### Open / deferred

- Mobile's header/tab-bar logo dot was **not** rebuilt as the same SVG
  monogram — only its flat colour was updated to match. A full RN version
  of the mark is a reasonable follow-up, not done here to keep this pass to
  the web app where it was actually screenshotted and verified.

---

## Phase 1 — Popular Cities (real counts, admin-ready image slot)

Small standalone feature, agreed after discussing the bottom of DesiPass's
homepage: a "Popular Cities" tile grid. Deliberately scoped as a same-day
build, independent of the header/organiser-page visual pass above.

### What was built

- `EventRepository.popularCities(limit)` — new interface method, returning
  cities ranked by their real upcoming-event count. Backed by a shared, pure,
  unit-tested `cityCounts()` in `@desihub/shared`'s `filter.ts` so the mock
  and Supabase adapters compute the same ranking the same way — no separate
  logic to drift.
- `PopularCities` (web): a tile grid, real "N events" per city, linking into
  `/browse?city=`. Replaces the old plain-pill `CityTiles` on the homepage
  (removed — fully superseded, no other callers).
- Tiles render a designed gradient (`gradientByIndex`, extracted alongside
  the organiser-banner gradient into `lib/gradient.ts`) **or** a real photo
  from `lib/city-images.ts` (`CITY_IMAGES: Partial<Record<City, string>>`,
  empty today) when one is set. Same upload-or-fallback shape as event and
  organiser images — a future admin flow just needs to populate that map
  (or its DB-backed equivalent), no component changes.

### Decisions

- **No photos sourced from Google Images.** Asked directly; declined — search
  results aren't licensed for reuse, and it would have broken the project's
  own "never scrape content we don't have rights to" rule from Phase 0.
  Wikimedia Commons (properly licensed) was agreed as the real path, but
  every Wikimedia domain is also blocked by this container's network egress
  proxy, same as desipass.com — so photos are a follow-up once the user
  supplies URLs (or the admin portal exists), not part of this build.
- **Gradient-by-index, not by name-hash, for this grid specifically.** The
  organiser banner's name-hash gradient is fine for a single page seen in
  isolation; in a 6-tile grid it collided 5 of 6 cities onto nearly the same
  colour (caught via screenshot, not guessed at). Position-based selection
  guarantees visually distinct neighbours for any list ≤ the palette size.
- **No admin portal was built.** Confirmed with the user this is a "plan
  now, build later" item — the image slot is admin-portal-shaped, but the
  portal itself (auth, upload UI) is Phase 2/3 scope, same bucket as
  organiser accounts.

### Verification

- `pnpm typecheck` / `lint` / `test` (48 unit tests, up from 44 — new
  `cityCounts` coverage in `filter.test.ts`) and the full Playwright suite
  (18 tests) all pass. Screenshot at 1440px confirms real per-city counts
  and, after the index-based fix, visually distinct tiles.

---

## Phase 1 — DesiPass visual pass, part 2: header + organiser page layout

Second follow-up — "I want exact same UI like DesiPass... even layout and
all." `desipass.com` is still blocked from this container on every retry;
this pass is built from the same three user-supplied screenshots (home,
event detail, organiser page), described back to the user in full before
building, so the reference stays honest about what's actually known vs.
guessed.

### What changed

- **Header rebuilt to DesiPass's layout**: logo + an "All Cities"
  city-select pill (`HeaderCitySelect`, client component, navigates to
  `/browse?city=`), a centred category-tabs row (`HeaderCategoryTabs`  —  6
  curated categories + "More →", full 12-category list stays on `/browse`
  rather than cramming every category into the nav), a search icon, then
  Submit event + theme toggle. A gradient **announcement ribbon**
  (`AnnouncementRibbon`) sits above the nav row pointing at `/submit`,
  matching their "Create Event" banner. The ribbon scrolls away with the
  page; only the compact nav row underneath stays `sticky` (keeping it in
  the ribbon would have doubled the pinned header's height on every page).
- **Organiser page rebuilt to their banner-card layout**: a full-bleed
  gradient banner (deterministic per organiser, hashed from `org.id` into
  the same colour pairs the event fallback-card generator uses — no
  organiser has a banner photo asset, so this is a designed placeholder,
  not a guess at their actual brand colour) with the profile card floating
  over its bottom edge, avatar/name/city/event-count/Follow inside it.

### Decision

- **No fabricated stats.** DesiPass's organiser page shows follower and
  "guests hosted" counts; DesiHub has no backend aggregation for either in
  Phase 1 (follows are per-device localStorage, not server-counted) so
  those numbers would be invented. The one stat shown — "N events listed"
  — is real, computed from the organiser's actual event list.
- **Category tabs are curated, not exhaustive.** DesiPass's nav has ~6
  categories; DesiHub has 12 first-class ones (a deliberate Phase 0 scope
  decision, not something to walk back for a nav bar). Showing all 12 would
  overflow the header, so the 6 most attended-feeling categories are tabs
  and the rest live one click away via "More →" into `/browse`.

### Verification

- `pnpm typecheck` / `lint` / `test` (53 unit tests) and the full Playwright
  suite (18 tests, mobile + desktop) all pass unchanged. Screenshots at
  1440px and 390px (home header, organiser page) confirm the ribbon +
  nav row + city pill + category tabs render correctly and don't overflow
  on mobile (the header's "Browse" fallback link, category tabs, and city
  pill each have their own breakpoint so exactly one wayfinding option is
  visible at any width).

---

## Phase 1 — DesiPass visual pass: accent colour + card anatomy

Follow-up to the discovery pass below. The user pushed back — the first pass
matched DesiPass's *functionality* but not its *look*: "look at their UI,
their buttons, their image style." With their screenshots as the reference
(desipass.com is still unreachable from this container), this pass makes the
visual match real rather than only structural.

### What changed

- **Accent colour: marigold → crimson.** `packages/ui-tokens/src/tokens.ts`
  is the single source of truth (`palette.crimson` / `crimson600` /
  `crimson400` / `crimson100`, wired into `colorRoles.light/dark.accent*`),
  so every button, link, focus ring and badge across web + mobile repainted
  from one edit — `tokens.css` regenerated via `pnpm gen:css`, mirrored in
  `apps/mobile/global.css` and the handful of RN files that hardcode the hex
  (`ActivityIndicator` colour, tab-bar active tint). `#E8802A` marigold is
  **kept** as the `palette.marigold*` ramp for the season-mood gradients and
  category-colour coding (`season-strip.tsx`, `SeasonBanner.tsx`,
  `fallback-card.ts`, `category-colors.ts`) — those are content-driven
  palettes independent of the brand accent, not the thing the user was
  pointing at.
- **Card anatomy restructured to match DesiPass's**: a 🔥 Trending badge
  overlaid on the image (not in the card body), a calendar-icon date row
  ("📅 Sat, 17 Oct · 15:00" — new `formatEventDateCompact` in
  `@desihub/shared`) and a pin-icon city + price row, replacing the plainer
  "city · time" line. Applied to `EventCard`/`EventGrid` on web and their RN
  equivalents.
- Fixed a real collision this surfaced: the Trending badge and the (often
  long, e.g. "Bollywood / Desi party") category pill sat on the same top row
  on narrow cards and overlapped. Fix was reordering the top-left stack
  (date chip first, Trending badge below it) rather than truncating category
  labels — tried truncation first, reverted it because it made several
  category names unreadable for no real gain once the stacking order fixed
  the actual cause.

### Decision

- **Not changed**: no organiser-uploaded poster/flyer imagery — DesiHub's
  branded fallback-card system and "never scrape/fabricate organiser
  artwork" rule (Phase 0) stand; a real image still renders via `image_url`
  when an organiser supplies one. What moved is chrome (colour, badge
  placement, card meta layout), not a commitment to imitate their photo
  content style.

### Verification

- `pnpm typecheck` / `lint` / `test` (53 unit tests) and the full Playwright
  suite (18 tests, mobile + desktop) all pass. `ui-tokens`' CSS-drift test
  confirms `tokens.css` matches the regenerated source. Screenshots at
  1440px and 390px (home, card grid, event detail) confirm the crimson
  buttons, image-overlaid Trending badge, and fixed card layout render
  correctly with no overlap.

---

## Phase 1 — DesiPass-inspired discovery pass (web + mobile)

Requested after seeing screenshots of desipass.com (a Germany-based Desi event
ticketing marketplace). `desipass.com` itself was unreachable from this
container (network egress blocked the domain), so this pass is built from the
user's own screenshots (home, event detail, organiser page) rather than a
live fetch — kept to **functional/UX patterns**, not their visual identity
*at the time* (superseded by the visual pass above, prompted by the user
pointing out the gap). DesiHub keeps its own Fraunces/Geist typography
throughout.

### What was built

- **Quick-filter pills** (`QuickFilters` on web, a chip row on mobile Discover):
  "All events / This week / This weekend / Free entry", one tap from the
  homepage into a pre-filtered, shareable `/browse` (or `/search` on mobile)
  URL — mirrors DesiPass's "All / Upcoming in 48hrs / Weekend / This Month"
  row. New `weekDateRange`/`weekendDateRange` helpers in `@desihub/shared`
  compute the bounds once so home, browse's `?when=`, and mobile's `?when=`
  all agree.
- **"🔥 Trending now"** replaces the plain "Featured" section on both apps;
  `EventCard`/`EventGrid` (and their mobile equivalents) gained an optional
  `trending` badge — same idea as DesiPass's per-card "Trending" tag, styled
  with our own accent instead of copying their red.
- **Multi-day date display fix**: an event whose `ends_at` falls on a
  different calendar day (multi-day festivals like Navratri) now reads
  "20:00 – 25 Oct, 00:00" instead of silently dropping the end date. New
  `formatEventDateShort`/`isSameLocalDay` helpers in `@desihub/shared`.
- **Sticky mobile ticket bar** on the event detail page (web `lg:hidden` fixed
  bar; a native equivalent on the RN screen) — price + primary CTA stay
  reachable while scrolled through the description/similar-events, like
  DesiPass's persistent bottom bar. It's `aria-hidden`/`tabIndex={-1}` on web
  (the same control stays keyboard/AT-reachable in the primary panel above) —
  a deliberate accessible-duplicate pattern, not an oversight.
- **Follow surfaced earlier**: the event page's organiser mini-card now shows
  the existing `FollowButton` inline (`showFollow`), not just the full
  organiser page — DesiPass surfaces Follow right on the event page.
- **Organiser page**: added a real "`N` events listed" stat next to the
  header. Deliberately **not** copied: DesiPass's "X people viewed this
  event" and "guests hosted" counters — Phase 1 has no view/attendance
  tracking, and inventing the number would violate the same "never invent an
  API response" rule the mock catalogue follows.

### Decisions

- **Follow stays sign-in-free.** DesiPass gates Follow behind a sign-in wall;
  DesiHub's `FollowButton` already works with zero account (localStorage,
  Phase 2 migrates it on sign-in) — kept as the better-UX version, not
  changed to match.
- **No ticketing/checkout was added.** DesiPass is a full ticketing
  marketplace (buy/sell, QR check-in); DesiHub Phase 1 is deliberately a
  listings/discovery layer that hands off to the organiser's own ticket page
  — unchanged, that's Phase 3 scope, not a "make it like DesiPass" ask.
- **No hero banner + floating profile card on the organiser page.** DesiPass's
  organiser page uses a full-bleed banner photo; DesiHub has no organiser
  banner asset in the data model (only `logo_url`) and won't fabricate one —
  the existing simple header just gained an honest stat instead.

### Verification

- `pnpm typecheck` / `pnpm lint` / `pnpm test` (52 unit tests, up from 44 —
  new `datetime.ts` helpers are covered) all pass across every package.
- Web: `pnpm build` (still 47 routes) + full Playwright suite, now 18 tests
  (added quick-filter navigation and trending-badge assertions) across mobile
  + desktop projects — all green. Screenshots taken at 1440px and 390px
  confirm the quick-filter row, trending badges, and the sticky mobile ticket
  bar with the multi-day date fix all render correctly.
- Mobile: `tsc --noEmit` + `eslint` pass; not launched in this container (no
  simulator here — same honest limit as the rest of Phase 1 mobile).

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
