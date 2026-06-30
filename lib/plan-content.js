export const WEEK_OVERVIEWS = [
  { week: 1, period: '28/4-4/5', focus: 'Basis leggen, vorm leren', longRide: '60 min, 14-16 km', kcal: 2400, protein: 130 },
  { week: 2, period: '5/5-11/5', focus: 'Tempo Z3 toevoegen, kracht naar 3 sets', longRide: '75 min, 18-20 km', kcal: 2400, protein: 130 },
  { week: 3, period: '12/5-18/5', focus: 'Volume omhoog, zelfde structuur', longRide: '90 min, 22-25 km', kcal: 2400, protein: 130 },
  { week: 4, period: '19/5-25/5', focus: 'Eerste Z4 intervals, piek begint', longRide: '100 min, 25-28 km', kcal: 2400, protein: 130 },
  { week: 5, period: '26/5-1/6', focus: 'Maximaal volume, langste rit', longRide: '120 min, 30-34 km', kcal: 2400, protein: 130 },
  { week: 6, period: '2/6-7/6', focus: 'Taper, scherp blijven, herstellen', longRide: 'Geen lange rit', kcal: 2700, protein: 130 },
  { week: 7, period: '8/6-14/6', focus: 'Vakantie: actief blijven, licht onderhoud (geen fiets)', longRide: 'Lange wandeling', kcal: 2500, protein: 130 },
  { week: 8, period: '15/6-21/6', focus: 'Vakantie: spiermassa vasthouden (geen fiets)', longRide: 'Lange wandeling', kcal: 2500, protein: 130 },
  { week: 9, period: '22/6-28/6', focus: 'Vakantie afronden, rustig weer opbouwen', longRide: 'Lange wandeling', kcal: 2500, protein: 130 },
  { week: 10, period: '29/6-5/7', focus: 'Nieuwe opzet: rustig starten, ritme pakken', longRide: '75 min', kcal: 1900, protein: 130 },
  { week: 11, period: '6/7-12/7', focus: 'Regelmaat boven alles, intervallen licht (4x2)', longRide: '75 min', kcal: 1900, protein: 130 },
  { week: 12, period: '13/7-19/7', focus: 'Lange rit iets langer, intervallen naar 5x2', longRide: '80 min', kcal: 1900, protein: 130 },
  { week: 13, period: '20/7-26/7', focus: 'Stevig blok, intervallen 5-6x2', longRide: '90 min', kcal: 1900, protein: 130 },
  { week: 14, period: '27/7-2/8', focus: 'Volume vasthouden, kracht net iets zwaarder', longRide: '90 min', kcal: 1900, protein: 130 },
  { week: 15, period: '3/8-9/8', focus: 'Opbouw doorzetten, herstel in de gaten houden', longRide: '100 min', kcal: 1900, protein: 130 },
  { week: 16, period: '10/8-16/8', focus: 'Halfweg: meten en bijsturen', longRide: '100 min', kcal: 1900, protein: 130 },
  { week: 17, period: '17/8-23/8', focus: 'Deload-week, fris blijven', longRide: '80 min', kcal: 1900, protein: 130 },
  { week: 18, period: '24/8-30/8', focus: 'Langere ritten, buikvet aanpakken', longRide: '110 min', kcal: 1900, protein: 130 },
  { week: 19, period: '31/8-6/9', focus: 'Stevig blok, kracht consequent 2x', longRide: '110 min', kcal: 1900, protein: 130 },
  { week: 20, period: '7/9-13/9', focus: 'Langste ritten van het blok', longRide: '120 min', kcal: 1900, protein: 130 },
  { week: 21, period: '14/9-20/9', focus: 'Rustige week, scherp blijven', longRide: '90 min', kcal: 1900, protein: 130 },
  { week: 22, period: '21/9-27/9', focus: 'Afronden en eindmeting', longRide: '110 min', kcal: 1900, protein: 130 },
];

