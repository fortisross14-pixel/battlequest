import type { CampaignBattle } from './types';

/*
 * Age 2, Classical Empires (GAME_DESIGN 7.5), generated from the history brief
 * docs/history/age-02-classical-empires.md: names, dates, coordinates, commanders, enemy
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
 * Heraclea, 280 BC (near Policoro, Italy). cavalryAndPursuit.
 * Decisive factor: Fix the Roman line, then use elephants and cavalry.
 * Sources: Plutarch, Pyrrhus 16–17. Duncan Head, Armies of the Macedonian and Punic Wars (1982).
 */
const heraclea: CampaignBattle = {
  id: 'heraclea',
  name: 'Heraclea',
  year: '280 BC',
  age: 2,
  lat: 40.19,
  lon: 16.68,
  challengeType: 'cavalryAndPursuit',
  problem: 'Fix the Roman line, then use elephants and cavalry.',
  briefing:
    'Pyrrhus defeated Romans with phalanx, cavalry and elephants. Fix the Roman line, then use elephants and cavalry. Cross the Siris at its fords and let your horse and elephants hit the legion’s flanks.',
  terrain: [
    '......~.........',
    '......~.........',
    '......=.........',
    '......~.........',
    '......~.........',
    '......=.........',
    '......~.........',
    '......~.........',
    '..FF..=.........',
    '..FF..~.........',
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
    { type: 'romanLegionaries', level: 1, x: 11, y: 3, facing: W, general: true },
    { type: 'romanLegionaries', level: 1, x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 3 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'cataphracts', level: 1 },
      { type: 'classicalElephants', level: 1 },
      { type: 'romanLegionaries', level: 1 },
      { type: 'classicalSpearmen', level: 1 },
    ],
    general: { id: 'leonidas', rank: 8 },
  },
  bonus: { kind: 'winByTurn', turn: 9 },
  bonusText: 'Win by turn 9.',
};

/*
 * Trebia, 218 BC (near Piacenza, Italy). ambushAndVision.
 * Decisive factor: Draw the enemy across the river, then spring the ambush.
 * Sources: Polybius, Histories 3.70–74. John Lazenby, Hannibal's War (1978).
 */
const trebia: CampaignBattle = {
  id: 'trebia',
  name: 'Trebia',
  year: '218 BC',
  age: 2,
  lat: 45.04,
  lon: 9.7,
  challengeType: 'ambushAndVision',
  problem: 'Draw the enemy across the river, then spring the ambush.',
  briefing:
    'Hannibal drew cold Roman troops across the Trebia and struck with a concealed force. Draw the enemy across the river, then spring the ambush. Units hidden in the stream bed can strike the Romans from behind once they have crossed the river.',
  terrain: [
    'FFFF.....~......',
    'FFF......~......',
    'FF.......=......',
    '.........~......',
    '........,~......',
    '........,~......',
    '.........=......',
    '.........~......',
    '.........~......',
    '.........~......',
  ],
  deployment: [
    '................',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD...........',
    '.DDDD..DD.......',
    '.DDDD..DD.......',
    '.DDDD...........',
    '.DDDD...........',
    '................',
    '................',
  ],
  enemy: [
    { type: 'romanLegionaries', level: 2, x: 11, y: 3, facing: W, general: true },
    { type: 'romanLegionaries', level: 2, x: 11, y: 5, facing: W },
    { type: 'classicalSkirmishers', level: 2, x: 12, y: 7, facing: W },
    { type: 'romanLegionaries', level: 2, x: 12, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 4 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'cataphracts', level: 2 },
      { type: 'classicalElephants', level: 1 },
      { type: 'romanLegionaries', level: 2 },
      { type: 'parthianHorseArchers', level: 1 },
    ],
    general: { id: 'leonidas', rank: 8 },
  },
  bonus: { kind: 'winByTurn', turn: 8 },
  bonusText: 'Win by turn 8.',
};

/*
 * Lake Trasimene, 217 BC (Lake Trasimene, Italy). ambushAndVision.
 * Decisive factor: Trap the marching column before it deploys.
 * Sources: Polybius, Histories 3.82–85. John Lazenby, Hannibal's War (1978).
 */
