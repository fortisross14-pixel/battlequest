import { describe, expect, it } from 'vitest';
import {
  applyCommand,
  computeDamage,
  isRejection,
  previewCombat,
  reachableSquares,
  RULES,
  type BattleState,
} from '../../src/core';
import { battle, E, N, rejected, run, S, unit, W, withUnit } from './helpers';

/** Review 1, WP4: rule bugs and movement feel. */

const zoc = () =>
  battle({
    units: [
      ['b', 'blue', 'spearmen', 3, 2, E],
      ['sk', 'blue', 'skirmishers', 3, 5, E],
      ['r', 'red', 'spearmen', 5, 1, S],
      ['r2', 'red', 'spearmen', 11, 7],
    ],
  });

describe('pull back', () => {
  it('an Evade unit stepping straight back out of a zone of control keeps its MP', () => {
    const s = withUnit(withUnit(zoc(), 'b', { x: 1, y: 6 }), 'sk', {
      x: 4,
      y: 2,
      facing: E,
      turnStartFacing: E,
    });
    const after = run(s, { type: 'Move', unitId: 'sk', to: { x: 3, y: 2 } });
    const sk = unit(after.state, 'sk');
    expect(sk).toMatchObject({ x: 3, y: 2 });
    expect(sk.mpLeft).toBeGreaterThan(0);
    expect(after.events).toContainEqual(
      expect.objectContaining({ type: 'UnitMoved', kind: 'move' }),
    );
  });

  it('"straight back" is measured from the facing at the start of the turn', () => {
    let s = run(zoc(), { type: 'Move', unitId: 'b', to: { x: 4, y: 2 } }).state;
    s = run(s, { type: 'Rotate', unitId: 'b', facing: N }).state;
    // Turning north does not make south "backwards": that would slide out sideways.
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 4, y: 3 } })).toBe('IN_ZOC');
    const back = run(s, { type: 'Move', unitId: 'b', to: { x: 3, y: 2 } }).state;
    expect(unit(back, 'b')).toMatchObject({ x: 3, y: 2, mpLeft: 0 });
  });
});

describe('sidestep and backstep', () => {
  const solo = () =>
    battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 11, 7, W],
      ],
    });

  it('one square sideways or back keeps the facing for a few MP', () => {
    const cost = RULES.movement.sidestepCost;
    for (const to of [
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 2, y: 3 },
    ]) {
      const res = run(solo(), { type: 'Move', unitId: 'b', to });
      expect(unit(res.state, 'b')).toMatchObject({ ...to, facing: E });
      expect(unit(res.state, 'b').mpLeft).toBe(unit(solo(), 'b').type.stats.mp - cost);
      expect(res.events).toContainEqual(
        expect.objectContaining({ type: 'UnitMoved', kind: 'sidestep' }),
      );
    }
  });

  it('is offered as a reachable square', () => {
    const r = reachableSquares(solo(), unit(solo(), 'b'));
    expect(r).toContainEqual(
      expect.objectContaining({ pos: { x: 2, y: 3 }, kind: 'sidestep', facing: E }),
    );
  });

  it('is not allowed inside an enemy zone of control', () => {
    const s = run(zoc(), { type: 'Move', unitId: 'b', to: { x: 4, y: 2 } }).state;
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 4, y: 3 } })).toBe('IN_ZOC');
  });

  it('only as the first move of the turn', () => {
    const s = run(solo(), { type: 'Move', unitId: 'b', to: { x: 4, y: 3 } }).state;
    const res = applyCommand(s, { type: 'Move', unitId: 'b', to: { x: 4, y: 2 }, facing: E });
    expect(res.ok && res.events.some((e) => e.type === 'UnitMoved' && e.kind === 'sidestep')).toBe(
      false,
    );
  });
});