// Herijkt op de gezondheidsanalyse: jouw conversational Z2 zit rond 120-135 bpm
// (lage rusthartslag ~55, stabiele HRV). De zones zijn daaromheen opgebouwd; HR is
// leidend, snelheid is slechts referentie (wind, helling, stoplichten).
export const HEART_ZONES = [
  { zone: 'Z1', hr: '105-120', feel: 'Heel rustig, gesprek volledig OK', speed: '11-13 km/h', goal: 'Herstel en opwarmen' },
  { zone: 'Z2', hr: '120-135', feel: 'Gemakkelijk, je kunt er nog net bij praten', speed: '14-16 km/h', goal: 'Vetverbranding en basisuithouding (je belangrijkste zone)' },
  { zone: 'Z3', hr: '135-150', feel: 'Gericht inspannen, losse woorden', speed: '16-18 km/h', goal: 'Tempo en kracht-uithouding' },
  { zone: 'Z4', hr: '150-165', feel: 'Stevig, nauwelijks praten', speed: '17-20 km/h', goal: 'De 2-minuut intervalblokken' },
  { zone: 'Z5', hr: '165+', feel: 'All-out, max 1-2 min', speed: '18-22 km/h', goal: 'VO2 Max boost, spaarzaam gebruiken' },
];

export const PERFORMANCE_REFERENCES = [
  { label: 'Februari 2026', value: '17,6 km/h over 158 min in Z2', detail: 'HR 142, piek-niveau.' },
  { label: 'April 2026', value: '12,6 km/h over 102 min', detail: 'HR 135, recent comeback-tempo.' },
  { label: 'Lange Z2 ritten', value: 'Mediaan 16 km/h', detail: 'Realistische trainingspace op de Cube Travel EXC.' },
];

export const NUTRITION_GUIDE = {
  rules: [
    'Geen tellen, vier vaste regels. Volg ze en je komt vanzelf in een licht tekort terwijl je spier behoudt.',
    '1. Eiwit eerst, bij elke maaltijd. Een flinke portie per eetmoment (een handpalm tot anderhalf). Mik op ~130 g per dag.',
    '2. Groente vult het bord. Bij de warme maaltijd minstens de helft groente: volume zonder veel calorieen.',
    '3. Koolhydraten vooral rond je ritten. Op fietsdagen iets ruimer (rijst, aardappel, volkoren), op rustdagen kleiner.',
    '4. Beperk de stille calorieen: frisdrank, sappen, snacks en alcohol. Alcohol remt bovendien herstel en vetverlies.',
    'Richtwaarden (niet om te tellen): onderhoud ~2400-2600 kcal. Voor ~0,5 kg/week mik je op een groter tekort van ~550 kcal, grofweg richting 1900 kcal op een gemiddelde dag.',
    'Bij dit stevigere tempo is eiwit (~130 g) en kracht extra belangrijk om spier te beschermen. Voel je je futloos of zakken je ritten? Dan is het tekort te groot - eet iets meer, vooral op fietsdagen.',
  ],
  proteinSources: [
    ['Kipfilet', '150 g', '33 g', 'Batch bakken op zondag'],
    ['Kalkoen-/kipgehakt mager', '150 g', '32 g', 'Voor pasta of wraps'],
    ['Eieren', '3 stuks', '20 g', 'Ontbijt of hardgekookt'],
    ['Tofu firm', '150 g', '20 g', 'Persen en marineren'],
    ['Tempeh', '100 g', '20 g', 'Stevig voor wokken'],
    ['Edamame gekookt', '150 g', '17 g', 'Snack of bij rijst'],
    ['Linzen', '200 g', '18 g', 'Soep, curry of bijgerecht'],
    ['Kikkererwten', '200 g', '16 g', 'Geroosterd of salade'],
    ['Zwarte bonen', '200 g', '16 g', 'Mexicaans, wraps'],
    ['Mager rundvlees', '120 g', '30 g', 'Max 1-2x per week'],
    ['Eiwit-isolaat shake', '30 g', '25 g', 'Erwten, soja of LV-whey'],
    ['Lactosevrije skyr', '200 g', '20 g', 'Met fruit'],
  ],
  sampleDay: [
    'Ontbijt: lactosevrije kwark met havermout en fruit, of 3 eieren met volkorenbrood.',
    'Lunch: volkorenwrap of brood met kip of ei en veel groente.',
    'Diner: portie eiwit (kip, tofu, mager rund), halve bord groente, bescheiden portie koolhydraten.',
    'Snack: handje noten, stuk fruit, of lactosevrije kwark/skyr.',
    'Na een rit of kracht: eiwitmoment van 25-30 g (shake of kwark).',
  ],
};

