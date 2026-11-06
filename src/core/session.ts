import { applyCommand, type Command, type CommandResult } from './engine';
import type { GameEvent } from './events';
import { reject, type Rejection } from './rejection';
import type { BattleState } from './types';

/**
 * Holds the current battle state, the command log (for replays) and an undo stack.
 * Only Move and Rotate can be undone: they use no randomness and reveal nothing.
 */
export class BattleSession {
  state: BattleState;
  readonly log: Command[] = [];
  private undoStack: BattleState[] = [];

  constructor(initial: BattleState) {
    this.state = initial;
  }

  apply(cmd: Command): CommandResult {
    const res = applyCommand(this.state, cmd);
    if (!res.ok) return res;
    if (cmd.type === 'Move' || cmd.type === 'Rotate') this.undoStack.push(this.state);
    else this.undoStack = [];
    this.state = res.state;
    this.log.push(cmd);
    return res;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  undo():
    { ok: true; state: BattleState; events: GameEvent[] } | { ok: false; rejection: Rejection } {
    const prev = this.undoStack.pop();
    if (!prev) return { ok: false, rejection: reject('NOTHING_TO_UNDO', 'Nothing to undo.') };
    this.state = prev;
    this.log.pop();
    return { ok: true, state: prev, events: [] };
  }
}
