# DesiHub — Architecture Decisions & Build Log

This log records every meaningful architectural choice and why, plus what was
built and what is still open, per phase. Newest entries at the top of each
section.

---

## Phase 4 — The homepage's artwork moves into a rotating strip you upload to

The hero was ~700px before a visitor saw a single event: a large headline
beside a large code-owned illustration. Two problems, one structural. It
pushed the search bar and the first event below the fold, and it meant
homepage artwork had two different homes — a hard-coded illustration up top,
and the banner table we had already designed for exactly this.

So the artwork column is gone and the hero is a compact centred block:
headline, one line of copy, search, two actions. Directly beneath it sits the
**promo carousel**, filled from the `banners` table and the public `banners`
storage bucket. Changing what the homepage leads with is now an upload plus a
row — never a code change and never a deploy. The trust badges moved *below*
the strip: they are reassurance, not a headline, and above the artwork they
were only delaying the thing people came for.

### Decisions

- **Fallback art is the base layer, not an `onError` swap.** A server-rendered
  `<img>` whose file is missing fires its error event *before* React hydrates,
  so an onError handler never runs and the reader is left looking at a
  broken-image marker — which is exactly what the first build did. Layering
  designed art underneath and fading the real banner in on load cannot miss
  the event, because it never listens for one.
- **The window lives in the RLS policy**, not the query, so an expired banner
  cannot leak even if a caller forgets to filter. The adapter deliberately
  does not repeat the conditions.
- **A failed banner query returns `[]`, not an error.** The strip renders
  nothing when there are no banners, which is a valid state on a fresh
  install — a broken banner table must never take the homepage down.
- **Slides are cross-faded but `aria-hidden` and untabbable when inactive.**
  An invisible link is a keyboard trap.
- Dots are real buttons: the strip is operable without a mouse and without
  waiting for the rotation to come round. Rotation pauses on hover and focus,
  and does not start at all under `prefers-reduced-motion`.

### E2E hygiene fixed along the way

Two account/checkout tests failed on a *second* run against the same dev
server. Not a regression: the mock account store is a `globalThis` singleton
in the server process, `reuseExistingServer` keeps that process alive between
runs, and a fixed demo address carried last run's follows into this one — so
a "Follow DesiBeats" button turned up already reading "Following". Demo
sign-in addresses are now salted per run (`demoEmail()` in `e2e/fixtures.ts`),
and the suite passes twice in a row against one server.

---

## Phase 4 — Booking becomes an adapter, and the event page is rebuilt on it

The product decision that drives everything here: **for the first release DesiHub
does not take money.** Organisers already sell somewhere — their own site,
Eventbrite, a WhatsApp number — and asking them to move their ticketing before
we have an audience is the wrong trade. So DesiHub lists the event, shows the
price, and hands the visitor over.

That is a positioning choice, not a permanent one, which is why it is built as an
adapter rather than a redirect.

### What the split is

- **`Event` owns admission**: `entry_type` (`free` / `registration` / `paid` /
  `door`) plus the price range. This is about money and who may come in.
- **`booking_configurations` owns the channel**: one row per event saying
  `booking_type`, `provider`, `booking_url`, `status`. Moving an organiser from
  their own booking page to DesiHub ticketing is an UPDATE to this row. Nothing
  in `events` changes, and neither does the page.
- **The event detail page reads neither.** It calls `getBookingOptions(event)`
  once and renders the `BookingOption` it gets back — a label, a price line, one
  of four CTA kinds, and a disclosure note. It cannot tell where booking happens,
  which is precisely the property that makes new providers cheap.

### Why not just put `booking_url` on `events`

Because the second provider is where that design fails. A partner API needs an
external id, a live availability call and a status that changes without us
touching the row; DesiHub ticketing needs none of those but does need inventory.
Both would have ended up as nullable columns on `events` guarded by `if` ladders
in the page — which is the exact shape the brief asked us to avoid.

### Which providers are live

| `booking_type` | State | Notes |
| --- | --- | --- |
| `none` | On | Turn up, or pay at the door. CTA is the calendar. |
| `free_registration` | On | Organiser's RSVP form. |
| `external_url` | On | The MVP workhorse. |
| `desihub` | **Built, off** | Phase 3's Stripe checkout, behind `NEXT_PUBLIC_DESIHUB_TICKETING`. |
| `external_api` | Interface only | Eventbrite and friends. |

