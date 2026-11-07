import { GENERAL_BY_ID } from '../content/generals';
import type { PackCard } from '../meta/shop';
import { el } from './hud';
import {
  EASE,
  fastForward,
  gsap,
  haptic,
  MOTION,
  reducedMotion,
  sec,
  sfx,
  SplitText,
  track,
} from './motion';
import { cardView } from './screens/troopCard';

/**
 * Ceremonies (motion skill recipes): pack openings, hero (general) reveals, victory and
 * defeat, the battle title card and the campaign unlock moments. Each one is an overlay
 * driven by GSAP timelines: a tap fast-forwards the current step, Skip (after 600 ms)
 * jumps to the end, and Reduce motion turns the movement into short fades. Nothing here
 * changes game state: the result is already final when a ceremony starts.
 */

export interface Ceremony {
  /** Resolves when the player closes it. */
  done: Promise<void>;
  /** Jumps to the end state. */
  skip(): void;
}

const SKIP_AFTER = 600;

/** An overlay with a Skip button that appears after 600 ms. */
function overlay(cls: string, label: string) {
  const root = el('div', { class: `ceremony ${cls}`, role: 'dialog', 'aria-label': label });
  const skipBtn = el('button', { class: 'btn small ceremony-skip', type: 'button' }, 'Skip');
  skipBtn.style.opacity = '0';
  skipBtn.style.pointerEvents = 'none';
  root.append(skipBtn);
  document.body.append(root);
  const showSkip = gsap.delayedCall(sec(SKIP_AFTER), () => {
    skipBtn.style.pointerEvents = 'auto';
    gsap.to(skipBtn, { opacity: 1, duration: sec(MOTION.quick) });
  });
  let resolve: () => void = () => {};
  const done = new Promise<void>((r) => (resolve = r));
  const close = () => {
    showSkip.kill();
    if (reducedMotion()) {
      root.remove();
      resolve();
      return;
    }
    gsap.to(root, {
      opacity: 0,
      duration: sec(MOTION.quick + 60),
      ease: EASE.in,
      onComplete: () => {
        root.remove();
        resolve();
      },
    });
  };
  const hideSkip = () => {
    showSkip.kill();
    skipBtn.remove();
  };
  if (reducedMotion()) {
    gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.reducedFade) });
  } else {
    gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.quick), ease: EASE.out });
  }
  return { root, skipBtn, done, close, hideSkip };
}

/** A primary button that fades in at the end of a ceremony. */
function continueButton(label: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', { class: 'btn primary ceremony-continue', type: 'button' }, label);
  b.onclick = (e) => {
    e.stopPropagation();
    onClick();
  };
  if (!reducedMotion()) {
    gsap.fromTo(
      b,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: sec(MOTION.quick), ease: EASE.out },
    );
  }
  return b;
}

// ---------- Shared pieces (also for the age map) ----------

/** A wax seal: a disc with an embossed ring and a glyph, made of 4 shards that can crack. */
export function waxSeal(glyph: string, cls = ''): HTMLElement {
  const seal = el('div', { class: `wax-seal ${cls}`, 'aria-hidden': 'true' });
  for (let i = 0; i < 4; i++) {
    seal.append(el('span', { class: `shard s${i}` }, el('b', {}, glyph)));
  }
  return seal;
}

/** Cracks a wax seal: its four shards fly apart, turn and fall. */
export function crackSeal(seal: HTMLElement, tl = gsap.timeline()): gsap.core.Timeline {
  const shards = [...seal.querySelectorAll<HTMLElement>('.shard')];
  const dirs = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const;
  tl.add(() => sfx('seal-break'));
  tl.to(seal, { scale: 0.92, duration: sec(70), ease: EASE.in });
  shards.forEach((s, i) => {
    const [dx, dy] = dirs[i]!;
    tl.to(
      s,
      {
        x: dx * (26 + i * 5),
        y: dy * 22 + 40,
        rotation: dx * (18 + i * 9),
        opacity: 0,
        duration: sec(MOTION.reveal),
        ease: EASE.out,
      },
      `<${i === 0 ? '' : '+=0.012'}`,
    );
  });
  return tl;
}

