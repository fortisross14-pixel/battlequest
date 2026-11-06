import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn, type Posture } from '../../src/ai/utility';
import { BattleSession, isEngaged, type BattleState, type Command } from '../../src/core';
import { battle, E, openRows, run, unit, W } from '../core/helpers';

/** Plays red's side turn with the AI and returns red's commands. */
function redTurn(state: BattleState, ai: AiPlayer): { cmds: Command[]; state: BattleState } {
  const session = new BattleSession(state);
  const cmds: Command[] = [];
  playAiSideTurn(
    ai,
    (c) => {
      const r = session.apply(c);
      if (r.ok && c.type !== 'EndTurn') cmds.push(c);
      return r;
    },
    () => session.state,
  );
  return { cmds, state: session.state };
}

/**
 * Review 1 reproduction: blue swordsmen charge red spearmen. A red horseman a few squares
 * away should ride round and hit the swordsmen in the flank, not turn and hold.
 */
function friendInMelee(): BattleState {
  let s = battle({
    units: [
      ['b', 'blue', 'heavySwordsmen', 5, 3, E],
      ['far', 'blue', 'spearmen', 0, 7, E],
      ['a', 'red', 'spearmen', 6, 3, W],
      ['n', 'red', 'heavyCavalry', 8, 5, W],
    ],
  });
  s = run(s, { type: 'Charge', unitId: 'b', targetId: 'a' }).state;
  s = run(s, { type: 'EndTurn' }).state;
  expect(isEngaged(s, 'b')).toBe(true);
  return s;
}

describe.each<Posture>(['aggressive', 'defensive'])('enemy AI as an army (%s)', (posture) => {
  it('supports a friend in melee', () => {
    const { cmds } = redTurn(friendInMelee(), new AiPlayer('red', { posture }));
    expect(cmds).toContainEqual({ type: 'Charge', unitId: 'n', targetId: 'b' });
  });

  it('does not idle with a favourable move + charge', () => {
    const s = structuredClone(
      battle({
        units: [
          ['arch', 'blue', 'archers', 4, 6, E],
          ['far', 'blue', 'spearmen', 0, 0, E],
          ['k', 'red', 'heavyCavalry', 8, 3, W],
        ],
      }),
    );
    s.activeSide = 'red';
    const { cmds } = redTurn(s, new AiPlayer('red', { posture }));
    const kCmds = cmds.filter((c) => 'unitId' in c && c.unitId === 'k');
    expect(kCmds.map((c) => c.type)).toEqual(['Move', 'Charge']);
  });
});

describe('posture triggers', () => {
  const quiet = () =>
    battle({
      units: [
        ['b', 'blue', 'spearmen', 1, 3, E],
        ['r', 'red', 'spearmen', 10, 3, W],
        ['r2', 'red', 'archers', 10, 6, W],
      ],
    });

  it('a defensive unit stays defensive while nothing happens', () => {
    const s = structuredClone(quiet());
    s.activeSide = 'red';
    const ai = new AiPlayer('red', { posture: 'defensive' });
    ai.next(s);
    expect(ai.postureOf(s, 'r')).toBe('defensive');
  });

  it('turns aggressive when an enemy comes close', () => {
    const s = structuredClone(quiet());
    s.activeSide = 'red';
    unit(s, 'b').x = 8;
    unit(s, 'b').y = 2;
    const ai = new AiPlayer('red', { posture: 'defensive' });
    ai.next(s);
    expect(ai.postureOf(s, 'r')).toBe('aggressive');
    // The far archers are not triggered by that enemy.
    expect(ai.postureOf(s, 'r2')).toBe('defensive');
  });

  it('turns aggressive when a friend nearby is in melee, or when shot', () => {
    const s = friendInMelee();
    const ai = new AiPlayer('red', { posture: 'defensive' });
    ai.next(s);
    expect(ai.postureOf(s, 'n')).toBe('aggressive');

    const t = structuredClone(quiet());
    t.activeSide = 'red';
    unit(t, 'r2').strength = 90;
    const ai2 = new AiPlayer('red', { posture: 'defensive' });
    ai2.next(t);
    expect(ai2.postureOf(t, 'r2')).toBe('aggressive');
  });

  it('a timed army still attacks from its attack turn', () => {
    const s = structuredClone(quiet());
    s.activeSide = 'red';
    s.turn = 5;
    const ai = new AiPlayer('red', { posture: 'timed', attackTurn: 5 });
    expect(ai.postureOf(s, 'r')).toBe('aggressive');
  });
});