Phase 3 was not deleted — it was demoted to one provider among several. Turning
it on for everyone is a one-line change in `enabledBookingTypes()`; turning it on
for a single pilot organiser is one config row plus that flag. E2E runs with the
flag **on** so both paths — external handover and native checkout — stay covered.

A config naming a disabled channel **degrades** rather than breaking: it falls
back to the booking URL if there is one, and to "booking opens soon" if not. No
dead buttons.

### Decisions inside the page

- **The handover is interrupted on purpose.** Clicking `Book now` opens a
  confirmation naming the destination and showing the real hostname before
  anything navigates. The visitor must never think DesiHub took their payment.
  It is a real `<a href>` underneath, so modified clicks, right-click and copy
  all behave normally — the dialog only intercepts a plain left-click.
- **Highlights are derived from the category, not asked of the organiser.** A
  field most submitters would leave blank is not worth the form friction when
  the category already implies the answer. An override column can be layered on
  later without touching the page.
- **The line-up is an embedded array, not an `artists` table.** DesiHub has no
  artist profiles yet; a table we cannot populate would put dead links on every
  event page. Artists link into a filtered browse instead. Promoting this to a
  real entity later only changes what fills the array.
- **The venue block is a styled placeholder plus two links, not an embedded
  map.** A third-party map iframe is a tracking cookie on every event page, and
  "View on map" / "Get directions" is what the visitor actually wanted.
- **Every optional section hides itself when empty.** An event page padded out
  with empty Gallery and Artists headings reads as abandoned, and most community
  events genuinely fill in only half of them.
- **The submit form asks one booking question, not for ticket types.** Four
  radio options, then a price range and the link the organiser already has.
  Collecting VIP/Early-bird tiers we cannot sell against would be friction in
  exchange for unusable data.

### Verified against real Postgres 16

All seven migrations were applied in order on a scratch Postgres 16 with minimal
`auth`/`storage` stubs, then exercised:

- `booking_url_required_for_redirects` rejects an `external_url` row with no
  URL — a half-configured channel can never render as a dead "Book now".
- `events_lineup_is_array` rejects a non-array `lineup`.
- Deleting an event cascades its booking row away; one row per event is
  enforced by the primary key.
- Under the `anon` role, a draft event's booking row is invisible while
  published ones are readable — the RLS policy, not just the query, does it.

**One real bug was found this way and fixed.** `entry_type` was a plain column
default of `'paid'`, so the migration's backfill only corrected rows that
existed *at migration time*: a free event inserted afterwards by any writer that
predates this change (the seed, the admin importer, a manual INSERT) landed as
`paid` while `is_free` said otherwise — and the booking service would then offer
a ticket CTA for a free event. Replaced with a `before insert or update` trigger
that derives the pair: a writer that knows only the old flag gets a correct
`entry_type`, and `is_free` always follows `entry_type` afterwards. The mock
catalogue applies the same rule, so dev and production cannot drift.

### Open / deferred

- `booking_configurations` has no organiser-facing editor yet; the submit form
  writes the initial row and changes go through admin.
- `ExternalApiProvider` is an interface with no implementation — the first real
  partner integration will prove whether `getAvailability` belongs on it.
- Waitlists render as a disabled state; there is no capture behind them yet.

---

## Phase 3 — Checkout: ticket selection, orders, and the wallet

`orders`, `tickets` and `ticket_types` have existed since Phase 0, RLS-gated
and ready, but nothing wrote to them — Phase 1's event page pointed at
`external_ticket_url` or said "tickets coming soon," and Phase 2 explicitly
deferred the wallet as a shell with nothing behind it. This phase is the
real thing: pick tickets, pay, get a QR-token ticket, see it again under
"My tickets."

### What shipped

- **`OrderRepository`**, a new contract in `packages/shared/src/checkout/`
  — the same one-interface-two-implementations split as
  `EventRepository`/`AccountRepository`. `createOrder` reserves inventory
  and returns either a paid order (demo mode) or a Stripe Checkout redirect
  (real mode); `confirmPayment` is what a webhook calls once money actually
  moves; `cancelOrder` releases a hold; `getOrder`/`listMyOrders` read it
  back. Checkout works signed out on purpose — `orders.user_id` is
  nullable, and DesiHub's whole ethos (Phase 1/2) is that nothing requires
  an account. The unguessable order UUID is itself the access check for a
  guest's confirmation page, the same pattern Stripe's own Checkout
  `success_url` relies on.
