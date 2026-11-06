import { playGreedyBattle } from '../../src/ai/greedy';
import { ARCHETYPES, unitType, type ArchetypeId } from '../../src/content/units';
import {
  applyCommand,
  BattleSession,
  mapFromRows,
  requireUnit,
  startBattle,
  type BattleState,
  type Dir,
  type ScenarioUnit,
  type Side,
} from '../../src/core';

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[];

const E: Dir = 2;
const W: Dir = 6;
const N: Dir = 0;

function openMap(w: number, h: number) {
  return mapFromRows(Array.from({ length: h }, () => '.'.repeat(w)));
}

function makeState(
  units: ScenarioUnit[],
  seed: number,
  w: number,
  h: number,
  turnLimit: number,
): BattleState {
  return startBattle({
    id: 'balance',
    name: 'Balance',
    map: openMap(w, h),
    sides: { blue: { name: 'Blue', edge: 'west' }, red: { name: 'Red', edge: 'east' } },
    units,
    turnLimit,
    firstSide: 'blue',
    seed,
  });
}

export type DuelSetup = 'front' | 'flank' | 'charge' | 'brace';
export const DUEL_SETUPS: DuelSetup[] = ['front', 'flank', 'charge', 'brace'];

export interface GameOutcome {
  /** 1 = attacker (A) won, 0 = lost, 0.5 = draw. */
  score: number;
  turns: number;
}

/**
 * One A-vs-B duel. A is blue and acts first.
 * - front / flank: already in melee, A in B's front arc / B's flank.
 * - charge: A charges B frontally from 3 squares away.
 * - brace: as charge, but B is braced (Hold).
 */
export function duel(a: ArchetypeId, b: ArchetypeId, setup: DuelSetup, seed: number): GameOutcome {
  const near = setup === 'front' || setup === 'flank';
  const units: ScenarioUnit[] = [
    { id: 'A', side: 'blue', type: unitType(a), x: near ? 5 : 3, y: 3, facing: E },
    { id: 'B', side: 'red', type: unitType(b), x: 6, y: 3, facing: setup === 'flank' ? N : W },
  ];
  let state = makeState(units, seed, 12, 8, 20);
  if (near) {
    state = structuredClone(state);
    state.engagements.push({ a: 'A', b: 'B' });
  }
  if (setup === 'brace') {
    state = structuredClone(state);
    requireUnit(state, 'B').bracing = true;
  }
  if (setup === 'charge' || setup === 'brace') {
    const res = applyCommand(state, { type: 'Charge', unitId: 'A', targetId: 'B' });
    if (res.ok) state = res.state;
  }
  const session = playGreedyBattle(new BattleSession(state));
  return outcome(session.state, 'blue');
}

function outcome(state: BattleState, sideA: Side): GameOutcome {
  const r = state.result;
  const score = !r || r.winner === null ? 0.5 : r.winner === sideA ? 1 : 0;
  return { score, turns: r?.turn ?? state.turn };
}

/** Equal-points armies of a single archetype each, on open ground. A plays `sideA`. */
export function costBattle(
  a: ArchetypeId,
  b: ArchetypeId,
  sideA: Side,
  seed: number,
  points: number,
): GameOutcome {
  const units: ScenarioUnit[] = [];
  const place = (type: ArchetypeId, side: Side) => {
    const count = Math.max(1, Math.floor(points / ARCHETYPES[type].stats.cost));
    for (let i = 0; i < count; i++) {
      const col = Math.floor(i / 10);
      const row = i % 10;
      const x = side === 'blue' ? 3 - col : 12 + col;
      units.push({
        id: `${side}-${i}`,
        side,
        type: unitType(type),
        x,
        y: row,
        facing: side === 'blue' ? E : W,
      });
    }
  };
  place(a, sideA);
  place(b, sideA === 'blue' ? 'red' : 'blue');
  const session = playGreedyBattle(new BattleSession(makeState(units, seed, 16, 10, 15)));
  return outcome(session.state, sideA);
}
