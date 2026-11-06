import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { playGreedySideTurn } from '../../src/ai/greedy';
import { BattleSession, startBattle, type Side } from '../../src/core';
import { sandboxScenario } from '../../src/content/battles/sandbox';
import { battle, E, N, W } from '../core/helpers';

function aiBattle(seed: number, aiSide: Side | 'both', greedyOther = false) {
  const session = new BattleSession(startBattle(sandboxScenario(seed)));
  const ais: Partial<Record<Side, AiPlayer>> = {
    blue:
      aiSide === 'both' || aiSide === 'blue'
        ? new AiPlayer('blue', { posture: 'aggressive' })
        : undefined,
    red:
      aiSide === 'both' || aiSide === 'red'
        ? new AiPlayer('red', { posture: 'aggressive' })
        : undefined,
  };
  let rejected = 0;
  for (let i = 0; i < 100 && !session.state.result; i++) {
    const ai = ais[session.state.activeSide];
    if (ai) {
      playAiSideTurn(
        ai,
        (cmd) => {
          const r = session.apply(cmd);
          if (!r.ok) rejected++;
          return r;
        },
        () => session.state,
      );
    } else if (greedyOther) {
      playGreedySideTurn(session);
    } else {
      session.apply({ type: 'EndTurn' });
    }
  }
  return { session, rejected };
}

describe('utility AI', () => {
  it('only issues valid commands and finishes the sandbox battle', () => {
    for (const seed of [1, 2, 3]) {
      const { session, rejected } = aiBattle(seed, 'both');
      expect(rejected).toBe(0);
      expect(session.state.result).not.toBeNull();
    }
  });

  it('is deterministic', () => {
    const a = aiBattle(5, 'both').session;
    const b = aiBattle(5, 'both').session;
    expect(b.log).toEqual(a.log);
  });

  it('beats the greedy script more often than not', () => {
    let wins = 0;
    let games = 0;
    for (const seed of [11, 12, 13, 14, 15, 16]) {
      for (const side of ['blue', 'red'] as const) {
        const { session } = aiBattle(seed, side, true);
        games++;
        if (session.state.result?.winner === side) wins++;
      }
    }
    expect(wins / games).toBeGreaterThan(0.5);
  });

  it('takes a flank (or better, rear) charge when one is offered', () => {
    const s = battle({
      units: [
        ['k', 'red', 'heavyCavalry', 6, 4, W],
        ['d', 'blue', 'spearmen', 4, 4, N],
        ['far', 'blue', 'spearmen', 0, 0, E],
      ],
    });
    const state = structuredClone(s);
    state.activeSide = 'red';
    const session = new BattleSession(state);
    const cmds: unknown[] = [];
    playAiSideTurn(
      new AiPlayer('red', { posture: 'aggressive' }),
      (c) => {
        cmds.push(c);
        return session.apply(c);
      },
      () => session.state,
    );
    expect(cmds).toContainEqual({ type: 'Charge', unitId: 'k', targetId: 'd' });
  });

  it('defensive units hold their ground instead of marching off', () => {
    const s = structuredClone(
      battle({
        units: [
          ['b', 'blue', 'spearmen', 1, 3, E],
          ['r', 'red', 'spearmen', 10, 3, W],
        ],
      }),
    );
    s.activeSide = 'red';
    const cmd = new AiPlayer('red', { posture: 'defensive' }).next(s);
    expect(cmd.type === 'Move' ? Math.abs(cmd.to.x - 10) : 0).toBeLessThanOrEqual(1);
  });

  it('timed posture attacks from its attack turn', () => {
    const s = structuredClone(
      battle({
        units: [
          ['b', 'blue', 'spearmen', 1, 3, E],
          ['r', 'red', 'spearmen', 10, 3, W],
        ],
      }),
    );
    s.activeSide = 'red';
    s.turn = 5;
    const cmd = new AiPlayer('red', { posture: 'timed', attackTurn: 5 }).next(s);
    expect(cmd.type).toBe('Move');
    if (cmd.type === 'Move') expect(cmd.to.x).toBeLessThan(10);
  });
});
