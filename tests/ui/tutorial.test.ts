import { describe, expect, it } from 'vitest';
import { AiPlayer, playAiSideTurn } from '../../src/ai/utility';
import { BATTLE_BY_ID } from '../../src/content/campaign/battles';
import { buildScenario } from '../../src/content/campaign/build';
import type {
  CampaignBattle,
  TutorialStep,
  TutorialTrigger,
} from '../../src/content/campaign/types';
import {
  applyCommand,
  getUnit,
  isEngaged,
  isOnMap,
  nearestDir,
  reachableSquares,
  type BattleState,
  type Command,
  type Unit,
} from '../../src/core';
import { BattleSession } from '../../src/core/session';
import { startBattle } from '../../src/core/engine';
import { TutorialGuide, tutorialMarks, tutorialTriggers } from '../../src/ui/tapDecision';
import { battle, E, N, S, W } from '../core/helpers';

const unitAtPos = (s: BattleState, p: { x: number; y: number }) =>
  s.units.find((u) => isOnMap(u) && u.x === p.x && u.y === p.y);

const blueUnits = (s: BattleState) =>
  s.units.filter((u) => u.side === 'blue' && isOnMap(u) && !u.type.tags.includes('Commander'));
const enemies = (s: BattleState) => s.units.filter((u) => u.side === 'red' && isOnMap(u));
const gap = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

/** Every command the player could give now, using only `unit` troops if given. */
function candidates(s: BattleState, unit?: string): Command[] {
  const out: Command[] = [];
  const general = s.sides.blue.general;
  if (general && !unit) {
    for (const sk of general.skills) {
      out.push({ type: 'UseSkill', unitId: general.unitId, skillId: sk.id });
      // Targeted skills (Hold Fast, Rally): try each of the player's own units.
      for (const u of s.units.filter((x) => x.side === 'blue' && isOnMap(x))) {
        out.push({ type: 'UseSkill', unitId: general.unitId, skillId: sk.id, targetId: u.id });
      }
    }
  }
  for (const u of blueUnits(s)) {
    if (unit && u.type.id !== unit) continue;
    for (const e of enemies(s)) {
      out.push({ type: 'Charge', unitId: u.id, targetId: e.id });
      out.push({ type: 'Shoot', unitId: u.id, targetId: e.id });
    }
    for (const r of reachableSquares(s, u)) {
      if (r.kind !== 'move') continue;
      // Keep the facing, or turn to face an enemy (the facing ring).
      const facings = new Set(enemies(s).map((e) => nearestDir(r.pos, e)));
      out.push({ type: 'Move', unitId: u.id, to: r.pos });
      for (const f of facings) out.push({ type: 'Move', unitId: u.id, to: r.pos, facing: f });
    }
  }
  return out;
}

/** A move that brings a unit closer to the enemy without walking into contact. */
function approach(s: BattleState, u: Unit): Command | null {
  let best: Command | null = null;
  let bestD = Math.min(...enemies(s).map((e) => gap(u, e)));
  for (const r of reachableSquares(s, u)) {
    if (r.kind !== 'move') continue;
    const d = Math.min(...enemies(s).map((e) => gap(r.pos, e)));
    if (d >= 2 && d < bestD) {
      bestD = d;
      best = { type: 'Move', unitId: u.id, to: r.pos };
    }
  }
  return best;
}

const UI_ONLY: TutorialTrigger[] = ['select', 'facing'];

/** What a command did for the tutorial, or null if it was rejected. */
function triggersOf(s: BattleState, cmd: Command) {
  const res = applyCommand(s, cmd);
  return res.ok ? { state: res.state, t: tutorialTriggers(s, res.events, 'blue') } : null;
}

interface Option {
  cmds: Command[];
  after: BattleState;
  /** A flank charge is the lesson of a charge step: prefer it. */
  flank: boolean;
}

/**
 * Whether a command does what the step's highlight points at: a move to a marked square, a
 * marked player unit acting, a marked enemy as the target (GAME_DESIGN 7.4).
 */
function followsHighlight(step: TutorialStep, cmd: Command): boolean {
  const h = step.highlight;
  if (!h) return true;
  const ids = h.units ?? [];
  const mineIds = ids.filter((id) => !id.startsWith('e'));
  const enemyIds = ids.filter((id) => id.startsWith('e'));
  if (cmd.type === 'Move' && h.squares?.length) {
    return h.squares.some((p) => p.x === cmd.to.x && p.y === cmd.to.y);
  }
  if (cmd.type === 'UseSkill') return true;
  if ('unitId' in cmd && mineIds.length && !mineIds.includes(cmd.unitId)) return false;
  if ((cmd.type === 'Charge' || cmd.type === 'Shoot') && enemyIds.length) {
    return enemyIds.includes(cmd.targetId);
  }
  return true;
}

