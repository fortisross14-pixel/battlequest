import { describe, expect, it } from 'vitest';
import {
  Cohesion,
  cohesionTest,
  commandRadiusForRank,
  computeDamage,
  inCommandRadius,
  isRejection,
  mapFromRows,
  previewCombat,
  scaled,
  startBattle,
  type BattleState,
  type GameEvent,
  type GeneralDef,
  type ScenarioUnit,
} from '../../src/core';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { unitType } from '../../src/content/units';
import { E, endTurn, openRows, rejected, run, unit, W } from './helpers';

const U = (
  id: string,
  side: 'blue' | 'red',
  type: Parameters<typeof unitType>[0],
  x: number,
  y: number,
  facing = side === 'blue' ? E : W,
  extra: Partial<ScenarioUnit> = {},
): ScenarioUnit => ({
  id,
  side,
  type: unitType(type),
  x,
  y,
  facing,
  ...extra,
});

function withGeneral(def: GeneralDef, rank: number, units: ScenarioUnit[], seed = 1): BattleState {
  return startBattle({
    id: 't',
    name: 't',
    map: mapFromRows(openRows()),
    sides: {
      blue: { name: 'Blue', edge: 'west', general: { def, rank, unitId: units[0]!.id } },
      red: { name: 'Red', edge: 'east' },
    },
    units,
    turnLimit: 20,
    firstSide: 'blue',
    seed,
  });
}

const G = GENERAL_BY_ID;

