import { validateCommand } from '../core/engine';
import { samePos } from '../core/geometry';
import type { ReachableSquare } from '../core/movement';
import type { GameEvent } from '../core/events';
import { getUnit, isEngaged, isFighting, unitAt } from '../core/state';
import type { BattleState, Pos, Side, Unit } from '../core/types';

/**
 * The battle controller's mode state machine, as pure functions (review 1 WP7): given the
 * state, the current mode and a tapped square, decide what the tap means. The controller
 * carries the decision out (highlights, commands, animations).
 */
export type Mode =
  | { kind: 'idle' }
  | { kind: 'selected'; unitId: string }
  | { kind: 'ghost'; unitId: string; dest: Pos }
  | { kind: 'facing'; unitId: string }
  | { kind: 'preview'; unitId: string; targetId: string }
  | { kind: 'skillTarget'; unitId: string; skillId: string }
  | { kind: 'busy' }
  | { kind: 'over' };

/** What the selected unit can do now. */
export interface Targets {
  reach: ReachableSquare[];
  charge: Unit[];
  shoot: Unit[];
}

export type TapAction =
  | { do: 'deselect' }
  | { do: 'select'; unitId: string }
  | { do: 'preview'; targetId: string; type: 'Charge' | 'Shoot' }
  | { do: 'explain'; message: string }
  | { do: 'ghost'; dest: Pos }
  | { do: 'confirmMove'; dest: Pos }
  | { do: 'outOfControl' };

/** A tap on a map square while selecting, ghosting or idle. */
export function decideCellTap(
  state: BattleState,
  mode: Mode,
  targets: Targets | null,
  cell: Pos,
): TapAction {
  const there = unitAt(state, cell);
  const sel = 'unitId' in mode ? getUnit(state, mode.unitId) : undefined;
  if (sel && targets) {
    // Tapping the selected unit again deselects it.
    if (there && samePos(there, sel)) return { do: 'deselect' };
    if (there && there.side !== sel.side) {
      const charge = targets.charge.some((u) => u.id === there.id);
      if (charge || targets.shoot.some((u) => u.id === there.id)) {
        return { do: 'preview', targetId: there.id, type: charge ? 'Charge' : 'Shoot' };
      }
      // Not a valid target: say which rule blocks it.
      const why =
        validateCommand(state, { type: 'Charge', unitId: sel.id, targetId: there.id }) ??
        validateCommand(state, { type: 'Shoot', unitId: sel.id, targetId: there.id });
      return { do: 'explain', message: why?.message ?? 'That unit cannot be attacked now.' };
    }
    if (targets.reach.some((r) => samePos(r.pos, cell))) {
      // Two-tap move: the first tap shows the ghost, the second on the same square moves.
      return mode.kind === 'ghost' && samePos(mode.dest, cell)
        ? { do: 'confirmMove', dest: cell }
        : { do: 'ghost', dest: cell };
    }
  }
  if (there && there.side === state.activeSide && isFighting(there)) {
    return { do: 'select', unitId: there.id };
  }
  if (there && there.side === state.activeSide) return { do: 'outOfControl' };
  return { do: 'deselect' };
}

/** A tap while choosing a skill's target: use it on a valid unit, else cancel. */
export function decideSkillTap(
  state: BattleState,
  mode: Extract<Mode, { kind: 'skillTarget' }>,
  cell: Pos | null,
): { do: 'useSkill'; targetId: string } | { do: 'cancel' } {
  const t = cell && unitAt(state, cell);
  if (
    t &&
    !validateCommand(state, {
      type: 'UseSkill',
      unitId: mode.unitId,
      skillId: mode.skillId,
      targetId: t.id,
    })
  ) {
    return { do: 'useSkill', targetId: t.id };
  }
  return { do: 'cancel' };
}

import type { TutorialStep, TutorialTrigger } from '../content/campaign/types';

export type { TutorialStep, TutorialTrigger };

/** Tutorial progress: steps advance when the player does what the current step asks. */
export class TutorialGuide {
  private step = 0;
  constructor(private steps: TutorialStep[] | undefined) {}

