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
    .slice(0, 10);

  const logsSummary = recentLogs.length > 0
    ? recentLogs.map(l =>
        `- ${l.date}: ${l.duration}min, ${l.distance}km${l.avg_hr ? `, ${l.avg_hr}bpm` : ''}${l.notes ? `, "${l.notes}"` : ''}`
      ).join('\n')
    : 'Geen eerdere ritten beschikbaar';

  const prompt = `Je bent een fietscoach die op basis van trainingsdata de juiste afstand voor een rit berekent.

HUIDIGE TRAINING:
- Titel: ${workout.title}
- Geplande duur: ${workout.dur} minuten
- HR zone: ${workout.hr || 'niet opgegeven'}
- Doelsnelheid: ${workout.speed || 'niet opgegeven'}
- Doel: ${workout.target || 'geen specifiek doel'}
- Omschrijving: ${workout.desc || 'geen omschrijving'}

RECENTE RITTEN (meest recent eerst):
${logsSummary}

ANALYSE-OPDRACHT:
1. Bereken de gemiddelde snelheid per recent rit (km ÷ duur in uren).
2. Stel een verwachte snelheid in voor de huidige training op basis van de HR zone en omschrijving. Kijk ook naar de trend en het soort training (herstelrit, Z2-duurrit, Z3-tempo, intervaltraining).
3. Schat de afstand: duur × verwachte snelheid. Pas aan voor trainingsintensiteit (hogere zone = lagere snelheid maar niet altijd kortere afstand bij vaste duur).
4. Geef een beknopte onderbouwing die aangeeft welke ritten het meest meewogen en waarom.

Geef je antwoord ALLEEN als JSON (geen extra tekst):
{
  "estimatedKm": <geheel getal>,
  "routeType": "<kort type, bijv. 'Z2 duurrit' of 'Z3 tempotraining'>",
  "rationale": "<2-3 zinnen: welke recente ritten wogen mee, welke snelheid je verwacht en hoe je op dit getal uitkomt>"
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    const km = Math.max(1, Number(result.estimatedKm) || 15);

    const fietsersbondUrl = `https://routeplanner.fietsersbond.nl/?locations=${lat.toFixed(6)},${lng.toFixed(6)};&route_type=70&preferences=63,71&mode=roundtrip&distance=${Math.round(km)}&poi_visible=knooppunt,pontveren,station`;

    return Response.json({
      estimatedKm: km,
      routeType: result.routeType || '',
      rationale: result.rationale || '',
      fietsersbondUrl,
    });
  } catch (err) {
    return Response.json({ error: `Route generation failed: ${err.message}` }, { status: 500 });
  }
}
