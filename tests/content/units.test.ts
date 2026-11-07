import { describe, expect, it } from 'vitest';
import {
  cardPower,
  ERA_UNITS,
  eraUnitType,
  guardType,
  LADDER_POWER,
  ladder,
} from '../../src/content/eraUnits';
import { GENERALS, generalPackAge, isGeneric } from '../../src/content/generals';
import { ARCHETYPES } from '../../src/content/units';

describe('era units', () => {
  it('have unique ids', () => {
    expect(new Set(ERA_UNITS.map((u) => u.id)).size).toBe(ERA_UNITS.length);
  });

  it.each(ERA_UNITS)('$id stays within ±1 on at most two stats and one extra tag', (def) => {
    const mods = Object.entries(def.mods ?? {});
    expect(mods.length).toBeLessThanOrEqual(2);
    for (const [, v] of mods) expect(Math.abs(v)).toBe(1);
    const t = eraUnitType(def.id);
    expect(t.tags.length - ARCHETYPES[def.archetype].tags.length).toBeLessThanOrEqual(1);
    expect(def.history.length).toBeGreaterThan(20);
  });

  it.each(ERA_UNITS)('$id derives its stats from archetype, modifiers and power tier', (def) => {
    const base = ARCHETYPES[def.archetype];
    const t = eraUnitType(def.id);
    const power = cardPower(def);
    const raw = (k: keyof typeof base.stats) => base.stats[k] + (def.mods?.[k] ?? 0);
    for (const k of ['melee', 'impact', 'ranged', 'armor'] as const) {
      expect(t.stats[k]).toBeCloseTo(raw(k) * power);
    }
    expect(t.stats.morale).toBeCloseTo(
      raw('morale') * LADDER_POWER.rarity[def.rarity] ** LADDER_POWER.moraleExponent,
    );
    expect(t.stats.mp).toBe(raw('mp'));
    expect(t.stats.range).toBe(raw('range'));
    expect(t.stats.cost).toBe(Math.round(base.stats.cost * power));
  });

  it('levels add 5% to melee, impact, ranged and morale', () => {
    const l1 = eraUnitType('hoplitePhalanx', 1).stats;
    const l3 = eraUnitType('hoplitePhalanx', 3).stats;
    expect(l3.melee / l1.melee).toBeCloseTo(1.1);
    expect(l3.morale / l1.morale).toBeCloseTo(1.1);
    expect(l3.armor).toBe(l1.armor);
  });

  it('power tiers follow GAME_DESIGN 5.1: Rare +20%, Epic +45%, Legendary +75%', () => {
    const r = LADDER_POWER.rarity;
    expect(r.rare).toBeCloseTo(1.2);
    expect(r.epic).toBeCloseTo(1.45);
    expect(r.legendary).toBeCloseTo(1.75);
    // A later age's Commons roughly match an earlier age's Epics.
    const nextCommon = cardPower({ rarity: 'common', age: 1 });
    const epic = cardPower({ rarity: 'epic', age: 0 });
    expect(Math.abs(nextCommon / epic - 1)).toBeLessThan(0.1);
    // The general's guard grows with the general's age the same way.
    expect(guardType(2).stats.melee).toBeCloseTo(ARCHETYPES.generalGuard.stats.melee * 1.96);
  });

  it.each([1, 2])(
    'Age %i has the §5.1 ladder: 4–5 Commons, 3–4 Rares, 2 Epics, 1 Legendary',
    (age) => {
      const l = ladder(age);
      const count = (r: string) => l.filter((u) => u.rarity === r).length;
      expect(count('common')).toBeGreaterThanOrEqual(4);
      expect(count('common')).toBeLessThanOrEqual(5);
      expect(count('rare')).toBeGreaterThanOrEqual(3);
      expect(count('rare')).toBeLessThanOrEqual(4);
      expect(count('epic')).toBe(2);
      expect(count('legendary')).toBe(1);
    },
  );

  it('Age 0 is the tutorial mini ladder: 3 Bronze Age Commons', () => {
    expect(ladder(0).map((u) => [u.id, u.rarity])).toEqual([
      ['bronzeAgeSpearmen', 'common'],
      ['bronzeAgeArchers', 'common'],
      ['bronzeAgeChariots', 'common'],
    ]);
  });

  it('the prompt 06 ladder fixes are in: Companions and Legio X are the Legendaries', () => {
    expect(ladder(1).find((u) => u.rarity === 'legendary')?.id).toBe('companionCavalry');
    expect(ladder(2).find((u) => u.rarity === 'legendary')?.id).toBe('legioX');
    expect(ERA_UNITS.find((u) => u.id === 'indianElephants')?.rarity).toBe('epic');
    expect(ERA_UNITS.find((u) => u.id === 'classicalElephants')?.rarity).toBe('epic');
    expect(ERA_UNITS.find((u) => u.id === 'romanAuxiliaries')?.rarity).toBe('rare');
    // Each Legendary has a signature ability (an extra tag).
    for (const u of ERA_UNITS.filter((x) => x.rarity === 'legendary')) {
      expect(u.extraTag).toBeDefined();
    }
  });
});

describe('generals', () => {
  it('have unique ids', () => {
    expect(new Set(GENERALS.map((g) => g.id)).size).toBe(GENERALS.length);
  });

  it.each(GENERALS)('$id is complete', (g) => {
    expect(g.name).toBeTruthy();
    expect(g.pennant).toMatch(/^[A-Z ]+$/);
    expect(g.bio.length).toBeGreaterThan(20);
    expect(g.traits.length).toBeGreaterThan(0);
    for (const s of g.skills) {
      expect(s.cooldown[0]).toBeGreaterThanOrEqual(s.cooldown[1]);
      expect(s.cooldown[1]).toBeGreaterThanOrEqual(1);
    }
  });

  it.each([1, 2])(
    'Age %i has 2 generic generals and 5–9 named playable ones (prompt 06 sets)',
    (age) => {
      const own = GENERALS.filter((g) => g.age === age && g.playable && isGeneric(g));
      expect(own.map((g) => g.rarity).sort()).toEqual(['common', 'uncommon']);
      const named = GENERALS.filter(
        (g) => g.playable && !isGeneric(g) && generalPackAge(g) === age,
      );
      expect(named.length).toBeGreaterThanOrEqual(5);
      // Antiquity's 7 plus Thutmose III and Ramesses II from Age 0.
      expect(named.length).toBeLessThanOrEqual(9);
      expect(named.filter((g) => g.rarity === 'legendary').length).toBeGreaterThanOrEqual(1);
      expect(named.filter((g) => g.rarity === 'legendary').length).toBeLessThanOrEqual(2);
    },
  );

  it('Age 0 named generals are enemy and briefing figures there, and in the Antiquity pack', () => {
    const thutmose = GENERALS.find((g) => g.id === 'thutmoseIII')!;
    const ramesses = GENERALS.find((g) => g.id === 'ramessesII')!;
    expect([thutmose.rarity, generalPackAge(thutmose)]).toEqual(['rare', 1]);
    expect([ramesses.rarity, generalPackAge(ramesses)]).toEqual(['epic', 1]);
    expect(
      GENERALS.filter((g) => g.age === 0 && g.playable && isGeneric(g)).map((g) => g.id),
    ).toEqual(['bronzeAgeCaptain']);
  });

  it('extra commanders from the briefs are enemy-only', () => {
    for (const id of ['xerxes', 'dariusIII', 'porus', 'agisII', 'crassus', 'shapurI']) {
      expect(GENERALS.find((g) => g.id === id)?.playable).toBe(false);
    }
  });
});
