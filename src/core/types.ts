// Core data model. Plain serializable data only: no classes, no functions.

export type Side = 'blue' | 'red';
export const SIDES: readonly Side[] = ['blue', 'red'];
export function otherSide(side: Side): Side {
  return side === 'blue' ? 'red' : 'blue';
}

/** 0 = N, 1 = NE, 2 = E, 3 = SE, 4 = S, 5 = SW, 6 = W, 7 = NW (y grows downwards). */
export type Dir = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type MapEdge = 'north' | 'south' | 'east' | 'west';

export type TerrainType = 'open' | 'rough' | 'forest' | 'river' | 'ford' | 'bridge';

export interface Cell {
  terrain: TerrainType;
  /** 0 = flat, 1-2 = hill levels. */
  elevation: number;
}

export interface BattleMap {
  width: number;
  height: number;
  /** Row-major: index = y * width + x. */
  cells: Cell[];
}

export interface Pos {
  x: number;
  y: number;
}

/** Broad body type, used by terrain and matchup rules. */
export type UnitCategory = 'infantry' | 'cavalry' | 'chariot' | 'elephant' | 'artillery';

export type UnitTag =
  | 'Evade'
  | 'LightTurn'
  | 'RoughTerrainOK'
  | 'RoughTerrainBad'
  | 'RoughTerrainVeryBad'
  | 'ArmorPiercing'
  | 'NoMoveAndShoot'
  | 'AntiCavalry'
  | 'AntiCavalryStrong'
  | 'FrontOnly'
  | 'FlankVulnerable'
  | 'OneShot'
  | 'Charge'
  | 'Pursue'
  | 'ScaresHorses'
  | 'Stampede'
  | 'Reload'
  | 'RainPenalty'
  | 'Formations'
  | 'HelplessInMelee'
  | 'Bounce';

export interface UnitStats {
  mp: number;
  melee: number;
  impact: number;
  ranged: number;
  range: number;
  armor: number;
  morale: number;
  cost: number;
}

/** A unit type: an archetype, possibly re-skinned for an era. */
export interface UnitType {
  id: string;
  name: string;
  archetype: string;
  category: UnitCategory;
  /** Light troops: skirmishers, light cavalry. */
  light: boolean;
  /** Symbol the renderer draws (NATO-inspired). */
  symbol: UnitSymbol;
  stats: UnitStats;
  tags: UnitTag[];
}

export type UnitSymbol =
  | 'infantry'
  | 'skirmisher'
  | 'archer'
  | 'crossbow'
  | 'spear'
  | 'pike'
  | 'cavalry'
  | 'lightCavalry'
  | 'chariot'
  | 'elephant'
  | 'gun'
  | 'artillery';

export enum Cohesion {
  Steady = 0,
  Disrupted = 1,
  Fragmented = 2,
  Routed = 3,
}

export type UnitStatus = 'active' | 'destroyed' | 'fled';

export interface Unit {
  id: string;
  side: Side;
  type: UnitType;
  x: number;
  y: number;
  facing: Dir;
  /** 0-100. */
  strength: number;
  cohesion: Cohesion;
  status: UnitStatus;
  // Per-turn bookkeeping.
  mpLeft: number;
  hasActed: boolean;
  /** True once the unit has left its starting square this turn. */
  hasMoved: boolean;
  /** Braced (Hold) until the start of its side's next turn. */
  bracing: boolean;
  /** For OneShot weapons (pila). */
  ammoUsed: boolean;
  /** Turn number of the last shot (for Reload). */
  lastShotTurn: number;
}

export interface GeneralSlot {
  /** Unit the general is attached to. */
  unitId: string;
  commandRadius: number;
  rallyBonus: number;
}

export interface SideState {
  name: string;
  /** The map edge this side flees towards. */
  edge: MapEdge;
  /** Fraction of total army cost lost (routed + destroyed + fled) that breaks the army. */
  breakpoint: number;
  /** M4 will fill this in. Without a general, command radius checks are always false. */
  general: GeneralSlot | null;
}

export interface Engagement {
  a: string;
  b: string;
}

export type BattleEndReason = 'armyBroken' | 'turnLimit';

export interface BattleResult {
  /** null = draw. */
  winner: Side | null;
  reason: BattleEndReason;
  turn: number;
  broken: Side[];
}

export interface BattleState {
  map: BattleMap;
  units: Unit[];
  sides: Record<Side, SideState>;
  /** Full turn number, starting at 1. One turn = both sides act once. */
  turn: number;
  turnLimit: number;
  firstSide: Side;
  activeSide: Side;
  engagements: Engagement[];
  /** Units that routed during the current side turn (for adjacent-rout tests and rout moves). */
  routedThisTurn: string[];
  /** Pursue-capable units that should follow a router during the next rout phase. */
  pendingPursuits: { pursuerId: string; routerId: string }[];
  result: BattleResult | null;
  /** Seeded RNG state (uint32). */
  rng: number;
}