describe('path-aware approach', () => {
  it('routes through the ford instead of waiting at the river', () => {
    // A river down column 6 with a single ford near the bottom.
    const rows = openRows(12, 8).map((r, y) => r.slice(0, 6) + (y === 6 ? '=' : '~') + r.slice(7));
    let s = battle({
      rows,
      units: [
        ['b', 'blue', 'spearmen', 1, 1, E],
        ['r', 'red', 'spearmen', 10, 1, W],
      ],
      turnLimit: 30,
    });
    const ai = new AiPlayer('red', { posture: 'aggressive' });
    let fordOn = Infinity;
    let crossedOn = Infinity;
    for (let turn = 1; turn <= 6 && crossedOn === Infinity; turn++) {
      s = run(s, { type: 'EndTurn' }).state; // blue waits
      s = redTurn(s, ai).state;
      const r = unit(s, 'r');
      if (r.x <= 6 && fordOn === Infinity) fordOn = turn;
      if (r.x < 6) crossedOn = turn;
    }
    expect(fordOn).toBeLessThanOrEqual(4);
    expect(crossedOn).toBeLessThanOrEqual(5);
  });
});

describe('robustness', () => {
  it('a general in melee still uses a skill', () => {
    let s = battle({
      units: [
        ['b', 'blue', 'heavySwordsmen', 5, 3, E],
        ['b2', 'blue', 'heavySwordsmen', 5, 5, E],
        ['far', 'blue', 'spearmen', 0, 7, E],
        ['a', 'red', 'spearmen', 6, 3, W],
        ['a2', 'red', 'spearmen', 6, 5, W],
      ],
    });
    s.sides.red.general = {
      generalId: 'test',
      name: 'Test',
      unitId: 'a',
      commandRadius: 4,
      rallyBonus: 0,
      skills: [
        {
          id: 'hl',
          name: 'Hold the Line',
          description: '',
          effect: { kind: 'holdTheLine', turns: 1 },
          cooldown: 3,
          readyTurn: 1,
        },
      ],
      lost: false,
    } as unknown as BattleState['sides']['red']['general'];
    s = run(s, { type: 'Charge', unitId: 'b', targetId: 'a' }).state;
    s = run(s, { type: 'Charge', unitId: 'b2', targetId: 'a2' }).state;
    s = run(s, { type: 'EndTurn' }).state;
    expect(isEngaged(s, 'a')).toBe(true);
    const { cmds } = redTurn(s, new AiPlayer('red', { posture: 'defensive' }));
    expect(cmds.some((c) => c.type === 'UseSkill')).toBe(true);
  });

  it('skips a unit whose command is rejected instead of ending the turn', () => {
    const s = structuredClone(
      battle({
        units: [
          ['b', 'blue', 'spearmen', 1, 3, E],
          ['r1', 'red', 'spearmen', 10, 2, W],
          ['r2', 'red', 'spearmen', 10, 5, W],
        ],
      }),
    );
    s.activeSide = 'red';
    const ai = new AiPlayer('red', { posture: 'aggressive' });
    const first = ai.next(s);
    expect(first.type).not.toBe('EndTurn');
    ai.rejected(first);
    const second = ai.next(s);
    expect(second.type).not.toBe('EndTurn');
    expect('unitId' in second && 'unitId' in first && second.unitId).not.toBe(
      'unitId' in first ? first.unitId : '',
    );
  });
});

describe('owner feedback: the whole army fights, generals stay back', () => {
  it('a far defensive unit joins in once any friend is locked in melee', () => {
    const s = friendInMelee();
    // Move the horseman far away from the fight.
    const far = structuredClone(s);
    unit(far, 'n').x = 11;
    unit(far, 'n').y = 0;
    const ai = new AiPlayer('red', { posture: 'defensive' });
    expect(ai.postureOf(far, 'n')).toBe('aggressive');
  });

  it('the AI general keeps behind its line instead of advancing into the enemy', () => {
    const s = structuredClone(
      battle({
        units: [
          ['b', 'blue', 'spearmen', 3, 3, E],
          ['b2', 'blue', 'spearmen', 3, 4, E],
          ['r1', 'red', 'spearmen', 7, 3, W],
          ['r2', 'red', 'spearmen', 7, 4, W],
          ['rg', 'red', 'generalGuard', 8, 1, W],
        ],
      }),
    );
    s.sides.red.general = {
      generalId: 'captain',
      name: 'Captain',
      unitId: 'rg',
      commandRadius: 3,
      rallyBonus: 0,
      lost: false,
      skills: [],
    };
    s.activeSide = 'red';
    const { state } = redTurn(s, new AiPlayer('red', { posture: 'aggressive' }));
    const g = unit(state, 'rg');
    // Behind (east of) its own line and not next to an enemy.
    expect(g.x).toBeGreaterThanOrEqual(8);
    expect(Math.abs(g.y - 3.5)).toBeLessThanOrEqual(1.5);
  });
});
