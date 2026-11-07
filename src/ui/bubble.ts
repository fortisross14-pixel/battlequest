import { el } from './hud';
import { layout, overlaps, type Rect } from './layout';
import { EASE, gsap, MOTION, reducedMotion, sec, sfx } from './motion';

/**
 * The command bubble (UX_PRESENTATION §2): tapping your unit blooms a disc on it and petals
 * on a ring around it. Petals keep fixed clock positions for muscle memory; near an edge
 * the whole ring rotates (keeping the order) so every petal stays on screen and off the
 * HUD. Moving needs no petal: it is the default tap on a reachable square.
 */
export type PetalId = 'info' | 'act' | 'turn' | 'hold' | 'signature' | 'skill' | 'undo';

export interface Petal {
  id: PetalId;
  icon: string;
  label: string;
  enabled: boolean;
  /** Why it is greyed out (shown on long-press and to screen readers). */
  reason?: string;
  /** A small badge: an MP cost, charges left or a cooldown. */
  badge?: string;
  run: () => void;
}

/** Clock positions in degrees, clockwise from 12 o'clock. */
export const PETAL_ANGLE: Record<PetalId, number> = {
  info: 0,
  act: 45,
  turn: 90,
  hold: 180,
  signature: 225,
  skill: 270,
  undo: 315,
};

/** Importance order for the bloom (Info first). */
const ORDER: PetalId[] = ['info', 'act', 'hold', 'turn', 'skill', 'signature', 'undo'];

const RADIUS = 66;
const PETAL = 48;

/**
 * The group rotation (degrees) that keeps every petal on screen and off the HUD, trying the
 * smallest rotations first. Pure, for any centre, screen and HUD rectangles.
 */
export function bubbleRotation(
  centre: { x: number; y: number },
  angles: number[],
  screen: { w: number; h: number },
  huds: Rect[],
  radius = RADIUS,
): number {
  const tries = [0];
  for (let d = 15; d <= 180; d += 15) tries.push(d, -d);
  let best = 0;
  let bestBad = Infinity;
  for (const rot of tries) {
    let bad = 0;
    for (const a of angles) {
      const rad = ((a + rot) * Math.PI) / 180;
      const x = centre.x + Math.sin(rad) * radius - PETAL / 2;
      const y = centre.y - Math.cos(rad) * radius - PETAL / 2;
      const r = { x, y, w: PETAL, h: PETAL };
      if (x < 4 || y < 4 || x + PETAL > screen.w - 4 || y + PETAL > screen.h - 4) bad += 2;
      if (huds.some((h) => overlaps(h, r))) bad += 1;
    }
    if (bad < bestBad) {
      bestBad = bad;
      best = rot;
      if (bad === 0) break;
    }
  }
  return best;
}

export class Bubble {
  private root = el('div', { class: 'bubble hidden', role: 'menu', 'aria-label': 'Unit commands' });
  private disc = el('div', { class: 'bubble-disc' });
  private petals: { id: PetalId; btn: HTMLButtonElement; angle: number }[] = [];
  private rotation = 0;
  private at = { x: 0, y: 0 };
  private anim: gsap.core.Timeline | null = null;
  private openState = false;
  /** When the bubble opened: the tap that selected the unit must not also press a petal. */
  private openedAt = 0;
  /** Extra screen rectangles the petals keep off (e.g. what a tutorial step points at). */
  private avoid: Rect[] = [];

  constructor(host: HTMLElement) {
    this.root.append(this.disc);
    host.append(this.root);
    this.warmUp(host);
  }

  /**
   * Lays out one invisible petal when the battle loads, so the first selection doesn't pay
   * for the first style pass and font shaping (a visible hitch on slow phones).
   */
  private warmUp(host: HTMLElement): void {
    const probe = el(
      'div',
      { class: 'bubble', 'aria-hidden': 'true', style: 'visibility:hidden;left:-999px;top:-999px' },
      el(
        'button',
        { class: 'petal info', type: 'button', tabindex: '-1' },
        el('span', { class: 'petal-icon' }, 'ⓘ'),
        el('small', { class: 'petal-badge' }, '1'),
        el('span', { class: 'petal-label show' }, 'Info · Hold · Turn'),
      ),
    );
    host.append(probe);
    const done = () => {
      void probe.getBoundingClientRect();
      probe.remove();
    };
    if (typeof requestIdleCallback !== 'undefined') requestIdleCallback(done, { timeout: 600 });
    else window.setTimeout(done, 50);
  }

  get isOpen(): boolean {
    return this.openState;
  }

