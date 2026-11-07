import type { CampaignBattle } from './types';

/*
 * Age 1, Antiquity (GAME_DESIGN 7.5), generated from the history brief
 * docs/history/age-01-antiquity.md: names, dates, coordinates, commanders, enemy
 * cards and sources as written. Each briefing is the brief's account of what happened plus
 * its tactical problem. Maps, unit placement, unit counts and levels are tuned with
 * balance-sim (DECISIONS, Ages 0–2 C). The player is the historical victor, except where
 * the brief frames an underdog defence.
 */

const W = 6 as const;
const E = 2 as const;
void W;
void E;

/*
 * Qarqar, 853 BC (Tell Qarqur area, Syria). lineAndFlank.
 * Decisive factor: Break one coalition wing before its chariots turn the flank.
 * Sources: A. K. Grayson, Assyrian Rulers of the Early First Millennium BC II, RIMA 3 (1996). Hadi Ghantous, The Politics of God in Ancient Syria-Palestine (2013).
 */
const qarqar: CampaignBattle = {
  id: 'qarqar',
  name: 'Qarqar',
  year: '853 BC',
  age: 1,
  lat: 35.59,
  lon: 36.39,
  challengeType: 'lineAndFlank',
  problem: 'Break one coalition wing before its chariots turn the flank.',
  briefing:
    'Shalmaneser claimed victory over a coalition that nonetheless survived. Break one coalition wing before its chariots turn the flank. The coalition horse waits on the southern wing: break one end of their line before it can swing round.',
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
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'antiquitySpearmen', level: 1, x: 11, y: 4, facing: W, general: true },
    { type: 'antiquityArchers', level: 1, x: 12, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 1, x: 11, y: 7, facing: W },
  ],
  enemyGeneral: { id: 'hadadezer', rank: 3 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 3,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 1 },
      { type: 'spartanHoplites', level: 1 },
      { type: 'antiquityArchers', level: 1 },
    ],
    general: { id: 'antiquityScout', rank: 1 },
  },
  bonus: { kind: 'winByTurn', turn: 8 },
  bonusText: 'Win by turn 8.',
};

/*
 * Marathon, 490 BC (Marathon plain, Greece). lineAndFlank.
 * Decisive factor: Delay in the centre while both wings close the trap.
 * Sources: Herodotus, Histories 6.102–117. Peter Krentz, The Battle of Marathon (2010).
 */
const marathon: CampaignBattle = {
  id: 'marathon',
  name: 'Marathon',
  year: '490 BC',
  age: 1,
  lat: 38.15,
  lon: 23.97,
  challengeType: 'lineAndFlank',
  problem: 'Delay in the centre while both wings close the trap.',
  briefing:
    'Greek wings defeated the Persian wings and closed on the centre. Delay in the centre while both wings close the trap. Hold the Persians in the centre with one unit while your wings close in from both sides.',
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
    { type: 'persianShieldArchers', level: 1, x: 11, y: 3, facing: W },
    { type: 'persianShieldArchers', level: 1, x: 11, y: 5, facing: W, general: true },
    { type: 'antiquityLightCavalry', level: 1, x: 12, y: 7, facing: W },
  ],
  enemyGeneral: { id: 'datis', rank: 3 },
  posture: 'timed',
  attackTurn: 3,
  turnLimit: 12,
  maxUnits: 3,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 2 },
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'antiquitySpearmen', level: 2 },
    ],
    general: { id: 'leonidas', rank: 1 },
  },
  bonus: { kind: 'winByTurn', turn: 9 },
  bonusText: 'Win by turn 9.',
};

/*
 * Thermopylae, 480 BC (Thermopylae, Greece). desperateDefence.
 * Decisive factor: Hold the pass until the rear route decides the fight.
 * Sources: Herodotus, Histories 7.201–239. J. F. Lazenby, The Defence of Greece (1993).
 */
