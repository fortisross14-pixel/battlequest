import { describe, expect, it } from 'vitest';
import { AGES } from '../../src/content/campaign/battles';
import { ERA_UNIT_BY_ID } from '../../src/content/eraUnits';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { ageStars, isAgeUnlocked } from '../../src/meta/campaign';
import { LEGACY_GENERALS, LEGACY_UNITS, migrateProfile } from '../../src/meta/profile';
import { MemorySaveStore } from '../../src/meta/saveStore';

/** Save migrations (save-systems skill): every older profile loads, keeping what it earned. */

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

/** A v3 save from the end of prompt 04: deep into Antiquity with its one-off troops. */
const V3 = {
  version: 3,
  coins: 1310,
  units: {
    egyptianSpearmen: { level: 3, cards: 1 },
    egyptianChariots: { level: 2, cards: 0 },
    egyptianArchers: { level: 1, cards: 2 },
    hittiteChariots: { level: 4, cards: 3 },
    hoplites: { level: 2, cards: 4 },
    peltasts: { level: 1, cards: 1 },
    cretanArchers: { level: 2, cards: 0 },
    sparabara: { level: 3, cards: 1 },
    companions: { level: 1, cards: 0 },
  },
  generals: {
    captain: { xp: 300, resting: true },
    centurion: { xp: 120, resting: false },
    thutmose: { xp: 900, resting: false },
    leonidas: { xp: 50, resting: false },
    joan: { xp: 10, resting: false },
  },
  battles: {
    megiddo: { stars: 3, wins: 2, plays: 2 },
    kadesh: { stars: 2, wins: 1, plays: 1 },
    qarqar: { stars: 2, wins: 1, plays: 1 },
    granicus: { stars: 1, wins: 1, plays: 4 },
  },
  unlockedAge: 1,
  generalPity: 3,
  rng: 99,
  dailyBought: null,
  lastArmy: {
    qarqar: {
      units: [{ type: 'hoplites', level: 2 }, { type: 'peltasts' }, { type: 'indianArchers' }],
      general: { id: 'captain', rank: 2 },
    },
  },
};

describe('the legacy maps', () => {
  it('send every removed troop and general to a real ladder card', () => {
    for (const id of Object.values(LEGACY_UNITS)) {
      expect(ERA_UNIT_BY_ID[id]?.enemyOnly, id).toBeUndefined();
    }
    for (const id of Object.values(LEGACY_GENERALS)) expect(GENERAL_BY_ID[id]?.playable).toBe(true);
    expect(LEGACY_UNITS.egyptianSpearmen).toBe('bronzeAgeSpearmen');
  });
});

describe('profile migration v1 → v4', () => {
  it('keeps levels and turns duplicates into spare cards, merging troops that share a card', () => {
    const p = migrateProfile(structuredClone(V1_SAVE))!;
    expect(p.version).toBe(4);
    // Egyptian spearmen (Lv2, 1 spare) and Hittite spearmen (Lv3, 2 spares) are both Bronze
    // Age spearmen now: the higher level, every spare, and one card for the extra type.
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 3, cards: 1 + 2 + 1 });
    expect(p.units.bronzeAgeArchers).toEqual({ level: 1, cards: 0 });
    expect(p.coins).toBe(410);
    expect(p.generals.bronzeAgeCaptain).toEqual({ xp: 240, resting: false });
    expect(p.battles.megiddo).toEqual({ stars: 3, wins: 1, plays: 2 });
    expect(p.rng).toBe(777);
    // Only Megiddo is won: Antiquity isn't open yet.
    expect(p.unlockedAge).toBe(0);
    expect(Object.keys(p.units).every((id) => ERA_UNIT_BY_ID[id])).toBe(true);
  });

  it('survives a round trip through the save store', () => {
    const s = new MemorySaveStore();
    s.saveRaw(JSON.stringify(V1_SAVE));
    const p = s.load()!;
    expect(p.units.bronzeAgeSpearmen!.level).toBe(3);
    s.save(p);
    expect(s.load()).toEqual(p);
  });

  it('rejects things that are not a profile', () => {
    expect(migrateProfile(null)).toBeNull();
    expect(migrateProfile({ version: 99 })).toBeNull();
    expect(migrateProfile('hello')).toBeNull();
  });
});

