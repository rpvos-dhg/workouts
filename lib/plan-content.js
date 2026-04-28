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

export const STRENGTH_GUIDE = {
  intro: "Twee schema's wisselen: A op woensdag, B op zondag. Tempo 3-1-1, in week 4-5 zwaarder waar aangegeven.",
  A: [
    ['Bodyweight Squat', '2x12 -> 3x20', '60 sec', 'Voeten heupbreed, knieen in lijn. Wk 4-5 tempo 4-1-1.'],
    ['Reverse Lunge', '2x10/been -> 3x12/been', '60 sec', 'Stap naar achter, voorste knie 90 graden.'],
    ['Push-up', '2x6-8 -> 3x12-15', '60 sec', 'Wk 1-2 knie, wk 3-4 tenen, wk 5 hand-elevated.'],
    ['Glute Bridge', '2x12 -> 3x20', '45 sec', 'Bil 1 sec boven knijpen. Wk 4-5 eenbenig.'],
    ['Plank', '2x30s -> 3x60s', '30 sec', 'Heup recht. Wk 4-5 heen-en-weer wiegen.'],
    ['Ab Roller knieend', '2x5 -> 3x10', '60 sec', 'Tegen muur eerst, wk 3 vrij, wk 5 vanaf staand.'],
  ],
  B: [
    ['Bulgarian Split Squat', '2x6/been -> 3x10/been', '75 sec', 'Achterste voet op stoel. Wk 3 tas met boeken.'],
    ['Single-leg Hip Hinge', '2x8/been -> 3x10/been', '60 sec', 'Been naar achter, vingertop tegen muur.'],
    ['Pike Push-up', '2x5 -> 3x8-10', '75 sec', 'Heup hoog. Progressie: voeten op verhoging.'],
    ['Superman / Y-T-W', '2x10 -> 3x12 elk', '45 sec', 'Op buik, Y/T/W posities, vervangt rij-oefening.'],
    ['Side Plank', '2x20s -> 3x45s/zij', '30 sec', 'Lijn enkel-schouder. Wk 4 bovenste been heffen.'],
    ['Dead Bug', '2x8/zij -> 3x12/zij', '45 sec', 'Onderrug op mat, langzaam en strak.'],
    ['Ab Roller knieend', '2x5 -> 3x8-10', '60 sec', 'Tweede core-sessie van de week.'],
  ],
};

export const PRACTICAL_TIPS = [
  { title: 'Hartslagzones meten', items: ['Gebruik Apple Watch Workout, Workoutdoors of HealthFit voor zone alerts.', 'Hartslag is leidend; snelheid is referentie door wind, helling en stoplichten.'] },
  { title: 'Bij enkelpijn', items: ['Fietsen mag zolang trappen niet pijnlijk wordt.', 'Geen hardlopen deze 6 weken.', 'Pijn langer dan 2 weken: fysio, niet doortrainen.'] },
  { title: 'Tegen spierpijn', items: ['Normale spierpijn verdwijnt binnen 72 uur.', 'Magnesium 300-400 mg voor slapen kan helpen.', 'Lichte rit na zware sessie versnelt herstel.', 'Geen ijsbad direct na krachttraining.'] },
  { title: 'Wegen en meten', items: ['Elke ochtend zelfde moment, na wc en voor ontbijt.', 'Kijk naar 7-daags gemiddelde, niet daggewicht.', 'Buikomtrek 1x per week bij de navel.', 'Foto op week 1, 3 en 6 als reminder.'] },
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
