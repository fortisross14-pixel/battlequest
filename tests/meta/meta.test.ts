import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { AGES, BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { buildScenario } from '../../src/content/campaign/build';
import { ERA_UNIT_BY_ID } from '../../src/content/eraUnits';
import { GENERAL_BY_ID, isGeneric } from '../../src/content/generals';
import { BattleSession, startBattle } from '../../src/core';
import {
  grantLegendaryRoad,
  isBattleUnlocked,
  legendaryRoadStars,
  nextBattle,
  syncAgeUnlocks,
} from '../../src/meta/campaign';
import { firstPacksCost, packPrice } from '../../src/meta/prices';
import {
  addGeneral,
  addUnitCard,
  ECONOMY,
  newProfile,
  rankForXp,
  xpForRank,
  type Profile,
} from '../../src/meta/profile';
import { applyOutcome, evaluate, REWARDS, type BattleOutcome } from '../../src/meta/rewards';
import { MemorySaveStore } from '../../src/meta/saveStore';
import { buyDaily, buyPack, dailyOffer, generalPool, SHOP, shopAges } from '../../src/meta/shop';

const win = (stars: number, extra: Partial<BattleOutcome> = {}): BattleOutcome => ({
  won: true,
  stars,
  lostFraction: 0.1,
  bonusMet: stars === 3,
  enemyBroken: 2,
  generalLost: false,
  ...extra,
});

/** A profile that has won both Age 0 battles (Antiquity open). */
function inAntiquity(seed = 1): Profile {
  const p = newProfile(seed);
  applyOutcome(p, BATTLE_BY_ID.megiddo!, win(3), 'bronzeAgeCaptain');
  applyOutcome(p, BATTLE_BY_ID.kadesh!, win(3), 'bronzeAgeCaptain');
  return p;
}

describe('profile', () => {
  it('starts with the two Megiddo troop types, the Bronze Age Captain and 100 coins', () => {
    const p = newProfile();
    expect(Object.keys(p.units).sort()).toEqual(['bronzeAgeChariots', 'bronzeAgeSpearmen']);
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 1, cards: 0 });
    expect(Object.keys(p.generals)).toEqual(['bronzeAgeCaptain']);
    expect(p.coins).toBe(ECONOMY.startingCoins);
    expect(p.unlockedAge).toBe(0);
    expect(p.version).toBe(4);
  });

  it('extra cards are kept as spares and never level a unit up', () => {
    const p = newProfile();
    for (let i = 0; i < 20; i++) addUnitCard(p, 'bronzeAgeSpearmen');
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 1, cards: 20 });
    expect(addUnitCard(p, 'bronzeAgeArchers', 3)).toEqual({ isNew: true, spare: 2, coins: 0 });
    expect(p.units.bronzeAgeArchers).toEqual({ level: 1, cards: 2 });
  });

  it('a duplicate general becomes a 500 XP medal', () => {
    const p = newProfile();
    expect(addGeneral(p, 'leonidas')).toEqual({ isNew: true, medalXp: 0 });
    expect(addGeneral(p, 'leonidas')).toEqual({ isNew: false, medalXp: 500 });
    expect(p.generals.leonidas!.xp).toBe(500);
  });

  it('rank follows XP thresholds', () => {
    expect([0, 99, 100, 299, 300, 600, 99999].map(rankForXp)).toEqual([1, 1, 2, 2, 3, 4, 10]);
    expect(xpForRank(5)).toBe(1000);
  });
});

