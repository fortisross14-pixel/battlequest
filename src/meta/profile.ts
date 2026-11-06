import { AGES, CAMPAIGN } from '../content/campaign/battles';
import type { ArmyChoice } from '../content/campaign/types';
import { ERA_UNIT_BY_ID } from '../content/eraUnits';
import type { Rarity } from '../core/generals';

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

export const PROFILE_VERSION = 2;

export interface Profile {
  version: typeof PROFILE_VERSION;
  coins: number;
  units: Record<string, OwnedUnit>;
  generals: Record<string, OwnedGeneral>;
  battles: Record<string, BattleRecord>;
  /** Highest age the player has unlocked. */
  unlockedAge: number;
  /** General Packs opened since the last Epic or Legendary. */
  generalPity: number;
  /** Seeded RNG state for packs. */
  rng: number;
  /** Date key (YYYY-MM-DD) of the last daily-offer purchase. */
  dailyBought: string | null;
  /** Last army used per battle, to prefill the army builder. */
  lastArmy: Record<string, ArmyChoice>;
}

/** Economy constants (GAME_DESIGN 5 and 8). */
export const ECONOMY = {
  startingCoins: 300,
  startingGenerals: ['captain', 'centurion'],
  /** Spare cards and coins for Lv1→2, 2→3, 3→4, 4→5. */
  upgradeCards: [1, 2, 4, 8],
  upgradeCoins: [15, 40, 100, 250],
  /** Coin cost multiplier by rarity (Legendary is not in §5; it continues the curve). */
  rarityCoinFactor: { common: 1, rare: 1.5, epic: 2, legendary: 2.5 } as Record<Rarity, number>,
  maxLevel: 5,
  /** A card for a Lv5 troop converts to coins. */
  maxLevelCardCoins: 5,
  medalXp: 500,
  maxRank: 10,
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
  };
  for (const id of AGES[0]!.starterUnits) p.units[id] = { level: 1, cards: 0 };
  for (const id of ECONOMY.startingGenerals) p.generals[id] = { xp: 0, resting: false };
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
 * Brings a stored profile up to the current version, or returns null if it isn't one.
 * v1 → v2: the duplicates collected towards the next level become spare cards; levels
 * stay. Missing fields take the new-profile defaults.
 */
export function migrateProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown> & { version?: unknown };
  if (r.version === 1) {
    const units: Record<string, OwnedUnit> = {};
    const old = (r.units ?? {}) as Record<string, { level?: number; dupes?: number }>;
    for (const [id, u] of Object.entries(old)) {
      if (!ERA_UNIT_BY_ID[id]) continue;
      units[id] = { level: Math.min(ECONOMY.maxLevel, u.level ?? 1), cards: u.dupes ?? 0 };
    }
    const p: Profile = { ...newProfile(), ...(r as object), version: PROFILE_VERSION, units };
    // Old saves started with only the Captain; v2 players also get the Centurion.
    for (const id of ECONOMY.startingGenerals) p.generals[id] ??= { xp: 0, resting: false };
    // Battles already won grant what their first win now unlocks.
    for (const b of CAMPAIGN) {
      if (!p.battles[b.id]?.wins) continue;
      for (const id of b.firstWinUnlocks?.units ?? []) p.units[id] ??= { level: 1, cards: 0 };
      for (const id of b.firstWinUnlocks?.generals ?? [])
        p.generals[id] ??= { xp: 0, resting: false };
    }
    return p;
  }
  if (r.version === PROFILE_VERSION) return { ...newProfile(), ...(r as object) } as Profile;
  return null;
}

export function cloneProfile(p: Profile): Profile {
  return structuredClone(p);
}
