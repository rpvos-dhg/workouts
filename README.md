# 6-Weken Plan App

Next.js app met Supabase Auth, Supabase Database en realtime sync.

## 1. Supabase nieuw opzetten

1. Maak een nieuw project in Supabase.
2. Kies een regio dichtbij Nederland, bijvoorbeeld Frankfurt.
3. Ga naar SQL Editor.
4. Run de volledige inhoud van `supabase/schema.sql`.
5. Ga naar Authentication > Providers > Email.
6. Zet Email login aan. Voor snel testen kun je email confirmation tijdelijk uitzetten.

## 2. Supabase keys

Ga naar Project Settings > API Keys en pak:

- Project URL: `https://xxxxx.supabase.co`
- Publishable key: `sb_publishable_...`

Gebruik nooit een `sb_secret_...` key in deze frontend app. Alles met `NEXT_PUBLIC_` komt in de browser terecht.

## 3. Lokale test

Maak `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

Installeer en start:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 4. Nieuwe GitHub repo

Maak een lege GitHub repo, bijvoorbeeld `workouts-app`. Push daarna deze map:

```bash
git init
git add .
git commit -m "Initial 6-week workout app"
git branch -M main
git remote add origin https://github.com/<jouw-gebruiker>/workouts-app.git
git push -u origin main
```

## 5. Vercel nieuw opzetten

1. Maak een nieuw Vercel account of log in.
2. Import Project > GitHub > kies de nieuwe repo.
3. Framework Preset: Next.js.
4. Root Directory: leeg of `./`.
5. Build Command: default of `npm run build`.
6. Output Directory: leeg/default.
7. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
8. Deploy.

Na deploy:

1. Ga naar Settings > Deployment Protection.
2. Zet Vercel Authentication uit als de app publiek bereikbaar moet zijn.
3. Open de URL via Deployments > nieuwste Ready deployment > Visit.

## 6. Eerste gebruik

Open de app, maak een account aan met email en wachtwoord, en log daarna op andere apparaten in met hetzelfde account.
