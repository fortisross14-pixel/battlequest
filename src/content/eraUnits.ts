import type { UnitStats, UnitTag, UnitType } from '../core/types';
import type { Rarity } from '../core/generals';
import { ARCHETYPES, type ArchetypeId } from './units';

/** Troop rarities: generals also have Uncommon (GAME_DESIGN 5.1), troops never do. */
export type TroopRarity = Exclude<Rarity, 'uncommon'>;

/**
 * The per-age card ladders (GAME_DESIGN 5.1), built from the history briefs in
 * docs/history/. An era unit is an archetype plus at most ±1 on two stats and at most one
 * extra tag (add-unit skill); its rarity and age then set its power tier (LADDER_POWER).
 */
export interface EraUnitDef {
  id: string;
  name: string;
  age: number;
  archetype: ArchetypeId;
  rarity: TroopRarity;
  flavor: string;
  /** From the history brief, as written. */
  history: string;
  mods?: Partial<Record<keyof UnitStats, -1 | 1>>;
  /** A Legendary's signature ability, or another specialty. */
  extraTag?: UnitTag;
  /** Only enemy armies field it: never in packs, rewards or the Army screen. */
  enemyOnly?: true;
}

/**
 * Power tiers (GAME_DESIGN 5.1). Melee, Impact, Ranged and Armor are multiplied by the
 * rarity factor and by `perAge` once per age. Damage depends on attack / (attack + armor),
 * so a unit scaled by P trades about P times as well as the unit it is compared with.
 * Morale grows more slowly (it already cuts every cohesion test), and not by age, so a
 * battle between troops of one age plays the same in every age. Cost scales like power:
 * it sets breakpoints and star losses.
 */
export const LADDER_POWER = {
  rarity: { common: 1, rare: 1.2, epic: 1.45, legendary: 1.75 } as Record<TroopRarity, number>,
  perAge: 1.4,
  moraleExponent: 0.5,
};

