import { describe, expect, it } from 'vitest';
import { AGES, BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { ERA_UNIT_BY_ID } from '../../src/content/eraUnits';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { isBattleUnlocked } from '../../src/meta/campaign';
import { newProfile } from '../../src/meta/profile';
import { applyOutcome, type BattleOutcome } from '../../src/meta/rewards';

/** Ages 1–2 from the history briefs (prompt 06 Phase C; GAME_DESIGN 7.3). */

const win = (stars: number): BattleOutcome => ({
  won: true,
  stars,
  lostFraction: 0.1,
  bonusMet: stars === 3,
  enemyBroken: 2,
  generalLost: false,
});

describe('Antiquity and Classical Empires', () => {
  it('have the brief rosters: 10 + 7 and 12 + 6 battles', () => {
    expect([AGES[1]!.battles.length, AGES[1]!.optional?.length]).toEqual([10, 7]);
    expect([AGES[2]!.battles.length, AGES[2]!.optional?.length]).toEqual([12, 6]);
    expect(AGES[2]!.status).toBe('playable');
  });

  for (const age of [AGES[1]!, AGES[2]!]) {
    it.each(age.optional ?? [])(`${age.name}: optional %s branches from a main battle`, (id) => {
      const b = BATTLE_BY_ID[id]!;
      expect(b.age).toBe(age.id);
      expect(age.battles).toContain(b.branchesFrom);
      // Optional battles pay a specific reward (GAME_DESIGN 7.3) that a player can own.
      const reward = [...(b.firstWinUnlocks?.units ?? []), ...(b.firstWinUnlocks?.generals ?? [])];
      expect(reward).toHaveLength(1);
      for (const u of b.firstWinUnlocks?.units ?? []) {
        expect(ERA_UNIT_BY_ID[u]?.enemyOnly, u).toBeUndefined();
      }
      for (const g of b.firstWinUnlocks?.generals ?? [])
        expect(GENERAL_BY_ID[g]?.playable).toBe(true);
    });

    it(`${age.name}: main battles pay no fixed cards (they come from packs)`, () => {
      for (const id of age.battles) expect(BATTLE_BY_ID[id]!.firstWinUnlocks).toBeUndefined();
    });
  }

  it('an optional battle opens when its main battle is won, and its reward is guaranteed', () => {
    const p = newProfile();
    p.battles.megiddo = { stars: 3, wins: 1, plays: 1 };
    p.battles.kadesh = { stars: 3, wins: 1, plays: 1 };
    applyOutcome(p, BATTLE_BY_ID.kadesh!, win(3), null);
    const delium = BATTLE_BY_ID.delium!;
    expect(isBattleUnlocked(p, delium)).toBe(false);
    p.battles[delium.branchesFrom!] = { stars: 2, wins: 1, plays: 1 };
    expect(isBattleUnlocked(p, delium)).toBe(true);
    const r = applyOutcome(p, delium, win(2), null);
    expect(r.unlocks.generals).toEqual(['pagondas']);
    expect(p.generals.pagondas).toBeDefined();
  });

  it('later battles in an age field stronger enemies than its first', () => {
    for (const age of [AGES[1]!, AGES[2]!]) {
      const power = (id: string) => BATTLE_BY_ID[id]!.enemy.reduce((s, e) => s + (e.level ?? 1), 0);
      expect(power(age.battles.at(-1)!)).toBeGreaterThan(power(age.battles[0]!));
    }
  });
});
