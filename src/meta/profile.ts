import { AGES } from '../content/campaign/battles';
import { syncAgeUnlocks } from './campaign';
import type { ArmyChoice } from '../content/campaign/types';
import { ERA_UNIT_BY_ID, type TroopRarity } from '../content/eraUnits';
import { GENERAL_BY_ID } from '../content/generals';

/** An unlocked troop type (GAME_DESIGN 5): its level and the spare cards held for upgrades. */
export interface OwnedUnit {
  level: number;
  /** Spare, unspent cards. Upgrading spends them; they never level a unit up by themselves. */
  cards: number;
}

export interface OwnedGeneral {
  xp: number;
  /** Killed or captured last battle: unavailable for the next one only. */
  resting: boolean;
}

export interface BattleRecord {
  stars: number;
  wins: number;
  plays: number;
}

export const PROFILE_VERSION = 4;

export interface Profile {
  version: typeof PROFILE_VERSION;
  coins: number;
  units: Record<string, OwnedUnit>;
  generals: Record<string, OwnedGeneral>;
  battles: Record<string, BattleRecord>;
  /** Highest age the player has unlocked (its Commons and generic generals were granted). */
  unlockedAge: number;
  /** General Packs opened since the last Epic or Legendary. */
  generalPity: number;
  /** Seeded RNG state for packs. */
  rng: number;
  /** Date key (YYYY-MM-DD) of the last daily-offer purchase. */
  dailyBought: string | null;
  /** Last army used per battle, to prefill the army builder. */
  lastArmy: Record<string, ArmyChoice>;
  /**
   * Packs bought per age, keyed "recruit:1", "general:2"…: the first of each kind in an age
   * carries a guarantee (GAME_DESIGN 7.6).
   */
  packsBought: Record<string, number>;
  /** Ages whose guaranteed Legendary troop was granted (GAME_DESIGN 8). */
  legendaryGranted: number[];
}

/** Economy constants (GAME_DESIGN 5 and 8). */
export const ECONOMY = {
  /** With the Age 0 rewards and the Antiquity bonus, enough for its first packs (7.6). */
  startingCoins: 100,
  /** Spare cards and coins for Lv1→2, 2→3, 3→4, 4→5. */
  upgradeCards: [1, 2, 4, 8],
  upgradeCoins: [15, 40, 100, 250],
  /** Coin cost multiplier by rarity (Legendary is not in §5; it continues the curve). */
  rarityCoinFactor: { common: 1, rare: 1.5, epic: 2, legendary: 2.5 } as Record<
    TroopRarity,
    number
  >,
  maxLevel: 5,
  /** A card for a Lv5 troop converts to coins. */
  maxLevelCardCoins: 5,
  medalXp: 500,
  maxRank: 10,
  /**
   * Age-unlock bonus (GAME_DESIGN 8): at least this much, and enough to bring the purse up
   * to the new age's first packs (2 Recruit Packs and 1 General Pack).
   */
  ageBonusMin: 100,
  /** Share of an age's main-path stars that grants its Legendary troop (GAME_DESIGN 8). */
  legendaryRoad: 0.7,
};

export function newProfile(seed = 12345): Profile {
  const p: Profile = {
    version: PROFILE_VERSION,
    coins: ECONOMY.startingCoins,
    units: {},
    generals: {},
    battles: {},
    unlockedAge: 0,
    generalPity: 0,
    rng: seed >>> 0,
    dailyBought: null,
    lastArmy: {},
    packsBought: {},
    legendaryGranted: [],
  };
  const age0 = AGES[0]!;
  for (const id of age0.starterUnits) p.units[id] = { level: 1, cards: 0 };
  for (const id of age0.starterGenerals ?? []) p.generals[id] = { xp: 0, resting: false };
  return p;
}

/** XP needed to reach a rank: 100, 300, 600, 1000, … (triangular). */
export function xpForRank(rank: number): number {
  return (100 * (rank - 1) * rank) / 2;
}

export function rankForXp(xp: number): number {
  let r = 1;
  while (r < ECONOMY.maxRank && xp >= xpForRank(r + 1)) r++;
  return r;
}

export interface CardResult {
  /** The first card of a type unlocks it. */
  isNew: boolean;
  /** Cards kept as spares. */
  spare: number;
  /** Coins from cards of a troop already at the max level. */
  coins: number;
}

/**
 * Adds `count` cards of a troop. The first one unlocks the type; the rest become spare
 * cards. A troop at the max level turns its cards into coins. Never levels a unit up.
 */
export function addUnitCard(p: Profile, id: string, count = 1): CardResult {
  let owned = p.units[id];
  let isNew = false;
  if (!owned) {
    owned = p.units[id] = { level: 1, cards: 0 };
    isNew = true;
    count -= 1;
  }
  if (owned.level >= ECONOMY.maxLevel) {
    const coins = count * ECONOMY.maxLevelCardCoins;
    p.coins += coins;
    return { isNew, spare: 0, coins };
  }
  owned.cards += count;
  return { isNew, spare: count, coins: 0 };
}

