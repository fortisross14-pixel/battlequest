import { describe, expect, it } from 'vitest';
import {
  computeDamage,
  validateCommand,
  evadeChance,
  Cohesion,
  isRejection,
  previewCombat,
  wonClearly,
  type BattleState,
  type GameEvent,
} from '../../src/core';
import type { ArchetypeId } from '../../src/content/units';
import {
  battle,
  E,
  endTurn,
  N,
  NE,
  rejected,
  run,
  S,
  SE,
  unit,
  W,
  withUnit,
  type UnitSpec,
} from './helpers';

function dmg(
  state: BattleState,
  a: string,
  d: string,
  role: 'ranged' | 'charge' | 'counter' | 'melee',
) {
  return computeDamage(state, unit(state, a), unit(state, d), role).expected;
}

const duel = (extra: UnitSpec[] = [], rows?: string[], elevation?: string[]) =>
  battle({
    rows,
    elevation,
    units: [['a', 'blue', 'spearmen', 4, 3, E], ['d', 'red', 'spearmen', 5, 3, W], ...extra],
  });

describe('damage formula (4.6)', () => {
  it('equal stats deal about 15', () => {
    expect(dmg(duel(), 'a', 'd', 'melee')).toBeCloseTo(15);
  });

  it('flank x1.5, rear x2', () => {
    expect(dmg(withUnit(duel(), 'd', { facing: N }), 'a', 'd', 'melee')).toBeCloseTo(22.5);
    expect(dmg(withUnit(duel(), 'd', { facing: E }), 'a', 'd', 'melee')).toBeCloseTo(30);
  });

  it('uphill x1.2', () => {
    const elev = [
      '000000000000',
      '000000000000',
      '000000000000',
      '000010000000',
      '000000000000',
      '000000000000',
      '000000000000',
      '000000000000',
    ];
    const s = duel([], undefined, elev);
    expect(dmg(s, 'a', 'd', 'melee')).toBeCloseTo(18);
    expect(dmg(s, 'd', 'a', 'melee')).toBeCloseTo(15);
  });

  it('bracing x0.8', () => {
    expect(dmg(withUnit(duel(), 'd', { bracing: true }), 'a', 'd', 'melee')).toBeCloseTo(12);
  });

  it('attacker Disrupted x0.75, Fragmented x0.5', () => {
    expect(
      dmg(withUnit(duel(), 'a', { cohesion: Cohesion.Disrupted }), 'a', 'd', 'melee'),
    ).toBeCloseTo(11.25);
    expect(
      dmg(withUnit(duel(), 'a', { cohesion: Cohesion.Fragmented }), 'a', 'd', 'melee'),
    ).toBeCloseTo(7.5);
  });

  it('scales with attacker strength', () => {
    expect(dmg(withUnit(duel(), 'a', { strength: 50 }), 'a', 'd', 'melee')).toBeCloseTo(11.25);
  });

  it('a unit in a ford fights as Disrupted and defends with 70% armor', () => {
    const rows = [
      '............',
      '............',
      '............',
      '....=.......',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = duel([], rows);
    expect(dmg(s, 'a', 'd', 'melee')).toBeCloseTo(15 * 0.75);
    expect(dmg(s, 'd', 'a', 'melee')).toBeCloseTo((30 * 5) / (5 + 3.5));
  });

  it('cavalry fights at half strength in forest; light infantry gets +20%', () => {
    const rows = [
      '............',
      '............',
      '............',
      '.....F......',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = battle({
      rows,
      units: [
        ['k', 'blue', 'heavyCavalry', 4, 3, E],
        ['sk', 'blue', 'skirmishers', 4, 4, NE],
        ['d', 'red', 'spearmen', 5, 3, W],
      ],
    });
    expect(dmg(s, 'k', 'd', 'melee')).toBeCloseTo((30 * 2.25) / 7.25); // forest x0.5, spear wall x0.75;
    expect(dmg(s, 'sk', 'd', 'melee')).toBeCloseTo((30 * 2.4) / 7.4);
  });

  it('rough ground: cavalry impact -25%, heavy cavalry melee -20%', () => {
    const rows = [
      '............',
      '............',
      '............',
      '.....,......',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = battle({
      rows,
      units: [
        ['k', 'blue', 'heavyCavalry', 4, 3, E],
        ['d', 'red', 'archers', 5, 3, W],
      ],
    });
    expect(dmg(s, 'k', 'd', 'charge')).toBeCloseTo((30 * 6.75) / 8.75);
    expect(dmg(s, 'k', 'd', 'melee')).toBeCloseTo((30 * 4.8) / 6.8);
  });
});

describe('ranged combat', () => {
  const range = (dx: number, rows?: string[]) =>
    battle({
      rows,
      units: [
        ['a', 'blue', 'archers', 2, 3, E],
        ['d', 'red', 'spearmen', 2 + dx, 3, W],
      ],
    });

  it('uses Ranged vs armor, x0.7 beyond half range', () => {
    // Archers reach 3 squares; beyond half of that (1.5) is long range.
    expect(dmg(range(1), 'a', 'd', 'ranged')).toBeCloseTo((30 * 6) / 11);
    expect(dmg(range(2), 'a', 'd', 'ranged')).toBeCloseTo(((30 * 6) / 11) * 0.7);
    expect(dmg(range(3), 'a', 'd', 'ranged')).toBeCloseTo(((30 * 6) / 11) * 0.7);
  });

  it('cover x0.6 against shooting', () => {
    const rows = [
      '............',
      '............',
      '............',
      '....F.......',
      '............',
      '............',
      '............',
      '............',
    ];
    expect(dmg(range(2, rows), 'a', 'd', 'ranged')).toBeCloseTo(((30 * 6) / 11) * 0.6 * 0.7);
  });

  it('flank and rear bonuses do not apply to shooting', () => {
    expect(dmg(withUnit(range(1), 'd', { facing: E }), 'a', 'd', 'ranged')).toBeCloseTo(
      (30 * 6) / 11,
    );
  });

  it('armor piercing halves armor', () => {
    const s = battle({
      units: [
        ['x', 'blue', 'crossbowmen', 2, 3, E],
        ['k', 'red', 'heavyCavalry', 3, 3, W],
      ],
    });
    expect(dmg(s, 'x', 'k', 'ranged')).toBeCloseTo(20);
  });

  it('shooting deals damage and uses the action', () => {
    const { state, events } = run(range(2), { type: 'Shoot', unitId: 'a', targetId: 'd' });
    const hit = events.find((e) => e.type === 'DamageDealt');
    expect(hit).toMatchObject({ kind: 'ranged', attackerId: 'a', targetId: 'd' });
    expect(unit(state, 'd').strength).toBe(100 - (hit as { amount: number }).amount);
    expect(rejected(state, { type: 'Shoot', unitId: 'a', targetId: 'd' })).toBe('ALREADY_ACTED');
  });

  it('damage stays within the ±15% band', () => {
    for (let seed = 1; seed < 30; seed++) {
      const s = battle({
        seed,
        units: [
          ['a', 'blue', 'archers', 2, 3, E],
          ['d', 'red', 'spearmen', 4, 3, W],
        ],
      });
      const amount = (
        run(s, { type: 'Shoot', unitId: 'a', targetId: 'd' }).events.find(
          (e) => e.type === 'DamageDealt',
        ) as { amount: number }
      ).amount;
      // Distance 2 is long range for archers (×0.7): 16.36 × 0.7 ≈ 11.45 expected.
      expect(amount).toBeGreaterThanOrEqual(Math.round(11.45 * 0.85));
      expect(amount).toBeLessThanOrEqual(Math.round(11.46 * 1.15));
    }
  });

  it('rejects out of range, out of arc, and units without missiles', () => {
    expect(rejected(range(5), { type: 'Shoot', unitId: 'a', targetId: 'd' })).toBe('OUT_OF_RANGE');
    expect(
      rejected(withUnit(range(2), 'a', { facing: W }), {
        type: 'Shoot',
        unitId: 'a',
        targetId: 'd',
      }),
    ).toBe('NOT_IN_ARC');
    expect(rejected(duel(), { type: 'Shoot', unitId: 'a', targetId: 'd' })).toBe('CANNOT_SHOOT');
  });

  it('forest blocks line of sight; units do not (missiles go over them)', () => {
    const forest = [
      '............',
      '............',
      '............',
      '...F........',
      '............',
      '............',
      '............',
      '............',
    ];
    expect(rejected(range(3, forest), { type: 'Shoot', unitId: 'a', targetId: 'd' })).toBe(
      'NO_LINE_OF_SIGHT',
    );
    const blocker: UnitSpec = ['m', 'red', 'spearmen', 3, 3, W];
    const s = battle({
      units: [['a', 'blue', 'archers', 2, 3, E], ['d', 'red', 'spearmen', 4, 3, W], blocker],
    });
    expect(validateCommand(s, { type: 'Shoot', unitId: 'a', targetId: 'd' })).toBeNull();
    const elev = [
      '000000000000',
      '000000000000',
      '000000000000',
      '001000000000',
      '000000000000',
      '000000000000',
      '000000000000',
      '000000000000',
    ];
    const high = battle({
      elevation: elev,
      units: [
        ['a', 'blue', 'archers', 2, 3, E],
        ['d', 'red', 'spearmen', 5, 3, W],
        ['m', 'red', 'spearmen', 4, 3, W],
      ],
    });
    expect(() => run(high, { type: 'Shoot', unitId: 'a', targetId: 'd' })).not.toThrow();
  });

  it('NoMoveAndShoot, OneShot and Reload', () => {
    const s = battle({
      units: [
        ['x', 'blue', 'crossbowmen', 2, 3, E],
        ['p', 'blue', 'heavySwordsmen', 2, 5, E],
        ['g', 'blue', 'arquebusiers', 2, 1, E],
        ['d', 'red', 'spearmen', 4, 3, W],
        ['d2', 'red', 'spearmen', 3, 5, W],
        ['d3', 'red', 'spearmen', 4, 1, W],
      ],
    });
    const moved = run(s, { type: 'Rotate', unitId: 'x', facing: NE }).state;
    expect(unit(moved, 'x').hasMoved).toBe(false); // turning in place is fine
    const walked = run(s, { type: 'Move', unitId: 'x', to: { x: 2, y: 4 }, facing: E }).state;
    expect(rejected(walked, { type: 'Shoot', unitId: 'x', targetId: 'd' })).toBe('MOVED_THIS_TURN');

    let t = run(s, { type: 'Shoot', unitId: 'p', targetId: 'd2' }).state;
    t = run(t, { type: 'Shoot', unitId: 'g', targetId: 'd3' }).state;
    t = endTurn(endTurn(t).state).state;
    expect(rejected(t, { type: 'Shoot', unitId: 'p', targetId: 'd2' })).toBe('NO_AMMO');
    expect(rejected(t, { type: 'Shoot', unitId: 'g', targetId: 'd3' })).toBe('RELOADING');
    t = endTurn(endTurn(t).state).state;
    expect(() => run(t, { type: 'Shoot', unitId: 'g', targetId: 'd3' })).not.toThrow();
  });
});

describe('charges and impact', () => {
  const cav = (target: ArchetypeId, facing = W) =>
    battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['d', 'red', target, 5, 3, facing],
      ],
    });

  it('heavy cavalry smashes archers; the counter uses Melee x0.5', () => {
    const s = cav('archers');
    expect(dmg(s, 'k', 'd', 'charge')).toBeCloseTo((30 * 9) / 11);
    expect(dmg(s, 'd', 'k', 'counter')).toBeCloseTo((30 * 1) / 8);
  });

  it('spears beat a frontal cavalry charge but not one in the flank', () => {
    const front = run(cav('spearmen'), { type: 'Move', unitId: 'k', to: { x: 4, y: 3 } }).state;
    const toSpear = dmg(front, 'k', 'd', 'charge');
    const toKnight = dmg(front, 'd', 'k', 'counter');
    expect(toSpear).toBeCloseTo((30 * 4.5) / 9.5);
    expect(toKnight).toBeCloseTo((30 * 8.75) / 15.75);
    expect(toKnight).toBeGreaterThan(toSpear);
    const flank = withUnit(front, 'd', { facing: N });
    expect(dmg(flank, 'k', 'd', 'charge')).toBeCloseTo(((30 * 9) / 14) * 1.5);
    // Struck in the flank, the spearmen strike back at half strength (review 1).
    expect(dmg(flank, 'd', 'k', 'counter')).toBeCloseTo(((30 * 2.5) / 9.5) * 0.5);
  });

  it('pikes hit cavalry even harder; pikes are flank-vulnerable', () => {
    const s = run(cav('pikemen'), { type: 'Move', unitId: 'k', to: { x: 4, y: 3 } }).state;
    expect(dmg(s, 'd', 'k', 'counter')).toBeCloseTo((30 * 14) / 21);
    expect(dmg(s, 'k', 'd', 'charge')).toBeCloseTo((30 * 3.6) / 8.6);
    expect(dmg(withUnit(s, 'd', { facing: N }), 'k', 'd', 'charge')).toBeCloseTo(
      ((30 * 9) / 14) * 1.5 * 1.25,
    );
  });

  it('in melee, spears get a bonus against cavalry to their front and the cavalry fights worse', () => {
    const s = run(cav('spearmen'), { type: 'Move', unitId: 'k', to: { x: 4, y: 3 } }).state;
    expect(dmg(s, 'd', 'k', 'melee')).toBeCloseTo((30 * 7.5) / 14.5);
    expect(dmg(s, 'k', 'd', 'melee')).toBeCloseTo((30 * 4.5) / 9.5);
    // From the flank, neither applies.
    const flank = withUnit(s, 'd', { facing: N });
    expect(dmg(flank, 'k', 'd', 'melee')).toBeCloseTo(((30 * 6) / 11) * 1.5);
  });

  it('a charge moves into contact, deals impact both ways and starts a melee', () => {
    const { state, events } = run(cav('spearmen'), { type: 'Charge', unitId: 'k', targetId: 'd' });
    const k = unit(state, 'k');
    expect(k).toMatchObject({ hasActed: true, mpLeft: 0, facing: E });
    const impacts = events.filter((e) => e.type === 'DamageDealt' && e.kind === 'impact');
    expect(impacts).toHaveLength(2);
    expect(state.engagements).toEqual([{ a: 'k', b: 'd' }]);
    expect(Math.abs(k.x - unit(state, 'd').x)).toBe(1);
  });

  it('a clear win pushes the defender back and the charger follows up', () => {
    let pushed = 0;
    for (let seed = 1; seed < 15; seed++) {
      const s = battle({
        seed,
        units: [
          ['k', 'blue', 'heavyCavalry', 2, 3, E],
          ['d', 'red', 'archers', 5, 3, W],
        ],
      });
      const { state, events } = run(s, { type: 'Charge', unitId: 'k', targetId: 'd' });
      const hits = events.filter(
        (e): e is Extract<GameEvent, { type: 'DamageDealt' }> => e.type === 'DamageDealt',
      );
      const d = unit(state, 'd');
      const push = events.some((e) => e.type === 'UnitMoved' && e.kind === 'pushBack');
      if (d.cohesion !== Cohesion.Routed && d.status === 'active') {
        expect(push).toBe(wonClearly(hits[0]!.amount, hits[1]!.amount));
      }
      if (push) {
        pushed++;
        expect(d.x).toBe(6);
        expect(unit(state, 'k').x).toBe(5);
        expect(state.engagements).toHaveLength(1);
      }
    }
    expect(pushed).toBeGreaterThan(0);
  });

  it('charges must be a straight line in the front arc', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['d', 'red', 'spearmen', 5, 4, W],
        ['b', 'red', 'spearmen', 0, 3, E],
      ],
    });
    expect(rejected(s, { type: 'Charge', unitId: 'k', targetId: 'd' })).toBe('NO_CHARGE_LINE');
    expect(rejected(s, { type: 'Charge', unitId: 'k', targetId: 'b' })).toBe('NOT_IN_ARC');
  });

  it('pikes charge only straight ahead', () => {
    const s = battle({
      units: [
        ['p', 'blue', 'pikemen', 2, 3, E],
        ['d', 'red', 'spearmen', 4, 1, W],
      ],
    });
    expect(rejected(s, { type: 'Charge', unitId: 'p', targetId: 'd' })).toBe('NOT_IN_ARC');
  });

  it('a charge path cannot cross another enemy zone of control, or exceed MP', () => {
    const s = battle({
      units: [
        ['a', 'blue', 'spearmen', 1, 3, E],
        ['z', 'red', 'spearmen', 3, 2, S],
        ['d', 'red', 'spearmen', 5, 3, W],
      ],
    });
    expect(rejected(s, { type: 'Charge', unitId: 'a', targetId: 'd' })).toBe('PATH_BLOCKED');
    const far = battle({
      units: [
        ['a', 'blue', 'spearmen', 0, 3, E],
        ['d', 'red', 'spearmen', 6, 3, W],
      ],
    });
    expect(rejected(far, { type: 'Charge', unitId: 'a', targetId: 'd' })).toBe('NOT_ENOUGH_MP');
  });

  it('Fragmented units cannot charge; Disrupted units can', () => {
    expect(
      rejected(withUnit(duel(), 'a', { cohesion: Cohesion.Fragmented }), {
        type: 'Charge',
        unitId: 'a',
        targetId: 'd',
      }),
    ).toBe('FRAGMENTED');
    expect(() =>
      run(withUnit(duel(), 'a', { cohesion: Cohesion.Disrupted }), {
        type: 'Charge',
        unitId: 'a',
        targetId: 'd',
      }),
    ).not.toThrow();
  });

  it('evade chance depends on relative speed', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['lc', 'blue', 'lightCavalry', 2, 5, E],
        ['sp', 'blue', 'spearmen', 2, 7, E],
        ['sk', 'red', 'skirmishers', 5, 3, W],
        ['rlc', 'red', 'lightCavalry', 5, 5, W],
      ],
    });
    const u = (id: string) => unit(s, id);
    expect(evadeChance(u('k'), u('sk'))).toBeCloseTo(0.5); // 10 MP vs 12 MP
    expect(evadeChance(u('sp'), u('sk'))).toBeCloseTo(0.7); // 10 vs 8
    expect(evadeChance(u('lc'), u('sk'))).toBeCloseTo(0.3); // 10 vs 16
    expect(evadeChance(u('sp'), u('rlc'))).toBeCloseTo(0.95); // clamped
  });

  it('units with Evade usually fall back from a charge and take no damage; otherwise they are caught', () => {
    let evaded = 0;
    const n = 200;
    for (let seed = 0; seed < n; seed++) {
      const s = battle({
        seed,
        units: [
          ['k', 'blue', 'heavyCavalry', 2, 3, E],
          ['sk', 'red', 'skirmishers', 5, 3, W],
        ],
      });
      const { state, events } = run(s, { type: 'Charge', unitId: 'k', targetId: 'sk' });
      const ev = events.some((e) => e.type === 'UnitMoved' && e.kind === 'evade');
      if (ev) {
        evaded++;
        expect(unit(state, 'sk')).toMatchObject({ x: 7, y: 3, strength: 100 });
        expect(unit(state, 'k')).toMatchObject({ x: 4, hasActed: true });
        expect(events.some((e) => e.type === 'DamageDealt')).toBe(false);
        expect(state.engagements).toEqual([]);
      } else {
        expect(events.some((e) => e.type === 'DamageDealt' && e.kind === 'impact')).toBe(true);
      }
    }
    expect(evaded / n).toBeGreaterThan(0.4);
    expect(evaded / n).toBeLessThan(0.6);
  });

  it('an evader with no room to fall back is caught', () => {
    const rows = [
      '............',
      '............',
      '............',
      '......~.....',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = battle({
      rows,
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['sk', 'red', 'skirmishers', 5, 3, W],
      ],
    });
    const { events } = run(s, { type: 'Charge', unitId: 'k', targetId: 'sk' });
    expect(events.some((e) => e.type === 'DamageDealt' && e.kind === 'impact')).toBe(true);
  });

  it('charging a routed unit destroys it', () => {
    const s = withUnit(cav('archers'), 'd', { cohesion: Cohesion.Routed });
    const { state } = run(s, { type: 'Charge', unitId: 'k', targetId: 'd' });
    expect(unit(state, 'd').status).toBe('destroyed');
  });
});

