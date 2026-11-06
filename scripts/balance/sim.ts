import { playGreedyBattle } from '../../src/ai/greedy';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { buildScenario } from '../../src/content/campaign/build';
import type { CampaignBattle } from '../../src/content/campaign/types';
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

/** One campaign battle: AI with the battle's test army vs the enemy AI with its posture. */
export function scenarioBattle(
  b: CampaignBattle,
  seed: number,
): { won: boolean; turns: number; lostPct: number } {
  const session = new BattleSession(startBattle(buildScenario(b, b.testArmy, seed)));
  const ais = {
    // A sensible player holds when the objective is to hold out.
    blue: new AiPlayer('blue', {
      posture: b.testPosture ?? (b.holdOut === 'player' ? 'defensive' : 'aggressive'),
    }),
    red: new AiPlayer('red', { posture: b.posture, attackTurn: b.attackTurn }),
  };
  for (let i = 0; i < 80 && !session.state.result; i++) {
    playAiSideTurn(
      ais[session.state.activeSide],
      (c) => session.apply(c),
      () => session.state,
    );
  }
  const s = session.state;
  const total = s.units.filter((u) => u.side === 'blue').reduce((a, u) => a + u.type.stats.cost, 0);
  const lost = s.units
    .filter((u) => u.side === 'blue' && (u.status !== 'active' || u.cohesion === 3))
    .reduce((a, u) => a + u.type.stats.cost, 0);
  return {
    won: s.result?.winner === 'blue',
    turns: s.result?.turn ?? s.turn,
    lostPct: lost / total,
  };
}
