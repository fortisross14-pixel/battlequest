import { describe, expect, it } from 'vitest';
import { fastForward, gsap, isAnimating, track } from '../../src/ui/motion';

describe('motion', () => {
  // Bug: track() replaced the animation's own onComplete, so cleanup (destroying ink
  // specks, removing the turn banner) never ran.
  it("track() keeps the animation's own onComplete", () => {
    let cleaned = false;
    const o = { v: 0 };
    track(gsap.to(o, { v: 1, duration: 1, onComplete: () => (cleaned = true) }));
    expect(isAnimating()).toBe(true);
    fastForward();
    expect(o.v).toBe(1);
    expect(cleaned).toBe(true);
    expect(isAnimating()).toBe(false);
  });
});
