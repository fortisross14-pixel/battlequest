import { RULES } from './config';
import type { GameEvent } from './events';
import { DIRS, isAdjacent, nearestDir, samePos, step, type Arc } from './geometry';
import { distanceToEdge, edgeDir } from './map';
import { reconstruct, searchMoves, stepCost } from './movement';
import { nextRandom } from './rng';
import {
  adjacentEnemies,
  enemiesOf,
  getUnit,
  hasTag,
  inCommandRadius,
  inEnemyZoc,
  isFighting,
  isOnMap,
  isRouted,
  opponentsOf,
  rallyBonus,
} from './state';
import { Cohesion, type BattleState, type Dir, type Pos, type Unit } from './types';

const R = RULES.morale;

export interface CohesionFactors {
  damage: number;
  arc: Arc;
  adjacentRout: boolean;
}

/** Chance that a cohesion test drops the unit one level (section 4.7). */
export function cohesionDropChance(state: BattleState, u: Unit, f: CohesionFactors): number {
  let p = R.baseChance + R.damageFactor * (f.damage / 100);
  if (f.arc === 'flank') p += R.flank;
  if (f.arc === 'rear') p += R.rear;
  if (f.adjacentRout) p += R.adjacentRout;
  if (u.strength < R.lowStrengthThreshold) p += R.lowStrength;
  p -= R.perMorale * u.type.stats.morale;
  if (inCommandRadius(state, u)) p -= R.commandRadius;
  return Math.min(R.maxChance, Math.max(0, p));
}

/** True if a friendly unit next to `u` routed this side turn. */
export function friendRoutedNearby(state: BattleState, u: Unit): boolean {
  return state.routedThisTurn.some((id) => {
    const f = getUnit(state, id);
    return !!f && f.id !== u.id && f.side === u.side && isAdjacent(f, u);
  });
}

function setCohesion(u: Unit, to: Cohesion, events: GameEvent[]): void {
  if (u.cohesion === to) return;
  events.push({ type: 'CohesionChanged', unitId: u.id, from: u.cohesion, to });
  u.cohesion = to;
}

function removeEngagements(state: BattleState, id: string): void {
  state.engagements = state.engagements.filter((e) => e.a !== id && e.b !== id);
}

/** Runs one cohesion test. Drops a level on failure and routs the unit if it falls to Routed. */
export function cohesionTest(
  state: BattleState,
  u: Unit,
  f: CohesionFactors,
  events: GameEvent[],
): void {
  if (!isFighting(u)) return;
  const chance = cohesionDropChance(state, u, f);
  const roll = nextRandom(state);
  const dropped = roll < chance;
  events.push({ type: 'CohesionTest', unitId: u.id, chance, roll, dropped });
  if (!dropped) return;
  if (u.cohesion + 1 >= Cohesion.Routed) routUnit(state, u, 'cohesion', events);
  else setCohesion(u, (u.cohesion + 1) as Cohesion, events);
}

/** Puts a unit to flight. Adjacent friends test immediately. */
export function routUnit(
  state: BattleState,
  u: Unit,
  cause: 'strength' | 'cohesion',
  events: GameEvent[],
): void {
  if (!isFighting(u)) return;
  for (const opp of opponentsOf(state, u.id)) {
    if (hasTag(opp, 'Pursue')) state.pendingPursuits.push({ pursuerId: opp.id, routerId: u.id });
  }
  removeEngagements(state, u.id);
  setCohesion(u, Cohesion.Routed, events);
  u.bracing = false;
  events.push({ type: 'UnitRouted', unitId: u.id, cause });
  state.routedThisTurn.push(u.id);
  testNeighbours(state, u, events);
}

export function destroyUnit(
  state: BattleState,
  u: Unit,
  cause: 'strength' | 'caught',
  events: GameEvent[],
): void {
  if (!isOnMap(u)) return;
  const wasFighting = isFighting(u);
  removeEngagements(state, u.id);
  u.status = 'destroyed';
  u.strength = cause === 'strength' ? 0 : u.strength;
  events.push({ type: 'UnitDestroyed', unitId: u.id, cause });
  if (wasFighting) {
    state.routedThisTurn.push(u.id);
    testNeighbours(state, u, events);
  }
}

/** Friendly units next to a unit that just broke take a test with no damage. */
function testNeighbours(state: BattleState, u: Unit, events: GameEvent[]): void {
  for (const f of state.units) {
    if (f.side === u.side && f.id !== u.id && isFighting(f) && isAdjacent(f, u)) {
      cohesionTest(state, f, { damage: 0, arc: 'front', adjacentRout: true }, events);
    }
  }
}

/**
 * What happens after a unit loses strength: destruction at 0, automatic rout at 25 or less,
 * otherwise a cohesion test.
 */