  /**
   * Advances past the first step from here on that waits for `trigger`, so a player who
   * skips ahead (charges before a plain move) isn't stuck on an old instruction.
   * Returns true if it moved.
   */
  advance(trigger: TutorialTrigger): boolean {
    const steps = this.steps ?? [];
    // Ending the turn only completes a step that waits for it: it never fast-forwards.
    const last = trigger === 'endTurn' ? this.step : steps.length - 1;
    for (let i = this.step; i <= last && i < steps.length; i++) {
      if (steps[i]!.until !== trigger) continue;
      this.step = i + 1;
      return true;
    }
    return false;
  }

  /** Hides the tutorial for the rest of the battle. */
  skip(): void {
    this.step = this.steps?.length ?? 0;
  }

  /** The current step, its "n/m" progress, or null when finished or absent. */
  current(): { text: string; progress: string; unit?: string; step: TutorialStep } | null {
    const steps = this.steps;
    const s = steps?.[this.step];
    if (!s || !steps) return null;
    return { text: s.text, progress: `${this.step + 1}/${steps.length}`, unit: s.unit, step: s };
  }
}

/**
 * The tutorial triggers a player's command produced, read from its events (GAME_DESIGN 7.4:
 * steps advance on real events). `before` is the state the command was applied to.
 * 'select' and keeping a facing are UI events and are reported by the controller.
 */
export function tutorialTriggers(
  before: BattleState,
  events: GameEvent[],
  side: Side,
): TutorialTrigger[] {
  const mine = (id: string) => getUnit(before, id)?.side === side;
  const out: TutorialTrigger[] = [];
  const charge = events.find(
    (e): e is Extract<GameEvent, { type: 'ChargeDeclared' }> =>
      e.type === 'ChargeDeclared' && mine(e.unitId),
  );
  if (charge) {
    out.push('charge');
    if (isEngaged(before, charge.targetId)) out.push('support');
    const hit = events.find(
      (e) => e.type === 'DamageDealt' && e.kind === 'impact' && e.attackerId === charge.unitId,
    );
    if (hit && hit.type === 'DamageDealt' && hit.arc !== 'front') out.push('flankCharge');
  } else if (
    events.some((e) => e.type === 'UnitMoved' && e.kind !== 'pushBack' && mine(e.unitId))
  ) {
    out.push('move');
  }
  if (events.some((e) => e.type === 'ShotFired' && mine(e.unitId))) out.push('shoot');
  if (events.some((e) => e.type === 'SkillUsed' && mine(e.unitId))) out.push('skill');
  if (events.some((e) => e.type === 'SideTurnEnded' && e.side === side)) out.push('endTurn');
  return out;
}

/**
 * The squares a tutorial step highlights on the board (GAME_DESIGN 7.4: the exact unit or
 * square the step means). Named units are found by scenario id; `targets` lists the enemies
 * the step's troop can shoot or charge now; a step that only names a troop marks every
 * unit of that troop. Units that left the map are skipped.
 */
export function tutorialMarks(state: BattleState, step: TutorialStep, side: Side): Pos[] {
  const out: Pos[] = [];
  const add = (p: Pos) => {
    if (!out.some((q) => samePos(q, p))) out.push({ x: p.x, y: p.y });
  };
  const onMap = (u: Unit | undefined): u is Unit => !!u && u.status === 'active';
  const h = step.highlight;
  for (const id of h?.units ?? []) {
    const u = getUnit(state, id);
    if (onMap(u)) add(u);
  }
  for (const p of h?.squares ?? []) add(p);
  const mine = state.units.filter(
    (u) => u.side === side && onMap(u) && (!step.unit || u.type.id === step.unit),
  );
  if (h?.targets) {
    for (const e of state.units.filter((u) => u.side !== side && onMap(u))) {
      const ok = mine.some(
        (u) =>
          validateCommand(state, {
            type: h.targets === 'shoot' ? 'Shoot' : 'Charge',
            unitId: u.id,
            targetId: e.id,
          }) === null,
      );
      if (ok) add(e);
    }
  }
  if (!h && step.unit) for (const u of mine) add(u);
  return out;
}
