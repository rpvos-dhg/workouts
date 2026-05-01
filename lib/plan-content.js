export const WEEK_OVERVIEWS = [
  { week: 1, period: '28/4-4/5', focus: 'Basis leggen, vorm leren', longRide: '60 min, 14-16 km', kcal: 2400, protein: 130 },
  { week: 2, period: '5/5-11/5', focus: 'Tempo Z3 toevoegen, kracht naar 3 sets', longRide: '75 min, 18-20 km', kcal: 2400, protein: 130 },
  { week: 3, period: '12/5-18/5', focus: 'Volume omhoog, zelfde structuur', longRide: '90 min, 22-25 km', kcal: 2400, protein: 130 },
  { week: 4, period: '19/5-25/5', focus: 'Eerste Z4 intervals, piek begint', longRide: '100 min, 25-28 km', kcal: 2400, protein: 130 },
  { week: 5, period: '26/5-1/6', focus: 'Maximaal volume, langste rit', longRide: '120 min, 30-34 km', kcal: 2400, protein: 130 },
  { week: 6, period: '2/6-7/6', focus: 'Taper, scherp blijven, herstellen', longRide: 'Geen lange rit', kcal: 2700, protein: 130 },
];

export const HEART_ZONES = [
  { zone: 'Z1', hr: '121-134', feel: 'Heel rustig, gesprek volledig OK', speed: '11-13 km/h', goal: 'Herstel en opwarmen' },
  { zone: 'Z2', hr: '134-147', feel: 'Gemakkelijk, korte zinnen', speed: '14-17 km/h', goal: 'Vetverbranding en basisuithouding' },
  { zone: 'Z3', hr: '147-160', feel: 'Gericht inspannen, losse woorden', speed: '16-18 km/h', goal: 'Tempo en kracht-uithouding' },
  { zone: 'Z4', hr: '160-173', feel: 'Stevig, nauwelijks praten', speed: '17-20 km/h', goal: 'Drempel, maximaal 20 min' },
  { zone: 'Z5', hr: '173-186', feel: 'All-out, max 1-3 min', speed: '18-22 km/h', goal: 'VO2 Max boost' },
];

export const PERFORMANCE_REFERENCES = [
  { label: 'Februari 2026', value: '17,6 km/h over 158 min in Z2', detail: 'HR 142, piek-niveau.' },
  { label: 'April 2026', value: '12,6 km/h over 102 min', detail: 'HR 135, recent comeback-tempo.' },
  { label: 'Lange Z2 ritten', value: 'Mediaan 16 km/h', detail: 'Realistische trainingspace op de Cube Travel EXC.' },
];