describe('facing after a move', () => {
  it('keeps the original facing when the unit can afford it', () => {
    const s = battle({
      units: [
        ['b', 'blue', 'spearmen', 2, 2, E],
        ['r', 'red', 'spearmen', 11, 7, W],
      ],
    });
    // Two squares south: turn, walk, turn back = 2 + 4 + 2 = 8 MP, all of it.
    expect(unit(run(s, { type: 'Move', unitId: 'b', to: { x: 2, y: 4 } }).state, 'b').facing).toBe(
      E,
    );
    // Too far to turn back: it faces the way it walked.
    const far = run(s, { type: 'Move', unitId: 'b', to: { x: 2, y: 5 } }).state;
    expect(unit(far, 'b').facing).toBe(S);
  });
});

describe('strike back from a flank', () => {
  const flanked = (): BattleState =>
    battle({
      units: [
        ['b', 'blue', 'heavySwordsmen', 4, 3, E],
        ['r', 'red', 'spearmen', 4, 2, W],
        ['r2', 'red', 'spearmen', 11, 7, W],
      ],
    });

  it('a unit attacked only on its flank fights back at half strength', () => {
    const s = flanked();
    // r faces west; b is south of it, on its flank.
    const melee = computeDamage(s, unit(s, 'r'), unit(s, 'b'), 'melee');
    const counter = computeDamage(s, unit(s, 'r'), unit(s, 'b'), 'counter');
    for (const c of [melee, counter]) {
      expect(c.situational).toContainEqual({
        label: 'Struck in the flank',
        value: RULES.combat.flankedStrikeBack,
      });
    }
    const front = withUnit(s, 'r', { facing: S });
    const frontal = computeDamage(front, unit(front, 'r'), unit(front, 'b'), 'melee');
    expect(frontal.situational.map((m) => m.label)).not.toContain('Struck in the flank');
  });
});

describe('charge preview', () => {
  const setup = (seed: number) =>
    battle({
      seed,
      units: [
        ['b', 'blue', 'heavySwordsmen', 3, 3, E],
        ['r', 'red', 'spearmen', 5, 3, W],
        ['r2', 'red', 'spearmen', 11, 7, W],
      ],
    });

  it('includes the first melee round, which happens in the same side turn', () => {
    const p = previewCombat(setup(1), { type: 'Charge', unitId: 'b', targetId: 'r' });
    if (isRejection(p)) throw new Error(p.message);
    expect(p.defender.meleeLoss).toBeGreaterThan(0);
    expect(p.defender.expectedLoss).toBeCloseTo(p.defender.impactLoss + p.defender.meleeLoss, 5);

    // The preview matches the average of real charges followed by the melee round.
    let toTarget = 0;
    let toCharger = 0;
    const n = 300;
    for (let seed = 1; seed <= n; seed++) {
      let s = run(setup(seed), { type: 'Charge', unitId: 'b', targetId: 'r' }).state;
      s = run(s, { type: 'EndTurn' }).state;
      toTarget += 100 - unit(s, 'r').strength;
      toCharger += 100 - unit(s, 'b').strength;
    }
    expect(p.defender.expectedLoss).toBeGreaterThan(0.85 * (toTarget / n));
    expect(p.defender.expectedLoss).toBeLessThan(1.15 * (toTarget / n));
    expect(p.attacker.expectedLoss).toBeGreaterThan(0.8 * (toCharger / n));
    expect(p.attacker.expectedLoss).toBeLessThan(1.2 * (toCharger / n));
  });
});

describe('concede', () => {
  it('ends the battle as a loss for the side that concedes, on either turn', () => {
    const s = zoc();
    const blue = run(s, { type: 'Concede', side: 'blue' });
    expect(blue.state.result).toMatchObject({ winner: 'red', reason: 'conceded' });
    expect(blue.events).toContainEqual(expect.objectContaining({ type: 'BattleEnded' }));
    const red = run(s, { type: 'Concede', side: 'red' });
    expect(red.state.result).toMatchObject({ winner: 'blue', reason: 'conceded' });
    expect(rejected(blue.state, { type: 'Concede', side: 'red' })).toBe('BATTLE_OVER');
  });
});

describe('evade', () => {
  it('skirmishers evade infantry less often than before (base 0.6)', () => {
    expect(RULES.movement.evadeBase).toBe(0.6);
  });
});
