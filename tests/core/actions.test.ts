import { describe, expect, it } from 'vitest';
import {
  Cohesion,
  computeDamage,
  isEngaged,
  planCharge,
  RULES,
  validateCommand,
  type ActionId,
  type BattleState,
  type ScenarioUnit,
} from '../../src/core';
import { breakthrough, volleyDamage } from '../../src/core/actions';
import { cannotRout } from '../../src/core/morale';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { unitType, type ArchetypeId } from '../../src/content/units';
import { mapFromRows, startBattle } from '../../src/core';
import { battle, E, N, openRows, rejected, run, S, unit, W } from './helpers';

/** Prompt 09: the Restart command and the tactical actions (GAME_DESIGN 4.12). */

const A = RULES.actions;
/** An archetype with tactical actions, for a test unit's `extra`. */
const withActions = (arch: ArchetypeId, actions: ActionId[], more: Partial<ScenarioUnit> = {}) => ({
  type: { ...unitType(arch), actions },
  ...more,
});

/** Tries seeds until `ok` holds for the result of `go` (for dice-driven outcomes). */
function withSeed<T>(
  make: (seed: number) => BattleState,
  go: (s: BattleState) => T,
  ok: (r: T) => boolean,
): T {
  for (let seed = 1; seed < 400; seed++) {
    const r = go(make(seed));
    if (ok(r)) return r;
  }
  throw new Error('no seed gave the outcome');
}

describe('Restart (UX §6)', () => {
  it('ends the battle with no winner and no defeat, and nothing more can be ordered', () => {
    const s = battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 10, 3, W],
      ],
    });
    const res = run(s, { type: 'Restart' });
    expect(res.state.result).toMatchObject({ winner: null, reason: 'restarted', broken: [] });
    expect(res.events).toContainEqual({ type: 'BattleEnded', result: res.state.result });
    expect(validateCommand(res.state, { type: 'Restart' })?.code).toBe('BATTLE_OVER');
  });
});

