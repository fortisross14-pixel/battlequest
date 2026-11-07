/**
 * Layout manager (UX_PRESENTATION §1): HUD elements register their rectangles, and the
 * battlefield camera fits the map into the play area that is left. Nothing floats over the
 * map at its default zoom, except things attached to a unit (the command bubble).
 */

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Gap kept between the HUD and the map edge. */
const GAP = 6;

const toRect = (r: DOMRect): Rect => ({ x: r.left, y: r.top, w: r.width, h: r.height });

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export class Layout {
  private els = new Map<string, HTMLElement>();
  private listeners = new Set<() => void>();
  private observer =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.changed()) : null;
  private pending = false;

  /** Reserves the space an element covers (while it is visible). */
  register(name: string, el: HTMLElement): void {
    this.unregister(name);
    this.els.set(name, el);
    this.observer?.observe(el);
    this.changed();
  }

  unregister(name: string): void {
    const el = this.els.get(name);
    if (!el) return;
    this.observer?.unobserve(el);
    this.els.delete(name);
    this.changed();
  }

  /** Calls `fn` (once per frame at most) when any registered rectangle may have changed. */
  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Call after showing, hiding or resizing a HUD element by other means. */
  changed(): void {
    if (this.pending) return;
    this.pending = true;
    const run = () => {
      this.pending = false;
      for (const fn of this.listeners) fn();
    };
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(run);
    else run();
  }

  /** The visible registered rectangles, by name. */
  rects(): { name: string; rect: Rect }[] {
    const out: { name: string; rect: Rect }[] = [];
    for (const [name, el] of this.els) {
      if (!el.isConnected) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      out.push({ name, rect: toRect(r) });
    }
    return out;
  }

  /**
   * Insets of the play area inside `area` (the canvas): each HUD rectangle is pushed to the
   * edge that costs the least space (a top bar to the top, phone side columns to the sides).
   */
  insets(area: Rect): Insets {
    return computeInsets(
      area,
      this.rects().map((r) => r.rect),
    );
  }

  /** Names of the registered rectangles a screen rectangle overlaps. */
  hits(r: Rect): string[] {
    return this.rects()
      .filter((x) => overlaps(x.rect, r))
      .map((x) => x.name);
  }
}

/** Pure part of `insets`, for any list of HUD rectangles. */
export function computeInsets(area: Rect, huds: Rect[]): Insets {
  const ins: Insets = { top: 0, bottom: 0, left: 0, right: 0 };
  for (const h of huds) {
    if (!overlaps(h, area)) continue;
    const cost = {
      top: (h.y + h.h - area.y) * area.w,
      bottom: (area.y + area.h - h.y) * area.w,
      left: (h.x + h.w - area.x) * area.h,
      right: (area.x + area.w - h.x) * area.h,
    };
    const side = (Object.keys(cost) as (keyof Insets)[]).reduce((a, b) =>
      cost[a] <= cost[b] ? a : b,
    );
    const need =
      side === 'top'
        ? h.y + h.h - area.y
        : side === 'bottom'
          ? area.y + area.h - h.y
          : side === 'left'
            ? h.x + h.w - area.x
            : area.x + area.w - h.x;
    ins[side] = Math.max(ins[side], Math.ceil(need + GAP));
  }
  return ins;
}

/** The battle screen's layout (one battle at a time). */
export const layout = new Layout();
