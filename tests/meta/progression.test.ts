import { describe, expect, it } from 'vitest';
import { AGES, BATTLE_BY_ID, CAMPAIGN } from '../../src/content/campaign/battles';
import type { CampaignBattle } from '../../src/content/campaign/types';
import { addTroop, armyPower, armyProblems, fixedArmyFor, startingArmy } from '../../src/meta/army';
import { nextBattle } from '../../src/meta/campaign';
import {
  addUnitCard,
  canUpgrade,
  ECONOMY,
  migrateProfile,
  newProfile,
  upgradeCost,
  upgradeUnit,
  type Profile,
} from '../../src/meta/profile';
import { applyOutcome, type BattleOutcome } from '../../src/meta/rewards';
import { MemorySaveStore } from '../../src/meta/saveStore';

const win = (stars = 2): BattleOutcome => ({
  won: true,
  stars,
  lostFraction: 0.1,
  bonusMet: stars === 3,
  enemyBroken: 2,
  generalLost: false,
});

const V1_SAVE = {
  version: 1,
  coins: 410,
  units: {
    egyptianSpearmen: { level: 2, dupes: 1 },
    egyptianArchers: { level: 1, dupes: 0 },
    egyptianChariots: { level: 1, dupes: 0 },
    hittiteSpearmen: { level: 3, dupes: 2 },
  },
  generals: { captain: { xp: 240, resting: false } },
  battles: { megiddo: { stars: 3, wins: 1, plays: 2 } },
  unlockedAge: 1,
  generalPity: 2,
  rng: 777,
  dailyBought: '2026-11-05',
  lastArmy: {},
};

describe('profile migration v1 → v2', () => {
  it('keeps levels, turns duplicates into spare cards and keeps the rest', () => {
    const p = migrateProfile(structuredClone(V1_SAVE))!;
    expect(p.version).toBe(3);
    expect(p.units.egyptianSpearmen).toEqual({ level: 2, cards: 1 });
    expect(p.units.hittiteSpearmen).toEqual({ level: 3, cards: 2 });
    expect(p.coins).toBe(410);
    expect(p.generals.captain).toEqual({ xp: 240, resting: false });
    expect(p.battles.megiddo).toEqual({ stars: 3, wins: 1, plays: 2 });
    expect(p.rng).toBe(777);
    // Only Megiddo is won: Antiquity (Age 1) isn't open under the v3 rules yet.
    expect(p.unlockedAge).toBe(0);
  });

  it('gives old saves the new starting general and what their won battles now unlock', () => {
    const p = migrateProfile(structuredClone(V1_SAVE))!;
    expect(p.generals.centurion).toBeDefined();
    expect(p.generals.thutmose).toBeDefined();
    expect(p.units.egyptianArchers).toBeDefined();
  });

  it('survives a round trip through the save store', () => {
    const s = new MemorySaveStore();
    s.saveRaw(JSON.stringify(V1_SAVE));
    const p = s.load()!;
    expect(p.units.egyptianSpearmen).toEqual({ level: 2, cards: 1 });
    s.save(p);
    expect(s.load()).toEqual(p);
  });

  it('rejects things that are not a profile', () => {
    expect(migrateProfile(null)).toBeNull();
    expect(migrateProfile({ version: 99 })).toBeNull();
    expect(migrateProfile('hello')).toBeNull();
  });
});