/** A lock shakes, then cracks in two and falls away (a battle unlocked). */
export function crackLock(lock: HTMLElement, tl = gsap.timeline()): gsap.core.Timeline {
  tl.to(lock, { rotation: 8, duration: sec(60), ease: 'sine.inOut' })
    .to(lock, { rotation: -8, duration: sec(70), ease: 'sine.inOut' })
    .to(lock, { rotation: 5, duration: sec(60), ease: 'sine.inOut' })
    .to(lock, { rotation: 0, duration: sec(60), ease: 'sine.inOut' })
    .add(() => sfx('unlock'))
    .to(lock, { y: 26, rotation: 24, opacity: 0, duration: sec(MOTION.impact), ease: EASE.in });
  return tl;
}

/** Draws an SVG path on, like ink from a quill (DrawSVG). */
export function drawOn(path: SVGElement, tl = gsap.timeline(), ms = 600): gsap.core.Timeline {
  tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: sec(ms), ease: EASE.inOut });
  return tl;
}

/** Stamps stars in one after another with the back ease. */
export function stampIn(els: Element[], tl = gsap.timeline(), gap = 140): gsap.core.Timeline {
  els.forEach((s, i) => {
    tl.fromTo(
      s,
      { scale: 1.8, opacity: 0, rotation: -12 },
      { scale: 1, opacity: 1, rotation: 0, duration: sec(MOTION.impact), ease: EASE.back },
      i === 0 ? '>' : `>-${sec(MOTION.impact - gap)}`,
    );
    tl.add(() => sfx('stamp'), '<');
  });
  return tl;
}

/** A single soft glint sweeping across an element (it needs `position: relative`). */
export function glint(target: HTMLElement, tl = gsap.timeline(), cls = ''): gsap.core.Timeline {
  const g = el('span', { class: `glint-sweep ${cls}`, 'aria-hidden': 'true' });
  target.append(g);
  tl.fromTo(
    g,
    { xPercent: -120, opacity: 1 },
    {
      xPercent: 120,
      duration: sec(MOTION.reveal + 150),
      ease: EASE.inOut,
      onComplete: () => g.remove(),
    },
  );
  return tl;
}

/** Rolls a number to its value (number tickers, UX §4). */
function ticker(
  node: HTMLElement,
  from: number,
  to: number,
  ms: number,
  tl: gsap.core.Timeline,
  at?: string | number,
) {
  const o = { v: from };
  node.textContent = String(from);
  tl.to(
    o,
    {
      v: to,
      duration: sec(ms),
      ease: EASE.out,
      onUpdate: () => (node.textContent = String(Math.round(o.v))),
      onComplete: () => (node.textContent = String(to)),
    },
    at,
  );
}

// ---------- Cards ----------

const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 } as const;

interface FlipCard {
  el: HTMLElement;
  inner: HTMLElement;
  card: PackCard;
  flipped: boolean;
  flip: (instant?: boolean) => gsap.core.Timeline | null;
}

function badgeFor(c: PackCard, upgradeReady: (c: PackCard) => boolean): HTMLElement | '' {
  if (c.isNew) return el('span', { class: 'ribbon new' }, 'NEW');
  if (c.kind === 'unit' && upgradeReady(c)) {
    return el('span', { class: 'ribbon upgrade' }, 'Upgrade ready');
  }
  return '';
}

