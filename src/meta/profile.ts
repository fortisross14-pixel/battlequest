import { AGES } from '../content/campaign/battles';
import type { ArmyChoice } from '../content/campaign/types';

/** Copies of a unit card. Duplicates raise its level (GAME_DESIGN 8). */
export interface OwnedUnit {
  level: number;
  /** Duplicates collected towards the next level. */
  dupes: number;
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

export interface Profile {
  version: 1;
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

export const ECONOMY = {
  startingCoins: 300,
  startingGenerals: ['captain'],
  /** Duplicates needed to reach level 2, 3, 4, 5. */
  dupesPerLevel: [1, 2, 4, 8],
  maxLevel: 5,
  medalXp: 500,
  maxRank: 10,
};

export function newProfile(seed = 12345): Profile {
  const p: Profile = {
    version: 1,
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
  for (const id of AGES[0]!.starterUnits) p.units[id] = { level: 1, dupes: 0 };
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

/** Adds a unit card: a new unit, or a duplicate towards the next level. */
export function addUnitCard(p: Profile, id: string): { isNew: boolean; levelUp: boolean } {
  const owned = p.units[id];
  if (!owned) {
    p.units[id] = { level: 1, dupes: 0 };
    return { isNew: true, levelUp: false };
  }
  if (owned.level >= ECONOMY.maxLevel) return { isNew: false, levelUp: false };
  owned.dupes += 1;
  const need = ECONOMY.dupesPerLevel[owned.level - 1]!;
  if (owned.dupes >= need) {
    owned.dupes -= need;
    owned.level += 1;
    return { isNew: false, levelUp: true };
  }
  return { isNew: false, levelUp: false };
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

export function cloneProfile(p: Profile): Profile {
  return structuredClone(p);
}
