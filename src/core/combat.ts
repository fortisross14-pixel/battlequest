import { RULES } from './config';
import {
  arcOf,
  cellsBetween,
  rangeDistance,
  step,
  straightLine,
  turnSteps,
  type Arc,
} from './geometry';
import { cellAt, connects, cutsCorner, elevationAt, terrainRules } from './map';
import { flankBoost } from './generals';
import { stepCost, turnCost } from './movement';
import { reject, type Rejection } from './rejection';
import { randomRange } from './rng';
import { hasTag, inEnemyZoc, isCavalryLike, isEngaged, isOnMap, isRouted, unitAt } from './state';
import {
  Cohesion,
  type BattleState,
  type Dir,
  type Pos,
  type TerrainType,
  type Unit,
} from './types';

const C = RULES.combat;

/**
 * - `ranged`: shooting.
 * - `charge`: the charger's impact.
 * - `counter`: the charged unit hitting back at impact.
 * - `melee`: ongoing melee at the end of a side turn.
 */
export type DamageRole = 'ranged' | 'charge' | 'counter' | 'melee';

export interface Modifier {
  label: string;
  value: number;
}

export interface DamageCalc {
  role: DamageRole;
  arc: Arc;
  effAtk: number;
  effDef: number;
  /** Situational multipliers (they stack multiplicatively). */
  situational: Modifier[];
  /** Expected damage before the random factor. */
  expected: number;
}

function product(mods: Modifier[]): number {
  return mods.reduce((p, m) => p * m.value, 1);
}

/** The worse of the two squares decides the terrain a melee or impact is fought in. */
export function fightTerrain(state: BattleState, a: Pos, b: Pos): TerrainType {
  const ca = cellAt(state.map, a)?.terrain ?? 'open';
  const cb = cellAt(state.map, b)?.terrain ?? 'open';
  return RULES.terrain[cb].roughness > RULES.terrain[ca].roughness ? cb : ca;
}

/** Cohesion a unit fights at: a unit in a ford counts as at least Disrupted. */
export function effectiveCohesion(state: BattleState, u: Unit): Cohesion {
  if (terrainRules(state.map, u).countsAsDisrupted && u.cohesion < Cohesion.Disrupted) {
    return Cohesion.Disrupted;
  }
  return u.cohesion;
}

/** True if this AntiCavalry unit has cavalry to its front. */
function antiCavalryFront(def: Unit, cav: Unit): boolean {
  return (
    (hasTag(def, 'AntiCavalry') || hasTag(def, 'AntiCavalryStrong')) &&
    isCavalryLike(cav.type) &&
    arcOf(def, def.facing, cav) === 'front'
  );
}

/** Attack stat after unit-level modifiers (anti-cavalry, terrain). */
function effectiveAttack(state: BattleState, att: Unit, def: Unit, role: DamageRole): Modifier[] {
  const mods: Modifier[] = [];
  const s = att.type.stats;
  const strong = hasTag(att, 'AntiCavalryStrong');
  const usesImpact = role === 'charge' || (role === 'counter' && antiCavalryFront(att, def));
  if (role === 'ranged') mods.push({ label: 'Ranged', value: s.ranged });
  else if (role === 'melee') mods.push({ label: 'Melee', value: s.melee });
  else if (role === 'charge') mods.push({ label: 'Impact', value: s.impact });
  else if (usesImpact) {
    mods.push({ label: 'Impact', value: s.impact });
    mods.push({
      label: 'Braced spears vs cavalry',
      value: strong ? C.antiCavalry.defenderBonusStrong : C.antiCavalry.defenderBonus,
    });
  } else {
    mods.push({ label: 'Melee', value: s.melee });
    mods.push({ label: 'Counter at impact', value: C.defenderMeleeOnImpact });
  }

  if (role === 'charge' && antiCavalryFront(def, att)) {
    const defStrong = hasTag(def, 'AntiCavalryStrong');
    mods.push({
      label: 'Charging spears frontally',
      value: defStrong ? C.antiCavalry.chargerPenaltyStrong : C.antiCavalry.chargerPenalty,
    });
  }
  if (role === 'melee' && antiCavalryFront(att, def)) {
    mods.push({ label: 'Spears vs cavalry', value: C.antiCavalry.meleeBonus });
  }
  if (role === 'melee' && antiCavalryFront(def, att)) {
    mods.push({ label: 'Fighting a spear wall', value: C.antiCavalry.meleeCavalryPenalty });
  }

  if (role !== 'ranged') {
    const terrain = fightTerrain(state, att, def);
    const cav = isCavalryLike(att.type);
    if (terrain === 'rough') {
      if (cav && usesImpact)
        mods.push({ label: 'Rough ground', value: C.terrain.roughCavalryImpact });
      if (!usesImpact && hasTag(att, 'RoughTerrainBad')) {
        mods.push({ label: 'Rough ground', value: C.terrain.roughHeavyCavalryMelee });
      }
    } else if (terrain === 'forest') {
      if (cav) mods.push({ label: 'Cavalry in forest', value: C.terrain.forestCavalry });
      else if (!usesImpact && att.type.light && att.type.category === 'infantry') {
        mods.push({ label: 'Light infantry in forest', value: C.terrain.forestLightInfantryMelee });
      }
    }
  }
  return mods;
}