/** A face-down card that flips (3D rotateY, 450 ms, scale 1 → 1.08 → 1). */
function flipCard(c: PackCard, upgradeReady: (c: PackCard) => boolean, hero = false): FlipCard {
  const front = el('div', { class: 'face front' }, cardView(c));
  const back = el(
    'div',
    { class: 'face back' },
    waxSeal('⚔', 'small'),
    el('span', { class: 'edge', 'aria-hidden': 'true' }),
  );
  const inner = el('div', { class: 'pcard-inner' }, back, front);
  const root = el(
    'button',
    {
      class: `pcard ${c.rarity} ${hero ? 'hero' : ''}`,
      type: 'button',
      'aria-label': 'Face-down card: tap to reveal',
    },
    inner,
  );
  const fc: FlipCard = {
    el: root,
    inner,
    card: c,
    flipped: false,
    flip: (instant = false) => {
      if (fc.flipped) return null;
      fc.flipped = true;
      const name =
        c.kind === 'unit' ? front.querySelector('b')?.textContent : GENERAL_BY_ID[c.id]?.name;
      root.setAttribute('aria-label', `${name ?? 'Card'}, ${c.rarity}${c.isNew ? ', new' : ''}`);
      const badge = badgeFor(c, upgradeReady);
      if (badge) front.append(badge);
      if (instant || reducedMotion()) {
        gsap.set(inner, { rotationY: 180 });
        if (reducedMotion() && !instant) {
          gsap.fromTo(front, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.reducedFade) });
        }
        return null;
      }
      const tl = gsap.timeline();
      tl.to(inner, { rotationY: 180, duration: sec(MOTION.reveal), ease: EASE.inOut }, 0);
      tl.to(root, { scale: 1.08, duration: sec(MOTION.reveal / 2), ease: EASE.out }, 0);
      tl.to(
        root,
        { scale: 1, duration: sec(MOTION.reveal / 2), ease: EASE.in },
        sec(MOTION.reveal / 2),
      );
      // The reveal: a stamp ring; a gold-foil glint for Legendary.
      const ring = el('span', { class: 'stamp-ring', 'aria-hidden': 'true' });
      root.append(ring);
      tl.fromTo(
        ring,
        { scale: 0.97, opacity: 0.8 },
        {
          scale: 1.18,
          opacity: 0,
          duration: sec(MOTION.reveal),
          ease: EASE.out,
          onComplete: () => ring.remove(),
        },
        sec(MOTION.reveal * 0.8),
      );
      if (c.rarity === 'legendary') glint(front, tl, 'foil');
      if (hero) {
        // Hero cards: the portrait medallion presses in like a seal, the name writes on.
        const medal = front.querySelector('.medallion');
        const nameEl = front.querySelector('b');
        if (medal) {
          tl.fromTo(
            medal,
            { scale: 1.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: sec(MOTION.impact), ease: EASE.back },
            sec(MOTION.reveal * 0.7),
          );
        }
        if (nameEl) {
          const split = new SplitText(nameEl, { type: 'chars' });
          tl.from(
            split.chars,
            { opacity: 0, y: 4, duration: sec(MOTION.quick), stagger: sec(28), ease: EASE.out },
            sec(MOTION.reveal * 0.85),
          );
        }
      }
      if (badge) {
        tl.fromTo(
          badge,
          { scale: 1.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: sec(MOTION.impact), ease: EASE.back },
          sec(MOTION.reveal),
        );
        if (badge.classList.contains('upgrade')) {
          tl.to(badge, {
            scale: 1.08,
            duration: sec(260),
            yoyo: true,
            repeat: 3,
            ease: 'sine.inOut',
          });
        }
      }
      tl.add(
        () => {
          sfx(c.rarity === 'legendary' ? 'reveal-legendary' : 'reveal');
          if (RARITY_ORDER[c.rarity] >= 3) haptic('medium');
        },
        sec(MOTION.reveal / 2),
      );
      return tl;
    },
  };
  return fc;
}

/**
 * Lays out face-down cards fanned into a row, with rarity anticipation (an edge glint in
 * the rarity colour; Epic and Legendary tremble) before they are flipped.
 */
function dealCards(
  row: HTMLElement,
  cards: FlipCard[],
  from: { x: number; y: number } | null,
  tl: gsap.core.Timeline,
  at: number | string = '>',
): void {
  row.append(...cards.map((c) => c.el));
  const n = cards.length;
  cards.forEach((c, i) => {
    const t = n > 1 ? i / (n - 1) - 0.5 : 0;
    const rot = t * 10;
    const lift = Math.abs(t) * 14;
    gsap.set(c.el, { rotation: rot, y: lift });
    if (reducedMotion()) return;
    const r = c.el.getBoundingClientRect();
    tl.from(
      c.el,
      {
        x: from ? from.x - (r.left + r.width / 2) : 0,
        y: from ? from.y - (r.top + r.height / 2) : 40,
        rotation: 0,
        scale: 0.55,
        opacity: 0,
        duration: sec(MOTION.reveal),
        ease: EASE.out,
      },
      i === 0 ? at : `<+=${sec(70)}`,
    );
  });
  // Anticipation, Rare and better.
  cards.forEach((c) => {
    const rank = RARITY_ORDER[c.card.rarity];
    if (rank < 2) return;
    const edge = c.el.querySelector('.edge');
    if (edge && !reducedMotion()) {
      tl.fromTo(edge, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.quick) }, '>-0.05');
      glint(c.el.querySelector('.back') as HTMLElement, tl, c.card.rarity);
    } else if (edge) {
      gsap.set(edge, { opacity: 1 });
    }
    if (rank >= 3 && !reducedMotion()) {
      const base = gsap.getProperty(c.el, 'rotation') as number;
      tl.to(c.el, {
        keyframes: [
          { rotation: base + 1.5, duration: sec(50) },
          { rotation: base - 1.5, duration: sec(70) },
          { rotation: base + 1.5, duration: sec(70) },
          { rotation: base - 1.5, duration: sec(70) },
          { rotation: base, duration: sec(50) },
        ],
        ease: 'sine.inOut',
      });
    }
  });
}

