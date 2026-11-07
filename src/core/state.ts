import { RULES } from './config';
import { chebyshev, frontSquares, isAdjacent, samePos } from './geometry';
import { deployGeneral, type GeneralSetup } from './generals';
import { seedRng } from './rng';
import {
  Cohesion,
  SIDES,
  type BattleMap,
  type BattleState,
  type Dir,
  type MapEdge,
  type Pos,
  type Side,
  type Unit,
  type UnitType,
} from './types';

export interface ScenarioUnit {
  id: string;
  type: UnitType;
  side: Side;
  x: number;
  y: number;
  facing: Dir;
  strength?: number;
  cohesion?: Cohesion;
}

export interface ScenarioSide {
  name: string;
  edge: MapEdge;
  breakpoint?: number;
  general?: GeneralSetup;
}

/** Everything needed to start a battle. Content files produce these. */
export interface Scenario {
  id: string;
  name: string;
  map: BattleMap;
  sides: Record<Side, ScenarioSide>;
  units: ScenarioUnit[];
  turnLimit: number;
  /** Side that wins if the turn limit is reached (a 'hold out' objective). Default: draw. */
  turnLimitWinner?: Side;
  firstSide: Side;
  seed: number;
}

export function createUnit(u: ScenarioUnit): Unit {
  return {
    id: u.id,
    side: u.side,
    type: u.type,
    x: u.x,
    y: u.y,
    facing: u.facing,
    turnStartFacing: u.facing,
    strength: u.strength ?? 100,
    cohesion: u.cohesion ?? Cohesion.Steady,
    status: 'active',
    mpLeft: u.type.stats.mp,
    hasActed: false,
    hasMoved: false,
    bracing: false,
    ammoUsed: false,
    lastShotTurn: -99,
    holdFast: 1,
    fortified: false,
    testudo: false,
    lastStandUntil: 0,
    lastStandUsed: false,
  };
}

/** Builds the initial state. Use `startBattle` in engine.ts to also run the first turn start. */
export function createBattleState(s: Scenario): BattleState {
  const ids = new Set<string>();
  const occupied = new Set<string>();
  for (const u of s.units) {
    if (ids.has(u.id)) throw new Error(`Duplicate unit id ${u.id}`);
    ids.add(u.id);
    const key = `${u.x},${u.y}`;
    if (occupied.has(key)) throw new Error(`Two units on square ${key}`);
    occupied.add(key);
  }
  const side = (id: Side) => ({
    name: s.sides[id].name,
    edge: s.sides[id].edge,
    breakpoint: s.sides[id].breakpoint ?? RULES.victory.defaultBreakpoint,
    general: null,
    effects: [],
  });
  const state: BattleState = {
    map: s.map,
    units: s.units.map(createUnit),
    sides: { blue: side('blue'), red: side('red') },
    turn: 1,
    turnLimit: s.turnLimit,
    turnLimitWinner: s.turnLimitWinner ?? null,
    firstSide: s.firstSide,
    activeSide: s.firstSide,
    engagements: [],
    routedThisTurn: [],
    pendingPursuits: [],
    result: null,
    rng: seedRng(s.seed),
  };
  for (const id of SIDES) {
    const g = s.sides[id].general;
    if (g) deployGeneral(state, id, g);
  }
  return state;
}

// ---------- Queries ----------

export function getUnit(state: BattleState, id: string): Unit | undefined {
  return state.units.find((u) => u.id === id);
}

export function requireUnit(state: BattleState, id: string): Unit {
  const u = getUnit(state, id);
  if (!u) throw new Error(`No unit ${id}`);
  return u;
}

export function isOnMap(u: Unit): boolean {
  return u.status === 'active';
}

export function isRouted(u: Unit): boolean {
  return u.cohesion === Cohesion.Routed;
}

/** Active, on the map and not routed: a unit that fights and exerts a zone of control. */
export function isFighting(u: Unit): boolean {
  return isOnMap(u) && !isRouted(u);
}

export function unitAt(state: BattleState, p: Pos): Unit | undefined {
  return state.units.find((u) => isOnMap(u) && u.x === p.x && u.y === p.y);
}

export function unitsOf(state: BattleState, side: Side): Unit[] {
  return state.units.filter((u) => u.side === side);
}

export function enemiesOf(state: BattleState, u: Unit): Unit[] {
  return state.units.filter((e) => e.side !== u.side && isOnMap(e));
}

export function adjacentEnemies(state: BattleState, u: Unit): Unit[] {
  return enemiesOf(state, u).filter((e) => isAdjacent(e, u));
}

export function isEngaged(state: BattleState, id: string): boolean {
  return state.engagements.some((e) => e.a === id || e.b === id);
}

export function opponentsOf(state: BattleState, id: string): Unit[] {
  return state.engagements
    .filter((e) => e.a === id || e.b === id)
    .map((e) => requireUnit(state, e.a === id ? e.b : e.a));
}

/** True if square `p` is in the front arc of a fighting enemy of `side`. */
export function inEnemyZoc(state: BattleState, side: Side, p: Pos): boolean {
  return state.units.some(
    (e) => e.side !== side && isFighting(e) && frontSquares(e, e.facing).some((s) => samePos(s, p)),
  );
}

/**
 * Whether the unit is inside its general's command radius.
 * Generals arrive in M4; until a side has a general slot this is always false.
 */
export function inCommandRadius(state: BattleState, u: Unit): boolean {
  const g = state.sides[u.side].general;
  if (!g || g.lost) return false;
  const gu = getUnit(state, g.unitId);
  if (!gu || !isFighting(gu)) return false;
  return chebyshev(gu, u) <= g.commandRadius;
}

export function rallyBonus(state: BattleState, side: Side): number {
  const g = state.sides[side].general;
  return g && !g.lost ? g.rallyBonus : 0;
}

export function isCavalryLike(t: UnitType): boolean {
  return t.category === 'cavalry' || t.category === 'chariot';
}

export function hasTag(u: Unit, tag: Unit['type']['tags'][number]): boolean {
  return u.type.tags.includes(tag);
}

export function armyCost(state: BattleState, side: Side): number {
  return unitsOf(state, side).reduce((sum, u) => sum + u.type.stats.cost, 0);
}

/** Cost of units routed, destroyed or fled. */
export function lostCost(state: BattleState, side: Side): number {
  return unitsOf(state, side)
    .filter((u) => u.status !== 'active' || isRouted(u))
    .reduce((sum, u) => sum + u.type.stats.cost, 0);
}

export function isArmyBroken(state: BattleState, side: Side): boolean {
  if (state.sides[side].general?.lost) return true;
  const total = armyCost(state, side);
  return total > 0 && lostCost(state, side) / total >= state.sides[side].breakpoint;
}

export { SIDES };

/** An own unit with nothing left to do this turn: acted with no MP left, or locked in melee. */
export function isSpent(state: BattleState, u: Unit): boolean {
  if (u.side !== state.activeSide) return false;
  return (u.hasActed && u.mpLeft <= 0) || isEngaged(state, u.id);
}
