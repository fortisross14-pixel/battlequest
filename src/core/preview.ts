import { RULES } from './config';
import {
  canEvade,
  computeDamage,
  evadeChance,
  evadePath,
  type DamageCalc,
  type Modifier,
} from './combat';
import { meleeTargetOf, planCommand } from './engine';
import type { Arc } from './geometry';
import { cohesionDropChance, friendRoutedNearby } from './morale';
import { isRejection, reject, type Rejection } from './rejection';
import { breakthrough, volleyArea, volleyDamage, type Breakthrough } from './actions';
import { hasTag, isRouted, requireUnit } from './state';
import { Cohesion, type BattleState, type Pos, type Unit } from './types';

export interface SidePreview {
  unitId: string;
  /** Expected strength loss (before the ±15% random factor): impact or shot, plus melee. */
  expectedLoss: number;
  /** Loss from the shot, or from the charge's impact. */
  impactLoss: number;
  /** Loss in the first melee round, which follows a charge in the same side turn. */
  meleeLoss: number;
  /** Chance to drop at least one cohesion level (1 if the loss forces a rout). */
  cohesionDropChance: number;
  /** Chance to rout from this exchange. */
  routChance: number;
  modifiers: Modifier[];
}

export interface CombatPreview {
  kind: 'charge' | 'shoot';
  /** Full charge (GAME_DESIGN 4.12): the chance to break through and where it would land. */
  breakthrough?: Breakthrough;
  /** mayEvade: the target may slip away; the losses shown are for when it is caught. */
  outcome: 'fight' | 'mayEvade' | 'catchRouter';
  /** Chance the target evades (0 unless outcome is mayEvade). */
  evadeChance: number;
  attacker: SidePreview;
  defender: SidePreview;
}

/** One cohesion test after `damage` lands on a unit that had `before` strength. */
function testChance(
  state: BattleState,
  victim: Unit,
  before: number,
  damage: number,
  arc: Arc,
): number {
  if (damage <= 0) return 0;
  const after = before - damage;
  if (after <= RULES.morale.autoRoutStrength) return 1;
  // The test happens after the damage, so use the reduced strength.
  return cohesionDropChance(
    state,
    { ...victim, strength: after },
    {
      damage,
      arc,
      adjacentRout: friendRoutedNearby(state, victim),
    },
  );
}

/** Expected damage multiplier after a cohesion test that drops a level with chance `p`. */
function cohesionFactor(u: Unit, p: number): number {
  const C = RULES.combat;
  if (u.cohesion === Cohesion.Steady) return 1 - p * (1 - C.disrupted);
  if (u.cohesion === Cohesion.Disrupted) return 1 - p * (1 - C.fragmented / C.disrupted);
  return 1;
}

/** Combines up to two cohesion tests (impact, then melee) into drop and rout chances. */
function outcome(
  victim: Unit,
  before: number,
  impact: number,
  melee: number,
  p1: number,
  p2: number,
  modifiers: Modifier[],
): SidePreview {
  const total = impact + melee;
  const autoRout = total > 0 && before - total <= RULES.morale.autoRoutStrength;
  const drop = autoRout ? 1 : 1 - (1 - p1) * (1 - p2);
  // Routing takes one failed test from Fragmented, two from Disrupted.
  let rout = 0;
  if (autoRout || p1 >= 1) rout = 1;
  else if (victim.cohesion === Cohesion.Fragmented) rout = drop;
  else if (victim.cohesion === Cohesion.Disrupted) rout = p1 * p2;
  return {
    unitId: victim.id,
    expectedLoss: total,
    impactLoss: impact,
    meleeLoss: melee,
    cohesionDropChance: drop,
    routChance: rout,
    modifiers,
  };
}

function shotPreview(state: BattleState, victim: Unit, calc: DamageCalc | null): SidePreview {
  const dmg = calc ? Math.min(victim.strength, calc.expected) : 0;
  const p = calc ? testChance(state, victim, victim.strength, dmg, calc.arc) : 0;
  return outcome(victim, victim.strength, dmg, 0, p, 0, calc?.situational ?? []);
}

/**
 * Expected-value preview of a Charge or Shoot. It runs the real validation and the real
 * damage and cohesion functions on a copy of the state, so it always matches the rules.
 * A charge also includes the first melee round, which is fought at the end of the same
 * side turn.
 */
