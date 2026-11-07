import { RULES } from './config';
import {
  antiCavalryFront,
  computeDamage,
  hasLineOfSight,
  shootingRange,
  type ChargePlan,
  type DamageCalc,
} from './combat';
import { arcOf, isAdjacent, nearestDir, rangeDistance, step } from './geometry';
import { inBounds, isPassable } from './map';
import { reconstruct, searchMoves, stepCost } from './movement';
import { reject, type Rejection } from './rejection';
import { hasTag, isEngaged, isFighting, isOnMap, opponentsOf, unitAt } from './state';
import { Cohesion, type ActionId, type BattleState, type Dir, type Pos, type Unit } from './types';

/**
 * Tactical actions (GAME_DESIGN 4.12): planning (validation, never changing state) and the
 * numbers they need. The engine applies them; the preview reuses these same functions.
 */

const A = RULES.actions;

export function hasAction(u: Unit, a: ActionId): boolean {
  return !!u.type.actions?.includes(a);
}

// ---------- Volley ----------

/** The 2×2 area whose top-left square is `at`. */
export function volleyArea(at: Pos): Pos[] {
  const n = A.volley.size;
  const out: Pos[] = [];
  for (let dy = 0; dy < n; dy++)
    for (let dx = 0; dx < n; dx++) out.push({ x: at.x + dx, y: at.y + dy });
  return out;
}

/** The enemies a Volley at `at` would hit, or why it can't be fired. */
export function planVolley(
  state: BattleState,
  u: Unit,
  at: Pos,
): { targets: Unit[]; area: Pos[] } | Rejection {
  if (!hasAction(u, 'volley')) return reject('NO_ACTION', 'This unit cannot fire a Volley.');
  const s = u.type.stats;
  if (s.ranged <= 0 || s.range <= 0)
    return reject('CANNOT_SHOOT', 'This unit has no missile weapons.');
  if (hasTag(u, 'Reload') && u.lastShotTurn === state.turn - 1)
    return reject('RELOADING', 'Still reloading: this unit can fire every other turn.');
  if (hasTag(u, 'NoMoveAndShoot') && u.hasMoved)
    return reject('MOVED_THIS_TURN', 'This unit cannot move and shoot in the same turn.');
  if (isEngaged(state, u.id)) return reject('ENGAGED', 'Units in melee cannot shoot.');
  const area = volleyArea(at).filter((p) => inBounds(state.map, p));
  const r = shootingRange(state, u);
  const reach = area.some(
    (p) =>
      rangeDistance(u, p) <= r && arcOf(u, u.facing, p) === 'front' && hasLineOfSight(state, u, p),
  );
  if (!reach) return reject('OUT_OF_RANGE', 'No square of the area is in range and in sight.');
  const inArea = area.map((p) => unitAt(state, p)).filter((x): x is Unit => !!x && isOnMap(x));
  if (inArea.some((x) => x.side === u.side))
    return reject('FRIENDLY_FIRE', 'A friendly unit is in the area.');
  const targets = inArea.filter((x) => x.side !== u.side);
  if (targets.some((t) => opponentsOf(state, t.id).some((o) => o.side === u.side)))
    return reject('FRIENDLY_FIRE', 'The area holds a melee with one of your units.');
  if (targets.length === 0) return reject('BAD_TARGET', 'No enemy in the area.');
  return { targets, area };
}

/** One Volley hit: the focused shot's damage at the Volley share. */
export function volleyDamage(state: BattleState, u: Unit, target: Unit): DamageCalc {
  const c = computeDamage(state, u, target, 'ranged');
  return {
    ...c,
    situational: [...c.situational, { label: 'Volley (area)', value: A.volley.factor }],
    expected: c.expected * A.volley.factor,
  };
}

// ---------- Fortify, Testudo, Last stand ----------

export function planStance(
  state: BattleState,
  u: Unit,
  kind: 'fortify' | 'testudo' | 'lastStand',
): Rejection | null {
  if (!hasAction(u, kind)) return reject('NO_ACTION', 'This unit cannot do that.');
  if (!isFighting(u)) return reject('ROUTED', 'Routed units are out of control.');
  if (kind === 'lastStand') {
    return u.lastStandUsed ? reject('USED', 'Last stand is once per battle.') : null;
  }
  if (u.hasActed)
    return reject('ALREADY_ACTED', 'This unit has already used its action this turn.');
  if (isEngaged(state, u.id)) return reject('ENGAGED', 'Not while in melee.');
  const mp = kind === 'fortify' ? A.fortify.mp : A.testudo.mp;
  if (u.mpLeft < mp - 1e-9) return reject('NOT_ENOUGH_MP', `Needs ${mp} MP.`);
  return null;
}

// ---------- Full charge ----------

export interface Breakthrough {
  chance: number;
  /** Where the cavalry would land, already turned to face the target's rear. */
  landing: Pos | null;
  facing: Dir;
  /** Why a breakthrough is impossible, if it is. */
  reason: string | null;
}

