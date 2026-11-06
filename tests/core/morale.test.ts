import { describe, expect, it } from 'vitest';
import {
  cohesionDropChance,
  cohesionTest,
  Cohesion,
  routUnit,
  type BattleState,
  type GameEvent,
} from '../../src/core';
import { battle, E, endTurn, rejected, run, unit, W, withUnit } from './helpers';

const pair = () =>
  battle({
    units: [
      ['a', 'blue', 'spearmen', 5, 3, E],
      ['f', 'blue', 'spearmen', 5, 4, E],
      ['d', 'red', 'archers', 8, 3, W],
    ],
  });

const chance = (
  s: BattleState,
  id: string,
  damage: number,
  arc: 'front' | 'flank' | 'rear' = 'front',
  adjacentRout = false,
) => cohesionDropChance(s, unit(s, id), { damage, arc, adjacentRout });

describe('cohesion test chance (4.7)', () => {
  it('follows the formula', () => {
    const s = pair();
    // 0.05 + 1.5 * 0.15 - 0.03 * 6
    expect(chance(s, 'a', 15)).toBeCloseTo(0.095);
    expect(chance(s, 'a', 15, 'flank')).toBeCloseTo(0.295);
    expect(chance(s, 'a', 15, 'rear')).toBeCloseTo(0.445);
    expect(chance(s, 'a', 15, 'front', true)).toBeCloseTo(0.245);
    expect(chance(withUnit(s, 'a', { strength: 40 }), 'a', 15)).toBeCloseTo(0.195);
  });

  it('is clamped to [0, 0.9]', () => {
    const s = pair();
    expect(chance(s, 'a', 0)).toBe(0);
    expect(chance(s, 'a', 80, 'rear', true)).toBe(0.9);
  });

  it('the general command radius gives -0.15 (stub until M4: no general = no bonus)', () => {
    const s = structuredClone(pair());
    expect(chance(s, 'f', 20)).toBeCloseTo(0.17);
    s.sides.blue.general = { unitId: 'a', commandRadius: 3, rallyBonus: 0 };
    expect(chance(s, 'f', 20)).toBeCloseTo(0.02);
  });

  it('a failed test drops one level; failing at Fragmented routs', () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = structuredClone(
        battle({
          seed,
          units: [
            ['a', 'blue', 'spearmen', 5, 3, E],
            ['d', 'red', 'archers', 8, 3, W],
          ],
        }),
      );
      const a = unit(s, 'a');
      a.cohesion = Cohesion.Fragmented;
      const events: GameEvent[] = [];
      cohesionTest(s, a, { damage: 20, arc: 'rear', adjacentRout: false }, events);
      const t = events.find((e) => e.type === 'CohesionTest') as Extract<
        GameEvent,
        { type: 'CohesionTest' }
      >;
      expect(t.dropped).toBe(t.roll < t.chance);
      expect(a.cohesion).toBe(t.dropped ? Cohesion.Routed : Cohesion.Fragmented);
    }
  });
});

describe('rout and destruction', () => {
  it('a unit at 25 strength or less routs automatically', () => {
    const s = withUnit(
      battle({
        units: [
          ['a', 'blue', 'archers', 2, 3, E],
          ['d', 'red', 'spearmen', 4, 3, W],
        ],
      }),
      'd',
      { strength: 30 },
    );
    const { state, events } = run(s, { type: 'Shoot', unitId: 'a', targetId: 'd' });
    expect(unit(state, 'd').cohesion).toBe(Cohesion.Routed);
    expect(events).toContainEqual({ type: 'UnitRouted', unitId: 'd', cause: 'strength' });
  });

  it('a unit at 0 strength is destroyed', () => {
    const s = withUnit(
      battle({
        units: [
          ['a', 'blue', 'archers', 2, 3, E],
          ['d', 'red', 'spearmen', 4, 3, W],
        ],
      }),
      'd',
      { strength: 3 },
    );
    const { state } = run(s, { type: 'Shoot', unitId: 'a', targetId: 'd' });
    expect(unit(state, 'd')).toMatchObject({ status: 'destroyed', strength: 0 });
  });

  it('adjacent friends test when a unit routs', () => {
    const s = structuredClone(pair());
    const events: GameEvent[] = [];
    routUnit(s, unit(s, 'a'), 'cohesion', events);
    const t = events.find((e) => e.type === 'CohesionTest' && e.unitId === 'f') as Extract<
      GameEvent,
      { type: 'CohesionTest' }
    >;
    expect(t.chance).toBeCloseTo(Math.max(0, 0.05 + 0.15 - 0.18));
    expect(s.engagements).toEqual([]);
  });

  it('routed units are out of control', () => {
    const s = withUnit(pair(), 'a', { cohesion: Cohesion.Routed });
    expect(rejected(s, { type: 'Move', unitId: 'a', to: { x: 4, y: 3 } })).toBe('ROUTED');
  });

  it('routers flee towards their own edge at the end of the turn and again at their turn start', () => {
    const s = structuredClone(
      battle({
        units: [
          ['a', 'blue', 'spearmen', 5, 3, E],
          ['f', 'blue', 'spearmen', 5, 6, E],
          ['g', 'blue', 'spearmen', 5, 7, E],
          ['d', 'red', 'archers', 8, 3, W],
        ],
      }),
    );
    routUnit(s, unit(s, 'a'), 'cohesion', []);
    let next = endTurn(s);
    const a1 = unit(next.state, 'a');
    expect(a1.x).toBe(1); // 8 MP = 4 orthogonal squares west
    expect(a1.facing).toBe(W);
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: 'UnitMoved', unitId: 'a', kind: 'rout' }),
    );
    next = endTurn(next.state); // red ends, blue starts: the router reaches the edge and leaves
    expect(unit(next.state, 'a').status).toBe('fled');
  });

  it('a router that cannot get away from an adjacent enemy is destroyed', () => {
    const rows = [
      '............',
      '.~~~........',
      '.~..........',
      '.~~~........',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = structuredClone(
      battle({
        rows,
        units: [
          ['a', 'blue', 'spearmen', 2, 2, E],
          ['d', 'red', 'spearmen', 3, 2, W],
          ['x', 'red', 'archers', 11, 7, W],
        ],
      }),
    );
    routUnit(s, unit(s, 'a'), 'cohesion', []);
    const { state, events } = endTurn(s);
    expect(unit(state, 'a').status).toBe('destroyed');
    expect(events).toContainEqual({ type: 'UnitDestroyed', unitId: 'a', cause: 'caught' });
  });

  it('Pursue cavalry follows the unit it routed', () => {
    const s = structuredClone(
      battle({
        units: [
          ['k', 'blue', 'heavyCavalry', 4, 3, E],
          ['d', 'red', 'archers', 5, 3, W],
          ['x', 'red', 'archers', 11, 7, W],
        ],
      }),
    );
    s.engagements.push({ a: 'k', b: 'd' });
    routUnit(s, unit(s, 'd'), 'cohesion', []);
    const { state, events } = endTurn(s);
    expect(unit(state, 'd').x).toBe(9);
    expect(unit(state, 'k').x).toBe(6);
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'UnitMoved', unitId: 'k', kind: 'pursuit' }),
    );
  });
});

