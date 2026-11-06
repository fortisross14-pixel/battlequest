import { RULES } from './config';
import { DIRS, isDiagonal, opposite, samePos, step, turnSteps } from './geometry';
import { cellAt, connects, cutsCorner, elevationAt, inBounds, isPassable } from './map';
import { reject, type Rejection } from './rejection';
import { hasTag, inEnemyZoc, isEngaged, unitAt } from './state';
import type { BattleState, Dir, Pos, Unit } from './types';

const M = RULES.movement;
const EPS = 1e-9;

/** MP needed to turn from one facing to another. Light units turn for free. */
export function turnCost(u: Unit, from: Dir, to: Dir): number {
  if (hasTag(u, 'LightTurn')) return 0;
  const steps = turnSteps(from, to);
  return steps === 4 ? M.aboutFaceCost : steps * M.turnCostPer45;
}

/** Terrain move multiplier for this unit entering `p` (before the uphill factor). */
export function terrainMoveMultiplier(state: BattleState, u: Unit, p: Pos): number {
  const cell = cellAt(state.map, p);
  if (!cell) return Infinity;
  const base = RULES.terrain[cell.terrain].moveCost;
  const isRough = cell.terrain === 'rough' || cell.terrain === 'forest';
  if (!isRough) return base;
  if (hasTag(u, 'RoughTerrainVeryBad') && cell.terrain === 'forest') return Infinity;
  if (hasTag(u, 'RoughTerrainOK')) return M.roughTerrainOkMultiplier;
  if (hasTag(u, 'RoughTerrainBad') || hasTag(u, 'RoughTerrainVeryBad')) {
    return base * M.roughTerrainBadMultiplier;
  }
  return base;
}

/**
 * Cost of a single step (ignoring turning), or null if the step is not allowed:
 * off the map, impassable, occupied, cutting a river corner or crossing a bridge sideways.
 * Set `ignoreOccupant` to the id of a unit whose square counts as free.
 */
export function stepCost(
  state: BattleState,
  u: Unit,
  from: Pos,
  d: Dir,
  ignoreOccupant?: string,
): number | null {
  const to = step(from, d);
  if (!inBounds(state.map, to) || !isPassable(state.map, to)) return null;
  if (!connects(state.map, from, d) || cutsCorner(state.map, from, d)) return null;
  const occ = unitAt(state, to);
  if (occ && occ.id !== u.id && occ.id !== ignoreOccupant) return null;
  const mult = terrainMoveMultiplier(state, u, to);
  if (!Number.isFinite(mult)) return null;
  const uphill = elevationAt(state.map, to) > elevationAt(state.map, from) ? M.uphillMultiplier : 1;
  return (isDiagonal(d) ? M.diagonalCost : M.orthogonalCost) * mult * uphill;
}

/** Search result over (square, facing) states. */
export interface Reachability {
  width: number;
  /** Cost to stand on square i with facing f: costs[i * 8 + f] (Infinity = unreachable). */
  costs: Float64Array;
  prev: Int32Array;
  start: Pos;
  startFacing: Dir;
  mp: number;
}

class MinHeap {
  private items: { k: number; v: number }[] = [];
  get size(): number {
    return this.items.length;
  }
  push(k: number, v: number): void {
    const a = this.items;
    a.push({ k, v });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]!.k <= a[i]!.k) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): { k: number; v: number } {
    const a = this.items;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l]!.k < a[m]!.k) m = l;
        if (r < a.length && a[r]!.k < a[m]!.k) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

export interface SearchOptions {
  mp: number;
  /** Respect zones of control (stop on entering, cannot leave). Routers ignore them. */
  zoc: boolean;
  /** Pay turning costs. */
  turning: boolean;
}

/**
 * Dijkstra over (square, facing). Moving one step in direction d requires facing d,
 * so a path pays for every change of direction. Entering an enemy zone of control
 * ends movement.
 */
export function searchMoves(state: BattleState, u: Unit, opts: SearchOptions): Reachability {
  const { width, height } = state.map;
  const n = width * height * 8;
  const costs = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const startIdx = (u.y * width + u.x) * 8 + u.facing;
  costs[startIdx] = 0;
  const heap = new MinHeap();
  heap.push(0, startIdx);
  const startInZoc = opts.zoc && inEnemyZoc(state, u.side, u);
  const canLeaveStart = !startInZoc || hasTag(u, 'Evade');
  // Step costs and ZOC do not depend on facing: compute each once per square.
  const cells = width * height;
  const stepCache = new Float64Array(cells * 8).fill(NaN); // -1 = step not allowed
  const zocCache = new Int8Array(cells).fill(-1);
  const inZoc = (idx: number, pos: Pos): boolean => {
    if (zocCache[idx] === -1) zocCache[idx] = inEnemyZoc(state, u.side, pos) ? 1 : 0;
    return zocCache[idx] === 1;
  };

  while (heap.size > 0) {
    const { k: cost, v: node } = heap.pop();
    if (cost > costs[node]! + EPS) continue;
    const cellIdx = node >> 3;
    const f = (node & 7) as Dir;
    const pos = { x: cellIdx % width, y: Math.floor(cellIdx / width) };
    const isStart = pos.x === u.x && pos.y === u.y;
    if (isStart && !canLeaveStart) continue;
    if (!isStart && opts.zoc && inZoc(cellIdx, pos)) continue; // must stop here
    for (const d of DIRS) {
      const ci = cellIdx * 8 + d;
      if (Number.isNaN(stepCache[ci])) stepCache[ci] = stepCost(state, u, pos, d) ?? -1;
      const sc = stepCache[ci]!;
      if (sc < 0) continue;
      const nc = cost + (opts.turning ? turnCost(u, f, d) : 0) + sc;
      if (nc > opts.mp + EPS) continue;
      const to = step(pos, d);
      const ni = (to.y * width + to.x) * 8 + d;
      if (nc + EPS < costs[ni]!) {
        costs[ni] = nc;
        prev[ni] = node;
        heap.push(nc, ni);
      }
    }
  }
  return { width, costs, prev, start: { x: u.x, y: u.y }, startFacing: u.facing, mp: opts.mp };
}

