import { AGES, AGE_BY_ID } from './ages';
import { KADESH_BUILDER_TIPS, KADESH_TUTORIAL, MEGIDDO_TUTORIAL } from './tutorial';
import { ANTIQUITY } from './antiquity';
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
    { type: 'bronzeAgeSpearmen', x: 6, y: 3, facing: W, general: true },
    { type: 'bronzeAgeSpearmen', x: 6, y: 4, facing: W },
  ],
  enemyGeneral: { id: 'kingOfKadesh', rank: 1 },
  posture: 'defensive',
  turnLimit: 10,
  // The tutorial forgives one lost unit.
  playerBreakpoint: 0.75,
  maxUnits: 2,
  fixedArmy: {
    units: [{ type: 'bronzeAgeSpearmen' }, { type: 'bronzeAgeChariots' }],
    general: { id: 'bronzeAgeCaptain', rank: 1 },
  },
  // Spearmen facing the line; chariots on the open northern side, ready to ride round.
  startAt: [
    { x: 3, y: 3 },
    { x: 3, y: 1 },
  ],
  firstWinUnlocks: { units: ['bronzeAgeArchers'] },
  testArmy: {
    units: [{ type: 'bronzeAgeSpearmen' }, { type: 'bronzeAgeChariots' }],
    general: { id: 'bronzeAgeCaptain', rank: 1 },
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
    { type: 'bronzeAgeChariots', x: 10, y: 2, facing: W, general: true },
    { type: 'bronzeAgeChariots', x: 10, y: 6, facing: W },
  ],
  enemyGeneral: { id: 'muwatalliII', rank: 1 },
  posture: 'aggressive',
  turnLimit: 5,
  holdOut: 'player',
  maxUnits: 3,
  // What the builder tips suggest: two archers and a spear line, with Thutmose.
  testArmy: {
    units: [
      { type: 'bronzeAgeArchers' },
      { type: 'bronzeAgeArchers' },
      { type: 'bronzeAgeSpearmen' },
    ],
    general: { id: 'bronzeAgeCaptain', rank: 1 },
  },
  bonus: { kind: 'noUnitLost' },
  tutorial: KADESH_TUTORIAL,
  builderTips: KADESH_BUILDER_TIPS,
  bonusText: 'Lose no unit (none routed or destroyed).',
};

export const CAMPAIGN: CampaignBattle[] = [megiddo, kadesh, ...ANTIQUITY];

export const BATTLE_BY_ID: Record<string, CampaignBattle> = Object.fromEntries(
  CAMPAIGN.map((b) => [b.id, b]),
);

/** An age's main-path battles, in order. */
export function battlesOfAge(age: number): CampaignBattle[] {
  return (AGE_BY_ID[age]?.battles ?? []).map((id) => BATTLE_BY_ID[id]!).filter(Boolean);
}

/** An age's optional battles (GAME_DESIGN 7.3). */
export function optionalBattlesOf(age: number): CampaignBattle[] {
  return (AGE_BY_ID[age]?.optional ?? []).map((id) => BATTLE_BY_ID[id]!).filter(Boolean);
}

/** A main battle's position (0-based) in its age; -1 for an optional battle. */
export function battleIndex(b: CampaignBattle): number {
  return AGE_BY_ID[b.age]?.battles.indexOf(b.id) ?? -1;
}

export { AGES, AGE_BY_ID };
