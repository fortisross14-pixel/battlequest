import { AGES, AGE_BY_ID } from './ages';
import { KADESH_BUILDER_TIPS, KADESH_TUTORIAL, MEGIDDO_TUTORIAL } from './tutorial';
import type { CampaignBattle } from './types';

const W = 6 as const;

/*
 * Megiddo, 1457 BC (research):
 * - Thutmose III led Egypt against a Canaanite coalition headed by the king of Kadesh.
 * - He took the narrow Aruna pass instead of the safer roads and came out near Megiddo.
 * - The coalition was beaten in the field and fled into the city, which then had to be besieged.
 * - It is the first battle recorded in some detail (Annals of Thutmose III, Karnak).
 */
const megiddo: CampaignBattle = {
  id: 'megiddo',
  name: 'Megiddo',
  year: '1457 BC',
  age: 0,
  lat: 32.585,
  lon: 35.184,
  tutorial: MEGIDDO_TUTORIAL,
  problem: 'Strike the Canaanite line from the flank before it can turn to face you.',
  briefing:
    'Thutmose III has led his army through the narrow Aruna pass and out onto the plain before Megiddo, where the Canaanite kings did not expect him. Their warriors are still forming up, a wood covering their southern end. Pin their line from the front with your spearmen, then send the chariots round the open northern end into its flank, where a unit can only strike back at half strength.',
  // The Canaanite line faces west on open ground. A wood covers its southern end, so the
  // only flank the chariots can reach is the open northern one: the lesson of the battle.
  terrain: [
    '............',
    '............',
    '............',
    '............',
    '............',
    '......FFF...',
    '.....FFFF...',
    '............',
  ],
  deployment: [
    '............',
    '.DDD........',
    '.DDD........',
    '.DDD........',
    '.DDD........',
    '.DDD........',
    '............',
    '............',
  ],
  enemy: [
    { type: 'canaaniteWarriors', x: 6, y: 3, facing: W, general: true },
    { type: 'canaaniteWarriors', x: 6, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'kingOfKadesh', rank: 1 },
  posture: 'defensive',
  turnLimit: 10,
  // The tutorial forgives one lost unit.
  playerBreakpoint: 0.75,
  maxUnits: 2,
  fixedArmy: {
    units: [{ type: 'egyptianSpearmen' }, { type: 'egyptianChariots' }],
    general: { id: 'thutmose', rank: 1 },
  },
  // Spearmen facing the line; chariots on the open northern side, ready to ride round.
  startAt: [
    { x: 3, y: 3 },
    { x: 3, y: 1 },
  ],
  firstWinUnlocks: { units: ['egyptianArchers'], generals: ['thutmose'] },
  testArmy: {
    units: [{ type: 'egyptianSpearmen' }, { type: 'egyptianChariots' }],
    general: { id: 'thutmose', rank: 1 },
  },
  bonus: { kind: 'winByTurn', turn: 6 },
  bonusText: 'Win by turn 6.',
};

/*
 * Kadesh, 1274 BC (research):
 * - Ramesses II marched on Kadesh on the Orontes against the Hittite king Muwatalli II.
 * - Misled about the Hittite position, the Egyptians were hit by a mass of Hittite chariots
 *   that crossed the Orontes, broke the Re division and fell on Ramesses' camp.
 * - Ramesses rallied his guard, and Egyptian reinforcements arrived; the battle ended without
 *   a clear winner and was followed by one of the earliest known peace treaties.
 */
const kadesh: CampaignBattle = {
  id: 'kadesh',
  name: 'Kadesh',
  year: '1274 BC',
  age: 0,
  lat: 34.557,
  lon: 36.519,
  problem: 'Hold the camp against a chariot ambush across the Orontes for 5 turns.',
  briefing:
    'False reports have led Ramesses II into a trap: Hittite chariots are splashing across the Orontes towards his camp. Help is on the way, but it will take time. Spearmen in front stop chariots cold, and chariots in a ford fight badly — make them pay for every crossing.',
  terrain: [
    '........~...',
    '........~...',
    '........=...',
    '...,,...~...',
    '...,,...~...',
    '........~...',
    '........=...',
    '........~...',
  ],
  deployment: [
    '............',
    '.DDDD.......',
    '.DDDD.......',
    '.DDDD.......',
    '.DDDD.......',
    '.DDDD.......',
    '.DDDD.......',
    '............',
  ],
  enemy: [
    { type: 'hittiteChariots', x: 10, y: 2, facing: W, general: true },
    { type: 'canaaniteChariots', x: 10, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'muwatalli', rank: 1 },
  posture: 'aggressive',
  turnLimit: 5,
  holdOut: 'player',
  maxUnits: 3,
  // What the builder tips suggest: two archers and a spear line, with Thutmose.
  testArmy: {
    units: [{ type: 'egyptianArchers' }, { type: 'egyptianArchers' }, { type: 'egyptianSpearmen' }],
    general: { id: 'thutmose', rank: 1 },
  },
  bonus: { kind: 'noUnitLost' },
  tutorial: KADESH_TUTORIAL,
  builderTips: KADESH_BUILDER_TIPS,
  bonusText: 'Lose no unit (none routed or destroyed).',
};

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
    'The kings of Syria and Israel have joined forces to stop Shalmaneser III by the Orontes. The Assyrian army is the most professional of its age, its archers sheltered behind spearmen and shields. Every turn spent at a distance favours them: get in close, and watch for their cavalry on your flank.',
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
    { type: 'assyrianSpearmen', x: 11, y: 4, facing: W, level: 3 },
    { type: 'assyrianArchers', x: 12, y: 4, facing: W, general: true, level: 2 },
    { type: 'assyrianArchers', x: 12, y: 5, facing: W, level: 2 },
    { type: 'aramaeanInfantry', x: 12, y: 8, facing: W, level: 3 },
  ],
  enemyGeneral: { id: 'shalmaneser', rank: 2 },
  posture: 'defensive',
  turnLimit: 12,
  enemyBreakpoint: 0.55,
  maxUnits: 3,
  testArmy: {
    units: [
      { type: 'egyptianChariots' },
      { type: 'hittiteSpearmen' },
      { type: 'egyptianSpearmen' },
    ],
    general: { id: 'captain', rank: 2 },
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
  testArmy: {
    units: [{ type: 'hoplites' }, { type: 'hoplites' }, { type: 'peltasts' }, { type: 'hoplites' }],
    general: { id: 'captain', rank: 2 },
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
    { type: 'persianCavalry', x: 14, y: 4, facing: W, level: 2 },
    { type: 'peltasts', x: 13, y: 2, facing: W, level: 2 },
  ],
  enemyGeneral: { id: 'xerxes', rank: 3 },
  posture: 'aggressive',
  turnLimit: 10,
  holdOut: 'player',
  maxUnits: 4,
  testArmy: {
    units: [{ type: 'hoplites' }, { type: 'hoplites' }, { type: 'hoplites' }, { type: 'hoplites' }],
    general: { id: 'leonidas', rank: 1 },
  },
  bonus: { kind: 'noUnitLost' },
  bonusText: 'Lose no unit (none routed or destroyed).',
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
    { type: 'hoplites', x: 11, y: 5, facing: W },
    { type: 'hoplites', x: 11, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'cleombrotus', rank: 1 },
  posture: 'aggressive',
  turnLimit: 12,
  playerBreakpoint: 0.6,
  maxUnits: 5,
  testArmy: {
    units: [
      { type: 'hoplites' },
      { type: 'hoplites' },
      { type: 'thessalianCavalry' },
      { type: 'hoplites' },
      { type: 'peltasts' },
    ],
    general: { id: 'leonidas', rank: 2 },
  },
  bonus: { kind: 'enemyGeneralLost' },
  bonusText: 'Win by killing or capturing Cleombrotus.',
};

export const CAMPAIGN: CampaignBattle[] = [megiddo, kadesh, qarqar, marathon, thermopylae, leuctra];

export const BATTLE_BY_ID: Record<string, CampaignBattle> = Object.fromEntries(
  CAMPAIGN.map((b) => [b.id, b]),
);

/** An age's playable battles, in order. */
export function battlesOfAge(age: number): CampaignBattle[] {
  return (AGE_BY_ID[age]?.battles ?? []).map((id) => BATTLE_BY_ID[id]!).filter(Boolean);
}

/** A battle's position (0-based) in its age. */
export function battleIndex(b: CampaignBattle): number {
  return AGE_BY_ID[b.age]?.battles.indexOf(b.id) ?? -1;
}

export { AGES, AGE_BY_ID };