- **`MockOrderRepository`** — in-memory, `globalThis`-parked for the same
  cross-bundle reason `MockAccountRepository` is. Demo mode has no real
  payment step, so a created order is paid the instant it's created,
  mirroring the dev sign-in shortcut. A companion `mock-inventory.ts`
  overlay tracks tickets the mock checkout path has sold on top of the
  static seed counts in `mock-data.ts`, and `MockEventRepository` now
  derives `sold_out` from live remaining inventory instead of only the
  seed's static flag — buy out a ticket type in a dev/E2E run and the event
  actually flips to sold out.
- **`SupabaseOrderRepository`** — reserves via the `reserve_tickets` RPC per
  line (rolling back with `release_tickets` if a later line fails or
  inventory runs out), inserts the order under the buyer's own RLS-scoped
  session, and issues tickets through a **service-role client**
  (`lib/supabase/admin.ts`) — `tickets` deliberately has no client-facing
  INSERT policy at all (0003_rls.sql), so fabricating a ticket is not
  something a browser can ever do; only trusted server code (checkout
  completion, the webhook) can. Free ticket types (`price_cents = 0`) are
  issued immediately, same as demo mode; a priced ticket with no Stripe key
  configured returns an honest "not yet configured" error instead of
  pretending to take payment.
- **Found and fixed a real gap in the Phase 0 schema**: `reserve_tickets`/
  `release_tickets` (0002) were plain `plpgsql` functions, not `security
  definer`, so under RLS a regular buyer's `UPDATE` against `ticket_types`
  was filtered out by `ticket_types_write` (organiser/admin only) and the
  function returned `false` for everyone but the organiser — checkout could
  never have sold a single ticket. `0005_checkout_functions.sql` makes both
  `security definer`, the same fix already applied to `handle_new_user`,
  `is_admin` and `owns_organiser` — the quantity/capacity check inside the
  function body is the real guard, not row ownership.
