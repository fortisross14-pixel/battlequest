import type { EraUnitDef } from '../content/eraUnits';
import { GENERALS, type GeneralEntry } from '../content/generals';
import type { Rarity } from '../core/generals';
import {
  drawTroop,
  giveTroop,
  pickWeighted,
  RARITY_RANK,
  troopPool,
  type TroopCard,
} from './cards';
import { addGeneral, type Profile } from './profile';

/** Shop prices and odds (GAME_DESIGN 8). Monetization stays out: coins only. */
export const SHOP = {
  recruitPrice: 120,
  recruitCards: 4,
  veteranPrice: 400,
  veteranCards: 3,
  generalPrice: 600,
  generalRarityWeight: { common: 50, rare: 30, epic: 15, legendary: 5 } as Record<Rarity, number>,
  /** A General Pack is guaranteed Epic+ after this many packs without one. */
  generalPity: 5,
  /** The daily offer: this many copies of one troop card, at a fixed price by rarity. */
  dailyCopies: 3,
  dailyPrice: { common: 120, rare: 250, epic: 500, legendary: 900 } as Record<Rarity, number>,
};

export type PackKind = 'recruit' | 'veteran' | 'general';

export type PackCard =
  TroopCard | { kind: 'general'; id: string; isNew: boolean; medalXp: number; rarity: Rarity };

function drawGeneral(p: Profile): GeneralEntry {
  const pool = GENERALS.filter((g) => g.inPacks);
  const pity = p.generalPity + 1 >= SHOP.generalPity;
  const eligible = pity ? pool.filter((g) => RARITY_RANK[g.rarity] >= RARITY_RANK.epic) : pool;
  const g = pickWeighted(p, eligible, (x) => SHOP.generalRarityWeight[x.rarity]);
  p.generalPity = RARITY_RANK[g.rarity] >= RARITY_RANK.epic ? 0 : p.generalPity + 1;
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
  const n = kind === 'recruit' ? SHOP.recruitCards : SHOP.veteranCards;
  const defs: EraUnitDef[] = [];
  for (let i = 0; i < n; i++) defs.push(drawTroop(p, p));
  // Veteran Pack: at least one Rare or better.
  if (
    kind === 'veteran' &&
    !defs.some((d) => RARITY_RANK[d.rarity] >= RARITY_RANK.rare) &&
    troopPool(p, 'rare').length
  ) {
    defs[defs.length - 1] = drawTroop(p, p, { minRarity: 'rare' });
  }
  return defs.map((d) => giveTroop(p, d.id));
}

function dayHash(day: string): number {
  let h = 2166136261;
  for (const c of day) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Today's offer: copies of one specific troop at a fixed price, no randomness for the buyer. */
export function dailyOffer(
  p: Profile,
  day: string,
): { unit: EraUnitDef; copies: number; price: number; bought: boolean } {
  const pool = troopPool(p);
  const unit = pool[dayHash(day) % pool.length]!;
  return {
    unit,
    copies: SHOP.dailyCopies,
    price: SHOP.dailyPrice[unit.rarity],
    bought: p.dailyBought === day,
  };
}

export function buyDaily(p: Profile, day: string): PackCard | null {
  const offer = dailyOffer(p, day);
  if (offer.bought || p.coins < offer.price) return null;
  p.coins -= offer.price;
  p.dailyBought = day;
  return giveTroop(p, offer.unit.id, offer.copies);
}
