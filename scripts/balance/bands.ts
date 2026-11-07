import { AGE_BY_ID, BATTLE_BY_ID, battleIndex } from '../../src/content/campaign/battles';
import type { CampaignBattle } from '../../src/content/campaign/types';

/**
 * Target win rate with the expected collection (GAME_DESIGN 7.6). Tutorials: Megiddo is
 * almost impossible to lose, Kadesh about 95%. In an age: battle 1 about 90% (after the
 * first packs), battles 2–4 75–90%, the last 3 battles 35–50%, the middle 60–75%.
 * Optional battles: 10–20 points harder than the main battle they branch from.
 */
export function targetBand(b: CampaignBattle): [number, number] {
  if (b.age === 0) return b.id === 'megiddo' ? [0.95, 1] : [0.85, 1];
  if (b.branchesFrom) {
    const [lo, hi] = targetBand(BATTLE_BY_ID[b.branchesFrom]!);
    return [Math.max(0, lo - 0.2), Math.max(0, hi - 0.1)];
  }
  const n = AGE_BY_ID[b.age]?.battles.length ?? 1;
  const i = battleIndex(b);
  if (i === 0) return [0.8, 1];
  if (i >= n - 3) return [0.35, 0.5];
  if (i <= 3) return [0.75, 0.9];
  return [0.6, 0.75];
}