describe('rally', () => {
  it('needs the general command radius (none in M2)', () => {
    let rallied = 0;
    for (let seed = 0; seed < 40; seed++) {
      const s = structuredClone(
        battle({
          seed,
          units: [
            ['a', 'blue', 'spearmen', 5, 3, E],
            ['g', 'blue', 'spearmen', 5, 5, E],
            ['d', 'red', 'archers', 11, 7, W],
          ],
        }),
      );
      unit(s, 'a').cohesion = Cohesion.Fragmented;
      const without = endTurn(endTurn(s).state).state;
      expect(unit(without, 'a').cohesion).toBe(Cohesion.Fragmented);
      s.sides.blue.general = { unitId: 'g', commandRadius: 3, rallyBonus: 0 };
      const withGen = endTurn(endTurn(s).state).state;
      if (unit(withGen, 'a').cohesion === Cohesion.Disrupted) rallied++;
    }
    expect(rallied).toBeGreaterThan(5);
    expect(rallied).toBeLessThan(30);
  });

  it('does not happen next to an enemy', () => {
    const s = structuredClone(
      battle({
        units: [
          ['a', 'blue', 'spearmen', 5, 3, E],
          ['g', 'blue', 'spearmen', 5, 5, E],
          ['d', 'red', 'archers', 6, 3, W],
        ],
      }),
    );
    unit(s, 'a').cohesion = Cohesion.Fragmented;
    s.sides.blue.general = { unitId: 'g', commandRadius: 3, rallyBonus: 1 };
    expect(unit(endTurn(endTurn(s).state).state, 'a').cohesion).toBe(Cohesion.Fragmented);
  });
});

describe('victory (4.8)', () => {
  it('an army breaks when routed + destroyed cost reaches 50%', () => {
    const s = withUnit(pair(), 'd', { strength: 3 });
    const shooter = battle({
      units: [
        ['a', 'blue', 'archers', 2, 3, E],
        ['d', 'red', 'spearmen', 4, 3, W],
        ['e', 'red', 'spearmen', 4, 6, W],
      ],
    });
    const t = withUnit(shooter, 'd', { strength: 3 });
    const { state, events } = run(t, { type: 'Shoot', unitId: 'a', targetId: 'd' });
    expect(state.result).toEqual({
      winner: 'blue',
      reason: 'armyBroken',
      turn: 1,
      broken: ['red'],
    });
    expect(events.at(-1)).toMatchObject({ type: 'BattleEnded' });
    expect(rejected(state, { type: 'EndTurn' })).toBe('BATTLE_OVER');
    expect(s.result).toBeNull();
  });

  it('reaching the turn limit is a draw', () => {
    const s = battle({
      turnLimit: 2,
      units: [
        ['a', 'blue', 'spearmen', 2, 3, E],
        ['d', 'red', 'spearmen', 9, 3, W],
      ],
    });
    let t = endTurn(s).state;
    t = endTurn(t).state;
    expect(t.turn).toBe(2);
    t = endTurn(t).state;
    expect(t.result).toBeNull();
    t = endTurn(t).state;
    expect(t.result).toEqual({ winner: null, reason: 'turnLimit', turn: 2, broken: [] });
  });

  it('turns alternate and reset MP and actions', () => {
    let s = battle({
      units: [
        ['a', 'blue', 'spearmen', 2, 3, E],
        ['d', 'red', 'spearmen', 9, 3, W],
      ],
    });
    s = run(s, { type: 'Hold', unitId: 'a' }).state;
    expect(unit(s, 'a')).toMatchObject({ bracing: true, hasActed: true, mpLeft: 0 });
    s = endTurn(s).state;
    expect(s.activeSide).toBe('red');
    expect(unit(s, 'a').bracing).toBe(true); // stays braced through the enemy turn
    s = endTurn(s).state;
    expect(s.activeSide).toBe('blue');
    expect(s.turn).toBe(2);
    expect(unit(s, 'a')).toMatchObject({ bracing: false, hasActed: false, mpLeft: 8 });
  });
});
