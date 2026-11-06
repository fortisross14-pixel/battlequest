import { RULES } from './config';
import type { GameEvent } from './events';
import { isAdjacent } from './geometry';
import { reject, type Rejection } from './rejection';
import {
  getUnit,
  isEngaged,
  inCommandRadius,
  isCavalryLike,
  isFighting,
  isOnMap,
  isRouted,
  requireUnit,
} from './state';
import {
  Cohesion,
  type BattleState,
  type GeneralSlot,
  type SkillEffect,
  type Side,
  type Unit,
  type UnitStats,
} from './types';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/** Which units a trait applies to. */
export type UnitFilter = 'all' | 'infantry' | 'cavalry' | 'lightCavalry' | 'shooters';

/** [value at rank 1, value at rank 10]; values in between scale linearly. */
export type Scaled = [number, number];

export type GeneralTrait =
  /** Army-wide stat bonus, as a fraction (0.1 = +10%) or a flat add. */
  | { kind: 'statPct'; stat: keyof UnitStats; filter: UnitFilter; value: Scaled }
  | { kind: 'statAdd'; stat: keyof UnitStats; filter: UnitFilter; value: Scaled }
  /** Extra rally chance for units in the command radius. */
  | { kind: 'rally'; value: Scaled }
  /** Permanent flank/rear damage bonus for the whole army (0.15 = +15%). */
  | { kind: 'flank'; value: Scaled };

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  effect: SkillEffect;
  /** Cooldown in turns at [rank 1, rank 10]. */
  cooldown: Scaled;
  unlockRank: number;
}

/** A general as content data (src/content/generals.ts). */
export interface GeneralDef {
  id: string;
  name: string;
  /** Short label for the pennant, e.g. "LEONIDAS". */
  pennant: string;
  rarity: Rarity;
  era: string;
  traitText: string;
  traits: GeneralTrait[];
  skills: SkillDef[];
}

export interface GeneralSetup {
  def: GeneralDef;
  rank: number;
  /** Id of the unit the general rides with. */
  unitId: string;
}

export function scaled(v: Scaled, rank: number): number {
  const r = Math.min(10, Math.max(1, rank));
  return v[0] + ((v[1] - v[0]) * (r - 1)) / 9;
}

/** Command radius by rank (6.1): 3 at rank 1, 4 at rank 4, 5 at rank 8. */
export function commandRadiusForRank(rank: number): number {
  let radius = 0;
  for (const [minRank, r] of RULES.generals.radiusByRank) if (rank >= minRank) radius = r;
  return radius;
}

export function matchesFilter(u: Unit, f: UnitFilter): boolean {
  switch (f) {
    case 'all':
      return true;
    case 'infantry':
      return u.type.category === 'infantry';
    case 'cavalry':
      return isCavalryLike(u.type);
    case 'lightCavalry':
      return u.type.category === 'cavalry' && u.type.light;
    case 'shooters':
      return u.type.stats.ranged > 0 && u.type.stats.range > 1;
  }
}

/** Attaches a general to a side and applies its passive traits to that side's units. */
export function deployGeneral(state: BattleState, side: Side, g: GeneralSetup): void {
  const host = requireUnit(state, g.unitId);
  if (host.side !== side) throw new Error(`General ${g.def.id} must ride with a ${side} unit`);
  let rallyBonus = 0;
  for (const t of g.def.traits) {
    if (t.kind === 'rally') {
      rallyBonus += scaled(t.value, g.rank);
      continue;
    }
    if (t.kind === 'flank') {
      const mult = 1 + scaled(t.value, g.rank);
      // A very late expiry instead of Infinity keeps the state JSON-safe.
      state.sides[side].effects.push({ kind: 'flankBoost', mult, untilTurn: 1e9 });
      continue;
    }
    for (const u of state.units) {
      if (u.side !== side || !matchesFilter(u, t.filter)) continue;
      // Give the unit its own copy of the type before changing its stats.
      u.type = { ...u.type, stats: { ...u.type.stats } };
      const v = scaled(t.value, g.rank);
      if (t.kind === 'statPct') u.type.stats[t.stat] *= 1 + v;
      else u.type.stats[t.stat] += v;
      if (t.stat === 'mp') u.mpLeft = u.type.stats.mp;
    }
  }
  const slot: GeneralSlot = {
    generalId: g.def.id,
    name: g.def.pennant,
    unitId: g.unitId,
    commandRadius: commandRadiusForRank(g.rank),
    rallyBonus,
    skills: g.def.skills
      .filter((s) => g.rank >= s.unlockRank)
      .map((s) => ({
        id: s.id,
        name: s.name,
        effect: s.effect,
        cooldown: Math.round(scaled(s.cooldown, g.rank)),
        readyTurn: 1,
      })),
    lost: false,
  };
  state.sides[side].general = slot;
}

export function generalUnit(state: BattleState, side: Side): Unit | undefined {
  const g = state.sides[side].general;
  return g && !g.lost ? getUnit(state, g.unitId) : undefined;
}

export function skillNeedsTarget(e: SkillEffect): boolean {
  return e.kind === 'rally' || e.kind === 'holdFast';
}

