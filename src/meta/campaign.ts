import {
  AGES,
  AGE_BY_ID,
  BATTLE_BY_ID,
  battleIndex,
  battlesOfAge,
} from '../content/campaign/battles';
import type { Age, CampaignBattle } from '../content/campaign/types';
import { addGeneral, addUnitCard, type Profile } from './profile';

/**
 * Campaign progress (GAME_DESIGN 7.3): battles open by stars earned in their age, and an
 * age opens once every battle of the previous age has been won. Pure functions.
 */

/** Stars earned in an age (best result per battle). */
export function ageStars(p: Profile, ageId: number): number {
  return (AGE_BY_ID[ageId]?.battles ?? []).reduce((s, id) => s + (p.battles[id]?.stars ?? 0), 0);
}

export interface AgeProgress {
  won: number;
  total: number;
  stars: number;
  maxStars: number;
}

export function ageProgress(p: Profile, ageId: number): AgeProgress {
  const age = AGE_BY_ID[ageId];
  const ids = age?.status === 'playable' ? age.battles : (age?.planned ?? []).map((b) => b.name);
  const total = ids.length;
  const won = (age?.battles ?? []).filter((id) => (p.battles[id]?.wins ?? 0) > 0).length;
  return { won, total, stars: ageStars(p, ageId), maxStars: total * 3 };
}

/** Every battle of the age has been won at least once. */
export function ageComplete(p: Profile, ageId: number): boolean {
  const age = AGE_BY_ID[ageId];
  return (
    !!age && age.battles.length > 0 && age.battles.every((id) => (p.battles[id]?.wins ?? 0) > 0)
  );
}

/** Age 0 is always open; the next opens when every battle of the previous one is won. */
export function isAgeUnlocked(p: Profile, ageId: number): boolean {
  const age = AGE_BY_ID[ageId];
  if (!age || age.status !== 'playable') return false;
  if (ageId === 0) return true;
  return isAgeUnlocked(p, ageId - 1) && ageComplete(p, ageId - 1);
}

/** Stars the age needs before battle `index` (0-based) opens. */
export function starsNeeded(age: Age, index: number): number {
  return age.starThresholds[index] ?? age.starThresholds.at(-1) ?? 0;
}

/** The first two battles of an open age are always open; the rest need the age's stars. */
export function isBattleUnlocked(p: Profile, b: CampaignBattle): boolean {
  if (!isAgeUnlocked(p, b.age)) return false;
  const age = AGE_BY_ID[b.age]!;
  return ageStars(p, b.age) >= starsNeeded(age, battleIndex(b));
}

/** How many more stars a locked battle needs (0 if open or if its age is locked). */
export function starsMissing(p: Profile, b: CampaignBattle): number {
  const age = AGE_BY_ID[b.age];
  if (!age) return 0;
  return Math.max(0, starsNeeded(age, battleIndex(b)) - ageStars(p, b.age));
}

/** The next battle to play: the first open battle not yet won, oldest age first. */
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
    for (const id of age.battles) {
      const b = BATTLE_BY_ID[id];
      if (b && isBattleUnlocked(after, b) && !isBattleUnlocked(before, b)) battles.push(id);
    }
  }
  return { battles, ages };
}

/**
 * Grants the starter troops of every open age the player hasn't had yet, and records the
 * newest such age in `unlockedAge`. Returns the ages it just granted.
 */
export function syncAgeUnlocks(p: Profile): number[] {
  const granted: number[] = [];
  for (const age of AGES) {
    if (age.id <= p.unlockedAge || !isAgeUnlocked(p, age.id)) continue;
    for (const id of age.starterUnits) if (!p.units[id]) addUnitCard(p, id);
    p.unlockedAge = age.id;
    granted.push(age.id);
  }
  return granted;
}

/** Grants a battle's first-win troops and generals that the player doesn't have yet. */
export function grantFirstWinUnlocks(
  p: Profile,
  b: CampaignBattle,
): { units: string[]; generals: string[] } {
  const units = (b.firstWinUnlocks?.units ?? []).filter((id) => !p.units[id]);
  const generals = (b.firstWinUnlocks?.generals ?? []).filter((id) => !p.generals[id]);
  for (const id of units) addUnitCard(p, id);
  for (const id of generals) addGeneral(p, id);
  return { units, generals };
}