export interface PackOptions {
  title: string;
  /** "Upgrade ready" badges (troop cards that can level up now). */
  upgradeReady?: (c: PackCard) => boolean;
  /** Label of the closing button. */
  doneLabel?: string;
}

/**
 * Pack opening (motion skill): a sealed envelope breathes; tap breaks the wax seal, the
 * flap opens, cards fan out face down with rarity anticipation; tap a card (or Reveal all)
 * to flip it. General Packs reveal a larger hero card.
 */
export function packOpening(cards: PackCard[], opts: PackOptions): Ceremony {
  const o = overlay('pack-opening', opts.title);
  const upgradeReady = opts.upgradeReady ?? (() => false);
  const hero = cards.length === 1 && cards[0]!.kind === 'general';
  const seal = waxSeal('⚔');
  const flap = el('div', { class: 'env-flap' });
  const envelope = el(
    'button',
    { class: 'envelope', type: 'button', 'aria-label': 'Sealed pack: tap to open' },
    el('div', { class: 'env-body' }),
    flap,
    seal,
  );
  const title = el('h2', { class: 'ceremony-title' }, opts.title);
  const hint = el('p', { class: 'ceremony-hint' }, 'Tap the seal to open');
  const row = el('div', { class: `pcard-row ${hero ? 'hero-row' : ''}` });
  const actions = el('div', { class: 'ceremony-actions' });
  o.root.append(title, envelope, row, hint, actions);

  const flips = cards.map((c) => flipCard(c, upgradeReady, hero));
  let opened = false;
  let current: gsap.core.Timeline | null = null;
  const run = (tl: gsap.core.Timeline) => {
    current?.progress(1);
    current = track(tl);
    return tl;
  };
  const breathe = reducedMotion()
    ? null
    : gsap.to(envelope, { scale: 1.02, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  const finish = () => {
    if (actions.querySelector('.ceremony-continue')) return;
    o.hideSkip();
    hint.textContent = '';
    actions.replaceChildren(continueButton(opts.doneLabel ?? 'Continue', o.close));
  };
  const allFlipped = () => flips.every((f) => f.flipped);
  const revealAll = (instant = false) => {
    const tl = gsap.timeline();
    flips.forEach((f, i) => {
      const t = f.flip(instant);
      if (t) tl.add(t, i * sec(120));
    });
    run(tl);
    finish();
  };

  const open = (instant = false) => {
    if (opened) return;
    opened = true;
    breathe?.kill();
    const r = envelope.getBoundingClientRect();
    const from = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    hint.textContent = flips.length > 1 ? 'Tap a card to turn it' : 'Tap the card to turn it';
    const tl = gsap.timeline();
    if (!instant && !reducedMotion()) {
      // The seal cracks, the flap opens, and the cards slide out as the envelope drops away.
      crackSeal(seal, tl);
      tl.to(flap, { rotationX: 180, duration: sec(MOTION.impact), ease: EASE.inOut }, sec(90));
      tl.to(envelope, { y: 30, opacity: 0, duration: sec(MOTION.impact), ease: EASE.in }, sec(300));
      tl.add(() => envelope.classList.add('hidden'));
    } else {
      envelope.classList.add('hidden');
    }
    dealCards(row, flips, instant ? null : from, tl, instant || reducedMotion() ? '>' : sec(320));
    if (flips.length > 1) {
      const all = el('button', { class: 'btn', type: 'button' }, 'Reveal all');
      all.onclick = (e) => {
        e.stopPropagation();
        revealAll();
      };
      actions.replaceChildren(all);
    }
    run(tl);
    if (instant) tl.progress(1);
  };

  envelope.onclick = (e) => {
    e.stopPropagation();
    open();
  };
  flips.forEach((f) =>
    f.el.addEventListener('click', (e) => {
      e.stopPropagation();
      // The deal still playing: finish it first, then the tap flips this card.
      current?.progress(1);
      const t = f.flip();
      if (t) run(t);
      if (allFlipped()) finish();
    }),
  );
  // A tap on the backdrop fast-forwards whatever is playing.
  o.root.addEventListener('click', () => current?.progress(1));
  o.skipBtn.onclick = (e) => {
    e.stopPropagation();
    open(true);
    revealAll(true);
    current?.progress(1);
  };
  return {
    done: o.done,
    skip: () => o.skipBtn.click(),
  };
}

// ---------- Victory and defeat ----------

export interface DiagramArrow {
  /** Points in a 100 × 60 box. */
  points: [number, number][];
  side: 'blue' | 'red';
}

export interface VictoryData {
  battle: string;
  /** Stars held now (0–3) and how many of them are new. */
  stars: number;
  newStars: number;
  coinsFrom: number;
  coinsTo: number;
  xp?: { name: string; from: number; to: number; rankUp?: number };
  cards: PackCard[];
  arrows: DiagramArrow[];
  upgradeReady?: (c: PackCard) => boolean;
}

const laurelSvg = () => {
  // Two branches of leaves around the seal; each stroke draws on.
  const leaves = (dir: 1 | -1) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (-80 + i * 26) * (Math.PI / 180);
      const r = 62;
      const x = 80 + dir * Math.cos(a) * r;
      const y = 80 - Math.sin(a) * r;
      const tx = x + dir * Math.cos(a + 0.8) * 14;
      const ty = y - Math.sin(a + 0.8) * 14;
      return `<path class="leaf" d="M${x.toFixed(1)} ${y.toFixed(1)} Q ${(x + tx) / 2 + dir * 6} ${(y + ty) / 2 - 6} ${tx.toFixed(1)} ${ty.toFixed(1)}"/>`;
    }).join('');
  return `<svg class="laurel" viewBox="0 0 160 160" aria-hidden="true"><path class="stem" d="M80 146 A66 66 0 0 1 14 80 A66 66 0 0 1 44 24"/><path class="stem" d="M80 146 A66 66 0 0 0 146 80 A66 66 0 0 0 116 24"/>${leaves(-1)}${leaves(1)}</svg>`;
};