const thermopylae: CampaignBattle = {
  id: 'thermopylae',
  name: 'Thermopylae',
  year: '480 BC',
  age: 1,
  lat: 38.8,
  lon: 22.54,
  challengeType: 'desperateDefence',
  problem: 'Hold the pass until the rear route decides the fight.',
  briefing:
    'The Greek rearguard held a narrow pass until it was outflanked. Hold the pass until the rear route decides the fight. Between the wooded mountain and the sea the pass is three squares wide: block it and hold.',
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
    { type: 'persianShieldArchers', level: 3, x: 12, y: 3, facing: W, general: true },
    { type: 'persianShieldArchers', level: 3, x: 11, y: 4, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 12, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'xerxes', rank: 4 },
  posture: 'aggressive',
  turnLimit: 8,
  holdOut: 'player',
  maxUnits: 3,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 2 },
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'persianShieldArchers', level: 1 },
    ],
    general: { id: 'leonidas', rank: 2 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Plataea, 479 BC (near Plataea, Greece). holdUntilReinforcements.
 * Decisive factor: Keep the divided line alive until allies reform.
 * Sources: Herodotus, Histories 9.1–89. J. F. Lazenby, The Defence of Greece (1993).
 */
const plataea: CampaignBattle = {
  id: 'plataea',
  name: 'Plataea',
  year: '479 BC',
  age: 1,
  lat: 38.21,
  lon: 23.25,
  challengeType: 'holdUntilReinforcements',
  problem: 'Keep the divided line alive until allies reform.',
  briefing:
    'Mardonius attacked a fragmented Greek withdrawal and was killed after key infantry held. Keep the divided line alive until allies reform. Keep to the ridge west of the stream and let the Persian volleys come to you; strike Mardonius if he comes close.',
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
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'antiquityLightCavalry', level: 4, x: 12, y: 1, facing: W },
    { type: 'persianShieldArchers', level: 4, x: 12, y: 3, facing: W },
    { type: 'persianShieldArchers', level: 4, x: 12, y: 5, facing: W, general: true },
    { type: 'antiquityLightCavalry', level: 4, x: 12, y: 2, facing: W },
  ],
  enemyGeneral: { id: 'mardonius', rank: 4 },
  posture: 'aggressive',
  turnLimit: 9,
  holdOut: 'player',
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 2 },
      { type: 'macedonianPhalanx', level: 2 },
      { type: 'persianShieldArchers', level: 1 },
      { type: 'hoplitePhalanx', level: 1 },
    ],
    general: { id: 'leonidas', rank: 3 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down Mardonius.',
};

/*
 * Leuctra, 371 BC (Leuctra, Boeotia). lineAndFlank.
 * Decisive factor: Break the king's wing before the refused right must fight.
 * Sources: Xenophon, Hellenica 6.4. John Buckler, The Theban Hegemony (1980).
 */
const leuctra: CampaignBattle = {
  id: 'leuctra',
  name: 'Leuctra',
  year: '371 BC',
  age: 1,
  lat: 38.32,
  lon: 23.19,
  challengeType: 'lineAndFlank',
  problem: "Break the king's wing before the refused right must fight.",
  briefing:
    "Theban mass on the left broke the Spartan king's wing. Break the king's wing before the refused right must fight. Mass your strongest troops against the Spartan king’s wing, where the enemy line starts.",
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
    { type: 'spartanHoplites', level: 4, x: 11, y: 2, facing: W, general: true },
    { type: 'spartanHoplites', level: 4, x: 11, y: 3, facing: W },
    { type: 'antiquitySkirmishers', level: 4, x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'cleombrotus', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 1 },
      { type: 'macedonianPhalanx', level: 3 },
      { type: 'hoplitePhalanx', level: 3 },
    ],
    general: { id: 'leonidas', rank: 5 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down King Cleombrotus.',
};

/*
 * Chaeronea, 338 BC (Chaeronea, Greece). lineAndFlank.
 * Decisive factor: Create a seam before the coalition reforms.
 * Sources: Diodorus Siculus, Library 16.84–86. Ian Worthington, Philip II of Macedonia (2008).
 */
