import { describe, expect, it } from 'vitest';
import { AGES, BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { DEFAULT_STAR_THRESHOLDS } from '../../src/content/campaign/ages';
import {
  ageProgress,
  ageStars,
  isAgeUnlocked,
  isBattleUnlocked,
  newestUnlockedAge,
  newlyUnlocked,
  starsMissing,
} from '../../src/meta/campaign';
import { cloneProfile, migrateProfile, newProfile, type Profile } from '../../src/meta/profile';
import { applyOutcome, type BattleOutcome } from '../../src/meta/rewards';

/** GAME_DESIGN 7.3: star-gated battles, ages that open on all wins. */

const win = (stars: number): BattleOutcome => ({
  won: true,
  stars,
  lostFraction: 0.1,
  bonusMet: stars === 3,
  enemyBroken: 2,
  generalLost: false,
});

/** A profile that has won both Age 0 battles with one star each. */
function antiquityOpen(): Profile {
  const p = newProfile();
  applyOutcome(p, BATTLE_BY_ID.megiddo!, win(1), null, { seed: 1 });
  applyOutcome(p, BATTLE_BY_ID.kadesh!, win(1), null, { seed: 2 });
  return p;
}

describe('star thresholds', () => {
  it('use the §7.3 table by default', () => {
    expect(DEFAULT_STAR_THRESHOLDS).toEqual([0, 0, 1, 2, 4, 6, 8, 10, 14, 18, 22, 26]);
    for (const a of AGES) expect(a.starThresholds.slice(0, 2)).toEqual([0, 0]);
  });

  it('battles 1 and 2 of an open age are always open', () => {
    const p = newProfile();
    expect(isBattleUnlocked(p, BATTLE_BY_ID.megiddo!)).toBe(true);
    expect(isBattleUnlocked(p, BATTLE_BY_ID.kadesh!)).toBe(true);
    const q = antiquityOpen();
    expect(ageStars(q, 1)).toBe(0);
    expect(isBattleUnlocked(q, BATTLE_BY_ID.qarqar!)).toBe(true);
    expect(isBattleUnlocked(q, BATTLE_BY_ID.marathon!)).toBe(true);
    expect(isBattleUnlocked(q, BATTLE_BY_ID.thermopylae!)).toBe(false);
    expect(starsMissing(q, BATTLE_BY_ID.thermopylae!)).toBe(1);
  });

  it('replaying for more stars opens later battles', () => {
    const p = antiquityOpen();
    applyOutcome(p, BATTLE_BY_ID.qarqar!, win(1), null, { seed: 3 });
    expect(isBattleUnlocked(p, BATTLE_BY_ID.thermopylae!)).toBe(true); // needs 1
    expect(isBattleUnlocked(p, BATTLE_BY_ID.leuctra!)).toBe(false); // battle #4 needs 2
    // Replaying Qarqar for ★★ raises the age total to 2.
    applyOutcome(p, BATTLE_BY_ID.qarqar!, win(2), null, { seed: 4 });
    expect(ageStars(p, 1)).toBe(2);
    expect(isBattleUnlocked(p, BATTLE_BY_ID.leuctra!)).toBe(true);
    // A worse replay never lowers the best result.
    applyOutcome(p, BATTLE_BY_ID.qarqar!, win(1), null, { seed: 5 });
    expect(ageStars(p, 1)).toBe(2);
  });
});

describe('ages', () => {
  it('Age 0 is open from the start; nothing else is', () => {
    const p = newProfile();
    expect(isAgeUnlocked(p, 0)).toBe(true);
    for (let a = 1; a < AGES.length; a++) expect(isAgeUnlocked(p, a)).toBe(false);
    expect(newestUnlockedAge(p)).toBe(0);
  });

  it('the next age opens when every battle is won, even with one star each', () => {
    const p = newProfile();
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(3), null, { seed: 1 });
    expect(isAgeUnlocked(p, 1)).toBe(false);
    applyOutcome(p, BATTLE_BY_ID.kadesh!, win(1), null, { seed: 2 });
    expect(isAgeUnlocked(p, 1)).toBe(true);
    expect(newestUnlockedAge(p)).toBe(1);
  });

  it('a lost battle does not count as won', () => {
    const p = newProfile();
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(1), null, { seed: 1 });
    applyOutcome(p, BATTLE_BY_ID.kadesh!, { ...win(0), won: false }, null, { seed: 2 });
    expect(isAgeUnlocked(p, 1)).toBe(false);
  });

  it('ages in preparation never open', () => {
    const p = antiquityOpen();
    for (const id of AGES[1]!.battles) p.battles[id] = { stars: 3, wins: 1, plays: 1 };
    expect(isAgeUnlocked(p, 1)).toBe(true);
    expect(AGES[2]!.status).toBe('inPreparation');
    expect(isAgeUnlocked(p, 2)).toBe(false);
  });

  it('progress counts battles won and stars against the totals', () => {
    const p = newProfile();
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(2), null, { seed: 1 });
    expect(ageProgress(p, 0)).toEqual({ won: 1, total: 2, stars: 2, maxStars: 6 });
    // Ages in preparation show their planned battles in the totals.
    expect(ageProgress(p, 4).total).toBe(AGES[4]!.planned!.length);
  });
});

