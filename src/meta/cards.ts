import { ERA_UNITS, ERA_UNIT_BY_ID, type EraUnitDef } from '../content/eraUnits';
import type { Rarity } from '../core/generals';
import { nextRandom, type RngHolder } from '../core/rng';
import { addUnitCard, type CardResult, type Profile } from './profile';

/** Troop card odds for packs and battle rewards (GAME_DESIGN 5 and 8). */
export const CARDS = {
  /** Chance that a card is drawn from types the player already owns, so it can upgrade them. */
  ownedShare: 0.7,
  /** Among owned types, the ones fielded in the battle just fought are this much likelier. */
  fieldedWeight: 3,
  /** Weight of the newest unlocked age vs older ages, for cards outside the roster. */
  currentAgeWeight: 3,
  rarityWeight: { common: 70, rare: 25, epic: 5, legendary: 0 } as Record<Rarity, number>,
};

export const RARITY_RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

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

/** Troops the player could get: unlocked ages, not enemy-only. */
export function troopPool(p: Profile, minRarity: Rarity = 'common'): EraUnitDef[] {
  return ERA_UNITS.filter(
    (u) =>
      !u.enemyOnly && u.age <= p.unlockedAge && RARITY_RANK[u.rarity] >= RARITY_RANK[minRarity],
  );
}

export interface DrawOptions {
  minRarity?: Rarity;
  /** Troop types fielded in the battle that earned the card. */
  fielded?: string[];
}

/** Draws one troop card: usually an owned type, otherwise any troop from the unlocked ages. */
export function drawTroop(p: Profile, rng: RngHolder, opts: DrawOptions = {}): EraUnitDef {
  const pool = troopPool(p, opts.minRarity);
  const owned = pool.filter((u) => p.units[u.id]);
  if (owned.length && nextRandom(rng) < CARDS.ownedShare) {
    return pickWeighted(rng, owned, (u) =>
      opts.fielded?.includes(u.id) ? CARDS.fieldedWeight : 1,
    );
  }
  return pickWeighted(
    rng,
    pool,
    (u) =>
      CARDS.rarityWeight[u.rarity] * (u.age === p.unlockedAge ? CARDS.currentAgeWeight : 1) || 1,
  );
}

/** Gives the player `count` cards of one troop. */
export function giveTroop(p: Profile, id: string, count = 1): TroopCard {
  const rarity = ERA_UNIT_BY_ID[id]?.rarity ?? 'common';
  return { kind: 'unit', id, rarity, count, ...addUnitCard(p, id, count) };
}