const chaeronea: CampaignBattle = {
  id: 'chaeronea',
  name: 'Chaeronea',
  year: '338 BC',
  age: 1,
  lat: 38.49,
  lon: 22.85,
  challengeType: 'lineAndFlank',
  problem: 'Create a seam before the coalition reforms.',
  briefing:
    'Philip defeated the allied Greek line; detailed manoeuvres are sparse. Create a seam before the coalition reforms. The coalition line runs from the river to the hills: pull one part forward and strike the gap it leaves.',
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
    { type: 'antiquitySpearmen', level: 4, x: 11, y: 3, facing: W, general: true },
    { type: 'antiquityArchers', level: 4, x: 12, y: 4, facing: W },
    { type: 'antiquityLightCavalry', level: 4, x: 11, y: 6, facing: W },
    { type: 'antiquitySpearmen', level: 4, x: 11, y: 4, facing: W },
    { type: 'antiquityArchers', level: 4, x: 11, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 4, x: 12, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 2 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 3 },
    ],
    general: { id: 'leonidas', rank: 6 },
  },
  bonus: { kind: 'winByTurn', turn: 9 },
  bonusText: 'Win by turn 9.',
};

/*
 * Granicus, May 334 BC (Kocabaş Çay, Turkey). riverCrossing.
 * Decisive factor: Force a bridgehead before cavalry crushes the crossing.
 * Sources: Arrian, Anabasis 1.12–16. A. B. Bosworth, A Historical Commentary on Arrian, vol. I (1980).
 */
const granicus: CampaignBattle = {
  id: 'granicus',
  name: 'Granicus',
  year: '334 BC',
  age: 1,
  lat: 39.96,
  lon: 27.45,
  challengeType: 'riverCrossing',
  problem: 'Force a bridgehead before cavalry crushes the crossing.',
  briefing:
    'Alexander secured a contested riverbank and isolated Persian infantry; Persian satraps, not Darius III, commanded locally. Force a bridgehead before cavalry crushes the crossing. Cross at the fords, where the bank is easiest, and win the far side before the Persian horse arrives.',
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
    { type: 'antiquityLightCavalry', level: 3, x: 9, y: 2, facing: W },
    { type: 'persianShieldArchers', level: 3, x: 12, y: 4, facing: W, general: true },
    { type: 'persianShieldArchers', level: 3, x: 12, y: 6, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 11, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 5 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 2 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 3 },
    ],
    general: { id: 'leonidas', rank: 7 },
  },
  bonus: { kind: 'winByTurn', turn: 8 },
  bonusText: 'Win by turn 8.',
};

/*
 * Issus, 333 BC (near Issus, Turkey). passBridgeOrFord.
 * Decisive factor: Cross the stream and threaten the king before the centre breaks.
 * Sources: Arrian, Anabasis 2.6–12. A. B. Bosworth, Conquest and Empire (1988).
 */
const issus: CampaignBattle = {
  id: 'issus',
  name: 'Issus',
  year: '333 BC',
  age: 1,
  lat: 36.98,
  lon: 36.2,
  challengeType: 'passBridgeOrFord',
  problem: 'Cross the stream and threaten the king before the centre breaks.',
  briefing:
    'Narrow ground limited Persian numbers as Alexander pressed toward Darius. Cross the stream and threaten the king before the centre breaks. The plain is narrow between the sea and the hills: cross the stream at its fords and drive at the king.',
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
    '.DDDD...........',
    '................',
  ],
  enemy: [
    { type: 'persianShieldArchers', level: 4, x: 10, y: 3, facing: W },
    { type: 'persianShieldArchers', level: 4, x: 12, y: 4, facing: W, general: true },
    { type: 'antiquityLightCavalry', level: 4, x: 10, y: 6, facing: W },
    { type: 'persianShieldArchers', level: 4, x: 11, y: 4, facing: W },
    { type: 'persianShieldArchers', level: 4, x: 10, y: 4, facing: W },
    { type: 'antiquityLightCavalry', level: 4, x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'dariusIII', rank: 6 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 4 },
      { type: 'indianElephants', level: 3 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 3 },
      { type: 'persianShieldArchers', level: 1 },
    ],
    general: { id: 'leonidas', rank: 7 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Make Darius flee: bring down his guard.',
};

/*
 * Gaugamela, 1 October 331 BC (near Mosul, Iraq). lineAndFlank.
 * Decisive factor: Survive envelopment and strike the gap.
 * Sources: Arrian, Anabasis 3.7–15. A. B. Bosworth, Conquest and Empire (1988).
 */
