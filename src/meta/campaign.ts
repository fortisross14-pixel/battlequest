import {
  AGES,
  AGE_BY_ID,
  BATTLE_BY_ID,
  battleIndex,
  battlesOfAge,
} from '../content/campaign/battles';
import type { Age, CampaignBattle } from '../content/campaign/types';
import { firstPacksCost } from './prices';
import { addGeneral, addUnitCard, ECONOMY, type Profile } from './profile';

/**
 * Campaign progress (GAME_DESIGN 7.3): main battles open by stars earned in their age;
 * optional battles open when the main battle they branch from is won; an age opens once
 * every main battle of the previous age has been won. Pure functions.
 */

/** Every battle of an age, main path first, then the optional ones. */
export function allBattleIds(age: Age | undefined): string[] {
  return [...(age?.battles ?? []), ...(age?.optional ?? [])];
}

/** Stars earned in an age (best result per battle, optional battles included). */
export function ageStars(p: Profile, ageId: number): number {
  return allBattleIds(AGE_BY_ID[ageId]).reduce((s, id) => s + (p.battles[id]?.stars ?? 0), 0);
}

/** Stars earned on an age's main path only (for the Legendary road). */
export function mainStars(p: Profile, ageId: number): number {
  return (AGE_BY_ID[ageId]?.battles ?? []).reduce((s, id) => s + (p.battles[id]?.stars ?? 0), 0);
}

export interface AgeProgress {
  /** Main battles won, out of `total` main battles. */
  won: number;
  total: number;
  stars: number;
  /** Every battle's three stars, optional ones included. */
  maxStars: number;
}

export function ageProgress(p: Profile, ageId: number): AgeProgress {
  const age = AGE_BY_ID[ageId];
  const ids = age?.status === 'playable' ? age.battles : (age?.planned ?? []).map((b) => b.name);
  const total = ids.length;
  const won = (age?.battles ?? []).filter((id) => (p.battles[id]?.wins ?? 0) > 0).length;
  const all = age?.status === 'playable' ? allBattleIds(age).length : total;
  return { won, total, stars: ageStars(p, ageId), maxStars: all * 3 };
}

/** Every main battle of the age has been won at least once. */
export function ageComplete(p: Profile, ageId: number): boolean {
  const age = AGE_BY_ID[ageId];
  return (
    !!age && age.battles.length > 0 && age.battles.every((id) => (p.battles[id]?.wins ?? 0) > 0)
  );
}

/** Age 0 is always open; the next opens when every main battle of the previous one is won. */
export function isAgeUnlocked(p: Profile, ageId: number): boolean {
  const age = AGE_BY_ID[ageId];
  if (!age || age.status !== 'playable') return false;
  if (ageId === 0) return true;
  return isAgeUnlocked(p, ageId - 1) && ageComplete(p, ageId - 1);
}

/** Stars the age needs before main battle `index` (0-based) opens. */
export function starsNeeded(age: Age, index: number): number {
  return age.starThresholds[index] ?? age.starThresholds.at(-1) ?? 0;
}

/**
 * Main battles: the first two of an open age are always open, the rest need the age's
 * stars. Optional battles: open once the main battle they branch from is won.
 */
export function isBattleUnlocked(p: Profile, b: CampaignBattle): boolean {
  if (!isAgeUnlocked(p, b.age)) return false;
  if (b.branchesFrom) return (p.battles[b.branchesFrom]?.wins ?? 0) > 0;
  const age = AGE_BY_ID[b.age]!;
  return ageStars(p, b.age) >= starsNeeded(age, battleIndex(b));
}

/** How many more stars a locked main battle needs (0 if open, optional, or its age is locked). */
export function starsMissing(p: Profile, b: CampaignBattle): number {
  const age = AGE_BY_ID[b.age];
  if (!age || b.branchesFrom) return 0;
  return Math.max(0, starsNeeded(age, battleIndex(b)) - ageStars(p, b.age));
}

