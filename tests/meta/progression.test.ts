import { describe, expect, it } from 'vitest';
import { AGES, BATTLE_BY_ID, CAMPAIGN } from '../../src/content/campaign/battles';
import type { CampaignBattle } from '../../src/content/campaign/types';
import { addTroop, armyPower, armyProblems, fixedArmyFor, startingArmy } from '../../src/meta/army';
import { nextBattle } from '../../src/meta/campaign';
import {
  addUnitCard,
  canUpgrade,
  ECONOMY,
  newProfile,
  upgradeCost,
  upgradeUnit,
  type Profile,
} from '../../src/meta/profile';
import { applyOutcome, type BattleOutcome } from '../../src/meta/rewards';

const win = (stars = 2): BattleOutcome => ({
  won: true,
  stars,
  lostFraction: 0.1,
  bonusMet: stars === 3,
  enemyBroken: 2,
  generalLost: false,
});

describe('upgrades', () => {
  it('follows the §5 table, with rarity multipliers on coins', () => {
    const common = [1, 2, 3, 4].map((l) => upgradeCost('bronzeAgeSpearmen', l));
    expect(common).toEqual([
      { cards: 1, coins: 15 },
      { cards: 2, coins: 40 },
      { cards: 4, coins: 100 },
      { cards: 8, coins: 250 },
    ]);
    expect(upgradeCost('hoplitePhalanx', 1)).toEqual({ cards: 1, coins: 23 }); // Rare ×1.5
    expect(upgradeCost('thebanSacredBand', 2)).toEqual({ cards: 2, coins: 80 }); // Epic ×2
    expect(upgradeCost('bronzeAgeSpearmen', 5)).toBeNull();
  });

  it('explains why an upgrade is not possible', () => {
    const p = newProfile();
    expect(canUpgrade(p, 'hoplitePhalanx')).toEqual({ ok: false, reason: 'notOwned' });
    expect(canUpgrade(p, 'bronzeAgeSpearmen')).toMatchObject({
      ok: false,
      reason: 'cards',
      missing: 1,
    });
    addUnitCard(p, 'bronzeAgeSpearmen');
    p.coins = 5;
    expect(canUpgrade(p, 'bronzeAgeSpearmen')).toMatchObject({
      ok: false,
      reason: 'coins',
      missing: 10,
    });
    expect(upgradeUnit(p, 'bronzeAgeSpearmen')).toBe(false);
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 1, cards: 1 });
  });

  it('spends cards and coins, one level at a time', () => {
    const p = newProfile();
    addUnitCard(p, 'bronzeAgeSpearmen', 3);
    expect(upgradeUnit(p, 'bronzeAgeSpearmen')).toBe(true);
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 2, cards: 2 });
    expect(p.coins).toBe(ECONOMY.startingCoins - 15);
    expect(upgradeUnit(p, 'bronzeAgeSpearmen')).toBe(true);
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 3, cards: 0 });
    expect(p.coins).toBe(ECONOMY.startingCoins - 15 - 40);
  });

  it('stops at level 5 and turns leftover and later cards into coins', () => {
    const p = newProfile();
    p.coins = 10000;
    addUnitCard(p, 'bronzeAgeSpearmen', 1 + 2 + 4 + 8 + 3);
    for (let i = 0; i < 6; i++) upgradeUnit(p, 'bronzeAgeSpearmen');
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 5, cards: 0 });
    expect(p.coins).toBe(10000 - (15 + 40 + 100 + 250) + 3 * ECONOMY.maxLevelCardCoins);
    expect(canUpgrade(p, 'bronzeAgeSpearmen')).toEqual({ ok: false, reason: 'maxLevel' });
    expect(addUnitCard(p, 'bronzeAgeSpearmen', 2)).toEqual({ isNew: false, spare: 0, coins: 10 });
    expect(p.units.bronzeAgeSpearmen!.level).toBe(5);
  });
});

describe('battle reward cards', () => {
  it('2 cards for a first win, 1 for a replay, none for a loss', () => {
    const p = newProfile();
    const b = BATTLE_BY_ID.megiddo!;
    expect(applyOutcome(p, b, { ...win(), won: false, stars: 0 }, null, { seed: 4 }).cards).toEqual(
      [],
    );
    expect(applyOutcome(p, b, win(), null, { seed: 4 }).cards).toHaveLength(2);
    expect(applyOutcome(p, b, win(), null, { seed: 5 }).cards).toHaveLength(1);
  });

  it('the same battle seed gives the same cards', () => {
    const draw = (seed: number) =>
      applyOutcome(newProfile(), BATTLE_BY_ID.megiddo!, win(), null, { seed }).cards.map(
        (c) => c.id,
      );
    expect(draw(42)).toEqual(draw(42));
    const all = new Set(Array.from({ length: 30 }, (_, s) => draw(s).join()));
    expect(all.size).toBeGreaterThan(1);
  });

  it('mostly gives cards for troops the player owns', () => {
    let owned = 0;
    let total = 0;
    for (let seed = 0; seed < 300; seed++) {
      const p = newProfile();
      applyOutcome(p, BATTLE_BY_ID.megiddo!, win(), null, { seed });
      const before = newProfile();
      before.units.bronzeAgeArchers = { level: 1, cards: 0 };
      before.units.bronzeAgeArchers = { level: 1, cards: 0 };
      for (const [id, u] of Object.entries(p.units)) {
        if (before.units[id]) {
          owned += u.cards;
        }
        total += u.cards + (before.units[id] ? 0 : 1);
      }
    }
    expect(owned / total).toBeGreaterThan(0.6);
  });
});

