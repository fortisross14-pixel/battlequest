import type { Command } from '../core/engine';
import { validateCommand } from '../core/engine';
import type { GameEvent } from '../core/events';
import { DIRS, samePos } from '../core/geometry';
import { planMove, reachableSquares, turnCost, type ReachableSquare } from '../core/movement';
import { previewCombat } from '../core/preview';
import { isRejection } from '../core/rejection';
import type { BattleSession } from '../core/session';
import { armyCost, getUnit, isEngaged, isFighting, isOnMap, lostCost, unitAt } from '../core/state';
import { SIDES, type Pos, type Side, type Unit } from '../core/types';
import { isSpent, type BattleView } from '../render/battleView';
import type { Hud } from './hud';

type Mode =
  | { kind: 'idle' }
  | { kind: 'selected'; unitId: string }
  | { kind: 'ghost'; unitId: string; dest: Pos }
  | { kind: 'facing'; unitId: string }
  | { kind: 'preview'; unitId: string; targetId: string }
  | { kind: 'busy' }
  | { kind: 'over' };

interface Targets {
  reach: ReachableSquare[];
  charge: Unit[];
  shoot: Unit[];
}

const SIDE_NAME: Record<Side, string> = { blue: 'Blue', red: 'Red' };

/**
 * Turns gestures into core commands. It never edits game state itself: everything goes
 * through the session (commands → validation → events) and the view only plays events.
 */
export class Controller {
  private mode: Mode = { kind: 'idle' };
  private targets: Targets | null = null;
  private lastMoves: { side: Side; path: Pos[] }[] = [];
  private turnMoves: { side: Side; path: Pos[] }[] = [];

  constructor(
    private session: BattleSession,
    private view: BattleView,
    private hud: Hud,
    private title: string,
  ) {
    hud.undoBtn.onclick = () => this.undo();
    hud.nextBtn.onclick = () => this.nextUnit();
    hud.endBtn.onclick = () => void this.endTurn();
    this.refresh();
  }

  private get state() {
    return this.session.state;
  }

  private unit(id: string): Unit | undefined {
    return getUnit(this.state, id);
  }

  // ---------- Gestures ----------

  tap(x: number, y: number): void {
    if (this.mode.kind === 'busy' || this.mode.kind === 'over' || this.hud.overlayOpen) return;
    this.hud.hideUnitCard();
    if (this.mode.kind === 'preview') {
      this.cancelPreview();
      return;
    }
    if (this.mode.kind === 'facing') {
      const h = this.view.ringHandleAt(x, y);
      const u = this.unit(this.mode.unitId)!;
      if (h) {
        if (h.enabled) void this.run({ type: 'Rotate', unitId: u.id, facing: h.dir }, u.id);
        else this.hud.toast('Not enough movement points to turn that far.');
        return;
      }
      this.view.clearFacingRing();
      this.select(u.id);
      // Fall through: the tap may also pick a target or another unit.
    }
    const cell = this.view.screenToCell(x, y);
    if (!cell) return this.deselect();
    this.tapCell(cell);
  }

  longPress(x: number, y: number): void {
    if (this.mode.kind === 'busy') return;
    const cell = this.view.screenToCell(x, y);
    const u = cell && unitAt(this.state, cell);
    if (u) this.hud.showUnitCard(u, this.state);
  }

  private tapCell(cell: Pos): void {
    const there = unitAt(this.state, cell);
    const sel = 'unitId' in this.mode ? this.unit(this.mode.unitId) : undefined;

    if (sel && this.targets) {
      if (there && samePos(there, sel)) {
        this.deselect();
        return;
      }
      if (there && there.side !== sel.side) {
        if (this.targets.charge.includes(there) || this.targets.shoot.includes(there)) {
          this.openPreview(sel, there, this.targets.charge.includes(there) ? 'Charge' : 'Shoot');
        } else {
          const why =
            validateCommand(this.state, { type: 'Charge', unitId: sel.id, targetId: there.id }) ??
            validateCommand(this.state, { type: 'Shoot', unitId: sel.id, targetId: there.id });
          if (why) this.hud.toast(why.message);
        }
        return;
      }
      const reach = this.targets.reach.find((r) => samePos(r.pos, cell));
      if (reach) {
        if (this.mode.kind === 'ghost' && samePos(this.mode.dest, cell)) {
          void this.confirmMove(sel, cell);
        } else {
          this.showGhost(sel, cell);
        }
        return;
      }
    }
    if (there && there.side === this.state.activeSide && isFighting(there)) {
      this.select(there.id);
      return;
    }
    if (there && there.side === this.state.activeSide) {
      this.hud.toast('Routed units are out of control.');
    }
    this.deselect();
  }

