import { validateCommand } from '../core/engine';
import { samePos } from '../core/geometry';
import type { ReachableSquare } from '../core/movement';
import { getUnit, isFighting, unitAt } from '../core/state';
import type { BattleState, Pos, Unit } from '../core/types';

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

  /** The current step's text and "n/m" progress, or null when finished or absent. */
  current(): { text: string; progress: string } | null {
    const steps = this.steps;
    const s = steps?.[this.step];
    return s && steps ? { text: s.text, progress: `${this.step + 1}/${steps.length}` } : null;
  }
}