export const MEASUREMENT_MOMENTS = [
  {
    key: 'start',
    week: 1,
    date: '2026-04-28',
    title: 'Startmeting',
    focus: 'Nulmeting voor gewicht, buikomtrek, foto en herstelgevoel.',
    items: ['Gewicht', 'Buikomtrek bij de navel', 'Foto voorzijde/zijaanzicht', 'Slaap, energie en stemming'],
    photoReminder: 'Foto voorzijde en zijaanzicht.',
  },
  {
    key: 'halfway',
    week: 3,
    date: '2026-05-18',
    title: 'Halfweg meetmoment',
    focus: 'Controleer of het tekort nog goed voelt en of alarmsignalen oplopen.',
    items: ['Gewicht of 7-daags gemiddelde', 'Buikomtrek', 'Foto profiel', 'Slaap en rusthartslag', 'Energie, honger, spierpijn en stemming'],
    photoReminder: 'Foto profiel als week 3 update.',
  },
  {
    key: 'taper',
    week: 5,
    date: '2026-06-01',
    title: 'Meetmoment voor taper',
    focus: 'Laatste check voordat week 6 naar herstel en frisheid schuift.',
    items: ['Gewicht', 'Buikomtrek', 'Foto update', 'Beslis of herstel prioriteit nodig heeft'],
    photoReminder: 'Foto update voor vergelijking met week 1 en 3.',
  },
  {
    key: 'finish',
    week: 6,
    date: '2026-06-07',
    title: 'Eindmeting',
    focus: 'Rond het blok af met hetzelfde meetprotocol als de start.',
    items: ['Gewicht', 'Buikomtrek', 'Foto voorzijde/zijaanzicht', 'Korte terugblik op energie en conditie'],
    photoReminder: 'Eindfoto voorzijde en zijaanzicht.',
  },
  {
    key: 'new-start',
    week: 10,
    date: '2026-07-05',
    title: 'Startmeting (nieuwe opzet)',
    focus: 'Nulmeting voor het 12-weken blok richting 70 kg. Doe dit op een vast moment: na wc, voor ontbijt.',
    items: ['Gewicht', 'Buikomtrek bij de navel', 'Foto voorzijde/zijaanzicht', 'Rusthartslag, slaap, energie en stemming'],
    photoReminder: 'Foto voorzijde en zijaanzicht als nulpunt.',
  },
  {
    key: 'new-3w',
    week: 13,
    date: '2026-07-26',
    title: '3-weken check',
    focus: 'Eerste check op de trend. Mik op ~0,5 kg/week; kijk naar de lijn over weken, niet naar losse dagen.',
    items: ['Gewicht of 7-daags gemiddelde', 'Buikomtrek', 'Energie en honger', 'Voelen de ritten en kracht goed?'],
    photoReminder: 'Optionele foto ter vergelijking.',
  },
  {
    key: 'new-halfway',
    week: 16,
    date: '2026-08-16',
    title: 'Halfweg meetmoment',
    focus: 'Halverwege. Loopt het tempo te snel? Eet iets meer op fietsdagen. Gebeurt er niks? Schaaf aan de stille calorieen.',
    items: ['Gewicht of 7-daags gemiddelde', 'Buikomtrek', 'Foto profiel', 'Rusthartslag en HRV', 'Energie en herstel'],
    photoReminder: 'Foto profiel als halfweg-update.',
  },
  {
    key: 'new-9w',
    week: 19,
    date: '2026-09-06',
    title: '9-weken check',
    focus: 'Laatste check voor de eindfase. Bewaak je energie en je ritten; bij futloosheid is het tekort te groot.',
    items: ['Gewicht of 7-daags gemiddelde', 'Buikomtrek', 'Rusthartslag en HRV', 'Energie, slaap en stemming'],
    photoReminder: 'Optionele foto ter vergelijking.',
  },
  {
    key: 'new-finish',
    week: 22,
    date: '2026-09-27',
    title: 'Eindmeting',
    focus: 'Rond het blok af met hetzelfde protocol als de start. Vergelijk gewicht, buikomtrek en foto met 5 juli.',
    items: ['Gewicht', 'Buikomtrek', 'Foto voorzijde/zijaanzicht', 'Terugblik op conditie, energie en pols'],
    photoReminder: 'Eindfoto voorzijde en zijaanzicht.',
  },
];

