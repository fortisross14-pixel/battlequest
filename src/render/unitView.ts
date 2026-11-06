import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { Cohesion, type Dir, type Side, type Unit, type UnitSymbol } from '../core/types';
import { BADGE_ASPECT, badgeTexture } from './badgeTextures';
import { hatch } from './draw';
import { CELL, THEME } from './theme';

/** What a unit block shows. The animator updates it event by event. */
export interface UnitLook {
  side: Side;
  symbol: UnitSymbol;
  x: number;
  y: number;
  facing: Dir;
  strength: number;
  cohesion: Cohesion;
  /** False once destroyed or fled. */
  visible: boolean;
  /** Own unit with nothing left to do this turn. */
  spent: boolean;
  /** General's pennant label, e.g. "LEONIDAS". */
  pennant: string | null;
  /** Troop level (chevrons on the block). */
  level: number;
}

export function lookOf(u: Unit, spent: boolean, pennant: string | null = null): UnitLook {
  return {
    side: u.side,
    symbol: u.type.symbol,
    x: u.x,
    y: u.y,
    facing: u.facing,
    strength: u.strength,
    cohesion: u.cohesion,
    visible: u.status === 'active',
    spent,
    pennant,
    level: u.type.level ?? 1,
  };
}

/** Wide blocks, long side = front (GAME_DESIGN 10). */
export const BLOCK_W = CELL * 0.8;
export const BLOCK_H = CELL * 0.45;

export function facingRotation(f: Dir): number {
  return (f * Math.PI) / 4;
}

/** Badge size on the board: 60% of a square wide, drawn upright on the block. */
export const BADGE_W = CELL * 0.6;

export class UnitView extends Container {
  readonly body = new Container();
  private block = new Graphics();
  private overlay = new Graphics();
  private badge = new Sprite();
  private badgeKey = '';
  private flag = new Graphics();
  private flagText = new Text({
    text: '',
    style: { fontFamily: THEME.sans, fontSize: 10, fontWeight: '700', fill: 0xffffff },
  });
  look: UnitLook;

  constructor(look: UnitLook) {
    super();
    this.look = look;
    this.body.addChild(this.block);
    this.badge.anchor.set(0.5);
    this.badge.width = BADGE_W;
    this.badge.height = BADGE_W * BADGE_ASPECT;
    this.badge.position.set(0, -CELL * 0.04);
    this.addChild(this.body, this.badge, this.overlay, this.flag, this.flagText);
    this.redraw();
    this.snap();
  }

  /** Moves the container to the look's square and facing immediately. */
  snap(): void {
    this.position.set((this.look.x + 0.5) * CELL, (this.look.y + 0.5) * CELL);
    this.body.rotation = facingRotation(this.look.facing);
  }

  private setBadge(t: Sprite['texture']): void {
    this.badge.texture = t;
    this.badge.width = BADGE_W;
    this.badge.height = BADGE_W * BADGE_ASPECT;
  }

  update(look: Partial<UnitLook>): void {
    this.look = { ...this.look, ...look };
    this.redraw();
  }

  redraw(): void {
    const { side, cohesion, strength, symbol, spent } = this.look;
    const routed = cohesion === Cohesion.Routed;
    const color = THEME.side[side];
    const dark = THEME.sideDark[side];
    const b = this.block.clear();
    const x0 = -BLOCK_W / 2;
    const y0 = -BLOCK_H / 2;

    if (routed) {
      // Hollow block: outline only, like the white blocks on the Waterloo map.
      b.rect(x0, y0, BLOCK_W, BLOCK_H)
        .fill({ color: 0xffffff, alpha: 0.35 })
        .stroke({ width: 2, color, alpha: 0.9 });
      b.moveTo(x0, y0)
        .lineTo(x0 + BLOCK_W, y0)
        .stroke({ width: 4, color, alpha: 0.9 });
    } else {
      b.rect(x0, y0, BLOCK_W, BLOCK_H).fill(color);
      if (cohesion >= Cohesion.Disrupted) {
        const heavy = cohesion === Cohesion.Fragmented;
        hatch(b, BLOCK_W, BLOCK_H, heavy ? 6 : 9, heavy);
        b.stroke({
          width: heavy ? 2 : 1.5,
          color: THEME.sideLight[side],
          alpha: heavy ? 0.75 : 0.6,
        });
      }
      b.rect(x0, y0, BLOCK_W, BLOCK_H).stroke({ width: 1.5, color: dark });
      // The front edge is thicker so facing reads at a glance.
      b.moveTo(x0 - 1, y0 + 1)
        .lineTo(x0 + BLOCK_W + 1, y0 + 1)
        .stroke({ width: 7, color: dark, cap: 'square' });
    }
    // The troop badge: upright, on the block (GAME_DESIGN 10). Routed units get a pale one.
    const want = `${symbol}|${side}|${this.look.level}|${routed}`;
    if (want !== this.badgeKey) {
      this.badgeKey = want;
      this.setBadge(
        badgeTexture(symbol, side, this.look.level, routed, (t) => {
          if (this.badgeKey === want) this.setBadge(t);
        }),
      );
    }

    // Strength bar and cohesion pip, always upright under the block.
    const o = this.overlay.clear();
    const barW = CELL * 0.62;
    const barY = CELL * 0.37;
    const barH = 7;
    o.roundRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2, 3).fill({
      color: THEME.ink,
      alpha: 0.6,
    });
    o.rect(-barW / 2, barY, (barW * Math.max(0, strength)) / 100, barH).fill(
      strength > 50 ? 0xf3ead2 : strength > 25 ? 0xf0c36a : 0xe0704f,
    );
    o.circle(barW / 2 + 9, barY + barH / 2, 7.5)
      .fill(THEME.cohesion[cohesion])
      .stroke({ width: 1.5, color: THEME.ink, alpha: 0.8 });

    // The general's pennant: a small flag with the name above the block (GAME_DESIGN 10).
    const f = this.flag.clear();
    this.flagText.visible = !!this.look.pennant;
    if (this.look.pennant) {
      this.flagText.text = this.look.pennant;
      const w = this.flagText.width + 8;
      const top = -CELL * 0.62;
      const px = -CELL * 0.36;
      f.moveTo(px, top)
        .lineTo(px, -CELL * 0.18)
        .stroke({ width: 2, color: THEME.ink });
      f.poly([px, top, px + w, top, px + w - 4, top + 7, px + w, top + 14, px, top + 14]).fill(
        THEME.sideDark[side],
      );
      f.poly([px, top, px + w, top, px + w - 4, top + 7, px + w, top + 14, px, top + 14]).stroke({
        width: 1,
        color: THEME.ink,
        alpha: 0.7,
      });
      this.flagText.position.set(px + 3, top + 1);
    }

    this.alpha = !this.look.visible ? 0 : routed ? 0.75 : spent ? 0.72 : 1;
  }
}