export function afterDamage(
  state: BattleState,
  u: Unit,
  damage: number,
  arc: Arc,
  events: GameEvent[],
): void {
  if (!isOnMap(u) || damage <= 0) return;
  if (u.strength <= 0) {
    destroyUnit(state, u, 'strength', events);
  } else if (isRouted(u)) {
    return;
  } else if (u.strength <= R.autoRoutStrength) {
    routUnit(state, u, 'strength', events);
  } else {
    cohesionTest(state, u, { damage, arc, adjacentRout: friendRoutedNearby(state, u) }, events);
  }
}

export function applyDamage(u: Unit, amount: number): number {
  const dealt = Math.min(u.strength, amount);
  u.strength -= dealt;
  return dealt;
}

// ---------- Rally ----------

/** Start of a side turn: Routed or Fragmented units near their general may recover a level. */
export function rallyPhase(state: BattleState, events: GameEvent[]): void {
  for (const u of state.units) {
    if (u.side !== state.activeSide || !isOnMap(u)) continue;
    if (u.cohesion < Cohesion.Fragmented) continue;
    if (adjacentEnemies(state, u).some(isFighting)) continue;
    if (!inCommandRadius(state, u)) continue;
    const chance = R.rallyChance + rallyBonus(state, u.side);
    if (nextRandom(state) < chance) {
      const from = u.cohesion;
      u.cohesion = (u.cohesion - 1) as Cohesion;
      events.push({ type: 'UnitRallied', unitId: u.id, from, to: u.cohesion });
    }
  }
}

// ---------- Rout movement ----------

function nearestEnemyDistance(state: BattleState, u: Unit, p: Pos): number {
  let best = Infinity;
  for (const e of enemiesOf(state, u)) {
    if (!isFighting(e)) continue;
    best = Math.min(best, Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)));
  }
  return best;
}

/**
 * A routed unit uses its full MP to run towards its own map edge, ignoring zones of control.
 * Reaching the edge takes it off the map. A router that cannot get away from adjacent
 * enemies is caught and destroyed.
 */
export function routMove(state: BattleState, u: Unit, events: GameEvent[]): void {
  if (!isOnMap(u) || !isRouted(u)) return;
  const edge = state.sides[u.side].edge;
  const r = searchMoves(state, u, { mp: u.type.stats.mp, zoc: false, turning: false });
  const { width, height } = state.map;
  let best: { pos: Pos; dir: number; cost: number; edge: number; enemy: number } | null = null;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Cheapest arrival on this square (any facing), then score the square once.
      let dir = -1;
      let cost = Infinity;
      for (const f of DIRS) {
        const c = r.costs[(y * width + x) * 8 + f]!;
        if (c < cost) {
          cost = c;
          dir = f;
        }
      }
      if (dir < 0) continue;
      const pos = { x, y };
      const cand = {
        pos,
        dir,
        cost,
        edge: distanceToEdge(state.map, pos, edge),
        enemy: nearestEnemyDistance(state, u, pos),
      };
      if (
        !best ||
        cand.edge < best.edge ||
        (cand.edge === best.edge && cand.enemy > best.enemy) ||
        (cand.edge === best.edge && cand.enemy === best.enemy && cand.cost < best.cost)
      ) {
        best = cand;
      }
    }
  }
  const start = { x: u.x, y: u.y };
  if (!best) return;
  if (samePos(best.pos, start)) {
    if (best.edge === 0) {
      u.status = 'fled';
      events.push({ type: 'UnitFled', unitId: u.id });
    } else if (adjacentEnemies(state, u).some(isFighting)) {
      destroyUnit(state, u, 'caught', events);
    }
    return;
  }
  const path = reconstruct(r, best.pos, best.dir as Dir);
  u.x = best.pos.x;
  u.y = best.pos.y;
  u.facing = edgeDir(edge);
  events.push({ type: 'UnitMoved', unitId: u.id, kind: 'rout', path, facing: u.facing });
  if (best.edge === 0) {
    u.status = 'fled';
    events.push({ type: 'UnitFled', unitId: u.id });
  }
}

/** A Pursue unit follows its routed opponent up to two squares, stopping next to it. */
export function pursue(
  state: BattleState,
  pursuerId: string,
  routerId: string,
  events: GameEvent[],
): void {
  const p = getUnit(state, pursuerId);
  const r = getUnit(state, routerId);
  if (!p || !r || !isOnMap(r) || !isFighting(p) || opponentsOf(state, p.id).length > 0) return;
  const path: Pos[] = [{ x: p.x, y: p.y }];
  for (let i = 0; i < RULES.movement.pursuitSquares; i++) {
    if (isAdjacent(p, r) || samePos(p, r)) break;
    const d = nearestDir(p, r);
    if (stepCost(state, p, p, d) === null) break;
    const next = step(p, d);
    p.x = next.x;
    p.y = next.y;
    p.facing = d;
    path.push(next);
    if (inEnemyZoc(state, p.side, p)) break;
  }
  if (path.length > 1) {
    events.push({ type: 'UnitMoved', unitId: p.id, kind: 'pursuit', path, facing: p.facing });
  }
}
