import type { CampaignBattle } from './types';

/**
 * Age 1, Antiquity (GAME_DESIGN 7.5): ten battles from Qarqar to Hydaspes, in historical
 * order. Each test army is what a player is likely to own by then: the Antiquity starters
 * (hoplites, peltasts), the Age 0 troops and the first-win unlocks of the earlier battles,
 * with a few upgrades later on.
 */

const W = 6 as const;

/*
 * Qarqar, 853 BC (research):
 * - Shalmaneser III of Assyria marched west into Syria.
 * - Near Qarqar on the Orontes he met a coalition led by Hadadezer of Damascus and Irhuleni
 *   of Hamath, with Ahab of Israel among the allies (Kurkh Monolith).
 * - Assyria claimed victory, but its advance stopped for several years.
 */
const qarqar: CampaignBattle = {
  id: 'qarqar',
  name: 'Qarqar',
  year: '853 BC',
  age: 1,
  lat: 35.79,
  lon: 36.33,
  problem: 'Close with the Assyrian archers before their volleys break your line.',
  briefing:
    'The kings of Syria and Israel have joined forces to stop Shalmaneser III by the Orontes. The Assyrian army is the most professional of its age, its archers sheltered behind spearmen and shields. Every turn spent at a distance favours them: close in fast, and use your chariots against the archers’ open flank.',
  terrain: [
    '~~~~~~~=~~~~~~~~',
    '................',
    '.....,,.........',
    '................',
    '................',
    '................',
    '........,,......',
    '................',
    '...FF...........',
    '...FF...........',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
    '................',
  ],
  enemy: [
    { type: 'assyrianSpearmen', x: 11, y: 4, facing: W },
    { type: 'assyrianArchers', x: 12, y: 4, facing: W, general: true },
    { type: 'assyrianArchers', x: 12, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'shalmaneser', rank: 2 },
  posture: 'defensive',
  turnLimit: 12,
  enemyBreakpoint: 0.55,
  maxUnits: 3,
  firstWinUnlocks: { units: ['assyrianArchers'] },
  // A player fresh from Age 0: the Antiquity starters and Egyptian chariots.
  testArmy: {
    units: [{ type: 'hoplites' }, { type: 'hoplites' }, { type: 'egyptianChariots' }],
    general: { id: 'captain', rank: 1 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Marathon, 490 BC (research):
 * - A Persian force under Datis and Artaphernes landed on the plain of Marathon.
 * - About 10,000 Athenians and Plataeans faced them; Miltiades thinned the centre and
 *   strengthened the wings.
 * - The Greek wings won, then turned on the Persian centre; the Persians fled to their ships.
 */
const marathon: CampaignBattle = {
  id: 'marathon',
  name: 'Marathon',
  year: '490 BC',
  age: 1,
  lat: 38.118,
  lon: 23.978,
  problem: 'Win on the wings while a thin centre holds, then close the trap.',
  briefing:
    'The Persians have landed at Marathon, a day’s march from Athens. Miltiades has stretched the Greek line to match theirs: thin in the middle, strong on the wings. The Persian centre is their best infantry — let it push, beat their flanks, and turn in on it.',
  terrain: [
    ',,,,............',
    ',,..............',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..............,,',
    '............,,,,',
  ],
  elevation: [
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
    '1100000000000000',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'sparabara', x: 11, y: 2, facing: W, level: 3 },
    { type: 'immortals', x: 11, y: 4, facing: W, general: true, level: 2 },
    { type: 'sparabara', x: 11, y: 6, facing: W, level: 3 },
    { type: 'persianCavalry', x: 13, y: 8, facing: W, level: 3 },
    { type: 'sparabara', x: 12, y: 5, facing: W, level: 3 },
  ],
  enemyGeneral: { id: 'datis', rank: 3 },
  posture: 'timed',
  attackTurn: 2,
  turnLimit: 12,
  enemyBreakpoint: 0.67,
  maxUnits: 4,
  firstWinUnlocks: { units: ['cretanArchers'] },
  testArmy: {
    units: [{ type: 'hoplites' }, { type: 'hoplites' }, { type: 'peltasts' }, { type: 'hoplites' }],
    general: { id: 'captain', rank: 1 },
  },
  bonus: { kind: 'winByTurn', turn: 9 },
  bonusText: 'Win by turn 9.',
};

/*
 * Thermopylae, 480 BC (research):
 * - Leonidas of Sparta held the narrow coastal pass of Thermopylae with a few thousand Greeks,
 *   including 300 Spartans, against the army of Xerxes.
 * - The pass ran between the mountains and the sea; the Greeks rebuilt the old Phocian wall.
 * - They held for days until Persians were guided over a mountain path behind them.
 */
const thermopylae: CampaignBattle = {
  id: 'thermopylae',
  name: 'Thermopylae',
  year: '480 BC',
  age: 1,
  lat: 38.796,
  lon: 22.536,
  problem: 'Hold the narrow pass against a far larger army for 10 turns.',
  briefing:
    'Between the mountains and the sea, the road to Greece is barely wide enough for a few ranks. Xerxes’ army is enormous, but here only a few of his units can fight at once. Fill the pass with your best infantry, keep your line closed, and do not be drawn out into the open.',
  terrain: [
    'FFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFF,,,,',
    'FFF,,,FFF,,.....',
    '................',
    '....,...........',
    '....,...........',
    '................',
    '~~~~~~~~~.......',
    '~~~~~~~~~~~~~...',
    '~~~~~~~~~~~~~~~~',
  ],
  deployment: [
    '................',
    '................',
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
    '................',
    '................',
  ],
  enemy: [
    { type: 'immortals', x: 12, y: 3, facing: W, general: true, level: 2 },
    { type: 'sparabara', x: 11, y: 4, facing: W, level: 2 },
    { type: 'sparabara', x: 11, y: 5, facing: W, level: 2 },
    { type: 'immortals', x: 12, y: 6, facing: W, level: 2 },
    { type: 'peltasts', x: 13, y: 2, facing: W, level: 2 },
  ],
  enemyGeneral: { id: 'xerxes', rank: 5 },
  posture: 'aggressive',
  turnLimit: 10,
  holdOut: 'player',
  maxUnits: 4,
  firstWinUnlocks: { units: ['spartanHoplites'], generals: ['leonidas'] },
  testArmy: {
    units: [
      { type: 'hoplites' },
      { type: 'hoplites' },
      { type: 'hoplites' },
      { type: 'cretanArchers' },
    ],
    general: { id: 'centurion', rank: 1 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Plataea, 479 BC (research):
 * - The Greek alliance under the Spartan regent Pausanias faced the Persian army of Mardonius
 *   in Boeotia, the Greeks on the foothills of Mount Cithaeron, the Persians across the Asopus.
 * - Persian cavalry harassed the Greeks for days and fouled their water.
 * - When the Greeks fell back, Mardonius attacked; the Spartans and Tegeans broke the Persian
 *   infantry, Mardonius was killed and his army fled.
 */
const plataea: CampaignBattle = {
  id: 'plataea',
  name: 'Plataea',
  year: '479 BC',
  age: 1,
  lat: 38.217,
  lon: 23.272,
  problem:
    'Weather the Persian cavalry on the slopes, then break Mardonius when his infantry comes on.',
  briefing:
    'A year after Thermopylae, every Greek city that still resists has sent its hoplites to Plataea. Mardonius waits across the Asopus with the army Xerxes left him, and his horsemen ride up to the Greek lines every day. Keep your spears facing the cavalry on the high ground, let the Persians cross the fords to you, and strike at Mardonius when they do.',
  terrain: [
    '.........~......',
    '.........=......',
    '..,......~......',
    '.........~......',
    '.........=......',
    '.........~...,,.',
    '.........~......',
    '.........=......',
    '..FF.....~......',
    '..FF.....~......',
  ],
  elevation: [
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
    '1111000000000000',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
    '................',
  ],
  enemy: [
    { type: 'persianCavalry', x: 12, y: 1, facing: W, level: 2 },
    { type: 'sparabara', x: 12, y: 3, facing: W, level: 2 },
    { type: 'immortals', x: 12, y: 4, facing: W, general: true, level: 2 },
    { type: 'sparabara', x: 12, y: 6, facing: W, level: 2 },
  ],
  enemyGeneral: { id: 'mardonius', rank: 2 },
  posture: 'timed',
  attackTurn: 2,
  turnLimit: 12,
  maxUnits: 4,
  firstWinUnlocks: { units: ['thessalianCavalry'] },
  testArmy: {
    units: [
      { type: 'spartanHoplites' },
      { type: 'hoplites' },
      { type: 'hoplites' },
      { type: 'cretanArchers' },
    ],
    general: { id: 'leonidas', rank: 1 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Win by killing or capturing Mardonius.',
};

/*
 * Leuctra, 371 BC (research):
 * - Thebes under Epaminondas fought Sparta under King Cleombrotus in Boeotia.
 * - Epaminondas massed his left wing very deep against the Spartan right, where the king
 *   stood, and held back his weaker right.
 * - The Spartan right broke, Cleombrotus was killed, and Spartan dominance in Greece ended.
 */
const leuctra: CampaignBattle = {
  id: 'leuctra',
  name: 'Leuctra',
  year: '371 BC',
  age: 1,
  lat: 38.256,
  lon: 23.18,
  problem:
    'Mass your strength on one wing and break the Spartan king before your weak wing gives way.',
  briefing:
    'Sparta has not lost a pitched battle in living memory. Epaminondas of Thebes will not fight her line evenly: he stacks his left wing deep against the Spartan king and holds his right back. Put your best units opposite Cleombrotus at the north end of their line and hit hard.',
  terrain: [
    '................',
    '................',
    '......,,........',
    '................',
    '................',
    '................',
    '................',
    '........,,......',
    '................',
    '................',
  ],
  elevation: [
    '0000000000000110',
    '0000000000000110',
    '0000000000000110',
    '0000000000000110',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'spartanHoplites', x: 11, y: 2, facing: W, general: true },
    { type: 'hoplites', x: 11, y: 3, facing: W },
    { type: 'hoplites', x: 11, y: 4, facing: W },
    { type: 'peltasts', x: 11, y: 5, facing: W },
    { type: 'cretanArchers', x: 11, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'cleombrotus', rank: 1 },
  posture: 'aggressive',
  turnLimit: 12,
  playerBreakpoint: 0.6,
  maxUnits: 5,
  firstWinUnlocks: { units: ['sacredBand'] },
  testArmy: {
    units: [
      { type: 'spartanHoplites' },
      { type: 'hoplites' },
      { type: 'thessalianCavalry' },
      { type: 'hoplites' },
      { type: 'peltasts' },
    ],
    general: { id: 'leonidas', rank: 1 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Win by killing or capturing Cleombrotus.',
};

/*
 * Chaeronea, 338 BC (research):
 * - Philip II of Macedon met the allied army of Athens and Thebes in western Boeotia.
 * - The allied line ran from the Cephissus river to the hills by Chaeronea, the Theban
 *   Sacred Band on the right next to the river, the Athenians on the left.
 * - Philip's wing gave ground and the Athenians pressed forward; a gap opened and the
 *   Macedonian cavalry, led by the young Alexander, broke through and destroyed the Sacred Band.
 */
const chaeronea: CampaignBattle = {
  id: 'chaeronea',
  name: 'Chaeronea',
  year: '338 BC',
  age: 1,
  lat: 38.495,
  lon: 22.85,
  problem:
    'Let the eager Athenians pull their line apart, then drive through the gap to the Sacred Band.',
  briefing:
    'Athens and Thebes have joined to stop Philip of Macedon, their line stretched from the Cephissus to the hills of Chaeronea. The Athenians are brave but impatient; the Theban Sacred Band by the river has never broken. Give ground where they press you, and when their line comes apart, send your horsemen through the gap at Theagenes and his Band.',
  terrain: [
    '~~~~~~~~~~~~~~~~',
    '................',
    '................',
    '.....,..........',
    '................',
    '................',
    '................',
    '..........,,....',
    '................',
    '................',
  ],
  elevation: [
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000001111',
    '0000000000001111',
    '0000000000001111',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'sacredBand', x: 11, y: 2, facing: W, general: true },
    { type: 'hoplites', x: 11, y: 3, facing: W },
    { type: 'hoplites', x: 11, y: 4, facing: W },
    { type: 'hoplites', x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'theagenes', rank: 2 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['macedonianPhalanx'], generals: ['philip'] },
  testArmy: {
    units: [
      { type: 'sacredBand' },
      { type: 'spartanHoplites', level: 2 },
      { type: 'hoplites', level: 2 },
      { type: 'thessalianCavalry' },
      { type: 'cretanArchers' },
    ],
    general: { id: 'leonidas', rank: 2 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Win by killing Theagenes, who fights beside the Sacred Band.',
};

/*
 * Granicus, 334 BC (research):
 * - Alexander's first battle in Asia, on the river Granicus in the Troad.
 * - Persian satraps lined the steep east bank with cavalry; Greek mercenary infantry stood
 *   further back. Memnon of Rhodes fought on the Persian side.
 * - Alexander forced the crossing at the head of the Companions; after the cavalry broke,
 *   the mercenaries were surrounded and cut down.
 */
const granicus: CampaignBattle = {
  id: 'granicus',
  name: 'Granicus',
  year: '334 BC',
  age: 1,
  lat: 40.23,
  lon: 27.24,
  problem: 'Force the fords against cavalry waiting on the high far bank.',
  briefing:
    'Alexander has crossed into Asia, and the Persian satraps wait for him behind the Granicus. Their cavalry lines the steep far bank above three fords; Greek mercenaries under Memnon stand behind. A unit in a ford fights badly, so do not trickle across: cross at two fords at once, then take the bank before the mercenaries arrive.',
  terrain: [
    '.......~........',
    '.......~........',
    '.......=........',
    '.......~........',
    '.......~........',
    '.......=........',
    '.......~........',
    '.......=........',
    '.......~........',
    '.......~........',
  ],
  elevation: [
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
    '0000000011000000',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'persianCavalry', x: 9, y: 2, facing: W, level: 2 },
    { type: 'persianCavalry', x: 9, y: 5, facing: W, level: 2 },
    { type: 'persianCavalry', x: 9, y: 7, facing: W },
    { type: 'hoplites', x: 13, y: 4, facing: W, general: true, level: 2 },
    { type: 'hoplites', x: 13, y: 6, facing: W, level: 2 },
  ],
  enemyGeneral: { id: 'memnon', rank: 2 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['companions'], generals: ['alexander'] },
  testArmy: {
    units: [
      { type: 'macedonianPhalanx' },
      { type: 'macedonianPhalanx' },
      { type: 'thessalianCavalry', level: 2 },
      { type: 'sacredBand' },
      { type: 'cretanArchers', level: 2 },
    ],
    general: { id: 'philip', rank: 1 },
  },
  bonus: { kind: 'winByTurn', turn: 8 },
  bonusText: 'Win by turn 8.',
};

/*
 * Issus, 333 BC (research):
 * - Darius III brought the Persian royal army down behind Alexander, and the two met on the
 *   narrow coastal plain by the Gulf of Issus, along the small river Pinarus.
 * - The plain between the sea and the mountains was too narrow for the Persian numbers;
 *   Greek mercenaries held the Persian centre behind the river.
 * - Alexander led the Companions across the river against the Persian left and drove at
 *   Darius, who fled; his army broke.
 */
const issus: CampaignBattle = {
  id: 'issus',
  name: 'Issus',
  year: '333 BC',
  age: 1,
  lat: 36.84,
  lon: 36.21,
  problem: 'On a plain too narrow to outflank, cross the Pinarus and drive straight at Darius.',
  briefing:
    'Darius has slipped behind you and caught your army between the mountains and the sea. Here his great numbers cannot spread out: the plain is narrow and the little Pinarus runs across it. His Greek mercenaries hold the centre behind the river. Find a ford, punch through, and make the Great King run.',
  terrain: [
    '~~~~~~~~~~~~~~~~',
    '........~.......',
    '........=.......',
    '........~.......',
    '........=.......',
    '........~.......',
    '........=.......',
    '........~.......',
    'FFFFF...~..FFFFF',
    'FFFFFFFF~FFFFFFF',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
    '................',
  ],
  enemy: [
    { type: 'persianCavalry', x: 10, y: 1, facing: W },
    { type: 'hoplites', x: 10, y: 3, facing: W },
    { type: 'hoplites', x: 10, y: 5, facing: W },
    { type: 'sparabara', x: 10, y: 7, facing: W },
    { type: 'immortals', x: 12, y: 4, facing: W, general: true },
  ],
  enemyGeneral: { id: 'darius', rank: 2 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['persianCavalry'] },
  testArmy: {
    units: [
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'macedonianPhalanx' },
      { type: 'companions' },
      { type: 'thessalianCavalry', level: 2 },
      { type: 'cretanArchers', level: 2 },
    ],
    general: { id: 'alexander', rank: 1 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Make Darius flee: rout or destroy his guard.',
};

/*
 * Gaugamela, 331 BC (research):
 * - Darius chose a wide plain near Gaugamela in northern Mesopotamia and had the ground
 *   levelled for his scythed chariots.
 * - The Macedonian infantry opened lanes and the chariots passed through or were brought
 *   down by javelin men.
 * - Alexander edged to the right; the Persian left followed and a gap opened in the line,
 *   into which he led the Companions straight at Darius, who fled again.
 */
const gaugamela: CampaignBattle = {
  id: 'gaugamela',
  name: 'Gaugamela',
  year: '331 BC',
  age: 1,
  lat: 36.36,
  lon: 43.25,
  problem: 'On an open plain, survive the scythed chariots, then find the gap and reach Darius.',
  briefing:
    'Darius has gathered the whole empire on a plain he levelled for his scythed chariots. His line is far longer than yours and his Bactrian horsemen will try to wrap round your wings. Let light troops meet the chariots, keep your flanks covered, and when his line stretches thin, ride for the Great King.',
  terrain: [
    '................',
    '..............,,',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    ',,..............',
    '................',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'bactrianCavalry', x: 11, y: 1, facing: W },
    { type: 'scythedChariots', x: 10, y: 3, facing: W, level: 2 },
    { type: 'immortals', x: 13, y: 4, facing: W, general: true },
    { type: 'sparabara', x: 12, y: 5, facing: W },
    { type: 'scythedChariots', x: 10, y: 6, facing: W, level: 2 },
    { type: 'bactrianCavalry', x: 11, y: 8, facing: W },
  ],
  enemyGeneral: { id: 'darius', rank: 3 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 6,
  firstWinUnlocks: { units: ['immortals'] },
  testArmy: {
    units: [
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'companions', level: 2 },
      { type: 'thessalianCavalry', level: 2 },
      { type: 'peltasts', level: 2 },
      { type: 'cretanArchers', level: 2 },
    ],
    general: { id: 'alexander', rank: 2 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Make Darius flee: rout or destroy his guard.',
};

/*
 * Hydaspes, 326 BC (research):
 * - King Porus held the Hydaspes (Jhelum) against Alexander with war elephants.
 * - Alexander crossed upstream at night in a storm and met Porus on rain-soaked ground.
 * - Horses would not face the elephants, so the Macedonian cavalry struck the Indian wings
 *   while the phalanx and light troops fought the elephants, which in the end ran back
 *   through their own lines. Porus was captured.
 */
const hydaspes: CampaignBattle = {
  id: 'hydaspes',
  name: 'Hydaspes',
  year: '326 BC',
  age: 1,
  lat: 32.98,
  lon: 73.66,
  problem:
    'Beat Porus’s elephants: keep your horses off them and drive them back into their own line.',
  briefing:
    'You crossed the swollen Hydaspes in a night storm, and now Porus comes on with a line of war elephants. Horses will not face them, so keep your cavalry on the wings, against his horsemen. Let pikes and missiles meet the elephants, and when one breaks, it will trample the troops beside it.',
  terrain: [
    '~...............',
    '~.......,,......',
    '=...............',
    '~...............',
    '~...,,..........',
    '~...............',
    '~.........,,....',
    '=...............',
    '~...............',
    '~...............',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'indianCavalry', x: 11, y: 1, facing: W, level: 2 },
    { type: 'indianElephants', x: 11, y: 3, facing: W, level: 2 },
    { type: 'indianInfantry', x: 12, y: 4, facing: W, general: true, level: 2 },
    { type: 'indianInfantry', x: 12, y: 5, facing: W, level: 2 },
    { type: 'indianElephants', x: 11, y: 6, facing: W, level: 2 },
  ],
  enemyGeneral: { id: 'porus', rank: 3 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 6,
  firstWinUnlocks: { units: ['indianElephants'] },
  testArmy: {
    units: [
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'companions', level: 2 },
      { type: 'thessalianCavalry', level: 2 },
      { type: 'peltasts', level: 2 },
      { type: 'cretanArchers', level: 2 },
    ],
    general: { id: 'alexander', rank: 2 },
  },
  bonus: { kind: 'winByTurn', turn: 10 },
  bonusText: 'Win by turn 10.',
};

export const ANTIQUITY: CampaignBattle[] = [
  qarqar,
  marathon,
  thermopylae,
  plataea,
  leuctra,
  chaeronea,
  granicus,
  issus,
  gaugamela,
  hydaspes,
];
