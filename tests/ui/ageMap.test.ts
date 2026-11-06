import { describe, expect, it } from 'vitest';
import { spreadNodes } from '../../src/ui/screens/ageMap';

describe('age map node spreading', () => {
  it('keeps every pair of nodes at least the gap apart, inside the map', () => {
    // Five Greek battles a few miles apart, as on the Antiquity map.
    const pts: [number, number][] = [
      [100, 200],
      [104, 203],
      [98, 210],
      [110, 198],
      [100, 200],
    ];
    const out = spreadNodes(pts, 90, 1200, 600);
    for (let i = 0; i < out.length; i++) {
      const [x, y] = out[i]!;
      expect(x).toBeGreaterThanOrEqual(45);
      expect(y).toBeGreaterThanOrEqual(45);
      for (let j = i + 1; j < out.length; j++) {
        const d = Math.hypot(out[j]![0] - x, out[j]![1] - y);
        expect(d).toBeGreaterThanOrEqual(89);
      }
    }
  });

  it('leaves nodes that are already far apart where they are', () => {
    const pts: [number, number][] = [
      [100, 100],
      [600, 300],
    ];
    expect(spreadNodes(pts, 90, 1200, 600)).toEqual(pts);
  });
});
