import { Application, Container, Graphics, Text } from 'pixi.js';
import type { GameEvent } from '../core/events';
import { DIR_VECTORS } from '../core/geometry';
import { isEngaged } from '../core/state';
import type { BattleState, Dir, Pos, Side, Unit } from '../core/types';
import { arrow, dashed } from './draw';
import { buildGrid, buildTerrainLayer } from './terrainLayer';
import { CELL, THEME } from './theme';
import { facingRotation, lookOf, UnitView } from './unitView';

export interface Highlights {
  selected: Pos | null;
  reach: { pos: Pos; kind: 'move' | 'pullBack' | 'sidestep' }[];
  charge: Pos[];
  shoot: Pos[];
  /** Valid targets for a general's skill. */
  skill?: Pos[];
}

export interface RingHandle {
  dir: Dir;
  enabled: boolean;
}

const centre = (p: Pos): Pos => ({ x: (p.x + 0.5) * CELL, y: (p.y + 0.5) * CELL });
const shortestAngle = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};
const ease = (t: number) => 1 - (1 - t) * (1 - t);

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
  private effects = new Container();
  private views = new Map<string, UnitView>();
  private ring: { at: Pos; handles: RingHandle[] } | null = null;
  private mapSize = { w: 0, h: 0 };
  /** Screen padding kept free for the HUD (top bar, bottom buttons). */
  padding = { top: 56, bottom: 72, left: 12, right: 12 };
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
      this.ringLayer,
      this.effects,
    );
    this.mapSize = { w: state.map.width * CELL, h: state.map.height * CELL };
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

  private viewport() {
    const { width, height } = this.app.screen;
    const p = this.padding;
    return { x: p.left, y: p.top, w: width - p.left - p.right, h: height - p.top - p.bottom };
  }

  /** Fits the map, but never below the zoom where a square is 44 px (touch target). */
  fit(focus?: Pos): void {
    const vp = this.viewport();
    const fitZoom = Math.min(vp.w / this.mapSize.w, vp.h / this.mapSize.h);
    const z = Math.max(fitZoom, 44 / CELL);
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
    if (h.selected) {
      const p = h.selected;
      g.rect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2).stroke({
        width: 3,
        color: THEME.select,
      });
    }
  }

  /** A translucent copy of the unit at its destination, with its path as a battle-map arrow. */
  showGhost(u: Unit, path: Pos[], facing: Dir): void {
    this.clearGhost();
    const g = new Graphics();
    arrow(g, path.map(centre), CELL * 0.22, THEME.side[u.side], 0.32);
    const dest = path[path.length - 1]!;
    const ghost = new UnitView({ ...lookOf(u, false), x: dest.x, y: dest.y, facing });
    ghost.alpha = 0.55;
    this.ghostLayer.addChild(g, ghost);
  }

  clearGhost(): void {
    this.ghostLayer.removeChildren().forEach((c) => c.destroy());
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

  // ---------- Animation ----------

  private tween(ms: number, fn: (t: number) => void): Promise<void> {
    const dur = this.reducedMotion ? 0 : ms / this.speed;
    if (dur <= 0) {
      fn(1);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let elapsed = 0;
      const tick = () => {
        elapsed += this.app.ticker.deltaMS;
        const t = Math.min(1, elapsed / dur);
        fn(t);
        if (t >= 1) {
          this.app.ticker.remove(tick);
          resolve();
        }
      };
      this.app.ticker.add(tick);
    });
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
    void this.tween(900, (k) => {
      t.y = c.y - 10 - 34 * ease(k);
      t.alpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    }).then(() => t.destroy());
  }

  private async slide(v: UnitView, path: Pos[], turn: boolean): Promise<void> {
    for (let i = 1; i < path.length; i++) {
      const a = centre(path[i - 1]!);
      const b = centre(path[i]!);
      const fromRot = v.body.rotation;
      const toRot = turn ? Math.atan2(b.x - a.x, -(b.y - a.y)) : fromRot;
      const dRot = shortestAngle(fromRot, toRot);
      await this.tween(130, (t) => {
        const k = ease(t);
        v.position.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
        v.body.rotation = fromRot + dRot * Math.min(1, k * 2);
      });
    }
  }

  private rotateTo(v: UnitView, f: Dir, ms = 160): Promise<void> {
    const from = v.body.rotation;
    const d = shortestAngle(from, facingRotation(f));
    return this.tween(ms, (t) => (v.body.rotation = from + d * ease(t)));
  }

  /** Plays core events as short tweens, then snaps to the final state. */
  async play(events: GameEvent[], final: BattleState): Promise<void> {
    const temp = new Graphics();
    this.effects.addChild(temp);
    for (const e of events) {
      switch (e.type) {
        case 'UnitMoved': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          const turn = e.kind === 'move' || e.kind === 'rout' || e.kind === 'pursuit';
          await this.slide(v, e.path, turn);
          const end = e.path[e.path.length - 1]!;
          v.look = { ...v.look, x: end.x, y: end.y, facing: e.facing };
          await this.rotateTo(v, e.facing, 100);
          break;
        }
        case 'UnitRotated': {
          const v = this.views.get(e.unitId);
          if (v) await this.rotateTo(v, e.to);
          break;
        }
        case 'ChargeDeclared':
          arrow(
            temp,
            e.path.length > 1
              ? e.path.map(centre)
              : [centre(e.path[0]!), centre(this.views.get(e.targetId)!.look)],
            CELL * 0.26,
            THEME.charge,
            0.35,
          );
          break;
        case 'ShotFired': {
          const a = this.views.get(e.unitId)?.look;
          const b = this.views.get(e.targetId)?.look;
          if (!a || !b) break;
          const line = new Graphics();
          dashed(line, centre(a), centre(b), 8, 6);
          line.stroke({ width: 2.5, color: THEME.ink, alpha: 0.7 });
          this.effects.addChild(line);
          await this.tween(260, (t) => (line.alpha = 1 - t * 0.3));
          line.destroy();
          break;
        }
        case 'DamageDealt': {
          const v = this.views.get(e.targetId);
          if (!v) break;
          v.update({ strength: Math.max(0, v.look.strength - e.amount) });
          this.floatText(v.look, `−${e.amount}`, THEME.damage);
          const base = { x: v.x, y: v.y };
          await this.tween(200, (t) => {
            const amp = 4 * (1 - t);
            v.position.set(base.x + Math.sin(t * 40) * amp, base.y + Math.cos(t * 33) * amp * 0.5);
          });
          v.position.set(base.x, base.y);
          break;
        }
        case 'CohesionChanged':
        case 'UnitRallied': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          v.update({ cohesion: e.to });
          await this.tween(260, (t) => v.scale.set(1 + 0.12 * Math.sin(t * Math.PI)));
          v.scale.set(1);
          break;
        }
        case 'UnitDestroyed':
        case 'UnitFled': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          const a0 = v.alpha;
          await this.tween(320, (t) => (v.alpha = a0 * (1 - t)));
          v.update({ visible: false });
          break;
        }
        case 'UnitHealed': {
          const v = this.views.get(e.unitId);
          if (!v) break;
          v.update({ strength: Math.min(100, v.look.strength + e.amount) });
          this.floatText(v.look, `+${e.amount}`, 0x2e7d32);
          break;
        }
        case 'SkillUsed': {
          const v = this.views.get(e.unitId);
          if (v) this.floatText(v.look, e.name, THEME.select);
          await this.tween(500, () => {});
          break;
        }
        case 'MeleePhase':
          await this.tween(150, () => {});
          break;
        default:
          break;
      }
    }
    temp.destroy();
    this.sync(final);
  }
}

/** An own-side unit with nothing left to do this turn (drawn slightly faded). */
export function isSpent(state: BattleState, u: Unit): boolean {
  if (u.side !== state.activeSide) return false;
  return (u.hasActed && u.mpLeft <= 0) || isEngaged(state, u.id);
}
