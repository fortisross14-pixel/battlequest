import type { ArmyChoice, CampaignBattle } from '../content/campaign/types';
import { ERA_UNIT_BY_ID, eraUnitType } from '../content/eraUnits';
import { GENERAL_BY_ID } from '../content/generals';
import type { Rarity } from '../core/generals';
import { rankForXp, type Profile } from './profile';

/**
 * Army rules (GAME_DESIGN 5): every slot must be filled with owned troops, points are
 * ignored, and the army limits keep tactics in play: at most 1 Legendary and 2 copies of
 * each Epic (5.1). Commons and Rares can fill any number of slots.
 */
export const ARMY_LIMITS = { legendary: 1, epicCopies: 2 };

export type ArmyProblem =
  | { code: 'slots'; filled: number; slots: number }
  | { code: 'legendaryLimit'; count: number }
  | { code: 'epicLimit'; type: string; count: number }
  | { code: 'notOwned'; type: string }
  | { code: 'unknownUnit'; type: string }
  | { code: 'generalNotOwned'; id: string }
  | { code: 'generalResting'; id: string };

export function armyProblems(p: Profile, b: CampaignBattle, army: ArmyChoice): ArmyProblem[] {
  const out: ArmyProblem[] = [];
  if (army.units.length !== b.maxUnits) {
    out.push({ code: 'slots', filled: army.units.length, slots: b.maxUnits });
  }
  for (const type of new Set(army.units.map((u) => u.type))) {
    if (!ERA_UNIT_BY_ID[type]) out.push({ code: 'unknownUnit', type });
    else if (!p.units[type]) out.push({ code: 'notOwned', type });
  }
  if (!b.fixedArmy) out.push(...limitProblems(army.units.map((u) => u.type)));
  const g = army.general;
  if (g) {
    // The fixed army's general leads this battle only, so the player needn't own them.
    const fixedGeneral = b.fixedArmy?.general?.id === g.id;
    if (!GENERAL_BY_ID[g.id] || (!p.generals[g.id] && !fixedGeneral)) {
      out.push({ code: 'generalNotOwned', id: g.id });
    } else if (p.generals[g.id]?.resting) {
      out.push({ code: 'generalResting', id: g.id });
    }
  }
  return out;
}

/** Army-limit problems for a list of troop types (one entry per slot). */
export function limitProblems(types: string[]): ArmyProblem[] {
  const out: ArmyProblem[] = [];
  const legendary = types.filter((t) => ERA_UNIT_BY_ID[t]?.rarity === 'legendary').length;
  if (legendary > ARMY_LIMITS.legendary) out.push({ code: 'legendaryLimit', count: legendary });
  for (const type of new Set(types)) {
    if (ERA_UNIT_BY_ID[type]?.rarity !== 'epic') continue;
    const count = types.filter((t) => t === type).length;
    if (count > ARMY_LIMITS.epicCopies) out.push({ code: 'epicLimit', type, count });
  }
  return out;
}

/** Whether one more copy of `type` (optionally replacing slot `replacing`) keeps the limits. */
export function withinLimits(army: ArmyChoice, type: string, replacing?: number): boolean {
  const types = army.units.map((u) => u.type).filter((_, i) => i !== replacing);
  return limitProblems([...types, type]).length === 0;
}

/** Why a troop can't go in the army now (for the slot picker), or null. */
export function limitText(army: ArmyChoice, type: string, replacing?: number): string | null {
  if (withinLimits(army, type, replacing)) return null;
  return ERA_UNIT_BY_ID[type]?.rarity === 'legendary'
    ? `Only ${ARMY_LIMITS.legendary} Legendary per army.`
    : `At most ${ARMY_LIMITS.epicCopies} of each Epic.`;
}

export function problemText(p: ArmyProblem): string {
  switch (p.code) {
    case 'legendaryLimit':
      return `Only ${ARMY_LIMITS.legendary} Legendary troop per army (you have ${p.count}).`;
    case 'epicLimit':
      return `At most ${ARMY_LIMITS.epicCopies} ${ERA_UNIT_BY_ID[p.type]?.name ?? p.type} per army (you have ${p.count}).`;
    case 'slots':
      return p.filled < p.slots
        ? `Fill every slot (${p.filled} of ${p.slots}).`
        : `Too many units (${p.filled} of ${p.slots}).`;
    case 'notOwned':
      return `You don't own ${ERA_UNIT_BY_ID[p.type]?.name ?? p.type}.`;
    case 'unknownUnit':
      return `Unknown troop ${p.type}.`;
    case 'generalNotOwned':
      return `You don't have ${GENERAL_BY_ID[p.id]?.name ?? p.id}.`;
    case 'generalResting':
      return `${GENERAL_BY_ID[p.id]?.name ?? p.id} is resting after the last battle.`;
  }
}