describe('profile migration v2 → v4', () => {
  it('keeps every battle record and star', () => {
    const p = migrateProfile(structuredClone(V2))!;
    expect(p.battles).toEqual(V2.battles);
    expect(ageStars(p, 0)).toBe(5);
    expect(ageStars(p, 1)).toBe(1);
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 2, cards: 1 });
  });

  it('opens Antiquity for a player who won both Age 0 battles, with its new Commons', () => {
    const p = migrateProfile(structuredClone(V2))!;
    expect(isAgeUnlocked(p, 1)).toBe(true);
    expect(p.unlockedAge).toBe(1);
    for (const id of AGES[1]!.starterUnits) expect(p.units[id]).toBeDefined();
    expect(p.generals.antiquityScout).toBeDefined();
    // The Centurion became the Antiquity Captain.
    expect(p.generals.antiquityCaptain).toBeDefined();
  });

  it('a v2 player who only won Megiddo stays in Age 0', () => {
    const p = migrateProfile({ ...structuredClone(V2), battles: { megiddo: V2.battles.megiddo } })!;
    expect(isAgeUnlocked(p, 1)).toBe(false);
    expect(p.unlockedAge).toBe(0);
  });
});

describe('profile migration v3 → v4 (the card ladders)', () => {
  const p = migrateProfile(structuredClone(V3))!;

  it('maps each removed troop to its closest ladder card, keeping level and spare cards', () => {
    expect(p.units.hoplitePhalanx).toEqual({ level: 2, cards: 4 });
    expect(p.units.companionCavalry).toEqual({ level: 1, cards: 0 });
    // Cretan archers (Lv2) and sparabara (Lv3, 1 spare) are both Persian shield archers.
    expect(p.units.persianShieldArchers).toEqual({ level: 3, cards: 0 + 1 + 1 });
    // Egyptian (Lv2) and Hittite chariots (Lv4, 3 spares) merge into Bronze Age chariots.
    expect(p.units.bronzeAgeChariots).toEqual({ level: 4, cards: 0 + 3 + 1 });
    expect(p.units.bronzeAgeSpearmen).toEqual({ level: 3, cards: 1 });
    // Peltasts became Antiquity skirmishers, which Antiquity also grants: kept, not doubled.
    expect(p.units.antiquitySkirmishers).toEqual({ level: 1, cards: 1 });
    expect(Object.keys(p.units).every((id) => ERA_UNIT_BY_ID[id])).toBe(true);
  });

  it('maps removed generals and keeps their XP; a resting general is fresh again', () => {
    expect(p.generals.bronzeAgeCaptain).toEqual({ xp: 300, resting: false });
    expect(p.generals.antiquityCaptain).toEqual({ xp: 120, resting: false });
    expect(p.generals.thutmoseIII).toEqual({ xp: 900, resting: false });
    expect(p.generals.leonidas).toEqual({ xp: 50, resting: false });
    expect(p.generals.ramessesII).toEqual({ xp: 10, resting: false });
    expect(Object.keys(p.generals).every((id) => GENERAL_BY_ID[id]?.playable)).toBe(true);
  });

  it('keeps battles, coins and pack history, and grants the open ages again', () => {
    expect(p.battles).toEqual(V3.battles);
    expect(p.unlockedAge).toBe(1);
    expect(p.generals.antiquityScout).toBeDefined();
    // The age-unlock bonus is paid once more on top of the saved coins.
    expect(p.coins).toBeGreaterThan(V3.coins);
    expect(p.generalPity).toBe(3);
    expect(p.packsBought).toEqual({});
    expect(p.legendaryGranted).toEqual([]);
  });

  it('remaps the last armies, dropping troops that no longer exist for the player', () => {
    expect(p.lastArmy.qarqar).toEqual({
      units: [
        { type: 'hoplitePhalanx', level: 2 },
        { type: 'antiquitySkirmishers' },
        { type: 'antiquityArchers' },
      ],
      general: { id: 'bronzeAgeCaptain', rank: 2 },
    });
  });
});