- **Stripe adapter, env-gated** (`STRIPE_SECRET_KEY`) — a real Checkout
  Session per order, line items priced through the same `priceLine`/
  `sumOrder` fee logic as everywhere else, `metadata.lines` carrying the
  cart (there is no per-line table on `orders`, so the session is where a
  pending order's quantities live until paid). `/api/stripe/webhook`
  verifies the signature and calls `confirmPayment`, independent of whether
  the buyer's browser ever makes it back to `success_url`.
- **UI**: a `TicketSelector` on the event page (quantity steppers per
  tier, a live running total, min/max-per-order respected) replaces the
  static price/CTA for any event with `ticket_types` configured —
  `external_ticket_url` remains for the (currently unused in the mock
  catalogue) case of an organiser who tickets elsewhere. `/checkout` reviews
  the cart and takes an email; `/orders/[id]` is the confirmation screen,
  showing each ticket's `qr_token` and a "show this code at the door" line;
  `/account/tickets` lists every paid order for the signed-in account, a
  new tab alongside Saved/Following.
- A purchase revalidates both `/account/tickets` and the specific event's
  `/e/[slug]` — the event page is ISR-cached (`revalidate = 3600`) and
  shows live "N spots left," so a sale has to invalidate it immediately or
  a sold-out event would keep showing tickets for up to an hour.

### Verification

- `pnpm typecheck` / `lint` / unit tests (65 in shared, incl. 7 new
  order-repository tests covering paid/guest/oversell/rollback/listing) and
  a production build all pass.
- Full E2E suite: **42 tests, mobile + desktop, all passing** — 5 of them
  new, covering: the running total updating live as quantity changes, a
  guest completing checkout with no account, a multi-ticket order issuing
  one ticket row per unit, a signed-in purchase showing up under My
  Tickets, and inventory actually decrementing on the event page after a
  sale (the case that caught the missing revalidation above).
- The checkout-tests-share-inventory trap bit once during verification: two
  tests buying from the same event's ticket type raced when Playwright ran
  them concurrently, the same class of bug the accounts E2E suite already
  guards against with per-test emails. Fixed the same way — the
  inventory-assertion test moved to a dedicated event so it isn't racing
  the other checkout tests for the same counter.

### Open / deferred

- **No visual QR/barcode.** A ticket's `qr_token` renders as text ("show
  this code at the door"), not a scannable image — a real QR/barcode
  render deserves either a proper library or to land together with its
  actual counterpart (an organiser door-scanner), neither of which "build
  phase 3" on its own asked for.
- **No organiser check-in / door-scanning UI.** `tickets_checkin`'s RLS
  policy (0003) and `checked_in_at`/`checked_in_by` columns exist for it,
  but nothing in this phase reads or writes them yet.
- **The Supabase + Stripe path is written and type-safe but cannot be
  exercised in this container** — no Docker, no local Supabase stack, no
  real Stripe keys — the same honest limit `SupabaseEventRepository` and
  `SupabaseAccountRepository` have carried since Phase 0/2. Every test that
  actually ran is against the mock path.
- **Refunds, transfers, and Klarna** (`KLARNA_MIN_TOTAL_CENTS` already
  exists in `money.ts`) are not wired to anything yet — `order_status`/
  `ticket_status` have the enum values (`refunded`, `transferred`) for
  later, unused today.
- A pending Stripe order that a buyer abandons is never automatically
  cancelled — there is no cron/expiry job releasing the hold; `cancelOrder`
  exists and works, but nothing calls it yet.

---

## Phase 2 — Accounts: auth, profile, and collections that follow you

Phase 0 shipped the whole account *substrate* — `profiles`, `saved_events`,
`follows`, the `handle_new_user` trigger and `user_id = auth.uid()` RLS
policies — and Phase 1 deliberately built saving and following on top of
localStorage instead, so nothing was ever behind a login wall. Phase 2 is
the layer that was always missing: real sign-in, and collections that move
with the person instead of the device.

### What was built

- **An `AccountRepository` contract with two adapters**
  (`packages/shared/src/account/`), the same split the listings layer uses:
  a Supabase adapter (`apps/web/src/lib/account/supabase-account-repository.ts`,
  every query already fenced by the Phase 0 RLS policies) and an in-memory
  mock. Sign-in/out deliberately are *not* on the interface — they need
  cookies and redirects, so they live in the web layer and the repository
  only ever exists for an already-identified user.
- **Email sign-in, no passwords.** Supabase path sends a magic link
  (`signInWithOtp`) and `/auth/callback` exchanges the code for a session;
  the callback validates `?next=` is a same-site path so the link can't be
  turned into an open redirect. Offline/dev path signs straight in against
  the mock and *says so on the page* rather than implying a real account.
- **The dev session can't become an auth bypass.** The mock cookie is read
  only in the `!hasSupabase()` branch, so in any deployment with Supabase
  env configured it is ignored entirely.
- **`AccountProvider`** fetches the snapshot (user + saved ids + followed
  ids) once per request in the root layout and hands it to every card via
  context, instead of each of ~40 hearts on a page querying for itself.
  Writes are optimistic and roll back if the session turned out to be gone.
- **Sign-in merges the device's collections into the account** — the
  promise Phase 1 made when it chose localStorage. Legacy follows keyed by
  slug (pre-accounts builds) are resolved to ids server-side so nobody
  loses a follow they made before accounts existed.
- **Account area**: profile (name, city, languages, notification prefs —
  all optional, none of it gates anything), saved events split into coming
  up vs. already happened, and organisers you follow. `eventsByIds` /
  `organisersByIds` were added to `EventRepository` (both adapters) rather
  than fetching the whole catalogue and filtering.

### Bugs caught before shipping

- **The mock store was invisible to itself.** Next bundles server actions
  and the RSC render separately, and each bundle got its own copy of the
  shared module — so `signInAction` wrote the account into one `Map` and
  the layout read from another, leaving the user signed out the instant
  they signed in. Caught by driving the real flow in a browser, not by
  typechecking (both copies typecheck fine). Fixed by keying the store off
  `globalThis`, the same escape hatch the Prisma-client-in-dev pattern uses.
- **`mergeLocalSchema` rejected every mock id.** It validated ids as
  `uuid`, which is true behind Supabase and false behind the mock
  (`ev-01`, `org-telugu`) — so the merge would have silently no-opped in
  dev and E2E. Ids are opaque strings now; the real guards are the foreign
  keys and RLS, not a shape check on the browser's payload.
- **Mobile had no way to sign in at all.** The account entry point was
  `hidden sm:inline-block`, i.e. invisible on phones. Now icon-only on
  small screens rather than absent.

### The Google Fonts stall (a test-environment finding)

Account tests kept timing out mid-flow while the page had *already
rendered correctly*. The cause was outside the app: the render-blocking
Google Fonts stylesheet is unreachable in this sandbox, and because it
blocks the `load` event every `page.goto` sat there **~12.6s** before
giving up (measured against ~0.3s with the request blocked). Multi-step
tests simply ran out of budget. `e2e/fixtures.ts` now drops font requests
for the suite — no assertion depends on the webfont — which also cut the
whole suite from **2.8 minutes to 56 seconds**. Worth noting for
production too: that stylesheet is render-blocking for real users on a
slow network, and self-hosting Inter would remove the dependency.

### Verification

- `pnpm typecheck` / `lint` / unit tests (58 in shared, incl. 10 new
  account tests) and a production build all pass.
- Full E2E suite: **32 tests, mobile + desktop, all passing** — 14 of them
  new, covering the gate on `/account/*` and the redirect back afterwards,
  demo sign-in, the header swap, the anonymous-save→account merge, saves
  surviving a reload while signed in, profile round-tripping, following,
  and sign-out returning to the anonymous experience.
- The full flow was also driven by hand in a browser and screenshotted at
  each step before the tests were written.

### Open / deferred

- **The wallet stays empty until Phase 3.** `orders` and `tickets` exist
  in the schema, but nothing writes to them until checkout does, so a "my
  tickets" screen now would be a shell. Deliberately not built.
- The Supabase path is written and type-safe but **cannot be exercised in
  this container** (no Docker, so no local Supabase stack) — the same
  honest limit `SupabaseEventRepository` has carried since Phase 0. The
  mock path is what the tests cover.
- Mobile (Expo) still has no account UI; it shares `packages/shared` so
  the contract is ready, but the session mechanism differs (SecureStore,
  not cookies).

---

## Phase 1 — Homepage + event detail rebuilt against a reference platform

The user supplied three detailed reference screenshots (a homepage and two
event-detail pages from another ticketing platform) with the instruction
"make it like this with details, same." The reference reads dark at a
glance — a night-concert hero photo, poster-style event cards with dark
scrims — which looked like a direct reversal of this session's explicit,
repeated "no dark backgrounds" brief. Asked directly, the user clarified
the reference's page *chrome* is light throughout — white nav, white
section backgrounds, white cards — and only individual photographs (hero
banner, event posters) carry a dark gradient for text legibility, which is
a completely different thing from a dark theme. That resolved the
apparent conflict: keep the light system, adopt the reference's layout and
information density.

Scope was narrowed deliberately before building: homepage and event detail
page only (no new Venues/Artists/Blog/Contact pages, no accounts-gated
Favourites, no ticket-cart checkout) — the reference shows several things
that need real subsystems we don't have yet (a payment cart, a login
system, an artist content type) or assets we don't have (real event
photography — every mock event's `image_url` is `null`; venues have no
photos and no `capacity` values despite the schema field existing).
Nothing here is fabricated to look more "finished" than it is: no invented
stock photography, no artist lineups, no promotional "highlights" copy, no
capacity numbers — every new number/label on these two pages traces back
to real data or is honest, checkable product copy.

