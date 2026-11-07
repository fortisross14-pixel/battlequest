import type { AiPlayer } from '../ai/utility';
import type { Command } from '../core/engine';
import { fastForward, haptic, motionSettings } from './motion';
import { Bubble, type Petal } from './bubble';
import { ACTION_INFO } from './actionText';
import { hasAction, parthianDefault, planParthian, volleyArea } from '../core/actions';
import { hasLineOfSight, shootingRange } from '../core/combat';
import { arcOf, rangeDistance } from '../core/geometry';
import { inBounds } from '../core/map';
import { previewVolley } from '../core/preview';
import type { PreviewMode } from './hud';

type AttackMode = 'shoot' | 'volley' | 'parthian' | 'engage' | 'full';
const MODE_LABEL: Record<AttackMode, string> = {
  shoot: 'Shoot',
  volley: 'Volley',
  parthian: 'Parthian shot',
  engage: 'Engage',
  full: 'Full charge',
};
import { RULES } from '../core/config';
import { howToPlay, settingsPage } from './controls';
import { el } from './hud';
import { validateCommand } from '../core/engine';
import type { GameEvent } from '../core/events';
import { generalUnit, skillNeedsTarget, validSkillTarget } from '../core/generals';
import { DIRS } from '../core/geometry';
import { planMove, reachableSquares, turnCost } from '../core/movement';
import { rangeSquares } from '../core/combat';
import { previewCombat } from '../core/preview';
import { isRejection } from '../core/rejection';
import type { BattleSession } from '../core/session';
import {
  armyCost,
  getUnit,
  isEngaged,
  isFighting,
  isOnMap,
  isSpent,
  lostCost,
  unitAt,
} from '../core/state';
import { SIDES, type BattleState, type Pos, type Side, type Unit } from '../core/types';
import type { BattleView } from '../render/battleView';
import {
  battleSummary,
  describeEvents,
  meleeResults,
  type BattleSummary,
  type LogEntry,
} from './combatLog';
import type { Hud, TopInfo } from './hud';
import {
  decideCellTap,
  decideSkillTap,
  TutorialGuide,
  tutorialMarks,
  tutorialTriggers,
  type Mode,
  type Targets,
  type TutorialStep,
  type TutorialTrigger,
} from './tapDecision';

export type { TutorialStep, TutorialTrigger } from './tapDecision';

export interface ControllerOptions {
  title: string;
  /** Names shown for each side (hot-seat: Blue/Red; campaign: You/Enemy). */
  sideNames?: Record<Side, string>;
  /** An AI plays this side. Without it the battle is hot-seat. */
  ai?: { side: Side; player: AiPlayer };
  tutorial?: TutorialStep[];
  /** Called when the battle ends. Without it a "Play again" sheet appears. */
  onEnd?: (state: BattleState, summary: BattleSummary) => void;
  /** Campaign battles: the objective line and live bonus state for the top bar. */
  objective?: (state: BattleState) => TopInfo['objective'];
  /** The player retreats to the menu. */
  onExit?: (summary: BattleSummary) => void;
  /** Restart battle (UX §6): back to deployment with the same army and a new seed. */
  onRestart?: () => void;
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
  private tutorial: TutorialGuide;
  private names: Record<Side, string>;
  private speeds = [1, 2, Infinity];
  private speedIdx = 0;
  /** Everything that happened, in plain words (combat log, end-of-battle summary). */
  private log: LogEntry[] = [];
  private startState: BattleState;
  private logNames: Record<Side, string>;
  /** Set when the player leaves: AI playback and pending results stop. */
  private disposed = false;
  /** The command bubble around the selected unit (UX §2). */
  private bubble: Bubble;
  private onKey = (e: KeyboardEvent) => this.key(e);

