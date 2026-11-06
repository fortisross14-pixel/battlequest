import type { AiPlayer } from '../ai/utility';
import type { Command } from '../core/engine';
import { validateCommand } from '../core/engine';
import type { GameEvent } from '../core/events';
import { generalUnit, skillNeedsTarget, validSkillTarget } from '../core/generals';
import { DIRS, samePos } from '../core/geometry';
import { planMove, reachableSquares, turnCost, type ReachableSquare } from '../core/movement';
import { previewCombat } from '../core/preview';
import { isRejection } from '../core/rejection';
import type { BattleSession } from '../core/session';
import { armyCost, getUnit, isEngaged, isFighting, isOnMap, lostCost, unitAt } from '../core/state';
import { SIDES, type BattleState, type Pos, type Side, type Unit } from '../core/types';
import { isSpent, type BattleView } from '../render/battleView';
import type { Hud } from './hud';

type Mode =
  | { kind: 'idle' }
  | { kind: 'selected'; unitId: string }
  | { kind: 'ghost'; unitId: string; dest: Pos }
  | { kind: 'facing'; unitId: string }
  | { kind: 'preview'; unitId: string; targetId: string }
  | { kind: 'skillTarget'; unitId: string; skillId: string }
  | { kind: 'busy' }
  | { kind: 'over' };

interface Targets {
  reach: ReachableSquare[];
  charge: Unit[];
  shoot: Unit[];
}

/** What the tutorial waits for before moving to its next step. */
export type TutorialTrigger = 'select' | 'move' | 'facing' | 'charge' | 'endTurn' | 'never';

export interface TutorialStep {
  text: string;
  until: TutorialTrigger;
}

export interface ControllerOptions {
  title: string;
  /** Names shown for each side (hot-seat: Blue/Red; campaign: You/Enemy). */
  sideNames?: Record<Side, string>;
  /** An AI plays this side. Without it the battle is hot-seat. */
  ai?: { side: Side; player: AiPlayer };
  tutorial?: TutorialStep[];
  /** Called when the battle ends. Without it a "Play again" sheet appears. */
  onEnd?: (state: BattleState) => void;
  /** The player retreats to the menu. */
  onExit?: () => void;
}

/**
 * Turns gestures into core commands. It never edits game state itself: everything goes
 * through the session (commands → validation → events) and the view only plays events.
 */
export class Controller {
  private mode: Mode = { kind: 'idle' };
  private targets: Targets | null = null;
  private lastMoves: { side: Side; path: Pos[] }[] = [];
  private turnMoves: { side: Side; path: Pos[] }[] = [];
  /** turnMoves before each undoable command, so Undo restores the arrows exactly. */
  private movesHistory: { side: Side; path: Pos[] }[][] = [];
  private tutorialStep = 0;
  private names: Record<Side, string>;
  private speeds = [1, 2, Infinity];
  private speedIdx = 0;

  constructor(
    private session: BattleSession,
    private view: BattleView,
    private hud: Hud,
    private opts: ControllerOptions,
  ) {
    this.names = opts.sideNames ?? { blue: 'Blue', red: 'Red' };
    hud.undoBtn.onclick = () => this.undo();
    hud.nextBtn.onclick = () => this.nextUnit();
    hud.endBtn.onclick = () => void this.endTurn();
    hud.skillBtn.onclick = () => this.openSkills();
    hud.speedBtn.onclick = () => this.cycleSpeed();
    hud.menuBtn.onclick = () => this.confirmExit();
    this.showTutorial();
    this.refresh();
    if (opts.ai && this.state.activeSide === opts.ai.side) void this.runAiTurn();
  }

  private get state() {
    return this.session.state;
  }

  private unit(id: string): Unit | undefined {
    return getUnit(this.state, id);
  }

  private isHumanTurn(): boolean {
    return !this.opts.ai || this.state.activeSide !== this.opts.ai.side;
  }

  // ---------- Gestures ----------

