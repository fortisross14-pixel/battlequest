import type { Dir, Pos } from './types';

export const DIRS: readonly Dir[] = [0, 1, 2, 3, 4, 5, 6, 7];

export const DIR_VECTORS: readonly Pos[] = [
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
];

export const DIR_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export function toDir(n: number): Dir {
  return (((n % 8) + 8) % 8) as Dir;
}

export function isDiagonal(d: Dir): boolean {
  return d % 2 === 1;
}

export function step(p: Pos, d: Dir, n = 1): Pos {
  const v = DIR_VECTORS[d]!;
  return { x: p.x + v.x * n, y: p.y + v.y * n };
}

export function opposite(d: Dir): Dir {
  return toDir(d + 4);
}

/** Number of 45° steps between two facings (0-4). */
export function turnSteps(a: Dir, b: Dir): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 8 - diff);
}

/** Direction from `from` to a neighbouring square, or null if they are not neighbours. */
export function dirTo(from: Pos, to: Pos): Dir | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return null;
  return DIR_VECTORS.findIndex((v) => v.x === dx && v.y === dy) as Dir;
}

/** Closest of the 8 directions to the vector from `from` to `to`. */
export function nearestDir(from: Pos, to: Pos): Dir {
  const angle = Math.atan2(to.x - from.x, -(to.y - from.y)); // 0 = north, clockwise
  return toDir(Math.round(angle / (Math.PI / 4)));
}

/** If `to` lies on one of the 8 straight lines from `from`, returns that direction and distance. */
export function straightLine(from: Pos, to: Pos): { dir: Dir; distance: number } | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return null;
  if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return null;
  const distance = Math.max(Math.abs(dx), Math.abs(dy));
  const dir = dirTo({ x: 0, y: 0 }, { x: Math.sign(dx), y: Math.sign(dy) })!;
  return { dir, distance };
}

export function chebyshev(a: Pos, b: Pos): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/**
 * Range distance in squares, matching movement costs:
 * an orthogonal step counts 1, a diagonal step counts 1.5.
 */
export function rangeDistance(a: Pos, b: Pos): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return Math.max(dx, dy) + 0.5 * Math.min(dx, dy);
}

export function isAdjacent(a: Pos, b: Pos): boolean {
  return chebyshev(a, b) === 1;
}

export function samePos(a: Pos, b: Pos): boolean {
  return a.x === b.x && a.y === b.y;
}

export type Arc = 'front' | 'flank' | 'rear';

const COS_FRONT = Math.cos((67.5 * Math.PI) / 180);
const COS_FLANK = Math.cos((112.5 * Math.PI) / 180);

/**
 * Which arc of a unit at `pos` facing `facing` the point `from` lies in.
 * Front = within 67.5° of the facing (the 3 squares ahead), flank = up to 112.5°
 * (the 2 side squares), rear = the rest (the 3 squares behind).
 */
export function arcOf(pos: Pos, facing: Dir, from: Pos): Arc {
  const v = DIR_VECTORS[facing]!;
  const wx = from.x - pos.x;
  const wy = from.y - pos.y;
  const len = Math.hypot(v.x, v.y) * Math.hypot(wx, wy);
  if (len === 0) return 'front';
  const cos = (v.x * wx + v.y * wy) / len;
  if (cos >= COS_FRONT) return 'front';
  if (cos >= COS_FLANK) return 'flank';
  return 'rear';
}

/** Squares of a unit's front arc (its zone of control). */
export function frontSquares(pos: Pos, facing: Dir): Pos[] {
  return [toDir(facing - 1), facing, toDir(facing + 1)].map((d) => step(pos, d));
}

/** Grid cells crossed by the straight line between two cell centres, excluding both ends. */
export function cellsBetween(a: Pos, b: Pos): Pos[] {
  const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) * 4;
  const out: Pos[] = [];
  const seen = new Set<string>();
  for (let i = 1; i < n; i++) {
    const t = i / n;
    // Nudge off exact cell boundaries so corner cases always resolve the same way.
    const x = Math.round(a.x + (b.x - a.x) * t + 1e-9);
    const y = Math.round(a.y + (b.y - a.y) * t + 1e-9);
    if ((x === a.x && y === a.y) || (x === b.x && y === b.y)) continue;
    const key = `${x},${y}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ x, y });
    }
  }
  return out;
}