  constructor(
    private session: BattleSession,
    private view: BattleView,
    private hud: Hud,
    private opts: ControllerOptions,
  ) {
    this.names = opts.sideNames ?? { blue: 'Blue', red: 'Red' };
    this.tutorial = new TutorialGuide(opts.tutorial);
    this.startState = structuredClone(session.state);
    // In the campaign the log says "Your spearmen" and "Enemy chariots".
    this.logNames = opts.ai
      ? ({ [opts.ai.side]: 'Enemy', [opts.ai.side === 'blue' ? 'red' : 'blue']: 'Your' } as Record<
          Side,
          string
        >)
      : this.names;
    hud.endBtn.onclick = () => void this.endTurn();
    hud.waitingBtn.onclick = () => this.nextUnit();
    hud.medallionBtn.onclick = () => this.generalSkill();
    hud.speedBtn.onclick = () => this.cycleSpeed();
    hud.menuBtn.onclick = () => this.openMenu();
    this.bubble = new Bubble(hud.root);
    // HTML overlays attached to units follow the camera.
    view.onCamera = () => {
      const sel = 'unitId' in this.mode ? this.unit(this.mode.unitId) : undefined;
      if (sel && this.bubble.isOpen) this.bubble.moveTo(this.view.cellToClient(sel));
      this.updateLeader();
    };
    window.addEventListener('keydown', this.onKey);
    this.showTutorial();
    this.refresh();
    if (opts.ai && this.state.activeSide === opts.ai.side) void this.runAiTurn();
  }

  /** Stops the battle: no more AI moves, animations or results. */
  dispose(): void {
    this.disposed = true;
    this.mode = { kind: 'over' };
    this.bubble.destroy();
    this.view.onCamera = null;
    window.removeEventListener('keydown', this.onKey);
  }

  private get state() {
    return this.session.state;
  }

  private unit(id: string): Unit | undefined {
    return getUnit(this.state, id);
  }

  /** The selected unit can turn now (Turn button). */
  private canTurnSelected(): boolean {
    if (this.mode.kind !== 'selected' && this.mode.kind !== 'ghost') return false;
    const u = this.unit(this.mode.unitId);
    if (!u || !isFighting(u) || isEngaged(this.state, u.id)) return false;
    return DIRS.some((d) => d !== u.facing && turnCost(u, u.facing, d) <= u.mpLeft + 1e-9);
  }

  private isHumanTurn(): boolean {
    return !this.opts.ai || this.state.activeSide !== this.opts.ai.side;
  }

  // ---------- Gestures ----------

