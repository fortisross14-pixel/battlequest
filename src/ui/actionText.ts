import { RULES } from '../core/config';
import type { ActionId } from '../core/types';
import { ERA_UNIT_BY_ID, ladder } from '../content/eraUnits';
import { RARITY_LABEL } from './screens/common';

const A = RULES.actions;
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Icon, name and one line for each tactical action (GAME_DESIGN 4.12), from the rules. */
export const ACTION_INFO: Record<ActionId, { icon: string; name: string; text: string }> = {
  volley: {
    icon: '⁂',
    name: 'Volley',
    text: `Area fire on a 2×2 frame: each enemy in it takes ${pct(A.volley.factor)} of a focused shot.`,
  },
  fortify: {
    icon: '▣',
    name: 'Fortify',
    text: `${A.fortify.mp} MP: damage taken ×${A.fortify.damageTaken}, no push-back, and charging cavalry can never break through. No charge that turn.`,
  },
  fullCharge: {
    icon: '»',
    name: 'Full charge',
    text: `Needs ${A.fullCharge.minRunUp} squares of run-up and all MP: impact ×${A.fullCharge.impact}, and a chance to burst through and land behind the enemy.`,
  },
  testudo: {
    icon: '⛉',
    name: 'Testudo',
    text: `${A.testudo.mp} MP: missile damage taken ×${A.testudo.rangedTaken} until it moves. No attack that turn.`,
  },
  pilaVolley: {
    icon: '↟',
    name: 'Pila volley',
    text: 'One short-range volley of pila per battle, best thrown just before a charge.',
  },
  othismos: {
    icon: '⇥',
    name: 'Othismos',
    text: 'In melee: a shove that pushes the enemy back a square if it loses, breaking its line.',
  },
  parthianShot: {
    icon: '⟲',
    name: 'Parthian shot',
    text: `Shoot, then retire up to ${pct(A.parthianShot.mpFraction)} of its MP, even out of a zone of control.`,
  },
  feignedRetreat: {
    icon: '↩',
    name: 'Feigned retreat',
    text: `Evades charges on purpose (${pct(A.feignedRetreat.evade)}): the pursuer is left Disrupted.`,
  },
  trample: {
    icon: '✸',
    name: 'Trample',
    text: `Its charge also hits the units either side of the target, at ${pct(A.trample.factor)}.`,
  },
  lastStand: {
    icon: '⚑',
    name: 'Last stand',
    text: `Once per battle: for ${A.lastStand.turns} turns it cannot rout, and fights ×${A.lastStand.melee} in melee.`,
  },
  unbreakable: {
    icon: '◆',
    name: 'Unbreakable',
    text: "Cannot rout while inside its general's command radius.",
  },
};

/**
 * Actions that better cards of the same role (archetype) in the same age have and this one
 * lacks: shown greyed on the card as a teaser ("Rare: Fortify").
 */
export function teaserActions(id: string): { action: ActionId; rarity: string; card: string }[] {
  const def = ERA_UNIT_BY_ID[id];
  if (!def) return [];
  const have = new Set(def.actions ?? []);
  const out: { action: ActionId; rarity: string; card: string }[] = [];
  for (const other of ladder(def.age)) {
    if (other.archetype !== def.archetype || other.id === def.id) continue;
    for (const a of other.actions ?? []) {
      if (have.has(a) || out.some((o) => o.action === a)) continue;
      out.push({ action: a, rarity: RARITY_LABEL[other.rarity], card: other.name });
    }
  }
  return out;
}