/** Whether `target` is a valid target for the skill. */
export function validSkillTarget(
  state: BattleState,
  e: SkillEffect,
  side: Side,
  target: Unit,
): boolean {
  if (target.side !== side || !isOnMap(target) || !inCommandRadius(state, target)) return false;
  if (e.kind === 'rally') return isRouted(target);
  if (e.kind === 'holdFast') return isFighting(target);
  return false;
}

export interface SkillPlan {
  side: Side;
  skillIndex: number;
  targetId?: string;
}

export function planSkill(
  state: BattleState,
  unit: Unit,
  skillId: string,
  targetId: string | undefined,
): SkillPlan | Rejection {
  const g = state.sides[unit.side].general;
  if (!g || g.lost || g.unitId !== unit.id) {
    return reject('NO_GENERAL', 'Only the unit with the general can use a general skill.');
  }
  const idx = g.skills.findIndex((s) => s.id === skillId);
  const skill = g.skills[idx];
  if (!skill) return reject('NO_GENERAL', 'This general does not have that skill.');
  // Companion Charge is meant to be used after charging.
  if (unit.hasActed && skill.effect.kind !== 'chargeAgain')
    return reject('ALREADY_ACTED', 'This unit has already used its action this turn.');
  if (state.turn < skill.readyTurn) {
    return reject('SKILL_COOLDOWN', `${skill.name} is ready on turn ${skill.readyTurn}.`);
  }
  if (skillNeedsTarget(skill.effect)) {
    const t = targetId ? getUnit(state, targetId) : undefined;
    if (!t || !validSkillTarget(state, skill.effect, unit.side, t)) {
      return reject(
        'BAD_TARGET',
        skill.effect.kind === 'rally'
          ? 'Pick a routed unit inside the command radius.'
          : 'Pick one of your units inside the command radius.',
      );
    }
  }
  return { side: unit.side, skillIndex: idx, targetId };
}

export function resolveSkill(
  state: BattleState,
  unit: Unit,
  plan: SkillPlan,
  events: GameEvent[],
): void {
  const g = state.sides[plan.side].general!;
  const skill = g.skills[plan.skillIndex]!;
  unit.hasActed = true;
  skill.readyTurn = state.turn + skill.cooldown;
  events.push({ type: 'SkillUsed', unitId: unit.id, skillId: skill.id, name: skill.name });
  const inRadius = state.units.filter(
    (u) => u.side === plan.side && isOnMap(u) && inCommandRadius(state, u),
  );
  const e = skill.effect;
  switch (e.kind) {
    case 'rally': {
      const t = requireUnit(state, plan.targetId!);
      events.push({ type: 'UnitRallied', unitId: t.id, from: t.cohesion, to: Cohesion.Disrupted });
      t.cohesion = Cohesion.Disrupted;
      break;
    }
    case 'holdFast': {
      const t = requireUnit(state, plan.targetId!);
      t.holdFast = e.damageTaken;
      break;
    }
    case 'heal':
      for (const u of inRadius) {
        if (!isFighting(u) || u.strength >= 100) continue;
        const amount = Math.min(e.amount, 100 - u.strength);
        u.strength += amount;
        events.push({ type: 'UnitHealed', unitId: u.id, amount });
      }
      break;
    case 'cohesionUp':
      for (const u of inRadius) {
        if (!isFighting(u) || u.cohesion === Cohesion.Steady) continue;
        const from = u.cohesion;
        u.cohesion = (u.cohesion - 1) as Cohesion;
        events.push({ type: 'UnitRallied', unitId: u.id, from, to: u.cohesion });
      }
      break;
    case 'holdTheLine':
      state.sides[plan.side].effects.push({ kind: 'holdTheLine', untilTurn: state.turn + e.turns });
      break;
    case 'chargeAgain':
      for (const u of state.units) {
        if (u.side !== plan.side || !isFighting(u) || isEngaged(state, u.id)) continue;
        if (u.id !== unit.id && !(isCavalryLike(u.type) && isAdjacent(u, unit))) continue;
        u.hasActed = false;
        u.bracing = false;
        u.mpLeft = Math.max(u.mpLeft, u.type.stats.mp * e.mpFraction);
      }
      break;
    case 'flankBoost':
      state.sides[plan.side].effects.push({
        kind: 'flankBoost',
        mult: e.mult,
        untilTurn: state.turn + e.turns,
      });
      break;
  }
}

/** Flank/rear damage multiplier from active side effects (1 = none). */
export function flankBoost(state: BattleState, side: Side): number {
  return state.sides[side].effects.reduce((m, e) => (e.kind === 'flankBoost' ? m * e.mult : m), 1);
}

/** Hold the Line: units in radius cannot drop below Disrupted from cohesion tests. */
export function holdsTheLine(state: BattleState, u: Unit): boolean {
  return (
    state.sides[u.side].effects.some((e) => e.kind === 'holdTheLine') && inCommandRadius(state, u)
  );
}

/** Drops side effects that have run out, at the start of that side's turn. */
export function expireEffects(state: BattleState, side: Side): void {
  state.sides[side].effects = state.sides[side].effects.filter((e) => e.untilTurn > state.turn);
}
