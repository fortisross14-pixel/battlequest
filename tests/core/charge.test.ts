import { describe, expect, it } from 'vitest';
import { computeDamage, isEngaged, isRejection, previewCombat, RULES } from '../../src/core';
import { battle, E, rejected, run, unit, W } from './helpers';

/** Review 1 WP5: the Charge tag (momentum) and chariot hit-and-run. */
describe('Charge tag: momentum', () => {
  const setup = (gap: number) =>
    battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 6 - gap - 1, 3, E],
        ['d', 'red', 'heavySwordsmen', 6, 3, W],
        ['far', 'red', 'spearmen', 11, 7, W],
      ],
    });

  it('a charge with a run-up of 2+ squares hits harder at impact', () => {
    const long = setup(3);
    const calc = computeDamage(long, unit(long, 'k'), unit(long, 'd'), 'charge', { runUp: 3 });
    expect(calc.situational).toContainEqual({
      label: 'Full gallop',
      value: RULES.combat.chargeMomentum,
    });
    const short = computeDamage(long, unit(long, 'k'), unit(long, 'd'), 'charge', { runUp: 1 });
    expect(short.situational.map((m) => m.label)).not.toContain('Full gallop');
  });

  it('a spear wall to the front stops the gallop (spears still beat a frontal charge)', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['sp', 'red', 'spearmen', 6, 3, W],
        ['far', 'red', 'spearmen', 11, 7, W],
      ],
    });
    const front = computeDamage(s, unit(s, 'k'), unit(s, 'sp'), 'charge', { runUp: 3 });
    expect(front.situational.map((m) => m.label)).not.toContain('Full gallop');
  });

  it('only units with the Charge tag get it, and the preview shows it', () => {
    const s = battle({
      units: [
        ['i', 'blue', 'heavySwordsmen', 2, 3, E],
        ['d', 'red', 'spearmen', 5, 3, W],
        ['far', 'red', 'spearmen', 11, 7, W],
      ],
    });
    const calc = computeDamage(s, unit(s, 'i'), unit(s, 'd'), 'charge', { runUp: 2 });
    expect(calc.situational.map((m) => m.label)).not.toContain('Full gallop');
    const p = previewCombat(setup(3), { type: 'Charge', unitId: 'k', targetId: 'd' });
    if (isRejection(p)) throw new Error(p.message);
    expect(p.defender.modifiers.map((m) => m.label)).toContain('Full gallop');
  });
});

describe('HitAndRun: chariots break off after impact', () => {
  const setup = (seed = 3) =>
    battle({
      seed,
      units: [
        ['c', 'blue', 'chariots', 2, 3, E],
        ['d', 'red', 'heavySwordsmen', 5, 3, W],
        ['far', 'red', 'spearmen', 11, 7, W],
      ],
    });

  it('falls back one square along its path and is not left in melee', () => {
    const { state, events } = run(setup(), { type: 'Charge', unitId: 'c', targetId: 'd' });
    const c = unit(state, 'c');
    if (unit(state, 'd').status === 'active' && unit(state, 'd').cohesion < 3) {
      expect(isEngaged(state, 'c')).toBe(false);
      expect(c.x).toBe(3);
      expect(events).toContainEqual(
        expect.objectContaining({ type: 'UnitMoved', unitId: 'c', kind: 'breakOff' }),
      );
    }
  });

  it('the preview counts no melee round for a chariot charge', () => {
    const p = previewCombat(setup(), { type: 'Charge', unitId: 'c', targetId: 'd' });
    if (isRejection(p)) throw new Error(p.message);
    expect(p.defender.meleeLoss).toBe(0);
    expect(p.attacker.meleeLoss).toBe(0);
  });

  it('stays in melee if there is no room to fall back', () => {
    const s = battle({
      units: [
        ['c', 'blue', 'chariots', 4, 3, E],
        ['blk', 'blue', 'spearmen', 3, 3, E],
        ['d', 'red', 'heavySwordsmen', 5, 3, W],
        ['far', 'red', 'spearmen', 11, 7, W],
      ],
    });
    const { state } = run(s, { type: 'Charge', unitId: 'c', targetId: 'd' });
    if (unit(state, 'd').status === 'active' && unit(state, 'd').cohesion < 3) {
      expect(unit(state, 'c').x).toBe(4);
    }
  });
});

describe('Companion Charge (Alexander)', () => {
  const setup = () => {
    const s = structuredClone(
      battle({
        seed: 5,
        units: [
          ['c', 'blue', 'chariots', 2, 3, E],
          ['lc', 'blue', 'lightCavalry', 2, 4, E],
          ['d', 'red', 'heavySwordsmen', 5, 3, W],
          ['d2', 'red', 'archers', 6, 6, W],
          ['far', 'red', 'spearmen', 11, 7, W],
        ],
      }),
    );
    s.sides.blue.general = {
      generalId: 'alexander',
      name: 'Alexander',
      unitId: 'c',
      commandRadius: 3,
      rallyBonus: 0,
      lost: false,
      skills: [
        {
          id: 'companionCharge',
          name: 'Companion Charge',
          effect: { kind: 'chargeAgain', mpFraction: 0.5 },
          cooldown: 4,
          readyTurn: 1,
        },
      ],
    };
    return s;
  };

  it('after charging, the general’s unit and adjacent cavalry may charge again', () => {
    let s = run(setup(), { type: 'Charge', unitId: 'c', targetId: 'd' }).state;
    s = run(s, { type: 'Move', unitId: 'lc', to: { x: 3, y: 4 } }).state;
    expect(unit(s, 'c').hasActed).toBe(true);
    s = run(s, { type: 'UseSkill', unitId: 'c', skillId: 'companionCharge' }).state;
    const c = unit(s, 'c');
    if (!isEngaged(s, 'c')) {
      expect(c.hasActed).toBe(false);
      expect(c.mpLeft).toBeGreaterThanOrEqual(c.type.stats.mp * 0.5);
    }
    // The skill has a cooldown: it can't be used twice in a turn.
    expect(rejected(s, { type: 'UseSkill', unitId: 'c', skillId: 'companionCharge' })).toBe(
      'SKILL_COOLDOWN',
    );
  });
});