/** Ways to do what `step` asks this turn: one command, or a move and then one command. */
function options(s: BattleState, step: TutorialStep, pairs = true): Option[] {
  const out: Option[] = [];
  for (const c of candidates(s, step.unit).filter((x) => followsHighlight(step, x))) {
    const r = triggersOf(s, c);
    if (r?.t.includes(step.until)) {
      out.push({ cmds: [c], after: r.state, flank: r.t.includes('flankCharge') });
    }
  }
  if (out.length || !pairs) return out;
  for (const m of candidates(s, step.unit).filter((c) => c.type === 'Move')) {
    const moved = triggersOf(s, m);
    if (!moved) continue;
    for (const c of candidates(moved.state, step.unit).filter(
      (x) => x.type !== 'Move' && followsHighlight(step, x),
    )) {
      const r = triggersOf(moved.state, c);
      if (r?.t.includes(step.until)) {
        out.push({ cmds: [m, c], after: r.state, flank: r.t.includes('flankCharge') });
      }
    }
  }
  return out;
}

/** How many of the next steps can be done one command each this turn (flank charges +0.5). */
function reach(s: BattleState, steps: TutorialStep[], i: number, depth = 2): number {
  let n = 0;
  while (UI_ONLY.includes(steps[i]?.until as TutorialTrigger)) {
    i++;
    n++;
  }
  const step = steps[i];
  if (!step || depth === 0 || step.until === 'endTurn' || step.until === 'never') return n;
  let best = -1;
  for (const o of options(s, step, false)) {
    best = Math.max(best, (o.flank ? 0.5 : 0) + reach(o.after, steps, i + 1, depth - 1));
  }
  return best < 0 ? n : n + 1 + best;
}

interface Run {
  done: boolean;
  /** Triggers each player command produced, in order. */
  log: TutorialTrigger[][];
  /** The player's commands, in order, with the step that was current. */
  cmds: { cmd: Command; step: number }[];
  state: BattleState;
}

/**
 * Plays a tutorial battle by doing what each step asks with the troop it names: one command,
 * or a move then one command, choosing the way that leaves the next steps possible. If
 * nothing works this turn it closes in, ends the turn and lets the enemy AI move.
 */
function playTutorial(b: CampaignBattle): Run {
  const steps = b.tutorial!;
  const guide = new TutorialGuide(steps);
  const army = b.fixedArmy ?? b.testArmy;
  const session = new BattleSession(startBattle(buildScenario(b, army, 7)));
  const red = new AiPlayer('red', { posture: b.posture, attackTurn: b.attackTurn });
  const log: TutorialTrigger[][] = [];
  const cmds: { cmd: Command; step: number }[] = [];
  const stepIndex = () => steps.findIndex((s) => s.text === guide.current()?.text);
  const run = (cmd: Command) => {
    cmds.push({ cmd, step: stepIndex() });
    const before = session.state;
    const res = session.apply(cmd);
    if (!res.ok) throw new Error(`${cmd.type} rejected: ${res.rejection.message}`);
    const t = tutorialTriggers(before, res.events, 'blue');
    log.push(t);
    for (const x of t) guide.advance(x);
  };
  const endTurn = () => {
    run({ type: 'EndTurn' });
    if (!session.state.result)
      playAiSideTurn(
        red,
        (c) => session.apply(c),
        () => session.state,
      );
  };

  for (let guard = 0; guard < 60 && !session.state.result; guard++) {
    const i = stepIndex();
    const step = steps[i];
    if (!step || step.until === 'never') break;
    if (UI_ONLY.includes(step.until)) {
      guide.advance(step.until);
      continue;
    }
    if (step.until === 'endTurn') {
      endTurn();
      continue;
    }
    let best: Option | null = null;
    let bestReach = -1;
    for (const o of options(session.state, step)) {
      const r = (o.flank ? 0.5 : 0) + reach(o.after, steps, i + 1);
      if (r > bestReach) {
        best = o;
        bestReach = r;
      }
    }
    if (best) {
      best.cmds.forEach(run);
      continue;
    }
    // Nothing this turn: close in, end the turn, let the enemy move.
    for (const u of blueUnits(session.state)) {
      if (isEngaged(session.state, u.id)) continue;
      const m = approach(session.state, u);
      if (m) run(m);
    }
    endTurn();
  }
  return {
    done: steps[stepIndex()]?.until === 'never',
    log,
    cmds,
    state: session.state,
  };
}

const runs = new Map<string, Run>();
const played = (id: string) => {
  if (!runs.has(id)) runs.set(id, playTutorial(BATTLE_BY_ID[id]!));
  return runs.get(id)!;
};