/** Expected damage `att` deals to `def` in the given role. Shared by real combat and previews. */
export function computeDamage(
  state: BattleState,
  att: Unit,
  def: Unit,
  role: DamageRole,
  opts: { runUp?: number } = {},
): DamageCalc {
  const atkMods = effectiveAttack(state, att, def, role);
  const effAtk = product(atkMods);
  let effDef = def.type.stats.armor * terrainRules(state.map, def).defenderArmor;
  if (role === 'ranged' && hasTag(att, 'ArmorPiercing')) effDef *= C.armorPiercing;

  const arc = arcOf(def, def.facing, att);
  const sit: Modifier[] = [];
  if (role !== 'ranged' && arc !== 'front') {
    sit.push({
      label: arc === 'flank' ? 'Flank attack' : 'Rear attack',
      value: arc === 'flank' ? C.flank : C.rear,
    });
    if (hasTag(def, 'FlankVulnerable'))
      sit.push({ label: 'Flank-vulnerable target', value: C.flankVulnerable });
    const boost = flankBoost(state, att.side);
    if (boost !== 1) sit.push({ label: 'General: flank attack', value: boost });
  }
  // Striking back at an enemy on your own flank or rear (impact counter, or melee with no
  // enemy to the front) is half as effective.
  if ((role === 'counter' || role === 'melee') && arcOf(att, att.facing, def) !== 'front') {
    sit.push({ label: 'Struck in the flank', value: C.flankedStrikeBack });
  }
  // Charge tag: shock troops hit harder after a run-up, except into a spear or pike wall
  // to the front, which stops the gallop.
  if (
    role === 'charge' &&
    hasTag(att, 'Charge') &&
    (opts.runUp ?? 0) >= C.chargeMomentumRunUp &&
    !antiCavalryFront(def, att)
  ) {
    sit.push({ label: 'Full gallop', value: C.chargeMomentum });
  }
  if (elevationAt(state.map, att) > elevationAt(state.map, def))
    sit.push({ label: 'Uphill', value: C.uphill });
  if (role === 'ranged' && terrainRules(state.map, def).cover)
    sit.push({ label: 'Target in cover', value: C.coverVsRanged });
  if (def.bracing) sit.push({ label: 'Target bracing', value: C.bracing });
  if (def.holdFast !== 1) sit.push({ label: 'Target holds fast', value: def.holdFast });
  const coh = effectiveCohesion(state, att);
  if (coh === Cohesion.Disrupted) sit.push({ label: 'Disrupted', value: C.disrupted });
  if (coh >= Cohesion.Fragmented) sit.push({ label: 'Fragmented', value: C.fragmented });
  const scale = C.strengthScaleMin + (1 - C.strengthScaleMin) * (att.strength / 100);
  if (scale < 1) sit.push({ label: 'Attacker losses', value: scale });
  if (role === 'ranged' && rangeDistance(att, def) > shootingRange(state, att) / 2) {
    sit.push({ label: 'Long range', value: C.longRange });
  }

  const expected = effAtk <= 0 ? 0 : C.base * (effAtk / (effAtk + effDef)) * product(sit);
  return { role, arc, effAtk, effDef, situational: sit, expected };
}

/** Applies the random factor. Advances the battle RNG. */
export function rollDamage(state: BattleState, calc: DamageCalc, maxDamage: number): number {
  if (calc.expected <= 0) return 0;
  const raw = calc.expected * randomRange(state, C.randomMin, C.randomMax);
  return Math.max(0, Math.min(maxDamage, Math.round(raw)));
}

// ---------- Shooting ----------

export function shootingRange(state: BattleState, u: Unit): number {
  const bonus =
    u.type.category === 'artillery' && elevationAt(state.map, u) > 0
      ? C.artilleryHillRangeBonus
      : 0;
  return u.type.stats.range + bonus;
}

/** Forest and units block sight unless the shooter is higher; ground higher than both ends always blocks. */
export function hasLineOfSight(state: BattleState, from: Pos, to: Pos): boolean {
  const eFrom = elevationAt(state.map, from);
  const eTo = elevationAt(state.map, to);
  for (const c of cellsBetween(from, to)) {
    const e = elevationAt(state.map, c);
    if (e > Math.max(eFrom, eTo)) return false;
    const blocker = terrainRules(state.map, c).blocksLos || !!unitAt(state, c);
    if (blocker && !(eFrom > e)) return false;
  }
  return true;
}

