import { ERA_UNIT_BY_ID, eraUnitType, type EraUnitDef } from '../../content/eraUnits';
import type { GeneralEntry } from '../../content/generals';
import { ARCHETYPES } from '../../content/units';
import { commandRadiusForRank, scaled, type Rarity } from '../../core/generals';
import type { Side, UnitStats } from '../../core/types';
import { armyPower, generalPower } from '../../meta/army';
import { el, TAG_TEXT } from '../hud';
import { EASE, gsap, MOTION, reducedMotion, sec } from '../motion';
import { actionList } from '../actionList';
import { unitIcon } from '../icons';
import { html, initials, RARITY_LABEL } from './common';

/**
 * Compact cards (owner feedback): at a glance the name, type, level or rank, a coloured
 * rarity pill and a power number. Everything else opens on long-press, or on hover with a
 * mouse, so cards stay short.
 */

export function rarityPill(r: Rarity): HTMLElement {
  return el('span', { class: `rarity-pill ${r}` }, RARITY_LABEL[r].toUpperCase());
}

const fmt = (v: number) => String(+v.toFixed(1));

export function statRow(s: UnitStats): HTMLElement {
  const cells: [string, string][] = [
    ['MP', fmt(s.mp)],
    ['Mel', fmt(s.melee)],
    ['Imp', fmt(s.impact)],
    ['Rng', s.range > 0 ? `${fmt(s.ranged)}(${s.range})` : '—'],
    ['Arm', fmt(s.armor)],
    ['Mor', fmt(s.morale)],
  ];
  return el(
    'div',
    { class: 'stat-row' },
    ...cells.map(([k, v]) => el('span', {}, el('small', {}, k), v)),
  );
}

/** The one floating details panel (a tooltip beside the card, over everything). */
let tip: HTMLElement | null = null;
let tipFor: HTMLElement | null = null;

export function hideDetails(): void {
  tip?.remove();
  tip = null;
  tipFor = null;
}

/** Shows `details` in a panel beside `card`: right of it if there is room, else left. */
function showDetails(card: HTMLElement, details: HTMLElement): void {
  if (tipFor === card) return;
  hideDetails();
  const panel = el('div', { class: 'detail-tip card-details', role: 'tooltip' }, details);
  document.body.append(panel);
  const r = card.getBoundingClientRect();
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const gap = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = r.right + gap;
  if (x + w > vw - 8) x = r.left - gap - w;
  if (x < 8) x = Math.max(8, Math.min(vw - w - 8, r.left));
  const y = Math.max(8, Math.min(vh - h - 8, r.top));
  panel.style.left = `${x}px`;
  panel.style.top = `${y}px`;
  if (!reducedMotion()) {
    gsap.fromTo(
      panel,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: sec(MOTION.quick), ease: EASE.out },
    );
  }
  tip = panel;
  tipFor = card;
}

// A tap or scroll anywhere else closes the panel.
if (typeof document !== 'undefined') {
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (tip && !tip.contains(e.target as Node) && !tipFor?.contains(e.target as Node)) {
        hideDetails();
      }
    },
    true,
  );
  document.addEventListener('scroll', () => hideDetails(), true);
}

/** How long the mouse rests on a card before its details open (owner: 1 s). */
const HOVER_MS = 1000;
const LONG_PRESS_MS = 450;

/**
 * Gives `card` a details panel (Paradox-style): with a mouse it opens beside the card once
 * the pointer has rested on it for a second, and closes when the pointer leaves; on touch a
 * long-press opens it. The panel floats over the screen, so cards never resize. A
 * long-press doesn't count as a tap, so it never picks the card by accident.
 */
export function withDetails(card: HTMLElement, details: HTMLElement): HTMLElement {
  details.classList.add('card-body');
  card.classList.add('has-details');
  let hover: number | undefined;
  let press: number | undefined;
  let longPressed = false;
  const restart = () => {
    window.clearTimeout(hover);
    hover = window.setTimeout(() => showDetails(card, details), HOVER_MS);
  };
  card.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') restart();
  });
  card.addEventListener('pointermove', (e) => {
    // The mouse must stop: every move restarts the wait (until the panel is open).
    if (e.pointerType === 'mouse' && tipFor !== card) restart();
  });
  card.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(hover);
    if (tipFor === card) hideDetails();
  });
  card.addEventListener('pointerdown', (e) => {
    window.clearTimeout(hover);
    if (e.pointerType === 'mouse') return;
    longPressed = false;
    press = window.setTimeout(() => {
      longPressed = true;
      showDetails(card, details);
    }, LONG_PRESS_MS);
  });
  const cancel = () => window.clearTimeout(press);
  card.addEventListener('pointerup', cancel);
  card.addEventListener('pointercancel', cancel);
  card.addEventListener('contextmenu', (e) => e.preventDefault());
  // Swallow the click that ends a long-press; a real click closes the panel.
  card.addEventListener(
    'click',
    (e) => {
      if (!longPressed) {
        if (tipFor === card) hideDetails();
        return;
      }
      longPressed = false;
      e.stopImmediatePropagation();
      e.preventDefault();
    },
    true,
  );
  return card;
}