/** Cheapest way to stand on `p` with facing `facing`, including the final turn. */
function bestArrival(
  r: Reachability,
  u: Unit,
  p: Pos,
  facing: Dir | undefined,
): { cost: number; arrival: Dir; facing: Dir } | null {
  const base = (p.y * r.width + p.x) * 8;
  let best: { cost: number; arrival: Dir; facing: Dir } | null = null;
  for (const f of DIRS) {
    const c = r.costs[base + f]!;
    if (!Number.isFinite(c)) continue;
    const final = facing ?? f;
    const total = c + turnCost(u, f, final);
    if (total > r.mp + EPS) continue;
    if (!best || total < best.cost - EPS) best = { cost: total, arrival: f, facing: final };
  }
  return best;
}

/** Path from the search start to square `p`, arriving with facing `arrival`. */
export function reconstruct(r: Reachability, p: Pos, arrival: Dir): Pos[] {
  const path: Pos[] = [];
  let node = (p.y * r.width + p.x) * 8 + arrival;
  while (node >= 0) {
    const ci = node >> 3;
    path.push({ x: ci % r.width, y: Math.floor(ci / r.width) });
    node = r.prev[node]!;
  }
  return path.reverse();
}

export interface MovePlan {
  kind: 'move' | 'pullBack';
  /** Squares from the start square to the destination, inclusive. */
  path: Pos[];
  cost: number;
  facing: Dir;
}

/** The square directly behind the unit, if it may pull back there. */
export function pullBackPlan(state: BattleState, u: Unit): MovePlan | null {
  if (isEngaged(state, u.id) || !inEnemyZoc(state, u.side, u)) return null;
  const back = opposite(u.facing);
  const sc = stepCost(state, u, u, back);
  if (sc === null || sc > u.mpLeft + EPS) return null;
  return {
    kind: 'pullBack',
    path: [{ x: u.x, y: u.y }, step(u, back)],
    cost: sc,
    facing: u.facing,
  };
}

export function searchFor(state: BattleState, u: Unit): Reachability {
  return searchMoves(state, u, { mp: u.mpLeft, zoc: true, turning: true });
}

/** Validates and plans a move. Assumes the unit may act (checked by the command layer). */
export function planMove(
  state: BattleState,
  u: Unit,
  to: Pos,
  facing?: Dir,
  reach?: Reachability,
): MovePlan | Rejection {
  if (samePos(u, to))
    return reject('SAME_SQUARE', 'The unit is already there. Use Rotate to turn.');
  if (isEngaged(state, u.id)) return reject('ENGAGED', 'Units in melee cannot move.');
  const pb = pullBackPlan(state, u);
  if (pb && samePos(pb.path[1]!, to) && (facing === undefined || facing === u.facing)) return pb;
  const r = reach ?? searchFor(state, u);
  const best = bestArrival(r, u, to, facing);
  if (!best) {
    if (inEnemyZoc(state, u.side, u) && !hasTag(u, 'Evade')) {
      return reject(
        'IN_ZOC',
        'The unit is in an enemy zone of control: it can only charge or pull back one square.',
      );
    }
    const occ = unitAt(state, to);
    if (occ) return reject('UNREACHABLE', 'That square is occupied.');
    if (!inBounds(state.map, to) || !isPassable(state.map, to)) {
      return reject('UNREACHABLE', 'That square is impassable.');
    }
    if (!Number.isFinite(terrainMoveMultiplier(state, u, to))) {
      return reject('UNREACHABLE', 'This unit cannot enter that terrain.');
    }
    return reject('NOT_ENOUGH_MP', 'Not enough movement points to get there.');
  }
  return {
    kind: 'move',
    path: reconstruct(r, to, best.arrival),
    cost: best.cost,
    facing: best.facing,
  };
}

export interface ReachableSquare {
  pos: Pos;
  cost: number;
  /** Facing after arriving by the cheapest path. */
  facing: Dir;
  kind: 'move' | 'pullBack';
}

/** All squares the unit can move to this turn (for highlights). */
export function reachableSquares(state: BattleState, u: Unit): ReachableSquare[] {
  if (isEngaged(state, u.id)) return [];
  const r = searchFor(state, u);
  const out: ReachableSquare[] = [];
  const { width, height } = state.map;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === u.x && y === u.y) continue;
      const best = bestArrival(r, u, { x, y }, undefined);
      if (best) out.push({ pos: { x, y }, cost: best.cost, facing: best.facing, kind: 'move' });
    }
  }
  const pb = pullBackPlan(state, u);
  if (pb && !out.some((s) => samePos(s.pos, pb.path[1]!))) {
    out.push({ pos: pb.path[1]!, cost: pb.cost, facing: pb.facing, kind: 'pullBack' });
  }
  return out;
}
