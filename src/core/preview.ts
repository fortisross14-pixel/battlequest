import { RULES } from './config';
import {
  canEvade,
  computeDamage,
  evadeChance,
  evadePath,
  type DamageCalc,
  type Modifier,
} from './combat';
import { planCommand } from './engine';
import { cohesionDropChance, friendRoutedNearby } from './morale';
import { isRejection, reject, type Rejection } from './rejection';
import { isRouted, requireUnit } from './state';
import { Cohesion, type BattleState, type Unit } from './types';

export interface SidePreview {
  unitId: string;
  /** Expected strength loss (before the ±15% random factor). */
  expectedLoss: number;
  /** Chance to drop at least one cohesion level (1 if the loss forces a rout). */
  cohesionDropChance: number;
  /** Chance to rout from this exchange. */
  routChance: number;
  modifiers: Modifier[];
}

export interface CombatPreview {
  kind: 'charge' | 'shoot';
  /** mayEvade: the target may slip away; the losses shown are for when it is caught. */
  outcome: 'fight' | 'mayEvade' | 'catchRouter';
  /** Chance the target evades (0 unless outcome is mayEvade). */
  evadeChance: number;
  attacker: SidePreview;
  defender: SidePreview;
}

function sidePreview(state: BattleState, victim: Unit, calc: DamageCalc | null): SidePreview {
  const expected = calc ? Math.min(victim.strength, calc.expected) : 0;
  const after = victim.strength - expected;
  let drop = 0;
  let rout = 0;
  if (expected > 0) {
    if (after <= RULES.morale.autoRoutStrength) {
      drop = 1;
      rout = 1;
    } else {
      // The test happens after the damage, so use the reduced strength.
      const hurt = { ...victim, strength: after };
      drop = cohesionDropChance(state, hurt, {
        damage: expected,
        arc: calc!.arc,
        adjacentRout: friendRoutedNearby(state, victim),
      });
      rout = victim.cohesion === Cohesion.Fragmented ? drop : 0;
    }
  }
  return {
    unitId: victim.id,
    expectedLoss: expected,
    cohesionDropChance: drop,
    routChance: rout,
    modifiers: calc?.situational ?? [],
  };
}

/**
 * Expected-value preview of a Charge or Shoot. It runs the real validation and the real
 * damage and cohesion functions on a copy of the state, so it always matches the rules.
 */
export function previewCombat(
  state: BattleState,
  cmd: { type: 'Charge' | 'Shoot'; unitId: string; targetId: string },
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
      attacker: sidePreview(sim, att, null),
      defender: sidePreview(sim, def, calc),
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
      attacker: sidePreview(sim, att, null),
      defender: { ...sidePreview(sim, def, null), expectedLoss: def.strength, routChance: 1 },
    };
  }
  const mayEvade = canEvade(sim, def) && evadePath(sim, def, plan.plan.dir).length > 1;
  const hit = computeDamage(sim, att, def, 'charge');
  const back = computeDamage(sim, def, att, 'counter');
  return {
    kind: 'charge',
    outcome: mayEvade ? 'mayEvade' : 'fight',
    evadeChance: mayEvade ? evadeChance(att, def) : 0,
    attacker: sidePreview(sim, att, back),
    defender: sidePreview(sim, def, hit),
  };
}