/** The "?" card for a troop or general the player hasn't found yet. */
export function lockedCard(what: string, hint: string): HTMLElement {
  return el(
    'div',
    { class: 'mini-card locked' },
    el('span', { class: 'big-q', 'aria-hidden': 'true' }, '?'),
    el('small', {}, what),
    el('small', { class: 'hint' }, hint),
  );
}

/** Header shared by troop cards: badge, name, type · level · rarity, power. */
export function troopHeader(def: EraUnitDef, level: number, side: Side = 'blue'): HTMLElement {
  const t = eraUnitType(def.id, level);
  return el(
    'div',
    { class: 'mini-head' },
    html(unitIcon(t.symbol, side, 44, level)),
    el(
      'div',
      { class: 'mini-text' },
      el('b', {}, t.name),
      el(
        'span',
        { class: 'mini-sub' },
        `${ARCHETYPES[def.archetype].name} · Lv${level} `,
        rarityPill(def.rarity),
      ),
    ),
    el(
      'span',
      { class: 'power', title: 'Power (a rough guide)' },
      String(armyPower([{ type: def.id, level }])),
    ),
  );
}

/** Troop details for the long-press panel: stats, abilities, flavour. */
export function troopDetails(def: EraUnitDef, level: number): HTMLElement {
  const t = eraUnitType(def.id, level);
  return el(
    'div',
    {},
    statRow(t.stats),
    t.tags.length
      ? el('ul', { class: 'tags' }, ...t.tags.map((tag) => el('li', {}, TAG_TEXT[tag])))
      : '',
    actionList(def.id, def.actions),
    el('p', { class: 'flavor' }, def.flavor),
    el('small', {}, `Age ${def.age} · ${t.stats.cost} points`),
  );
}

/** A compact troop card with details on long-press or hover. */
export function troopCard(
  id: string,
  level: number,
  extra: (HTMLElement | '')[] = [],
): HTMLElement {
  const def = ERA_UNIT_BY_ID[id]!;
  const card = el('div', { class: `mini-card ${def.rarity}` }, troopHeader(def, level), ...extra);
  return withDetails(card, troopDetails(def, level));
}

/** Header for a general: medallion, name, Rank n · skill name, rarity, power. */
export function generalHeader(g: GeneralEntry, rank: number): HTMLElement {
  const skill = g.skills.find((s) => rank >= s.unlockRank) ?? g.skills[0];
  return el(
    'div',
    { class: 'mini-head' },
    el('span', { class: 'medallion' }, initials(g.name)),
    el(
      'div',
      { class: 'mini-text' },
      el('b', {}, g.name),
      el(
        'span',
        { class: 'mini-sub' },
        `Rank ${rank}${skill ? ` · ${skill.name}` : ''} `,
        rarityPill(g.rarity),
      ),
    ),
    el(
      'span',
      { class: 'power', title: 'Power (a rough guide)' },
      String(generalPower(g.rarity, rank)),
    ),
  );
}

/** General details for the long-press panel: trait, skills with cooldowns, radius. */
export function generalDetails(g: GeneralEntry, rank: number): HTMLElement {
  return el(
    'div',
    {},
    el('p', {}, el('b', {}, 'Trait: '), g.traitText),
    ...g.skills.map((s) =>
      el(
        'p',
        { class: rank < s.unlockRank ? 'locked-skill' : '' },
        el('b', {}, `${s.name}: `),
        `${s.description} Every ${Math.round(scaled(s.cooldown, rank))} turns.`,
        rank < s.unlockRank ? ` Unlocks at rank ${s.unlockRank}.` : '',
      ),
    ),
    el('small', {}, `${g.era} · command radius ${commandRadiusForRank(rank)}`),
  );
}