/** Adds a general: new, or a Medal worth 500 XP if already owned. */
export function addGeneral(p: Profile, id: string): { isNew: boolean; medalXp: number } {
  const owned = p.generals[id];
  if (!owned) {
    p.generals[id] = { xp: 0, resting: false };
    return { isNew: true, medalXp: 0 };
  }
  owned.xp += ECONOMY.medalXp;
  return { isNew: false, medalXp: ECONOMY.medalXp };
}

// ---------- Upgrades ----------

/** Cards and coins to go from `level` to `level + 1`, or null at the max level. */
export function upgradeCost(id: string, level: number): { cards: number; coins: number } | null {
  if (level >= ECONOMY.maxLevel) return null;
  const rarity = ERA_UNIT_BY_ID[id]?.rarity ?? 'common';
  return {
    cards: ECONOMY.upgradeCards[level - 1]!,
    coins: Math.round(ECONOMY.upgradeCoins[level - 1]! * ECONOMY.rarityCoinFactor[rarity]),
  };
}

export type UpgradeCheck =
  | { ok: true; cards: number; coins: number }
  | { ok: false; reason: 'notOwned' | 'maxLevel' }
  | { ok: false; reason: 'cards' | 'coins'; cards: number; coins: number; missing: number };

/** Whether a troop can be upgraded now, and why not. Cards are checked before coins. */
export function canUpgrade(p: Profile, id: string): UpgradeCheck {
  const owned = p.units[id];
  if (!owned) return { ok: false, reason: 'notOwned' };
  const cost = upgradeCost(id, owned.level);
  if (!cost) return { ok: false, reason: 'maxLevel' };
  if (owned.cards < cost.cards)
    return { ok: false, reason: 'cards', ...cost, missing: cost.cards - owned.cards };
  if (p.coins < cost.coins)
    return { ok: false, reason: 'coins', ...cost, missing: cost.coins - p.coins };
  return { ok: true, ...cost };
}

/**
 * Spends spare cards and coins to raise a troop one level. Returns false if it can't.
 * Reaching the max level converts leftover spare cards into coins.
 */
export function upgradeUnit(p: Profile, id: string): boolean {
  const check = canUpgrade(p, id);
  if (!check.ok) return false;
  const owned = p.units[id]!;
  owned.cards -= check.cards;
  p.coins -= check.coins;
  owned.level += 1;
  if (owned.level >= ECONOMY.maxLevel && owned.cards > 0) {
    p.coins += owned.cards * ECONOMY.maxLevelCardCoins;
    owned.cards = 0;
  }
  return true;
}

export function anyUpgradeAvailable(p: Profile): boolean {
  return Object.keys(p.units).some((id) => canUpgrade(p, id).ok);
}

// ---------- Saves ----------

/**
 * v4 replaced the one-off faction troops and the old general roster with the per-age
 * ladders (prompt 06). Each removed card maps to its closest ladder card.
 */
export const LEGACY_UNITS: Record<string, string> = {
  egyptianSpearmen: 'bronzeAgeSpearmen',
  egyptianArchers: 'bronzeAgeArchers',
  egyptianChariots: 'bronzeAgeChariots',
  canaaniteWarriors: 'bronzeAgeSpearmen',
  canaaniteChariots: 'bronzeAgeChariots',
  hittiteChariots: 'bronzeAgeChariots',
  hittiteSpearmen: 'bronzeAgeSpearmen',
  assyrianArchers: 'persianShieldArchers',
  assyrianCavalry: 'antiquityLightCavalry',
  assyrianSpearmen: 'antiquitySpearmen',
  aramaeanInfantry: 'antiquitySkirmishers',
  hoplites: 'hoplitePhalanx',
  peltasts: 'antiquitySkirmishers',
  cretanArchers: 'persianShieldArchers',
  sparabara: 'persianShieldArchers',
  immortals: 'persianShieldArchers',
  persianCavalry: 'antiquityLightCavalry',
  thessalianCavalry: 'antiquityLightCavalry',
  sacredBand: 'thebanSacredBand',
  companions: 'companionCavalry',
  bactrianCavalry: 'antiquityLightCavalry',
  indianArchers: 'antiquityArchers',
  indianInfantry: 'antiquitySpearmen',
  indianCavalry: 'antiquityLightCavalry',
};

export const LEGACY_GENERALS: Record<string, string> = {
  captain: 'bronzeAgeCaptain',
  centurion: 'antiquityCaptain',
  thutmose: 'thutmoseIII',
  philip: 'philipII',
  // Joan of Arc belongs to a later age with no ladder yet: the closest Epic morale leader.
  joan: 'ramessesII',
};

/**
 * Brings a stored profile up to the current version, or returns null if it isn't one.
 * v1 → v2: the duplicates collected towards the next level become spare cards; levels
 * stay. Missing fields take the new-profile defaults.
 */
