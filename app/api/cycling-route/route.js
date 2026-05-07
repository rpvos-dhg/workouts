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

  const prompt = `Je bent een expert fietsrouteplanner in Nederland. Je kent de Nederlandse fietsinfraa door en door: LF-routes, knooppuntennetwerk, kanaalpaden, polderroutes en recreatieve fietspaden.

STARTLOCATIE: ${lat.toFixed(5)}, ${lng.toFixed(5)}

TRAINING:
- Titel: ${workout.title}
- Duur: ${workout.dur} minuten
- HR zone: ${workout.hr || 'niet opgegeven'}
- Snelheid: ${workout.speed || 'niet opgegeven'}
- Doel: ${workout.target || 'geen specifiek doel'}
- Omschrijving: ${workout.desc || ''}
${avgSpeed ? `\nGEMIDDELDE SNELHEID UIT RITTEN: ${avgSpeed.toFixed(1)} km/h` : ''}

RECENTE RITTEN:
${logsSummary}

━━━ ROUTE-EISEN ━━━

INFRASTRUCTUUR (in volgorde van voorkeur — kies uitsluitend hieruit):
1. Fietspad langs kanalen en rivieren (kanaaltowpaths, boezemwegen)
2. LF-routes en knooppuntenfietsroutes (bewegwijzerde fietsroutes)
3. Polderroutes en landwegen zonder doorgaand autoverkeer
4. Fietspaden door parken, bossen en duingebieden
5. Woonstraten als fietsstraat aangewezen (alleen als overgang)

VERMIJD ABSOLUUT:
- N-wegen en provinciale wegen (N14, N44, N211, N213, etc.)
- Rotondes en stoplichten in stadscentra
- Drukke doorgaande wegen en bedrijventerreinen
- Autowegen en parallelwegen daarvan

LOKALE INFRASTRUCTUUR VOOR ARCHIPELBUURT / DEN HAAG (2585CE):
Startpunt is Archipelbuurt Den Haag (ca. 52.088°N, 4.295°E). Gebruik routes die hier direct bereikbaar zijn:

DICHTBIJ (0-3 km, ideaal voor korte ritten):
- Scheveningse Bosjes: direct ten noorden, autovrij bosfietspad, lus mogelijk
- Westbroekpark en omgeving: rustige paden richting Scheveningen
- Nieuwe Parklaan langs het water richting Scheveningen haven

MIDDEL (3-8 km, voor ritten 10-25 km):
- Westduinpark / Kijkduin: via Loosduinseweg → duinpaden, weinig verkeer
- Haagse Bos: via Koningskade/Laan van Meerdervoort → groot autovrij bos
- Strandboulevard Scheveningen: fietspad langs de kust noordwaarts
- Meijendel duingebied ⭐: via Scheveningse Bosjes → Meijendel in, uitstekend doorfietsparcours, nauwelijks kruisingen, autovrij, ideaal voor Z2/Z3
- LF1 Noordzeeroute langs de kust (Scheveningen → Katwijk richting)

VER (8+ km, voor lange ritten 18+ km):
- Midden-Delfland polders: via Leyweg/Lozerlaan, uitgestrekte polderpaden
- De Vliet fietspad: via Leidschendam, kanaalpad naar Delft of Leiden
- Westland polderroutes: richting Naaldwijk, glastuinbouw-landwegen
- Knooppuntennetwerk Zuid-Holland (nummers 54→45→67 etc.)

TECHNISCHE VEREISTEN:
- Rondrit: start EN eindigt op de startlocatie
- 6 tot 8 waypoints, goed verspreid over de route
- Elk waypoint moet op of naast genoemde fietsinfrastructuur liggen
- Waypoints zijn bedoeld als GPS-ankerpunten voor Google Maps cycling mode — zo nauwkeuriger, hoe beter de snapping naar fietspaden

Geef je antwoord ALLEEN als JSON (geen extra tekst):
{
  "estimatedKm": <getal: schatting op basis van duur × gemiddelde snelheid, gecorrigeerd voor intensiteit>,
  "routeType": "<kort routetype>",
  "omschrijving": "<2-3 zinnen: beschrijf de specifieke route en welke infrastructuur je volgt>",
  "kenmerken": ["<kenmerk 1>", "<kenmerk 2>", "<kenmerk 3>"],
  "waypoints": [
    { "lat": <getal>, "lng": <getal>, "naam": "<herkenbare naam, bijv. 'Vlietpad bij Leidschendam'>" },
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
