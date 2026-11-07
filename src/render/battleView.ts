import { Application, Container, Graphics, Text } from 'pixi.js';
import type { GameEvent } from '../core/events';
import { DIR_VECTORS } from '../core/geometry';
import { isSpent } from '../core/state';
import type { BattleState, Dir, Pos, Side, Unit } from '../core/types';
import { arrow, dashed } from './draw';
import { done, EASE, gsap, MOTION, reducedMotion, sec, sfx, track } from '../ui/motion';
import { buildGrid, buildTerrainLayer } from './terrainLayer';
import { CELL, THEME } from './theme';
import { loadBadgeTextures } from './badgeTextures';
import { facingRotation, lookOf, UnitView } from './unitView';

export interface Highlights {
  selected: Pos | null;
  reach: { pos: Pos; kind: 'move' | 'pullBack' | 'sidestep' }[];
  charge: Pos[];
  shoot: Pos[];
  /** Valid targets for a general's skill. */
  skill?: Pos[];
  /** Squares a selected missile unit can shoot at from where it stands (its range). */
  range?: Pos[];
  /** A Volley's 2×2 frame (red when it can't be fired), with out-of-range squares hatched. */
  area?: { squares: Pos[]; bad: boolean; hatched: Pos[] };
}

export interface RingHandle {
  dir: Dir;
  enabled: boolean;
}

const centre = (p: Pos): Pos => ({ x: (p.x + 0.5) * CELL, y: (p.y + 0.5) * CELL });

/**
 * The order events play in (playback only; the state is already final). A breakthrough
 * move plays right after its roll, so the cavalry passes through while the defender
 * reacts, not after the defender's rout.
 */
function playbackOrder(events: GameEvent[]): GameEvent[] {
  const out = [...events];
  for (let i = 0; i < out.length; i++) {
    const e = out[i]!;
    if (e.type !== 'UnitMoved' || e.kind !== 'breakthrough') continue;
    const roll = out.findIndex((x) => x.type === 'BreakthroughRoll' && x.unitId === e.unitId);
    if (roll < 0 || roll >= i) continue;
    out.splice(i, 1);
    out.splice(roll + 1, 0, e);
  }
  return out;
}
const shortestAngle = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

/** One breath of the tutorial marker (ms): a slow, calm pulse, like the age map's hint. */
const TUTORIAL_PULSE_MS = 1200;

/**
 * The Pixi battlefield. It only reads battle state and plays events: it never changes the game.
 */
export class BattleView {
  readonly app: Application;
  readonly world = new Container();
  private grid!: Graphics;
  private arrows = new Graphics();
  private highlights = new Graphics();
  private unitsLayer = new Container();
  private ghostLayer = new Container();
  private ringLayer = new Graphics();
  /** Gold rings on what the current tutorial step points at (GAME_DESIGN 7.4). */
  private tutorialLayer = new Graphics();
  private tutorialPulse: gsap.core.Tween | null = null;
  private effects = new Container();
  private views = new Map<string, UnitView>();
  private ring: { at: Pos; handles: RingHandle[] } | null = null;
  private mapSize = { w: 0, h: 0 };
  /** Screen padding kept free for the HUD (top bar, bottom buttons). */
  padding = { top: 56, bottom: 72, left: 12, right: 12 };
  /** Smallest square, in screen pixels, that fit() will use to show the whole map. */
  private minFitSquare = 44;
  private reducedMotion = false;
  /** Playback speed: 1, 2, or Infinity to skip animations. */
  speed = 1;

  private constructor(app: Application) {
    this.app = app;
  }

