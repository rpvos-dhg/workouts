# Comprehensive QA / UX / UI / Accessibility / Performance Review

**App:** 6-Weken Plan (workouts) — Next.js 16 (App Router) + React 19 + Supabase, deployed on Vercel as an installable PWA.
**Reviewer role:** Senior full-stack / UX.
**Date:** 2026-06-21.
**Skill applied:** [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) (craft-first interface-design discipline) — used as the lens for the UI/visual findings.

> **Round 2 (follow-up PR):** the previously-documented 🟡/🔵 recommendations have now been implemented, along with a design-system refresh. See **[Round 2 — recommendations implemented](#round-2--recommendations-implemented)** at the end. The design direction is captured in [`.interface-design/system.md`](../.interface-design/system.md).

## How to read this

Each finding has a severity, an **impact** (what degrades for the user) and a concrete **fix**. Items marked **[fixed]** were implemented in this PR. 🔴 Critical and 🟠 High items are implemented; 🟡 Medium and 🔵 Low are documented recommendations unless trivially co-located with a fix.

| Severity | Meaning |
|---|---|
| 🔴 Critical | Broken/incorrect behaviour, data, or security |
| 🟠 High | Significant correctness/UX/a11y degradation |
| 🟡 Medium | Noticeable but non-blocking |
| 🔵 Low/polish | Nice-to-have, craft |

### Summary of what was fixed in this PR

1. 🟠 **[fixed]** Misnamed `app/components/route.js` was exposed by Next as a public `/components` route handler → renamed to `cycling-route-card.js`.
2. 🟠 **[fixed]** Duplicate workout-log rows from the realtime `INSERT` handler racing the optimistic insert → dedupe by `id`.
3. 🟠 **[fixed]** Streak counter reset to 0 every morning until today's workout was done → today's still-open workout no longer breaks the streak.
4. 🟠 **[fixed]** `LogForm` defaulted the date from `toISOString()` (UTC) → off-by-one near midnight; now uses local `getTodayString()`.
5. 🟠 **[fixed]** Timezone-unsafe date rendering (`new Date('YYYY-MM-DD')` parsed as UTC) in Today/Week/Plan/Log cards → parsed at local noon.
6. 🟠 **[fixed]** Weather fetch retried forever on a persistent failure → capped at 3 automatic retries (manual retry preserved).
7. 🟠 **[fixed]** `toggleComplete` used a stale-closure rollback that could clobber realtime updates → functional state updates.
8. 🟠 **[fixed]** Service worker served a stale app shell and never bumped its cache name → network-first for navigations, cache-first for hashed assets, `CACHE_NAME` bumped to `v2`.
9. 🟠 **[fixed]** `cycling-route` API constructed Supabase/Anthropic clients at module import → a missing env var crashed the route on import; now lazy with clean 503.
10. 🟠 **[fixed]** 2 high-severity dependency advisories (`next`, `ws`) → `npm audit fix` (semver-compatible, lockfile only); `0 vulnerabilities`.
11. 🟡 **[fixed]** "Meet" bottom-nav tab with a pending-measurement dot had no accessible text → adds an `aria-label` announcing the open measurement.
12. 🟡 **[fixed]** Header menu didn't move focus on open → first item now receives focus.

---

## 1. Functional QA (correctness)

### 1.1 🟠 [fixed] `app/components/route.js` became an unintended `/components` endpoint
**Impact:** Next.js App Router treats any `route.js` as an HTTP route handler. This file actually exports the `CyclingRouteCard` React component, so the build produced a dynamic `ƒ /components` route (visible in `next build` output) — a public endpoint backed by a client component with no valid handlers. Dead surface area at best, an error/confusing 405 at worst.
**Fix:** Renamed to `app/components/cycling-route-card.js` and updated the import in `plan.js`. Build now emits 11 routes (no `/components`).

### 1.2 🟠 [fixed] Duplicate workout logs (realtime INSERT vs optimistic insert)
**Impact:** `saveLog` optimistically prepends the new row, and the Supabase realtime `INSERT` subscription *also* prepends `payload.new` with no de-dupe. The same log appears twice and React logs a duplicate-`key` warning until reload.
**Fix:** `app/page.js` — both the optimistic `setLogs` and the realtime `INSERT` handler now guard with `prev.some(l => l.id === …)`.

### 1.3 🟠 [fixed] Streak resets every morning
**Impact:** `streak` iterates past days incl. `today`; if today's training wasn't done yet it `break`s immediately → the streak reads **0** every morning until you complete the day, destroying the motivation feature.
**Fix:** Today's still-open day is now skipped (`continue`) instead of breaking the streak.

### 1.4 🟠 [fixed] `LogForm` default date is UTC, not local
**Impact:** `new Date().toISOString().slice(0,10)` is the **UTC** date. In NL (UTC+1/+2), between local midnight and ~02:00 the prefilled date is *yesterday*; the user logs a workout against the wrong day.
**Fix:** Uses `getTodayString()` (local).

### 1.5 🟠 [fixed] Timezone-unsafe date display
**Impact:** `new Date('2026-04-28')` is parsed as UTC midnight; `toLocaleDateString` then renders the *previous* calendar day for any user west of UTC. Affects Today header, Week/Plan day cards, Day detail, and Log cards.
**Fix:** All these sites now parse `\`${date}T12:00:00\`` (local noon — DST-safe), matching the existing `formatDateShort` helper.

### 1.6 🟠 [fixed] Weather retry loop has no cap
**Impact:** On a persistent `/api/weather/cycling` failure, the catch schedules `setWeatherRetry(n+1)` every 5 s forever → endless background fetches + spinner churn, draining battery/data.
**Fix:** Auto-retry capped at 3; the manual "Try again" button still works.

### 1.7 🟠 [fixed] `toggleComplete` stale-closure rollback
**Impact:** Optimistic update and error rollback both close over the render-time `completed` object. A rapid second toggle, or a realtime event landing in between, can be clobbered by the rollback restoring an outdated map.
**Fix:** Converted to functional `setCompleted(prev => …)` for set and rollback.

### 1.8 🟡 `completedPct` denominator includes non-completable days
**Impact:** `progressPct = completedCount / PLAN_DATA.length` (95). `check` days route to the measurement flow and are never toggled, so 100% is unreachable; the prominent header "X% complete" silently caps below 100.
**Fix (recommended):** Compute the denominator from days that can actually be marked done (exclude `check`, or whatever the product decides counts).

### 1.9 🟡 Error handling swallows the initial data-load failure
**Impact:** In `App`'s `load()` effect, if `Promise.all` of the five Supabase queries rejects, there's no `.catch` — the user sees empty data with no error, no retry. (Individual `{ data }` errors are ignored via `|| []`.)
**Fix (recommended):** Wrap in try/catch and surface a toast + retry; consider a per-section error state.

### 1.10 🟡 `localStorage`/`sessionStorage` JSON safety & quota
**Impact:** Reads are guarded (`getItem` compared to literals), but `measurement-notification-*` keys accrete one per measurement and are never cleaned; CSV export and notification writes aren't wrapped against `QuotaExceededError` (Safari private mode throws). Low volume, but unhandled.
**Fix (recommended):** Wrap storage writes in try/catch; prune stale notification keys.

### 1.11 🔵 CSV formula injection
**Impact:** `exportLogsCSV` quotes `notes` but doesn't neutralise leading `=`,`+`,`-`,`@`; opened in Excel a crafted note is interpreted as a formula. Single-user app with self-authored notes → low.
**Fix (recommended):** Prefix risky cells with `'`.

---

## 2. UX / Interaction Design

- 🟡 **Optimistic feedback is good** (toggle, habits, logs all update instantly; `syncing` indicator in header). Empty states exist for logs ("no workouts"), trends ("not enough data"), measurements ("none saved").
- 🟠 **[fixed] Stale-version handling** — the in-app "new version available" banner + auto-reload is a thoughtful touch, but combined with the cache-first SW the user could be told to update while the SW keeps serving the old shell. The SW change (§7) makes navigations network-first so the reload actually fetches the new build.
- 🟡 **Destructive action** — log delete is confirmed via `ConfirmProvider` ✅. There's **no undo**; a toast with an "undo" action (the toast component already supports `action`) would be a cheap win.
- 🟡 **`alert`-free** ✅ — all feedback goes through toasts/inline status, good.
- 🔵 **FAB overlaps content** at the very bottom of long lists on mobile; the shell adds `padding-bottom`, but the FAB can still cover the last card's tap target in landscape. Consider extra bottom padding when the last item is interactive.
- 🟡 **Copy consistency** — "Meet/Measure" vs "meetmoment/measurement", "Log/loggen" are consistent enough; date locale is hard-coded `nl-NL` even in EN mode (see §2 i18n).

### Internationalisation
- 🟡 **Hard-coded Dutch strings** that bypass `t()` and won't translate to EN:
  - `DashboardStrip` `aria-label="Trainingsdashboard"`, `DayCard` icon `aria-label="Intensief"`/`"Belangrijk"`, `MiniChart` `aria-label="Trendgrafiek"`, Toast region `aria-label="Meldingen"` + "Melding sluiten", `ErrorBoundary` button "Pagina herladen", `useModal`/`ModalShell` default `closeLabel="Sluiten"`, `ConfirmProvider` default labels.
  - All `toLocaleDateString('nl-NL', …)` calls ignore the selected language.
  **Fix (recommended):** Route these through `t()` and pass `lang === 'en' ? 'en-GB' : 'nl-NL'` to date formatting. (Several are screen-reader-only, hence Medium not High.)
- 🟡 **Text expansion** — German/long strings: the bottom nav uses fixed 5 short labels and `overflow-x:auto`; generally OK, but `signal-value` uses `clamp()` and could clip very long focus strings. Acceptable.

---

## 3. UI / Visual Design (interface-design lens)

**Direction:** ANWB-navy × golden-yellow on off-white paper, Bricolage Grotesque display + Inter body, subtle grid texture. This is a *decided* signature (token names like `--ink`, `--action`, `--copper`, the navy grid, the yellow pip under the active tab) — it passes the swap/signature tests far better than generic SaaS output. Good.

- 🟡 **Token system is mostly coherent** but has a few smells:
  - `--copper: #003a71` is a legacy alias mapped to navy "for component compat" — dead-ish indirection; fold call-sites onto `--accent` and remove.
  - A lot of **inline magic numbers** (`padding:'16px'`, `'24px'`, `borderRadius:'999px'`, font sizes `11/13/15/17/22/24/26px`) are sprayed across components rather than bound to a scale. It's internally consistent enough to read as designed, but it's the kind of duplication the design-system "extract on 2nd reuse" rule targets. Consider spacing/typography token vars.
- 🔵 **Depth strategy is mixed** — borders + soft shadows + surface-color shifts are all in play. It reads fine, but the interface-design guidance is "choose one and commit." Standardising on the shadow scale (`--shadow-soft/-/-lift`) + 1px borders for dividers would tighten it.
- 🔵 **Concentric radius** — nested rounded elements (e.g. weather bar wells inside cards) reuse the same radius rather than `inner = outer − padding`. Minor.
- 🔵 **Tabular numbers** — dynamic figures (speeds, scores, countdown, kcal) don't use `font-variant-numeric: tabular-nums`, so counters jitter on width. Cheap polish.
- ✅ Cards share consistent padding/shadow/hover; buttons share hover/active/focus; iconography is one family (lucide), consistently sized.

---

## 4. Accessibility (WCAG 2.1 AA)

- ✅ **Strong baseline:** semantic landmarks (`header`/`nav`/`main`/`aside`), skip-link, `:focus-visible` ring (yellow, high-vis), `role="dialog"`+focus-trap+Escape+focus-return in `useModal`, `aria-live` status regions, `aria-current` on nav, `aria-pressed`/`aria-checked` on toggles/radios, icon-only buttons have `aria-label`, decorative icons `aria-hidden`.
- 🟡 **[fixed]** The "Meet" tab's pending-measurement dot conveyed information by colour alone with no accessible name → added `aria-label` announcing it.
- 🟡 **[fixed]** Opening the header menu didn't move focus into it → first item now focused (Escape already closes it).
- 🟠 **Menu is an incomplete ARIA `menu`** — `role="menu"`/`menuitem` without arrow-key roving focus or `Home/End`. Either implement the [APG menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/) or, simpler and just as valid, drop the `menu` roles and present it as a labelled group of buttons/links. (Documented; full pattern is beyond a minimal fix.)
- 🟠 **`Segmented` uses `role="tablist"`/`tab`** but the content panels aren't `role="tabpanel"`, aren't linked via `aria-controls`, and there's no arrow-key navigation. Screen-reader users are told "tab" but get no tab semantics. **Fix (recommended):** add `tabpanel`+`aria-controls`+arrow keys, or use plain buttons with `aria-pressed`.
- 🟡 **Charts** — `MiniChart`/weather bars expose a single generic `aria-label` ("Trendgrafiek"/"Hourly scores") with no data. Consider a visually-hidden data table or a richer label (latest value + delta).
- 🟡 **Contrast** — most pairs pass (`--muted` 7.2:1, `--muted-2` ~4.5:1). Watch white text on `--success #2e7d57` and walk-green `#2C7A2C` button backgrounds at 16px/600 (≈4.5:1 — borderline AA for normal text). Verify with a contrast tool at rendered size; nudge the greens darker if they fail.
- ✅ `prefers-reduced-motion` is honoured globally.
- ✅ Reduced-motion + 44px touch targets are applied consistently (buttons `min-height:44px`). Exceptions: toast close `×` (32px) and modal close (36px) are below 44 — 🔵.

---

## 5. Responsive Design & Multi-Device

- ✅ Mobile-first; bottom tab bar on mobile, sticky top nav ≥800px; `dvh/svh` fallbacks; `env(safe-area-inset-*)` on the shell, nav, FAB and toast stack; `viewport-fit` via `width=device-width`. Horizontal-scroll guards (`overflow-x:hidden`, `min-width:0` on grid children).
- 🔵 `layout.js` `viewport` doesn't set `viewportFit: 'cover'`; safe-area insets only fully apply in standalone PWA when cover is set. Add `viewportFit: 'cover'` to be safe on notched devices in-browser.
- 🟡 `@media (hover: hover)` is **not** used — hover lifts/scales (`.fab:hover`, card `translateY`) fire on touch via emulated hover, causing sticky hover states after tap. Wrap decorative `:hover` in `@media (hover: hover)`.
- ✅ 200% zoom / 320px reflow: layout uses `rem`-free but fluid `clamp()`/`min()` widths and wrapping flex; no fixed pixel page width. Touch targets ≥44 (with the two exceptions above).
- 🔵 No print stylesheet (not really applicable to this app).

---

## 6. Performance

- ✅ Small surface: no heavy client libs beyond lucide-react + supabase; charts are hand-rolled SVG (no charting dep). Fonts via `next/font` (self-hosted, `display:swap` implicit).
- 🟠 **[fixed]** SW cache-first-for-everything made the app shell sticky/stale; now network-first for navigations.
- 🟡 **lucide-react `^1.14.0`** — ensure named imports tree-shake (they do here). Fine.
- 🟡 **Re-render pressure** — `App` holds all state; many `useMemo`s are correctly memoised, but the realtime subscription effect and the top-level component re-render the entire view tree on every keystroke in modals (modals are children of `App`). Acceptable at this scale; if it grows, lift forms into isolated components/contexts.
- 🔵 `getWeekOverview`/`getTodayString` are cheap; `AllView` renders all 95 day cards at once in the Plan tab — fine now, virtualise only if the plan grows.
- 🔵 Weather endpoint uses `next: { revalidate: 1800 }` (good server caching). Open-Meteo response isn't size-trimmed but is small.

---

## 7. PWA

- ✅ Manifest has name/short_name/id/start_url/scope-by-default/display/theme/background/categories and 192+512 PNG icons; `apple-touch-icon` + `appleWebApp` set in `layout.js`; `theme_color` matches brand.
- 🟠 **[fixed]** SW: cache name never versioned (`v1`) and no per-resource strategy. Now `CACHE_NAME='workouts-shell-v2'`, network-first navigations, cache-first hashed assets, offline fallback to cached `/`. **Remember to bump `v2`→`v3` on future shell changes.**
- 🟡 **Maskable icon** — manifest marks the **SVG** as `"purpose":"any maskable"`. Maskable should be a PNG with a safe zone; `icon-512.png` is already `any maskable`, so drop `maskable` from the SVG entry to avoid Lighthouse warnings and odd masking.
- 🟡 **No offline fallback page** for non-cached routes (e.g. `/docs` offline). The new SW falls back to cached `/` for navigations, which is a reasonable minimum.
- ✅ Update flow exists (version endpoint + banner + auto-reload).

---

## 8. Security & Privacy

- ✅ **No secrets in client.** `ANTHROPIC_API_KEY`, service-role key, VAPID private key, `CRON_SECRET` are server-only. Supabase publishable/anon key in client is expected.
- ✅ **No XSS sinks** — no `dangerouslySetInnerHTML`/`innerHTML`/`eval`/`document.write`; all rendering is React-escaped.
- ✅ **AuthZ** — RLS on every table (owner-scoped policies); cron endpoint checks `CRON_SECRET`; push endpoints validate the bearer via `getRequestUser`; the owner-only AI route checks a normalised email.
- 🟠 **[fixed]** `cycling-route` created the service-role Supabase client and Anthropic client at **module import**, so a missing env var threw during import (route 500/instability). Now lazily constructed with a clean 503.
- 🟠 **[fixed]** **Dependency vulnerabilities** — `npm audit` reported 2 high (Next.js middleware/DoS/cache advisories, `ws`). `npm audit fix` (semver-compatible, lockfile only) → **0 vulnerabilities**; build + tests still green.
- 🟡 **No Content-Security-Policy.** Add a CSP (header in `next.config.js` or middleware) restricting `connect-src` to Supabase + Open-Meteo, `script-src 'self'`, etc. The app uses inline `style={{…}}` heavily, so a strict `style-src` would need `'unsafe-inline'` or a refactor — document the trade-off.
- 🔵 **SRI/3rd-party** — only first-party + Supabase/Open-Meteo (fetch APIs, not script tags), so no `<script integrity>` surface. Good.
- 🔵 **PII** — weight/waist/HR/HRV/mood stored in Supabase under RLS; this is health data. Confirm Supabase region/retention meet expectations; consider a privacy note in `/docs`.

---

## 9. Code Quality & Maintainability

- ✅ Clear separation: `lib/` pure logic (well unit-tested for weather/insights/reminders), `app/components/` presentational, `app/api/` handlers. Consistent naming, ESM, React 19 idioms.
- 🟠 **[fixed]** The `route.js`-as-component naming trap (§1.1) — a maintainability landmine that also produced a runtime route.
- 🟡 **Inline-style duplication** — large `style={{…}}` objects repeated across cards/buttons (the design-system "extract on 2nd reuse" smell). `styles.js` centralises buttons/inputs; extend it to card/section/tag styles or move to CSS classes (the project already has a rich `globals.css`).
- 🟡 **Error boundaries** are present (top-level + per-view) ✅; but several `async` UI handlers (`signOut`, `linkGoogle`, weather/route fetches) lack user-facing error surfacing on throw.
- 🟡 **Tests** cover lib math and a few API guards (9 passing). **Untested critical paths worth adding:** streak logic, realtime-dedupe reducers, `getTodayString`/date helpers across timezones, `buildLogPayload` coercion, `getReminderTargets` edge dates. Extracting the streak/dedupe reducers from `page.js` into `lib/` would make them testable.
- 🟡 **README** — none at repo root. Add setup/dev/deploy + env table (`.env.example` is good but undocumented).
- ✅ `.gitignore` covers `node_modules`, `.env*`, build output, OS files, test artefacts.

---

## 10. SEO & Social

- 🟡 App is auth-gated/personal, so SEO is low-priority, but `/docs` is public:
  - No `og:*`/`twitter:card` meta, no canonical. Add to `layout.js`/`docs` metadata if sharing matters.
  - ✅ One `h1` per page, logical headings, semantic lists.
  - 🔵 No `robots.txt`/`sitemap.xml`. For a private app, add `robots: { index: false }` to keep the app out of search while leaving `/docs` indexable if desired.

---

## Verification notes (what couldn't be fully tested here)

- **Build & tests run in this environment:** `npm run build` (with dummy Supabase env) ✅ compiles, type-checks, prerenders 11 routes; `npm test` ✅ 9/9; `npm audit` ✅ 0 vulnerabilities after fix.
- **Not testable here (no browser/device lab / no live Supabase):**
  - Realtime dedupe (§1.2) and `toggleComplete` race (§1.7) verified by code reasoning; confirm against a live Supabase project by logging the same workout twice quickly and watching for a single row.
  - SW behaviour (§7) — verify in Chrome DevTools → Application: network-first navigation, `workouts-shell-v2` cache, old `v1` deleted on activate, offline navigation falls back.
  - Timezone fixes (§1.4/§1.5) — verify by setting the OS timezone to e.g. `America/Los_Angeles` and checking the Today header + a freshly opened Log form just after local midnight.
  - Colour-contrast borderline greens (§4) — verify with a contrast checker at rendered size on a real display (light + dark mode).
  - PWA installability / maskable icon (§7) — verify via Lighthouse PWA audit.
- **Not changed (left as documented recommendations):** ARIA menu/tabs patterns, CSP, i18n string sweep, `completedPct` denominator, README — these are either larger refactors or product decisions and are out of scope for a minimal, low-risk PR.

---

## Round 2 — recommendations implemented

A follow-up PR (branch `claude/design-refresh-and-recommendations`) implements the
remaining 🟡/🔵 recommendations plus a design-system refresh. Verified: `npm test`
22/22, `next build` green **with and without** Supabase env.

### Retraction
- **§1.8 `completedPct` denominator — withdrawn.** On re-examination, *every* day
  type (including `check`) can be marked complete via the toggle circle in
  `DayCard`, so 100% is reachable. The denominator (`PLAN_DATA.length`) is correct;
  no change made.

### Design system refresh (interface-design skill) — [done]
- Added a real **spacing scale** (`--space-1..10`, 4px base) and **type scale**
  (`--text-caption..display`, 1.25 ratio) and a **radius scale** (`--radius-sm..xl`).
- Committed to a single **depth strategy** (soft shadows + 1px borders) and removed
  the dead `--copper` alias.
- **Tabular numerals** (`.tnum`) on dynamic figures (header progress/streak, log
  stats, metric tiles, trend values, route km).
- **`text-wrap: balance`** on headings, **`pretty`** on paragraphs; optical
  letter-spacing on large type.
- **Hover effects isolated** to `@media (hover: hover)` (no sticky hover on touch).
- Tactile **press feedback** on nav icons.
- Design direction persisted in `.interface-design/system.md`.

### Accessibility — [done]
- **§4 contrast:** `--success` darkened `#2e7d57 → #157347` to clear AA (≥4.5:1) for
  white text on green buttons.
- **§4 ARIA tabs:** `Segmented` now has roving tabindex + Arrow/Home/End keys and
  `aria-controls`; Plan content wrapped in `role="tabpanel"` linked to its tab.
- **§4 ARIA menu:** header dropdown supports Arrow/Home/End roving focus.
- **§4 charts:** trend charts get a descriptive, translatable `aria-label`
  (title + latest value + delta) instead of a generic one.
- **§4 hit areas:** modal close and toast buttons raised to 44×44px.

### i18n — [done]
- Hard-coded Dutch strings routed through `t()`: dashboard/menu/chart/toast/confirm/
  error-boundary ARIA + labels.
- Date formatting is locale-aware via `t('localeTag')` (`nl-NL`/`en-GB`) using new
  `formatDate`/`parseLocalDate` helpers.

### Functional / robustness — [done]
- **§1.9 initial load:** `Promise.all` errors are caught → red retry banner +
  toast instead of silent empty data.
- **§1.10 storage safety:** `localStorage`/`sessionStorage` reads/writes wrapped
  (`safeStorageGet/Set`) against quota/private-mode throws.
- **§1.11 CSV injection:** every cell escaped via `escapeCsvValue` (neutralises
  `= + - @` formula prefixes).
- **§2 undo:** deleting a log shows an **Undo** toast that re-creates it.
- Extracted streak/progress/log-dedupe into `lib/progress.js` (unit-tested).
- Fixed a latent ESM bug: `lib/utils.js` imported `./i18n` without the `.js`
  extension (worked in webpack, broke Node ESM).

### PWA / SEO / security — [done]
- **§7 manifest:** dropped `maskable` from the SVG icon (PNG 512 remains maskable).
- **§7 viewport:** added `viewportFit: 'cover'` for notched devices.
- **§8 CSP + headers:** `next.config.js` now sends `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and a **Report-Only**
  CSP (won't break Supabase realtime/OAuth/Open-Meteo; ready to enforce after
  browser validation).
- **§10 SEO:** added Open Graph / Twitter / `metadataBase` / `robots: noindex`
  (private app) to `layout.js`.

### Code quality — [done]
- Added `README.md` (setup, env table, scripts, layout).
- New tests: `tests/progress.test.mjs`, `tests/utils.test.mjs` (streak edge cases,
  dedupe, date helpers, CSV escaping).

### Round 3 — CSP enforced + style extraction [done]
- **CSP now enforced** — `next.config.js` ships `Content-Security-Policy` (was
  Report-Only) plus `upgrade-insecure-requests`. Verified the header (and the four
  hardening headers) are emitted at runtime via `next start` + `curl -D`. Kept
  `'unsafe-inline'` for script/style (Next bootstrap + inline styles need it absent
  a nonce pipeline); `connect-src` allows Supabase REST + realtime websockets.
- **Inline-style extraction** — the repeated `className="signal-kicker"
  style={{ color: 'var(--accent-strong)' }}` (10 sites across 5 files) replaced
  with a `.signal-kicker--accent` modifier class. Identical rendering, no inline
  override.

### Round 4 — finishing the remaining items

- **Offline fallback page — [done].** Added `app/offline/page.js` (brand-styled),
  precached in the service worker, and used as the navigation fallback when both
  network and cache miss. `CACHE_NAME` bumped to `workouts-shell-v3`.
- **Inline-style extraction (eyebrows) — [done].** Extracted the repeated
  `11px/800/uppercase/0.08em` caption into a `.eyebrow` class and applied it to the
  four exact-match sites in `plan.js` (colour/opacity/margin stay inline where they
  vary). Remaining uppercase labels are genuine one-offs or already single-definition
  components (`SectionTitle`, `MetricTile`) — left inline, which is correct per the
  design discipline (extract repetition, not one-offs).
- **Nonce-based CSP to drop `'unsafe-inline'` — attempted, reverted (won't fix).**
  Implemented a middleware that sets a per-request `script-src 'nonce-…'
  'strict-dynamic'`. **Verified via `next start` + `curl` that it blanks the app:**
  the served `/` HTML had 16 `<script>` tags with **0 nonces**, because the root is a
  static client shell prerendered at build time — the per-request nonce never reaches
  the baked script tags, so `'strict-dynamic'` blocks every script. Making it work
  needs forcing all pages to dynamic rendering (loses static prerender) with
  uncertain Turbopack nonce propagation, for low real gain: the app has **no
  HTML-injection sinks** (no `dangerouslySetInnerHTML` anywhere), so `'unsafe-inline'`
  on `script-src` is low-risk here. Kept the working enforced CSP from Round 3.

### Still open (documented, not done)
- A true nonce/hash CSP that drops `'unsafe-inline'` would require (a) converting the
  app's inline `style={{…}}` attributes to classes (style nonces don't cover
  attributes) and (b) forcing dynamic rendering for script nonces. Large refactor;
  not worthwhile until inline styles are largely removed.