/** Why a battle is locked, in words, or null if it is open. */
export function lockText(p: Profile, b: CampaignBattle): string | null {
  if (isBattleUnlocked(p, b)) return null;
  if (b.branchesFrom) return `Win ${BATTLE_BY_ID[b.branchesFrom]?.name ?? b.branchesFrom} first.`;
  const n = starsMissing(p, b);
  return `Need ${n} more ★`;
}

/** The next battle to play: the first open main battle not yet won, oldest age first. */
export function nextBattle(p: Profile): CampaignBattle | undefined {
  for (const age of AGES) {
    for (const b of battlesOfAge(age.id)) {
      if (isBattleUnlocked(p, b) && !(p.battles[b.id]?.wins ?? 0)) return b;
    }
  }
  return undefined;
}

/** The newest open age (where the timeline opens). */
export function newestUnlockedAge(p: Profile): number {
  let newest = 0;
  for (const a of AGES) if (isAgeUnlocked(p, a.id)) newest = a.id;
  return newest;
}

export interface Unlocks {
  battles: string[];
  ages: number[];
}

/** What became open between two profile snapshots (for unlock animations). */
export function newlyUnlocked(before: Profile, after: Profile): Unlocks {
  const battles: string[] = [];
  const ages: number[] = [];
  for (const age of AGES) {
    if (isAgeUnlocked(after, age.id) && !isAgeUnlocked(before, age.id)) ages.push(age.id);
    for (const id of allBattleIds(age)) {
      const b = BATTLE_BY_ID[id];
      if (b && isBattleUnlocked(after, b) && !isBattleUnlocked(before, b)) battles.push(id);
    }
  }
  return { battles, ages };
}

export interface AgeGrant {
  age: number;
  /** Coins from the age-unlock bonus. */
  coins: number;
  units: string[];
  generals: string[];
}

/**
 * Grants every open age the player hasn't had yet: its Commons, its generic generals and the
 * age-unlock bonus, which brings the purse up to the age's first packs (GAME_DESIGN 7.6, 8).
 * Records the newest such age in `unlockedAge`. Returns what each age granted.
 */
export function syncAgeUnlocks(p: Profile): AgeGrant[] {
  const granted: AgeGrant[] = [];
  for (const age of AGES) {
    if (age.id <= p.unlockedAge || !isAgeUnlocked(p, age.id)) continue;
    const units = age.starterUnits.filter((id) => !p.units[id]);
    const generals = (age.starterGenerals ?? []).filter((id) => !p.generals[id]);
    for (const id of units) addUnitCard(p, id);
    for (const id of generals) addGeneral(p, id);
    const coins = Math.max(ECONOMY.ageBonusMin, firstPacksCost(age.id) - p.coins);
    p.coins += coins;
    p.unlockedAge = age.id;
    granted.push({ age: age.id, coins, units, generals });
  }
  return granted;
}

/** Main-path stars an age needs before its Legendary troop is granted. */
export function legendaryRoadStars(age: Age): number {
  return Math.ceil(age.battles.length * 3 * ECONOMY.legendaryRoad);
}

/**
 * The guaranteed road to each age's Legendary troop (GAME_DESIGN 8): one card once the
 * main path holds 70% of its stars. Returns the troops granted now.
 */
export function grantLegendaryRoad(p: Profile): string[] {
  const out: string[] = [];
  for (const age of AGES) {
    if (!age.legendary || p.legendaryGranted.includes(age.id) || !isAgeUnlocked(p, age.id)) {
      continue;
    }
    if (mainStars(p, age.id) < legendaryRoadStars(age)) continue;
    p.legendaryGranted.push(age.id);
    addUnitCard(p, age.legendary);
    out.push(age.legendary);
  }
  return out;
}

/** Grants a battle's first-win troops and generals (an optional battle's reward). */
export function grantFirstWinUnlocks(
  p: Profile,
  b: CampaignBattle,
): { units: string[]; generals: string[] } {
  const units = b.firstWinUnlocks?.units ?? [];
  const generals = b.firstWinUnlocks?.generals ?? [];
  // A reward is guaranteed (prompt 06): a troop already owned still adds its card.
  for (const id of units) addUnitCard(p, id);
  for (const id of generals) addGeneral(p, id);
  return { units: [...units], generals: [...generals] };
}