describe('melee phase', () => {
  it('engaged units fight at the end of the side turn', () => {
    const s = structuredClone(duel());
    s.engagements.push({ a: 'a', b: 'd' });
    const { state, events } = endTurn(s);
    const melee = events.filter((e) => e.type === 'DamageDealt' && e.kind === 'melee');
    expect(melee).toHaveLength(2);
    expect(unit(state, 'a').strength).toBeLessThan(100);
    expect(unit(state, 'd').strength).toBeLessThan(100);
  });

  it('a unit fighting two enemies takes two hits but strikes once, at the one to its front', () => {
    const s = structuredClone(duel([['f', 'blue', 'spearmen', 5, 2, S]]));
    s.engagements.push({ a: 'a', b: 'd' }, { a: 'f', b: 'd' });
    const { events } = endTurn(s);
    const melee = events.filter(
      (e): e is Extract<GameEvent, { type: 'DamageDealt' }> =>
        e.type === 'DamageDealt' && e.kind === 'melee',
    );
    expect(melee.filter((e) => e.targetId === 'd')).toHaveLength(2);
    const byD = melee.filter((e) => e.attackerId === 'd');
    expect(byD).toEqual([expect.objectContaining({ targetId: 'a' })]);
    expect(melee.find((e) => e.attackerId === 'f')!.arc).toBe('flank');
  });
});