  tap(x: number, y: number): void {
    // Input never waits for decoration (motion skill): a tap while the board animates jumps
    // the animation to its end.
    if (this.mode.kind === 'busy' || !this.isHumanTurn()) {
      this.view.fastForward();
      fastForward();
      return;
    }
    if (this.mode.kind === 'over' || this.hud.overlayOpen) return;
    // The facing step completes on the next tap: keeping a facing is a choice too.
    if (this.tutorial.current()?.step.until === 'facing' && this.mode.kind !== 'facing') {
      this.advanceTutorial('facing');
    }
    this.hud.hideUnitCard();
    if (this.mode.kind === 'preview') {
      const cell = this.view.screenToCell(x, y);
      const att = this.unit(this.mode.unitId);
      const def = this.unit(this.mode.targetId);
      if (this.volleyAt && cell && att && def) {
        this.volleyAt = cell;
        this.showVolley(att, def, this.attackModes(att, 'Shoot'));
        return;
      }
      this.cancelPreview();
      return;
    }
    if (this.mode.kind === 'skillTarget') {
      const m = this.mode;
      const d = decideSkillTap(this.state, m, this.view.screenToCell(x, y));
      if (d.do === 'useSkill') {
        void this.run(
          { type: 'UseSkill', unitId: m.unitId, skillId: m.skillId, targetId: d.targetId },
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
    if (!cell) return;
    const u = unitAt(this.state, cell);
    this.bubble.close();
    if (u) this.hud.showUnitCard(u, this.state);
    else this.hud.showTerrainCard(cell, this.state);
  }

  private tapCell(cell: Pos): void {
    const d = decideCellTap(this.state, this.mode, this.targets, cell);
    const sel = 'unitId' in this.mode ? this.unit(this.mode.unitId) : undefined;
    switch (d.do) {
      case 'preview':
        this.openPreview(sel!, this.unit(d.targetId)!, d.type);
        return;
      case 'explain':
        this.hud.toast(d.message);
        return;
      case 'confirmMove':
        void this.confirmMove(sel!, d.dest);
        return;
      case 'ghost':
        this.showGhost(sel!, d.dest);
        return;
      case 'select':
        this.select(d.unitId);
        this.advanceTutorial('select');
        return;
      case 'outOfControl':
        this.hud.toast('Routed units are out of control.');
        this.deselect();
        return;
      case 'deselect':
        this.deselect();
        return;
    }
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
      // Show a missile unit's reach while it can still shoot this turn.
      range: !u.hasActed && !isEngaged(this.state, u.id) ? rangeSquares(this.state, u) : [],
    });
    this.bubble.open(this.view.cellToClient(u), this.petals(u), this.tutorialRects());
    haptic('light');
    this.actionHint(u);
    this.refresh();
  }

  /** Screen rectangles of what the tutorial step points at: petals keep off them. */
  private tutorialRects(): { x: number; y: number; w: number; h: number }[] {
    const c = this.tutorial.current();
    if (!c) return [];
    const side = this.humanSide();
    const half = this.view.cellSizeOnScreen() / 2;
    return tutorialMarks(this.state, c.step, side).map((p) => {
      const q = this.view.cellToClient(p);
      return { x: q.x - half, y: q.y - half, w: half * 2, h: half * 2 };
    });
  }

  /** The petals for a unit, at their fixed clock positions (UX §2). */
  private petals(u: Unit): Petal[] {
    const engaged = isEngaged(this.state, u.id);
    const canTurn = DIRS.some((d) => d !== u.facing && turnCost(u, u.facing, d) <= u.mpLeft + 1e-9);
    const out: Petal[] = [
      { id: 'info', icon: 'ⓘ', label: 'Info', enabled: true, run: () => this.openInfo(u) },
      {
        id: 'turn',
        icon: '↻',
        label: 'Turn',
        enabled: canTurn && !engaged,
        reason: engaged ? 'In melee' : 'No MP left to turn',
        badge: '1 MP',
        run: () => this.openFacingRing(u),
      },
      this.defencePetal(u, engaged),
    ];
    const sig = this.signaturePetal(u);
    if (sig) out.push(sig);
    const g = this.state.sides[u.side].general;
    if (g && !g.lost && g.unitId === u.id && g.skills.length) {
      const ready = g.skills.some((sk) => this.state.turn >= sk.readyTurn);
      const next = Math.min(...g.skills.map((sk) => sk.readyTurn));
      out.push({
        id: 'skill',
        icon: '★',
        label: 'Skill',
        enabled: ready,
        reason: `Ready on turn ${next}`,
        badge: ready ? undefined : `T${next}`,
        run: () => this.openSkills(),
      });
    }
    if (this.session.canUndo() && this.lastMovedId === u.id) {
      out.push({ id: 'undo', icon: '↶', label: 'Undo', enabled: true, run: () => this.undo() });
    }
    return out;
  }

  /**
   * The 6 o'clock petal: Hold, or the card's Fortify or Testudo that replaces it, with its MP
   * cost (GAME_DESIGN 4.12).
   */
  private defencePetal(u: Unit, engaged: boolean): Petal {
    const stance = hasAction(u, 'testudo') ? 'testudo' : hasAction(u, 'fortify') ? 'fortify' : null;
    if (!stance) {
      return {
        id: 'hold',
        icon: '⛨',
        label: 'Hold',
        enabled: !u.hasActed && !engaged,
        reason: engaged ? 'In melee' : 'Already acted',
        run: () => void this.run({ type: 'Hold', unitId: u.id }, null),
      };
    }
    const cmd: Command = { type: stance === 'testudo' ? 'Testudo' : 'Fortify', unitId: u.id };
    const why = validateCommand(this.state, cmd);
    const info = ACTION_INFO[stance];
    return {
      id: 'hold',
      icon: info.icon,
      label: info.name,
      enabled: !why,
      reason: why?.message,
      badge: `${stance === 'testudo' ? RULES.actions.testudo.mp : RULES.actions.fortify.mp} MP`,
      run: () => void this.run(cmd, u.id),
    };
  }

  /** The 7:30 petal: a non-attack signature action (Last stand, Othismos), if the card has one. */
  private signaturePetal(u: Unit): Petal | null {
    if (hasAction(u, 'lastStand')) {
      const cmd: Command = { type: 'LastStand', unitId: u.id };
      const why = validateCommand(this.state, cmd);
      return {
        id: 'signature',
        icon: ACTION_INFO.lastStand.icon,
        label: 'Last stand',
        enabled: !why,
        reason: why?.message,
        badge: u.lastStandUsed ? 'used' : '1×',
        run: () => void this.run(cmd, u.id),
      };
    }
    if (hasAction(u, 'othismos')) {
      const foe = this.state.units.find(
        (e) =>
          e.side !== u.side &&
          !validateCommand(this.state, { type: 'Othismos', unitId: u.id, targetId: e.id }),
      );
      return {
        id: 'signature',
        icon: ACTION_INFO.othismos.icon,
        label: 'Othismos',
        enabled: !!foe,
        reason: u.hasActed ? 'Already acted' : 'Needs an enemy in melee in front',
        run: () => foe && void this.run({ type: 'Othismos', unitId: u.id, targetId: foe.id }, u.id),
      };
    }
    return null;
  }

  /** A one-time hint the first time the player selects a unit with tactical actions. */
  private actionHint(u: Unit): void {
    const acts = u.type.actions ?? [];
    if (!acts.length || u.side !== this.humanSide()) return;
    const key = 'battlequest.hint.actions';
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch {
      return;
    }
    const names = acts.map((a) => ACTION_INFO[a].name).join(', ');
    this.hud.toast(
      `${u.type.name} has tactical actions: ${names}. Tap ⓘ to read them.`,
      undefined,
      5200,
    );
  }

  /** The unit card (Info petal or long-press). */
  private openInfo(u: Unit): void {
    this.bubble.close();
    this.hud.showUnitCard(u, this.state);
  }

  /** The id of the unit whose move the next Undo would take back. */
  private lastMovedId: string | null = null;
  /** Attack-mode tab chosen per unit and attack type, for the rest of the battle. */
  private modeMemory = new Map<string, AttackMode>();
  /** The Volley frame's top-left square while the Volley tab is open. */
  private volleyAt: Pos | null = null;
  /** Where a Parthian shot retires to. */
  private parthianTo: Pos | null = null;

  private deselect(): void {
    this.bubble.close();
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
    if (motionSettings().quickConfirm) {
      void this.confirmMove(u, dest);
      return;
    }
    this.mode = { kind: 'ghost', unitId: u.id, dest };
    this.bubble.close();
    this.view.showGhost(u, plan.path, plan.facing);
    this.hud.setChip(`${u.type.name}: tap again to move here (${+plan.cost.toFixed(1)} MP)`);
  }

  private async confirmMove(u: Unit, dest: Pos): Promise<void> {
    this.view.clearGhost();
    this.bubble.close();
    haptic('medium');
    const ok = await this.run({ type: 'Move', unitId: u.id, to: dest }, u.id);
    if (!ok) return;
    this.lastMovedId = u.id;
    if (this.session.canUndo()) {
      this.hud.toast('Moved', { label: 'Undo', run: () => this.undo() }, 3200);
    }
    const moved = this.unit(u.id);
    if (moved && 'unitId' in this.mode && this.mode.unitId === u.id) this.select(u.id);
  }

  private openFacingRing(u: Unit): void {
    this.select(u.id);
    this.bubble.close();
    this.mode = { kind: 'facing', unitId: u.id };
    const handles = DIRS.filter((d) => d !== u.facing).map((d) => ({
      dir: d,
      enabled: turnCost(u, u.facing, d) <= u.mpLeft + 1e-9,
    }));
    this.view.showFacingRing(u, handles);
    this.hud.setChip(
      `${u.type.name}: tap an arrowhead to turn (1 MP), or tap elsewhere to keep this facing`,
    );
  }

  /** The attack modes a unit has for a target type (GAME_DESIGN 4.12), basic one first. */
  private attackModes(att: Unit, type: 'Charge' | 'Shoot'): AttackMode[] {
    if (type === 'Shoot') {
      const out: AttackMode[] = ['shoot'];
      if (hasAction(att, 'volley')) out.push('volley');
      if (hasAction(att, 'parthianShot')) out.push('parthian');
      return out;
    }
    return hasAction(att, 'fullCharge') ? ['engage', 'full'] : ['engage'];
  }

  /**
   * The attack preview, with mode tabs when the unit has more than one way to attack. The
   * chosen tab is remembered per unit for the rest of the battle (UX §2).
   */
  private openPreview(att: Unit, def: Unit, type: 'Charge' | 'Shoot', mode?: AttackMode): void {
    const modes = this.attackModes(att, type);
    const remembered = this.modeMemory.get(`${att.id}:${type}`);
    const m = mode ?? (remembered && modes.includes(remembered) ? remembered : modes[0]!);
    this.modeMemory.set(`${att.id}:${type}`, m);
    const base = { type, unitId: att.id, targetId: def.id } as const;
    if (motionSettings().quickConfirm && m !== 'volley') {
      void this.run(this.attackCommand(att, def, type, m), att.id);
      return;
    }
    this.bubble.close();
    this.view.clearGhost();
    if (m === 'volley') {
      this.volleyAt = { x: def.x, y: def.y };
      this.mode = { kind: 'preview', unitId: att.id, targetId: def.id };
      this.showVolley(att, def, modes);
      return;
    }
    const p = previewCombat(this.state, { ...base, full: m === 'full' });
    if (isRejection(p)) {
      if (m !== modes[0]) {
        // This mode can't be used here: say why, and fall back to the basic attack.
        this.hud.toast(p.message);
        this.openPreview(att, def, type, modes[0]);
        return;
      }
      this.hud.toast(p.message);
      return;
    }
    this.mode = { kind: 'preview', unitId: att.id, targetId: def.id };
    const tabs: PreviewMode[] | undefined =
      modes.length > 1
        ? modes.map((x) => ({
            label: MODE_LABEL[x],
            on: x === m,
            run: () => this.openPreview(att, def, type, x),
          }))
        : undefined;
    let extra: HTMLElement | undefined;
    let blocked: string | undefined;
    if (m === 'full' && p.breakthrough) {
      const b = p.breakthrough;
      extra = el(
        'div',
        { class: `breakthrough ${b.chance > 0 ? '' : 'none'}` },
        el('b', {}, `${Math.round(b.chance * 100)}%`),
        el('span', {}, b.reason ?? 'chance to break through and land behind, facing its rear'),
      );
      // A ghost of the cavalry where it would land, already turned.
      if (b.landing) this.view.showGhost(att, [att, def, b.landing], b.facing);
    }
    if (m === 'parthian') {
      const to = parthianDefault(this.state, att);
      this.parthianTo = to;
      extra = el(
        'p',
        { class: 'note' },
        'After the shot the horse archers retire to the ghost square.',
      );
      const r = planParthian(this.state, att, to);
      if (isRejection(r)) blocked = r.message;
      else if (r.length > 1) this.view.showGhost(att, r, att.facing);
    }
    const other = type === 'Charge' ? 'Shoot' : 'Charge';
    const canOther = (other === 'Charge' ? this.targets?.charge : this.targets?.shoot)?.includes(
      def,
    );
    this.hud.showPreview(
      p,
      att,
      def,
      {
        confirm: () => {
          this.hud.hidePreview();
          this.view.clearGhost();
          void this.run(this.attackCommand(att, def, type, m), att.id);
        },
        cancel: () => this.cancelPreview(),
        alt: canOther
          ? { label: `${other} instead`, run: () => this.openPreview(att, def, other) }
          : undefined,
        modes: tabs,
        extra,
        blocked,
        confirmLabel:
          m === 'full' ? 'Full charge' : m === 'parthian' ? 'Shoot and retire' : undefined,
      },
      [this.view.cellToClient(att), this.view.cellToClient(def)],
    );
  }

  private attackCommand(att: Unit, def: Unit, type: 'Charge' | 'Shoot', m: AttackMode): Command {
    if (m === 'full') return { type: 'Charge', unitId: att.id, targetId: def.id, full: true };
    if (m === 'parthian') {
      return {
        type: 'ParthianShot',
        unitId: att.id,
        targetId: def.id,
        to: this.parthianTo ?? parthianDefault(this.state, att),
      };
    }
    return { type, unitId: att.id, targetId: def.id };
  }

  /** The Volley frame and its losses; a tap on the map moves the frame. */
  private showVolley(att: Unit, def: Unit, modes: AttackMode[]): void {
    const at = this.volleyAt!;
    const area = volleyArea(at).filter((p) => inBounds(this.state.map, p));
    const r = shootingRange(this.state, att);
    const hatched = area.filter(
      (p) =>
        rangeDistance(att, p) > r ||
        arcOf(att, att.facing, p) !== 'front' ||
        !hasLineOfSight(this.state, att, p),
    );
    const vp = previewVolley(this.state, { unitId: att.id, at });
    const bad = isRejection(vp);
    this.view.setHighlights({
      selected: att,
      reach: [],
      charge: [],
      shoot: [],
      area: { squares: area, bad, hatched },
    });
    const rows = bad
      ? []
      : vp.targets.map((t) => {
          const u = this.unit(t.unitId)!;
          return {
            name: u.type.name,
            side: u.side,
            loss: t.expectedLoss,
            drop: t.cohesionDropChance,
          };
        });
    this.hud.showVolleyPreview(
      att,
      rows,
      bad ? 0 : vp.total,
      {
        confirm: () => {
          this.hud.hidePreview();
          void this.run({ type: 'Volley', unitId: att.id, at }, att.id);
        },
        cancel: () => this.cancelPreview(),
        modes: modes.map((x) => ({
          label: MODE_LABEL[x],
          on: x === 'volley',
          run: () => this.openPreview(att, def, 'Shoot', x),
        })),
        blocked: bad ? vp.message : undefined,
      },
      [this.view.cellToClient(att), this.view.cellToClient(at)],
    );
  }

  private cancelPreview(): void {
    this.hud.hidePreview();
    this.view.clearGhost();
    this.volleyAt = null;
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
        const blocked =
          gu.hasActed && s.effect.kind !== 'chargeAgain'
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
      case 'chargeAgain':
        return 'Use after charging: the general’s unit and adjacent cavalry not in melee may charge again.';
      default:
        return '';
    }
  }