/** The Full charge breakthrough chance (GAME_DESIGN 4.12 formula, capped). */
export function breakthrough(
  state: BattleState,
  u: Unit,
  target: Unit,
  plan: ChargePlan,
): Breakthrough {
  const facing = ((plan.dir + 4) % 8) as Dir;
  const landing = step(target, plan.dir);
  const free =
    inBounds(state.map, landing) &&
    isPassable(state.map, landing) &&
    !unitAt(state, landing) &&
    stepCost(state, u, target, plan.dir) !== null;
  if (target.fortified) {
    return { chance: 0, landing: null, facing, reason: 'Fortified spears: no breakthrough' };
  }
  if (antiCavalryFront(target, u)) {
    return {
      chance: 0,
      landing: null,
      facing,
      reason: 'Spears facing the charge: no breakthrough',
    };
  }
  if (!free) return { chance: 0, landing: null, facing, reason: 'No room behind the target' };
  const F = A.fullCharge;
  let p = F.base + F.perPoint * Math.max(0, u.type.stats.impact - target.type.stats.armor);
  if (target.cohesion === Cohesion.Disrupted) p += F.disrupted;
  if (target.cohesion >= Cohesion.Fragmented) p += F.fragmented;
  p += u.type.breakthroughBonus ?? 0;
  return { chance: Math.max(0, Math.min(F.cap, p)), landing, facing, reason: null };
}

export function planFullCharge(u: Unit, plan: ChargePlan): Rejection | null {
  if (!hasAction(u, 'fullCharge'))
    return reject('NO_ACTION', 'This unit cannot make a Full charge.');
  if (plan.path.length - 1 < A.fullCharge.minRunUp) {
    return reject(
      'NO_RUN_UP',
      `A Full charge needs ${A.fullCharge.minRunUp} squares of straight run-up.`,
    );
  }
  return null;
}

// ---------- Othismos ----------

/** The shove's chance to push the enemy back (GAME_DESIGN 4.12). */
export function othismosChance(u: Unit, t: Unit): number {
  const O = A.othismos;
  const p =
    O.base +
    O.perStrength * (u.strength - t.strength) +
    O.perMelee * (u.type.stats.melee - t.type.stats.melee);
  return Math.max(O.min, Math.min(O.max, p));
}

export function planOthismos(
  state: BattleState,
  u: Unit,
  t: Unit,
): { dir: Dir; to: Pos | null } | Rejection {
  if (!hasAction(u, 'othismos')) return reject('NO_ACTION', 'This unit cannot shove.');
  if (u.hasActed)
    return reject('ALREADY_ACTED', 'This unit has already used its action this turn.');
  if (!opponentsOf(state, u.id).some((o) => o.id === t.id) || !isAdjacent(u, t))
    return reject('BAD_TARGET', 'Othismos needs an enemy in melee with this unit.');
  if (arcOf(u, u.facing, t) !== 'front') return reject('NOT_IN_ARC', 'The enemy must be in front.');
  const dir = nearestDir(u, t);
  const to = step(t, dir);
  const ok = inBounds(state.map, to) && isPassable(state.map, to) && !unitAt(state, to);
  return { dir, to: ok ? to : null };
}

// ---------- Parthian shot ----------

/** Squares a Parthian shot may retire to: half MP, ignoring zones of control. */
export function parthianRetreat(state: BattleState, u: Unit): Reachability {
  return searchMoves(state, u, {
    mp: Math.min(u.mpLeft, u.type.stats.mp * A.parthianShot.mpFraction),
    zoc: false,
    turning: false,
  });
}

type Reachability = ReturnType<typeof searchMoves>;

/** The path to retire to `to` after the shot, or why not. */
export function planParthian(state: BattleState, u: Unit, to: Pos): Pos[] | Rejection {
  if (!hasAction(u, 'parthianShot')) return reject('NO_ACTION', 'This unit cannot do that.');
  if (to.x === u.x && to.y === u.y) return [{ x: u.x, y: u.y }];
  if (unitAt(state, to)) return reject('OCCUPIED', 'That square is taken.');
  const r = parthianRetreat(state, u);
  const { width } = state.map;
  let best = -1;
  let bestCost = Infinity;
  for (let f = 0; f < 8; f++) {
    const c = r.costs[(to.y * width + to.x) * 8 + f]!;
    if (c < bestCost) {
      bestCost = c;
      best = f;
    }
  }
  if (best < 0 || !Number.isFinite(bestCost))
    return reject('OUT_OF_REACH', 'Too far to retire after the shot.');
  return reconstruct(r, to, best as Dir);
}

/** The retreat square a Parthian shot uses by default: as far from the enemy as it can get. */
export function parthianDefault(state: BattleState, u: Unit): Pos {
  const r = parthianRetreat(state, u);
  const { width, height } = state.map;
  const enemies = state.units.filter((e) => e.side !== u.side && isFighting(e));
  const dist = (p: Pos) =>
    Math.min(...enemies.map((e) => Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y))));
  let best: Pos = { x: u.x, y: u.y };
  let bestD = dist(best);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const p = { x, y };
      if (unitAt(state, p)) continue;
      let reach = false;
      for (let f = 0; f < 8 && !reach; f++)
        reach = Number.isFinite(r.costs[(y * width + x) * 8 + f]!);
      if (!reach) continue;
      const d = dist(p);
      if (d > bestD) {
        best = p;
        bestD = d;
      }
    }
  return best;
}