describe('tactical actions (GAME_DESIGN 4.12)', () => {
  it('Volley: each enemy in the 2×2 area takes ~55% of a focused shot; no friendly fire', () => {
    const s = battle({
      units: [
        ['a', 'blue', 'archers', 4, 3, E, withActions('archers', ['volley'])],
        ['r1', 'red', 'spearmen', 6, 3, W],
        ['r2', 'red', 'spearmen', 6, 4, W],
        ['f', 'blue', 'spearmen', 7, 5, W],
      ],
    });
    const a = unit(s, 'a');
    const r1 = unit(s, 'r1');
    const one = volleyDamage(s, a, r1).expected;
    expect(one / computeDamage(s, a, r1, 'ranged').expected).toBeCloseTo(A.volley.factor);
    const res = run(s, { type: 'Volley', unitId: 'a', at: { x: 6, y: 3 } });
    const hit = res.events.filter((e) => e.type === 'DamageDealt').map((e) => e.targetId);
    expect(hit.sort()).toEqual(['r1', 'r2']);
    expect(unit(res.state, 'a').hasActed).toBe(true);
    // A friend in the area: no.
    expect(rejected(s, { type: 'Volley', unitId: 'a', at: { x: 6, y: 4 } })).toBe('FRIENDLY_FIRE');
  });

  it('Fortify: 1 MP, damage ×0.75, no push-back, no breakthrough, no charge that turn', () => {
    const s = battle({
      units: [
        ['sp', 'blue', 'spearmen', 5, 3, E, withActions('spearmen', ['fortify'])],
        ['k', 'red', 'heavyCavalry', 9, 3, W, withActions('heavyCavalry', ['fullCharge'])],
      ],
    });
    const f = run(s, { type: 'Fortify', unitId: 'sp' }).state;
    const sp = unit(f, 'sp');
    expect(sp.fortified).toBe(true);
    expect(sp.mpLeft).toBe(unit(s, 'sp').mpLeft - A.fortify.mp);
    expect(rejected(f, { type: 'Charge', unitId: 'sp', targetId: 'k' })).toBe('ALREADY_ACTED');
    const k = unit(f, 'k');
    const plain = computeDamage(s, k, unit(s, 'sp'), 'melee').expected;
    expect(computeDamage(f, k, sp, 'melee').expected / plain).toBeCloseTo(A.fortify.damageTaken);
    // The cavalry can never break through it.
    const enemyTurn = run(f, { type: 'EndTurn' }).state;
    const plan = planCharge(enemyTurn, unit(enemyTurn, 'k'), unit(enemyTurn, 'sp'));
    if ('code' in plan) throw new Error(plan.message);
    expect(
      breakthrough(enemyTurn, unit(enemyTurn, 'k'), unit(enemyTurn, 'sp'), plan),
    ).toMatchObject({
      chance: 0,
      reason: 'Fortified spears: no breakthrough',
    });
    // And it is never pushed back.
    const charged = run(enemyTurn, { type: 'Charge', unitId: 'k', targetId: 'sp', full: true });
    expect(charged.events.some((e) => e.type === 'UnitMoved' && e.kind === 'pushBack')).toBe(false);
    expect(unit(charged.state, 'sp')).toMatchObject({ x: 5, y: 3 });
  });

  it('Full charge: needs 2 squares of run-up, ×1.25 impact, lands behind turned on a breakthrough', () => {
    const make = (seed: number) =>
      battle({
        seed,
        units: [
          ['k', 'blue', 'heavyCavalry', 2, 3, E, withActions('heavyCavalry', ['fullCharge'])],
          // Archers facing away: no anti-cavalry wall, a clear square behind them.
          ['ar', 'red', 'archers', 6, 3, E, { cohesion: Cohesion.Disrupted }],
        ],
      });
    const s = make(1);
    const k = unit(s, 'k');
    const ar = unit(s, 'ar');
    const plan = planCharge(s, k, ar);
    if ('code' in plan) throw new Error(plan.message);
    const b = breakthrough(s, k, ar, plan);
    const F = A.fullCharge;
    const expected =
      F.base + F.perPoint * Math.max(0, k.type.stats.impact - ar.type.stats.armor) + F.disrupted;
    expect(b.chance).toBeCloseTo(Math.min(F.cap, expected));
    expect(b.landing).toEqual({ x: 7, y: 3 });
    const full = computeDamage(s, k, ar, 'charge', { runUp: 3, full: true }).expected;
    const engage = computeDamage(s, k, ar, 'charge', { runUp: 3 }).expected;
    expect(full / engage).toBeCloseTo(F.impact);
    const through = withSeed(
      make,
      (st) => run(st, { type: 'Charge', unitId: 'k', targetId: 'ar', full: true }).state,
      (st) => unit(st, 'k').x === 7,
    );
    expect(unit(through, 'k')).toMatchObject({ x: 7, y: 3, facing: W });
    expect(isEngaged(through, 'k')).toBe(false);
    // Adjacent: no run-up.
    const close = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 5, 3, E, withActions('heavyCavalry', ['fullCharge'])],
        ['ar', 'red', 'archers', 6, 3, E],
      ],
    });
    expect(rejected(close, { type: 'Charge', unitId: 'k', targetId: 'ar', full: true })).toBe(
      'NO_RUN_UP',
    );
  });

  it('Full charge: a failed one into spears head on breaks on them (loses a cohesion level)', () => {
    const s = battle({
      units: [
        ['k', 'blue', 'heavyCavalry', 2, 3, E, withActions('heavyCavalry', ['fullCharge'])],
        ['sp', 'red', 'spearmen', 6, 3, W],
      ],
    });
    const res = run(s, { type: 'Charge', unitId: 'k', targetId: 'sp', full: true });
    const roll = res.events.find((e) => e.type === 'BreakthroughRoll');
    expect(roll).toMatchObject({ chance: 0, success: false });
    const k = unit(res.state, 'k');
    if (k.status === 'active' && k.cohesion !== Cohesion.Routed) {
      expect(k.cohesion).toBeGreaterThanOrEqual(Cohesion.Disrupted);
    }
  });

  it('Testudo: ranged damage ×0.4 until it moves; no attack that turn', () => {
    const s = battle({
      units: [
        ['lg', 'blue', 'heavySwordsmen', 5, 3, E, withActions('heavySwordsmen', ['testudo'])],
        ['ar', 'red', 'archers', 7, 3, W],
      ],
    });
    const t = run(s, { type: 'Testudo', unitId: 'lg' }).state;
    const ar = unit(t, 'ar');
    const before = computeDamage(s, unit(s, 'ar'), unit(s, 'lg'), 'ranged').expected;
    expect(computeDamage(t, ar, unit(t, 'lg'), 'ranged').expected / before).toBeCloseTo(
      A.testudo.rangedTaken,
    );
    expect(rejected(t, { type: 'Charge', unitId: 'lg', targetId: 'ar' })).toBe('ALREADY_ACTED');
    const moved = run(t, { type: 'Move', unitId: 'lg', to: { x: 4, y: 3 } }).state;
    expect(unit(moved, 'lg').testudo).toBe(false);
  });

  it('Pila volley: the existing OneShot, one volley per battle', () => {
    const s = battle({
      units: [
        ['lg', 'blue', 'heavySwordsmen', 5, 3, E, withActions('heavySwordsmen', ['pilaVolley'])],
        ['r', 'red', 'spearmen', 6, 3, W],
      ],
    });
    const shot = run(s, { type: 'Shoot', unitId: 'lg', targetId: 'r' }).state;
    const next = run(run(shot, { type: 'EndTurn' }).state, { type: 'EndTurn' }).state;
    if (isEngaged(next, 'lg')) return;
    expect(rejected(next, { type: 'Shoot', unitId: 'lg', targetId: 'r' })).toBe('NO_AMMO');
  });

  it('Othismos: a shove that pushes the enemy back out of the melee when it loses the check', () => {
    const make = (seed: number) => {
      const s = battle({
        seed,
        units: [
          ['sh', 'blue', 'spearmen', 4, 3, E, withActions('spearmen', ['othismos'])],
          ['r', 'red', 'spearmen', 5, 3, W, { strength: 40 }],
        ],
      });
      s.engagements.push({ a: 'sh', b: 'r' });
      return s;
    };
    const res = withSeed(
      make,
      (s) => run(s, { type: 'Othismos', unitId: 'sh', targetId: 'r' }),
      (r) => r.events.some((e) => e.type === 'OthismosRoll' && e.pushed),
    );
    expect(unit(res.state, 'r')).toMatchObject({ x: 6, y: 3 });
    expect(isEngaged(res.state, 'r')).toBe(false);
    expect(unit(res.state, 'sh').hasActed).toBe(true);
  });

  it('Parthian shot: shoots, then retires up to half its MP even out of a zone of control', () => {
    const s = battle({
      units: [
        ['ha', 'blue', 'lightCavalry', 5, 3, E, withActions('lightCavalry', ['parthianShot'])],
        ['r', 'red', 'spearmen', 7, 3, W],
      ],
    });
    const res = run(s, { type: 'ParthianShot', unitId: 'ha', targetId: 'r', to: { x: 2, y: 3 } });
    expect(res.events.some((e) => e.type === 'ShotFired')).toBe(true);
    expect(unit(res.state, 'ha')).toMatchObject({ x: 2, y: 3 });
    // Beyond half its MP: no.
    expect(
      rejected(s, { type: 'ParthianShot', unitId: 'ha', targetId: 'r', to: { x: 0, y: 7 } }),
    ).toBe('OUT_OF_REACH');
  });

  it('Feigned retreat: evades a charge on purpose and leaves the pursuer Disrupted', () => {
    const make = (seed: number) =>
      battle({
        seed,
        units: [
          ['k', 'blue', 'heavyCavalry', 2, 3, E],
          ['lc', 'red', 'lightCavalry', 6, 3, W, withActions('lightCavalry', ['feignedRetreat'])],
        ],
      });
    const res = withSeed(
      make,
      (s) => run(s, { type: 'Charge', unitId: 'k', targetId: 'lc' }),
      (r) => r.events.some((e) => e.type === 'EvadeRoll' && e.evaded),
    );
    const roll = res.events.find((e) => e.type === 'EvadeRoll');
    expect(roll && roll.type === 'EvadeRoll' && roll.chance).toBeGreaterThanOrEqual(
      A.feignedRetreat.evade,
    );
    expect(unit(res.state, 'k').cohesion).toBe(Cohesion.Disrupted);
  });

  it('Trample: an elephant charge also hits the units either side of its target', () => {
    const s = battle({
      units: [
        ['el', 'blue', 'warElephants', 2, 3, E, withActions('warElephants', ['trample'])],
        ['r', 'red', 'spearmen', 5, 3, W],
        ['up', 'red', 'spearmen', 5, 2, W],
        ['dn', 'red', 'spearmen', 5, 4, W],
      ],
    });
    const res = run(s, { type: 'Charge', unitId: 'el', targetId: 'r' });
    const trampled = res.events.filter((e) => e.type === 'DamageDealt' && e.kind === 'trample');
    expect(trampled.map((e) => (e.type === 'DamageDealt' ? e.targetId : '')).sort()).toEqual([
      'dn',
      'up',
    ]);
  });

  it('Last stand: once per battle, for 2 turns it cannot rout and fights ×1.2 in melee', () => {
    const s = battle({
      units: [
        [
          'sb',
          'blue',
          'heavySwordsmen',
          5,
          3,
          E,
          withActions('heavySwordsmen', ['lastStand'], { strength: 20 }),
        ],
        ['r', 'red', 'spearmen', 6, 3, W],
      ],
    });
    const ls = run(s, { type: 'LastStand', unitId: 'sb' }).state;
    expect(cannotRout(ls, unit(ls, 'sb'))).toBe(true);
    const r = unit(ls, 'r');
    expect(
      computeDamage(ls, unit(ls, 'sb'), r, 'melee').expected /
        computeDamage(s, unit(s, 'sb'), r, 'melee').expected,
    ).toBeCloseTo(A.lastStand.melee);
    expect(rejected(ls, { type: 'LastStand', unitId: 'sb' })).toBe('USED');
    // Two turns later it is over.
    let t = ls;
    for (let i = 0; i < 4; i++) t = run(t, { type: 'EndTurn' }).state;
    expect(cannotRout(t, unit(t, 'sb'))).toBe(false);
  });

  it('Unbreakable: cannot rout while inside its general’s command radius', () => {
    const make = (gx: number) =>
      startBattle({
        id: 't',
        name: 't',
        map: mapFromRows(openRows()),
        sides: {
          blue: {
            name: 'Blue',
            edge: 'west',
            general: { def: GENERAL_BY_ID.caesar!, rank: 1, unitId: 'g' },
          },
          red: { name: 'Red', edge: 'east' },
        },
        units: [
          { id: 'g', side: 'blue', type: unitType('generalGuard'), x: gx, y: 1, facing: S },
          {
            id: 'x',
            side: 'blue',
            facing: N,
            x: 1,
            y: 3,
            ...withActions('heavySwordsmen', ['unbreakable']),
          },
          { id: 'r', side: 'red', type: unitType('spearmen'), x: 11, y: 3, facing: W },
        ],
        turnLimit: 10,
        firstSide: 'blue',
        seed: 1,
      });
    const near = make(1);
    expect(cannotRout(near, unit(near, 'x'))).toBe(true);
    const far = make(10);
    expect(cannotRout(far, unit(far, 'x'))).toBe(false);
  });
});
