import { describe, expect, it } from 'vitest';
import { reachableSquares, validateCommand, type BattleState, type Unit } from '../../src/core';
import {
  decideCellTap,
  decideSkillTap,
  TutorialGuide,
  type Targets,
} from '../../src/ui/tapDecision';
import { battle, E, unit, W, withUnit } from '../core/helpers';

/** Review 1 WP7: the controller's tap state machine as pure functions. */
const setup = () =>
  battle({
    units: [
      ['b', 'blue', 'heavyCavalry', 2, 3, E],
      ['b2', 'blue', 'spearmen', 2, 6, E],
      ['r', 'red', 'archers', 5, 3, W],
      ['r2', 'red', 'spearmen', 11, 7, W],
    ],
  });

function targetsOf(s: BattleState, u: Unit): Targets {
  const enemies = s.units.filter((e) => e.side !== u.side);
  const ok = (type: 'Charge' | 'Shoot') =>
    enemies.filter((e) => !validateCommand(s, { type, unitId: u.id, targetId: e.id }));
  return { reach: reachableSquares(s, u), charge: ok('Charge'), shoot: ok('Shoot') };
}

describe('tap decisions', () => {
  it('idle: tapping an own unit selects it, empty ground deselects', () => {
    const s = setup();
    expect(decideCellTap(s, { kind: 'idle' }, null, { x: 2, y: 3 })).toEqual({
      do: 'select',
      unitId: 'b',
    });
    expect(decideCellTap(s, { kind: 'idle' }, null, { x: 8, y: 1 })).toEqual({ do: 'deselect' });
    // An enemy can't be selected on your turn.
    expect(decideCellTap(s, { kind: 'idle' }, null, { x: 5, y: 3 })).toEqual({ do: 'deselect' });
  });

  it('selected: same unit deselects, another own unit switches, an enemy opens the preview', () => {
    const s = setup();
    const t = targetsOf(s, unit(s, 'b'));
    const mode = { kind: 'selected' as const, unitId: 'b' };
    expect(decideCellTap(s, mode, t, { x: 2, y: 3 })).toEqual({ do: 'deselect' });
    expect(decideCellTap(s, mode, t, { x: 2, y: 6 })).toEqual({ do: 'select', unitId: 'b2' });
    expect(decideCellTap(s, mode, t, { x: 5, y: 3 })).toEqual({
      do: 'preview',
      targetId: 'r',
      type: 'Charge',
    });
  });

  it('an enemy that is not a valid target explains why', () => {
    const s = setup();
    const t = targetsOf(s, unit(s, 'b2'));
    const d = decideCellTap(s, { kind: 'selected', unitId: 'b2' }, t, { x: 11, y: 7 });
    expect(d.do).toBe('explain');
  });

  it('moves take two taps on the same square: ghost, then confirm', () => {
    const s = setup();
    const t = targetsOf(s, unit(s, 'b'));
    const first = decideCellTap(s, { kind: 'selected', unitId: 'b' }, t, { x: 3, y: 4 });
    expect(first).toEqual({ do: 'ghost', dest: { x: 3, y: 4 } });
    const ghost = { kind: 'ghost' as const, unitId: 'b', dest: { x: 3, y: 4 } };
    expect(decideCellTap(s, ghost, t, { x: 3, y: 4 })).toEqual({
      do: 'confirmMove',
      dest: { x: 3, y: 4 },
    });
    // A different square moves the ghost instead.
    expect(decideCellTap(s, ghost, t, { x: 2, y: 2 })).toEqual({
      do: 'ghost',
      dest: { x: 2, y: 2 },
    });
  });

  it('a routed own unit is out of control', () => {
    const s = withUnit(setup(), 'b2', { cohesion: 3 });
    expect(decideCellTap(s, { kind: 'idle' }, null, { x: 2, y: 6 })).toEqual({
      do: 'outOfControl',
    });
  });

  it('skill targeting: a valid unit uses the skill, anything else cancels', () => {
    const s = structuredClone(setup());
    s.sides.blue.general = {
      generalId: 'captain',
      name: 'Captain',
      unitId: 'b',
      commandRadius: 4,
      rallyBonus: 0,
      lost: false,
      skills: [
        { id: 'rally', name: 'Rally', effect: { kind: 'rally' }, cooldown: 3, readyTurn: 1 },
      ],
    };
    unit(s, 'b2').cohesion = 3;
    unit(s, 'b2').y = 4;
    const mode = { kind: 'skillTarget' as const, unitId: 'b', skillId: 'rally' };
    expect(decideSkillTap(s, mode, { x: 2, y: 4 })).toEqual({ do: 'useSkill', targetId: 'b2' });
    expect(decideSkillTap(s, mode, { x: 9, y: 1 })).toEqual({ do: 'cancel' });
    expect(decideSkillTap(s, mode, null)).toEqual({ do: 'cancel' });
  });
});

describe('tutorial guide', () => {
  const steps = () =>
    new TutorialGuide([
      { text: 'Select', until: 'select' },
      { text: 'Move', until: 'move' },
      { text: 'Charge', until: 'charge' },
      { text: 'End turn', until: 'endTurn' },
    ]);

  it('advances on the trigger the current step waits for', () => {
    const g = steps();
    expect(g.current()).toMatchObject({ text: 'Select', progress: '1/4' });
    expect(g.advance('select')).toBe(true);
    expect(g.current()).toMatchObject({ text: 'Move', progress: '2/4' });
    expect(new TutorialGuide(undefined).current()).toBeNull();
  });

  it('skips ahead when the player does a later step first, never back', () => {
    const g = steps();
    // Ending the turn early does not fast-forward the guide.
    expect(g.advance('endTurn')).toBe(false);
    g.advance('select');
    // Charging straight away skips the plain-move step (code review).
    expect(g.advance('charge')).toBe(true);
    expect(g.current()).toMatchObject({ text: 'End turn', progress: '4/4' });
    expect(g.advance('select')).toBe(false);
    expect(g.advance('endTurn')).toBe(true);
    expect(g.current()).toBeNull();
  });
});
