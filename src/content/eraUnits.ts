import type { UnitStats, UnitTag, UnitType } from '../core/types';
import type { Rarity } from '../core/generals';
import { ARCHETYPES, type ArchetypeId } from './units';

/**
 * Era units are re-skins of an archetype (GAME_DESIGN 4.5) with at most ±1 on two stats
 * and at most one extra tag (add-unit skill). Later ages cost a little more.
 */
export interface EraUnitDef {
  id: string;
  name: string;
  age: number;
  archetype: ArchetypeId;
  rarity: Rarity;
  flavor: string;
  mods?: Partial<Record<keyof UnitStats, -1 | 1>>;
  extraTag?: UnitTag;
  /** Only enemy armies field it: never in packs, rewards or the Army screen. */
  enemyOnly?: true;
}

/** Extra points per age, so anachronistic armies cost more. */
export const COST_PER_AGE = 3;

export const ERA_UNITS: EraUnitDef[] = [
  // Age 0 – Dawn of War: New Kingdom Egypt, the Canaanite coalition and the Hittites.
  {
    id: 'egyptianSpearmen',
    name: 'Egyptian spearmen',
    age: 0,
    archetype: 'spearmen',
    rarity: 'common',
    flavor: 'Shield and spear: the backbone of Pharaoh’s host.',
    mods: { armor: -1, mp: 1 },
  },
  {
    id: 'egyptianArchers',
    name: 'Egyptian archers',
    age: 0,
    archetype: 'archers',
    rarity: 'common',
    flavor: 'Composite bows, loosed in disciplined volleys.',
  },
  {
    id: 'egyptianChariots',
    name: 'Egyptian chariots',
    age: 0,
    archetype: 'chariots',
    rarity: 'rare',
    flavor: 'Light, fast two-horse chariots with an archer aboard.',
    mods: { ranged: 1, impact: -1 },
  },
  {
    id: 'canaaniteWarriors',
    name: 'Canaanite warriors',
    age: 0,
    archetype: 'heavySwordsmen',
    rarity: 'common',
    flavor: 'City militia with sickle-swords and bronze helmets.',
    enemyOnly: true,
    mods: { armor: -1, morale: -1 },
  },
  {
    id: 'canaaniteChariots',
    name: 'Canaanite chariots',
    age: 0,
    archetype: 'chariots',
    rarity: 'rare',
    flavor: 'The pride of the city kings.',
    enemyOnly: true,
  },
  // Hittites: Age 0, Dawn of War. Assyrians and Aramaeans: Age 1, Antiquity.
  {
    id: 'hittiteChariots',
    name: 'Hittite chariots',
    age: 0,
    archetype: 'chariots',
    rarity: 'epic',
    flavor: 'Heavy three-man chariots that broke the Amun division.',
    mods: { impact: 1, armor: 1 },
  },
  {
    id: 'hittiteSpearmen',
    name: 'Hittite spearmen',
    age: 0,
    archetype: 'spearmen',
    rarity: 'common',
    flavor: 'Steady infantry of the Hatti lands.',
  },
  {
    id: 'assyrianArchers',
    name: 'Assyrian archers',
    age: 1,
    archetype: 'archers',
    rarity: 'rare',
    flavor: 'Armored archers behind tall shields.',
    mods: { armor: 1 },
  },
  {
    id: 'assyrianCavalry',
    name: 'Assyrian cavalry',
    age: 1,
    archetype: 'lightCavalry',
    rarity: 'rare',
    flavor: 'Among the first true cavalry: paired archer and lancer.',
    mods: { melee: 1 },
  },
  {
    id: 'assyrianSpearmen',
    name: 'Assyrian spearmen',
    age: 1,
    archetype: 'spearmen',
    rarity: 'common',
    flavor: 'Iron-armed spearmen of a professional army.',
    mods: { armor: 1, mp: -1 },
  },
  {
    id: 'aramaeanInfantry',
    name: 'Aramaean infantry',
    age: 1,
    archetype: 'skirmishers',
    rarity: 'common',
    flavor: 'Hill men with javelins and slings.',
  },
  // Age 1, Antiquity: Greeks and Persians.
  {
    id: 'hoplites',
    name: 'Hoplites',
    age: 1,
    archetype: 'spearmen',
    rarity: 'rare',
    flavor: 'Bronze-clad citizens locked shield to shield.',
    mods: { armor: 1, morale: 1 },
  },
  {
    id: 'spartanHoplites',
    name: 'Spartan hoplites',
    age: 1,
    archetype: 'spearmen',
    rarity: 'epic',
    flavor: 'Raised for war since boyhood. They do not retreat.',
    mods: { melee: 1, morale: 1 },
  },
  {
    id: 'peltasts',
    name: 'Peltasts',
    age: 1,
    archetype: 'skirmishers',
    rarity: 'common',
    flavor: 'Thracian-style javelin men with light crescent shields.',
    mods: { melee: 1 },
  },
  {
    id: 'cretanArchers',
    name: 'Cretan archers',
    age: 1,
    archetype: 'archers',
    rarity: 'rare',
    flavor: 'Famous mercenary bowmen: they shoot a square further.',
    mods: { ranged: 1, range: 1 },
  },
  {
    id: 'sparabara',
    name: 'Sparabara',
    age: 1,
    archetype: 'archers',
    rarity: 'common',
    flavor: 'Persian archers behind a wall of wicker shields.',
    mods: { armor: 1, ranged: -1 },
  },
  {
    id: 'immortals',
    name: 'Immortals',
    age: 1,
    archetype: 'archers',
    rarity: 'epic',
    flavor: 'The King’s ten thousand: spear and bow.',
    mods: { melee: 1, morale: 1 },
  },
  {
    id: 'persianCavalry',
    name: 'Persian cavalry',
    age: 1,
    archetype: 'lightCavalry',
    rarity: 'rare',
    flavor: 'Horse archers and javelin riders of the satrapies.',
  },
  {
    id: 'thessalianCavalry',
    name: 'Thessalian cavalry',
    age: 1,
    archetype: 'heavyCavalry',
    rarity: 'epic',
    flavor: 'The finest horsemen of Greece.',
    mods: { mp: 1, armor: -1 },
  },
  // Thebes, Macedon, the last Persian empire and India (prompt 04 phase D).
  {
    id: 'sacredBand',
    name: 'Sacred Band',
    age: 1,
    archetype: 'spearmen',
    rarity: 'epic',
    flavor: 'Three hundred picked Thebans who broke the Spartans at Leuctra.',
    mods: { armor: 1, morale: 1 },
  },
  {
    id: 'macedonianPhalanx',
    name: 'Macedonian phalanx',
    age: 1,
    archetype: 'pikemen',
    rarity: 'rare',
    flavor: 'Sixteen ranks deep behind sarissas five metres long.',
    mods: { morale: 1 },
  },
  {
    id: 'companions',
    name: 'Companion cavalry',
    age: 1,
    archetype: 'heavyCavalry',
    rarity: 'epic',
    flavor: 'Alexander’s own horsemen, the hammer of Macedon.',
    mods: { morale: 1 },
  },
  {
    id: 'bactrianCavalry',
    name: 'Bactrian cavalry',
    age: 1,
    archetype: 'heavyCavalry',
    rarity: 'rare',
    flavor: 'Armoured riders from the far east of the Persian empire.',
    mods: { mp: 1, morale: -1 },
    enemyOnly: true,
  },
  {
    id: 'scythedChariots',
    name: 'Scythed chariots',
    age: 1,
    archetype: 'chariots',
    rarity: 'rare',
    flavor: 'Blades on the axles, meant to cut lanes through the phalanx.',
    mods: { ranged: -1, armor: -1 },
    extraTag: 'Scythed',
    enemyOnly: true,
  },
  {
    id: 'indianArchers',
    name: 'Indian archers',
    age: 1,
    archetype: 'archers',
    rarity: 'common',
    flavor: 'Tall bamboo bows, braced on the ground to shoot.',
    mods: { ranged: 1, armor: -1 },
    enemyOnly: true,
  },
  {
    id: 'indianElephants',
    name: 'Indian elephants',
    age: 1,
    archetype: 'warElephants',
    rarity: 'epic',
    flavor: 'Porus’s towering war elephants: horses will not face them.',
  },
  {
    id: 'indianInfantry',
    name: 'Indian infantry',
    age: 1,
    archetype: 'heavySwordsmen',
    rarity: 'common',
    flavor: 'Broadswords and long shields, packed between the elephants.',
    mods: { armor: -1, morale: -1 },
    enemyOnly: true,
  },
  {
    id: 'indianCavalry',
    name: 'Indian cavalry',
    age: 1,
    archetype: 'lightCavalry',
    rarity: 'common',
    flavor: 'Light horsemen on the wings of Porus’s line.',
    mods: { morale: -1 },
    enemyOnly: true,
  },
];

export const ERA_UNIT_BY_ID: Record<string, EraUnitDef> = Object.fromEntries(
  ERA_UNITS.map((u) => [u.id, u]),
);

/** Level bonus (5): +5% Melee, Impact, Ranged and Morale per level above 1. */
export const LEVEL_BONUS = 0.05;

/** Builds the playable unit type: archetype + era modifiers + age cost + level. */
export function eraUnitType(id: string, level = 1): UnitType {
  const def = ERA_UNIT_BY_ID[id];
  if (!def) throw new Error(`Unknown unit ${id}`);
  const base = ARCHETYPES[def.archetype];
  const stats = { ...base.stats };
  for (const [k, v] of Object.entries(def.mods ?? {})) stats[k as keyof UnitStats] += v;
  stats.cost = base.stats.cost + COST_PER_AGE * def.age;
  const lv = 1 + LEVEL_BONUS * (Math.max(1, level) - 1);
  stats.melee *= lv;
  stats.impact *= lv;
  stats.ranged *= lv;
  stats.morale *= lv;
  const tags = def.extraTag ? [...base.tags, def.extraTag] : [...base.tags];
  return { ...base, id: def.id, name: def.name, stats, tags, level: Math.max(1, level) };
}