export function previewCombat(
  state: BattleState,
  cmd: { type: 'Charge' | 'Shoot'; unitId: string; targetId: string; full?: boolean },
): CombatPreview | Rejection {
  const plan = planCommand(state, cmd);
  if (isRejection(plan)) return plan;
  if (plan.type !== 'Charge' && plan.type !== 'Shoot')
    return reject('BAD_TARGET', 'Not a combat command.');
  const sim = structuredClone(state);
  const att = requireUnit(sim, cmd.unitId);
  const def = requireUnit(sim, cmd.targetId);

  if (plan.type === 'Shoot') {
    const calc = computeDamage(sim, att, def, 'ranged');
    return {
      kind: 'shoot',
      outcome: 'fight',
      evadeChance: 0,
      attacker: shotPreview(sim, att, null),
      defender: shotPreview(sim, def, calc),
    };
  }

  const contact = plan.plan.path[plan.plan.path.length - 1]!;
  att.x = contact.x;
  att.y = contact.y;
  att.facing = plan.plan.dir;
  if (isRouted(def)) {
    return {
      kind: 'charge',
      outcome: 'catchRouter',
      evadeChance: 0,
      attacker: shotPreview(sim, att, null),
      defender: { ...shotPreview(sim, def, null), expectedLoss: def.strength, routChance: 1 },
    };
  }
  const mayEvade = canEvade(sim, def) && evadePath(sim, def, plan.plan.dir).length > 1;
  const full = !!cmd.full;
  // A Full charge's breakthrough, worked out from where the charger starts (as in the rules).
  const through = full
    ? breakthrough(state, requireUnit(state, att.id), requireUnit(state, def.id), plan.plan)
    : undefined;

  // Impact: both strike at once.
  const hit = computeDamage(sim, att, def, 'charge', { runUp: plan.plan.path.length - 1, full });
  const back = computeDamage(sim, def, att, 'counter');
  const defStart = def.strength;
  const attStart = att.strength;
  const impactDef = Math.min(defStart, hit.expected);
  const impactAtt = Math.min(attStart, back.expected);
  const p1Def = testChance(sim, def, defStart, impactDef, hit.arc);
  const p1Att = testChance(sim, att, attStart, impactAtt, back.arc);

  // First melee round, if neither side routs at impact. The defender strikes the
  // charger only if it is the opponent the real melee phase would pick.
  // Chariots (HitAndRun) fall back after the impact, so there is no melee round.
  // No melee round after a breakthrough: weight it by the chance of being held.
  const fights = hasTag(att, 'HitAndRun')
    ? 0
    : (1 - (p1Def >= 1 ? 1 : 0)) * (1 - (p1Att >= 1 ? 1 : 0)) * (1 - (through?.chance ?? 0));
  def.strength = defStart - impactDef;
  att.strength = attStart - impactAtt;
  sim.engagements.push({ a: att.id, b: def.id });
  const attMelee = computeDamage(sim, att, def, 'melee');
  const defStrikes = meleeTargetOf(sim, def)?.id === att.id;
  const defMelee = defStrikes ? computeDamage(sim, def, att, 'melee') : null;
  const keepAtt = fights * (1 - (att.cohesion === Cohesion.Fragmented ? p1Att : 0));
  const keepDef = fights * (1 - (def.cohesion === Cohesion.Fragmented ? p1Def : 0));
  const meleeDef =
    Math.min(def.strength, attMelee.expected * cohesionFactor(att, p1Att)) * keepAtt * keepDef;
  const meleeAtt = defMelee
    ? Math.min(att.strength, defMelee.expected * cohesionFactor(def, p1Def)) * keepAtt * keepDef
    : 0;
  const p2Def = testChance(sim, def, def.strength, meleeDef, attMelee.arc);
  const p2Att = defMelee ? testChance(sim, att, att.strength, meleeAtt, defMelee.arc) : 0;
  def.strength = defStart;
  att.strength = attStart;

  return {
    kind: 'charge',
    ...(through ? { breakthrough: through } : {}),
    outcome: mayEvade ? 'mayEvade' : 'fight',
    evadeChance: mayEvade ? evadeChance(att, def) : 0,
    attacker: outcome(att, attStart, impactAtt, meleeAtt, p1Att, p2Att, back.situational),
    defender: outcome(def, defStart, impactDef, meleeDef, p1Def, p2Def, hit.situational),
  };
}

export interface VolleyPreview {
  kind: 'volley';
  area: Pos[];
  /** Expected loss and test odds for each enemy in the area. */
  targets: SidePreview[];
  total: number;
}

/**
 * Expected-value preview of a Volley (GAME_DESIGN 4.12): the real validation and the real
 * Volley damage for each enemy in the 2×2 area.
 */
export function previewVolley(
  state: BattleState,
  cmd: { unitId: string; at: Pos },
): VolleyPreview | Rejection {
  const plan = planCommand(state, { type: 'Volley', unitId: cmd.unitId, at: cmd.at });
  if (isRejection(plan)) return plan;
  if (plan.type !== 'Volley') return reject('BAD_TARGET', 'Not a Volley.');
  const att = requireUnit(state, cmd.unitId);
  const targets = plan.targets.map((t) => shotPreview(state, t, volleyDamage(state, att, t)));
  return {
    kind: 'volley',
    area: volleyArea(cmd.at),
    targets,
    total: targets.reduce((a, t) => a + t.expectedLoss, 0),
  };
}
