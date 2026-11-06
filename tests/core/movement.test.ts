import { describe, expect, it } from 'vitest';
import { reachableSquares, planMove, isRejection } from '../../src/core';
import { battle, E, N, NE, rejected, run, S, SE, unit, W, withUnit } from './helpers';

const solo = (rows?: string[], elevation?: string[]) =>
  battle({
    rows,
    elevation,
    units: [
      ['b', 'blue', 'spearmen', 2, 3, E],
      ['r', 'red', 'spearmen', 11, 7, W],
    ],
  });

function costTo(
  state: ReturnType<typeof solo>,
  id: string,
  x: number,
  y: number,
  facing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7,
) {
  const plan = planMove(state, unit(state, id), { x, y }, facing);
  return isRejection(plan) ? null : plan.cost;
}

describe('movement costs', () => {
  it('orthogonal steps cost 2 MP', () => {
    const s = solo();
    const { state } = run(s, { type: 'Move', unitId: 'b', to: { x: 4, y: 3 } });
    expect(unit(state, 'b')).toMatchObject({ x: 4, y: 3, facing: E, mpLeft: 4 });
  });

  it('diagonal steps cost 3 MP plus turning; by default the unit keeps its facing', () => {
    const s = solo();
    // Turn to SE (1), step (3), turn back to E (1).
    const { state } = run(s, { type: 'Move', unitId: 'b', to: { x: 3, y: 4 } });
    expect(unit(state, 'b')).toMatchObject({ facing: E, mpLeft: 8 - 5 });
    expect(costTo(s, 'b', 3, 4, SE)).toBe(4);
  });

  it('a requested final facing adds its turning cost', () => {
    expect(costTo(solo(), 'b', 3, 4, E)).toBe(5);
  });

  it('any turn costs 1 MP, even an about-face', () => {
    const s = solo();
    expect(unit(run(s, { type: 'Rotate', unitId: 'b', facing: N }).state, 'b').mpLeft).toBe(7);
    expect(unit(run(s, { type: 'Rotate', unitId: 'b', facing: W }).state, 'b').mpLeft).toBe(7);
  });

  it('light units turn for free', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'skirmishers', 2, 3, E],
        ['r', 'red', 'spearmen', 11, 7],
      ],
    });
    expect(unit(run(s, { type: 'Rotate', unitId: 'k', facing: W }).state, 'k').mpLeft).toBe(10);
  });

  it('terrain multiplies the cost', () => {
    const rough = solo([
      '............',
      '............',
      '............',
      '...,F=......',
      '............',
      '............',
      '............',
      '............',
    ]);
    expect(costTo(rough, 'b', 3, 3)).toBe(3); // rough x1.5
    expect(costTo(rough, 'b', 4, 3)).toBe(7); // + forest x2
  });

  it('a ford costs x3', () => {
    const s = solo([
      '............',
      '............',
      '............',
      '...=........',
      '............',
      '............',
      '............',
      '............',
    ]);
    expect(costTo(s, 'b', 3, 3)).toBe(6);
  });

  it('moving uphill costs x1.5', () => {
    const elev = [
      '000000000000',
      '000000000000',
      '000000000000',
      '000100000000',
      '000000000000',
      '000000000000',
      '000000000000',
      '000000000000',
    ];
    expect(costTo(solo(undefined, elev), 'b', 3, 3)).toBe(3);
  });

  it('tags change rough-terrain costs', () => {
    const rows = [
      '............',
      '............',
      '............',
      '...,F.......',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = battle({
      rows,
      units: [
        ['sk', 'blue', 'skirmishers', 2, 3, E],
        ['kn', 'blue', 'heavyCavalry', 3, 2, S],
        ['ch', 'blue', 'chariots', 5, 2, S],
        ['r', 'red', 'spearmen', 11, 7],
      ],
    });
    expect(costTo(s, 'sk', 3, 3)).toBe(2); // RoughTerrainOK
    expect(costTo(s, 'kn', 3, 3)).toBe(4.5); // RoughTerrainBad: 2 x 1.5 x 1.5
    expect(rejected(s, { type: 'Move', unitId: 'ch', to: { x: 4, y: 3 } })).toBe('UNREACHABLE'); // chariots cannot enter forest
  });
});

