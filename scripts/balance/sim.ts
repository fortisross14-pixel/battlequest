import { playGreedyBattle } from '../../src/ai/greedy';
import { LegacyAiPlayer } from '../../src/ai/legacy';
import { AiPlayer, playAiSideTurn, type CommandSource, type Posture } from '../../src/ai/utility';
import { buildScenario } from '../../src/content/campaign/build';
import { evaluate } from '../../src/meta/rewards';
import type { ArmyChoice, CampaignBattle } from '../../src/content/campaign/types';
import { ARCHETYPES, unitType, type ArchetypeId } from '../../src/content/units';
import {
  applyCommand,
  BattleSession,
  mapFromRows,
  requireUnit,
  startBattle,
  type BattleState,
  type Dir,
  chebyshev,
  isEngaged,
  isFighting,
  isOnMap,
  isRejection,
  isRouted,
  nearestDir,
  planCharge,
  planMove,
  reachableSquares,
  type Unit,
  type Scenario,
  type ScenarioUnit,
  type Side,
} from '../../src/core';

/** Archetypes a player fields (the general's 0-cost guard is not one). */
export const ARCHETYPE_IDS = (Object.keys(ARCHETYPES) as ArchetypeId[]).filter(
  (id) => ARCHETYPES[id].stats.cost > 0,
);

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
  const session = new BattleSession(makeState(units, seed, 16, 10, 15));
  // The utility AI plays both sides (review 1 WP5: the greedy script misplayed shooters).
  const ais: Record<Side, AiPlayer> = {
    blue: new AiPlayer('blue', { posture: 'aggressive' }),
    red: new AiPlayer('red', { posture: 'aggressive' }),
  };
  for (let i = 0; i < 40 && !session.state.result; i++) {
    playAiSideTurn(
      ais[session.state.activeSide],
      (c) => session.apply(c),
      () => session.state,
    );
  }
  return outcome(session.state, sideA);
}

/** One campaign battle: AI with the battle's test army vs the enemy AI with its posture. */
/** Plays a campaign battle AI against AI and returns the final state. */
export function playCampaignBattle(b: CampaignBattle, seed: number, army: ArmyChoice): BattleState {
  const session = new BattleSession(startBattle(buildScenario(b, army, seed)));
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
  return session.state;
}

export function scenarioBattle(
  b: CampaignBattle,
  seed: number,
  army: ArmyChoice = b.testArmy,
): { won: boolean; turns: number; lostPct: number; stars: number } {
  const session = new BattleSession(startBattle(buildScenario(b, army, seed)));
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
    stars: evaluate(b, s).stars,
  };
}

// ---------- AI vs AI ----------

export interface AiVsAiResult {
  /** 1 = the new AI won, 0 = the legacy AI won, 0.5 = draw. */
  score: number;
  turns: number;
  /** Side turns where a unit idled while a friend within 4 squares was in melee. */
  idle: { new: number; legacy: number };
  /** …and could have charged that friend's opponent (directly or after one move). */
  missed: { new: number; legacy: number };
  /** Unit side turns observed, per AI (for the idle rate). */
  unitTurns: { new: number; legacy: number };
}

const IDLE_RADIUS = 4;

/** Whether the unit could charge an enemy that is in melee with one of its friends. */
function supportChargePossible(state: BattleState, u: Unit): boolean {
  const targets = state.units.filter(
    (e) => e.side !== u.side && isOnMap(e) && isEngaged(state, e.id) && !isRouted(e),
  );
  if (!targets.length) return false;
  const canCharge = (s: BattleState, from: Unit) =>
    targets.some((e) => !isRejection(planCharge(s, from, e)));
  if (canCharge(state, u)) return true;
  for (const r of reachableSquares(state, u)) {
    if (r.kind !== 'move') continue;
    for (const e of targets) {
      const dx = e.x - r.pos.x;
      const dy = e.y - r.pos.y;
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) continue;
      const dir = nearestDir(r.pos, e);
      const plan = planMove(state, u, r.pos, dir);
      if (isRejection(plan)) continue;
      const moved = { ...u, x: r.pos.x, y: r.pos.y, facing: dir, mpLeft: u.mpLeft - plan.cost };
      const sim = { ...state, units: state.units.map((x) => (x.id === u.id ? moved : x)) };
      if (!isRejection(planCharge(sim, moved, e))) return true;
    }
  }
  return false;
}

/**
 * One battle between the new utility AI and the frozen legacy AI on a scenario, with the
 * new AI on `newSide`. Both AIs get the same posture for a side.
 */
export function aiVsAi(
  scenario: Scenario,
  postures: Record<Side, Posture>,
  attackTurn: number | undefined,
  newSide: Side,
): AiVsAiResult {
  const session = new BattleSession(startBattle(scenario));
  const make = (side: Side): CommandSource =>
    side === newSide
      ? new AiPlayer(side, { posture: postures[side], attackTurn })
      : new LegacyAiPlayer(side, { posture: postures[side], attackTurn });
  const ais: Record<Side, CommandSource> = { blue: make('blue'), red: make('red') };
  const idle = { new: 0, legacy: 0 };
  const missed = { new: 0, legacy: 0 };
  const unitTurns = { new: 0, legacy: 0 };
  for (let i = 0; i < 80 && !session.state.result; i++) {
    const side = session.state.activeSide;
    const who = side === newSide ? 'new' : 'legacy';
    const start = session.state;
    const mine = start.units.filter((u) => u.side === side && isFighting(u));
    // Units free to act while a friend nearby is already locked in melee.
    const watch = new Set(
      mine
        .filter(
          (u) =>
            !isEngaged(start, u.id) &&
            mine.some(
              (f) => f.id !== u.id && isEngaged(start, f.id) && chebyshev(f, u) <= IDLE_RADIUS,
            ),
        )
        .map((u) => u.id),
    );
    unitTurns[who] += mine.length;
    const acted = new Set<string>();
    playAiSideTurn(
      ais[side],
      (c) => {
        const r = session.apply(c);
        if (r.ok && (c.type === 'Move' || c.type === 'Charge' || c.type === 'Shoot')) {
          acted.add(c.unitId);
        }
        return r;
      },
      () => session.state,
    );
    // A battle that ends mid-turn leaves later units no chance to act: not idling.
    if (session.state.result) continue;
    for (const id of watch) {
      if (acted.has(id)) continue;
      idle[who]++;
      if (supportChargePossible(start, requireUnit(start, id))) missed[who]++;
    }
  }
  const s = session.state;
  const winner = s.result?.winner;
  return {
    score: winner === newSide ? 1 : winner ? 0 : 0.5,
    turns: s.result?.turn ?? s.turn,
    idle,
    missed,
    unitTurns,
  };
}