export const STRENGTH_GUIDE = {
  intro: "Kort en simpel houden is het uitgangspunt: een circuit van 2 rondes, ~12-15 min, twee keer per week (maandag schema A, vrijdag schema B). Rust 30-45s tussen oefeningen, geen materiaal nodig behalve een mat. Alles is pols-vrij: je leunt op onderarm/elleboog, nooit op de handpalm (geen push-up, plank op de handen of ab roller tot de pols volledig pijnvrij is). Zwaarder maken doe je met meer herhalingen, langzamer zakken (3 tellen) of een korte pauze onderin de squat - niet met meer tijd. Twaalf minuten die je echt doet zijn beter dan een uur dat je overslaat.",
  A: [
    {
      name: 'Squat',
      sets: '2x12-15',
      rest: '30-45 sec',
      notes: 'Voeten heupbreed, knieen in lijn met de tenen. Zwaarder: langzamer zakken of korte pauze onderin.',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/',
      steps: [
        'Zet voeten iets breder dan heupbreed, tenen licht naar buiten en borst lang.',
        'Span buik aan en duw heupen eerst naar achter, alsof je op een stoel gaat zitten.',
        'Zak gecontroleerd; knieen blijven in dezelfde richting als je tenen.',
        'Duw via middenvoet en hak omhoog en span billen boven kort aan.',
      ],
    },
    {
      name: 'Reverse Lunge',
      sets: '2x8-10/been',
      rest: '30-45 sec',
      notes: 'Stap naar achter, voorste knie 90 graden. Belast de pols niet.',
      guideSource: 'ExRx',
      guideUrl: 'https://exrx.net/WeightExercises/Quadriceps/BWRearLunge',
      steps: [
        'Sta rechtop met buik licht aangespannen en blik vooruit.',
        'Stap gecontroleerd naar achter en zak recht omlaag.',
        'Houd voorste knie boven middenvoet; achterste knie gaat richting vloer.',
        'Duw via de voorste voet terug naar start zonder naar voren te vallen.',
      ],
    },
    {
      name: 'Glute Bridge',
      sets: '2x15',
      rest: '30-45 sec',
      notes: 'Bil 1 sec boven knijpen. Zwaarder: eenbenig (2x10/been).',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/',
      steps: [
        'Lig op je rug met knieen gebogen en voeten heupbreed op de vloer.',
        'Kantel bekken licht achterover en span buik aan.',
        'Duw via de hakken je heupen omhoog tot knie, heup en schouder een lijn vormen.',
        'Knijp billen boven kort aan en zak langzaam terug zonder te ploffen.',
      ],
    },
    {
      name: 'Onderarm-plank',
      sets: '2x20-40s',
      rest: '30-45 sec',
      notes: 'Op de ellebogen, niet op de handen: pols blijft ontlast. Heup recht.',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/32/front-plank/',
      steps: [
        'Zet ellebogen onder schouders en voeten op tenen.',
        'Maak een rechte lijn van hoofd tot hakken.',
        'Span buik en billen aan en trek ribben licht omlaag.',
        'Stop de set zodra je onderrug inzakt of je heupen gaan draaien.',
      ],
    },
    {
      name: 'Dead Bug',
      sets: '2x8/zij',
      rest: '30-45 sec',
      notes: 'Core-prikkel zonder polsbelasting. Onderrug blijft op de mat.',
      guideSource: 'NASM',
      guideUrl: 'https://www.nasm.org/resource-center/exercise-library/dead-bug',
      steps: [
        'Lig op je rug met knieen op 90 graden en armen recht omhoog.',
        'Druk je onderrug licht in de mat en span buik aan.',
        'Strek tegenovergestelde arm en been langzaam uit.',
        'Keer terug zonder dat je onderrug loskomt van de mat.',
      ],
    },
    {
      name: 'Kuitverhogingen',
      sets: '2x15-20',
      rest: '30-45 sec',
      notes: 'Op de bal van je voeten omhoog, kort vasthouden, langzaam zakken. Eventueel op een treredge voor meer bereik.',
      steps: [
        'Sta rechtop, voeten heupbreed, evt. een vinger tegen de muur voor balans.',
        'Duw rustig omhoog op de ballen van je voeten zo hoog als comfortabel.',
        'Houd de top 1 seconde vast en knijp de kuiten aan.',
        'Zak langzaam en volledig terug voor de volgende herhaling.',
      ],
    },
  ],
  B: [
    {
      name: 'Squat (3 tellen omlaag)',
      sets: '2x12-15',
      rest: '30-45 sec',
      notes: 'Zelfde squat als A maar bewust langzaam zakken (3 tellen) voor meer spanning.',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/',
      steps: [
        'Zet voeten iets breder dan heupbreed, tenen licht naar buiten en borst lang.',
        'Zak in 3 rustige tellen omlaag terwijl je heupen naar achter duwen.',
        'Knieen blijven in lijn met de tenen; ga zo diep als comfortabel.',
        'Duw via middenvoet omhoog en span billen boven kort aan.',
      ],
    },
    {
      name: 'Single-leg Hip Hinge',
      sets: '2x8-10/been',
      rest: '30-45 sec',
      notes: 'Been naar achter, vingertop licht tegen muur voor balans (geen steun op de pols).',
      guideSource: 'ExRx',
      guideUrl: 'https://exrx.net/WeightExercises/GluteusMaximus/BWSingleLegStiffLegDeadlift',
      steps: [
        'Sta op een been met een lichte buiging in de knie.',
        'Scharnier vanuit je heup terwijl het vrije been naar achter beweegt.',
        'Houd rug lang en heupen zo recht mogelijk naar de vloer.',
        'Kom terug door bil en hamstring van het standbeen aan te spannen.',
      ],
    },
    {
      name: 'Eenbenige Glute Bridge',
      sets: '2x10/been',
      rest: '30-45 sec',
      notes: 'Een been gestrekt of knie naar de borst; bekken waterpas houden. Volledig pols-vrij.',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/',
      steps: [
        'Begin in de glute bridge met heupen omhoog en buik aangespannen.',
        'Strek of til een been zonder dat je heup zakt of kantelt.',
        'Duw via de hak van het standbeen je heup omhoog.',
        'Zak gecontroleerd, wissel van been en houd je bekken steeds waterpas.',
      ],
    },
    {
      name: 'Zijplank (op elleboog)',
      sets: '2x20-40s/zij',
      rest: '30-45 sec',
      notes: 'Steun op de elleboog, niet op de hand: pols ontlast. Lijn enkel-schouder.',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/101/side-plank-with-straight-leg/',
      steps: [
        'Plaats elleboog onder schouder en stapel of verspring je voeten.',
        'Duw je heup omhoog tot enkel, heup en schouder een lijn vormen.',
        'Span buik en billen aan en blijf rustig doorademen.',
        'Stop als je schouder inzakt of je heup naar achter draait.',
      ],
    },
    {
      name: 'Dead Bug',
      sets: '2x8/zij',
      rest: '30-45 sec',
      notes: 'Core-prikkel zonder polsbelasting. Onderrug blijft op de mat.',
      guideSource: 'NASM',
      guideUrl: 'https://www.nasm.org/resource-center/exercise-library/dead-bug',
      steps: [
        'Lig op je rug met knieen op 90 graden en armen recht omhoog.',
        'Druk je onderrug licht in de mat en span buik aan.',
        'Strek tegenovergestelde arm en been langzaam uit.',
        'Keer terug zonder dat je onderrug loskomt van de mat.',
      ],
    },
    {
      name: 'Kuitverhogingen',
      sets: '2x15-20',
      rest: '30-45 sec',
      notes: 'Op de bal van je voeten omhoog, kort vasthouden, langzaam zakken. Eventueel op een treredge voor meer bereik.',
      steps: [
        'Sta rechtop, voeten heupbreed, evt. een vinger tegen de muur voor balans.',
        'Duw rustig omhoog op de ballen van je voeten zo hoog als comfortabel.',
        'Houd de top 1 seconde vast en knijp de kuiten aan.',
        'Zak langzaam en volledig terug voor de volgende herhaling.',
      ],
    },
  ],
};