export const NUTRITION_GUIDE = {
  rules: [
    'Weken 1-5: 2400 kcal per dag, ongeveer 600 kcal onder verbruik.',
    'Week 6: terug naar ongeveer 2700 kcal per dag om fris te vertrekken.',
    'Eiwit: 130 g per dag, verdeeld over 4-5 momenten.',
    '2 liter water per dag. Donderdag-vrijdag in week 6 extra zout en water.',
    'Schrap frisdrank, alcohol op werkdagen en snacks na 21:00.',
    "Houd 1 normalere dag per week, geen feestdag en geen binge.",
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
    'Ontbijt: 3 eieren scrambled + volkoren + tomaat (480 kcal, 24 g)',
    'Lunch: kipfilet 150 g op salade met kikkererwten + olijfolie (550 kcal, 42 g)',
    'Snack: lactosevrije skyr 200 g met bessen (160 kcal, 20 g)',
    'Diner: tofu wok 150 g met groente en rijst 80 g droog (700 kcal, 28 g)',
    'Na training: eiwit-isolaat shake (110 kcal, 25 g)',
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
];

export const STRENGTH_GUIDE = {
  intro: "Twee schema's wisselen: A op woensdag, B op zondag. Tempo 3-1-1, in week 4-5 zwaarder waar aangegeven.",
  A: [
    {
      name: 'Bodyweight Squat',
      sets: '2x12 -> 3x20',
      rest: '60 sec',
      notes: 'Voeten heupbreed, knieen in lijn. Wk 4-5 tempo 4-1-1.',
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
      sets: '2x10/been -> 3x12/been',
      rest: '60 sec',
      notes: 'Stap naar achter, voorste knie 90 graden. Wk 4-5 voorheup licht elevated.',
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
      name: 'Push-up',
      sets: '2x6-8 -> 3x12-15',
      rest: '60 sec',
      notes: 'Wk 1-2 knie, wk 3-4 tenen, wk 5 hand-elevated.',
      guideSource: 'ACE',
      guideUrl: 'https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/',
      steps: [
        'Plaats handen onder of net buiten schouders en maak een rechte lijn van hoofd tot hak.',
        'Span buik en billen aan voordat je zakt.',
        'Laat ellebogen schuin naar achter bewegen, ongeveer 30-45 graden van je romp.',
        'Zak tot borst bijna de vloer raakt en duw omhoog zonder heupen te laten hangen.',
      ],
    },
    {
      name: 'Glute Bridge',
      sets: '2x12 -> 3x20',
      rest: '45 sec',
      notes: 'Bil 1 sec boven knijpen. Wk 4-5 eenbenig.',
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
      name: 'Plank',
      sets: '2x30s -> 3x60s',
      rest: '30 sec',
      notes: 'Heup recht. Wk 4-5 heen-en-weer wiegen.',
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
      name: 'Ab Roller knieend',
      sets: '2x5 -> 3x10',
      rest: '60 sec',
      notes: 'Tegen muur eerst, wk 3 vrij, wk 5 vanaf staand.',
      guideSource: 'Healthline',
      guideUrl: 'https://www.healthline.com/health/fitness-exercise/exercise-wheel',
      steps: [
        'Start op knieen met de roller onder je schouders.',
        'Span buik en billen aan en houd rug neutraal.',
        'Rol alleen zo ver uit als je onderrug neutraal blijft.',
        'Trek met buikspanning terug; gebruik eerst een muur als rem.',
      ],
    },
  ],
  B: [
    {
      name: 'Bulgarian Split Squat',
      sets: '2x6/been -> 3x10/been',
      rest: '75 sec',
      notes: 'Achterste voet op stoel. Wk 3+ tas met boeken.',
      guideSource: 'ExRx',
      guideUrl: 'https://exrx.net/WeightExercises/Quadriceps/BWSingleLegSplitSquat',
      steps: [
        'Zet je achterste voet op een stoel of bank en plaats je voorste voet ruim naar voren.',
        'Zak recht omlaag; een lichte vooroverhelling van je romp is prima.',
        'Voorste knie volgt de tenen en blijft boven de middenvoet.',
        'Duw via de hele voorste voet omhoog zonder af te zetten met het achterste been.',
      ],
    },
    {
      name: 'Single-leg Hip Hinge',
      sets: '2x8/been -> 3x10/been',
      rest: '60 sec',
      notes: 'Been naar achter, vingertop tegen muur.',
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
      name: 'Pike Push-up',
      sets: '2x5 -> 3x8-10',
      rest: '75 sec',
      notes: 'Heup hoog. Progressie: voeten op verhoging.',
      guideSource: 'NASM',
      guideUrl: 'https://www.nasm.org/resource-center/exercise-library/pike-push-up',
      steps: [
        'Start in een omgekeerde V met heupen hoog en handen schouderbreed.',
        'Beweeg je hoofd tussen je handen richting vloer.',
        'Houd ellebogen gecontroleerd; laat ze niet breed uitwaaieren.',
        'Duw terug naar de V-positie zonder onderrug hol te trekken.',
      ],
    },
    {
      name: 'Superman / Y-T-W',
      sets: '2x10 -> 3x12 elk',
      rest: '45 sec',
      notes: 'Op buik, Y/T/W posities, vervangt rij-oefening.',
      guideSource: 'Elite Performance Institute',
      guideUrl: 'https://elite-performance-institute.com/exercise-library/shoulder-exercises/ytw-exercise/',
      steps: [
        'Lig op je buik met nek lang en blik naar de vloer.',
        'Til borst en armen licht op zonder je nek te forceren.',
        'Maak rustig een Y-, T- en W-positie met schouderbladen naar achter en laag.',
        'Houd onderrug ontspannen; de beweging komt uit bovenrug en schouders.',
      ],
    },
    {
      name: 'Side Plank',
      sets: '2x20s -> 3x45s/zij',
      rest: '30 sec',
      notes: 'Lijn enkel-schouder. Wk 4 bovenste been heffen.',
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
      sets: '2x8/zij -> 3x12/zij',
      rest: '45 sec',
      notes: 'Onderrug op mat, langzaam en strak.',
      guideSource: 'NASM',
      guideUrl: 'https://www.nasm.org/resource-center/exercise-library/dead-bug',
      steps: [
        'Lig op je rug met knieen op 90 graden en armen omhoog.',
        'Druk je onderrug licht in de mat en span buik aan.',
        'Strek tegenovergestelde arm en been langzaam uit.',
        'Keer terug zonder dat je onderrug loskomt van de mat.',
      ],
    },
    {
      name: 'Ab Roller knieend',
      sets: '2x5 -> 3x8-10',
      rest: '60 sec',
      notes: 'Tweede core-sessie van de week.',
      guideSource: 'Healthline',
      guideUrl: 'https://www.healthline.com/health/fitness-exercise/exercise-wheel',
      steps: [
        'Start op knieen met de roller onder je schouders.',
        'Span buik en billen aan en houd rug neutraal.',
        'Rol alleen zo ver uit als je onderrug neutraal blijft.',
        'Trek met buikspanning terug; maak de afstand pas groter als elke herhaling strak blijft.',
      ],
    },
  ],
};

export const PRACTICAL_TIPS = [
  { title: 'Hartslagzones meten', items: ['Gebruik je workoutapp of fietscomputer voor zone alerts.', 'Hartslag is leidend; snelheid is referentie door wind, helling en stoplichten.'] },
  { title: 'Bij enkelpijn', items: ['Fietsen mag zolang trappen niet pijnlijk wordt.', 'Geen hardlopen deze 6 weken.', 'Pijn langer dan 2 weken: fysio, niet doortrainen.'] },
  { title: 'Tegen spierpijn', items: ['Normale spierpijn verdwijnt binnen 72 uur.', 'Magnesium 300-400 mg voor slapen kan helpen.', 'Lichte rit na zware sessie versnelt herstel.', 'Geen ijsbad direct na krachttraining.'] },
  { title: 'Wegen en meten', items: ['Meet alleen op de geplande meetmomenten in de Meet tab.', 'Gebruik steeds hetzelfde moment: na wc en voor ontbijt.', 'Buikomtrek bij de navel, ontspannen uitademen.', 'Foto op week 1, week 3 en week 6 als reminder.'] },
];

export const END_GOALS = [
  '3-4 kg vetverlies, target 4 kg en fris rond 3 kg.',
  'Lange Z2 ritten van 14 km/h naar 16-17 km/h.',
  '100 min Z2 zonder gefronste wenkbrauwen.',
  'Sterkere romp en houding door 12 krachtsessies.',
  'Plattere buik door minder vet en sterkere core.',
  'Beter slaapritme door consistent schema.',
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