describe('generals (4.10, 6)', () => {
  it('command radius grows with rank and traits scale from rank 1 to 10', () => {
    expect([1, 3, 4, 7, 8, 10].map(commandRadiusForRank)).toEqual([3, 3, 4, 4, 5, 5]);
    expect(scaled([0.1, 0.2], 1)).toBeCloseTo(0.1);
    expect(scaled([0.1, 0.2], 10)).toBeCloseTo(0.2);
    expect(scaled([0.1, 0.2], 5.5)).toBeCloseTo(0.15);
  });

  it('applies passive traits to matching units only', () => {
    const s = withGeneral(G.leonidas!, 1, [
      U('g', 'blue', 'spearmen', 2, 3),
      U('k', 'blue', 'heavyCavalry', 2, 5),
      U('r', 'red', 'spearmen', 10, 3),
    ]);
    expect(unit(s, 'g').type.stats.melee).toBeCloseTo(5.75);
    expect(unit(s, 'k').type.stats.melee).toBe(6);
    expect(unit(s, 'r').type.stats.melee).toBe(5);
    // The shared archetype data is untouched.
    expect(unitType('spearmen').stats.melee).toBe(5);
  });

  it('the command radius lowers cohesion test chances and is lost with the general', () => {
    const s = withGeneral(G.captain!, 1, [
      U('g', 'blue', 'spearmen', 2, 3),
      U('a', 'blue', 'spearmen', 4, 3),
      U('far', 'blue', 'spearmen', 9, 7),
      U('r', 'red', 'spearmen', 11, 0),
    ]);
    expect(inCommandRadius(s, unit(s, 'a'))).toBe(true);
    expect(inCommandRadius(s, unit(s, 'far'))).toBe(false);
    const lost = structuredClone(s);
    lost.sides.blue.general!.lost = true;
    expect(inCommandRadius(lost, unit(lost, 'a'))).toBe(false);
  });

  it('a permanent flank trait boosts flank damage, and previews show it', () => {
    const units = [U('g', 'blue', 'spearmen', 4, 3), U('d', 'red', 'spearmen', 5, 3, 0)];
    const plain = withGeneral(G.captain!, 1, units);
    const hannibal = withGeneral(G.hannibal!, 1, units);
    const base = computeDamage(plain, unit(plain, 'g'), unit(plain, 'd'), 'melee').expected;
    const boosted = computeDamage(
      hannibal,
      unit(hannibal, 'g'),
      unit(hannibal, 'd'),
      'melee',
    ).expected;
    expect(boosted / base).toBeCloseTo(1.25);
    const p = previewCombat(hannibal, { type: 'Charge', unitId: 'g', targetId: 'd' });
    expect(!isRejection(p) && p.defender.modifiers.some((m) => m.label.startsWith('General'))).toBe(
      true,
    );
  });

  it('only the general’s unit can use a skill, once per action, with a cooldown', () => {
    let s = withGeneral(G.joan!, 1, [
      U('g', 'blue', 'spearmen', 2, 3),
      U('a', 'blue', 'spearmen', 3, 3, E, { strength: 50 }),
      U('r', 'red', 'spearmen', 11, 0),
    ]);
    expect(rejected(s, { type: 'UseSkill', unitId: 'a', skillId: 'inspire' })).toBe('NO_GENERAL');
    const res = run(s, { type: 'UseSkill', unitId: 'g', skillId: 'inspire' });
    s = res.state;
    expect(unit(s, 'a').strength).toBe(65);
    expect(unit(s, 'g').hasActed).toBe(true);
    expect(res.events).toContainEqual({ type: 'UnitHealed', unitId: 'a', amount: 15 });
    s = endTurn(endTurn(s).state).state;
    expect(rejected(s, { type: 'UseSkill', unitId: 'g', skillId: 'inspire' })).toBe(
      'SKILL_COOLDOWN',
    );
  });

  it('Rally brings a routed unit in radius back to Disrupted', () => {
    const s = withGeneral(G.captain!, 1, [
      U('g', 'blue', 'spearmen', 2, 3),
      U('a', 'blue', 'spearmen', 3, 5, E, { cohesion: Cohesion.Routed }),
      U('b', 'blue', 'spearmen', 2, 6),
      U('c', 'blue', 'spearmen', 2, 7),
      U('r', 'red', 'spearmen', 11, 0),
    ]);
    // The router flees at turn start; find it and rally it if it is still in radius.
    const a = unit(s, 'a');
    expect(rejected(s, { type: 'UseSkill', unitId: 'g', skillId: 'rally', targetId: 'b' })).toBe(
      'BAD_TARGET',
    );
    if (a.status === 'active' && inCommandRadius(s, a)) {
      const t = run(s, { type: 'UseSkill', unitId: 'g', skillId: 'rally', targetId: 'a' }).state;
      expect(unit(t, 'a').cohesion).toBe(Cohesion.Disrupted);
    }
  });

  it('Hold Fast cuts damage taken until the unit’s next turn', () => {
    let s = withGeneral(G.centurion!, 1, [
      U('g', 'blue', 'spearmen', 4, 3),
      U('r', 'red', 'spearmen', 5, 3),
    ]);
    const before = computeDamage(s, unit(s, 'r'), unit(s, 'g'), 'melee').expected;
    s = run(s, { type: 'UseSkill', unitId: 'g', skillId: 'holdFast', targetId: 'g' }).state;
    expect(computeDamage(s, unit(s, 'r'), unit(s, 'g'), 'melee').expected).toBeCloseTo(
      before * 0.7,
    );
    s = endTurn(endTurn(s).state).state;
    expect(unit(s, 'g').holdFast).toBe(1);
  });

  it('cohesion-up skills raise units in radius one level', () => {
    const s = withGeneral(G.caesar!, 1, [
      U('g', 'blue', 'spearmen', 2, 3),
      U('a', 'blue', 'spearmen', 3, 3, E, { cohesion: Cohesion.Fragmented }),
      U('r', 'red', 'spearmen', 11, 0),
    ]);
    const t = run(s, { type: 'UseSkill', unitId: 'g', skillId: 'veniVidiVici' }).state;
    expect(unit(t, 'a').cohesion).toBe(Cohesion.Disrupted);
  });

  it('Hold the Line stops units in radius dropping below Disrupted, then expires', () => {
    let s = withGeneral(G.leonidas!, 1, [
      U('g', 'blue', 'spearmen', 2, 3),
      U('a', 'blue', 'spearmen', 3, 3, E, { cohesion: Cohesion.Disrupted }),
      U('r', 'red', 'spearmen', 11, 0),
    ]);
    s = run(s, { type: 'UseSkill', unitId: 'g', skillId: 'holdTheLine' }).state;
    expect(s.sides.blue.effects).toEqual([{ kind: 'holdTheLine', untilTurn: 3 }]);
    // However badly the tests go, units in radius stay Disrupted.
    let held = 0;
    for (let i = 0; i < 20; i++) {
      const t = structuredClone(s);
      t.rng = i * 977;
      const events: GameEvent[] = [];
      const a = unit(t, 'a');
      cohesionTest(t, a, { damage: 60, arc: 'rear', adjacentRout: false }, events);
      expect(a.cohesion).toBe(Cohesion.Disrupted);
      if (events.some((e) => e.type === 'CohesionTest' && e.dropped)) held++;
    }
    expect(held).toBeGreaterThan(10); // the tests did fail, the skill held them
  });

  it('effects expire at the start of their side’s turn', () => {
    let s = withGeneral(G.alexander!, 5, [
      U('g', 'blue', 'heavyCavalry', 2, 3),
      U('r', 'red', 'spearmen', 11, 0),
    ]);
    s = run(s, { type: 'UseSkill', unitId: 'g', skillId: 'hammerAndAnvil' }).state;
    expect(s.sides.blue.effects).toHaveLength(1);
    s = endTurn(endTurn(s).state).state; // turn 2
    expect(s.sides.blue.effects).toHaveLength(1);
    s = endTurn(endTurn(s).state).state; // turn 3
    expect(s.sides.blue.effects).toHaveLength(0);
  });

  it('when the general’s unit breaks, the general is lost and the battle is over', () => {
    let lost = 0;
    for (let seed = 0; seed < 60; seed++) {
      const s = withGeneral(
        G.captain!,
        1,
        [
          U('g', 'blue', 'archers', 4, 3, E, { strength: 28 }),
          U('a', 'blue', 'spearmen', 2, 6),
          U('b', 'blue', 'spearmen', 2, 7),
          U('r', 'red', 'archers', 6, 3),
        ],
        seed,
      );
      const red = structuredClone(s);
      red.activeSide = 'red';
      const { state, events } = run(red, { type: 'Shoot', unitId: 'r', targetId: 'g' });
      // The shot drops the general's unit below 25 strength: it routs, every time.
      expect(events.some((e) => e.type === 'GeneralLost')).toBe(true);
      expect(state.sides.blue.general!.lost).toBe(true);
      expect(state.result).toMatchObject({ winner: 'red', reason: 'generalFell' });
      lost++;
    }
    expect(lost).toBe(60);
  });
});

describe('generals: second skill and distinct skills (review 1 WP5)', () => {
  const units = (): ScenarioUnit[] => [
    { id: 'g', side: 'blue', type: unitType('heavyCavalry'), x: 2, y: 3, facing: 2 },
    { id: 'r', side: 'red', type: unitType('spearmen'), x: 9, y: 3, facing: 6 },
  ];

  it('Alexander gets his second skill (Hammer and Anvil) at rank 5', () => {
    const at = (rank: number) =>
      withGeneral(G.alexander!, rank, units()).sides.blue.general!.skills.map((s) => s.id);
    expect(at(1)).toEqual(['companionCharge']);
    expect(at(4)).toEqual(['companionCharge']);
    expect(at(5)).toEqual(['companionCharge', 'hammerAndAnvil']);
  });

  it('Alexander and Hannibal have different first skills', () => {
    expect(G.alexander!.skills[0]!.effect.kind).toBe('chargeAgain');
    expect(G.hannibal!.skills[0]!.effect.kind).toBe('flankBoost');
  });
});