  private useSkill(gu: Unit, skillId: string, needsTarget: boolean): void {
    this.hud.hideSkills();
    this.hud.hidePreview();
    this.view.clearFacingRing();
    this.view.clearGhost();
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
    const before = this.state;
    const res = this.session.apply(cmd);
    if (!res.ok) {
      this.hud.toast(res.rejection.message);
      return false;
    }
    // Tutorial steps advance on what the command really did (GAME_DESIGN 7.4).
    for (const t of tutorialTriggers(before, res.events, before.activeSide)) {
      this.advanceTutorial(t);
    }
    this.record(res.events);
    if (cmd.type === 'Move' || cmd.type === 'Rotate') this.movesHistory.push([...this.turnMoves]);
    else this.movesHistory = [];
    this.recordMoves(res.events);
    this.mode = { kind: 'busy' };
    this.view.setHighlights(null);
    this.view.clearFacingRing();
    this.refresh();
    await this.view.play(res.events, this.state);
    if (this.disposed) return false;
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

  private summary(): BattleSummary {
    return battleSummary(this.startState, this.state, this.log);
  }

  /** Adds events to the combat log, and announces the melee phase with its results. */
  private record(events: GameEvent[]): void {
    const entries = describeEvents(events, this.state, this.logNames);
    this.log.push(...entries);
    this.hud.addLog(entries);
    if (!events.some((e) => e.type === 'MeleePhase')) return;
    const fights = meleeResults(events);
    if (fights.length === 0) return;
    const name = (id: string) => this.unit(id)?.type.name ?? id;
    const ms = this.view.speed === Infinity ? 900 : this.view.speed > 1 ? 1600 : 2800;
    this.hud.showBanner(
      'Melee: ' + fights.length + (fights.length === 1 ? ' fight' : ' fights'),
      fights.map((f) => name(f.a) + ' −' + f.lossA + '  ·  ' + name(f.b) + ' −' + f.lossB),
      ms,
    );
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
    this.lastMovedId = null;
    this.hud.clearToasts();
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
    for (
      let i = 0;
      i < 400 && !this.disposed && !this.state.result && this.state.activeSide === ai.side;
      i++
    ) {
      const cmd = ai.player.next(this.state);
      const res = this.session.apply(cmd);
      if (!res.ok) {
        // Skip that unit and carry on with the rest of the AI's turn.
        console.warn('AI command rejected', cmd, res.rejection);
        ai.player.rejected(cmd);
        if (cmd.type === 'EndTurn') break;
        continue;
      }
      this.record(res.events);
      for (const e of res.events) {
        if (e.type === 'UnitMoved' && e.kind === 'move' && this.unit(e.unitId)?.side === ai.side) {
          moves.push({ side: ai.side, path: e.path });
        }
      }
      await this.view.play(res.events, this.state);
      if (this.disposed) return;
      this.announce(res.events);
      this.refresh();
      this.hud.setChip('Enemy turn…');
      if (cmd.type === 'EndTurn') break;
    }
    this.hud.showSpeed(false);
    this.view.speed = 1;
    this.speedIdx = 0;
    this.hud.setSpeed('Speed 1×');
    if (this.state.result) {
      this.finish();
      return;
    }
    this.view.showLastMoves(moves);
    this.mode = { kind: 'idle' };
    this.deselect();
  }

  private finish(): void {
    if (this.disposed) return;
    this.mode = { kind: 'over' };
    this.refresh();
    if (this.opts.onEnd) {
      this.opts.onEnd(this.state, this.summary());
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
    const turning = this.summary().turningPoint;
    this.hud.showOverlay(
      title,
      turning ? body + ' Turning point: ' + turning : body,
      this.opts.onExit ? 'Back to menu' : 'Play again',
      () => (this.opts.onExit ? this.opts.onExit(this.summary()) : window.location.reload()),
      r.winner ?? undefined,
    );
  }

  private confirmExit(): void {
    if (!this.opts.onExit || this.disposed) return;
    if (this.mode.kind === 'busy' && this.isHumanTurn()) return;
    this.hud.showConfirm(
      'Leave the battle?',
      this.opts.ai ? 'Retreating counts as a defeat.' : 'This battle will not be saved.',
      'Leave',
      () => {
        const summary = this.summary();
        this.dispose();
        this.opts.onExit!(summary);
      },
    );
  }

  // ---------- Tutorial ----------

  /** The tutorial step docks in the guidance strip, with a leader line to its target. */
  private showTutorial(): void {
    const c = this.tutorial.current();
    this.hud.setTutorial(
      c ? c.text : null,
      c ? c.progress : '',
      () => {
        this.tutorial.skip();
        this.showTutorial();
      },
      this.leaderTarget(),
    );
    this.updateTutorialMarks();
    this.bubble?.setAvoid(this.tutorialRects());
  }

  /** Where the leader line points: the first square the current step highlights. */
  private leaderTarget(): { x: number; y: number } | null {
    const c = this.tutorial.current();
    if (!c) return null;
    const side = this.opts.ai ? (this.opts.ai.side === 'blue' ? 'red' : 'blue') : 'blue';
    const marks = tutorialMarks(this.state, c.step, side);
    return marks[0] ? this.view.cellToClient(marks[0]) : null;
  }

  private updateLeader(): void {
    this.hud.setLeaderTarget(this.leaderTarget());
  }

  private advanceTutorial(trigger: TutorialTrigger): void {
    if (this.tutorial.advance(trigger)) this.showTutorial();
  }

  /** Rings on what the current step points at; they follow the units as they move. */
  private updateTutorialMarks(): void {
    const c = this.tutorial.current();
    const side = this.opts.ai ? (this.opts.ai.side === 'blue' ? 'red' : 'blue') : 'blue';
    this.view.setTutorialMarks(c ? tutorialMarks(this.state, c.step, side) : []);
  }

  private humanSide(): Side {
    return this.opts.ai ? (this.opts.ai.side === 'blue' ? 'red' : 'blue') : this.state.activeSide;
  }

  private generalRank(side: Side): number {
    const g = this.state.sides[side].general;
    return g?.rank ?? 1;
  }

  /** Units the "waiting" chip cycles through: they can still move or attack. */
  private waiting(): Unit[] {
    return this.actionable().filter((u) => !u.hasMoved || this.canAttack(u));
  }

  /** The medallion: one skill is used at once (targeted ones ask for a target), more open a list. */
  private generalSkill(): void {
    if (!this.isHumanTurn() || this.mode.kind === 'busy') return;
    const side = this.state.activeSide;
    const g = this.state.sides[side].general;
    const gu = generalUnit(this.state, side);
    if (!g || !gu) return;
    const ready = g.skills.filter((k) => this.state.turn >= k.readyTurn);
    if (ready.length === 1 && g.skills.length === 1) {
      this.useSkill(gu, ready[0]!.id, skillNeedsTarget(ready[0]!.effect));
      return;
    }
    this.openSkills();
  }

  /** The battle menu (UX §6). */
  private openMenu(): void {
    if (this.disposed) return;
    this.bubble.close();
    const items = [
      { label: 'Resume', run: () => {} },
      ...(this.opts.onRestart && !this.state.result
        ? [
            {
              label: 'Restart battle',
              note: 'Back to deployment, same army. Not a defeat.',
              run: () =>
                this.hud.showConfirm(
                  'Restart from deployment?',
                  "This battle's progress will be lost. It doesn't count as a defeat.",
                  'Restart',
                  () => this.restart(),
                ),
            },
          ]
        : []),
      {
        label: 'Battle objectives',
        run: () => this.showObjectives(),
      },
      { label: 'Settings', run: () => this.hud.showSheet('Settings', settingsPage()) },
      { label: 'How to play', run: () => this.hud.showSheet('How to play', howToPlay()) },
      ...(this.opts.onExit
        ? [
            {
              label: 'Retreat',
              note: 'Counts as a defeat.',
              danger: true,
              run: () => this.confirmExit(),
            },
          ]
        : []),
    ];
    this.hud.showMenu(items);
  }

  private showObjectives(): void {
    const o = this.opts.objective?.(this.state);
    const s = this.state;
    const body = el(
      'div',
      {},
      el(
        'p',
        {},
        el('b', {}, o?.text ?? 'Break the enemy army: units worth half of it must rout or fall.'),
      ),
      el('p', {}, `Turn ${s.turn} of ${s.turnLimit}. If your general falls, the battle is lost.`),
      o
        ? el(
            'p',
            {},
            `★★★: win losing under 30% of your army, and ${o.bonus.toLowerCase()} (${o.status === 'met' ? 'on track' : o.status === 'failed' ? 'missed' : 'not yet'}).`,
          )
        : '',
    );
    this.hud.showSheet('Battle objectives', body);
  }

  /** Restart goes through the rules like any other command; the app redeploys. */
  private restart(): void {
    if (!this.opts.onRestart || this.state.result) return;
    const res = this.session.apply({ type: 'Restart' });
    if (!res.ok) return;
    this.dispose();
    this.opts.onRestart();
  }

  /** Desktop shortcuts (touch-controls skill). */
  private key(e: KeyboardEvent): void {
    if (this.disposed || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    const sel = 'unitId' in this.mode ? this.unit(this.mode.unitId) : undefined;
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      this.hud.hideUnitCard();
      this.hud.hidePreview();
      this.hud.hideSheet();
      this.view.clearFacingRing();
      this.deselect();
    } else if (k === 'enter' && this.mode.kind === 'ghost' && sel) {
      void this.confirmMove(sel, this.mode.dest);
    } else if (k === 'e') {
      void this.endTurn();
    } else if (k === 'u' || (k === 'z' && e.ctrlKey)) {
      this.undo();
    } else if (k === 'n' || k === 'tab') {
      e.preventDefault();
      this.nextUnit();
    } else if (k === 't' && sel && this.canTurnSelected()) {
      this.openFacingRing(sel);
    } else if (k === 'h' && sel && !sel.hasActed) {
      void this.run({ type: 'Hold', unitId: sel.id }, null);
    } else if (k === 'i' && sel) {
      this.openInfo(sel);
    } else if (k === 'g') {
      this.generalSkill();
    } else {
      return;
    }
    e.preventDefault();
  }

  // ---------- HUD ----------

  private refresh(): void {
    this.updateTutorialMarks();
    this.updateLeader();
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
      objective: this.opts.objective?.(s),
    });
    const busy = this.mode.kind === 'busy' || this.mode.kind === 'over' || !this.isHumanTurn();
    const gu = generalUnit(s, s.activeSide);
    const g = s.sides[s.activeSide].general;
    const skillReady =
      !!g &&
      !!gu &&
      isFighting(gu) &&
      g.skills.some(
        (k) => s.turn >= k.readyTurn && (!gu.hasActed || k.effect.kind === 'chargeAgain'),
      );
    this.hud.setButtons({ end: !busy && !s.result, menu: true });
    this.hud.setWaiting(busy ? 0 : this.waiting().length);
    // The general medallion (UX §1): the human side's general, its rank and skill state.
    const mine = this.isHumanTurn() ? s.activeSide : this.opts.ai ? this.humanSide() : s.activeSide;
    const mg = s.sides[mine].general;
    const mgu = generalUnit(s, mine);
    if (mg && !mg.lost && mgu && mg.skills.length) {
      const next = Math.min(...mg.skills.map((k) => k.readyTurn));
      const cd = Math.max(1, ...mg.skills.map((k) => k.cooldown));
      const left = Math.max(0, next - s.turn);
      this.hud.setMedallion({
        name: mg.name,
        initials: mg.name
          .split(/\s+/)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        rank: this.generalRank(mine),
        skill: busy ? 'blocked' : skillReady ? 'ready' : left > 0 ? 'cooldown' : 'blocked',
        progress: left > 0 ? 1 - left / cd : 1,
        label: skillReady ? mg.skills[0]!.name : left > 0 ? `Ready turn ${next}` : 'Not now',
      });
    } else {
      this.hud.setMedallion(null);
    }
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