  // ---------- Modes ----------

  private select(unitId: string): void {
    const u = this.unit(unitId)!;
    this.mode = { kind: 'selected', unitId };
    this.view.clearGhost();
    this.targets = this.computeTargets(u);
    this.view.setHighlights({
      selected: u,
      reach: this.targets.reach.map((r) => ({ pos: r.pos, kind: r.kind })),
      charge: this.targets.charge,
      shoot: this.targets.shoot,
    });
    this.refresh();
  }

  private deselect(): void {
    this.mode = { kind: 'idle' };
    this.targets = null;
    this.view.clearGhost();
    this.view.clearFacingRing();
    this.view.setHighlights(null);
    this.refresh();
  }

  private computeTargets(u: Unit): Targets {
    const s = this.state;
    const enemies = s.units.filter((e) => e.side !== u.side && isOnMap(e));
    const valid = (type: 'Charge' | 'Shoot') =>
      enemies.filter((e) => !validateCommand(s, { type, unitId: u.id, targetId: e.id }));
    return { reach: reachableSquares(s, u), charge: valid('Charge'), shoot: valid('Shoot') };
  }

  private showGhost(u: Unit, dest: Pos): void {
    const plan = planMove(this.state, u, dest);
    if (isRejection(plan)) {
      this.hud.toast(plan.message);
      return;
    }
    this.mode = { kind: 'ghost', unitId: u.id, dest };
    this.view.showGhost(u, plan.path, plan.facing);
    this.hud.setChip(`${u.type.name}: tap again to move here (${+plan.cost.toFixed(1)} MP)`);
  }

  private async confirmMove(u: Unit, dest: Pos): Promise<void> {
    this.view.clearGhost();
    const ok = await this.run({ type: 'Move', unitId: u.id, to: dest }, null);
    if (!ok) return;
    const moved = this.unit(u.id)!;
    if (isFighting(moved) && !isEngaged(this.state, moved.id)) this.openFacingRing(moved);
  }

  private openFacingRing(u: Unit): void {
    this.select(u.id);
    this.mode = { kind: 'facing', unitId: u.id };
    const handles = DIRS.filter((d) => d !== u.facing).map((d) => ({
      dir: d,
      enabled: turnCost(u, u.facing, d) <= u.mpLeft + 1e-9,
    }));
    this.view.showFacingRing(u, handles);
    this.hud.setChip(`${u.type.name}: tap a handle to turn, or tap elsewhere to keep this facing`);
  }

  private openPreview(att: Unit, def: Unit, type: 'Charge' | 'Shoot'): void {
    const cmd = { type, unitId: att.id, targetId: def.id } as const;
    const p = previewCombat(this.state, cmd);
    if (isRejection(p)) {
      this.hud.toast(p.message);
      return;
    }
    this.mode = { kind: 'preview', unitId: att.id, targetId: def.id };
    const other = type === 'Charge' ? 'Shoot' : 'Charge';
    const canOther = (other === 'Charge' ? this.targets?.charge : this.targets?.shoot)?.includes(
      def,
    );
    this.hud.showPreview(p, att, def, {
      confirm: () => {
        this.hud.hidePreview();
        void this.run(cmd, att.id);
      },
      cancel: () => this.cancelPreview(),
      alt: canOther
        ? { label: `${other} instead`, run: () => this.openPreview(att, def, other) }
        : undefined,
    });
  }

  private cancelPreview(): void {
    this.hud.hidePreview();
    if ('unitId' in this.mode) this.select(this.mode.unitId);
    else this.deselect();
  }

  // ---------- Commands ----------

  /** Applies a command, plays its events, then reselects `reselect` if it can still act. */
  private async run(cmd: Command, reselect: string | null): Promise<boolean> {
    const res = this.session.apply(cmd);
    if (!res.ok) {
      this.hud.toast(res.rejection.message);
      return false;
    }
    this.recordMoves(res.events);
    this.mode = { kind: 'busy' };
    this.view.setHighlights(null);
    this.view.clearFacingRing();
    this.refresh();
    await this.view.play(res.events, this.state);
    if (this.state.result) {
      this.showResult();
      return true;
    }
    const again = reselect && this.unit(reselect);
    if (again && isFighting(again) && !isSpent(this.state, again)) this.select(again.id);
    else this.deselect();
    return true;
  }

  private recordMoves(events: GameEvent[]): void {
    for (const e of events) {
      if (e.type === 'ChargeDeclared' && e.path.length > 1) {
        this.turnMoves.push({ side: this.state.activeSide, path: e.path });
      } else if (e.type === 'UnitMoved' && (e.kind === 'move' || e.kind === 'pullBack')) {
        const u = this.unit(e.unitId);
        if (u) this.turnMoves.push({ side: u.side, path: e.path });
      }
    }
  }