  static async create(host: HTMLElement): Promise<BattleView> {
    const app = new Application();
    await app.init({
      resizeTo: host,
      background: THEME.parchment,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    host.appendChild(app.canvas);
    await loadBadgeTextures();
    const view = new BattleView(app);
    view.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    app.stage.addChild(view.world);
    return view;
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  /** Builds the static terrain for a new battle. */
  loadMap(state: BattleState): void {
    this.world.removeChildren();
    this.views.clear();
    this.unitsLayer.removeChildren();
    this.highlights.clear();
    this.arrows.clear();
    this.clearGhost();
    this.clearFacingRing();
    this.grid = buildGrid(state.map);
    this.world.addChild(
      buildTerrainLayer(state.map),
      this.grid,
      this.arrows,
      this.highlights,
      this.ghostLayer,
      this.unitsLayer,
      this.tutorialLayer,
      this.ringLayer,
      this.effects,
    );
    this.tutorialLayer.clear();
    this.mapSize = { w: state.map.width * CELL, h: state.map.height * CELL };
  }

  /**
   * The battle intro on the board (motion skill): terrain inks in feature by feature, the
   * grid sketches in, then the units stamp down side by side with a small ink spatter.
   * Skippable like every animation (a tap fast-forwards it).
   */
  intro(delay = 0): void {
    const terrain = this.world.children[0] as Container | undefined;
    const features = terrain ? terrain.children.slice(1) : [];
    const units = [...this.views.values()]
      .filter((v) => v.visible)
      .sort((a, b) => a.look.side.localeCompare(b.look.side) || a.look.x - b.look.x);
    if (this.reduced) {
      track(gsap.fromTo(this.world, { alpha: 0 }, { alpha: 1, duration: sec(MOTION.reducedFade) }));
      return;
    }
    const tl = gsap.timeline({ delay: sec(delay) });
    tl.fromTo(
      features,
      { alpha: 0 },
      { alpha: 1, duration: sec(MOTION.impact), stagger: sec(30), ease: EASE.out },
      0,
    );
    tl.fromTo(
      this.grid,
      { alpha: 0 },
      { alpha: 1, duration: sec(MOTION.reveal), ease: EASE.out },
      sec(120),
    );
    const start = sec(260);
    const step = Math.min(sec(40), sec(600) / Math.max(1, units.length));
    units.forEach((v, i) => {
      const at = start + i * step;
      tl.fromTo(v, { alpha: 0 }, { alpha: 1, duration: sec(MOTION.instant) }, at);
      tl.fromTo(
        v.scale,
        { x: 1.15, y: 1.15 },
        { x: 1, y: 1, duration: sec(MOTION.impact), ease: EASE.back },
        at,
      );
      tl.add(() => this.specks(v.look, THEME.ink, 3), at + sec(MOTION.instant));
    });
    track(tl);
  }

  /** Snaps every unit block to the given state. */
  sync(state: BattleState): void {
    for (const u of state.units) {
      const g = state.sides[u.side].general;
      const look = lookOf(u, isSpent(state, u), g && !g.lost && g.unitId === u.id ? g.name : null);
      let v = this.views.get(u.id);
      if (!v) {
        v = new UnitView(look);
        this.views.set(u.id, v);
        this.unitsLayer.addChild(v);
      } else {
        v.update(look);
      }
      v.snap();
      v.scale.set(1);
    }
  }

  // ---------- Camera ----------

  get zoom(): number {
    return this.world.scale.x;
  }

  /**
   * Matches the HUD layout (style.css): on phone landscape (height < 500 px) the buttons
   * sit in columns at the left and right edges, so the map gets the full height.
   */
  private layout(): void {
    const { height } = this.app.screen;
    const phone = height < 500;
    this.padding = phone
      ? { top: 42, bottom: 6, left: 112, right: 120 }
      : { top: 56, bottom: 72, left: 12, right: 12 };
    this.minFitSquare = phone ? 32 : 44;
  }

  /** The HUD's reserved space around the play area (set by the battle screen's layout). */
  insets: (() => { top: number; bottom: number; left: number; right: number }) | null = null;

  private viewport() {
    this.layout();
    if (this.insets) {
      const i = this.insets();
      // Keep a small margin even where no HUD element sits.
      this.padding = {
        top: Math.max(8, i.top),
        bottom: Math.max(8, i.bottom),
        left: Math.max(8, i.left),
        right: Math.max(8, i.right),
      };
    }
    const { width, height } = this.app.screen;
    const p = this.padding;
    return { x: p.left, y: p.top, w: width - p.left - p.right, h: height - p.top - p.bottom };
  }

  /**
   * Fits the map, but never below the zoom where a square is 44 px (32 px on a phone, so
   * the whole map fits its height; pinch to zoom in).
   */
  fit(focus?: Pos): void {
    const vp = this.viewport();
    const fitZoom = Math.min(vp.w / this.mapSize.w, vp.h / this.mapSize.h);
    const z = Math.max(fitZoom, this.minFitSquare / CELL);
    this.world.scale.set(z);
    if (focus && z > fitZoom + 1e-6) this.centreOn(focus);
    else
      this.world.position.set(
        vp.x + (vp.w - this.mapSize.w * z) / 2,
        vp.y + (vp.h - this.mapSize.h * z) / 2,
      );
    this.clamp();
  }

  centreOn(p: Pos): void {
    const vp = this.viewport();
    const c = centre(p);
    const z = this.zoom;
    this.world.position.set(vp.x + vp.w / 2 - c.x * z, vp.y + vp.h / 2 - c.y * z);
    this.clamp();
  }

  pan(dx: number, dy: number): void {
    this.world.position.x += dx;
    this.world.position.y += dy;
    this.clamp();
  }

  zoomAt(factor: number, sx: number, sy: number): void {
    const vp = this.viewport();
    const minZ = Math.min(vp.w / this.mapSize.w, vp.h / this.mapSize.h) * 0.9;
    const z = Math.min(2.5, Math.max(minZ, this.zoom * factor));
    const wx = (sx - this.world.x) / this.zoom;
    const wy = (sy - this.world.y) / this.zoom;
    this.world.scale.set(z);
    this.world.position.set(sx - wx * z, sy - wy * z);
    this.clamp();
  }

  /** Keeps at least part of the map on screen. */
  private clamp(): void {
    const vp = this.viewport();
    const z = this.zoom;
    const w = this.mapSize.w * z;
    const h = this.mapSize.h * z;
    const fitX = (lo: number, size: number, span: number, pos: number) =>
      size <= span
        ? lo + (span - size) / 2
        : Math.min(lo + 40, Math.max(lo + span - size - 40, pos));
    this.world.position.set(fitX(vp.x, w, vp.w, this.world.x), fitX(vp.y, h, vp.h, this.world.y));
    this.onCamera?.();
  }

  /** Called whenever the camera moves (HTML overlays attached to units follow it). */
  onCamera: (() => void) | null = null;

  /** One square's size on screen at the current zoom (px). */
  cellSizeOnScreen(): number {
    return CELL * this.zoom;
  }

  /** A square's centre in client (page) coordinates, for HTML overlays. */
  cellToClient(p: Pos): Pos {
    const r = this.app.canvas.getBoundingClientRect();
    const q = this.cellToScreen(p);
    return { x: r.left + q.x, y: r.top + q.y };
  }

  screenToCell(sx: number, sy: number): Pos | null {
    const x = Math.floor((sx - this.world.x) / this.zoom / CELL);
    const y = Math.floor((sy - this.world.y) / this.zoom / CELL);
    if (x < 0 || y < 0 || x * CELL >= this.mapSize.w || y * CELL >= this.mapSize.h) return null;
    return { x, y };
  }

  cellToScreen(p: Pos): Pos {
    const c = centre(p);
    return { x: this.world.x + c.x * this.zoom, y: this.world.y + c.y * this.zoom };
  }

  // ---------- Overlays ----------

  setHighlights(h: Highlights | null): void {
    const g = this.highlights.clear();
    this.grid.alpha = h ? THEME.gridAlphaSelected : THEME.gridAlpha;
    if (!h) return;
    for (const r of h.reach) {
      const color = r.kind === 'pullBack' ? THEME.pullBack : THEME.reach;
      g.rect(r.pos.x * CELL + 3, r.pos.y * CELL + 3, CELL - 6, CELL - 6).fill({
        color,
        alpha: 0.3,
      });
      if (r.kind === 'pullBack') {
        g.rect(r.pos.x * CELL + 3, r.pos.y * CELL + 3, CELL - 6, CELL - 6).stroke({
          width: 2,
          color,
          alpha: 0.7,
        });
      }
    }
    // Missile range: a dotted border and a centre dot on every square the unit can shoot.
    for (const p of h.range ?? []) {
      const c = centre(p);
      g.rect(p.x * CELL + 2, p.y * CELL + 2, CELL - 4, CELL - 4).stroke({
        width: 1.5,
        color: THEME.shoot,
        alpha: 0.55,
      });
      g.circle(c.x, c.y, 3.5).fill({ color: THEME.shoot, alpha: 0.45 });
    }
    for (const p of h.charge) {
      // Thick red frame with corner brackets: shape, not only colour, marks a charge target.
      const x0 = p.x * CELL + 3;
      const y0 = p.y * CELL + 3;
      const s = CELL - 6;
      g.rect(x0, y0, s, s).stroke({ width: 3, color: THEME.charge, alpha: 0.9 });
      const k = 14;
      for (const [cx, cy, sx, sy] of [
        [x0, y0, 1, 1],
        [x0 + s, y0, -1, 1],
        [x0, y0 + s, 1, -1],
        [x0 + s, y0 + s, -1, -1],
      ] as const) {
        g.moveTo(cx, cy + sy * k)
          .lineTo(cx, cy)
          .lineTo(cx + sx * k, cy);
      }
      g.stroke({ width: 6, color: THEME.charge, alpha: 0.9 });
    }
    for (const p of h.shoot) {
      const c = centre(p);
      const r = CELL * 0.4;
      g.circle(c.x, c.y, r).stroke({ width: 2.5, color: THEME.shoot, alpha: 0.85 });
      g.moveTo(c.x - r - 6, c.y).lineTo(c.x - r * 0.45, c.y);
      g.moveTo(c.x + r * 0.45, c.y).lineTo(c.x + r + 6, c.y);
      g.moveTo(c.x, c.y - r - 6).lineTo(c.x, c.y - r * 0.45);
      g.moveTo(c.x, c.y + r * 0.45).lineTo(c.x, c.y + r + 6);
      g.stroke({ width: 2.5, color: THEME.shoot, alpha: 0.85 });
    }
    for (const p of h.skill ?? []) {
      g.rect(p.x * CELL + 3, p.y * CELL + 3, CELL - 6, CELL - 6).fill({
        color: THEME.select,
        alpha: 0.25,
      });
      g.rect(p.x * CELL + 3, p.y * CELL + 3, CELL - 6, CELL - 6).stroke({
        width: 4,
        color: THEME.select,
      });
    }
    if (h.area) {
      const color = h.area.bad ? THEME.charge : THEME.ink;
      const xs = h.area.squares.map((p) => p.x);
      const ys = h.area.squares.map((p) => p.y);
      const x0 = Math.min(...xs) * CELL + 2;
      const y0 = Math.min(...ys) * CELL + 2;
      const w = (Math.max(...xs) + 1) * CELL - 2 - x0;
      const hgt = (Math.max(...ys) + 1) * CELL - 2 - y0;
      g.rect(x0, y0, w, hgt).fill({ color, alpha: 0.08 });
      g.rect(x0, y0, w, hgt).stroke({ width: 4, color, alpha: 0.85 });
      for (const p of h.area.hatched) {
        for (let k = 8; k < CELL * 2; k += 12) {
          const ax = p.x * CELL + Math.max(0, k - CELL);
          const ay = p.y * CELL + Math.min(k, CELL);
          const bx = p.x * CELL + Math.min(k, CELL);
          const by = p.y * CELL + Math.max(0, k - CELL);
          g.moveTo(ax, ay).lineTo(bx, by);
        }
        g.stroke({ width: 1.5, color: THEME.ink, alpha: 0.35 });
      }
    }
    if (h.selected) {
      const p = h.selected;
      g.rect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2).stroke({
        width: 3,
        color: THEME.select,
      });
    }
  }

  /**
   * Marks the squares the current tutorial step points at with a pulsing gold ring and a
   * small pointer above it. Reduced motion keeps the ring still.
   */
  setTutorialMarks(marks: Pos[]): void {
    const g = this.tutorialLayer.clear();
    this.tutorialPulse?.kill();
    this.tutorialPulse = null;
    if (!marks.length) return;
    for (const p of marks) {
      const x0 = p.x * CELL - 4;
      const y0 = p.y * CELL - 4;
      const s = CELL + 8;
      g.roundRect(x0, y0, s, s, 12).stroke({ width: 5, color: THEME.select, alpha: 0.95 });
      g.roundRect(x0 - 4, y0 - 4, s + 8, s + 8, 15).stroke({
        width: 2,
        color: THEME.ink,
        alpha: 0.45,
      });
      // A small pointer above the square (below it on the top row, so it stays on the map).
      const cx = (p.x + 0.5) * CELL;
      const tip =
        p.y === 0
          ? [cx - 10, y0 + s + 18, cx + 10, y0 + s + 18, cx, y0 + s + 6]
          : [cx - 10, y0 - 18, cx + 10, y0 - 18, cx, y0 - 6];
      g.poly(tip).fill({ color: THEME.select });
      g.poly(tip).stroke({
        width: 1.5,
        color: THEME.ink,
        alpha: 0.6,
      });
    }
    this.tutorialLayer.alpha = 1;
    if (!this.reduced) {
      // A slow, calm breath (a hint loop, not decoration that blocks anything).
      this.tutorialPulse = gsap.to(this.tutorialLayer, {
        alpha: 0.55,
        duration: sec(TUTORIAL_PULSE_MS / 2),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /** A translucent copy of the unit at its destination, with its path as a battle-map arrow. */
  showGhost(u: Unit, path: Pos[], facing: Dir, cost?: number): void {
    this.clearGhost();
    const g = new Graphics();
    arrow(g, path.map(centre), CELL * 0.22, THEME.side[u.side], 0.32);
    const dest = path[path.length - 1]!;
    const ghost = new UnitView({ ...lookOf(u, false), x: dest.x, y: dest.y, facing, stance: null });
    ghost.alpha = 0.55;
    this.ghostLayer.addChild(g, ghost);
    // Numbered footprints along the path, then the MP cost by the ghost.
    const steps: Container[] = [];
    path.slice(1, -1).forEach((p, i) => {
      const c = centre(p);
      const dot = new Container();
      dot.position.set(c.x, c.y);
      const d = new Graphics().circle(0, 0, 9).fill({ color: THEME.paperInk, alpha: 0.92 });
      d.circle(0, 0, 9).stroke({ width: 1.5, color: THEME.side[u.side], alpha: 0.8 });
      const t = new Text({
        text: String(i + 1),
        style: {
          fontFamily: THEME.sans,
          fontSize: 11,
          fontWeight: '700',
          fill: THEME.side[u.side],
        },
      });
      t.anchor.set(0.5);
      dot.addChild(d, t);
      this.ghostLayer.addChild(dot);
      steps.push(dot);
    });
    if (cost !== undefined) {
      const c = centre(dest);
      const tag = new Text({
        text: `${+cost.toFixed(1)} MP`,
        style: {
          fontFamily: THEME.sans,
          fontSize: 13,
          fontWeight: '700',
          fill: THEME.ink,
          stroke: { color: 0xfff8e6, width: 4 },
        },
      });
      tag.anchor.set(0.5, 0);
      tag.position.set(c.x, c.y + CELL * 0.3);
      this.ghostLayer.addChild(tag);
    }
    if (this.reduced) return;
    // The ghost fades in at its square; footprints ink in along the path, one after another.
    track(
      gsap.fromTo(
        ghost,
        { alpha: 0 },
        { alpha: 0.55, duration: sec(MOTION.quick + 60), ease: EASE.out },
      ),
    );
    track(gsap.fromTo(g, { alpha: 0 }, { alpha: 1, duration: sec(MOTION.quick), ease: EASE.out }));
    steps.forEach((dot, i) =>
      track(
        gsap.fromTo(
          dot,
          { alpha: 0 },
          { alpha: 1, duration: sec(MOTION.instant), delay: sec(40 + i * 35), ease: EASE.out },
        ),
      ),
    );
  }

  clearGhost(): void {
    this.ghostLayer.removeChildren().forEach((c) => c.destroy());
    this.clearBracket();
  }

  private bracket: Graphics | null = null;

  /**
   * The attack preview's target bracket (UX §3): red ink corners that draw on around the
   * target square.
   */
  showBracket(at: Pos): void {
    this.clearBracket();
    const g = new Graphics();
    this.effects.addChild(g);
    this.bracket = g;
    const x0 = at.x * CELL - 2;
    const y0 = at.y * CELL - 2;
    const sz = CELL + 4;
    const k = 18;
    const draw = (p: number) => {
      if (g.destroyed) return;
      g.clear();
      const len = k * p;
      for (const [cx, cy, sx, sy] of [
        [x0, y0, 1, 1],
        [x0 + sz, y0, -1, 1],
        [x0, y0 + sz, 1, -1],
        [x0 + sz, y0 + sz, -1, -1],
      ] as const) {
        g.moveTo(cx, cy + sy * len)
          .lineTo(cx, cy)
          .lineTo(cx + sx * len, cy);
      }
      g.stroke({ width: 5, color: THEME.charge, alpha: 0.95, cap: 'round', join: 'round' });
    };
    if (this.reduced) {
      draw(1);
      return;
    }
    const o = { p: 0 };
    draw(0);
    const tw = gsap.to(o, { p: 1, duration: sec(300), ease: EASE.out, onUpdate: () => draw(o.p) });
    // Killed with the bracket.
    (g as unknown as { _tween?: gsap.core.Tween })._tween = tw;
    g.on('destroyed', () => tw.kill());
    track(tw);
  }

  clearBracket(): void {
    if (this.bracket) gsap.killTweensOf(this.bracket);
    this.bracket?.destroy();
    this.bracket = null;
  }

  /** Shows the previous side's moves as faint arrows, like a battle diagram. */
  showLastMoves(moves: { side: Side; path: Pos[] }[]): void {
    const g = this.arrows.clear();
    for (const m of moves) arrow(g, m.path.map(centre), CELL * 0.18, THEME.side[m.side], 0.18);
  }

  showFacingRing(at: Pos, handles: RingHandle[]): void {
    this.ring = { at, handles };
    const g = this.ringLayer.clear();
    const c = centre(at);
    // Turn mode (UX §3): the ring scales up around the unit with a small overshoot.
    this.ringLayer.pivot.set(c.x, c.y);
    this.ringLayer.position.set(c.x, c.y);
    if (!this.reduced) {
      track(
        gsap.fromTo(
          this.ringLayer,
          { alpha: 0, rotation: -0.35 },
          { alpha: 1, rotation: 0, duration: sec(300), ease: EASE.back },
        ),
      );
    }
    g.circle(c.x, c.y, CELL * 0.95).stroke({ width: 2, color: THEME.ink, alpha: 0.25 });
    for (const h of handles) {
      const p = this.handleWorldPos(at, h.dir);
      g.circle(p.x, p.y, 13).fill({
        color: h.enabled ? THEME.select : 0xbdb3a0,
        alpha: h.enabled ? 0.95 : 0.6,
      });
      g.circle(p.x, p.y, 13).stroke({ width: 2, color: THEME.ink, alpha: 0.7 });
      // A small arrowhead pointing outwards.
      const v = DIR_VECTORS[h.dir]!;
      const len = Math.hypot(v.x, v.y);
      const ux = v.x / len;
      const uy = v.y / len;
      g.poly([
        p.x + ux * 7,
        p.y + uy * 7,
        p.x - uy * 5 - ux * 3,
        p.y + ux * 5 - uy * 3,
        p.x + uy * 5 - ux * 3,
        p.y - ux * 5 - uy * 3,
      ]).fill({ color: THEME.ink, alpha: h.enabled ? 0.85 : 0.35 });
    }
  }

  clearFacingRing(): void {
    this.ring = null;
    gsap.killTweensOf(this.ringLayer);
    this.ringLayer.alpha = 1;
    this.ringLayer.rotation = 0;
    this.ringLayer.clear();
  }

  private handleWorldPos(at: Pos, d: Dir): Pos {
    const c = centre(at);
    const v = DIR_VECTORS[d]!;
    const len = Math.hypot(v.x, v.y);
    return { x: c.x + (v.x / len) * CELL * 0.95, y: c.y + (v.y / len) * CELL * 0.95 };
  }

  /** The ring handle under a screen point (hit area at least 44 px across). */
  ringHandleAt(sx: number, sy: number): RingHandle | null {
    if (!this.ring) return null;
    let best: { h: RingHandle; d: number } | null = null;
    for (const h of this.ring.handles) {
      const w = this.handleWorldPos(this.ring.at, h.dir);
      const px = this.world.x + w.x * this.zoom;
      const py = this.world.y + w.y * this.zoom;
      const d = Math.hypot(px - sx, py - sy);
      if (d <= Math.max(22, 14 * this.zoom) && (!best || d < best.d)) best = { h, d };
    }
    return best?.h ?? null;
  }

  // ---------- Animation (GSAP on Pixi properties; motion skill) ----------

  /** The timeline playing core events now, if any (a tap jumps it to its end). */
  private playing: gsap.core.Timeline | null = null;

  /** Jumps the current playback to its end state (input never waits for decoration). */
  fastForward(): void {
    this.playing?.progress(1, false);
  }

  private get reduced(): boolean {
    return this.reducedMotion || reducedMotion();
  }

  private floatText(at: Pos, text: string, color: number): void {
    const c = centre(at);
    const t = new Text({
      text,
      style: {
        fontFamily: THEME.serif,
        fontSize: 22,
        fontWeight: '700',
        fill: color,
        stroke: { color: 0xfff8e6, width: 4 },
      },
    });
    t.anchor.set(0.5);
    t.position.set(c.x + (Math.random() - 0.5) * 10, c.y - 10);
    this.effects.addChild(t);
    const tl = gsap.timeline({ onComplete: () => t.destroy() });
    if (this.reduced) tl.to(t, { alpha: 0, duration: sec(MOTION.reducedFade), delay: 0.5 });
    else
      tl.to(t, { y: c.y - 44, duration: sec(900), ease: EASE.out }, 0).to(
        t,
        { alpha: 0, duration: sec(360), ease: EASE.in },
        sec(540),
      );
    track(tl);
  }

  /** A burst of ink specks (game-feel), fading out; a few small shapes only. */
  private specks(at: Pos, color: number, n = 6): void {
    if (this.reduced) return;
    const c = centre(at);
    for (let i = 0; i < n; i++) {
      const g = new Graphics().circle(0, 0, 2 + (i % 3)).fill({ color, alpha: 0.75 });
      g.position.set(c.x, c.y);
      this.effects.addChild(g);
      const a = (i / n) * Math.PI * 2 + 0.4;
      const r = CELL * (0.32 + 0.12 * (i % 2));
      track(
        gsap.to(g, {
          x: c.x + Math.cos(a) * r,
          y: c.y + Math.sin(a) * r,
          alpha: 0,
          duration: sec(MOTION.impact + 80),
          ease: EASE.out,
          onComplete: () => g.destroy(),
        }),
      );
    }
  }

  /** Adds a unit's slide along its path, square by square, to `tl`. */
  private addSlide(tl: gsap.core.Timeline, v: UnitView, path: Pos[], turn: boolean): void {
    const end = centre(path[path.length - 1]!);
    if (this.reduced || path.length < 2) {
      tl.set(v, { x: end.x, y: end.y });
      return;
    }
    const segs = path.length - 1;
    const per = sec(Math.min(MOTION.moveMax, MOTION.move * segs) / segs);
    let rot = v.body.rotation;
    for (let i = 1; i < path.length; i++) {
      const a = centre(path[i - 1]!);
      const b = centre(path[i]!);
      const label = `seg${i}`;
      tl.addLabel(label);
      tl.to(v, { x: b.x, y: b.y, duration: per, ease: i === segs ? EASE.out : 'none' }, label);
      if (turn) {
        const to = rot + shortestAngle(rot, Math.atan2(b.x - a.x, -(b.y - a.y)));
        tl.to(v.body, { rotation: to, duration: per / 2, ease: EASE.out }, label);
        rot = to;
      }
    }
  }

  /** Adds a turn to a facing, settling with a small overshoot. */
  private addRotate(tl: gsap.core.Timeline, v: UnitView, f: Dir, ms: number = MOTION.quick): void {
    const target = facingRotation(f);
    tl.add(() => {
      const from = v.body.rotation;
      const to = from + shortestAngle(from, target);
      if (this.reduced) v.body.rotation = to;
      else track(gsap.to(v.body, { rotation: to, duration: sec(ms), ease: EASE.back }));
    });
    if (!this.reduced) tl.to({}, { duration: sec(ms) });
  }

  /** Plays core events as one GSAP timeline, then snaps to the final state. */
  async play(events: GameEvent[], final: BattleState): Promise<void> {
    this.fastForward();
    const temp = new Graphics();
    this.effects.addChild(temp);
    const tl = gsap.timeline({ paused: true });
    const r = this.reduced;
    const fade = sec(MOTION.reducedFade);
    // Where the last impact started: its counter-impact plays at the same moment.
    let impactAt: number | null = null;
    // Where a breakthrough's ripple started: the cavalry passes through at that moment.
    let throughAt: number | null = null;
    for (const e of playbackOrder(events)) {
      if (e.type !== 'DamageDealt' || e.kind !== 'impact') impactAt = null;
      switch (e.type) {
        case 'UnitMoved': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          const turn = e.kind === 'move' || e.kind === 'rout' || e.kind === 'pursuit';
          if (e.kind === 'breakthrough' && throughAt !== null && !r) {
            const sub = gsap.timeline();
            this.addSlide(sub, v, e.path, false);
            tl.add(sub, throughAt);
            // The landing (specks, the turn) follows the slide.
            const end = throughAt + sub.duration();
            if (end > tl.duration()) tl.to({}, { duration: end - tl.duration() });
            throughAt = null;
          } else {
            this.addSlide(tl, v, e.path, turn);
          }
          if (e.kind === 'breakthrough') {
            const land = e.path[e.path.length - 1]!;
            tl.add(() => this.specks(land, THEME.rough, 8));
          }
          const end = e.path[e.path.length - 1]!;
          tl.add(() => {
            v.look = { ...v.look, x: end.x, y: end.y, facing: e.facing };
          });
          this.addRotate(tl, v, e.facing, MOTION.quick);
          break;
        }
        case 'UnitRotated': {
          const v = this.views.get(e.unitId);
          if (v) this.addRotate(tl, v, e.to);
          break;
        }
        case 'ChargeDeclared': {
          const target = this.views.get(e.targetId);
          // Wind-up (UX §3): a small pull-back against the charge, longer for a Full charge.
          const charger = this.views.get(e.unitId);
          const full = events.some((x) => x.type === 'BreakthroughRoll' && x.unitId === e.unitId);
          if (charger && target && !r) {
            const from = centre(charger.look);
            const to = centre(target.look);
            const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
            const k = (full ? 0.12 : 0.05) * CELL;
            tl.to(charger, {
              x: from.x - ((to.x - from.x) / len) * k,
              y: from.y - ((to.y - from.y) / len) * k,
              duration: sec(full ? 180 : 90),
              ease: EASE.out,
            });
          }
          const pts =
            e.path.length > 1
              ? e.path.map(centre)
              : target
                ? [centre(e.path[0]!), centre(target.look)]
                : [];
          tl.add(() => {
            if (pts.length > 1) arrow(temp, pts, CELL * 0.26, THEME.charge, 0.35);
          });
          sfx('charge');
          break;
        }
        case 'ShotFired': {
          const a = this.views.get(e.unitId)?.look;
          const b = this.views.get(e.targetId)?.look;
          if (!a || !b) break;
          const line = new Graphics();
          dashed(line, centre(a), centre(b), 8, 6);
          line.stroke({ width: 2.5, color: THEME.ink, alpha: 0.7 });
          line.alpha = 0;
          this.effects.addChild(line);
          tl.set(line, { alpha: 1 });
          tl.to(line, { alpha: 0.4, duration: r ? fade : sec(260), ease: EASE.in });
          tl.add(() => line.destroy());
          break;
        }
        case 'DamageDealt': {
          const v = this.views.get(e.targetId);
          if (!v) break;
          const amount = e.amount;
          // Both sides strike at once: a counter-impact shares the first impact's moment.
          const pairedAt = e.kind === 'impact' && !r ? impactAt : null;
          if (e.kind === 'impact' && impactAt === null) impactAt = tl.duration();
          const d = pairedAt !== null ? gsap.timeline({ paused: true }) : tl;
          d.add(() => {
            v.update({ strength: Math.max(0, v.look.strength - amount) });
            this.floatText(v.look, `−${amount}`, THEME.damage);
            sfx('impact');
          });
          if (r) break;
          // Impact frame: a short hit-stop, a squash, ink specks, then the block shakes.
          if (e.kind === 'impact' || e.kind === 'trample') {
            d.to({}, { duration: sec(MOTION.hitStop) });
            d.add(() => this.specks(v.look, THEME.ink));
            d.to(v.scale, { x: 1.12, y: 0.88, duration: sec(70), ease: EASE.out });
            d.to(v.scale, { x: 1, y: 1, duration: sec(160), ease: EASE.back });
          }
          const shake = { k: 1 };
          let bx = 0;
          let by = 0;
          d.add(() => {
            bx = v.x;
            by = v.y;
          });
          d.to(shake, {
            k: 0,
            duration: sec(200),
            ease: 'none',
            onUpdate: () => {
              const amp = 4 * shake.k;
              const t = 1 - shake.k;
              v.position.set(bx + Math.sin(t * 40) * amp, by + Math.cos(t * 33) * amp * 0.5);
            },
            onComplete: () => v.position.set(bx, by),
          });
          if (pairedAt !== null && d !== tl) tl.add(d.paused(false), pairedAt);
          break;
        }
        case 'CohesionChanged':
        case 'UnitRallied': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          const to = e.to;
          tl.add(() => v.update({ cohesion: to }));
          if (!r) {
            tl.to(v.scale, { x: 1.12, y: 1.12, duration: sec(130), ease: EASE.out });
            tl.to(v.scale, { x: 1, y: 1, duration: sec(130), ease: EASE.in });
          }
          break;
        }
        case 'VolleyFired': {
          // Ink rain (UX §3): a fan of fine dashes from the shooter into the frame, landing
          // on each unit in quick, varied succession.
          const a = this.views.get(e.unitId)?.look;
          if (!a || r) break;
          const label = `volley${tl.duration()}`;
          tl.addLabel(label);
          const gaps = [0, 0.04, 0.075, 0.13];
          e.targetIds.forEach((id, i) => {
            const b = this.views.get(id)?.look;
            if (!b) return;
            const lines = new Graphics();
            for (let k = -2; k <= 2; k++) {
              const from = centre(a);
              const to = centre(b);
              dashed(
                lines,
                { x: from.x, y: from.y + k * 3 },
                { x: to.x + k * 6, y: to.y + k * 4 },
                5,
                7,
              );
            }
            lines.stroke({ width: 1.5, color: THEME.ink, alpha: 0.6 });
            lines.alpha = 0;
            this.effects.addChild(lines);
            const t0 = `${label}+=${gaps[i] ?? 0.05 * i}`;
            tl.to(lines, { alpha: 1, duration: sec(MOTION.instant), ease: EASE.out }, t0);
            tl.to(
              lines,
              {
                alpha: 0,
                duration: sec(MOTION.quick + 80),
                ease: EASE.in,
                onComplete: () => lines.destroy(),
              },
              `${t0}+=0.12`,
            );
          });
          tl.to({}, { duration: sec(260) });
          sfx('volley');
          break;
        }
        case 'Fortified':
        case 'TestudoFormed': {
          // A shield lock: the marks stamp on and the block settles.
          const v = this.views.get(e.unitId);
          if (!v) break;
          const stance = e.type === 'Fortified' ? 'fortified' : 'testudo';
          tl.add(() => v.update({ stance }));
          if (!r) {
            tl.fromTo(
              v.body.scale,
              { x: 1.14, y: 1.14 },
              { x: 1, y: 1, duration: sec(MOTION.impact), ease: EASE.back },
            );
          }
          sfx('fortify');
          break;
        }
        case 'LastStandDeclared': {
          const v = this.views.get(e.unitId);
          if (v) tl.add(() => this.floatText(v.look, 'Last stand', THEME.select));
          if (!r) tl.to({}, { duration: sec(300) });
          break;
        }
        case 'OthismosRoll': {
          const v = this.views.get(e.unitId);
          const pushed = e.pushed;
          if (v) tl.add(() => this.floatText(v.look, pushed ? 'Othismos!' : 'Held', THEME.ink));
          break;
        }
        case 'BreakthroughRoll': {
          const t = this.views.get(e.targetId);
          if (t && e.success && !r) {
            // The defender's block ripples as the cavalry passes through it.
            throughAt = tl.duration();
            tl.to(t.scale, { x: 0.9, y: 1.12, duration: sec(90), ease: EASE.out });
            tl.to(t.scale, { x: 1, y: 1, duration: sec(220), ease: 'elastic.out(1, 0.5)' });
          }
          if (e.success) sfx('breakthrough');
          break;
        }
        case 'UnitRouted': {
          // The block hollows out (the cohesion change) and wobbles before it runs.
          const v = this.views.get(e.unitId);
          if (!v || r) break;
          const rot = v.body.rotation;
          tl.to(v.body, { rotation: rot + 0.1, duration: sec(70), ease: 'sine.inOut' });
          tl.to(v.body, { rotation: rot - 0.08, duration: sec(80), ease: 'sine.inOut' });
          tl.to(v.body, { rotation: rot, duration: sec(70), ease: 'sine.inOut' });
          sfx('rout');
          break;
        }
        case 'UnitDestroyed':
        case 'UnitFled': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          tl.to(v, { alpha: 0, duration: r ? fade : sec(MOTION.impact), ease: EASE.in });
          tl.add(() => v.update({ visible: false }));
          sfx('rout');
          break;
        }
        case 'UnitHealed': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          const amount = e.amount;
          tl.add(() => {
            v.update({ strength: Math.min(100, v.look.strength + amount) });
            this.floatText(v.look, `+${amount}`, 0x2e7d32);
          });
          break;
        }
        case 'SkillUsed': {
          const v = this.views.get(e.unitId);
          const name = e.name;
          tl.add(() => {
            if (v) this.floatText(v.look, name, THEME.select);
          });
          if (!r) tl.to({}, { duration: sec(500) });
          break;
        }
        case 'MeleePhase':
          if (!r) tl.to({}, { duration: sec(150) });
          break;
        default:
          break;
      }
    }
    this.playing = tl;
    track(tl);
    // AI playback speed: 1×, 2×, or skip (Infinity).
    if (Number.isFinite(this.speed)) tl.timeScale(this.speed).play();
    else tl.progress(1, false);
    await done(tl);
    if (this.playing === tl) this.playing = null;
    temp.destroy();
    this.sync(final);
  }
}
