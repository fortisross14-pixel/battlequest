import { expect } from 'vitest';
import {
  applyCommand,
  mapFromRows,
  requireUnit,
  startBattle,
  type BattleState,
  type Command,
  type Dir,
  type GameEvent,
  type ScenarioUnit,
  type Side,
  type Unit,
} from '../../src/core';
import { unitType, type ArchetypeId } from '../../src/content/units';

export const N: Dir = 0;
export const NE: Dir = 1;
export const E: Dir = 2;
export const SE: Dir = 3;
export const S: Dir = 4;
export const SW: Dir = 5;
export const W: Dir = 6;
export const NW: Dir = 7;

export function openRows(w = 12, h = 8): string[] {
  return Array.from({ length: h }, () => '.'.repeat(w));
}

export type UnitSpec = [
  id: string,
  side: Side,
  type: ArchetypeId,
  x: number,
  y: number,
  facing?: Dir,
  extra?: Partial<ScenarioUnit>,
];

export interface BattleSpec {
  rows?: string[];
  elevation?: string[];
  units: UnitSpec[];
  seed?: number;
  turnLimit?: number;
}

/** Builds and starts a battle. Blue flees west, red flees east; blue moves first. */
export function battle(spec: BattleSpec): BattleState {
  const units: ScenarioUnit[] = spec.units.map(([id, side, type, x, y, facing, extra]) => ({
    id,
    side,
    type: unitType(type),
    x,
    y,
    facing: facing ?? (side === 'blue' ? E : W),
    ...extra,
  }));
  return startBattle({
    id: 'test',
    name: 'Test',
    map: mapFromRows(spec.rows ?? openRows(), spec.elevation),
    sides: { blue: { name: 'Blue', edge: 'west' }, red: { name: 'Red', edge: 'east' } },
    units,
    turnLimit: spec.turnLimit ?? 20,
    firstSide: 'blue',
    seed: spec.seed ?? 42,
  });
}

/** Applies a command that must succeed. */
export function run(state: BattleState, cmd: Command): { state: BattleState; events: GameEvent[] } {
  const res = applyCommand(state, cmd);
  if (!res.ok)
    throw new Error(`Rejected ${cmd.type}: ${res.rejection.code} ${res.rejection.message}`);
  return { state: res.state, events: res.events };
}

/** Applies a command that must be rejected and returns the rejection code. */
export function rejected(state: BattleState, cmd: Command): string {
  const res = applyCommand(state, cmd);
  expect(res.ok, `expected ${cmd.type} to be rejected`).toBe(false);
  return res.ok ? '' : res.rejection.code;
}

export function unit(state: BattleState, id: string): Unit {
  return requireUnit(state, id);
}

/** Directly edits a unit in a cloned state (test setup only). */
export function withUnit(state: BattleState, id: string, patch: Partial<Unit>): BattleState {
  const s = structuredClone(state);
  Object.assign(requireUnit(s, id), patch);
  return s;
}

export function endTurn(state: BattleState): { state: BattleState; events: GameEvent[] } {
  return run(state, { type: 'EndTurn' });
}
