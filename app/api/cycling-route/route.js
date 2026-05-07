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

  const prompt = `Je bent een fietstraining coach én lokale routeplanner. Analyseer de training en genereer een concrete rondrit met GPS-waypoints.

STARTLOCATIE: ${lat.toFixed(5)}, ${lng.toFixed(5)}

HUIDIGE TRAINING:
- Titel: ${workout.title}
- Duur: ${workout.dur} minuten
- HR zone: ${workout.hr || 'niet opgegeven'}
- Snelheid: ${workout.speed || 'niet opgegeven'}
- Doel: ${workout.target || 'geen specifiek doel'}
- Omschrijving: ${workout.desc || ''}

RECENTE RITTEN (laatste 8):
${logsSummary}
${avgSpeed ? `\nGEMIDDELDE SNELHEID: ${avgSpeed.toFixed(1)} km/h` : ''}

EISEN VOOR DE ROUTE:
- Rondrit die start én eindigt bij de startlocatie
- Weinig kruisingen en stoplichten
- Fietspaden of rustige wegen, geen drukke stadsroutes
- Passend bij het trainingstype en de intensiteitszone
- Genereer 4 tot 6 tussenstops die de gewenste afstand vormen

Gebruik je geografische kennis van het gebied rond de startlocatie om realistische waypoints te kiezen (bestaande wegen, fietspaden, water, parken). De waypoints hoeven niet exact te kloppen maar moeten in de buurt liggen.

Geef je antwoord ALLEEN als JSON (geen extra tekst):
{
  "estimatedKm": <getal>,
  "routeType": "<kort routetype>",
  "omschrijving": "<2-3 zinnen over de route>",
  "kenmerken": ["<kenmerk 1>", "<kenmerk 2>", "<kenmerk 3>"],
  "waypoints": [
    { "lat": <getal>, "lng": <getal>, "naam": "<naam van dit punt>" },
    ...
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    const km = Math.max(1, Number(result.estimatedKm) || 15);
    const zoom = km < 8 ? 14 : km < 18 ? 13 : km < 35 ? 12 : 11;

    const waypoints = Array.isArray(result.waypoints) ? result.waypoints : [];
    const waypointStr = waypoints
      .map(w => `${Number(w.lat).toFixed(6)},${Number(w.lng).toFixed(6)}`)
      .join('|');

    const mapsUrl = waypointStr
      ? `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${lat},${lng}&waypoints=${encodeURIComponent(waypointStr)}&travelmode=bicycling`
      : `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&travelmode=bicycling`;

    return Response.json({
      ...result,
      estimatedKm: km,
      waypoints,
      mapsUrl,
      komootUrl: `https://www.komoot.com/plan#map=${zoom}/${lat.toFixed(4)}/${lng.toFixed(4)}`,
    });
  } catch {
    return Response.json({ error: 'Route generation failed' }, { status: 500 });
  }
}