describe('newlyUnlocked', () => {
  it('lists the battles and ages a result just opened', () => {
    const p = newProfile();
    applyOutcome(p, BATTLE_BY_ID.megiddo!, win(1), null, { seed: 1 });
    const before = cloneProfile(p);
    applyOutcome(p, BATTLE_BY_ID.kadesh!, win(1), null, { seed: 2 });
    expect(newlyUnlocked(before, p)).toEqual({ ages: [1], battles: ['qarqar', 'marathon'] });
    expect(newlyUnlocked(p, p)).toEqual({ ages: [], battles: [] });
  });

  it('a replay that adds stars reports the battles it opened', () => {
    const p = antiquityOpen();
    const before = cloneProfile(p);
    applyOutcome(p, BATTLE_BY_ID.marathon!, win(2), null, { seed: 9 });
    expect(newlyUnlocked(before, p).battles).toEqual(['thermopylae', 'leuctra']);
  });
});

describe('profile v2 → v3', () => {
  const V2 = {
    version: 2,
    coins: 520,
    units: {
      egyptianSpearmen: { level: 2, cards: 1 },
      egyptianChariots: { level: 1, cards: 0 },
      egyptianArchers: { level: 1, cards: 2 },
    },
    generals: { captain: { xp: 300, resting: false }, centurion: { xp: 0, resting: false } },
    battles: {
      megiddo: { stars: 3, wins: 2, plays: 2 },
      kadesh: { stars: 2, wins: 1, plays: 1 },
      marathon: { stars: 1, wins: 1, plays: 3 },
    },
    unlockedAge: 2,
    generalPity: 1,
    rng: 42,
    dailyBought: null,
    lastArmy: {},
  };

  it('keeps every battle record and star, and moves battles into the new ages', () => {
    const p = migrateProfile(structuredClone(V2))!;
    expect(p.version).toBe(3);
    expect(p.battles).toEqual(V2.battles);
    expect(ageStars(p, 0)).toBe(5);
    expect(ageStars(p, 1)).toBe(1);
    expect(p.coins).toBe(520);
    expect(p.units.egyptianSpearmen).toEqual({ level: 2, cards: 1 });
  });

  it('opens Antiquity for a player who won both Age 0 battles and grants its starters', () => {
    const p = migrateProfile(structuredClone(V2))!;
    expect(isAgeUnlocked(p, 1)).toBe(true);
    expect(p.unlockedAge).toBe(1);
    expect(p.units.hoplites).toBeDefined();
    expect(p.units.peltasts).toBeDefined();
  });

  it('a v2 player who only won Megiddo stays in Age 0', () => {
    const p = migrateProfile({ ...structuredClone(V2), battles: { megiddo: V2.battles.megiddo } })!;
    expect(isAgeUnlocked(p, 1)).toBe(false);
    expect(p.unlockedAge).toBe(0);
  });
});