/**
 * Victory (motion skill, about 2.4 s before the cards): the battle diagram redraws as
 * translucent arrows, the VICTORY seal stamps on inside a laurel that draws around it,
 * then stars, coins, XP and cards in sequence. A tap skips to the end of each step.
 */
export function victoryCeremony(d: VictoryData, onContinue?: () => void): Ceremony {
  const o = overlay('victory', `Victory at ${d.battle}`);
  const diagram = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  diagram.setAttribute('viewBox', '0 0 100 60');
  diagram.setAttribute('class', 'battle-diagram');
  diagram.setAttribute('aria-hidden', 'true');
  diagram.innerHTML = `<defs><marker id="dh-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2f5d9e"/></marker><marker id="dh-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#b23a3a"/></marker></defs>${d.arrows
    .map(
      (a) =>
        `<polyline class="arrow ${a.side}" marker-end="url(#dh-${a.side})" points="${a.points.map((p) => p.join(',')).join(' ')}"/>`,
    )
    .join('')}`;
  const seal = el(
    'div',
    { class: 'victory-seal' },
    el('div', { class: 'laurel-wrap', 'aria-hidden': 'true' }),
    el('span', {}, 'VICTORY'),
  );
  seal.querySelector('.laurel-wrap')!.innerHTML = laurelSvg();
  const starEls = [0, 1, 2].map((i) =>
    el(
      'span',
      {
        class: `star ${i < d.stars ? 'on' : ''} ${i >= d.stars - d.newStars && i < d.stars ? 'new' : ''}`,
      },
      '★',
    ),
  );
  const coinNum = el('b', {}, String(d.coinsFrom));
  const coinsRow = el(
    'div',
    { class: 'v-row coins-row' },
    el('span', {}, '● '),
    coinNum,
    el('small', {}, ` +${d.coinsTo - d.coinsFrom}`),
  );
  const xpFill = el('i', {});
  const xpRow = d.xp
    ? el(
        'div',
        { class: 'v-row xp-row' },
        el('span', {}, `${d.xp.name} +${d.xp.to - d.xp.from} XP`),
        el('div', { class: 'xp-bar' }, xpFill),
        d.xp.rankUp ? el('span', { class: 'rank-up' }, `Rank ${d.xp.rankUp}!`) : '',
      )
    : '';
  const row = el('div', { class: 'pcard-row small' });
  const actions = el('div', { class: 'ceremony-actions' });
  const panel = el(
    'div',
    { class: 'victory-panel' },
    seal,
    el('div', { class: 'v-stars' }, ...starEls),
    coinsRow,
    xpRow,
    row,
    actions,
  );
  o.root.append(diagram, panel);

  const flips = d.cards.map((c) => flipCard(c, d.upgradeReady ?? (() => false)));
  const tl = track(gsap.timeline({ onComplete: () => finish() }));
  const reduced = reducedMotion();
  const arrows = [...diagram.querySelectorAll('polyline')];
  if (reduced) {
    starEls.forEach((s) => gsap.set(s, { opacity: 1 }));
    coinNum.textContent = String(d.coinsTo);
    if (d.xp) gsap.set(xpFill, { scaleX: Math.min(1, d.xp.to / 100) });
    row.append(...flips.map((f) => f.el));
    flips.forEach((f) => f.flip(true));
  } else {
    // About 2.2 s before the cards (motion skill), the steps overlapping.
    // 1. The battle diagram: the turns just played, as translucent arrows, sped up.
    tl.add(() => sfx('quill'), 0);
    arrows.forEach((a, i) =>
      tl.fromTo(
        a,
        { drawSVG: '0%' },
        { drawSVG: '100%', duration: sec(300), ease: EASE.inOut },
        sec(i * 70),
      ),
    );
    // Then it steps back behind the results.
    tl.to(diagram, { opacity: 0.22, duration: sec(300), ease: EASE.out }, sec(620));
    // 2. The VICTORY seal stamps on, a small paper shake, the laurel draws around it.
    tl.fromTo(
      seal,
      { scale: 1.7, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: sec(MOTION.impact + 60), ease: EASE.back },
      sec(420),
    );
    tl.add(() => {
      sfx('stamp');
      haptic('success');
    }, sec(600));
    tl.to(
      panel,
      {
        keyframes: [
          { x: -3, duration: 0.04 },
          { x: 3, duration: 0.05 },
          { x: -2, duration: 0.05 },
          { x: 0, duration: 0.04 },
        ],
      },
      sec(620),
    );
    const laurel = [...seal.querySelectorAll('.laurel path')];
    tl.fromTo(
      laurel,
      { drawSVG: '0%' },
      { drawSVG: '100%', duration: sec(480), stagger: sec(14), ease: EASE.out },
      sec(560),
    );
    // 3. Stars one by one with a stamp each, the coins roll, the XP bar fills.
    const earned = starEls.filter((s) => s.classList.contains('on'));
    gsap.set(
      starEls.filter((s) => !s.classList.contains('on')),
      { opacity: 0.35 },
    );
    gsap.set(earned, { opacity: 0 });
    tl.add(stampIn(earned, gsap.timeline(), 140), sec(1000));
    ticker(coinNum, d.coinsFrom, d.coinsTo, 600, tl, sec(1100));
    tl.add(() => sfx('coins'), sec(1100));
    if (d.xp) {
      gsap.set(xpFill, { scaleX: Math.min(1, d.xp.from / 100) });
      tl.to(
        xpFill,
        { scaleX: Math.min(1, d.xp.to / 100), duration: sec(500), ease: EASE.out },
        sec(1300),
      );
      const up = panel.querySelector('.rank-up');
      if (up) {
        gsap.set(up, { opacity: 0 });
        tl.fromTo(
          up,
          { scale: 1.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: sec(MOTION.impact), ease: EASE.back },
          sec(1800),
        );
      }
    }
    // 4. The cards earned deal in face down, then flip one after another.
    tl.add(() => {
      row.append(...flips.map((f) => f.el));
    });
    tl.add(() => {
      const deal = gsap.timeline();
      dealCards(row, flips, null, deal);
      flips.forEach((f, i) => {
        const t = f.flip();
        if (t) deal.add(t, `>${i === 0 ? '' : '-0.25'}`);
      });
      sub = track(deal);
    });
  }
  let sub: gsap.core.Timeline | null = null;
  const finish = () => {
    o.hideSkip();
    if (!actions.childElementCount) {
      actions.append(
        continueButton('Continue', () => {
          o.close();
          onContinue?.();
        }),
      );
    }
  };
  if (reduced) finish();
  const skipAll = () => {
    tl.progress(1);
    sub?.progress(1);
    if (!row.childElementCount) row.append(...flips.map((f) => f.el));
    flips.forEach((f) => f.flip(true));
    finish();
  };
  o.root.addEventListener('click', () => {
    // One tap skips to the end: the results and the cards, all turned.
    tl.progress(1);
    sub?.progress(1);
  });
  o.skipBtn.onclick = (e) => {
    e.stopPropagation();
    skipAll();
  };
  return { done: o.done, skip: skipAll };
}