export const ERA_UNITS: EraUnitDef[] = [
  // ---------- Age 0 ----------
  {
    id: 'bronzeAgeSpearmen',
    name: 'Bronze Age spearmen',
    age: 0,
    archetype: 'spearmen',
    rarity: 'common',
    flavor: 'Shield and spear: the ground beneath the chariots.',
    history:
      'New Kingdom armies combined infantry, archers and chariots. Spearmen guarded camps and held the ground required by chariots, but were not later pike formations.',
    mods: { armor: -1, mp: 1 },
  },
  {
    id: 'bronzeAgeArchers',
    name: 'Bronze Age archers',
    age: 0,
    archetype: 'archers',
    rarity: 'common',
    flavor: 'Composite-bow volleys before the clash.',
    history:
      'The composite bow was a major Egyptian weapon both on foot and from chariots. Archers supported manoeuvre but suffered if caught in close combat.',
  },
  {
    id: 'bronzeAgeChariots',
    name: 'Bronze Age chariots',
    age: 0,
    archetype: 'chariots',
    rarity: 'common',
    flavor: 'Fast wheels, open ground, and a decisive flank.',
    history:
      'Chariots were elite vehicles whose exact design and crew varied by army. They needed firm, open ground and combined speed, missile fire and shock rather than functioning as later cavalry.',
    mods: { ranged: 1, impact: -1 },
  },
  // ---------- Age 1 ----------
  {
    id: 'antiquitySpearmen',
    name: 'Antiquity spearmen',
    age: 1,
    archetype: 'spearmen',
    rarity: 'common',
    flavor: 'A steady front.',
    history:
      'Antiquity spearmen represent a historically attested battlefield role in Mediterranean and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { armor: 1 },
  },
  {
    id: 'antiquityArchers',
    name: 'Antiquity archers',
    age: 1,
    archetype: 'archers',
    rarity: 'common',
    flavor: 'Arrows soften the line.',
    history:
      'Antiquity archers represent a historically attested battlefield role in Mediterranean and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
  },
  {
    id: 'antiquitySkirmishers',
    name: 'Antiquity skirmishers',
    age: 1,
    archetype: 'skirmishers',
    rarity: 'common',
    flavor: 'Javelins, then distance.',
    history:
      'Antiquity skirmishers represent a historically attested battlefield role in Greek and Near Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { mp: 1 },
  },
  {
    id: 'antiquityLightCavalry',
    name: 'Antiquity light cavalry',
    age: 1,
    archetype: 'lightCavalry',
    rarity: 'common',
    flavor: 'Find the flank.',
    history:
      'Antiquity light cavalry represent a historically attested battlefield role in Achaemenid and steppe armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
  },
  {
    id: 'hoplitePhalanx',
    name: 'Hoplite phalanx',
    age: 1,
    archetype: 'spearmen',
    rarity: 'rare',
    flavor: 'Shield to shield.',
    history:
      'Hoplite phalanx represent a historically attested battlefield role in Greek city-states forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { armor: 1, morale: 1 },
  },
  {
    id: 'persianShieldArchers',
    name: 'Persian shield archers',
    age: 1,
    archetype: 'archers',
    rarity: 'rare',
    flavor: 'A wicker wall and arrows.',
    history:
      'Persian shield archers represent a historically attested battlefield role in Achaemenid Persia forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { armor: 1, ranged: -1 },
  },
  {
    id: 'spartanHoplites',
    name: 'Spartan hoplites',
    age: 1,
    archetype: 'spearmen',
    rarity: 'rare',
    flavor: 'A disciplined narrow front.',
    history:
      'Spartan hoplites represent a historically attested battlefield role in Sparta forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { melee: 1, morale: 1 },
  },
  {
    id: 'macedonianPhalanx',
    name: 'Macedonian phalanx',
    age: 1,
    archetype: 'pikemen',
    rarity: 'rare',
    flavor: 'A hedge of sarissas.',
    history:
      'Macedonian phalanx represent a historically attested battlefield role in Macedon forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { morale: 1, armor: -1 },
  },
  {
    id: 'companionCavalry',
    name: 'Companion cavalry',
    age: 1,
    archetype: 'heavyCavalry',
    rarity: 'legendary',
    flavor: 'The wedge seeks the gap.',
    history:
      'Companion cavalry represent a historically attested battlefield role in Macedon forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { impact: 1, morale: 1 },
    extraTag: 'LightTurn',
  },
  {
    id: 'thebanSacredBand',
    name: 'Theban Sacred Band',
    age: 1,
    archetype: 'heavySwordsmen',
    rarity: 'epic',
    flavor: 'Elite at the decisive point.',
    history:
      'Theban Sacred Band represent a historically attested battlefield role in Thebes forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { melee: 1, morale: 1 },
  },
  {
    id: 'indianElephants',
    name: 'Indian war elephants',
    age: 1,
    archetype: 'warElephants',
    rarity: 'epic',
    flavor: 'A living wall.',
    history:
      'Indian war elephants represent a historically attested battlefield role in Paurava kingdom forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { morale: 1, mp: -1 },
  },
  // Enemy-only: a real elite troop the player meets but never collects.
  {
    id: 'scythedChariots',
    name: 'Scythed chariots',
    age: 1,
    archetype: 'chariots',
    rarity: 'rare',
    flavor: 'Blades on the axles, meant to cut lanes through the phalanx.',
    history:
      'Darius III fielded scythed chariots at Gaugamela; Alexander’s troops opened lanes and let most of them pass (Arrian, Anabasis 3.13).',
    mods: { ranged: -1, armor: -1 },
    extraTag: 'Scythed',
    enemyOnly: true,
  },
  // ---------- Age 2 ----------
  {
    id: 'classicalSpearmen',
    name: 'Classical spearmen',
    age: 2,
    archetype: 'spearmen',
    rarity: 'common',
    flavor: 'A disciplined centre.',
    history:
      'Classical spearmen represent a historically attested battlefield role in Hellenistic and eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { armor: 1 },
  },
  {
    id: 'classicalArchers',
    name: 'Classical archers',
    age: 2,
    archetype: 'archers',
    rarity: 'common',
    flavor: 'Missiles before contact.',
    history:
      'Classical archers represent a historically attested battlefield role in Eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
  },
  {
    id: 'classicalSkirmishers',
    name: 'Classical skirmishers',
    age: 2,
    archetype: 'skirmishers',
    rarity: 'common',
    flavor: 'A fast screen.',
    history:
      'Classical skirmishers represent a historically attested battlefield role in Mediterranean armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { mp: 1 },
  },
  {
    id: 'classicalLightCavalry',
    name: 'Classical light cavalry',
    age: 2,
    archetype: 'lightCavalry',
    rarity: 'common',
    flavor: 'Harass and exploit.',
    history:
      'Classical light cavalry represent a historically attested battlefield role in Mediterranean and eastern armies forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
  },
  {
    id: 'romanLegionaries',
    name: 'Roman legionaries',
    age: 2,
    archetype: 'heavySwordsmen',
    rarity: 'rare',
    flavor: 'Pila, shield, and sustained pressure.',
    history:
      'Roman legionaries represent a historically attested battlefield role in Roman Republic and Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { armor: 1, morale: 1 },
  },
  {
    id: 'carthaginianCavalry',
    name: 'Carthaginian cavalry',
    age: 2,
    archetype: 'lightCavalry',
    rarity: 'rare',
    flavor: 'Win the wing, then return.',
    history:
      'Carthaginian cavalry represent a historically attested battlefield role in Carthage and Numidia forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { mp: 1, armor: -1 },
  },
  {
    id: 'hellenisticPhalanx',
    name: 'Hellenistic phalanx',
    age: 2,
    archetype: 'pikemen',
    rarity: 'rare',
    flavor: 'Powerful to the front.',
    history:
      'Hellenistic phalanx represent a historically attested battlefield role in Macedonian kingdoms forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { morale: 1, armor: -1 },
    enemyOnly: true,
  },
  {
    id: 'parthianHorseArchers',
    name: 'Parthian horse archers',
    age: 2,
    archetype: 'lightCavalry',
    rarity: 'rare',
    flavor: 'Distance is their armour.',
    history:
      'Parthian horse archers represent a historically attested battlefield role in Parthia forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { ranged: 1, melee: -1 },
  },
  {
    id: 'romanAuxiliaries',
    name: 'Roman auxiliaries',
    age: 2,
    archetype: 'archers',
    rarity: 'rare',
    flavor: 'Empire-wide specialist support.',
    history:
      'Roman auxiliaries represent a historically attested battlefield role in Roman Empire forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { ranged: 1, morale: -1 },
  },
  {
    id: 'cataphracts',
    name: 'Cataphracts',
    age: 2,
    archetype: 'heavyCavalry',
    rarity: 'epic',
    flavor: 'Armoured shock at full weight.',
    history:
      'Cataphracts represent a historically attested battlefield role in Parthia and late Rome forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { armor: 1, mp: -1 },
  },
  {
    id: 'classicalElephants',
    name: 'Classical war elephants',
    age: 2,
    archetype: 'warElephants',
    rarity: 'epic',
    flavor: 'A living wall and a dangerous rout.',
    history:
      'Classical war elephants represent a historically attested battlefield role in Carthage and Hellenistic kingdoms forces. Their small stat shift is a game abstraction, not a claim that every formation fought identically.',
    mods: { morale: 1, mp: -1 },
  },

  // Prompt 06: the Classical Legendary troop, added to the brief's ladder.
  {
    id: 'legioX',
    name: 'Legio X Equestris',
    age: 2,
    archetype: 'heavySwordsmen',
    rarity: 'legendary',
    flavor: 'Caesar’s Tenth: his favourite legion, and the first to be trusted.',
    history:
      'Caesar’s Tenth Legion was his most trusted unit in the Gallic War; he mounted it on horses to escort him to Ariovistus (Gallic War 1.42), and at Pharsalus it held his right, where his reserve cohorts used their pila as spears against Pompey’s cavalry (Civil War 3.89–93).',
    mods: { melee: 1, morale: 1 },
    extraTag: 'AntiCavalry',
  },
];