describe('combat preview', () => {
  it('reports the same expected values as the real combat functions without changing state', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E],
        ['d', 'red', 'archers', 5, 3, W],
      ],
    });
    const before = JSON.stringify(s);
    const p = previewCombat(s, { type: 'Charge', unitId: 'k', targetId: 'd' });
    expect(isRejection(p)).toBe(false);
    if (isRejection(p)) return;
    expect(p.outcome).toBe('fight');
    // A 2-square run-up: heavy cavalry (Charge tag) hits at full gallop, ×1.2.
    expect(p.defender.impactLoss).toBeCloseTo(((30 * 9) / 11) * 1.2);
    expect(p.attacker.impactLoss).toBeCloseTo(30 / 8);
    // The charge's first melee round comes on top of the impact.
    expect(p.defender.expectedLoss).toBeGreaterThan(p.defender.impactLoss);
    expect(p.defender.cohesionDropChance).toBeGreaterThan(0);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('previews shooting, evasion and invalid commands', () => {
    const s = battle({
      units: [
        ['a', 'blue', 'archers', 2, 3, E],
        ['d', 'red', 'spearmen', 4, 3, W],
        ['k', 'blue', 'heavyCavalry', 2, 5, E],
        ['sk', 'red', 'skirmishers', 5, 5, W],
      ],
    });
    const shot = previewCombat(s, { type: 'Shoot', unitId: 'a', targetId: 'd' });
    expect(!isRejection(shot) && shot.defender.expectedLoss).toBeCloseTo(((30 * 6) / 11) * 0.7);
    const ev = previewCombat(s, { type: 'Charge', unitId: 'k', targetId: 'sk' });
    if (isRejection(ev)) throw new Error(ev.message);
    expect(ev.outcome).toBe('mayEvade');
    expect(ev.evadeChance).toBeCloseTo(0.5);
    // If it is caught, the expected losses are those of a normal impact (plus melee).
    expect(ev.defender.impactLoss).toBeCloseTo(((30 * 9) / 11) * 1.2);
    const bad = previewCombat(s, { type: 'Charge', unitId: 'a', targetId: 'sk' });
    expect(isRejection(bad)).toBe(true);
  });

  it('a hit that leaves 25 strength or less shows a certain rout', () => {
    const s = withUnit(
      battle({
        units: [
          ['k', 'blue', 'heavyCavalry', 2, 3, E],
          ['d', 'red', 'archers', 5, 3, W],
        ],
      }),
      'd',
      { strength: 40 },
    );
    const p = previewCombat(s, { type: 'Charge', unitId: 'k', targetId: 'd' });
    expect(!isRejection(p) && p.defender.routChance).toBe(1);
  });
});

