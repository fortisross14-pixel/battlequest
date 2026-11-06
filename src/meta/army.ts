import type { ArmyChoice, CampaignBattle } from '../content/campaign/types';
import { ERA_UNIT_BY_ID, eraUnitType } from '../content/eraUnits';
import { GENERAL_BY_ID } from '../content/generals';
import { rankForXp, type Profile } from './profile';

/**
 * Army rules (GAME_DESIGN 5): the battle's unit slots are the only limit. Every slot must
 * be filled, any number of copies of an owned type is allowed, and points are ignored.
 */
export type ArmyProblem =
  | { code: 'slots'; filled: number; slots: number }
  | { code: 'notOwned'; type: string }
  | { code: 'unknownUnit'; type: string }
  | { code: 'generalNotOwned'; id: string }
  | { code: 'generalResting'; id: string }
  | { code: 'generalUnit'; unitIndex: number };

export function armyProblems(p: Profile, b: CampaignBattle, army: ArmyChoice): ArmyProblem[] {
  const out: ArmyProblem[] = [];
  if (army.units.length !== b.maxUnits) {
    out.push({ code: 'slots', filled: army.units.length, slots: b.maxUnits });
  }
  for (const type of new Set(army.units.map((u) => u.type))) {
    if (!ERA_UNIT_BY_ID[type]) out.push({ code: 'unknownUnit', type });
    else if (!p.units[type]) out.push({ code: 'notOwned', type });
  }
  const g = army.general;
  if (g) {
    // The fixed army's general leads this battle only, so the player needn't own them.
    const fixedGeneral = b.fixedArmy?.general?.id === g.id;
    if (!GENERAL_BY_ID[g.id] || (!p.generals[g.id] && !fixedGeneral)) {
      out.push({ code: 'generalNotOwned', id: g.id });
    } else if (p.generals[g.id]?.resting) {
      out.push({ code: 'generalResting', id: g.id });
    }
    if (g.unitIndex < 0 || g.unitIndex >= army.units.length) {
      out.push({ code: 'generalUnit', unitIndex: g.unitIndex });
    }
  }
  return out;
}

export function problemText(p: ArmyProblem): string {
  switch (p.code) {
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
    case 'generalUnit':
      return 'Choose the unit your general rides with.';
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
  return Object.keys(p.generals).filter((id) => GENERAL_BY_ID[id] && !p.generals[id]!.resting);
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
  for (let i = 0; units.length < b.maxUnits && byPower.length; i++) {
    units.push({ type: byPower[i % byPower.length]! });
  }
  for (const u of units) u.level = p.units[u.type]!.level;

  const free = availableGenerals(p);
  const lastGen = last?.general;
  const genId = lastGen && free.includes(lastGen.id) ? lastGen.id : free[0];
  const army: ArmyChoice = { units };
  if (genId) {
    army.general = {
      id: genId,
      rank: rankForXp(p.generals[genId]!.xp),
      unitIndex: lastGen?.id === genId ? Math.min(lastGen.unitIndex, units.length - 1) : 0,
    };
  }
  return army;
}

/** Adds one copy of an owned troop if a slot is free. */
export function addTroop(p: Profile, b: CampaignBattle, army: ArmyChoice, type: string): boolean {
  if (b.fixedArmy || army.units.length >= b.maxUnits || !p.units[type]) return false;
  army.units.push({ type, level: p.units[type]!.level });
  return true;
}

/** Removes the last copy of a troop, keeping the general on a valid unit. */
export function removeTroop(b: CampaignBattle, army: ArmyChoice, type: string): boolean {
  if (b.fixedArmy) return false;
  const i = army.units.map((u) => u.type).lastIndexOf(type);
  if (i < 0) return false;
  army.units.splice(i, 1);
  const g = army.general;
  if (g) {
    if (g.unitIndex === i) g.unitIndex = 0;
    else if (g.unitIndex > i) g.unitIndex -= 1;
  }
  return true;
}