/**
 * Defeat (motion skill): muted and fast, under 1.2 s. Ink bleeds in from the edges, a
 * dark-red DEFEAT stamp at reduced opacity, one helpful tip and the Retry button.
 */
export function defeatCeremony(
  d: { battle: string; tip: string },
  onRetry: () => void,
  onLeave: () => void,
): Ceremony {
  const o = overlay('defeat', `Defeat at ${d.battle}`);
  const bleed = el('div', { class: 'ink-bleed', 'aria-hidden': 'true' });
  const stamp = el('div', { class: 'defeat-stamp' }, 'DEFEAT');
  const tip = el('p', { class: 'defeat-tip' }, d.tip);
  const actions = el(
    'div',
    { class: 'ceremony-actions' },
    continueButton('Retry', () => {
      o.close();
      onRetry();
    }),
  );
  const leave = el('button', { class: 'btn', type: 'button' }, 'Back to the map');
  leave.onclick = (e) => {
    e.stopPropagation();
    o.close();
    onLeave();
  };
  actions.append(leave);
  o.root.append(bleed, el('div', { class: 'defeat-panel' }, stamp, tip, actions));
  o.hideSkip();
  const tl = track(gsap.timeline());
  if (reducedMotion()) {
    gsap.set(bleed, { opacity: 1 });
  } else {
    tl.fromTo(
      bleed,
      { opacity: 0, scale: 1.12 },
      { opacity: 1, scale: 1, duration: sec(500), ease: EASE.out },
    );
    tl.fromTo(
      stamp,
      { scale: 1.4, opacity: 0, rotation: 6 },
      { scale: 1, opacity: 0.85, rotation: -4, duration: sec(MOTION.impact), ease: EASE.back },
      '>-0.15',
    );
    tl.add(() => sfx('stamp'), '<+0.15');
    tl.fromTo(
      tip,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: sec(MOTION.quick), ease: EASE.out },
      '>-0.05',
    );
    tl.fromTo(actions, { opacity: 0 }, { opacity: 1, duration: sec(MOTION.quick) }, '<');
  }
  o.root.addEventListener('click', () => tl.progress(1));
  return { done: o.done, skip: () => tl.progress(1) };
}