export function migrateProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object') return null;
  let r = raw as Record<string, unknown> & { version?: unknown };
  if (r.version === 1) r = migrateV1toV2(r);
  if (r.version === 2) r = migrateV2toV3(r);
  if (r.version === 3) r = migrateV3toV4(r) as unknown as typeof r;
  if (r.version === PROFILE_VERSION) return { ...newProfile(), ...(r as object) } as Profile;
  return null;
}

/** v1 → v2: duplicates become spare cards; the Centurion and first-win unlocks are added. */
function migrateV1toV2(r: Record<string, unknown>): Record<string, unknown> & { version: 2 } {
  const units: Record<string, OwnedUnit> = {};
  const old = (r.units ?? {}) as Record<string, { level?: number; dupes?: number }>;
  for (const [id, u] of Object.entries(old)) {
    if (!ERA_UNIT_BY_ID[id] && !LEGACY_UNITS[id]) continue;
    units[id] = { level: Math.min(ECONOMY.maxLevel, u.level ?? 1), cards: u.dupes ?? 0 };
  }
  const generals = { ...((r.generals ?? {}) as Record<string, OwnedGeneral>) };
  // Old saves started with only the Captain; v2 players also got the Centurion.
  generals.centurion ??= { xp: 0, resting: false };
  // Battles won granted their v2 first-win unlocks (Megiddo: archers and Thutmose).
  const battles = (r.battles ?? {}) as Record<string, BattleRecord>;
  if (battles.megiddo?.wins) {
    units.egyptianArchers ??= { level: 1, cards: 0 };
    generals.thutmose ??= { xp: 0, resting: false };
  }
  return { ...r, units, generals, version: 2 };
}

/**
 * v2 → v3: the campaign became ages with star-gated battles (GAME_DESIGN 7). Battle ids
 * are unchanged, so every record and star is kept. `unlockedAge` is recomputed in v4.
 */
function migrateV2toV3(r: Record<string, unknown>): Record<string, unknown> & { version: 3 } {
  return { ...r, version: 3 };
}

/**
 * v3 → v4: the per-age card ladders (prompt 06). Each removed troop becomes its closest
 * ladder card, keeping its level and spare cards; two old troops that become the same card
 * merge (the higher level, every spare card, and one more card for each extra type).
 * Removed generals map the same way and keep their XP. Battle records stay; the ages the
 * player has opened grant their new Commons and generic generals.
 */
function migrateV3toV4(r: Record<string, unknown>): Profile {
  const units: Record<string, OwnedUnit> = {};
  for (const [oldId, u] of Object.entries((r.units ?? {}) as Record<string, OwnedUnit>)) {
    const id = ERA_UNIT_BY_ID[oldId] ? oldId : LEGACY_UNITS[oldId];
    if (!id || !ERA_UNIT_BY_ID[id]) continue;
    const level = Math.min(ECONOMY.maxLevel, Math.max(1, u.level ?? 1));
    const have = units[id];
    units[id] = have
      ? { level: Math.max(have.level, level), cards: have.cards + (u.cards ?? 0) + 1 }
      : { level, cards: u.cards ?? 0 };
  }
  const generals: Record<string, OwnedGeneral> = {};
  for (const [oldId, g] of Object.entries((r.generals ?? {}) as Record<string, OwnedGeneral>)) {
    const id = GENERAL_BY_ID[oldId] ? oldId : LEGACY_GENERALS[oldId];
    if (!id || !GENERAL_BY_ID[id]?.playable) continue;
    const xp = Math.max(generals[id]?.xp ?? 0, g.xp ?? 0);
    generals[id] = { xp, resting: false };
  }
  const base = newProfile();
  const p: Profile = {
    ...base,
    ...(r as object),
    version: PROFILE_VERSION,
    units: { ...base.units, ...units },
    generals: { ...base.generals, ...generals },
    battles: { ...((r.battles as Profile['battles']) ?? {}) },
    lastArmy: {},
    packsBought: {},
    legendaryGranted: [],
    unlockedAge: 0,
  };
  // Ages already won open again with their new Commons and generic generals.
  syncAgeUnlocks(p);
  // Last armies keep the troops and general the player still has.
  for (const [battle, a] of Object.entries((r.lastArmy ?? {}) as Record<string, ArmyChoice>)) {
    const armyUnits = a.units
      .map((u) => ({ ...u, type: ERA_UNIT_BY_ID[u.type] ? u.type : LEGACY_UNITS[u.type] }))
      .filter((u): u is { type: string; level?: number } => !!u.type && !!p.units[u.type]);
    const gid =
      a.general && (GENERAL_BY_ID[a.general.id] ? a.general.id : LEGACY_GENERALS[a.general.id]);
    p.lastArmy[battle] = {
      units: armyUnits,
      ...(a.general && gid && p.generals[gid] ? { general: { ...a.general, id: gid } } : {}),
    };
  }
  return p;
}

export function cloneProfile(p: Profile): Profile {
  return structuredClone(p);
}
