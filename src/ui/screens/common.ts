import type { ArmyChoice, CampaignBattle } from '../../content/campaign/types';
import type { Rarity } from '../../core/generals';
import type { Unlocks } from '../../meta/campaign';
import type { Profile } from '../../meta/profile';
import { el } from '../hud';

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
  deploy(b: CampaignBattle, army: ArmyChoice): void;
  shop(): void;
  roster(tab?: 'troops' | 'generals'): void;
  sandbox(): void;
  reset(): void;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
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

export function coins(p: Profile): HTMLElement {
  return el('span', { class: 'coins', 'aria-label': `${p.coins} coins` }, `● ${p.coins}`);
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
