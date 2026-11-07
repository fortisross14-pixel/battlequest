import { Cohesion } from '../../core/types';
import { AGES, AGE_BY_ID } from './ages';
import { KADESH_BUILDER_STEPS, KADESH_TUTORIAL, MEGIDDO_TUTORIAL } from './tutorial';
import { ANTIQUITY } from './antiquity';
import type { CampaignBattle } from './types';

const N = 0 as const;
const S = 4 as const;
const W = 6 as const;

/*
 * Megiddo (docs/history/age-00-dawn-of-war.md):
 * - A coalition centred on Kadesh and Megiddo challenged Egyptian authority in the southern
 *   Levant. Thutmose III took the narrow Aruna pass and emerged unexpectedly near Megiddo.
 * - The coalition lost the field and fled into the city; the later siege is outside the
 *   tutorial.
 * - Decisive factor: operational surprise through Aruna denied the coalition a prepared
 *   deployment.
 * Tutorial 0.1 (GAME_DESIGN 7.4): almost impossible to lose. Two weak Level 1 Canaanite
 * blocks, still Disrupted from the surprise, face the Egyptian spearmen; a brook behind them
 * stops a charge pushing them away, and their open flanks face the two chariot units.
 */
const megiddo: CampaignBattle = {
  id: 'megiddo',
  name: 'Megiddo',
  year: 'c. 1457 BC',
  age: 0,
  lat: 32.584,
  lon: 35.185,
  challengeType: 'lineAndFlank',
  tutorial: MEGIDDO_TUTORIAL,
  problem: 'Turn the exposed Canaanite flank before its line can face the Egyptian advance.',
  briefing:
    'You have cleared the Aruna pass before the Canaanite kings can turn their line. Megiddo is close, but their army still blocks the plain. Keep your spearmen facing forward and use the chariot to attack the exposed flank.',
  // The Canaanite line faces west, a brook (the Qina of the Annals) at its back. Rough
  // hill country behind the Egyptians abstracts the exit from the Aruna pass.
  terrain: [
    ',,..........',
    ',...........',
    '.......~....',
    '.......~....',
    '.......~....',
    '.......~....',
    '............',
    '............',
  ],
  deployment: [
    '......D.....',
    '.DDD........',
    '.DDD........',
    '.DDD........',
    '.DDD........',
    '.DDD........',
    '............',
    '......D.....',
  ],
  enemy: [
    { type: 'bronzeAgeSpearmen', x: 6, y: 3, facing: W, cohesion: Cohesion.Disrupted },
    { type: 'bronzeAgeSpearmen', x: 6, y: 4, facing: W, cohesion: Cohesion.Disrupted },
  ],
  posture: 'defensive',
  turnLimit: 10,
  // Both Canaanite blocks must break: one rout alone doesn't end the lesson early.
  enemyBreakpoint: 0.75,
  // The tutorial forgives a lost unit.
  playerBreakpoint: 0.75,
  maxUnits: 3,
  fixedArmy: {
    units: [
      { type: 'bronzeAgeSpearmen' },
      { type: 'bronzeAgeChariots' },
      { type: 'bronzeAgeChariots' },
    ],
    general: { id: 'bronzeAgeCaptain', rank: 1 },
  },
  // Spearmen facing the line; one chariot unit north of it facing south, one south facing
  // north: each can charge straight into a Canaanite flank.
  startAt: [
    { x: 3, y: 3 },
    { x: 6, y: 0, facing: S },
    { x: 6, y: 7, facing: N },
  ],
  firstWinUnlocks: { units: ['bronzeAgeArchers'] },
  testArmy: {
    units: [
      { type: 'bronzeAgeSpearmen' },
      { type: 'bronzeAgeChariots' },
      { type: 'bronzeAgeChariots' },
    ],
    general: { id: 'bronzeAgeCaptain', rank: 1 },
  },
  bonus: { kind: 'winByTurn', turn: 6 },
  bonusText: 'Win by the end of turn 6.',
};

/*
 * Kadesh (docs/history/age-00-dawn-of-war.md):
 * - Ramesses II advanced toward Kadesh with his divisions separated and accepted false
 *   reports that Muwatalli was far away.
 * - Hittite chariots crossed the Orontes, shattered the approaching Re division and struck
 *   the Egyptian camp; Ramesses' troops resisted and further Egyptian forces arrived.
 * - Kadesh remained in the Hittite sphere.
 * Tutorial 0.2 (GAME_DESIGN 7.4): easy, but losable by bad play. Four player units against
 * three Level 1 Hittite units caught in and beyond the fords; break their army (no
 * hold-out timer, prompt 06).
 */
const kadesh: CampaignBattle = {
  id: 'kadesh',
  name: 'Kadesh',
  year: '1274 BC',
  age: 0,
  lat: 34.557,
  lon: 36.515,
  challengeType: 'passBridgeOrFord',
  problem:
    'Meet the Hittite chariots at the Orontes fords with spears and arrows, then break them.',
  briefing:
    'False reports have left Ramesses’ camp exposed beside the Orontes. Hittite chariots are crossing while the Egyptian army is still closing up. Choose a balanced force, put spears on the approaches, and strike the chariots as they come out of the fords.',
  // The Orontes runs north to south with two fords; rough ground marks the Egyptian camp.
  terrain: [
    '........~...',
    '........~...',
    '........=...',
    '...,,...~...',
    '...,,...~...',
    '........=...',
    '........~...',
    '........~...',
  ],
  deployment: [
    '............',
    '..DDDD......',
    '..DDDD......',
    '..DDDD......',
    '..DDDD......',
    '..DDDD......',
    '..DDDD......',
    '............',
  ],
  // Two chariot units mid-crossing in the fords, their infantry on the far bank.
  enemy: [
    { type: 'bronzeAgeChariots', x: 10, y: 2, facing: W },
    { type: 'bronzeAgeChariots', x: 10, y: 5, facing: W },
    { type: 'bronzeAgeSpearmen', x: 11, y: 4, facing: W },
  ],
  posture: 'aggressive',
  turnLimit: 12,
  maxUnits: 4,
  // A sensible player holds the bank and lets the chariots come out of the fords.
  testPosture: 'defensive',
  // The second tutorial still forgives a little: the Egyptian line breaks at 60%.
  playerBreakpoint: 0.6,
  testArmy: {
    units: [
      { type: 'bronzeAgeSpearmen' },
      { type: 'bronzeAgeSpearmen' },
      { type: 'bronzeAgeArchers' },
      { type: 'bronzeAgeChariots' },
    ],
    general: { id: 'bronzeAgeCaptain', rank: 1 },
  },
  bonus: { kind: 'noUnitLost' },
  tutorial: KADESH_TUTORIAL,
  builderSteps: KADESH_BUILDER_STEPS,
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