const lakeTrasimene: CampaignBattle = {
  id: 'lakeTrasimene',
  name: 'Lake Trasimene',
  year: '217 BC',
  age: 2,
  lat: 43.15,
  lon: 12.1,
  challengeType: 'ambushAndVision',
  problem: 'Trap the marching column before it deploys.',
  briefing:
    'Hannibal attacked a Roman column in morning mist beside the lake. Trap the marching column before it deploys. From the wooded hills above the lake, charge down into the side of the marching column.',
  terrain: [
    'FFFFFFFFFFFFFFFF',
    'FF....FF....FFFF',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~',
  ],
  elevation: [
    '1111111111111111',
    '1111111111111111',
    '1111111111111111',
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
    '..DDDDDDDDDDD...',
    '..DDDDDDDDDDD...',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  enemy: [
    { type: 'romanLegionaries', level: 2, x: 6, y: 6, facing: E },
    { type: 'romanLegionaries', level: 2, x: 8, y: 6, facing: E, general: true },
    { type: 'classicalSkirmishers', level: 2, x: 10, y: 6, facing: E },
    { type: 'romanLegionaries', level: 2, x: 8, y: 5, facing: E },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 4 },
  posture: 'defensive',
  turnLimit: 10,
  maxUnits: 4,
  testArmy: {
    units: [
      { type: 'cataphracts', level: 2 },
      { type: 'classicalElephants', level: 1 },
      { type: 'romanLegionaries', level: 2 },
      { type: 'parthianHorseArchers', level: 2 },
    ],
    general: { id: 'leonidas', rank: 9 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down the consul Flaminius.',
};

/*
 * Cannae, 216 BC (Cannae, Italy). lineAndFlank.
 * Decisive factor: Let the centre bend without breaking, then close both wings.
 * Sources: Polybius, Histories 3.110–117. Adrian Goldsworthy, Cannae (2001).
 */
const cannae: CampaignBattle = {
  id: 'cannae',
  name: 'Cannae',
  year: '216 BC',
  age: 2,
  lat: 41.3,
  lon: 16.15,
  challengeType: 'lineAndFlank',
  problem: 'Let the centre bend without breaking, then close both wings.',
  briefing:
    "Hannibal's centre yielded while wings and cavalry enclosed the Roman mass. Let the centre bend without breaking, then close both wings. Let your centre give ground slowly while your wings wrap round the Roman mass.",
  terrain: [
    '~~~~~~~~~~~~~~~~',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
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
    { type: 'romanLegionaries', level: 5, x: 11, y: 3, facing: W },
    { type: 'romanLegionaries', level: 5, x: 11, y: 4, facing: W, general: true },
    { type: 'romanLegionaries', level: 5, x: 11, y: 5, facing: W },
    { type: 'classicalSkirmishers', level: 5, x: 10, y: 7, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'cataphracts', level: 2 },
      { type: 'classicalElephants', level: 1 },
      { type: 'romanLegionaries', level: 3 },
      { type: 'parthianHorseArchers', level: 2 },
      { type: 'romanAuxiliaries', level: 1 },
    ],
    general: { id: 'leonidas', rank: 9 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down the consul’s guard.',
};

/*
 * Zama, 202 BC (near Zama, Tunisia). lineAndFlank.
 * Decisive factor: Absorb elephants, win cavalry, then strike the rear.
 * Sources: Polybius, Histories 15.9–16. Adrian Goldsworthy, The Fall of Carthage (2000).
 */
const zama: CampaignBattle = {
  id: 'zama',
  name: 'Zama',
  year: '202 BC',
  age: 2,
  lat: 36.18,
  lon: 9.2,
  challengeType: 'lineAndFlank',
  problem: 'Absorb elephants, win cavalry, then strike the rear.',
  briefing:
    'Scipio opened lanes for elephants and returned victorious cavalry to the rear. Absorb elephants, win cavalry, then strike the rear. Leave lanes for the elephants to run through, then win the cavalry fight and strike their rear.',
  terrain: [
    '................',
    '................',
    '..........,,....',
    '................',
    '................',
    '................',
    '................',
    '....,,..........',
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
    { type: 'classicalElephants', level: 2, x: 10, y: 4, facing: W },
    { type: 'classicalSpearmen', level: 2, x: 12, y: 4, facing: W, general: true },
    { type: 'carthaginianCavalry', level: 2, x: 11, y: 7, facing: W },
    { type: 'classicalElephants', level: 2, x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'hannibal', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'cataphracts', level: 2 },
      { type: 'classicalElephants', level: 2 },
      { type: 'romanLegionaries', level: 3 },
      { type: 'parthianHorseArchers', level: 3 },
      { type: 'romanAuxiliaries', level: 3 },
    ],
    general: { id: 'leonidas', rank: 9 },
  },
  bonus: { kind: 'winByTurn', turn: 10 },
  bonusText: 'Win by turn 10.',
};

/*
 * Cynoscephalae, 197 BC (near Farsala, Greece). hillsAndDefence.
 * Decisive factor: Fight for the ridges and hit the pikes where they cannot face.
 * Sources: Polybius, Histories 18.18–27. N. G. L. Hammond, The Macedonian State (1989).
 */
const cynoscephalae: CampaignBattle = {
  id: 'cynoscephalae',
  name: 'Cynoscephalae',
  year: '197 BC',
  age: 2,
  lat: 39.38,
  lon: 22.37,
  challengeType: 'hillsAndDefence',
  problem: 'Fight for the ridges and hit the pikes where they cannot face.',
  briefing:
    'A Roman wing exploited an exposed phalanx flank in broken hills. Fight for the ridges and hit the pikes where they cannot face. A phalanx can only fight to its front: find it on the broken ridges and hit it from the side.',
  terrain: [
    '....,,,,........',
    '................',
    '..........,.....',
    '................',
    '......,.........',
    '................',
    '.........,,.....',
    '................',
    '....,...........',
    '................',
  ],
  elevation: [
    '0000111100000000',
    '0001111110000000',
    '0000111100000000',
    '0000000000000000',
    '0000000000110000',
    '0000000001111000',
    '0000000000110000',
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
    { type: 'hellenisticPhalanx', level: 3, x: 11, y: 3, facing: W, general: true },
    { type: 'hellenisticPhalanx', level: 3, x: 11, y: 5, facing: W },
    { type: 'classicalLightCavalry', level: 3, x: 12, y: 8, facing: W },
    { type: 'hellenisticPhalanx', level: 3, x: 12, y: 5, facing: W },
    { type: 'hellenisticPhalanx', level: 3, x: 11, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 5 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'classicalElephants', level: 3 },
      { type: 'cataphracts', level: 2 },
      { type: 'romanLegionaries', level: 4 },
      { type: 'parthianHorseArchers', level: 3 },
      { type: 'romanAuxiliaries', level: 3 },
    ],
    general: { id: 'leonidas', rank: 9 },
  },
  bonus: { kind: 'winByTurn', turn: 9 },
  bonusText: 'Win by turn 9.',
};

/*
 * Pydna, 168 BC (near Pydna, Greece). hillsAndDefence.
 * Decisive factor: Draw pikes onto broken ground, then penetrate the gaps.
 * Sources: Plutarch, Aemilius Paulus 18–22. N. G. L. Hammond, The Macedonian State (1989).
 */
const pydna: CampaignBattle = {
  id: 'pydna',
  name: 'Pydna',
  year: '168 BC',
  age: 2,
  lat: 40.37,
  lon: 22.52,
  challengeType: 'hillsAndDefence',
  problem: 'Draw pikes onto broken ground, then penetrate the gaps.',
  briefing:
    'The phalanx lost cohesion on broken ground and Roman troops entered its gaps. Draw pikes onto broken ground, then penetrate the gaps. Pikes lose order on broken ground: let them advance onto the rough patches, then strike the gaps.',
  terrain: [
    '................',
    '................',
    '......,,........',
    '.......,........',
    '................',
    '................',
    '.......,,.......',
    '........,.......',
    '................',
    '................',
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
    { type: 'hellenisticPhalanx', level: 5, x: 11, y: 3, facing: W, general: true },
    { type: 'hellenisticPhalanx', level: 5, x: 11, y: 5, facing: W },
    { type: 'classicalArchers', level: 5, x: 12, y: 4, facing: W },
    { type: 'classicalLightCavalry', level: 5, x: 12, y: 8, facing: W },
    { type: 'hellenisticPhalanx', level: 5, x: 12, y: 5, facing: W },
    { type: 'hellenisticPhalanx', level: 5, x: 11, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 5 },
  posture: 'aggressive',
  attackTurn: 2,
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'classicalElephants', level: 3 },
      { type: 'cataphracts', level: 2 },
      { type: 'romanLegionaries', level: 4 },
      { type: 'parthianHorseArchers', level: 3 },
      { type: 'romanAuxiliaries', level: 3 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'winByTurn', turn: 8 },
  bonusText: 'Win by turn 8.',
};

/*
 * Carrhae, 53 BC (Harran, Turkey). cavalryAndPursuit.
 * Decisive factor: Survive missile pressure and reach defensible ground.
 * Sources: Plutarch, Crassus 20–31. Erik Gruen, The Hellenistic World and the Coming of Rome (1984).
 */
const carrhae: CampaignBattle = {
  id: 'carrhae',
  name: 'Carrhae',
  year: '53 BC',
  age: 2,
  lat: 36.86,
  lon: 39.03,
  challengeType: 'cavalryAndPursuit',
  problem: 'Survive missile pressure and reach defensible ground.',
  briefing:
    'Parthian horse archers and cataphracts, led in the sources by Surena, exhausted Crassus in open country. Survive missile pressure and reach defensible ground. Your horse archers shoot and fall back: wear the legions down and never let them close.',
  terrain: [
    '................',
    '................',
    '..,,............',
    '................',
    '................',
    '................',
    '................',
    '...........,,...',
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
    { type: 'romanLegionaries', level: 3, x: 11, y: 3, facing: W },
    { type: 'romanLegionaries', level: 3, x: 11, y: 5, facing: W, general: true },
    { type: 'classicalSkirmishers', level: 3, x: 10, y: 7, facing: W },
    { type: 'romanLegionaries', level: 3, x: 10, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'crassus', rank: 6 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'classicalElephants', level: 3 },
      { type: 'cataphracts', level: 2 },
      { type: 'romanLegionaries', level: 4 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 3 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down Crassus.',
};

/*
 * Alesia, 52 BC (Alise-Sainte-Reine, France). holdUntilReinforcements.
 * Decisive factor: Hold two fronts until the relief attempt breaks.
 * Sources: Caesar, Gallic War 7.68–90. Adrian Goldsworthy, Caesar (2006).
 */
const alesia: CampaignBattle = {
  id: 'alesia',
  name: 'Alesia',
  year: '52 BC',
  age: 2,
  lat: 47.54,
  lon: 4.5,
  challengeType: 'holdUntilReinforcements',
  problem: 'Hold two fronts until the relief attempt breaks.',
  briefing:
    'Caesar built lines against both a besieged force and a relief army. Hold two fronts until the relief attempt breaks. Hold the works on both sides: the town in the west and the relief army in the east attack together.',
  terrain: [
    'FFF.............',
    'FF.....,,.......',
    '................',
    '......,..,......',
    '......,..,......',
    '......,..,......',
    '......,..,......',
    '................',
    '.......,,.....FF',
    '.............FFF',
  ],
  deployment: [
    '................',
    '.......DD.......',
    '.......DD.......',
    '.......DD.......',
    '.......DD.......',
    '.......DD.......',
    '.......DD.......',
    '.......DD.......',
    '.......DD.......',
    '................',
  ],
  enemy: [
    { type: 'classicalSpearmen', level: 5, x: 1, y: 4, facing: E },
    { type: 'classicalSpearmen', level: 5, x: 14, y: 4, facing: W, general: true },
    { type: 'classicalArchers', level: 5, x: 15, y: 6, facing: W },
    { type: 'classicalLightCavalry', level: 5, x: 14, y: 2, facing: W },
    { type: 'classicalSpearmen', level: 5, x: 11, y: 4, facing: E },
  ],
  enemyGeneral: { id: 'vercingetorix', rank: 6 },
  posture: 'aggressive',
  turnLimit: 8,
  holdOut: 'player',
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'classicalElephants', level: 3 },
      { type: 'cataphracts', level: 2 },
      { type: 'romanLegionaries', level: 4 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 3 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Pharsalus, 48 BC (near Farsala, Greece). lineAndFlank.
 * Decisive factor: Blunt cavalry with the reserve, then turn the exposed line.
 * Sources: Caesar, Civil War 3.82–99. Adrian Goldsworthy, Caesar (2006).
 */
const pharsalus: CampaignBattle = {
  id: 'pharsalus',
  name: 'Pharsalus',
  year: '48 BC',
  age: 2,
  lat: 39.37,
  lon: 22.93,
  challengeType: 'lineAndFlank',
  problem: 'Blunt cavalry with the reserve, then turn the exposed line.',
  briefing:
    "Caesar's reserve helped defeat the stronger enemy cavalry wing. Blunt cavalry with the reserve, then turn the exposed line. The enemy’s big cavalry wing is in the north: hold it with a reserve, then turn the line it leaves open.",
  terrain: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '~~~~~~~~~~~~~~~~',
  ],
  elevation: [
    '0000000000000111',
    '0000000000000111',
    '0000000000000111',
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
    { type: 'classicalSpearmen', level: 4, x: 11, y: 4, facing: W, general: true },
    { type: 'classicalArchers', level: 4, x: 12, y: 5, facing: W },
    { type: 'classicalLightCavalry', level: 4, x: 11, y: 1, facing: W },
    { type: 'classicalLightCavalry', level: 4, x: 12, y: 2, facing: W },
    { type: 'classicalSpearmen', level: 4, x: 11, y: 3, facing: W },
    { type: 'classicalArchers', level: 4, x: 12, y: 3, facing: W },
    { type: 'classicalLightCavalry', level: 4, x: 11, y: 2, facing: W },
    { type: 'classicalLightCavalry', level: 4, x: 12, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 6 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 6,
  testArmy: {
    units: [
      { type: 'classicalElephants', level: 3 },
      { type: 'cataphracts', level: 2 },
      { type: 'romanLegionaries', level: 4 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 3 },
      { type: 'classicalSpearmen', level: 1 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'winByTurn', turn: 10 },
  bonusText: 'Win by turn 10.',
};

/*
 * Teutoburg Forest, AD 9 (Kalkriese area, Germany). ambushAndVision.
 * Decisive factor: Ambush the stretched column before it forms a line.
 * Sources: Tacitus, Annals 1.55–71. Peter S. Wells, The Battle That Stopped Rome (2003).
 */
const teutoburgForest: CampaignBattle = {
  id: 'teutoburgForest',
  name: 'Teutoburg Forest',
  year: 'AD 9',
  age: 2,
  lat: 52.41,
  lon: 8.15,
  challengeType: 'ambushAndVision',
  problem: 'Ambush the stretched column before it forms a line.',
  briefing:
    "Arminius destroyed Varus' marching legions in difficult wooded country. Ambush the stretched column before it forms a line. Strike the column from the woods on both sides of the track before the legions can form a line.",
  terrain: [
    'FFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFFFFFF',
    'FFF..FFFFF..FFFF',
    '................',
    '................',
    '................',
    'FFFF..FFFFF..FFF',
    'FFFFFFFFFFFFFFFF',
    ',,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,',
  ],
  deployment: [
    '................',
    '..DDDD.DDDD.....',
    '..DDDD.DDDD.....',
    '................',
    '................',
    '................',
    '..DDDD.DDDD.....',
    '..DDDD.DDDD.....',
    '................',
    '................',
  ],
  enemy: [
    { type: 'romanLegionaries', level: 4, x: 5, y: 4, facing: E },
    { type: 'romanLegionaries', level: 4, x: 8, y: 4, facing: E, general: true },
    { type: 'classicalSkirmishers', level: 4, x: 11, y: 4, facing: E },
    { type: 'romanLegionaries', level: 4, x: 13, y: 4, facing: E },
    { type: 'romanLegionaries', level: 4, x: 13, y: 3, facing: E },
    { type: 'classicalSkirmishers', level: 4, x: 13, y: 5, facing: E },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 6 },
  posture: 'defensive',
  turnLimit: 10,
  maxUnits: 6,
  testArmy: {
    units: [
      { type: 'legioX', level: 1 },
      { type: 'classicalElephants', level: 4 },
      { type: 'cataphracts', level: 3 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 3 },
      { type: 'classicalSpearmen', level: 5 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down Varus.',
};

/*
 * Adrianople, 378 (near Edirne, Turkey). cavalryAndPursuit.
 * Decisive factor: Punish an enemy advancing without its full army.
 * Sources: Ammianus Marcellinus, Res Gestae 31.12–13. Peter Heather, The Fall of the Roman Empire (2005).
 */
const adrianople: CampaignBattle = {
  id: 'adrianople',
  name: 'Adrianople',
  year: 'AD 378',
  age: 2,
  lat: 41.68,
  lon: 26.56,
  challengeType: 'cavalryAndPursuit',
  problem: 'Punish an enemy advancing without its full army.',
  briefing:
    'Roman troops attacked before all reinforcements arrived and were enveloped after Gothic cavalry returned. Punish an enemy advancing without its full army. Hold the wagon laager on its rise until your returning cavalry can fall on the Roman flank.',
  terrain: [
    '................',
    '................',
    '................',
    '..,,,,..........',
    '..,..,..........',
    '..,..,..........',
    '..,,,,..........',
    '................',
    '................',
    '................',
  ],
  elevation: [
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
    '1111110000000000',
  ],
  deployment: [
    '..........DD....',
    '..........DD....',
    '.DDDDDD.........',
    '.DDDDDD.........',
    '.DDDDDD.........',
    '.DDDDDD.........',
    '.DDDDDD.........',
    '.DDDDDD.........',
    '................',
    '................',
  ],
  enemy: [
    { type: 'romanLegionaries', level: 4, x: 11, y: 4, facing: W, general: true },
    { type: 'romanLegionaries', level: 4, x: 11, y: 6, facing: W },
    { type: 'classicalSkirmishers', level: 4, x: 10, y: 8, facing: W },
    { type: 'romanLegionaries', level: 4, x: 10, y: 6, facing: W },
    { type: 'romanLegionaries', level: 4, x: 11, y: 5, facing: W },
    { type: 'classicalSkirmishers', level: 4, x: 11, y: 7, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 7 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 6,
  testArmy: {
    units: [
      { type: 'legioX', level: 1 },
      { type: 'classicalElephants', level: 4 },
      { type: 'cataphracts', level: 3 },
      { type: 'parthianHorseArchers', level: 5 },
      { type: 'romanAuxiliaries', level: 4 },
      { type: 'classicalSpearmen', level: 5 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down Emperor Valens.',
};

/*
 * Bagradas, 255 BC (near Tunis, Tunisia). lineAndFlank.
 * Decisive factor: Exploit open ground before legionaries close.
 * Sources: Polybius, Histories 1.32–35. Adrian Goldsworthy, The Fall of Carthage (2000).
 */
const bagradas: CampaignBattle = {
  id: 'bagradas',
  name: 'Bagradas',
  year: '255 BC',
  age: 2,
  lat: 36.78,
  lon: 10.2,
  challengeType: 'lineAndFlank',
  branchesFrom: 'heraclea',
  problem: 'Exploit open ground before legionaries close.',
  briefing:
    'Xanthippus used elephants and superior cavalry against Rome in open country. Exploit open ground before legionaries close. Open ground favours your horse: hit the legions in the flank before they close up.',
  terrain: [
    '................',
    '................',
    '................',
    '.........,,.....',
    '................',
    '................',
    '................',
    '................',
    '..FF............',
    '..FF............',
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
    { type: 'romanLegionaries', level: 3, x: 11, y: 3, facing: W, general: true },
    { type: 'romanLegionaries', level: 3, x: 11, y: 5, facing: W },
    { type: 'classicalSkirmishers', level: 3, x: 10, y: 7, facing: W },
    { type: 'romanLegionaries', level: 3, x: 10, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 4 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  firstWinUnlocks: { generals: ['xanthippus'] },
  testArmy: {
    units: [
      { type: 'cataphracts', level: 2 },
      { type: 'classicalElephants', level: 1 },
      { type: 'romanLegionaries', level: 2 },
      { type: 'parthianHorseArchers', level: 1 },
    ],
    general: { id: 'leonidas', rank: 8 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down the consul Regulus.',
};

/*
 * Metaurus, 207 BC (near the Metaurus, Italy). passBridgeOrFord.
 * Decisive factor: Stop the column before it reaches its ally.
 * Sources: Livy, History of Rome 27.46–51. John Lazenby, Hannibal's War (1978).
 */
const metaurus: CampaignBattle = {
  id: 'metaurus',
  name: 'Metaurus',
  year: '207 BC',
  age: 2,
  lat: 43.65,
  lon: 13.12,
  challengeType: 'passBridgeOrFord',
  branchesFrom: 'cannae',
  problem: 'Stop the column before it reaches its ally.',
  briefing:
    'Roman armies intercepted Hasdrubal before he could join Hannibal; the Roman force was commanded by consuls Nero and Livius. Stop the column before it reaches its ally. Block the pass between the wooded hills before the column can reach the river crossing.',
  terrain: [
    'FFFF....FFFFFFFF',
    'FFFF.....FFFFFFF',
    '................',
    '................',
    '................',
    'FFFF.....FFFFFFF',
    'FFFF....FFFFFFFF',
    '................',
    '~~~~~~~=~~~~~~~~',
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
    '................',
    '................',
  ],
  enemy: [
    { type: 'classicalElephants', level: 4, x: 11, y: 3, facing: W },
    { type: 'classicalSpearmen', level: 4, x: 12, y: 4, facing: W, general: true },
    { type: 'carthaginianCavalry', level: 4, x: 11, y: 7, facing: W },
    { type: 'classicalElephants', level: 4, x: 11, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'hasdrubalBarca', rank: 6 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['classicalElephants'] },
  testArmy: {
    units: [
      { type: 'cataphracts', level: 2 },
      { type: 'classicalElephants', level: 1 },
      { type: 'romanLegionaries', level: 3 },
      { type: 'parthianHorseArchers', level: 3 },
      { type: 'romanAuxiliaries', level: 2 },
    ],
    general: { id: 'leonidas', rank: 9 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Bring down Hasdrubal.',
};

/*
 * Bibracte, 58 BC (Mont Beuvray, France). hillsAndDefence.
 * Decisive factor: Hold the hill and defeat the enemy before its wagons cover retreat.
 * Sources: Caesar, Gallic War 1.21–26. Kate Gilliver, Caesar's Gallic Wars (2003).
 */
const bibracte: CampaignBattle = {
  id: 'bibracte',
  name: 'Bibracte',
  year: '58 BC',
  age: 2,
  lat: 46.92,
  lon: 4.04,
  challengeType: 'hillsAndDefence',
  branchesFrom: 'pydna',
  problem: 'Hold the hill and defeat the enemy before its wagons cover retreat.',
  briefing:
    'Caesar fought the Helvetii on rising ground after a contested march; Vercingetorix was not present. Hold the hill and defeat the enemy before its wagons cover retreat. Hold the hill and let the Helvetii climb to you before you counter-attack downhill.',
  terrain: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.............,,,',
    '............,,,,',
    '............,,,,',
  ],
  elevation: [
    '0011110000000000',
    '0111111000000000',
    '0111111000000000',
    '0111111000000000',
    '0111111000000000',
    '0111111000000000',
    '0111111000000000',
    '0011110000000000',
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
    { type: 'classicalSpearmen', level: 5, x: 11, y: 3, facing: W, general: true },
    { type: 'classicalArchers', level: 5, x: 12, y: 5, facing: W },
    { type: 'classicalLightCavalry', level: 5, x: 11, y: 7, facing: W },
    { type: 'classicalSpearmen', level: 5, x: 11, y: 5, facing: W },
    { type: 'classicalArchers', level: 5, x: 11, y: 4, facing: W },
    { type: 'classicalLightCavalry', level: 5, x: 11, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 6 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 5,
  firstWinUnlocks: { units: ['romanLegionaries'] },
  testArmy: {
    units: [
      { type: 'classicalElephants', level: 3 },
      { type: 'cataphracts', level: 2 },
      { type: 'romanLegionaries', level: 4 },
      { type: 'parthianHorseArchers', level: 3 },
      { type: 'romanAuxiliaries', level: 3 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Munda, 45 BC (southern Spain). hillsAndDefence.
 * Decisive factor: Break the ridge before the enemy counterattacks downhill.
 * Sources: Appian, Civil Wars 2.101–105. Adrian Goldsworthy, Caesar (2006).
 */
const munda: CampaignBattle = {
  id: 'munda',
  name: 'Munda',
  year: '45 BC',
  age: 2,
  lat: 37.25,
  lon: -5.2,
  challengeType: 'hillsAndDefence',
  branchesFrom: 'pharsalus',
  problem: 'Break the ridge before the enemy counterattacks downhill.',
  briefing:
    'Caesar won a hard uphill battle ending organised Pompeian resistance. Break the ridge before the enemy counterattacks downhill. The enemy holds the ridge: climb under their arrows and break them before they charge downhill.',
  terrain: [
    '................',
    '................',
    '................',
    '................',
    '.....,,.........',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  elevation: [
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
    '0000000001111111',
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
    { type: 'classicalSpearmen', level: 4, x: 10, y: 3, facing: W, general: true },
    { type: 'classicalSpearmen', level: 4, x: 10, y: 5, facing: W },
    { type: 'classicalArchers', level: 4, x: 12, y: 4, facing: W },
    { type: 'classicalLightCavalry', level: 4, x: 11, y: 8, facing: W },
    { type: 'classicalSpearmen', level: 4, x: 11, y: 5, facing: W },
    { type: 'classicalSpearmen', level: 4, x: 11, y: 4, facing: W },
    { type: 'classicalArchers', level: 4, x: 11, y: 6, facing: W },
    { type: 'classicalLightCavalry', level: 4, x: 10, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 7 },
  posture: 'defensive',
  turnLimit: 12,
  maxUnits: 6,
  firstWinUnlocks: { generals: ['caesar'] },
  testArmy: {
    units: [
      { type: 'legioX', level: 1 },
      { type: 'classicalElephants', level: 4 },
      { type: 'cataphracts', level: 3 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 3 },
      { type: 'classicalSpearmen', level: 4 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/*
 * Edessa, 260 (near Şanlıurfa, Turkey). strikeTheCommander.
 * Decisive factor: Isolate the emperor's guard and capture the commander.
 * Sources: Res Gestae Divi Saporis. Touraj Daryaee, Sasanian Persia (2009).
 */
const edessa: CampaignBattle = {
  id: 'edessa',
  name: 'Edessa',
  year: 'AD 260',
  age: 2,
  lat: 37.15,
  lon: 38.79,
  challengeType: 'strikeTheCommander',
  branchesFrom: 'teutoburgForest',
  problem: "Isolate the emperor's guard and capture the commander.",
  briefing:
    "Shapur defeated and captured Emperor Valerian; exact tactics are uncertain. Isolate the emperor's guard and capture the commander. Cut through to the emperor’s guard at the back of the Roman line.",
  terrain: [
    '................',
    '................',
    '..........,,....',
    '................',
    '................',
    '................',
    '................',
    '....,,..........',
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
    { type: 'romanLegionaries', level: 4, x: 11, y: 3, facing: W },
    { type: 'romanLegionaries', level: 4, x: 11, y: 5, facing: W },
    { type: 'classicalSkirmishers', level: 4, x: 13, y: 4, facing: W, general: true },
    { type: 'romanLegionaries', level: 4, x: 12, y: 4, facing: W },
    { type: 'romanLegionaries', level: 4, x: 11, y: 4, facing: W },
    { type: 'classicalSkirmishers', level: 4, x: 12, y: 3, facing: W },
    { type: 'romanLegionaries', level: 4, x: 12, y: 5, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 7 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 6,
  firstWinUnlocks: { units: ['cataphracts'] },
  testArmy: {
    units: [
      { type: 'legioX', level: 1 },
      { type: 'classicalElephants', level: 4 },
      { type: 'cataphracts', level: 3 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 3 },
      { type: 'classicalSpearmen', level: 5 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Capture Emperor Valerian: bring down his guard.',
};

/*
 * Argentoratum, 357 (Strasbourg, France). hillsAndDefence.
 * Decisive factor: Keep the centre intact and recover the cavalry flank.
 * Sources: Ammianus Marcellinus, Res Gestae 16.12. John Drinkwater, The Alamanni and Rome (2007).
 */
const argentoratum: CampaignBattle = {
  id: 'argentoratum',
  name: 'Argentoratum',
  year: 'AD 357',
  age: 2,
  lat: 48.58,
  lon: 7.75,
  challengeType: 'hillsAndDefence',
  branchesFrom: 'teutoburgForest',
  problem: 'Keep the centre intact and recover the cavalry flank.',
  briefing:
    "Julian's infantry overcame cavalry setbacks to defeat the Alamanni. Keep the centre intact and recover the cavalry flank. Keep your infantry centre together even if your horse gives way on the flank.",
  terrain: [
    '~~~~~~~~~~~~~~~~',
    '................',
    '................',
    '..........,,....',
    '................',
    '................',
    '................',
    '.....,,.........',
    '................',
    '................',
  ],
  elevation: [
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000011100',
    '0000000000011100',
    '0000000000011100',
    '0000000000011100',
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
    { type: 'classicalSpearmen', level: 3, x: 11, y: 3, facing: W, general: true },
    { type: 'classicalSpearmen', level: 3, x: 11, y: 5, facing: W },
    { type: 'classicalLightCavalry', level: 3, x: 10, y: 8, facing: W },
    { type: 'classicalSpearmen', level: 3, x: 10, y: 5, facing: W },
    { type: 'classicalSpearmen', level: 3, x: 11, y: 6, facing: W },
    { type: 'classicalLightCavalry', level: 3, x: 10, y: 6, facing: W },
    { type: 'classicalSpearmen', level: 3, x: 11, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'classicalCaptain', rank: 7 },
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 6,
  firstWinUnlocks: { units: ['cataphracts'] },
  testArmy: {
    units: [
      { type: 'legioX', level: 1 },
      { type: 'classicalElephants', level: 4 },
      { type: 'cataphracts', level: 3 },
      { type: 'parthianHorseArchers', level: 4 },
      { type: 'romanAuxiliaries', level: 4 },
      { type: 'classicalSpearmen', level: 5 },
    ],
    general: { id: 'leonidas', rank: 10 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
};

/** Main battles in historical order, then the optional ones. */
export const CLASSICAL: CampaignBattle[] = [
  heraclea,
  trebia,
  lakeTrasimene,
  cannae,
  zama,
  cynoscephalae,
  pydna,
  carrhae,
  alesia,
  pharsalus,
  teutoburgForest,
  adrianople,
  bagradas,
  metaurus,
  bibracte,
  munda,
  edessa,
  argentoratum,
];