describe('campaign progress and rewards', () => {
  it('winning both Age 0 battles opens Antiquity with its Commons, generic generals and coins', () => {
    const p = newProfile();
    expect(nextBattle(p)?.id).toBe('megiddo');
    // Both tutorial battles are open from the start (battles 1 and 2 of an age).
    expect(isBattleUnlocked(p, BATTLE_BY_ID.kadesh!)).toBe(true);
    const r = applyOutcome(p, BATTLE_BY_ID.megiddo!, win(3), 'bronzeAgeCaptain');
    expect(r.unlockedAge).toBeNull();
    // Megiddo grants a Bronze Age archers card for Kadesh (GAME_DESIGN 7.4).
    expect(r.unlocks).toEqual({ units: ['bronzeAgeArchers'], generals: [] });
    expect(r.cards).toHaveLength(2);
    expect(isBattleUnlocked(p, BATTLE_BY_ID.qarqar!)).toBe(false);
    const r2 = applyOutcome(p, BATTLE_BY_ID.kadesh!, win(1), 'bronzeAgeCaptain');
    expect(r2.unlockedAge).toBe(1);
    expect(r2.ageGrant?.units.sort()).toEqual(AGES[1]!.starterUnits.slice().sort());
    expect(r2.ageGrant?.generals).toEqual(['antiquityCaptain', 'antiquityScout']);
    expect(p.generals.antiquityScout).toBeDefined();
    // The age-unlock bonus covers the first packs: 2 Recruit Packs and 1 General Pack.
    expect(p.coins).toBeGreaterThanOrEqual(firstPacksCost(1));
    expect(r2.ageGrant!.coins).toBeGreaterThanOrEqual(ECONOMY.ageBonusMin);
    expect(nextBattle(p)?.id).toBe('qarqar');
  });

  it('pays coins per GAME_DESIGN 8: 100 × (age + 1) + 50 per star, replay at 30%, loss 20', () => {
    const p = inAntiquity();
    const b = BATTLE_BY_ID.marathon!;
    const first = applyOutcome(p, b, win(2), 'antiquityCaptain');
    expect(first.coins).toBe(REWARDS.winBasePerAge * 2 + 2 * REWARDS.perStar);
    expect(first.firstWin).toBe(true);
    const replay = applyOutcome(p, b, win(3), 'antiquityCaptain');
    expect(replay.coins).toBe(Math.round((200 + 150) * 0.3));
    expect(replay.newStars).toBe(1);
    const loss = applyOutcome(p, b, { ...win(0), won: false }, 'antiquityCaptain');
    expect(loss.coins).toBe(20);
    expect(p.battles.marathon).toEqual({ stars: 3, wins: 2, plays: 3 });
  });

  it('battle reward cards come from the battle’s age and never the Legendary', () => {
    for (let seed = 0; seed < 40; seed++) {
      const p = inAntiquity(seed);
      const r = applyOutcome(p, BATTLE_BY_ID.qarqar!, win(2), 'antiquityCaptain', { seed });
      for (const c of r.cards) {
        expect(ERA_UNIT_BY_ID[c.id]!.age).toBe(1);
        expect(c.rarity).not.toBe('legendary');
      }
    }
  });

  it('gives general XP and rests a general who fell', () => {
    const p = newProfile();
    const r = applyOutcome(
      p,
      BATTLE_BY_ID.megiddo!,
      win(1, { generalLost: true }),
      'bronzeAgeCaptain',
    );
    expect(r.xp).toBe(100 + 20 + 20);
    expect(p.generals.bronzeAgeCaptain!.resting).toBe(true);
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(1), null);
    expect(p.generals.bronzeAgeCaptain!.resting).toBe(false);
  });

  it('grants the age’s Legendary troop once 70% of its main-path stars are held', () => {
    const p = inAntiquity();
    const age = AGES[1]!;
    const need = legendaryRoadStars(age);
    expect(need).toBe(Math.ceil(age.battles.length * 3 * 0.7));
    let left = need - 1;
    for (const id of age.battles) {
      const s = Math.min(3, left);
      p.battles[id] = { stars: s, wins: 1, plays: 1 };
      left -= s;
    }
    expect(grantLegendaryRoad(p)).toEqual([]);
    const last = age.battles.find((id) => p.battles[id]!.stars < 3)!;
    p.battles[last]!.stars += 1;
    expect(grantLegendaryRoad(p)).toEqual([age.legendary]);
    expect(p.units[age.legendary!]).toBeDefined();
    // Only once.
    expect(grantLegendaryRoad(p)).toEqual([]);
  });

  it('evaluates stars from a real battle', () => {
    const b = BATTLE_BY_ID.megiddo!;
    const session = new BattleSession(startBattle(buildScenario(b, b.fixedArmy!, 3)));
    const ais = {
      blue: new AiPlayer('blue', { posture: 'aggressive' }),
      red: new AiPlayer('red', { posture: 'defensive' }),
    };
    for (let i = 0; i < 40 && !session.state.result; i++) {
      playAiSideTurn(
        ais[session.state.activeSide],
        (c) => session.apply(c),
        () => session.state,
      );
    }
    const o = evaluate(b, session.state);
    expect(o.won).toBe(session.state.result?.winner === 'blue');
    if (o.won) expect(o.stars).toBeGreaterThanOrEqual(1);
  });
});

