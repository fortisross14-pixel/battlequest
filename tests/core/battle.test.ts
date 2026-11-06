import { describe, expect, it } from 'vitest';
import { BattleSession, startBattle } from '../../src/core';
import { sandboxScenario } from '../../src/content/battles/sandbox';
import { playGreedyBattle } from '../../src/ai/greedy';

function playBattle(seed: number): BattleSession {
  return playGreedyBattle(new BattleSession(startBattle(sandboxScenario(seed))));
}

describe('headless scripted battle', () => {
  it('runs the sandbox battle to a result', () => {
    const session = playBattle(1457);
    const result = session.state.result;
    expect(result).not.toBeNull();
    expect(result!.reason).toBe('armyBroken');
    expect(result!.winner).not.toBeNull();
    expect(result!.turn).toBeLessThanOrEqual(session.state.turnLimit);
    expect(session.log.length).toBeGreaterThan(20);
  });

  it('is reproducible: the same seed and commands give the same battle', () => {
    const a = playBattle(1457);
    const b = playBattle(1457);
    expect(JSON.stringify(b.state)).toBe(JSON.stringify(a.state));
    expect(b.log).toEqual(a.log);

    // Replaying the command log from scratch rebuilds the exact same final state.
    const replay = new BattleSession(startBattle(sandboxScenario(1457)));
    for (const cmd of a.log) expect(replay.apply(cmd).ok).toBe(true);
    expect(JSON.stringify(replay.state)).toBe(JSON.stringify(a.state));
  });

  it('a different seed changes the dice', () => {
    expect(JSON.stringify(playBattle(99).state)).not.toBe(JSON.stringify(playBattle(1457).state));
  });

  it('undo restores the state before a move and is blocked after combat', () => {
    const session = new BattleSession(startBattle(sandboxScenario(1)));
    const before = JSON.stringify(session.state);
    expect(session.apply({ type: 'Move', unitId: 'b-spear', to: { x: 6, y: 3 } }).ok).toBe(true);
    expect(session.canUndo()).toBe(true);
    session.undo();
    expect(JSON.stringify(session.state)).toBe(before);
    session.apply({ type: 'Hold', unitId: 'b-spear' });
    expect(session.canUndo()).toBe(false);
  });
});