describe('Age 0 tutorial scripts (GAME_DESIGN 7.4)', () => {
  for (const id of ['megiddo', 'kadesh']) {
    it(`${id}: the script can be completed by following its own steps`, () => {
      const r = played(id);
      expect(r.done).toBe(true);
      // The player hasn't lost the battle along the way.
      expect(r.state.result?.winner).not.toBe('red');
    });
  }

  it('megiddo: the supporting charge is also a flank charge', () => {
    const r = played('megiddo');
    const support = r.log.find((t) => t.includes('support'));
    expect(support).toContain('flankCharge');
  });

  it('megiddo: each step is done by the unit it highlights, on the enemy it highlights', () => {
    const b = BATTLE_BY_ID.megiddo!;
    const r = played('megiddo');
    b.tutorial!.forEach((step, i) => {
      const ids = step.highlight?.units ?? [];
      const attacker = ids.find((id) => id.startsWith('p'));
      const target = ids.find((id) => id.startsWith('e'));
      if (!['charge', 'flankCharge'].includes(step.until)) return;
      const done = r.cmds.filter((c) => c.step === i && c.cmd.type === 'Charge').at(-1);
      expect(done, `step ${i + 1}`).toBeDefined();
      expect(done!.cmd).toMatchObject({ unitId: attacker, targetId: target });
    });
  });

  it('megiddo is won within about 3 turns by following the script', () => {
    const r = played('megiddo');
    expect(r.state.result?.winner).toBe('blue');
    expect(r.state.result!.turn).toBeLessThanOrEqual(4);
  });
});

describe('tutorial highlights match the scenario (owner: steps pointed at the wrong enemies)', () => {
  for (const id of ['megiddo', 'kadesh']) {
    const b = BATTLE_BY_ID[id]!;
    const army = b.fixedArmy ?? b.testArmy;
    const state = startBattle(buildScenario(b, army, 1));
    it.each(b.tutorial!.map((step, i) => ({ step, i })))(
      `${id} step $i: highlighted units and squares exist and fit the step`,
      ({ step }) => {
        for (const uid of step.highlight?.units ?? []) {
          const u = getUnit(state, uid);
          expect(u, uid).toBeDefined();
          // Player units: the troop the step names; enemies: an enemy.
          if (uid.startsWith('p') && uid !== 'pg' && step.unit) expect(u!.type.id).toBe(step.unit);
          if (uid.startsWith('e')) expect(u!.side).toBe('red');
          if (uid === 'pg') expect(state.sides.blue.general?.unitId).toBe('pg');
        }
        for (const p of step.highlight?.squares ?? []) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThan(state.map.width);
          expect(p.y).toBeLessThan(state.map.height);
          expect(unitAtPos(state, p)).toBeUndefined();
        }
        // A step that names a troop or highlights something marks at least one square now
        // or once its condition can be met (a shot needs an enemy in range).
        const marks = tutorialMarks(state, step, 'blue');
        if (step.highlight?.units?.length || step.highlight?.squares?.length) {
          expect(marks.length).toBeGreaterThan(0);
        }
      },
    );
  }

  it('megiddo: the north enemy and the south enemy are where the text says', () => {
    const b = BATTLE_BY_ID.megiddo!;
    const state = startBattle(buildScenario(b, b.fixedArmy!, 1));
    const [e0, e1] = [getUnit(state, 'e0')!, getUnit(state, 'e1')!];
    const [p1, p2] = [getUnit(state, 'p1')!, getUnit(state, 'p2')!];
    expect(e0.y).toBeLessThan(e1.y);
    expect(p1.y).toBeLessThan(e0.y);
    expect(p2.y).toBeGreaterThan(e1.y);
    // Each chariot unit faces the enemy flank it is told to charge.
    expect(p1.facing).toBe(S);
    expect(p2.facing).toBe(N);
  });
});

describe('tutorialTriggers', () => {
  const setup = () =>
    battle({
      units: [
        ['s', 'blue', 'spearmen', 3, 3, E],
        ['c', 'blue', 'lightCavalry', 5, 1, S],
        ['r', 'red', 'heavySwordsmen', 5, 3, W],
      ],
    });
  const go = (s: BattleState, cmd: Command) => {
    const res = applyCommand(s, cmd);
    if (!res.ok) throw new Error(res.rejection.message);
    return { state: res.state, t: tutorialTriggers(s, res.events, 'blue') };
  };

  it('a plain move is a move; a frontal charge is a charge but not a flank or support', () => {
    const s = setup();
    expect(go(s, { type: 'Move', unitId: 's', to: { x: 2, y: 3 } }).t).toEqual(['move']);
    expect(go(s, { type: 'Charge', unitId: 's', targetId: 'r' }).t).toEqual(['charge']);
  });

  it('a second charge on an engaged enemy from its side is support and a flank charge', () => {
    const first = go(setup(), { type: 'Charge', unitId: 's', targetId: 'r' }).state;
    if (getUnit(first, 'r')?.status !== 'active') return; // routed by the first charge
    const t = go(first, { type: 'Charge', unitId: 'c', targetId: 'r' }).t;
    expect(t).toEqual(expect.arrayContaining(['charge', 'support', 'flankCharge']));
  });

  it('ending the turn is reported for the side that ended it', () => {
    expect(go(setup(), { type: 'EndTurn' }).t).toEqual(['endTurn']);
  });
});
