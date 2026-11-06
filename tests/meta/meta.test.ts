import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { buildScenario } from '../../src/content/campaign/build';
import { ERA_UNIT_BY_ID } from '../../src/content/eraUnits';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { BattleSession, startBattle } from '../../src/core';
import { isBattleUnlocked, nextBattle } from '../../src/meta/campaign';
import { addGeneral, addUnitCard, newProfile, rankForXp, xpForRank } from '../../src/meta/profile';
import { applyOutcome, evaluate, REWARDS, type BattleOutcome } from '../../src/meta/rewards';
import { MemorySaveStore } from '../../src/meta/saveStore';
import { buyDaily, buyPack, dailyOffer, SHOP } from '../../src/meta/shop';

const win = (stars: number, extra: Partial<BattleOutcome> = {}): BattleOutcome => ({
  won: true,
  stars,
  lostFraction: 0.1,
  bonusMet: stars === 3,
  enemyBroken: 2,
  generalLost: false,
  ...extra,
});

describe('profile', () => {
  it('starts with the two Megiddo troops, the Captain and the Centurion, and 300 coins', () => {
    const p = newProfile();
    expect(Object.keys(p.units).sort()).toEqual(['egyptianChariots', 'egyptianSpearmen']);
    expect(p.units.egyptianSpearmen).toEqual({ level: 1, cards: 0 });
    expect(Object.keys(p.generals).sort()).toEqual(['captain', 'centurion']);
    expect(p.coins).toBe(300);
    expect(p.unlockedAge).toBe(0);
    expect(p.version).toBe(3);
  });

  it('extra cards are kept as spares and never level a unit up', () => {
    const p = newProfile();
    for (let i = 0; i < 20; i++) addUnitCard(p, 'egyptianSpearmen');
    expect(p.units.egyptianSpearmen).toEqual({ level: 1, cards: 20 });
    expect(addUnitCard(p, 'egyptianArchers', 3)).toEqual({ isNew: true, spare: 2, coins: 0 });
    expect(p.units.egyptianArchers).toEqual({ level: 1, cards: 2 });
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
  it('winning both Age 0 battles opens Antiquity and grants its starter troops', () => {
    const p = newProfile();
    const megiddo = BATTLE_BY_ID.megiddo!;
    expect(nextBattle(p)?.id).toBe('megiddo');
    // Both tutorial battles are open from the start (battles 1 and 2 of an age).
    expect(isBattleUnlocked(p, BATTLE_BY_ID.kadesh!)).toBe(true);
    const r = applyOutcome(p, megiddo, win(3), 'thutmose');
    expect(r.unlockedAge).toBeNull();
    expect(r.unlocks).toEqual({ units: ['egyptianArchers'], generals: ['thutmose'] });
    expect(p.units.egyptianArchers).toBeDefined();
    expect(p.generals.thutmose).toBeDefined();
    expect(r.cards).toHaveLength(2);
    expect(isBattleUnlocked(p, BATTLE_BY_ID.qarqar!)).toBe(false);
    const r2 = applyOutcome(p, BATTLE_BY_ID.kadesh!, win(1), 'captain');
    expect(r2.unlockedAge).toBe(1);
    expect(p.units.hoplites).toBeDefined();
    expect(p.units.peltasts).toBeDefined();
    expect(nextBattle(p)?.id).toBe('qarqar');
  });

  it('pays coins per GAME_DESIGN 8: first win, replay at 30%, loss 20', () => {
    const p = newProfile();
    p.generals.captain!.xp = 0;
    const b = BATTLE_BY_ID.marathon!;
    const first = applyOutcome(p, b, win(2), 'captain');
    expect(first.coins).toBe(REWARDS.winBasePerAge * 1 + 2 * REWARDS.perStar);
    expect(first.firstWin).toBe(true);
    const replay = applyOutcome(p, b, win(3), 'captain');
    expect(replay.coins).toBe(Math.round((100 + 150) * 0.3));
    expect(replay.newStars).toBe(1);
    const loss = applyOutcome(p, b, { ...win(0), won: false }, 'captain');
    expect(loss.coins).toBe(20);
    expect(p.battles.marathon).toEqual({ stars: 3, wins: 2, plays: 3 });
  });

  it('gives general XP and rests a general who fell', () => {
    const p = newProfile();
    const r = applyOutcome(p, BATTLE_BY_ID.megiddo!, win(1, { generalLost: true }), 'captain');
    expect(r.xp).toBe(100 + 20 + 20);
    expect(p.generals.captain!.resting).toBe(true);
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(1), null);
    expect(p.generals.captain!.resting).toBe(false);
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

describe('shop', () => {
  it('packs cost coins and give cards from unlocked ages only, never enemy-only troops', () => {
    const p = newProfile(1);
    const cards = buyPack(p, 'recruit')!;
    expect(cards).toHaveLength(4);
    expect(SHOP.recruitPrice).toBe(120);
    for (const c of cards) expect(ERA_UNIT_BY_ID[c.id]!.enemyOnly).toBeUndefined();
    expect(p.coins).toBe(300 - SHOP.recruitPrice);
    for (const c of cards) expect(ERA_UNIT_BY_ID[c.id]!.age).toBeLessThanOrEqual(0);
    p.coins = 0;
    expect(buyPack(p, 'recruit')).toBeNull();
  });

  it('a Veteran Pack always has a Rare or better', () => {
    for (let seed = 0; seed < 30; seed++) {
      const p = newProfile(seed);
      p.unlockedAge = 2;
      p.coins = 1000;
      const cards = buyPack(p, 'veteran')!;
      expect(cards.some((c) => c.rarity !== 'common')).toBe(true);
    }
  });

  it('General Packs guarantee an Epic+ within 5 packs and only give pack generals', () => {
    const p = newProfile(7);
    p.coins = 100000;
    let since = 0;
    for (let i = 0; i < 40; i++) {
      const [c] = buyPack(p, 'general')!;
      expect(GENERAL_BY_ID[c!.id]!.inPacks).toBe(true);
      since = c!.rarity === 'epic' || c!.rarity === 'legendary' ? 0 : since + 1;
      expect(since).toBeLessThan(SHOP.generalPity);
    }
  });

  it('packs are reproducible from the profile seed', () => {
    const a = newProfile(99);
    const b = newProfile(99);
    expect(buyPack(a, 'recruit')).toEqual(buyPack(b, 'recruit'));
  });

  it('the daily offer is fixed for a day and can be bought once', () => {
    const p = newProfile();
    p.coins = 2000;
    const o = dailyOffer(p, '2026-11-06');
    expect(dailyOffer(p, '2026-11-06').unit.id).toBe(o.unit.id);
    const bought = buyDaily(p, '2026-11-06');
    expect(bought).toMatchObject({ kind: 'unit', id: o.unit.id, count: 3 });
    expect(buyDaily(p, '2026-11-06')).toBeNull();
    expect(dailyOffer(p, '2026-11-06').bought).toBe(true);
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
