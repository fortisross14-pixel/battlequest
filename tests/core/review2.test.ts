import { describe, expect, it } from 'vitest';
import {
  hasLineOfSight,
  routUnit,
  startBattle,
  mapFromRows,
  validateCommand,
  type BattleState,
} from '../../src/core';
import { GENERAL_BY_ID } from '../../src/content/generals';
import { unitType } from '../../src/content/units';
import { battle, E, N, openRows, run, unit, W } from './helpers';

/** Owner feedback after review 1: turning, missile range, generals on the map. */

describe('turning costs 1 MP, whatever the angle', () => {
  const s = () =>
    battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 11, 7, W],
      ],
    });

  it('45°, 90° and an about-face all cost 1 MP', () => {
    for (const facing of [1, 0, 6] as const) {
      expect(unit(run(s(), { type: 'Rotate', unitId: 'b', facing }).state, 'b').mpLeft).toBe(7);
    }
  });

  it('a unit can spend all but 1 MP moving and still turn', () => {
    // Spearmen 8 MP: three squares east (6 MP), then turn north (1 MP).
    let t = run(s(), { type: 'Move', unitId: 'b', to: { x: 6, y: 3 } }).state;
    expect(unit(t, 'b').mpLeft).toBe(2);
    t = run(t, { type: 'Rotate', unitId: 'b', facing: N }).state;
    expect(unit(t, 'b').mpLeft).toBe(1);
  });
});

describe('missile range', () => {
  it('basic missile troops reach two empty squares away (distance 3)', () => {
    expect(unitType('archers').stats.range).toBe(3);
    expect(unitType('crossbowmen').stats.range).toBe(3);
    expect(unitType('skirmishers').stats.range).toBe(2);
  });

  it('shoots over a friendly (or enemy) unit in between; woods still block', () => {
    const s = battle({
      units: [
        ['a', 'blue', 'archers', 1, 3, E],
        ['f', 'blue', 'spearmen', 2, 3, E],
        ['t', 'red', 'spearmen', 4, 3, W],
      ],
    });
    expect(hasLineOfSight(s, { x: 1, y: 3 }, { x: 4, y: 3 })).toBe(true);
    expect(validateCommand(s, { type: 'Shoot', unitId: 'a', targetId: 't' })).toBeNull();
    const rows = openRows();
    rows[3] = rows[3]!.slice(0, 2) + 'F' + rows[3]!.slice(3);
    const woods = battle({
      rows,
      units: [
        ['a', 'blue', 'archers', 1, 3, E],
        ['t', 'red', 'spearmen', 4, 3, W],
      ],
    });
    expect(hasLineOfSight(woods, { x: 1, y: 3 }, { x: 4, y: 3 })).toBe(false);
  });
});

describe('generals are units on the map; if one falls, the battle is lost', () => {
  const withGenerals = (): BattleState =>
    startBattle({
      id: 't',
      name: 't',
      map: mapFromRows(openRows()),
      sides: {
        blue: {
          name: 'Blue',
          edge: 'west',
          general: { def: GENERAL_BY_ID.antiquityCaptain!, rank: 1, unitId: 'bg' },
        },
        red: { name: 'Red', edge: 'east' },
      },
      units: [
        { id: 'b', side: 'blue', type: unitType('spearmen'), x: 3, y: 3, facing: E },
        { id: 'b2', side: 'blue', type: unitType('spearmen'), x: 3, y: 5, facing: E },
        { id: 'bg', side: 'blue', type: unitType('generalGuard'), x: 1, y: 4, facing: E },
        { id: 'r', side: 'red', type: unitType('spearmen'), x: 9, y: 4, facing: W },
      ],
      turnLimit: 20,
      firstSide: 'blue',
      seed: 1,
    });

  it('the guard costs nothing, so it does not count towards the breakpoint', () => {
    expect(unitType('generalGuard').stats.cost).toBe(0);
    expect(unitType('generalGuard').tags).toContain('Commander');
  });

  it('a routed general ends the battle at once', () => {
    const s = structuredClone(withGenerals());
    const events: never[] = [];
    routUnit(s, unit(s, 'bg'), 'cohesion', events);
    // Any command re-checks victory.
    const after = run(s, { type: 'Hold', unitId: 'b' }).state;
    expect(after.sides.blue.general!.lost).toBe(true);
    expect(after.result).toMatchObject({ winner: 'red', reason: 'generalFell' });
  });
});