/** A difficulty hint only: unit point costs scaled by level. It never blocks anything. */
export function armyPower(units: { type: string; level?: number }[]): number {
  return Math.round(
    units.reduce(
      (s, u) => s + eraUnitType(u.type, u.level).stats.cost * (1 + 0.05 * ((u.level ?? 1) - 1)),
      0,
    ),
  );
}

/**
 * A rough power estimate for a general, for the cards: rarity sets the base and each rank
 * adds a little. A hint only, like army power.
 */
export function generalPower(rarity: Rarity, rank: number): number {
  const base = { common: 20, uncommon: 27, rare: 35, epic: 50, legendary: 65 }[rarity];
  return base + 5 * (Math.max(1, rank) - 1);
}

/** The fixed army of a tutorial battle, with the player's own levels and general rank. */
export function fixedArmyFor(p: Profile, b: CampaignBattle): ArmyChoice | null {
  if (!b.fixedArmy) return null;
  const army = structuredClone(b.fixedArmy);
  for (const u of army.units) u.level = p.units[u.type]?.level ?? 1;
  if (army.general) {
    const owned = p.generals[army.general.id];
    if (owned) army.general.rank = Math.max(army.general.rank, rankForXp(owned.xp));
  }
  return army;
}

/** Generals the player can pick for a battle now. */
export function availableGenerals(p: Profile): string[] {
  return Object.keys(p.generals).filter(
    (id) => GENERAL_BY_ID[id]?.playable && !p.generals[id]!.resting,
  );
}

/**
 * The army the builder opens with: the fixed army, else the last army used here (kept to
 * owned types and cut or padded to the slot count), else the strongest owned troops.
 */
export function startingArmy(p: Profile, b: CampaignBattle): ArmyChoice {
  const fixed = fixedArmyFor(p, b);
  if (fixed) return fixed;
  const owned = Object.keys(p.units).filter((id) => ERA_UNIT_BY_ID[id]);
  const byPower = [...owned].sort(
    (a, c) =>
      armyPower([{ type: c, level: p.units[c]!.level }]) -
      armyPower([{ type: a, level: p.units[a]!.level }]),
  );
  const last = p.lastArmy[b.id];
  const units = (last?.units ?? [])
    .filter((u) => p.units[u.type])
    .slice(0, b.maxUnits)
    .map((u): { type: string; level?: number } => ({ type: u.type }));
  // Fill the free slots with the strongest troops the army limits allow.
  for (let i = 0; units.length < b.maxUnits && i < b.maxUnits * byPower.length; i++) {
    const type = byPower[i % byPower.length]!;
    if (withinLimits({ units }, type)) units.push({ type });
  }
  for (const u of units) u.level = p.units[u.type]!.level;

  const free = availableGenerals(p);
  const lastGen = last?.general;
  const genId = lastGen && free.includes(lastGen.id) ? lastGen.id : free[0];
  const army: ArmyChoice = { units };
  if (genId) {
    army.general = { id: genId, rank: rankForXp(p.generals[genId]!.xp) };
  }
  return army;
}

/** Adds one copy of an owned troop if a slot is free. */
export function addTroop(p: Profile, b: CampaignBattle, army: ArmyChoice, type: string): boolean {
  if (b.fixedArmy || army.units.length >= b.maxUnits || !p.units[type]) return false;
  if (!withinLimits(army, type)) return false;
  army.units.push({ type, level: p.units[type]!.level });
  return true;
}

/** Removes the last copy of a troop. */
export function removeTroop(b: CampaignBattle, army: ArmyChoice, type: string): boolean {
  if (b.fixedArmy) return false;
  const i = army.units.map((u) => u.type).lastIndexOf(type);
  if (i < 0) return false;
  army.units.splice(i, 1);
  return true;
}

/**
 * Puts an owned troop in slot `index` (the slot picker). An index past the end fills the
 * next free slot; a null `type` empties the slot.
 */
export function setSlot(
  p: Profile,
  b: CampaignBattle,
  army: ArmyChoice,
  index: number,
  type: string | null,
): boolean {
  if (b.fixedArmy || index < 0 || index >= b.maxUnits) return false;
  if (type === null) {
    if (index >= army.units.length) return false;
    army.units.splice(index, 1);
    return true;
  }
  if (!p.units[type]) return false;
  if (!withinLimits(army, type, index < army.units.length ? index : undefined)) return false;
  const unit = { type, level: p.units[type]!.level };
  if (index < army.units.length) army.units[index] = unit;
  else army.units.push(unit);
  return true;
}