  tap(x: number, y: number): void {
    if (this.mode.kind === 'busy' || this.mode.kind === 'over' || this.hud.overlayOpen) return;
    if (!this.isHumanTurn()) return;
    this.hud.hideUnitCard();
    if (this.mode.kind === 'preview') {
      this.cancelPreview();
      return;
    }
    if (this.mode.kind === 'skillTarget') {
      const cell = this.view.screenToCell(x, y);
      const t = cell && unitAt(this.state, cell);
      const m = this.mode;
      if (
        t &&
        !validateCommand(this.state, {
          type: 'UseSkill',
          unitId: m.unitId,
          skillId: m.skillId,
          targetId: t.id,
        })
      ) {
        void this.run(
          { type: 'UseSkill', unitId: m.unitId, skillId: m.skillId, targetId: t.id },
          null,
        );
      } else {
        this.hud.toast('Skill cancelled.');
        this.deselect();
      }
      return;
    }
    if (this.mode.kind === 'facing') {
      const h = this.view.ringHandleAt(x, y);
      const u = this.unit(this.mode.unitId)!;
      if (h) {
        if (h.enabled) void this.run({ type: 'Rotate', unitId: u.id, facing: h.dir }, u.id);
        else this.hud.toast('Not enough movement points to turn that far.');
        this.advanceTutorial('facing');
        return;
      }
      this.view.clearFacingRing();
      this.advanceTutorial('facing');
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
      this.advanceTutorial('select');
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
    this.advanceTutorial('move');
    const moved = this.unit(u.id)!;
    if (isFighting(moved) && !isEngaged(this.state, moved.id) && !this.state.result) {
      this.openFacingRing(moved);
    }
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
        if (type === 'Charge') this.advanceTutorial('charge');
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

  // ---------- General skills ----------

  private openSkills(): void {
    if (!this.isHumanTurn() || this.mode.kind === 'busy') return;
    const side = this.state.activeSide;
    const g = this.state.sides[side].general;
    const gu = generalUnit(this.state, side);
    if (!g || !gu) return;
    this.hud.showSkills(
      g.name,
      g.skills.map((s) => {
        const why = validateCommand(this.state, {
          type: 'UseSkill',
          unitId: gu.id,
          skillId: s.id,
          targetId: skillNeedsTarget(s.effect) ? gu.id : undefined,
        });
        const cooldown = this.state.turn < s.readyTurn ? `Ready on turn ${s.readyTurn}` : null;
        const blocked = gu.hasActed
          ? 'The general’s unit has already acted.'
          : !isFighting(gu)
            ? 'The general’s unit is routed.'
            : null;
        const usable = !cooldown && !blocked && (!why || skillNeedsTarget(s.effect));
        return {
          name: s.name,
          text: this.skillText(s.effect),
          status:
            cooldown ??
            blocked ??
            (why && !skillNeedsTarget(s.effect) ? why.message : `Cooldown ${s.cooldown} turns`),
          usable,
          use: () => this.useSkill(gu, s.id, skillNeedsTarget(s.effect)),
        };
      }),
    );
  }

  private skillText(e: { kind: string }): string {
    switch (e.kind) {
      case 'rally':
        return 'One routed unit in the command radius rallies to Disrupted.';
      case 'holdFast':
        return 'One unit in the command radius takes less damage until your next turn.';
      case 'heal':
        return 'Every unit in the command radius regains strength.';
      case 'cohesionUp':
        return 'Every unit in the command radius goes up one cohesion level.';
      case 'holdTheLine':
        return 'Units in the command radius cannot drop below Disrupted for 2 turns.';
      case 'flankBoost':
        return 'Your flank and rear attacks hit harder for 2 turns.';
      default:
        return '';
    }
  }

  private useSkill(gu: Unit, skillId: string, needsTarget: boolean): void {
    this.hud.hideSkills();
    if (!needsTarget) {
      void this.run({ type: 'UseSkill', unitId: gu.id, skillId }, null);
      return;
    }
    const g = this.state.sides[gu.side].general!;
    const sk = g.skills.find((s) => s.id === skillId)!;
    const targets = this.state.units.filter((u) =>
      validSkillTarget(this.state, sk.effect, gu.side, u),
    );
    if (targets.length === 0) {
      this.hud.toast(
        sk.effect.kind === 'rally'
          ? 'No routed unit inside the command radius.'
          : 'No unit inside the command radius.',
      );
      return;
    }
    this.mode = { kind: 'skillTarget', unitId: gu.id, skillId };
    this.view.setHighlights({ selected: gu, reach: [], charge: [], shoot: [], skill: targets });
    this.hud.setChip(`${sk.name}: tap a highlighted unit (tap elsewhere to cancel)`);
  }

  // ---------- Commands ----------

  /** Applies a command, plays its events, then reselects `reselect` if it can still act. */
  private async run(cmd: Command, reselect: string | null): Promise<boolean> {
    const res = this.session.apply(cmd);
    if (!res.ok) {
      this.hud.toast(res.rejection.message);
      return false;
    }
    if (cmd.type === 'Move' || cmd.type === 'Rotate') this.movesHistory.push([...this.turnMoves]);
    else this.movesHistory = [];
    this.recordMoves(res.events);
    this.mode = { kind: 'busy' };
    this.view.setHighlights(null);
    this.view.clearFacingRing();
    this.refresh();
    await this.view.play(res.events, this.state);
    this.announce(res.events);
    if (this.state.result) {
      this.finish();
      return true;
    }
    const again = reselect && this.unit(reselect);
    if (again && isFighting(again) && !isSpent(this.state, again)) this.select(again.id);
    else this.deselect();
    return true;
  }

  private announce(events: GameEvent[]): void {
    for (const e of events) {
      if (e.type === 'GeneralLost') {
        const who = this.opts.ai
          ? e.side === this.opts.ai.side
            ? 'The enemy general'
            : 'Your general'
          : `${this.names[e.side]}'s general`;
        this.hud.toast(`${who} ${e.name} has fallen! The whole army wavers.`);
      } else if (e.type === 'SkillUsed') {
        this.hud.toast(`${e.name}!`);
      }
    }
  }

  private recordMoves(events: GameEvent[]): void {
    for (const e of events) {
      // A charge's approach arrives as a UnitMoved 'move' event too, so it is recorded once.
      if (e.type === 'UnitMoved' && (e.kind === 'move' || e.kind === 'pullBack')) {
        const u = this.unit(e.unitId);
        if (u) this.turnMoves.push({ side: u.side, path: e.path });
      }
    }
  }

  private undo(): void {
    if (!this.session.canUndo() || this.mode.kind === 'busy' || !this.isHumanTurn()) return;
    const keep = 'unitId' in this.mode ? this.mode.unitId : null;
    this.session.undo();
    this.turnMoves = this.movesHistory.pop() ?? this.turnMoves;
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

  /** Whether the unit could still charge or shoot something right now. */
  private canAttack(u: Unit): boolean {
    if (u.hasActed) return false;
    return this.state.units.some(
      (e) =>
        e.side !== u.side &&
        isOnMap(e) &&
        (!validateCommand(this.state, { type: 'Charge', unitId: u.id, targetId: e.id }) ||
          !validateCommand(this.state, { type: 'Shoot', unitId: u.id, targetId: e.id })),
    );
  }

  /** Units that haven't done anything yet this turn (and could). */
  private untouched(): Unit[] {
    return this.actionable().filter((u) => !u.hasMoved && !u.hasActed);
  }

  private nextUnit(): void {
    if (this.mode.kind === 'busy' || !this.isHumanTurn()) return;
    // Skip units that have moved and could only brace now.
    const list = this.actionable().filter((u) => !u.hasMoved || this.canAttack(u));
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

  private async endTurn(confirmed = false): Promise<void> {
    if (this.mode.kind === 'busy' || this.state.result || !this.isHumanTurn()) return;
    const idle = this.untouched().length;
    if (!confirmed && idle > 0) {
      this.hud.showConfirm(
        'End turn?',
        `${idle} unit${idle === 1 ? " hasn't" : "s haven't"} moved yet.`,
        'End turn',
        () => void this.endTurn(true),
      );
      return;
    }
    const ending = this.state.activeSide;
    this.deselect();
    const ok = await this.run({ type: 'EndTurn' }, null);
    this.advanceTutorial('endTurn');
    if (!ok || this.state.result) return;
    this.lastMoves = this.turnMoves.filter((m) => m.side === ending);
    this.turnMoves = [];
    this.view.showLastMoves([]);
    if (this.opts.ai) {
      if (this.state.activeSide === this.opts.ai.side) await this.runAiTurn();
      return;
    }
    const next = this.state.activeSide;
    this.hud.showOverlay(
      `${this.names[next]}'s turn`,
      `Turn ${this.state.turn} of ${this.state.turnLimit}. Pass the device to the ${this.names[next]} player. ${this.names[ending]}'s moves are shown as arrows.`,
      'Start turn',
      () => {
        this.view.showLastMoves(this.lastMoves);
        this.refresh();
      },
      next,
    );
  }

  private cycleSpeed(): void {
    this.speedIdx = (this.speedIdx + 1) % this.speeds.length;
    this.view.speed = this.speeds[this.speedIdx]!;
    this.hud.setSpeed(this.speedIdx === 2 ? 'Skip ⏭' : `Speed ${this.speeds[this.speedIdx]}×`);
  }

  /** Plays the AI's side turn one command at a time, so the player can follow it. */
  private async runAiTurn(): Promise<void> {
    const ai = this.opts.ai!;
    this.mode = { kind: 'busy' };
    this.view.setHighlights(null);
    this.hud.showSpeed(true);
    this.refresh();
    this.hud.setChip('Enemy turn…');
    const moves: { side: Side; path: Pos[] }[] = [];
    for (let i = 0; i < 400 && !this.state.result && this.state.activeSide === ai.side; i++) {
      const cmd = ai.player.next(this.state);
      const res = this.session.apply(cmd);
      if (!res.ok) {
        // Skip that unit and carry on with the rest of the AI's turn.
        console.warn('AI command rejected', cmd, res.rejection);
        ai.player.rejected(cmd);
        if (cmd.type === 'EndTurn') break;
        continue;
      }
      for (const e of res.events) {
        if (e.type === 'UnitMoved' && e.kind === 'move' && this.unit(e.unitId)?.side === ai.side) {
          moves.push({ side: ai.side, path: e.path });
        }
      }
      await this.view.play(res.events, this.state);
      this.announce(res.events);
      this.refresh();
      this.hud.setChip('Enemy turn…');
      if (cmd.type === 'EndTurn') break;
    }
    this.hud.showSpeed(false);
    this.view.speed = 1;
    if (this.state.result) {
      this.finish();
      return;
    }
    this.view.showLastMoves(moves);
    this.mode = { kind: 'idle' };
    this.deselect();
  }

  private finish(): void {
    this.mode = { kind: 'over' };
    this.refresh();
    if (this.opts.onEnd) {
      this.opts.onEnd(this.state);
      return;
    }
    const r = this.state.result!;
    const title = r.winner ? `${this.names[r.winner]} wins` : 'Draw';
    const body =
      r.reason === 'armyBroken'
        ? r.winner
          ? `The ${this.names[r.winner === 'blue' ? 'red' : 'blue']} army broke on turn ${r.turn}.`
          : 'Both armies broke at once.'
        : r.reason === 'heldOut'
          ? `${this.names[r.winner!]} held out until the end of turn ${r.turn}.`
          : r.reason === 'conceded'
            ? `${this.names[r.broken[0] ?? 'blue']} retreated from the field.`
            : `The turn limit (${this.state.turnLimit}) was reached with neither army broken.`;
    this.hud.showOverlay(
      title,
      body,
      this.opts.onExit ? 'Back to menu' : 'Play again',
      () => (this.opts.onExit ? this.opts.onExit() : window.location.reload()),
      r.winner ?? undefined,
    );
  }

  private confirmExit(): void {
    if (!this.opts.onExit) return;
    this.hud.showConfirm(
      'Leave the battle?',
      this.opts.ai ? 'Retreating counts as a defeat.' : 'This battle will not be saved.',
      'Leave',
      () => this.opts.onExit!(),
    );
  }

  // ---------- Tutorial ----------

  private showTutorial(): void {
    const steps = this.opts.tutorial;
    const step = steps?.[this.tutorialStep];
    this.hud.setTutorial(
      step ? step.text : null,
      steps ? `${Math.min(this.tutorialStep + 1, steps.length)}/${steps.length}` : '',
    );
  }

  private advanceTutorial(trigger: TutorialTrigger): void {
    const step = this.opts.tutorial?.[this.tutorialStep];
    if (!step || step.until !== trigger) return;
    this.tutorialStep++;
    this.showTutorial();
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
      title: this.opts.title,
      turn: s.turn,
      turnLimit: s.turnLimit,
      side: s.activeSide,
      lost,
      breakpoint,
      names: this.names,
    });
    const busy = this.mode.kind === 'busy' || this.mode.kind === 'over' || !this.isHumanTurn();
    const gu = generalUnit(s, s.activeSide);
    const g = s.sides[s.activeSide].general;
    const skillReady =
      !!g && !!gu && isFighting(gu) && !gu.hasActed && g.skills.some((k) => s.turn >= k.readyTurn);
    this.hud.setButtons({
      undo: !busy && this.session.canUndo(),
      next: !busy && this.actionable().length > 0,
      end: !busy && !s.result,
      skill:
        !!g && !!gu && g.skills.length > 0 ? (!busy && skillReady ? 'ready' : 'waiting') : 'none',
      menu: !!this.opts.onExit,
    });
    if (this.mode.kind === 'selected' || this.mode.kind === 'preview') {
      const u = this.unit(this.mode.unitId)!;
      const t = this.targets;
      const bits = [
        `${u.type.name}`,
        `MP ${+u.mpLeft.toFixed(1)}/${+u.type.stats.mp.toFixed(1)}`,
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
        `${this.names[s.activeSide]}: tap a unit to select it. Long-press any unit for its card.`,
      );
    } else if (this.mode.kind === 'over') {
      this.hud.setChip(null);
    }
  }
}