export const PRACTICAL_TIPS = [
  { title: 'Hartslagzones', items: ['Hartslag is leidend; snelheid is alleen referentie (wind, helling, stoplichten).', 'Jouw Z2 zit rond 120-135 bpm: je kunt er nog net bij praten. Dit is je belangrijkste zone.', 'De intervalblokken (2 min stevig) duw je hoger, maar op gevoel - niet sprinten.'] },
  { title: 'Rustig opbouwen', items: ['Je draait al veel volume (stappen, korte ritten). Stapel intensiteit en kracht daar rustig bovenop.', 'Voeg pas meer toe als rusthartslag en HRV stabiel blijven.', 'Loopt je rusthartslag een paar dagen op of zakt je HRV? Neem een rustige week.'] },
  { title: 'Bij polsklachten', items: ['Geen oefeningen waarbij je op de handpalm of pols leunt: push-up, plank op de handen, ab roller.', 'Steun op de onderarm/elleboog i.p.v. de hand (plank, zijplank).', 'Fietsen mag zolang sturen/remmen niet pijnlijk is; wissel je handpositie af, eventueel polsbrace en gel-handschoen.', 'Voeg hand-oefeningen pas terug toe als de pols pijnvrij en stabiel aanvoelt; blijft het zeuren na 2 weken, laat het checken bij huisarts of fysio.'] },
  { title: 'Tegen spierpijn', items: ['Normale spierpijn verdwijnt binnen 72 uur.', 'Een lichte rit na een zware sessie versnelt herstel.', 'Houd kracht bewust kort (12-15 min) zodat je het volhoudt.'] },
  { title: 'Wegen en meten', items: ['Weeg jezelf 1-2x per week op een vast moment: na wc, voor ontbijt.', 'Kijk naar de trend over weken, niet naar losse dagen - een kilo schommeling is normaal.', 'Buikomtrek bij de navel, ontspannen uitademen.', 'Mik op ~0,5 kg per week. Gaat het structureel sneller dan ~0,7 kg, eet dan iets meer (vooral op fietsdagen) om spier te sparen.'] },
];