/** Validates a shot. Assumes the shooter may act. */
export function checkShot(state: BattleState, u: Unit, target: Unit): Rejection | null {
  const s = u.type.stats;
  if (s.ranged <= 0 || s.range <= 0)
    return reject('CANNOT_SHOOT', 'This unit has no missile weapons.');
  if (hasTag(u, 'OneShot') && u.ammoUsed)
    return reject('NO_AMMO', 'This unit has already thrown its volley.');
  if (hasTag(u, 'Reload') && u.lastShotTurn === state.turn - 1) {
    return reject('RELOADING', 'Still reloading: this unit can fire every other turn.');
  }
  if (hasTag(u, 'NoMoveAndShoot') && u.hasMoved) {
    return reject('MOVED_THIS_TURN', 'This unit cannot move and shoot in the same turn.');
  }
  if (isEngaged(state, u.id)) return reject('ENGAGED', 'Units in melee cannot shoot.');
  if (target.side === u.side || !isOnMap(target))
    return reject('BAD_TARGET', 'Not a valid target.');
  if (rangeDistance(u, target) > shootingRange(state, u))
    return reject('OUT_OF_RANGE', 'Target is out of range.');
  if (arcOf(u, u.facing, target) !== 'front')
    return reject('NOT_IN_ARC', 'Target is not in front of the unit.');
  if (!hasLineOfSight(state, u, target))
    return reject('NO_LINE_OF_SIGHT', 'No line of sight to the target.');
  return null;
}

// ---------- Charging ----------

export interface ChargePlan {
  dir: Dir;
  /** Start square to the contact square, inclusive. */
  path: Pos[];
  cost: number;
}

/**
 * A charge is a straight line, in the unit's front arc, into contact with the target.
 * Squares on the way must be free and outside other enemies' zones of control.
 * Assumes the charger may act.
 */
export function planCharge(state: BattleState, u: Unit, target: Unit): ChargePlan | Rejection {
  if (target.side === u.side || !isOnMap(target))
    return reject('BAD_TARGET', 'Not a valid target.');
  if (u.cohesion >= Cohesion.Fragmented)
    return reject('FRAGMENTED', 'Fragmented units cannot charge.');
  if (isEngaged(state, u.id)) return reject('ENGAGED', 'Units already in melee cannot charge.');
  const line = straightLine(u, target);
  if (!line)
    return reject('NO_CHARGE_LINE', 'Charges must go in a straight line (orthogonal or diagonal).');
  const allowedTurn = hasTag(u, 'FrontOnly') ? C.chargeTurnStepsFrontOnly : C.chargeTurnSteps;
  if (turnSteps(u.facing, line.dir) > allowedTurn) {
    return reject(
      'NOT_IN_ARC',
      hasTag(u, 'FrontOnly')
        ? 'This unit can only charge straight ahead.'
        : 'The target must be in front of the unit.',
    );
  }
  let cost = turnCost(u, u.facing, line.dir);
  const path: Pos[] = [{ x: u.x, y: u.y }];
  let pos: Pos = { x: u.x, y: u.y };
  for (let i = 1; i < line.distance; i++) {
    const sc = stepCost(state, u, pos, line.dir);
    if (sc === null) return reject('PATH_BLOCKED', 'The charge path is blocked.');
    pos = step(pos, line.dir);
    if (i < line.distance - 1 && inEnemyZoc(state, u.side, pos)) {
      return reject('PATH_BLOCKED', 'The charge would pass through an enemy zone of control.');
    }
    cost += sc;
    path.push(pos);
  }
  if (!connects(state.map, pos, line.dir))
    return reject('NO_CHARGE_LINE', 'Bridges can only be attacked along the bridge.');
  if (cutsCorner(state.map, pos, line.dir))
    return reject('NO_CHARGE_LINE', 'The charge would cut across impassable ground.');
  if (cost > u.mpLeft + 1e-9)
    return reject('NOT_ENOUGH_MP', 'Not enough movement points to reach the target.');
  return { dir: line.dir, path, cost };
}

/** Whether a charged unit gets out of the way instead of fighting. */
export function canEvade(state: BattleState, target: Unit): boolean {
  return (
    hasTag(target, 'Evade') &&
    !isRouted(target) &&
    target.cohesion < Cohesion.Fragmented &&
    !isEngaged(state, target.id)
  );
}

/** Chance that an evader gets away from this charger: faster units slip away more often. */
export function evadeChance(charger: Unit, evader: Unit): number {
  const m = RULES.movement;
  const p = m.evadeBase + m.evadePerMp * (evader.type.stats.mp - charger.type.stats.mp);
  return Math.min(m.evadeMax, Math.max(m.evadeMin, p));
}

/** Evaders fall back straight away from the charger, up to `evadeSquares` squares. */
export function evadePath(state: BattleState, u: Unit, awayDir: Dir): Pos[] {
  const path: Pos[] = [{ x: u.x, y: u.y }];
  let pos: Pos = { x: u.x, y: u.y };
  for (let i = 0; i < RULES.movement.evadeSquares; i++) {
    if (stepCost(state, u, pos, awayDir) === null) break;
    pos = step(pos, awayDir);
    path.push(pos);
  }
  return path;
}