describe('shop (GAME_DESIGN 8, 7.6)', () => {
  it('has no tab in Age 0, and one per open age after', () => {
    expect(shopAges(newProfile())).toEqual([]);
    expect(buyPack(newProfile(), 'recruit', 0)).toBeNull();
    expect(shopAges(inAntiquity())).toEqual([1]);
  });

  it('Recruit Packs draw only from the chosen age’s ladder, never enemy-only troops', () => {
    const p = inAntiquity(3);
    p.coins = 10000;
    for (let i = 0; i < 20; i++) {
      for (const c of buyPack(p, 'recruit', 1)!) {
        const def = ERA_UNIT_BY_ID[c.id]!;
        expect(def.age).toBe(1);
        expect(def.enemyOnly).toBeUndefined();
      }
    }
    expect(packPrice('recruit', 1)).toBe(120);
    expect(packPrice('general', 1)).toBe(250);
    // Later ages cost more, in step with their rewards.
    expect(packPrice('recruit', 2)).toBeGreaterThan(120);
  });

  it('the first Recruit Pack of an age always holds a Rare or better', () => {
    for (let seed = 0; seed < 40; seed++) {
      const p = inAntiquity(seed);
      const cards = buyPack(p, 'recruit', 1)!;
      expect(cards.some((c) => c.rarity !== 'common')).toBe(true);
    }
  });

  it('the first General Pack gives a named Rare or better; generic generals are never drawn', () => {
    for (let seed = 0; seed < 30; seed++) {
      const p = inAntiquity(seed);
      const [g] = buyPack(p, 'general', 1)!;
      const def = GENERAL_BY_ID[g!.id]!;
      expect(isGeneric(def)).toBe(false);
      expect(['rare', 'epic', 'legendary']).toContain(def.rarity);
    }
    expect(generalPool(1).map((g) => g.id)).toContain('thutmoseIII');
    expect(generalPool(1).map((g) => g.id)).toContain('ramessesII');
    expect(generalPool(1).every((g) => g.playable)).toBe(true);
  });

  it('a Veteran Pack always has a Rare or better', () => {
    for (let seed = 0; seed < 30; seed++) {
      const p = inAntiquity(seed);
      p.coins = 1000;
      const cards = buyPack(p, 'veteran', 1)!;
      expect(cards.some((c) => c.rarity !== 'common')).toBe(true);
    }
  });

  it('General Packs guarantee an Epic+ within 5 packs and only give playable generals', () => {
    const p = inAntiquity(7);
    p.coins = 100000;
    let since = 0;
    for (let i = 0; i < 40; i++) {
      const [c] = buyPack(p, 'general', 1)!;
      expect(GENERAL_BY_ID[c!.id]!.playable).toBe(true);
      since = c!.rarity === 'epic' || c!.rarity === 'legendary' ? 0 : since + 1;
      expect(since).toBeLessThan(SHOP.generalPity);
    }
  });

  it('packs are reproducible from the profile seed', () => {
    const a = inAntiquity(99);
    const b = inAntiquity(99);
    expect(buyPack(a, 'recruit', 1)).toEqual(buyPack(b, 'recruit', 1));
  });

  it('the daily offer is fixed for a day, never a Legendary, and can be bought once', () => {
    expect(dailyOffer(newProfile(), '2026-11-06')).toBeNull();
    const p = inAntiquity();
    p.coins = 2000;
    const o = dailyOffer(p, '2026-11-06')!;
    expect(o.unit.rarity).not.toBe('legendary');
    expect(dailyOffer(p, '2026-11-06')!.unit.id).toBe(o.unit.id);
    const bought = buyDaily(p, '2026-11-06');
    expect(bought).toMatchObject({ kind: 'unit', id: o.unit.id, count: 3 });
    expect(buyDaily(p, '2026-11-06')).toBeNull();
    expect(dailyOffer(p, '2026-11-06')!.bought).toBe(true);
  });

  it('the age-unlock bonus tops the purse up to the first packs, at least the minimum', () => {
    const rich = newProfile();
    rich.coins = 5000;
    rich.battles.megiddo = { stars: 3, wins: 1, plays: 1 };
    rich.battles.kadesh = { stars: 3, wins: 1, plays: 1 };
    const [grant] = syncAgeUnlocks(rich);
    expect(grant!.coins).toBe(ECONOMY.ageBonusMin);
    const poor = newProfile();
    poor.coins = 0;
    poor.battles.megiddo = { stars: 1, wins: 1, plays: 1 };
    poor.battles.kadesh = { stars: 1, wins: 1, plays: 1 };
    syncAgeUnlocks(poor);
    expect(poor.coins).toBe(firstPacksCost(1));
  });
});

describe('save store', () => {
  it('round-trips a profile', () => {
    const s = new MemorySaveStore();
    const p = newProfile();
    p.coins = 1234;
    s.save(p);
    expect(s.load()).toEqual(p);
    s.clear();
    expect(s.load()).toBeNull();
  });
});