const gaugamela: CampaignBattle = {
  id: 'gaugamela',
  name: 'Gaugamela',
  year: '331 BC',
  age: 1,
  lat: 36.36,
  lon: 43.25,
  challengeType: 'lineAndFlank',
  problem: 'Survive envelopment and strike the gap.',
  briefing:
    "Alexander's oblique advance created a gap in a broad Persian line. Survive envelopment and strike the gap. Let the scythed chariots run onto your spears, and send a fast unit through the gap they leave.",
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
    { type: 'antiquityLightCavalry', level: 3, x: 11, y: 1, facing: W },
    { type: 'scythedChariots', level: 3, x: 10, y: 4, facing: W },
    { type: 'persianShieldArchers', level: 3, x: 13, y: 4, facing: W, general: true },
    { type: 'persianShieldArchers', level: 3, x: 12, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 11, y: 8, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 11, y: 4, facing: W },
    { type: 'scythedChariots', level: 3, x: 12, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'dariusIII', rank: 7 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 4 },
      { type: 'indianElephants', level: 3 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'persianShieldArchers', level: 3 },
      { type: 'hoplitePhalanx', level: 3 },
    ],
    general: { id: 'leonidas', rank: 7 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Make Darius flee: bring down his guard.',
};

/*
 * Hydaspes, 326 BC (Jhelum River, Pakistan). riverCrossing.
 * Decisive factor: Cross unseen, win the cavalry fight, then dismantle elephants.
 * Sources: Arrian, Anabasis 5.8–18. Quintus Curtius Rufus, History of Alexander 8.13–14.
 */
const hydaspes: CampaignBattle = {
  id: 'hydaspes',
  name: 'Hydaspes',
  year: '326 BC',
  age: 1,
  lat: 32.94,
  lon: 73.73,
  challengeType: 'riverCrossing',
  problem: 'Cross unseen, win the cavalry fight, then dismantle elephants.',
  briefing:
    "Alexander crossed away from his camp and defeated Porus' cavalry and elephants. Cross unseen, win the cavalry fight, then dismantle elephants. Horses fear elephants: meet them with infantry and keep your cavalry for the enemy horse.",
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
    { type: 'indianElephants', level: 4, x: 11, y: 3, facing: W },
    { type: 'antiquitySpearmen', level: 4, x: 12, y: 4, facing: W, general: true },
    { type: 'antiquityLightCavalry', level: 4, x: 11, y: 7, facing: W },
    { type: 'indianElephants', level: 4, x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'porus', rank: 7 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'companionCavalry', level: 1 },
      { type: 'thebanSacredBand', level: 4 },
      { type: 'indianElephants', level: 3 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 4 },
    ],
    general: { id: 'leonidas', rank: 8 },
  },
  bonus: { kind: 'winByTurn', turn: 10 },
  bonusText: 'Win by turn 10.',
};

/*
 * Delium, 424 BC (Delium, Boeotia). holdUntilReinforcements.
 * Decisive factor: Pin the line until the reserve reaches its exposed wing.
 * Sources: Thucydides, History 4.89–101. Donald Kagan, The Archidamian War (1974).
 */