describe('preview and real outcome agree', () => {
  it('average real impact damage over many seeds matches the preview expectation', () => {
    const setup = (seed: number) =>
      battle({
        seed,
        units: [
          ['k', 'blue', 'heavyCavalry', 2, 3, E],
          ['d', 'red', 'spearmen', 5, 3, N],
        ],
      });
    const p = previewCombat(setup(0), { type: 'Charge', unitId: 'k', targetId: 'd' });
    if (isRejection(p)) throw new Error(p.message);
    let toDef = 0;
    let toAtt = 0;
    const n = 400;
    for (let seed = 0; seed < n; seed++) {
      const { events } = run(setup(seed), { type: 'Charge', unitId: 'k', targetId: 'd' });
      const hits = events.filter(
        (e): e is Extract<GameEvent, { type: 'DamageDealt' }> => e.type === 'DamageDealt',
      );
      toDef += hits.find((h) => h.targetId === 'd')!.amount;
      toAtt += hits.find((h) => h.targetId === 'k')!.amount;
    }
    expect(toDef / n).toBeCloseTo(p.defender.impactLoss, 0);
    expect(toAtt / n).toBeCloseTo(p.attacker.impactLoss, 0);
  });
});

describe('review fixes', () => {
  it('a diagonal charge cannot strike across a river corner', () => {
    const rows = [
      '............',
      '............',
      '...~........',
      '..~.........',
      '............',
      '............',
      '............',
      '............',
    ];
    const s = battle({
      rows,
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 2, SE],
        ['d', 'red', 'spearmen', 3, 3, W],
      ],
    });
    expect(rejected(s, { type: 'Charge', unitId: 'k', targetId: 'd' })).toBe('NO_CHARGE_LINE');
  });

  it('units already in melee cannot Hold', () => {
    const s = structuredClone(duel());
    s.engagements.push({ a: 'a', b: 'd' });
    expect(rejected(s, { type: 'Hold', unitId: 'a' })).toBe('ENGAGED');
  });

  it('melee damage events never report more than the target had left', () => {
    const s = structuredClone(duel([['f', 'blue', 'heavySwordsmen', 5, 2, S]]));
    s.engagements.push({ a: 'a', b: 'd' }, { a: 'f', b: 'd' });
    const d = s.units.find((x) => x.id === 'd')!;
    d.strength = 8;
    const { events } = endTurn(s);
    const toD = events.filter(
      (e): e is Extract<GameEvent, { type: 'DamageDealt' }> =>
        e.type === 'DamageDealt' && e.targetId === 'd',
    );
    expect(toD.reduce((sum, e) => sum + e.amount, 0)).toBeLessThanOrEqual(8);
  });
});
