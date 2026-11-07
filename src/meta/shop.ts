import { ladder, type EraUnitDef } from '../content/eraUnits';
import { GENERALS, generalPackAge, isGeneric, type GeneralEntry } from '../content/generals';
import type { Rarity } from '../core/generals';
import { drawPackTroop, giveTroop, pickWeighted, RARITY_RANK, type TroopCard } from './cards';
import { packPrice, type PackKind } from './prices';
import { addGeneral, type Profile } from './profile';

export { packPrice, type PackKind };

/**
 * The shop (GAME_DESIGN 8): packs are sold per age and draw only from that age's ladder.
 * The first Recruit Pack of an age holds a Rare, the first General Pack a named Rare general
 * or better (7.6). Monetization stays out: coins only.
 */
export const SHOP = {
  recruitCards: 4,
  veteranCards: 3,
  generalRarityWeight: { common: 0, uncommon: 0, rare: 60, epic: 30, legendary: 10 } as Record<
    Rarity,
    number
  >,
  /** A General Pack is guaranteed Epic+ after this many packs without one. */
  generalPity: 5,
  /** The daily offer: this many copies of one troop card, at a fixed price by rarity. */
  dailyCopies: 3,
  dailyPrice: { common: 120, rare: 250, epic: 500 } as Record<string, number>,
};

export type PackCard =
  TroopCard | { kind: 'general'; id: string; isNew: boolean; medalXp: number; rarity: Rarity };

/** Ages with a shop tab: every open age with named cards to chase (Age 0 has none). */
export function shopAges(p: Profile): number[] {
  const out: number[] = [];
  for (let age = 1; age <= p.unlockedAge; age++) if (ladder(age).length) out.push(age);
  return out;
}

/** Named generals in an age's General Pack. */
export function generalPool(age: number): GeneralEntry[] {
  return GENERALS.filter((g) => g.playable && !isGeneric(g) && generalPackAge(g) === age);
}

function packKey(kind: PackKind, age: number): string {
  return `${kind}:${age}`;
}

/** True until the player buys their first pack of this kind in this age. */
export function firstPackPending(p: Profile, kind: PackKind, age: number): boolean {
  return !p.packsBought[packKey(kind, age)];
}

function drawGeneral(p: Profile, age: number): GeneralEntry {
  const pool = generalPool(age);
  const pity = p.generalPity + 1 >= SHOP.generalPity;
  const eligible = pity ? pool.filter((g) => RARITY_RANK[g.rarity] >= RARITY_RANK.epic) : pool;
  const g = pickWeighted(p, eligible.length ? eligible : pool, (x) =>
    Math.max(1, SHOP.generalRarityWeight[x.rarity]),
  );
  p.generalPity = RARITY_RANK[g.rarity] >= RARITY_RANK.epic ? 0 : p.generalPity + 1;
  return g;
}

/** Buys and opens a pack from an age's tab. Returns null if it isn't on sale or affordable. */
export function buyPack(p: Profile, kind: PackKind, age: number): PackCard[] | null {
  if (!shopAges(p).includes(age)) return null;
  const price = packPrice(kind, age);
  if (p.coins < price) return null;
  p.coins -= price;
  const first = firstPackPending(p, kind, age);
  p.packsBought[packKey(kind, age)] = (p.packsBought[packKey(kind, age)] ?? 0) + 1;
  if (kind === 'general') {
    const g = drawGeneral(p, age);
    const r = addGeneral(p, g.id);
    return [{ kind: 'general', id: g.id, rarity: g.rarity, ...r }];
  }
  const n = kind === 'recruit' ? SHOP.recruitCards : SHOP.veteranCards;
  const defs: EraUnitDef[] = [];
  for (let i = 0; i < n; i++) defs.push(drawPackTroop(p, age));
  // Veteran Packs, and an age's first Recruit Pack, hold at least one Rare or better.
  const needsRare = kind === 'veteran' || first;
  if (needsRare && !defs.some((d) => RARITY_RANK[d.rarity] >= RARITY_RANK.rare)) {
    defs[defs.length - 1] = drawPackTroop(p, age, 'rare');
  }
  return defs.map((d) => giveTroop(p, d.id));
}

function dayHash(day: string): number {
  let h = 2166136261;
  for (const c of day) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * Today's offer: copies of one specific troop from an open age, at a fixed price, with no
 * randomness for the buyer. Legendaries are never on offer: they have their own road.
 */
export function dailyOffer(
  p: Profile,
  day: string,
): { unit: EraUnitDef; copies: number; price: number; bought: boolean } | null {
  const pool = shopAges(p).flatMap((a) => ladder(a).filter((u) => u.rarity !== 'legendary'));
  if (!pool.length) return null;
  const unit = pool[dayHash(day) % pool.length]!;
  return {
    unit,
    copies: SHOP.dailyCopies,
    price: SHOP.dailyPrice[unit.rarity]!,
    bought: p.dailyBought === day,
  };
}

export function buyDaily(p: Profile, day: string): PackCard | null {
  const offer = dailyOffer(p, day);
  if (!offer || offer.bought || p.coins < offer.price) return null;
  p.coins -= offer.price;
  p.dailyBought = day;
  return giveTroop(p, offer.unit.id, offer.copies);
}