const delium: CampaignBattle = {
  id: 'delium',
  name: 'Delium',
  year: '424 BC',
  age: 1,
  lat: 38.37,
  lon: 23.55,
  challengeType: 'holdUntilReinforcements',
  branchesFrom: 'plataea',
  problem: 'Pin the line until the reserve reaches its exposed wing.',
  briefing:
    "Pagondas' deep wing and reserve turned an Athenian local success. Pin the line until the reserve reaches its exposed wing. Hold your hill until the reserve can strike: the ravines on both edges protect your flanks.",
  terrain: [
    ',,,,,,....,,,,,,',
    ',,..........,,,,',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    ',,,..........,,,',
    ',,,,,,....,,,,,,',
  ],
  elevation: [
    '0000000000000000',
    '0000000000000000',
    '0111110000000000',
    '0111110000000000',
    '0111110000000000',
    '0111110000000000',
    '0111110000000000',
    '0111110000000000',
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
    { type: 'hoplitePhalanx', level: 2, x: 11, y: 3, facing: W, general: true },
    { type: 'hoplitePhalanx', level: 2, x: 11, y: 5, facing: W },
    { type: 'antiquitySkirmishers', level: 2, x: 12, y: 7, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 8,
  holdOut: 'player',
  maxUnits: 4,
  firstWinUnlocks: { generals: ['pagondas'] },
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 2 },
      { type: 'macedonianPhalanx', level: 3 },
      { type: 'persianShieldArchers', level: 1 },
      { type: 'hoplitePhalanx', level: 1 },
    ],
    general: { id: 'leonidas', rank: 3 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Mantinea, 418 BC (Mantinea plain, Arcadia). lineAndFlank.
 * Decisive factor: Repair the gap before the enemy overlaps it.
 * Sources: Thucydides, History 5.63–74. Donald Kagan, The Peace of Nicias and the Sicilian Expedition (1981).
 */
const mantinea418: CampaignBattle = {
  id: 'mantinea418',
  name: 'Mantinea',
  year: '418 BC',
  age: 1,
  lat: 37.62,
  lon: 22.39,
  challengeType: 'lineAndFlank',
  branchesFrom: 'plataea',
  problem: 'Repair the gap before the enemy overlaps it.',
  briefing:
    'Agis repaired a risky redeployment and won a hard phalanx battle. Repair the gap before the enemy overlaps it. The wood in the south narrows the field: keep your line closed and don’t let them overlap it.',
  terrain: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '......FFFF......',
    '.....FFFFFF.....',
    '....FFFFFFFF....',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '................',
    '................',
    '................',
  ],
  enemy: [
    { type: 'antiquitySpearmen', level: 2, x: 11, y: 2, facing: W, general: true },
    { type: 'antiquityArchers', level: 2, x: 12, y: 3, facing: W },
    { type: 'antiquityLightCavalry', level: 2, x: 11, y: 5, facing: W },
    { type: 'antiquitySpearmen', level: 2, x: 11, y: 3, facing: W },
    { type: 'antiquityArchers', level: 2, x: 11, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  firstWinUnlocks: { units: ['spartanHoplites'] },
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 1 },
      { type: 'macedonianPhalanx', level: 3 },
      { type: 'hoplitePhalanx', level: 2 },
    ],
    general: { id: 'leonidas', rank: 4 },
  },
  bonus: { kind: 'winByTurn', turn: 9 },
  bonusText: 'Win by turn 9.',
};

/*
 * Cunaxa, 401 BC (near Babylon, Iraq). strikeTheCommander.
 * Decisive factor: Open a safe route to the enemy general.
 * Sources: Xenophon, Anabasis 1.7–10. Pierre Briant, From Cyrus to Alexander (2002).
 */
