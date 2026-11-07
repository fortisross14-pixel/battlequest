import { describe, expect, it } from 'vitest';
import {
  computeDamage,
  destroyUnit,
  previewCombat,
  routUnit,
  RULES,
  type GameEvent,
} from '../../src/core';
import { unitType } from '../../src/content/units';
import { battle, E, unit, W } from './helpers';

/** Prompt 04 phase D: elephants (Hydaspes) and scythed chariots (Gaugamela). */
const labels = (mods: { label: string }[]) => mods.map((m) => m.label);
const C = RULES.combat;

describe('ScaresHorses', () => {
  const setup = () =>
    battle({
      units: [
        ['cav', 'blue', 'heavyCavalry', 4, 3, E],
        ['inf', 'blue', 'heavySwordsmen', 4, 4, E],
        ['ele', 'red', 'warElephants', 5, 3, W],
        ['ele2', 'red', 'warElephants', 5, 4, W],
      ],
    });

  it('horses fight elephants badly, at impact and in melee', () => {
    const s = setup();
    for (const role of ['charge', 'melee'] as const) {
      const d = computeDamage(s, unit(s, 'cav'), unit(s, 'ele'), role);
      expect(d.situational).toContainEqual({
        label: 'Horses fear elephants',
        value: C.scaresHorses.horseVsElephant,
      });
    }
  });

  it('elephants hit horses harder; foot troops are not affected either way', () => {
    const s = setup();
    const e = computeDamage(s, unit(s, 'ele'), unit(s, 'cav'), 'melee');
    expect(e.situational).toContainEqual({
      label: 'Elephants vs horses',
      value: C.scaresHorses.elephantVsHorse,
    });
    expect(
      labels(computeDamage(s, unit(s, 'inf'), unit(s, 'ele2'), 'melee').situational),
    ).not.toContain('Horses fear elephants');
    expect(
      labels(computeDamage(s, unit(s, 'ele2'), unit(s, 'inf'), 'melee').situational),
    ).not.toContain('Elephants vs horses');
  });

  it('the charge preview shows it (it reuses the real combat functions)', () => {
    const s = battle({
      units: [
        ['cav', 'blue', 'heavyCavalry', 2, 3, E],
        ['ele', 'red', 'warElephants', 5, 3, W],
      ],
    });
    const p = previewCombat(s, { type: 'Charge', unitId: 'cav', targetId: 'ele' });
    expect(JSON.stringify(p)).toContain('Horses fear elephants');
  });
});

describe('Stampede', () => {
  const setup = () =>
    battle({
      units: [
        ['ele', 'red', 'warElephants', 6, 3, W],
        ['friend', 'red', 'spearmen', 6, 4, W],
        ['far', 'red', 'spearmen', 9, 7, W],
        ['foe', 'blue', 'spearmen', 5, 3, E],
      ],
    });

  it('a routing elephant tramples adjacent friends, not enemies or friends further away', () => {
    const s = structuredClone(setup());
    const events: GameEvent[] = [];
    routUnit(s, unit(s, 'ele'), 'cohesion', events);
    expect(unit(s, 'friend').strength).toBe(100 - C.stampedeDamage);
    expect(unit(s, 'far').strength).toBe(100);
    expect(unit(s, 'foe').strength).toBe(100);
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'DamageDealt',
        kind: 'stampede',
        attackerId: 'ele',
        targetId: 'friend',
        amount: C.stampedeDamage,
      }),
    );
  });

  it('an elephant unit destroyed while fighting stampedes too', () => {
    const s = structuredClone(setup());
    const events: GameEvent[] = [];
    destroyUnit(s, unit(s, 'ele'), 'strength', events);
    expect(unit(s, 'friend').strength).toBe(100 - C.stampedeDamage);
  });

  it('a friend already broken by the chain is not trampled again', () => {
    const s = structuredClone(
      battle({
        units: [
          ['ele', 'red', 'warElephants', 6, 3, W],
          ['a', 'red', 'spearmen', 6, 4, W],
          ['b', 'red', 'spearmen', 7, 4, W],
          ['foe', 'blue', 'spearmen', 2, 3, E],
        ],
      }),
    );
    // Weak enough that the stampede routs both.
    unit(s, 'a').strength = 20;
    unit(s, 'b').strength = 20;
    const events: GameEvent[] = [];
    routUnit(s, unit(s, 'ele'), 'cohesion', events);
    const hits = events.filter((e) => e.type === 'DamageDealt' && e.kind === 'stampede');
    expect(hits.every((e) => e.type === 'DamageDealt' && e.amount > 0)).toBe(true);
    expect(new Set(hits.map((e) => e.type === 'DamageDealt' && e.targetId)).size).toBe(hits.length);
  });

  it('units without the tag do not stampede', () => {
    const s = structuredClone(
      battle({
        units: [
          ['sp', 'red', 'spearmen', 6, 3, W],
          ['friend', 'red', 'spearmen', 6, 4, W],
          ['foe', 'blue', 'spearmen', 2, 3, E],
        ],
      }),
    );
    const events: GameEvent[] = [];
    routUnit(s, unit(s, 'sp'), 'cohesion', events);
    expect(unit(s, 'friend').strength).toBe(100);
    expect(events.some((e) => e.type === 'DamageDealt' && e.kind === 'stampede')).toBe(false);
  });
});

describe('Scythed chariots', () => {
  const scythed = {
    ...unitType('chariots'),
    tags: [...unitType('chariots').tags, 'Scythed' as const],
  };
  const setup = () =>
    battle({
      units: [
        ['sc', 'red', 'chariots', 6, 3, W, { type: scythed }],
        ['plain', 'red', 'chariots', 6, 5, W],
        ['inf', 'blue', 'heavySwordsmen', 3, 3, E],
        ['cav', 'blue', 'heavyCavalry', 3, 5, E],
      ],
    });

  it('hit foot troops harder at impact', () => {
    const s = setup();
    const d = computeDamage(s, unit(s, 'sc'), unit(s, 'inf'), 'charge');
    expect(d.situational).toContainEqual({ label: 'Scythed wheels', value: C.scythed });
  });

  it('not elephants', () => {
    const s = battle({
      units: [
        ['sc', 'red', 'chariots', 6, 3, W, { type: scythed }],
        ['ele', 'blue', 'warElephants', 3, 3, E],
      ],
    });
    expect(
      labels(computeDamage(s, unit(s, 'sc'), unit(s, 'ele'), 'charge').situational),
    ).not.toContain('Scythed wheels');
  });

  it('not horsemen, not in melee, and not without the tag', () => {
    const s = setup();
    expect(
      labels(computeDamage(s, unit(s, 'sc'), unit(s, 'cav'), 'charge').situational),
    ).not.toContain('Scythed wheels');
    expect(
      labels(computeDamage(s, unit(s, 'sc'), unit(s, 'inf'), 'melee').situational),
    ).not.toContain('Scythed wheels');
    expect(
      labels(computeDamage(s, unit(s, 'plain'), unit(s, 'inf'), 'charge').situational),
    ).not.toContain('Scythed wheels');
  });
});