describe('army builder rules', () => {
  const kadesh = BATTLE_BY_ID.kadesh!;
  const withChariots = (): Profile => {
    const p = newProfile();
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(), null, { seed: 1 });
    return p;
  };

  it('allows 4 of the same Common: slots are the only limit, points are ignored', () => {
    const p = withChariots();
    const army = { units: [], general: { id: 'bronzeAgeCaptain', rank: 1 } };
    for (let i = 0; i < kadesh.maxUnits; i++) {
      expect(addTroop(p, kadesh, army, 'bronzeAgeChariots')).toBe(true);
    }
    expect(addTroop(p, kadesh, army, 'bronzeAgeChariots')).toBe(false);
    expect(armyProblems(p, kadesh, army)).toEqual([]);
  });

  it('every slot must be filled', () => {
    const p = withChariots();
    const army = { units: [{ type: 'bronzeAgeSpearmen' }] };
    expect(armyProblems(p, kadesh, army)).toEqual([{ code: 'slots', filled: 1, slots: 4 }]);
  });

  it('rejects unowned troops, unknown and resting generals', () => {
    const p = withChariots();
    p.generals.bronzeAgeCaptain!.resting = true;
    const units = [
      { type: 'hoplitePhalanx' },
      { type: 'bronzeAgeSpearmen' },
      { type: 'bronzeAgeSpearmen' },
      { type: 'bronzeAgeArchers' },
    ];
    const codes = (id: string) =>
      armyProblems(p, kadesh, { units, general: { id, rank: 1 } }).map((x) => x.code);
    expect(codes('bronzeAgeCaptain')).toEqual(['notOwned', 'generalResting']);
    expect(codes('hannibal')).toEqual(['notOwned', 'generalNotOwned']);
  });

  it('Megiddo: the fixed composition uses the player’s own levels and the Bronze Age Captain', () => {
    const p = newProfile();
    p.units.bronzeAgeChariots!.level = 3;
    const b = BATTLE_BY_ID.megiddo!;
    const army = fixedArmyFor(p, b)!;
    expect(army.units).toEqual([
      { type: 'bronzeAgeSpearmen', level: 1 },
      { type: 'bronzeAgeChariots', level: 3 },
      { type: 'bronzeAgeChariots', level: 3 },
    ]);
    expect(army.general?.id).toBe('bronzeAgeCaptain');
    expect(armyProblems(p, b, army)).toEqual([]);
    expect(addTroop(p, b, army, 'bronzeAgeSpearmen')).toBe(false);
  });

  it('the starting army fills every slot with owned troops and an available general', () => {
    const p = withChariots();
    for (const b of CAMPAIGN) {
      if (b.fixedArmy) continue;
      expect(armyProblems(p, b, startingArmy(p, b))).toEqual([]);
    }
  });

  it('army power is cost scaled by level', () => {
    expect(armyPower([{ type: 'bronzeAgeSpearmen' }])).toBeGreaterThan(0);
    expect(armyPower([{ type: 'bronzeAgeSpearmen', level: 3 }])).toBeGreaterThan(
      armyPower([{ type: 'bronzeAgeSpearmen', level: 1 }]),
    );
  });

  it('no Age gives the starter chariots again', () => {
    expect(AGES.slice(1).some((a) => a.starterUnits.includes('bronzeAgeChariots'))).toBe(false);
  });
});

describe('progression pace (GAME_DESIGN 5: upgrade loop)', () => {
  /**
   * A player who has just opened Antiquity, wins every battle in order (replaying the last
   * one when the age runs out) and upgrades the age's Commons whenever it can. Returns the
   * Antiquity battle count at which one of them first reached Lv2 and Lv3.
   */
  function pace(seed: number): { lv2: number; lv3: number } {
    const p = newProfile(seed);
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(2), null, { seed });
    applyOutcome(p, BATTLE_BY_ID.kadesh!, win(2), null, { seed: seed + 1 });
    const commons = AGES[1]!.starterUnits;
    let lv2 = Infinity;
    let lv3 = Infinity;
    for (let n = 1; n <= 12; n++) {
      const b: CampaignBattle = nextBattle(p) ?? BATTLE_BY_ID.hydaspes!;
      const army = startingArmy(p, b);
      applyOutcome(p, b, win(2), army.general?.id ?? null, {
        seed: seed * 100 + n,
        fielded: army.units.map((u) => u.type),
      });
      let again = true;
      while (again) {
        again = false;
        for (const id of commons) again = upgradeUnit(p, id) || again;
      }
      const best = Math.max(...commons.map((id) => p.units[id]!.level));
      if (best >= 2) lv2 = Math.min(lv2, n);
      if (best >= 3) lv3 = Math.min(lv3, n);
    }
    return { lv2, lv3 };
  }

  it('an Antiquity Common reaches Lv2 in about 2 battles and Lv3 in about 6', () => {
    const runs = Array.from({ length: 60 }, (_, s) => pace(s + 1));
    const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!;
    expect(median(runs.map((r) => r.lv2))).toBeLessThanOrEqual(2);
    expect(median(runs.map((r) => r.lv3))).toBeLessThanOrEqual(6);
    expect(median(runs.map((r) => r.lv3))).toBeGreaterThanOrEqual(2);
  });
});
