# Redesign Plan — "Roadbook" direction

Locked: 2026-06-21. Owner-approved scope: **Full IA revamp**, build **Phase 0 + Phase 1** first.

## Visual direction (locked): Roadbook

The app reads like an **ANWB cycling roadbook**: a navy route card you orient
against at 7am. We push the existing signature (navy grid, yellow pip, signal
cards, weather strip) further with two new primitives:

- **Route-line** — a horizontal navy line with knooppunt dots, used as a section
  divider / progress rail. The literal "route" metaphor.
- **HR zone ramp** — a 5-step effort ramp (`--zone-1..5`) so heart-rate zones,
  ride intensity, and the eventual route-profile read by colour, not just text.

Everything still traces to tokens in `app/globals.css`. No new depth strategy,
no second accent hue.

## Information architecture: 6 tabs → 4 + center Record

| Old (6 tabs)              | New                                                   |
| ------------------------- | ----------------------------------------------------- |
| Today                     | **Vandaag** (tab) — command-centre, unchanged in P1   |
| Week + Plan(days)         | **Agenda** (tab) — week focus + full 6-week plan      |
| Insights + Meet(history)  | **Voortgang** (tab) — trends now; Meet merges in P4   |
| Log                       | **Logboek** (tab)                                     |
| —                         | **Record (⊕)** centre nav button → bottom sheet       |
| Plan(zones/food/strength/tips) | **Gids** — moved to header menu (sub-view)       |
| Meet (check-in form)      | sub-view, reachable from Record + measurement CTAs    |

**Record sheet** (centre ⊕) offers three actions:
1. Log workout → existing `LogForm`
2. Log measurement → existing `CheckInView` (sub-view `checkin`)
3. Mark today complete → `toggleComplete(today.id)`

The standalone yellow FAB is retired; the centre ⊕ is the single capture entry.

Nav active mapping: `checkin` highlights **Voortgang**; `guide` highlights nothing
(it lives in the header menu).

## Phases

- **Phase 0 — Foundations (this PR).** Zone-ramp tokens (`--zone-1..5`, light+dark),
  `.route-strip` primitive, centre-Record nav CSS, Record-sheet action styles.
  Tokens are consumed immediately (zones coloured by ramp; route-strip in the
  Record sheet) so nothing is dead code.
- **Phase 1 — Navigation + Record (this PR).** 4-tab + ⊕ nav, `RecordSheet`,
  `AgendaView`, `GuideView`; route `checkin`/`guide` as sub-views; move Gids to
  the header menu; retire FAB.
- **Phase 2 — Vandaag as command centre (done).** Week route-profile strip at the
  top of Today + an inline weather verdict chip in the hero for cycle days.
- **Phase 3 — Agenda route profile (done).** Per-week `RouteProfile` (intensity
  ramp on a knooppunt rail) above each week's day list.
- **Phase 4 — Voortgang merge (done).** `MeasurementHistory` extracted from the
  check-in and folded into Voortgang under the trends; rows link back into the
  check-in form.
- **Phase 5 — Cockpit shell (done).** Full spatial overhaul: desktop fixed navy
  **left rail** (`.app-rail`) + content `.app-frame` replacing the desktop top
  bar; **editorial masthead** with a giant week-number watermark, contextual
  display headline, stat row and progress rail; mobile keeps the bottom tab bar +
  centre Record. Shared `SectionTitle` upgraded to a road-sign tick marker.

## Guardrails

- Every screen stays reachable; no data action is lost in the IA change.
- Build + tests green before each push.
- Dutch + English strings via `makeT`; dates via `t('localeTag')`.
