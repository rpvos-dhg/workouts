import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_EMAIL = 'remcopvos@gmail.com';

function normalizeEmail(email = '') {
  const [local, domain] = email.toLowerCase().split('@');
  if (!domain) return email.toLowerCase();
  const normalLocal = domain === 'gmail.com' ? local.replace(/\./g, '') : local;
  return `${normalLocal}@${domain}`;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user || normalizeEmail(user.email) !== normalizeEmail(ALLOWED_EMAIL)) {
    return Response.json({ error: 'AI-routeadvies is alleen beschikbaar voor de eigenaar van deze app.' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { workout, cycleLogs, lat, lng } = body;
  if (!workout || !lat || !lng) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const recentLogs = (cycleLogs || [])
    .filter(l => l.type === 'cycle' && l.distance && l.duration)
    .slice(0, 10)
    .map(l => ({
      ...l,
      avgSpeedKmh: Math.round((l.distance / (l.duration / 60)) * 10) / 10,
    }));

  const logsSummary = recentLogs.length > 0
    ? recentLogs.map(l =>
        `- ${l.date}: ${l.duration}min, ${l.distance}km, gem. ${l.avgSpeedKmh}km/u${l.avg_hr ? `, ${l.avg_hr}bpm` : ''}${l.notes ? `, opmerking: "${l.notes}"` : ''}`
      ).join('\n')
    : 'Geen eerdere ritten beschikbaar.';

  const speeds = recentLogs.slice(0, 5).map(l => l.avgSpeedKmh).filter(Boolean);
  const avgSpeed5 = speeds.length > 0
    ? (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)
    : null;

  const systemPrompt = `Je bent een persoonlijke fietscoach voor een wielrenner in Nederland (overwegend vlak terrein). \
Je analyseert trainingsdata en geeft nauwkeurige afstandsschattingen op basis van eerdere prestaties en het trainingsdoel van vandaag. \
Je antwoord is ALTIJD uitsluitend geldig JSON — geen inleiding, geen uitleg buiten het JSON-object.`;

  const userPrompt = `TRAININGSPROFIEL
Gemiddelde snelheid afgelopen 5 ritten: ${avgSpeed5 ? `${avgSpeed5} km/u` : 'onbekend'}

VANDAAGSE TRAINING
- Naam: ${workout.title}
- Geplande duur: ${workout.dur} minuten
- HR-zone: ${workout.hr || 'niet opgegeven'}
- Doelsnelheid: ${workout.speed ? `${workout.speed} km/u` : 'niet opgegeven'}
- Trainingsdoel: ${workout.target || 'niet opgegeven'}
- Omschrijving: ${workout.desc || 'geen omschrijving'}

RECENTE RITTEN (nieuwste eerst, gemiddelde snelheid is al berekend)
${logsSummary}

INSTRUCTIES
1. Gebruik de pre-berekende gemiddelde snelheden als vertrekpunt voor de verwachte snelheid.
2. Pas de snelheid aan op basis van de HR-zone:
   - Z1/herstel: −15% van het persoonlijke gemiddelde
   - Z2/duurrit: −5 tot 0% (basissnelheid)
   - Z3/tempo: +3 tot +8%
   - Z4+/interval of race: hogere intensiteit maar kortere blokken, gebruik geplande duur als leidraad
3. Schat de afstand = (geplande duur in uren) × verwachte snelheid.
4. Schrijf de rationale in 2 zinnen, direct gericht aan de renner, met de meest bepalende ritten en de verwachte snelheid.

Antwoord uitsluitend als JSON:
{
  "estimatedKm": <geheel getal>,
  "expectedAvgSpeed": <één decimaal, km/u als getal>,
  "routeType": "<kort label, bijv. 'Z2 duurrit', 'Z3 temporit' of 'herstelrit'>",
  "rationale": "<2 zinnen gericht aan de renner>"
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    const km = Math.max(1, Number(result.estimatedKm) || 15);

    const fietsersbondUrl = `https://routeplanner.fietsersbond.nl/?locations=${lat.toFixed(6)},${lng.toFixed(6)};&route_type=70&preferences=63,71&mode=roundtrip&distance=${Math.round(km)}&poi_visible=knooppunt,pontveren,station`;

    return Response.json({
      estimatedKm: km,
      expectedAvgSpeed: result.expectedAvgSpeed ?? null,
      routeType: result.routeType || '',
      rationale: result.rationale || '',
      fietsersbondUrl,
    });
  } catch (err) {
    return Response.json({ error: `Route generation failed: ${err.message}` }, { status: 500 });
  }
}
