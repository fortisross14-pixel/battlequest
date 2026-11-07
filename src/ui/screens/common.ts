import type { ArmyChoice, CampaignBattle } from '../../content/campaign/types';
import type { Rarity } from '../../core/generals';
import type { Unlocks } from '../../meta/campaign';
import type { Profile } from '../../meta/profile';
import { el } from '../hud';
import { EASE, gsap, MOTION, reducedMotion, sec } from '../motion';

/** What the screens need from the app. */
export interface AppApi {
  profile: Profile;
  save(): void;
  show(screen: HTMLElement): void;
  /** Back to the previous screen on the stack. */
  back(): void;
  menu(): void;
  /** The campaign timeline. */
  campaign(): void;
  /** One age's map; `unlocks` fades in what a result just opened. */
  ageMap(ageId: number, unlocks?: Unlocks): void;
  /** After a battle: back to its age map, with the new unlocks. */
  afterBattle(b: CampaignBattle, unlocks: Unlocks): void;
  briefing(b: CampaignBattle): void;
  /** Deployment; `intro` plays the battle title card and board intro (not on a restart). */
  deploy(b: CampaignBattle, army: ArmyChoice, intro?: boolean): void;
  shop(): void;
  roster(tab?: 'troops' | 'generals'): void;
  /** A debug or hot-seat battle (the scenario id, default the sandbox). */
  sandbox(id?: string): void;
  /** Plays the board intro on the battle just loaded (motion lab). */
  boardIntro(delayMs?: number): void;
  /** The motion lab (?debug=motion-lab). */
  motionLab(): void;
  reset(): void;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function html(markup: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as HTMLElement;
}

export function button(label: string, onClick: () => void, cls = 'btn'): HTMLButtonElement {
  const b = el('button', { class: cls, type: 'button' }, label);
  b.onclick = onClick;
  return b;
}

/** The coin count shown last, so a change rolls from it (UX §4 number tickers). */
let shownCoins: number | null = null;

export function coins(p: Profile): HTMLElement {
  const to = p.coins;
  const from = shownCoins ?? to;
  shownCoins = to;
  const c = el('span', { class: 'coins', 'aria-label': `${to} coins` }, `● ${from}`);
  if (from === to) return c;
  if (reducedMotion()) {
    c.textContent = `● ${to}`;
    return c;
  }
  const o = { v: from };
  gsap.to(o, {
    v: to,
    duration: sec(Math.min(900, 300 + Math.abs(to - from) * 2)),
    ease: EASE.out,
    delay: sec(MOTION.quick),
    onUpdate: () => {
      c.textContent = `● ${Math.round(o.v)}`;
    },
    onComplete: () => {
      c.textContent = `● ${to}`;
      // A short brass glint when it lands.
      c.classList.add('glint');
      window.setTimeout(() => c.classList.remove('glint'), 450);
    },
  });
  return c;
}

/** Header with a back button, a title and the coin count. */
export function shell(
  app: AppApi,
  title: string,
  back: (() => void) | null,
  ...body: HTMLElement[]
): HTMLElement {
  const head = el(
    'header',
    { class: 'screen-head' },
    back ? button('‹ Back', back) : el('span', {}),
    el('h1', {}, title),
    coins(app.profile),
  );
  return el('div', { class: 'screen' }, head, el('main', { class: 'screen-body' }, ...body));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}

/** "Lv2" badge, empty for level 1 unless `always`. */
export function levelBadge(level: number, always = false): HTMLElement | '' {
  return level > 1 || always ? el('span', { class: 'lv' }, `Lv${level}`) : '';
}
