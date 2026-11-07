import { AGE_BY_ID } from '../../content/campaign/ages';
import { eraUnitType, type EraUnitDef } from '../../content/eraUnits';
import { badgeShapeOf } from '../../render/pictograms';
import { el } from '../hud';
import { EASE, Flip, gsap, MOTION, reducedMotion, sec } from '../motion';
import { button } from './common';

/**
 * Age and role filters for card lists (UX §4): the Army screen and the army builder. Chips
 * show only unlocked ages, with the cards owned in each ("Antiquity 7/11"). Changing a
 * filter moves the cards with Flip instead of popping them.
 */

export type Role = 'infantry' | 'ranged' | 'cavalry' | 'special';
export type AgeFilter = number | 'all';
export type RoleFilter = Role | 'all';

export const ROLE_LABEL: Record<Role, string> = {
  infantry: 'Infantry',
  ranged: 'Ranged',
  cavalry: 'Cavalry',
  special: 'Special',
};

/** A troop's role, from its badge shape (shield, hexagon, circle, square). */
export function roleOf(def: EraUnitDef): Role {
  const symbol = eraUnitType(def.id).symbol;
  if (symbol === 'elephant' || symbol === 'artillery') return 'special';
  const shape = badgeShapeOf(symbol);
  return shape === 'hexagon' ? 'ranged' : shape === 'circle' ? 'cavalry' : 'infantry';
}

export interface FilterState {
  age: AgeFilter;
  role: RoleFilter;
  /** The player chose the age: keep it. Otherwise it follows the default (a new age). */
  picked?: boolean;
}

/** Filters chosen this session (until the app closes), by context. */
const remembered = new Map<string, FilterState>();

export function filterState(key: string, defaultAge: AgeFilter): FilterState {
  let s = remembered.get(key);
  if (!s) {
    s = { age: defaultAge, role: 'all' };
    remembered.set(key, s);
  }
  if (!s.picked) s.age = defaultAge;
  return s;
}

export interface ChipOption<T> {
  value: T;
  label: string;
  count?: string;
}

/** A row of filter chips; one is on. */
export function chipRow<T>(
  label: string,
  options: ChipOption<T>[],
  current: T,
  pick: (v: T) => void,
): HTMLElement {
  const row = el('div', { class: 'filter-row', role: 'radiogroup', 'aria-label': label });
  for (const o of options) {
    const b = button('', () => {
      row.querySelectorAll('.filter-chip').forEach((c) => {
        c.classList.remove('on');
        c.setAttribute('aria-checked', 'false');
      });
      b.classList.add('on');
      b.setAttribute('aria-checked', 'true');
      pick(o.value);
    });
    b.className = `filter-chip ${o.value === current ? 'on' : ''}`;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(o.value === current));
    b.append(el('span', {}, o.label), o.count ? el('small', {}, o.count) : '');
    row.append(b);
  }
  return row;
}

export function ageOptions(
  ages: number[],
  count: (age: number) => { owned: number; total: number },
): ChipOption<AgeFilter>[] {
  const all = ages.reduce(
    (s, a) => {
      const c = count(a);
      return { owned: s.owned + c.owned, total: s.total + c.total };
    },
    { owned: 0, total: 0 },
  );
  return [
    { value: 'all', label: 'All', count: `${all.owned}/${all.total}` },
    ...ages.map((a) => {
      const c = count(a);
      return {
        value: a as AgeFilter,
        label: AGE_BY_ID[a]?.name ?? `Age ${a}`,
        count: `${c.owned}/${c.total}`,
      };
    }),
  ];
}

export function roleOptions(): ChipOption<RoleFilter>[] {
  return [
    { value: 'all', label: 'All roles' },
    ...(Object.keys(ROLE_LABEL) as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] })),
  ];
}

/**
 * Shows the cards that pass `keep` and hides the rest, moving them with Flip: the ones
 * that stay slide to their new places, leavers fade out, newcomers fade and scale in.
 */
export function applyFilter(
  cards: { el: HTMLElement; keep: boolean }[],
  empty?: HTMLElement,
  animate = true,
): void {
  const els = cards.map((c) => c.el);
  const state = animate && !reducedMotion() ? Flip.getState(els) : null;
  for (const c of cards) c.el.classList.toggle('filtered-out', !c.keep);
  const shown = cards.filter((c) => c.keep).length;
  empty?.classList.toggle('hidden', shown > 0);
  if (!state) return;
  Flip.from(state, {
    duration: sec(MOTION.move + 60),
    ease: EASE.out,
    absolute: true,
    // Larger lists move together: a light stagger only, never uniform per card.
    stagger: { amount: sec(60), from: 'start' },
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: sec(MOTION.quick + 60), ease: EASE.out },
      ),
    onLeave: (els) =>
      gsap.to(els, { opacity: 0, scale: 0.94, duration: sec(MOTION.quick), ease: EASE.in }),
  });
}
