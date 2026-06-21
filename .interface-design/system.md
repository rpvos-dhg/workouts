# Interface Design System — 6-Weken Plan

A craft reference for the workouts app. If you touch UI, read this first and hold to these values.

## Intent

- **Who:** a 40-something Dutch cyclist mid-way through a 6-week cut, opening the app at 7am before a Z2 ride or in the evening to log a workout and check-in. Wants a fast answer to "what do I do today, is the weather any good, am I on track."
- **Task verb:** *orient and commit* — see today's session, mark it done, log the result.
- **Feel:** road-sign clear, ANWB-confident, calm under a grey Dutch sky. Not playful, not clinical — a dependable route card.

## Direction

- **Domain:** cycling (cadence, heart-rate zones, knooppunten, fietsweer), pols-vriendelijke strength, flat NL terrain, ANWB roadside assistance.
- **Colour world:** ANWB navy, road-sign golden yellow, off-white map paper, asphalt grey, route-line blue.
- **Signature:** navy grid texture (roadmap), the golden **yellow pip** under the active nav tab, navy-left-bordered **signal cards**, and the **weather hour-strip** ranking ride windows.
- **Rejected defaults:** flat equal-weight metric boxes → hierarchy via size+weight+colour; ad-hoc px spacing → a 4px scale; mixed depth → committed shadow+border strategy.

## Tokens (source of truth: `app/globals.css`)

- **Palette:** `--accent` navy `#003a71`, `--action` yellow `#ffcc00`, paper `--bg #fdfcf7`, ink `--ink #0f1d2e`. One hue (navy) shifts only in lightness across surfaces; yellow is the single scarce accent (~10%). Semantic: `--success #157347` (darkened to clear 4.5:1 on white text), `--danger`, `--warn`.
- **Text hierarchy — 4 levels:** `--ink` (primary) · `--muted` (secondary, 7.2:1) · `--muted-2` (metadata, ~4.5:1) · disabled via opacity.
- **Spacing — 4px base:** `--space-1..10` (4/8/12/16/20/24/32/40). Use these, not magic numbers.
- **Type — 1.25 ratio from 14px body:** `--text-caption 11 · meta 12 · body 14 · h4 16 · h3 18 · h2 22 · h1 28 · display clamp(30,6vw,44)`. Weight + colour do most of the hierarchy work; size is the third lever.
- **Radius scale:** `--radius-sm 8` (inputs) · `--radius 10` (controls) · `--radius-lg 16` (cards) · `--radius-xl 20` (modals). Concentric: nested radius = outer − padding.
- **Depth — committed strategy:** soft layered shadows (`--shadow-soft/-/-lift`) for lift + 1px low-opacity borders for dividers. Dark mode leans on borders (shadows don't read on dark). Don't introduce new depth strategies.

## Polish rules (enforced)

- **Tabular numerals** (`.tnum`) on every dynamic figure — stats, scores, streak, progress, route km, trend values — so they don't shift width.
- **`text-wrap: balance`** on h1–h3, **`pretty`** on paragraphs.
- **Hover effects isolated** to `@media (hover: hover)` so taps don't leave sticky hover states on mobile.
- **Hit areas ≥44px** including modal/toast close buttons.
- **Motion:** reduced-motion honoured globally; nav icons get a `scale(0.9)` press; FAB `scale(0.95)` active; modals slide-up with `cubic-bezier(0.16,1,0.3,1)`.
- **Focus:** 3px yellow `:focus-visible` ring, 2px offset, everywhere.

## Component patterns

- **Signal card** — navy 4px left border, `--surface`, `--radius-lg`, `--shadow-soft`; kicker (11px/700/upper/tracked) + value (`--font-display`, 800) + note (`--muted`). The app's primary scannable unit.
- **Premium card** — ink/navy background, yellow top border; used for the dark stats block.
- **Buttons** (`app/components/styles.js`): primary = navy fill / white / 44px min-height / `--radius`; ghost = surface + 2px line; small action = surface-2 + 1px line + accent text.
- **Tabs** (`Segmented`) — roving tabindex, arrow/Home/End keys, `aria-controls` → `role="tabpanel"`.
- **Nav** — mobile fixed bottom tab bar (yellow pip on active), desktop sticky top bar (navy fill on active).

## i18n

All user-facing strings (incl. ARIA labels) go through `makeT` in `lib/i18n.js`. Dates format with `t('localeTag')` (`nl-NL` / `en-GB`) via `formatDate`/`formatDateShort` in `lib/utils.js`.

## The checks before shipping UI

- **Squint:** hierarchy still reads; nothing harsh jumps out.
- **Swap:** would it feel different with Inter + a generic template? If not, you defaulted.
- **Signature:** point to the grid texture, yellow pip, signal cards, weather strip.
- **Token:** every colour/space/radius traces to a variable above — no raw hex or magic px.