  /** Opens the bubble at a screen point (the unit's centre). */
  open(at: { x: number; y: number }, petals: Petal[], avoid: Rect[] = []): void {
    this.avoid = avoid;
    this.anim?.progress(1);
    this.at = at;
    this.openState = true;
    this.openedAt = performance.now();
    for (const p of this.petals) p.btn.remove();
    this.petals = petals.map((p) => {
      const btn = el(
        'button',
        {
          class: `petal ${p.id} ${p.enabled ? '' : 'off'}`,
          type: 'button',
          role: 'menuitem',
          'aria-label': p.enabled ? p.label : `${p.label}: ${p.reason ?? 'not now'}`,
          title: p.enabled ? p.label : `${p.label}: ${p.reason ?? 'not now'}`,
        },
        el('span', { class: 'petal-icon' }, p.icon),
        p.badge ? el('small', { class: 'petal-badge' }, p.badge) : '',
        el('span', { class: 'petal-label' }, p.label),
      );
      btn.setAttribute('aria-disabled', String(!p.enabled));
      // A petal acts on a press that began on it (or the keyboard), never on the tap that
      // selected the unit: its click can land on a petal still flying out of the centre.
      let pressed = false;
      btn.onpointerdown = (e) => {
        e.stopPropagation();
        pressed = performance.now() - this.openedAt >= MOTION.bubbleUsable;
      };
      btn.onclick = (e) => {
        e.stopPropagation();
        const keyboard = e.detail === 0;
        if (!pressed && !keyboard) return;
        pressed = false;
        if (!p.enabled) {
          btn.classList.add('show-label');
          window.setTimeout(() => btn.classList.remove('show-label'), 1400);
          return;
        }
        p.run();
      };
      this.root.append(btn);
      return { id: p.id, btn, angle: PETAL_ANGLE[p.id] };
    });
    this.root.classList.remove('hidden');
    this.place();
    this.bloom();
  }

  /** New rectangles to keep off (the tutorial moved on): the ring re-places itself. */
  setAvoid(avoid: Rect[]): void {
    this.avoid = avoid;
    if (this.openState) this.place();
  }

  /** Follows the unit when the camera moves. */
  moveTo(at: { x: number; y: number }): void {
    if (!this.openState) return;
    this.at = at;
    this.place();
  }

  private place(): void {
    this.rotation = bubbleRotation(
      this.at,
      this.petals.map((p) => p.angle),
      { w: window.innerWidth, h: window.innerHeight },
      [...layout.rects().map((r) => r.rect), ...this.avoid],
    );
    this.root.style.transform = `translate(${this.at.x}px, ${this.at.y}px)`;
    for (const p of this.petals) {
      const rad = ((p.angle + this.rotation) * Math.PI) / 180;
      p.btn.style.left = `${Math.sin(rad) * RADIUS - PETAL / 2}px`;
      p.btn.style.top = `${-Math.cos(rad) * RADIUS - PETAL / 2}px`;
      // Labels sit outside the ring, on the petal's side.
      p.btn.dataset.side = Math.sin(rad) < -0.3 ? 'left' : Math.sin(rad) > 0.3 ? 'right' : 'mid';
    }
  }

  /**
   * The bloom (UX §3): the disc presses in, petals fly out along their angles in importance
   * order with a varied stagger, overshoot slightly and settle. Petals are tappable at once.
   */
  private bloom(): void {
    sfx('bubble-open');
    if (reducedMotion()) {
      this.anim = gsap
        .timeline()
        .fromTo(this.root, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.reducedFade) });
      return;
    }
    const tl = gsap.timeline();
    tl.fromTo(
      this.disc,
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: sec(MOTION.quick), ease: EASE.back },
      0,
    );
    const ordered = [...this.petals].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
    // Varied, never uniform: 25–40 ms between petals.
    const gaps = [0, 0.028, 0.035, 0.026, 0.038, 0.031];
    let t = 0.02;
    ordered.forEach((p, i) => {
      t += gaps[i] ?? 0.03;
      const rad = ((p.angle + this.rotation) * Math.PI) / 180;
      tl.fromTo(
        p.btn,
        { x: -Math.sin(rad) * RADIUS, y: Math.cos(rad) * RADIUS, scale: 0.4, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: sec(320), ease: 'back.out(1.8)' },
        t,
      );
    });
    // Labels fade in last; the whole bloom lands at about the bubble token.
    tl.fromTo(
      this.petals.map((p) => p.btn.querySelector('.petal-label')),
      { opacity: 0 },
      { opacity: 1, duration: sec(MOTION.quick), ease: EASE.out },
      sec(MOTION.bubble - MOTION.quick),
    );
    this.anim = tl;
  }

  /** Folds the petals away (faster than the bloom). */
  close(): void {
    if (!this.openState) return;
    this.openState = false;
    this.anim?.progress(1);
    sfx('bubble-close');
    const done = () => {
      this.root.classList.add('hidden');
      for (const p of this.petals) p.btn.remove();
      this.petals = [];
    };
    if (reducedMotion()) {
      done();
      return;
    }
    const tl = gsap.timeline({ onComplete: done });
    for (const p of this.petals) {
      const rad = ((p.angle + this.rotation) * Math.PI) / 180;
      tl.to(
        p.btn,
        {
          x: -Math.sin(rad) * RADIUS,
          y: Math.cos(rad) * RADIUS,
          scale: 0.4,
          opacity: 0,
          duration: sec(MOTION.bubbleClose - 50),
          ease: EASE.in,
        },
        0,
      );
    }
    tl.to(
      this.disc,
      { scale: 0.6, opacity: 0, duration: sec(MOTION.bubbleClose), ease: EASE.in },
      0,
    );
    this.anim = tl;
  }

  destroy(): void {
    this.anim?.kill();
    this.root.remove();
  }
}
