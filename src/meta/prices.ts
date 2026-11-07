/**
 * Pack prices per age (GAME_DESIGN 8). Kept apart from the shop so campaign code can price
 * an age's first packs (for the age-unlock bonus) without importing the shop.
 */
export type PackKind = 'recruit' | 'veteran' | 'general';

export const PRICES = {
  /** Age 1 prices; later ages multiply them by `ageFactor`. */
  base: { recruit: 120, veteran: 400, general: 250 } as Record<PackKind, number>,
  /**
   * First-win coins grow as 100 × (age + 1), so prices grow at the same rate: Age 1 × 1,
   * Age 2 × 1.5, Age 3 × 2 (DECISIONS, Ages 0–2 A).
   */
  ageFactor: (age: number) => (Math.max(1, age) + 1) / 2,
  /** What a new age should let the player buy at once (GAME_DESIGN 7.6). */
  firstPacks: { recruit: 2, general: 1 },
};

/** Price of a pack from one age's shop tab, rounded to 5 coins. */
export function packPrice(kind: PackKind, age: number): number {
  return Math.round((PRICES.base[kind] * PRICES.ageFactor(age)) / 5) * 5;
}

/** Cost of an age's first packs: 2 Recruit Packs and 1 General Pack. */
export function firstPacksCost(age: number): number {
  return (
    PRICES.firstPacks.recruit * packPrice('recruit', age) +
    PRICES.firstPacks.general * packPrice('general', age)
  );
}