export const ERA_UNIT_BY_ID: Record<string, EraUnitDef> = Object.fromEntries(
  ERA_UNITS.map((u) => [u.id, u]),
);

/** The playable cards of one age's ladder. */
export function ladder(age: number): EraUnitDef[] {
  return ERA_UNITS.filter((u) => u.age === age && !u.enemyOnly);
}

/** Level bonus (5): +5% Melee, Impact, Ranged and Morale per level above 1. */
export const LEVEL_BONUS = 0.05;

/** Power multiplier of a card from its rarity and age (before levels). */
export function cardPower(def: Pick<EraUnitDef, 'rarity' | 'age'>): number {
  return LADDER_POWER.rarity[def.rarity] * LADDER_POWER.perAge ** def.age;
}

/** Builds the playable unit type: archetype + era modifiers, power tier, then level. */
export function eraUnitType(id: string, level = 1): UnitType {
  const def = ERA_UNIT_BY_ID[id];
  if (!def) throw new Error(`Unknown unit ${id}`);
  const base = ARCHETYPES[def.archetype];
  const stats = { ...base.stats };
  for (const [k, v] of Object.entries(def.mods ?? {})) stats[k as keyof UnitStats] += v;
  const power = cardPower(def);
  for (const k of ['melee', 'impact', 'ranged', 'armor'] as const) stats[k] *= power;
  stats.morale *= LADDER_POWER.rarity[def.rarity] ** LADDER_POWER.moraleExponent;
  stats.cost = Math.round(base.stats.cost * power);
  const lv = 1 + LEVEL_BONUS * (Math.max(1, level) - 1);
  stats.melee *= lv;
  stats.impact *= lv;
  stats.ranged *= lv;
  stats.morale *= lv;
  const tags = def.extraTag ? [...base.tags, def.extraTag] : [...base.tags];
  return { ...base, id: def.id, name: def.name, stats, tags, level: Math.max(1, level) };
}

/**
 * The general's own guard unit, at the power tier of the general's age (GAME_DESIGN 6.1:
 * era sets a general's power tier, as for troops).
 */
export function guardType(age: number): UnitType {
  const base = ARCHETYPES.generalGuard;
  const stats = { ...base.stats };
  const power = LADDER_POWER.perAge ** age;
  for (const k of ['melee', 'impact', 'ranged', 'armor'] as const) stats[k] *= power;
  return { ...base, stats };
}