// ---------- Battle title card ----------

/**
 * The battle intro's title card (motion skill): place, year and age write on in serif
 * over the parchment, hold, and fade as the board inks in beneath. About 2.2 s.
 */
export function titleCard(d: { place: string; year: string; age: string }): Ceremony {
  const o = overlay('title-card', d.place);
  const name = el('h1', {}, d.place);
  const meta = el('p', {}, `${d.year} · ${d.age}`);
  const quill = el('span', { class: 'quill-line', 'aria-hidden': 'true' });
  o.root.append(el('div', { class: 'title-inner' }, name, quill, meta));
  o.hideSkip();
  const tl = track(gsap.timeline({ onComplete: () => o.close() }));
  if (reducedMotion()) {
    tl.to({}, { duration: 0.9 });
  } else {
    const split = new SplitText(name, { type: 'chars' });
    tl.from(split.chars, {
      opacity: 0,
      y: 6,
      duration: sec(MOTION.quick),
      stagger: sec(400 / Math.max(1, split.chars.length)),
      ease: EASE.out,
    });
    tl.fromTo(
      quill,
      { scaleX: 0 },
      { scaleX: 1, duration: sec(MOTION.reveal), ease: EASE.inOut },
      '<+0.1',
    );
    tl.fromTo(
      meta,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: sec(MOTION.quick), ease: EASE.out },
      '>-0.15',
    );
    tl.to({}, { duration: sec(700) });
    tl.to(o.root.querySelector('.title-inner'), {
      opacity: 0,
      y: -6,
      duration: sec(MOTION.quick + 60),
      ease: EASE.in,
    });
  }
  o.root.addEventListener('click', () => {
    tl.progress(1);
    // The board intro beneath it skips too.
    fastForward();
  });
  return { done: o.done, skip: () => tl.progress(1) };
}
