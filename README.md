# 6-Weken Plan (workouts)

A personal 6-week cycling + strength training PWA: daily plan, workout logging,
body/recovery check-ins, trend insights, cycling-weather windows, and push
reminders. Built with Next.js (App Router) + React + Supabase, deployed on Vercel.

## Stack

- **Next.js 16** (App Router, React 19) — static shell + route handlers under `app/api/`
- **Supabase** — auth (email/password, magic link, Google OAuth) + Postgres with row-level security + realtime
- **Anthropic API** — owner-only AI cycling-distance estimate (`/api/cycling-route`)
- **Open-Meteo** — cycling-weather scoring (`/api/weather/cycling`)
- **web-push** — daily reminder notifications via a Vercel cron
- Installable **PWA** with a service worker (`public/sw.js`)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your values (see below)
npm run dev                  # http://localhost:3000
```

The build no longer hard-fails when Supabase env vars are missing (so preview
deployments build), but the app needs them at runtime to do anything useful.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Admin client for push + AI route auth |
| `ANTHROPIC_API_KEY` | server | AI cycling-route estimate |
| `WEB_PUSH_PUBLIC_KEY` / `WEB_PUSH_PRIVATE_KEY` / `WEB_PUSH_SUBJECT` | server | VAPID keys for web push |
| `CRON_SECRET` | server | Bearer secret guarding `/api/cron/reminders` |
| `WEATHER_LATITUDE` / `WEATHER_LONGITUDE` / `WEATHER_LOCATION_LABEL` | optional | Default weather location |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical origin for metadata (else falls back to `VERCEL_URL`) |

Database schema and RLS policies live in `supabase/schema.sql` — run it in the
Supabase SQL editor for a fresh project.

## Scripts

```bash
npm run dev     # dev server
npm run build   # check env (warn-only) + next build
npm start       # production server
npm test        # node:test suite (lib logic + API guards)
```

## Project layout

```
app/
  page.js            # main app shell + state (auth, data, realtime, views)
  layout.js          # metadata, fonts, viewport, SW registration
  globals.css        # design system (tokens, components, dark mode)
  api/               # route handlers (weather, cycling-route, push, cron, version)
  components/        # presentational components (plan, logs, checkin, insights, …)
  docs/page.js       # in-app documentation
lib/                 # pure logic: plan data, i18n, weather scoring, insights,
                     #   reminders, progress/streak, utils  (unit-tested)
public/              # manifest, icons, service worker
tests/               # node:test suites
.interface-design/   # design-system reference (see system.md)
docs/QA-REVIEW.md    # full QA/UX/a11y/perf review
```

## Design

The visual system (navy × yellow, type/spacing scales, depth strategy, component
patterns) is documented in [`.interface-design/system.md`](.interface-design/system.md).

## Notes

- The service worker uses network-first for navigations and cache-first for hashed
  assets. **Bump `CACHE_NAME` in `public/sw.js` whenever the shell changes.**
- A Report-Only Content-Security-Policy ships in `next.config.js`; validate it in
  the browser (Supabase REST + realtime, Open-Meteo, Google OAuth) before switching
  it to enforcing.
