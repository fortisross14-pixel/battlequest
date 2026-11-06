import { AGES, CAMPAIGN, battlesOfAge, finalBattleOfAge } from '../content/campaign/battles';
import type { CampaignBattle } from '../content/campaign/types';
import { addGeneral, addUnitCard, type Profile } from './profile';

/** A battle is open if its age is unlocked and the previous battle of that age is won. */
export function isBattleUnlocked(p: Profile, b: CampaignBattle): boolean {
  if (b.age > p.unlockedAge) return false;
  const list = battlesOfAge(b.age);
  const idx = list.findIndex((x) => x.id === b.id);
  if (idx <= 0) return true;
  return (p.battles[list[idx - 1]!.id]?.wins ?? 0) > 0;
}

/** The next battle the player has not won yet, if any. */
export function nextBattle(p: Profile): CampaignBattle | undefined {
  return CAMPAIGN.find((b) => isBattleUnlocked(p, b) && !(p.battles[b.id]?.wins ?? 0));
}

/** Winning an age's final battle unlocks the next age and its free starter units. */
export function unlockAfterWin(p: Profile, b: CampaignBattle): number | null {
  if (finalBattleOfAge(b.age)?.id !== b.id) return null;
  const next = AGES.find((a) => a.id === b.age + 1);
  if (!next || p.unlockedAge >= next.id) return null;
  p.unlockedAge = next.id;
  for (const id of next.starterUnits) if (!p.units[id]) addUnitCard(p, id);
  return next.id;
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
