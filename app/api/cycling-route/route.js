import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
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
    .slice(0, 8);

  const avgSpeed = recentLogs.length
    ? recentLogs.reduce((s, l) => s + (l.distance / (l.duration / 60)), 0) / recentLogs.length
    : null;

  const logsSummary = recentLogs.length > 0
    ? recentLogs.map(l =>
        `- ${l.date}: ${l.duration}min, ${l.distance}km${l.avg_hr ? `, ${l.avg_hr}bpm` : ''}`
      ).join('\n')
    : 'Geen eerdere ritten beschikbaar';

  const prompt = `Je bent een fietstraining coach. Analyseer de volgende fietsrit en geef een routeadvies.

HUIDIGE TRAINING:
- Titel: ${workout.title}
- Duur: ${workout.dur} minuten
- HR zone: ${workout.hr || 'niet opgegeven'}
- Snelheid: ${workout.speed || 'niet opgegeven'}
- Doel: ${workout.target || 'geen specifiek doel'}
- Omschrijving: ${workout.desc || ''}

RECENTE RITTEN (laatste 8):
${logsSummary}
${avgSpeed ? `\nGEMIDDELDE SNELHEID UIT RITTEN: ${avgSpeed.toFixed(1)} km/h` : ''}

CRITERIA VOOR EEN GOEDE ROUTE:
- Weinig kruisingen en stoplichten
- Makkelijk doorfietsen zonder technische uitdagingen
- Veilige fietspaden of rustige landwegen
- Geschikt voor het trainingstype (zone/intensiteit)

Geef je antwoord ALLEEN als JSON (geen extra tekst):
{
  "estimatedKm": <getal: geschatte afstand in km op basis van duur en gemiddelde snelheid, aangepast voor trainingsintensiteit>,
  "routeType": "<kort routetype, bijv. 'Rustige Z2 uitduurrit' of 'Intervaltraining'>",
  "omschrijving": "<2-3 zinnen: welk soort route is ideaal voor deze training>",
  "kenmerken": ["<kenmerk 1>", "<kenmerk 2>", "<kenmerk 3>"]
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
    const zoom = km < 8 ? 14 : km < 18 ? 13 : km < 35 ? 12 : 11;

    return Response.json({
      ...result,
      estimatedKm: km,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&travelmode=bicycling`,
      komootUrl: `https://www.komoot.com/plan#map=${zoom}/${lat.toFixed(4)}/${lng.toFixed(4)}`,
    });
  } catch {
    return Response.json({ error: 'Route generation failed' }, { status: 500 });
  }
}