### What was built

- **Logo**: brightened/re-saturated the gradient (`#F0812A/#D6338C/#7B3FA0`
  → `#FF8A00/#F0146F/#8B1FE0`) in both `logo.tsx` and `app/icon.svg` (the
  favicon uses the same mark) — the one item the brief said to keep as-is,
  just stronger.
- **Hero gets a real search bar and trust badges** (`hero-search-bar.tsx`,
  wired into `season-strip.tsx`): a compact search+city+when bar that
  submits straight into `/browse?...` — a real shortcut, not a decoration
  — plus four honest trust-badge claims (no "Secure Ticketing," since we
  don't process payment; "Verified organisers" instead).
- **Favourites — a real, unauthenticated, per-browser feature**
  (`lib/use-favourites.ts` + `favourite-button.tsx`): a `useSyncExternalStore`-backed
  localStorage toggle, not a decorative heart that does nothing. No
  accounts system exists yet, so this is scoped to what's honestly
  deliverable now. Two variants: a small overlay circle for card/hero
  images, and an inline `Button`-based one (matching Share/Add-to-calendar)
  for the event page's action row — deliberately two variants rather than
  one button fighting className overrides for size, the same class-collision
  trap documented earlier this build.
- **New "Top venues" section** (`lib/top-venues.ts` + `top-venues.tsx`):
  ranks real venues by upcoming-event count from an already-fetched pool,
  the same pattern Popular Cities already used for cities. No capacity
  numbers (we don't have real ones) — "N events" instead, which is real.
- **New mid-page CTA banner** (`organiser-cta-banner.tsx`): the brand
  gradient at full strength as one deliberate banner — matches the brief's
  sanctioned "primary CTA" use case, not a new pattern.
- **Footer gains a working newsletter column**: `EmailCapture` moved from
  a standalone homepage-only section into the footer (`site-footer.tsx`),
  so it's reachable site-wide instead of only after scrolling the whole
  homepage. No fabricated "Support" column (Help/Terms/Privacy links) —
  those pages don't exist, and a footer full of dead links would be worse
  than a shorter, honest one.
- **Event detail page**: a consolidated tag-chip row (category icon + age
  policy + languages, replacing the old languages-only row); a Save button
  next to Share; the price sidebar became a real **"Choose your tickets"**
  card listing each `ticketTypes` row (name, real spots-left, real price)
  instead of one collapsed price range — genuine data that already existed
  on `EventWithRelations` but wasn't surfaced. No Artist/Line-up section,
  no "Highlights" bullets, no photo gallery, no "Watch promo" video —
  all would need data or copy this app doesn't have and the brief didn't
  ask us to build.

### Verification

- `pnpm typecheck` / `lint` / unit tests pass; production build succeeds
  (48 routes). Full-page screenshots of the homepage (desktop + mobile)
  and event detail page confirm the new hero search bar, trust badges,
  Top Venues, CTA banner, footer newsletter, tag chips, Save button, and
  ticket-tier card all render correctly against real data.
- Functional checks via Playwright: the hero search bar's submit actually
  navigates to `/browse` with the chosen filters in the URL; the Save
  toggle actually flips state and survives a page reload (confirms the
  localStorage round-trip, not just the click handler firing).
- Full 18-test Playwright E2E suite (mobile + desktop) passes unchanged —
  none of the existing critical-path assertions needed updating, since
  layout/structure of the tested flows (browse filters, ticket CTA states,
  submit form, organiser follow) held through the rebuild.

---

## Phase 1 — Header nav gets real categories and a visible active state; type scale trimmed

Feedback on the header category row and an event-detail screenshot from a
reference site, with a blunt but accurate critique: "Garba is not a
category, it's a dance" (the label had been truncated down to a bare
dance-style word, losing what made it a category), the tabs had no visible
selected state, every category click landed on the exact same generic
"Browse events" page regardless of which was clicked, and headings across
the site — event title, "All events," "Trending now" — ran uniformly
oversized ("bigger doesn't always mean good").

### What was built

- **`header-category-tabs.tsx` restored full labels.** The header truncates
  space by shortening `EVENT_CATEGORY_LABELS`, but shortening "Garba &
  Dandiya" to "Garba" and "Cultural night" to "Cultural" stripped the
  category-ness out of the words, leaving generic nouns. Restored the
  meaningful multi-word form ("Garba & Dandiya," "Cultural Nights,"
  "Comedy Shows," "Food Festivals") — a few more characters, but each one
  now reads as an event category rather than a bare adjective.
- **A real active state.** The component became a client component reading
  `usePathname`/`useSearchParams` (wrapped in `<Suspense>` in
  `site-header.tsx` so the rest of the site stays statically rendered);
  the tab matching the current `?category=` gets a filled pill in that
  category's own brand tone (`aria-current="page"` too, not just visual).
  Each tab's icon is tone-coloured even at rest, from a shared
  `CATEGORY_TONE`/`TONE_ACCENT`/`TONE_SOFT` mapping — extracted out of
  `fallback-card.ts` into `lib/category-tone.ts` since the browse page
  now needs the same mapping — so the row reads as designed rather than
  as one flat grey list, without going back to "every element is
  colourful" (only a 15px icon per tab carries colour at rest).
- **Browse page became category-aware**, ending "click anything, get the
  same page." A category filter now swaps the generic "Browse events" H1
  for a tone-coloured icon badge, an accent "Browse" kicker, and the
  category's own name as the headline ("Garba & Dandiya" / "Comedy
  Shows" / …), plus a one-line description naming that category. No
  category still shows a page, just "All events" instead of the old
  generic string, with the same kicker+icon treatment giving it presence
  it didn't have before.
- **Global heading scale trimmed one notch.** Every section heading
  ("Trending now," "Popular cities," "Near you," "Upcoming/Past events,"
  "Browse by category," the quick-filter rail's own heading) moved from
  `text-xl sm:text-2xl` to `text-lg sm:text-xl`; every page-level H1 that
  had drifted to `text-3xl sm:text-4xl` (event detail, submit) came down
  to the same `text-2xl sm:text-3xl` tier the Browse and Organiser pages
  already used. Net effect: one consistent page-H1 tier and one
  consistent section-H2 tier site-wide, both a step down from before —
  closer to the restrained, classy proportions of the reference
  screenshot than the previous "everything competes at hero size."

### Verification

- `pnpm typecheck` / `lint` / unit tests pass; production build succeeds
  (48 routes, home page stays statically prerendered — the Suspense
  boundary around the now-client `HeaderCategoryTabs` keeps `useSearchParams`
  from forcing the whole layout dynamic). Screenshots of the header (no
  category vs. an active one), the browse page (generic vs. category-
  specific header), the event detail title, and the home page's section
  headings confirm the active pill, the per-category identity, and the
  smaller, calmer type scale all render as intended.
- Updated the one E2E assertion that named the old generic heading
  ("browse filters are URL-driven and shareable") to check for "All
  events" on the unfiltered page and the category's own name
  ("Garba & Dandiya") when a category filter is active. Full 18-test
  Playwright suite (mobile + desktop) passes.

---

## Phase 1 — Quick filters become in-place, with a trendier pill and a carousel rail

Reference screenshots of another platform's filter row (rounded pills with
icons, one held active with a gradient fill, plus a scroll-arrow-flanked
event row) came with a plain-language ask: make the home pills trendier,
make clicking one update the events *directly below it on the same page*
rather than navigating away, keep the clicked pill visible/active instead
of it vanishing, and add left/right scroll arrows to that row. The user
explicitly handed over the how ("you can think about better and trendy
idea") and named the one constraint that mattered: user experience first.

### What was built

- **`quick-filters.tsx` (page-navigating `<Link>` pills) replaced by
  `quick-filter-rail.tsx`**, a client component that owns both the pill
  row and the event rail beneath it as one interactive unit. Pills are now
  real `<button>`s with `aria-pressed`, so the browser's own "this is a
  toggle, and it's on" semantics carry the "stays active" requirement —
  not just a visual style. The active pill fills with the brand gradient
  (orange → pink → purple) instead of the reference's literal red, so it
  reads as this product's accent, not a copy of the source site's.
- **No navigation, no client-side re-filtering of a truncated pool
  either.** The first version filtered one shared 24-event pool in the
  browser by date/price — cheap, but wrong: "this weekend"'s real matches
  can easily sort past a 24-item cutoff of the soonest-upcoming events,
  producing a false "nothing this weekend" the mock data didn't actually
  have. Caught by screenshotting the weekend pill and seeing an empty
  state where the old dedicated `/browse?when=weekend` section used to
  show real events. Fixed by fetching each filter's own correct set
  server-side in `page.tsx` (`repo.thisWeek`, `repo.thisWeekend`,
  `repo.listEvents({ price: 'free' })`, `repo.listEvents({ limit: 12 })`
  for "all") and handing the client component a `Record<FilterId,
  EventWithRelations[]>` to switch between — the same repository methods
  the old separate sections used, just switched between instead of
  stacked, so every filter is exactly as correct as its old dedicated
  section was.
- **Scroll arrows** are real buttons (not decorative), positioned only
  when there's somewhere to scroll: a scroll-state effect tracks
  `scrollLeft`/`scrollWidth` on the rail and only renders the left/right
  circular button when that direction has room, so there's never a dead
  arrow sitting there doing nothing.
- **`IconChevronLeft` added** to the icon set (only `Right` existed) for
  the left arrow.
- This absorbed the home page's old standalone "This weekend" rail — the
  quick-filter rail's "All events" default already covers the same
  upcoming-events role that section played, so keeping both would have
  meant two rails doing overlapping jobs.

### Verification

- `pnpm typecheck` / `lint` / unit tests all pass; production build
  succeeds (48 routes). Screenshots of desktop and mobile, before and
  after clicking each pill, confirm: no URL change, the clicked pill
  stays visible and gradient-filled, the heading and card set below swap
  in place, and the scroll arrow only appears on the side that actually
  has more content.
- Updated the one E2E test that encoded the old navigating behavior
  (`critical-path.spec.ts`: "quick-filter pills jump into a pre-filtered,
  shareable browse view") to assert the new in-place contract instead —
  same URL after the click, `aria-pressed="true"` on the clicked pill,
  the section heading relabelling, and the rail's own "See all" link
  still pointing at a real, shareable `/browse?...` URL as the escape
  hatch to the full listing. Full 18-test Playwright suite (mobile +
  desktop) passes.

---

## Phase 1 — Restyle pass: lighter hero, white cards, controlled-accent gradients

A second, explicitly-scoped brief followed the design-system rewrite:
restyle without touching layout, structure, functionality, content
hierarchy, or navigation. The concrete asks: gradient reserved for small
accents/CTAs only (never a large saturated background); the hero
"significantly lighter... a very subtle soft gradient rather than a large
blue/purple block"; event cards "predominantly WHITE," not colourful;
no heavy shadows; no dark image backgrounds or artificial overlays.

### What was built

- **Fallback event image redesigned** (`apps/web/src/lib/fallback-card.ts`):
  the old branded placeholder filled the whole canvas with a saturated
  per-category gradient. Rewritten to a white base with a soft pastel wash
  and a small concentric-circle accent motif, collapsing the 12 categories
  onto the three brand tones (orange/pink/purple) rather than 12 bespoke
  hues. Also dropped the title text baked into the SVG — the real DOM
  `<h3>` under every card already renders it, so on a light, clean image
  the duplicate text was just noise, not a poster standing in for a photo.
- **Decorative gradients split by intensity** (`apps/web/src/lib/gradient.ts`):
  one medium-soft set for the organiser page's single cover band (one
  accent moment per page), and a new pastel set (`gradientByIndex`) for
  Popular Cities tiles, which render as a repeated grid and need to stay
  light like every other card — a grid of six saturated tiles read as
  "colourful," a grid of six pastel tiles reads as "white with accents."
- **Hero (`season-strip.tsx`) de-saturated**: mood backgrounds are now
  pastel `from`/`to` pairs instead of bold gradients, body text switched
  from white to navy (`text-fg`/`text-fg-muted`), and CTAs now route
  through the shared `Button` (gradient reserved for the primary button
  only, per brief).
- **Announcement ribbon** (`announcement-ribbon.tsx`) changed from a
  solid-accent band to a soft orange-tint background with navy text —
  same "small accent, not a block of colour" logic.
- **Contrast fix for the two floating chips**: once the fallback image and
  gradients went light, `DateChip`'s off-white fill and `CategoryPill`'s
  85%-opacity fill risked blending into their own backgrounds. Both
  switched to solid white (`bg-surface`) + border + shadow, so they read
  clearly regardless of what's now behind them. Caught by reasoning about
  the change before rendering it, not from a screenshot.
- **Popular Cities tiles** got a `border` added to their image wrapper —
  needed once the no-photo fallback became pastel instead of saturated,
  for the same definition-against-a-light-background reason as the chips.

### Verification

- `pnpm typecheck` / `lint` / unit tests, full production build, and the
  18-test Playwright suite (mobile + desktop) all pass. Full-page
  screenshots of home (top/mid), event detail, organiser, browse, and
  submit — desktop and mobile — confirm the pastel hero, white fallback
  cards, soft-tint ribbon, and softened organiser/city gradients match the
  brief, with gradient use now confined to primary buttons and active
  states only.

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
