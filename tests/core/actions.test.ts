import { describe, expect, it } from 'vitest';
import { validateCommand } from '../../src/core';
import { battle, E, run, W } from './helpers';

/** Prompt 09: the Restart command and the tactical actions (GAME_DESIGN 4.12). */

describe('Restart (UX §6)', () => {
  it('ends the battle with no winner and no defeat, and nothing more can be ordered', () => {
    const s = battle({
      units: [
        ['b', 'blue', 'spearmen', 3, 3, E],
        ['r', 'red', 'spearmen', 10, 3, W],
      ],
    });
    const res = run(s, { type: 'Restart' });
    expect(res.state.result).toMatchObject({ winner: null, reason: 'restarted', broken: [] });
    expect(res.events).toContainEqual({ type: 'BattleEnded', result: res.state.result });
    expect(validateCommand(res.state, { type: 'Restart' })?.code).toBe('BATTLE_OVER');
  });
});
