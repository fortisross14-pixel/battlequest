import { describe, expect, it } from 'vitest';
import {
  arcOf,
  cellsBetween,
  frontSquares,
  nearestDir,
  nextRandom,
  rangeDistance,
  straightLine,
  turnSteps,
} from '../../src/core';
import { E, N, NE, S, W } from './helpers';

describe('seeded RNG', () => {
  it('is reproducible for the same seed', () => {
    const a = { rng: 7 };
    const b = { rng: 7 };
    const xs = Array.from({ length: 5 }, () => nextRandom(a));
    const ys = Array.from({ length: 5 }, () => nextRandom(b));
    expect(xs).toEqual(ys);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
  });
  it('differs for different seeds', () => {
    expect(nextRandom({ rng: 1 })).not.toBe(nextRandom({ rng: 2 }));
  });
});

describe('facing and arcs', () => {
  const pos = { x: 5, y: 5 };
  it('classifies the 8 neighbours of a unit facing north', () => {
    expect(arcOf(pos, N, { x: 5, y: 4 })).toBe('front');
    expect(arcOf(pos, N, { x: 4, y: 4 })).toBe('front');
    expect(arcOf(pos, N, { x: 6, y: 4 })).toBe('front');
    expect(arcOf(pos, N, { x: 4, y: 5 })).toBe('flank');
    expect(arcOf(pos, N, { x: 6, y: 5 })).toBe('flank');
    expect(arcOf(pos, N, { x: 4, y: 6 })).toBe('rear');
    expect(arcOf(pos, N, { x: 5, y: 6 })).toBe('rear');
    expect(arcOf(pos, N, { x: 6, y: 6 })).toBe('rear');
  });
  it('works for diagonal facings', () => {
    expect(arcOf(pos, NE, { x: 6, y: 5 })).toBe('front');
    expect(arcOf(pos, NE, { x: 6, y: 6 })).toBe('flank');
    expect(arcOf(pos, NE, { x: 4, y: 6 })).toBe('rear');
  });
  it('front squares are the zone of control', () => {
    expect(frontSquares(pos, E)).toEqual([
      { x: 6, y: 4 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
    ]);
  });
  it('counts turning steps the short way round', () => {
    expect(turnSteps(N, E)).toBe(2);
    expect(turnSteps(W, NE)).toBe(3);
    expect(turnSteps(N, S)).toBe(4);
  });
  it('finds the nearest direction', () => {
    expect(nearestDir({ x: 0, y: 0 }, { x: 5, y: 1 })).toBe(E);
    expect(nearestDir({ x: 0, y: 0 }, { x: 3, y: -3 })).toBe(NE);
  });
});

describe('lines and distances', () => {
  it('range distance counts diagonals as 1.5', () => {
    expect(rangeDistance({ x: 0, y: 0 }, { x: 4, y: 0 })).toBe(4);
    expect(rangeDistance({ x: 0, y: 0 }, { x: 2, y: 2 })).toBe(3);
    expect(rangeDistance({ x: 0, y: 0 }, { x: 3, y: 1 })).toBe(3.5);
  });
  it('recognises straight lines', () => {
    expect(straightLine({ x: 0, y: 0 }, { x: 3, y: 0 })).toEqual({ dir: E, distance: 3 });
    expect(straightLine({ x: 0, y: 0 }, { x: 2, y: -2 })).toEqual({ dir: NE, distance: 2 });
    expect(straightLine({ x: 0, y: 0 }, { x: 2, y: 1 })).toBeNull();
  });
  it('lists the cells between two squares', () => {
    expect(cellsBetween({ x: 0, y: 0 }, { x: 3, y: 0 })).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(cellsBetween({ x: 0, y: 0 }, { x: 1, y: 0 })).toEqual([]);
  });
});
