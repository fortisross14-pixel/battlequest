import { ERA_UNIT_BY_ID, ladder, type EraUnitDef } from '../content/eraUnits';
import type { Rarity } from '../core/generals';
import { nextRandom, type RngHolder } from '../core/rng';
import { addUnitCard, type CardResult, type Profile } from './profile';

/** Troop card odds for packs and battle rewards (GAME_DESIGN 5 and 8). */
export const CARDS = {
  /** Packs: mostly Common, with a chance of Rare or better; a Legendary about 1 pack in 100. */
  packWeight: { common: 70, rare: 25, epic: 5, legendary: 0.25 } as Record<string, number>,
  /** Battle rewards: drawn from types the player owns this often, so they can upgrade. */
  ownedShare: 0.7,
  /** Among owned types, the ones fielded in the battle just fought are this much likelier. */
  fieldedWeight: 3,
  /** Battle rewards never hand out the Legendary: it has its own road (GAME_DESIGN 8). */
  rewardWeight: { common: 70, rare: 25, epic: 5, legendary: 0 } as Record<string, number>,
};

export const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

/** A troop card handed to the player, as shown in a pack reveal or on the results screen. */
export interface TroopCard extends CardResult {
  kind: 'unit';
  id: string;
  rarity: Rarity;
  count: number;
}

export function pickWeighted<T>(rng: RngHolder, items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, t) => s + weight(t), 0);
  let r = nextRandom(rng) * total;
  for (const t of items) {
    r -= weight(t);
    if (r < 0) return t;
  }
  return items[items.length - 1]!;
}

/** One age's collectable troops, optionally from a minimum rarity. */
export function troopPool(age: number, minRarity: Rarity = 'common'): EraUnitDef[] {
  return ladder(age).filter((u) => RARITY_RANK[u.rarity] >= RARITY_RANK[minRarity]);
}

/** Draws one pack card from an age's ladder by rarity weight. */
export function drawPackTroop(
  rng: RngHolder,
  age: number,
  minRarity: Rarity = 'common',
): EraUnitDef {
  const pool = troopPool(age, minRarity);
  return pickWeighted(rng, pool, (u) => CARDS.packWeight[u.rarity] ?? 1);
}

export interface DrawOptions {
  /** Troop types fielded in the battle that earned the card. */
  fielded?: string[];
}

/**
 * Draws a battle-reward card from the battle's age: usually a type the player owns there,
 * otherwise any of the age's troops except its Legendary.
 */
export function drawRewardTroop(
  p: Profile,
  rng: RngHolder,
  age: number,
  opts: DrawOptions = {},
): EraUnitDef {
  const pool = troopPool(age).filter((u) => CARDS.rewardWeight[u.rarity]! > 0);
  const owned = pool.filter((u) => p.units[u.id]);
  if (owned.length && nextRandom(rng) < CARDS.ownedShare) {
    return pickWeighted(rng, owned, (u) =>
      opts.fielded?.includes(u.id) ? CARDS.fieldedWeight : 1,
    );
  }
  return pickWeighted(rng, pool, (u) => CARDS.rewardWeight[u.rarity]!);
}

/** Gives the player `count` cards of one troop. */
export function giveTroop(p: Profile, id: string, count = 1): TroopCard {
  const rarity = ERA_UNIT_BY_ID[id]?.rarity ?? 'common';
  return { kind: 'unit', id, rarity, count, ...addUnitCard(p, id, count) };
}
