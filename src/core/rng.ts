/**
 * Seeded pseudo-random number generator (mulberry32).
 * The generator state is a plain uint32 so it can live inside the
 * serializable battle state. Same seed + same commands = same battle.
 */
export interface RngHolder {
  rng: number;
}

/** Normalizes any number into a valid uint32 seed. */
export function seedRng(seed: number): number {
  return seed >>> 0;
}

/** Returns a float in [0, 1) and advances `holder.rng`. */
export function nextRandom(holder: RngHolder): number {
  let t = (holder.rng = (holder.rng + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Returns a float in [min, max) and advances the generator. */
export function randomRange(holder: RngHolder, min: number, max: number): number {
  return min + (max - min) * nextRandom(holder);
}
