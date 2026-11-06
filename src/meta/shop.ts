import { ERA_UNITS, type EraUnitDef } from '../content/eraUnits';
import { GENERALS, type GeneralEntry } from '../content/generals';
import type { Rarity } from '../core/generals';
import { nextRandom } from '../core/rng';
import { addGeneral, addUnitCard, type Profile } from './profile';

/** Shop prices and odds (GAME_DESIGN 8). Monetization stays out: coins only. */
export const SHOP = {
  recruitPrice: 150,
  veteranPrice: 400,
  generalPrice: 600,
  cardsPerPack: 3,
  /** Weight of units from the newest unlocked age vs older ages. */
  currentAgeWeight: 3,
  unitRarityWeight: { common: 70, rare: 25, epic: 5, legendary: 0 } as Record<Rarity, number>,
  generalRarityWeight: { common: 50, rare: 30, epic: 15, legendary: 5 } as Record<Rarity, number>,
  /** A General Pack is guaranteed Epic+ after this many packs without one. */
  generalPity: 5,
  dailyPrice: { common: 120, rare: 250, epic: 500, legendary: 900 } as Record<Rarity, number>,
};

export type PackKind = 'recruit' | 'veteran' | 'general';

export type PackCard =
  | { kind: 'unit'; id: string; isNew: boolean; levelUp: boolean; rarity: Rarity }
  | { kind: 'general'; id: string; isNew: boolean; medalXp: number; rarity: Rarity };

const RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

function pickWeighted<T>(p: Profile, items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, t) => s + weight(t), 0);
  let r = nextRandom(p) * total;
  for (const t of items) {
    r -= weight(t);
    if (r < 0) return t;
  }
  return items[items.length - 1]!;
}

export function unitPool(p: Profile, minRarity: Rarity = 'common'): EraUnitDef[] {
  return ERA_UNITS.filter((u) => u.age <= p.unlockedAge && RANK[u.rarity] >= RANK[minRarity]);
}

function drawUnit(p: Profile, minRarity: Rarity = 'common'): EraUnitDef {
  const pool = unitPool(p, minRarity);
  return pickWeighted(
    p,
    pool,
    (u) =>
      SHOP.unitRarityWeight[u.rarity] * (u.age === p.unlockedAge ? SHOP.currentAgeWeight : 1) || 1,
  );
}

function drawGeneral(p: Profile): GeneralEntry {
  const pool = GENERALS.filter((g) => g.inPacks);
  const pity = p.generalPity + 1 >= SHOP.generalPity;
  const eligible = pity ? pool.filter((g) => RANK[g.rarity] >= RANK.epic) : pool;
  const g = pickWeighted(p, eligible, (x) => SHOP.generalRarityWeight[x.rarity]);
  p.generalPity = RANK[g.rarity] >= RANK.epic ? 0 : p.generalPity + 1;
  return g;
}

export function packPrice(kind: PackKind): number {
  return kind === 'recruit'
    ? SHOP.recruitPrice
    : kind === 'veteran'
      ? SHOP.veteranPrice
      : SHOP.generalPrice;
}

/** Buys and opens a pack. Returns null if the player cannot afford it. */
export function buyPack(p: Profile, kind: PackKind): PackCard[] | null {
  const price = packPrice(kind);
  if (p.coins < price) return null;
  p.coins -= price;
  if (kind === 'general') {
    const g = drawGeneral(p);
    const r = addGeneral(p, g.id);
    return [{ kind: 'general', id: g.id, rarity: g.rarity, ...r }];
  }
  const defs: EraUnitDef[] = [];
  for (let i = 0; i < SHOP.cardsPerPack; i++) defs.push(drawUnit(p));
  // Veteran Pack: at least one Rare or better.
  if (kind === 'veteran' && !defs.some((d) => RANK[d.rarity] >= RANK.rare)) {
    defs[defs.length - 1] = drawUnit(p, 'rare');
  }
  return defs.map((d) => ({ kind: 'unit', id: d.id, rarity: d.rarity, ...addUnitCard(p, d.id) }));
}

function dayHash(day: string): number {
  let h = 2166136261;
  for (const c of day) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Today's offer: one specific unit at a fixed price, no randomness for the buyer. */
export function dailyOffer(
  p: Profile,
  day: string,
): { unit: EraUnitDef; price: number; bought: boolean } {
  const pool = unitPool(p);
  const unit = pool[dayHash(day) % pool.length]!;
  return { unit, price: SHOP.dailyPrice[unit.rarity], bought: p.dailyBought === day };
}

export function buyDaily(p: Profile, day: string): PackCard | null {
  const offer = dailyOffer(p, day);
  if (offer.bought || p.coins < offer.price) return null;
  p.coins -= offer.price;
  p.dailyBought = day;
  return {
    kind: 'unit',
    id: offer.unit.id,
    rarity: offer.unit.rarity,
    ...addUnitCard(p, offer.unit.id),
  };
}
