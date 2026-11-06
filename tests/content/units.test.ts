import { describe, expect, it } from 'vitest';
import { COST_PER_AGE, ERA_UNITS, eraUnitType } from '../../src/content/eraUnits';
import { GENERALS } from '../../src/content/generals';
import { ARCHETYPES } from '../../src/content/units';

describe('era units', () => {
  it('have unique ids', () => {
    expect(new Set(ERA_UNITS.map((u) => u.id)).size).toBe(ERA_UNITS.length);
  });

  it.each(ERA_UNITS)('$id stays within ±1 on at most two stats and one extra tag', (def) => {
    const mods = Object.entries(def.mods ?? {});
    expect(mods.length).toBeLessThanOrEqual(2);
    for (const [, v] of mods) expect(Math.abs(v)).toBe(1);
    const base = ARCHETYPES[def.archetype];
    const t = eraUnitType(def.id);
    for (const k of Object.keys(base.stats) as (keyof typeof base.stats)[]) {
      const expected =
        k === 'cost'
          ? base.stats.cost + COST_PER_AGE * def.age
          : base.stats[k] + (def.mods?.[k] ?? 0);
      expect(t.stats[k]).toBeCloseTo(expected);
    }
    expect(t.tags.length - base.tags.length).toBeLessThanOrEqual(1);
  });

  it('levels add 5% to melee, impact, ranged and morale', () => {
    const l1 = eraUnitType('hoplites', 1).stats;
    const l3 = eraUnitType('hoplites', 3).stats;
    expect(l3.melee / l1.melee).toBeCloseTo(1.1);
    expect(l3.morale / l1.morale).toBeCloseTo(1.1);
    expect(l3.armor).toBe(l1.armor);
  });
});

describe('generals', () => {
  it.each(GENERALS)('$id is complete', (g) => {
    expect(g.name).toBeTruthy();
    expect(g.pennant).toMatch(/^[A-Z ]+$/);
    expect(g.traits.length).toBeGreaterThan(0);
    for (const s of g.skills) {
      expect(s.cooldown[0]).toBeGreaterThanOrEqual(s.cooldown[1]);
      expect(s.cooldown[1]).toBeGreaterThanOrEqual(1);
    }
  });

  it('a Legendary general is in packs, and enemy-only generals are not', () => {
    expect(GENERALS.some((g) => g.rarity === 'legendary' && g.inPacks)).toBe(true);
    expect(GENERALS.filter((g) => !g.inPacks).length).toBeGreaterThan(0);
  });
});