const cunaxa: CampaignBattle = {
  id: 'cunaxa',
  name: 'Cunaxa',
  year: '401 BC',
  age: 1,
  lat: 33.65,
  lon: 44.2,
  challengeType: 'strikeTheCommander',
  branchesFrom: 'plataea',
  problem: 'Open a safe route to the enemy general.',
  briefing:
    'Cyrus died attacking Artaxerxes II despite local success by his Greek wing. Open a safe route to the enemy general. The Euphrates covers your left; push through the archers to the Great King’s guard.',
  terrain: [
    '~~~~~~~~~~~~~~~~',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.........,,.....',
    '................',
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
    { type: 'persianShieldArchers', level: 2, x: 11, y: 3, facing: W },
    { type: 'persianShieldArchers', level: 2, x: 13, y: 5, facing: W, general: true },
    { type: 'antiquityLightCavalry', level: 2, x: 11, y: 7, facing: W },
    { type: 'persianShieldArchers', level: 2, x: 12, y: 5, facing: W },
    { type: 'persianShieldArchers', level: 2, x: 11, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 2, x: 12, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  firstWinUnlocks: { units: ['hoplitePhalanx'] },
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 1 },
      { type: 'macedonianPhalanx', level: 3 },
      { type: 'hoplitePhalanx', level: 2 },
    ],
    general: { id: 'leonidas', rank: 4 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down the Great King’s guard.',
};

/*
 * Coronea, 394 BC (Coronea, Boeotia). attrition.
 * Decisive factor: Endure the centre and stop the enemy wing rolling up the line.
 * Sources: Xenophon, Hellenica 4.3.15–21. Paul Cartledge, Agesilaos and the Crisis of Sparta (1987).
 */
const coronea: CampaignBattle = {
  id: 'coronea',
  name: 'Coronea',
  year: '394 BC',
  age: 1,
  lat: 38.45,
  lon: 22.95,
  challengeType: 'attrition',
  branchesFrom: 'leuctra',
  problem: 'Endure the centre and stop the enemy wing rolling up the line.',
  briefing:
    'Both sides won on a wing before a brutal central contest. Endure the centre and stop the enemy wing rolling up the line. Both wings will fight their own battle: keep the centre steady while yours wins.',
  terrain: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '.......,,.......',
    '................',
    '................',
    '................',
    '................',
  ],
  elevation: [
    '0000110000000000',
    '0000110000000000',
    '0000000000000000',
    '0000000000000000',
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
    { type: 'antiquitySpearmen', level: 3, x: 11, y: 3, facing: W, general: true },
    { type: 'antiquityArchers', level: 3, x: 12, y: 4, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 11, y: 6, facing: W },
    { type: 'antiquitySpearmen', level: 3, x: 11, y: 4, facing: W },
    { type: 'antiquityArchers', level: 3, x: 11, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 12, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  firstWinUnlocks: { generals: ['leonidas'] },
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 1 },
      { type: 'macedonianPhalanx', level: 3 },
      { type: 'hoplitePhalanx', level: 3 },
    ],
    general: { id: 'leonidas', rank: 5 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Mantinea, 362 BC (Mantinea plain, Arcadia). cavalryAndPursuit.
 * Decisive factor: Mask the concentration and preserve Epaminondas.
 * Sources: Xenophon, Hellenica 7.5. John Buckler, The Theban Hegemony (1980).
 */
const mantinea362: CampaignBattle = {
  id: 'mantinea362',
  name: 'Mantinea',
  year: '362 BC',
  age: 1,
  lat: 37.62,
  lon: 22.39,
  challengeType: 'cavalryAndPursuit',
  branchesFrom: 'leuctra',
  problem: 'Mask the concentration and preserve Epaminondas.',
  briefing:
    'Epaminondas won a local breakthrough but died in the battle. Mask the concentration and preserve Epaminondas. Woods close both ends of the plain: pack your blow on one wing and keep your general safe.',
  terrain: [
    'FFFF........FFFF',
    'FF............FF',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    'FF............FF',
    'FFFF........FFFF',
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
    { type: 'antiquitySpearmen', level: 3, x: 11, y: 3, facing: W, general: true },
    { type: 'antiquityArchers', level: 3, x: 12, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 11, y: 6, facing: W },
    { type: 'antiquitySpearmen', level: 3, x: 11, y: 5, facing: W },
    { type: 'antiquityArchers', level: 3, x: 11, y: 4, facing: W },
    { type: 'antiquityLightCavalry', level: 3, x: 12, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'antiquityCaptain', rank: 6 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  firstWinUnlocks: { units: ['thebanSacredBand'] },
  testArmy: {
    units: [
      { type: 'thebanSacredBand', level: 3 },
      { type: 'indianElephants', level: 2 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 3 },
    ],
    general: { id: 'leonidas', rank: 6 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Persian Gate, winter 331/330 BC (Zagros approaches, Iran). passBridgeOrFord.
 * Decisive factor: Secure the alternate mountain route.
 * Sources: Arrian, Anabasis 3.18. Quintus Curtius Rufus, History of Alexander 5.3–4.
 */
const persianGate: CampaignBattle = {
  id: 'persianGate',
  name: 'Persian Gate',
  year: '331/330 BC',
  age: 1,
  lat: 30.55,
  lon: 51.85,
  challengeType: 'passBridgeOrFord',
  branchesFrom: 'gaugamela',
  problem: 'Secure the alternate mountain route.',
  briefing:
    'Ariobarzanes blocked a pass until Alexander found a route around it. Secure the alternate mountain route. The pass is a trap: climb the hills around it and come at the defenders from the side.',
  terrain: [
    'FFFF....FFFFFFFF',
    'FFFF.....FFFFFFF',
    '................',
    '................',
    '................',
    'FFFF.....FFFFFFF',
    'FFFF....FFFFFFFF',
    '................',
    '................',
    '................',
  ],
  elevation: [
    '0000111100000000',
    '0000100001000000',
    '0000100001000000',
    '0000100001000000',
    '0000100001000000',
    '0000100001000000',
    '0000111100000000',
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
    { type: 'persianShieldArchers', level: 5, x: 11, y: 2, facing: W, general: true },
    { type: 'persianShieldArchers', level: 5, x: 11, y: 4, facing: W },
    { type: 'antiquityLightCavalry', level: 5, x: 12, y: 8, facing: W },
    { type: 'persianShieldArchers', level: 5, x: 11, y: 5, facing: W },
    { type: 'persianShieldArchers', level: 5, x: 12, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 5, x: 12, y: 4, facing: W },
    { type: 'persianShieldArchers', level: 5, x: 11, y: 6, facing: W },
    { type: 'persianShieldArchers', level: 5, x: 10, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'ariobarzanes', rank: 7 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['antiquitySkirmishers'] },
  testArmy: {
    units: [
      { type: 'companionCavalry', level: 1 },
      { type: 'thebanSacredBand', level: 4 },
      { type: 'indianElephants', level: 3 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 4 },
    ],
    general: { id: 'leonidas', rank: 7 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Jaxartes, 329 BC (near Khujand, Tajikistan). riverCrossing.
 * Decisive factor: Cross under cover and catch horse archers.
 * Sources: Arrian, Anabasis 4.1–4. A. B. Bosworth, Conquest and Empire (1988).
 */
const jaxartes: CampaignBattle = {
  id: 'jaxartes',
  name: 'Jaxartes',
  year: '329 BC',
  age: 1,
  lat: 40.28,
  lon: 69.63,
  challengeType: 'riverCrossing',
  branchesFrom: 'gaugamela',
  problem: 'Cross under cover and catch horse archers.',
  briefing:
    'Macedonian missiles covered a river crossing against mobile Saka opponents. Cross under cover and catch horse archers. Shoot across the river to cover the fords, then cross and catch the horsemen before they slip away.',
  terrain: [
    '.......~~.......',
    '.......~~.......',
    '.......==.......',
    '.......~~.......',
    '.......~~.......',
    '.......~~.......',
    '.......==.......',
    '.......~~.......',
    '.......~~.......',
    '.......~~.......',
  ],
  deployment: [
    '................',
    '.DDDDD..........',
    '.DDDDD..........',
    '.DDDDD..........',
    '.DDDDD..........',
    '.DDDDD..........',
    '.DDDDD..........',
    '.DDDDD..........',
    '.DDDDD..........',
    '................',
  ],
  enemy: [
    { type: 'antiquitySpearmen', level: 4, x: 12, y: 4, facing: W, general: true },
    { type: 'antiquityArchers', level: 4, x: 11, y: 5, facing: W },
    { type: 'antiquityLightCavalry', level: 4, x: 11, y: 2, facing: W },
    { type: 'antiquitySpearmen', level: 4, x: 11, y: 4, facing: W },
    { type: 'antiquityArchers', level: 4, x: 11, y: 3, facing: W },
  ],
  enemyGeneral: { id: 'sakaChiefs', rank: 7 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['antiquityLightCavalry'] },
  testArmy: {
    units: [
      { type: 'companionCavalry', level: 1 },
      { type: 'thebanSacredBand', level: 4 },
      { type: 'indianElephants', level: 3 },
      { type: 'macedonianPhalanx', level: 4 },
      { type: 'hoplitePhalanx', level: 4 },
    ],
    general: { id: 'leonidas', rank: 8 },
  },
  bonus: { kind: 'winByTurn', turn: 8 },
  bonusText: 'Win by turn 8.',
};

/** Main battles in historical order, then the optional ones. */
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
  delium,
  mantinea418,
  cunaxa,
  coronea,
  mantinea362,
  persianGate,
  jaxartes,
];