describe('upgrades', () => {
  it('follows the §5 table, with rarity multipliers on coins', () => {
    const common = [1, 2, 3, 4].map((l) => upgradeCost('egyptianSpearmen', l));
    expect(common).toEqual([
      { cards: 1, coins: 15 },
      { cards: 2, coins: 40 },
      { cards: 4, coins: 100 },
      { cards: 8, coins: 250 },
    ]);
    expect(upgradeCost('egyptianChariots', 1)).toEqual({ cards: 1, coins: 23 }); // Rare ×1.5
    expect(upgradeCost('hittiteChariots', 2)).toEqual({ cards: 2, coins: 80 }); // Epic ×2
    expect(upgradeCost('egyptianSpearmen', 5)).toBeNull();
  });

  it('explains why an upgrade is not possible', () => {
    const p = newProfile();
    expect(canUpgrade(p, 'hoplites')).toEqual({ ok: false, reason: 'notOwned' });
    expect(canUpgrade(p, 'egyptianSpearmen')).toMatchObject({
      ok: false,
      reason: 'cards',
      missing: 1,
    });
    addUnitCard(p, 'egyptianSpearmen');
    p.coins = 5;
    expect(canUpgrade(p, 'egyptianSpearmen')).toMatchObject({
      ok: false,
      reason: 'coins',
      missing: 10,
    });
    expect(upgradeUnit(p, 'egyptianSpearmen')).toBe(false);
    expect(p.units.egyptianSpearmen).toEqual({ level: 1, cards: 1 });
  });

  it('spends cards and coins, one level at a time', () => {
    const p = newProfile();
    addUnitCard(p, 'egyptianSpearmen', 3);
    expect(upgradeUnit(p, 'egyptianSpearmen')).toBe(true);
    expect(p.units.egyptianSpearmen).toEqual({ level: 2, cards: 2 });
    expect(p.coins).toBe(300 - 15);
    expect(upgradeUnit(p, 'egyptianSpearmen')).toBe(true);
    expect(p.units.egyptianSpearmen).toEqual({ level: 3, cards: 0 });
    expect(p.coins).toBe(300 - 15 - 40);
  });

  it('stops at level 5 and turns leftover and later cards into coins', () => {
    const p = newProfile();
    p.coins = 10000;
    addUnitCard(p, 'egyptianSpearmen', 1 + 2 + 4 + 8 + 3);
    for (let i = 0; i < 6; i++) upgradeUnit(p, 'egyptianSpearmen');
    expect(p.units.egyptianSpearmen).toEqual({ level: 5, cards: 0 });
    expect(p.coins).toBe(10000 - (15 + 40 + 100 + 250) + 3 * ECONOMY.maxLevelCardCoins);
    expect(canUpgrade(p, 'egyptianSpearmen')).toEqual({ ok: false, reason: 'maxLevel' });
    expect(addUnitCard(p, 'egyptianSpearmen', 2)).toEqual({ isNew: false, spare: 0, coins: 10 });
    expect(p.units.egyptianSpearmen!.level).toBe(5);
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
      before.units.egyptianArchers = { level: 1, cards: 0 };
      before.units.hittiteSpearmen = { level: 1, cards: 0 };
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

  it('allows 3 of the same unit: slots are the only limit, points are ignored', () => {
    const p = withChariots();
    const army = { units: [], general: { id: 'captain', rank: 1 } };
    for (let i = 0; i < 3; i++) expect(addTroop(p, kadesh, army, 'egyptianChariots')).toBe(true);
    expect(addTroop(p, kadesh, army, 'egyptianChariots')).toBe(false);
    expect(armyProblems(p, kadesh, army)).toEqual([]);
  });

  it('every slot must be filled', () => {
    const p = withChariots();
    const army = { units: [{ type: 'egyptianSpearmen' }] };
    expect(armyProblems(p, kadesh, army)).toEqual([{ code: 'slots', filled: 1, slots: 3 }]);
  });

  it('rejects unowned troops, unknown and resting generals', () => {
    const p = withChariots();
    p.generals.captain!.resting = true;
    const units = [
      { type: 'hoplites' },
      { type: 'egyptianSpearmen' },
      { type: 'egyptianSpearmen' },
    ];
    const codes = (id: string) =>
      armyProblems(p, kadesh, { units, general: { id, rank: 1 } }).map((x) => x.code);
    expect(codes('captain')).toEqual(['notOwned', 'generalResting']);
    expect(codes('hannibal')).toEqual(['notOwned', 'generalNotOwned']);
  });

  it('Megiddo: the fixed composition uses the player’s own levels and Thutmose for this battle', () => {
    const p = newProfile();
    p.units.egyptianChariots!.level = 3;
    const b = BATTLE_BY_ID.megiddo!;
    const army = fixedArmyFor(p, b)!;
    expect(army.units).toEqual([
      { type: 'egyptianSpearmen', level: 1 },
      { type: 'egyptianChariots', level: 3 },
    ]);
    expect(army.general?.id).toBe('thutmose');
    expect(armyProblems(p, b, army)).toEqual([]);
    expect(addTroop(p, b, army, 'egyptianSpearmen')).toBe(false);
  });

  it('the starting army fills every slot with owned troops and an available general', () => {
    const p = withChariots();
    for (const b of CAMPAIGN) {
      if (b.fixedArmy) continue;
      expect(armyProblems(p, b, startingArmy(p, b))).toEqual([]);
    }
  });

  it('army power is cost scaled by level', () => {
    expect(armyPower([{ type: 'egyptianSpearmen' }])).toBeGreaterThan(0);
    expect(armyPower([{ type: 'egyptianSpearmen', level: 3 }])).toBeGreaterThan(
      armyPower([{ type: 'egyptianSpearmen', level: 1 }]),
    );
  });

  it('no Age gives the starter chariots again', () => {
    expect(AGES.slice(1).some((a) => a.starterUnits.includes('egyptianChariots'))).toBe(false);
  });
});

describe('progression pace (GAME_DESIGN 5: upgrade loop)', () => {
  /**
   * A player who wins every battle in order, replays the last one when the campaign runs
   * out, and upgrades whatever they can after each battle. Returns the battle count at
   * which a starter troop first reached Lv2 and Lv3.
   */
  function pace(seed: number): { lv2: number; lv3: number } {
    const p = newProfile(seed);
    const starters = AGES[0]!.starterUnits;
    let lv2 = Infinity;
    let lv3 = Infinity;
    for (let n = 1; n <= 12; n++) {
      const b: CampaignBattle = nextBattle(p) ?? CAMPAIGN.at(-1)!;
      const army = startingArmy(p, b);
      applyOutcome(p, b, win(2), army.general?.id ?? null, {
        seed: seed * 100 + n,
        fielded: army.units.map((u) => u.type),
      });
      let again = true;
      while (again) {
        again = false;
        for (const id of starters) again = upgradeUnit(p, id) || again;
      }
      const best = Math.max(...starters.map((id) => p.units[id]!.level));
      if (best >= 2) lv2 = Math.min(lv2, n);
      if (best >= 3) lv3 = Math.min(lv3, n);
    }
    return { lv2, lv3 };
  }

  it('a starter troop reaches Lv2 in about 2 battles and Lv3 in about 6', () => {
    const runs = Array.from({ length: 60 }, (_, s) => pace(s + 1));
    const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!;
    expect(median(runs.map((r) => r.lv2))).toBeLessThanOrEqual(2);
    expect(median(runs.map((r) => r.lv3))).toBeLessThanOrEqual(6);
    expect(median(runs.map((r) => r.lv3))).toBeGreaterThanOrEqual(3);
  });
});