  private undo(): void {
    if (!this.session.canUndo() || this.mode.kind === 'busy') return;
    const keep = 'unitId' in this.mode ? this.mode.unitId : null;
    this.session.undo();
    this.turnMoves.pop();
    this.view.sync(this.state);
    this.view.clearFacingRing();
    if (keep && this.unit(keep)) this.select(keep);
    else this.deselect();
  }

  /** Units that can still do something this turn. */
  private actionable(): Unit[] {
    return this.state.units.filter(
      (u) => u.side === this.state.activeSide && isFighting(u) && !isSpent(this.state, u),
    );
  }

  private nextUnit(): void {
    if (this.mode.kind === 'busy') return;
    const list = this.actionable();
    if (list.length === 0) return;
    const cur =
      'unitId' in this.mode
        ? list.findIndex((u) => u.id === (this.mode as { unitId: string }).unitId)
        : -1;
    const next = list[(cur + 1) % list.length]!;
    this.view.clearFacingRing();
    this.select(next.id);
    this.view.centreOn(next);
  }

  private async endTurn(): Promise<void> {
    if (this.mode.kind === 'busy' || this.state.result) return;
    const ending = this.state.activeSide;
    this.deselect();
    const ok = await this.run({ type: 'EndTurn' }, null);
    if (!ok || this.state.result) return;
    this.lastMoves = this.turnMoves.filter((m) => m.side === ending);
    this.turnMoves = [];
    this.view.showLastMoves([]);
    const next = this.state.activeSide;
    this.hud.showOverlay(
      `${SIDE_NAME[next]}'s turn`,
      `Turn ${this.state.turn} of ${this.state.turnLimit}. Pass the device to the ${SIDE_NAME[next]} player. ${SIDE_NAME[ending]}'s moves are shown as arrows.`,
      'Start turn',
      () => {
        this.view.showLastMoves(this.lastMoves);
        this.refresh();
      },
      next,
    );
  }

  private showResult(): void {
    this.mode = { kind: 'over' };
    const r = this.state.result!;
    const title = r.winner ? `${SIDE_NAME[r.winner]} wins` : 'Draw';
    const body =
      r.reason === 'armyBroken'
        ? r.winner
          ? `The ${SIDE_NAME[r.winner === 'blue' ? 'red' : 'blue']} army broke on turn ${r.turn}.`
          : 'Both armies broke at once.'
        : `The turn limit (${this.state.turnLimit}) was reached with neither army broken.`;
    this.refresh();
    this.hud.showOverlay(
      title,
      body,
      'Play again',
      () => window.location.reload(),
      r.winner ?? undefined,
    );
  }

  // ---------- HUD ----------

  private refresh(): void {
    const s = this.state;
    const lost = {} as Record<Side, number>;
    const breakpoint = {} as Record<Side, number>;
    for (const side of SIDES) {
      lost[side] = lostCost(s, side) / Math.max(1, armyCost(s, side));
      breakpoint[side] = s.sides[side].breakpoint;
    }
    this.hud.setTop({
      title: this.title,
      turn: s.turn,
      turnLimit: s.turnLimit,
      side: s.activeSide,
      lost,
      breakpoint,
    });
    const busy = this.mode.kind === 'busy' || this.mode.kind === 'over';
    this.hud.setButtons({
      undo: !busy && this.session.canUndo(),
      next: !busy && this.actionable().length > 0,
      end: !busy && !s.result,
    });
    if (this.mode.kind === 'selected' || this.mode.kind === 'preview') {
      const u = this.unit(this.mode.unitId)!;
      const t = this.targets;
      const bits = [
        `${u.type.name}`,
        `MP ${+u.mpLeft.toFixed(1)}/${u.type.stats.mp}`,
        isEngaged(s, u.id) ? 'in melee' : u.hasActed ? 'action used' : 'action ready',
      ];
      if (t && !u.hasActed) {
        if (t.charge.length)
          bits.push(`${t.charge.length} charge target${t.charge.length > 1 ? 's' : ''}`);
        if (t.shoot.length)
          bits.push(`${t.shoot.length} shoot target${t.shoot.length > 1 ? 's' : ''}`);
      }
      this.hud.setChip(bits.join(' · '));
    } else if (this.mode.kind === 'idle') {
      this.hud.setChip(
        `${SIDE_NAME[s.activeSide]}: tap a unit to select it. Long-press any unit for its card.`,
      );
    } else if (this.mode.kind === 'busy' || this.mode.kind === 'over') {
      this.hud.setChip(null);
    }
  }
}