describe('impassable terrain, bridges and blocking', () => {
  const river = [
    '....~.......',
    '....~.......',
    '...~~.......',
    '....B.......',
    '....~.......',
    '....=.......',
    '....~.......',
    '....~.......',
  ];

  it('rivers are impassable', () => {
    const s = battle({
      rows: river,
      units: [
        ['b', 'blue', 'spearmen', 3, 1, E],
        ['r', 'red', 'spearmen', 11, 7],
      ],
    });
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 4, y: 1 } })).toBe('UNREACHABLE');
  });

  it('bridges are crossed only along their axis', () => {
    const s = battle({
      rows: river,
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 11, 7],
        ['d', 'blue', 'spearmen', 3, 4, NE],
      ],
    });
    expect(costTo(s, 'b', 5, 3)).toBe(4);
    expect(rejected(s, { type: 'Move', unitId: 'd', to: { x: 4, y: 3 } })).not.toBe('');
    const plan = planMove(s, unit(s, 'd'), { x: 4, y: 3 });
    // It may still get there the long way round, but never by stepping diagonally onto the bridge.
    if (!isRejection(plan)) expect(plan.path[plan.path.length - 2]).toEqual({ x: 3, y: 3 });
  });

  it('diagonal steps cannot cut a river corner', () => {
    // (3,1) and (2,2) are river, so the SE step from (2,1) to (3,2) would cut the corner.
    const rows = [
      '............',
      '...~........',
      '..~.........',
      '............',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = battle({
      rows,
      units: [
        ['b', 'blue', 'spearmen', 2, 1, SE],
        ['r', 'red', 'spearmen', 11, 7],
      ],
    });
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 3, y: 2 } })).toBe('NOT_ENOUGH_MP');
    const open = battle({
      units: [
        ['b', 'blue', 'spearmen', 2, 1, SE],
        ['r', 'red', 'spearmen', 11, 7],
      ],
    });
    expect(costTo(open, 'b', 3, 2)).toBe(3);
  });

  it('units cannot move through other units', () => {
    const s = battle({
      units: [
        ['b', 'blue', 'heavyCavalry', 2, 3, E],
        ['f', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 11, 7],
      ],
    });
    const plan = planMove(s, unit(s, 'b'), { x: 4, y: 3 });
    expect(isRejection(plan)).toBe(false);
    if (!isRejection(plan)) {
      expect(plan.path).not.toContainEqual({ x: 3, y: 3 });
      expect(plan.cost).toBeGreaterThan(4);
    }
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 3, y: 3 } })).toBe('UNREACHABLE');
  });

  it('only the active side can move', () => {
    expect(rejected(solo(), { type: 'Move', unitId: 'r', to: { x: 10, y: 7 } })).toBe(
      'NOT_YOUR_TURN',
    );
  });
});

describe('zones of control', () => {
  // Red faces south at (5,1): its front arc (4,2), (5,2), (6,2) is its zone of control.
  const zoc = () =>
    battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 2, E],
        ['sk', 'blue', 'skirmishers', 3, 5, E],
        ['r', 'red', 'spearmen', 5, 1, S],
        ['r2', 'red', 'spearmen', 11, 7],
      ],
    });

  it('entering an enemy front arc stops the move', () => {
    const s = zoc();
    expect(costTo(s, 'b', 4, 2)).toBe(2);
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 6, y: 2 } })).toBe('NOT_ENOUGH_MP');
    const squares = reachableSquares(s, unit(s, 'b')).map((r) => r.pos);
    expect(squares).not.toContainEqual({ x: 6, y: 2 });
  });

  it('a unit in a zone of control can only pull back straight backwards', () => {
    let s = run(zoc(), { type: 'Move', unitId: 'b', to: { x: 4, y: 2 } }).state;
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 4, y: 3 } })).toBe('IN_ZOC');
    s = run(s, { type: 'Move', unitId: 'b', to: { x: 3, y: 2 } }).state;
    expect(unit(s, 'b')).toMatchObject({ x: 3, y: 2, facing: E, mpLeft: 0 });
  });

  it('pull back is offered in the reachable squares', () => {
    const s = run(zoc(), { type: 'Move', unitId: 'b', to: { x: 4, y: 2 } }).state;
    const r = reachableSquares(s, unit(s, 'b'));
    expect(r).toEqual([expect.objectContaining({ pos: { x: 3, y: 2 }, kind: 'pullBack' })]);
  });

  it('units with Evade can leave a zone of control', () => {
    const s = withUnit(zoc(), 'sk', { x: 4, y: 2, facing: E });
    const after = run(s, { type: 'Move', unitId: 'sk', to: { x: 2, y: 4 } }).state;
    expect(unit(after, 'sk')).toMatchObject({ x: 2, y: 4 });
  });

  it('units in melee cannot move or turn', () => {
    const s = structuredClone(zoc());
    s.engagements.push({ a: 'b', b: 'r' });
    expect(rejected(s, { type: 'Move', unitId: 'b', to: { x: 3, y: 3 } })).toBe('ENGAGED');
    expect(rejected(s, { type: 'Rotate', unitId: 'b', facing: NE })).toBe('ENGAGED');
  });

  it('cannot move further than its MP', () => {
    expect(rejected(solo(), { type: 'Move', unitId: 'b', to: { x: 8, y: 3 } })).toBe(
      'NOT_ENOUGH_MP',
    );
  });
});
