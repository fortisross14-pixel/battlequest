import type { Graphics } from 'pixi.js';
import type { Pos } from '../core/types';

/** Deterministic pseudo-random in [0,1) from integers (for stable terrain decoration). */
export function hash01(...n: number[]): number {
  let h = 2166136261;
  for (const v of n) {
    h ^= v + 0x9e3779b9;
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * Diagonal hatch lines clipped to a centred w×h rectangle (local coordinates).
 * `spacing` is the distance between lines; `cross` adds the other diagonal.
 */
export function hatch(g: Graphics, w: number, h: number, spacing: number, cross: boolean): void {
  const hw = w / 2;
  const hh = h / 2;
  const lines = (sign: 1 | -1) => {
    // Lines y = sign * x + c, clipped to the rectangle.
    for (let c = -(hw + hh); c <= hw + hh; c += spacing) {
      const pts: Pos[] = [];
      for (const x of [-hw, hw]) {
        const y = sign * x + c;
        if (y >= -hh && y <= hh) pts.push({ x, y });
      }
      for (const y of [-hh, hh]) {
        const x = sign * (y - c);
        if (x > -hw && x < hw) pts.push({ x, y });
      }
      if (pts.length >= 2) g.moveTo(pts[0]!.x, pts[0]!.y).lineTo(pts[1]!.x, pts[1]!.y);
    }
  };
  lines(1);
  if (cross) lines(-1);
}

/**
 * A broad battle-diagram arrow along a polyline (world coordinates).
 * Draws a shaft of `width` and a triangular head at the end.
 */
export function arrow(g: Graphics, pts: Pos[], width: number, color: number, alpha: number): void {
  if (pts.length < 2) return;
  const last = pts[pts.length - 1]!;
  const prev = pts[pts.length - 2]!;
  const dx = last.x - prev.x;
  const dy = last.y - prev.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const head = width * 1.6;
  const shaftEnd = { x: last.x - ux * head, y: last.y - uy * head };
  const shaft = [...pts.slice(0, -1), shaftEnd];
  g.moveTo(shaft[0]!.x, shaft[0]!.y);
  for (const p of shaft.slice(1)) g.lineTo(p.x, p.y);
  g.stroke({ width, color, alpha, cap: 'round', join: 'round' });
  const px = -uy;
  const py = ux;
  g.poly([
    last.x,
    last.y,
    shaftEnd.x + px * head * 0.8,
    shaftEnd.y + py * head * 0.8,
    shaftEnd.x - px * head * 0.8,
    shaftEnd.y - py * head * 0.8,
  ]).fill({ color, alpha });
}

/** Dashed straight line. */
export function dashed(g: Graphics, a: Pos, b: Pos, dash: number, gap: number): void {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  for (let t = 0; t < len; t += dash + gap) {
    const e = Math.min(len, t + dash);
    g.moveTo(a.x + ux * t, a.y + uy * t).lineTo(a.x + ux * e, a.y + uy * e);
  }
}