export const END_GOALS = [
  'Richting 70 kg: circa 4-4,5 kg eraf, vooral vet, op een tempo van ~0,5 kg/week (~8-10 weken).',
  'Minder buikvet en meer spierdefinitie door eiwit + kracht tijdens het tekort.',
  'Twee korte krachtsessies per week consequent volhouden (Ma + Vr).',
  'Lange Z2-ritten comfortabel uitbouwen richting 120 min.',
  'Conditie iets omhoog via de wekelijkse intervalrit, zonder de vermoeidheid te stapelen.',
  'Meer energie en een sterke, stabiele rusthartslag/HRV als herstelsignaal.',
];

export function getWeekOverview(week) {
  return WEEK_OVERVIEWS.find(item => item.week === week) || WEEK_OVERVIEWS[0];
}

export function getMeasurementMomentByDate(date) {
  return MEASUREMENT_MOMENTS.find(moment => moment.date === date) || null;
}

export function isMeasurementDate(date) {
  return Boolean(getMeasurementMomentByDate(date));
}

export function isMeasurementCheckin(checkin) {
  return isMeasurementDate(checkin?.date);
}

export function getMeasurementTitle(date) {
  return getMeasurementMomentByDate(date)?.title || date;
}

export function getSuggestedMeasurementMoment(checkins = [], today) {
  const savedDates = new Set(checkins.map(item => item.date));
  return (
    MEASUREMENT_MOMENTS.find(moment => moment.date <= today && !savedDates.has(moment.date)) ||
    MEASUREMENT_MOMENTS.find(moment => moment.date >= today) ||
    MEASUREMENT_MOMENTS[MEASUREMENT_MOMENTS.length - 1]
  );
}

export function getDueMeasurementMoment(checkins = [], today) {
  const savedDates = new Set(checkins.map(item => item.date));
  return MEASUREMENT_MOMENTS.find(moment => moment.date <= today && !savedDates.has(moment.date)) || null;
}
